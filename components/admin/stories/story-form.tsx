"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  AlertCircle,
  PenSquare,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  Globe,
  Sparkles,
  Star,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PrintButton } from "@/components/ui/print-button"
import { notifications } from "@/lib/notifications"
import { createStory, updateStory } from "@/lib/actions/admin-stories"
import { FileUpload } from "@/components/admin/media/file-upload"
import { RichTextEditor } from "@/components/admin/rich-text-editor/rich-text-editor"
import { StoryPreviewModal } from "@/components/admin/stories/story-preview-modal"
import { useUnsavedChanges } from "@/components/admin/rich-text-editor/hooks/use-unsaved-changes"
import { getAutosaveBackup, clearAutosaveBackup } from "@/components/admin/rich-text-editor/hooks/use-autosave"
import type { Story } from "@/lib/types/admin"
import "@/app/print-styles.css"

interface StoryFormProps {
  story?: Story
}

export function StoryForm({ story }: StoryFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(story?.image || "")
  const [content, setContent] = useState(story?.content || "")
  const [lastSavedContent, setLastSavedContent] = useState(story?.content || "")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showBackupRestore, setShowBackupRestore] = useState(false)
  const [backupContent, setBackupContent] = useState<string | null>(null)

  const [title, setTitle] = useState(story?.title || "")
  const [excerpt, setExcerpt] = useState(story?.excerpt || "")
  const [isPublished, setIsPublished] = useState(story?.is_published ?? false)
  const [isFeatured, setIsFeatured] = useState(story?.is_featured ?? false)

  const currentSlug = story?.slug || (title
    ? title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "")

  const [previewData, setPreviewData] = useState({
    title: story?.title || "",
    excerpt: story?.excerpt || "",
    category: story?.category || "",
    readTime: story?.read_time || "",
  })
  const router = useRouter()

  // Check for autosave backup on mount
  useEffect(() => {
    if (story?.id) {
      const backup = getAutosaveBackup(story.id)
      if (backup && backup.content !== story.content) {
        queueMicrotask(() => {
          setBackupContent(backup.content)
          setShowBackupRestore(true)
        })
      }
    }
  }, [story?.id, story?.content])

  const handleRestoreBackup = () => {
    if (backupContent) {
      setContent(backupContent)
      setShowBackupRestore(false)
      notifications.showSuccess({
        title: "Backup restored",
        description: "Your unsaved changes have been restored.",
      })
    }
  }

  const handleDiscardBackup = () => {
    if (story?.id) {
      clearAutosaveBackup(story.id)
    }
    setShowBackupRestore(false)
    setBackupContent(null)
  }

  // Track unsaved changes (content differs from last saved)
  const hasUnsavedChanges = content !== lastSavedContent

  // Enable unsaved changes guard
  useUnsavedChanges({
    hasUnsavedChanges,
    message: "You have unsaved changes. Are you sure you want to leave?",
  })

  // Update lastSavedContent when autosave completes
  // This is handled by monitoring content changes after successful autosave
  useEffect(() => {
    // When editing an existing story, autosave will update the content
    // We need to sync lastSavedContent after autosave completes
    // For now, we'll update it on successful form submission
  }, [])

  const handlePreview = () => {
    // Get current form values
    const form = document.querySelector("form") as HTMLFormElement
    const formData = new FormData(form)

    setPreviewData({
      title: title || (formData.get("title") as string) || "",
      excerpt: excerpt || (formData.get("excerpt") as string) || "",
      category: (formData.get("category") as string) || "",
      readTime: (formData.get("readTime") as string) || "",
    })

    setIsPreviewOpen(true)
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    // Validate required fields
    const titleVal = ((formData.get("title") as string) || title || "").trim()
    const excerptVal = ((formData.get("excerpt") as string) || excerpt || "").trim()
    const category = (formData.get("category") as string)?.trim()
    const isPublishedVal = formData.get("isPublished") === "true"

    if (!titleVal) {
      setError("Title is required")
      setIsLoading(false)
      // Scroll to title field
      document.getElementById("title")?.scrollIntoView({ behavior: "smooth", block: "center" })
      document.getElementById("title")?.focus()
      return
    }

    if (!excerptVal) {
      setError("Excerpt is required")
      setIsLoading(false)
      document.getElementById("excerpt")?.scrollIntoView({ behavior: "smooth", block: "center" })
      document.getElementById("excerpt")?.focus()
      return
    }

    if (!category) {
      setError("Category is required")
      setIsLoading(false)
      document.getElementById("category")?.scrollIntoView({ behavior: "smooth", block: "center" })
      document.getElementById("category")?.focus()
      return
    }

    // Warn if publishing with empty content
    if (isPublishedVal && !content?.trim()) {
      const confirmed = window.confirm(
        "You are about to publish a story with empty content. Are you sure you want to continue?"
      )
      if (!confirmed) {
        setIsLoading(false)
        return
      }
    }

    if (story) {
      notifications.showInfo({ title: "Saving", description: "Saving your changes..." })
    }

    const result = story ? await updateStory(story.id, formData) : await createStory(formData)

    if (result?.error) {
      setError(result.error)
      notifications.showError({ title: "Save failed", description: result.error })
      setIsLoading(false)
    } else if (story) {
      notifications.showSuccess({ title: "Changes saved", description: "Story updated successfully." })
      setLastSavedContent(content) // Clear unsaved changes flag
      router.refresh()
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Print-only header */}
      <div className="print-header hidden">
        <div className="logo">deessa Foundation - Admin Preview</div>
        <div className="url">Internal Document</div>
      </div>

      {/* Print-only draft watermark */}
      {story && !story.is_published && (
        <div className="draft-watermark hidden">
          DRAFT
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="no-print">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Backup restore prompt */}
      {showBackupRestore && (
        <Alert className="no-print">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>We found unsaved changes from a previous session. Would you like to restore them?</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleDiscardBackup}>
                Discard
              </Button>
              <Button type="button" size="sm" onClick={handleRestoreBackup}>
                Restore
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ──────────────────────────────────────────
          STORY SETUP & VISIBILITY CARD
          ────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-xs">
        <CardHeader className="border-b bg-gradient-to-r from-sky-50/50 via-background to-background p-5 sm:p-6 dark:from-sky-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                <FileText className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight">Story Setup</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Headline, URL slug, summary hook, and public visibility controls.
                </p>
              </div>
            </div>

            {/* Quick Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {isPublished ? (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs py-1 px-3"
                >
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live to Public
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-dashed border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 font-semibold text-xs py-1 px-3"
                >
                  <EyeOff className="size-3" />
                  Draft (Private)
                </Badge>
              )}
              {isFeatured && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-yellow-500/30 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 font-semibold text-xs py-1 px-3"
                >
                  <Star className="size-3 fill-yellow-500 text-yellow-500" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {/* Print-only metadata */}
          <div className="story-metadata hidden mb-6">
            <h1>{title || story?.title || "Untitled Story"}</h1>
            <div>
              <strong>Status:</strong> {isPublished ? "Published" : "Draft"} | 
              <strong> Category:</strong> {previewData.category || story?.category || "Uncategorized"} | 
              <strong> Read Time:</strong> {previewData.readTime || story?.read_time || "N/A"}
            </div>
            {excerpt && (
              <div style={{ marginTop: "0.5cm", fontStyle: "italic" }}>
                {excerpt}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Left 8 columns: Content metadata (Title & Excerpt) */}
            <div className="flex flex-col gap-4 lg:col-span-8">
              {/* Title Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>Story Title</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={cn(
                      "text-[11px] font-mono",
                      title.length > 90 ? "text-amber-600 font-bold" : "text-muted-foreground"
                    )}
                  >
                    {title.length} characters
                  </span>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finding Aryan's Voice: A Journey Through Speech Therapy"
                  required
                  className="h-11 text-base font-medium shadow-2xs focus-visible:ring-sky-500/30"
                />

                {/* Live Slug Preview */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                    <Globe className="size-3.5 text-sky-600" />
                    <span>Public Slug:</span>
                  </span>
                  <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground/80 break-all select-all">
                    /stories/{currentSlug || "your-story-title"}
                  </code>
                </div>
              </div>

              {/* Excerpt Section (Positioned directly below title, expanding to fill card height) */}
              <div className="flex flex-1 flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="excerpt" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>Story Excerpt / Abstract</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={cn(
                      "text-[11px] font-mono",
                      excerpt.length > 260
                        ? "text-destructive font-bold"
                        : excerpt.length >= 100
                          ? "text-emerald-600 font-medium"
                          : "text-muted-foreground"
                    )}
                  >
                    {excerpt.length} / 260 chars
                  </span>
                </div>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="At four years old, Aryan had not spoken a single word. His parents feared the silence would last forever — until a dedicated therapist at Deessa Foundation changed everything."
                  rows={7}
                  required
                  className="flex-1 min-h-[175px] resize-y text-sm leading-relaxed shadow-2xs focus-visible:ring-sky-500/30"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed on story cards, the homepage impact rail, search engine snippets, and social sharing previews.
                </p>
              </div>
            </div>

            {/* Right 4 columns: Publishing Controls */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-4 rounded-xl border border-border/80 bg-slate-50/70 p-4 sm:p-5 dark:bg-slate-900/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <Sparkles className="size-4 text-sky-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Visibility & Publishing
                  </span>
                </div>

                {/* Published Toggle Card */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-all",
                    isPublished
                      ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xs"
                      : "border-border/70 bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="isPublished" className="text-sm font-semibold cursor-pointer">
                        Public Status
                      </Label>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {isPublished ? "Visible to visitors on public /stories" : "Saved as an internal draft"}
                      </p>
                    </div>
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                    <input type="hidden" name="isPublished" value={isPublished ? "true" : "false"} />
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Current State:</span>
                    {isPublished ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                        Live Public
                      </span>
                    ) : (
                      <span className="font-medium text-slate-500 flex items-center gap-1">
                        <EyeOff className="size-3" />
                        Draft Only
                      </span>
                    )}
                  </div>
                </div>

                {/* Featured Toggle Card */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-all",
                    isFeatured
                      ? "border-yellow-500/40 bg-yellow-500/5 shadow-2xs"
                      : "border-border/70 bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="isFeatured" className="text-sm font-semibold cursor-pointer">
                        Featured Story
                      </Label>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {isFeatured
                          ? "Highlighted on homepage and hero spotlights"
                          : "Standard catalog listing"}
                      </p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                    <input type="hidden" name="isFeatured" value={isFeatured ? "true" : "false"} />
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Placement:</span>
                    {isFeatured ? (
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                        <Star className="size-3 fill-yellow-500 text-yellow-500 inline-block" />
                        Pinned Spotlight
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Standard</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Story Checklist Helper */}
              <div className="rounded-lg bg-background/80 p-3 text-xs border border-border/60 text-muted-foreground space-y-1.5">
                <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                  Story Readiness
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn("size-3.5", title.trim() ? "text-emerald-600" : "text-slate-300 dark:text-slate-600")}
                  />
                  <span className={title.trim() ? "text-foreground font-medium" : ""}>Headline set</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn(
                      "size-3.5",
                      excerpt.trim() ? "text-emerald-600" : "text-slate-300 dark:text-slate-600"
                    )}
                  />
                  <span className={excerpt.trim() ? "text-foreground font-medium" : ""}>Summary hook ready</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <PenSquare className="h-5 w-5" />
            Writing Editor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Full-width writing surface. Use the toolbar for formatting, media, layout blocks, and font color.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <RichTextEditor
            content={content}
            onChange={setContent}
            onAutosaveComplete={() => setLastSavedContent(content)}
            placeholder="Write your story content here..."
            className="w-full"
            storyId={story?.id}
            enableAutosave={!!story?.id}
          />
          {/* Hidden input to maintain form submission compatibility */}
          <input type="hidden" name="content" value={content} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              bucket="story-images"
              currentUrl={imageUrl}
              onUpload={setImageUrl}
              label="Story Image"
              maxSizeMB={5}
              allowUrl={true}
            />
            <input type="hidden" name="image" value={imageUrl} />
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                defaultValue={story?.category || ""}
                placeholder="Education, Health, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time</Label>
              <Input id="readTime" name="readTime" defaultValue={story?.read_time || ""} placeholder="5 min read" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap gap-3 rounded-xl border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print">
        <Button type="button" variant="outline" className="bg-transparent" onClick={() => router.push('/admin/stories')}>
          Cancel
        </Button>
        <PrintButton variant="outline" className="bg-transparent">
          Print Draft
        </PrintButton>
        <Button type="button" variant="outline" className="bg-transparent" onClick={handlePreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {story ? "Save Changes" : "Create Story"}
        </Button>
        <p className="my-auto text-xs text-muted-foreground">Tip: use slash commands and font color controls while writing.</p>
      </div>

      {/* Preview Modal */}
      <StoryPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        story={{
          title: previewData.title,
          excerpt: previewData.excerpt,
          content: content,
          image: imageUrl,
          category: previewData.category,
          read_time: previewData.readTime,
        }}
      />
    </form>
  )
}
