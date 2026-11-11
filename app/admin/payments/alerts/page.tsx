import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { AlertsClient } from "./alerts-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, BellRing } from "lucide-react"

export const metadata = {
  title: "Payment System Alerts | Admin",
  description: "Monitor and manage operational alerts, stuck payments, and dead-letter queues",
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

async function getAlerts() {
  const serviceSupabase = createServiceRoleClient()

  // Get stuck donations (pending for > 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: stuckDonations } = await serviceSupabase
    .from("donations")
    .select("id, donor_name, amount, currency, created_at, payment_status")
    .eq("payment_status", "pending")
    .lt("created_at", oneHourAgo)
    .order("created_at", { ascending: false })

  // Get review donations
  const { data: reviewDonations } = await serviceSupabase
    .from("donations")
    .select("id, donor_name, amount, currency, created_at, payment_status")
    .eq("payment_status", "review")
    .order("created_at", { ascending: false })

  // Get recent failures from last 24h
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [receiptFailures, emailFailures] = await Promise.all([
    serviceSupabase
      .from("receipt_failures")
      .select("id, donation_id, error_message, created_at, error_type")
      .gte("created_at", last24h)
      .is("resolved_at", null)
      .order("created_at", { ascending: false }),
    serviceSupabase
      .from("email_failures")
      .select("id, donation_id, error_message, created_at, error_type")
      .gte("created_at", last24h)
      .is("resolved_at", null)
      .order("created_at", { ascending: false }),
  ])

  // Transform into alert format
  const alerts = []

  // Stuck donations alerts
  if (stuckDonations && stuckDonations.length > 0) {
    alerts.push({
      id: `stuck-${Date.now()}`,
      type: "stuck_donations",
      severity: "warning" as const,
      title: `${stuckDonations.length} Stuck Pending Payment${stuckDonations.length !== 1 ? "s" : ""}`,
      message: `${stuckDonations.length} payment intent(s) have remained in pending state for over 60 minutes without webhook resolution`,
      count: stuckDonations.length,
      timestamp: stuckDonations[0].created_at,
      actionUrl: "/admin/payments/system",
      actionLabel: "Run Reconciliation",
    })
  }

  // Review donations alerts
  if (reviewDonations && reviewDonations.length > 0) {
    alerts.push({
      id: `review-${Date.now()}`,
      type: "review_required",
      severity: "info" as const,
      title: `${reviewDonations.length} Payment${reviewDonations.length !== 1 ? "s" : ""} Awaiting Staff Audit`,
      message: `${reviewDonations.length} transaction(s) or bank transfer vouchers flagged for manual staff verification`,
      count: reviewDonations.length,
      timestamp: reviewDonations[0].created_at,
      actionUrl: "/admin/donations/review",
      actionLabel: "Audit Review Queue",
    })
  }

  // Receipt failures alerts
  if (receiptFailures.data && receiptFailures.data.length > 0) {
    alerts.push({
      id: `receipt-${Date.now()}`,
      type: "receipt_failures",
      severity: "error" as const,
      title: `${receiptFailures.data.length} Receipt PDF Failure${receiptFailures.data.length !== 1 ? "s" : ""}`,
      message: `${receiptFailures.data.length} receipt generation exception(s) logged in the last 24 hours`,
      count: receiptFailures.data.length,
      timestamp: receiptFailures.data[0].created_at,
      actionUrl: "/admin/payments/receipts/failed",
      actionLabel: "Open Receipts DLQ",
    })
  }

  // Email failures alerts
  if (emailFailures.data && emailFailures.data.length > 0) {
    alerts.push({
      id: `email-${Date.now()}`,
      type: "email_failures",
      severity: "error" as const,
      title: `${emailFailures.data.length} Email Dispatch Failure${emailFailures.data.length !== 1 ? "s" : ""}`,
      message: `${emailFailures.data.length} confirmation email dispatch failure(s) recorded in the last 24 hours`,
      count: emailFailures.data.length,
      timestamp: emailFailures.data[0].created_at,
      actionUrl: "/admin/payments/emails/failed",
      actionLabel: "Open Emails DLQ",
    })
  }

  return {
    alerts,
    stuckDonations: stuckDonations || [],
    reviewDonations: reviewDonations || [],
    receiptFailures: receiptFailures.data || [],
    emailFailures: emailFailures.data || [],
  }
}

export default async function AlertsPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const data = await getAlerts()

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
            <span className="font-semibold text-foreground">Operational Alerts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <BellRing className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Payment Operational Alerts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Real-time incident detection across payment gateways, webhooks, and dead-letter queues
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments/operations"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Operations Hub &rarr;
          </Link>
        </div>
      </div>

      <AlertsClient data={data} />
    </div>
  )
}
