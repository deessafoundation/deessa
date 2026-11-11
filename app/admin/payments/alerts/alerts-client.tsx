"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp,
  Receipt,
  Mail,
  User,
} from "lucide-react"
import Link from "next/link"

interface AlertItem {
  id: string
  type: string
  severity: "error" | "warning" | "info"
  title: string
  message: string
  count: number
  timestamp: string
  actionUrl: string
  actionLabel: string
}

interface AlertData {
  alerts: AlertItem[]
  stuckDonations: any[]
  reviewDonations: any[]
  receiptFailures: any[]
  emailFailures: any[]
}

interface AlertsClientProps {
  data: AlertData
}

export function AlertsClient({ data }: AlertsClientProps) {
  const [alerts] = useState(data.alerts)
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({
    // Expand the first alert by default if present
    ...(data.alerts[0] ? { [data.alerts[0].id]: true } : {}),
  })

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="size-5 text-destructive shrink-0" />
      case "warning":
        return <AlertTriangle className="size-5 text-amber-500 shrink-0" />
      case "info":
        return <Info className="size-5 text-primary shrink-0" />
      default:
        return <Info className="size-5 text-muted-foreground shrink-0" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive" className="font-semibold text-[10px] tracking-wide">CRITICAL</Badge>
      case "warning":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold text-[10px] tracking-wide">WARNING</Badge>
      case "info":
        return <Badge variant="secondary" className="font-semibold text-[10px] tracking-wide text-primary">AUDIT</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">NOTICE</Badge>
    }
  }

  const getCardBorderClass = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-destructive/40 bg-destructive/[0.02]"
      case "warning":
        return "border-amber-500/40 bg-amber-500/[0.02]"
      case "info":
        return "border-primary/40 bg-primary/[0.02]"
      default:
        return "border-border/60 bg-card/60"
    }
  }

  const renderAlertItems = (alert: AlertItem) => {
    if (alert.type === "stuck_donations") {
      return (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Stuck Pending Transactions ({data.stuckDonations.length})
          </span>
          <div className="divide-y divide-border/40 rounded-lg border border-border/50 bg-background/60 overflow-hidden">
            {data.stuckDonations.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">S.No #{idx + 1}</span>
                    <span className="font-medium text-foreground truncate">{item.donor_name || "Anonymous Donor"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-primary">{item.currency} {Number(item.amount).toLocaleString()}</span>
                    <span>•</span>
                    <span>Initiated {new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/payments/${item.id}`}
                  className="px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] font-medium shrink-0 flex items-center gap-1"
                >
                  <span>Console</span>
                  <ExternalLink className="size-2.5" />
                </Link>
              </div>
            ))}
          </div>
          {data.stuckDonations.length > 5 && (
            <div className="text-right">
              <Link href="/admin/payments/system" className="text-xs text-primary hover:underline font-medium">
                View all {data.stuckDonations.length} stuck items in System Health &rarr;
              </Link>
            </div>
          )}
        </div>
      )
    }

    if (alert.type === "review_required") {
      return (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Flagged Transactions Awaiting Staff Verification ({data.reviewDonations.length})
          </span>
          <div className="divide-y divide-border/40 rounded-lg border border-border/50 bg-background/60 overflow-hidden">
            {data.reviewDonations.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">S.No #{idx + 1}</span>
                    <span className="font-medium text-foreground truncate">{item.donor_name || "Unknown Donor"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-primary">{item.currency} {Number(item.amount).toLocaleString()}</span>
                    <span>•</span>
                    <span>Flagged {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/payments/${item.id}`}
                  className="px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] font-medium shrink-0 flex items-center gap-1"
                >
                  <span>Audit Slip</span>
                  <ExternalLink className="size-2.5" />
                </Link>
              </div>
            ))}
          </div>
          {data.reviewDonations.length > 5 && (
            <div className="text-right">
              <Link href="/admin/donations/review" className="text-xs text-primary hover:underline font-medium">
                Open full review queue ({data.reviewDonations.length} items) &rarr;
              </Link>
            </div>
          )}
        </div>
      )
    }

    if (alert.type === "receipt_failures") {
      return (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Recent Receipt PDF Generation Failures ({data.receiptFailures.length})
          </span>
          <div className="divide-y divide-border/40 rounded-lg border border-border/50 bg-background/60 overflow-hidden">
            {data.receiptFailures.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">S.No #{idx + 1}</span>
                    <span className="font-mono text-destructive text-[11px] truncate max-w-[280px]">
                      {item.error_message || "Receipt compilation failed"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Ref: {item.donation_id.slice(0, 8)}... • Logged {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Link
                  href="/admin/payments/receipts/failed"
                  className="px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-[11px] font-medium shrink-0"
                >
                  Retry in DLQ &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (alert.type === "email_failures") {
      return (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Recent Receipt Email Dispatch Failures ({data.emailFailures.length})
          </span>
          <div className="divide-y divide-border/40 rounded-lg border border-border/50 bg-background/60 overflow-hidden">
            {data.emailFailures.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">S.No #{idx + 1}</span>
                    <span className="font-mono text-destructive text-[11px] truncate max-w-[280px]">
                      {item.error_message || "SMTP dispatch error"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Ref: {item.donation_id.slice(0, 8)}... • Logged {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Link
                  href="/admin/payments/emails/failed"
                  className="px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-[11px] font-medium shrink-0"
                >
                  Resend in DLQ &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  const errorCount = alerts.filter((a) => a.severity === "error").length
  const warningCount = alerts.filter((a) => a.severity === "warning").length
  const infoCount = alerts.filter((a) => a.severity === "info").length

  return (
    <div className="space-y-6">
      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-xl border border-destructive/30 bg-destructive/[0.03] backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-destructive">Critical Errors</span>
              <div className="size-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                <XCircle className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-destructive mt-1">
              {errorCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Delivery failures requiring retry</p>
          </CardHeader>
        </Card>

        <Card className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Warnings</span>
              <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertTriangle className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
              {warningCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Stuck pending intents &gt; 1h</p>
          </CardHeader>
        </Card>

        <Card className="rounded-xl border border-primary/30 bg-primary/[0.03] backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">Pending Audits</span>
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Info className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-primary mt-1">
              {infoCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Transactions awaiting staff verification</p>
          </CardHeader>
        </Card>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>Live Incident Matrix</span>
            <Badge variant="outline" className="text-xs font-mono">
              {alerts.length} Categories Active
            </Badge>
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3 mr-1" />
            Refresh
          </Button>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Zero Active System Incidents</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All payment gateways, webhooks, receipt generators, and SMTP dispatch pipelines are operating normally.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin/payments/system"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>Inspect System Health &rarr;</span>
              </Link>
            </div>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const sNo = index + 1
            const isExpanded = !!expandedAlerts[alert.id]

            return (
              <Card
                key={alert.id}
                className={`rounded-xl border shadow-2xs backdrop-blur-xs transition-all overflow-hidden ${getCardBorderClass(alert.severity)}`}
              >
                <CardHeader className="p-4 sm:p-5 border-b border-border/30 bg-muted/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                            S.No #{sNo}
                          </span>
                          <CardTitle className="text-base font-semibold text-foreground">
                            {alert.title}
                          </CardTitle>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                          {alert.message}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(alert.id)}
                        className="h-9 px-3 text-xs font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="size-3.5 mr-1" />
                            Hide Records
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-3.5 mr-1" />
                            Inspect ({alert.count})
                          </>
                        )}
                      </Button>

                      <Button asChild size="sm" className="h-9 px-3.5 text-xs font-medium">
                        <Link href={alert.actionUrl} className="inline-flex items-center gap-1.5">
                          <span>{alert.actionLabel}</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="size-3" />
                      <span>Incident timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
                    </span>
                    <span className="text-[11px] font-mono">
                      Impact: {alert.count} record{alert.count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {isExpanded && renderAlertItems(alert)}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Operations Strip */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Operational Resolution Shortcuts</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Direct access to dedicated recovery consoles for common payment incidents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href="/admin/payments/system"
            className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                Payment System Engine
              </div>
              <div className="text-[11px] text-muted-foreground">
                Run stuck payment auto-recovery & inspect gateway latencies
              </div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>

          <Link
            href="/admin/donations/review"
            className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                Audit Review Queue
              </div>
              <div className="text-[11px] text-muted-foreground">
                Verify bank deposit slips and review flagged transactions
              </div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>

          <Link
            href="/admin/payments/receipts/failed"
            className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                Receipt PDF DLQ
              </div>
              <div className="text-[11px] text-muted-foreground">
                Retry failed PDF compilation & inspect storage exceptions
              </div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>

          <Link
            href="/admin/payments/emails/failed"
            className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                Receipt Email DLQ
              </div>
              <div className="text-[11px] text-muted-foreground">
                Resend receipt emails & troubleshoot SMTP transport failures
              </div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
