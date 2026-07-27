"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FancySelect } from "@/components/ui/fancy-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calendar,
  Loader2,
  Search,
  X,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronDown,
  Filter,
  RotateCcw,
  Heart,
  CalendarDays,
  Users,
  Archive,
  CheckSquare,
  Square,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { notifications } from "@/lib/notifications"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaymentRecord = Record<string, any>

interface PaymentStats {
  totalAmount: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  byProvider: Record<string, number>
}

interface PaymentsDashboardProps {
  initialPayments: PaymentRecord[]
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

const statusConfig: Record<string, { className: string; icon: React.ReactNode }> = {
  paid: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: <DollarSign className="h-3 w-3" />,
  },
  completed: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    icon: <DollarSign className="h-3 w-3" />,
  },
  pending: {
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: <Clock className="h-3 w-3" />,
  },
  unpaid: {
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    icon: <Clock className="h-3 w-3" />,
  },
  failed: {
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  refunded: {
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  review: {
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    icon: <AlertCircle className="h-3 w-3" />,
  },
}

const typeConfig: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
  donation: {
    className: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
    icon: <Heart className="h-3 w-3" />,
    label: "Donation",
  },
  event: {
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    icon: <CalendarDays className="h-3 w-3" />,
    label: "Event",
  },
  conference: {
    className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    icon: <Users className="h-3 w-3" />,
    label: "Conference",
  },
}

function buildQueryString(filters: Filters, page: number, limit: number) {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.type !== "all") params.set("type", filters.type)
  if (filters.provider !== "all") params.set("provider", filters.provider)
  if (filters.search.trim()) params.set("search", filters.search.trim())
  if (filters.showArchived) params.set("showArchived", "true")
  return params.toString()
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: React.ReactNode
  subtitle?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-0 ${color} opacity-[0.04]`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentsDashboard({
  initialPayments,
  initialTotal,
  initialStats,
  pageSize = 25,
}: PaymentsDashboardProps) {
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments)
  const [total, setTotal] = useState(initialTotal)
  const [stats, setStats] = useState<PaymentStats>(initialStats)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkLoading, setBulkLoading] = useState(false)

  const hasMore = payments.length < total
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.provider !== "all" ||
    filters.search.trim() !== "" ||
    filters.showArchived

  const selectedCount = Object.keys(selected).length

  const fetchFiltered = useCallback(
    async (newFilters: Filters) => {
      setFiltersLoading(true)
      setSelected({})
      try {
        const qs = buildQueryString(newFilters, 0, pageSize)
        const res = await fetch(`/api/admin/payments?${qs}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setPayments(data.payments)
        setTotal(data.total)
        setStats(data.stats)
        setPage(0)
      } catch (err) {
        console.error("Filter fetch error:", err)
      } finally {
        setFiltersLoading(false)
      }
    },
    [pageSize]
  )

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const qs = buildQueryString(filters, nextPage, pageSize)
      const res = await fetch(`/api/admin/payments?${qs}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPayments((prev) => [...prev, ...data.payments])
      setTotal(data.total)
      setStats(data.stats)
      setPage(nextPage)
    } catch (err) {
      console.error("Load more error:", err)
    } finally {
      setLoading(false)
    }
  }, [page, filters, pageSize])

  function updateFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (key !== "search") {
      fetchFiltered(next)
    }
  }

  function handleSearchChange(value: string) {
    setFilters((f) => ({ ...f, search: value }))
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      fetchFiltered({ ...filters, search: value })
    }, 400)
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    setSelected({})
    fetchFiltered(DEFAULT_FILTERS)
  }

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

  async function handleBulkArchive() {
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
        notifications.showSuccess({ description: `${result.archived} record${result.archived === 1 ? "" : "s"} archived.` })
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
    fetchFiltered(DEFAULT_FILTERS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const totalDonations = stats.byType?.donation || 0
  const totalEvents = stats.byType?.event || 0
  const totalConference = stats.byType?.conference || 0
  const pendingCount = (stats.byStatus?.pending || 0) + (stats.byStatus?.unpaid || 0)
  const reviewCount = stats.byStatus?.review || 0
  const failedCount = stats.byStatus?.failed || 0

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalAmount || 0, "NPR", { showCode: true })}
          subtitle={`${total} total payment${total === 1 ? "" : "s"}`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="By Type"
          value={
            <div className="space-y-0.5 text-sm">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-pink-500" />
                {totalDonations} donations
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-blue-500" />
                {totalEvents} events
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-indigo-500" />
                {totalConference} conference
              </div>
            </div>
          }
          subtitle="Payment sources"
          icon={<CreditCard className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          subtitle="Awaiting payment"
          icon={<Clock className="h-5 w-5 text-white" />}
          color="bg-amber-500"
        />
        <StatCard
          title="Failed"
          value={failedCount}
          subtitle="Unsuccessful attempts"
          icon={<AlertCircle className="h-5 w-5 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* ── Filters + Table Card ────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">All Payments</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtersLoading ? (
                  "Updating…"
                ) : (
                  <>
                    Showing <span className="font-semibold text-foreground">{payments.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{total}</span> records
                    {hasActiveFilters && " (filtered)"}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* ── Filter Row ────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />

              <FancySelect
                value={filters.type}
                onValueChange={(v) => updateFilter("type", v)}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "donation", label: "Donation" },
                  { value: "event", label: "Event" },
                  { value: "conference", label: "Conference" },
                ]}
                className="w-[140px]"
                size="sm"
              />

              <FancySelect
                value={filters.status}
                onValueChange={(v) => updateFilter("status", v)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "unpaid", label: "Unpaid" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" },
                  { value: "review", label: "Under Review" },
                ]}
                className="w-[140px]"
                size="sm"
              />

              <FancySelect
                value={filters.provider}
                onValueChange={(v) => updateFilter("provider", v)}
                options={[
                  { value: "all", label: "All Providers" },
                  { value: "stripe", label: "Stripe" },
                  { value: "khalti", label: "Khalti" },
                  { value: "esewa", label: "eSewa" },
                ]}
                className="w-[140px]"
                size="sm"
              />

              <button
                onClick={() => {
                  const next = { ...filters, showArchived: !filters.showArchived }
                  setFilters(next)
                  fetchFiltered(next)
                }}
                className={`h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  filters.showArchived
                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {filters.showArchived ? "Hide archived" : "Show archived"}
              </button>

              {selectedCount > 0 && (
                <button
                  onClick={handleBulkArchive}
                  disabled={bulkLoading}
                  className="h-9 px-3 rounded-lg border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {bulkLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                  Archive {selectedCount} selected
                </button>
              )}
            </div>
          </div>

          {/* ── Table ─────────────────────────────────────────────── */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {payments.length > 0 && payments.every((p) => selected[`${p.type}-${p.id}`]) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Provider</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium text-muted-foreground">No payments found</p>
                        {hasActiveFilters && (
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your filters
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, idx) => {
                    const normalizedStatus = (payment.status || "").toLowerCase()
                    const sc = statusConfig[normalizedStatus] || statusConfig.pending
                    const tc = typeConfig[payment.type] || typeConfig.donation

                    const rowKey = `${payment.type}-${payment.id}`
                    const isSelected = !!selected[rowKey]

                    return (
                      <TableRow
                        key={rowKey}
                        className={`cursor-pointer ${
                          payment.archived_at
                            ? "opacity-50 hover:opacity-75"
                            : isSelected
                              ? "bg-primary/5 hover:bg-primary/10"
                              : idx % 2 === 0
                                ? "bg-transparent hover:bg-muted/30"
                                : "bg-muted/10 hover:bg-muted/30"
                        }`}
                        onClick={() => router.push(`/admin/payments/${payment.id}?type=${payment.type}`)}
                      >
                        <TableCell onClick={(e) => { e.stopPropagation(); toggleSelect(rowKey) }}>
                          <div className="flex items-center justify-center cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {(payment.name || "?")
                                .split(" ")
                                .map((w: string) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm truncate">{payment.name}</p>
                                {payment.archived_at && (
                                  <span className="shrink-0 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 leading-none">
                                    Archived
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {payment.email}
                              </p>
                              {payment.context && payment.context !== "General Donation" && payment.context !== "Conference" && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {payment.context}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1 ${tc.className}`}
                          >
                            {tc.icon}
                            {tc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm tabular-nums">
                            {payment.amount
                              ? formatCurrency(payment.amount, payment.currency, { showCode: true })
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {payment.provider || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1 ${sc.className}`}
                          >
                            {sc.icon}
                            <span className="capitalize">{normalizedStatus}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(payment.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Load More ─────────────────────────────────────────── */}
          {hasMore && !filtersLoading && (
            <div className="flex flex-col items-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="min-w-[220px] gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load More ({total - payments.length} remaining)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Page {page + 1} • {pageSize} per page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
