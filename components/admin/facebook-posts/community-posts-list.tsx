"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowUpRight, Search, ArrowUpDown, Eye, MousePointerClick, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PostsReorder } from "./posts-reorder"
import { bulkUpdateFacebookPosts } from "@/lib/actions/facebook-posts"
import type { FacebookPost } from "@/lib/facebook-posts/types"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface CommunityPostsListProps {
  initialResult: { posts: FacebookPost[]; count: number; error: string | null }
  initialPage: number
  initialSearch?: string
  initialStatus?: string
}

export function CommunityPostsList({ 
  initialResult, 
  initialPage, 
  initialSearch = "", 
  initialStatus = "all" 
}: CommunityPostsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState(initialResult)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showReorder, setShowReorder] = useState(false)
  const [pending, startTransition] = useTransition()

  const page = initialPage
  const totalPages = Math.ceil(result.count / 50)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (status !== "all") params.set("status", status)
    if (page > 1) params.set("page", page.toString())
    
    const query = params.toString()
    router.push(`/admin/community-posts${query ? `?${query}` : ""}`)
  }, [search, status, page, router])

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? result.posts.map(p => p.id) : [])
  }

  function handleSelectOne(id: string, checked: boolean) {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(pid => pid !== id))
  }

  function handleBulkAction(action: "publish" | "unpublish" | "delete") {
    if (selectedIds.length === 0) {
      toast.error("Select at least one post")
      return
    }

    const actionText = action === "delete" ? "delete" : action === "publish" ? "publish" : "unpublish"
    const confirmMessage = `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${selectedIds.length} post${selectedIds.length > 1 ? "s" : ""}?`
    
    if (action === "delete" && !window.confirm(confirmMessage)) return

    startTransition(async () => {
      try {
        const actionResult = await bulkUpdateFacebookPosts(selectedIds, action)
        if (actionResult.ok) {
          toast.success(`${selectedIds.length} post${selectedIds.length > 1 ? "s" : ""} ${actionText}ed successfully`)
          setSelectedIds([])
          router.refresh()
        } else {
          toast.error(actionResult.error)
        }
      } catch {
        toast.error(`Could not ${actionText} posts. Please try again.`)
      }
    })
  }

  const allSelected = result.posts.length > 0 && selectedIds.length === result.posts.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < result.posts.length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community Posts</h1>
          <p className="text-muted-foreground">
            Manage community moments on the homepage. Select a post to view its details.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/community-posts/new">
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Add post
          </Link>
        </Button>
      </header>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} post{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("publish")}
                  disabled={pending}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("unpublish")}
                  disabled={pending}
                >
                  Unpublish
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  disabled={pending}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      {!result.error && result.posts.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReorder(true)}
          >
            <ArrowUpDown className="mr-2 size-4" />
            Reorder Posts
          </Button>
        </div>
      )}

      {/* Posts Table */}
      {result.error ? (
        <p role="alert" className="rounded-xl border p-6">
          {result.error}
        </p>
      ) : (
        <Card>
          <CardContent className="p-0">
            {result.posts.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all posts"
                          className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                      </TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Analytics</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(post.id)}
                            onCheckedChange={(checked) => handleSelectOne(post.id, checked === true)}
                            aria-label={`Select ${post.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/community-posts/${post.id}`}
                            className="font-medium underline underline-offset-4 hover:text-primary"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {post.excerpt}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={post.is_published ? "default" : "secondary"}>
                              {post.is_published ? "Published" : "Draft"}
                            </Badge>
                            {post.published_at && new Date(post.published_at) > new Date() && (
                              <p className="text-xs text-muted-foreground">
                                Scheduled: {new Date(post.published_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointerClick className="size-3" />
                              {post.clicks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/community-posts/${post.id}`}>
                              View
                              <ArrowUpRight aria-hidden="true" className="ml-1 size-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-3 p-8 text-center">
                <h2 className="text-lg font-semibold">
                  {search || status !== "all" ? "No posts match your filters" : "No community posts yet"}
                </h2>
                <p className="text-muted-foreground">
                  {search || status !== "all"
                    ? "Try adjusting your search or filter settings."
                    : "Add a public Facebook post link to share a moment from your community."}
                </p>
                {!search && status === "all" && (
                  <Button asChild variant="outline">
                    <Link href="/admin/community-posts/new">Add your first post</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!result.error && result.posts.length > 0 && (
        <nav aria-label="Community posts pagination" className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result.count} total post{result.count !== 1 ? "s" : ""} · Page {page} of {Math.max(1, totalPages)}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline">
                <Link href={`/admin/community-posts?page=${page - 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}>
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild variant="outline">
                <Link href={`/admin/community-posts?page=${page + 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </nav>
      )}

      {/* Reorder Modal */}
      {showReorder && (
        <PostsReorder
          posts={result.posts}
          onClose={() => {
            setShowReorder(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
