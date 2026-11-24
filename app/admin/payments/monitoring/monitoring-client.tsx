"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Mail, Receipt, TrendingDown, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MonitoringStats {
  receipt: {
    failures24h: number
    failures7d: number
    failures30d: number
    total24h: number
    total7d: number
    total30d: number
    recentFailures: any[]
  }
  email: {
    failures24h: number
    failures7d: number
    failures30d: number
    total24h: number
    total7d: number
    total30d: number
    recentFailures: any[]
  }
}

interface PostPaymentMonitoringClientProps {
  stats: MonitoringStats
}

export function PostPaymentMonitoringClient({ stats }: PostPaymentMonitoringClientProps) {
  const calculateSuccessRate = (failures: number, total: number) => {
    if (total === 0) return 100
    return Math.max(0, ((total - failures) / total) * 100)
  }

  const receiptSuccessRate24h = calculateSuccessRate(stats.receipt.failures24h, stats.receipt.total24h)
  const receiptSuccessRate7d = calculateSuccessRate(stats.receipt.failures7d, stats.receipt.total7d)
  const receiptSuccessRate30d = calculateSuccessRate(stats.receipt.failures30d, stats.receipt.total30d)

  const emailSuccessRate24h = calculateSuccessRate(stats.email.failures24h, stats.email.total24h)
  const emailSuccessRate7d = calculateSuccessRate(stats.email.failures7d, stats.email.total7d)
  const emailSuccessRate30d = calculateSuccessRate(stats.email.failures30d, stats.email.total30d)

  const isAlertThreshold = (rate: number) => rate < 95

  return (
    <div className="space-y-6">
      {/* Alert Warning if high failure rate */}
      {(isAlertThreshold(receiptSuccessRate24h) || isAlertThreshold(emailSuccessRate24h)) && (
        <Alert variant="destructive" className="border-red-500/40 bg-red-500/5">
          <AlertTriangle className="size-4" />
          <AlertTitle className="font-bold">Elevated Failure Rate Detected</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed space-y-1">
            {isAlertThreshold(receiptSuccessRate24h) && (
              <p>Receipt PDF generation success rate is below 95% in the last 24 hours.</p>
            )}
            {isAlertThreshold(emailSuccessRate24h) && (
              <p>Confirmation email delivery success rate is below 95% in the last 24 hours.</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Rate Comparison Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Receipt Generation Success */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <span>Receipt PDF Generation</span>
              </CardTitle>
              {receiptSuccessRate24h >= 95 ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
            </div>
            <CardDescription className="text-xs">Success curves across 24h, 7d, and 30d</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 24 Hours</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  receiptSuccessRate24h >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {receiptSuccessRate24h.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.receipt.failures24h} failure{stats.receipt.failures24h === 1 ? "" : "s"} out of {stats.receipt.total24h} transactions
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 7 Days</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  receiptSuccessRate7d >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {receiptSuccessRate7d.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.receipt.failures7d} failure{stats.receipt.failures7d === 1 ? "" : "s"} out of {stats.receipt.total7d} transactions
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 30 Days</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  receiptSuccessRate30d >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {receiptSuccessRate30d.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.receipt.failures30d} failure{stats.receipt.failures30d === 1 ? "" : "s"} out of {stats.receipt.total30d} transactions
              </p>
            </div>

            {stats.receipt.failures24h > 0 && (
              <Button asChild variant="outline" className="w-full mt-4 h-9 font-medium text-xs">
                <Link href="/admin/payments/receipts/failed" className="gap-1.5">
                  <span>Open Failed Receipts Queue ({stats.receipt.failures24h})</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email Sending Success */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <span>Confirmation Email Dispatch</span>
              </CardTitle>
              {emailSuccessRate24h >= 95 ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
            </div>
            <CardDescription className="text-xs">Success curves across 24h, 7d, and 30d</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 24 Hours</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  emailSuccessRate24h >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {emailSuccessRate24h.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.email.failures24h} failure{stats.email.failures24h === 1 ? "" : "s"} out of {stats.email.total24h} transactions
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 7 Days</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  emailSuccessRate7d >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {emailSuccessRate7d.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.email.failures7d} failure{stats.email.failures7d === 1 ? "" : "s"} out of {stats.email.total7d} transactions
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">Last 30 Days</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-semibold",
                  emailSuccessRate30d >= 95 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                )}>
                  {emailSuccessRate30d.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats.email.failures30d} failure{stats.email.failures30d === 1 ? "" : "s"} out of {stats.email.total30d} transactions
              </p>
            </div>

            {stats.email.failures24h > 0 && (
              <Button asChild variant="outline" className="w-full mt-4 h-9 font-medium text-xs">
                <Link href="/admin/payments/emails/failed" className="gap-1.5">
                  <span>Open Failed Emails Queue ({stats.email.failures24h})</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unresolved Failures Detail Card */}
      {(stats.receipt.recentFailures.length > 0 || stats.email.recentFailures.length > 0) && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold">Recent Unresolved Failures</CardTitle>
            <CardDescription className="text-xs">Immediate retry candidates in dead-letter queues</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {stats.receipt.recentFailures.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="size-3.5 text-primary" />
                  <span>Receipt Generation Failures</span>
                </h3>
                <div className="space-y-2">
                  {stats.receipt.recentFailures.slice(0, 5).map((failure: any, idx: number) => (
                    <div
                      key={failure.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                            S.No #{idx + 1}
                          </span>
                          <p className="font-semibold text-foreground truncate">
                            {failure.donations?.donor_name || "Unknown Payer"}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {failure.error_type} • {failure.attempt_count} attempt{failure.attempt_count === 1 ? "" : "s"}
                          {failure.donations && (
                            <span> • {failure.donations.currency} {Number(failure.donations.amount).toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium shrink-0">
                        <Link href="/admin/payments/receipts/failed">Fix Issue &rarr;</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.email.recentFailures.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  <span>Email Dispatch Failures</span>
                </h3>
                <div className="space-y-2">
                  {stats.email.recentFailures.slice(0, 5).map((failure: any, idx: number) => (
                    <div
                      key={failure.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                            S.No #{idx + 1}
                          </span>
                          <p className="font-semibold text-foreground truncate">
                            {failure.donations?.donor_name || "Unknown Payer"}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {failure.error_type} • {failure.attempt_count} attempt{failure.attempt_count === 1 ? "" : "s"}
                          {failure.donations && (
                            <span> • {failure.donations.currency} {Number(failure.donations.amount).toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium shrink-0">
                        <Link href="/admin/payments/emails/failed">Fix Issue &rarr;</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
