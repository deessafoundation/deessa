"use client"

import { useState, useTransition, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Calendar, 
  TrendingUp, 
  MousePointerClick, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  LayoutGrid, 
  Table as TableIcon, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon,
  Share2,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { PostsReorder } from "./posts-reorder"
import { FacebookPostPreview } from "@/components/facebook-posts/facebook-post-preview"
import { 
  deleteFacebookPost, 
  bulkUpdateFacebookPosts, 
  toggleFacebookPostPublish, 
  reorderFacebookPosts,
  type CommunityPostsStats 
} from "@/lib/actions/facebook-posts"
import type { FacebookPost } from "@/lib/facebook-posts/types"
import { showToast } from "@/components/ui/toast"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface CommunityPostsListProps {
  initialResult: { posts: FacebookPost[]; count: number; error: string | null }
  initialPage: number
  initialSearch?: string
  initialStatus?: string
  systemStats?: CommunityPostsStats
}

export function CommunityPostsList({ 
  initialResult, 
  initialPage, 
  initialSearch = "", 
  initialStatus = "all",
  systemStats
}: CommunityPostsListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Local posts state for instant optimistic updates
  const [posts, setPosts] = useState<FacebookPost[]>(initialResult.posts || [])
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [hasUserToggledView, setHasUserToggledView] = useState(false)
  
  // Default to card grid on mobile (< 768px) and table on desktop (>= 768px)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    
    if (!hasUserToggledView) {
      setViewMode(mediaQuery.matches ? "grid" : "table")
    }

    const handler = (e: MediaQueryListEvent) => {
      if (!hasUserToggledView) {
        setViewMode(e.matches ? "grid" : "table")
      }
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [hasUserToggledView])
  
  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modals & Drawers
  const [showReorder, setShowReorder] = useState(false)
  const [previewingPost, setPreviewingPost] = useState<FacebookPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<FacebookPost | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [isBulkOperating, setIsBulkOperating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const page = initialPage
  const totalCount = initialResult.count ?? 0
  const totalPages = Math.ceil(totalCount / 50) || 1

  // Sync local posts whenever initialResult updates from server
  useEffect(() => {
    setPosts(initialResult.posts || [])
    setSelectedIds([])
  }, [initialResult])

  // 300ms Debounce on Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== debouncedSearch) {
        setDebouncedSearch(searchInput)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, debouncedSearch])

  // Push URL update when filters change
  const navigateWithFilters = useCallback((q: string, s: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (s && s !== "all") params.set("status", s)
    
    const query = params.toString()
    startTransition(() => {
      router.push(`/admin/community-posts${query ? `?${query}` : ""}`)
    })
  }, [router])

  // Trigger navigation on debouncedSearch or statusFilter changes
  useEffect(() => {
    if (debouncedSearch !== initialSearch || statusFilter !== initialStatus) {
      navigateWithFilters(debouncedSearch, statusFilter)
    }
  }, [debouncedSearch, statusFilter, initialSearch, initialStatus, navigateWithFilters])

  // Aggregate KPI stats
  const stats = useMemo(() => {
    if (systemStats) {
      const ctr = systemStats.totalViews > 0 
        ? ((systemStats.totalClicks / systemStats.totalViews) * 100).toFixed(1) 
        : "0.0"
      return {
        total: systemStats.total,
        published: systemStats.published,
        drafts: systemStats.drafts,
        totalViews: systemStats.totalViews,
        totalClicks: systemStats.totalClicks,
        ctr,
      }
    }

    // Fallback to local slice
    const total = totalCount
    const published = posts.filter(p => p.is_published).length
    const drafts = posts.filter(p => !p.is_published).length
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalClicks = posts.reduce((sum, p) => sum + (p.clicks || 0), 0)
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0"

    return { total, published, drafts, totalViews, totalClicks, ctr }
  }, [systemStats, totalCount, posts])

  // Selection helpers
  const allSelected = posts.length > 0 && selectedIds.length === posts.length
  const isSelected = (id: string) => selectedIds.includes(id)

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(posts.map(p => p.id))
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 1-Click Status Toggle
  async function handleToggleStatus(post: FacebookPost) {
    const newStatus = !post.is_published
    setTogglingId(post.id)

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: newStatus } : p))

    const res = await toggleFacebookPostPublish(post.id, newStatus)
    setTogglingId(null)

    if (!res.ok) {
      // Revert on error
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !newStatus } : p))
      showToast.error({
        title: "Status change failed",
        description: res.error,
      })
    } else {
      showToast.success({
        title: newStatus ? "Post published live" : "Post moved to drafts",
        description: newStatus 
          ? "This post is now visible on the homepage community section." 
          : "This post has been hidden from public visitors.",
      })
      router.refresh()
    }
  }

  // Quick inline move up / down
  async function handleMove(postId: string, direction: "up" | "down") {
    if (reorderingId) return
    const currentIndex = posts.findIndex((p) => p.id === postId)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= posts.length) return

    const post = posts[currentIndex]
    const previousPosts = [...posts]
    const nextPosts = [...posts]
    nextPosts[currentIndex] = previousPosts[targetIndex]
    nextPosts[targetIndex] = previousPosts[currentIndex]

    // Update display_order for optimistic state
    const reordered = nextPosts.map((p, idx) => ({ ...p, display_order: idx * 10 }))
    setPosts(reordered)
    setReorderingId(postId)

    try {
      const res = await reorderFacebookPosts(reordered.map((p) => p.id))
      if (!res.ok) {
        setPosts(previousPosts)
        showToast.error({ title: "Reorder failed", description: res.error })
      } else {
        showToast.success({
          title: "Order updated",
          description: `"${post.title}" moved ${direction === "up" ? "up" : "down"} to position #${targetIndex + 1}.`,
        })
        router.refresh()
      }
    } catch {
      setPosts(previousPosts)
      showToast.error({ title: "Reorder failed", description: "Could not update sequence. Please try again." })
    } finally {
      setReorderingId(null)
    }
  }

  // Single-Post Delete
  async function handleDeleteSingle() {
    if (!postToDelete) return
    setIsDeleting(true)
    const res = await deleteFacebookPost(postToDelete.id)
    setIsDeleting(false)

    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id))
      setSelectedIds(prev => prev.filter(id => id !== postToDelete.id))
      setPostToDelete(null)
      showToast.success({
        title: "Post deleted",
        description: "The post was successfully removed.",
      })
      router.refresh()
    } else {
      showToast.error({
        title: "Delete failed",
        description: res.error,
      })
    }
  }

  // Bulk Operations
  async function handleBulkAction(action: "publish" | "unpublish" | "delete") {
    if (selectedIds.length === 0) return
    setIsBulkOperating(true)

    const res = await bulkUpdateFacebookPosts(selectedIds, action)
    setIsBulkOperating(false)

    if (res.ok) {
      showToast.success({
        title: "Bulk update successful",
        description: `Successfully applied '${action}' to ${selectedIds.length} posts.`,
      })
      setSelectedIds([])
      setShowBulkDeleteDialog(false)
      router.refresh()
    } else {
      showToast.error({
        title: "Bulk operation failed",
        description: res.error,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Community Posts</h1>
            <Badge variant="outline" className="font-semibold">
              {stats.published} Live / {stats.drafts} Drafts
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Curate Facebook posts, reels, and stories displayed on the homepage community feed.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {posts.length > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setShowReorder(true)}
              className="h-10 text-sm font-medium"
            >
              <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
              Reorder Posts
            </Button>
          )}
          <Button asChild className="h-10 text-sm font-medium">
            <Link href="/admin/community-posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards - Responsive 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* Card 1: Total Posts */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Total Posts
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.drafts} drafts)
                  </span>
                </div>
              </div>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Live on Homepage */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Live On Home
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
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Impressions */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Impressions
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">views</span>
                </div>
              </div>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Direct Clicks */}
        <Card className="border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Direct Clicks
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ({stats.ctr}% CTR)
                  </span>
                </div>
              </div>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Toolbar: Search, Filter, View Switcher */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[125px] sm:w-[145px] h-10 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="published">Live Only</SelectItem>
              <SelectItem value="draft">Drafts Only</SelectItem>
            </SelectContent>
          </Select>

          {isPending && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end gap-1 border rounded-lg p-1 bg-muted/30 self-end sm:self-auto">
          <Button
            size="sm"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            className="h-8 px-2.5 text-xs font-medium"
            onClick={() => {
              setHasUserToggledView(true)
              setViewMode("table")
            }}
            aria-label="Table View"
          >
            <TableIcon className="h-3.5 w-3.5 mr-1.5" />
            Table
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            className="h-8 px-2.5 text-xs font-medium"
            onClick={() => {
              setHasUserToggledView(true)
              setViewMode("grid")
            }}
            aria-label="Card Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
            Cards
          </Button>
        </div>
      </div>

      {/* Error Notice */}
      {initialResult.error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium" role="alert">{initialResult.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content: Table or Grid */}
      {!initialResult.error && (
        <>
          {posts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                  <Share2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {searchInput || statusFilter !== "all" ? "No posts match your filters" : "No community posts yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchInput || statusFilter !== "all"
                      ? "Try adjusting your search keyword or clearing the status filter."
                      : "Add a Facebook post link or embed to feature community achievements on the homepage."}
                  </p>
                </div>
                {searchInput || statusFilter !== "all" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSearchInput("")
                      setStatusFilter("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/admin/community-posts/new">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add First Post
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile if card mode preferred, but responsive) */}
              {viewMode === "table" ? (
                <Card className="border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-[44px] text-center">
                              <Checkbox 
                                checked={allSelected} 
                                onCheckedChange={toggleSelectAll}
                                aria-label="Select all posts on this page"
                              />
                            </TableHead>
                            <TableHead className="w-[95px]">Order</TableHead>
                            <TableHead className="min-w-[260px] max-w-[340px]">Post</TableHead>
                            <TableHead className="w-[90px]">Type</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Engagement</TableHead>
                            <TableHead className="w-[110px]">Created</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posts.map((post, index) => (
                            <TableRow 
                              key={post.id} 
                              className={cn(
                                "group transition-colors",
                                isSelected(post.id) ? "bg-muted/40" : "hover:bg-muted/20"
                              )}
                            >
                              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox 
                                  checked={isSelected(post.id)}
                                  onCheckedChange={() => toggleSelectOne(post.id)}
                                  aria-label={`Select ${post.title}`}
                                />
                              </TableCell>
                              <TableCell className="w-[95px]" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1.5">
                                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold tabular-nums">
                                    #{index + 1}
                                  </span>
                                  {/* Quick Up/Down Triangle Buttons */}
                                  <div className="flex flex-col border border-border/80 rounded-md p-0.5 bg-muted/20">
                                    <button
                                      type="button"
                                      disabled={index === 0 || reorderingId !== null}
                                      onClick={() => handleMove(post.id, "up")}
                                      className={cn(
                                        "p-1 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors",
                                        (index === 0 || reorderingId !== null) && "opacity-20 pointer-events-none cursor-not-allowed"
                                      )}
                                      title="Move up (appear earlier)"
                                      aria-label={`Move ${post.title} up`}
                                    >
                                      {reorderingId === post.id ? (
                                        <Loader2 className="size-2.5 animate-spin" />
                                      ) : (
                                        <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
                                          <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={index === posts.length - 1 || reorderingId !== null}
                                      onClick={() => handleMove(post.id, "down")}
                                      className={cn(
                                        "p-1 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors",
                                        (index === posts.length - 1 || reorderingId !== null) && "opacity-20 pointer-events-none cursor-not-allowed"
                                      )}
                                      title="Move down (appear later)"
                                      aria-label={`Move ${post.title} down`}
                                    >
                                      {reorderingId === post.id ? (
                                        <Loader2 className="size-2.5 animate-spin" />
                                      ) : (
                                        <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5" aria-hidden="true">
                                          <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[340px]">
                                <div className="flex items-center gap-2.5">
                                  {post.image_url ? (
                                    <div className="h-9 w-12 shrink-0 rounded-md overflow-hidden border bg-muted">
                                      <img 
                                        src={post.image_url} 
                                        alt="" 
                                        className="h-full w-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                      <Share2 className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <Link 
                                      href={`/admin/community-posts/${post.id}`}
                                      className="font-medium text-sm truncate block hover:text-primary hover:underline"
                                      title={post.excerpt ? `${post.title} — ${post.excerpt}` : post.title}
                                    >
                                      {post.title}
                                    </Link>
                                    {post.tags && post.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {post.tags.slice(0, 3).map((tag) => (
                                          <span 
                                            key={tag} 
                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        {post.tags.length > 3 && (
                                          <span className="text-[10px] text-muted-foreground">
                                            +{post.tags.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs capitalize font-medium",
                                    post.post_type === "photo" 
                                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" 
                                      : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                  )}
                                >
                                  {post.post_type || "full"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={post.is_published}
                                    disabled={togglingId === post.id}
                                    onCheckedChange={() => handleToggleStatus(post)}
                                    aria-label={`Toggle live publishing for ${post.title}`}
                                  />
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs font-medium",
                                      post.is_published 
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                                        : "bg-muted text-muted-foreground border-border"
                                    )}
                                  >
                                    {post.is_published ? "Live" : "Draft"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5 text-xs">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Eye className="h-3 w-3 text-amber-500" />
                                    <span>{(post.views || 0).toLocaleString()} views</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MousePointerClick className="h-3 w-3 text-purple-500" />
                                    <span>{(post.clicks || 0).toLocaleString()} clicks</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setPreviewingPost(post)}
                                    title="Quick Preview"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Preview</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    asChild
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    title="View on Facebook"
                                  >
                                    <a 
                                      href={post.post_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span className="sr-only">Open on Facebook</span>
                                    </a>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    asChild
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    title="Edit Post"
                                  >
                                    <Link href={`/admin/community-posts/${post.id}`}>
                                      <Edit2 className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Link>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setPostToDelete(post)}
                                    title="Delete Post"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Responsive Cards Mode (Great for mobile & touch) */
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post, index) => (
                    <Card 
                      key={post.id} 
                      className={cn(
                        "relative flex flex-col justify-between transition-all duration-200 border",
                        isSelected(post.id) ? "ring-2 ring-primary border-primary/50 bg-muted/20" : "hover:border-border/80"
                      )}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Header: Checkbox, Order with Up/Down buttons, Type */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Checkbox 
                              checked={isSelected(post.id)}
                              onCheckedChange={() => toggleSelectOne(post.id)}
                              aria-label={`Select ${post.title}`}
                            />
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-mono text-xs font-bold tabular-nums">
                              #{index + 1}
                            </span>
                            {/* Quick Up/Down Triangle Buttons on mobile card */}
                            <div className="flex items-center border border-border/80 rounded-md p-0.5 bg-muted/20">
                              <button
                                type="button"
                                disabled={index === 0 || reorderingId !== null}
                                onClick={() => handleMove(post.id, "up")}
                                className={cn(
                                  "p-1 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors",
                                  (index === 0 || reorderingId !== null) && "opacity-20 pointer-events-none cursor-not-allowed"
                                )}
                                title="Move up (appear earlier)"
                                aria-label={`Move ${post.title} up`}
                              >
                                {reorderingId === post.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3" aria-hidden="true">
                                    <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={index === posts.length - 1 || reorderingId !== null}
                                onClick={() => handleMove(post.id, "down")}
                                className={cn(
                                  "p-1 rounded text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors",
                                  (index === posts.length - 1 || reorderingId !== null) && "opacity-20 pointer-events-none cursor-not-allowed"
                                )}
                                title="Move down (appear later)"
                                aria-label={`Move ${post.title} down`}
                              >
                                {reorderingId === post.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3" aria-hidden="true">
                                    <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs capitalize font-medium",
                              post.post_type === "photo" 
                                ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" 
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            )}
                          >
                            {post.post_type || "full"}
                          </Badge>
                        </div>

                        {/* Thumbnail / Cover if available */}
                        {post.image_url && (
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                            <img 
                              src={post.image_url} 
                              alt={post.image_alt || post.title} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                        )}

                        {/* Title and Excerpt */}
                        <div className="space-y-1">
                          <Link 
                            href={`/admin/community-posts/${post.id}`}
                            className="font-semibold text-base line-clamp-2 hover:text-primary hover:underline"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span 
                                key={tag} 
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metrics Bar */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5 text-amber-500" />
                              {(post.views || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />
                              {(post.clicks || 0).toLocaleString()}
                            </span>
                          </div>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>

                        {/* Status Switcher & Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={post.is_published}
                              disabled={togglingId === post.id}
                              onCheckedChange={() => handleToggleStatus(post)}
                              aria-label={`Toggle live status for ${post.title}`}
                            />
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs font-medium",
                                post.is_published 
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {post.is_published ? "Live" : "Draft"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-muted-foreground"
                              onClick={() => setPreviewingPost(post)}
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              asChild
                              className="h-9 w-9 text-muted-foreground"
                              title="External Link"
                            >
                              <a 
                                href={post.post_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              asChild
                              className="h-9 w-9 text-muted-foreground"
                              title="Edit"
                            >
                              <Link href={`/admin/community-posts/${post.id}`}>
                                <Edit2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-destructive hover:bg-destructive/10"
                              onClick={() => setPostToDelete(post)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Showing Page {page} of {totalPages} ({totalCount} total entries)
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link href={`/admin/community-posts?page=${page - 1}${debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ""}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link href={`/admin/community-posts?page=${page + 1}${debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ""}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <Badge variant="secondary" className="font-semibold text-xs">
            {selectedIds.length} Selected
          </Badge>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium"
            disabled={isBulkOperating}
            onClick={() => handleBulkAction("publish")}
          >
            <Eye className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
            Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium"
            disabled={isBulkOperating}
            onClick={() => handleBulkAction("unpublish")}
          >
            <EyeOff className="size-3.5 mr-1 text-muted-foreground" />
            Draft
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs font-medium"
            disabled={isBulkOperating}
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full ml-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedIds([])}
            title="Deselect All"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Quick Preview Modal */}
      <Dialog open={!!previewingPost} onOpenChange={(open) => !open && setPreviewingPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="size-4 text-primary" />
              Homepage Community Card Preview
            </DialogTitle>
            <DialogDescription>
              This is how visitors see this post on the homepage and community archive.
            </DialogDescription>
          </DialogHeader>
          {previewingPost && (
            <div className="py-2 space-y-4">
              <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Share2 className="size-3.5" />
                    </div>
                    <span className="font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Facebook Post
                    </span>
                  </div>
                  <time>{new Date(previewingPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>

                <h3 className="text-lg font-bold leading-tight line-clamp-2">
                  {previewingPost.title}
                </h3>

                {previewingPost.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {previewingPost.excerpt}
                  </p>
                )}

                <div className="pt-2">
                  {previewingPost.image_url ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted">
                      <img 
                        src={previewingPost.image_url} 
                        alt={previewingPost.image_alt || previewingPost.title} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  ) : (
                    <FacebookPostPreview
                      url={previewingPost.post_url}
                      title={previewingPost.title}
                      automatic
                      mode="public"
                      postType={previewingPost.post_type}
                    />
                  )}
                </div>

                {previewingPost.tags && previewingPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {previewingPost.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Impressions: {previewingPost.views || 0} · Clicks: {previewingPost.clicks || 0}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/community-posts/${previewingPost.id}`}>
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Open Full Editor
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single-Post Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete Community Post?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Are you sure you want to delete <strong>{postToDelete?.title}</strong>?
                </p>
                <p className="text-xs text-destructive">
                  This will permanently remove the post and reset its view and click statistics. The original Facebook post will remain untouched on Facebook.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete {selectedIds.length} Selected Posts?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  You are about to permanently delete <strong>{selectedIds.length} community posts</strong>.
                </p>
                <p className="text-xs text-destructive">
                  This action cannot be undone. All impressions and click metrics for these posts will be permanently cleared.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkOperating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction("delete")}
              disabled={isBulkOperating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkOperating ? "Deleting..." : "Delete All Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drag-and-Drop Reorder Modal */}
      {showReorder && (
        <PostsReorder
          posts={posts}
          onClose={() => {
            setShowReorder(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
