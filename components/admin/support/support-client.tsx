"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bug,
  Search,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Archive,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  CheckSquare,
  Square,
  Inbox,
  ExternalLink,
  ImageIcon,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
  DropdownMenuLabel,
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
import { notifications } from "@/lib/notifications"
import type {
  SupportTicket,
  FetchSupportResult,
} from "@/lib/data/support"
import {
  updateSupportStatus,
  archiveSupportReport,
  deleteSupportReport,
  bulkUpdateSupportStatus,
  bulkArchiveSupportReports,
  getSupportTicketByIdAction,
} from "@/lib/actions/admin-support"
import { SupportDetailSheet } from "./support-detail-sheet"
import styles from "./support.module.css"

interface SupportClientProps {
  initialData: FetchSupportResult
}

export function SupportClient({ initialData }: SupportClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const { tickets, stats, assignees, issueTypes, pagination } = initialData

  // State from URL
  const currentStatus = searchParams.get("status") || "all"
  const currentArchived = searchParams.get("archived") === "true"
  const currentSearch = searchParams.get("search") || ""
  const currentAssignee = searchParams.get("assignee") || "all"
  const currentIssueType = searchParams.get("issueType") || "all"
  const currentHasScreenshot = searchParams.get("hasScreenshot")
  const currentTicketId = searchParams.get("id")

  const [searchInput, setSearchInput] = useState(currentSearch)
  const [viewMode, setViewMode] = useState<"table" | "bento">("table")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal & Deep Link State
  const initialTicket = currentTicketId
    ? tickets.find((t) => t.id === currentTicketId) || null
    : null
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(initialTicket)
  const [activeScreenshotUrl, setActiveScreenshotUrl] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(Boolean(initialTicket))
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  // Asynchronous fallback: if deep-linked ticket is on another page, fetch it
  useEffect(() => {
    if (currentTicketId && !tickets.some((t) => t.id === currentTicketId)) {
      getSupportTicketByIdAction(currentTicketId).then((res) => {
        if (res.success && res.ticket) {
          setActiveTicket(res.ticket)
          setActiveScreenshotUrl(res.screenshotUrl || null)
          setIsDetailOpen(true)
        }
      })
    }
  }, [currentTicketId, tickets])

  const handleOpenTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket)
    setIsDetailOpen(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", ticket.id)
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`)
  }

  const handleCloseTicket = () => {
    setIsDetailOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    const query = params.toString() ? `?${params.toString()}` : ""
    window.history.replaceState(null, "", `${pathname}${query}`)
  }

  // URL Query Sync
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    })
    // Reset page on filter change
    if (!("page" in updates)) {
      params.delete("page")
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Handle Tab Switch
  const handleScopeTab = (scope: string) => {
    setSelectedIds([])
    if (scope === "archived") {
      updateQuery({ archived: "true", status: null, hasScreenshot: null })
    } else if (scope === "screenshots") {
      updateQuery({ hasScreenshot: "true", archived: null, status: null })
    } else {
      updateQuery({
        archived: null,
        hasScreenshot: null,
        status: scope === "all" ? null : scope,
      })
    }
  }

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateQuery({ search: searchInput.trim() || null })
  }

  const handleResetFilters = () => {
    setSearchInput("")
    setSelectedIds([])
    startTransition(() => {
      router.push(pathname)
    })
  }

  // Selection Handlers
  const isAllSelected = tickets.length > 0 && selectedIds.length === tickets.length
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(tickets.map((t) => t.id))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Bulk Actions
  const handleBulkStatusChange = async (targetStatus: SupportTicket["status"]) => {
    if (selectedIds.length === 0) return
    setIsBulkOperating(true)
    try {
      const res = await bulkUpdateSupportStatus(selectedIds, targetStatus)
      if (res.success) {
        notifications.showSuccess(`Marked ${res.count} reports as ${targetStatus.toUpperCase()}`)
        setSelectedIds([])
        router.refresh()
      } else {
        notifications.showError(`Bulk update failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Error during bulk operation")
    } finally {
      setIsBulkOperating(false)
    }
  }

  const handleBulkArchive = async (archive: boolean) => {
    if (selectedIds.length === 0) return
    setIsBulkOperating(true)
    try {
      const res = await bulkArchiveSupportReports(selectedIds, archive)
      if (res.success) {
        notifications.showSuccess(
          archive ? `Archived ${res.count} reports` : `Restored ${res.count} reports`
        )
        setSelectedIds([])
        router.refresh()
      } else {
        notifications.showError(`Bulk archive failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Error during bulk archive")
    } finally {
      setIsBulkOperating(false)
    }
  }

  // Individual Actions
  const handleSingleStatusUpdate = async (
    id: string,
    targetStatus: SupportTicket["status"]
  ) => {
    try {
      const res = await updateSupportStatus({ id, status: targetStatus })
      if (res.success) {
        notifications.showSuccess(`Report marked as ${targetStatus.toUpperCase()}`)
        router.refresh()
      } else {
        notifications.showError(`Failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Status update error")
    }
  }

  const handleSingleArchive = async (id: string, archive: boolean) => {
    try {
      const res = await archiveSupportReport(id, archive)
      if (res.success) {
        notifications.showSuccess(archive ? "Report archived" : "Report restored to active queue")
        router.refresh()
      } else {
        notifications.showError(`Failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Archive error")
    }
  }

  const handleSingleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the support report from "${name}"?`)) {
      return
    }
    try {
      const res = await deleteSupportReport(id)
      if (res.success) {
        notifications.showSuccess("Support report permanently deleted")
        router.refresh()
      } else {
        notifications.showError(`Failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Deletion error")
    }
  }

  // CSV Export
  const handleExportCSV = (exportSelectedOnly = false) => {
    const listToExport = exportSelectedOnly
      ? tickets.filter((t) => selectedIds.includes(t.id))
      : tickets

    if (listToExport.length === 0) {
      notifications.showError("No support reports available to export")
      return
    }

    const headers = [
      "S.No",
      "Reporter Name",
      "Email Address",
      "Phone Number",
      "Issue Type",
      "Subject",
      "Origin Page URL",
      "Browser Info",
      "Screenshot File",
      "Status",
      "Assignee",
      "Reported Date",
      "Description",
      "Internal Notes",
      "Replied At",
    ]

    const csvRows = listToExport.map((t, index) => {
      const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
      return [
        sNo,
        `"${(t.name || "").replace(/"/g, '""')}"`,
        `"${(t.email || "").replace(/"/g, '""')}"`,
        `"${(t.phone || "N/A").replace(/"/g, '""')}"`,
        `"${(t.issue_type || "").replace(/"/g, '""')}"`,
        `"${(t.subject || "").replace(/"/g, '""')}"`,
        `"${(t.page_url || "").replace(/"/g, '""')}"`,
        `"${(t.browser_info || "").replace(/"/g, '""')}"`,
        `"${(t.screenshot_name || (t.screenshot_path ? "Included" : "None")).replace(/"/g, '""')}"`,
        `"${t.status.toUpperCase()}"`,
        `"${(t.assignee || "Unassigned").replace(/"/g, '""')}"`,
        `"${new Date(t.created_at).toISOString()}"`,
        `"${(t.message || "").replace(/"/g, '""')}"`,
        `"${(t.internal_notes || "").replace(/"/g, '""')}"`,
        `"${t.last_reply_sent_at ? new Date(t.last_reply_sent_at).toISOString() : "None"}"`,
      ].join(",")
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `deessa-support-reports-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notifications.showSuccess(`Exported ${listToExport.length} support reports to CSV`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize shrink-0 ${styles.badgeOpen}`}
          >
            <AlertCircle className="size-3 mr-1 inline" />
            Open
          </Badge>
        )
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize shrink-0 ${styles.badgeInProgress}`}
          >
            <Clock className="size-3 mr-1 inline" />
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize shrink-0 ${styles.badgeResolved}`}
          >
            <CheckCircle2 className="size-3 mr-1 inline" />
            Resolved
          </Badge>
        )
      case "closed":
        return (
          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize shrink-0 ${styles.badgeClosed}`}
          >
            <XCircle className="size-3 mr-1 inline" />
            Closed
          </Badge>
        )
    }
  }

  const getIssueBadgeClass = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes("bug")) return styles.badgeBug
    if (t.includes("feature")) return styles.badgeFeature
    if (t.includes("accessibility")) return styles.badgeAccessibility
    return styles.badgeContent
  }

  // Active Tab determination
  const activeTab = currentArchived
    ? "archived"
    : currentHasScreenshot === "true"
    ? "screenshots"
    : currentStatus

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Support Reports</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
              <Bug className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <span>Support Reports</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-semibold">
                  {stats.total} total
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Triage bug reports, view attached user screenshots, review diagnostic context, and collaborate on fixes.
              </p>
            </div>
          </div>
        </div>

        {/* Executive Action Header */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button asChild variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold gap-1.5">
            <Link href="/admin/settings">
              <Settings className="size-3.5" />
              <span>Public Support Toggle</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(false)}
            className="h-9 px-3 text-xs font-semibold gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            disabled={isPending}
            className="h-9 px-3 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── 4 Executive KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reports */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Reports
              </span>
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Bug className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums">
              {stats.total}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.withScreenshot} with screenshot attached
            </p>
          </CardHeader>
        </Card>

        {/* Open Reports */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Open / Needs Fix
              </span>
              <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {stats.open}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.unassigned} unassigned in pool
            </p>
          </CardHeader>
        </Card>

        {/* In Progress */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                In Progress
              </span>
              <div className="size-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Clock className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1 tabular-nums">
              {stats.inProgress}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Being investigated by staff
            </p>
          </CardHeader>
        </Card>

        {/* Resolved */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Resolved / Fixed
              </span>
              <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {stats.resolved}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.thisMonth} received this month
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* ── Scope Tabs & Multi-Filter Toolbar ────────────────────────── */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top Row: Scope Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => handleScopeTab("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "all"
                    ? `bg-background text-foreground shadow-2xs font-semibold ${styles.oceanShimmerTab}`
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Reports ({stats.total})
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("open")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "open"
                    ? "bg-background text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Open</span>
                <span className="size-2 rounded-full bg-amber-500" />
                <span>({stats.open})</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("in_progress")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "in_progress"
                    ? "bg-background text-sky-600 dark:text-sky-400 shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>In Progress</span>
                <span className="size-2 rounded-full bg-sky-500" />
                <span>({stats.inProgress})</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("resolved")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "resolved"
                    ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Resolved</span>
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>({stats.resolved})</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("closed")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "closed"
                    ? "bg-background text-muted-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Closed ({stats.closed})</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("screenshots")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "screenshots"
                    ? "bg-background text-primary shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="size-3 text-sky-500" />
                <span>Screenshots ({stats.withScreenshot})</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTab("archived")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "archived"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Archive className="size-3" />
                <span>Archived ({stats.archived})</span>
              </button>
            </div>

            {/* View Mode Toggle (Table Ledger vs Bento Grid) */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <div className="flex items-center p-1 rounded-lg bg-muted/40 border border-border/50 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table Ledger View"
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("bento")}
                  className={`p-1.5 rounded ${
                    viewMode === "bento"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Bento Card View"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Multi-Facet Search & Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-border/40">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search reporter, email, issue type, origin URL, subject, or message..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 text-xs bg-background/80"
              />
            </form>

            {/* Issue Type Dropdown Filter */}
            <div className="w-full sm:w-[190px]">
              <Select
                value={currentIssueType}
                onValueChange={(val) => updateQuery({ issueType: val })}
              >
                <SelectTrigger className="h-10 text-xs bg-background/80">
                  <SelectValue placeholder="Issue Type: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issue Types</SelectItem>
                  {issueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="w-full sm:w-[180px]">
              <Select
                value={currentAssignee}
                onValueChange={(val) => updateQuery({ assignee: val })}
              >
                <SelectTrigger className="h-10 text-xs bg-background/80">
                  <SelectValue placeholder="Assignee: All" />
                </SelectTrigger>
                <SelectContent className="max-w-[280px]">
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="unassigned">Unassigned (Pool)</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a.id} value={a.email}>
                      <span className="truncate block max-w-[200px]">
                        {a.full_name} ({a.email})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            {(currentSearch ||
              currentStatus !== "all" ||
              currentIssueType !== "all" ||
              currentAssignee !== "all" ||
              currentArchived ||
              currentHasScreenshot) && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Bulk Actions Floating Toolbar (When Items Selected) ────────── */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-foreground animate-in fade-in-50">
          <div className="flex items-center gap-2 font-semibold">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span>{selectedIds.length} support reports selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => handleBulkStatusChange("in_progress")}
              className="h-8 px-2.5 text-xs"
            >
              Mark In Progress
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => handleBulkStatusChange("resolved")}
              className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400"
            >
              Mark Resolved
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => handleBulkStatusChange("closed")}
              className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-400"
            >
              Mark Closed
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkOperating}
              onClick={() => handleBulkArchive(!currentArchived)}
              className="h-8 px-2.5 text-xs"
            >
              {currentArchived ? "Restore Selected" : "Archive Selected"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(true)}
              className="h-8 px-2.5 text-xs"
            >
              Export Selected
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-8 px-2.5 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Data View (Table vs Bento Grid) ──────────────────────── */}
      {viewMode === "table" ? (
        /* ── Table Ledger View ─────────────────────────────────────── */
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Support Reports Ledger
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Showing {tickets.length} reports on this page. Click any row to review details, view screenshots, and reply.
                </CardDescription>
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    {/* Select All Checkbox */}
                    <TableHead className="w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center p-1 rounded"
                        title="Select All"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableHead>

                    {/* S.No Header - MANDATORY RULE: Column must be S.No */}
                    <TableHead className="w-16 font-semibold text-xs text-foreground">
                      S.No
                    </TableHead>

                    {/* Reporter Details */}
                    <TableHead className="min-w-[190px] font-semibold text-xs text-foreground">
                      Reporter Dossier
                    </TableHead>

                    {/* Issue Type */}
                    <TableHead className="w-[140px] font-semibold text-xs text-foreground">
                      Classification
                    </TableHead>

                    {/* Summary & Origin */}
                    <TableHead className="min-w-[240px] font-semibold text-xs text-foreground">
                      Issue Summary & Context
                    </TableHead>

                    {/* Screenshot */}
                    <TableHead className="w-[110px] font-semibold text-xs text-foreground">
                      Screenshot
                    </TableHead>

                    {/* Status */}
                    <TableHead className="w-[120px] font-semibold text-xs text-foreground">
                      Status
                    </TableHead>

                    {/* Assignee */}
                    <TableHead className="w-[130px] font-semibold text-xs text-foreground">
                      Assignee
                    </TableHead>

                    {/* Date */}
                    <TableHead className="w-[100px] font-semibold text-xs text-foreground">
                      Submitted
                    </TableHead>

                    {/* Actions */}
                    <TableHead className="w-12 text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground text-xs space-y-2">
                          <Inbox className="size-8 stroke-1 text-muted-foreground/60" />
                          <span className="font-semibold text-foreground text-sm">
                            No support reports found
                          </span>
                          <span className="max-w-sm text-center">
                            No submissions match the current filters. Try changing your search or resetting filters.
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket, index) => {
                      const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
                      const isSelected = selectedIds.includes(ticket.id)

                      return (
                        <TableRow
                          key={ticket.id}
                          tabIndex={0}
                          onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (
                              target.closest(
                                'button, a, input, [role="menuitem"], [role="button"], [data-radix-collection-item]'
                              )
                            ) {
                              return
                            }
                            handleOpenTicket(ticket)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              const target = e.target as HTMLElement
                              if (target.tagName === "TR") {
                                e.preventDefault()
                                handleOpenTicket(ticket)
                              }
                            }
                          }}
                          className={`group hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40 transition-colors ${
                            isSelected ? "bg-primary/[0.04]" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectOne(ticket.id)}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center p-1 rounded"
                              aria-label={`Select report from ${ticket.name}`}
                            >
                              {isSelected ? (
                                <CheckSquare className="size-4 text-primary" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                          </TableCell>

                          {/* S.No Sequence Number - MANDATORY RULE: just {sNo} */}
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                            {sNo}
                          </TableCell>

                          {/* Reporter Details */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:border-primary/40 transition-colors">
                                {getInitials(ticket.name)}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs text-left truncate block max-w-[200px]">
                                  {ticket.name}
                                </span>
                                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                                  <span>{ticket.email}</span>
                                  {ticket.phone && (
                                    <>
                                      <span>•</span>
                                      <span>{ticket.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Classification */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`font-semibold text-[11px] truncate max-w-[130px] block ${getIssueBadgeClass(
                                ticket.issue_type
                              )}`}
                            >
                              {ticket.issue_type}
                            </Badge>
                          </TableCell>

                          {/* Summary & Origin URL */}
                          <TableCell>
                            <div className="space-y-0.5 min-w-0">
                              <p className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate max-w-[260px] block">
                                {ticket.subject}
                              </p>
                              {ticket.page_url && (
                                <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1 max-w-[260px] font-mono">
                                  <ExternalLink className="size-2.5 shrink-0 text-sky-500" />
                                  <span className="truncate">{ticket.page_url}</span>
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Screenshot Pill */}
                          <TableCell>
                            {ticket.screenshot_path ? (
                              <Badge
                                variant="outline"
                                className="font-medium text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 flex items-center gap-1 w-fit"
                              >
                                <ImageIcon className="size-3 shrink-0" />
                                <span>Attached</span>
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[11px] italic">
                                None
                              </span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>

                          {/* Assignee */}
                          <TableCell>
                            {ticket.assignee ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border">
                                  {ticket.assignee[0].toUpperCase()}
                                </div>
                                <span className="text-foreground truncate max-w-[110px] text-xs">
                                  {ticket.assignee.split("@")[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px] italic">
                                Unassigned
                              </span>
                            )}
                          </TableCell>

                          {/* Date */}
                          <TableCell className="font-mono text-[11px] text-muted-foreground tabular-nums">
                            {new Date(ticket.created_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>

                          {/* Actions Menu */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 text-xs">
                                <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleOpenTicket(ticket)}
                                  className="gap-2 cursor-pointer font-medium"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span>View & Triage</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {ticket.status !== "resolved" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleStatusUpdate(ticket.id, "resolved")}
                                    className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Mark Resolved</span>
                                  </DropdownMenuItem>
                                )}

                                {ticket.status !== "in_progress" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleStatusUpdate(ticket.id, "in_progress")}
                                    className="gap-2 cursor-pointer text-sky-600 dark:text-sky-400"
                                  >
                                    <Clock className="size-3.5" />
                                    <span>Mark In Progress</span>
                                  </DropdownMenuItem>
                                )}

                                {ticket.status !== "open" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleStatusUpdate(ticket.id, "open")}
                                    className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                  >
                                    <AlertCircle className="size-3.5" />
                                    <span>Mark Open</span>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => handleSingleArchive(ticket.id, !ticket.archived)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Archive className="size-3.5" />
                                  <span>{ticket.archived ? "Restore to Active" : "Archive"}</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handleSingleDelete(ticket.id, ticket.name)}
                                  className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Delete Report</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ── Bento Card Grid View ─────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.length === 0 ? (
            <div className="col-span-full p-12 text-center border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
              <Inbox className="size-8 stroke-1 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground text-sm">No support reports found</p>
              <p>Try resetting filters or adjusting your search term.</p>
            </div>
          ) : (
            tickets.map((ticket, index) => {
              const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
              const isSelected = selectedIds.includes(ticket.id)

              return (
                <Card
                  key={ticket.id}
                  tabIndex={0}
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (
                      target.closest(
                        'button, a, input, [role="menuitem"], [role="button"]'
                      )
                    ) {
                      return
                    }
                    handleOpenTicket(ticket)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const target = e.target as HTMLElement
                      if (!target.closest("button, a, input")) {
                        e.preventDefault()
                        handleOpenTicket(ticket)
                      }
                    }
                  }}
                  className={`group rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs flex flex-col cursor-pointer transition-all hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    styles.supportBentoCard
                  } ${isSelected ? "border-primary/60 ring-1 ring-primary/30" : ""}`}
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:border-primary/40 transition-colors">
                          {getInitials(ticket.name)}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
                              #{sNo}
                            </span>
                            <h3 className="font-semibold text-sm text-foreground truncate block max-w-[150px] group-hover:text-primary transition-colors">
                              {ticket.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate block">
                            {ticket.email}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-3 flex-1 text-xs">
                    {/* Classification & Origin */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[11px] ${getIssueBadgeClass(
                          ticket.issue_type
                        )}`}
                      >
                        {ticket.issue_type}
                      </Badge>
                      {ticket.screenshot_path && (
                        <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
                          <ImageIcon className="size-3" /> Screenshot
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="font-semibold text-foreground truncate">{ticket.subject}</p>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Diagnostic Context */}
                    {ticket.page_url && (
                      <div className="p-2 rounded bg-muted/30 border border-border/40 font-mono text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <ExternalLink className="size-3 shrink-0 text-sky-500" />
                        <span className="truncate">{ticket.page_url}</span>
                      </div>
                    )}

                    {/* Metadata Strip */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      <span>{ticket.assignee ? ticket.assignee.split("@")[0] : "Unassigned"}</span>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                      {ticket.phone && (
                        <a
                          href={`tel:${ticket.phone}`}
                          className="size-8 rounded-lg border border-border/60 flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          title={`Call ${ticket.phone}`}
                        >
                          <Phone className="size-3.5" />
                        </a>
                      )}

                      <a
                        href={`mailto:${ticket.email}?subject=Re:%20[${encodeURIComponent(
                          ticket.issue_type
                        )}]%20${encodeURIComponent(ticket.subject)}`}
                        className="size-8 rounded-lg border border-border/60 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                        title={`Email ${ticket.email}`}
                      >
                        <Mail className="size-3.5" />
                      </a>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTicket(ticket)}
                        className="h-8 px-3 text-xs ml-auto font-medium"
                      >
                        <Eye className="size-3 mr-1.5" />
                        <span>Open Dossier</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ── Pagination Footer ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {pagination.totalCount > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{pagination.totalCount}</span> reports
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => updateQuery({ page: String(pagination.page - 1) })}
            className="h-8 px-2.5 text-xs"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            Previous
          </Button>

          <span className="font-mono text-xs px-2">
            {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateQuery({ page: String(pagination.page + 1) })}
            className="h-8 px-2.5 text-xs"
          >
            Next
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* ── Support Ticket Dossier & Reply Sheet ────────────────────── */}
      <SupportDetailSheet
        ticket={activeTicket}
        screenshotUrl={activeScreenshotUrl}
        assignees={assignees}
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseTicket()
          } else {
            setIsDetailOpen(true)
          }
        }}
        onUpdated={() => router.refresh()}
      />
    </div>
  )
}
