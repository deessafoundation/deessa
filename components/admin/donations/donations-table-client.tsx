"use client"

import { useState, useCallback, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Search,
  X,
  DollarSign,
  HandHeart,
  AlertCircle,
  Clock,
  MoreVertical,
  RotateCcw,
  Download,
  Copy,
  Check,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Layers,
  Repeat,
  Building,
  CreditCard,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Donation = Record<string, any>

interface DonationStats {
  totals: Record<string, number>
  totalDonors: number
  monthlyDonors: number
  pendingCount: number
  failedCount: number
}

interface DonationsDashboardProps {
  initialDonations: Donation[]
  initialTotal: number
  initialStats: DonationStats
  pageSize?: number
}

export type ScopeFilter = "all" | "completed" | "pending" | "monthly" | "failed"

interface Filters {
  scope: ScopeFilter
  status: string
  type: string
  currency: string
  provider: string
  search: string
}

const DEFAULT_FILTERS: Filters = {
  scope: "all",
  status: "all",
  type: "all",
  currency: "all",
  provider: "all",
  search: "",
}

// ─── Status badge styling ──────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: <Clock className="h-3 w-3 animate-pulse" />,
  },
  review: {
    label: "Review Required",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
}

function buildQueryString(filters: Filters, page: number, limit: number) {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.type !== "all") params.set("type", filters.type)
  if (filters.currency !== "all") params.set("currency", filters.currency)
  if (filters.provider !== "all") params.set("provider", filters.provider)
  if (filters.search.trim()) params.set("search", filters.search.trim())
  return params.toString()
}

// ─── Provider Badge Helper ──────────────────────────────────────────────
function getProviderBadge(provider?: string | null) {
  const p = (provider || "other").toLowerCase()
  if (p === "stripe") {
    return {
      label: "Stripe",
      className: styles.badgeStripe,
      icon: <CreditCard className="size-3" />,
    }
  }
  if (p === "khalti") {
    return {
      label: "Khalti",
      className: styles.badgeKhalti,
      icon: <CreditCard className="size-3" />,
    }
  }
  if (p === "esewa") {
    return {
      label: "eSewa",
      className: styles.badgeEsewa,
      icon: <CreditCard className="size-3" />,
    }
  }
  if (p === "bank") {
    return {
      label: "Bank Transfer",
      className: styles.badgeBank,
      icon: <Building className="size-3" />,
    }
  }
  return {
    label: p.toUpperCase(),
    className: "bg-muted text-muted-foreground border-border",
    icon: <CreditCard className="size-3" />,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export function DonationsDashboard({
  initialDonations,
  initialTotal,
  initialStats,
  pageSize = 25,
}: DonationsDashboardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [total, setTotal] = useState(initialTotal)
  const [stats, setStats] = useState<DonationStats>(initialStats)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasMore = donations.length < total
  const hasActiveFilters =
    filters.scope !== "all" ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.currency !== "all" ||
    filters.provider !== "all" ||
    filters.search.trim() !== ""

  // ─── Fetch with filters (resets list) ─────────────────────────────
  const fetchFiltered = useCallback(
    async (newFilters: Filters) => {
      setFiltersLoading(true)
      try {
        const qs = buildQueryString(newFilters, 0, pageSize)
        const res = await fetch(`/api/admin/donations?${qs}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setDonations(data.donations || [])
        setTotal(data.total || 0)
        setStats(data.stats || initialStats)
        setPage(0)
      } catch (err) {
        console.error("Filter fetch error:", err)
        notifications.showError({
          title: "Fetch Error",
          description: "Could not load filtered donation records.",
        })
      } finally {
        setFiltersLoading(false)
      }
    },
    [pageSize, initialStats]
  )

  // ─── Load more (appends) ──────────────────────────────────────────
  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const qs = buildQueryString(filters, nextPage, pageSize)
      const res = await fetch(`/api/admin/donations?${qs}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDonations((prev) => [...prev, ...(data.donations || [])])
      setTotal(data.total)
      setStats(data.stats)
      setPage(nextPage)
    } catch (err) {
      console.error("Load more error:", err)
      notifications.showError({
        title: "Load Error",
        description: "Failed to load additional records.",
      })
    } finally {
      setLoading(false)
    }
  }, [page, filters, pageSize])

  // ─── Scope tab selector ───────────────────────────────────────────
  function handleScopeChange(newScope: ScopeFilter) {
    let nextStatus = "all"
    let nextType = "all"

    if (newScope === "completed") {
      nextStatus = "completed"
    } else if (newScope === "pending") {
      nextStatus = "pending"
    } else if (newScope === "monthly") {
      nextType = "monthly"
      nextStatus = "completed"
    } else if (newScope === "failed") {
      nextStatus = "failed"
    }

    const next: Filters = {
      ...filters,
      scope: newScope,
      status: nextStatus,
      type: nextType,
    }

    setFilters(next)
    fetchFiltered(next)
  }

  // ─── Filter handlers ──────────────────────────────────────────────
  function updateFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value }
    // If user changes status or type directly, set scope to all or corresponding
    if (key === "status" && value !== "all") {
      next.scope = value === "completed" ? "completed" : value === "pending" ? "pending" : value === "failed" ? "failed" : "all"
    }
    if (key === "type" && value === "monthly") {
      next.scope = "monthly"
    }

    setFilters(next)
    if (key !== "search") {
      fetchFiltered(next)
    }
  }

  // Debounced search
  function handleSearchChange(value: string) {
    setFilters((f) => ({ ...f, search: value }))
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      fetchFiltered({ ...filters, search: value })
    }, 350)
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    fetchFiltered(DEFAULT_FILTERS)
  }

  // ─── Copy to Clipboard ────────────────────────────────────────────
  async function handleCopy(text: string, label: string) {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedId(text)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // ─── Export handler ──────────────────────────────────────────────
  async function handleExport() {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== "all") params.set("status", filters.status)
      if (filters.type !== "all") params.set("type", filters.type)
      if (filters.currency !== "all") params.set("currency", filters.currency)
      if (filters.provider !== "all") params.set("provider", filters.provider)
      if (filters.search.trim()) params.set("search", filters.search.trim())

      const res = await fetch(`/api/admin/donations/export?${params.toString()}`)
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `donations-export-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notifications.showSuccess(
        `${total} donation record${total === 1 ? "" : "s"} exported to Excel.`
      )
    } catch (err) {
      console.error("Export error:", err)
      notifications.showError({
        title: "Export Failed",
        description: "Could not export donations. Please try again.",
      })
    } finally {
      setExporting(false)
    }
  }

  // Multi-currency calculation
  const currencyKeys = Object.keys(stats.totals || {})
  const primaryCurrency = currencyKeys.includes("NPR")
    ? "NPR"
    : currencyKeys[0] || "NPR"
  const primaryTotal = stats.totals?.[primaryCurrency] || 0
  const otherCurrencies = currencyKeys.filter((c) => c !== primaryCurrency && (stats.totals?.[c] || 0) > 0)

  return (
    <div className="space-y-6">
      {/* ── KPI Metric Strip (4 Cards) ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Collected
              </span>
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {formatCurrency(primaryTotal, primaryCurrency, { showCode: true })}
              </div>
              {otherCurrencies.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  {otherCurrencies.slice(0, 2).map((c) => (
                    <span key={c} className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                      +{formatCurrency(stats.totals[c], c, { showCode: true })}
                    </span>
                  ))}
                  {otherCurrencies.length > 2 && (
                    <span className="text-[10px]">+{otherCurrencies.length - 2} more</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">verified contributions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verified Donors */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Verified Donors
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.totalDonors}
              </span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                {total > 0 ? Math.round((stats.totalDonors / total) * 100) : 0}% success
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">completed transactions</p>
          </CardContent>
        </Card>

        {/* Monthly Recurring Donors */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Donors
              </span>
              <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Repeat className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                {stats.monthlyDonors}
              </span>
              <span className="text-xs text-muted-foreground">active subscriptions</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">recurring monthly impact</p>
          </CardContent>
        </Card>

        {/* Needs Verification */}
        <Card
          onClick={() => handleScopeChange("pending")}
          className={cn(
            styles.kpiCard,
            "border-border/70 shadow-xs cursor-pointer hover:border-amber-500/40"
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Needs Verification
              </span>
              <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {stats.pendingCount}
              </span>
              <span className="text-xs text-muted-foreground">pending bank / queue</span>
            </div>
            <p className="text-xs text-primary font-medium mt-1 hover:underline">
              Click to view pending items →
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Scope Switcher Rail with Ocean Blue Shimmer ────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/70">
        <button
          type="button"
          onClick={() => handleScopeChange("all")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            filters.scope === "all"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Layers className="size-4 shrink-0" />
          <span>All Donations</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              filters.scope === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleScopeChange("completed")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            filters.scope === "completed"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Completed</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              filters.scope === "completed" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {stats.totalDonors}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleScopeChange("pending")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            filters.scope === "pending"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Clock className="size-4 shrink-0" />
          <span>Needs Verification</span>
          {stats.pendingCount > 0 && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                filters.scope === "pending" ? "bg-white text-primary" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              )}
            >
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleScopeChange("monthly")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            filters.scope === "monthly"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <Repeat className="size-4 shrink-0" />
          <span>Monthly Recurring</span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
              filters.scope === "monthly" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {stats.monthlyDonors}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleScopeChange("failed")}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            filters.scope === "failed"
              ? cn(styles.oceanShimmerTab, "bg-primary text-primary-foreground shadow-xs")
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          )}
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>Failed</span>
          {stats.failedCount > 0 && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                filters.scope === "failed" ? "bg-white text-destructive" : "bg-red-500/20 text-red-600"
              )}
            >
              {stats.failedCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search, Filters & Export Toolbar ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by donor, email, or receipt #..."
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

        {/* Right Controls: Filters, Views, Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gateway / Provider Filter */}
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

          {/* Currency Filter */}
          <Select
            value={filters.currency}
            onValueChange={(val) => updateFilter("currency", val)}
          >
            <SelectTrigger className="h-9 text-xs w-[115px] bg-muted/30">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Currencies</SelectItem>
              <SelectItem value="NPR">NPR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
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

          {/* Export to Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="h-9 text-xs gap-1.5 font-medium shadow-2xs"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* ── Main Content Area: Table vs Bento Cards ────────────────── */}
      {filtersLoading ? (
        <Card className="border border-border/70">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">Loading donation records…</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fetching latest verified entries</p>
          </CardContent>
        </Card>
      ) : donations.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <HandHeart className="size-7" />
            </div>
            <h3 className="text-lg font-bold">No Donations Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
              {hasActiveFilters
                ? "No donation records matched your active filters. Try clearing your search or switching categories."
                : "No donation records have been registered in the system yet."}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <RotateCcw className="size-4" />
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ─────────────────────────────────────────────── */
        <Card className="border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px] text-center font-semibold">S.No</TableHead>
                  <TableHead className="font-semibold">Donor Details</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Gateway</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation, idx) => {
                  const sc = statusConfig[donation.payment_status] || statusConfig.pending
                  const provBadge = getProviderBadge(donation.provider)
                  const relativeDate = formatRelativeTime(donation.created_at)
                  const absoluteDate = formatAbsoluteTime(donation.created_at)

                  return (
                    <TableRow
                      key={donation.id}
                      onClick={() => {
                        startTransition(() => {
                          router.push(`/admin/donations/${donation.id}`)
                        })
                      }}
                      className={cn(
                        "cursor-pointer transition-colors group",
                        idx % 2 === 0 ? "bg-transparent hover:bg-muted/30" : "bg-muted/10 hover:bg-muted/30"
                      )}
                    >
                      {/* S.No */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      {/* Donor */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
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
                              {donation.donor_email || "No email provided"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight tabular-nums text-foreground">
                            {formatCurrency(donation.amount, donation.currency, { showCode: true })}
                          </span>
                          {donation.receipt_number && (
                            <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">
                              #{donation.receipt_number}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Gateway / Provider */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Badge
                          variant="outline"
                          className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", provBadge.className)}
                        >
                          {provBadge.icon}
                          <span>{provBadge.label}</span>
                        </Badge>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          variant={donation.is_monthly ? "default" : "secondary"}
                          className={cn(
                            "text-[10px] font-medium gap-1",
                            donation.is_monthly
                              ? "bg-primary/15 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {donation.is_monthly && <Repeat className="size-2.5" />}
                          {donation.is_monthly ? "Monthly" : "One-time"}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-[11px] font-medium gap-1 px-2 py-0.5", sc.className)}
                        >
                          {sc.icon}
                          <span>{sc.label}</span>
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="text-xs">
                          <span title={absoluteDate || undefined} className="cursor-help font-medium">
                            {relativeDate || "—"}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </span>
                        </div>
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
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/donations/${donation.id}`)}
                            >
                              <Eye className="size-4 mr-2 text-primary" />
                              <span>View Full Transaction</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCopy(donation.id, "Transaction ID")}
                            >
                              {copiedId === donation.id ? (
                                <Check className="size-4 mr-2 text-green-600" />
                              ) : (
                                <Copy className="size-4 mr-2" />
                              )}
                              <span>Copy Transaction ID</span>
                            </DropdownMenuItem>
                            {donation.receipt_number && (
                              <DropdownMenuItem
                                onClick={() => handleCopy(donation.receipt_number, "Receipt #")}
                              >
                                <Copy className="size-4 mr-2" />
                                <span>Copy Receipt Number</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => router.push("/verify")}
                            >
                              <ShieldCheck className="size-4 mr-2" />
                              <span>Verify Receipt</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* ── BENTO CARD VIEW (Mobile & Grid) ────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donations.map((donation) => {
            const sc = statusConfig[donation.payment_status] || statusConfig.pending
            const provBadge = getProviderBadge(donation.provider)
            const relativeDate = formatRelativeTime(donation.created_at)

            return (
              <div
                key={donation.id}
                onClick={() => router.push(`/admin/donations/${donation.id}`)}
                className={cn(
                  styles.donationBentoCard,
                  "p-5 rounded-2xl border border-border/70 bg-card cursor-pointer flex flex-col justify-between"
                )}
              >
                {/* Header: Donor & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(donation.donor_name || "?")
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {donation.donor_name || "Anonymous Donor"}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {donation.donor_email || "No email"}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-medium shrink-0 gap-1 px-2 py-0.5", sc.className)}
                  >
                    {sc.icon}
                    <span>{sc.label}</span>
                  </Badge>
                </div>

                {/* Amount & Gateway */}
                <div className="my-4 space-y-2">
                  <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {formatCurrency(donation.amount, donation.currency, { showCode: true })}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-medium gap-1 px-2 py-0.5", provBadge.className)}
                    >
                      {provBadge.icon}
                      <span>{provBadge.label}</span>
                    </Badge>

                    <Badge
                      variant={donation.is_monthly ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] font-medium gap-1",
                        donation.is_monthly
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {donation.is_monthly && <Repeat className="size-2.5" />}
                      {donation.is_monthly ? "Monthly" : "One-time"}
                    </Badge>
                  </div>
                </div>

                {/* Footer: Date & Actions */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{relativeDate || "Recently"}</span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/donations/${donation.id}`)}
                      className="h-8 px-2.5 text-xs text-primary font-medium"
                    >
                      View Details →
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination / Load More ─────────────────────────────────── */}
      {hasMore && (
        <div className="flex flex-col items-center gap-2 pt-2 pb-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="px-6 h-10 shadow-2xs font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>Load More Donations</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            Showing {donations.length} of {total} donation records
          </span>
        </div>
      )}
    </div>
  )
}
