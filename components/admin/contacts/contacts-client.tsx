"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import {
  MessageSquare,
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
  ContactSubmission,
  FetchContactsResult,
} from "@/lib/data/contacts"
import {
  updateContactStatus,
  archiveContact,
  deleteContactSubmission,
  bulkUpdateContactStatus,
  bulkArchiveContacts,
  getContactById,
} from "@/lib/actions/admin-contacts"
import { ContactDetailSheet } from "./contact-detail-sheet"
import styles from "./contacts.module.css"

interface ContactsClientProps {
  initialData: FetchContactsResult
}

export function ContactsClient({ initialData }: ContactsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const { contacts, stats, assignees, pagination } = initialData

  // State from URL
  const currentStatus = searchParams.get("status") || "all"
  const currentArchived = searchParams.get("archived") === "true"
  const currentSearch = searchParams.get("search") || ""
  const currentAssignee = searchParams.get("assignee") || "all"
  const currentContactId = searchParams.get("id")

  const [searchInput, setSearchInput] = useState(currentSearch)
  const [viewMode, setViewMode] = useState<"table" | "bento">("table")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Initialize active contact directly from URL param if available
  const initialContact = currentContactId
    ? contacts.find((c) => c.id === currentContactId) || null
    : null
  const [activeContact, setActiveContact] = useState<ContactSubmission | null>(initialContact)
  const [isDetailOpen, setIsDetailOpen] = useState(Boolean(initialContact))
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  // Asynchronous fallback: if deep-linked contact is on another page or filtered out, fetch it
  useEffect(() => {
    if (currentContactId && !contacts.some((c) => c.id === currentContactId)) {
      getContactById(currentContactId).then((res) => {
        if (res.success && res.contact) {
          setActiveContact(res.contact as ContactSubmission)
          setIsDetailOpen(true)
        }
      })
    }
  }, [currentContactId, contacts])

  const handleOpenContact = (contact: ContactSubmission) => {
    setActiveContact(contact)
    setIsDetailOpen(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", contact.id)
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`)
  }

  const handleCloseContact = () => {
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
    // Reset page on filter change if not updating page
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
      updateQuery({ archived: "true", status: null })
    } else {
      updateQuery({
        archived: null,
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

  // Selection
  const isAllSelected = contacts.length > 0 && selectedIds.length === contacts.length
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(contacts.map((c) => c.id))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Bulk Actions
  const handleBulkStatusChange = async (targetStatus: ContactSubmission["status"]) => {
    if (selectedIds.length === 0) return
    setIsBulkOperating(true)
    try {
      const res = await bulkUpdateContactStatus(selectedIds, targetStatus)
      if (res.success) {
        notifications.showSuccess(`Marked ${res.count} inquiries as ${targetStatus.toUpperCase()}`)
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
      const res = await bulkArchiveContacts(selectedIds, archive)
      if (res.success) {
        notifications.showSuccess(
          archive ? `Archived ${res.count} inquiries` : `Restored ${res.count} inquiries`
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
    targetStatus: ContactSubmission["status"]
  ) => {
    try {
      const res = await updateContactStatus({ id, status: targetStatus })
      if (res.success) {
        notifications.showSuccess(`Inquiry marked as ${targetStatus.toUpperCase()}`)
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
      const res = await archiveContact(id, archive)
      if (res.success) {
        notifications.showSuccess(archive ? "Inquiry archived" : "Inquiry restored")
        router.refresh()
      } else {
        notifications.showError(`Failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Archive error")
    }
  }

  const handleSingleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the inquiry from "${name}"?`)) {
      return
    }
    try {
      const res = await deleteContactSubmission(id)
      if (res.success) {
        notifications.showSuccess("Inquiry permanently deleted")
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
      ? contacts.filter((c) => selectedIds.includes(c.id))
      : contacts

    if (listToExport.length === 0) {
      notifications.showError("No inquiries available to export")
      return
    }

    const headers = [
      "S.No",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Subject",
      "Status",
      "Assignee",
      "Received Date",
      "Message Body",
      "Internal Notes",
      "Replied At",
    ]

    const csvRows = listToExport.map((c, idx) => {
      const sNo = (pagination.page - 1) * pagination.pageSize + idx + 1
      return [
        sNo,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        `"${(c.subject || "").replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${(c.assignee || "Unassigned").replace(/"/g, '""')}"`,
        `"${new Date(c.created_at).toISOString()}"`,
        `"${(c.message || "").replace(/"/g, '""')}"`,
        `"${(c.internal_notes || "").replace(/"/g, '""')}"`,
        `"${c.last_reply_sent_at || ""}"`,
      ].join(",")
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `contact-inquiries-export-${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notifications.showSuccess(`Exported ${listToExport.length} contact inquiries to CSV`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = (status: ContactSubmission["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2.5 py-0.5 capitalize ${styles.badgeOpen}`}>
            <AlertCircle className="size-3 mr-1 inline" />
            Open
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2.5 py-0.5 capitalize ${styles.badgeInProgress}`}>
            <Clock className="size-3 mr-1 inline" />
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2.5 py-0.5 capitalize ${styles.badgeResolved}`}>
            <CheckCircle2 className="size-3 mr-1 inline" />
            Resolved
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2.5 py-0.5 capitalize ${styles.badgeClosed}`}>
            <XCircle className="size-3 mr-1 inline" />
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Active scope key
  const activeScopeKey = currentArchived ? "archived" : currentStatus

  return (
    <div className="space-y-6">
      {/* ── Executive Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span>Engagement</span>
            <span>/</span>
            <span className="text-foreground font-medium">Contact Inquiries</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <span>Contact Inquiries</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                  {stats.total} total
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Review visitor messages, assign inquiries to staff, draft direct email replies, and manage customer communications.
              </p>
            </div>
          </div>
        </div>

        {/* Executive Action Header */}
        <div className="flex items-center gap-2 self-start sm:self-center">
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
        {/* Total Inquiries */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Inquiries</span>
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Inbox className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.thisMonth} received this month
            </p>
          </CardHeader>
        </Card>

        {/* Action Required / Open */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Needs Action</span>
                {stats.open > 0 && (
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
              {stats.open.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.unassigned} unassigned to staff
            </p>
          </CardHeader>
        </Card>

        {/* In Progress / Claimed */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400">In Progress</span>
              <div className="size-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Clock className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400 mt-1">
              {stats.inProgress.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently claimed by team</p>
          </CardHeader>
        </Card>

        {/* Resolved / Replied */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved / Handled</span>
              <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.resolved.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Closed & response sent</p>
          </CardHeader>
        </Card>
      </div>

      {/* ── Scope Tabs & Controls ───────────────────────────────────── */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top Row: Scope Shimmer Tabs & View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Shimmer Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/40 w-fit">
              {[
                { id: "all", label: "All Inquiries", count: stats.total },
                { id: "open", label: "Needs Action", count: stats.open },
                { id: "in_progress", label: "In Progress", count: stats.inProgress },
                { id: "resolved", label: "Resolved", count: stats.resolved },
                { id: "archived", label: "Archived", count: stats.archived },
              ].map((tab) => {
                const isActive = activeScopeKey === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleScopeTab(tab.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? `bg-primary text-primary-foreground shadow-xs ${styles.oceanShimmerTab}`
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2 self-start lg:self-center">
              <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-background">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${
                    viewMode === "table"
                      ? "bg-muted text-foreground"
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
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Bento Card View"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Multi-Facet Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-border/40">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by sender name, email, phone, subject, or message text..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 text-xs bg-background/80"
              />
            </form>

            {/* Assignee Filter */}
            <Select
              value={currentAssignee}
              onValueChange={(val) => updateQuery({ assignee: val })}
            >
              <SelectTrigger className="h-10 text-xs w-full sm:w-44 bg-background">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned (Pool)</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.email}>
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Filters */}
            {(currentSearch || currentAssignee !== "all" || currentStatus !== "all" || currentArchived) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Bulk Actions Floating Toolbar (When items checked) ─────── */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-primary/10 border border-primary/25 shadow-sm text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedIds.length} inquiry(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-muted-foreground hover:underline ml-2 text-[11px]"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkOperating}
              onClick={() => handleBulkStatusChange("resolved")}
              className="h-8 px-2.5 text-xs bg-background hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 border-emerald-300"
            >
              <CheckCircle2 className="size-3 mr-1" />
              Mark Resolved
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkOperating}
              onClick={() => handleBulkStatusChange("open")}
              className="h-8 px-2.5 text-xs bg-background hover:bg-amber-50 text-amber-700 dark:text-amber-400 border-amber-300"
            >
              <AlertCircle className="size-3 mr-1" />
              Mark Open
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkOperating}
              onClick={() => handleBulkArchive(!currentArchived)}
              className="h-8 px-2.5 text-xs bg-background"
            >
              <Archive className="size-3 mr-1" />
              {currentArchived ? "Restore Selected" : "Archive Selected"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleExportCSV(true)}
              className="h-8 px-2.5 text-xs bg-background"
            >
              <Download className="size-3 mr-1" />
              Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* ── Content View: Table Ledger or Bento Grid ─────────────────── */}
      {viewMode === "table" ? (
        <Card className="rounded-xl border border-border/60 overflow-hidden shadow-2xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Inquiry Master Ledger
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {contacts.length} of {pagination.totalCount} messages
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
                        className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
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
                    <TableHead className="font-semibold text-xs text-foreground min-w-[200px]">
                      Sender Dossier
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground min-w-[140px]">
                      Subject
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground min-w-[220px]">
                      Message Preview
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground min-w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground min-w-[120px]">
                      Assignee
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-foreground min-w-[110px]">
                      Received
                    </TableHead>
                    <TableHead className="w-16 text-right font-semibold text-xs text-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-44 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground text-xs space-y-2">
                          <Inbox className="size-8 stroke-1 text-muted-foreground/60" />
                          <span className="font-semibold text-foreground text-sm">
                            No contact inquiries found
                          </span>
                          <span className="max-w-sm text-center">
                            No submissions match the current filters. Try changing your search or resetting filters.
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact, index) => {
                      const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
                      const isSelected = selectedIds.includes(contact.id)

                      return (
                        <TableRow
                          key={contact.id}
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
                            handleOpenContact(contact)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              const target = e.target as HTMLElement
                              if (target.tagName === "TR") {
                                e.preventDefault()
                                handleOpenContact(contact)
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
                              onClick={() => handleToggleSelectOne(contact.id)}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center p-1 rounded"
                              aria-label={`Select inquiry from ${contact.name}`}
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

                          {/* Sender Details */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:border-primary/40 transition-colors">
                                {getInitials(contact.name)}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs text-left truncate block max-w-[200px]">
                                  {contact.name}
                                </span>
                                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                                  <span>{contact.email}</span>
                                  {contact.phone && (
                                    <>
                                      <span>•</span>
                                      <span>{contact.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Subject */}
                          <TableCell>
                            <Badge variant="secondary" className="font-semibold text-xs truncate max-w-[140px] block">
                              {contact.subject}
                            </Badge>
                          </TableCell>

                          {/* Message Excerpt */}
                          <TableCell>
                            <p className="text-left text-xs text-muted-foreground group-hover:text-foreground/90 transition-colors line-clamp-1 max-w-[240px] block">
                              {contact.message}
                            </p>
                          </TableCell>

                          {/* Status */}
                          <TableCell>{getStatusBadge(contact.status)}</TableCell>

                          {/* Assignee */}
                          <TableCell>
                            {contact.assignee ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 border">
                                  {contact.assignee[0].toUpperCase()}
                                </div>
                                <span className="text-foreground truncate max-w-[110px] text-xs">
                                  {contact.assignee.split("@")[0]}
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
                            {new Date(contact.created_at).toLocaleDateString([], {
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
                                <DropdownMenuLabel>Inquiry Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleOpenContact(contact)}
                                  className="gap-2 cursor-pointer font-medium"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span>View & Reply</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {contact.status !== "resolved" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleStatusUpdate(contact.id, "resolved")}
                                    className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Mark Resolved</span>
                                  </DropdownMenuItem>
                                )}

                                {contact.status !== "open" && (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleStatusUpdate(contact.id, "open")}
                                    className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                  >
                                    <AlertCircle className="size-3.5" />
                                    <span>Mark Open</span>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => handleSingleArchive(contact.id, !contact.archived)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Archive className="size-3.5" />
                                  <span>{contact.archived ? "Restore to Active" : "Archive"}</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handleSingleDelete(contact.id, contact.name)}
                                  className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Delete Inquiry</span>
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
          {contacts.length === 0 ? (
            <div className="col-span-full p-12 text-center border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
              <Inbox className="size-8 stroke-1 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground text-sm">No contact inquiries found</p>
              <p>Try resetting filters or adjusting your search term.</p>
            </div>
          ) : (
            contacts.map((contact, index) => {
              const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
              const isSelected = selectedIds.includes(contact.id)

              return (
                <Card
                  key={contact.id}
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
                    handleOpenContact(contact)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const target = e.target as HTMLElement
                      if (!target.closest('button, a, input')) {
                        e.preventDefault()
                        handleOpenContact(contact)
                      }
                    }
                  }}
                  className={`group rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs flex flex-col cursor-pointer transition-all hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    styles.contactBentoCard
                  } ${isSelected ? "border-primary/60 ring-1 ring-primary/30" : ""}`}
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-10 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:border-primary/40 transition-colors">
                          {getInitials(contact.name)}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
                              #{sNo}
                            </span>
                            <h3 className="font-semibold text-sm text-foreground truncate block max-w-[150px] group-hover:text-primary transition-colors">
                              {contact.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate block">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(contact.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-3 flex-1 text-xs">
                    {/* Subject */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                        Subject
                      </span>
                      <p className="font-semibold text-foreground truncate">{contact.subject}</p>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Message
                      </span>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {contact.message}
                      </p>
                    </div>

                    {/* Metadata Strip */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                      </div>
                      <span>{contact.assignee ? contact.assignee.split("@")[0] : "Unassigned"}</span>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="size-8 rounded-lg border border-border/60 flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          title={`Call ${contact.phone}`}
                        >
                          <Phone className="size-3.5" />
                        </a>
                      )}

                      <a
                        href={`mailto:${contact.email}`}
                        className="size-8 rounded-lg border border-border/60 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                        title={`Email ${contact.email}`}
                      >
                        <Mail className="size-3.5" />
                      </a>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenContact(contact)}
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
          of <span className="font-semibold text-foreground">{pagination.totalCount}</span> inquiries
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

      {/* ── Contact Dossier & Reply Sheet ───────────────────────────── */}
      <ContactDetailSheet
        contact={activeContact}
        assignees={assignees}
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseContact()
          } else {
            setIsDetailOpen(true)
          }
        }}
        onUpdated={() => router.refresh()}
      />
    </div>
  )
}
