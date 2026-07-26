"use server"

import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { verifyStripeSession } from "@/lib/payments/stripe"
import { generateReceiptForDonation } from "@/lib/actions/donation-receipt"
import { createStripeAdapter } from "@/lib/payments/adapters/StripeAdapter"
import { getPaymentService } from "@/lib/payments/core/PaymentService"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import type Stripe from "stripe"

// Create a service role client for updates (bypasses RLS)
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createServiceClient(supabaseUrl, serviceRoleKey)
}

export async function GET(request: Request) {
  try {
    // 1. Apply distributed rate limiting (10 requests per minute per IP)
    const clientIP = getClientIP(request)
    const rateLimitIdentifier = clientIP 
      ? `stripe-verify:ip:${clientIP}`
      : `stripe-verify:ip:unknown`
    
    const rateLimit = await checkRateLimit({
      identifier: rateLimitIdentifier,
      maxAttempts: 10,
      windowMinutes: 1,
    })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: rateLimit.resetAt?.toISOString()
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimit.resetAt 
              ? Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString()
              : "60"
          }
        },
      )
    }

    // 2. Validate session_id parameter
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      )
    }

    // Basic format check to reduce accidental logs / abuse
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session_id" }, { status: 400 })
    }

    const verificationResult = await verifyStripeSession(sessionId)

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || "Session verification failed" },
        { status: verificationResult.statusCode || 400 }
      )
    }

    // Fetch donation details from database
    const donationId = verificationResult.session?.client_reference_id ||
      verificationResult.session?.metadata?.donation_id

    if (donationId) {
      const supabase2 = createServiceRoleClient() // use service role so RLS doesn't block PII read
      const { data: donation } = await supabase2
        .from("donations")
        // Include donor PII — this endpoint is gated behind a valid Stripe session ID
        // so PII exposure is scoped to the session owner only.
        .select("id,amount,currency,donor_name,donor_email,donor_phone,is_monthly,payment_status,provider_ref,stripe_session_id")
        .eq("id", donationId)
        .single()

      // If the donation is still pending, confirm it through the centralized
      // PaymentService so this success-page fallback shares the SAME fail-closed
      // amount/currency verification and idempotency ledger as the webhook.
      // verifyStripeSession() already retrieved the session server-side from
      // Stripe, so this is an authoritative confirmation, not client-trusted.
      if (donation && donation.payment_status === "pending") {
        const session = verificationResult.session

        // In Stripe, a session is considered complete when payment_status is "paid"
        if (session && session.payment_status === "paid") {
          const storedSessionId = (donation as any).stripe_session_id as string | null

          // Validate: session ID must match what was stored at checkout creation.
          // If stripe_session_id was never stored (legacy rows), skip the check.
          const sessionIdMatch = !storedSessionId || storedSessionId === sessionId

          if (sessionIdMatch) {
            try {
              // Normalize the already-verified session into a VerificationResult.
              const adapter = createStripeAdapter()
              const stripeEvent = {
                type: "checkout.session.completed",
                data: { object: session },
                id: session.id,
              } as Stripe.Event
              const vr = await adapter.processVerifiedEvent(stripeEvent)

              // Use session.id as the idempotency key. If the webhook already
              // confirmed with a payment_intent-based event id this path just
              // returns already_processed; if this path runs first the webhook
              // later short-circuits on the 'completed' status.
              const confirmResult = await getPaymentService().confirmDonation({
                donationId,
                provider: "stripe",
                verificationResult: vr,
                eventId: session.id,
              })

              // Only generate the receipt when THIS call actually confirmed the
              // donation. On 'already_processed' another path (webhook) already
              // confirmed and emailed, and sendReceiptToDonor has no
              // receipt_sent_at guard — re-triggering here would duplicate the
              // donor email.
              if (confirmResult.success && confirmResult.status === "confirmed") {
                // Fire-and-forget receipt generation (idempotent, non-blocking).
                generateReceiptForDonation({ donationId })
                  .then((r) => {
                    if (!r.success) console.warn("Stripe verify - receipt generation failed (non-fatal):", r.message)
                  })
                  .catch((e) => console.error("Stripe verify - receipt generation error (non-fatal):", e))
              }

              // Re-read the latest donation state (service role; PII is scoped to
              // the holder of this Stripe session id).
              const { data: refreshed } = await supabase2
                .from("donations")
                .select("id,amount,currency,donor_name,donor_email,donor_phone,is_monthly,payment_status,provider_ref,stripe_session_id")
                .eq("id", donationId)
                .single()

              return NextResponse.json({
                success: true,
                session: verificationResult.session,
                donation: refreshed || donation,
              })
            } catch (confirmErr) {
              console.error("Stripe verify - confirmation via PaymentService failed:", confirmErr)
              // Fall through to return the current donation state below.
            }
          }
        }
      }

      // Return current donation state (including PII now that we use service role client)
      return NextResponse.json({
        success: true,
        session: verificationResult.session,
        donation: donation || null,
      })
    }

    return NextResponse.json({
      success: true,
      session: verificationResult.session,
      donation: null,
    })
  } catch (error) {
    console.error("Stripe session verification error:", error)
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    )
  }
}

