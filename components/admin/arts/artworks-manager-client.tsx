"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
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

type EditorState = { mode: "create" } | { mode: "edit"; row: ArtworkRow } | null

const ACCEPT = "image/jpeg,image/png,image/webp"

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
  const [editor, setEditor] = useState<EditorState>(null)
  const [pendingDelete, setPendingDelete] = useState<ArtworkRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => setRows(initialArtworks), [initialArtworks])

  const stats = useMemo(() => {
    const published = rows.filter((r) => r.is_published)
    return {
      total: rows.length,
      published: published.length,
      drafts: rows.length - published.length,
      onHomepage: Math.min(3, published.length),
      featured: published.filter((r) => r.is_featured).length,
    }
  }, [rows])

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
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artworks</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage the <strong>/arts</strong> gallery and the homepage art feature. The homepage shows the first three
            published works marked <em>Featured</em> (topped up with other published works if fewer are featured).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/arts" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              View gallery
            </Link>
          </Button>
          <Button onClick={() => setEditor({ mode: "create" })} disabled={Boolean(loadError)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add artwork
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Artworks couldn&apos;t be loaded.</p>
            <p className="mt-1">
              {loadError}. If this is a new environment, apply <code>scripts/db/migrations/063-artworks.sql</code> in
              this project&apos;s Supabase SQL editor.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loadError && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total", stats.total],
            ["Published", stats.published],
            ["Drafts", stats.drafts],
            ["Featured (published)", stats.featured],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-card p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-2xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* List */}
      {!loadError && rows.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">No artworks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload the first piece to start the gallery.</p>
          <Button className="mt-5" onClick={() => setEditor({ mode: "create" })}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add artwork
          </Button>
        </div>
      )}

      {rows.length > 0 && (
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Artworks in display order">
          {rows.map((row, index) => {
            const art = toArtwork(row)
            const busy = busyId === row.id && isPending
            return (
              <li
                key={row.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
                  !row.is_published && "border-dashed",
                )}
              >
                <div className="relative aspect-[4/3] bg-[#f6f2ec]">
                  {art && (
                    <Image
                      src={art.src}
                      alt={row.alt_text}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className={cn("object-contain p-3", !row.is_published && "opacity-70")}
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow-sm">
                    #{index + 1}
                  </span>
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {row.is_published ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {row.is_featured && (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        <Star className="mr-1 h-3 w-3 fill-current" aria-hidden="true" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="font-semibold leading-tight">{row.title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {row.artist_credit || `${ARTWORK_COLLECTION_CREDIT} (collection credit)`}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      <span className="font-medium">Alt:</span> {row.alt_text}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={row.is_published}
                        disabled={busy}
                        onCheckedChange={(value) => toggle(row, { is_published: value })}
                        aria-label={`Publish “${row.title}”`}
                      />
                      Published
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={row.is_featured}
                        disabled={busy}
                        onCheckedChange={(value) => toggle(row, { is_featured: value })}
                        aria-label={`Feature “${row.title}” on the homepage`}
                      />
                      Featured
                    </label>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || isPending}
                      aria-label={`Move “${row.title}” earlier`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1 || isPending}
                      aria-label={`Move “${row.title}” later`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Saving" />}
                    <div className="ml-auto flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setEditor({ mode: "edit", row })}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(row)}
                        aria-label={`Delete “${row.title}”`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <SectionTextEditor initialContent={initialContent} />

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

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this artwork?"
        description={`“${pendingDelete?.title ?? ""}” will be removed from the gallery and homepage. Uploaded image files are also removed when no other artwork uses them. This can't be undone.`}
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Create / edit dialog
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
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(existing?.title ?? "")
  const [credit, setCredit] = useState(existing?.artist_credit ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [alt, setAlt] = useState(existing?.alt_text ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ src: string; width: number; height: number } | null>(
    existingArt ? { src: existingArt.src, width: existingArt.width, height: existingArt.height } : null,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, startSaving] = useTransition()

  useEffect(() => {
    return () => {
      if (preview?.src.startsWith("blob:")) URL.revokeObjectURL(preview.src)
    }
  }, [preview])

  const pickFile = (picked: File | undefined) => {
    if (!picked) return
    const nextErrors = { ...errors }
    delete nextErrors.image
    if (!ACCEPT.split(",").includes(picked.type)) {
      setErrors({ ...nextErrors, image: "Choose a JPEG, PNG or WebP image." })
      return
    }
    if (picked.size > ARTWORK_MAX_UPLOAD_BYTES) {
      setErrors({ ...nextErrors, image: "Images must be 5 MB or smaller." })
      return
    }
    const url = URL.createObjectURL(picked)
    const probe = new window.Image()
    probe.onload = () => {
      if (Math.min(probe.naturalWidth, probe.naturalHeight) < ARTWORK_MIN_DIMENSION) {
        URL.revokeObjectURL(url)
        setErrors({ ...nextErrors, image: `Use an image at least ${ARTWORK_MIN_DIMENSION}px on the shortest side.` })
        return
      }
      setErrors(nextErrors)
      setFile(picked)
      setPreview({ src: url, width: probe.naturalWidth, height: probe.naturalHeight })
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setErrors({ ...nextErrors, image: "That file couldn't be read as an image." })
    }
    probe.src = url
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const local: Record<string, string> = {}
    if (!title.trim()) local.title = "Title is required."
    if (alt.trim().length < 5) local.alt_text = "Describe the artwork for screen reader users (at least 5 characters)."
    if (!existing && !file) local.image = "An image is required."
    if (Object.keys(local).length) return setErrors(local)

    const form = new FormData()
    form.set("title", title)
    form.set("artist_credit", credit)
    form.set("description", description)
    form.set("alt_text", alt)
    if (file) form.set("image", file)

    startSaving(async () => {
      const result = existing ? await updateArtwork(existing.id, form) : await createArtwork(form)
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        notifications.showError({ description: result.error })
        return
      }
      notifications.showSuccess({
        description: existing ? "Artwork saved." : "Artwork added as a draft. Publish it when you're ready.",
      })
      onSaved(result.data!, !existing)
    })
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} className="text-sm text-destructive">
        {errors[key]}
      </p>
    ) : null

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit artwork" : "Add artwork"}</DialogTitle>
          <DialogDescription>
            {existing
              ? "Changes appear on the homepage and /arts as soon as you save."
              : "New artworks are saved as drafts, so nothing goes public until you publish it."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]" noValidate>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="art-image">{existing ? "Replace image (optional)" : "Image"}</Label>
              <input
                ref={fileRef}
                id="art-image"
                type="file"
                accept={ACCEPT}
                className="sr-only"
                aria-describedby="art-image-help image-error"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={saving}>
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                {file ? "Choose a different file" : "Choose file"}
              </Button>
              <p id="art-image-help" className="text-xs text-muted-foreground">
                JPEG, PNG or WebP · up to 5 MB · at least {ARTWORK_MIN_DIMENSION}px on the shortest side. Uploaded to the
                site-assets library.
                {file && <span className="block font-medium text-foreground">Selected: {file.name}</span>}
              </p>
              {fieldError("image")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-title">Title</Label>
              <Input
                id="art-title"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {fieldError("title")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-credit">Artist credit</Label>
              <Input
                id="art-credit"
                value={credit}
                maxLength={120}
                placeholder={`${ARTWORK_COLLECTION_CREDIT} (used when empty)`}
                onChange={(e) => setCredit(e.target.value)}
                aria-describedby="art-credit-help"
              />
              <p id="art-credit-help" className="text-xs text-muted-foreground">
                Only name an individual artist once the family has confirmed who made the piece.
              </p>
              {fieldError("artist_credit")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-alt">Alt text (required)</Label>
              <Textarea
                id="art-alt"
                value={alt}
                rows={3}
                maxLength={300}
                onChange={(e) => setAlt(e.target.value)}
                aria-invalid={Boolean(errors.alt_text)}
                aria-describedby="art-alt-help alt_text-error"
              />
              <p id="art-alt-help" className="text-xs text-muted-foreground">
                Describe what the painting shows (subject, colours, mood). {alt.length}/300
              </p>
              {fieldError("alt_text")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-description">Description (optional)</Label>
              <Textarea
                id="art-description"
                value={description}
                rows={4}
                maxLength={1200}
                onChange={(e) => setDescription(e.target.value)}
                aria-describedby="art-description-help"
              />
              <p id="art-description-help" className="text-xs text-muted-foreground">
                Shown in the gallery viewer. Avoid personal or biographical details that haven&apos;t been confirmed.
              </p>
              {fieldError("description")}
            </div>
          </div>

          {/* Live preview matching the public gallery card */}
          <div>
            <p className="mb-2 text-sm font-medium">Gallery preview</p>
            <div className="rounded-3xl border bg-white p-2.5 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#f6f2ec]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob: previews can't go through next/image
                  <img src={preview.src} alt="" className="absolute inset-0 h-full w-full object-contain p-3" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="px-3 pb-2 pt-4">
                <p className="truncate font-marissa text-xl text-[#0B5F8A]">{title || "Artwork title"}</p>
                <p className="mt-1 font-comic text-xs uppercase tracking-[0.14em] text-slate-500">
                  {credit.trim() || ARTWORK_COLLECTION_CREDIT}
                </p>
              </div>
            </div>
            {preview && (
              <p className="mt-2 text-xs text-muted-foreground">
                {preview.width} × {preview.height}px · shown uncropped
              </p>
            )}
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? (file ? "Uploading…" : "Saving…") : existing ? "Save changes" : "Add as draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Section text (site_settings → arts_content)
// ---------------------------------------------------------------------------
type ContentField<G extends keyof ArtsContent> = { key: keyof ArtsContent[G] & string; label: string; long?: boolean }

const HOME_FIELDS: ContentField<"home">[] = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "heading", label: "Heading" },
  { key: "headingAccent", label: "Heading accent (blue, underlined)" },
  { key: "intro", label: "Intro", long: true },
  { key: "ctaLabel", label: "Button label" },
  { key: "creditLine", label: "Credit line" },
  { key: "badge", label: "Badge under the collage" },
]

const GALLERY_FIELDS: ContentField<"gallery">[] = [
  { key: "eyebrow", label: "Hero eyebrow" },
  { key: "heading", label: "Hero heading" },
  { key: "headingAccent", label: "Hero heading accent (blue, underlined)" },
  { key: "intro", label: "Hero intro", long: true },
  { key: "heroBadge", label: "Photo badge" },
  { key: "collectionHeading", label: "Collection heading" },
  { key: "collectionAccent", label: "Collection heading accent (blue)" },
  { key: "collectionIntro", label: "Collection intro", long: true },
]

function SectionTextEditor({ initialContent }: { initialContent: ArtsContent }) {
  const [content, setContent] = useState(initialContent)
  const [saved, setSaved] = useState(initialContent)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, startSaving] = useTransition()
  const dirty = JSON.stringify(content) !== JSON.stringify(saved)

  const set = <G extends keyof ArtsContent>(group: G, key: string, value: string) =>
    setContent((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
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
      notifications.showSuccess({ description: "Section text saved. The homepage and /arts are updated." })
    })
  }

  const renderGroup = <G extends keyof ArtsContent>(group: G, title: string, fields: ContentField<G>[]) => (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-sm font-semibold">{title}</legend>
      {fields.map((field) => {
        const id = `content-${group}-${field.key}`
        const errorKey = `${group}.${field.key}`
        const max = (ARTS_CONTENT_LIMITS[group] as Record<string, number>)[field.key]
        const value = (content[group] as Record<string, string>)[field.key]
        const Control = field.long ? Textarea : Input
        return (
          <div key={id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={id}>{field.label}</Label>
              <span className="text-xs text-muted-foreground">
                {value.length}/{max}
              </span>
            </div>
            <Control
              id={id}
              value={value}
              maxLength={max}
              {...(field.long ? { rows: 3 } : {})}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(group, field.key, e.target.value)}
              aria-invalid={Boolean(errors[errorKey])}
              aria-describedby={errors[errorKey] ? `${id}-error` : undefined}
            />
            {errors[errorKey] && (
              <p id={`${id}-error`} className="text-sm text-destructive">
                {errors[errorKey]}
              </p>
            )}
          </div>
        )
      })}
    </fieldset>
  )

  return (
    <section aria-labelledby="arts-copy-heading" className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <h2 id="arts-copy-heading" className="text-lg font-semibold">
        Section text
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Wording for the homepage art feature and the /arts page. Artworks above are managed separately.
      </p>
      <form onSubmit={submit} className="mt-5" noValidate>
        <div className="grid gap-8 lg:grid-cols-2">
          {renderGroup("home", "Homepage feature", HOME_FIELDS)}
          {renderGroup("gallery", "/arts page", GALLERY_FIELDS)}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setContent(saved)}>
            Discard changes
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {saving ? "Saving…" : "Save section text"}
          </Button>
        </div>
      </form>
    </section>
  )
}
