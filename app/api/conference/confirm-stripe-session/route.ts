import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { verifyStripeSession } from "@/lib/payments/stripe"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

/**
 * POST /api/conference/confirm-stripe-session
 *
 * Called by the payment-success page immediately after Stripe redirects back.
 * Verifies the Stripe session directly and confirms the registration without
 * waiting for a webhook — essential for local development and as a fallback
 * in production if the webhook is delayed.
 *
 * Uses PaymentService.confirmConferenceRegistration() for centralized logic.
 *
 * Body: { rid: string, sessionId: string }
 *
 * Security:
 * - Requires (rid + sessionId) pair — sessionId comes from Stripe and is unguessable
 * - Amount/currency verified against DB record (fail-closed)
 * - Idempotent — safe to call multiple times
 */

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing Supabase service role credentials")
  return createServiceClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: Request) {
  try {
    // Rate limit: 5 requests per minute per IP
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit({
      identifier: `confirm-stripe-session:${clientIP}`,
      maxAttempts: 5,
      windowMinutes: 1,
    })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const rid = (body.rid as string)?.trim()
    const sessionId = (body.sessionId as string)?.trim()

    if (!rid || !sessionId) {
      return NextResponse.json({ ok: false, error: "rid and sessionId are required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // ── 1. Fetch registration ─────────────────────────────────────────────────
    const { data: reg, error: fetchErr } = await supabase
      .from("conference_registrations")
      .select("*")
      .eq("id", rid)
      .single()

    if (fetchErr || !reg) {
      return NextResponse.json({ ok: false, error: "Registration not found" }, { status: 404 })
    }

    // Idempotency — already confirmed
    if (reg.status === "confirmed" && reg.payment_status === "paid") {
      return NextResponse.json({ ok: true, status: "confirmed", alreadyConfirmed: true })
    }

    // Early check: if session already stored, it must match
    if (reg.stripe_session_id && reg.stripe_session_id !== sessionId) {
      return NextResponse.json({ ok: false, error: "Session ID mismatch" }, { status: 403 })
    }

    // ── 2. Verify with Stripe ─────────────────────────────────────────────────
    const verification = await verifyStripeSession(sessionId)
    if (!verification.success || !verification.session) {
      return NextResponse.json(
        { ok: false, error: verification.error || "Could not verify Stripe session" },
        { status: 400 },
      )
    }

    const session = verification.session

    // Ownership verification: if stripe_session_id not yet stored, verify via email
    if (!reg.stripe_session_id) {
      const sessionEmail = String(session.customer_email || "").toLowerCase().trim()
      const regEmail = String(reg.email || "").toLowerCase().trim()

      if (!sessionEmail || sessionEmail !== regEmail) {
        return NextResponse.json(
          { ok: false, error: "Session ownership verification failed" },
          { status: 403 },
        )
      }
    }

    // Only proceed if Stripe reports the session as paid
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ok: true,
        status: "processing",
        paymentStatus: session.payment_status,
      })
    }

    // ── 3. Use PaymentService for centralized confirmation ────────────────────
    const { createStripeAdapter } = await import("@/lib/payments/adapters/StripeAdapter")
    const { getPaymentService } = await import("@/lib/payments/core/PaymentService")

    const adapter = createStripeAdapter()
    const paymentService = getPaymentService()

    // Build a synthetic Stripe.Event from the verified session
    const stripeEvent = {
      type: "checkout.session.completed",
      data: { object: session },
      id: `fallback_${sessionId}`,
    } as import("stripe").default.Event

    const verificationResult = await adapter.processVerifiedEvent(stripeEvent)

    const result = await paymentService.confirmConferenceRegistration({
      entityType: "conference_registration",
      entityId: rid,
      provider: "stripe",
      verificationResult,
      eventId: `fallback_${sessionId}`,
    })

    if (!result.success) {
      console.error("confirm-stripe-session: PaymentService confirmation failed", {
        rid,
        sessionId,
        error: result.error,
      })
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to confirm registration" },
        { status: 500 },
      )
    }

    console.log("confirm-stripe-session: confirmed registration", rid)
    return NextResponse.json({ ok: true, status: result.status })
  } catch (err) {
    console.error("confirm-stripe-session error:", err)
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}
