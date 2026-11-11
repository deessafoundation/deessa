"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  RotateCw,
  Globe,
  Copy,
  Table as TableIcon,
  LayoutGrid,
  Handshake,
  Heart,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  type PartnerWithUsage,
  type EventOption,
  togglePartnerPublishedAction,
  deletePartner,
  promotePartnerToGlobalAction,
} from "@/lib/actions/admin-partners"
import { PartnerModal } from "./partner-modal"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./partners.module.css"

export type DirectoryScope = "global" | "events" | "all"
type PartnerTypeFilter = "all" | "partner" | "sponsor" | "donor"
type StatusFilter = "all" | "published" | "hidden"
type SortOption = "name-asc" | "name-desc" | "newest" | "oldest" | "usage"

interface PartnersListClientProps {
  initialPartners: PartnerWithUsage[]
  initialEvents?: EventOption[]
}

function parsePartnerDescriptionText(descriptionStr?: string | null): string {
  if (!descriptionStr) return ""
  try {
    if (descriptionStr.startsWith("{")) {
      const parsed = JSON.parse(descriptionStr)
      return parsed.text || ""
    }
  } catch {
    // fallback to raw
  }
  return descriptionStr
}

export function PartnersListClient({ initialPartners, initialEvents = [] }: PartnersListClientProps) {
  const router = useRouter()
  const [partners, setPartners] = useState<PartnerWithUsage[]>(initialPartners)
  const [prevInitial, setPrevInitial] = useState(initialPartners)
  const [isPending, startTransition] = useTransition()

  // Sync state if server props change
  if (initialPartners !== prevInitial) {
    setPrevInitial(initialPartners)
    setPartners(initialPartners)
  }

  // Scope & Filters
  const [selectedScope, setSelectedScope] = useState<DirectoryScope>("global")
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<PartnerTypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("name-asc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Modal & Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerWithUsage | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PartnerWithUsage | null>(null)
  const [pendingPromote, setPendingPromote] = useState<PartnerWithUsage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)

  // Compile distinct events from initialEvents and partner event links
  const events = useMemo(() => {
    const map = new Map<string, EventOption>()
    initialEvents.forEach((ev) => {
      map.set(ev.id, { ...ev })
    })

    partners.forEach((p) => {
      p.event_links?.forEach((link) => {
        if (!map.has(link.event_id)) {
          map.set(link.event_id, {
            id: link.event_id,
            title: link.event_title,
            slug: link.event_slug,
            partner_count: 0,
          })
        }
      })
    })

    const result = Array.from(map.values()).map((ev) => {
      const count = partners.filter(
        (p) =>
          p.created_context_id === ev.id ||
          p.event_links?.some((l) => l.event_id === ev.id)
      ).length
      return { ...ev, partner_count: count }
    })

    return result.sort((a, b) => b.partner_count - a.partner_count)
  }, [initialEvents, partners])

  // Count totals for Scope Tabs
  const counts = useMemo(() => {
    const globalCount = partners.filter(
      (p) => !p.created_context_type || p.created_context_type !== "event"
    ).length
    const eventCount = partners.filter(
      (p) => p.created_context_type === "event" || (p.event_links && p.event_links.length > 0)
    ).length
    const allCount = partners.length

    return {
      global: globalCount,
      events: eventCount,
      all: allCount,
    }
  }, [partners])

  // Dynamic KPI Calculations based on selectedScope & selectedEventId
  const stats = useMemo(() => {
    const pool = partners.filter((p) => {
      if (selectedScope === "global") {
        return !p.created_context_type || p.created_context_type !== "event"
      }
      if (selectedScope === "events") {
        if (selectedEventId !== "all") {
          return (
            p.created_context_id === selectedEventId ||
            p.event_links?.some((l) => l.event_id === selectedEventId)
          )
        }
        return p.created_context_type === "event" || (p.event_links && p.event_links.length > 0)
      }
      return true
    })

    const total = pool.length
    const published = pool.filter((p) => p.is_published).length
    const sponsorsAndDonors = pool.filter((p) => p.type === "sponsor" || p.type === "donor").length
    const crossLinked = pool.filter(
      (p) => (p.usage_count || 0) > 0 || (p.event_links && p.event_links.length > 0)
    ).length
    const liveRate = total > 0 ? Math.round((published / total) * 100) : 0

    return { total, published, sponsorsAndDonors, crossLinked, liveRate }
  }, [partners, selectedScope, selectedEventId])

  // Filtering & Sorting
  const filteredPartners = useMemo(() => {
    const q = search.trim().toLowerCase()

    const result = partners.filter((p) => {
      // 1. Scope filter
      if (selectedScope === "global") {
        if (p.created_context_type === "event") return false
      } else if (selectedScope === "events") {
        const isEventPartner =
          p.created_context_type === "event" || (p.event_links && p.event_links.length > 0)
        if (!isEventPartner) return false

        if (selectedEventId !== "all") {
          const inSelectedEvent =
            p.created_context_id === selectedEventId ||
            p.event_links?.some((l) => l.event_id === selectedEventId)
          if (!inSelectedEvent) return false
        }
      }

      // 2. Type filter
      if (selectedType !== "all" && p.type !== selectedType) return false

      // 3. Status filter
      if (statusFilter === "published" && !p.is_published) return false
      if (statusFilter === "hidden" && p.is_published) return false

      // 4. Search query
      if (q) {
        const desc = parsePartnerDescriptionText(p.description).toLowerCase()
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesWeb = (p.website || "").toLowerCase().includes(q)
        const matchesDesc = desc.includes(q)
        const matchesEvent = p.event_links?.some(
          (l) =>
            l.event_title.toLowerCase().includes(q) ||
            l.category_label.toLowerCase().includes(q) ||
            l.category_key.toLowerCase().includes(q)
        )
        if (!matchesName && !matchesWeb && !matchesDesc && !matchesEvent) return false
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "usage":
          return (b.usage_count || 0) - (a.usage_count || 0)
        default:
          return 0
      }
    })

    return result
  }, [partners, search, selectedType, statusFilter, sortBy, selectedScope, selectedEventId])

  // Toggle Published Switch
  const handleTogglePublished = async (partner: PartnerWithUsage, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextState = !partner.is_published

    // Optimistic UI update
    setPartners((prev) =>
      prev.map((p) => (p.id === partner.id ? { ...p, is_published: nextState } : p))
    )

    startTransition(async () => {
      const result = await togglePartnerPublishedAction(partner.id, nextState)
      if (result.success) {
        notifications.showSuccess({
          description: nextState
            ? `“${partner.name}” is now visible in public directories`
            : `“${partner.name}” set to hidden`,
        })
      } else {
        // Rollback
        setPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? { ...p, is_published: !nextState } : p))
        )
        notifications.showError({ description: "Failed to update publication status." })
      }
    })
  }

  // Copy website URL
  const handleCopyWebsite = (url?: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!url) {
      notifications.showError({ description: "No website URL recorded for this organization." })
      return
    }
    navigator.clipboard.writeText(url)
    notifications.showSuccess({ description: "Website URL copied to clipboard!" })
  }

  // Promote partner to global
  const handlePromoteConfirm = async () => {
    if (!pendingPromote) return
    setIsPromoting(true)

    try {
      const res = await promotePartnerToGlobalAction(pendingPromote.id)
      if (res.success && res.data) {
        setPartners((prev) =>
          prev.map((p) =>
            p.id === pendingPromote.id
              ? { ...p, created_context_type: null, created_context_id: null }
              : p
          )
        )
        notifications.showSuccess({
          description: `“${pendingPromote.name}” has been promoted to a Global Foundation Partner!`,
        })
        setPendingPromote(null)
      } else {
        notifications.showError({ description: res.error || "Failed to promote partner." })
      }
    } catch {
      notifications.showError({ description: "An error occurred while promoting." })
    } finally {
      setIsPromoting(false)
    }
  }

  // Delete partner handler
  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)

    try {
      const res = await deletePartner(pendingDelete.id)
      if (res.success) {
        setPartners((prev) => prev.filter((p) => p.id !== pendingDelete.id))
        notifications.showSuccess({ description: `“${pendingDelete.name}” removed from directory.` })
        setPendingDelete(null)
      } else {
        notifications.showError({ description: res.error || "Failed to delete partner." })
      }
    } catch {
      notifications.showError({ description: "An unexpected error occurred while deleting." })
    } finally {
      setIsDeleting(false)
    }
  }

  // Partner Saved Callback
  const handlePartnerSaved = (saved: PartnerWithUsage) => {
    const updatedPartner = { ...saved }
    if (
      updatedPartner.created_context_type === "event" &&
      updatedPartner.created_context_id &&
      (!updatedPartner.event_links || updatedPartner.event_links.length === 0)
    ) {
      const ev = events.find((e) => e.id === updatedPartner.created_context_id)
      updatedPartner.event_links = [
        {
          event_id: updatedPartner.created_context_id,
          event_title: ev?.title || "Event",
          event_slug: ev?.slug || "",
          category_key: "partner",
          category_label: "Event Partner",
        },
      ]
    }

    setPartners((prev) => {
      const exists = prev.some((p) => p.id === updatedPartner.id)
      if (exists) {
        return prev.map((p) => (p.id === updatedPartner.id ? { ...p, ...updatedPartner } : p))
      }
      return [updatedPartner, ...prev]
    })
    router.refresh()
  }

  // Helper for Type Badge
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "sponsor":
        return (
          <Badge variant="outline" className={cn("text-xs font-semibold capitalize gap-1", styles.badgeSponsor)}>
            <Sparkles className="size-3" />
            Sponsor
          </Badge>
        )
      case "donor":
        return (
          <Badge variant="outline" className={cn("text-xs font-semibold capitalize gap-1", styles.badgeDonor)}>
            <Heart className="size-3" />
            Donor
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className={cn("text-xs font-semibold capitalize gap-1", styles.badgePartner)}>
            <Handshake className="size-3" />
            Partner
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────
          PAGE HEADER
          ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Partner Organizations</h1>
                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold">
                  {counts.all} Total
                </Badge>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                Institutional alliances, corporate sponsors, and philanthropic donors across all foundation initiatives.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.refresh()}
            title="Refresh list"
            className="size-10 shrink-0 cursor-pointer"
          >
            <RotateCw className={cn("size-4", isPending && "animate-spin")} />
          </Button>

          <Button
            onClick={() => {
              setEditingPartner(null)
              setIsModalOpen(true)
            }}
            className="h-10 gap-2 px-4 font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{selectedScope === "events" ? "Add Event Partner" : "Add Partner"}</span>
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          PRIMARY SCOPE SEGMENTED RAIL
          ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border/60 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setSelectedScope("global")}
            className={cn(
              "relative overflow-hidden flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all duration-200 cursor-pointer border",
              selectedScope === "global"
                ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/25 scale-[1.01]"
                : "border-transparent text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/60"
            )}
          >
            <Globe className="size-4 shrink-0" />
            <span>Global Directory</span>
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 text-[11px] px-1.5 py-0 h-4.5 font-bold transition-colors",
                selectedScope === "global"
                  ? "bg-white/25 text-white border-transparent"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts.global}
            </Badge>
            {selectedScope === "global" && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedScope("events")}
            className={cn(
              "relative overflow-hidden flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all duration-200 cursor-pointer border",
              selectedScope === "events"
                ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/25 scale-[1.01]"
                : "border-transparent text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/60"
            )}
          >
            <Calendar className="size-4 shrink-0" />
            <span>Event Partners</span>
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 text-[11px] px-1.5 py-0 h-4.5 font-bold transition-colors",
                selectedScope === "events"
                  ? "bg-white/25 text-white border-transparent"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts.events}
            </Badge>
            {selectedScope === "events" && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedScope("all")}
            className={cn(
              "relative overflow-hidden flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all duration-200 cursor-pointer border",
              selectedScope === "all"
                ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/25 scale-[1.01]"
                : "border-transparent text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/60"
            )}
          >
            <Layers className="size-4 shrink-0" />
            <span>All Alliances</span>
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 text-[11px] px-1.5 py-0 h-4.5 font-bold transition-colors",
                selectedScope === "all"
                  ? "bg-white/25 text-white border-transparent"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts.all}
            </Badge>
            {selectedScope === "all" && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
            )}
          </button>
        </div>

        {/* Quick Event Filter Dropdown when in 'events' or 'all' scope */}
        {selectedScope !== "global" && events.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Filter Event:</span>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="h-9 text-xs font-semibold w-[230px] shadow-2xs">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Events ({counts.events})
                </SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id} className="text-xs">
                    {ev.title} ({ev.partner_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────
          KPI METRIC STRIP (4 Cards)
          ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total for Scope */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedScope === "global"
                  ? "Global Alliances"
                  : selectedScope === "events"
                  ? "Event Partners"
                  : "Total Directory"}
              </span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  selectedScope === "global"
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                    : selectedScope === "events"
                    ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    : "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
                )}
              >
                {selectedScope === "global" ? (
                  <Globe className="size-4.5" />
                ) : selectedScope === "events" ? (
                  <Calendar className="size-4.5" />
                ) : (
                  <Building2 className="size-4.5" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{stats.total}</span>
              <span className="text-xs text-muted-foreground">organizations</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedScope === "global"
                ? "Foundation-wide strategic network"
                : selectedScope === "events"
                ? "Summit & event partner network"
                : "Across all foundation initiatives"}
            </p>
          </CardContent>
        </Card>

        {/* Live Public */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Public
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Check className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {stats.published}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.liveRate}% active
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.liveRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sponsors & Donors */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sponsors & Donors
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Sparkles className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {stats.sponsorsAndDonors}
              </span>
              <span className="text-xs text-muted-foreground">financial/in-kind</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedScope === "global"
                ? "Supporting foundation programs"
                : "Supporting summits & events"}
            </p>
          </CardContent>
        </Card>

        {/* Context Links / Event Ties */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedScope === "global"
                  ? "Cross-Event Reach"
                  : selectedScope === "events"
                  ? "Participating Events"
                  : "Active Context Links"}
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Layers className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                {selectedScope === "events" ? events.filter((e) => e.partner_count > 0).length : stats.crossLinked}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedScope === "events" ? "summits/editions" : "linked rails"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedScope === "global"
                ? "Global partners linked to events"
                : "Events with active partner showcase"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ──────────────────────────────────────────
          SHIMMER TYPE FILTER RAIL
          ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {[
          { key: "all", label: "All Types", count: stats.total },
          {
            key: "partner",
            label: "Institutional Partners",
            count: filteredPartners.filter((p) => p.type === "partner").length,
          },
          {
            key: "sponsor",
            label: "Corporate Sponsors",
            count: filteredPartners.filter((p) => p.type === "sponsor").length,
          },
          {
            key: "donor",
            label: "Funding Donors",
            count: filteredPartners.filter((p) => p.type === "donor").length,
          },
        ].map((tab) => {
          const isSelected = selectedType === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedType(tab.key as PartnerTypeFilter)}
              className={cn(
                "group relative overflow-hidden flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border",
                isSelected
                  ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/20 scale-[1.02]"
                  : "border-border/60 bg-background/80 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              )}
            >
              <span>{tab.label}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 py-0 text-[11px] font-bold h-4.5 transition-colors",
                  isSelected
                    ? "bg-white/25 text-white border-transparent"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                )}
              >
                {tab.count}
              </Badge>
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {/* ──────────────────────────────────────────
          SEARCH, STATUS & SORT CONTROLS BAR
          ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, website, event, or tier..."
            className="h-10 pl-9 pr-9 text-xs sm:text-sm shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Selects & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val: StatusFilter) => setStatusFilter(val)}>
            <SelectTrigger className="h-10 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="published" className="text-xs">Live Public</SelectItem>
              <SelectItem value="hidden" className="text-xs">Draft / Hidden</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
            <SelectTrigger className="h-10 w-[145px] text-xs">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="size-3 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc" className="text-xs">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc" className="text-xs">Name (Z-A)</SelectItem>
              <SelectItem value="newest" className="text-xs">Newest Added</SelectItem>
              <SelectItem value="oldest" className="text-xs">Oldest Added</SelectItem>
              <SelectItem value="usage" className="text-xs">Most Event Links</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={cn(
                "flex size-9 items-center justify-center rounded-md transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid / Card View"
              className={cn(
                "flex size-9 items-center justify-center rounded-md transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{filteredPartners.length}</strong> of{" "}
          <strong>{partners.length}</strong> organizations
          {selectedScope === "global" && " in Global Directory"}
          {selectedScope === "events" && " in Event Network"}
        </span>
        {(search || selectedType !== "all" || statusFilter !== "all" || selectedEventId !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setSelectedType("all")
              setStatusFilter("all")
              setSelectedEventId("all")
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────
          TABLE VIEW
          ────────────────────────────────────────── */}
      {viewMode === "table" && (
        <Card className="overflow-hidden border-border/80 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
                  <TableHead className="w-12 text-center">S.No.</TableHead>
                  <TableHead className="min-w-[280px]">Organization & Focus</TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead className="min-w-[180px]">Website</TableHead>
                  <TableHead className="min-w-[180px] text-center">Event Alliances</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-28 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="size-10 text-muted-foreground/50" />
                        <p className="font-semibold text-base text-foreground">No organizations found</p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {search
                            ? `No records matching "${search}". Try searching for another organization or clearing your filters.`
                            : selectedScope === "global"
                            ? "No partners registered in the Global Directory yet. Add a partner or promote an event partner."
                            : "No event partners found matching the active selection."}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingPartner(null)
                            setIsModalOpen(true)
                          }}
                          className="mt-2 gap-1.5"
                        >
                          <Plus className="size-3.5" />
                          <span>Add Partner</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPartners.map((partner, index) => {
                    const descText = parsePartnerDescriptionText(partner.description)
                    const isEventPartner = partner.created_context_type === "event"

                    return (
                      <TableRow
                        key={partner.id}
                        onClick={() => {
                          setEditingPartner(partner)
                          setIsModalOpen(true)
                        }}
                        className="group hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {/* S.No. */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground font-semibold">
                          {index + 1}
                        </TableCell>

                        {/* Partner Logo & Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(styles.logoCanvas, "size-12 shrink-0 p-1")}>
                              {partner.logo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={partner.logo}
                                  alt={partner.name}
                                  className="size-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <Building2 className="size-6 text-muted-foreground/60" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                                  {partner.name}
                                </p>

                                {/* Scope Badge */}
                                {isEventPartner ? (
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[10px] font-semibold gap-1 py-0 h-4.5", styles.badgeEvent)}
                                  >
                                    <Calendar className="size-2.5" />
                                    <span>Event Partner</span>
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[10px] font-semibold gap-1 py-0 h-4.5", styles.badgeGlobal)}
                                  >
                                    <Globe className="size-2.5" />
                                    <span>Global Directory</span>
                                  </Badge>
                                )}
                              </div>

                              {descText && (
                                <p className="mt-0.5 text-xs text-muted-foreground truncate" title={descText}>
                                  {descText}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell>{renderTypeBadge(partner.type)}</TableCell>

                        {/* Website */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {partner.website ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium truncate max-w-[150px]"
                                title={partner.website}
                              >
                                <Globe className="size-3 shrink-0" />
                                <span className="truncate">{partner.website.replace(/^https?:\/\//i, "")}</span>
                                <ExternalLink className="size-3 shrink-0 opacity-70" />
                              </a>
                              <button
                                type="button"
                                onClick={(e) => handleCopyWebsite(partner.website, e)}
                                title="Copy website link"
                                className="text-muted-foreground hover:text-foreground p-1 rounded"
                              >
                                <Copy className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                          )}
                        </TableCell>

                        {/* Event Alliances */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          {partner.event_links && partner.event_links.length > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              {partner.event_links.slice(0, 1).map((link) => (
                                <Badge
                                  key={`${link.event_id}-${link.category_key}`}
                                  variant="outline"
                                  className="font-medium text-[11px] gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 max-w-[190px] truncate"
                                  title={`${link.event_title} (${link.category_label})`}
                                >
                                  <Calendar className="size-3 shrink-0" />
                                  <span className="truncate">{link.event_title}</span>
                                </Badge>
                              ))}
                              {partner.event_links.length > 1 && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  +{partner.event_links.length - 1} more event{partner.event_links.length - 1 > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 font-mono">Foundation Only</span>
                          )}
                        </TableCell>

                        {/* Status Switch */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={partner.is_published}
                              onCheckedChange={() => handleTogglePublished(partner)}
                              title={partner.is_published ? "Active in public directories" : "Hidden from public directories"}
                            />
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick promote to global button for event partners */}
                            {isEventPartner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPendingPromote(partner)}
                                className="size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 cursor-pointer"
                                title="Promote to Global Foundation Partner"
                              >
                                <Sparkles className="size-3.5" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingPartner(partner)
                                setIsModalOpen(true)
                              }}
                              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Edit organization"
                            >
                              <Pencil className="size-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  <span className="sr-only">More</span>
                                  <svg
                                    className="size-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPartner(partner)
                                    setIsModalOpen(true)
                                  }}
                                >
                                  <Pencil className="size-4 mr-2" />
                                  <span>Edit Details</span>
                                </DropdownMenuItem>

                                {isEventPartner && (
                                  <DropdownMenuItem
                                    onClick={() => setPendingPromote(partner)}
                                    className="text-amber-600 dark:text-amber-400 font-semibold"
                                  >
                                    <Sparkles className="size-4 mr-2 text-amber-500" />
                                    <span>Promote to Global</span>
                                  </DropdownMenuItem>
                                )}

                                {partner.event_links?.[0]?.event_id && (
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={`/admin/events/${partner.event_links[0].event_id}/settings?tab=partners`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Calendar className="size-4 mr-2" />
                                      <span>View in Event Settings</span>
                                    </a>
                                  </DropdownMenuItem>
                                )}

                                {partner.website && (
                                  <>
                                    <DropdownMenuItem onClick={(e) => handleCopyWebsite(partner.website, e)}>
                                      <Copy className="size-4 mr-2" />
                                      <span>Copy Website URL</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="size-4 mr-2" />
                                        <span>Open Website</span>
                                      </a>
                                    </DropdownMenuItem>
                                  </>
                                )}

                                <DropdownMenuItem onClick={(e) => handleTogglePublished(partner, e)}>
                                  {partner.is_published ? (
                                    <>
                                      <span className="size-2 rounded-full bg-slate-400 mr-2" />
                                      <span>Set as Hidden</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="size-2 rounded-full bg-emerald-500 mr-2" />
                                      <span>Set as Live</span>
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setPendingDelete(partner)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  <span>Delete Partner</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ──────────────────────────────────────────
          GRID / CARD VIEW
          ────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 py-16 text-center rounded-2xl border border-dashed border-border p-8">
              <Building2 className="mx-auto size-10 text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-base text-foreground">No organizations found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Try searching for another term or clearing the active filters.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPartner(null)
                  setIsModalOpen(true)
                }}
              >
                <Plus className="size-4 mr-1.5" />
                <span>Add Partner</span>
              </Button>
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const descText = parsePartnerDescriptionText(partner.description)
              const isEventPartner = partner.created_context_type === "event"

              return (
                <Card
                  key={partner.id}
                  onClick={() => {
                    setEditingPartner(partner)
                    setIsModalOpen(true)
                  }}
                  className={cn(
                    styles.partnerCard,
                    "overflow-hidden border-border/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-primary/50"
                  )}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Type + Scope + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {renderTypeBadge(partner.type)}
                        {isEventPartner ? (
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-semibold gap-1 py-0 h-4.5", styles.badgeEvent)}
                          >
                            <Calendar className="size-2.5" />
                            <span>Event</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-semibold gap-1 py-0 h-4.5", styles.badgeGlobal)}
                          >
                            <Globe className="size-2.5" />
                            <span>Global</span>
                          </Badge>
                        )}
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold",
                          partner.is_published
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {partner.is_published ? "Live" : "Hidden"}
                      </Badge>
                    </div>

                    {/* Logo Showcase Area */}
                    <div className={cn(styles.logoCanvas, "h-28 w-full p-3")}>
                      {partner.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/50 text-xs">
                          <Building2 className="size-8" />
                          <span>No Logo Asset</span>
                        </div>
                      )}
                    </div>

                    {/* Partner Name & Description */}
                    <div>
                      <h3 className="font-bold text-base text-foreground line-clamp-1">{partner.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {descText || "No partnership scope summary provided."}
                      </p>
                    </div>

                    {/* Meta bar: Website & Event context */}
                    <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium truncate max-w-[150px]"
                        >
                          <Globe className="size-3 shrink-0" />
                          <span className="truncate">{partner.website.replace(/^https?:\/\//i, "")}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60">No website</span>
                      )}

                      {partner.event_links && partner.event_links.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 font-medium text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-[130px]"
                          title={`${partner.event_links[0].event_title} (${partner.event_links[0].category_label})`}
                        >
                          <Calendar className="size-3 shrink-0" />
                          <span className="truncate">{partner.event_links[0].event_title}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60 font-mono">Master directory</span>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Footer Actions */}
                  <div
                    className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={partner.is_published}
                        onCheckedChange={() => handleTogglePublished(partner)}
                        className="scale-90"
                      />
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {partner.is_published ? "Active" : "Off"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isEventPartner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingPromote(partner)}
                          className="h-8 px-2 text-xs font-semibold gap-1 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          title="Promote to Global Partner"
                        >
                          <Sparkles className="size-3" />
                          <span className="hidden sm:inline">Promote</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPartner(partner)
                          setIsModalOpen(true)
                        }}
                        className="h-8 px-2.5 text-xs font-semibold gap-1"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete(partner)}
                        className="size-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────
          MODAL: ADD / EDIT PARTNER
          ────────────────────────────────────────── */}
      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partner={editingPartner}
        onSaved={handlePartnerSaved}
        events={events}
        defaultScope={selectedScope === "events" ? "event" : "global"}
        defaultEventId={selectedEventId !== "all" ? selectedEventId : undefined}
      />

      {/* ──────────────────────────────────────────
          PROMOTE TO GLOBAL CONFIRMATION DIALOG
          ────────────────────────────────────────── */}
      <AlertDialog
        open={pendingPromote !== null}
        onOpenChange={(open) => !open && !isPromoting && setPendingPromote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-1">
              <Sparkles className="size-5" />
              <AlertDialogTitle className="text-foreground">Promote to Global Directory?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to graduate <strong className="text-foreground">“{pendingPromote?.name}”</strong> to become a permanent <strong>Global Foundation Partner</strong>?
              </p>
              <p className="text-xs text-muted-foreground">
                This will make the organization visible on foundation-wide public showcases (About page, footer, etc.) and available to link across all current and future events, while preserving its role in{" "}
                <span className="font-semibold text-foreground">
                  {pendingPromote?.event_links?.[0]?.event_title || "its current event"}
                </span>.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPromoting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handlePromoteConfirm()
              }}
              disabled={isPromoting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
            >
              {isPromoting ? (
                <>
                  <RotateCw className="size-3.5 mr-1.5 animate-spin" />
                  <span>Promoting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-1.5" />
                  <span>Promote to Global</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ──────────────────────────────────────────
          DELETE CONFIRMATION DIALOG
          ────────────────────────────────────────── */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong className="text-foreground">“{pendingDelete?.name}”</strong> from the master partner directory?
              {((pendingDelete?.usage_count || 0) > 0) && (
                <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                  Warning: This organization is currently linked to {pendingDelete?.usage_count} event/context rail(s).
                  Deleting it will unlink it from all associated events.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Partner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
