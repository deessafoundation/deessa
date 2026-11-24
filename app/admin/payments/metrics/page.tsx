import { createServiceRoleClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MetricsClient } from "./metrics-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Payment Performance Metrics | Admin",
  description: "View unified payment performance metrics, conversion trends, and provider analytics",
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

async function getMetricsData() {
  const supabase = createServiceRoleClient()

  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  // Fetch all completed transactions across donations, events, and conferences
  const [
    { data: donations },
    { data: eventRegs },
    { data: confRegs },
    receiptFailuresRes,
    emailFailuresRes,
  ] = await Promise.all([
    supabase
      .from("donations")
      .select("id, amount, currency, provider, payment_status, created_at")
      .in("payment_status", ["completed", "paid"]),
    supabase
      .from("event_registrations")
      .select("id, amount_paid, payment_method, payment_status, created_at")
      .in("payment_status", ["completed", "paid"]),
    supabase
      .from("conference_registrations")
      .select("id, amount_paid, payment_method, payment_status, created_at")
      .in("payment_status", ["completed", "paid"]),
    supabase
      .from("receipt_failures")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .is("resolved_at", null),
    supabase
      .from("email_failures")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .is("resolved_at", null),
  ])

  // Map unified items
  const allSettled = [
    ...(donations || []).map((d) => ({
      id: d.id,
      amount: Number(d.amount) || 0,
      currency: (d.currency || (d.provider === "stripe" ? "USD" : "NPR")).toUpperCase(),
      provider: (d.provider || "bank").toLowerCase(),
      created_at: d.created_at,
    })),
    ...(eventRegs || []).map((e) => ({
      id: e.id,
      amount: Number(e.amount_paid) || 0,
      currency: "NPR",
      provider: (e.payment_method || "esewa").toLowerCase(),
      created_at: e.created_at,
    })),
    ...(confRegs || []).map((c) => ({
      id: c.id,
      amount: Number(c.amount_paid) || 0,
      currency: "NPR",
      provider: (c.payment_method || "esewa").toLowerCase(),
      created_at: c.created_at,
    })),
  ]

  // Calculate daily volume across all items for last 30 days
  const dailyDonations = last30Days.map((date) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateStr = nextDate.toISOString().split("T")[0]

    const dayItems = allSettled.filter(
      (item) => item.created_at >= `${date}T00:00:00.000Z` && item.created_at < `${nextDateStr}T00:00:00.000Z`
    )

    return {
      date,
      count: dayItems.length,
      amountNpr: dayItems.filter((i) => i.currency === "NPR").reduce((s, i) => s + i.amount, 0),
      amountUsd: dayItems.filter((i) => i.currency === "USD").reduce((s, i) => s + i.amount, 0),
    }
  })

  // Provider breakdown with currency separation
  const providerKeys = ["stripe", "khalti", "esewa", "bank"]
  const providerStats = providerKeys.map((p) => {
    const matching = allSettled.filter((item) => {
      if (p === "bank") return item.provider === "bank" || item.provider === "bank_transfer"
      return item.provider === p
    })

    const nprAmount = matching.filter((i) => i.currency === "NPR").reduce((s, i) => s + i.amount, 0)
    const usdAmount = matching.filter((i) => i.currency === "USD").reduce((s, i) => s + i.amount, 0)

    return {
      provider: p,
      count: matching.length,
      nprAmount,
      usdAmount,
    }
  })

  // Status breakdown across donations table
  const [completedCount, pendingCount, reviewCount, failedCount] = await Promise.all([
    supabase.from("donations").select("id", { count: "exact", head: true }).in("payment_status", ["completed", "paid"]),
    supabase.from("donations").select("id", { count: "exact", head: true }).in("payment_status", ["pending", "unpaid"]),
    supabase.from("donations").select("id", { count: "exact", head: true }).eq("payment_status", "review"),
    supabase.from("donations").select("id", { count: "exact", head: true }).eq("payment_status", "failed"),
  ])

  const totalConfirmed = allSettled.length
  const receiptFailuresCount = receiptFailuresRes.count || 0
  const emailFailuresCount = emailFailuresRes.count || 0

  const receiptSuccessRate = totalConfirmed > 0
    ? Math.max(0, ((totalConfirmed - receiptFailuresCount) / totalConfirmed) * 100)
    : 100

  const emailSuccessRate = totalConfirmed > 0
    ? Math.max(0, ((totalConfirmed - emailFailuresCount) / totalConfirmed) * 100)
    : 100

  const totalNpr = allSettled.filter((i) => i.currency === "NPR").reduce((s, i) => s + i.amount, 0)
  const totalUsd = allSettled.filter((i) => i.currency === "USD").reduce((s, i) => s + i.amount, 0)

  return {
    totals: {
      transactions: totalConfirmed,
      npr: totalNpr,
      usd: totalUsd,
    },
    dailyDonations,
    providerStats,
    successRates: {
      receipt: receiptSuccessRate,
      email: emailSuccessRate,
    },
    statusBreakdown: [
      { status: "completed", count: completedCount.count || 0 },
      { status: "pending", count: pendingCount.count || 0 },
      { status: "review", count: reviewCount.count || 0 },
      { status: "failed", count: failedCount.count || 0 },
    ],
  }
}

export default async function MetricsPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const metrics = await getMetricsData()

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
            <span className="font-semibold text-foreground">Performance Metrics</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Payment Performance Metrics
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Unified revenue trends, gateway shares, and operational delivery benchmarks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Payments Ledger &rarr;
          </Link>
        </div>
      </div>

      <MetricsClient metrics={metrics} />
    </div>
  )
}
