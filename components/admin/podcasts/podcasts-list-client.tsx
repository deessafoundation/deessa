"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Eye,
  Star,
  Video,
  Music,
  Pencil,
  Trash2,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Radio,
  Headphones,
  TrendingUp,
  X,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { PodcastRow } from "@/lib/types/podcast"
import styles from "./podcasts.module.css"

interface PodcastsListClientProps {
  initialPodcasts: PodcastRow[]
}

export function PodcastsListClient({ initialPodcasts }: PodcastsListClientProps) {
  const router = useRouter()
  const [podcasts, setPodcasts] = useState<PodcastRow[]>(initialPodcasts)
  const [prevInitial, setPrevInitial] = useState(initialPodcasts)

  if (prevInitial !== initialPodcasts) {
    setPrevInitial(initialPodcasts)
    setPodcasts(initialPodcasts)
  }

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "featured">("all")
  const [formatFilter, setFormatFilter] = useState<"all" | "video" | "audio">("all")

  // View mode - initialize based on media query without cascading render
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 767px)").matches ? "cards" : "table"
    }
    return "table"
  })
  const [userToggledView, setUserToggledView] = useState(false)

  // Actions state
  const [pendingDelete, setPendingDelete] = useState<PodcastRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auto-switch view mode when viewport resizes if user has not manually toggled
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
    const total = podcasts.length
    const published = podcasts.filter((p) => p.published).length
    const drafts = total - published
    const featured = podcasts.filter((p) => p.featured).length
    const totalViews = podcasts.reduce((sum, p) => sum + (p.view_count || 0), 0)

    return {
      total,
      published,
      drafts,
      featured,
      totalViews,
      percentLive: total > 0 ? Math.round((published / total) * 100) : 0,
    }
  }, [podcasts])

  // Filtered podcasts
  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((p) => {
      // Status filter
      if (statusFilter === "published" && !p.published) return false
      if (statusFilter === "draft" && p.published) return false
      if (statusFilter === "featured" && !p.featured) return false

      // Format filter
      if (formatFilter === "video" && p.format !== "video") return false
      if (formatFilter === "audio" && p.format === "video") return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = p.title?.toLowerCase().includes(query)
        const matchGuest = p.guest_name?.toLowerCase().includes(query)
        const matchEp = String(p.episode_number || "").includes(query)
        const matchTopics = p.topics?.some((t) => t.toLowerCase().includes(query))
        if (!matchTitle && !matchGuest && !matchEp && !matchTopics) return false
      }

      return true
    })
  }, [podcasts, statusFilter, formatFilter, searchQuery])

  // Fast Toggle Published / Featured
  const toggleFlag = async (podcast: PodcastRow, field: "published" | "featured", value: boolean) => {
    setBusyId(podcast.id)
    const prevPodcasts = [...podcasts]

    // Optimistic local update
    setPodcasts((prev) =>
      prev.map((p) => (p.id === podcast.id ? { ...p, [field]: value } : p))
    )

    try {
      const response = await fetch(`/api/admin/podcasts/${podcast.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error("Could not update podcast status")
      }

      const updated = await response.json()
      setPodcasts((prev) => prev.map((p) => (p.id === podcast.id ? { ...p, ...updated } : p)))
      notifications.showSuccess({
        description:
          field === "published"
            ? value
              ? `“${podcast.title}” is now published.`
              : `“${podcast.title}” set to draft.`
            : value
              ? `“${podcast.title}” is now featured.`
              : `“${podcast.title}” unfeatured.`,
      })
      router.refresh()
    } catch {
      setPodcasts(prevPodcasts)
      notifications.showError({
        description: "Failed to update podcast. Changes reverted.",
      })
    } finally {
      setBusyId(null)
    }
  }

  // Delete Action
  const handleDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    setBusyId(pendingDelete.id)

    try {
      const response = await fetch(`/api/admin/podcasts/${pendingDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete podcast episode")
      }

      setPodcasts((prev) => prev.filter((p) => p.id !== pendingDelete.id))
      notifications.showSuccess({
        description: `“${pendingDelete.title}” was deleted successfully.`,
      })
      setPendingDelete(null)
      router.refresh()
    } catch (error) {
      notifications.showError({
        description: error instanceof Error ? error.message : "Failed to delete podcast",
      })
    } finally {
      setIsDeleting(false)
      setBusyId(null)
    }
  }

  return (
    <div className={cn(styles.root, "space-y-6")}>
      {/* Studio Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Radio className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Podcast Broadcasts</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage video &amp; audio episodes, show notes, transcripts, and guest profiles.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" asChild className="h-10 text-sm font-medium">
            <Link href="/podcasts" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              View Public Studio
            </Link>
          </Button>

          <Button asChild className="h-10 px-5 text-sm font-semibold shadow-xs">
            <Link href="/admin/podcasts/new">
              <Plus className="mr-2 size-4" />
              Add Episode
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Studio Summary - 2x2 Grid on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* Card 1: Total Broadcasts */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Total Broadcasts
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.drafts} drafts)
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Headphones className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Live in Studio */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Live Episodes
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.published}
                  </p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.percentLive}% published)
                  </span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Eye className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Featured Showcase */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Featured Series
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.featured}
                  </p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">spotlight</span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="size-4 sm:size-5 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Audience Views */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Audience Reach
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">views</span>
                </div>
              </div>
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <TrendingUp className="size-4 sm:size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search episode title, guest name, or topic…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-8 text-sm"
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
            <SelectTrigger className="h-10 text-sm w-full sm:w-[160px]">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Live Only</SelectItem>
              <SelectItem value="draft">Drafts Only</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={formatFilter}
            onValueChange={(val) => setFormatFilter(val as typeof formatFilter)}
          >
            <SelectTrigger className="h-10 text-sm w-full sm:w-[150px]">
              <SelectValue placeholder="Format filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="video">Video Episodes</SelectItem>
              <SelectItem value="audio">Audio Episodes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end">
          <div className="flex items-center rounded-lg border bg-muted/30 p-1">
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs font-medium"
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
              className="h-8 px-2.5 text-xs font-medium"
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
      {podcasts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <Radio className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">No podcast episodes yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Paste a YouTube URL to automatically import your first podcast episode with metadata.
              </p>
            </div>
            <Button asChild className="h-10 px-5 text-sm font-semibold">
              <Link href="/admin/podcasts/new">
                <Plus className="mr-2 size-4" /> Add First Episode
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {podcasts.length > 0 && filteredPodcasts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <p className="font-semibold text-base">No episodes match your search or filter</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search keywords or clearing your status and format filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setFormatFilter("all")
              }}
              className="h-9 text-xs"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DESKTOP TABLE VIEW (Compact, Clean & Row-Clickable) */}
      {filteredPodcasts.length > 0 && viewMode === "table" && (
        <Card className="border overflow-hidden shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[100px]">Ep</TableHead>
                    <TableHead className="min-w-[320px]">Podcast and Details</TableHead>
                    <TableHead className="min-w-[170px]">Guest</TableHead>
                    <TableHead className="w-[100px]">Format</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Featured</TableHead>
                    <TableHead className="w-[90px]">Views</TableHead>
                    <TableHead className="w-[110px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPodcasts.map((podcast) => {
                    const isBusy = busyId === podcast.id
                    return (
                      <TableRow
                        key={podcast.id}
                        onClick={() => router.push(`/admin/podcasts/${podcast.id}`)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        {/* Episode Number - formatted as Ep : {number} */}
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold whitespace-nowrap">
                            Ep : {podcast.episode_number ?? "SP"}
                          </span>
                        </TableCell>

                        {/* Thumbnail & Title (Single Line & Clean, No Cluttered Summary) */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-10 shrink-0 overflow-hidden rounded-md border bg-neutral-900 shadow-2xs">
                              {podcast.thumbnail_url ? (
                                <img
                                  src={podcast.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Radio className="size-3.5" />
                                </div>
                              )}
                              {podcast.duration && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white text-[8px] font-mono px-1 rounded">
                                  {podcast.duration}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex flex-col justify-center">
                              <p className="font-semibold text-sm truncate max-w-[380px] group-hover:text-primary transition-colors">
                                {podcast.title.replace(/^(?:#?\s*EP\s*#?|Episode\s*#?)\s*(\d+)\s*[:\-–—]?\s*/i, "Ep : $1 - ")}
                              </p>
                              {podcast.slug && (
                                <p className="text-[11px] text-muted-foreground/70 font-mono truncate max-w-[320px]">
                                  /podcasts/{podcast.slug}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Guest */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {podcast.guest_name ? (
                            <div className="flex items-center gap-2">
                              {podcast.guest_photo_url ? (
                                <img
                                  src={podcast.guest_photo_url}
                                  alt=""
                                  className="size-6 rounded-full object-cover border"
                                />
                              ) : (
                                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  <User className="size-3" />
                                </div>
                              )}
                              <span className="text-sm font-medium truncate max-w-[140px]">
                                {podcast.guest_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No guest listed</span>
                          )}
                        </TableCell>

                        {/* Format */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize font-medium">
                            {podcast.format === "video" ? (
                              <>
                                <Video className="size-3 mr-1 text-primary" />
                                Video
                              </>
                            ) : (
                              <>
                                <Music className="size-3 mr-1 text-primary" />
                                Audio
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        {/* Published Switch */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={podcast.published}
                              disabled={isBusy}
                              onCheckedChange={(checked) => toggleFlag(podcast, "published", checked)}
                              aria-label={`Publish ${podcast.title}`}
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium px-2 py-0.5",
                                podcast.published
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {podcast.published ? "Live" : "Draft"}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Featured Switch */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={podcast.featured}
                              disabled={isBusy || !podcast.published}
                              onCheckedChange={(checked) => toggleFlag(podcast, "featured", checked)}
                              aria-label={`Feature ${podcast.title}`}
                            />
                            {podcast.featured && podcast.published && (
                              <Star className="size-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </TableCell>

                        {/* Views */}
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">
                            {(podcast.view_count || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                              <Link href={`/podcasts/${podcast.slug}`} target="_blank" title="View live episode">
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                              <Link href={`/admin/podcasts/${podcast.id}`} title="Edit episode">
                                <Pencil className="size-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setPendingDelete(podcast)}
                              title="Delete episode"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
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
      {filteredPodcasts.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPodcasts.map((podcast) => {
            const isBusy = busyId === podcast.id

            return (
              <Card
                key={podcast.id}
                onClick={() => router.push(`/admin/podcasts/${podcast.id}`)}
                className={cn(
                  "flex flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer group",
                  !podcast.published && "border-dashed"
                )}
              >
                {/* 16:9 Thumbnail Banner */}
                <div className="relative aspect-video bg-neutral-900 border-b">
                  {podcast.thumbnail_url ? (
                    <img
                      src={podcast.thumbnail_url}
                      alt=""
                      className={cn("w-full h-full object-cover", !podcast.published && "opacity-75")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Radio className="size-8 stroke-1" />
                    </div>
                  )}

                  {/* Badges in Header: Ep : {number} */}
                  <span className="absolute left-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-mono font-bold shadow-xs backdrop-blur-xs">
                    Ep : {podcast.episode_number ?? "SP"}
                  </span>

                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold backdrop-blur-xs",
                        podcast.published
                          ? "bg-emerald-500/90 text-white border-transparent"
                          : "bg-background/90 text-foreground border"
                      )}
                    >
                      {podcast.published ? "Live" : "Draft"}
                    </Badge>
                    {podcast.featured && podcast.published && (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/90 text-white border-transparent px-2 py-0.5 text-xs font-semibold backdrop-blur-xs"
                      >
                        <Star className="mr-1 size-3 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {podcast.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {podcast.duration}
                    </span>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {podcast.title.replace(/^(?:#?\s*EP\s*#?|Episode\s*#?)\s*(\d+)\s*[:\-–—]?\s*/i, "Ep : $1 - ")}
                    </h2>
                    {podcast.guest_name && (
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3 shrink-0" />
                        Guest: <span className="font-medium text-foreground">{podcast.guest_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Fast Switches */}
                  <div
                    className="flex flex-wrap items-center justify-between border-t pt-3 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={podcast.published}
                        disabled={isBusy}
                        onCheckedChange={(checked) => toggleFlag(podcast, "published", checked)}
                        aria-label={`Publish ${podcast.title}`}
                      />
                      <span className="text-xs font-medium">Published</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={podcast.featured}
                        disabled={isBusy || !podcast.published}
                        onCheckedChange={(checked) => toggleFlag(podcast, "featured", checked)}
                        aria-label={`Feature ${podcast.title}`}
                      />
                      <span className="text-xs font-medium">Featured</span>
                    </label>
                  </div>

                  {/* Footer Action Buttons */}
                  <div
                    className="mt-auto flex items-center justify-between border-t pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm" asChild className="h-9 text-xs px-2.5">
                      <Link href={`/podcasts/${podcast.slug}`} target="_blank">
                        <ExternalLink className="size-3.5 mr-1" />
                        Preview
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" asChild className="h-9 px-3 text-xs font-medium">
                        <Link href={`/admin/podcasts/${podcast.id}`}>
                          <Pencil className="size-3.5 mr-1.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendingDelete(podcast)}
                        aria-label={`Delete ${podcast.title}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
        title="Delete podcast episode?"
        description={`“${pendingDelete?.title ?? ""}” will be permanently removed from the public podcast library. This action cannot be undone.`}
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
