"use server"

import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

/**
 * Khalti Status Endpoint (Read-Only)
 * 
 * This endpoint provides read-only status checks for Khalti payments.
 * It does NOT mutate payment state - that is handled exclusively by webhooks/verify.
 * 
 * Requirements: 24.2, 24.3
 * 
 * Flow:
 * 1. Accept pidx parameter
 * 2. Query donation by khalti_pidx
 * 3. Return current status (no mutation)
 */
export async function GET(request: Request) {
  try {
    // 1. Apply distributed rate limiting (10 requests per minute per IP)
    const clientIP = getClientIP(request)
    const rateLimitIdentifier = clientIP 
      ? `khalti-status:ip:${clientIP}`
      : `khalti-status:ip:unknown`
    
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

    // 2. Validate pidx parameter
    const { searchParams } = new URL(request.url)
    const pidx = searchParams.get("pidx")

    if (!pidx || typeof pidx !== "string" || pidx.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "Missing or invalid pidx parameter",
          status: null
        },
        { status: 400 }
      )
    }

    // 3. Query donation by khalti_pidx (read-only)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const supabase = createServiceClient(supabaseUrl, serviceRoleKey)

    const { data: donation, error: queryError } = await supabase
      .from("donations")
      .select("id, amount, currency, payment_status")
      .eq("khalti_pidx", pidx)
      .single()

    if (queryError || !donation) {
      return NextResponse.json(
        { 
          success: false,
          error: "Donation not found",
          status: null
        },
        { status: 404 }
      )
    }

    // 4. Return minimal status fields only — no donor PII
    return NextResponse.json({
      success: true,
      status: donation.payment_status,
      amount: donation.amount,
      currency: donation.currency,
      provider: "khalti",
      donationId: donation.id,
    })

  } catch (error) {
    console.error("Khalti status check error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error during status check",
        status: null
      },
      { status: 500 }
    )
  }
}
