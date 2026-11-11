"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, CheckCircle2, AlertTriangle, CreditCard, DollarSign, ArrowRight } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { formatCurrency } from "@/lib/utils/currency"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface MetricsData {
  totals: {
    transactions: number
    npr: number
    usd: number
  }
  dailyDonations: Array<{ date: string; count: number; amountNpr: number; amountUsd: number }>
  providerStats: Array<{ provider: string; count: number; nprAmount: number; usdAmount: number }>
  successRates: {
    receipt: number
    email: number
  }
  statusBreakdown: Array<{ status: string; count: number }>
}

interface MetricsClientProps {
  metrics: MetricsData
}

export function MetricsClient({ metrics }: MetricsClientProps) {
  const handleExport = () => {
    try {
      const csv = [
        ["Metric", "Value"],
        ["Total Settled Transactions", metrics.totals.transactions.toString()],
        ["Total NPR Volume", `NPR ${metrics.totals.npr.toFixed(2)}`],
        ["Total USD Volume", `USD ${metrics.totals.usd.toFixed(2)}`],
        ["Receipt Success Rate", `${metrics.successRates.receipt.toFixed(2)}%`],
        ["Email Success Rate", `${metrics.successRates.email.toFixed(2)}%`],
        ...metrics.providerStats.map((p) => [
          `${p.provider.toUpperCase()} Transactions`,
          `${p.count} (NPR ${p.nprAmount.toFixed(2)} / USD ${p.usdAmount.toFixed(2)})`,
        ]),
        ...metrics.statusBreakdown.map((s) => [
          `${s.status.toUpperCase()} Status Count`,
          s.count.toString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payment-metrics-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      notifications.showSuccess("Metrics report exported to CSV")
    } catch {
      notifications.showError({ description: "Failed to export metrics report" })
    }
  }

  const maxDailyCount = Math.max(...metrics.dailyDonations.map((d) => d.count), 1)

  const getProviderConfig = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "stripe":
        return { label: "Stripe", colorClass: "bg-indigo-500", textClass: "text-indigo-600 dark:text-indigo-400", badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20" }
      case "khalti":
        return { label: "Khalti", colorClass: "bg-purple-600", textClass: "text-purple-600 dark:text-purple-400", badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" }
      case "esewa":
        return { label: "eSewa", colorClass: "bg-emerald-500", textClass: "text-emerald-600 dark:text-emerald-400", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" }
      case "bank":
        return { label: "Bank Transfer", colorClass: "bg-sky-500", textClass: "text-sky-600 dark:text-sky-400", badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20" }
      default:
        return { label: provider, colorClass: "bg-slate-500", textClass: "text-slate-600", badgeClass: "bg-muted text-muted-foreground" }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return { label: "Completed", colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" }
      case "pending":
      case "unpaid":
        return { label: "Pending", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" }
      case "review":
        return { label: "In Review", colorClass: "text-sky-600 dark:text-sky-400", bgClass: "bg-sky-500/10 border-sky-500/20" }
      case "failed":
        return { label: "Failed", colorClass: "text-red-600 dark:text-red-400", bgClass: "bg-red-500/10 border-red-500/20" }
      default:
        return { label: status, colorClass: "text-foreground", bgClass: "bg-muted border-border" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Overview & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-2xs">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Settled Volume</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                NPR {metrics.totals.npr.toLocaleString()}
              </span>
              {metrics.totals.usd > 0 && (
                <span className="text-xs font-semibold text-primary">
                  + ${metrics.totals.usd.toLocaleString()} USD
                </span>
              )}
            </div>
          </div>

          <div className="border-l border-border/60 pl-6">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Transactions</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {metrics.totals.transactions.toLocaleString()}
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" size="sm" className="h-9 font-medium text-xs self-start sm:self-center">
          <Download className="size-3.5 mr-1.5" />
          Export Metrics CSV
        </Button>
      </div>

      {/* 30-Day Daily Activity Curve */}
      <Card className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">30-Day Daily Contribution Activity</CardTitle>
              <CardDescription className="text-xs">Settled transactions volume per day</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Last 30 Days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-1 h-36 pt-4 pb-1 border-b border-border/50">
              {metrics.dailyDonations.map((d) => {
                const heightPercent = (d.count / maxDailyCount) * 100
                const dayLabel = d.date.split("-").slice(1).join("/")
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-foreground text-background text-[10px] rounded px-2 py-1 shadow-md whitespace-nowrap">
                        <p className="font-semibold">{d.date}</p>
                        <p>{d.count} transaction{d.count === 1 ? "" : "s"}</p>
                        {d.amountNpr > 0 && <p>NPR {d.amountNpr.toLocaleString()}</p>}
                        {d.amountUsd > 0 && <p>${d.amountUsd.toLocaleString()} USD</p>}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>

                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={cn(
                        "w-full rounded-t transition-all",
                        d.count > 0 ? "bg-primary group-hover:bg-primary/80" : "bg-muted/40"
                      )}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1 font-mono">
              <span>{metrics.dailyDonations[0]?.date}</span>
              <span>{metrics.dailyDonations[14]?.date}</span>
              <span>{metrics.dailyDonations[29]?.date}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Provider Share & Operational Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Provider Breakdown */}
        <Card className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Gateway Distribution</CardTitle>
                <CardDescription className="text-xs">Transaction volume & revenues per provider</CardDescription>
              </div>
              <CreditCard className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            {metrics.providerStats.map((p) => {
              const cfg = getProviderConfig(p.provider)
              const percent = metrics.totals.transactions > 0
                ? ((p.count / metrics.totals.transactions) * 100).toFixed(1)
                : "0"

              return (
                <div key={p.provider} className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-background/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", cfg.colorClass)} />
                      <span className="font-semibold text-foreground">{cfg.label}</span>
                      <Badge variant="outline" className={cn("text-[10px] font-mono px-1.5 py-0", cfg.badgeClass)}>
                        {percent}% share
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground font-mono">
                        {p.count} transactions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                    <span>Revenue Volume:</span>
                    <span className="font-semibold text-primary font-mono">
                      {p.usdAmount > 0 ? `$${p.usdAmount.toLocaleString()} USD` : `NPR ${p.nprAmount.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cfg.colorClass)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Operational Success Rates */}
        <Card className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Delivery Benchmarks</CardTitle>
                <CardDescription className="text-xs">Automated receipt PDF and email dispatch success</CardDescription>
              </div>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Receipt Success Rate */}
            <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Receipt PDF Compilation</span>
                <span className={cn(
                  "font-bold font-mono text-sm",
                  metrics.successRates.receipt >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                )}>
                  {metrics.successRates.receipt.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    metrics.successRates.receipt >= 95 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${metrics.successRates.receipt}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>SLO Target: &gt;95.0%</span>
                <Link href="/admin/payments/receipts/failed" className="text-primary hover:underline">
                  Inspect DLQ &rarr;
                </Link>
              </div>
            </div>

            {/* Email Success Rate */}
            <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Confirmation Email Dispatch</span>
                <span className={cn(
                  "font-bold font-mono text-sm",
                  metrics.successRates.email >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                )}>
                  {metrics.successRates.email.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    metrics.successRates.email >= 95 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${metrics.successRates.email}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>SLO Target: &gt;95.0%</span>
                <Link href="/admin/payments/emails/failed" className="text-primary hover:underline">
                  Inspect DLQ &rarr;
                </Link>
              </div>
            </div>

            {/* Payment Lifecycle Status Distribution */}
            <div className="pt-2 border-t border-border/40">
              <span className="text-xs font-semibold text-foreground block mb-2">
                Lifecycle Status Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {metrics.statusBreakdown.map((s) => {
                  const cfg = getStatusConfig(s.status)
                  return (
                    <div key={s.status} className={cn("p-2.5 rounded-lg border text-center space-y-0.5", cfg.bgClass)}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cfg.label}</p>
                      <p className={cn("text-base font-bold font-mono", cfg.colorClass)}>{s.count}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
