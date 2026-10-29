"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Eye, EyeOff, Calendar, TrendingUp, MousePointerClick, ArrowUpDown, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PostsReorder } from "./posts-reorder"
import type { FacebookPost } from "@/lib/facebook-posts/types"
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
  const [result, setResult] = useState(initialResult)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [showReorder, setShowReorder] = useState(false)

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

  // Calculate stats
  const stats = useMemo(() => {
    const total = result.count
    const published = result.posts.filter(p => p.is_published).length
    const drafts = result.posts.filter(p => !p.is_published).length
    const scheduled = result.posts.filter(p => p.published_at && new Date(p.published_at) > new Date()).length
    const totalViews = result.posts.reduce((sum, p) => sum + p.views, 0)
    const totalClicks = result.posts.reduce((sum, p) => sum + p.clicks, 0)
    
    return { total, published, drafts, scheduled, totalViews, totalClicks }
  }, [result])

  function handleRowDoubleClick(postId: string) {
    router.push(`/admin/community-posts/${postId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Posts</h1>
          <p className="text-muted-foreground">
            Manage Facebook posts displayed on the homepage. Double-click a post to edit.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/community-posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {!result.error && result.posts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MousePointerClick className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalClicks}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts by title, URL, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
        {result.posts.length > 1 && (
          <Button variant="outline" onClick={() => setShowReorder(true)}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Reorder
          </Button>
        )}
      </div>

      {/* Posts Table */}
      {result.error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive" role="alert">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {result.posts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[80px]">Views</TableHead>
                    <TableHead className="w-[80px]">Clicks</TableHead>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.posts.map((post) => (
                    <TableRow 
                      key={post.id}
                      onDoubleClick={() => handleRowDoubleClick(post.id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium line-clamp-2 leading-tight">{post.title}</div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1 mt-1.5">
                              {post.tags.slice(0, 3).map(tag => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={post.is_published ? "default" : "secondary"} 
                          className={post.is_published ? "bg-green-100 text-green-800 border-green-200" : ""}
                        >
                          {post.is_published ? (
                            <><Eye className="w-3 h-3 mr-1" />Live</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" />Draft</>
                          )}
                        </Badge>
                        {post.published_at && new Date(post.published_at) > new Date() && (
                          <div className="text-[10px] text-amber-600 mt-1 font-medium">
                            Scheduled
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Eye className="h-3.5 w-3.5 text-blue-600" />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <MousePointerClick className="h-3.5 w-3.5 text-purple-600" />
                          <span>{post.clicks.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono text-muted-foreground">
                          #{post.display_order}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Link href={`/admin/community-posts/${post.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center space-y-3">
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
      {!result.error && result.posts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {result.count} total post{result.count !== 1 ? "s" : ""} · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/community-posts?page=${page - 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}>
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/community-posts?page=${page + 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
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
