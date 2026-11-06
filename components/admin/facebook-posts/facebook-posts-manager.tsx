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
import { FacebookPostPreview } from "@/components/facebook-posts/facebook-post-preview"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { normalizeFacebookPostUrl, type FacebookPost } from "@/lib/facebook-posts/types"
import { deleteFacebookPost, saveFacebookPost } from "@/lib/actions/facebook-posts"
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  MousePointerClick, 
  Trash2, 
  ExternalLink, 
  Save, 
  ArrowLeft, 
  EyeOff, 
  Archive, 
  Image as ImageIcon,
  Share2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import styles from "@/components/facebook-posts/community-section.module.css"
import { showToast } from "@/components/ui/toast"

const emptyPost = { 
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
  const router = useRouter()
  const isNew = !post

  const [draft, setDraft] = useState(post ? { 
    ...post, 
    image_url: post.image_url ?? "", 
    image_alt: post.image_alt ?? "",
    excerpt: post.excerpt ?? "",
    tags: post.tags ?? [],
    published_at: post.published_at ?? null,
    post_type: post.post_type ?? 'full',
  } : emptyPost)
  
  const [pending, startTransition] = useTransition()
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showUrlHelp, setShowUrlHelp] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const previewUrl = normalizeFacebookPostUrl(draft.post_url)
  const isUrlValid = Boolean(previewUrl)

  // Save changes
  function save(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault()

    if (!draft.title.trim()) {
      showToast.error({ title: "Title required", description: "Please enter a descriptive card title." })
      return
    }

    if (!isUrlValid) {
      showToast.error({ 
        title: "Invalid URL", 
        description: "Please enter a valid public Facebook post, reel, or share link." 
      })
      return
    }

    if (draft.image_url && !draft.image_alt?.trim()) {
      showToast.error({ 
        title: "Image description required", 
        description: "Please provide alt text for screen readers." 
      })
      return
    }

    startTransition(async () => {
      try {
        const result = await saveFacebookPost({ 
          ...draft, 
          image_url: draft.image_url.trim() || null, 
          image_alt: draft.image_alt.trim() || null,
          excerpt: draft.excerpt.trim() || null,
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
          title: "Post saved successfully",
          description: draft.is_published 
            ? "Live on homepage community section." 
            : "Saved as draft. Toggle publishing when ready to display."
        })

        if (!draft.id && result.id) {
          router.push(`/admin/community-posts/${result.id}`)
        }
        router.refresh()
      } catch { 
        showToast.error({
          title: "Save failed",
          description: "An unexpected error occurred. Please try again."
        })
      }
    })
  }

  // Declarative status toggle
  function togglePublish() {
    const nextPublished = !draft.is_published
    setDraft(prev => ({ ...prev, is_published: nextPublished }))

    if (draft.id || post?.id) {
      startTransition(async () => {
        const result = await saveFacebookPost({
          ...draft,
          is_published: nextPublished,
          image_url: draft.image_url.trim() || null,
          image_alt: draft.image_alt.trim() || null,
          excerpt: draft.excerpt.trim() || null,
          tags: draft.tags,
          published_at: draft.published_at,
        })

        if (result.ok) {
          showToast.success({
            title: nextPublished ? "Post published live" : "Post moved to drafts",
            description: nextPublished ? "Now live on the homepage." : "Hidden from public visitors."
          })
          router.refresh()
        } else {
          // Revert on error
          setDraft(prev => ({ ...prev, is_published: !nextPublished }))
          showToast.error({ title: "Status update failed", description: result.error })
        }
      })
    }
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !draft.tags.includes(tag) && draft.tags.length < 10) {
      setDraft(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  function removeTag(tagToRemove: string) {
    setDraft(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }))
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
            description: "The post was permanently removed."
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
          description: "Could not remove post. Please try again."
        })
      }
    })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground">
                <Link href="/admin/community-posts">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  All Posts
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {isNew ? "Add Community Post" : draft.title || "Edit Community Post"}
              </h1>
              {!isNew && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium",
                    draft.is_published 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {draft.is_published ? "Live" : "Draft"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isNew 
                ? "Feature a Facebook moment, reel, or photo on the homepage" 
                : "Manage post details, custom cover image, and publishing status"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile Preview Trigger */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              className="lg:hidden h-9 text-xs"
            >
              <Eye className="mr-1.5 h-4 w-4 text-muted-foreground" />
              Preview
            </Button>

            {!isNew && (
              <>
                <Button
                  type="button"
                  variant={draft.is_published ? "outline" : "default"}
                  size="sm"
                  onClick={togglePublish}
                  disabled={pending}
                  className={cn(
                    "h-9 text-xs font-medium",
                    !draft.is_published && "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  {draft.is_published ? (
                    <><EyeOff className="mr-1.5 h-4 w-4" />Unpublish</>
                  ) : (
                    <><Eye className="mr-1.5 h-4 w-4" />Publish Now</>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-9 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}

            <Button
              type="button"
              size="sm"
              onClick={() => save()}
              disabled={pending}
              className="h-9 text-xs font-medium"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Existing Post Stats Overview */}
        {post && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border bg-card/60">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    className={post.is_published 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-muted text-muted-foreground"}
                  >
                    {post.is_published ? "Live on Homepage" : "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Impressions</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold">{(post.views || 0).toLocaleString()}</p>
                  <span className="text-xs text-muted-foreground">views</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Direct Clicks</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(post.clicks || 0).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    ({post.views > 0 ? ((post.clicks / post.views) * 100).toFixed(1) : 0}% CTR)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Display Order</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold font-mono">#{post.display_order}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2-Column Split View: Form on Left, Live Sticky Card Preview on Right */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Form (7 cols) */}
          <form id="post-form" onSubmit={save} className="space-y-6 lg:col-span-7">
            {/* Facebook Link & Type Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="size-4 text-primary" />
                  Facebook Post Link
                </CardTitle>
                <CardDescription className="text-xs">
                  Paste a link to any public Facebook post, reel, photo, or embed code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="post-url" className="text-xs font-semibold">
                    Post URL or Embed Code *
                  </Label>
                  <Textarea 
                    id="post-url" 
                    rows={3} 
                    required 
                    disabled={pending}
                    maxLength={8192} 
                    value={draft.post_url} 
                    onChange={e => setDraft(prev => ({ ...prev, post_url: e.target.value }))}
                    placeholder="https://www.facebook.com/deessaFoundation/posts/..."
                    className="font-mono text-xs"
                  />

                  {/* Validation Feedback */}
                  {draft.post_url.trim() && (
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      {isUrlValid ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="size-3.5 mr-1" />
                          Valid Facebook link detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-destructive font-medium">
                          <AlertTriangle className="size-3.5 mr-1" />
                          Please paste a valid Facebook post, reel, or photo URL
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="post-type" className="text-xs font-semibold">
                    Card Display Format *
                  </Label>
                  <select
                    id="post-type"
                    value={draft.post_type}
                    onChange={e => setDraft(prev => ({ ...prev, post_type: e.target.value as 'photo' | 'full' }))}
                    disabled={pending}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="full">Full Post (Show text caption & comments)</option>
                    <option value="photo">Photo / Video Only (Clean visual display)</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    "Photo Only" displays a clean visual frame. "Full Post" includes Facebook author header and caption text.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUrlHelp(!showUrlHelp)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  {showUrlHelp ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  Supported Facebook URL formats
                </button>

                {showUrlHelp && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">All standard Facebook formats supported:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Page posts: <code className="text-foreground">facebook.com/yourpage/posts/123...</code></li>
                      <li>Reels & Videos: <code className="text-foreground">facebook.com/reel/123...</code> or <code className="text-foreground">facebook.com/watch?v=...</code></li>
                      <li>Share links: <code className="text-foreground">facebook.com/share/p/ABC...</code> or <code className="text-foreground">facebook.com/share/r/ABC...</code></li>
                      <li>Photos: <code className="text-foreground">facebook.com/photo.php?fbid=...</code></li>
                      <li>Standard iframe embed snippets</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post Details & Cover Photo Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Post Content & Presentation
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize the title, excerpt snippet, and optional custom cover photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-title" className="text-xs font-semibold">
                      Card Title *
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {draft.title.length}/120
                    </span>
                  </div>
                  <Input 
                    id="post-title" 
                    required 
                    disabled={pending}
                    maxLength={120} 
                    value={draft.title} 
                    onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Annual Autism Awareness Walk 2026"
                    className="text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-excerpt" className="text-xs font-semibold">
                      Excerpt Snippet <span className="font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {draft.excerpt.length}/500
                    </span>
                  </div>
                  <Textarea 
                    id="post-excerpt" 
                    rows={2} 
                    disabled={pending}
                    maxLength={500} 
                    value={draft.excerpt} 
                    onChange={e => setDraft(prev => ({ ...prev, excerpt: e.target.value }))} 
                    placeholder="Short summary highlighting the moment (appears beneath the title)..."
                    className="text-xs"
                  />
                </div>

                {/* Cover Photo with Integrated MediaPicker */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      Custom Cover Image <span className="font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMediaPicker(true)}
                      className="h-7 text-xs px-2.5"
                    >
                      <ImageIcon className="mr-1.5 size-3.5" />
                      Browse Media Library
                    </Button>
                  </div>

                  {draft.image_url ? (
                    <div className="relative rounded-xl border p-2 bg-muted/20 flex items-center gap-3">
                      <div className="h-16 w-24 shrink-0 rounded-lg overflow-hidden border bg-muted">
                        <img 
                          src={draft.image_url} 
                          alt={draft.image_alt || "Cover preview"} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-medium truncate text-foreground">
                          {draft.image_url.split("/").pop()}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {draft.image_url}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-primary"
                            onClick={() => setShowMediaPicker(true)}
                          >
                            Change Photo
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-destructive hover:bg-destructive/10"
                            onClick={() => setDraft(prev => ({ ...prev, image_url: "", image_alt: "" }))}
                          >
                            Remove Photo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-center space-y-2 bg-muted/10">
                      <p className="text-xs text-muted-foreground">
                        No custom cover selected. The post will display the live Facebook iframe embed.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowMediaPicker(true)}
                        className="h-8 text-xs"
                      >
                        Choose From Media Library
                      </Button>
                    </div>
                  )}

                  {draft.image_url && (
                    <div className="space-y-1 pt-1">
                      <Label htmlFor="post-image-alt" className="text-xs font-semibold">
                        Image Alt Text * <span className="font-normal text-muted-foreground">(for screen readers)</span>
                      </Label>
                      <Input 
                        id="post-image-alt" 
                        required={Boolean(draft.image_url)}
                        disabled={pending}
                        maxLength={300} 
                        value={draft.image_alt} 
                        onChange={e => setDraft(prev => ({ ...prev, image_alt: e.target.value }))} 
                        placeholder="Describe the image content for accessibility"
                        className="text-xs h-8"
                      />
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="space-y-1.5 pt-2 border-t">
                  <Label htmlFor="post-tags" className="text-xs font-semibold">
                    Categorization Tags <span className="font-normal text-muted-foreground">(Max 10)</span>
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
                      placeholder="Add tag and press Enter (e.g., Autism, Workshop, 2026)"
                      className="text-xs h-8"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addTag} 
                      disabled={!tagInput.trim() || draft.tags.length >= 10 || pending}
                      className="h-8 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                  {draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {draft.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs pl-2 pr-1 py-0.5">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={pending}
                            className="ml-1 rounded-sm hover:bg-muted-foreground/20 p-0.5 text-muted-foreground hover:text-foreground"
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

            {/* Publishing Settings Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  Publishing & Visibility
                </CardTitle>
                <CardDescription className="text-xs">
                  Control display order and live visibility on the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border p-3.5 bg-card/60">
                  <div className="space-y-0.5">
                    <Label htmlFor="publish-toggle" className="text-sm font-semibold">
                      Publish on Homepage
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Make this post immediately visible to website visitors
                    </p>
                  </div>
                  <Switch
                    id="publish-toggle"
                    checked={draft.is_published}
                    onCheckedChange={value => setDraft(prev => ({ ...prev, is_published: value }))}
                    disabled={pending}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="post-order" className="text-xs font-semibold">
                      Display Priority Order
                    </Label>
                    <Input 
                      id="post-order" 
                      type="number" 
                      min={0} 
                      max={10000} 
                      step={1} 
                      required 
                      disabled={pending}
                      value={draft.display_order} 
                      onChange={e => setDraft(prev => ({ ...prev, display_order: e.target.valueAsNumber || 0 }))} 
                      className="text-xs h-9 font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Lower numbers appear first. Use Reorder Posts on the list page for visual drag & drop.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="post-schedule" className="text-xs font-semibold">
                      Scheduled Release <span className="font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input 
                      id="post-schedule" 
                      type="datetime-local" 
                      disabled={pending}
                      value={draft.published_at ? new Date(draft.published_at).toISOString().slice(0, 16) : ""} 
                      onChange={e => setDraft(prev => ({ ...prev, published_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} 
                      className="text-xs h-9"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave blank to publish immediately once status is Live.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/community-posts">Cancel</Link>
                  </Button>
                  <Button type="submit" size="sm" disabled={pending}>
                    {pending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save Post
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Right Column: Live Sticky Card Preview (5 cols on Desktop) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-6 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="size-3.5 text-primary" />
                Live Homepage Card Preview
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  draft.is_published 
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {draft.is_published ? "Will display live" : "Currently hidden"}
              </Badge>
            </div>

            {/* Render Public Card Component Exactly As Visitors See It */}
            <div className={cn(styles.card, "rounded-2xl border bg-card shadow-sm overflow-hidden")}>
              <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Share2 className="size-3" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Facebook Post
                  </span>
                </div>
                <time className="text-[11px] text-muted-foreground">
                  {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
              </div>

              {/* Cover Photo or Facebook Embed */}
              <div className="p-3 bg-muted/10">
                {draft.image_url ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={draft.image_url} 
                      alt={draft.image_alt || draft.title || "Post cover"} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg">
                    {previewUrl ? (
                      <FacebookPostPreview 
                        url={previewUrl} 
                        title={draft.title || "Post preview"} 
                        automatic
                        mode="public"
                        postType={draft.post_type}
                      />
                    ) : (
                      <div className="aspect-video w-full flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-4 text-center">
                        <Share2 className="size-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Paste a Facebook link to generate preview</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Excerpt */}
              <div className="p-4 space-y-2 border-t">
                <h3 className="text-base font-bold leading-snug line-clamp-2">
                  {draft.title || "Your Post Title Will Appear Here"}
                </h3>

                {draft.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {draft.excerpt}
                  </p>
                )}

                {draft.tags && draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {draft.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(url) => {
          setDraft(prev => ({
            ...prev,
            image_url: url,
            image_alt: prev.image_alt || prev.title || "Community post cover"
          }))
          setShowMediaPicker(false)
          showToast.success({
            title: "Cover image attached",
            description: "Selected photo attached from media library."
          })
        }}
        bucket="site-assets"
        title="Select Cover Image"
        description="Choose a photo from your media buckets or upload a new one."
      />

      {/* Mobile/Tablet Preview Dialog */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Homepage Card Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Live representation of how this post renders to public visitors
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden space-y-3 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Share2 className="size-3" />
                  </div>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Facebook Post</span>
                </div>
                <span>{new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h3 className="text-base font-bold">{draft.title || "Untitled Post"}</h3>
              {draft.excerpt && <p className="text-xs text-muted-foreground">{draft.excerpt}</p>}

              <div className="pt-2">
                {draft.image_url ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                    <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  previewUrl && (
                    <FacebookPostPreview 
                      url={previewUrl} 
                      title={draft.title || "Preview"} 
                      automatic 
                      mode="public" 
                      postType={draft.post_type} 
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete Community Post?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Are you sure you want to delete <strong>{post?.title}</strong>?
                </p>
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" />
                    This action is permanent:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Database entry and card mapping will be permanently removed</li>
                    <li>Recorded analytics ({post?.views || 0} views, {post?.clicks || 0} clicks) will be deleted</li>
                    <li>The original Facebook post on Facebook remains untouched</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
