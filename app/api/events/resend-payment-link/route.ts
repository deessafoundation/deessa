import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { getAppBaseUrl } from "@/lib/utils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/events/resend-payment-link
 *
 * Resends the payment link email for a given event registration.
 * Protected by dual-key verification (id + email) and rate limiting (IP + registration ID).
 *
 * Body: { registrationId: string, email: string }
 *
 * Security:
 * - Dual-key identity check (id + email)
 * - Distributed rate limiting: 5/IP/min + 3/registration/min
 * - Won't resend if already paid or expired
 */

const IP_RATE_LIMIT = 5;
const REG_RATE_LIMIT = 3;
const RATE_WINDOW_MINUTES = 60;

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
    const body = await request.json();
    const { registrationId, email } = body as { registrationId?: string; email?: string };

    if (!registrationId || !email) {
      return NextResponse.json(
        { ok: false, error: "registrationId and email are required." },
        { status: 400 },
      );
    }

    const rid = registrationId.trim();
    const emailTrimmed = email.trim().toLowerCase();
    const clientIP = getClientIP(request);

    // ── Rate Limiting: IP-based ──────────────────────────────────────────────
    if (clientIP !== null) {
      const ipLimit = await checkRateLimit({
        identifier: `event-resend-payment:ip:${clientIP}`,
        maxAttempts: IP_RATE_LIMIT,
        windowMinutes: RATE_WINDOW_MINUTES,
      });

      if (!ipLimit.allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: "Too many requests. Please try again later.",
            resetAt: ipLimit.resetAt?.toISOString(),
          },
          { status: 429 },
        );
      }
    }

    // ── Rate Limiting: Registration ID-based ─────────────────────────────────
    const regLimit = await checkRateLimit({
      identifier: `event-resend-payment:rid:${rid}`,
      maxAttempts: REG_RATE_LIMIT,
      windowMinutes: RATE_WINDOW_MINUTES,
    });

    if (!regLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many resend attempts for this registration. Please try again later.",
          resetAt: regLimit.resetAt?.toISOString(),
        },
        { status: 429 },
      );
    }

    // ── Dual-key verification ────────────────────────────────────────────────
    const supabase = createServiceRoleClient();

    const { data: reg, error: fetchErr } = await supabase
      .from("event_registrations")
      .select("id, full_name, email, status, payment_status, event_id, expires_at")
      .eq("id", rid)
      .eq("email", emailTrimmed)
      .single();

    if (fetchErr || !reg) {
      // Generic message — never reveal whether ID exists with wrong email
      return NextResponse.json(
        { ok: false, error: "Registration not found or email does not match." },
        { status: 404 },
      );
    }

    // ── Guard: don't resend if already paid ──────────────────────────────────
    if (reg.payment_status === "paid") {
      return NextResponse.json({
        ok: true,
        message: "This registration has already been paid. No payment link needed.",
      });
    }

    // ── Guard: don't resend if expired ───────────────────────────────────────
    if (reg.status === "expired") {
      return NextResponse.json(
        {
          ok: false,
          error: "This registration has expired. Please register again.",
        },
        { status: 400 },
      );
    }

    // ── Fetch event details and payment link template ────────────────────────
    const { data: event } = await supabase
      .from("events")
      .select("title, slug")
      .eq("id", reg.event_id)
      .single();

    const eventTitle = (event as { title: string; slug: string } | null)?.title ?? "Event";
    const eventSlug = (event as { title: string; slug: string } | null)?.slug ?? "";

    // ── Send payment reminder email ──────────────────────────────────────────
    // Fetch payment_receipt template or fall back to confirmation template
    const { data: template } = await supabase
      .from("event_email_templates")
      .select("subject, body_html")
      .eq("event_id", reg.event_id)
      .eq("template_type", "payment_receipt")
      .eq("is_active", true)
      .single();

    // Build payment link URL
    const baseUrl = getAppBaseUrl();
    const paymentLinkUrl = `${baseUrl}/events/${eventSlug}/register/pending-payment?rid=${rid}&email=${encodeURIComponent(emailTrimmed)}`;

    if (template?.body_html) {
      // Interpolate template with payment link
      const vars = {
        full_name: reg.full_name,
        email: emailTrimmed,
        event_title: eventTitle,
        registration_id: rid,
        payment_link: paymentLinkUrl,
        site_url: baseUrl,
      };

      // Simple template interpolation
      let subject = template.subject || `Complete Your Payment - ${eventTitle}`;
      let html = template.body_html;

      for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
        // Only escape HTML in the body — subject is plain text
        subject = subject.replace(regex, value);
        html = html.replace(regex, escapeHtml(value));
      }

      // Send email using the existing email infrastructure
      try {
        const nodemailer = await import("nodemailer");
        const user = process.env.GOOGLE_EMAIL;
        const pass = process.env.GOOGLE_APP_PASSWORD;

        if (user && pass) {
          const transporter = nodemailer.default.createTransport({
            service: "gmail",
            auth: { user, pass },
          });

          await transporter.sendMail({
            from: `"DEESSA Foundation" <${user}>`,
            to: emailTrimmed,
            subject,
            html,
          });

          // Update email tracking timestamp
          await supabase
            .from("event_registrations")
            .update({ last_registration_email_sent_at: new Date().toISOString() })
            .eq("id", rid);
        }
      } catch (emailErr) {
        console.error("Non-fatal: payment link email failed:", emailErr);
        // Don't fail the request — email is best-effort
      }
    }

    return NextResponse.json({
      ok: true,
      message: template?.body_html
        ? `Payment link has been sent to ${emailTrimmed}.`
        : "Payment link generated. Please use the link directly (email template not configured).",
      paymentLink: paymentLinkUrl,
    });
  } catch (err) {
    console.error("Events resend-payment-link error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
