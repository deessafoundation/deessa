"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Music,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  Tv,
  User,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { FileUpload } from "@/components/admin/media/file-upload"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "@/components/shared/icons/social-icons"
import { extractYouTubeId, fetchYouTubeMetadata, getYouTubeThumbnail, generateSlug } from "@/lib/utils/youtube"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { PodcastRow } from "@/lib/types/podcast"
import styles from "./podcasts.module.css"

interface PodcastFormProps {
  podcast?: Partial<PodcastRow> | null
  mode: "create" | "edit"
}

const COMMON_TOPICS = [
  "Autism Awareness",
  "Inclusion",
  "Education",
  "Community",
  "Personal Stories",
  "Advocacy",
  "Mental Health",
  "Accessibility",
  "Family Support",
  "Employment",
  "Healthcare",
  "Technology",
  "Early Intervention",
  "Sensory Spaces",
]

const POPULAR_GUEST_ROLES = [
  "Clinical Psychologist",
  "Special Educator",
  "Autism Advocate",
  "Occupational Therapist",
  "Researcher & Author",
  "Parent Advocate",
  "Speech-Language Pathologist",
  "Neurodiversity Consultant",
]

export default function PodcastForm({ podcast, mode }: PodcastFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "guest" | "settings">("basic")

  // YouTube auto-import state
  const [youtubeUrl, setYoutubeUrl] = useState(
    podcast?.youtube_id ? `https://www.youtube.com/watch?v=${podcast.youtube_id}` : ""
  )
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [youtubeError, setYoutubeError] = useState("")
  const [youtubeSuccess, setYoutubeSuccess] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(false)

  // Media pickers & dialogs
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false)
  const [showGuestPhotoPicker, setShowGuestPhotoPicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Initial Form Data snapshot for dirty checking
  const initialData = useMemo(() => {
    return {
      title: podcast?.title || "",
      slug: podcast?.slug || "",
      description: podcast?.description || "",
      youtube_id: podcast?.youtube_id || "",
      thumbnail_url: podcast?.thumbnail_url || "",
      duration: podcast?.duration || "",
      format: (podcast?.format || "video") as "video" | "audio",
      episode_number: podcast?.episode_number ? String(podcast.episode_number) : "",
      topics: (podcast?.topics || []) as string[],
      transcript: podcast?.transcript || "",
      highlights: (podcast?.highlights || []) as string[],
      guest_name: podcast?.guest_name || "",
      guest_bio: podcast?.guest_bio || "",
      guest_photo_url: podcast?.guest_photo_url || "",
      guest_roles: (podcast?.guest_roles || []) as string[],
      guest_social_linkedin: podcast?.guest_social_links?.linkedin || "",
      guest_social_twitter: podcast?.guest_social_links?.twitter || "",
      guest_social_facebook: podcast?.guest_social_links?.facebook || "",
      guest_social_instagram: podcast?.guest_social_links?.instagram || "",
      guest_social_email: podcast?.guest_social_links?.email || "",
      guest_social_website: podcast?.guest_social_links?.website || "",
      featured: podcast?.featured || false,
      published: podcast?.published || false,
    }
  }, [podcast])

  const [formData, setFormData] = useState(initialData)
  const [savedData, setSavedData] = useState(initialData)

  // Guest Roles state
  const [guestRoles, setGuestRoles] = useState<string[]>(initialData.guest_roles)
  const [newRole, setNewRole] = useState("")

  // Highlights (YouTube Shorts) state
  const [highlights, setHighlights] = useState<string[]>(initialData.highlights)
  const [newHighlight, setNewHighlight] = useState("")

  // Multi-part Show Notes state
  const [showNotes, setShowNotes] = useState<Array<{ title: string; content: string }>>(() => {
    if (podcast?.show_notes) {
      try {
        const parsed = JSON.parse(podcast.show_notes)
        return Array.isArray(parsed) && parsed.length > 0
          ? parsed.slice(0, 8)
          : [{ title: "Overview & Introductions", content: "" }]
      } catch {
        return [{ title: "Overview & Introductions", content: podcast.show_notes }]
      }
    }
    return [{ title: "Overview & Introductions", content: "" }]
  })

  const [customTopic, setCustomTopic] = useState("")

  // Dirty check: has anything changed?
  const hasChanges = useMemo(() => {
    const formString = JSON.stringify({ ...formData, guestRoles, highlights, showNotes })
    const savedString = JSON.stringify({
      ...savedData,
      guestRoles: initialData.guest_roles,
      highlights: initialData.highlights,
      showNotes: (() => {
        try {
          return podcast?.show_notes
            ? JSON.parse(podcast.show_notes)
            : [{ title: "Overview & Introductions", content: "" }]
        } catch {
          return [{ title: "Overview & Introductions", content: podcast?.show_notes || "" }]
        }
      })(),
    })
    return formString !== savedString
  }, [formData, guestRoles, highlights, showNotes, savedData, initialData, podcast])

  // Handle Title change with smart slug synchronization
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => {
      const shouldAutoSlug = mode === "create" && (!prev.slug || prev.slug === generateSlug(prev.title))
      return {
        ...prev,
        title: newTitle,
        slug: shouldAutoSlug ? generateSlug(newTitle) : prev.slug,
      }
    })
  }

  // YouTube Metadata Fetcher
  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    setYoutubeError("")
    setYoutubeSuccess(false)

    if (!url.trim()) return

    const videoId = extractYouTubeId(url)
    if (!videoId) {
      setYoutubeError("Please enter a valid YouTube video URL or 11-character video ID.")
      return
    }

    setFetchingMetadata(true)

    try {
      const metadata = await fetchYouTubeMetadata(videoId)
      const thumbnail = getYouTubeThumbnail(videoId, "maxres")

      if (metadata) {
        setFormData((prev) => ({
          ...prev,
          youtube_id: videoId,
          title: prev.title || metadata.title,
          thumbnail_url: prev.thumbnail_url || metadata.thumbnailUrl || thumbnail,
          slug: prev.slug || generateSlug(metadata.title),
        }))
        setYoutubeSuccess(true)
        notifications.showSuccess({
          title: "Broadcast Synchronized",
          description: `Imported: “${metadata.title}”`,
        })
      } else {
        setFormData((prev) => ({
          ...prev,
          youtube_id: videoId,
          thumbnail_url: prev.thumbnail_url || thumbnail,
        }))
        setYoutubeSuccess(true)
        notifications.showSuccess({
          title: "Video ID Connected",
          description: `Attached YouTube ID: ${videoId}`,
        })
      }
    } catch {
      setYoutubeError("Could not retrieve metadata automatically. You can enter details manually below.")
    } finally {
      setFetchingMetadata(false)
    }
  }

  // Topic Helpers
  const handleTopicToggle = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic) ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
    }))
  }

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !formData.topics.includes(customTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, customTopic.trim()],
      }))
      setCustomTopic("")
    }
  }

  // Guest Roles Helpers
  const addGuestRole = (roleToAdd?: string) => {
    const role = (roleToAdd || newRole).trim()
    if (role && guestRoles.length < 3 && !guestRoles.includes(role)) {
      setGuestRoles([...guestRoles, role])
      if (!roleToAdd) setNewRole("")
    }
  }

  const removeGuestRole = (index: number) => {
    setGuestRoles(guestRoles.filter((_, i) => i !== index))
  }

  // Highlights (YouTube Shorts) Helpers
  const addHighlight = () => {
    if (newHighlight.trim() && highlights.length < 10) {
      const isValid = /youtube\.com\/shorts\/|youtu\.be\/|[a-zA-Z0-9_-]{11}/.test(newHighlight)
      if (!isValid) {
        notifications.showError({
          title: "Invalid Format",
          description: "Please enter a valid YouTube Shorts link (e.g. https://youtube.com/shorts/...)",
        })
        return
      }
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight("")
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  // Show Notes Helpers
  const addShowNote = () => {
    if (showNotes.length < 8) {
      setShowNotes([...showNotes, { title: `Part ${showNotes.length + 1}`, content: "" }])
    }
  }

  const updateShowNote = (index: number, field: "title" | "content", value: string) => {
    const updated = [...showNotes]
    updated[index][field] = value
    setShowNotes(updated)
  }

  const moveShowNote = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= showNotes.length) return
    const updated = [...showNotes]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setShowNotes(updated)
  }

  const removeShowNote = (index: number) => {
    setShowNotes(showNotes.filter((_, i) => i !== index))
  }

  // Discard edits
  const handleDiscard = () => {
    setFormData(savedData)
    setGuestRoles(initialData.guest_roles)
    setHighlights(initialData.highlights)
    setYoutubeUrl(podcast?.youtube_id ? `https://www.youtube.com/watch?v=${podcast.youtube_id}` : "")
    notifications.showSuccess({ description: "All unsaved edits have been discarded." })
  }

  // Copy Public Permalink
  const handleCopyLink = () => {
    if (!formData.slug) return
    const url = `${window.location.origin}/podcasts/${formData.slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    notifications.showSuccess({ title: "Copied to Clipboard", description: url })
  }

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!formData.title.trim()) {
      notifications.showError({ title: "Validation Error", description: "Episode Title is required." })
      setActiveTab("basic")
      return
    }

    if (!formData.slug.trim()) {
      notifications.showError({ title: "Validation Error", description: "URL Slug is required." })
      setActiveTab("basic")
      return
    }

    setLoading(true)

    try {
      const url = mode === "create" ? "/api/admin/podcasts" : `/api/admin/podcasts/${podcast.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const validShowNotes = showNotes.filter((note) => note.content.trim())

      const guestSocialLinks = {
        linkedin: formData.guest_social_linkedin || undefined,
        twitter: formData.guest_social_twitter || undefined,
        facebook: formData.guest_social_facebook || undefined,
        instagram: formData.guest_social_instagram || undefined,
        email: formData.guest_social_email || undefined,
        website: formData.guest_social_website || undefined,
      }

      Object.keys(guestSocialLinks).forEach(
        (key) =>
          guestSocialLinks[key as keyof typeof guestSocialLinks] === undefined &&
          delete guestSocialLinks[key as keyof typeof guestSocialLinks]
      )

      const dbFields = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        youtube_id: formData.youtube_id,
        thumbnail_url: formData.thumbnail_url,
        duration: formData.duration,
        format: formData.format,
        topics: formData.topics,
        transcript: formData.transcript,
        guest_name: formData.guest_name,
        guest_bio: formData.guest_bio,
        guest_photo_url: formData.guest_photo_url,
        featured: formData.featured,
        published: formData.published,
      }

      const payload = {
        ...dbFields,
        episode_number: formData.episode_number ? parseInt(formData.episode_number, 10) : null,
        show_notes: validShowNotes.length > 0 ? JSON.stringify(validShowNotes) : null,
        guest_roles: guestRoles,
        guest_social_links: Object.keys(guestSocialLinks).length > 0 ? guestSocialLinks : null,
        highlights: highlights,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save podcast episode")
      }

      const data = await response.json()
      setSavedData(formData)
      notifications.showSuccess({
        title: mode === "create" ? "Episode Created!" : "Episode Saved!",
        description: `“${data.title}” is up to date.`,
      })

      router.push("/admin/podcasts")
      router.refresh()
    } catch {
      notifications.showError({
        title: "Failed to Save",
        description: "Could not save podcast details. Please verify your connection.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete Handler
  const handleDelete = async () => {
    if (!podcast?.id) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/podcasts/${podcast.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      notifications.showSuccess({
        description: `“${podcast.title}” deleted successfully.`,
      })
      router.push("/admin/podcasts")
      router.refresh()
    } catch {
      notifications.showError({
        description: "Could not delete episode. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Bio word count feedback
  const bioWordCount = formData.guest_bio.split(/\s+/).filter(Boolean).length

  // Production Readiness Checklist calculations
  const readinessChecklist = useMemo(() => {
    const items = [
      { id: "title", label: "Episode Title & Slug", ok: Boolean(formData.title.trim() && formData.slug.trim()) },
      { id: "epNum", label: "Episode Number (Ep :)", ok: Boolean(formData.episode_number) },
      { id: "cover", label: "16:9 Cover Artwork", ok: Boolean(formData.thumbnail_url) },
      { id: "video", label: "YouTube Broadcast ID", ok: Boolean(formData.youtube_id) },
      { id: "desc", label: "Summary & Topics", ok: Boolean(formData.description.trim() && formData.topics.length > 0) },
      { id: "guest", label: "Featured Guest Profile", ok: Boolean(formData.guest_name.trim()) },
      { id: "notes", label: "Show Notes / Transcript", ok: showNotes.some((n) => n.content.trim()) || Boolean(formData.transcript.trim()) },
    ]

    const passed = items.filter((i) => i.ok).length
    const score = Math.round((passed / items.length) * 100)

    return { items, passed, total: items.length, score }
  }, [formData, showNotes])

  return (
    <div className={cn(styles.root, "space-y-6 pb-24")}>
      {/* BREADCRUMB & CONTEXT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b pb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/podcasts" className="hover:text-foreground transition-colors">
            Podcasts
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[240px] sm:max-w-md">
            {mode === "create" ? "New Episode" : `Ep : ${formData.episode_number || "Special"} · ${formData.title || "Untitled"}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5",
              formData.published
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {formData.published ? "Live Broadcast" : "Internal Draft"}
          </Badge>
          {formData.featured && formData.published && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold px-2 py-0.5">
              <Star className="size-3 mr-1 fill-current" />
              Spotlight
            </Badge>
          )}
        </div>
      </div>

      {/* DESKTOP STICKY HEADER & ACTION BAR (top-16) */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 backdrop-blur-md p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="h-9 px-2.5 text-xs text-muted-foreground shrink-0">
            <Link href="/admin/podcasts">
              <ArrowLeft className="size-4 mr-1.5" />
              Podcasts
            </Link>
          </Button>

          <span className="text-muted-foreground/30 hidden sm:inline">|</span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold shrink-0">
              Ep : {formData.episode_number || (mode === "create" ? "New" : "SP")}
            </span>

            <span className="font-bold text-sm truncate max-w-[160px] sm:max-w-xs md:max-w-sm hidden sm:inline">
              {formData.title || (mode === "create" ? "New Broadcast" : "Untitled Episode")}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[11px] font-semibold shrink-0 hidden md:inline-flex",
                hasChanges
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              <span className={cn("size-1.5 rounded-full mr-1.5", hasChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              {hasChanges ? "Unsaved edits" : "Up to date"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mode === "edit" && formData.slug && (
            <Button variant="outline" size="sm" asChild className="h-10 text-xs px-3 hidden lg:inline-flex">
              <Link href={`/podcasts/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1.5" />
                Live Episode
              </Link>
            </Button>
          )}

          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-10 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hidden sm:inline-flex"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="h-10 px-3.5 text-xs sm:text-sm font-medium"
            onClick={handleDiscard}
            disabled={!hasChanges || loading}
          >
            <RotateCcw className="mr-1.5 size-3.5 sm:size-4" />
            Discard
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="h-10 px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {mode === "create" ? "Create Episode" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE FLOATING BOTTOM ACTION PILL */}
      {hasChanges && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 p-3 rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pl-1 min-w-0">
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">Unsaved edits</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="h-10 text-xs px-3 font-medium"
              onClick={handleDiscard}
              disabled={loading}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              className="h-10 text-xs px-4 font-semibold shadow-xs"
              onClick={() => handleSubmit()}
              disabled={loading}
            >
              {loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
              Save
            </Button>
          </div>
        </div>
      )}

      {/* HORIZONTALLY SCROLLABLE STUDIO TAB STRIP */}
      <Card className="border shadow-xs">
        <CardContent className="overflow-x-auto p-1.5 sm:p-2 scrollbar-none">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
            <TabsList
              aria-label="Podcast editor studio tabs"
              className={cn(
                styles.track,
                "flex h-auto w-max sm:w-full min-w-full sm:min-w-0 items-center justify-start gap-1 sm:gap-1.5 rounded-xl p-1"
              )}
            >
              <TabsTrigger
                value="basic"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Video className="size-4 shrink-0" />
                <span>Episode &amp; Video</span>
              </TabsTrigger>

              <TabsTrigger
                value="content"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <FileText className="size-4 shrink-0" />
                <span>Show Notes &amp; Shorts</span>
                {highlights.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 font-semibold">
                    {highlights.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="guest"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Users className="size-4 shrink-0" />
                <span>Guest Profile</span>
                {formData.guest_name && <span className="size-1.5 rounded-full bg-emerald-500" />}
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Sliders className="size-4 shrink-0" />
                <span>Publishing &amp; Settings</span>
                <span className="ml-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted/60">
                  {readinessChecklist.score}%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* TAB 1: EPISODE & VIDEO MEDIA */}
      {/* ========================================================================= */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          {/* YouTube Video Importer Card */}
          <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-card/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
                    <Youtube className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">YouTube Broadcast Synchronization</CardTitle>
                    <CardDescription className="text-xs">
                      Paste a YouTube URL or Video ID to auto-populate title, high-res cover art, and duration.
                    </CardDescription>
                  </div>
                </div>

                {youtubeSuccess && (
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 w-fit"
                  >
                    <Check className="size-3 mr-1" />
                    Synchronized
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Input
                    id="youtube_url"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleYouTubeUrlChange(youtubeUrl))}
                    className="h-11 pl-3 text-sm font-mono rounded-xl"
                    disabled={fetchingMetadata}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleYouTubeUrlChange(youtubeUrl)}
                  disabled={!youtubeUrl || fetchingMetadata}
                  className="h-11 px-5 text-sm font-semibold shrink-0"
                >
                  {fetchingMetadata ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Fetching…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Auto-Import
                    </>
                  )}
                </Button>
              </div>

              {youtubeError && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <XCircle className="size-3.5 shrink-0" />
                  {youtubeError}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Episode Core Metadata & Media Preview (2 Columns) */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Form Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Episode Metadata</CardTitle>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs font-bold">
                      Ep : {formData.episode_number || "Draft"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Episode Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-sm font-semibold">
                        Episode Title <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono">{formData.title.length}/140</span>
                    </div>
                    <Input
                      id="title"
                      value={formData.title}
                      maxLength={140}
                      placeholder="e.g. Empowering Neurodiverse Youth in Classrooms"
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="h-11 text-sm font-medium rounded-xl"
                      required
                    />
                  </div>

                  {/* URL Slug with auto-generate button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug" className="text-sm font-semibold">
                        URL Slug <span className="text-destructive">*</span>
                      </Label>
                      {formData.title && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="size-3" /> Auto-sync from title
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={formData.slug}
                        placeholder="empowering-neurodiverse-youth"
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="h-11 text-sm font-mono rounded-xl pl-3"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      Public path: /podcasts/{formData.slug || "your-slug-here"}
                    </p>
                  </div>

                  {/* Episode Number, Duration, Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="episode_number" className="text-sm font-semibold flex items-center gap-1">
                        Ep : <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="episode_number"
                        type="number"
                        value={formData.episode_number}
                        placeholder="e.g. 14"
                        onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                        className="h-11 text-sm font-mono rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-semibold">
                        Duration
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="duration"
                          placeholder="45:20"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="h-11 pl-9 text-sm font-mono rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtube_id_field" className="text-sm font-semibold">
                        YouTube ID
                      </Label>
                      <Input
                        id="youtube_id_field"
                        placeholder="11-char ID"
                        value={formData.youtube_id}
                        onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                        className="h-11 text-sm font-mono rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Broadcast Format: High Craft Segmented Cards */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-sm font-semibold">Broadcast Format</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setFormData({ ...formData, format: "video" })}
                        className={cn(
                          styles.formatCard,
                          "flex items-center gap-3 p-3 rounded-xl border",
                          formData.format === "video" ? styles.formatCardActive : "border-border/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg",
                            formData.format === "video" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Video className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Video Broadcast</p>
                          <p className="text-[11px] text-muted-foreground">YouTube video stream</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, format: "audio" })}
                        className={cn(
                          styles.formatCard,
                          "flex items-center gap-3 p-3 rounded-xl border",
                          formData.format === "audio" ? styles.formatCardActive : "border-border/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg",
                            formData.format === "audio" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Music className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Audio Broadcast</p>
                          <p className="text-[11px] text-muted-foreground">Audio stream / podcast</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Episode Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description" className="text-sm font-semibold">
                        Episode Summary / Description <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-xs text-muted-foreground font-mono">{formData.description.length}/1000</span>
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description}
                      rows={4}
                      placeholder="Comprehensive overview of talking points, key lessons, and highlights from this episode..."
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="text-sm rounded-xl leading-relaxed"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Topics Cloud Card */}
              <Card className="border shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Topics &amp; Themes</CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">{formData.topics.length} selected</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Common Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_TOPICS.map((topic) => {
                      const isSelected = formData.topics.includes(topic)
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleTopicToggle(topic)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                          )}
                        >
                          {isSelected && <Check className="size-3 mr-1 inline" />}
                          {topic}
                        </button>
                      )
                    })}
                  </div>

                  {/* Add Custom Topic */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder="Add custom topic..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomTopic())}
                      className="h-10 text-xs rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomTopic}
                      variant="outline"
                      disabled={!customTopic.trim()}
                      className="h-10 px-3 text-xs"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Cinema 16:9 Artwork & Video Player Showcase (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border shadow-xs overflow-hidden">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-card/60">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Cinema Cover Artwork</CardTitle>
                    <div className="flex items-center gap-1.5">
                      {formData.youtube_id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewVideo(!previewVideo)}
                          className="h-7 px-2 text-xs"
                        >
                          {previewVideo ? <ImageIcon className="size-3 mr-1" /> : <Tv className="size-3 mr-1" />}
                          {previewVideo ? "View Cover" : "Test Player"}
                        </Button>
                      )}
                      <span className="text-xs font-mono text-muted-foreground">16:9 Frame</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Interactive Video Player or Cinema Cover Frame */}
                  {previewVideo && formData.youtube_id ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border bg-black shadow-md">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${formData.youtube_id}?autoplay=0&rel=0`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        styles.cinemaFrame,
                        "relative aspect-video rounded-xl overflow-hidden flex items-center justify-center group"
                      )}
                    >
                      {formData.thumbnail_url ? (
                        <>
                          <img
                            src={formData.thumbnail_url}
                            alt="Podcast Cover Preview"
                            className="w-full h-full object-cover"
                          />

                          {/* Quick control overlay */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl shadow-md border border-white/10 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-white hover:text-white hover:bg-white/20"
                              onClick={() => setShowThumbnailPicker(true)}
                            >
                              <ImageIcon className="size-3 mr-1" />
                              Library
                            </Button>
                            {formData.youtube_id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-white hover:text-white hover:bg-white/20"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    thumbnail_url: getYouTubeThumbnail(formData.youtube_id, "maxres"),
                                  }))
                                }
                                title="Reset to YouTube default"
                              >
                                <RotateCcw className="size-3" />
                              </Button>
                            )}
                          </div>

                          {/* Top-left resolution tag */}
                          <span className="absolute top-2.5 left-2.5 bg-black/75 text-white/90 text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                            16:9 Cinema
                          </span>

                          {/* Bottom-left Ep : tag */}
                          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                              Ep : {formData.episode_number || "Special"}
                            </span>
                            {formData.duration && (
                              <span className="bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                                {formData.duration}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-white/70">
                          <Video className="size-10 stroke-1 text-white/50" />
                          <p className="text-xs">No cover artwork loaded</p>
                          <p className="text-[10px] text-white/40">Paste a YouTube link above or upload custom banner</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Custom Cover Banner */}
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Upload Custom 16:9 Cover
                    </Label>
                    <FileUpload
                      bucket="site-assets"
                      currentUrl={formData.thumbnail_url}
                      onUpload={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url }))}
                      label="Upload 16:9 Cover"
                      accept="image/*"
                      maxSizeMB={5}
                      allowUrl={false}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">or select existing:</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowThumbnailPicker(true)}
                        className="h-8 text-xs"
                      >
                        <ImageIcon className="size-3.5 mr-1.5" />
                        Browse Media Library
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTENT, SHOW NOTES & YOUTUBE SHORTS HIGHLIGHTS */}
      {/* ========================================================================= */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* YouTube Shorts Highlights Card */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-card/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
                    <Play className="size-4 fill-current" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">YouTube Shorts Highlights</CardTitle>
                    <CardDescription className="text-xs">
                      Curate up to 10 bite-sized 9:16 mobile shorts featured prominently on the public episode showcase.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono w-fit">
                  {highlights.length}/10 Clips
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Highlight Cards Grid */}
              {highlights.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {highlights.map((highlight, index) => {
                    const videoId = extractYouTubeId(highlight)
                    return (
                      <div
                        key={index}
                        className={cn(
                          styles.shortsCard,
                          "relative rounded-xl border bg-card overflow-hidden flex flex-col justify-between shadow-xs group"
                        )}
                      >
                        {/* 9:16 Aspect ratio container */}
                        <div className="relative aspect-[9/16] bg-neutral-900 overflow-hidden">
                          {videoId ? (
                            <img
                              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Play className="size-6" />
                            </div>
                          )}

                          <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeHighlight(index)}
                            className="absolute top-2 right-2 size-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove Short"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>

                        <div className="p-2 border-t bg-muted/20 flex items-center justify-between gap-1">
                          <p className="text-[11px] text-muted-foreground truncate font-mono" title={highlight}>
                            {highlight}
                          </p>
                          <a
                            href={highlight}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            title="Open clip"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-1">
                  <Play className="size-8 mx-auto text-muted-foreground/60 stroke-1" />
                  <p className="font-semibold text-foreground">No YouTube Shorts highlights added yet</p>
                  <p>Add shorts below to feature key episode soundbites on mobile.</p>
                </div>
              )}

              {/* Add Highlight Input */}
              {highlights.length < 10 && (
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="https://youtube.com/shorts/... or video link"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                    className="h-10 text-sm rounded-xl font-mono"
                  />
                  <Button
                    type="button"
                    onClick={addHighlight}
                    disabled={!newHighlight.trim()}
                    className="h-10 px-4 text-xs font-semibold shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add Short
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Structured Multi-Part Show Notes */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Structured Show Notes</CardTitle>
                  <CardDescription className="text-xs">
                    Segment episode topics into distinct chronological sections with key takeaways.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addShowNote}
                  disabled={showNotes.length >= 8}
                  className="h-8 text-xs px-3"
                >
                  <Plus className="size-3.5 mr-1" /> Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {showNotes.map((note, index) => (
                <div key={index} className="rounded-xl border p-4 space-y-3 bg-card/60 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted font-mono text-[11px] font-bold">
                        Part {index + 1}
                      </span>
                      <Input
                        value={note.title}
                        placeholder={`Section Title (e.g. Early Signs & Diagnosis)`}
                        onChange={(e) => updateShowNote(index, "title", e.target.value)}
                        className="h-9 text-xs font-semibold w-56 sm:w-72 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() => moveShowNote(index, "up")}
                        title="Move Up"
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === showNotes.length - 1}
                        onClick={() => moveShowNote(index, "down")}
                        title="Move Down"
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                      {showNotes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeShowNote(index)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2"
                        >
                          <Trash2 className="size-3 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <Textarea
                    value={note.content}
                    rows={3}
                    placeholder="Key talking points, timestamps, resources, and takeaways for this section..."
                    onChange={(e) => updateShowNote(index, "content", e.target.value)}
                    className="text-xs rounded-lg leading-relaxed"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Full Episode Verbatim Transcript */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Full Episode Transcript</CardTitle>
                  <CardDescription className="text-xs">
                    Verbatim dialogue with speaker cues and timestamps for SEO indexing and accessibility.
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formData.transcript.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-2">
              <Textarea
                id="transcript"
                value={formData.transcript}
                rows={10}
                placeholder="Full verbatim transcript with speaker timestamps and dialogues..."
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                className="text-xs font-mono leading-relaxed rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Transcripts dramatically boost search engine ranking and provide equal access for deaf &amp; hard-of-hearing audiences.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GUEST PROFILE & SOCIAL MEDIA */}
      {/* ========================================================================= */}
      {activeTab === "guest" && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Guest Identity & Bio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b">
                <CardTitle className="text-base font-bold">Featured Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_name" className="text-sm font-semibold">
                    Guest Full Name
                  </Label>
                  <Input
                    id="guest_name"
                    value={formData.guest_name}
                    placeholder="e.g. Dr. Jane Smith, Ph.D."
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className="h-11 text-sm font-medium rounded-xl"
                  />
                </div>

                {/* Roles with Quick Preset Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Guest Roles / Specialties (Max 3)</Label>
                    <span className="text-xs text-muted-foreground font-mono">{guestRoles.length}/3</span>
                  </div>

                  {/* Suggestion presets */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {POPULAR_GUEST_ROLES.map((role) => {
                      const isAdded = guestRoles.includes(role)
                      return (
                        <button
                          key={role}
                          type="button"
                          disabled={guestRoles.length >= 3 || isAdded}
                          onClick={() => addGuestRole(role)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
                            isAdded
                              ? "bg-primary/10 text-primary border-primary/20 opacity-60 cursor-default"
                              : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent cursor-pointer"
                          )}
                        >
                          {isAdded && <Check className="size-2.5 mr-1 inline" />}
                          {role}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Role Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newRole}
                      placeholder="Add custom role..."
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGuestRole())}
                      className="h-10 text-xs rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={() => addGuestRole()}
                      disabled={guestRoles.length >= 3 || !newRole.trim()}
                      className="h-10 px-3 text-xs"
                    >
                      <Plus className="size-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  {/* Selected Roles List */}
                  {guestRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {guestRoles.map((role, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1 gap-1.5">
                          {role}
                          <X
                            className="size-3 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => removeGuestRole(idx)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="guest_bio" className="text-sm font-semibold">
                      Guest Biography
                    </Label>
                    <span
                      className={cn(
                        "text-xs font-mono",
                        bioWordCount > 50 ? "text-amber-600 font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {bioWordCount} words (~35 recommended)
                    </span>
                  </div>
                  <Textarea
                    id="guest_bio"
                    value={formData.guest_bio}
                    rows={4}
                    placeholder="Short engaging bio highlighting their background, personal mission, and key contributions..."
                    onChange={(e) => setFormData({ ...formData, guest_bio: e.target.value })}
                    className="text-sm rounded-xl leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Profiles */}
            <Card className="border shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b">
                <CardTitle className="text-base font-bold">Social Media &amp; Profiles</CardTitle>
                <CardDescription className="text-xs">
                  Connect guest social profiles shown on the public episode page.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="guest_social_linkedin" className="text-xs font-medium flex items-center gap-1.5">
                      <Linkedin className="size-3.5 text-[#0A66C2]" /> LinkedIn
                    </Label>
                    <Input
                      id="guest_social_linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.guest_social_linkedin}
                      onChange={(e) => setFormData({ ...formData, guest_social_linkedin: e.target.value })}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guest_social_twitter" className="text-xs font-medium flex items-center gap-1.5">
                      <Twitter className="size-3.5 text-foreground" /> X (Twitter)
                    </Label>
                    <Input
                      id="guest_social_twitter"
                      type="url"
                      placeholder="https://x.com/username"
                      value={formData.guest_social_twitter}
                      onChange={(e) => setFormData({ ...formData, guest_social_twitter: e.target.value })}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guest_social_instagram" className="text-xs font-medium flex items-center gap-1.5">
                      <Instagram className="size-3.5 text-[#E4405F]" /> Instagram
                    </Label>
                    <Input
                      id="guest_social_instagram"
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={formData.guest_social_instagram}
                      onChange={(e) => setFormData({ ...formData, guest_social_instagram: e.target.value })}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guest_social_facebook" className="text-xs font-medium flex items-center gap-1.5">
                      <Facebook className="size-3.5 text-[#1877F2]" /> Facebook
                    </Label>
                    <Input
                      id="guest_social_facebook"
                      type="url"
                      placeholder="https://facebook.com/username"
                      value={formData.guest_social_facebook}
                      onChange={(e) => setFormData({ ...formData, guest_social_facebook: e.target.value })}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="guest_social_website" className="text-xs font-medium flex items-center gap-1.5">
                      <Globe className="size-3.5 text-primary" /> Official Website / Portfolio
                    </Label>
                    <Input
                      id="guest_social_website"
                      type="url"
                      placeholder="https://drjanesmith.org"
                      value={formData.guest_social_website}
                      onChange={(e) => setFormData({ ...formData, guest_social_website: e.target.value })}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest Photo Showcase (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b bg-card/60">
                <CardTitle className="text-base font-bold">Guest Portrait Photo</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Circular Portrait Showcase */}
                <div className="flex flex-col items-center justify-center p-6 border rounded-2xl bg-card space-y-3">
                  <div className="relative size-32 rounded-full overflow-hidden border-2 border-border shadow-md bg-muted">
                    {formData.guest_photo_url ? (
                      <img
                        src={formData.guest_photo_url}
                        alt={formData.guest_name || "Guest portrait"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-muted">
                        <User className="size-12 stroke-1" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-sm">{formData.guest_name || "Guest Name"}</p>
                    <p className="text-xs text-muted-foreground">
                      {guestRoles.join(" · ") || "No roles assigned yet"}
                    </p>
                  </div>

                  {formData.guest_photo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, guest_photo_url: "" })}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3 mr-1" /> Clear Photo
                    </Button>
                  )}
                </div>

                {/* Upload or Pick Avatar */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Upload Guest Photo
                  </Label>
                  <FileUpload
                    bucket="site-assets"
                    currentUrl={formData.guest_photo_url}
                    onUpload={(url) => setFormData((prev) => ({ ...prev, guest_photo_url: url }))}
                    label="Upload Portrait"
                    accept="image/*"
                    maxSizeMB={3}
                    allowUrl={false}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">or select existing:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGuestPhotoPicker(true)}
                      className="h-8 text-xs"
                    >
                      <ImageIcon className="size-3.5 mr-1.5" />
                      Browse Media Library
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PUBLISHING, READINESS & CURATORIAL SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-6">
          {/* Production Readiness Score Card */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Production Readiness Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Verify all studio elements before releasing this broadcast to the public website.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-mono font-bold px-2.5 py-1",
                    readinessChecklist.score === 100
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  )}
                >
                  {readinessChecklist.score}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5">
                {readinessChecklist.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-xs",
                      item.ok ? "bg-emerald-500/5 border-emerald-500/20 text-foreground" : "bg-muted/30 border-dashed text-muted-foreground"
                    )}
                  >
                    {item.ok ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground/60 shrink-0" />
                    )}
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribution & Curation Status */}
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b">
              <CardTitle className="text-base font-bold">Distribution &amp; Curation Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Published Switch Card */}
              <div
                className={cn(
                  "rounded-xl border p-4 transition-all cursor-pointer flex items-center justify-between gap-4",
                  formData.published ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card hover:bg-muted/30"
                )}
                onClick={() => setFormData({ ...formData, published: !formData.published })}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg",
                        formData.published
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {formData.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </div>
                    <span className="text-sm font-bold">Live Public Broadcast</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.published
                      ? "This episode is currently live on /podcasts for all public audiences."
                      : "Saved as an internal draft. Hidden from public audiences."}
                  </p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Publish podcast"
                />
              </div>

              {/* Featured Switch Card */}
              <div
                className={cn(
                  "rounded-xl border p-4 transition-all cursor-pointer flex items-center justify-between gap-4",
                  formData.featured ? "bg-amber-500/5 border-amber-500/30" : "bg-card hover:bg-muted/30"
                )}
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg",
                        formData.featured
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Star className={cn("size-4", formData.featured && "fill-current")} />
                    </div>
                    <span className="text-sm font-bold">Spotlight Series Feature</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.featured
                      ? "Pinned prominently on the podcast studio hero section."
                      : "Standard chronological feed placement on the podcast index."}
                  </p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Feature podcast"
                />
              </div>
            </CardContent>
          </Card>

          {/* Public Permalink Card */}
          {formData.slug && (
            <Card className="border shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b">
                <CardTitle className="text-base font-bold">Public Episode Permalink</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border bg-muted/30 font-mono text-xs">
                  <span className="truncate text-muted-foreground">
                    /podcasts/{formData.slug}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      className="h-8 text-xs px-2.5"
                    >
                      {copiedLink ? <Check className="size-3.5 text-emerald-600 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                      {copiedLink ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 text-xs px-2.5"
                    >
                      <Link href={`/podcasts/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5 mr-1" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Danger Zone (in edit mode) */}
          {mode === "edit" && (
            <Card className="border border-destructive/30 bg-destructive/5 shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3">
                <CardTitle className="text-base font-bold text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-xs text-destructive/80">
                  Permanently delete this podcast episode and all associated show notes from the database.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Permanently Delete Episode
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Media Picker for Cover Artwork */}
      {showThumbnailPicker && (
        <MediaPicker
          open={showThumbnailPicker}
          onOpenChange={setShowThumbnailPicker}
          onSelect={(url) => {
            setFormData((prev) => ({ ...prev, thumbnail_url: url }))
            setShowThumbnailPicker(false)
          }}
          bucket="site-assets"
          title="Select Episode Cover Artwork"
        />
      )}

      {/* Media Picker for Guest Photo */}
      {showGuestPhotoPicker && (
        <MediaPicker
          open={showGuestPhotoPicker}
          onOpenChange={setShowGuestPhotoPicker}
          onSelect={(url) => {
            setFormData((prev) => ({ ...prev, guest_photo_url: url }))
            setShowGuestPhotoPicker(false)
          }}
          bucket="site-assets"
          title="Select Guest Portrait Photo"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Permanently Delete Podcast Episode?"
        description={`“${podcast?.title ?? "This episode"}” will be permanently removed from the public website and archive. This action cannot be undone.`}
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
