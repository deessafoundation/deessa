import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { verifyStripeSession } from "@/lib/payments/stripe";
import { sendEventConfirmationEmail } from "@/lib/email/event-mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAppBaseUrl } from "@/lib/utils";

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

    // Ownership verification: if stripe_session_id not yet stored, store it now and proceed.
    // The (rid + sessionId) pair is sufficient proof of ownership:
    //   - rid is a UUID verified against the DB record above
    //   - sessionId came from Stripe's redirect URL and is cryptographically unguessable
    // Email is NOT an ownership proof (multiple registrations may share an email).
    // If stripe_session_id IS already stored, the mismatch check at line 102 above already
    // rejected any attacker who supplied a different sessionId.
    if (!reg.stripe_session_id) {
      // Store the session ID now so subsequent calls go through the strict equality check.
      const { error: storeErr } = await supabase
        .from("event_registrations")
        .update({ stripe_session_id: sessionId })
        .eq("id", rid)
        .is("stripe_session_id", null); // CAS: only write if still NULL (avoid overwrite race)

      if (storeErr) {
        // Non-fatal: the final UPDATE in step 4 also writes stripe_session_id.
        // Log but continue — the rid+sessionId pair already proves ownership.
        console.warn("confirm-stripe-session: failed to pre-store stripe_session_id", {
          rid,
          sessionId,
          error: storeErr,
        });
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

      // Currency mismatch is FAIL-CLOSED — flag for admin review, do NOT overwrite the
      // expected currency and do NOT confirm the registration.
      // Same policy as amount mismatch: the DB record reflects what the user agreed to pay,
      // and Stripe returning a different currency signals something unexpected happened.
      if (regCurrency !== sessionCurrency) {
        const { data: currencyReviewRows, error: currencyReviewErr } = await supabase
          .from("event_registrations")
          .update({
            payment_status: "review",
            payment_review_at: new Date().toISOString(),
            stripe_session_id: sessionId,
          })
          .eq("id", rid)
          .not("status", "in", '("cancelled","expired")')
          .select("id");

        if (currencyReviewErr) {
          console.error("confirm-stripe-session: Failed to flag currency mismatch for review", {
            rid,
            sessionId,
            regCurrency,
            sessionCurrency,
            error: currencyReviewErr,
          });
          return NextResponse.json(
            { ok: false, error: "Failed to flag payment for review" },
            { status: 500 },
          );
        }

        if (!currencyReviewRows || currencyReviewRows.length === 0) {
          return NextResponse.json(
            { ok: false, error: "Registration is no longer in a confirmable state" },
            { status: 409 },
          );
        }

        console.warn("confirm-stripe-session: currency mismatch — flagged for review", {
          rid,
          sessionId,
          expected: regCurrency,
          actual: sessionCurrency,
        });
        return NextResponse.json({ ok: true, status: "review" });
      }
    }

    // ── 4. Confirm registration (CAS: only if not cancelled, expired, OR already confirmed) ──
    // Adding "confirmed" to the exclusion list is the concurrency guard: if two simultaneous
    // POST requests both pass the idempotency check at line 82 (race window between fetch and
    // update), only the first UPDATE matches — the second sees 0 rows and we re-fetch to
    // return a friendly already_confirmed response instead of a 409.
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
      .not("status", "in", '("cancelled","expired","confirmed")')
      .select("id");

    if (updateErr) {
      console.error("confirm-stripe-session: DB update failed", updateErr);
      return NextResponse.json(
        { ok: false, error: "Failed to confirm registration" },
        { status: 500 },
      );
    }

    if (!confirmRows || confirmRows.length === 0) {
      // 0 rows updated: either another concurrent call already confirmed this registration,
      // or the webhook beat us to it. Re-fetch to distinguish from a genuine terminal state.
      const { data: refetched } = await supabase
        .from("event_registrations")
        .select("status, payment_status")
        .eq("id", rid)
        .single();

      if (refetched?.status === "confirmed" && refetched?.payment_status === "paid") {
        // Concurrent confirmation succeeded — this is idempotent, treat as success.
        console.log("confirm-stripe-session: concurrent confirmation detected, returning already_confirmed", rid);
        return NextResponse.json({ ok: true, status: "confirmed", alreadyConfirmed: true });
      }

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
          .select("title, event_date, location, venue_name, contact_email, slug")
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

        const eventTyped = event as { title: string; event_date: string; location: string; venue_name?: string; contact_email?: string; slug?: string };

        await sendEventConfirmationEmail({
          to: reg.email,
          fullName: reg.full_name,
          eventTitle: eventTyped.title,
          eventDate: eventTyped.event_date,
          eventLocation: eventTyped.location,
          venueName: eventTyped.venue_name || "",
          eventUrl: eventTyped.slug ? `${getAppBaseUrl()}/events/${eventTyped.slug}` : "",
          contactEmail: eventTyped.contact_email || "",
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
