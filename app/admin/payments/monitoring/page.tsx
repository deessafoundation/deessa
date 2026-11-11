import { createServiceRoleClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostPaymentMonitoringClient } from "./monitoring-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, Activity, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Delivery Monitoring | Admin",
  description: "Monitor receipt generation and email dispatch success curves",
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

async function getMonitoringStats() {
  const supabase = createServiceRoleClient()

  // Get confirmed donations for different time periods
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Receipt failures by time period
  const [failures24h, failures7d, failures30d] = await Promise.all([
    supabase
      .from("receipt_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last24h.toISOString())
      .is("resolved_at", null),
    supabase
      .from("receipt_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last7d.toISOString())
      .is("resolved_at", null),
    supabase
      .from("receipt_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last30d.toISOString())
      .is("resolved_at", null),
  ])

  // Email failures by time period
  const [emailFailures24h, emailFailures7d, emailFailures30d] = await Promise.all([
    supabase
      .from("email_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last24h.toISOString())
      .is("resolved_at", null),
    supabase
      .from("email_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last7d.toISOString())
      .is("resolved_at", null),
    supabase
      .from("email_failures")
      .select("donation_id", { count: "exact", head: true })
      .gte("created_at", last30d.toISOString())
      .is("resolved_at", null),
  ])

  // Total confirmed donations by time period
  const [donations24h, donations7d, donations30d] = await Promise.all([
    supabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["completed", "paid"])
      .gte("created_at", last24h.toISOString()),
    supabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["completed", "paid"])
      .gte("created_at", last7d.toISOString()),
    supabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["completed", "paid"])
      .gte("created_at", last30d.toISOString()),
  ])

  // Recent failures (last 10)
  const { data: recentReceiptFailures } = await supabase
    .from("receipt_failures")
    .select(`
      *,
      donations (
        id,
        donor_name,
        amount,
        currency
      )
    `)
    .is("resolved_at", null)
    .order("last_attempt_at", { ascending: false })
    .limit(10)

  const { data: recentEmailFailures } = await supabase
    .from("email_failures")
    .select(`
      *,
      donations (
        id,
        donor_name,
        amount,
        currency
      )
    `)
    .is("resolved_at", null)
    .order("last_attempt_at", { ascending: false })
    .limit(10)

  return {
    receipt: {
      failures24h: failures24h.count || 0,
      failures7d: failures7d.count || 0,
      failures30d: failures30d.count || 0,
      total24h: donations24h.count || 0,
      total7d: donations7d.count || 0,
      total30d: donations30d.count || 0,
      recentFailures: recentReceiptFailures || [],
    },
    email: {
      failures24h: emailFailures24h.count || 0,
      failures7d: emailFailures7d.count || 0,
      failures30d: emailFailures30d.count || 0,
      total24h: donations24h.count || 0,
      total7d: donations7d.count || 0,
      total30d: donations30d.count || 0,
      recentFailures: recentEmailFailures || [],
    },
  }
}

export default async function PostPaymentMonitoringPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const stats = await getMonitoringStats()

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
            <span className="font-semibold text-foreground">Delivery Monitoring</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Delivery Success Monitoring
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track receipt PDF generation and confirmation email dispatch curves
              </p>
            </div>
          </div>
        </div>
      </div>

      <PostPaymentMonitoringClient stats={stats} />
    </div>
  )
}
