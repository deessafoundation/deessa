import { createServiceRoleClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Mail,
  Receipt,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Server,
  ArrowUpRight,
  Zap,
  Sliders,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Payment Operations Hub | Admin",
  description: "Monitor system health, gateway telemetry, dead-letter queues, and operational metrics",
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

async function getQuickStats() {
  const serviceSupabase = createServiceRoleClient()
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

  const [
    receiptFailures,
    emailFailures,
    recentDonations,
    stuckDonations,
    reviewDonations,
  ] = await Promise.all([
    serviceSupabase
      .from("receipt_failures")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
    serviceSupabase
      .from("email_failures")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
    serviceSupabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["completed", "paid"])
      .gte("created_at", last24h),
    serviceSupabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending")
      .lt("created_at", oneHourAgo),
    serviceSupabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "review"),
  ])

  return {
    receiptFailures: receiptFailures.count || 0,
    emailFailures: emailFailures.count || 0,
    recentDonations: recentDonations.count || 0,
    stuckDonations: stuckDonations.count || 0,
    reviewDonations: reviewDonations.count || 0,
  }
}

export default async function PaymentOperationsPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const stats = await getQuickStats()
  const totalIncidents = stats.receiptFailures + stats.emailFailures + stats.stuckDonations

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link
              href="/admin/payments"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Master Ledger</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Operations Hub</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Server className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Payment Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Telemetry monitoring, gateway diagnostics, incident triage, and dead-letter queues
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="h-9 font-medium shadow-2xs">
          <Link href="/admin/payments" className="gap-1.5">
            <ArrowLeft className="size-3.5" />
            <span>Return to Ledger</span>
          </Link>
        </Button>
      </div>

      {/* ── Quick KPI Stat Rail (4 Cards) ──────────────────────────── */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* 24h Transactions */}
        <Card className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              24h Settled
            </CardTitle>
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {stats.recentDonations}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="size-3" />
              <span>Confirmed today</span>
            </p>
          </CardContent>
        </Card>

        {/* Stuck Pending Payments */}
        <Card className={cn(
          "rounded-xl border shadow-xs transition-colors",
          stats.stuckDonations > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border/80 bg-card/60 hover:border-emerald-500/40"
        )}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Stuck Pending
            </CardTitle>
            <div className={cn(
              "size-7 rounded-lg flex items-center justify-center",
              stats.stuckDonations > 0 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
            )}>
              {stats.stuckDonations > 0 ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={cn(
              "text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums",
              stats.stuckDonations > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {stats.stuckDonations}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.stuckDonations > 0 ? "Pending >1 hour" : "No stuck checkouts"}
            </p>
          </CardContent>
        </Card>

        {/* Receipt Failures */}
        <Card className={cn(
          "rounded-xl border shadow-xs transition-colors",
          stats.receiptFailures > 0 ? "border-red-500/40 bg-red-500/5" : "border-border/80 bg-card/60 hover:border-emerald-500/40"
        )}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Receipt Queue
            </CardTitle>
            <div className={cn(
              "size-7 rounded-lg flex items-center justify-center",
              stats.receiptFailures > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
            )}>
              {stats.receiptFailures > 0 ? <XCircle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={cn(
              "text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums",
              stats.receiptFailures > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {stats.receiptFailures}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.receiptFailures > 0 ? "PDF compile errors" : "Receipt engine clear"}
            </p>
          </CardContent>
        </Card>

        {/* Email Failures */}
        <Card className={cn(
          "rounded-xl border shadow-xs transition-colors",
          stats.emailFailures > 0 ? "border-red-500/40 bg-red-500/5" : "border-border/80 bg-card/60 hover:border-emerald-500/40"
        )}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Dispatch
            </CardTitle>
            <div className={cn(
              "size-7 rounded-lg flex items-center justify-center",
              stats.emailFailures > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
            )}>
              {stats.emailFailures > 0 ? <XCircle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={cn(
              "text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums",
              stats.emailFailures > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {stats.emailFailures}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.emailFailures > 0 ? "Email dispatches failed" : "All emails delivered"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Urgent Action Alert Banner (If incidents exist) ──────────── */}
      {totalIncidents > 0 && (
        <Card className="rounded-xl border border-destructive/30 bg-destructive/[0.04] shadow-xs">
          <CardHeader className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Operational Incidents Detected
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  There {totalIncidents === 1 ? "is" : "are"} {totalIncidents} operational issue{totalIncidents === 1 ? "" : "s"} requiring staff action.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="flex flex-wrap items-center gap-2.5">
              {stats.stuckDonations > 0 && (
                <Button asChild size="sm" variant="outline" className="h-9 px-3.5 text-xs font-semibold border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10">
                  <Link href="/admin/payments/system" className="gap-1.5">
                    <Zap className="size-3.5" />
                    <span>Reconcile {stats.stuckDonations} Stuck Payment{stats.stuckDonations !== 1 ? "s" : ""}</span>
                  </Link>
                </Button>
              )}
              {stats.receiptFailures > 0 && (
                <Button asChild size="sm" variant="destructive" className="h-9 px-3.5 text-xs font-semibold shadow-xs">
                  <Link href="/admin/payments/receipts/failed" className="gap-1.5">
                    <Receipt className="size-3.5" />
                    <span>Fix {stats.receiptFailures} Receipt Failure{stats.receiptFailures !== 1 ? "s" : ""}</span>
                  </Link>
                </Button>
              )}
              {stats.emailFailures > 0 && (
                <Button asChild size="sm" variant="destructive" className="h-9 px-3.5 text-xs font-semibold shadow-xs">
                  <Link href="/admin/payments/emails/failed" className="gap-1.5">
                    <Mail className="size-3.5" />
                    <span>Fix {stats.emailFailures} Email Failure{stats.emailFailures !== 1 ? "s" : ""}</span>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Operations Hub Sub-Systems Grid ─────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Operations & Diagnostics Modules
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. System Health */}
          <Link href="/admin/payments/system" className="group">
            <Card className="h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card">
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <Activity className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">System Health</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  Database latency, gateway API status, and environment variables
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Live connectivity verification for Stripe, Khalti, eSewa, and auto-reconciliation engine.
              </CardContent>
            </Card>
          </Link>

          {/* 2. Alerts & Notifications */}
          <Link href="/admin/payments/alerts" className="group">
            <Card className="h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card">
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                      totalIncidents > 0 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                    )}>
                      <AlertCircle className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Alerts & Backlogs</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  {totalIncidents > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {totalIncidents} operational incident{totalIncidents !== 1 ? "s" : ""} active
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      All systems operating nominally
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Interactive incident triage with 1-click inspection drawers for stuck checkouts and reviews.
              </CardContent>
            </Card>
          </Link>

          {/* 3. Event Logs & Webhooks */}
          <Link href="/admin/payments/logs" className="group">
            <Card className="h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card">
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <Server className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Telemetry Logs</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  Webhook events, raw gateway payloads, and diagnostic records
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Paginated log ledger with time horizon presets, raw JSON inspector, and CSV export.
              </CardContent>
            </Card>
          </Link>

          {/* 4. Performance Metrics */}
          <Link href="/admin/payments/metrics" className="group">
            <Card className="h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card">
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <TrendingUp className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Performance Metrics</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  30-day volume curves, gateway shares, and conversion trends
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Unified multi-currency analytics across donations, events, and conference registrations.
              </CardContent>
            </Card>
          </Link>

          {/* 5. Success Rate Monitoring */}
          <Link href="/admin/payments/monitoring" className="group">
            <Card className="h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card">
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <ShieldCheck className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Delivery Monitoring</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  24h, 7d, and 30d operational success rate trends
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Track receipt PDF generation and email delivery success benchmarks with S.No audit records.
              </CardContent>
            </Card>
          </Link>

          {/* 6. Dead-Letter Queues */}
          <Link href="/admin/payments/receipts/failed" className="group">
            <Card className={cn(
              "h-full rounded-xl border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-sm transition-all duration-200 bg-card",
              stats.receiptFailures > 0 && "border-red-500/30"
            )}>
              <CardHeader className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                      stats.receiptFailures > 0 ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                    )}>
                      <Receipt className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">Dead-Letter Queues</CardTitle>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-xs pt-1.5">
                  Manual retry workspace for failed receipt and email dispatches
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground">
                Inspect stack traces, resolve errors with custom notes, and trigger instantaneous re-executions.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
