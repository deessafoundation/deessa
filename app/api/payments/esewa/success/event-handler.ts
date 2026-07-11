/**
 * eSewa Event Registration Handler
 *
 * Handles eSewa payment verification for event registrations.
 * Security: HMAC-SHA256 signature verification with timing-safe comparison.
 * Mock mode is BLOCKED in production (H1 fix).
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  verifyAmountMatch,
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

  const { status, total_amount, signed_field_names, signature } = responseData;

  // Check if this is an event registration payment
  const { data: reg } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("esewa_transaction_uuid", transaction_uuid)
    .single();

  if (!reg) {
    return null; // Not an event registration
  }

  // ── HMAC signature verification (FIRST — reject before any state changes) ──
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
      // Do NOT update payment_status — signature failed, ignore this callback entirely
      // Fetch event slug for redirect
      const { data: event } = await supabase
        .from("events")
        .select("slug")
        .eq("id", reg.event_id)
        .single();
      const slug = (event as { slug: string } | null)?.slug ?? "";
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/failure?rid=${reg.id}&reason=invalid_signature`, url.origin),
      );
    }
  }

  // ── Status check (after signature verified) ───────────────────────────────────
  if (status !== "COMPLETE") {
    logPaymentEvent("eSewa success - event payment not completed", {
      regId: reg.id,
      status,
      transactionUuid: maskSensitiveData(transaction_uuid),
    }, "warn");
      await supabase
        .from("event_registrations")
        .update({
          payment_status: "failed",
          payment_failed_at: new Date().toISOString(),
        })
        .eq("id", reg.id);
    // Fetch event slug for redirect
    const { data: event } = await supabase
      .from("events")
      .select("slug")
      .eq("id", reg.event_id)
      .single();
    const slug = (event as { slug: string } | null)?.slug ?? "";
    return NextResponse.redirect(
      new URL(
        `/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`,
        url.origin,
      ),
    );
  }

  // ── Idempotency: already paid ───────────────────────────────────────────────
  if (reg.payment_status === "paid") {
    // Fetch event slug for redirect
    const { data: event } = await supabase
      .from("events")
      .select("slug")
      .eq("id", reg.event_id)
      .single();
    const slug = (event as { slug: string } | null)?.slug ?? "";
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&paid=1`, url.origin),
    );
  }

  // ── Amount verification (fail-closed, after signature verified) ──────────────
  const expectedAmt = parseFloat((reg.payment_amount || 0).toString());
  const actualAmt = parseFloat(total_amount.toString());
  const av = verifyAmountMatch(expectedAmt, actualAmt, "NPR", 0.01);

  if (!av.valid) {
    logPaymentEvent("eSewa success - event amount mismatch", {
      regId: reg.id,
      expected: expectedAmt,
      actual: actualAmt,
    }, "warn");
    await supabase
      .from("event_registrations")
      .update({
        payment_status: "review",
        esewa_transaction_uuid: transaction_uuid,
        payment_review_at: new Date().toISOString(),
      })
      .eq("id", reg.id);
    // Fetch event slug for redirect
    const { data: event } = await supabase
      .from("events")
      .select("slug")
      .eq("id", reg.event_id)
      .single();
    const slug = (event as { slug: string } | null)?.slug ?? "";
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=review`, url.origin),
    );
  }

  // ── Status checks (after signature + amount verified) ───────────────────────
  const { error: regUpdateError } = await supabase
    .from("event_registrations")
    .update({
      status: "confirmed",
      payment_status: "paid",
      payment_provider: "esewa",
      payment_id: `esewa:${transaction_uuid}`,
      provider_session_ref: transaction_uuid,
      esewa_transaction_uuid: transaction_uuid,
      payment_paid_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", reg.id);

  if (regUpdateError) {
    logPaymentEvent("eSewa success - event registration update failed", {
      regId: reg.id,
      transactionUuid: maskSensitiveData(transaction_uuid),
      error: regUpdateError,
    }, "error");
    // Fetch event slug for redirect
    const { data: event } = await supabase
      .from("events")
      .select("slug")
      .eq("id", reg.event_id)
      .single();
    const slug = (event as { slug: string } | null)?.slug ?? "";
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
    );
  }

  // Increment sold_count on ticket type
  try {
    const { incrementTicketSoldCount } = await import("@/lib/utils/ticket-capacity");
    await incrementTicketSoldCount(supabase, reg.ticket_type_id);
  } catch (e) {
    console.warn("eSewa event handler: failed to increment sold_count", e);
  }

  // Send confirmation email (non-blocking)
  try {
    const { data: event } = await supabase
      .from("events")
      .select("title, event_date, location, slug")
      .eq("id", reg.event_id)
      .single();

    if (event) {
      const { data: template } = await supabase
        .from("event_email_templates")
        .select("subject, body_html")
        .eq("event_id", reg.event_id)
        .eq("template_type", "confirmation")
        .eq("is_active", true)
        .single();

      if (template?.body_html) {
        let ticketName: string | undefined;
        if (reg.ticket_type_id) {
          const { data: tt } = await supabase
            .from("event_ticket_types")
            .select("name")
            .eq("id", reg.ticket_type_id)
            .single();
          ticketName = (tt as { name: string } | null)?.name;
        }

        const eventTyped = event as {
          title: string;
          event_date: string;
          location: string;
          slug: string;
        };

        const { sendEventConfirmationEmail } = await import("@/lib/email/event-mailer");
        await sendEventConfirmationEmail({
          to: reg.email,
          fullName: reg.full_name,
          eventTitle: eventTyped.title,
          eventDate: eventTyped.event_date,
          eventLocation: eventTyped.location,
          ticketName,
          registrationId: reg.id,
          templateHtml: template.body_html,
          templateSubject: template.subject,
        });

        await supabase
          .from("event_registrations")
          .update({ last_confirmation_email_sent_at: new Date().toISOString() })
          .eq("id", reg.id);
      }
    }
  } catch (e) {
    console.error("Non-fatal: eSewa event confirmation email:", e);
  }

  // Fetch event slug for redirect
  const { data: event } = await supabase
    .from("events")
    .select("slug")
    .eq("id", reg.event_id)
    .single();
  const slug = (event as { slug: string } | null)?.slug ?? "";

  return NextResponse.redirect(
    new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&paid=1`, url.origin),
  );
}
