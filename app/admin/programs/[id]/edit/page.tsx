"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  GlobeOff,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Image as ImageIcon,
  Sliders,
  ExternalLink,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  programDocumentSchema,
  type ProgramDocument,
  type ProgramSection,
  type ProgramCategory,
} from "@/lib/programs/content"
import { ProgramIdProvider } from "@/components/admin/programs/sections/program-id-context"
import { ServiceEditForm } from "@/components/admin/programs/service-edit-form"
import { EditorialProgramEditor } from "@/components/admin/programs/editorial-program-editor"
import { readEditorHero } from "@/lib/programs/editor-hero"
import { ProgramMediaLibrary } from "@/components/admin/programs/sections/program-media-library"
import { VersionHistoryPanel } from "@/components/admin/programs/sections/version-history-panel"
import { ProgramEditSkeleton } from "@/components/admin/programs/program-edit-skeleton"
import { AssetPicker } from "@/components/admin/programs/sections/asset-picker"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "@/components/admin/programs/programs.module.css"

function formSnapshot(value: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
  )
}

const CATEGORIES: { value: ProgramCategory; label: string; colorClass: string }[] = [
  { value: "service", label: "Service Program", colorClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20" },
  { value: "campaign", label: "Advocacy Campaign", colorClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  { value: "outreach", label: "Fieldwork & Outreach", colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  { value: "research", label: "Research & Evidence", colorClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20" },
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
  danger: { iconBg: "bg-red-100", iconColor: "text-red-600", confirmBg: "bg-red-600", confirmHover: "hover:bg-red-700" },
  warning: { iconBg: "bg-amber-100", iconColor: "text-amber-600", confirmBg: "bg-amber-600", confirmHover: "hover:bg-amber-700" },
  info: { iconBg: "bg-blue-100", iconColor: "text-blue-600", confirmBg: "bg-blue-600", confirmHover: "hover:bg-blue-700" },
}

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const styleConfig = CONFIRM_STYLES[state.variant]

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
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${styleConfig.iconBg}`}>
              <AlertTriangle className={`size-5 ${styleConfig.iconColor}`} />
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
            className={`gap-2 text-white ${styleConfig.confirmBg} ${styleConfig.confirmHover}`}
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
  open,
  onClose,
  onPublish,
  title,
  slug,
  category,
  heroImage,
  sections,
  seoTitle,
  tags,
  revision,
  status,
  issues,
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
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Globe className="size-5" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <DialogTitle className="text-base font-bold">
                {status === "published" ? "Update Public Program?" : "Publish Program to Website?"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Review the production readiness checks below before releasing live.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Preview card */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">/whatwedo/{slug || "…"}</p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold capitalize shrink-0">
                {category}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${heroImage?.url || heroImage?.assetId ? "bg-emerald-500" : "bg-amber-500"}`} />
                Hero image {heroImage?.url || heroImage?.assetId ? "set" : "missing"}
              </span>
              <span>{enabledSections.length} section{enabledSections.length !== 1 ? "s" : ""}</span>
              <span>{seoTitle ? "SEO configured" : "No SEO title"}</span>
              {tags.length > 0 && <span>{tags.length} tag{tags.length !== 1 ? "s" : ""}</span>}
            </div>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    issue.type === "error"
                      ? "bg-red-50 border border-red-100 text-red-700"
                      : "bg-amber-50 border border-amber-100 text-amber-700"
                  }`}
                >
                  {issue.type === "error" ? (
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  )}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {issues.length === 0 && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              All production readiness checks passed seamlessly.
            </div>
          )}

          {/* Section list preview */}
          {enabledSections.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Active Sections to Publish ({enabledSections.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {enabledSections.map((s) => (
                  <Badge key={s.id} variant="secondary" className="text-[11px] font-mono">
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
            className="gap-2 text-white bg-emerald-600 hover:bg-emerald-700 font-semibold"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {status === "published" ? `Update as v${revision}` : `Publish as v${revision}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page Component ─────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState<"overview" | "sections" | "media" | "seo" | "publishing">("overview")

  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [eyebrow, setEyebrow] = useState("")
  const [category, setCategory] = useState<ProgramCategory>("service")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState("")
  const [revision, setRevision] = useState(1)
  const [sections, setSections] = useState<ProgramSection[]>([])

  const [editorialHero, setEditorialHero] = useState<ProgramDocument["hero"]>({
    title: "",
    description: "",
    actions: [],
  })
  const [editorKey] = useState(0)

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
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "danger",
    onConfirm: () => {},
  })

  function openConfirm(opts: Omit<ConfirmState, "open">) {
    setConfirm({ ...opts, open: true })
  }

  // Publish readiness state
  const [publishOpen, setPublishOpen] = useState(false)

  function checkPublishReadiness(): ReadinessIssue[] {
    const issues: ReadinessIssue[] = []
    const validation = programDocumentSchema.safeParse(buildDoc())
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        issues.push({ type: "error", message: `${issue.path.join(".")}: ${issue.message}` })
      }
    }
    if (!title.trim()) issues.push({ type: "error", message: "Program Title is required" })
    if (!shortDescription.trim()) issues.push({ type: "error", message: "Short description is required" })

    const visibleHeroImage = category === "service" ? heroImage : editorialHero.image
    if (category !== "research" && !visibleHeroImage?.url && !visibleHeroImage?.assetId) {
      issues.push({ type: "warning", message: "Hero image is not set — page will lack a cover visual" })
    }
    if (!seoTitle.trim()) issues.push({ type: "warning", message: "Meta title is missing — defaults to program title" })
    if (!seoDescription.trim()) issues.push({ type: "warning", message: "Meta description is missing — search engines won't have a snippet" })

    if (sections.filter((s) => s.enabled).length === 0) {
      issues.push({ type: "warning", message: "No enabled sections — the page body will be empty" })
    }
    const emptySections = sections.filter((s) => s.enabled && !s.heading && !s.intro && !s.description)
    if (emptySections.length > 0) {
      issues.push({
        type: "warning",
        message: `${emptySections.length} section${emptySections.length > 1 ? "s have" : " has"} no heading or intro text`,
      })
    }
    return issues
  }

  // Track dirty state
  useEffect(() => {
    if (loading || !initialSnapshotRef.current) return
    const current = formSnapshot({
      title,
      shortDescription,
      eyebrow,
      category,
      tags,
      heroTitle,
      heroDescription,
      heroCtaLabel,
      heroCtaUrl,
      editorialHero,
      heroSecondaryCtaLabel,
      heroSecondaryCtaUrl,
      heroNoteText,
      heroNoteIcon,
      heroStickerText,
      heroStickerIcon,
      heroPhotoNote,
      heroImage,
      seoTitle,
      seoDescription,
      sections,
    })
    latestSnapshotRef.current = current
    setIsDirty(current !== initialSnapshotRef.current)
  }, [
    title,
    shortDescription,
    eyebrow,
    category,
    tags,
    heroTitle,
    heroDescription,
    heroCtaLabel,
    heroCtaUrl,
    editorialHero,
    heroSecondaryCtaLabel,
    heroSecondaryCtaUrl,
    heroNoteText,
    heroNoteIcon,
    heroStickerText,
    heroStickerIcon,
    heroPhotoNote,
    heroImage,
    seoTitle,
    seoDescription,
    sections,
    loading,
  ])

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
        const heroData = readEditorHero(draft.hero, program.title, program.short_description || "")
        let heroImg = undefined
        if (heroData.image && typeof heroData.image === "object" && (heroData.image.url || heroData.image.assetId)) {
          heroImg = { ...heroData.image, alt: heroData.image.alt || heroData.title || "" }
        } else if (heroData.image && typeof heroData.image === "string" && heroData.image) {
          heroImg = { url: heroData.image, alt: heroData.title || "" }
        }
        initialSnapshotRef.current = formSnapshot({
          title: program.title,
          shortDescription: program.short_description || "",
          eyebrow: program.eyebrow || "",
          category: program.category || "service",
          tags: program.tags || [],
          editorialHero: readEditorHero(heroData, program.title, program.short_description || ""),
          heroTitle: heroData.title || "",
          heroDescription: heroData.description || "",
          heroCtaLabel: readEditorHero(heroData, "", "").actions[0]?.label || "",
          heroCtaUrl: readEditorHero(heroData, "", "").actions[0]?.url || "",
          heroSecondaryCtaLabel: readEditorHero(heroData, "", "").actions[1]?.label || "",
          heroSecondaryCtaUrl: readEditorHero(heroData, "", "").actions[1]?.url || "",
          heroNoteText: heroData.note?.text || "",
          heroNoteIcon: heroData.note?.icon || "",
          heroStickerText: heroData.sticker?.text || "",
          heroStickerIcon: heroData.sticker?.icon || "",
          heroPhotoNote: heroData.photoNote || "",
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
      title,
      shortDescription,
      eyebrow,
      category,
      tags,
      heroTitle,
      heroDescription,
      heroCtaLabel,
      heroCtaUrl,
      editorialHero,
      heroSecondaryCtaLabel,
      heroSecondaryCtaUrl,
      heroNoteText,
      heroNoteIcon,
      heroStickerText,
      heroStickerIcon,
      heroPhotoNote,
      heroImage,
      seoTitle,
      seoDescription,
      sections,
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
      hero:
        category !== "service"
          ? {
              ...editorialHero,
              actions: editorialHero.actions.filter((action) => action.label.trim() || action.url.trim()),
            }
          : {
              title: heroTitle || title,
              description: heroDescription || shortDescription || title,
              image: heroImage,
              actions:
                heroCtaLabel && heroCtaUrl
                  ? [
                      { label: heroCtaLabel, url: heroCtaUrl, variant: "primary" },
                      ...(heroSecondaryCtaLabel && heroSecondaryCtaUrl
                        ? [{ label: heroSecondaryCtaLabel, url: heroSecondaryCtaUrl, variant: "secondary" as const }]
                        : []),
                    ]
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
    notifications.showSuccess({ description: "Draft saved successfully" })
  }

  function handlePublish() {
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
    const result = await publishProgram(programId)
    setPublishing(false)
    if (!result.ok) {
      notifications.showError({ title: "Publish failed", description: result.error })
      return
    }
    setStatus("published")
    setRevision(result.data.versionNumber + 1)
    setLastSavedAt(new Date())
    resetSnapshot()
    notifications.showSuccess({
      title: "Program Published!",
      description: `“${title}” is live on /whatwedo/${slug} as v${result.data.versionNumber}`,
    })
  }

  async function handleUnpublish() {
    if (!programId) return
    openConfirm({
      title: "Unpublish program?",
      description: "This program will no longer be visible publicly. You can re-publish it at any time.",
      confirmLabel: "Unpublish",
      variant: "warning",
      onConfirm: async () => {
        const result = await unpublishProgram(programId!)
        if (!result.ok) {
          notifications.showError({ title: "Unpublish failed", description: result.error })
          return
        }
        setStatus("draft")
        notifications.showSuccess({ description: "Program unpublished to draft" })
      },
    })
  }

  async function handleArchive() {
    if (!programId) return
    openConfirm({
      title: "Archive program?",
      description: "This program will be archived and hidden from public search. You can restore it later.",
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
    notifications.showSuccess({ description: "Restored to draft status" })
  }

  async function handleDelete() {
    if (!programId) return
    openConfirm({
      title: "Delete program permanently?",
      description: "This will permanently delete the program and all its content blocks. This action is irreversible.",
      confirmLabel: "Delete permanently",
      variant: "danger",
      onConfirm: async () => {
        const result = await deleteProgram(programId!)
        if (!result.ok) {
          notifications.showError({ title: "Delete failed", description: result.error })
          return
        }
        notifications.showSuccess({ description: "Program deleted successfully" })
        router.push("/admin/programs")
      },
    })
  }

  if (loading) {
    return <ProgramEditSkeleton />
  }

  const activeCategoryObj = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
  const enabledSectionsCount = sections.filter((s) => s.enabled).length
  const issues = checkPublishReadiness()
  const readinessScore = Math.max(0, 100 - issues.filter((i) => i.type === "error").length * 30 - issues.filter((i) => i.type === "warning").length * 10)

  return (
    <div className={cn(styles.root, "space-y-6 pb-24")}>
      {/* BREADCRUMB & CONTEXT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b pb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/programs" className="hover:text-foreground transition-colors">
            Programs
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[240px] sm:max-w-md">
            {title || "Untitled Program"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 capitalize",
              status === "published"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : status === "draft"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {status}
          </Badge>
          <span className="text-xs font-mono font-medium text-muted-foreground">v{revision}</span>
        </div>
      </div>

      {/* DESKTOP STICKY HEADER & ACTION BAR (top-16) */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 backdrop-blur-md p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="h-9 px-2.5 text-xs text-muted-foreground shrink-0">
            <Link href="/admin/programs">
              <ArrowLeft className="size-4 mr-1.5" />
              Programs
            </Link>
          </Button>

          <span className="text-muted-foreground/30 hidden sm:inline">|</span>

          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 shrink-0 hidden sm:inline-flex", activeCategoryObj.colorClass)}>
              {activeCategoryObj.label}
            </Badge>

            <span className="font-bold text-sm truncate max-w-[160px] sm:max-w-xs md:max-w-sm hidden sm:inline">
              {title || "Untitled Program"}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[11px] font-semibold shrink-0 hidden md:inline-flex",
                isDirty
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              <span className={cn("size-1.5 rounded-full mr-1.5", isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              {isDirty ? "Unsaved edits" : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Up to date"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "published" && slug && (
            <Button variant="outline" size="sm" asChild className="h-10 text-xs px-3 hidden lg:inline-flex">
              <Link href={`/whatwedo/${slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1.5" />
                Live Page
              </Link>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            disabled={saving || publishing}
            className="h-10 px-3 text-xs hidden sm:inline-flex"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Eye className="size-3.5 mr-1.5" />}
            Preview
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={saving || publishing || !isDirty}
            className="h-10 px-3.5 text-xs sm:text-sm font-medium"
          >
            {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Save className="mr-1.5 size-3.5" />}
            Save
          </Button>

          <Button
            type="button"
            onClick={handlePublish}
            disabled={publishing || saving || status === "archived"}
            className="h-10 px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Globe className="mr-2 size-4" />
                {status === "published" ? "Update" : "Publish"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE FLOATING BOTTOM ACTION PILL */}
      {isDirty && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 p-3 rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 pl-1 min-w-0">
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">Unsaved edits</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="h-10 text-xs px-3 font-medium"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
              Save
            </Button>
            <Button
              className="h-10 text-xs px-4 font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePublish}
              disabled={publishing || saving}
            >
              <Globe className="size-3.5 mr-1.5" />
              Publish
            </Button>
          </div>
        </div>
      )}

      {/* HORIZONTALLY SCROLLABLE STUDIO TABS */}
      <Card className="border shadow-xs">
        <CardContent className="overflow-x-auto p-1.5 sm:p-2 scrollbar-none">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
            <TabsList
              aria-label="Program editor tabs"
              className={cn(
                styles.track,
                "flex h-auto w-max sm:w-full min-w-full sm:min-w-0 items-center justify-start gap-1 sm:gap-1.5 rounded-xl p-1"
              )}
            >
              <TabsTrigger
                value="overview"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <FileText className="size-4 shrink-0" />
                <span>Overview &amp; Hero</span>
              </TabsTrigger>

              <TabsTrigger
                value="sections"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Layers className="size-4 shrink-0" />
                <span>Page Sections</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 font-semibold">
                  {enabledSectionsCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="media"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <ImageIcon className="size-4 shrink-0" />
                <span>Media Library</span>
              </TabsTrigger>

              <TabsTrigger
                value="seo"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Search className="size-4 shrink-0" />
                <span>SEO &amp; Preview</span>
                {seoTitle && <span className="size-1.5 rounded-full bg-emerald-500" />}
              </TabsTrigger>

              <TabsTrigger
                value="publishing"
                className={cn(
                  styles.tab,
                  "h-11 sm:h-10 gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center shrink-0 flex-1"
                )}
              >
                <Sliders className="size-4 shrink-0" />
                <span>Publishing &amp; History</span>
                <span className="ml-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted/60">
                  {readinessScore}%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & HERO SECTION */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Identity Card */}
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b bg-card/60">
              <CardTitle className="text-base font-bold">Program Identity &amp; Classification</CardTitle>
              <CardDescription className="text-xs">
                Essential metadata that governs the initiative’s categorization and public header.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Title */}
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Program Title <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">{title.length}/120</span>
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    className="h-11 text-base font-semibold rounded-xl"
                  />
                </div>

                {/* Category Switcher */}
                <div className="sm:col-span-4 space-y-2">
                  <Label className="text-sm font-semibold">Initiative Category</Label>
                  <Select value={category} onValueChange={(val) => changeCategory(val as ProgramCategory)}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Eyebrow & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eyebrow" className="text-sm font-semibold">
                      Eyebrow Subheading
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">{eyebrow.length}/120</span>
                  </div>
                  <Input
                    id="eyebrow"
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="SERVICES & PROGRAMS"
                    maxLength={120}
                    className="h-11 text-sm rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-8 space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold">
                    Public Permalink Slug
                  </Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      value={slug}
                      readOnly
                      disabled
                      className="h-11 text-sm font-mono rounded-xl bg-muted/40 cursor-not-allowed pl-3"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    Public route: /whatwedo/{slug || "…"}
                  </p>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDescription" className="text-sm font-semibold">
                    Short Description / Summary <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">{shortDescription.length}/400</span>
                </div>
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={400}
                  rows={3}
                  className="flex w-full rounded-xl border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 leading-relaxed"
                  placeholder="Concise overview of the program for search results, index cards, and hero subtext..."
                />
              </div>

              {/* Tags Cloud */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Program Tags &amp; Keywords</Label>
                  <span className="text-xs text-muted-foreground font-mono">{tags.length}/20</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add keyword tag (e.g. speech-therapy)..."
                    maxLength={40}
                    className="h-10 text-sm rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="h-10 px-4 text-xs font-semibold shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Add Tag
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1.5 text-xs px-2.5 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive text-muted-foreground transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hero Visual & Action CTA Configuration */}
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b bg-card/60">
              <CardTitle className="text-base font-bold">Hero Showcase &amp; Call-To-Action</CardTitle>
              <CardDescription className="text-xs">
                Configure the primary visual asset, focal point, and action buttons shown at the top of the program page.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Asset Picker for Hero Image */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Hero Cover Visual</Label>
                {programId && (
                  <ProgramIdProvider programId={programId}>
                    <AssetPicker
                      assetId={category === "service" ? heroImage?.assetId || null : editorialHero.image?.assetId || null}
                      url={category === "service" ? heroImage?.url : editorialHero.image?.url}
                      alt={category === "service" ? heroImage?.alt || title : editorialHero.image?.alt || title}
                      label="Program Hero Cover Image"
                      onPick={(image) => {
                        if (category === "service") {
                          setHeroImage({ ...heroImage, ...image, alt: heroImage?.alt || title })
                        } else {
                          setEditorialHero({
                            ...editorialHero,
                            image: { ...editorialHero.image, ...image, alt: editorialHero.image?.alt || title },
                          })
                        }
                      }}
                      onClear={() => {
                        if (category === "service") setHeroImage(undefined)
                        else setEditorialHero({ ...editorialHero, image: undefined })
                      }}
                    />
                  </ProgramIdProvider>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                {/* Primary Button */}
                <div className="space-y-3 p-3.5 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <Label className="text-xs font-bold uppercase tracking-wider">Primary Button</Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Button Text (e.g. Enroll Now)"
                      value={heroCtaLabel}
                      onChange={(e) => setHeroCtaLabel(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                    <Input
                      placeholder="Button URL (e.g. /contact or /donate)"
                      value={heroCtaUrl}
                      onChange={(e) => setHeroCtaUrl(e.target.value)}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="space-y-3 p-3.5 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-muted-foreground" />
                    <Label className="text-xs font-bold uppercase tracking-wider">Secondary Button</Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Button Text (e.g. Download Brochure)"
                      value={heroSecondaryCtaLabel}
                      onChange={(e) => setHeroSecondaryCtaLabel(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                    />
                    <Input
                      placeholder="Button URL (e.g. /resources)"
                      value={heroSecondaryCtaUrl}
                      onChange={(e) => setHeroSecondaryCtaUrl(e.target.value)}
                      className="h-10 text-xs font-mono rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAGE SECTIONS & CONTENT */}
      {/* ========================================================================= */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b bg-card/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    {activeCategoryObj.label} Content Builder
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Custom blocks and interactive sections configured for this initiative.
                  </CardDescription>
                </div>
                <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5", activeCategoryObj.colorClass)}>
                  {activeCategoryObj.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {programId ? (
                <ProgramIdProvider programId={programId}>
                  {category === "service" ? (
                    <ServiceEditForm
                      data={{
                        hero: {
                          title: heroTitle || title,
                          description: heroDescription || shortDescription || title,
                          image: heroImage,
                          actions:
                            heroCtaLabel && heroCtaUrl
                              ? [
                                  { label: heroCtaLabel, url: heroCtaUrl, variant: "primary" },
                                  ...(heroSecondaryCtaLabel && heroSecondaryCtaUrl
                                    ? [{ label: heroSecondaryCtaLabel, url: heroSecondaryCtaUrl, variant: "secondary" as const }]
                                    : []),
                                ]
                              : [],
                          note: heroNoteText ? { text: heroNoteText, icon: heroNoteIcon || undefined } : undefined,
                          sticker: heroStickerText ? { text: heroStickerText, icon: heroStickerIcon || undefined } : undefined,
                          photoNote: heroPhotoNote || undefined,
                        },
                        eyebrow,
                        shortDescription,
                        sections,
                      }}
                      onChange={(data) => {
                        setHeroTitle(data.hero.title)
                        setHeroDescription(data.hero.description)
                        setHeroImage(data.hero.image)
                        if (data.hero.actions?.[0]) {
                          setHeroCtaLabel(data.hero.actions[0].label)
                          setHeroCtaUrl(data.hero.actions[0].url)
                        }
                        if (data.hero.actions?.[1]) {
                          setHeroSecondaryCtaLabel(data.hero.actions[1].label)
                          setHeroSecondaryCtaUrl(data.hero.actions[1].url)
                        }
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEDIA LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {programId && (
            <ProgramIdProvider programId={programId}>
              <ProgramMediaLibrary programId={programId} />
            </ProgramIdProvider>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEO & SEARCH PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === "seo" && (
        <div className="max-w-3xl space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b bg-card/60">
              <CardTitle className="text-base font-bold">Search Engine Optimization (SEO)</CardTitle>
              <CardDescription className="text-xs">
                Fine-tune meta tags for Google indexing, social media cards, and browser tabs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Google Search Result Snippet Preview Card */}
              <div className="p-4 rounded-xl border bg-card/70 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Google Search Snippet Preview
                </span>
                <p className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate cursor-pointer">
                  {seoTitle || title || "Program Title — Deesha Foundation"}
                </p>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate">
                  https://deeshafoundation.org/whatwedo/{slug || "program-slug"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {seoDescription || shortDescription || "Explore Deesha Foundation's community initiatives and evidence-based programs."}
                </p>
              </div>

              {/* Meta Title Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-title" className="text-sm font-semibold">
                    Meta Title
                  </Label>
                  <span className={cn("text-xs font-mono", seoTitle.length > 160 ? "text-destructive font-bold" : "text-muted-foreground")}>
                    {seoTitle.length}/160
                  </span>
                </div>
                <Input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to program title"
                  maxLength={160}
                  className="h-11 text-sm rounded-xl"
                />
              </div>

              {/* Meta Description Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-desc" className="text-sm font-semibold">
                    Meta Description
                  </Label>
                  <span className={cn("text-xs font-mono", seoDescription.length > 320 ? "text-destructive font-bold" : "text-muted-foreground")}>
                    {seoDescription.length}/320
                  </span>
                </div>
                <textarea
                  id="seo-desc"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Summary for search engines..."
                  maxLength={320}
                  rows={3}
                  className="flex w-full rounded-xl border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PUBLISHING & VERSION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "publishing" && (
        <div className="max-w-3xl space-y-6">
          {/* Production Readiness Checklist */}
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b bg-card/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Production Readiness Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Automated checklist verifying all required content before public release.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-mono font-bold px-2.5 py-1",
                    readinessScore === 100
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  )}
                >
                  {readinessScore}% Score
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {issues.length > 0 ? (
                <div className="space-y-2">
                  {issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-xl border text-xs",
                        issue.type === "error"
                          ? "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400"
                          : "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {issue.type === "error" ? (
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      )}
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="size-4 shrink-0" />
                  All production readiness checks passed! Ready for live broadcast.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publication Control Cards */}
          <Card className="border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b">
              <CardTitle className="text-base font-bold">Publication Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border bg-card">
                <div>
                  <p className="font-bold text-sm">Status: <span className="capitalize">{status}</span> (v{revision})</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {status === "published"
                      ? "Currently public on /whatwedo/" + slug
                      : "Saved in internal drafts. Hidden from public."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {status === "published" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUnpublish}
                      className="h-10 text-xs text-amber-600 hover:text-amber-700 font-semibold"
                    >
                      <GlobeOff className="size-3.5 mr-1.5" />
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing || saving || status === "archived"}
                      className="h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Globe className="size-3.5 mr-1.5" />
                      Publish Live
                    </Button>
                  )}

                  {status !== "archived" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleArchive}
                      className="h-10 text-xs"
                    >
                      <Archive className="size-3.5 mr-1.5" />
                      Archive
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRestore}
                      className="h-10 text-xs"
                    >
                      <RotateCcw className="size-3.5 mr-1.5" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History Panel */}
          {programId && (
            <VersionHistoryPanel
              programId={programId}
              currentRevision={revision}
              onRestored={() => {
                window.location.reload()
              }}
            />
          )}

          {/* Danger Zone */}
          {status !== "published" && (
            <Card className="border border-destructive/30 bg-destructive/5 shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-xs text-destructive/80">
                  Permanently delete this program draft and all associated content blocks from the database.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Permanently Delete Program
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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
