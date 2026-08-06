import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  startEventPayment,
} from "@/lib/actions/events-module/event-registration";
import { getPaymentSettings, getSupportedProviders, type PaymentProvider } from "@/lib/payments/config";

/**
 * POST /api/events/start-payment
 *
 * Creates a payment session with the chosen provider (Stripe/Khalti/eSewa).
 * Called by the pending-payment page when the user clicks "Pay Now".
 *
 * Security:
 * - Dual-key identity check (registrationId + email)
 * - In-memory rate limiting (10 requests per minute per IP)
 * - Input validation on all fields
 * - Provider validation against available providers
 *
 * Body: { registrationId: string, email: string, provider: PaymentProvider }
 */

// ── In-memory rate limiter (best-effort on serverless) ───────────────────────
const ipHits = new Map<string, { count: number; resetAt: number }>()
const MAX_IP_ENTRIES = 10000

function shouldRateLimit(ip: string, now: number): boolean {
  const windowMs = 60_000
  const max = 10

  cleanupExpiredEntries(now)

  const entry = ipHits.get(ip)
  if (!entry || entry.resetAt <= now) {
    if (entry && entry.resetAt <= now) ipHits.delete(ip)
    if (ipHits.size >= MAX_IP_ENTRIES) evictOldestEntries(now)
    ipHits.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  entry.count += 1
  return entry.count > max
}

let lastCleanup = 0
function cleanupExpiredEntries(now: number): void {
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [ip, entry] of ipHits.entries()) {
    if (entry.resetAt <= now) ipHits.delete(ip)
  }
}

function evictOldestEntries(now: number): void {
  const entries = Array.from(ipHits.entries())
  entries.sort((a, b) => a[1].resetAt - b[1].resetAt)
  const toRemove = Math.max(1, Math.floor(entries.length * 0.1))
  for (let i = 0; i < toRemove; i++) {
    ipHits.delete(entries[i][0])
  }
}

export async function POST(request: Request) {
  try {
    // ── Rate limiting (in-memory — zero network latency) ───────────────────
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    if (shouldRateLimit(ip, Date.now())) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait before trying again." },
        { status: 429 },
      );
    }

    // ── Input parsing + validation ───────────────────────────────────────────
    const body = await request.json();
    const registrationId = body.registrationId as string | undefined;
    const email = body.email as string | undefined;
    const provider = body.provider as PaymentProvider | undefined;

    if (!registrationId || typeof registrationId !== "string" || registrationId.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "registrationId is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    if (!provider || !["stripe", "khalti", "esewa"].includes(provider)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payment provider" },
        { status: 400 },
      );
    }

    // ── Validate provider is enabled in settings ─────────────────────────────
    const settings = await getPaymentSettings();
    const availableProviders = getSupportedProviders(settings);
    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        { ok: false, error: "This payment method is not currently available. Please choose another option." },
        { status: 400 },
      );
    }

    // ── Start payment session (includes dual-key validation internally) ──────
    const result = await startEventPayment(
      registrationId.trim(),
      email.trim(),
      provider,
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      redirectUrl: result.redirectUrl,
      formData: result.formData,
      requiresFormSubmit: result.requiresFormSubmit ?? false,
    });
  } catch (err) {
    console.error("Events start-payment API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
