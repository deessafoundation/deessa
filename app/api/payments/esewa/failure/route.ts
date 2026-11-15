"use server"

import { NextResponse } from "next/server"
import { logPaymentEvent, maskSensitiveData } from "@/lib/payments/security"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

/**
 * eSewa Failure Callback Handler
 *
 * SECURITY NOTE: This endpoint is called by the browser after eSewa redirects
 * on payment failure. The data in the URL (including any base64-encoded payload)
 * is UNTRUSTED — it originates from the user's browser and is NOT an authoritative
 * signal from eSewa's servers.
 *
 * We therefore do NOT mutate the database here. The donation remains in `pending`
 * status. The reconciliation cron job will perform a server-side eSewa API lookup
 * and mark the donation as `failed` only once the failure is confirmed by eSewa.
 *
 * Previous code called `.update({ payment_status: "failed" })` here without any
 * server-side verification, which had two critical flaws:
 *   1. It trusted unverified browser-supplied data to mutate payment state.
 *   2. It had no `WHERE payment_status = 'pending'` guard, so a race with the
 *      success webhook could overwrite a legitimately `completed` donation.
 *
 * eSewa failure URL is a browser signal only, not authoritative proof.
 * Status remains pending until reconciliation verifies via eSewa API.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)

  // 1. Apply distributed rate limiting (20 requests per minute per IP for callbacks)
  const clientIP = getClientIP(request)
  const rateLimitIdentifier = clientIP
    ? `esewa-failure:ip:${clientIP}`
    : `esewa-failure:ip:unknown`

  const rateLimit = await checkRateLimit({
    identifier: rateLimitIdentifier,
    maxAttempts: 20, // Higher limit for legitimate callbacks
    windowMinutes: 1,
  })

  if (!rateLimit.allowed) {
    logPaymentEvent(
      "eSewa failure - rate limit exceeded",
      {
        ip: clientIP,
        resetAt: rateLimit.resetAt?.toISOString(),
      },
      "warn",
    )
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: rateLimit.resetAt?.toISOString(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.resetAt
            ? Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString()
            : "60",
        },
      },
    )
  }

  // 2. Parse eSewa callback data for monitoring/logging only — NOT for DB writes
  // eSewa v2 sends data as base64 encoded query parameter (even on failure)
  const encodedData = url.searchParams.get("data")
  const isMock = url.searchParams.get("mock") === "1"

  let transaction_uuid: string | undefined
  let status: string | undefined

  if (encodedData) {
    try {
      const decodedData = Buffer.from(encodedData, "base64").toString("utf-8")
      const responseData = JSON.parse(decodedData)
      transaction_uuid = responseData.transaction_uuid
      status = responseData.status
    } catch (error) {
      logPaymentEvent(
        "eSewa failure - failed to decode response",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "warn",
      )
    }
  }

  // 3. Log the failure signal for monitoring — no database mutation
  logPaymentEvent(
    "eSewa failure - browser failure signal received (no DB write; reconciliation cron will verify)",
    {
      transactionUuid: transaction_uuid ? maskSensitiveData(transaction_uuid) : "unknown",
      status: status || "unknown",
      isMock,
    },
    "warn",
  )

  // 4. Redirect to cancel page — reconciliation cron handles the actual status update
  return NextResponse.redirect(
    new URL(
      `/donate/cancel?provider=esewa&reason=${encodeURIComponent(status || "payment_failed")}${isMock ? "&mock=1" : ""}`,
      url.origin,
    ),
  )
}
