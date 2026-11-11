"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Eye,
  Pencil,
  ExternalLink,
  Layers,
  Globe,
  Sparkles,
  X,
  LayoutGrid,
  Table as TableIcon,
  HeartHandshake,
  Megaphone,
  Compass,
  FlaskConical,
  FolderKanban,
  FileEdit,
  MoreVertical,
  Copy,
  Check,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { ProgramThumb } from "@/components/admin/programs/program-thumb"
import { archiveProgram, restoreProgram, deleteProgram } from "@/lib/actions/program-crud"
import { notifications } from "@/lib/notifications"
import type { ProgramCategory } from "@/lib/programs/content"
import { cn } from "@/lib/utils"
import styles from "./programs.module.css"

export interface ProgramListItem {
  id: string
  slug: string
  title: string
  category: ProgramCategory
  status: "published" | "draft" | "archived" | string
  short_description?: string | null
  updated_at: string
  created_at: string
  hero_thumb: string | null
}

interface ProgramsListClientProps {
  initialPrograms: ProgramListItem[]
}

const CATEGORY_CONFIG: Record<
  ProgramCategory,
  { label: string; icon: typeof HeartHandshake; colorClass: string; dotClass: string }
> = {
  service: {
    label: "Service",
    icon: HeartHandshake,
    colorClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-500",
  },
  campaign: {
    label: "Campaign",
    icon: Megaphone,
    colorClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  outreach: {
    label: "Outreach",
    icon: Compass,
    colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  research: {
    label: "Research",
    icon: FlaskConical,
    colorClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    dotClass: "bg-teal-500",
  },
}

export function ProgramsListClient({ initialPrograms }: ProgramsListClientProps) {
  const router = useRouter()
  const [programs, setPrograms] = useState<ProgramListItem[]>(initialPrograms)
  const [prevInitial, setPrevInitial] = useState(initialPrograms)

  if (prevInitial !== initialPrograms) {
    setPrevInitial(initialPrograms)
    setPrograms(initialPrograms)
  }

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProgramCategory>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all")

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 767px)").matches ? "cards" : "table"
    }
    return "table"
  })
  const [userToggledView, setUserToggledView] = useState(false)

  // Actions state
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ProgramListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [, setBusyId] = useState<string | null>(null)

  // Auto-switch view mode based on screen width unless manually set
  useEffect(() => {
    if (typeof window === "undefined" || userToggledView) return
    const media = window.matchMedia("(max-width: 767px)")

    const listener = (e: MediaQueryListEvent) => {
      if (!userToggledView) {
        setViewMode(e.matches ? "cards" : "table")
      }
    }
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [userToggledView])

  // Studio Metrics
  const stats = useMemo(() => {
    const total = programs.length
    const published = programs.filter((p) => p.status === "published").length
    const drafts = programs.filter((p) => p.status === "draft").length
    const archived = programs.filter((p) => p.status === "archived").length

    const services = programs.filter((p) => p.category === "service").length
    const campaigns = programs.filter((p) => p.category === "campaign").length
    const outreach = programs.filter((p) => p.category === "outreach").length
    const research = programs.filter((p) => p.category === "research").length

    const percentLive = total > 0 ? Math.round((published / total) * 100) : 0

    return {
      total,
      published,
      drafts,
      archived,
      services,
      campaigns,
      outreach,
      research,
      percentLive,
    }
  }, [programs])

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (categoryFilter !== "all" && program.category !== categoryFilter) {
        return false
      }

      if (statusFilter !== "all" && program.status !== statusFilter) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = program.title.toLowerCase().includes(q)
        const slugMatch = program.slug.toLowerCase().includes(q)
        const descMatch = (program.short_description || "").toLowerCase().includes(q)
        return titleMatch || slugMatch || descMatch
      }

      return true
    })
  }, [programs, categoryFilter, statusFilter, searchQuery])

  // Quick Action Handlers
  const handleCopyLink = (program: ProgramListItem) => {
    const url = `${window.location.origin}/whatwedo/${program.slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(program.id)
    setTimeout(() => setCopiedId(null), 2000)
    notifications.showSuccess({
      title: "Link Copied",
      description: url,
    })
  }

  const handleArchive = async (program: ProgramListItem) => {
    setBusyId(program.id)
    try {
      const res = await archiveProgram(program.id)
      if (!res.ok) throw new Error(res.error)
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, status: "archived" } : p))
      )
      notifications.showSuccess({ description: `“${program.title}” archived.` })
      router.refresh()
    } catch (err) {
      notifications.showError({
        description: err instanceof Error ? err.message : "Archive failed",
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleRestore = async (program: ProgramListItem) => {
    setBusyId(program.id)
    try {
      const res = await restoreProgram(program.id)
      if (!res.ok) throw new Error(res.error)
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, status: "draft" } : p))
      )
      notifications.showSuccess({ description: `“${program.title}” restored to draft.` })
      router.refresh()
    } catch (err) {
      notifications.showError({
        description: err instanceof Error ? err.message : "Restore failed",
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteProgram(pendingDelete.id)
      if (!res.ok) throw new Error(res.error)
      setPrograms((prev) => prev.filter((p) => p.id !== pendingDelete.id))
      notifications.showSuccess({ description: `“${pendingDelete.title}” permanently deleted.` })
      setPendingDelete(null)
      router.refresh()
    } catch (err) {
      notifications.showError({
        description: err instanceof Error ? err.message : "Delete failed",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={cn(styles.root, "space-y-6")}>
      {/* Studio Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Layers className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Programs CMS</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage public initiatives across Service, Outreach, Research, and Campaign categories.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" asChild className="h-10 text-sm font-medium">
            <Link href="/whatwedo" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              View Public Studio
            </Link>
          </Button>

          <Button asChild className="h-10 px-5 text-sm font-semibold shadow-xs">
            <Link href="/admin/programs/new">
              <Plus className="mr-2 size-4" />
              New Program
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Studio Summary - 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* Card 1: Total Programs */}
        <Card className="border bg-card/60 backdrop-blur-sm shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Total Programs
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.drafts} drafts)
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Live Public Programs */}
        <Card className="border bg-card/60 backdrop-blur-sm shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Live Public
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.published}
                  </p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.percentLive}% live)
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Globe className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Drafts & In-Progress */}
        <Card className="border bg-card/60 backdrop-blur-sm shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Draft Programs
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.drafts}
                  </p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {stats.archived > 0 ? `+${stats.archived} archived` : "in progress"}
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileEdit className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Categories Breakdown */}
        <Card className="border bg-card/60 backdrop-blur-sm shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Categories Active
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">4</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {stats.services}S · {stats.campaigns}C · {stats.outreach}O · {stats.research}R
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Sparkles className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontally Scrollable Category Filter Strip */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 w-max sm:w-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0",
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
            )}
          >
            All Categories ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("service")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
              categoryFilter === "service"
                ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
            )}
          >
            <HeartHandshake className="size-3.5" />
            Services ({stats.services})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("campaign")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
              categoryFilter === "campaign"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
            )}
          >
            <Megaphone className="size-3.5" />
            Campaigns ({stats.campaigns})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("outreach")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
              categoryFilter === "outreach"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            )}
          >
            <Compass className="size-3.5" />
            Outreach ({stats.outreach})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("research")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
              categoryFilter === "research"
                ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                : "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20 hover:bg-teal-500/20"
            )}
          >
            <FlaskConical className="size-3.5" />
            Research ({stats.research})
          </button>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search title, slug, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-8 text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as typeof statusFilter)}
          >
            <SelectTrigger className="h-10 text-sm w-full sm:w-[150px] rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {filteredPrograms.length} {filteredPrograms.length === 1 ? "program" : "programs"}
          </span>

          <div className="flex items-center rounded-xl border bg-muted/30 p-0.5">
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 text-xs font-semibold px-2.5", viewMode === "table" && "shadow-xs")}
              onClick={() => {
                setUserToggledView(true)
                setViewMode("table")
              }}
              aria-label="Table View"
            >
              <TableIcon className="size-3.5 mr-1.5" />
              Table
            </Button>
            <Button
              type="button"
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 text-xs font-semibold px-2.5", viewMode === "cards" && "shadow-xs")}
              onClick={() => {
                setUserToggledView(true)
                setViewMode("cards")
              }}
              aria-label="Cards View"
            >
              <LayoutGrid className="size-3.5 mr-1.5" />
              Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Empty States */}
      {programs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <Layers className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No CMS programs yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create your first initiative under Service, Outreach, Research, or Campaign categories.
              </p>
            </div>
            <Button asChild className="h-10 px-5 text-sm font-semibold">
              <Link href="/admin/programs/new">
                <Plus className="mr-2 size-4" /> Create First Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {programs.length > 0 && filteredPrograms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <p className="font-semibold text-base">No programs match your search or filters</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search keywords or clearing your category and status filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setStatusFilter("all")
              }}
              className="h-9 text-xs"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DESKTOP TABLE VIEW (Compact, Clean & Clickable Rows) */}
      {filteredPrograms.length > 0 && viewMode === "table" && (
        <Card className="border overflow-hidden shadow-2xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="min-w-[320px]">Program &amp; Details</TableHead>
                    <TableHead className="w-[140px]">Category</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[120px]">Updated</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => {
                    const cat = CATEGORY_CONFIG[program.category] || CATEGORY_CONFIG.service
                    const Icon = cat.icon
                    const isPublished = program.status === "published"
                    const isDraft = program.status === "draft"

                    return (
                      <TableRow
                        key={program.id}
                        onClick={() => router.push(`/admin/programs/${program.id}/edit`)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        {/* Thumbnail & Title */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProgramThumb src={program.hero_thumb} alt="" />
                            <div className="min-w-0 flex flex-col justify-center">
                              <p className="font-semibold text-sm truncate max-w-[380px] group-hover:text-primary transition-colors">
                                {program.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70 font-mono truncate max-w-[320px]">
                                /whatwedo/{program.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5 gap-1.5", cat.colorClass)}>
                            <Icon className="size-3" />
                            {cat.label}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 capitalize",
                              isPublished
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold"
                                : isDraft
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full mr-1.5 inline-block",
                                isPublished ? "bg-emerald-500" : isDraft ? "bg-amber-500" : "bg-muted-foreground"
                              )}
                            />
                            {program.status}
                          </Badge>
                        </TableCell>

                        {/* Updated */}
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(program.updated_at).toLocaleDateString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Preview Draft Layout */}
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                              <Link
                                href={`/admin/programs/${program.id}/preview`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Preview draft layout"
                              >
                                <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                              </Link>
                            </Button>

                            {/* View Live Page (if published) */}
                            {isPublished && (
                              <Button variant="ghost" size="icon" className="size-8" asChild>
                                <Link
                                  href={`/whatwedo/${program.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View live public program"
                                >
                                  <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
                                </Link>
                              </Button>
                            )}

                            {/* Edit */}
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                              <Link href={`/admin/programs/${program.id}/edit`} title="Edit program">
                                <Pencil className="size-3.5" />
                              </Link>
                            </Button>

                            {/* More Options Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" title="More options">
                                  <MoreVertical className="size-3.5 text-muted-foreground hover:text-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/programs/${program.id}/preview`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Eye className="size-4 mr-2" />
                                    Preview Draft
                                  </Link>
                                </DropdownMenuItem>

                                {isPublished && (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/whatwedo/${program.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="size-4 mr-2" />
                                      View Live Page
                                    </Link>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => handleCopyLink(program)}>
                                  {copiedId === program.id ? (
                                    <>
                                      <Check className="size-4 mr-2 text-emerald-600" />
                                      <span>Copied Link!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-4 mr-2" />
                                      <span>Copy Public URL</span>
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/programs/${program.id}/edit`}>
                                    <Pencil className="size-4 mr-2" />
                                    Edit Content &amp; Hero
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {program.status !== "archived" ? (
                                  <DropdownMenuItem onClick={() => handleArchive(program)}>
                                    <Archive className="size-4 mr-2 text-amber-600" />
                                    Archive Program
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleRestore(program)}>
                                    <RotateCcw className="size-4 mr-2 text-primary" />
                                    Restore to Draft
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => setPendingDelete(program)}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Delete Program
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
          </CardContent>
        </Card>
      )}

      {/* MOBILE / RESPONSIVE CARD VIEW */}
      {filteredPrograms.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => {
            const cat = CATEGORY_CONFIG[program.category] || CATEGORY_CONFIG.service
            const Icon = cat.icon
            const isPublished = program.status === "published"
            const isDraft = program.status === "draft"

            return (
              <Card
                key={program.id}
                onClick={() => router.push(`/admin/programs/${program.id}/edit`)}
                className={cn(
                  styles.programCard,
                  "flex flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer group border",
                  !isPublished && "border-dashed"
                )}
              >
                {/* 16:9 Thumbnail Banner */}
                <div className="relative aspect-video bg-neutral-900 border-b overflow-hidden">
                  {program.hero_thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={program.hero_thumb}
                      alt=""
                      className={cn("w-full h-full object-cover", !isPublished && "opacity-80")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/60 bg-muted/40">
                      <Layers className="size-10 stroke-1" />
                    </div>
                  )}

                  {/* Category Badge on top left */}
                  <div className="absolute left-3 top-3">
                    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md", cat.colorClass)}>
                      <Icon className="size-3 mr-1" />
                      {cat.label}
                    </Badge>
                  </div>

                  {/* Status Badge on top right */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold backdrop-blur-md capitalize",
                        isPublished
                          ? "bg-emerald-500/90 text-white border-transparent"
                          : isDraft
                            ? "bg-amber-500/90 text-white border-transparent"
                            : "bg-background/90 text-foreground border"
                      )}
                    >
                      {program.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    {program.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {program.short_description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 font-mono truncate pt-1">
                      /whatwedo/{program.slug}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div
                    className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-mono text-[11px]">
                      {new Date(program.updated_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Preview */}
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                        <Link
                          href={`/admin/programs/${program.id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview draft layout"
                        >
                          <Eye className="size-3.5 mr-1" />
                          Preview
                        </Link>
                      </Button>

                      {/* Live (if published) */}
                      {isPublished && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                          <Link href={`/whatwedo/${program.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-3.5 mr-1" />
                            Live
                          </Link>
                        </Button>
                      )}

                      {/* Edit */}
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-medium" asChild>
                        <Link href={`/admin/programs/${program.id}/edit`}>
                          <Pencil className="size-3 mr-1" />
                          Edit
                        </Link>
                      </Button>

                      {/* More Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" title="More options">
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleCopyLink(program)}>
                            {copiedId === program.id ? (
                              <>
                                <Check className="size-4 mr-2 text-emerald-600" />
                                <span>Copied Link!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-4 mr-2" />
                                <span>Copy Public URL</span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {program.status !== "archived" ? (
                            <DropdownMenuItem onClick={() => handleArchive(program)}>
                              <Archive className="size-4 mr-2 text-amber-600" />
                              Archive Program
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRestore(program)}>
                              <RotateCcw className="size-4 mr-2 text-primary" />
                              Restore to Draft
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setPendingDelete(program)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete Program
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Permanently Delete Program?"
        description={`“${pendingDelete?.title ?? ""}” and all of its content sections will be permanently removed. This action cannot be undone.`}
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
