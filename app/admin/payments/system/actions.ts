"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { reconcilePendingDonations } from "@/lib/payments/reconciliation"
import { revalidatePath } from "next/cache"

/**
 * Trigger manual reconciliation of stuck donations using the real payment reconciliation engine
 */
export async function triggerReconciliation() {
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
        reconciled: 0,
        checked: 0,
      }
    }

    // Call the real payment reconciliation engine
    const summary = await reconcilePendingDonations({
      maxAge: 60 * 60 * 1000, // 1 hour cutoff
      limit: 50,
      dryRun: false,
    })

    // Log the reconciliation run in payment_events so it is persisted in telemetry
    const serviceSupabase = createServiceRoleClient()
    await serviceSupabase.from("payment_events").insert({
      provider: "system",
      event_id: `reconciliation:batch:${Date.now()}`,
      donation_id: summary.results[0]?.donationId || "00000000-0000-0000-0000-000000000000",
      event_type: "reconciliation.batch_completed",
      raw_payload: {
        executed_by: user.email || user.id,
        summary,
        timestamp: new Date().toISOString(),
      },
      processed_at: new Date().toISOString(),
    })

    revalidatePath("/admin/payments/system")
    revalidatePath("/admin/payments/operations")
    revalidatePath("/admin/payments/alerts")
    revalidatePath("/admin/payments/logs")
    revalidatePath("/admin/payments")

    return {
      success: true,
      message:
        summary.totalChecked === 0
          ? "No stuck pending payments found. All transactions are healthy."
          : `Processed ${summary.totalChecked} pending item(s): ${summary.confirmed} confirmed, ${summary.failed} marked failed, ${summary.noChange} awaiting user completion.`,
      reconciled: summary.confirmed + summary.failed,
      checked: summary.totalChecked,
      summary,
    }
  } catch (error) {
    console.error("[Reconciliation Error]:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Reconciliation failed",
      reconciled: 0,
      checked: 0,
    }
  }
}

/**
 * Check real provider API connectivity & configuration
 */
export async function checkProviderStatus() {
  const results: Record<string, { healthy: boolean; message: string }> = {}

  // 1. Stripe Live API Check
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const StripeModule = (await import("stripe")).default
      const stripe = new StripeModule(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-12-18.acacia" as any,
      })
      await stripe.balance.retrieve()
      results.stripe = { healthy: true, message: "Live API ping OK (balance retrieved)" }
    } else {
      results.stripe = { healthy: false, message: "STRIPE_SECRET_KEY missing" }
    }
  } catch (error: any) {
    results.stripe = {
      healthy: false,
      message: error?.type === "StripeAuthenticationError" ? "Invalid secret key" : error?.message || "Stripe unreachable",
    }
  }

  // 2. Khalti Check
  try {
    const key = process.env.KHALTI_SECRET_KEY
    if (key) {
      const isTest = key.startsWith("test_")
      const isLive = key.startsWith("live_")
      results.khalti = {
        healthy: true,
        message: isLive ? "Live gateway key active" : isTest ? "Sandbox test key active" : "Key configured",
      }
    } else {
      results.khalti = { healthy: false, message: "KHALTI_SECRET_KEY missing" }
    }
  } catch (error: any) {
    results.khalti = { healthy: false, message: error?.message || "Khalti error" }
  }

  // 3. eSewa Check
  try {
    const merchantId = process.env.ESEWA_MERCHANT_ID
    const secretKey = process.env.ESEWA_SECRET_KEY
    if (merchantId && secretKey) {
      results.esewa = {
        healthy: true,
        message: `Merchant ID: ${merchantId} (HMAC-SHA256 active)`,
      }
    } else {
      results.esewa = { healthy: false, message: "Merchant ID or secret key missing" }
    }
  } catch (error: any) {
    results.esewa = { healthy: false, message: error?.message || "eSewa error" }
  }

  // 4. Supabase Storage Buckets Check
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data: buckets, error } = await serviceSupabase.storage.listBuckets()
    if (error) {
      results.storage = { healthy: false, message: error.message }
    } else {
      const bucketNames = buckets?.map((b) => b.name) || []
      const hasReceipts = bucketNames.includes("donation-receipts") || bucketNames.includes("receipts")
      results.storage = {
        healthy: true,
        message: `${buckets?.length || 0} bucket(s) online${hasReceipts ? " (receipts ready)" : ""}`,
      }
    }
  } catch (error: any) {
    results.storage = { healthy: false, message: error?.message || "Storage check failed" }
  }

  // 5. SMTP Transport Check
  try {
    if (process.env.GOOGLE_EMAIL && process.env.GOOGLE_APP_PASSWORD) {
      results.smtp = {
        healthy: true,
        message: `Google SMTP configured (${process.env.GOOGLE_EMAIL})`,
      }
    } else {
      results.smtp = {
        healthy: false,
        message: "GOOGLE_EMAIL or GOOGLE_APP_PASSWORD missing",
      }
    }
  } catch (error: any) {
    results.smtp = { healthy: false, message: error?.message || "SMTP error" }
  }

  return results
}
