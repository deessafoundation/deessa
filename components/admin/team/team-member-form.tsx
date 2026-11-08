"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Star,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  ChevronDown,
  ArrowUpDown,
  Maximize2,
} from "lucide-react"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/actions/admin-team"
import { notifications } from "@/lib/notifications"
import { FileUpload } from "@/components/admin/media/file-upload"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import type { TeamMember } from "@/lib/types/admin"
import { TEAM_TIERS, TEAM_TIER_DETAILS, type TeamTier, type TeamTierMeta } from "@/lib/types/team-input"
import { useUnsavedChanges } from "@/components/admin/common/admin-navigation-guard"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"
import { cn } from "@/lib/utils"

interface TeamMemberFormProps {
  member?: TeamMember
}

// Crisp official social icons
const SOCIAL_ICONS: Record<string, { label: string; placeholder: string; svg: string }> = {
  linkedin: {
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    svg: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z",
  },
  twitter: {
    label: "Twitter / X",
    placeholder: "https://x.com/username",
    svg: "M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  },
  facebook: {
    label: "Facebook",
    placeholder: "https://facebook.com/username",
    svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/username",
    svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  whatsapp: {
    label: "WhatsApp",
    placeholder: "https://wa.me/1234567890",
    svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
  tiktok: {
    label: "TikTok",
    placeholder: "https://tiktok.com/@username",
    svg: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z",
  },
}

/**
 * High-fidelity interactive preview card mirroring the public Who We Are TeamCard.
 */
function RenderTeamCardPreview({
  imageUrl,
  name,
  role,
  bio,
  tierMeta,
  isFeatured,
  socials,
  previewMode,
  onToggleMode,
}: {
  imageUrl: string
  name: string
  role: string
  bio: string
  tierMeta: TeamTierMeta
  isFeatured: boolean
  socials: Record<string, string>
  previewMode: "default" | "hover"
  onToggleMode?: () => void
}) {
  const isHover = previewMode === "hover"
  const hasValidImage = imageUrl && isSafeMediaUrl(imageUrl)

  const activeSocials = Object.entries(socials).filter(([_, href]) => href && isSafeWebsiteUrl(href))

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleMode}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggleMode?.()
        }
      }}
      title="Click or tap to toggle between normal view and hover overlay"
      className={cn(
        "group relative w-full max-w-[270px] overflow-hidden rounded-2xl bg-card border border-border shadow-md transition-all duration-300 aspect-[4/5.2] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isHover ? "ring-2 ring-primary/40 shadow-xl" : "hover:shadow-lg"
      )}
    >
      {/* Background Photo or Stylized Initial Fallback */}
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={name ? `Portrait of ${name}` : "Team portrait preview"}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            isHover ? "scale-105 saturate-100" : "scale-100 saturate-90 group-hover:scale-105 group-hover:saturate-100"
          )}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/60 text-muted-foreground/70 p-4 text-center">
          <span className="font-marissa text-6xl font-medium text-primary/40 mb-1 select-none" aria-hidden="true">
            {name.trim() ? name.trim().charAt(0).toUpperCase() : "D"}
          </span>
          <span className="text-xs font-semibold text-foreground/80 truncate max-w-[180px]">
            {name.trim() ? name.trim() : "Member Name"}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Photo placeholder</span>
        </div>
      )}

      {/* Tier Badge Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-xs",
            tierMeta.badgeTone
          )}
        >
          {tierMeta.label}
        </span>
      </div>

      {/* Star Badge Overlay (Hero Featured) */}
      {isFeatured && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className="inline-flex size-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md ring-2 ring-white"
            title="Featured in Hero collage"
          >
            <Star className="size-4 fill-slate-950 text-slate-950" />
          </span>
        </div>
      )}

      {/* Mobile-Style Subtle Bottom Gradient (Visible in default view) */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 p-3.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-opacity duration-300",
          isHover ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <p className="font-comic text-sm font-bold text-white leading-tight truncate">
          {name || "Member Name"}
        </p>
        <p className="font-dm-sans text-[11px] text-white/85 font-medium mt-0.5 truncate">
          {role || "Position / Role"}
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/90 mt-1 underline decoration-white/50">
          Click to see bio <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* Hover / Active Slide-Up Overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-4 pt-10 text-white transition-all duration-300 flex flex-col justify-end text-left",
          isHover ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <p className="font-comic text-base font-bold text-white leading-tight">
          {name || "Member Name"}
        </p>
        <p className="font-dm-sans text-xs text-white/85 font-medium mt-0.5">
          {role || "Position / Role"}
        </p>
        {bio ? (
          <p className="font-sans text-[11px] leading-relaxed text-white/75 line-clamp-3 mt-2">
            {bio}
          </p>
        ) : (
          <p className="font-sans text-[11px] italic text-white/50 mt-1">
            No bio provided yet
          </p>
        )}

        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-white underline underline-offset-2">
            Read more →
          </span>

          {/* Social icons preview */}
          <div className="flex items-center gap-1 shrink-0">
            {activeSocials.length > 0 ? (
              activeSocials.map(([key]) => {
                const config = SOCIAL_ICONS[key]
                if (!config) return null
                return (
                  <span
                    key={key}
                    className="inline-flex size-5 items-center justify-center rounded bg-white/15 text-white transition-colors"
                    title={config.label}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-2.5" aria-hidden="true">
                      <path d={config.svg} />
                    </svg>
                  </span>
                )
              })
            ) : (
              <span className="text-[10px] text-white/50">No socials</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamMemberForm({ member }: TeamMemberFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Real-time interactive preview states
  const [name, setName] = useState(member?.name || "")
  const [role, setRole] = useState(member?.role || "")
  const [bio, setBio] = useState(member?.bio || "")
  const [imageUrl, setImageUrl] = useState(member?.image || "")
  const [tier, setTier] = useState<TeamTier>((member?.tier as TeamTier) || "vision")
  const [isPublished, setIsPublished] = useState(member?.is_published ?? true)
  const [isFeatured, setIsFeatured] = useState(member?.is_featured ?? false)
  const [sortOrder, setSortOrder] = useState<number>(member?.sort_order ?? 0)
  const [socials, setSocials] = useState<Record<string, string>>({
    linkedin: member?.social_links?.linkedin || "",
    twitter: member?.social_links?.twitter || "",
    facebook: member?.social_links?.facebook || "",
    instagram: member?.social_links?.instagram || "",
    whatsapp: member?.social_links?.whatsapp || "",
    tiktok: member?.social_links?.tiktok || "",
  })

  // Preview display toggle (Default vs Hover Overlay)
  const [previewMode, setPreviewMode] = useState<"default" | "hover">("hover")
  // Quick preview modal state on small screens
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  const uploading = useRef(false)
  const submitting = useRef(false)
  const busy = isLoading || deleteLoading || uploadBusy
  const clearGuard = useUnsavedChanges(dirty, busy)

  const activeTierMeta = TEAM_TIER_DETAILS[tier] || TEAM_TIER_DETAILS.vision

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleCancel = () => {
    if (dirty && !window.confirm("Discard unsaved team member changes?")) return
    clearGuard()
    router.back()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting.current || uploading.current || uploadError) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("tier", tier)
    formData.set("image", imageUrl)
    formData.set("isPublished", isPublished ? "true" : "false")
    formData.set("isFeatured", isFeatured ? "true" : "false")
    formData.set("sort_order", String(sortOrder))

    submitting.current = true
    try {
      const result = member ? await updateTeamMember(member.id, formData) : await createTeamMember(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      setDirty(false)
      clearGuard()
      notifications.showSuccess({
        description: result.warning || (member ? "Member profile updated." : "Team member created."),
      })
      router.push("/admin/team")
      router.refresh()
    } catch {
      setError("Save could not be confirmed. Your edits have been kept. Please try again.")
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4 sm:space-y-6 pb-28 lg:pb-0">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sticky Quick Jump Navigation & Live Preview Trigger Bar (Desktop & Mobile) */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 -mt-2 mb-4 bg-background/95 backdrop-blur-md border-b border-border/80 px-3 sm:px-4 py-2 shadow-2xs">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <nav aria-label="Form section jumps" className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth py-0.5 touch-pan-x text-xs">
            <button
              type="button"
              onClick={() => scrollToSection("section-info")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Info
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-photo")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Photo
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-socials")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Socials
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-contact")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-preview")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("section-visibility")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors cursor-pointer"
            >
              Publish
            </button>
          </nav>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewDialogOpen(true)}
            className="shrink-0 h-8 text-xs gap-1.5 px-3 font-semibold border-primary/40 text-primary hover:bg-primary/10 shadow-2xs cursor-pointer"
            title="Open interactive card live preview dialog"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Live Preview</span>
          </Button>
        </div>
      </div>

      <fieldset disabled={busy} className="min-w-0">
        <legend className="sr-only">Team member form</legend>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Editing Column (Left) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Identity & Role Card */}
            <Card id="section-info" className="border-border/80 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="text-base font-semibold">Member Information</CardTitle>
                <CardDescription className="text-xs">
                  Basic details and organizational assignment for this team member.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setDirty(true)
                      }}
                      required
                      maxLength={200}
                      placeholder="e.g. Dr. Jane Doe"
                      className="min-h-11 sm:min-h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-semibold">
                      Role / Position *
                    </Label>
                    <Input
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value)
                        setDirty(true)
                      }}
                      required
                      maxLength={200}
                      placeholder="e.g. Executive Director"
                      className="min-h-11 sm:min-h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Tier Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label htmlFor="tier" className="text-xs font-semibold">
                      Organizational Tier *
                    </Label>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0", activeTierMeta.badgeTone)}>
                      {activeTierMeta.label}
                    </span>
                  </div>
                  <Select
                    value={tier}
                    onValueChange={(val) => {
                      setTier(val as TeamTier)
                      setDirty(true)
                    }}
                  >
                    <SelectTrigger id="tier" className="min-h-11 sm:min-h-10 w-full text-base sm:text-sm">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_TIERS.map((tierKey) => {
                        const tMeta = TEAM_TIER_DETAILS[tierKey]
                        return (
                          <SelectItem key={tierKey} value={tierKey}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 w-full py-0.5 text-left">
                              <span className="font-semibold text-foreground text-xs sm:text-sm">{tMeta.label}</span>
                              <span className="text-[11px] sm:text-xs text-muted-foreground">({tMeta.subtitle})</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-0.5 leading-relaxed">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/80" />
                    <span>{activeTierMeta.description}</span>
                  </p>
                </div>

                {/* Bio Field with Live Character & Word Counter */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label htmlFor="bio" className="text-xs font-semibold">
                      Biography / Background (Optional)
                    </Label>
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
                      {bio.length} characters ({bio.trim() ? bio.trim().split(/\s+/).length : 0} words)
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value)
                      setDirty(true)
                    }}
                    rows={6}
                    placeholder="Write the member's professional journey, background, credentials, and vision (displayed in full within their profile modal)..."
                    className="resize-y text-base sm:text-sm leading-relaxed min-h-[140px]"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Multiple paragraphs are supported and will be formatted cleanly in their profile dialog.
                  </p>
                </div>

                {/* Photo Upload */}
                <div id="section-photo" className="pt-2">
                  <FileUpload
                    bucket="team-photos"
                    currentUrl={imageUrl}
                    onUpload={(url) => {
                      setImageUrl(url)
                      setDirty(true)
                    }}
                    disabled={isLoading || deleteLoading}
                    onBusyChange={(value) => {
                      uploading.current = value
                      setUploadBusy(value)
                    }}
                    onErrorChange={setUploadError}
                    label="Member Portrait Photo"
                    maxSizeMB={5}
                    allowUrl={true}
                  />
                  <input type="hidden" name="image" value={imageUrl} />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links Card */}
            <Card id="section-socials" className="border-border/80 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="text-base font-semibold">Social Profiles</CardTitle>
                <CardDescription className="text-xs">
                  Icons will appear on the member&apos;s card on the public website.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {Object.entries(SOCIAL_ICONS).map(([key, config]) => {
                    const currentVal = socials[key] || ""
                    const isValidUrl = currentVal && isSafeWebsiteUrl(currentVal)
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <Label htmlFor={key} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true">
                              <path d={config.svg} />
                            </svg>
                            <span>{config.label}</span>
                          </Label>
                          {isValidUrl && (
                            <a
                              href={currentVal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline transition-colors shrink-0"
                              title={`Open ${config.label} link in new tab`}
                            >
                              <ExternalLink className="size-2.5" />
                              <span>Test</span>
                            </a>
                          )}
                        </div>
                        <Input
                          id={key}
                          name={key}
                          type="url"
                          value={currentVal}
                          onChange={(e) => {
                            setSocials((prev) => ({ ...prev, [key]: e.target.value }))
                            setDirty(true)
                          }}
                          placeholder={config.placeholder}
                          className="min-h-11 sm:min-h-10 text-base sm:text-sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Internal Contact Info */}
            <Card id="section-contact" className="border-border/80 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base font-semibold">Internal Contact Details</CardTitle>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                    Admin Only
                  </span>
                </div>
                <CardDescription className="text-xs">
                  For foundation records and communication. These details are never rendered on the public website.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={member?.email || ""}
                      placeholder="name@deessafoundation.com"
                      className="min-h-11 sm:min-h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={member?.phone || ""}
                      placeholder="+977 980-0000000"
                      className="min-h-11 sm:min-h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Card Preview & Publishing Actions (Sticky on Desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
            {/* Live Public Card Preview */}
            <Card id="section-preview" className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="p-3 sm:p-4 pb-3 border-b border-border/70 bg-muted/20">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <CardTitle className="text-sm font-semibold">Live Public Preview</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Mode switcher */}
                    <div className="inline-flex rounded-lg border border-border p-0.5 bg-background text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("default")}
                        className={cn(
                          "px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer",
                          previewMode === "default"
                            ? "bg-muted text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Default
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("hover")}
                        className={cn(
                          "px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer",
                          previewMode === "hover"
                            ? "bg-muted text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Hover Overlay
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewDialogOpen(true)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                      title="Open full interactive preview dialog"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Expand Preview</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 flex flex-col items-center">
                <RenderTeamCardPreview
                  imageUrl={imageUrl}
                  name={name}
                  role={role}
                  bio={bio}
                  tierMeta={activeTierMeta}
                  isFeatured={isFeatured}
                  socials={socials}
                  previewMode={previewMode}
                  onToggleMode={() => setPreviewMode((prev) => (prev === "default" ? "hover" : "default"))}
                />

                <p className="text-[11px] text-muted-foreground text-center mt-3 max-w-[260px] leading-relaxed">
                  Real-time preview in <strong>{activeTierMeta.label}</strong>. Click card or toggle buttons to inspect hover state.
                </p>
              </CardContent>
            </Card>

            {/* Publishing & Actions Card */}
            <Card id="section-visibility" className="border-border/80 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="text-base font-semibold">Visibility & Actions</CardTitle>
                <CardDescription className="text-xs">
                  Control publication status and directory placement.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 p-3 sm:p-3.5 bg-muted/20">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isPublished ? (
                        <Eye className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <Label htmlFor="isPublished" className="text-xs font-semibold cursor-pointer truncate">
                        Show on Website
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {isPublished
                        ? "Visible to public visitors under Who We Are."
                        : "Hidden from public website."}
                    </p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    className="shrink-0 data-[state=checked]:bg-brand-primary"
                    onCheckedChange={(checked) => {
                      setIsPublished(checked)
                      if (!checked) setIsFeatured(false)
                      setDirty(true)
                    }}
                  />
                </div>

                {/* Hero Collage Toggle */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 p-3 sm:p-3.5 bg-muted/20">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Star
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground"
                        )}
                      />
                      <Label htmlFor="isFeatured" className="text-xs font-semibold cursor-pointer truncate">
                        Hero Collage (Top 3)
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {isFeatured
                        ? "Portrait is featured in the 3-photo collage in the Hero section."
                        : "Turn on to feature this member in the Hero collage."}
                    </p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    disabled={!isPublished}
                    className="shrink-0 data-[state=checked]:bg-brand-primary"
                    onCheckedChange={(checked) => {
                      setIsFeatured(checked)
                      setDirty(true)
                    }}
                  />
                </div>

                {/* Display Sequence / Order */}
                <div className="space-y-1.5 rounded-lg border border-border/80 p-3 sm:p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="sort_order" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                      <ArrowUpDown className="size-3.5 text-primary shrink-0" />
                      <span>Display Sequence / Order</span>
                    </Label>
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                      Position #{sortOrder + 1}
                    </span>
                  </div>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min={0}
                    max={9999}
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(Math.max(0, parseInt(e.target.value, 10) || 0))
                      setDirty(true)
                    }}
                    className="min-h-11 sm:min-h-10 text-base sm:text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Determines who appears first, second, etc. within their group on Who We Are. Lower numbers appear first (e.g. 0 appears before 1).
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={busy || !!uploadError}
                    className="min-h-11 w-full text-sm font-semibold shadow-xs bg-brand-primary text-white hover:bg-brand-primary-dark cursor-pointer transition-colors"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {member ? "Save Profile Changes" : "Publish Team Member"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewDialogOpen(true)}
                      className="min-h-10 flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                      title="Open full interactive preview dialog"
                    >
                      <Eye className="size-3.5" />
                      <span>Preview Dialog</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={busy}
                      className="min-h-10 px-3 text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>

                    {member && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                        disabled={busy}
                        className="min-h-10 text-xs px-3 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </fieldset>

      {uploadBusy && (
        <p role="status" className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Uploading portrait image, please wait before saving...</span>
        </p>
      )}

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-md p-3 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={busy}
            className="min-h-11 px-3 text-xs font-medium"
          >
            Cancel
          </Button>

          {member && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={busy}
              className="min-h-11 px-3 text-xs font-medium shrink-0"
              title="Delete member"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setPreviewDialogOpen(true)}
            className="min-h-11 px-2.5 sm:px-3 text-xs font-medium gap-1 border border-border shrink-0"
            title="Preview card"
          >
            <Eye className="size-3.5 text-primary" />
            <span className="hidden xs:inline">Preview</span>
          </Button>

          <Button
            type="submit"
            disabled={busy || !!uploadError}
            className="min-h-11 flex-1 text-xs sm:text-sm font-semibold shadow-xs bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
          >
            {isLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {member ? "Save Changes" : "Publish Member"}
          </Button>
        </div>
      </div>

      {/* Quick Preview Dialog for Mobile / Tablet Viewports */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b border-border/70 text-left">
            <DialogTitle className="text-base font-semibold flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <span>Card Live Preview</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulated public directory card in <strong>{activeTierMeta.label}</strong> tier.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center">
            {/* Mode switcher in dialog */}
            <div className="mb-4 inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode("default")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium text-xs transition-colors",
                  previewMode === "default"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Default Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("hover")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium text-xs transition-colors",
                  previewMode === "hover"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Hover Overlay
              </button>
            </div>

            <RenderTeamCardPreview
              imageUrl={imageUrl}
              name={name}
              role={role}
              bio={bio}
              tierMeta={activeTierMeta}
              isFeatured={isFeatured}
              socials={socials}
              previewMode={previewMode}
              onToggleMode={() => setPreviewMode((prev) => (prev === "default" ? "hover" : "default"))}
            />

            <p className="text-[11px] text-muted-foreground text-center mt-3 max-w-[260px]">
              Tap the card to switch between default view and hover bio overlay.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(value) => {
          if (!deleteLoading) setDeleteOpen(value)
        }}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${member?.name ?? "this member"}? This will permanently remove them from the website.`}
        loading={deleteLoading}
        closeOnConfirm={false}
        onConfirm={async () => {
          if (!member || submitting.current || uploading.current || deleteLoading) return
          submitting.current = true
          setDeleteLoading(true)
          try {
            const result = await deleteTeamMember(member.id)
            if (result.error) {
              notifications.showError({ description: result.error })
              return
            }
            setDirty(false)
            clearGuard()
            setDeleteOpen(false)
            notifications.showSuccess({ description: result.warning || "Member deleted." })
            router.push("/admin/team")
          } catch {
            notifications.showError({ description: "Delete could not be confirmed. Please try again." })
          } finally {
            submitting.current = false
            setDeleteLoading(false)
          }
        }}
      />
    </form>
  )
}
