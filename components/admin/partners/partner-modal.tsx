"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Upload,
  Link2,
  ExternalLink,
  Sparkles,
  Loader2,
  Maximize2,
  Handshake,
  Heart,
  Globe,
  Calendar,
  Check,
} from "lucide-react"
import {
  savePartnerAction,
  promotePartnerToGlobalAction,
  type PartnerWithUsage,
  type EventOption,
} from "@/lib/actions/admin-partners"
import { DEFAULT_EVENT_CATEGORIES } from "@/lib/types/partners"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

export type LogoFitOption =
  | "auto"
  | "wide"
  | "square"
  | "boost"
  | "boost-large"
  | "boost-xl"
  | "boost-2x"
  | "boost-75"
  | "boost-100"

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
  partner: PartnerWithUsage | null
  onSaved: (partner: PartnerWithUsage) => void
  events?: EventOption[]
  defaultScope?: "global" | "event"
  defaultEventId?: string
}

function parsePartnerDescription(descriptionStr?: string | null): { text: string; logoFit: LogoFitOption } {
  if (!descriptionStr) return { text: "", logoFit: "auto" }
  try {
    if (descriptionStr.startsWith("{")) {
      const parsed = JSON.parse(descriptionStr)
      return {
        text: parsed.text || "",
        logoFit: (parsed.logoFit as LogoFitOption) || "auto",
      }
    }
    if (descriptionStr.includes("fit:")) {
      const match = descriptionStr.match(/fit:([a-z0-9-]+)/)
      return {
        text: descriptionStr,
        logoFit: (match ? match[1] : "auto") as LogoFitOption,
      }
    }
  } catch {
    // fallback
  }
  return { text: descriptionStr, logoFit: "auto" }
}

function PartnerModalForm({
  partner,
  onClose,
  onSaved,
  events = [],
  defaultScope = "global",
  defaultEventId = "",
}: {
  partner: PartnerWithUsage | null
  onClose: () => void
  onSaved: (partner: PartnerWithUsage) => void
  events?: EventOption[]
  defaultScope?: "global" | "event"
  defaultEventId?: string
}) {
  const initialParsed = parsePartnerDescription(partner?.description)

  const [name, setName] = useState(partner?.name || "")
  const [type, setType] = useState<"partner" | "donor" | "sponsor">(partner?.type || "partner")
  const [website, setWebsite] = useState(partner?.website || "")
  const [description, setDescription] = useState(initialParsed.text)
  const [logo, setLogo] = useState(partner?.logo || "")
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(partner?.logo_storage_path || null)
  const [logoFit, setLogoFit] = useState<LogoFitOption>(initialParsed.logoFit)
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">(
    partner?.logo && !partner.logo.includes("supabase.co") ? "url" : "upload"
  )
  const [isPublished, setIsPublished] = useState(partner?.is_published ?? true)

  // Scope states
  const isExistingEventPartner = partner?.created_context_type === "event"
  const [partnerScope, setPartnerScope] = useState<"global" | "event">(
    partner ? (isExistingEventPartner ? "event" : "global") : defaultScope
  )
  const [eventTargetId, setEventTargetId] = useState<string>(
    partner?.created_context_id || defaultEventId || events[0]?.id || ""
  )
  const [categoryKey, setCategoryKey] = useState<string>(
    partner?.event_links?.[0]?.category_key || DEFAULT_EVENT_CATEGORIES[0]?.category_key || "organizers"
  )
  const [isPromoting, setIsPromoting] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Logo file upload handler using Supabase storage
  const handleFileUpload = async (file: File) => {
    const MAX_SIZE_MB = 2
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

    if (!ALLOWED_TYPES.includes(file.type)) {
      notifications.showError({ description: "Please upload a PNG, JPG, WebP, or SVG logo." })
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      notifications.showError({ description: `Logo exceeds ${MAX_SIZE_MB}MB size limit.` })
      return
    }

    setIsUploading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png"
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `partners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("partner-logos")
        .upload(filePath, file, { cacheControl: "3600", upsert: false })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        notifications.showError({ description: "Failed to upload logo to storage." })
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("partner-logos").getPublicUrl(filePath)

      setLogo(publicUrl)
      setLogoStoragePath(filePath)
      notifications.showSuccess({ description: "Logo uploaded successfully" })
    } catch (err) {
      console.error("Upload error:", err)
      notifications.showError({ description: "Error uploading logo." })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const normalizedWebsite = website.trim()
    ? /^https?:\/\//i.test(website.trim())
      ? website.trim()
      : `https://${website.trim()}`
    : ""

  const handlePromoteToGlobal = async () => {
    if (!partner) return
    setIsPromoting(true)
    try {
      const res = await promotePartnerToGlobalAction(partner.id)
      if (res.success && res.data) {
        notifications.showSuccess({
          description: `“${partner.name}” is now promoted to a Global Foundation Partner!`,
        })
        const updated: PartnerWithUsage = {
          ...partner,
          created_context_type: null,
          created_context_id: null,
        }
        onSaved(updated)
        onClose()
      } else {
        notifications.showError({ description: res.error || "Failed to promote partner." })
      }
    } catch {
      notifications.showError({ description: "Error promoting partner to global." })
    } finally {
      setIsPromoting(false)
    }
  }

  // Submit save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      notifications.showError({ description: "Organization name is required." })
      return
    }

    const isEvent = partnerScope === "event"
    if (isEvent && !eventTargetId && events.length > 0) {
      notifications.showError({ description: "Please select a target event for this partner." })
      return
    }

    setIsSaving(true)

    // Pack description with logoFit metadata for visual fidelity
    const serializedDescription = JSON.stringify({
      text: description.trim(),
      logoFit,
    })

    const result = await savePartnerAction({
      id: partner?.id,
      name: trimmedName,
      type,
      website: normalizedWebsite || null,
      logo: logo.trim() || null,
      logo_storage_path: logoStoragePath,
      description: serializedDescription,
      is_published: isPublished,
      created_context_type: isEvent ? "event" : null,
      created_context_id: isEvent ? eventTargetId || null : null,
      category_key: isEvent ? categoryKey : null,
    })

    setIsSaving(false)

    if (result.success && result.data) {
      notifications.showSuccess({
        description: partner ? `Updated "${trimmedName}"` : `Added "${trimmedName}" to directory`,
      })
      onSaved(result.data as PartnerWithUsage)
      onClose()
    } else {
      notifications.showError({
        description: result.error || "Failed to save partner record",
      })
    }
  }

  // Helper for logo preview styles matching event editor
  const getLogoFitClass = () => {
    switch (logoFit) {
      case "wide":
        return "max-h-12 w-auto object-contain"
      case "square":
        return "h-16 w-16 object-contain"
      case "boost":
        return "scale-115 object-contain"
      case "boost-large":
        return "scale-125 object-contain"
      case "boost-xl":
        return "scale-140 object-contain"
      case "boost-2x":
        return "scale-150 object-contain"
      case "boost-75":
        return "scale-175 object-contain"
      case "boost-100":
        return "scale-[2] object-contain"
      default:
        return "max-h-14 max-w-full object-contain"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
      {/* ──────────────────────────────────────────
          SCOPE BANNER / SELECTOR
          ────────────────────────────────────────── */}
      {partner ? (
        isExistingEventPartner ? (
          <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/70 p-3.5 text-xs text-indigo-950 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-foreground">Event Partner</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/40"
                    >
                      {partner.event_links?.[0]?.category_label || "Event Alliance"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Associated with: <strong className="text-foreground">{partner.event_links?.[0]?.event_title || "Summit / Event"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {partner.event_links?.[0]?.event_id && (
                  <a
                    href={`/admin/events/${partner.event_links[0].event_id}/settings?tab=partners`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100 underline decoration-indigo-300"
                  >
                    <span>Event Settings</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handlePromoteToGlobal}
                  disabled={isPromoting}
                  className="h-7 text-xs font-semibold border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/40 cursor-pointer shadow-2xs"
                >
                  {isPromoting ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1 text-amber-500" />}
                  <span>Promote to Global</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground dark:border-primary/40 dark:bg-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                <Globe className="size-4" />
              </div>
              <div>
                <span className="font-bold text-foreground">Global Foundation Partner</span>
                <p className="text-[11px] text-muted-foreground">
                  Permanent alliance visible on About page, footer, and available to link in any event.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold border-primary/40 text-primary dark:border-primary/50 dark:text-primary bg-primary/10 dark:bg-primary/20"
            >
              Foundation Master
            </Badge>
          </div>
        )
      ) : (
        /* Create New Partner: Scope Selector */
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Directory Scope
            </Label>
            <span className="text-[11px] text-muted-foreground">Assign where this partner belongs</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPartnerScope("global")}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                partnerScope === "global"
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Globe className="size-4 shrink-0 mt-0.5 text-primary" />
              <div>
                <p className="text-xs font-bold text-foreground">Global Directory</p>
                <p className="text-[10px] text-muted-foreground">Foundation-wide, About, Footer</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPartnerScope("event")}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                partnerScope === "event"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                  : "border-border/70 bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Calendar className="size-4 shrink-0 mt-0.5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-foreground">Event Partner</p>
                <p className="text-[10px] text-muted-foreground">Attached to specific summit/event</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          EVENT SELECTION & CATEGORY (When Event Scoped)
          ────────────────────────────────────────── */}
      {partnerScope === "event" && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20 p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 text-xs font-semibold">
            <Calendar className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Event Assignment & Category Tier</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Target Event */}
            <div className="space-y-1">
              <Label htmlFor="event-target" className="text-xs font-medium">
                Target Event *
              </Label>
              <Select value={eventTargetId} onValueChange={setEventTargetId}>
                <SelectTrigger id="event-target" className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Choose Event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id} className="text-xs">
                      {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Category Tier */}
            <div className="space-y-1">
              <Label htmlFor="event-category" className="text-xs font-medium">
                Category Tier *
              </Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger id="event-category" className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Choose Category..." />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.category_key} value={cat.category_key} className="text-xs">
                      {cat.category_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          SECTION 1: CORE PARTNER DETAILS
          ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-12">
        <div className="space-y-1.5 sm:col-span-8">
          <Label htmlFor="partner-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Partner Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="partner-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. KU School of Education, GIZ, Social Artist Nepal"
            required
            className="h-10 text-sm font-medium shadow-2xs"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-4">
          <Label htmlFor="partner-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Partnership Type
          </Label>
          <Select value={type} onValueChange={(val: "partner" | "donor" | "sponsor") => setType(val)}>
            <SelectTrigger id="partner-type" className="h-10 text-sm capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partner" className="text-sm">
                <span className="flex items-center gap-2">
                  <Handshake className="size-3.5 text-primary" />
                  <span>Partner (Institutional)</span>
                </span>
              </SelectItem>
              <SelectItem value="sponsor" className="text-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-amber-600" />
                  <span>Sponsor (Corporate)</span>
                </span>
              </SelectItem>
              <SelectItem value="donor" className="text-sm">
                <span className="flex items-center gap-2">
                  <Heart className="size-3.5 text-emerald-600" />
                  <span>Donor (Philanthropic)</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          SECTION 2: WEBSITE URL (OPTIONAL)
          ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="partner-website" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Official Website (optional)
          </Label>
          {normalizedWebsite && (
            <a
              href={normalizedWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <span>Test Link</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="partner-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.org.np"
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────
          SECTION 3: LOGO ASSET & STUDIO
          (Matches /admin/events/[id]/settings partner tab)
          ────────────────────────────────────────── */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-slate-50/60 p-4 sm:p-5 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Partner Logo Asset
            </span>
          </div>

          {/* Upload method toggle */}
          <div className="inline-flex items-center rounded-lg border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setUploadMethod("upload")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
                uploadMethod === "upload"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              File Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("url")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
                uploadMethod === "url"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Image URL
            </button>
          </div>
        </div>

        {/* Method 1: Dropzone */}
        {uploadMethod === "upload" ? (
          <div className="space-y-2">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) handleFileUpload(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border/80 hover:border-primary/50 hover:bg-background/80"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-xs font-medium text-primary">Uploading logo to cloud...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 py-1 text-center">
                  <Upload className="size-5 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-semibold text-foreground">
                    Click to browse or drag and drop
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    SVG, PNG, JPG, or WebP up to 2MB (transparent PNG or SVG recommended)
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Method 2: Direct URL */
          <div className="space-y-1.5">
            <Label htmlFor="logo-url" className="text-xs text-muted-foreground">
              Direct Logo URL
            </Label>
            <Input
              id="logo-url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://example.org/images/logo.png"
              className="h-10 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Direct link to hosted SVG, WebP, or PNG logo</p>
          </div>
        )}

        {/* Live Logo Preview Box */}
        {logo && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/80 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-neutral-100/90 dark:bg-neutral-800/90 p-1.5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt="Logo preview"
                  className={cn("h-full w-full object-contain transition-transform", getLogoFitClass())}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Check className="size-3.5 text-primary" />
                  Logo Ready
                </span>
                <span className="text-[11px] text-muted-foreground block truncate max-w-[240px]">
                  {logo}
                </span>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
              onClick={() => {
                setLogo("")
                setLogoStoragePath(null)
              }}
            >
              Remove
            </Button>
          </div>
        )}

        {/* Logo Display Adjustment (Scale & Fit Options) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-primary" />
              <span>Logo Display Fit & Scale</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">Visual balance control</span>
          </div>

          <Select value={logoFit} onValueChange={(val: LogoFitOption) => setLogoFit(val)}>
            <SelectTrigger className="h-9 text-xs bg-background">
              <SelectValue placeholder="Auto-balance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" className="text-xs">
                Auto-balance (Smart Aspect Ratio Detection)
              </SelectItem>
              <SelectItem value="wide" className="text-xs">
                Wide / Panoramic Banner (e.g. NFDN, NDWA)
              </SelectItem>
              <SelectItem value="square" className="text-xs">
                Square / Compact Icon (e.g. e-Sewa, round badges)
              </SelectItem>
              <SelectItem value="boost" className="text-xs">
                Zoom In (+25% scale for small logos / whitespace borders)
              </SelectItem>
              <SelectItem value="boost-large" className="text-xs">
                Large Zoom (+50% scale for tiny emblems)
              </SelectItem>
              <SelectItem value="boost-xl" className="text-xs">
                Extra Large Zoom (+75% scale)
              </SelectItem>
              <SelectItem value="boost-2x" className="text-xs">
                Maximum Zoom (+100% / 2x scale)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Leave as <strong>Auto-balance</strong> for automatic sizing, or choose an override if the logo has excessive padding or needs custom scaling.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          SECTION 4: PARTNERSHIP NOTES / DESCRIPTION
          ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="partner-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Partnership Scope & Notes (optional)
        </Label>
        <Textarea
          id="partner-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the partnership scope, memorandums, or mutual program focus..."
          rows={3}
          className="text-xs resize-none"
        />
      </div>

      {/* ──────────────────────────────────────────
          SECTION 5: PUBLIC PUBLICATION TOGGLE
          ────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3.5">
        <div>
          <Label htmlFor="partner-published" className="text-xs font-bold text-foreground cursor-pointer">
            Public Publication Status
          </Label>
          <p className="text-[11px] text-muted-foreground">
            {isPublished
              ? "Live and visible across public directories and event rails"
              : "Hidden/draft, archived from public sections"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPublished ? "default" : "secondary"} className="text-xs capitalize">
            {isPublished ? "Published" : "Hidden"}
          </Badge>
          <Switch
            id="partner-published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────
          FOOTER ACTIONS
          ────────────────────────────────────────── */}
      <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 sm:flex-none h-10 px-4 font-medium"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || isUploading}
          className="flex-1 sm:flex-none h-10 px-5 sm:px-6 gap-2 font-semibold"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {partner ? "Save Changes" : partnerScope === "event" ? "Add Event Partner" : "Create Partner"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PartnerModal({
  isOpen,
  onClose,
  partner,
  onSaved,
  events,
  defaultScope,
  defaultEventId,
}: PartnerModalProps) {
  const isEventMode = partner?.created_context_type === "event" || defaultScope === "event"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl p-0 gap-0 rounded-2xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="border-b bg-gradient-to-r from-primary/15 via-background to-background p-5 sm:p-6 dark:from-primary/25">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary">
              {isEventMode ? <Calendar className="size-5" /> : <Building2 className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {partner
                  ? `Edit Partner: ${partner.name}`
                  : isEventMode
                  ? "Add Event Partner"
                  : "Add Partner Organization"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {partner
                  ? "Update partner details, category, logo image asset, and publication status."
                  : isEventMode
                  ? "Add a new partner logo and website link to display on this event's public page."
                  : "Register a new institutional ally, corporate sponsor, or funding donor."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Form keyed by partner id for clean state lifecycle */}
        <PartnerModalForm
          key={partner?.id || "new-partner"}
          partner={partner}
          onClose={onClose}
          onSaved={onSaved}
          events={events}
          defaultScope={defaultScope}
          defaultEventId={defaultEventId}
        />
      </DialogContent>
    </Dialog>
  )
}
