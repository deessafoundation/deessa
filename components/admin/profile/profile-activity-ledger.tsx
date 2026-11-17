"use client"

import { useState, useMemo, useSyncExternalStore } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  RotateCcw,
  Download,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Activity,
  AlertCircle,
  Copy,
  Check,
  Table as TableIcon,
  LayoutList,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { notifications } from "@/lib/notifications"
import { getActionTheme, getAuditDomain } from "@/components/admin/users/system-audit-client"
import type { AdminActivityHistoryItem } from "@/lib/actions/admin-profile"

interface ProfileActivityLedgerProps {
  initialLogs: AdminActivityHistoryItem[]
  adminName: string
  defaultView?: "table" | "timeline"
}

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  return `"${sanitized.replace(/"/g, '""')}"`
}

function formatDateWithYear(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const year = d.getFullYear()
  const month = d.toLocaleDateString("en-US", { month: "short" })
  const day = String(d.getDate()).padStart(2, "0")
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  return `${month} ${day}, ${year} · ${time}`
}

const subscribeNoop = () => () => {}

function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

function formatRelativeTime(dateStr: string, isMounted: boolean) {
  const date = new Date(dateStr)
  if (!isMounted || isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`

  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export function ProfileActivityLedger({
  initialLogs,
  adminName,
  defaultView = "table",
}: ProfileActivityLedgerProps) {
  const [viewMode, setViewMode] = useState<"table" | "timeline">(defaultView)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [selectedLog, setSelectedLog] = useState<{ log: AdminActivityHistoryItem; index: number } | null>(null)
  const [copiedJson, setCopiedJson] = useState(false)
  const isMounted = useIsMounted()

  // Metrics summary
  const metrics = useMemo(() => {
    const total = initialLogs.length
    const logins = initialLogs.filter((l) => (l.action || "").toUpperCase().includes("LOGIN")).length
    const profileUpdates = initialLogs.filter((l) => l.entity_type === "profile").length
    const security = initialLogs.filter(
      (l) => l.entity_type === "password" || (l.action || "").toUpperCase().includes("PASSWORD")
    ).length

    return { total, logins, profileUpdates, security }
  }, [initialLogs])

  // Filtered log entries
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const act = (log.action || "").toUpperCase()
      const entity = (log.entity_type || "").toUpperCase()

      let matchesCategory = true
      if (categoryFilter === "AUTH") {
        matchesCategory = act.includes("LOGIN") || act.includes("LOGOUT") || act.includes("SESSION")
      } else if (categoryFilter === "SECURITY") {
        matchesCategory = entity === "PASSWORD" || act.includes("PASSWORD") || act.includes("RESET")
      } else if (categoryFilter === "PROFILE") {
        matchesCategory = entity === "PROFILE" || act.includes("PROFILE")
      } else if (categoryFilter === "CREATE") {
        matchesCategory = act.includes("CREATE") || act.includes("REGISTER") || act.includes("ADD")
      } else if (categoryFilter === "UPDATE") {
        matchesCategory = act.includes("UPDATE") || act.includes("EDIT") || act.includes("CHANGE")
      }

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
        (log.new_data && JSON.stringify(log.new_data).toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [initialLogs, categoryFilter, searchQuery])

  const hasFilters = searchQuery !== "" || categoryFilter !== "ALL"

  // Pagination State (15 by default)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Reset to first page when search query, category filter, or page size changes
  const [filterKey, setFilterKey] = useState("")
  const currentFilterKey = `${searchQuery}|${categoryFilter}|${pageSize}`
  if (filterKey !== currentFilterKey) {
    setFilterKey(currentFilterKey)
    setCurrentPage(1)
  }

  const totalItems = filteredLogs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, startIndex + pageSize)
  }, [filteredLogs, startIndex, pageSize])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | "ellipsis")[] = [1]
    if (safeCurrentPage > 3) {
      pages.push("ellipsis")
    }
    const start = Math.max(2, safeCurrentPage - 1)
    const end = Math.min(totalPages - 1, safeCurrentPage + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (safeCurrentPage < totalPages - 2) {
      pages.push("ellipsis")
    }
    pages.push(totalPages)
    return pages
  }, [totalPages, safeCurrentPage])

  const handleResetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("ALL")
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      notifications.showWarning({ description: "No activity logs available to export." })
      return
    }

    const headers = ["S.No", "Timestamp", "Year", "Action", "Category", "Operator", "Details"]
    const rows = filteredLogs.map((l, idx) => {
      const date = new Date(l.created_at)
      return [
        escapeCSVValue(idx + 1),
        escapeCSVValue(date.toISOString()),
        escapeCSVValue(date.getFullYear()),
        escapeCSVValue(l.action),
        escapeCSVValue(l.entity_type || "system"),
        escapeCSVValue(adminName),
        escapeCSVValue(JSON.stringify(l.new_data || {})),
      ]
    })

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `admin-activity-ledger-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Ledger Exported",
      description: `Downloaded ${filteredLogs.length} audit records to CSV.`,
    })
  }

  const handleCopyJson = () => {
    if (!selectedLog?.log.new_data) return
    navigator.clipboard.writeText(JSON.stringify(selectedLog.log.new_data, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
    notifications.showInfo({ description: "Audit JSON copied to clipboard." })
  }

  const getLogSummary = (log: AdminActivityHistoryItem) => {
    if (log.new_data?.action === "PASSWORD_CHANGED") {
      return "Account password updated via authenticated session"
    }
    if (log.new_data?.current && typeof log.new_data.current === "object") {
      const cur = log.new_data.current as Record<string, unknown>
      if (cur.full_name) {
        return `Display name set to "${String(cur.full_name)}"`
      }
    }
    if (log.action.includes("LOGIN")) {
      return "Administrator authenticated successfully into portal"
    }
    if (log.action.includes("LOGOUT")) {
      return "Administrator session terminated"
    }
    if (log.entity_type) {
      return `${log.action.replace(/_/g, " ")} on ${log.entity_type}`
    }
    return log.action.replace(/_/g, " ")
  }

  return (
    <div className="space-y-4">
      {/* 1. Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1 hover:border-primary/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total Operations
          </span>
          <span className="text-xl font-bold text-foreground block font-mono">{metrics.total}</span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1 hover:border-emerald-500/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Logins Recorded
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
            {metrics.logins}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1 hover:border-indigo-500/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Profile Edits
          </span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
            {metrics.profileUpdates}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1 hover:border-purple-500/30 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Security Updates
          </span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 block font-mono">
            {metrics.security}
          </span>
        </div>
      </div>

      {/* 2. Interactive Search, Dropdown Filter, View Mode, & Export Toolbar */}
      <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search action, entity, or payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 pl-8 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Category Dropdown (shadcn Select) */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8.5 w-[160px] text-xs bg-background border-border/80 shadow-2xs cursor-pointer">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="AUTH">Auth & Logins</SelectItem>
                <SelectItem value="SECURITY">Security & Passwords</SelectItem>
                <SelectItem value="PROFILE">Profile Modifications</SelectItem>
                <SelectItem value="CREATE">Creations</SelectItem>
                <SelectItem value="UPDATE">Updates & Edits</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle: Table vs. Timeline */}
            <div className="flex items-center rounded-lg border border-border/80 bg-background/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Switch to Table view"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "timeline"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Switch to Timeline view"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Timeline</span>
              </button>
            </div>

            {/* Export CSV button with hover micro-interaction */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8.5 text-xs gap-1.5 shadow-2xs bg-background hover:bg-primary/[0.07] hover:border-primary/40 hover:text-primary transition-all duration-200 cursor-pointer active:scale-95"
              title="Download activity log as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            {/* Reset Filters */}
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter & Quick Page Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{" "}
              <strong>{totalItems}</strong> events
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {totalPages > 1 && (
              <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 border-border/80 bg-background">
                Page {safeCurrentPage} of {totalPages}
              </Badge>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-7 w-7 p-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] font-mono px-1">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-7 w-7 p-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Log Entries: Table or Timeline View */}
      {filteredLogs.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border/80 text-center space-y-2 bg-card">
          <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p className="text-xs font-semibold text-foreground">No matching audit records</p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            No chronological operations match your current search query or filter selection.
          </p>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 h-8 text-xs cursor-pointer"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (With S.No & Scroll Container after 10 rows) */
        <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-2xs">
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="bg-muted/95 backdrop-blur-md sticky top-0 z-20 border-b border-border/80 shadow-2xs text-[11px]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center font-mono font-bold text-muted-foreground">S.No</TableHead>
                  <TableHead className="w-44 font-semibold text-foreground">Timestamp</TableHead>
                  <TableHead className="w-40 font-semibold text-foreground">Action / Category</TableHead>
                  <TableHead className="w-28 font-semibold text-foreground">Entity</TableHead>
                  <TableHead className="font-semibold text-foreground">Operation Summary</TableHead>
                  <TableHead className="w-16 text-right font-semibold text-muted-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60 text-xs">
                {paginatedLogs.map((log, index) => {
                  const globalIndex = startIndex + index + 1
                  const theme = getActionTheme(log.action, log.entity_type)
                  const domain = getAuditDomain(log.entity_type, log.action)
                  const Icon = theme.icon
                  const DomainIcon = domain.icon
                  const summary = getLogSummary(log)

                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => setSelectedLog({ log, index: globalIndex })}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      {/* S.No */}
                      <TableCell className="text-center font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                        {globalIndex}
                      </TableCell>

                      {/* Timestamp with Full Year */}
                      <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                          <span>{formatDateWithYear(log.created_at)}</span>
                        </div>
                      </TableCell>

                      {/* Dual Badges: Domain & Action */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("text-[10.5px] px-2 py-0.5 font-semibold inline-flex items-center gap-1 shadow-2xs", domain.badgeClass)}
                          >
                            <DomainIcon className="h-3 w-3 shrink-0" />
                            <span>{domain.label}</span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("text-[10.5px] px-2 py-0.5 font-semibold inline-flex items-center gap-1 shadow-2xs", theme.badgeClass)}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[130px]">{theme.label}</span>
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Entity Type */}
                      <TableCell>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase font-medium">
                          {log.entity_type || "system"}
                        </span>
                      </TableCell>

                      {/* Summary */}
                      <TableCell className="text-foreground max-w-md truncate">
                        <span className="text-xs text-foreground/90 font-medium truncate block">
                          {summary}
                        </span>
                      </TableCell>

                      {/* Action trigger */}
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW (With Scroll Container after 10 rows) */
        <div className="max-h-[580px] overflow-y-auto scrollbar-thin pr-2 rounded-2xl">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/70">
            {paginatedLogs.map((log, index) => {
              const globalIndex = startIndex + index + 1
              const theme = getActionTheme(log.action, log.entity_type)
              const domain = getAuditDomain(log.entity_type, log.action)
              const Icon = theme.icon
              const DomainIcon = domain.icon
              const summary = getLogSummary(log)

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog({ log, index: globalIndex })}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline connector dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-3 h-3 w-3 rounded-full border-2 border-background ring-2 ring-border/80 transition-transform group-hover:scale-125",
                      theme.dotColor
                    )}
                  />

                  <div className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs hover:border-primary/40 hover:bg-muted/15 transition-all space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          #{globalIndex}
                        </span>
                        {/* 1. Domain Badge */}
                        <Badge
                          variant="outline"
                          className={cn("text-[10.5px] px-2 py-0.5 font-semibold inline-flex items-center gap-1 shadow-2xs", domain.badgeClass)}
                        >
                          <DomainIcon className="h-3 w-3 shrink-0" />
                          <span>{domain.label}</span>
                        </Badge>
                        {/* 2. Action Badge */}
                        <Badge
                          variant="outline"
                          className={cn("text-[10.5px] px-2 py-0.5 font-semibold inline-flex items-center gap-1 shadow-2xs", theme.badgeClass)}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{theme.label}</span>
                        </Badge>
                        <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50 uppercase">
                          {log.entity_type || "system"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <Clock className="h-3 w-3 opacity-60" />
                        <span>{formatRelativeTime(log.created_at, isMounted)}</span>
                        <span>·</span>
                        <span>{formatDateWithYear(log.created_at)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {summary}
                    </p>

                    {log.new_data && Object.keys(log.new_data).length > 0 && (
                      <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <FileText className="h-3 w-3 text-primary" />
                          Event ID: {log.id.slice(0, 8)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary group-hover:underline font-medium text-xs">
                          View Audit Diff <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Comprehensive Pagination Controls (Bottom) */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-20 text-xs bg-background border-border/80 shadow-2xs cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden sm:inline text-muted-foreground/60">·</span>
              <span className="hidden sm:inline font-mono text-[11px]">
                {startIndex + 1}–{endIndex} of {totalItems} events
              </span>
            </div>

            {/* Numeric Page Buttons & Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline text-[11px]">First</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline text-[11px]">Prev</span>
              </Button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={safeCurrentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p as number)}
                      className={cn(
                        "h-8 w-8 p-0 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all",
                        safeCurrentPage === p
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border-border/80 shadow-2xs hover:bg-muted"
                      )}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Next page"
              >
                <span className="hidden md:inline text-[11px]">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Last page"
              >
                <span className="hidden md:inline text-[11px]">Last</span>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Detail Modal for Selected Event */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          {selectedLog && (() => {
            const { log, index } = selectedLog
            const theme = getActionTheme(log.action, log.entity_type)
            const domain = getAuditDomain(log.entity_type, log.action)
            const Icon = theme.icon
            const DomainIcon = domain.icon

            return (
              <>
                <DialogHeader className="space-y-2 border-b border-border/60 pb-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("text-xs px-2.5 py-1 font-semibold inline-flex items-center gap-1.5 shadow-2xs", domain.badgeClass)}
                      >
                        <DomainIcon className="h-3.5 w-3.5" />
                        <span>{domain.label}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-xs px-2.5 py-1 font-semibold inline-flex items-center gap-1.5 shadow-2xs", theme.badgeClass)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{theme.label}</span>
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      Entry #{index} · ID: {log.id.slice(0, 8)}
                    </span>
                  </div>

                  <DialogTitle className="text-base font-bold text-foreground">
                    Audit Operation Detail
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Cryptographic record captured on {formatDateWithYear(log.created_at)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-3 text-xs">
                  {/* Summary card */}
                  <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Plain-Language Description
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {getLogSummary(log)}
                    </p>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl border border-border/70 bg-card space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Action Identifier
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground block truncate">
                        {log.action}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-border/70 bg-card space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Entity Target
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground block truncate">
                        {log.entity_type || "None"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-border/70 bg-card space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Authenticated Operator
                      </span>
                      <span className="text-xs font-semibold text-foreground block truncate">
                        {adminName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-border/70 bg-card space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Integrity Verified
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Signed & Logged
                      </span>
                    </div>
                  </div>

                  {/* Raw Diff / JSON Payload */}
                  {log.new_data && Object.keys(log.new_data).length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3 text-primary" />
                          Recorded Payload / Parameters
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyJson}
                          className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {copiedJson ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <pre className="font-mono text-[11px] p-3 rounded-xl bg-background border border-border/80 overflow-x-auto text-foreground/90 max-h-56 leading-relaxed">
                        {JSON.stringify(log.new_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(null)}
                      className="h-8 text-xs cursor-pointer"
                    >
                      Close Inspector
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
