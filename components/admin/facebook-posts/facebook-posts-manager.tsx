"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FacebookPostPreview } from "@/components/facebook-posts/facebook-post-preview"
import { normalizeFacebookPostUrl, type FacebookPost } from "@/lib/facebook-posts/types"
import { deleteFacebookPost, saveFacebookPost } from "@/lib/actions/facebook-posts"
import { Calendar, ChevronDown, ChevronUp, Eye, MousePointerClick, Trash2, ExternalLink, Save, ArrowLeft, EyeOff, Archive } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import styles from "@/components/facebook-posts/community-section.module.css"
import { showToast } from "@/components/ui/toast"

const empty = { 
  id: undefined as string | undefined, 
  post_url: "", 
  title: "", 
  image_url: "", 
  image_alt: "", 
  display_order: 0, 
  is_published: false,
  excerpt: "",
  tags: [] as string[],
  published_at: null as string | null,
  views: 0,
  clicks: 0,
  created_at: new Date().toISOString(),
  post_type: 'full' as 'photo' | 'full',
}

export function FacebookPostsManager({ post }: { post?: FacebookPost }) {
  const [draft, setDraft] = useState(post ? { 
    ...post, 
    image_url: post.image_url ?? "", 
    image_alt: post.image_alt ?? "",
    excerpt: post.excerpt ?? "",
    tags: post.tags ?? [],
    published_at: post.published_at ?? null,
    post_type: post.post_type ?? 'full',
  } : empty)
  
  const [pending, startTransition] = useTransition()
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUrlHelp, setShowUrlHelp] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()
  const previewUrl = normalizeFacebookPostUrl(draft.post_url)
  
  const isNew = !post

  function save(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault()
    startTransition(async () => {
      try {
        const result = await saveFacebookPost({ 
          ...draft, 
          image_url: draft.image_url || null, 
          image_alt: draft.image_alt || null,
          excerpt: draft.excerpt || null,
          tags: draft.tags,
          published_at: draft.published_at,
        })
        if (!result.ok) { 
          showToast.error({
            title: "Save failed",
            description: result.error
          })
          return 
        }
        showToast.success({
          title: "Post saved",
          description: draft.is_published 
            ? "Post published successfully. It will appear on the homepage." 
            : "Draft saved. Enable publishing to make it visible."
        })
        if (!draft.id && result.id) router.push(`/admin/community-posts/${result.id}`)
        router.refresh()
      } catch { 
        showToast.error({
          title: "Save failed",
          description: "Could not save the post. Please try again."
        })
      }
    })
  }

  function togglePublish() {
    setDraft({ ...draft, is_published: !draft.is_published })
    // Auto-save after toggling
    setTimeout(() => {
      const form = document.getElementById('post-form') as HTMLFormElement
      if (form) {
        startTransition(async () => {
          const result = await saveFacebookPost({ 
            ...draft, 
            is_published: !draft.is_published,
            image_url: draft.image_url || null, 
            image_alt: draft.image_alt || null,
            excerpt: draft.excerpt || null,
            tags: draft.tags,
            published_at: draft.published_at,
          })
          if (result.ok) {
            showToast.success({
              title: !draft.is_published ? "Post published" : "Post unpublished",
              description: !draft.is_published ? "Post is now live on the homepage" : "Post has been hidden from the homepage"
            })
            router.refresh()
          } else {
            showToast.error({
              title: "Update failed",
              description: result.error
            })
          }
        })
      }
    }, 100)
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !draft.tags.includes(tag) && draft.tags.length < 10) {
      setDraft({ ...draft, tags: [...draft.tags, tag] })
      setTagInput("")
    }
  }

  function removeTag(tagToRemove: string) {
    setDraft({ ...draft, tags: draft.tags.filter(t => t !== tagToRemove) })
  }

  function handleDelete() {
    if (!post) return
    startTransition(async () => {
      try {
        const result = await deleteFacebookPost(post.id)
        if (result.ok) {
          setShowDeleteDialog(false)
          showToast.success({
            title: "Post deleted",
            description: "The post has been permanently removed"
          })
          router.push("/admin/community-posts")
          router.refresh()
        } else {
          showToast.error({
            title: "Delete failed",
            description: result.error
          })
        }
      } catch { 
        showToast.error({
          title: "Delete failed",
          description: "Could not remove the entry. Please try again."
        })
      }
    })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/community-posts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold">
              {isNew ? "Add Community Post" : post.title}
            </h1>
            <p className="text-muted-foreground">
              {isNew 
                ? "Share a Facebook post on your homepage" 
                : "Edit post details and publishing settings"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                {previewUrl && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                )}
                
                <Button
                  variant={draft.is_published ? "outline" : "default"}
                  onClick={togglePublish}
                  disabled={pending}
                  className={!draft.is_published 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"}
                >
                  {draft.is_published ? (
                    <><EyeOff className="mr-2 h-4 w-4" />Unpublish</>
                  ) : (
                    <><Eye className="mr-2 h-4 w-4" />Publish</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft({ ...draft, is_published: false })
                    togglePublish()
                  }}
                  disabled={pending || !draft.is_published}
                  className="hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors disabled:opacity-50"
                  title={!draft.is_published ? "Post is already archived" : "Archive this post"}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards (only for existing posts) */}
        {post && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={post.is_published ? "default" : "secondary"} className={post.is_published ? "bg-green-100 text-green-800" : ""}>
                    {post.is_published ? <><Eye className="mr-1 h-3 w-3" />Published</> : "Draft"}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-semibold">
                  {post.is_published ? "Live on Homepage" : "Hidden"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Views</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-bold">{post.views}</p>
                <p className="text-xs text-muted-foreground">Total impressions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <MousePointerClick className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-bold">{post.clicks}</p>
                <p className="text-xs text-muted-foreground">Link clicks</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <p className="mt-2 text-lg font-semibold">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                <p className="text-xs text-muted-foreground">Display order: {post.display_order}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Form */}
        <form id="post-form" onSubmit={save} className="space-y-6">
          {/* Facebook URL Section */}
          <Card>
            <CardHeader>
              <CardTitle>Facebook Post Link</CardTitle>
              <CardDescription>
                Paste a public Facebook post URL or embed code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-url">Post URL or Embed Code *</Label>
                <Textarea 
                  id="post-url" 
                  rows={4} 
                  required 
                  disabled={pending}
                  maxLength={8192} 
                  value={draft.post_url} 
                  onChange={e => setDraft({ ...draft, post_url: e.target.value })}
                  placeholder="https://www.facebook.com/deessaFoundation/posts/..."
                  className="font-mono text-sm"
                />
                {previewUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    Valid Facebook post detected
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-type">Display Type *</Label>
                <select
                  id="post-type"
                  value={draft.post_type}
                  onChange={e => setDraft({ ...draft, post_type: e.target.value as 'photo' | 'full' })}
                  disabled={pending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="full">Full Post (with caption)</option>
                  <option value="photo">Photo Only (clean display)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose "Photo Only" for posts with multiple images or to hide Facebook captions. Choose "Full Post" to show the complete embed with text.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUrlHelp(!showUrlHelp)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {showUrlHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                What URLs are supported?
              </button>

              {showUrlHelp && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p className="font-medium">Supported URL formats:</p>
                    <ul className="ml-4 space-y-1 text-muted-foreground">
                      <li>• Post: facebook.com/yourpage/posts/123...</li>
                      <li>• Share: facebook.com/share/p/ABC123...</li>
                      <li>• Permalink: facebook.com/permalink.php?story_fbid=...</li>
                      <li>• Photo: facebook.com/photo.php?fbid=...</li>
                      <li>• Or paste the complete iframe embed code</li>
                    </ul>
                    <p className="text-muted-foreground">Videos and Reels are not supported.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Post Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Add a title and description for the homepage card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Card Title *</Label>
                <Input 
                  id="post-title" 
                  required 
                  disabled={pending}
                  maxLength={120} 
                  value={draft.title} 
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Give your post a catchy title"
                />
                <p className="text-xs text-muted-foreground">{draft.title.length}/120 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-excerpt">
                  Excerpt <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea 
                  id="post-excerpt" 
                  rows={3} 
                  disabled={pending}
                  maxLength={500} 
                  value={draft.excerpt} 
                  onChange={e => setDraft({ ...draft, excerpt: e.target.value })} 
                  placeholder="Add a brief description (150-300 characters recommended)"
                />
                <p className="text-xs text-muted-foreground">{draft.excerpt.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-tags">
                  Tags <span className="text-muted-foreground">(Optional, max 10)</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="post-tags" 
                    maxLength={50} 
                    disabled={pending || draft.tags.length >= 10}
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTag} 
                    disabled={!tagInput.trim() || draft.tags.length >= 10 || pending}
                  >
                    Add
                  </Button>
                </div>
                {draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draft.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={pending}
                          className="ml-1 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                Control when and how this post appears on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="publish-toggle" className="text-base font-medium">
                    Publish on homepage
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Make this post visible to visitors
                  </p>
                </div>
                <Switch
                  id="publish-toggle"
                  checked={draft.is_published}
                  onCheckedChange={value => setDraft({ ...draft, is_published: value })}
                  disabled={pending}
                />
              </div>

              {draft.is_published && (
                <div className="space-y-2">
                  <Label htmlFor="post-schedule">
                    Schedule for later <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input 
                    id="post-schedule" 
                    type="datetime-local" 
                    disabled={pending}
                    value={draft.published_at ? new Date(draft.published_at).toISOString().slice(0, 16) : ""} 
                    onChange={e => setDraft({ ...draft, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to publish immediately. Scheduled posts appear at the specified time.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="post-order">Display Order</Label>
                <Input 
                  id="post-order" 
                  type="number" 
                  min={0} 
                  max={10000} 
                  step={1} 
                  required 
                  disabled={pending}
                  value={draft.display_order} 
                  onChange={e => setDraft({ ...draft, display_order: e.target.valueAsNumber })} 
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first. Use the Reorder button on the list page for visual arrangement.
                </p>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending}>
                  <Save className="mr-2 h-4 w-4" />
                  {pending ? "Saving…" : "Save Changes"}
                </Button>
                <Button asChild variant="outline" disabled={pending}>
                  <Link href="/admin/community-posts">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Homepage Preview</DialogTitle>
            <DialogDescription>
              This is how your post will appear on the homepage
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewUrl && (
              <div className={cn(styles.card, "rounded-2xl shadow-sm overflow-hidden border")}>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-blue-50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-blue-600">
                          <path d="M15 21v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H8v4h3v8" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Facebook Post</span>
                    </div>
                    <time className="text-xs text-gray-500">
                      {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-gray-900 line-clamp-2">
                    {draft.title || "Your post title"}
                  </h3>
                  {draft.excerpt && (
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {draft.excerpt}
                    </p>
                  )}
                </div>
                <div className="px-5 pb-5">
                  {/* Show actual Facebook preview */}
                  <FacebookPostPreview 
                    url={previewUrl} 
                    title={draft.title || "Post preview"} 
                    automatic
                    mode="public"
                    postType={draft.post_type}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete/Archive Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Post?
            </DialogTitle>
            <DialogDescription>
              This action will permanently remove this post from your website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Warning Box */}
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                This cannot be undone
              </h4>
              <ul className="text-sm text-red-800 space-y-1.5 ml-6">
                <li>• Post will be permanently deleted from database</li>
                <li>• All analytics data ({post?.views || 0} views, {post?.clicks || 0} clicks) will be lost</li>
                <li>• The original Facebook post will remain unchanged</li>
              </ul>
            </div>

            {/* Better Alternative */}
            {post?.is_published && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Better Option
                </h4>
                <p className="text-sm text-blue-800">
                  Archive this post instead to hide it from the homepage while preserving all data and analytics for future use.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {post?.is_published && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraft({ ...draft, is_published: false })
                    setShowDeleteDialog(false)
                    togglePublish()
                  }}
                  disabled={pending}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Instead
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {pending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
