"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Download,
  Search,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Activity,
  Calendar,
  Layers,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { clearOldLogs, exportLogs } from "./actions"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "@/components/admin/payments/payments.module.css"

interface Log {
  id: string
  provider: string
  event_id: string
  donation_id: string
  event_type: string | null
  raw_payload: any
  processed_at: string | null
  created_at: string
  donations: {
    id: string
    donor_name: string
    donor_email: string
    amount: number
    currency: string
  } | null
}

interface LogsClientProps {
  logs: Log[]
  stats: {
    total: number
    last24h: number
    last7d: number
  }
  pagination: {
    page: number
    pageSize: number
    totalCount: number
  }
  initialFilters: {
    provider: string
    search: string
    dateFrom: string
    dateTo: string
  }
}

export function LogsClient({ logs, stats, pagination, initialFilters }: LogsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(initialFilters.search)
  const [provider, setProvider] = useState(initialFilters.provider)
  const [dateRange, setDateRange] = useState<"all" | "24h" | "7d" | "30d">(() => {
    if (!initialFilters.dateFrom) return "all"
    const diffHours = (Date.now() - new Date(initialFilters.dateFrom).getTime()) / (1000 * 60 * 60)
    if (diffHours <= 25) return "24h"
    if (diffHours <= 7 * 24 + 1) return "7d"
    return "30d"
  })

  const [isClearing, setIsClearing] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [inspectLog, setInspectLog] = useState<Log | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedPayload, setCopiedPayload] = useState(false)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    notifications.showSuccess("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopiedPayload(true)
    notifications.showSuccess("Raw JSON copied to clipboard")
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const applyFilters = (overrides?: { newProvider?: string; newDateRange?: "all" | "24h" | "7d" | "30d"; newPage?: number }) => {
    const params = new URLSearchParams()
    const targetSearch = searchTerm.trim()
    const targetProvider = overrides?.newProvider !== undefined ? overrides.newProvider : provider
    const targetRange = overrides?.newDateRange !== undefined ? overrides.newDateRange : dateRange
    const targetPage = overrides?.newPage !== undefined ? overrides.newPage : 1

    if (targetSearch) params.set("search", targetSearch)
    if (targetProvider && targetProvider !== "all") params.set("provider", targetProvider)

    if (targetRange === "24h") {
      params.set("dateFrom", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    } else if (targetRange === "7d") {
      params.set("dateFrom", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    } else if (targetRange === "30d") {
      params.set("dateFrom", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    }

    if (targetPage > 1) {
      params.set("page", targetPage.toString())
    }

    router.push(`/admin/payments/logs?${params.toString()}`)
  }

  const handleSearch = () => {
    applyFilters({ newPage: 1 })
  }

  const handleDatePreset = (preset: "all" | "24h" | "7d" | "30d") => {
    setDateRange(preset)
    applyFilters({ newDateRange: preset, newPage: 1 })
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setProvider("all")
    setDateRange("all")
    router.push("/admin/payments/logs")
  }

  const handleConfirmClearLogs = async () => {
    setIsClearing(true)
    try {
      const result = await clearOldLogs(90)
      if (result.success) {
        notifications.showSuccess({
          title: "Logs Cleared",
          description: `${result.deleted} old log entries removed (90+ days old)`,
        })
        setClearDialogOpen(false)
        router.refresh()
      } else {
        notifications.showError({
          title: "Clear Failed",
          description: result.message,
        })
      }
    } catch {
      notifications.showError({ description: "Failed to clear logs" })
    } finally {
      setIsClearing(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let dateFrom: string | undefined
      if (dateRange === "24h") dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      else if (dateRange === "7d") dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      else if (dateRange === "30d") dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const result = await exportLogs({
        provider: provider !== "all" ? provider : undefined,
        dateFrom,
      })

      if (result.success && result.data) {
        const csv = convertToCSV(result.data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `payment-logs-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        notifications.showSuccess("Logs exported successfully")
      } else {
        notifications.showError({ description: "Failed to export logs" })
      }
    } catch {
      notifications.showError({ description: "Failed to export logs" })
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = ["Date", "Provider", "Event ID", "Donation ID", "Donor Name", "Amount", "Currency", "Event Type"]
    const rows = data.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.provider,
      log.event_id,
      log.donation_id,
      log.donations?.donor_name || "N/A",
      log.donations?.amount || "N/A",
      log.donations?.currency || "N/A",
      log.event_type || "N/A",
    ])

    return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  }

  const getProviderBadge = (p: string) => {
    const key = p.toLowerCase()
    let badgeClass = styles.badgeBank
    let label = p.toUpperCase()

    if (key === "stripe") {
      badgeClass = styles.badgeStripe
      label = "Stripe"
    } else if (key === "khalti") {
      badgeClass = styles.badgeKhalti
      label = "Khalti"
    } else if (key === "esewa") {
      badgeClass = styles.badgeEsewa
      label = "eSewa"
    } else if (key === "bank" || key === "bank_transfer") {
      badgeClass = styles.badgeBank
      label = "Bank Transfer"
    } else if (key === "system") {
      badgeClass = "bg-primary/10 text-primary border-primary/20"
      label = "System"
    }

    return (
      <Badge variant="outline" className={`font-semibold tracking-wide border px-2 py-0.5 text-[11px] ${badgeClass}`}>
        {label}
      </Badge>
    )
  }

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Events</span>
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="size-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recorded in telemetry table</p>
          </CardHeader>
        </Card>

        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Last 24 Hours</span>
              <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Activity className="size-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {stats.last24h.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active webhooks today</p>
          </CardHeader>
        </Card>

        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Last 7 Days</span>
              <div className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar className="size-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {stats.last7d.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Weekly telemetry volume</p>
          </CardHeader>
        </Card>

        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Filtered Total</span>
              <div className="size-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Search className="size-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {pagination.totalCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Matching current criteria</p>
          </CardHeader>
        </Card>
      </div>

      {/* Filters & Actions Card */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by Event ID, Donation ID, or Donor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 h-10 text-sm bg-background/60"
              />
            </div>

            <div className="w-full sm:w-[190px]">
              <Select
                value={provider}
                onValueChange={(val) => {
                  setProvider(val)
                  applyFilters({ newProvider: val, newPage: 1 })
                }}
              >
                <SelectTrigger className="h-10 text-sm bg-background/60 w-full">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSearch} className="h-10 px-4 flex-1 sm:flex-none">
                <Search className="size-4 mr-1.5" />
                Search
              </Button>
              {(searchTerm || provider !== "all" || dateRange !== "all") && (
                <Button onClick={handleResetFilters} variant="ghost" className="h-10 px-3 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Quick Date Presets & CSV / Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="size-3" />
                Time Horizon:
              </span>
              {(["all", "24h", "7d", "30d"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleDatePreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium border ${
                    dateRange === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background/60 text-muted-foreground border-border/60 hover:bg-muted"
                  }`}
                >
                  {preset === "all" ? "All Time" : preset === "24h" ? "Last 24h" : preset === "7d" ? "Last 7d" : "Last 30d"}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
              >
                {isExporting ? (
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="size-3.5 mr-1.5" />
                )}
                Export CSV
              </Button>

              <Button
                onClick={() => setClearDialogOpen(true)}
                variant="destructive"
                size="sm"
                className="h-9 px-3 text-xs"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Purge 90d+ Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Ledger Card */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Event Telemetry Ledger</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Timestamped gateway webhook callbacks and reconciliation triggers
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {totalPages} ({pagination.totalCount} items)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="size-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <Activity className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No payment event logs found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No events matched your current search filters or date range. Try clearing filters.
              </p>
              {(searchTerm || provider !== "all" || dateRange !== "all") && (
                <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-4 h-8 text-xs">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {logs.map((log, index) => {
                const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
                return (
                  <div
                    key={log.id}
                    className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* S.No Badge */}
                        <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted/70 px-2 py-0.5 rounded border border-border/50">
                          S.No #{sNo}
                        </span>

                        {getProviderBadge(log.provider)}

                        {log.event_type && (
                          <Badge variant="secondary" className="text-[11px] font-mono font-normal">
                            {log.event_type}
                          </Badge>
                        )}
                      </div>

                      {/* Event ID with copy */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-mono text-foreground font-medium truncate max-w-[280px] sm:max-w-md">
                          {log.event_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(log.event_id, `event-${log.id}`)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy Event ID"
                        >
                          {copiedId === `event-${log.id}` ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      {/* Associated Donation Info */}
                      {log.donations ? (
                        <div className="text-xs flex flex-wrap items-center gap-1.5 text-muted-foreground">
                          <span className="font-medium text-foreground">{log.donations.donor_name}</span>
                          <span>•</span>
                          <span className="font-semibold text-primary">
                            {log.donations.currency} {Number(log.donations.amount).toLocaleString()}
                          </span>
                          <span>•</span>
                          <Link
                            href={`/admin/payments/${log.donation_id}`}
                            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
                          >
                            <span>Donation: {log.donation_id.slice(0, 8)}...</span>
                            <ExternalLink className="size-2.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Ref: {log.donation_id}
                        </div>
                      )}
                    </div>

                    {/* Right side: Timestamp & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/30">
                      <div className="text-right">
                        <div className="text-xs font-medium text-foreground">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectLog(log)}
                        className="h-8 px-2.5 text-xs font-medium"
                      >
                        <Eye className="size-3.5 mr-1" />
                        Payload
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-border/40 bg-muted/15 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} entries
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ newPage: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ newPage: pagination.page + 1 })}
                disabled={pagination.page >= totalPages}
                className="h-8 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Raw Payload Inspector Modal */}
      <Dialog open={!!inspectLog} onOpenChange={(open) => !open && setInspectLog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between pr-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-semibold">Event Payload Inspector</DialogTitle>
                  {inspectLog && getProviderBadge(inspectLog.provider)}
                </div>
                <DialogDescription className="text-xs">
                  Raw telemetry payload dispatched by payment gateway
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {inspectLog && (
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Event ID</span>
                  <span className="font-mono font-medium truncate block">{inspectLog.event_id}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Event Type</span>
                  <span className="font-mono font-medium">{inspectLog.event_type || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Recorded At</span>
                  <span className="font-medium">{new Date(inspectLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {inspectLog.donation_id && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/50">
                  <span className="text-muted-foreground">Associated Payment:</span>
                  <Link
                    href={`/admin/payments/${inspectLog.donation_id}`}
                    className="inline-flex items-center gap-1 font-mono text-primary hover:underline font-medium"
                  >
                    <span>{inspectLog.donation_id}</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">Raw Webhook JSON</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPayload(inspectLog.raw_payload)}
                    className="h-7 px-2.5 text-xs"
                  >
                    {copiedPayload ? (
                      <Check className="size-3 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    {copiedPayload ? "Copied" : "Copy JSON"}
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg bg-muted/80 text-foreground font-mono text-[11px] overflow-x-auto max-h-[300px] border border-border/50">
                  {JSON.stringify(inspectLog.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInspectLog(null)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Logs Accessible Confirmation Modal */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Purge Historical Payment Event Logs
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              This action will permanently delete raw payment event logs older than 90 days from the database.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed space-y-1 my-2">
            <p className="font-semibold">Safe Data Retention:</p>
            <p>
              Your actual financial records, donation data, receipts, and user accounts in other tables will NOT be deleted.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmClearLogs}
              disabled={isClearing}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="size-4 mr-1.5 animate-spin" />
                  Purging...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-1.5" />
                  Confirm Purge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
