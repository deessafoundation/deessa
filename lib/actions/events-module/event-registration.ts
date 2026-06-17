"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/utils/sanitize";
import {
  getPaymentSettings,
  getSupportedProviders,
  type PaymentProvider,
} from "@/lib/payments/config";
import { startStripeCheckout } from "@/lib/payments/stripe";
import { startKhaltiPayment } from "@/lib/payments/khalti";
import { startEsewaPayment } from "@/lib/payments/esewa";
import { getAppBaseUrl } from "@/lib/utils";
import { sendEventConfirmationEmail } from "@/lib/email/event-mailer";
import { incrementTicketSoldCount, decrementTicketSoldCount } from "@/lib/utils/ticket-capacity";
import type {
  EventRegistration,
  RegisterForEventInput,
  ActionResult,
} from "@/lib/types/events-module";

// Core field IDs that map to fixed columns
const CORE_FIELD_IDS = [
  "full_name",
  "email",
  "phone",
] as const;

function extractCustomFields(
  data: Record<string, unknown>
): Record<string, unknown> {
  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!(CORE_FIELD_IDS as readonly string[]).includes(key)) {
      custom[key] = value;
    }
  }
  return custom;
}

export type RegistrationResult = {
  success: boolean;
  message: string;
  registrationId?: string;
  paymentRequired?: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
  expiryHours?: number;
};

export async function registerForEvent(
  input: RegisterForEventInput,
  formData: Record<string, unknown>
): Promise<RegistrationResult> {
  try {
    // Validation
    if (!input.full_name?.trim()) {
      return { success: false, message: "Full name is required." };
    }
    if (!input.email?.trim()) {
      return { success: false, message: "Email address is required." };
    }
    if (!input.consent_terms) {
      return {
        success: false,
        message: "You must agree to the Terms and Conditions to register.",
      };
    }

    // Rate limiting: 5 registrations per event per 15 minutes (distributed)
    const rateLimitKey = `event-registration:${input.event_id}:${input.email?.trim().toLowerCase()}`;
    const rateLimit = await checkRateLimit({
      identifier: rateLimitKey,
      maxAttempts: 5,
      windowMinutes: 15,
    });

    if (!rateLimit.allowed) {
      return {
        success: false,
        message:
          "Too many registration attempts. Please wait a few minutes before trying again.",
      };
    }

    const supabase = await createClient();

    // Check event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, is_free, registration_enabled, registration_close_at, title")
      .eq("id", input.event_id)
      .single();

    if (eventError || !event) {
      return { success: false, message: "Event not found." };
    }

    if (event.status !== "published") {
      return { success: false, message: "This event is not available for registration." };
    }

    if (!event.registration_enabled) {
      return {
        success: false,
        message: "Registration is currently closed for this event.",
      };
    }

    if (
      event.registration_close_at &&
      new Date(event.registration_close_at) < new Date()
    ) {
      return {
        success: false,
        message: "Registration deadline has passed for this event.",
      };
    }

    // Duplicate email guard
    const normalizedEmail = input.email.trim().toLowerCase();
    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", input.event_id)
      .eq("email", normalizedEmail)
      .not("status", "in", '("cancelled","expired")')
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        message:
          "An active registration already exists for this email address. Please check your inbox for a confirmation email.",
      };
    }

    // Extract custom fields from form data
    const customFields = extractCustomFields(formData);

    // Determine payment requirements
    const isFree = event.is_free;
    const paymentRequired = !isFree;

    // For paid events, get the selected ticket type price and check capacity
    let paymentAmount = 0;
    let paymentCurrency = "NPR";

    if (paymentRequired && input.ticket_type_id) {
      const { data: ticketType, error: ttError } = await supabase
        .from("event_ticket_types")
        .select("id, name, price, currency, capacity, sales_start, sales_end")
        .eq("id", input.ticket_type_id)
        .eq("event_id", input.event_id)
        .eq("is_active", true)
        .single();

      if (ttError || !ticketType) {
        console.error("Ticket type lookup failed:", {
          ticket_type_id: input.ticket_type_id,
          event_id: input.event_id,
          ttError: ttError?.message,
          ttCode: ttError?.code,
        });
        return { success: false, message: "Invalid ticket type selected." };
      }

      // Check sales window
      const now = new Date();
      if (ticketType.sales_start && new Date(ticketType.sales_start) > now) {
        return { success: false, message: "Ticket sales have not started yet." };
      }
      if (ticketType.sales_end && new Date(ticketType.sales_end) < now) {
        return { success: false, message: "Ticket sales have ended." };
      }

      // Check capacity (count actual paid registrations — works even if sold_count column is missing)
      if (ticketType.capacity != null) {
        const { count: soldCount } = await supabase
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("ticket_type_id", input.ticket_type_id)
          .eq("payment_status", "paid")
          .not("status", "in", '("cancelled","expired")');

        if (soldCount !== null && soldCount >= ticketType.capacity) {
          const remaining = ticketType.capacity - soldCount;
          return {
            success: false,
            message: remaining <= 0
              ? `Sorry, "${ticketType.name}" tickets are sold out.`
              : `Only ${remaining} spot${remaining !== 1 ? "s" : ""} left for "${ticketType.name}".`,
          };
        }
      }

      paymentAmount = ticketType.price;
      paymentCurrency = ticketType.currency;
    } else if (paymentRequired && !input.ticket_type_id) {
      // Paid event but no ticket type selected — this should not happen if the form is working correctly
      return {
        success: false,
        message: "Please select a ticket type to continue.",
      };
    }

    // Set expiry for paid registrations (24 hours)
    const expiryHours = 24;
    const expiresAt = paymentRequired
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      : null;

    // Insert registration (with sanitized inputs)
    const { data: registration, error: insertError } = await supabase
      .from("event_registrations")
      .insert({
        event_id: input.event_id,
        full_name: sanitizeString(input.full_name),
        email: normalizedEmail,
        phone: input.phone ? sanitizePhone(input.phone) : null,
        custom_fields: customFields,
        form_schema_version: input.form_schema_version || null,
        ticket_type_id: input.ticket_type_id || null,
        status: paymentRequired ? "pending" : "confirmed",
        payment_status: "unpaid",
        payment_amount: paymentRequired ? paymentAmount : null,
        payment_currency: paymentCurrency,
        consent_terms: input.consent_terms,
        consent_marketing: input.consent_marketing || false,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Event registration error:", insertError);

      // Unique constraint violation
      if (insertError.code === "23505") {
        return {
          success: false,
          message:
            "This email address is already registered for this event. Please check your inbox for a confirmation email.",
        };
      }

      return {
        success: false,
        message: "Failed to complete registration. Please try again.",
      };
    }

    // Increment sold_count on the ticket type (with optimistic concurrency)
    // Gracefully skip if sold_count column doesn't exist (migration 053 not run)
    if (input.ticket_type_id) {
      const { data: tt, error: ttErr } = await supabase
        .from("event_ticket_types")
        .select("capacity")
        .eq("id", input.ticket_type_id)
        .single();

      if (tt && !ttErr) {
        // Double-check capacity hasn't been exceeded by a concurrent request
        // Count actual paid registrations instead of relying on sold_count column
        if (tt.capacity != null) {
          const { count: currentSold } = await supabase
            .from("event_registrations")
            .select("id", { count: "exact", head: true })
            .eq("ticket_type_id", input.ticket_type_id)
            .eq("payment_status", "paid")
            .not("status", "in", '("cancelled","expired")');

          if (currentSold !== null && currentSold > tt.capacity) {
            // Rollback: delete the registration we just inserted
            await supabase.from("event_registrations").delete().eq("id", registration.id);
            return {
              success: false,
              message: "Tickets sold out while registering. Please try again.",
            };
          }
        }
      }
    }

    // For free events (no payment required), increment sold_count immediately
    // since status is "confirmed" at creation
    if (!paymentRequired && input.ticket_type_id) {
      await incrementTicketSoldCount(supabase, input.ticket_type_id);
    }

    return {
      success: true,
      message: `You have successfully registered for ${event.title}!`,
      registrationId: registration.id,
      paymentRequired,
      paymentAmount: paymentRequired ? paymentAmount : undefined,
      paymentCurrency: paymentCurrency,
      expiryHours: expiryHours,
    };
  } catch (err) {
    console.error("Event registration error:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getEventRegistrationByToken(
  registrationId: string,
  email: string
): Promise<{
  id: string;
  fullName: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number | null;
  paymentCurrency: string;
  expiresAt: string | null;
} | null> {
  try {
    if (!registrationId || !email) return null;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_registrations")
      .select(
        "id, full_name, status, payment_status, payment_amount, payment_currency, expires_at"
      )
      .eq("id", registrationId)
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      status: data.status,
      paymentStatus: data.payment_status,
      paymentAmount: data.payment_amount,
      paymentCurrency: data.payment_currency,
      expiresAt: data.expires_at,
    };
  } catch {
    return null;
  }
}

// ── Service-role Supabase client (bypasses RLS for payment operations) ───────

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createServiceClient(supabaseUrl, serviceRoleKey);
}

// ── Result type for startEventPayment() ──────────────────────────────────────

export type StartEventPaymentResult = {
  ok: boolean;
  message: string;
  redirectUrl?: string;
  formData?: Record<string, string>;
  requiresFormSubmit?: boolean;
};

// ── Public: Verify registration by (id + email) for the payment page ──────────
// Returns a minimal public shape with event context — NO full PII returned.
// Uses service-role client for integrity (bypasses RLS).

export async function getEventRegistrationForPayment(
  registrationId: string,
  email: string,
): Promise<{
  id: string;
  fullName: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number | null;
  paymentCurrency: string;
  expiresAt: string | null;
  eventName: string;
  eventSlug: string;
  ticketName: string | null;
} | null> {
  try {
    if (!registrationId || !email) return null;

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("event_registrations")
      .select(
        `id, full_name, status, payment_status, payment_amount, payment_currency,
         expires_at,
         event:events(id, title, slug),
         ticket_type:event_ticket_types(id, name)`,
      )
      .eq("id", registrationId)
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !data) return null;

    const event = (data as any).event as { id: string; title: string; slug: string } | null;
    const ticketType = (data as any).ticket_type as { id: string; name: string } | null;

    return {
      id: data.id,
      fullName: data.full_name,
      status: data.status,
      paymentStatus: data.payment_status,
      paymentAmount: data.payment_amount,
      paymentCurrency: data.payment_currency,
      expiresAt: data.expires_at,
      eventName: event?.title ?? "Event",
      eventSlug: event?.slug ?? "",
      ticketName: ticketType?.name ?? null,
    };
  } catch {
    return null;
  }
}

// ── Public: Start a payment session for a pending registration ────────────────
// Validates registration state, resolves fee, creates provider session.
// Uses dual-key (id + email) to prevent enumeration.

export async function startEventPayment(
  registrationId: string,
  email: string,
  provider: PaymentProvider,
): Promise<StartEventPaymentResult> {
  try {
    if (!registrationId || !email) {
      return { ok: false, message: "Registration ID and email are required." };
    }

    const supabase = createServiceRoleClient();

    // ── Fetch registration with dual-key identity check + event slug in one query ─
    const { data: reg, error: fetchErr } = await supabase
      .from("event_registrations")
      .select(
        `*, event:events(title, slug)`,
      )
      .eq("id", registrationId)
      .eq("email", email.trim().toLowerCase())
      .single();

    if (fetchErr || !reg) {
      return {
        ok: false,
        message: "Registration not found. Please check your registration ID and email.",
      };
    }

    // ── State guards ───────────────────────────────────────────────────────────
    if (reg.payment_status === "paid") {
      return { ok: false, message: "This registration has already been paid." };
    }
    if (reg.status === "confirmed") {
      return { ok: false, message: "This registration is already confirmed." };
    }
    if (reg.status === "cancelled") {
      return { ok: false, message: "This registration has been cancelled." };
    }
    if (reg.status === "expired") {
      return { ok: false, message: "This registration has expired. Please register again." };
    }
    // Block new payment if under review (requires admin resolution)
    if (reg.payment_status === "review") {
      return { ok: false, message: "This payment is under review. Please contact support." };
    }
    // payment_status "failed" is allowed — user can retry with a different provider

    // ── Inline expiry check (belt-and-suspenders) ──────────────────────────────
    if (reg.expires_at && new Date(reg.expires_at) < new Date()) {
      await supabase
        .from("event_registrations")
        .update({ status: "expired" })
        .eq("id", registrationId);
      return { ok: false, message: "This registration has has expired. Please register again." };
    }

    // ── Fee validation (must happen BEFORE optimistic lock) ────────────────────
    if (!reg.payment_amount || reg.payment_amount <= 0) {
      return {
        ok: false,
        message: "This registration does not require payment.",
      };
    }

    // ── Provider validation + optimistic lock in parallel ─────────────────────
    const regEvent = (reg as any).event as { title: string; slug: string } | null;
    const eventTitle = regEvent?.title ?? "Event";
    const eventSlug = regEvent?.slug ?? "";

    const [settings, { data: lockRow, error: lockErr }] = await Promise.all([
      getPaymentSettings(supabase as any),
      supabase
        .from("event_registrations")
        .update({ payment_initiated_at: new Date().toISOString() })
        .eq("id", registrationId)
        .eq("payment_status", "unpaid")
        .is("payment_initiated_at", null)
        .select("id")
        .single(),
    ]);

    const availableProviders = getSupportedProviders(settings);

    let actualProvider = provider;
    if (!availableProviders.includes(provider)) {
      if (availableProviders.length === 0) {
        return {
          ok: false,
          message: "No payment methods are currently available. Please contact support.",
        };
      }
      actualProvider = availableProviders[0];
    }

    // Khalti/eSewa are NPR-only
    const currency =
      actualProvider === "khalti" || actualProvider === "esewa"
        ? ("NPR" as const)
        : ((reg.payment_currency || "NPR") as "NPR" | "USD" | "EUR" | "GBP" | "INR");

    const amount = Number(reg.payment_amount);

    if (lockErr || !lockRow) {
      return {
        ok: false,
        message: "Payment is already being processed for this registration. Please wait or try again.",
      };
    }

    // ── Provider-specific session creation ─────────────────────────────────────
    let redirectUrl: string | undefined;
    let providerUpdate: Record<string, unknown> = {};
    let formData: Record<string, string> | undefined;
    let requiresFormSubmit = false;

    if (actualProvider === "stripe") {
      const result = await startStripeCheckout({
        id: registrationId,
        amount,
        currency,
        donorName: reg.full_name,
        donorEmail: reg.email,
        isMonthly: false,
        successUrl: `${getAppBaseUrl()}/events/${eventSlug}/register/payment-success?rid=${registrationId}`,
        cancelUrl: `${getAppBaseUrl()}/events/${eventSlug}/register/pending-payment?rid=${registrationId}&email=${encodeURIComponent(email)}`,
        metadata: {
          event_registration_id: registrationId,
          payment_type: "event_registration",
          event_title: eventTitle,
        },
      });

      redirectUrl = result.redirectUrl;
      providerUpdate = {
        stripe_session_id: result.sessionId,
        provider_session_ref: result.sessionId,
        payment_id: `stripe:${result.sessionId}`,
      };
    } else if (actualProvider === "khalti") {
      const result = await startKhaltiPayment({
        id: registrationId,
        amount,
        currency: "NPR",
        donorName: reg.full_name,
        donorEmail: reg.email,
        donorPhone: reg.phone || undefined,
        returnUrl: `${getAppBaseUrl()}/events/${eventSlug}/register/payment-success?rid=${registrationId}`,
      });

      redirectUrl = result.redirectUrl;
      providerUpdate = {
        khalti_pidx: result.pidx,
        provider_session_ref: result.pidx,
        payment_id: `khalti:${result.pidx}`,
      };
    } else if (actualProvider === "esewa") {
      const result = await startEsewaPayment({
        id: registrationId,
        amount,
        currency: "NPR",
      });

      redirectUrl = result.redirectUrl;
      formData = result.formData;
      requiresFormSubmit = Object.keys(result.formData).length > 0;
      providerUpdate = {
        esewa_transaction_uuid: result.transactionUuid,
        provider_session_ref: result.transactionUuid,
        payment_id: `esewa:${result.transactionUuid}`,
      };
    }

    if (!redirectUrl && !requiresFormSubmit) {
      return {
        ok: false,
        message: "Payment could not be initiated. Please try another method.",
      };
    }

    // ── Persist provider references + fee snapshot ─────────────────────────────
    const { error: updateErr } = await supabase
      .from("event_registrations")
      .update({
        payment_provider: actualProvider,
        payment_amount: amount,
        payment_currency: currency,
        ...providerUpdate,
      })
      .eq("id", registrationId);

    if (updateErr) {
      console.error("Failed to update event registration with provider ref:", updateErr.message);
      // Release the optimistic lock so the user can retry
      await supabase
        .from("event_registrations")
        .update({ payment_initiated_at: null })
        .eq("id", registrationId);
      return {
        ok: false,
        message: "Payment session could not be saved. Please try again or contact support.",
      };
    }

    return {
      ok: true,
      message: "Redirecting you to the secure payment page...",
      redirectUrl,
      formData,
      requiresFormSubmit,
    };
  } catch (err) {
    console.error("startEventPayment error:", err);
    return {
      ok: false,
      message: "An unexpected error occurred while starting payment. Please try again.",
    };
  }
}

// ── Public: Get registration status for polling endpoint ──────────────────────
// Read-only status fetch. rid-only access (UUID v4 not guessable).
// Returns minimal data — no sensitive PII.

export async function getEventRegistrationStatus(
  registrationId: string,
): Promise<{
  status: string;
  paymentStatus: string;
  eventName: string;
  expiresAt: string | null;
} | null> {
  try {
    if (!registrationId) return null;

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("event_registrations")
      .select(
        `id, status, payment_status, expires_at,
         event:events(id, title)`,
      )
      .eq("id", registrationId)
      .single();

    if (error || !data) return null;

    const event = (data as any).event as { id: string; title: string } | null;

    return {
      status: data.status,
      paymentStatus: data.payment_status,
      eventName: event?.title ?? "Event",
      expiresAt: data.expires_at,
    };
  } catch {
    return null;
  }
}

// =============================================
// Admin Actions
// =============================================

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("user_id", user.id)
    .single();
  if (!admin) throw new Error("Unauthorized: Not an admin user");
  return { supabase, admin, user };
}

// ── Confirm Registration ─────────────────────────────────────────────────────

export async function confirmEventRegistration(
  id: string,
  options: { force?: boolean } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    const { data: reg, error: fetchError } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      return { success: false, error: "Registration not found" };
    }

    if (reg.status === "confirmed") {
      return { success: false, error: "Registration is already confirmed." };
    }

    if (reg.status === "cancelled" || reg.status === "expired") {
      return {
        success: false,
        error: `Cannot confirm a ${reg.status} registration.`,
      };
    }

    if (!options.force && reg.payment_status !== "paid") {
      return {
        success: false,
        error: "Cannot confirm — payment has not been received. Use 'Mark as Paid' to override.",
      };
    }

    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: admin.email || admin.id,
      })
      .eq("id", id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Increment sold_count on the ticket type
    await incrementTicketSoldCount(supabase, reg.ticket_type_id);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Cancel Registration ──────────────────────────────────────────────────────

export async function cancelEventRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    // Fetch current registration with ticket_type_id
    const { data: reg, error: fetchError } = await supabase
      .from("event_registrations")
      .select("status, ticket_type_id")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      return { success: false, error: "Registration not found" };
    }

    if (reg.status === "cancelled") {
      return { success: false, error: "Registration is already cancelled." };
    }

    if (reg.status === "expired") {
      return { success: false, error: "Cannot cancel an expired registration." };
    }

    const { error } = await supabase
      .from("event_registrations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: admin.email || admin.id,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Decrement sold_count when cancelling a previously confirmed registration
    if (reg.status !== "pending") {
      await decrementTicketSoldCount(supabase, reg.ticket_type_id);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Mark Payment Manual ──────────────────────────────────────────────────────

export async function markEventPaymentManual(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    const { error } = await supabase
      .from("event_registrations")
      .update({
        payment_status: "paid",
        payment_id: "manual:admin-override",
        payment_paid_at: new Date().toISOString(),
        payment_override_by: admin.email || admin.id,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Extend Expiry ────────────────────────────────────────────────────────────

export async function extendEventRegistrationExpiry(
  id: string,
  hours: number = 24
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Clamp hours to valid range
    const clampedHours = Math.max(1, Math.min(168, Math.floor(hours)));

    // Fetch current expiry to extend from it
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("expires_at")
      .eq("id", id)
      .single();

    if (!reg) {
      return { success: false, error: "Registration not found" };
    }

    // Extend from current expiry if it's in the future, otherwise from now
    const currentExpiry = reg.expires_at ? new Date(reg.expires_at) : null;
    const baseTime =
      currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(
      baseTime.getTime() + clampedHours * 60 * 60 * 1000
    ).toISOString();

    const { error } = await supabase
      .from("event_registrations")
      .update({ expires_at: newExpiry })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Check-in ─────────────────────────────────────────────────────────────────

export async function checkInEventRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    const { data: reg, error: fetchError } = await supabase
      .from("event_registrations")
      .select("status, checked_in_at")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      return { success: false, error: "Registration not found" };
    }

    if (reg.status !== "confirmed") {
      return {
        success: false,
        error: "Only confirmed registrations can be checked in.",
      };
    }

    if (reg.checked_in_at) {
      return { success: false, error: "Already checked in." };
    }

    const { error } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: new Date().toISOString(),
        checked_in_by: admin.email || admin.id,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function undoCheckInEventRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: null,
        checked_in_by: null,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Update Notes ─────────────────────────────────────────────────────────────

export async function addEventRegistrationNote(
  registrationId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    if (!note.trim()) {
      return { success: false, error: "Note cannot be empty." };
    }

    // Get event_id from registration
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("id", registrationId)
      .single();

    if (!reg) {
      return { success: false, error: "Registration not found." };
    }

    const { error } = await supabase
      .from("event_registration_notes")
      .insert({
        registration_id: registrationId,
        event_id: reg.event_id,
        note: note.trim(),
        created_by: admin.email || admin.id,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Also update the admin_notes field with latest note for quick preview
    await supabase
      .from("event_registrations")
      .update({ admin_notes: note.trim() })
      .eq("id", registrationId);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getEventRegistrationNotes(
  registrationId: string
): Promise<{ id: string; note: string; created_by: string | null; created_at: string }[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_registration_notes")
      .select("id, note, created_by, created_at")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── Delete Registration ──────────────────────────────────────────────────────

export async function deleteEventRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Only allow deletion of cancelled registrations
    const { data: reg, error: fetchError } = await supabase
      .from("event_registrations")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      return { success: false, error: "Registration not found." };
    }

    if (reg.status !== "cancelled") {
      return {
        success: false,
        error: "Only cancelled registrations can be deleted. Cancel it first.",
      };
    }

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Send Email ───────────────────────────────────────────────────────────────

export async function sendEventRegistrationEmail(
  registrationId: string,
  templateType: "confirmation" | "payment_receipt" | "reminder" | "cancellation" | "custom",
  customSubject?: string,
  customBody?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, admin } = await requireAdmin();

    // Fetch registration with event context
    const { data: reg, error: fetchError } = await supabase
      .from("event_registrations")
      .select(`
        *,
        event:events(id, title, event_date, location, is_free)
      `)
      .eq("id", registrationId)
      .single();

    if (fetchError || !reg) {
      return { success: false, error: "Registration not found" };
    }

    const event = reg.event as any;

    // Fetch template (except for custom)
    let templateHtml = ""
    let templateSubject = customSubject || ""

    if (templateType !== "custom") {
      const { data: template } = await supabase
        .from("event_email_templates")
        .select("subject, body_html")
        .eq("event_id", reg.event_id)
        .eq("template_type", templateType)
        .eq("is_active", true)
        .maybeSingle();

      if (!template) {
        return {
          success: false,
          error: `No active ${templateType} template found for this event.`,
        };
      }

      templateHtml = template.body_html
      templateSubject = template.subject
    } else {
      if (!customSubject || !customBody) {
        return { success: false, error: "Custom email requires subject and body." };
      }
      templateHtml = customBody
    }

    // Fetch ticket type name if available
    let ticketName = ""
    let ticketPrice = "Free"
    if (reg.ticket_type_id) {
      const { data: ticket } = await supabase
        .from("event_ticket_types")
        .select("name, price, currency")
        .eq("id", reg.ticket_type_id)
        .maybeSingle();
      if (ticket) {
        ticketName = ticket.name
        ticketPrice = `${ticket.currency} ${ticket.price}`
      }
    }

    // Import and send email
    const { sendEventConfirmationEmail, sendEventCancellationEmail, sendEventReminderEmail, sendEventCustomEmail } = await import("@/lib/email/event-mailer");

    const dateStr = new Date(event.event_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    let result
    if (templateType === "confirmation" || templateType === "payment_receipt") {
      result = await sendEventConfirmationEmail({
        to: reg.email,
        fullName: reg.full_name,
        eventTitle: event.title,
        eventDate: dateStr,
        eventLocation: event.location,
        ticketName,
        ticketPrice,
        registrationId: reg.id,
        templateHtml,
        templateSubject,
      })
    } else if (templateType === "cancellation") {
      result = await sendEventCancellationEmail({
        to: reg.email,
        fullName: reg.full_name,
        eventTitle: event.title,
        eventDate: dateStr,
        registrationId: reg.id,
        templateHtml,
        templateSubject,
      })
    } else if (templateType === "reminder") {
      result = await sendEventReminderEmail({
        to: reg.email,
        fullName: reg.full_name,
        eventTitle: event.title,
        eventDate: dateStr,
        eventLocation: event.location,
        templateHtml,
        templateSubject,
      })
    } else {
      result = await sendEventCustomEmail({
        to: reg.email,
        subject: templateSubject,
        body: customBody || "",
      })
    }

    // Log email
    if (result.success) {
      // Use result.messageId or a placeholder to confirm send
      await supabase.from("event_registration_emails").insert({
        registration_id: registrationId,
        event_id: reg.event_id,
        template_type: templateType,
        subject: templateSubject,
        body_html: result.messageId ? `[Email sent successfully]` : templateType === "custom" ? customBody : templateHtml,
        sent_to: reg.email,
        sent_by: admin.email || admin.id,
      })

      // Update last email timestamp
      const timestampField =
        templateType === "confirmation"
          ? "last_confirmation_email_sent_at"
          : templateType === "cancellation"
            ? "last_cancellation_email_sent_at"
            : templateType === "custom"
              ? "last_custom_email_sent_at"
              : "last_registration_email_sent_at"

      if (timestampField) {
        await supabase
          .from("event_registrations")
          .update({ [timestampField]: new Date().toISOString() })
          .eq("id", registrationId)
      }
    }

    return result.success
      ? { success: true }
      : { success: false, error: result.message };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Bulk Actions ─────────────────────────────────────────────────────────────

export async function bulkConfirmEventRegistrations(
  ids: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, error: "No registrations selected." };
    }

    const { supabase, admin } = await requireAdmin();

    const { data, error } = await supabase
      .from("event_registrations")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: admin.email || admin.id,
      })
      .in("id", ids)
      .eq("payment_status", "paid")
      .not("status", "in", '("cancelled","expired")')
      .select("id");

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function bulkCancelEventRegistrations(
  ids: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, error: "No registrations selected." };
    }

    const { supabase, admin } = await requireAdmin();

    // Fetch registrations to get their ticket_type_ids before cancelling
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("id, ticket_type_id")
      .in("id", ids)
      .not("status", "in", '("cancelled","expired")');

    const { data, error } = await supabase
      .from("event_registrations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: admin.email || admin.id,
      })
      .in("id", ids)
      .not("status", "in", '("cancelled","expired")')
      .select("id");

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    // Capacity is now checked by counting actual registrations — sold_count sync not required

    return { success: true, count: data?.length || 0 };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Fetch Registration Email Log ─────────────────────────────────────────────

export async function getRegistrationEmailLog(
  registrationId: string
): Promise<any[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_registration_emails")
      .select("*")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ── Fetch Registration with Event Context ────────────────────────────────────

export async function getEventRegistrationDetail(
  registrationId: string
): Promise<any> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_registrations")
      .select(`
        *,
        event:events(
          id, title, slug, description, event_date, event_time,
          event_end_date, location, venue_name, address,
          status, category, is_free, contact_email
        ),
        ticket_type:event_ticket_types(id, name, price, currency)
      `)
      .eq("id", registrationId)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Fetch payment events for a registration ──────────────────────────────────
// Returns webhook events recorded in the payment_events table.

export async function getEventPaymentEvents(
  registrationId: string
): Promise<{ id: string; provider: string; event_id: string; created_at: string }[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("payment_events")
      .select("id, provider, event_id, created_at")
      .eq("event_registration_id", registrationId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
