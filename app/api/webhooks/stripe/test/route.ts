import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";

/**
 * Webhook Diagnostic Endpoint
 *
 * Helps administrators verify that all required environment variables are
 * configured correctly for Stripe webhook processing.
 *
 * Usage:
 *   GET /api/webhooks/stripe/test
 *
 * Security:
 *   - Admin authentication required. Although it returns only boolean flags,
 *     the combination of which providers are configured plus PAYMENT_MODE and
 *     NODE_ENV is useful reconnaissance and must not be public.
 *   - Never returns actual secret values.
 */
export async function GET() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin || !currentAdmin.is_active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["SUPER_ADMIN", "ADMIN"].includes(currentAdmin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const diagnostics = {
    stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    paymentMode: process.env.PAYMENT_MODE || "not_set",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
  };

  // Check if all critical variables are present
  const allConfigured =
    diagnostics.stripeSecretKey &&
    diagnostics.webhookSecret &&
    diagnostics.supabaseServiceRole &&
    diagnostics.supabaseUrl;

  return NextResponse.json(
    {
      status: allConfigured ? "ok" : "missing_configuration",
      diagnostics,
      message: allConfigured
        ? "All required environment variables are configured"
        : "Some required environment variables are missing. Check the diagnostics object for details.",
    },
    { status: allConfigured ? 200 : 500 }
  );
}
