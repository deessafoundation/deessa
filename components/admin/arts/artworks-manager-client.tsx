"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  Info,
  LayoutGrid,
  Loader2,
  Maximize2,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Star,
  Table as TableIcon,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { ArtworksReorderModal } from "./artworks-reorder-modal"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import {
  createArtwork,
  deleteArtwork,
  reorderArtworks,
  saveArtsContent,
  setArtworkFlags,
  updateArtwork,
} from "@/lib/actions/artworks"
import { ARTS_CONTENT_LIMITS, type ArtsContent } from "@/lib/arts/content"
import {
  ARTWORK_COLLECTION_CREDIT,
  ARTWORK_MAX_UPLOAD_BYTES,
  ARTWORK_MIN_DIMENSION,
  toArtwork,
  type ArtworkRow,
} from "@/lib/arts/types"
import styles from "./artworks-manager-client.module.css"

type EditorState = { mode: "create" } | { mode: "edit"; row: ArtworkRow } | null

export function ArtworksManagerClient({
  initialArtworks,
  loadError,
  initialContent,
}: {
  initialArtworks: ArtworkRow[]
  loadError: string | null
  initialContent: ArtsContent
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialArtworks)
  const [activeTab, setActiveTab] = useState<"catalog" | "home" | "gallery">("catalog")
  const [editor, setEditor] = useState<EditorState>(null)
  const [pendingDelete, setPendingDelete] = useState<ArtworkRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "featured">("all")

  // View mode: Table default on desktop, Cards default on mobile
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [userToggledView, setUserToggledView] = useState(false)

  useEffect(() => {
    setRows(initialArtworks)
  }, [initialArtworks])

  // Responsive default view mode
  useEffect(() => {
    if (typeof window === "undefined" || userToggledView) return
    const media = window.matchMedia("(max-width: 767px)")
    setViewMode(media.matches ? "cards" : "table")

    const listener = (e: MediaQueryListEvent) => {
      if (!userToggledView) {
        setViewMode(e.matches ? "cards" : "table")
      }
    }
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [userToggledView])

  // Metrics
  const stats = useMemo(() => {
    const published = rows.filter((r) => r.is_published)
    const featured = published.filter((r) => r.is_featured)
    const drafts = rows.length - published.length
    return {
      total: rows.length,
      published: published.length,
      drafts,
      featured: featured.length,
      homepageActive: Math.min(3, published.length),
    }
  }, [rows])

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter === "published" && !r.is_published) return false
      if (statusFilter === "draft" && r.is_published) return false
      if (statusFilter === "featured" && (!r.is_featured || !r.is_published)) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = r.title.toLowerCase().includes(query)
        const matchesCredit = r.artist_credit?.toLowerCase().includes(query)
        const matchesAlt = r.alt_text.toLowerCase().includes(query)
        if (!matchesTitle && !matchesCredit && !matchesAlt) return false
      }

      return true
    })
  }, [rows, statusFilter, searchQuery])

  const replaceRow = (row: ArtworkRow) => setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)))

  const toggle = (row: ArtworkRow, flags: { is_published?: boolean; is_featured?: boolean }) => {
    setBusyId(row.id)
    startTransition(async () => {
      const result = await setArtworkFlags(row.id, flags)
      setBusyId(null)
      if (!result.ok) return notifications.showError({ description: result.error })
      replaceRow(result.data!)
      notifications.showSuccess({
        description:
          flags.is_published !== undefined
            ? flags.is_published
              ? `“${row.title}” is now public.`
              : `“${row.title}” is now a draft.`
            : flags.is_featured
              ? `“${row.title}” is featured on the homepage.`
              : `“${row.title}” is no longer featured.`,
      })
    })
  }

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    const previous = rows
    setRows(next.map((r, i) => ({ ...r, display_order: i + 1 })))
    setBusyId(rows[index].id)
    startTransition(async () => {
      const result = await reorderArtworks(next.map((r) => r.id))
      setBusyId(null)
      if (!result.ok) {
        setRows(previous)
        notifications.showError({ description: result.error })
      } else {
        notifications.showSuccess({
          description: `“${rows[index].title}” moved to position #${target + 1}.`,
        })
      }
    })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const row = pendingDelete
    setBusyId(row.id)
    startTransition(async () => {
      const result = await deleteArtwork(row.id)
      setBusyId(null)
      setPendingDelete(null)
      if (!result.ok) return notifications.showError({ description: result.error })
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      notifications.showSuccess({ description: `“${row.title}” was deleted.` })
      router.refresh()
    })
  }

  return (
    <div className={cn(styles.root, "space-y-6")}>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Artworks &amp; Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curate and manage paintings for the <strong>/arts</strong> public gallery and homepage showcase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" asChild className="h-10 text-sm font-medium">
            <Link href="/arts" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" aria-hidden="true" />
              View Live Gallery
            </Link>
          </Button>
          <Button
            onClick={() => setEditor({ mode: "create" })}
            disabled={Boolean(loadError)}
            className="h-10 text-sm font-semibold shadow-xs"
          >
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Add Artwork
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Artworks couldn&apos;t be loaded.</p>
            <p className="mt-1 text-xs opacity-90">
              {loadError}. If this is a new database instance, verify that the artworks schema migration has been applied.
            </p>
          </div>
        </div>
      )}

      {/* Horizontally Scrollable Tab Navigation Strip */}
      <Card className="border shadow-xs">
        <CardContent className="overflow-x-auto p-1.5 sm:p-2 scrollbar-none">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
            <TabsList aria-label="Artworks management tabs" className={cn(styles.track, "flex h-auto w-max sm:w-full min-w-full sm:min-w-0 items-center justify-start gap-1 sm:gap-1.5 rounded-xl p-1")}>
              <TabsTrigger
                value="catalog"
                className={cn(styles.tab, "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1")}
              >
                <Palette className="size-4 shrink-0" aria-hidden="true" />
                <span>Artworks Catalog</span>
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs font-semibold">
                  {rows.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="home"
                className={cn(styles.tab, "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1")}
              >
                <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                <span>Homepage Feature Copy</span>
              </TabsTrigger>

              <TabsTrigger
                value="gallery"
                className={cn(styles.tab, "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1")}
              >
                <Globe className="size-4 shrink-0" aria-hidden="true" />
                <span>Gallery Page Copy</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* TAB 1: Artworks Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Responsive 2x2 on Mobile, 4x1 on Desktop KPI Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            <Card className="border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Total Artworks
                    </p>
                    <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        ({stats.drafts} drafts)
                      </span>
                    </div>
                  </div>
                  <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <Palette className="size-4 sm:size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Live in Gallery
                    </p>
                    <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.published}
                      </p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        ({stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Eye className="size-4 sm:size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Draft Works
                    </p>
                    <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <p className="text-xl sm:text-2xl font-bold">{stats.drafts}</p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">unpublished</span>
                    </div>
                  </div>
                  <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-muted text-muted-foreground">
                    <EyeOff className="size-4 sm:size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Home Featured
                    </p>
                    <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                      <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.featured}
                      </p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        (max 3 on home)
                      </span>
                    </div>
                  </div>
                  <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Star className="size-4 sm:size-5 fill-current" />
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
                  placeholder="Search by title, artist, or alt text…"
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
                <SelectTrigger className="h-10 text-sm w-full sm:w-[170px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artworks</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="draft">Drafts Only</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              {rows.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setShowReorderModal(true)}
                  className="h-10 px-3 text-sm font-medium"
                >
                  <ArrowUpDown className="mr-2 size-4 text-muted-foreground" />
                  Reorder
                </Button>
              )}

              {/* View Switcher: Table vs Cards */}
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
          {rows.length === 0 && !loadError && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                  <ImagePlus className="size-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">No artworks in the gallery</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Upload your first artwork or select from media to showcase paintings on the public gallery.
                  </p>
                </div>
                <Button onClick={() => setEditor({ mode: "create" })} className="h-10 px-5 text-sm font-semibold">
                  <Plus className="mr-2 size-4" /> Add First Artwork
                </Button>
              </CardContent>
            </Card>
          )}

          {rows.length > 0 && filteredRows.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center space-y-3">
                <p className="font-semibold text-base">No artworks match your search or filter</p>
                <p className="text-sm text-muted-foreground">
                  Try clearing the search box or selecting &ldquo;All Artworks&rdquo;.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                  className="h-9 text-xs"
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* DESKTOP TABLE VIEW */}
          {filteredRows.length > 0 && viewMode === "table" && (
            <Card className="border overflow-hidden shadow-xs">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-[100px]">Order</TableHead>
                        <TableHead className="min-w-[280px]">Artwork &amp; Title</TableHead>
                        <TableHead className="min-w-[150px]">Artist Credit</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[120px]">Featured</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((row) => {
                        const originalIndex = rows.findIndex((r) => r.id === row.id)
                        const art = toArtwork(row)
                        const busy = busyId === row.id && isPending

                        return (
                          <TableRow key={row.id} className="hover:bg-muted/20 transition-colors">
                            {/* Order & Position Controls */}
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tabular-nums">
                                  #{originalIndex + 1}
                                </span>
                                <div className="flex flex-col border border-border/80 rounded-md p-0.5 bg-muted/20">
                                  <button
                                    type="button"
                                    disabled={originalIndex === 0 || busy}
                                    onClick={() => move(originalIndex, -1)}
                                    className={cn(
                                      "p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                                      (originalIndex === 0 || busy) && "opacity-20 pointer-events-none cursor-not-allowed"
                                    )}
                                    title="Move earlier in gallery"
                                    aria-label={`Move ${row.title} earlier`}
                                  >
                                    <ArrowUp className="size-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={originalIndex === rows.length - 1 || busy}
                                    onClick={() => move(originalIndex, 1)}
                                    className={cn(
                                      "p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                                      (originalIndex === rows.length - 1 || busy) && "opacity-20 pointer-events-none cursor-not-allowed"
                                    )}
                                    title="Move later in gallery"
                                    aria-label={`Move ${row.title} later`}
                                  >
                                    <ArrowDown className="size-2.5" />
                                  </button>
                                </div>
                              </div>
                            </TableCell>

                            {/* Thumbnail & Title */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-neutral-100 dark:bg-neutral-800">
                                  {art?.src ? (
                                    <Image
                                      src={art.src}
                                      alt=""
                                      fill
                                      sizes="48px"
                                      className={cn("object-contain p-0.5", !row.is_published && "opacity-60")}
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                      <ImageIcon className="size-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-semibold text-sm truncate max-w-[320px]">{row.title}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                                    Alt: {row.alt_text}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Artist Credit */}
                            <TableCell className="text-sm text-muted-foreground">
                              {row.artist_credit || (
                                <span className="italic text-xs text-muted-foreground/80">
                                  {ARTWORK_COLLECTION_CREDIT ? `${ARTWORK_COLLECTION_CREDIT}` : "No credit listed"}
                                </span>
                              )}
                            </TableCell>

                            {/* Published Status Toggle */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={row.is_published}
                                  disabled={busy}
                                  onCheckedChange={(checked) => toggle(row, { is_published: checked })}
                                  aria-label={`Publish ${row.title}`}
                                />
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-medium px-2 py-0.5",
                                    row.is_published
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {row.is_published ? "Live" : "Draft"}
                                </Badge>
                              </div>
                            </TableCell>

                            {/* Featured Status Toggle */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={row.is_featured}
                                  disabled={busy || !row.is_published}
                                  onCheckedChange={(checked) => toggle(row, { is_featured: checked })}
                                  aria-label={`Feature ${row.title} on homepage`}
                                />
                                {row.is_featured && row.is_published && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-medium px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                  >
                                    <Star className="size-3 mr-1 fill-amber-500 text-amber-500" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => setEditor({ mode: "edit", row })}
                                  aria-label={`Edit ${row.title}`}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setPendingDelete(row)}
                                  aria-label={`Delete ${row.title}`}
                                >
                                  <Trash2 className="size-4" />
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

          {/* CARD GRID VIEW (Mobile & Responsive) */}
          {filteredRows.length > 0 && viewMode === "cards" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRows.map((row) => {
                const originalIndex = rows.findIndex((r) => r.id === row.id)
                const art = toArtwork(row)
                const busy = busyId === row.id && isPending

                return (
                  <Card
                    key={row.id}
                    className={cn(
                      "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
                      !row.is_published && "border-dashed"
                    )}
                  >
                    {/* Visual Media Container */}
                    <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 border-b">
                      {art?.src && (
                        <Image
                          src={art.src}
                          alt={row.alt_text}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className={cn("object-contain p-3", !row.is_published && "opacity-60")}
                        />
                      )}
                      <span className="absolute left-3 top-3 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-mono font-bold shadow-xs backdrop-blur-xs">
                        #{originalIndex + 1}
                      </span>
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 text-xs font-semibold backdrop-blur-xs",
                            row.is_published
                              ? "bg-emerald-500/90 text-white border-transparent"
                              : "bg-background/90 text-foreground border"
                          )}
                        >
                          {row.is_published ? "Live" : "Draft"}
                        </Badge>
                        {row.is_featured && row.is_published && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/90 text-white border-transparent px-2 py-0.5 text-xs font-semibold backdrop-blur-xs"
                          >
                            <Star className="mr-1 size-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h2 className="font-bold text-base leading-tight truncate">{row.title}</h2>
                        <p className="mt-1 text-xs text-muted-foreground truncate">
                          {row.artist_credit || (ARTWORK_COLLECTION_CREDIT ? `${ARTWORK_COLLECTION_CREDIT}` : "No credit listed")}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Alt:</span> {row.alt_text}
                        </p>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-wrap items-center justify-between border-t pt-3 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={row.is_published}
                            disabled={busy}
                            onCheckedChange={(checked) => toggle(row, { is_published: checked })}
                            aria-label={`Publish ${row.title}`}
                          />
                          <span className="text-xs font-medium">Published</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={row.is_featured}
                            disabled={busy || !row.is_published}
                            onCheckedChange={(checked) => toggle(row, { is_featured: checked })}
                            aria-label={`Feature ${row.title}`}
                          />
                          <span className="text-xs font-medium">Featured</span>
                        </label>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="mt-auto flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9"
                            onClick={() => move(originalIndex, -1)}
                            disabled={originalIndex === 0 || isPending}
                            aria-label={`Move ${row.title} earlier`}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-9"
                            onClick={() => move(originalIndex, 1)}
                            disabled={originalIndex === rows.length - 1 || isPending}
                            aria-label={`Move ${row.title} later`}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            className="h-9 px-3 text-xs font-medium"
                            onClick={() => setEditor({ mode: "edit", row })}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setPendingDelete(row)}
                            aria-label={`Delete ${row.title}`}
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
        </div>
      )}

      {/* TAB 2 & 3: Copy Editors */}
      {activeTab === "home" && <CopySectionEditor group="home" initialContent={initialContent} />}
      {activeTab === "gallery" && <CopySectionEditor group="gallery" initialContent={initialContent} />}

      {/* Reorder Modal */}
      {showReorderModal && (
        <ArtworksReorderModal
          open={showReorderModal}
          onOpenChange={setShowReorderModal}
          artworks={rows}
          onReorderSuccess={(reordered) => {
            setRows(reordered)
            router.refresh()
          }}
        />
      )}

      {/* Artwork Create/Edit Dialog */}
      {editor && (
        <ArtworkEditor
          key={editor.mode === "edit" ? editor.row.id : "new"}
          state={editor}
          onClose={() => setEditor(null)}
          onSaved={(row, created) => {
            setRows((prev) => (created ? [...prev, row] : prev.map((r) => (r.id === row.id ? row : r))))
            setEditor(null)
            router.refresh()
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this artwork?"
        description={`“${pendingDelete?.title ?? ""}” will be removed from the gallery and homepage. Uploaded image files are also removed when no other artwork uses them. This action cannot be undone.`}
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Redesigned Museum-Quality Artwork Editor Modal
// ---------------------------------------------------------------------------
function ArtworkEditor({
  state,
  onClose,
  onSaved,
}: {
  state: NonNullable<EditorState>
  onClose: () => void
  onSaved: (row: ArtworkRow, created: boolean) => void
}) {
  const existing = state.mode === "edit" ? state.row : null
  const existingArt = existing ? toArtwork(existing) : null

  // Core Form State
  const [title, setTitle] = useState(existing?.title ?? "")
  const [credit, setCredit] = useState(existing?.artist_credit ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [alt, setAlt] = useState(existing?.alt_text ?? "")
  const [isPublished, setIsPublished] = useState(existing?.is_published ?? true)
  const [isFeatured, setIsFeatured] = useState(existing?.is_featured ?? false)

  // Media State
  const [imageUrl, setImageUrl] = useState<string>(existingArt?.src ?? "")
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; filename?: string }>({
    width: existing?.width ?? 800,
    height: existing?.height ?? 600,
    filename: existing?.source_filename ?? "",
  })

  // UI State
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, startSaving] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Revoke any blob URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  // Drag & drop handlers on canvas
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processLocalFile(file)
  }

  function processLocalFile(file: File) {
    const nextErrors = { ...errors }
    delete nextErrors.image

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setErrors({ ...nextErrors, image: "Please select a JPEG, PNG, or WebP image." })
      return
    }

    if (file.size > ARTWORK_MAX_UPLOAD_BYTES) {
      setErrors({ ...nextErrors, image: "Images must be 5 MB or smaller." })
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const probe = new window.Image()
    probe.onload = () => {
      if (Math.min(probe.naturalWidth, probe.naturalHeight) < ARTWORK_MIN_DIMENSION) {
        URL.revokeObjectURL(objectUrl)
        setErrors({
          ...nextErrors,
          image: `Artwork must be at least ${ARTWORK_MIN_DIMENSION}px on the shortest side for gallery sharpness.`,
        })
        return
      }

      setErrors(nextErrors)
      setLocalFile(file)
      setImageUrl(objectUrl)
      setImageMeta({
        width: probe.naturalWidth,
        height: probe.naturalHeight,
        filename: file.name,
      })
    }
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setErrors({ ...nextErrors, image: "Could not read this file as an image." })
    }
    probe.src = objectUrl
  }

  function handleMediaPickerSelect(url: string) {
    setImageUrl(url)
    setLocalFile(null)
    const nextErrors = { ...errors }
    delete nextErrors.image
    setErrors(nextErrors)

    if (typeof window !== "undefined") {
      const probe = new window.Image()
      probe.onload = () => {
        setImageMeta({
          width: probe.naturalWidth,
          height: probe.naturalHeight,
          filename: url.split("/").pop() || "selected-artwork",
        })
      }
      probe.src = url
    }
  }

  // Accessibility Score for Alt Text
  const altScore = useMemo(() => {
    const len = alt.trim().length
    if (len === 0) return { label: "Missing", color: "text-muted-foreground", bg: "bg-muted" }
    if (len < 10) return { label: "Too brief", color: "text-amber-600", bg: "bg-amber-500/20" }
    if (len < 30) return { label: "Good summary", color: "text-primary", bg: "bg-primary/20" }
    return { label: "Excellent detail", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20" }
  }, [alt])

  const isFormReady = Boolean(title.trim() && alt.trim().length >= 5 && imageUrl)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const local: Record<string, string> = {}
    if (!title.trim()) local.title = "Artwork title is required."
    if (alt.trim().length < 5) local.alt_text = "Describe what is shown in the painting (at least 5 characters)."
    if (!imageUrl && !localFile) local.image = "Artwork painting image is required."
    if (Object.keys(local).length) return setErrors(local)

    const form = new FormData()
    form.set("title", title)
    form.set("artist_credit", credit)
    form.set("description", description)
    form.set("alt_text", alt)
    form.set("is_published", String(isPublished))
    form.set("is_featured", String(isFeatured))
    form.set("width", String(imageMeta.width))
    form.set("height", String(imageMeta.height))

    if (localFile) {
      form.set("image", localFile)
    } else if (imageUrl) {
      form.set("image_url", imageUrl)
      if (imageMeta.filename) form.set("filename", imageMeta.filename)
    }

    startSaving(async () => {
      const result = existing ? await updateArtwork(existing.id, form) : await createArtwork(form)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        notifications.showError({ description: result.error })
        return
      }
      notifications.showSuccess({
        description: existing
          ? `“${result.data?.title}” updated successfully.`
          : `“${result.data?.title}” added to the collection.`,
      })
      onSaved(result.data!, !existing)
    })
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
        <DialogContent className="max-h-[92vh] sm:max-w-5xl p-0 overflow-hidden flex flex-col rounded-2xl border shadow-2xl">
          {/* Top Status & Header Bar */}
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                  <Palette className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                    {existing ? "Edit Artwork" : "Curate New Artwork"}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {existing
                      ? "Fine-tune metadata, curatorial tags, and presentation framing."
                      : "Add an original work of art to the permanent digital collection."}
                  </DialogDescription>
                </div>
              </div>

              {/* Status Indicator Badges */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg",
                    isPublished
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full mr-1.5", isPublished ? "bg-emerald-500" : "bg-muted-foreground")} />
                  {isPublished ? "Live in Gallery" : "Draft Status"}
                </Badge>

                {isFeatured && isPublished && (
                  <Badge
                    variant="outline"
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  >
                    <Star className="size-3 mr-1 fill-amber-500 text-amber-500" />
                    Homepage Featured
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Form Content - 2-Column Responsive Curatorial Canvas */}
          <form onSubmit={submit} className="flex-1 overflow-y-auto" noValidate>
            <div className="grid lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x">
              {/* LEFT COLUMN: Metadata & Curatorial Controls (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-6">
                {/* Section 1: Core Artwork Identity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      Artwork Identity
                    </h3>
                    <span className="text-[11px] text-muted-foreground">* Required fields</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="art-title" className="text-sm font-semibold">
                        Title of the Artwork <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono">{title.length}/120</span>
                    </div>
                    <Input
                      id="art-title"
                      value={title}
                      maxLength={120}
                      placeholder="e.g. Village at Dawn"
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 text-sm rounded-xl font-medium"
                      aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && <p className="text-xs text-destructive font-medium">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="art-credit" className="text-sm font-semibold">
                        Artist Credit
                      </Label>
                      {ARTWORK_COLLECTION_CREDIT && !credit && (
                        <button
                          type="button"
                          onClick={() => setCredit(ARTWORK_COLLECTION_CREDIT)}
                          className="text-[11px] text-primary hover:underline font-medium"
                        >
                          Use &ldquo;{ARTWORK_COLLECTION_CREDIT}&rdquo;
                        </button>
                      )}
                    </div>
                    <Input
                      id="art-credit"
                      value={credit}
                      maxLength={120}
                      placeholder={ARTWORK_COLLECTION_CREDIT || "e.g. Maya Tamang"}
                      onChange={(e) => setCredit(e.target.value)}
                      className="h-11 text-sm rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="size-3 shrink-0" />
                      Only credit individual young artists once verified with their family.
                    </p>
                  </div>
                </div>

                {/* Section 2: Exhibition & Curatorial Flags */}
                <div className="space-y-3 pt-3 border-t">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-primary" />
                    Exhibition &amp; Distribution
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* Public Visibility Toggle Card */}
                    <div
                      className={cn(
                        "rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-3",
                        isPublished ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card hover:bg-muted/30"
                      )}
                      onClick={() => setIsPublished(!isPublished)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", isPublished ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                          </div>
                          <span className="text-sm font-bold">Public Gallery</span>
                        </div>
                        <Switch
                          checked={isPublished}
                          onCheckedChange={setIsPublished}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Publish in gallery"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isPublished
                          ? "Visible to all visitors in the /arts collection."
                          : "Saved as an internal draft; hidden from the public."}
                      </p>
                    </div>

                    {/* Homepage Showcase Toggle Card */}
                    <div
                      className={cn(
                        "rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-3",
                        isFeatured && isPublished ? "bg-amber-500/5 border-amber-500/30" : "bg-card hover:bg-muted/30",
                        !isPublished && "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (isPublished) setIsFeatured(!isFeatured)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", isFeatured && isPublished ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
                            <Star className={cn("size-4", isFeatured && isPublished && "fill-current")} />
                          </div>
                          <span className="text-sm font-bold">Home Feature</span>
                        </div>
                        <Switch
                          checked={isFeatured && isPublished}
                          disabled={!isPublished}
                          onCheckedChange={setIsFeatured}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Feature on homepage"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isFeatured && isPublished
                          ? "Highlighted in the homepage art showcase (top 3)."
                          : "Only displayed in the full /arts gallery."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Context & Accessibility Narrative */}
                <div className="space-y-4 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <HelpCircle className="size-3.5 text-primary" />
                      Visual Narrative &amp; Accessibility
                    </h3>
                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", altScore.color, altScore.bg)}>
                      {altScore.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="art-alt" className="text-sm font-semibold">
                        Alt Text for Assistive Tech <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono">{alt.length}/300</span>
                    </div>
                    <Textarea
                      id="art-alt"
                      value={alt}
                      rows={3}
                      maxLength={300}
                      placeholder="Describe what the painting shows: main subjects, artistic style, textures, and dominant colors (e.g. A vibrant acrylic painting of children planting young saplings on a green hillside with warm yellow sunlight)..."
                      onChange={(e) => setAlt(e.target.value)}
                      className="text-sm rounded-xl leading-relaxed"
                      aria-invalid={Boolean(errors.alt_text)}
                    />
                    {errors.alt_text && <p className="text-xs text-destructive font-medium">{errors.alt_text}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="art-description" className="text-sm font-semibold">
                        Curatorial Notes &amp; Story <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono">{description.length}/1200</span>
                    </div>
                    <Textarea
                      id="art-description"
                      value={description}
                      rows={3}
                      maxLength={1200}
                      placeholder="Background context, inspiration, or thoughts behind this piece shown in the gallery viewer modal..."
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-sm rounded-xl leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Exhibition Frame & Live Canvas (5 cols) */}
              <div className="lg:col-span-5 bg-muted/20 p-6 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      Gallery Exhibition Canvas
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Live Public Card</span>
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) processLocalFile(file)
                    }}
                  />

                  {/* MUSEUM EXHIBITION FRAME */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      styles.galleryFrame,
                      "relative rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col gap-4",
                      isDragging && "ring-4 ring-primary/40 scale-[1.01]"
                    )}
                  >
                    {/* The Canvas Mat */}
                    <div className={cn(styles.galleryMat, "relative aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center")}>
                      {imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt="Artwork Canvas Preview"
                            fill
                            sizes="(min-width: 1024px) 380px, 100vw"
                            className="object-contain p-2.5 transition-transform duration-500 hover:scale-[1.02]"
                          />

                          {/* Top-Right Quick Canvas Floating Controls */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-border/80">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs font-medium"
                              onClick={() => fileInputRef.current?.click()}
                              title="Upload another file"
                            >
                              <Upload className="size-3 mr-1" />
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs font-medium"
                              onClick={() => setShowMediaPicker(true)}
                              title="Browse from library"
                            >
                              <ImageIcon className="size-3 mr-1" />
                              Library
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setImageUrl("")
                                setLocalFile(null)
                              }}
                              title="Clear image"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>

                          {/* Dimensions & Quality Badge */}
                          <div className="absolute bottom-2.5 left-2.5 bg-neutral-900/80 text-white backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-mono font-medium">
                            {imageMeta.width} × {imageMeta.height} px
                          </div>
                        </>
                      ) : (
                        /* Empty State Canvas Dropzone */
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <div className="relative size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                            <UploadCloud className="size-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm">Drop painting here</p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                              JPEG, PNG or WebP up to 5MB (min {ARTWORK_MIN_DIMENSION}px)
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-8 px-3 text-xs font-semibold shadow-xs"
                            >
                              <Upload className="mr-1.5 size-3.5" />
                              Browse File
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowMediaPicker(true)}
                              className="h-8 px-3 text-xs font-medium bg-background"
                            >
                              <ImageIcon className="mr-1.5 size-3.5" />
                              Media Library
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Museum Gallery Plaque / Label Card */}
                    <div className={cn(styles.plaque, "rounded-xl p-3.5 space-y-1")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-base truncate leading-snug">
                            {title || "Untitled Painting"}
                          </h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium truncate mt-0.5">
                            {credit.trim() || ARTWORK_COLLECTION_CREDIT || "Collection Piece"}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="flex items-center text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Gallery Plaque
                          </span>
                        </div>
                      </div>

                      {alt && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1 border-t border-border/40 italic">
                          &ldquo;{alt}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.image && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{errors.image}</span>
                    </div>
                  )}
                </div>

                {/* Helpful Curatorial Tip */}
                <div className="rounded-xl border bg-card/60 p-3.5 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Curator Note
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Artworks are shown uncropped in the public gallery viewer so their natural composition and borders remain intact.
                  </p>
                </div>
              </div>
            </div>

            {/* STICKY DIALOG ACTION FOOTER */}
            <DialogFooter className="p-4 sm:p-5 border-t bg-card sticky bottom-0 z-10 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isFormReady ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4 mr-1.5" />
                    Ready to save
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Info className="size-4 mr-1.5" />
                    Please provide title, alt text, and an image
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                  className="h-10 px-4 text-sm font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 text-sm font-semibold shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving Artwork…
                    </>
                  ) : existing ? (
                    <>
                      <Save className="mr-2 size-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 size-4" />
                      {isPublished ? "Publish to Gallery" : "Create Draft Artwork"}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Integrated Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelect={(url) => {
            handleMediaPickerSelect(url)
            setShowMediaPicker(false)
          }}
          bucket="site-assets"
          title="Select Painting from Media Library"
          description="Browse previously uploaded assets or select photos from the site-assets bucket."
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Copy Section Editor with Desktop Sticky Bar & Mobile Floating Bottom Bar
// ---------------------------------------------------------------------------
type ContentFieldDef = { key: string; label: string; long?: boolean; description?: string }

const HOME_FIELDS: ContentFieldDef[] = [
  { key: "eyebrow", label: "Eyebrow Badge", description: "Small category text appearing above the title" },
  { key: "heading", label: "Main Heading", description: "Primary section heading" },
  { key: "headingAccent", label: "Heading Accent", description: "Underlined highlight word or phrase" },
  { key: "intro", label: "Introduction Paragraph", long: true, description: "Descriptive background text" },
  { key: "ctaLabel", label: "Explore Button Label", description: "Text for the link pointing to the full /arts gallery" },
  { key: "creditLine", label: "Artist Credit Note", description: "Supporting credit acknowledgement" },
  { key: "badge", label: "Collage Caption Badge", description: "Short pill text overlaid on the collage" },
]

const GALLERY_FIELDS: ContentFieldDef[] = [
  { key: "eyebrow", label: "Hero Eyebrow", description: "Small subtitle on the gallery hero" },
  { key: "heading", label: "Hero Heading", description: "Primary title on /arts" },
  { key: "headingAccent", label: "Hero Accent", description: "Accent words on the hero heading" },
  { key: "intro", label: "Hero Intro", long: true, description: "Gallery statement paragraph" },
  { key: "heroBadge", label: "Hero Photo Badge", description: "Tag displayed over the hero banner" },
  { key: "collectionHeading", label: "Collection Heading", description: "Title preceding the artwork grid" },
  { key: "collectionAccent", label: "Collection Accent", description: "Highlighted text in the collection title" },
  { key: "collectionIntro", label: "Collection Intro", long: true, description: "Contextual narrative for the gallery pieces" },
]

function CopySectionEditor({
  group,
  initialContent,
}: {
  group: "home" | "gallery"
  initialContent: ArtsContent
}) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(initialContent)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, startSaving] = useTransition()

  const dirty = JSON.stringify(content[group]) !== JSON.stringify(saved[group])
  const fields = group === "home" ? HOME_FIELDS : GALLERY_FIELDS
  const title = group === "home" ? "Homepage Art Feature" : "Public Gallery Page (/arts)"

  const setField = (key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }))
  }

  const discard = () => {
    setContent((prev) => ({
      ...prev,
      [group]: { ...saved[group] },
    }))
    setErrors({})
    notifications.showSuccess({ description: "Changes discarded." })
  }

  const save = () => {
    startSaving(async () => {
      const result = await saveArtsContent(content)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        notifications.showError({ description: result.error })
        return
      }
      setErrors({})
      setContent(result.data!)
      setSaved(result.data!)
      notifications.showSuccess({ description: "Copy published successfully to the live site." })
    })
  }

  return (
    <div className="space-y-6">
      {/* Desktop Sticky Save / Action Bar (top-16) */}
      <div className="hidden md:flex sticky top-16 z-20 items-center justify-between gap-4 rounded-xl border bg-background/95 backdrop-blur-md p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-1 text-xs font-semibold",
              dirty
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
            )}
          >
            {dirty ? "Unsaved edits" : "Up to date"}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {dirty
              ? "You have unsaved changes. Save to publish them to the live website."
              : `All ${title} copy is synchronized.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-medium"
            onClick={discard}
            disabled={!dirty || saving}
          >
            <RotateCcw className="mr-2 size-4" aria-hidden="true" />
            Discard
          </Button>
          <Button
            className="h-10 px-5 text-sm font-semibold shadow-xs"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" aria-hidden="true" />
                Save &amp; Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Floating Bottom Action Pill */}
      {dirty && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 p-3 rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pl-1">
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">Unsaved edits</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 text-xs px-3 font-medium"
              onClick={discard}
              disabled={saving}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              className="h-10 text-xs px-4 font-semibold shadow-xs"
              onClick={save}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
              Publish
            </Button>
          </div>
        </div>
      )}

      {/* Main Copy Form Fields */}
      <Card className="border shadow-xs">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold">{title} Copy</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize text, headlines, and descriptions displayed to public visitors.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {fields.map((field) => {
              const errorKey = `${group}.${field.key}`
              const max = (ARTS_CONTENT_LIMITS[group] as Record<string, number>)[field.key]
              const value = (content[group] as Record<string, string>)[field.key] || ""
              const Control = field.long ? Textarea : Input

              return (
                <div key={field.key} className={cn("space-y-2", field.long && "md:col-span-2")}>
                  <div className="flex items-baseline justify-between gap-2">
                    <Label htmlFor={`content-${group}-${field.key}`} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {value.length}/{max}
                    </span>
                  </div>

                  <Control
                    id={`content-${group}-${field.key}`}
                    value={value}
                    maxLength={max}
                    {...(field.long ? { rows: 3 } : { className: "h-10 sm:h-11 text-sm" })}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setField(field.key, e.target.value)
                    }
                    aria-invalid={Boolean(errors[errorKey])}
                  />

                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}

                  {errors[errorKey] && (
                    <p className="text-xs text-destructive font-medium">{errors[errorKey]}</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
