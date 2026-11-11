"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  UserPlus,
  LayoutGrid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { useRouter } from "next/navigation"
import type { VolunteerApplication, VolunteerStats } from "@/lib/data/volunteers"
import {
  updateVolunteerApplication,
  bulkUpdateVolunteerStatus,
  deleteVolunteerApplication,
} from "@/lib/actions/admin-volunteers"
import { VolunteerDetailSheet } from "./volunteer-detail-sheet"
import { ManualVolunteerModal } from "./manual-volunteer-modal"
import styles from "./volunteers.module.css"

interface VolunteersClientProps {
  initialVolunteers: VolunteerApplication[]
  stats: VolunteerStats
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  initialFilters: {
    search: string
    status: string
    skill: string
    availability: string
  }
}

const SKILL_FILTER_OPTIONS = [
  "Teaching/Education",
  "Healthcare/Medical",
  "IT/Technology",
  "Marketing/Communications",
  "Finance/Accounting",
  "Project Management",
  "Construction/Building",
  "Photography/Videography",
  "Legal",
  "Languages/Translation",
]

const AVAILABILITY_OPTIONS = [
  "Flexible",
  "Weekends",
  "Part-time",
  "Full-time",
  "Emergency",
]

export function VolunteersClient({
  initialVolunteers,
  stats,
  pagination,
  initialFilters,
}: VolunteersClientProps) {
  const router = useRouter()

  const volunteers = initialVolunteers
  const [searchTerm, setSearchTerm] = useState(initialFilters.search)
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || "all")
  const [skillFilter, setSkillFilter] = useState(initialFilters.skill || "all")
  const [availFilter, setAvailFilter] = useState(initialFilters.availability || "all")
  const [viewMode, setViewMode] = useState<"table" | "bento">("table")

  // Selected applicants for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkActioning, setIsBulkActioning] = useState(false)

  // Modals state
  const [activeVolunteer, setActiveVolunteer] = useState<VolunteerApplication | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VolunteerApplication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    notifications.showSuccess("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const applyFilters = (overrides?: {
    newStatus?: string
    newSkill?: string
    newAvail?: string
    newPage?: number
  }) => {
    const params = new URLSearchParams()
    const targetSearch = searchTerm.trim()
    const targetStatus = overrides?.newStatus !== undefined ? overrides.newStatus : statusFilter
    const targetSkill = overrides?.newSkill !== undefined ? overrides.newSkill : skillFilter
    const targetAvail = overrides?.newAvail !== undefined ? overrides.newAvail : availFilter
    const targetPage = overrides?.newPage !== undefined ? overrides.newPage : 1

    if (targetSearch) params.set("search", targetSearch)
    if (targetStatus && targetStatus !== "all") params.set("status", targetStatus)
    if (targetSkill && targetSkill !== "all") params.set("skill", targetSkill)
    if (targetAvail && targetAvail !== "all") params.set("availability", targetAvail)
    if (targetPage > 1) params.set("page", targetPage.toString())

    router.push(`/admin/volunteers?${params.toString()}`)
  }

  const handleSearch = () => {
    applyFilters({ newPage: 1 })
  }

  const handleScopeTab = (tab: string) => {
    setStatusFilter(tab)
    applyFilters({ newStatus: tab, newPage: 1 })
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setSkillFilter("all")
    setAvailFilter("all")
    router.push("/admin/volunteers")
  }

  // Row selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === volunteers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(volunteers.map((v) => v.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Quick single status change
  const handleQuickStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await updateVolunteerApplication({ id, status: newStatus })
      if (res.success) {
        notifications.showSuccess(`Application marked as ${newStatus}`)
        router.refresh()
      } else {
        notifications.showError(`Update failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Failed to update status")
    }
  }

  // Bulk actions
  const handleBulkStatus = async (newStatus: "approved" | "rejected") => {
    if (selectedIds.length === 0) return
    setIsBulkActioning(true)
    try {
      const res = await bulkUpdateVolunteerStatus(selectedIds, newStatus)
      if (res.success) {
        notifications.showSuccess(`Updated ${res.count} volunteer applications to ${newStatus}`)
        setSelectedIds([])
        router.refresh()
      } else {
        notifications.showError(`Bulk update failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Bulk action failed")
    } finally {
      setIsBulkActioning(false)
    }
  }

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteVolunteerApplication(deleteTarget.id)
      if (res.success) {
        notifications.showSuccess("Volunteer record removed")
        setDeleteTarget(null)
        router.refresh()
      } else {
        notifications.showError(`Delete failed: ${res.error}`)
      }
    } catch {
      notifications.showError("Failed to delete record")
    } finally {
      setIsDeleting(false)
    }
  }

  // CSV Export
  const handleExportCSV = (recordsToExport: VolunteerApplication[] = volunteers) => {
    if (recordsToExport.length === 0) {
      notifications.showError("No volunteer records to export")
      return
    }

    const headers = [
      "S.No",
      "Full Name",
      "Email",
      "Phone",
      "Occupation",
      "Availability",
      "Skills",
      "Interests",
      "Status",
      "Applied At",
      "Assigned Department",
      "Admin Notes",
    ]

    const rows = recordsToExport.map((v, i) => [
      (pagination.page - 1) * pagination.pageSize + i + 1,
      v.full_name,
      v.email,
      v.phone,
      v.occupation || "N/A",
      v.availability,
      (v.skills || []).join("; "),
      (v.interests || []).join("; "),
      v.status,
      new Date(v.applied_at).toLocaleString(),
      v.assigned_role || "N/A",
      v.admin_notes || "",
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `volunteers-roster-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    notifications.showSuccess(`Exported ${recordsToExport.length} volunteer records to CSV`)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2 py-0.5 capitalize ${styles.badgeApproved}`}>
            <CheckCircle2 className="size-3 mr-1 inline" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2 py-0.5 capitalize ${styles.badgeRejected}`}>
            <XCircle className="size-3 mr-1 inline" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className={`font-semibold text-xs px-2 py-0.5 capitalize ${styles.badgePending}`}>
            <Clock className="size-3 mr-1 inline" />
            Pending
          </Badge>
        )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* ── 4 KPI Stat Rail ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Applications */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Applicants</span>
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users2 className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">All-time applications</p>
          </CardHeader>
        </Card>

        {/* Pending Review */}
        <Card className={`rounded-xl border shadow-2xs ${styles.kpiCard} ${stats.pending > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 bg-card/60"}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Review</span>
              <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 relative">
                <Clock className="size-3.5" />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
              {stats.pending.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting staff decision</p>
          </CardHeader>
        </Card>

        {/* Approved Active */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved Active</span>
              <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.approved.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for deployment</p>
          </CardHeader>
        </Card>

        {/* Top Skill Category */}
        <Card className={`rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs ${styles.kpiCard}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Top Skill Pool</span>
              <div className="size-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Sparkles className="size-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate mt-1">
              {stats.topSkill?.name || "General"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.topSkill ? `${stats.topSkill.count} candidate(s) equipped` : "Skills catalog ready"}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* ── Scope Tabs & Controls ───────────────────────────────────── */}
      <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top Row: Scope Tabs & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Shimmer Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/40 w-fit">
              {[
                { id: "all", label: "All Applicants", count: stats.total },
                { id: "pending", label: "Pending", count: stats.pending },
                { id: "approved", label: "Approved", count: stats.approved },
                { id: "rejected", label: "Archived / Rejected", count: stats.rejected },
              ].map((tab) => {
                const isActive = statusFilter === tab.id
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

            {/* Top Right Actions: Register Volunteer & Export CSV & View Toggle */}
            <div className="flex items-center gap-2 self-start lg:self-center">
              <Button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                size="sm"
                className="h-9 px-3 text-xs font-semibold"
              >
                <UserPlus className="size-3.5 mr-1.5" />
                Register Volunteer
              </Button>

              <Button
                type="button"
                onClick={() => handleExportCSV()}
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-medium"
              >
                <Download className="size-3.5 mr-1.5" />
                Export CSV
              </Button>

              {/* View Switcher */}
              <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-background">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${viewMode === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Table Ledger View"
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("bento")}
                  className={`p-1.5 rounded ${viewMode === "bento" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Bento Card View"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Filters (Search, Skill, Availability) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-border/40">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate name, email, phone, or occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 h-10 text-xs bg-background/60"
              />
            </div>

            {/* Skill Selector */}
            <div className="w-full sm:w-[200px]">
              <Select
                value={skillFilter}
                onValueChange={(val) => {
                  setSkillFilter(val)
                  applyFilters({ newSkill: val, newPage: 1 })
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-background/60 w-full">
                  <SelectValue placeholder="Skill: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skill Sets</SelectItem>
                  {SKILL_FILTER_OPTIONS.map((sk) => (
                    <SelectItem key={sk} value={sk}>
                      {sk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability Selector */}
            <div className="w-full sm:w-[170px]">
              <Select
                value={availFilter}
                onValueChange={(val) => {
                  setAvailFilter(val)
                  applyFilters({ newAvail: val, newPage: 1 })
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-background/60 w-full">
                  <SelectValue placeholder="Availability: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  {AVAILABILITY_OPTIONS.map((av) => (
                    <SelectItem key={av} value={av}>
                      {av}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSearch} className="h-10 px-4 text-xs flex-1 sm:flex-none">
                <Search className="size-3.5 mr-1" />
                Filter
              </Button>
              {(searchTerm || statusFilter !== "all" || skillFilter !== "all" || availFilter !== "all") && (
                <Button onClick={handleResetFilters} variant="ghost" className="h-10 px-3 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bulk Actions Bar (Appears when items are selected) ───────── */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl border border-primary/30 bg-primary/10 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedIds.length} candidate{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-muted-foreground hover:text-foreground underline"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => handleBulkStatus("approved")}
              disabled={isBulkActioning}
              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Approve Selected ({selectedIds.length})
            </Button>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => handleBulkStatus("rejected")}
              disabled={isBulkActioning}
              className="h-8 px-3 text-xs font-medium"
            >
              <XCircle className="size-3.5 mr-1" />
              Reject Selected
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const selectedList = volunteers.filter((v) => selectedIds.includes(v.id))
                handleExportCSV(selectedList)
              }}
              className="h-8 px-3 text-xs font-medium"
            >
              <Download className="size-3.5 mr-1" />
              Export Selected CSV
            </Button>
          </div>
        </div>
      )}

      {/* ── Content View: Table or Bento Cards ──────────────────────── */}
      {volunteers.length === 0 ? (
        <Card className="rounded-xl border border-border/60 p-12 text-center space-y-3">
          <div className="size-12 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center mx-auto">
            <Users2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No volunteer applications found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No applications match your active search or scope filters. You can register an applicant manually or reset filters.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button onClick={() => setIsManualModalOpen(true)} size="sm" className="h-8 text-xs">
              <UserPlus className="size-3.5 mr-1" />
              Register Volunteer
            </Button>
            {(searchTerm || statusFilter !== "all" || skillFilter !== "all" || availFilter !== "all") && (
              <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-8 text-xs">
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {/* Select All Checkbox */}
                  <TableHead className="w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="p-1 rounded hover:bg-muted text-muted-foreground"
                    >
                      {selectedIds.length === volunteers.length ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </TableHead>

                  {/* S.No Header - MANDATORY RULE */}
                  <TableHead className="w-16 font-semibold text-xs text-foreground">S.No</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground min-w-[200px]">Candidate Dossier</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground min-w-[140px]">Availability</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground min-w-[180px]">Skills & Interests</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground w-28">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground w-32">Applied Date</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-foreground w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border/40">
                {volunteers.map((volunteer, index) => {
                  const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
                  const isSelected = selectedIds.includes(volunteer.id)

                  return (
                    <TableRow
                      key={volunteer.id}
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
                        setActiveVolunteer(volunteer)
                        setIsDetailOpen(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          const target = e.target as HTMLElement
                          if (target.tagName === "TR") {
                            e.preventDefault()
                            setActiveVolunteer(volunteer)
                            setIsDetailOpen(true)
                          }
                        }
                      }}
                      className={`group hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Row Checkbox */}
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(volunteer.id)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                          aria-label={`Select row for ${volunteer.full_name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </TableCell>

                      {/* Explicit S.No Column */}
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {sNo}
                      </TableCell>

                      {/* Candidate Dossier */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:border-primary/40 transition-colors">
                            {getInitials(volunteer.full_name)}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs text-left truncate block max-w-[200px]">
                              {volunteer.full_name}
                            </span>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                              <span>{volunteer.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(volunteer.email, `email-${volunteer.id}`)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Copy Email"
                              >
                                {copiedId === `email-${volunteer.id}` ? (
                                  <Check className="size-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="size-2.5" />
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <a href={`tel:${volunteer.phone}`} className="hover:text-primary">
                                {volunteer.phone}
                              </a>
                              {volunteer.occupation && <span>• {volunteer.occupation}</span>}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Availability */}
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-medium bg-muted/40 flex items-center gap-1 w-fit">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{volunteer.availability}</span>
                        </Badge>
                        {volunteer.assigned_role && (
                          <div className="text-[10px] text-primary font-medium mt-1 truncate max-w-[140px]">
                            Pool: {volunteer.assigned_role}
                          </div>
                        )}
                      </TableCell>

                      {/* Skills & Interests */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills?.slice(0, 2).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-[10px] bg-primary/5 text-foreground border-primary/15 px-1.5 py-0"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {(volunteer.skills?.length || 0) > 2 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                +{(volunteer.skills?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                          {(volunteer.interests?.length || 0) > 0 && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                              Interests: {volunteer.interests?.slice(0, 2).join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(volunteer.status)}</TableCell>

                      {/* Applied Date */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">
                          {new Date(volunteer.applied_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(volunteer.applied_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveVolunteer(volunteer)
                              setIsDetailOpen(true)
                            }}
                            className="h-8 px-2.5 text-xs font-medium"
                          >
                            <Eye className="size-3.5 mr-1" />
                            Review
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="size-8 p-0">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem
                                onClick={() => {
                                  setActiveVolunteer(volunteer)
                                  setIsDetailOpen(true)
                                }}
                              >
                                <Eye className="size-3.5 mr-2" />
                                Inspect Full Dossier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {volunteer.status !== "approved" && (
                                <DropdownMenuItem onClick={() => handleQuickStatus(volunteer.id, "approved")}>
                                  <CheckCircle2 className="size-3.5 mr-2 text-emerald-600" />
                                  Quick Approve
                                </DropdownMenuItem>
                              )}
                              {volunteer.status !== "rejected" && (
                                <DropdownMenuItem onClick={() => handleQuickStatus(volunteer.id, "rejected")}>
                                  <XCircle className="size-3.5 mr-2 text-red-600" />
                                  Quick Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(volunteer)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Delete Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-3.5 sm:p-4 border-t border-border/40 bg-muted/15 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} applicants
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
                  disabled={pagination.page >= pagination.totalPages}
                  className="h-8 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* BENTO CARDS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((volunteer, index) => {
              const sNo = (pagination.page - 1) * pagination.pageSize + index + 1
              const isSelected = selectedIds.includes(volunteer.id)

              return (
                <Card
                  key={volunteer.id}
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
                    setActiveVolunteer(volunteer)
                    setIsDetailOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const target = e.target as HTMLElement
                      if (!target.closest('button, a, input')) {
                        e.preventDefault()
                        setActiveVolunteer(volunteer)
                        setIsDetailOpen(true)
                      }
                    }
                  }}
                  className={`group rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    styles.volunteerBentoCard
                  } ${isSelected ? "border-primary/50 bg-primary/[0.02]" : ""}`}
                >
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-10 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 group-hover:border-primary/40 transition-colors">
                          {getInitials(volunteer.full_name)}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
                              #{sNo}
                            </span>
                            <h3 className="font-semibold text-sm text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">
                              {volunteer.full_name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {volunteer.occupation || "Community Volunteer"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(volunteer.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                    {/* Contact Pills */}
                    <div className="space-y-1.5 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <a href={`mailto:${volunteer.email}`} className="hover:text-primary truncate max-w-[200px] flex items-center gap-1.5">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{volunteer.email}</span>
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <a href={`tel:${volunteer.phone}`} className="hover:text-primary flex items-center gap-1.5">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{volunteer.phone}</span>
                        </a>
                        <Badge variant="outline" className="text-[10px] bg-muted/40 font-mono">
                          {volunteer.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills?.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px] bg-primary/5 text-foreground border-primary/20 px-1.5 py-0"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {(volunteer.skills?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            +{(volunteer.skills?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Message Excerpt */}
                    {volunteer.message && (
                      <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground italic line-clamp-2">
                        &ldquo;{volunteer.message}&rdquo;
                      </div>
                    )}
                  </CardContent>

                  {/* Card Bottom Bar */}
                  <div className="p-3.5 sm:p-4 border-t border-border/40 bg-muted/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Applied {new Date(volunteer.applied_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setActiveVolunteer(volunteer)
                        setIsDetailOpen(true)
                      }}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Inspect Dossier
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Pagination Footer for Bento View */}
          {pagination.totalPages > 1 && (
            <div className="p-4 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} items)
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
                  disabled={pagination.page >= pagination.totalPages}
                  className="h-8 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Detail Drawer / Modal ────────────────────────────────────── */}
      <VolunteerDetailSheet
        volunteer={activeVolunteer}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdated={() => router.refresh()}
      />

      {/* ── Manual Volunteer Registration Modal ──────────────────────── */}
      <ManualVolunteerModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        onCreated={() => router.refresh()}
      />

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold">Delete Volunteer Application</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to permanently delete the application for{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.full_name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
