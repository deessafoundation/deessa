import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { SystemHealthClient } from "./system-health-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, Cpu } from "lucide-react"

export const metadata = {
  title: "Payment System Health & Reconciliation | Admin",
  description: "Monitor database latency, provider credentials, and auto-reconciliation engine",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !canViewFinance(adminUser.role as AdminRole)) return null

  return adminUser.role
}

async function getSystemHealth() {
  const serviceSupabase = createServiceRoleClient()

  // Check database connectivity and measure latency
  const dbStart = Date.now()
  const { error: dbError } = await serviceSupabase.from("donations").select("id").limit(1)
  const dbLatency = Date.now() - dbStart
  const dbStatus = dbError ? "error" : dbLatency < 400 ? "healthy" : "slow"

  // Check required tables
  const [eventsCheck, receiptFailuresCheck, emailFailuresCheck, reviewNotesCheck] = await Promise.all([
    serviceSupabase.from("payment_events").select("id", { count: "exact", head: true }).limit(1),
    serviceSupabase.from("receipt_failures").select("id", { count: "exact", head: true }).limit(1),
    serviceSupabase.from("email_failures").select("id", { count: "exact", head: true }).limit(1),
    serviceSupabase.from("review_notes").select("id", { count: "exact", head: true }).limit(1),
  ])

  // Get stuck donations count (> 1 hour pending)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: stuckDonations } = await serviceSupabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "pending")
    .lt("created_at", oneHourAgo)

  // Get review donations count
  const { count: reviewDonations } = await serviceSupabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "review")

  // Environment configuration status
  const envChecks = {
    stripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    khaltiKey: !!process.env.KHALTI_SECRET_KEY,
    esewaKey: !!process.env.ESEWA_SECRET_KEY,
    esewaMerchant: !!process.env.ESEWA_MERCHANT_ID,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    paymentMode: process.env.PAYMENT_MODE || "live",
  }

  // Query real last reconciliation run from payment_events table
  const { data: lastRecEvent } = await serviceSupabase
    .from("payment_events")
    .select("created_at, raw_payload")
    .like("event_id", "reconciliation:%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastReconciliation = {
    timestamp: lastRecEvent?.created_at || null,
    donationsChecked: stuckDonations || 0,
    donationsReconciled: lastRecEvent?.raw_payload?.summary?.confirmed || 0,
    status: (stuckDonations || 0) === 0 ? "healthy" : "action_required",
  }

  return {
    database: {
      status: dbStatus,
      latency: dbLatency,
      tablesExist: {
        payment_events: !eventsCheck.error,
        receipt_failures: !receiptFailuresCheck.error,
        email_failures: !emailFailuresCheck.error,
        review_notes: !reviewNotesCheck.error,
      },
    },
    reconciliation: lastReconciliation,
    alerts: {
      stuckDonations: stuckDonations || 0,
      reviewDonations: reviewDonations || 0,
    },
    environment: envChecks,
    timestamp: new Date().toISOString(),
  }
}

export default async function SystemHealthPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const health = await getSystemHealth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link
              href="/admin/payments/operations"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Operations Hub</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">System Engine</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Cpu className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Payment Engine & Health
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Telemetry diagnostic matrix, live gateway validation, and auto-reconciliation engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments/monitoring"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Delivery Metrics &rarr;
          </Link>
        </div>
      </div>

      <SystemHealthClient initialHealth={health} />
    </div>
  )
}
