"use client"

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  FileText,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Star,
  Table as TableIcon,
  Trash2,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { StoryPreviewModal } from "@/components/admin/stories/story-preview-modal"
import { showToast } from "@/components/ui/toast"
import {
  deleteStoryAction,
  toggleStoryFeaturedAction,
  toggleStoryPublishedAction,
} from "@/lib/actions/admin-stories"
import { cn } from "@/lib/utils"
import styles from "./stories.module.css"

export interface StoryListItem {
  id: string
  title: string
  slug: string
  excerpt: string
  content?: string | null
  image?: string | null
  category: string
  read_time?: string | null
  is_featured: boolean
  is_published: boolean
  published_at?: string | null
  created_at: string
  updated_at?: string | null
  author_id?: string | null
}

interface StoriesListClientProps {
  initialStories: StoryListItem[]
  storiesEnabled?: boolean
}

function getCategoryColor(category: string) {
  const cat = category?.toLowerCase() || ""
  if (cat.includes("service")) return styles.categoryService
  if (cat.includes("campaign")) return styles.categoryCampaign
  if (cat.includes("outreach") || cat.includes("community")) return styles.categoryOutreach
  if (cat.includes("research") || cat.includes("health")) return styles.categoryResearch
  return styles.categoryDefault
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "Not set"
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function StoriesListClient({ initialStories, storiesEnabled = true }: StoriesListClientProps) {
  const router = useRouter()
  const [stories, setStories] = useState<StoryListItem[]>(initialStories)
  const [prevInitial, setPrevInitial] = useState(initialStories)

  // Sync state if server props change (standard render-phase sync)
  if (initialStories !== prevInitial) {
    setPrevInitial(initialStories)
    setStories(initialStories)
  }

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "featured">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest")
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 1024px)").matches ? "table" : "grid"
    }
    return "table"
  })

  const [isPending, startTransition] = useTransition()
  const [previewStory, setPreviewStory] = useState<StoryListItem | null>(null)
  const [pendingDelete, setPendingDelete] = useState<StoryListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Category counts
  const categoriesList = useMemo(() => {
    const counts: Record<string, number> = {}
    stories.forEach((s) => {
      const cat = s.category || "General"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [stories])

  // KPIs
  const stats = useMemo(() => {
    const total = stories.length
    const published = stories.filter((s) => s.is_published).length
    const drafts = total - published
    const featured = stories.filter((s) => s.is_featured).length
    const liveRate = total > 0 ? Math.round((published / total) * 100) : 0
    return { total, published, drafts, featured, liveRate }
  }, [stories])

  // Filtered stories
  const filteredStories = useMemo(() => {
    let result = [...stories]

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (s) => (s.category || "").toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Status filter
    if (statusFilter === "published") {
      result = result.filter((s) => s.is_published)
    } else if (statusFilter === "draft") {
      result = result.filter((s) => !s.is_published)
    } else if (statusFilter === "featured") {
      result = result.filter((s) => s.is_featured)
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return result
  }, [stories, selectedCategory, statusFilter, search, sortBy])

  const hasActiveFilters = search.trim() !== "" || selectedCategory !== "all" || statusFilter !== "all"

  const handleResetFilters = () => {
    setSearch("")
    setSelectedCategory("all")
    setStatusFilter("all")
  }

  // Toggle Featured status
  const handleToggleFeatured = async (story: StoryListItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextState = !story.is_featured

    // Optimistic update
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, is_featured: nextState } : s))
    )

    startTransition(async () => {
      const result = await toggleStoryFeaturedAction(story.id, nextState)
      if (result.success) {
        showToast.success(nextState ? `Starred "${story.title}" as featured` : `Unstarred "${story.title}"`)
      } else {
        // Rollback
        setStories((prev) =>
          prev.map((s) => (s.id === story.id ? { ...s, is_featured: !nextState } : s))
        )
        showToast.error("Failed to update featured status")
      }
    })
  }

  // Toggle Publish status
  const handleTogglePublished = async (story: StoryListItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextState = !story.is_published

    // Optimistic update
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, is_published: nextState } : s))
    )

    startTransition(async () => {
      const result = await toggleStoryPublishedAction(story.id, nextState)
      if (result.success) {
        showToast.success(nextState ? `Published "${story.title}" to public` : `Set "${story.title}" to draft`)
      } else {
        // Rollback
        setStories((prev) =>
          prev.map((s) => (s.id === story.id ? { ...s, is_published: !nextState } : s))
        )
        showToast.error("Failed to update publish status")
      }
    })
  }

  // Copy Public Link
  const handleCopyLink = (slug: string, isPublished: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!isPublished) {
      showToast.info("This story is currently in Draft and not live to the public.")
      return
    }
    if (!storiesEnabled) {
      showToast.warning("Notice: The public stories section is currently toggled off in Site Settings.")
    }
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const url = `${origin}/stories/${slug}`
    navigator.clipboard.writeText(url)
    showToast.success("Story URL copied to clipboard!")
  }

  // Delete
  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)

    try {
      const res = await deleteStoryAction(pendingDelete.id)
      if (res?.success) {
        setStories((prev) => prev.filter((s) => s.id !== pendingDelete.id))
        showToast.success(`Story "${pendingDelete.title}" deleted`)
        setPendingDelete(null)
      } else {
        showToast.error(res?.error || "Failed to delete story")
      }
    } catch {
      showToast.error("An unexpected error occurred while deleting story")
    } finally {
      setIsDeleting(false)
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Stories & Impact</h1>
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold">
              {stories.length} Total
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Curate field reports, news updates, and inspiring community impact stories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.refresh()}
            title="Refresh stories"
            className="size-10 shrink-0"
          >
            <RotateCw className={cn("size-4", isPending && "animate-spin")} />
          </Button>

          <Button asChild className="h-10 gap-2 px-4 font-semibold shadow-xs">
            <Link href="/admin/stories/new">
              <Plus className="size-4" />
              <span>Create Story</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          PUBLIC VISIBILITY NOTICE (when disabled in settings)
          ────────────────────────────────────────── */}
      {!storiesEnabled && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-amber-950 shadow-xs dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-200">
                Public Stories Page is Currently Hidden
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                The public stories routes (<code className="rounded bg-amber-200/60 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/60">/stories</code> and individual story articles) are currently disabled in Site Settings per client discussion. CMS management, drafts, and editing remain fully functional here.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="shrink-0 font-medium border-amber-300/80 bg-white hover:bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/70"
          >
            <Link href="/admin/settings?tab=site">
              Site Settings
            </Link>
          </Button>
        </div>
      )}

      {/* ──────────────────────────────────────────
          KPI METRIC STRIP (4 Cards)
          ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Stories */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Stories
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <BookOpen className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{stats.total}</span>
              <span className="text-xs text-muted-foreground">articles</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {categoriesList.length} topic categories
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
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Eye className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600">
                {stats.published}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                {stats.liveRate}% rate
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.liveRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Drafts */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                In Draft
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <FileText className="size-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{stats.drafts}</span>
              <span className="text-xs text-muted-foreground">in-progress</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pending review or publication</p>
          </CardContent>
        </Card>

        {/* Featured Stories */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured
              </span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-600">
                <Star className="size-4.5 fill-yellow-500 text-yellow-500" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-600 dark:text-yellow-400">
                {stats.featured}
              </span>
              <span className="text-xs text-muted-foreground">highlighted</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pinned to homepage impact rail</p>
          </CardContent>
        </Card>
      </div>

      {/* ──────────────────────────────────────────
          CATEGORY HORIZONTAL RAIL
          ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "relative overflow-hidden inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all border cursor-pointer group",
            selectedCategory === "all"
              ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/20 scale-[1.02]"
              : "bg-white text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 dark:bg-slate-900"
          )}
        >
          <span>All Topics</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-colors",
              selectedCategory === "all"
                ? "bg-white/25 text-white"
                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
            )}
          >
            {stories.length}
          </span>
          {selectedCategory === "all" && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
          )}
        </button>

        {categoriesList.map(([cat, count]) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "relative overflow-hidden inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all border cursor-pointer group",
                isSelected
                  ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-primary/40 shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-white text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 dark:bg-slate-900"
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-colors",
                  isSelected
                    ? "bg-white/25 text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                {count}
              </span>
              {isSelected && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-100 animate-shimmer pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {/* ──────────────────────────────────────────
          TOOLBAR: SEARCH, FILTERS & VIEW MODE
          ────────────────────────────────────────── */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories by title, excerpt, slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 pr-8 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & View Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Select */}
              <Select
                value={statusFilter}
                onValueChange={(val: "all" | "published" | "draft" | "featured") => setStatusFilter(val)}
              >
                <SelectTrigger className="h-10 w-[130px] sm:w-[140px] text-xs sm:text-sm">
                  <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">In Draft</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Select */}
              <Select
                value={sortBy}
                onValueChange={(val: "newest" | "oldest" | "title") => setSortBy(val)}
              >
                <SelectTrigger className="h-10 w-[125px] sm:w-[135px] text-xs sm:text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {/* View Switcher */}
              <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "size-9 rounded-md transition-colors",
                    viewMode === "table" && "bg-white dark:bg-slate-800 shadow-xs text-foreground font-bold"
                  )}
                  title="Table view"
                >
                  <TableIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "size-9 rounded-md transition-colors",
                    viewMode === "grid" && "bg-white dark:bg-slate-800 shadow-xs text-foreground font-bold"
                  )}
                  title="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </div>

              {/* Reset filter button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 gap-1.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────
          ACTIVE RESULTS COUNT
          ────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{filteredStories.length}</strong> of{" "}
          <strong>{stories.length}</strong> stories
          {hasActiveFilters && " (filtered)"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="hover:underline font-medium text-sky-600 dark:text-sky-400"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────
          TABLE VIEW (Desktop Optimized)
          ────────────────────────────────────────── */}
      {viewMode === "table" && (
        <Card className="border-border/70 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[56px] text-center">S.No.</TableHead>
                    <TableHead className="min-w-[200px] max-w-[280px]">Story</TableHead>
                    <TableHead className="min-w-[100px]">Category</TableHead>
                    <TableHead className="w-[84px] text-center">Featured</TableHead>
                    <TableHead className="min-w-[110px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="w-[130px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                            <BookOpen className="size-7" />
                          </div>
                          <h3 className="mt-4 text-base font-bold">No stories found</h3>
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {hasActiveFilters
                              ? "Try adjusting your search criteria or category filter to discover stories."
                              : "No stories have been written yet. Start by crafting your first impact story."}
                          </p>
                          {hasActiveFilters ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleResetFilters}
                              className="mt-4 h-9"
                            >
                              Reset all filters
                            </Button>
                          ) : (
                            <Button asChild size="sm" className="mt-4 h-9 gap-1.5">
                              <Link href="/admin/stories/new">
                                <Plus className="size-4" />
                                <span>Write a Story</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStories.map((story, index) => (
                      <TableRow
                        key={story.id}
                        onClick={() => router.push(`/admin/stories/${story.id}`)}
                        className={cn(styles.tableRow, "cursor-pointer group")}
                      >
                        {/* S.No. */}
                        <TableCell className="w-[56px] text-center font-mono text-xs font-semibold text-muted-foreground/80">
                          {index + 1}
                        </TableCell>

                        {/* Title & Thumbnail (Truncated) */}
                        <TableCell className="max-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted/50">
                              {story.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                                  <BookOpen className="size-4.5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="font-semibold text-sm leading-snug truncate group-hover:text-sky-600 transition-colors"
                                title={story.title}
                              >
                                {story.title}
                              </p>
                              {story.excerpt && (
                                <p
                                  className="mt-0.5 truncate text-xs text-muted-foreground"
                                  title={story.excerpt}
                                >
                                  {story.excerpt}
                                </p>
                              )}
                              {story.read_time && (
                                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground/75">
                                  <Clock className="size-3" />
                                  {story.read_time}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("px-2.5 py-0.5 text-xs font-semibold capitalize", getCategoryColor(story.category))}
                          >
                            {story.category || "General"}
                          </Badge>
                        </TableCell>

                        {/* Featured Star Quick Toggle */}
                        <TableCell className="text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFeatured(story, e)}
                            title={story.is_featured ? "Featured on homepage (click to remove)" : "Click to feature on homepage"}
                            className="inline-flex size-8 items-center justify-center rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          >
                            <Star
                              className={cn(
                                "size-4.5 transition-colors",
                                story.is_featured
                                  ? "fill-yellow-400 text-yellow-500 drop-shadow-xs"
                                  : "text-muted-foreground/40 hover:text-yellow-400"
                              )}
                            />
                          </button>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <button
                            type="button"
                            onClick={(e) => handleTogglePublished(story, e)}
                            className="inline-flex items-center gap-1.5 cursor-pointer text-left"
                            title={story.is_published ? "Published (click to unpublish)" : "Draft (click to publish)"}
                          >
                            {story.is_published ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs py-0.5 px-2.5 hover:bg-emerald-500/20"
                              >
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Live Public
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 border-dashed border-slate-300 bg-slate-100/70 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 font-semibold text-xs py-0.5 px-2.5 hover:bg-slate-200/70"
                              >
                                <EyeOff className="size-3" />
                                Draft
                              </Badge>
                            )}
                          </button>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(story.published_at || story.created_at)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Preview */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPreviewStory(story)}
                              className="size-8 text-muted-foreground hover:text-foreground"
                              title="Quick Preview"
                            >
                              <Eye className="size-4" />
                            </Button>

                            {/* View Live */}
                            {story.is_published && (
                              storiesEnabled ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  title="Open Live Story"
                                >
                                  <Link href={`/stories/${story.slug}`} target="_blank">
                                    <ExternalLink className="size-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => showToast.warning("Public stories are currently hidden in Site Settings.")}
                                  className="size-8 text-muted-foreground/40 hover:text-amber-600"
                                  title="Public stories are hidden in Site Settings"
                                >
                                  <ExternalLink className="size-4" />
                                </Button>
                              )
                            )}

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="size-8 text-muted-foreground hover:text-foreground"
                              title="Edit Story"
                            >
                              <Link href={`/admin/stories/${story.id}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>

                            {/* More Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setPreviewStory(story)}>
                                  <Eye className="size-4 mr-2" />
                                  <span>Preview Story</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleCopyLink(story.slug, story.is_published, e)}>
                                  <Copy className="size-4 mr-2" />
                                  <span>Copy Public URL</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => handleToggleFeatured(story, e)}>
                                  <Star className="size-4 mr-2 text-yellow-500 fill-yellow-500" />
                                  <span>{story.is_featured ? "Remove Featured" : "Mark as Featured"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleTogglePublished(story, e)}>
                                  {story.is_published ? (
                                    <>
                                      <EyeOff className="size-4 mr-2" />
                                      <span>Set to Draft</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="size-4 mr-2 text-emerald-600" />
                                      <span>Publish Now</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/stories/${story.id}`}>
                                    <Pencil className="size-4 mr-2" />
                                    <span>Edit Content</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setPendingDelete(story)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  <span>Delete Story</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──────────────────────────────────────────
          CARD GRID VIEW (Mobile & Responsive Grid)
          ────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStories.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <BookOpen className="size-7" />
              </div>
              <h3 className="mt-4 text-base font-bold">No stories found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try resetting your search or selecting a different category."
                  : "No stories created yet. Start drafting an impactful article."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4">
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            filteredStories.map((story) => (
              <Card
                key={story.id}
                onClick={() => router.push(`/admin/stories/${story.id}`)}
                className={cn(
                  styles.storyCard,
                  "group flex flex-col overflow-hidden border border-border/70 hover:shadow-md cursor-pointer bg-card transition-all"
                )}
              >
                {/* 16:9 Thumbnail Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b">
                  {story.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground/50">
                      <BookOpen className="size-10 stroke-1" />
                    </div>
                  )}

                  {/* Top Category Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md",
                        getCategoryColor(story.category)
                      )}
                    >
                      <Sparkles className="size-3 mr-1" />
                      {story.category || "General"}
                    </Badge>
                  </div>

                  {/* Top Featured Star Badge */}
                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFeatured(story, e)}
                      title={story.is_featured ? "Featured on homepage" : "Click to mark as featured"}
                      className="flex size-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          "size-4",
                          story.is_featured ? "fill-yellow-400 text-yellow-400" : "text-white/60 hover:text-white"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>{formatDate(story.published_at || story.created_at)}</span>
                    </div>
                    {story.read_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{story.read_time}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {story.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {story.excerpt || "No summary provided."}
                  </p>

                  {/* Footer status & Actions */}
                  <div
                    className="mt-4 pt-3 border-t flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      {story.is_published ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs py-0.5 px-2"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Live Public
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 border-dashed border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 font-semibold text-xs py-0.5 px-2"
                        >
                          <EyeOff className="size-3" />
                          Draft
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewStory(story)}
                        className="size-8"
                        title="Preview"
                      >
                        <Eye className="size-4" />
                      </Button>

                      {story.is_published && (
                        storiesEnabled ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="size-8"
                            title="View Live"
                          >
                            <Link href={`/stories/${story.slug}`} target="_blank">
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => showToast.warning("Public stories are currently hidden in Site Settings.")}
                            className="size-8 text-muted-foreground/40 hover:text-amber-600"
                            title="Public stories are hidden in Site Settings"
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        )
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-8"
                        title="Edit"
                      >
                        <Link href={`/admin/stories/${story.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setPreviewStory(story)}>
                            <Eye className="size-4 mr-2" />
                            <span>Preview Story</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleCopyLink(story.slug, story.is_published, e)}>
                            <Copy className="size-4 mr-2" />
                            <span>Copy Public Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleToggleFeatured(story, e)}>
                            <Star className="size-4 mr-2 text-yellow-500 fill-yellow-500" />
                            <span>{story.is_featured ? "Remove Featured" : "Mark as Featured"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleTogglePublished(story, e)}>
                            {story.is_published ? (
                              <>
                                <EyeOff className="size-4 mr-2" />
                                <span>Set to Draft</span>
                              </>
                            ) : (
                              <>
                                <Eye className="size-4 mr-2 text-emerald-600" />
                                <span>Publish Now</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setPendingDelete(story)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" />
                            <span>Delete Story</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────
          STORY PREVIEW MODAL
          ────────────────────────────────────────── */}
      {previewStory && (
        <StoryPreviewModal
          isOpen={Boolean(previewStory)}
          onClose={() => setPreviewStory(null)}
          story={{
            title: previewStory.title,
            excerpt: previewStory.excerpt,
            content: previewStory.content || "",
            image: previewStory.image || undefined,
            category: previewStory.category,
            read_time: previewStory.read_time || undefined,
          }}
        />
      )}

      {/* ──────────────────────────────────────────
          DELETE CONFIRMATION DIALOG
          ────────────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete Story?"
        description={`“${pendingDelete?.title || ""}” will be permanently removed from the impact stories library. This action cannot be undone.`}
        confirmLabel="Delete Story"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
