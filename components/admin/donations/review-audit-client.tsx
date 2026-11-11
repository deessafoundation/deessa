"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Search,
  X,
  CreditCard,
  Building,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  RotateCcw,
  Download,
  Table as TableIcon,
  LayoutGrid,
  MoreVertical,
  Eye,
  FileText,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

export interface AuditDonation {
  id: string
  amount: number
  currency: string
  donor_name: string
  donor_email: string
  payment_status: string
  provider?: string | null
  receipt_number?: string | null
  payment_method?: string | null
}

export interface AuditEvent {
  id: string
  donation_id: string
  provider: string
  event_id: string
  event_type: "review_approved" | "review_rejected" | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw_payload: any
  created_at: string
  donations: AuditDonation | null
}

interface ReviewAuditClientProps {
  events: AuditEvent[]
}

export function ReviewAuditClient({ events }: ReviewAuditClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [decisionFilter, setDecisionFilter] = useState<"all" | "approved" | "rejected">("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)
  const [showRawPayload, setShowRawPayload] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // ── KPI Summary Calculations ─────────────────────────────────────────
  const stats = useMemo(() => {
    const total = events.length
    const approved = events.filter((e) => e.event_type === "review_approved").length
    const rejected = events.filter((e) => e.event_type === "review_rejected").length
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
    const totalVolume = events.reduce((sum, e) => sum + (e.donations?.amount || 0), 0)

    return { total, approved, rejected, approvalRate, totalVolume }
  }, [events])

  // ── Filtering ────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Decision filter
      if (decisionFilter === "approved" && event.event_type !== "review_approved") {
        return false
      }
      if (decisionFilter === "rejected" && event.event_type !== "review_rejected") {
        return false
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const donorName = event.donations?.donor_name?.toLowerCase() || ""
        const donorEmail = event.donations?.donor_email?.toLowerCase() || ""
        const donationId = event.donation_id?.toLowerCase() || ""
        const adminEmail = (event.raw_payload?.admin_email || "").toLowerCase()
        const notes = (event.raw_payload?.notes || "").toLowerCase()
        const eventId = (event.event_id || "").toLowerCase()

        return (
          donorName.includes(q) ||
          donorEmail.includes(q) ||
          donationId.includes(q) ||
          adminEmail.includes(q) ||
          notes.includes(q) ||
          eventId.includes(q)
        )
      }

      return true
    })
  }, [events, search, decisionFilter])

  // Reset pagination when search or filters change
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(0)
  }

  const handleDecisionFilter = (filter: "all" | "approved" | "rejected") => {
    setDecisionFilter(filter)
    setPage(0)
  }

  // ── Paginated Records ────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const paginatedEvents = useMemo(() => {
    const start = page * pageSize
    return filteredEvents.slice(start, start + pageSize)
  }, [filteredEvents, page, pageSize])

  // ── Copy Helper ──────────────────────────────────────────────────────
  const handleCopy = async (text: string, label: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedKey(key)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  // ── Export CSV Helper ────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      notifications.showWarning("No audit records to export.")
      return
    }

    const headers = [
      "S.No",
      "Decision",
      "Event ID",
      "Transaction ID",
      "Donor Name",
      "Donor Email",
      "Amount",
      "Currency",
      "Gateway",
      "Reviewer Email",
      "Review Notes",
      "Decision Timestamp",
    ]

    const rows = filteredEvents.map((e, index) => {
      const isApprove = e.event_type === "review_approved"
      const payload = e.raw_payload || {}
      return [
        index + 1,
        isApprove ? "Approved" : "Rejected",
        `"${e.event_id || ""}"`,
        `"${e.donation_id || ""}"`,
        `"${(e.donations?.donor_name || "Anonymous").replace(/"/g, '""')}"`,
        `"${(e.donations?.donor_email || "").replace(/"/g, '""')}"`,
        e.donations?.amount ?? 0,
        e.donations?.currency || "NPR",
        e.donations?.provider || e.provider || "N/A",
        `"${(payload.admin_email || "Unknown").replace(/"/g, '""')}"`,
        `"${(payload.notes || "").replace(/"/g, '""')}"`,
        `"${e.created_at}"`,
      ].join(",")
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `donation-audit-trail-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notifications.showSuccess(`Exported ${filteredEvents.length} audit records to CSV`)
  }

  // ── Provider Badge Helper ────────────────────────────────────────────
  const getProviderBadge = (provider: string | null | undefined) => {
    const p = (provider || "").toLowerCase()
    if (p === "stripe") {
      return (
        <Badge variant="outline" className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", styles.badgeStripe)}>
          <CreditCard className="size-3" /> Stripe
        </Badge>
      )
    }
    if (p === "khalti") {
      return (
        <Badge variant="outline" className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", styles.badgeKhalti)}>
          <Building className="size-3" /> Khalti
        </Badge>
      )
    }
    if (p === "esewa") {
      return (
        <Badge variant="outline" className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", styles.badgeEsewa)}>
          <Building className="size-3" /> eSewa
        </Badge>
      )
    }
    if (p === "bank" || p === "bank_transfer") {
      return (
        <Badge variant="outline" className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", styles.badgeBank)}>
          <Building className="size-3" /> Bank
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-[11px] font-medium gap-1 px-2 py-0.5">
        {provider || "Manual"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Metric Strip (4 Cards) ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Decisions */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Decisions
              </span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {stats.total}
              </span>
              <span className="text-xs text-muted-foreground">logged reviews</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Immutable staff audit trail</p>
          </CardContent>
        </Card>

        {/* Approvals */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Approved Actions
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.approved}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ({stats.approvalRate}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Authorized & confirmed</p>
          </CardContent>
        </Card>

        {/* Rejections */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rejected Actions
              </span>
              <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <UserX className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                {stats.rejected}
              </span>
              <span className="text-xs text-muted-foreground">
                ({100 - stats.approvalRate}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Declined & notified</p>
          </CardContent>
        </Card>

        {/* Total Audited Volume */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Audited Volume
              </span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {formatCurrency(stats.totalVolume, "NPR", { showCode: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative audited transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Decision Switcher Rail with Ocean Blue Shimmer ──────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/70">
        <button
          type="button"
          onClick={() => handleDecisionFilter("all")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            decisionFilter === "all"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <FileText className="size-4 shrink-0" />
          <span>All Decisions</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              decisionFilter === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleDecisionFilter("approved")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            decisionFilter === "approved"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Approved</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              decisionFilter === "approved"
                ? "bg-white/20 text-white"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            )}
          >
            {stats.approved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleDecisionFilter("rejected")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            decisionFilter === "rejected"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <XCircle className="size-4 shrink-0 text-rose-500" />
          <span>Rejected</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              decisionFilter === "rejected"
                ? "bg-white/20 text-white"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
            )}
          >
            {stats.rejected}
          </span>
        </button>
      </div>

      {/* ── Toolbar: Search, View Mode, Export, Page Size ───────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by donor, email, reviewer, notes, ID..."
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-muted/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active search indicator / reset */}
          {(search || decisionFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setDecisionFilter("all")
                setPage(0)
              }}
              className="h-9 text-xs px-2 text-muted-foreground"
            >
              <RotateCcw className="size-3 mr-1" /> Reset
            </Button>
          )}

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(0)
              }}
              className="h-9 text-xs rounded-lg border border-border bg-background px-2 py-1 font-medium focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-border/70 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Bento Card View"
              className={cn(
                "p-1.5 rounded-md transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* Export to CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs gap-1.5 font-medium shadow-2xs"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── Content View: Table vs Bento Cards ─────────────────────── */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <FileText className="size-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-bold text-foreground">No Audit Records Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {search || decisionFilter !== "all"
                ? "No audit records match your current search query or decision filter."
                : "No donation review decisions have been logged yet."}
            </p>
            {(search || decisionFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setDecisionFilter("all")
                  setPage(0)
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ───────────────────────────────────────────── */
        <Card className="border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[60px] text-center font-semibold">S.No</TableHead>
                    <TableHead className="w-[120px] font-semibold">Decision</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Donor Details</TableHead>
                    <TableHead className="w-[140px] font-semibold">Amount</TableHead>
                    <TableHead className="w-[110px] font-semibold">Gateway</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Admin / Reviewer</TableHead>
                    <TableHead className="min-w-[200px] font-semibold">Audit Notes</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvents.map((event, idx) => {
                    const sno = page * pageSize + idx + 1
                    const donation = event.donations
                    const payload = event.raw_payload || {}
                    const isApproved = event.event_type === "review_approved"
                    const relativeDate = formatRelativeTime(event.created_at)
                    const absoluteDate = formatAbsoluteTime(event.created_at)

                    return (
                      <TableRow
                        key={event.id}
                        onClick={() => {
                          if (donation?.id) {
                            startTransition(() => {
                              router.push(`/admin/donations/${donation.id}`)
                            })
                          } else {
                            setSelectedEvent(event)
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors group",
                          idx % 2 === 0 ? "bg-transparent hover:bg-muted/30" : "bg-muted/10 hover:bg-muted/30"
                        )}
                      >
                        {/* S.No */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {sno}
                        </TableCell>

                        {/* Decision */}
                        <TableCell>
                          <Badge
                            variant={isApproved ? "default" : "destructive"}
                            className={cn(
                              "text-xs font-semibold gap-1 px-2.5 py-0.5",
                              isApproved
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-rose-600 hover:bg-rose-700 text-white"
                            )}
                          >
                            {isApproved ? (
                              <>
                                <CheckCircle2 className="size-3.5" />
                                <span>Approved</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="size-3.5" />
                                <span>Rejected</span>
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        {/* Donor Details */}
                        <TableCell>
                          {donation ? (
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {(donation.donor_name || "?")
                                  .split(" ")
                                  .map((w: string) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                  {donation.donor_name || "Anonymous Donor"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {donation.donor_email || "No email"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Donation #{event.donation_id.slice(0, 8)}</span>
                          )}
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          {donation ? (
                            <span className="font-bold text-sm text-foreground tabular-nums">
                              {formatCurrency(donation.amount, donation.currency, {
                                showCode: true,
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Gateway */}
                        <TableCell>
                          {getProviderBadge(donation?.provider || event.provider)}
                        </TableCell>

                        {/* Reviewer / Admin */}
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <p className="font-medium text-foreground truncate max-w-[170px]" title={payload.admin_email}>
                              {payload.admin_email || "System Admin"}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="size-3" />
                              <span title={absoluteDate || undefined} className="cursor-help">
                                {relativeDate || "—"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Notes */}
                        <TableCell>
                          <p
                            className="text-xs text-muted-foreground max-w-[220px] truncate"
                            title={payload.notes}
                          >
                            {payload.notes || "No notes recorded"}
                          </p>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {donation?.id && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/donations/${donation.id}`)}
                                >
                                  <ExternalLink className="size-3.5 mr-2" />
                                  <span>View Transaction</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEvent(event)
                                }}
                              >
                                <Eye className="size-3.5 mr-2" />
                                <span>Audit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleCopy(event.donation_id, "Donation ID", `id-${event.id}`, e)
                                }
                              >
                                {copiedKey === `id-${event.id}` ? (
                                  <Check className="size-3.5 mr-2 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3.5 mr-2" />
                                )}
                                <span>Copy Donation ID</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ── BENTO CARD VIEW (Mobile & Grid) ────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEvents.map((event, idx) => {
            const sno = page * pageSize + idx + 1
            const donation = event.donations
            const payload = event.raw_payload || {}
            const isApproved = event.event_type === "review_approved"
            const relativeDate = formatRelativeTime(event.created_at)

            return (
              <div
                key={event.id}
                onClick={() => {
                  if (donation?.id) {
                    startTransition(() => {
                      router.push(`/admin/donations/${donation.id}`)
                    })
                  } else {
                    setSelectedEvent(event)
                  }
                }}
                className={cn(
                  styles.donationBentoCard,
                  "p-5 rounded-2xl border border-border/70 bg-card cursor-pointer flex flex-col justify-between gap-4"
                )}
              >
                {/* Header: S.No + Decision Badge + Timestamp */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      S.No {sno}
                    </span>
                    <Badge
                      variant={isApproved ? "default" : "destructive"}
                      className={cn(
                        "text-[11px] font-semibold gap-1 px-2 py-0.5",
                        isApproved
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-rose-600 hover:bg-rose-700 text-white"
                      )}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3" />
                          <span>Rejected</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{relativeDate || "—"}</span>
                  </div>
                </div>

                {/* Donor & Amount */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {((donation?.donor_name) || "?")
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {donation?.donor_name || "Anonymous Donor"}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {donation?.donor_email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                        Audited Amount
                      </span>
                      <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                        {donation ? formatCurrency(donation.amount, donation.currency, { showCode: true }) : "N/A"}
                      </span>
                    </div>
                    <div>{getProviderBadge(donation?.provider || event.provider)}</div>
                  </div>
                </div>

                {/* Reviewer & Notes box */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-medium text-foreground">{payload.admin_email || "System Admin"}</span>
                    <span className="text-[10px]">Reviewer</span>
                  </div>
                  <p className="text-muted-foreground italic line-clamp-2">
                    &ldquo;{payload.notes || "No notes recorded"}&rdquo;
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <Eye className="size-3.5" />
                    <span>Details</span>
                  </Button>
                  {donation?.id && (
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs h-8 gap-1 bg-primary text-primary-foreground"
                    >
                      <Link href={`/admin/donations/${donation.id}`}>
                        <span>Transaction</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination Footer ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{page * pageSize + 1}</span> to{" "}
            <span className="font-medium text-foreground">
              {Math.min((page + 1) * pageSize, filteredEvents.length)}
            </span>{" "}
            of <span className="font-medium text-foreground">{filteredEvents.length}</span> audit records
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 text-xs gap-1 shadow-2xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </Button>

            <span className="text-xs font-semibold px-2 text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 text-xs gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Audit Detail Modal ─────────────────────────────────────── */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={selectedEvent.event_type === "review_approved" ? "default" : "destructive"}
                  className={cn(
                    "text-xs font-semibold gap-1 px-2.5 py-0.5",
                    selectedEvent.event_type === "review_approved"
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  )}
                >
                  {selectedEvent.event_type === "review_approved" ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Review Approved</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3.5" />
                      <span>Review Rejected</span>
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatAbsoluteTime(selectedEvent.created_at)}
                </span>
              </div>
              <DialogTitle className="text-xl">Audit Record Inspection</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verified review action details logged by finance management staff.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              {/* Reviewer Section */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">
                    Authorizing Staff
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Admin ID: {selectedEvent.raw_payload?.admin_id?.slice(0, 12) || "system"}
                  </span>
                </div>
                <div className="font-semibold text-foreground">
                  {selectedEvent.raw_payload?.admin_email || "System Admin"}
                </div>
              </div>

              {/* Audit Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Staff Decision Notes
                </label>
                <div className="p-4 rounded-xl bg-card border border-border/80 text-foreground italic text-sm leading-relaxed">
                  &ldquo;{selectedEvent.raw_payload?.notes || "No notes were provided for this action."}&rdquo;
                </div>
              </div>

              {/* Associated Donation Record */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Associated Donation Details
                </label>
                {selectedEvent.donations ? (
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Donor Name</span>
                      <span className="font-semibold text-foreground">
                        {selectedEvent.donations.donor_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Donor Email</span>
                      <span className="font-semibold text-foreground truncate block">
                        {selectedEvent.donations.donor_email}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Amount & Currency</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(
                          selectedEvent.donations.amount,
                          selectedEvent.donations.currency,
                          { showCode: true }
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Payment Gateway</span>
                      <div className="mt-0.5">
                        {getProviderBadge(selectedEvent.donations.provider || selectedEvent.provider)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
                    Donation record #{selectedEvent.donation_id}
                  </div>
                )}
              </div>

              {/* Event Identifiers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">Event ID</span>
                  <button
                    type="button"
                    onClick={(e) =>
                      handleCopy(selectedEvent.event_id, "Event ID", "modal-event-id", e)
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                  >
                    {copiedKey === "modal-event-id" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{selectedEvent.event_id}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">Donation ID</span>
                  <button
                    type="button"
                    onClick={(e) =>
                      handleCopy(selectedEvent.donation_id, "Donation ID", "modal-donation-id", e)
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                  >
                    {copiedKey === "modal-donation-id" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{selectedEvent.donation_id}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Raw JSON Payload */}
              <div className="border-t border-border/70 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="size-3.5" />
                    <span>Raw Event Payload</span>
                  </span>
                  {showRawPayload ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                {showRawPayload && (
                  <pre className="mt-2 p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground overflow-x-auto max-h-48">
                    {JSON.stringify(selectedEvent.raw_payload, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            {/* Dialog Footer - Side by side on mobile */}
            <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 sm:flex-none text-xs"
              >
                Close
              </Button>
              {selectedEvent.donations?.id && (
                <Button
                  asChild
                  className="flex-1 sm:flex-none text-xs bg-primary text-primary-foreground gap-1.5"
                >
                  <Link href={`/admin/donations/${selectedEvent.donations.id}`}>
                    <span>Open Transaction</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
