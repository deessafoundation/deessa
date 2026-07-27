import { NextResponse } from "next/server";
import { getEventRegistrationForPayment } from "@/lib/actions/events-module/event-registration";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/events/verify-registration
 *
 * Verifies a registration by (rid + email) pair for the pending-payment page.
 * Returns minimal public info needed to display the payment form.
 *
 * Body: { rid: string, email: string }
 *
 * Security:
 * - Dual-key identity check (rid + email) — prevents enumeration
 * - Distributed rate limiting (60 requests per minute per IP)
 * - Generic error messages (never reveals whether ID exists with wrong email)
 */

export async function POST(request: Request) {
  try {
    // ── Rate limiting (distributed) ─────────────────────────────────────────
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    const rateLimit = await checkRateLimit({
      identifier: `event-verify-reg:ip:${ip}`,
      maxAttempts: 60,
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
    const email = (body.email as string)?.trim();

    if (!rid || !email) {
      return NextResponse.json(
        { ok: false, error: "rid and email are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    // ── Dual-key lookup ─────────────────────────────────────────────────────
    const reg = await getEventRegistrationForPayment(rid, email);

    if (!reg) {
      // Generic message — never reveal whether ID exists with wrong email
      return NextResponse.json(
        { ok: false, error: "Registration not found or email does not match." },
        { status: 404 },
      );
    }

    // ── Check expiry ────────────────────────────────────────────────────────
    const isExpired =
      reg.expiresAt && new Date(reg.expiresAt) < new Date();

    return NextResponse.json({
      ok: true,
      id: reg.id,
      fullName: reg.fullName,
      paymentAmount: reg.paymentAmount,
      paymentCurrency: reg.paymentCurrency,
      expiresAt: reg.expiresAt,
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      eventName: reg.eventName,
      eventSlug: reg.eventSlug,
      ticketName: reg.ticketName,
      expired: isExpired,
    });
  } catch (err) {
    console.error("Events verify-registration API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
