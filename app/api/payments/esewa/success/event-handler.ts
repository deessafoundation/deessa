/**
 * eSewa Event Registration Handler
 *
 * Handles eSewa payment verification for event registrations.
 * Security: HMAC-SHA256 signature verification with timing-safe comparison.
 * Mock mode is BLOCKED in production (H1 fix).
 *
 * Uses PaymentService.confirmRegistration() for centralized payment logic.
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  logPaymentEvent,
  maskSensitiveData,
} from "@/lib/payments/security";

/**
 * Verify HMAC-SHA256 signature for eSewa v2 API response.
 * Returns { valid: true } on success or { valid: false, reason } on failure.
 */
function verifyEsewaSignature(
  responseData: any,
  signedFieldNames: string | undefined,
  signature: string | undefined,
  secretKey: string,
): { valid: true } | { valid: false; reason: string } {
  if (!signature || !signedFieldNames) {
    return { valid: false, reason: "missing_signature_fields" };
  }
  const fields = String(signedFieldNames)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const required = ["total_amount", "transaction_uuid", "product_code"];
  if (!required.every((r) => fields.includes(r))) {
    return { valid: false, reason: "signed_fields_missing_required" };
  }
  const message = fields
    .map((field) => `${field}=${responseData[field]}`)
    .join(",");
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  const expectedSignature = hmac.digest("base64");
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );
    return isValid
      ? { valid: true }
      : { valid: false, reason: "signature_mismatch" };
  } catch {
    return { valid: false, reason: "signature_mismatch" };
  }
}

/**
 * Handle eSewa payment verification for event registrations.
 *
 * Flow:
 * 1. HMAC signature verification (FIRST — reject before any state changes)
 * 2. Status check (non-COMPLETE → failure redirect)
 * 3. Idempotency (already paid → success redirect)
 * 4. PaymentService.confirmRegistration() for centralized logic
 *
 * @param supabase - Supabase service client
 * @param transaction_uuid - eSewa transaction UUID
 * @param responseData - Parsed eSewa callback data
 * @param url - Request URL for redirects
 * @param isMock - Whether this is a mock transaction
 * @returns NextResponse if event registration found, null otherwise
 */
export async function handleEventVerification(
  supabase: SupabaseClient,
  transaction_uuid: string,
  responseData: any,
  url: URL,
  isMock: boolean,
): Promise<NextResponse | null> {
  // H1 FIX: Block mock mode in production
  if (isMock && process.env.NODE_ENV === "production") {
    logPaymentEvent("eSewa success - mock mode blocked in production", {}, "error");
    return NextResponse.json(
      { error: "Mock mode disabled in production" },
      { status: 400 },
    );
  }

  const { status, signed_field_names, signature } = responseData;

  // Check if this is an event registration payment
  const { data: reg } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("esewa_transaction_uuid", transaction_uuid)
    .single();

  if (!reg) {
    return null; // Not an event registration
  }

  // Helper: fetch event slug for redirects
  const getEventSlug = async (): Promise<string> => {
    const { data: event } = await supabase
      .from("events")
      .select("slug")
      .eq("id", reg.event_id)
      .single();
    return (event as { slug: string } | null)?.slug ?? "";
  };

  // ── 1. HMAC signature verification (FIRST — reject before any state changes) ──
  if (!isMock) {
    const secretKey = process.env.ESEWA_SECRET_KEY;
    if (!secretKey) {
      logPaymentEvent("eSewa success - missing ESEWA_SECRET_KEY", {}, "error");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const sigResult = verifyEsewaSignature(
      responseData,
      signed_field_names,
      signature,
      secretKey,
    );
    if (!sigResult.valid) {
      logPaymentEvent("eSewa success - event registration signature invalid", {
        regId: reg.id,
        transactionUuid: maskSensitiveData(transaction_uuid),
        reason: sigResult.reason,
      }, "error");
      const slug = await getEventSlug();
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/failure?rid=${reg.id}&reason=invalid_signature`, url.origin),
      );
    }
  }

  // ── 2. Status check (after signature verified) ───────────────────────────────
  if (status !== "COMPLETE") {
    logPaymentEvent("eSewa success - event payment not completed", {
      regId: reg.id,
      status,
      transactionUuid: maskSensitiveData(transaction_uuid),
    }, "warn");
    const slug = await getEventSlug();
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
    );
  }

  // ── 3. Idempotency: already paid ─────────────────────────────────────────────
  if (reg.payment_status === "paid") {
    const slug = await getEventSlug();
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&paid=1`, url.origin),
    );
  }

  // ── 4. PaymentService confirmation ───────────────────────────────────────────
  try {
    const { createEsewaAdapter } = await import("@/lib/payments/adapters/EsewaAdapter");
    const { getPaymentService } = await import("@/lib/payments/core/PaymentService");

    const adapter = createEsewaAdapter();
    const paymentService = getPaymentService();

    const verificationResult = await adapter.verify(
      responseData,
      { query: { data: transaction_uuid } },
    );

    // Handle non-paid status BEFORE calling PaymentService
    if (verificationResult.status !== "paid") {
      logPaymentEvent("eSewa success - event payment not completed (adapter)", {
        regId: reg.id,
        status: verificationResult.status,
      }, "warn");
      const slug = await getEventSlug();
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
      );
    }

    const result = await paymentService.confirmRegistration({
      entityType: "event_registration",
      entityId: reg.id,
      provider: "esewa",
      verificationResult,
      eventId: transaction_uuid,
    });

    const slug = await getEventSlug();

    if (!result.success || result.status === "failed") {
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
      );
    }

    if (result.status === "review") {
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=review`, url.origin),
      );
    }

    // Success: paid or already_processed
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&paid=1`, url.origin),
    );

  } catch (error) {
    logPaymentEvent("eSewa success - event registration confirmation error", {
      regId: reg.id,
      transactionUuid: maskSensitiveData(transaction_uuid),
      error: error instanceof Error ? error.message : "Unknown error",
    }, "error");
    const slug = await getEventSlug();
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
    );
  }
}
