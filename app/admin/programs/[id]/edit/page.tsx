"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useState, useEffect, useCallback, useRef } from "react"
import {
  ArrowLeft, Loader2, Save, Globe, GlobeOff, Archive, RotateCcw, Trash2, Eye,
  Plus, X, AlertTriangle, CheckCircle2, AlertCircle, Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  getProgramDraft,
  updateProgramDraft,
  publishProgram,
  unpublishProgram,
  archiveProgram,
  restoreProgram,
  deleteProgram,
} from "@/lib/actions/program-crud"
import { programDocumentSchema, type ProgramDocument, type ProgramSection, type ProgramCategory } from "@/lib/programs/content"
import { SectionEditor } from "@/components/admin/program-sections"
import { ProgramIdProvider } from "@/components/admin/program-sections/program-id-context"
import { ServiceEditForm } from "@/components/admin/programs/service-edit-form"
import { EditorialProgramEditor } from "@/components/admin/programs/editorial-program-editor"
import { readEditorHero } from "@/lib/programs/editor-hero"
import { ProgramMediaLibrary } from "@/components/admin/programs/sections/program-media-library"
import { VersionHistoryPanel } from "@/components/admin/programs/sections/version-history-panel"
import { ProgramEditSkeleton } from "@/components/admin/programs/program-edit-skeleton"
import { notifications } from "@/lib/notifications"

function formSnapshot(value: Record<string, unknown>) {
  return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))))
}

const CATEGORIES: { value: ProgramCategory; label: string }[] = [
  { value: "service", label: "Service" },
  { value: "outreach", label: "Outreach" },
  { value: "research", label: "Research" },
  { value: "campaign", label: "Campaign" },
]

// ── Confirm Dialog ──────────────────────────────────────────

type ConfirmVariant = "danger" | "warning" | "info"

interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  variant: ConfirmVariant
  onConfirm: () => void | Promise<void>
}

const CONFIRM_STYLES: Record<ConfirmVariant, { iconBg: string; iconColor: string; confirmBg: string; confirmHover: string }> = {
  danger:  { iconBg: "bg-red-100",   iconColor: "text-red-600",   confirmBg: "bg-red-600",   confirmHover: "hover:bg-red-700" },
  warning: { iconBg: "bg-amber-100", iconColor: "text-amber-600", confirmBg: "bg-amber-600",  confirmHover: "hover:bg-amber-700" },
  info:    { iconBg: "bg-blue-100",  iconColor: "text-blue-600",  confirmBg: "bg-blue-600",   confirmHover: "hover:bg-blue-700" },
}

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const styles = CONFIRM_STYLES[state.variant]

  async function handleConfirm() {
    setLoading(true)
    try {
      await state.onConfirm()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
              <AlertTriangle className={`size-5 ${styles.iconColor}`} />
            </div>
            <div className="space-y-1.5 min-w-0">
              <DialogTitle className="text-base">{state.title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {state.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {state.variant === "danger" && (
          <div className="px-6 pb-2">
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 leading-relaxed">
              <strong>This action cannot be undone.</strong>
            </div>
          </div>
        )}
        <DialogFooter className="px-6 py-4 bg-muted/30 gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="gap-2">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`gap-2 text-white ${styles.confirmBg} ${styles.confirmHover}`}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {state.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Publish Readiness Dialog ────────────────────────────────

interface ReadinessIssue {
  type: "error" | "warning"
  message: string
}

interface PublishConfirmProps {
  open: boolean
  onClose: () => void
  onPublish: () => Promise<void>
  title: string
  slug: string
  category: string
  heroImage?: { url?: string; assetId?: string }
  sections: ProgramSection[]
  seoTitle: string
  seoDescription: string
  tags: string[]
  revision: number
  status: string
  issues: ReadinessIssue[]
}

function PublishConfirmDialog({
  open, onClose, onPublish, title, slug, category, heroImage,
  sections, seoTitle, seoDescription, tags, revision, status, issues,
}: PublishConfirmProps) {
  const [loading, setLoading] = useState(false)
  const hasErrors = issues.some((i) => i.type === "error")
  const enabledSections = sections.filter((s) => s.enabled)

  async function handlePublish() {
    setLoading(true)
    try {
      await onPublish()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Globe className="size-5 text-green-600" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <DialogTitle className="text-base">
                {status === "published" ? "Update publication?" : "Publish program?"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Review the readiness summary below before going live.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Preview card */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">/{slug || "…"}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{category}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${heroImage?.url ? "bg-green-500" : "bg-amber-500"}`} />
                Hero image {heroImage?.url ? "set" : "missing"}
              </span>
              <span>{enabledSections.length} section{enabledSections.length !== 1 ? "s" : ""}</span>
              <span>{seoTitle ? "SEO set" : "No SEO title"}</span>
              {tags.length > 0 && <span>{tags.length} tag{tags.length !== 1 ? "s" : ""}</span>}
            </div>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div className="space-y-1.5">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    issue.type === "error"
                      ? "bg-red-50 border border-red-100 text-red-700"
                      : "bg-amber-50 border border-amber-100 text-amber-700"
                  }`}
                >
                  {issue.type === "error" ? (
                    <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                  )}
                  {issue.message}
                </div>
              ))}
            </div>
          )}

          {issues.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
              <CheckCircle2 className="size-3.5 shrink-0" />
              All readiness checks passed
            </div>
          )}

          {/* Section list */}
          {enabledSections.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Sections to publish</p>
              <div className="flex flex-wrap gap-1">
                {enabledSections.map((s) => (
                  <Badge key={s.id} variant="secondary" className="text-[10px] font-mono">
                    {s.content.type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="gap-2">
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading || hasErrors}
            className="gap-2 text-white bg-green-600 hover:bg-green-700"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {status === "published" ? `Update as v${revision}` : `Publish as v${revision}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ─────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProgramPage({ params }: Props) {
  const { id: routeProgramId } = use(params)
  const router = useRouter()
  const [programId, setProgramId] = useState<string | null>(null)
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [eyebrow, setEyebrow] = useState("")
  const [category, setCategory] = useState<ProgramCategory>("service")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState("")
  const [revision, setRevision] = useState(1)
  const [sections, setSections] = useState<ProgramSection[]>([])

  const [editorialHero, setEditorialHero] = useState<ProgramDocument["hero"]>({ title: "", description: "", actions: [] })
  const [editorKey, setEditorKey] = useState(0)

  // Hero fields
  const [heroTitle, setHeroTitle] = useState("")
  const [heroDescription, setHeroDescription] = useState("")
  const [heroCtaLabel, setHeroCtaLabel] = useState("")
  const [heroCtaUrl, setHeroCtaUrl] = useState("")
  const [heroSecondaryCtaLabel, setHeroSecondaryCtaLabel] = useState("")
  const [heroSecondaryCtaUrl, setHeroSecondaryCtaUrl] = useState("")
  const [heroNoteText, setHeroNoteText] = useState("")
  const [heroNoteIcon, setHeroNoteIcon] = useState("")
  const [heroStickerText, setHeroStickerText] = useState("")
  const [heroStickerIcon, setHeroStickerIcon] = useState("")
  const [heroPhotoNote, setHeroPhotoNote] = useState("")
  const [heroImage, setHeroImage] = useState<ProgramDocument["hero"]["image"]>(undefined)

  // SEO fields
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const initialSnapshotRef = useRef<string>("")
  const latestSnapshotRef = useRef<string>("")

  // Confirm dialog state
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: "", description: "", confirmLabel: "", variant: "danger", onConfirm: () => {},
  })

  function openConfirm(opts: Omit<ConfirmState, "open">) {
    setConfirm({ ...opts, open: true })
  }

  // Publish readiness state
  const [publishOpen, setPublishOpen] = useState(false)

  function checkPublishReadiness(): ReadinessIssue[] {
    const issues: ReadinessIssue[] = []
    const validation = programDocumentSchema.safeParse(buildDoc())
    if (!validation.success) for (const issue of validation.error.issues) issues.push({ type: "error", message: `${issue.path.join(".")}: ${issue.message}` })
    if (!title.trim()) issues.push({ type: "error", message: "Title is required" })
    if (!shortDescription.trim()) issues.push({ type: "error", message: "Short description is required" })
    const visibleHeroImage = category === "service" ? heroImage : editorialHero.image
    if (category !== "research" && !visibleHeroImage?.url && !visibleHeroImage?.assetId) issues.push({ type: "warning", message: "Hero image is not set — the page will have no hero visual" })
    if (!seoTitle.trim()) issues.push({ type: "warning", message: "Meta title is missing — defaults to program title" })
    if (!seoDescription.trim()) issues.push({ type: "warning", message: "Meta description is missing — hurts SEO" })
    if (sections.filter((s) => s.enabled).length === 0) issues.push({ type: "warning", message: "No enabled sections — the page body will be empty" })
    const emptySections = sections.filter((s) => s.enabled && !s.heading && !s.intro && !s.description)
    if (emptySections.length > 0) issues.push({ type: "warning", message: `${emptySections.length} section${emptySections.length > 1 ? "s have" : " has"} no heading or intro text` })
    return issues
  }

  // Track dirty state by comparing current form to initial snapshot
  useEffect(() => {
    if (loading || !initialSnapshotRef.current) return
    const current = formSnapshot({
      title, shortDescription, eyebrow, category, tags,
      heroTitle, heroDescription, heroCtaLabel, heroCtaUrl, editorialHero,
      heroSecondaryCtaLabel, heroSecondaryCtaUrl,
      heroNoteText, heroNoteIcon, heroStickerText, heroStickerIcon, heroPhotoNote,
      heroImage,
      seoTitle, seoDescription, sections,
    })
    latestSnapshotRef.current = current
    setIsDirty(current !== initialSnapshotRef.current)
  }, [title, shortDescription, eyebrow, category, tags,
    heroTitle, heroDescription, heroCtaLabel, heroCtaUrl, editorialHero,
    heroSecondaryCtaLabel, heroSecondaryCtaUrl,
    heroNoteText, heroNoteIcon, heroStickerText, heroStickerIcon, heroPhotoNote,
    heroImage,
    seoTitle, seoDescription, sections, loading])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    const id = routeProgramId
    async function loadDraft() {
      setProgramId(id)
      const result = await getProgramDraft(id)
      if (!result.ok) {
        notifications.showError({ title: "Failed to load", description: result.error })
        setLoading(false)
        return
      }
      const { program, draft } = result.data
      setTitle(program.title)
      setShortDescription(program.short_description || "")
      setEyebrow(program.eyebrow || "")
      setCategory(program.category || "service")
      setSlug(program.slug || "")
      setTags(program.tags || [])
      setStatus(program.status)
      setRevision(draft.revision)
      setSections((draft.sections as ProgramSection[]) || [])

      // Load hero from draft
      const hero = readEditorHero(draft.hero, program.title, program.short_description || "")
      setEditorialHero(readEditorHero(hero, program.title, program.short_description || ""))
      if (hero) {
        setHeroTitle(hero.title || "")
        setHeroDescription(hero.description || "")
        setHeroCtaLabel(readEditorHero(hero, "", "").actions[0]?.label || "")
        setHeroCtaUrl(readEditorHero(hero, "", "").actions[0]?.url || "")
        setHeroSecondaryCtaLabel(readEditorHero(hero, "", "").actions[1]?.label || "")
        setHeroSecondaryCtaUrl(readEditorHero(hero, "", "").actions[1]?.url || "")
        setHeroNoteText(hero.note?.text || "")
        setHeroNoteIcon(hero.note?.icon || "")
        setHeroStickerText(hero.sticker?.text || "")
        setHeroStickerIcon(hero.sticker?.icon || "")
        setHeroPhotoNote(hero.photoNote || "")
        if (hero.image && typeof hero.image === "object" && (hero.image.url || hero.image.assetId)) {
          setHeroImage({ ...hero.image, alt: hero.image.alt || hero.title || "" })
        } else if (hero.image && typeof hero.image === "string" && hero.image) {
          setHeroImage({ url: hero.image, alt: hero.title || "" })
        }
      } else {
        setHeroTitle(program.title)
        setHeroDescription(program.short_description || "")
      }

      setSeoTitle(draft.seo_title || "")
      setSeoDescription(draft.seo_description || "")
      setLoading(false)

      setTimeout(() => {
        const hero = readEditorHero(draft.hero, program.title, program.short_description || "")
        let heroImg = undefined
        if (hero.image && typeof hero.image === "object" && (hero.image.url || hero.image.assetId)) {
          heroImg = { ...hero.image, alt: hero.image.alt || hero.title || "" }
        } else if (hero.image && typeof hero.image === "string" && hero.image) {
          heroImg = { url: hero.image, alt: hero.title || "" }
        }
        initialSnapshotRef.current = formSnapshot({
          title: program.title,
          shortDescription: program.short_description || "",
          eyebrow: program.eyebrow || "",
          category: program.category || "service",
          tags: program.tags || [],
          editorialHero: readEditorHero(hero, program.title, program.short_description || ""),
          heroTitle: hero.title || "",
          heroDescription: hero.description || "",
          heroCtaLabel: readEditorHero(hero, "", "").actions[0]?.label || "",
          heroCtaUrl: readEditorHero(hero, "", "").actions[0]?.url || "",
          heroSecondaryCtaLabel: readEditorHero(hero, "", "").actions[1]?.label || "",
          heroSecondaryCtaUrl: readEditorHero(hero, "", "").actions[1]?.url || "",
          heroNoteText: hero.note?.text || "",
          heroNoteIcon: hero.note?.icon || "",
          heroStickerText: hero.sticker?.text || "",
          heroStickerIcon: hero.sticker?.icon || "",
          heroPhotoNote: hero.photoNote || "",
          heroImage: heroImg,
          seoTitle: draft.seo_title || "",
          seoDescription: draft.seo_description || "",
          sections: (draft.sections as ProgramSection[]) || [],
        })
      }, 0)
    }
    void loadDraft()
  }, [routeProgramId])

  function resetSnapshot() {
    initialSnapshotRef.current = formSnapshot({
      title, shortDescription, eyebrow, category, tags,
      heroTitle, heroDescription, heroCtaLabel, heroCtaUrl, editorialHero,
      heroSecondaryCtaLabel, heroSecondaryCtaUrl,
      heroNoteText, heroNoteIcon, heroStickerText, heroStickerIcon, heroPhotoNote,
      heroImage,
      seoTitle, seoDescription, sections,
    })
    setIsDirty(latestSnapshotRef.current !== initialSnapshotRef.current)
  }

  function buildDoc(): ProgramDocument {
    return {
      schemaVersion: 1,
      title,
      shortDescription: shortDescription || title,
      eyebrow: eyebrow || undefined,
      category,
      tags,
      hero: category !== "service" ? { ...editorialHero, actions: editorialHero.actions.filter(action => action.label.trim() || action.url.trim()) } : {
        title: heroTitle || title,
        description: heroDescription || shortDescription || title,
        image: heroImage,
        actions: heroCtaLabel && heroCtaUrl
          ? [{ label: heroCtaLabel, url: heroCtaUrl, variant: "primary" }, ...(heroSecondaryCtaLabel && heroSecondaryCtaUrl ? [{ label: heroSecondaryCtaLabel, url: heroSecondaryCtaUrl, variant: "secondary" as const }] : [])]
          : [],
        note: heroNoteText ? { text: heroNoteText, icon: heroNoteIcon || undefined } : undefined,
        sticker: heroStickerText ? { text: heroStickerText, icon: heroStickerIcon || undefined } : undefined,
        photoNote: heroPhotoNote || undefined,
      },
      seo: {
        title: seoTitle || undefined,
        description: seoDescription || undefined,
      },
      sections,
      relatedProgramIds: [],
    }
  }

  function changeCategory(value: ProgramCategory) {
    const hero = buildDoc().hero
    setEditorialHero(hero)
    setHeroTitle(hero.title)
    setHeroDescription(hero.description)
    setHeroImage(hero.image)
    setHeroCtaLabel(hero.actions[0]?.label || "")
    setHeroCtaUrl(hero.actions[0]?.url || "")
    setHeroSecondaryCtaLabel(hero.actions[1]?.label || "")
    setHeroSecondaryCtaUrl(hero.actions[1]?.url || "")
    setHeroNoteText(hero.note?.text || "")
    setHeroNoteIcon(hero.note?.icon || "")
    setHeroStickerText(hero.sticker?.text || "")
    setHeroStickerIcon(hero.sticker?.icon || "")
    setHeroPhotoNote(hero.photoNote || "")
    setCategory(value)
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 20) {
      setTags([...tags, t])
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  // ── Actions ───────────────────────────────────────────────

  async function handlePreview() {
    if (!programId) return
    setSaving(true)
    const saveResult = await updateProgramDraft(programId, buildDoc(), revision)
    setSaving(false)
    if (!saveResult.ok) {
      notifications.showError({ title: "Save failed", description: saveResult.error })
      return
    }
    setRevision(saveResult.data.revision)
    setLastSavedAt(new Date())
    resetSnapshot()
    notifications.showSuccess({ description: "Draft saved — opening preview" })
    window.open(`/admin/programs/${programId}/preview`, "_blank")
  }

  async function handleSave() {
    if (!programId) return
    setSaving(true)
    const result = await updateProgramDraft(programId, buildDoc(), revision)
    setSaving(false)
    if (!result.ok) {
      notifications.showError({ title: "Save failed", description: result.error })
      return
    }
    setRevision(result.data.revision)
    setLastSavedAt(new Date())
    resetSnapshot()
    notifications.showSuccess({ description: "Draft saved" })
  }

  async function handlePublish() {
    setPublishOpen(true)
  }

  async function doPublish() {
    if (!programId) return
    setPublishing(true)
    const saveResult = await updateProgramDraft(programId, buildDoc(), revision)
    if (!saveResult.ok) {
      notifications.showError({ title: "Save failed", description: saveResult.error })
      setPublishing(false)
      return
    }
    setRevision(saveResult.data.revision)
    resetSnapshot()

    const result = await publishProgram(programId, "Published from editor", saveResult.data.revision)
    setPublishing(false)
    if (!result.ok) {
      notifications.showError({ title: "Publish failed", description: result.error })
      return
    }
    setStatus("published")
    notifications.showSuccess({ description: `Published as version ${result.data.versionNumber}` })
  }

  async function handleUnpublish() {
    if (!programId) return
    openConfirm({
      title: "Unpublish program?",
      description: "This program will no longer be visible publicly. You can re-publish it later.",
      confirmLabel: "Unpublish",
      variant: "warning",
      onConfirm: async () => {
        const result = await unpublishProgram(programId!)
        if (!result.ok) {
          notifications.showError({ title: "Unpublish failed", description: result.error })
          return
        }
        setStatus("draft")
        notifications.showSuccess({ description: "Program unpublished" })
      },
    })
  }

  async function handleArchive() {
    if (!programId) return
    openConfirm({
      title: "Archive program?",
      description: "This program will be moved to archive. You can restore it later from the archive.",
      confirmLabel: "Archive",
      variant: "warning",
      onConfirm: async () => {
        const result = await archiveProgram(programId!)
        if (!result.ok) {
          notifications.showError({ title: "Archive failed", description: result.error })
          return
        }
        setStatus("archived")
        notifications.showSuccess({ description: "Program archived" })
      },
    })
  }

  async function handleRestore() {
    if (!programId) return
    const result = await restoreProgram(programId)
    if (!result.ok) {
      notifications.showError({ title: "Restore failed", description: result.error })
      return
    }
    setStatus("draft")
    notifications.showSuccess({ description: "Restored to draft" })
  }

  async function handleDelete() {
    if (!programId) return
    openConfirm({
      title: "Delete program permanently?",
      description: "This will permanently delete the program and all its content. This action is irreversible.",
      confirmLabel: "Delete permanently",
      variant: "danger",
      onConfirm: async () => {
        const result = await deleteProgram(programId!)
        if (!result.ok) {
          notifications.showError({ title: "Delete failed", description: result.error })
          return
        }
        notifications.showSuccess({ description: "Program deleted" })
        router.push("/admin/programs")
      },
    })
  }

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return <ProgramEditSkeleton />
  }

  const statusVariant = status === "published" ? "default" : status === "archived" ? "secondary" : "outline"

  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 -mx-6 border-b bg-background/95 px-6 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/admin/programs"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{title || "Untitled Program"}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={statusVariant} className="text-[10px]">{status}</Badge>
                <span>v{revision}</span>
                {isDirty && <span className="text-amber-600">Unsaved</span>}
                {lastSavedAt && !isDirty && <span>Saved {lastSavedAt.toLocaleTimeString()}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handlePreview} disabled={saving || publishing} className="text-xs gap-1">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || publishing || !isDirty} className="text-xs gap-1">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}Save
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={publishing || saving || status === "archived"} className="text-xs gap-1 bg-green-600 hover:bg-green-700">
              {publishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
              {status === "published" ? "Update" : "Publish"}
            </Button>
            {status === "published" && (
              <Button variant="ghost" size="sm" onClick={handleUnpublish} className="text-xs gap-1 text-amber-600 hover:text-amber-700">
                <GlobeOff className="h-3 w-3" />Unpublish
              </Button>
            )}
            <div className="h-5 w-px bg-border mx-1" />
            {status !== "archived" ? (
              <Button variant="ghost" size="sm" onClick={handleArchive} className="text-xs gap-1">
                <Archive className="h-3 w-3" />Archive
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleRestore} className="text-xs gap-1">
                <RotateCcw className="h-3 w-3" />Restore
              </Button>
            )}
            {status !== "published" && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-xs gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Program Info — full width */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-xs text-muted-foreground">Title</Label>
              <span className={`text-[10px] tabular-nums ${title.length > 120 ? "text-destructive" : title.length > 100 ? "text-amber-500" : "text-muted-foreground/50"}`}>{title.length}/120</span>
            </div>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="text-lg font-semibold h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={changeCategory}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[280px_1fr]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="eyebrow" className="text-xs text-muted-foreground">Eyebrow</Label>
              <span className={`text-[10px] tabular-nums ${eyebrow.length > 120 ? "text-destructive" : eyebrow.length > 100 ? "text-amber-500" : "text-muted-foreground/50"}`}>{eyebrow.length}/120</span>
            </div>
            <Input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="SERVICES & PROGRAMS" maxLength={120} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Short Description</Label>
              <span className={`text-[10px] tabular-nums ${shortDescription.length > 400 ? "text-destructive" : shortDescription.length > 320 ? "text-amber-500" : "text-muted-foreground/50"}`}>{shortDescription.length}/400</span>
            </div>
            <textarea id="description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={400} rows={1} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[38px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tags</Label>
            <div className="flex gap-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                maxLength={40}
                className="h-9 text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
              />
              <Button variant="outline" size="icon" onClick={addTag} disabled={!tagInput.trim()} className="h-9 w-9 shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-[11px]">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {/* SEO Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title" className="text-xs text-muted-foreground">Meta Title</Label>
              <span className={`text-[10px] tabular-nums ${seoTitle.length > 160 ? "text-destructive" : seoTitle.length > 128 ? "text-amber-500" : "text-muted-foreground/50"}`}>{seoTitle.length}/160</span>
            </div>
            <Input id="seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to program title" maxLength={160} className="h-9 text-sm" />
          </div>
          {/* SEO Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-desc" className="text-xs text-muted-foreground">Meta Description</Label>
              <span className={`text-[10px] tabular-nums ${seoDescription.length > 320 ? "text-destructive" : seoDescription.length > 256 ? "text-amber-500" : "text-muted-foreground/50"}`}>{seoDescription.length}/320</span>
            </div>
            <Input id="seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="For search results" maxLength={320} className="h-9 text-sm" />
          </div>
        </div>
      </div>

      {/* Hero — hidden for template-based categories (handled by their respective forms) */}
      {!(["service", "outreach", "research", "campaign"] as ProgramCategory[]).includes(category) && (
        <details open className="rounded-lg border bg-card">
          <summary className="px-5 py-3 text-sm font-medium cursor-pointer select-none hover:bg-muted/50 transition-colors">Hero Section</summary>
          <div className="border-t px-5 py-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="hero-title" className="text-xs text-muted-foreground">Title</Label>
                <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Defaults to program title" maxLength={180} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hero-desc" className="text-xs text-muted-foreground">Description</Label>
                <Input id="hero-desc" value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} placeholder="Defaults to short description" maxLength={800} className="h-8 text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="hero-cta-label" className="text-xs text-muted-foreground">Button Text</Label>
                <Input id="hero-cta-label" value={heroCtaLabel} onChange={(e) => setHeroCtaLabel(e.target.value)} placeholder="Find support" maxLength={80} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hero-cta-url" className="text-xs text-muted-foreground">Button URL</Label>
                <Input id="hero-cta-url" value={heroCtaUrl} onChange={(e) => setHeroCtaUrl(e.target.value)} placeholder="/whatwedo/program-slug" maxLength={500} className="h-8 text-sm font-mono" />
              </div>
            </div>
          </div>
        </details>
      )}

      {/* Content Sections — full width */}
      <div className="rounded-lg border bg-card">
        <div className="px-5 py-3 border-b">
          <h2 className="text-sm font-medium">Page Content</h2>
        </div>
        <div className="p-5">
          {programId ? (
            <ProgramIdProvider programId={programId}>
              {category === "service" ? (
                <ServiceEditForm
                  data={{ hero: { title: heroTitle || title, description: heroDescription || shortDescription || title, image: heroImage, actions: heroCtaLabel && heroCtaUrl ? [{ label: heroCtaLabel, url: heroCtaUrl, variant: "primary" }, ...(heroSecondaryCtaLabel && heroSecondaryCtaUrl ? [{ label: heroSecondaryCtaLabel, url: heroSecondaryCtaUrl, variant: "secondary" as const }] : [])] : [], note: heroNoteText ? { text: heroNoteText, icon: heroNoteIcon || undefined } : undefined, sticker: heroStickerText ? { text: heroStickerText, icon: heroStickerIcon || undefined } : undefined, photoNote: heroPhotoNote || undefined }, eyebrow, shortDescription, sections }}
                  onChange={(data) => {
                    setHeroTitle(data.hero.title)
                    setHeroDescription(data.hero.description)
                    setHeroImage(data.hero.image)
                    if (data.hero.actions?.[0]) { setHeroCtaLabel(data.hero.actions[0].label); setHeroCtaUrl(data.hero.actions[0].url) }
                    if (data.hero.actions?.[1]) { setHeroSecondaryCtaLabel(data.hero.actions[1].label); setHeroSecondaryCtaUrl(data.hero.actions[1].url) }
                    setHeroNoteText(data.hero.note?.text || "")
                    setHeroNoteIcon(data.hero.note?.icon || "")
                    setHeroStickerText(data.hero.sticker?.text || "")
                    setHeroStickerIcon(data.hero.sticker?.icon || "")
                    setHeroPhotoNote(data.hero.photoNote || "")
                    setEyebrow(data.eyebrow)
                    setShortDescription(data.shortDescription)
                    setSections(data.sections)
                  }}
                />
              ) : (
                <EditorialProgramEditor
                  key={editorKey}
                  programId={programId}
                  category={category}
                  data={{ hero: editorialHero, eyebrow, shortDescription, sections }}
                  onSectionsChange={setSections}
                  onChange={(data) => {
                    setEditorialHero(data.hero)
                    setHeroImage(data.hero.image)
                    setHeroTitle(data.hero.title)
                    setHeroDescription(data.hero.description)
                    setEyebrow(data.eyebrow)
                    setShortDescription(data.shortDescription)
                  }}
                />
              )}
            </ProgramIdProvider>
          ) : null}
        </div>
      </div>

      {/* Media Library */}
      {programId && <ProgramMediaLibrary programId={programId} />}

      {/* Version History */}
      {programId && (
        <VersionHistoryPanel
          programId={programId}
          currentRevision={revision}
          onRestored={() => { window.location.reload() }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog state={confirm} onClose={() => setConfirm((s) => ({ ...s, open: false }))} />

      {/* Publish Readiness Dialog */}
      <PublishConfirmDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublish={doPublish}
        title={title}
        slug={slug}
        category={category}
        heroImage={category === "service" ? heroImage : editorialHero.image}
        sections={sections}
        seoTitle={seoTitle}
        seoDescription={seoDescription}
        tags={tags}
        revision={revision}
        status={status}
        issues={checkPublishReadiness()}
      />
    </div>
  )
}
