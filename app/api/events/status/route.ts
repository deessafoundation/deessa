import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/events/status?rid=...
 *
 * Public status-polling endpoint for the payment-success page.
 * Returns registration status and minimal info for confirmation display.
 * Accessed by rid only — used after the payment redirect.
 *
 * Security:
 * - Distributed rate limiting (60 requests per minute per IP)
 * - rid-only access (UUID v4 not guessable)
 * - Returns minimal data — no PII (name stored in sessionStorage by frontend)
 */

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createServiceClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: Request) {
  try {
    // ── Rate limiting (distributed) ─────────────────────────────────────────
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    const rateLimit = await checkRateLimit({
      identifier: `event-status:ip:${ip}`,
      maxAttempts: 60,
      windowMinutes: 1,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    // ── Input validation ────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const rid = searchParams.get("rid")?.trim();

    if (!rid) {
      return NextResponse.json(
        { ok: false, error: "rid is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleClient();

    // ── Fetch registration status ───────────────────────────────────────────
    const { data, error } = await supabase
      .from("event_registrations")
      .select("id, status, payment_status, expires_at, event_id")
      .eq("id", rid)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Registration not found" },
        { status: 404 },
      );
    }

    // ── Fetch event title ───────────────────────────────────────────────────
    let eventName = "Event";
    if (data.event_id) {
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", data.event_id)
        .single();
      if (event) {
        eventName = (event as { title: string }).title;
      }
    }

    return NextResponse.json({
      ok: true,
      status: data.status,
      paymentStatus: data.payment_status,
      eventName,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    console.error("Events status API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
