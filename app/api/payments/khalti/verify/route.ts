import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import {
  validateUUID,
  verifyAmountMatch,
  fetchWithTimeout,
  logPaymentEvent,
  maskSensitiveData,
} from "@/lib/payments/security"
import { generateReceiptForDonation } from "@/lib/actions/donation-receipt"
import { createKhaltiAdapter } from "@/lib/payments/adapters/KhaltiAdapter"
import { getPaymentService } from "@/lib/payments/core/PaymentService"
import { VerificationError, ConfigurationError } from "@/lib/payments/core/errors"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // 1. Apply distributed rate limiting (10 requests per minute per IP)
    const clientIP = getClientIP(request)
    const rateLimitIdentifier = clientIP 
      ? `khalti-verify:ip:${clientIP}`
      : `khalti-verify:ip:unknown`
    
    const rateLimit = await checkRateLimit({
      identifier: rateLimitIdentifier,
      maxAttempts: 10,
      windowMinutes: 1,
    })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          ok: false,
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

    // 2. Validate request body
    const body = await request.json()
    const pidx = body.pidx as string | undefined
    const purchaseOrderId = body.purchase_order_id as string | undefined

    if (!pidx || typeof pidx !== "string" || pidx.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing or invalid pidx",
          message: "Payment identifier (pidx) is required",
        },
        { status: 400 },
      )
    }

    // Use service role client to bypass RLS for payment verification
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, error: "Server configuration error" },
        { status: 500 }
      )
    }
    const supabase = createServiceClient(supabaseUrl, serviceRoleKey)

    // Initialize PaymentService and KhaltiAdapter
    const paymentService = getPaymentService()
    const khaltiAdapter = createKhaltiAdapter()

    // Primary lookup: find donation by khalti_pidx
    let { data: donation } = await supabase
      .from("donations")
      .select("*")
      .eq("khalti_pidx", pidx)
      .single()

    // Fallback: khalti_pidx may not have been saved (e.g. RLS blocked the UPDATE
    // in donation.ts before the service-role fix). Khalti always sends
    // purchase_order_id = donation.id in the return URL, so use that.
    if (!donation && purchaseOrderId) {
      const uuidValidation = validateUUID(purchaseOrderId)
      if (uuidValidation.valid) {
        const { data: byId } = await supabase
          .from("donations")
          .select("*")
          .eq("id", purchaseOrderId)
          .single()
        if (byId) {
          donation = byId
          // Backfill khalti_pidx so future lookups work
          await supabase
            .from("donations")
            .update({ khalti_pidx: pidx, provider_ref: pidx, payment_id: `khalti:${pidx}` })
            .eq("id", purchaseOrderId)
          logPaymentEvent("Khalti verify - backfilled khalti_pidx", {
            donationId: purchaseOrderId,
            pidx: maskSensitiveData(pidx),
          }, "warn")
        }
      }
    }

    // If donation not found, check conference_registrations
    if (!donation) {
      const { data: confReg } = await supabase
        .from("conference_registrations")
        .select("*")
        .eq("khalti_pidx", pidx)
        .single()

      if (confReg) {
        return await handleConferenceVerification(supabase, paymentService, khaltiAdapter, confReg, pidx)
      }

      // If conference not found, check event_registrations
      const { data: eventReg } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("khalti_pidx", pidx)
        .single()

      if (eventReg) {
        return await handleEventRegistrationVerification(supabase, paymentService, khaltiAdapter, eventReg, pidx)
      }

      // Neither donation, conference, nor event registration found
      return NextResponse.json(
        { 
          ok: false, 
          error: "Payment record not found", 
          message: "Could not find donation, conference, or event registration record. Please contact support with your payment ID." 
        },
        { status: 404 },
      )
    }

    // If caller provides purchase_order_id, validate it matches the donation we found
    if (purchaseOrderId) {
      const uuidValidation = validateUUID(purchaseOrderId)
      if (!uuidValidation.valid || purchaseOrderId !== donation.id) {
        logPaymentEvent("Khalti verify - purchase_order_id mismatch", {
          donationId: donation.id,
          providedPurchaseOrderId: maskSensitiveData(purchaseOrderId),
          pidx: maskSensitiveData(pidx),
        }, "warn")
        return NextResponse.json(
          { ok: false, error: "Invalid purchase order reference" },
          { status: 400 },
        )
      }
    }

    // Idempotency check: if already processed, return current status
    if (donation.payment_status === "completed" || donation.payment_status === "confirmed") {
      logPaymentEvent("Khalti verify - already processed", {
        donationId: donation.id,
        currentStatus: donation.payment_status,
        pidx: maskSensitiveData(pidx),
      })
      return NextResponse.json(
        {
          ok: true,
          status: donation.payment_status === "completed" ? "completed" : "paid",
          message: "Transaction already processed",
        },
        { status: 200 },
      )
    }

    if (donation.payment_status === "failed") {
      logPaymentEvent("Khalti verify - already failed", {
        donationId: donation.id,
        pidx: maskSensitiveData(pidx),
      })
      return NextResponse.json(
        {
          ok: false,
          status: "failed",
          message: "Payment previously failed",
        },
        { status: 200 },
      )
    }

    // Use KhaltiAdapter to verify the payment
    try {
      const verificationResult = await khaltiAdapter.verify(
        { pidx, donation_id: donation.id, amount: donation.amount },
        {}
      )

      // Use PaymentService to confirm the donation
      const confirmResult = await paymentService.confirmDonation({
        donationId: donation.id,
        provider: 'khalti',
        verificationResult,
        eventId: pidx, // Use pidx as event ID for idempotency
      })

      // Handle confirmation result
      if (!confirmResult.success) {
        logPaymentEvent("Khalti verify - confirmation failed", {
          donationId: donation.id,
          error: confirmResult.error,
          pidx: maskSensitiveData(pidx),
        }, "error")
        return NextResponse.json(
          {
            ok: false,
            status: "failed",
            error: confirmResult.error || "Payment confirmation failed",
          },
          { status: 400 },
        )
      }

      // Map confirmation status to response
      const responseStatus = confirmResult.status === 'confirmed' ? 'completed' : confirmResult.status
      
      // Fire-and-forget receipt generation for completed donations
      if (confirmResult.status === 'confirmed') {
        generateReceiptForDonation({ donationId: donation.id })
          .then((r) => {
            if (!r.success) {
              logPaymentEvent("Khalti verify - receipt generation failed (non-fatal)", {
                donationId: donation.id,
                message: r.message,
              }, "warn")
            }
          })
          .catch((e) =>
            logPaymentEvent("Khalti verify - receipt generation error (non-fatal)", {
              donationId: donation.id,
              error: e instanceof Error ? e.message : String(e),
            }, "error"),
          )
      }

      logPaymentEvent("Khalti verify - success", {
        donationId: donation.id,
        status: confirmResult.status,
        pidx: maskSensitiveData(pidx),
      })

      return NextResponse.json(
        {
          ok: true,
          status: responseStatus,
          khaltiStatus: (verificationResult.metadata as Record<string, unknown>)?.khaltiStatus,
          transactionId: verificationResult.transactionId,
          amount: verificationResult.amount,
        },
        { status: 200 },
      )

    } catch (error) {
      // Handle verification errors
      if (error instanceof VerificationError) {
        logPaymentEvent("Khalti verify - verification error", {
          donationId: donation.id,
          error: error.message,
          pidx: maskSensitiveData(pidx),
        }, "error")

        // For pending/processing status, return appropriate response
        if (error.message.includes('pending') || error.message.includes('Pending')) {
          return NextResponse.json(
            {
              ok: true,
              status: "processing",
              message: "Payment is still pending",
            },
            { status: 200 },
          )
        }

        return NextResponse.json(
          {
            ok: false,
            status: "failed",
            error: error.message,
          },
          { status: 400 },
        )
      }

      if (error instanceof ConfigurationError) {
        logPaymentEvent("Khalti verify - configuration error", {
          donationId: donation.id,
          error: error.message,
        }, "error")
        return NextResponse.json(
          {
            ok: false,
            error: "Khalti not configured",
            message: error.message,
          },
          { status: 500 },
        )
      }

      throw error
    }
  } catch (err) {
    logPaymentEvent("Khalti verify - unexpected error", {
      error: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    }, "error")
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

/**
 * Handle conference registration verification via Khalti.
 *
 * Uses PaymentService.confirmConferenceRegistration() for centralized payment logic.
 * Khalti adapter handles the Khalti API lookup and amount verification.
 */
async function handleConferenceVerification(
  supabase: any,
  paymentService: any,
  khaltiAdapter: any,
  reg: any,
  pidx: string,
) {
  // Idempotency checks
  if (reg.payment_status === "paid" || reg.status === "confirmed") {
    return NextResponse.json({ ok: true, status: "paid", message: "Already confirmed" }, { status: 200 })
  }
  if (reg.payment_status === "failed") {
    return NextResponse.json({ ok: false, status: "failed", message: "Payment previously failed" }, { status: 200 })
  }
  if (reg.payment_status === "review") {
    return NextResponse.json({ ok: true, status: "review", message: "Payment under review" }, { status: 200 })
  }

  try {
    const verificationResult = await khaltiAdapter.verify(
      { pidx, donation_id: reg.id, amount: reg.payment_amount },
      {}
    )

    // Handle "Pending" status (don't update DB, return processing)
    if (verificationResult.status === "pending") {
      return NextResponse.json({
        ok: true,
        status: "processing",
        message: "Payment is still pending",
      }, { status: 200 })
    }

    const result = await paymentService.confirmConferenceRegistration({
      entityType: "conference_registration",
      entityId: reg.id,
      provider: "khalti",
      verificationResult,
      eventId: pidx,
    })

    if (!result.success) {
      logPaymentEvent("Khalti verify (conference): confirmation failed", {
        confRegId: reg.id,
        error: result.error,
        pidx: maskSensitiveData(pidx),
      }, "error")
      return NextResponse.json({
        ok: false,
        status: "failed",
        error: result.error || "Payment confirmation failed",
      }, { status: 400 })
    }

    const responseStatus = result.status === "paid" ? "paid" : result.status

    logPaymentEvent("Khalti verify (conference): success", {
      confRegId: reg.id,
      status: result.status,
      pidx: maskSensitiveData(pidx),
    })

    return NextResponse.json({
      ok: true,
      status: responseStatus,
      khaltiStatus: (verificationResult.metadata as Record<string, unknown>)?.khaltiStatus,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
    }, { status: 200 })

  } catch (error) {
    if (error instanceof VerificationError) {
      logPaymentEvent("Khalti verify (conference): verification error", {
        confRegId: reg.id,
        error: error.message,
        pidx: maskSensitiveData(pidx),
      }, "error")

      if (error.message.includes("pending") || error.message.includes("Pending")) {
        return NextResponse.json({
          ok: true,
          status: "processing",
          message: "Payment is still pending",
        }, { status: 200 })
      }

      return NextResponse.json({
        ok: false,
        status: "failed",
        error: error.message,
      }, { status: 400 })
    }

    if (error instanceof ConfigurationError) {
      logPaymentEvent("Khalti verify (conference): configuration error", {
        confRegId: reg.id,
        error: error.message,
      }, "error")
      return NextResponse.json({
        ok: false,
        error: "Khalti not configured",
        message: error.message,
      }, { status: 500 })
    }

    throw error
  }
}

/**
 * Handle event registration verification via Khalti.
 *
 * Uses PaymentService.confirmRegistration() for centralized payment logic.
 * Khalti adapter handles the Khalti API lookup and amount verification.
 */
async function handleEventRegistrationVerification(
  supabase: any,
  paymentService: any,
  khaltiAdapter: any,
  reg: any,
  pidx: string,
) {
  // Idempotency checks
  if (reg.payment_status === "paid" || reg.status === "confirmed") {
    return NextResponse.json({ ok: true, status: "paid", message: "Already confirmed" }, { status: 200 })
  }
  if (reg.payment_status === "failed") {
    return NextResponse.json({ ok: false, status: "failed", message: "Payment previously failed" }, { status: 200 })
  }
  if (reg.payment_status === "review") {
    return NextResponse.json({ ok: true, status: "review", message: "Payment under review" }, { status: 200 })
  }

  try {
    const verificationResult = await khaltiAdapter.verify(
      { pidx, donation_id: reg.id, amount: reg.payment_amount },
      {}
    )

    // Handle "Pending" status (don't update DB, return processing)
    if (verificationResult.status === "pending") {
      return NextResponse.json({
        ok: true,
        status: "processing",
        message: "Payment is still pending",
      }, { status: 200 })
    }

    const result = await paymentService.confirmRegistration({
      entityType: "event_registration",
      entityId: reg.id,
      provider: "khalti",
      verificationResult,
      eventId: pidx,
    })

    if (!result.success) {
      logPaymentEvent("Khalti verify (event): confirmation failed", {
        eventRegId: reg.id,
        error: result.error,
        pidx: maskSensitiveData(pidx),
      }, "error")
      return NextResponse.json({
        ok: false,
        status: "failed",
        error: result.error || "Payment confirmation failed",
      }, { status: 400 })
    }

    const responseStatus = result.status === "paid" ? "paid" : result.status

    logPaymentEvent("Khalti verify (event): success", {
      eventRegId: reg.id,
      status: result.status,
      pidx: maskSensitiveData(pidx),
    })

    return NextResponse.json({
      ok: true,
      status: responseStatus,
      khaltiStatus: (verificationResult.metadata as Record<string, unknown>)?.khaltiStatus,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
    }, { status: 200 })

  } catch (error) {
    if (error instanceof VerificationError) {
      logPaymentEvent("Khalti verify (event): verification error", {
        eventRegId: reg.id,
        error: error.message,
        pidx: maskSensitiveData(pidx),
      }, "error")

      if (error.message.includes("pending") || error.message.includes("Pending")) {
        return NextResponse.json({
          ok: true,
          status: "processing",
          message: "Payment is still pending",
        }, { status: 200 })
      }

      return NextResponse.json({
        ok: false,
        status: "failed",
        error: error.message,
      }, { status: 400 })
    }

    if (error instanceof ConfigurationError) {
      logPaymentEvent("Khalti verify (event): configuration error", {
        eventRegId: reg.id,
        error: error.message,
      }, "error")
      return NextResponse.json({
        ok: false,
        error: "Khalti not configured",
        message: error.message,
      }, { status: 500 })
    }

    throw error
  }
}
