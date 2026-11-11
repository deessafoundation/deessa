"use client"

import { useState, useCallback, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  X,
  RotateCcw,
  Table as TableIcon,
  LayoutGrid,
  MoreVertical,
  Eye,
  Copy,
  Check,
  Loader2,
  Archive,
  ArchiveRestore,
  Filter,
  Heart,
  CalendarDays,
  Users,
  Building2,
  FileText,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { UnifiedPaymentRecord, PaymentStats } from "@/lib/data/payments"
import { archivePayment, unarchivePayment } from "@/lib/actions/archive-payment"
import styles from "./payments.module.css"

interface PaymentsDashboardProps {
  initialPayments: UnifiedPaymentRecord[]
  initialTotal: number
  initialStats: PaymentStats
  pageSize?: number
}

interface Filters {
  status: string
  type: string
  provider: string
  search: string
  showArchived: boolean
}

const DEFAULT_FILTERS: Filters = {
  status: "all",
  type: "all",
  provider: "all",
  search: "",
  showArchived: false,
}

// ── Status Configuration ───────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  review: {
    label: "In Review",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
}

function getProviderBadge(provider: string | null) {
  const p = (provider || "unknown").toLowerCase()
  switch (p) {
    case "stripe":
      return { label: "Stripe", className: styles.badgeStripe }
    case "khalti":
      return { label: "Khalti", className: styles.badgeKhalti }
    case "esewa":
      return { label: "eSewa", className: styles.badgeEsewa }
    case "bank":
      return { label: "Bank Transfer", className: styles.badgeBank }
    default:
      return { label: provider || "Manual / Other", className: "bg-muted text-muted-foreground border-border" }
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "donation":
      return { label: "Donation", icon: Heart, className: styles.badgeDonation }
    case "event":
      return { label: "Event", icon: CalendarDays, className: styles.badgeEvent }
    case "conference":
      return { label: "Conference", icon: Users, className: styles.badgeConference }
    default:
      return { label: type, icon: CreditCard, className: "bg-muted text-muted-foreground" }
  }
}

function formatRelativeTime(dateStr: string) {
  try {
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diffSec < 60) return "just now"
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

export function PaymentsDashboard({
  initialPayments,
  initialTotal,
  initialStats,
  pageSize = 25,
}: PaymentsDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [payments, setPayments] = useState<UnifiedPaymentRecord[]>(initialPayments)
  const [total, setTotal] = useState(initialTotal)
  const [stats, setStats] = useState<PaymentStats>(initialStats)
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkLoading, setBulkLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)

  const hasMore = payments.length < total
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.provider !== "all" ||
    filters.search.trim() !== "" ||
    filters.showArchived

  const selectedCount = Object.keys(selected).length

  // Build query string for API requests
  const buildQuery = (f: Filters, p: number, l: number) => {
    const params = new URLSearchParams()
    params.set("page", String(p))
    params.set("limit", String(l))
    if (f.status !== "all") params.set("status", f.status)
    if (f.type !== "all") params.set("type", f.type)
    if (f.provider !== "all") params.set("provider", f.provider)
    if (f.search.trim()) params.set("search", f.search.trim())
    if (f.showArchived) params.set("showArchived", "true")
    return params.toString()
  }

  // Fetch with active filters
  const fetchFiltered = useCallback(
    async (newFilters: Filters) => {
      setFiltersLoading(true)
      setSelected({})
      try {
        const qs = buildQuery(newFilters, 0, pageSize)
        const res = await fetch(`/api/admin/payments?${qs}`)
        if (!res.ok) throw new Error("Failed to fetch payments")
        const data = await res.json()
        setPayments(data.payments || [])
        setTotal(data.total || 0)
        if (data.stats) setStats(data.stats)
        setPage(0)
      } catch (err) {
        console.error("Payment filter fetch error:", err)
        notifications.showError({ description: "Failed to reload payment records" })
      } finally {
        setFiltersLoading(false)
      }
    },
    [pageSize]
  )

  // Load More (Pagination)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const qs = buildQuery(filters, nextPage, pageSize)
      const res = await fetch(`/api/admin/payments?${qs}`)
      if (!res.ok) throw new Error("Failed to load more payments")
      const data = await res.json()
      setPayments((prev) => [...prev, ...(data.payments || [])])
      setTotal(data.total || 0)
      setPage(nextPage)
    } catch (err) {
      console.error("Load more payments error:", err)
      notifications.showError({ description: "Failed to load additional records" })
    } finally {
      setLoadingMore(false)
    }
  }

  // Filter updates
  function updateFilter(key: keyof Filters, value: any) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (key !== "search") {
      fetchFiltered(next)
    }
  }

  function handleSearchChange(val: string) {
    setFilters((prev) => ({ ...prev, search: val }))
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      fetchFiltered({ ...filters, search: val })
    }, 350)
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    fetchFiltered(DEFAULT_FILTERS)
  }

  function handleScopeTab(scopeStatus: string) {
    const next = {
      ...filters,
      status: scopeStatus,
      showArchived: scopeStatus === "archived",
    }
    setFilters(next)
    fetchFiltered(next)
  }

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    notifications.showSuccess({ description: `${label} copied to clipboard.` })
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Selection
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const allSelected = payments.length > 0 && payments.every((p) => prev[`${p.type}-${p.id}`])
      if (allSelected) return {}
      const next: Record<string, boolean> = {}
      for (const p of payments) next[`${p.type}-${p.id}`] = true
      return next
    })
  }

  // Single archive / unarchive
  const handleToggleArchive = async (payment: UnifiedPaymentRecord) => {
    try {
      if (payment.archived_at) {
        const res = await unarchivePayment(payment.id, payment.type)
        if (!res.success) throw new Error(res.error)
        notifications.showSuccess({ description: "Record restored from archive." })
      } else {
        const res = await archivePayment(payment.id, payment.type)
        if (!res.success) throw new Error(res.error)
        notifications.showSuccess({ description: "Record moved to archive." })
      }
      fetchFiltered(filters)
    } catch (err: any) {
      notifications.showError({ description: err.message || "Failed to update archive status" })
    }
  }

  // Bulk Archive
  const handleBulkArchive = async () => {
    const keys = Object.keys(selected)
    if (keys.length === 0) return
    setBulkLoading(true)
    try {
      const items = keys.map((key) => {
        const [type, ...idParts] = key.split("-")
        return { type: type as "donation" | "event" | "conference", id: idParts.join("-") }
      })
      const { bulkArchivePayments } = await import("@/lib/actions/archive-payment")
      const result = await bulkArchivePayments(items)
      if (result.error) {
        notifications.showError({ description: result.error })
      } else {
        notifications.showSuccess({
          description: `${result.archived} record${result.archived === 1 ? "" : "s"} archived.`,
        })
        setSelected({})
        fetchFiltered(filters)
      }
    } catch {
      notifications.showError({ description: "Failed to archive records" })
    } finally {
      setBulkLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  // KPI calculations
  const totalSettledCount = (stats.byStatus?.paid || 0)
  const totalPendingCount = (stats.byStatus?.pending || 0)
  const totalReviewCount = (stats.byStatus?.review || 0)
  const totalFailedCount = (stats.byStatus?.failed || 0)
  const successRate = total > 0 ? Math.round((totalSettledCount / total) * 100) : 100

  return (
    <div className="space-y-6">
      {/* ── 1. KPI Shimmer Metric Strip ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Settled Volume */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Settled Volume
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {formatCurrency(stats.totalAmount || 0, "NPR", { showCode: true })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {totalSettledCount}
                </span>{" "}
                completed transaction{totalSettledCount === 1 ? "" : "s"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Source Breakdown */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                All Sources
              </span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="size-4" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {total}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium flex-wrap">
                <span className="text-pink-600 dark:text-pink-400">{stats.byType?.donation || 0} Don</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">{stats.byType?.event || 0} Evt</span>
                <span>•</span>
                <span className="text-purple-600 dark:text-purple-400">{stats.byType?.conference || 0} Conf</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending & Verification */}
        <Card
          onClick={() => handleScopeTab("pending")}
          className={cn(
            styles.kpiCard,
            "border-border/70 shadow-xs cursor-pointer hover:border-amber-500/40"
          )}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Settlement
              </span>
              <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {totalPendingCount + totalReviewCount}
              </span>
              {totalReviewCount > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  {totalReviewCount} in review
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">awaiting gateway / review</p>
          </CardContent>
        </Card>

        {/* Settlement Health & Failures */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Success Health
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {successRate}%
              </span>
              {totalFailedCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {totalFailedCount} failed
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">gateway settlement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Scope Shimmer Tab Strip ───────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/70 scrollbar-none">
        {[
          { key: "all", label: "All Records", count: total },
          { key: "paid", label: "Settled / Paid", count: totalSettledCount },
          { key: "pending", label: "Pending", count: totalPendingCount },
          { key: "review", label: "Review Queue", count: totalReviewCount },
          { key: "failed", label: "Failed", count: totalFailedCount },
          { key: "archived", label: "Archived", count: null },
        ].map((tab) => {
          const isActive = tab.key === "archived" ? filters.showArchived : !filters.showArchived && filters.status === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleScopeTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 cursor-pointer",
                isActive
                  ? cn(
                      "bg-primary text-primary-foreground shadow-xs",
                      styles.oceanShimmerTab
                    )
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={cn(
                    "text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── 3. Filters & Action Toolbar ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, or transaction ID..."
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-muted/30"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(val) => updateFilter("type", val)}
          >
            <SelectTrigger className="h-9 text-xs w-[130px] bg-muted/30">
              <SelectValue placeholder="Source Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="donation">Donations</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="conference">Conferences</SelectItem>
            </SelectContent>
          </Select>

          {/* Gateway Provider Filter */}
          <Select
            value={filters.provider}
            onValueChange={(val) => updateFilter("provider", val)}
          >
            <SelectTrigger className="h-9 text-xs w-[130px] bg-muted/30">
              <SelectValue placeholder="Gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="khalti">Khalti</SelectItem>
              <SelectItem value="esewa">eSewa</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-xs px-2 text-muted-foreground hover:text-foreground"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Reset
            </Button>
          )}

          {/* Bulk Archive Button */}
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={bulkLoading}
              className="h-9 text-xs font-semibold border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
            >
              {bulkLoading ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Archive className="size-3.5 mr-1.5" />
              )}
              Archive ({selectedCount})
            </Button>
          )}

          {/* View Switcher: Table vs Bento Grid */}
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
        </div>
      </div>

      {/* ── 4. Main Records Presentation ────────────────────────────── */}
      {filtersLoading ? (
        <Card className="border border-border/70">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">Loading payment records…</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fetching aggregated financial entries</p>
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <CreditCard className="size-7" />
            </div>
            <h3 className="text-lg font-bold">No Payments Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
              {hasActiveFilters
                ? "No transaction records matched your active filters. Try adjusting your search query or reset your filters."
                : "No payment transactions have been logged in the system yet."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                <RotateCcw className="size-4" />
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* ── DESKTOP HIGH-DENSITY TABLE (with explicit S.No) ──────── */
        <Card className="border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        checked={payments.length > 0 && payments.every((p) => selected[`${p.type}-${p.id}`])}
                        onChange={toggleSelectAll}
                        className="rounded border-border/80 text-primary focus:ring-primary/30 size-3.5 cursor-pointer"
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-[60px] text-center font-semibold">S.No</TableHead>
                    <TableHead className="font-semibold">Customer / Payer</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Gateway</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, idx) => {
                    const rowKey = `${payment.type}-${payment.id}`
                    const isSelected = !!selected[rowKey]
                    const sc = statusConfig[payment.status.toLowerCase()] || statusConfig.pending
                    const tb = getTypeBadge(payment.type)
                    const pb = getProviderBadge(payment.provider)
                    const TypeIcon = tb.icon

                    return (
                      <TableRow
                        key={rowKey}
                        onClick={() => {
                          startTransition(() => {
                            router.push(`/admin/payments/${payment.id}?type=${payment.type}`)
                          })
                        }}
                        className={cn(
                          "cursor-pointer transition-colors group",
                          payment.archived_at && "opacity-60",
                          isSelected
                            ? "bg-primary/5 hover:bg-primary/10"
                            : idx % 2 === 0
                              ? "bg-transparent hover:bg-muted/30"
                              : "bg-muted/10 hover:bg-muted/30"
                        )}
                      >
                        {/* Checkbox */}
                        <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(rowKey)}
                            className="rounded border-border/80 text-primary focus:ring-primary/30 size-3.5 cursor-pointer"
                          />
                        </TableCell>

                        {/* Explicit S.No column */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground font-semibold">
                          {page * pageSize + idx + 1}
                        </TableCell>

                        {/* Customer / Payer Details */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {(payment.name || "?")
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                  {payment.name}
                                </p>
                                {payment.archived_at && (
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 py-0 px-1">
                                    Archived
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{payment.email}</p>
                              {payment.context && payment.context !== "General Donation" && payment.context !== "Conference" && (
                                <p className="text-[11px] text-muted-foreground/80 truncate">
                                  {payment.context}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Source Type Badge */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", tb.className)}
                          >
                            <TypeIcon className="size-3" />
                            {tb.label}
                          </Badge>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight tabular-nums text-foreground">
                              {payment.amount !== null
                                ? formatCurrency(payment.amount, payment.currency || "NPR", { showCode: true })
                                : "—"}
                            </span>
                            {payment.has_slip && (
                              <span className="text-[10px] font-medium text-primary flex items-center gap-0.5">
                                <FileText className="size-2.5" /> Slip Attached
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Gateway Provider */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Badge
                            variant="outline"
                            className={cn("text-[11px] font-medium px-2 py-0.5", pb.className)}
                          >
                            {pb.label}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-[11px] font-medium gap-1.5 px-2.5 py-0.5", sc.className)}
                          >
                            <span className={cn("size-1.5 rounded-full animate-pulse", sc.dotColor)} />
                            {sc.label}
                          </Badge>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                              {formatRelativeTime(payment.created_at)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        {/* Row Actions Menu */}
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
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/payments/${payment.id}?type=${payment.type}`)}
                              >
                                <Eye className="size-4 mr-2 text-primary" />
                                <span>Inspect Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleCopy(payment.id, "Payment ID")}>
                                {copiedId === payment.id ? (
                                  <Check className="size-4 mr-2 text-emerald-600" />
                                ) : (
                                  <Copy className="size-4 mr-2" />
                                )}
                                <span>Copy ID</span>
                              </DropdownMenuItem>
                              {payment.email && (
                                <DropdownMenuItem onClick={() => handleCopy(payment.email, "Email")}>
                                  <Copy className="size-4 mr-2" />
                                  <span>Copy Payer Email</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleArchive(payment)}>
                                {payment.archived_at ? (
                                  <>
                                    <ArchiveRestore className="size-4 mr-2 text-emerald-600" />
                                    <span>Restore from Archive</span>
                                  </>
                                ) : (
                                  <>
                                    <Archive className="size-4 mr-2 text-amber-600" />
                                    <span>Move to Archive</span>
                                  </>
                                )}
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
        /* ── BENTO CARD VIEW (Mobile & Grid Mode) ───────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {payments.map((payment, idx) => {
            const sc = statusConfig[payment.status.toLowerCase()] || statusConfig.pending
            const tb = getTypeBadge(payment.type)
            const pb = getProviderBadge(payment.provider)
            const TypeIcon = tb.icon

            return (
              <div
                key={`${payment.type}-${payment.id}`}
                onClick={() => router.push(`/admin/payments/${payment.id}?type=${payment.type}`)}
                className={cn(
                  styles.paymentBentoCard,
                  "p-4 sm:p-5 rounded-2xl border border-border/70 bg-card cursor-pointer flex flex-col justify-between shadow-2xs gap-3",
                  payment.archived_at && "opacity-60"
                )}
              >
                {/* Header: S.No + Name + Type Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground font-semibold shrink-0">
                      S.No {page * pageSize + idx + 1}
                    </span>
                    <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(payment.name || "?")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{payment.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{payment.email}</p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-medium shrink-0 gap-1 px-2 py-0.5", tb.className)}
                  >
                    <TypeIcon className="size-3" />
                    {tb.label}
                  </Badge>
                </div>

                {/* Amount, Context & Slip Indicator */}
                <div className="py-2 border-y border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
                      {payment.amount !== null
                        ? formatCurrency(payment.amount, payment.currency || "NPR", { showCode: true })
                        : "—"}
                    </span>
                    {payment.context && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {payment.context}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5", pb.className)}>
                      {pb.label}
                    </Badge>
                    {payment.has_slip && (
                      <span className="text-[10px] font-medium text-primary flex items-center gap-0.5">
                        <FileText className="size-2.5" /> Slip Attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Status, Relative Date & Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-medium gap-1.5 px-2 py-0.5", sc.className)}
                  >
                    <span className={cn("size-1.5 rounded-full animate-pulse", sc.dotColor)} />
                    {sc.label}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(payment.created_at)}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/payments/${payment.id}?type=${payment.type}`)}
                      className="h-7 px-2 text-xs font-medium text-primary gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 5. Pagination Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-semibold text-foreground">{payments.length}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> transactions
          {hasActiveFilters && " (filtered)"}
        </div>

        {hasMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto h-9 font-medium shadow-2xs"
          >
            {loadingMore && <Loader2 className="mr-2 size-3.5 animate-spin" />}
            Load Next {Math.min(pageSize, total - payments.length)} Records
          </Button>
        )}
      </div>
    </div>
  )
}
