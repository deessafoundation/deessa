"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Users,
  Mail,
  Send,
  Plus,
  Download,
  Search,
  RotateCcw,
  CheckCircle2,
  Check,
  XCircle,
  MoreHorizontal,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { notifications } from "@/lib/notifications"
import type {
  FetchSubscribersResult,
  FetchCampaignsResult,
  NewsletterSubscriber,
  NewsletterCampaign,
} from "@/lib/data/newsletter"
import {
  toggleSubscriberStatus,
  deleteNewsletterSubscriber,
  bulkUpdateSubscriberStatus,
  bulkDeleteSubscribers,
} from "@/lib/actions/admin-newsletter"
import { deleteCampaignDraft } from "@/lib/actions/admin-campaigns"
import { AddSubscriberDialog } from "./add-subscriber-dialog"
import { SubscriberDetailSheet } from "./subscriber-detail-sheet"

interface NewsletterClientProps {
  initialSubscribersData: FetchSubscribersResult
  initialCampaignsData: FetchCampaignsResult
  adminEmail?: string
}

export function NewsletterClient({
  initialSubscribersData,
  initialCampaignsData,
}: NewsletterClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const { subscribers, stats, sources, pagination: subPagination } = initialSubscribersData
  const { campaigns } = initialCampaignsData

  // URL state
  const currentTab = searchParams.get("tab") || "subscribers"
  const currentStatus = searchParams.get("status") || "all"
  const currentSource = searchParams.get("source") || "all"
  const currentSearch = searchParams.get("search") || ""

  const [searchInput, setSearchInput] = useState(currentSearch)
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Dialog states
  const [isAddSubOpen, setIsAddSubOpen] = useState(false)
  const [selectedSubscriberDetail, setSelectedSubscriberDetail] = useState<NewsletterSubscriber | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<NewsletterSubscriber | null>(null)
  const [deleteCampaignCandidate, setDeleteCampaignCandidate] = useState<NewsletterCampaign | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // URL update helper
  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    })
    const query = params.toString() ? `?${params.toString()}` : ""
    startTransition(() => {
      router.push(`${pathname}${query}`, { scroll: false })
    })
  }

  // Search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ search: searchInput.trim(), page: "1" })
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput("")
    updateUrl({ search: null, status: null, source: null, page: "1" })
  }

  // Toggle single status
  const handleToggleStatus = (sub: NewsletterSubscriber) => {
    startTransition(async () => {
      const res = await toggleSubscriberStatus(sub.id, sub.status)
      if (res.success) {
        notifications.showSuccess(
          `Subscriber ${sub.email} marked as ${res.subscriber?.status === "active" ? "Active" : "Unsubscribed"}`
        )
      } else {
        notifications.showError(res.error || "Failed to update subscriber")
      }
    })
  }

  // Delete single subscriber
  const handleDeleteSubscriber = async () => {
    if (!deleteCandidate) return
    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(deleteCandidate.id)
      if (res.success) {
        notifications.showSuccess(`Deleted ${deleteCandidate.email}`)
        setDeleteCandidate(null)
      } else {
        notifications.showError(res.error || "Failed to delete subscriber")
      }
    })
  }

  // Delete campaign draft
  const handleDeleteCampaign = async () => {
    if (!deleteCampaignCandidate) return
    startTransition(async () => {
      const res = await deleteCampaignDraft(deleteCampaignCandidate.id)
      if (res.success) {
        notifications.showSuccess("Campaign draft removed")
        setDeleteCampaignCandidate(null)
      } else {
        notifications.showError(res.error || "Failed to delete campaign draft")
      }
    })
  }

  // Bulk status update
  const handleBulkStatus = (newStatus: "active" | "unsubscribed") => {
    if (selectedSubIds.length === 0) return
    startTransition(async () => {
      const res = await bulkUpdateSubscriberStatus(selectedSubIds, newStatus)
      if (res.success) {
        notifications.showSuccess(`Updated ${res.count} subscribers to ${newStatus}`)
        setSelectedSubIds([])
      } else {
        notifications.showError(res.error || "Failed to bulk update subscribers")
      }
    })
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedSubIds.length === 0) return
    startTransition(async () => {
      const res = await bulkDeleteSubscribers(selectedSubIds)
      if (res.success) {
        notifications.showSuccess(`Deleted ${res.count} subscribers`)
        setSelectedSubIds([])
        setIsBulkDeleting(false)
      } else {
        notifications.showError(res.error || "Failed to delete subscribers")
      }
    })
  }

  // Export CSV of current list
  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      notifications.showError("No subscriber records to export")
      return
    }

    const headers = ["Email", "Name", "Status", "Source", "Subscribed At", "Last Emailed At", "Emails Sent Count"]
    const rows = subscribers.map((s) => [
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      s.status,
      s.source,
      `"${s.subscribed_at}"`,
      `"${s.last_emailed_at || ""}"`,
      s.emails_sent_count,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notifications.showSuccess(`Exported ${subscribers.length} subscriber records`)
  }

  // Selection toggle
  const handleSelectAll = () => {
    if (selectedSubIds.length === subscribers.length) {
      setSelectedSubIds([])
    } else {
      setSelectedSubIds(subscribers.map((s) => s.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedSubIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Copy email
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    notifications.showSuccess("Email address copied to clipboard")
  }

  const activePercent =
    stats.totalSubscribers > 0 ? Math.round((stats.activeSubscribers / stats.totalSubscribers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Newsletter & Community Broadcasts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage subscriber directory, craft branded campaigns, and track broadcast analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            className="h-10 gap-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-muted/50 transition-all"
          >
            <Download className="size-4" />
            Export CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddSubOpen(true)}
            className="h-10 gap-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-muted/50 transition-all"
          >
            <Plus className="size-4" />
            Add Subscriber
          </Button>

          <Button
            type="button"
            onClick={() => {
              router.push("/admin/newsletter/campaigns/new")
            }}
            className="h-10 gap-2 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xs"
          >
            <Send className="size-4" />
            New Campaign Studio
          </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-border/80 hover:border-primary/30 transition-all duration-150">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Audience
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.totalSubscribers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">+{stats.newThisMonth}</span> joined this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:border-emerald-500/30 transition-all duration-150">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Delivery Base
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {stats.activeSubscribers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground font-semibold">{activePercent}%</strong> active opt-in rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:border-border transition-all duration-150">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Unsubscribed / Inactive
            </CardTitle>
            <XCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.unsubscribedCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Opted out via 1-click token
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 hover:border-primary/30 transition-all duration-150">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Broadcasts & Impact
            </CardTitle>
            <Send className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats.sentCampaigns} <span className="text-sm font-normal text-muted-foreground">sent</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground font-semibold">{stats.totalEmailsDelivered.toLocaleString()}</strong> emails delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dual-Tab Area */}
      <Tabs
        value={currentTab}
        onValueChange={(val) => updateUrl({ tab: val === "subscribers" ? null : val })}
        className="space-y-4"
      >
        <TabsList className="h-10">
          <TabsTrigger value="subscribers" className="text-xs font-semibold gap-1.5 px-4">
            <Users className="size-3.5" />
            Subscribers Directory ({stats.totalSubscribers})
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs font-semibold gap-1.5 px-4">
            <Send className="size-3.5" />
            Campaign Studio & History ({stats.totalCampaigns})
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SUBSCRIBERS ─────────────────────────────────────────── */}
        <TabsContent value="subscribers" className="space-y-4 mt-0">
          {/* Filter, Search & View Switcher Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-xl border border-border shadow-2xs">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or subscriber name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select
                value={currentStatus}
                onValueChange={(val) => updateUrl({ status: val, page: "1" })}
              >
                <SelectTrigger className="h-9 text-xs w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select
                value={currentSource}
                onValueChange={(val) => updateUrl({ source: val, page: "1" })}
              >
                <SelectTrigger className="h-9 text-xs w-[140px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {sources.map((src) => (
                    <SelectItem key={src} value={src} className="capitalize">
                      {src.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Switcher Toggle (Desktop) */}
              <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`size-7 rounded flex items-center justify-center transition-colors ${
                    viewMode === "table" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table View"
                >
                  <List className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`size-7 rounded flex items-center justify-center transition-colors ${
                    viewMode === "cards" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
              </div>

              {(currentSearch || currentStatus !== "all" || currentSource !== "all") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedSubIds.length > 0 && (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
              <span className="text-xs font-semibold text-primary">
                {selectedSubIds.length} subscriber{selectedSubIds.length > 1 ? "s" : ""} selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus("active")}
                  className="h-8 text-xs font-medium"
                >
                  Set Active
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus("unsubscribed")}
                  className="h-8 text-xs font-medium"
                >
                  Set Unsubscribed
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleting(true)}
                  className="h-8 text-xs font-medium gap-1"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* ── SUBSCRIBERS TABLE VIEW (Desktop / Tablet when table is active) ── */}
          {viewMode === "table" ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Card className="border-border shadow-xs overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-10 text-center">
                            <button
                              type="button"
                              onClick={handleSelectAll}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                            >
                              {selectedSubIds.length === subscribers.length && subscribers.length > 0 ? (
                                <CheckSquare className="size-4 text-primary" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="w-16 font-bold text-xs uppercase tracking-wider">S.No</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider">Subscriber</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider">Channel</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider">Subscribed</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider">Last Emailed</TableHead>
                          <TableHead className="w-16 text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                              No subscribers found matching your criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscribers.map((subscriber, idx) => {
                            const sNo = (subPagination.page - 1) * subPagination.pageSize + idx + 1
                            const isSelected = selectedSubIds.includes(subscriber.id)

                            return (
                              <TableRow
                                key={subscriber.id}
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
                                  setSelectedSubscriberDetail(subscriber)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    setSelectedSubscriberDetail(subscriber)
                                  }
                                }}
                                className={`cursor-pointer group hover:bg-muted/40 transition-all duration-150 ${
                                  isSelected ? "bg-primary/5" : ""
                                }`}
                              >
                                <TableCell className="text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSelect(subscriber.id)}
                                    className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="size-4 text-primary" />
                                    ) : (
                                      <Square className="size-4" />
                                    )}
                                  </button>
                                </TableCell>

                                <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                                  {sNo}
                                </TableCell>

                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                      <Mail className="size-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                                      {subscriber.email}
                                    </span>
                                    {subscriber.name && (
                                      <span className="text-xs text-muted-foreground pl-5">{subscriber.name}</span>
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  {subscriber.status === "active" ? (
                                    <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[11px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10">
                                      <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                                        <Check className="size-2 stroke-[3]" />
                                      </span>
                                      Active
                                    </Badge>
                                  ) : subscriber.status === "bounced" ? (
                                    <Badge variant="destructive" className="font-medium text-[11px] gap-1">
                                      <XCircle className="size-3" />
                                      Bounced
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground font-medium text-[11px] gap-1">
                                      <XCircle className="size-3" />
                                      Unsubscribed
                                    </Badge>
                                  )}
                                </TableCell>

                                <TableCell>
                                  <span className="capitalize text-xs font-medium text-muted-foreground">
                                    {subscriber.source.replace(/_/g, " ")}
                                  </span>
                                </TableCell>

                                <TableCell>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="size-3.5" />
                                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <span className="text-xs text-muted-foreground">
                                    {subscriber.last_emailed_at
                                      ? new Date(subscriber.last_emailed_at).toLocaleDateString()
                                      : "Never"}
                                  </span>
                                </TableCell>

                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="size-8">
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel className="text-xs">Subscriber Options</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setSelectedSubscriberDetail(subscriber)}
                                        className="text-xs cursor-pointer"
                                      >
                                        <Eye className="mr-2 size-3.5" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleStatus(subscriber)}
                                        className="text-xs cursor-pointer"
                                      >
                                        <RefreshCw className="mr-2 size-3.5" />
                                        {subscriber.status === "active" ? "Mark as Unsubscribed" : "Reactivate Subscription"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleCopyEmail(subscriber.email)}
                                        className="text-xs cursor-pointer"
                                      >
                                        <Copy className="mr-2 size-3.5" />
                                        Copy Email
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setDeleteCandidate(subscriber)}
                                        className="text-xs cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 size-3.5" />
                                        Delete Subscriber
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
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Cards (Shown on mobile when viewMode is table) */}
              <div className="block sm:hidden space-y-3">
                {subscribers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No subscribers found matching your criteria.
                  </div>
                ) : (
                  subscribers.map((subscriber, idx) => {
                    const sNo = (subPagination.page - 1) * subPagination.pageSize + idx + 1
                    const isSelected = selectedSubIds.includes(subscriber.id)

                    return (
                      <div
                        key={subscriber.id}
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
                          setSelectedSubscriberDetail(subscriber)
                        }}
                        className={`rounded-2xl border border-border/80 bg-card p-4 shadow-2xs hover:shadow-md hover:border-primary/40 active:scale-[0.99] transition-all duration-150 cursor-pointer group ${
                          isSelected ? "bg-primary/5 border-primary/40" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(subscriber.id)}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center p-0.5"
                            >
                              {isSelected ? (
                                <CheckSquare className="size-4 text-primary" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                            <span className="font-mono text-xs text-muted-foreground font-semibold">
                              #{sNo}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {subscriber.status === "active" ? (
                              <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[10px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10">
                                <span className="flex size-2.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                                  <Check className="size-1.5 stroke-[3]" />
                                </span>
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground font-medium text-[10px] gap-1">
                                <XCircle className="size-2.5" />
                                Unsubscribed
                              </Badge>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground capitalize">
                              {subscriber.source.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {subscriber.email}
                          </div>
                          {subscriber.name && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {subscriber.name}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(subscriber)}
                              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              <RefreshCw className="size-3 mr-1" />
                              Toggle
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedSubscriberDetail(subscriber)}
                              className="size-7 text-primary"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            /* ── SUBSCRIBERS BENTO CARDS VIEW (All Viewports when cards is selected) ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribers.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  No subscribers found matching your criteria.
                </div>
              ) : (
                subscribers.map((subscriber, idx) => {
                  const sNo = (subPagination.page - 1) * subPagination.pageSize + idx + 1
                  const isSelected = selectedSubIds.includes(subscriber.id)

                  return (
                    <div
                      key={subscriber.id}
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
                        setSelectedSubscriberDetail(subscriber)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setSelectedSubscriberDetail(subscriber)
                        }
                      }}
                      className={`rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 active:scale-[0.99] transition-all duration-150 cursor-pointer group flex flex-col justify-between ${
                        isSelected ? "bg-primary/5 border-primary/40" : ""
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(subscriber.id)}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center p-0.5"
                            >
                              {isSelected ? (
                                <CheckSquare className="size-4 text-primary" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                            <span className="font-mono text-xs text-muted-foreground font-semibold">
                              #{sNo}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {subscriber.status === "active" ? (
                              <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[10px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10">
                                <span className="flex size-2.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                                  <Check className="size-1.5 stroke-[3]" />
                                </span>
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground font-medium text-[10px] gap-1">
                                <XCircle className="size-2.5" />
                                Unsubscribed
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5">
                            <Mail className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                            {subscriber.email}
                          </div>
                          {subscriber.name ? (
                            <div className="text-xs text-muted-foreground truncate pl-5 mt-0.5">
                              {subscriber.name}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/60 italic pl-5 mt-0.5">
                              No name provided
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                          <div className="rounded-lg bg-muted/40 p-2 space-y-0.5">
                            <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">Channel</span>
                            <span className="font-medium text-foreground capitalize truncate block">
                              {subscriber.source.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2 space-y-0.5">
                            <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">Delivered</span>
                            <span className="font-medium text-foreground block">
                              {subscriber.emails_sent_count} broadcasts
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="size-3" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(subscriber)}
                            className="h-7 px-2 text-[11px]"
                          >
                            <RefreshCw className="size-3 mr-1" />
                            Toggle
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedSubscriberDetail(subscriber)}
                            className="size-7 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Pagination */}
          {subPagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-2">
              <span>
                Showing page {subPagination.page} of {subPagination.totalPages} ({subPagination.totalCount} subscribers)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subPagination.page <= 1 || isPending}
                  onClick={() => updateUrl({ page: String(subPagination.page - 1) })}
                  className="h-8 text-xs hover:border-primary/40 hover:bg-muted/50"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subPagination.page >= subPagination.totalPages || isPending}
                  onClick={() => updateUrl({ page: String(subPagination.page + 1) })}
                  className="h-8 text-xs hover:border-primary/40 hover:bg-muted/50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: CAMPAIGN STUDIO ────────────────────────────────────── */}
        <TabsContent value="campaigns" className="space-y-4 mt-0">
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border bg-muted/20">
              <div>
                <CardTitle className="text-base font-bold">Campaign Broadcast History</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any campaign to inspect delivery logs, preview formatting, or edit drafts.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  router.push("/admin/newsletter/campaigns/new")
                }}
                className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Send className="size-3.5" />
                Compose in Studio
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16 font-bold text-xs uppercase tracking-wider">S.No</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Campaign & Subject</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Audience / Delivery</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Sent Date</TableHead>
                      <TableHead className="w-20 text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                          No campaigns drafted yet. Click &quot;Compose New&quot; to create your first bulletin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((camp, idx) => (
                        <TableRow
                          key={camp.id}
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
                            router.push(`/admin/newsletter/campaigns/${camp.id}`)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              router.push(`/admin/newsletter/campaigns/${camp.id}`)
                            }
                          }}
                          className="cursor-pointer group hover:bg-muted/40 transition-all duration-150"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {camp.title}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {camp.subject}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {camp.status === "sent" ? (
                              <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[11px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10">
                                <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                                  <Check className="size-2 stroke-[3]" />
                                </span>
                                Broadcasted
                              </Badge>
                            ) : camp.status === "sending" ? (
                              <Badge className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 font-medium text-[11px] gap-1">
                                <RefreshCw className="size-3 animate-spin" />
                                Broadcasting...
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-medium text-[11px]">
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {camp.status === "sent" ? (
                              <div className="text-xs text-foreground">
                                <strong className="text-emerald-600 font-semibold">{camp.success_count}</strong> sent
                                {camp.failure_count > 0 && (
                                  <span className="text-destructive ml-1">({camp.failure_count} failed)</span>
                                )}
                                <span className="text-muted-foreground block text-[11px]">of {camp.recipients_count} active</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Draft — not sent</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {camp.sent_at ? new Date(camp.sent_at).toLocaleDateString() : "Draft"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    router.push(`/admin/newsletter/campaigns/${camp.id}`)
                                  }}
                                  className="text-xs cursor-pointer"
                                >
                                  <Sparkles className="mr-2 size-3.5" />
                                  {camp.status === "sent" ? "View in Studio" : "Edit in Studio"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    router.push(`/admin/newsletter/campaigns/new?duplicateFrom=${camp.id}`)
                                  }}
                                  className="text-xs cursor-pointer"
                                >
                                  <Copy className="mr-2 size-3.5" />
                                  Duplicate as New Draft
                                </DropdownMenuItem>
                                {camp.status !== "sent" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteCampaignCandidate(camp)}
                                      className="text-xs cursor-pointer text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 size-3.5" />
                                      Delete Draft
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Campaigns Cards */}
              <div className="block sm:hidden divide-y divide-border">
                {campaigns.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No campaigns drafted yet. Click &quot;Compose New&quot; to create your first bulletin.
                  </div>
                ) : (
                  campaigns.map((camp, idx) => (
                    <div
                      key={camp.id}
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
                        router.push(`/admin/newsletter/campaigns/${camp.id}`)
                      }}
                      className="p-4 hover:bg-muted/40 transition-all duration-150 cursor-pointer group space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          #{idx + 1}
                        </span>
                        {camp.status === "sent" ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[10px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10">
                            <span className="flex size-2.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                              <Check className="size-1.5 stroke-[3]" />
                            </span>
                            Broadcasted
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-medium text-[10px]">
                            Draft
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {camp.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {camp.subject}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>
                          {camp.status === "sent" ? `${camp.success_count} delivered` : "Not broadcast"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            router.push(`/admin/newsletter/campaigns/${camp.id}`)
                          }}
                          className="h-7 px-2 text-xs text-primary"
                        >
                          <Eye className="size-3.5 mr-1" />
                          {camp.status === "sent" ? "View" : "Edit"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscriber Detail Sheet */}
      <SubscriberDetailSheet
        subscriber={selectedSubscriberDetail}
        isOpen={Boolean(selectedSubscriberDetail)}
        onOpenChange={(open) => !open && setSelectedSubscriberDetail(null)}
        onDelete={(sub) => setDeleteCandidate(sub)}
        onUpdated={() => router.refresh()}
      />

      {/* Add Subscriber Dialog */}
      <AddSubscriberDialog
        isOpen={isAddSubOpen}
        onOpenChange={setIsAddSubOpen}
        onSuccess={() => router.refresh()}
      />


      {/* Delete Single Subscriber Confirmation */}
      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Subscriber Record?</DialogTitle>
            <DialogDescription className="text-xs">
              This will permanently delete <strong className="text-foreground">{deleteCandidate?.email}</strong> from your mailing list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubscriber}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Subscribers Confirmation */}
      <Dialog open={isBulkDeleting} onOpenChange={setIsBulkDeleting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Selected Subscribers?</DialogTitle>
            <DialogDescription className="text-xs">
              You are about to permanently delete <strong className="text-foreground">{selectedSubIds.length} subscribers</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkDeleting(false)}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              {isPending ? "Deleting..." : `Delete ${selectedSubIds.length} Subscribers`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Draft Confirmation */}
      <Dialog open={Boolean(deleteCampaignCandidate)} onOpenChange={(open) => !open && setDeleteCampaignCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Campaign Draft?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to discard &quot;{deleteCampaignCandidate?.title}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCampaignCandidate(null)}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              {isPending ? "Deleting..." : "Discard Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
