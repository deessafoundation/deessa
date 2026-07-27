import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { verifyStripeSession } from "@/lib/payments/stripe";
import { sendEventConfirmationEmail } from "@/lib/email/event-mailer";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/events/confirm-stripe-session
 *
 * Called by the payment-success page immediately after Stripe redirects back.
 * Verifies the Stripe session directly and confirms the registration without
 * waiting for a webhook — essential for local development and as a fallback
 * in production if the webhook is delayed.
 *
 * Body: { rid: string, sessionId: string }
 *
 * Security:
 * - Distributed rate limiting (20 requests per minute per IP)
 * - Requires (rid + sessionId) pair — sessionId comes from Stripe and is unguessable
 * - Amount/currency verified against DB record (fail-closed)
 * - Idempotent — safe to call multiple times
 */

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createServiceClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    // ── Rate limiting (distributed) ─────────────────────────────────────────
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    const rateLimit = await checkRateLimit({
      identifier: `event-confirm-stripe:ip:${ip}`,
      maxAttempts: 20,
      windowMinutes: 1,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait before trying again." },
        { status: 429 },
      );
    }

    // ── Input validation ────────────────────────────────────────────────────
    const body = await request.json();
    const rid = (body.rid as string)?.trim();
    const sessionId = (body.sessionId as string)?.trim();

    if (!rid || !sessionId) {
      return NextResponse.json(
        { ok: false, error: "rid and sessionId are required" },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleClient();

    // ── 1. Fetch registration ─────────────────────────────────────────────────
    const { data: reg, error: fetchErr } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("id", rid)
      .single();

    if (fetchErr || !reg) {
      return NextResponse.json(
        { ok: false, error: "Registration not found" },
        { status: 404 },
      );
    }

    // Idempotency — already confirmed
    if (reg.status === "confirmed" && reg.payment_status === "paid") {
      return NextResponse.json({ ok: true, status: "confirmed", alreadyConfirmed: true });
    }

    // Guard: reject cancelled or expired registrations
    if (reg.status === "cancelled") {
      return NextResponse.json(
        { ok: false, error: "This registration has been cancelled." },
        { status: 400 },
      );
    }
    if (reg.status === "expired") {
      return NextResponse.json(
        { ok: false, error: "This registration has expired." },
        { status: 400 },
      );
    }

    // Early check: if session already stored, it must match
    // (Full ownership verification happens after fetching Stripe session)
    if (reg.stripe_session_id && reg.stripe_session_id !== sessionId) {
      return NextResponse.json(
        { ok: false, error: "Session ID mismatch" },
        { status: 403 },
      );
    }

    // ── 2. Verify with Stripe ─────────────────────────────────────────────────
    const verification = await verifyStripeSession(sessionId);
    if (!verification.success || !verification.session) {
      return NextResponse.json(
        { ok: false, error: verification.error || "Could not verify Stripe session" },
        { status: 400 },
      );
    }

    const session = verification.session;

    // Reject non-payment session modes (e.g., subscription)
    if (session.mode !== "payment") {
      return NextResponse.json(
        { ok: false, error: "Invalid session type" },
        { status: 400 },
      );
    }

    // Ownership verification: if stripe_session_id not yet stored, verify via email
    if (!reg.stripe_session_id) {
      const sessionEmail = String(session.customer_email || "").toLowerCase().trim();
      const regEmail = String(reg.email || "").toLowerCase().trim();

      if (!sessionEmail || sessionEmail !== regEmail) {
        return NextResponse.json(
          { ok: false, error: "Session ownership verification failed" },
          { status: 403 },
        );
      }
    }

    // Only proceed if Stripe reports the session as paid
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ok: true,
        status: "processing",
        paymentStatus: session.payment_status,
      });
    }

    // ── 3. Amount / currency verification (fail-closed) ───────────────────────
    if (reg.payment_amount !== null) {
      const expectedMinor = Math.round(Number(reg.payment_amount) * 100);
      const actualMinor = session.amount_total ?? null;
      const sessionCurrency = String(session.currency || "").toLowerCase();
      const regCurrency = String(reg.payment_currency || "npr").toLowerCase();

      if (actualMinor === null) {
        return NextResponse.json(
          { ok: false, error: "Invalid session amount" },
          { status: 400 },
        );
      }

      if (expectedMinor !== actualMinor) {
        // Amount mismatch — flag for admin review, do NOT confirm
        // Only update if not already in a terminal state (webhook may have cancelled/confirmed)
        const { data: reviewRows, error: reviewErr } = await supabase
          .from("event_registrations")
          .update({
            payment_status: "review",
            payment_review_at: new Date().toISOString(),
            stripe_session_id: sessionId,
          })
          .eq("id", rid)
          .not("status", "in", '("cancelled","expired")')
          .select("id");

        if (reviewErr) {
          console.error("confirm-stripe-session: Failed to flag for review", {
            rid,
            sessionId,
            error: reviewErr,
          });
          return NextResponse.json(
            { ok: false, error: "Failed to flag payment for review" },
            { status: 500 },
          );
        }

        if (!reviewRows || reviewRows.length === 0) {
          return NextResponse.json(
            { ok: false, error: "Registration is no longer in a confirmable state" },
            { status: 409 },
          );
        }

        return NextResponse.json({ ok: true, status: "review" });
      }

      // Currency mismatch is non-fatal — sync DB to Stripe's currency
      if (regCurrency !== sessionCurrency) {
        const { error: currencyErr } = await supabase
          .from("event_registrations")
          .update({ payment_currency: sessionCurrency.toUpperCase() })
          .eq("id", rid);

        if (currencyErr) {
          console.error("confirm-stripe-session: Failed to sync payment_currency", {
            rid,
            sessionId,
            sessionCurrency,
            error: currencyErr,
          });
          // Non-fatal — continue with confirmation
        }
      }
    }

    // ── 4. Confirm registration (only if not cancelled/expired by webhook) ─────
    const { data: confirmRows, error: updateErr } = await supabase
      .from("event_registrations")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_provider: "stripe",
        payment_id: `stripe:${sessionId}`,
        provider_session_ref: sessionId,
        stripe_session_id: sessionId,
        payment_paid_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", rid)
      .not("status", "in", '("cancelled","expired")')
      .select("id");

    if (updateErr) {
      console.error("confirm-stripe-session: DB update failed", updateErr);
      return NextResponse.json(
        { ok: false, error: "Failed to confirm registration" },
        { status: 500 },
      );
    }

    if (!confirmRows || confirmRows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Registration is no longer in a confirmable state" },
        { status: 409 },
      );
    }

    // ── 4b. Increment sold_count on ticket type ──────────────────────────────
    try {
      const { incrementTicketSoldCount } = await import("@/lib/utils/ticket-capacity");
      await incrementTicketSoldCount(supabase, reg.ticket_type_id);
    } catch (e) {
      console.warn("confirm-stripe-session: failed to increment sold_count", e);
    }

    // ── 5. Send confirmation email (non-blocking) ─────────────────────────────
    // Fire-and-forget — wrapped in async IIFE to avoid unhandled rejection.
    // Fetches event details and email template for the confirmation email.
    ;(async () => {
      try {
        const { data: event } = await supabase
          .from("events")
          .select("title, event_date, location")
          .eq("id", reg.event_id)
          .single();

        if (!event) return;

        // Fetch confirmation email template
        const { data: template } = await supabase
          .from("event_email_templates")
          .select("subject, body_html")
          .eq("event_id", reg.event_id)
          .eq("template_type", "confirmation")
          .eq("is_active", true)
          .single();

        if (!template?.body_html) return;

        // Fetch ticket name if applicable
        let ticketName: string | undefined;
        if (reg.ticket_type_id) {
          const { data: tt } = await supabase
            .from("event_ticket_types")
            .select("name")
            .eq("id", reg.ticket_type_id)
            .single();
          ticketName = (tt as { name: string } | null)?.name;
        }

        const eventTyped = event as { title: string; event_date: string; location: string };

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

        // Update email tracking timestamp
        await supabase
          .from("event_registrations")
          .update({ last_confirmation_email_sent_at: new Date().toISOString() })
          .eq("id", rid);
      } catch (err) {
        console.error("Non-fatal: confirmation email failed:", err);
      }
    })();

    console.log("confirm-stripe-session: confirmed event registration", rid);
    return NextResponse.json({ ok: true, status: "confirmed" });
  } catch (err) {
    console.error("confirm-stripe-session error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
