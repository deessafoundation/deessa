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
  Loader2,
  AlertCircle,
  Sparkles,
  Star,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  User,
  Info,
} from "lucide-react"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/actions/admin-team"
import { notifications } from "@/lib/notifications"
import { FileUpload } from "@/components/admin/media/file-upload"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import type { TeamMember } from "@/lib/types/admin"
import { TEAM_TIERS, TEAM_TIER_DETAILS, type TeamTier } from "@/lib/types/team-input"
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
  const [socials, setSocials] = useState<Record<string, string>>({
    linkedin: member?.social_links?.linkedin || "",
    twitter: member?.social_links?.twitter || "",
    facebook: member?.social_links?.facebook || "",
    instagram: member?.social_links?.instagram || "",
    whatsapp: member?.social_links?.whatsapp || "",
    tiktok: member?.social_links?.tiktok || "",
  })

  const uploading = useRef(false)
  const submitting = useRef(false)
  const busy = isLoading || deleteLoading || uploadBusy
  const clearGuard = useUnsavedChanges(dirty, busy)

  const activeTierMeta = TEAM_TIER_DETAILS[tier] || TEAM_TIER_DETAILS.vision
  const bioCharsLeft = 150 - bio.length

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
      if (member) router.refresh()
      else router.push("/admin/team")
    } catch {
      setError("Save could not be confirmed. Your edits have been kept. Please try again.")
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-6">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <fieldset disabled={busy} className="min-w-0">
        <legend className="sr-only">Team member form</legend>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Editing Column (Left) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Identity & Role Card */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Member Information</CardTitle>
                <CardDescription className="text-xs">
                  Basic details and organizational assignment for this team member.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="min-h-10 text-sm"
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
                      className="min-h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Tier Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tier" className="text-xs font-semibold">
                      Organizational Tier *
                    </Label>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", activeTierMeta.badgeTone)}>
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
                    <SelectTrigger id="tier" className="min-h-10 w-full text-sm">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_TIERS.map((tierKey) => {
                        const tMeta = TEAM_TIER_DETAILS[tierKey]
                        return (
                          <SelectItem key={tierKey} value={tierKey}>
                            <div className="flex items-center justify-between gap-3 w-full py-0.5">
                              <span className="font-semibold text-foreground">{tMeta.label}</span>
                              <span className="text-xs text-muted-foreground">({tMeta.subtitle})</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                    <span>{activeTierMeta.description}</span>
                  </p>
                </div>

                {/* Bio Field with Live Character Counter */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio" className="text-xs font-semibold">
                      Short Bio (Optional)
                    </Label>
                    <span
                      className={cn(
                        "text-[11px] font-mono tabular-nums",
                        bioCharsLeft < 15
                          ? "text-destructive font-semibold"
                          : bioCharsLeft < 30
                            ? "text-amber-600 font-medium"
                            : "text-muted-foreground",
                      )}
                    >
                      {bio.length} / 150 characters
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
                    rows={3}
                    maxLength={150}
                    placeholder="Brief background or specialty (appears when visitors hover over the member's photo)..."
                    className="resize-none text-sm leading-relaxed"
                  />
                </div>

                {/* Photo Upload */}
                <div className="pt-2">
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
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Social Profiles</CardTitle>
                <CardDescription className="text-xs">
                  Icons will appear on the member&apos;s card on the public website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {Object.entries(SOCIAL_ICONS).map(([key, config]) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key} className="flex items-center gap-1.5 text-xs font-semibold">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true">
                          <path d={config.svg} />
                        </svg>
                        <span>{config.label}</span>
                      </Label>
                      <Input
                        id={key}
                        name={key}
                        type="url"
                        value={socials[key] || ""}
                        onChange={(e) => {
                          setSocials((prev) => ({ ...prev, [key]: e.target.value }))
                          setDirty(true)
                        }}
                        placeholder={config.placeholder}
                        className="min-h-10 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Internal Contact Info */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Internal Contact Details</CardTitle>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin Only
                  </span>
                </div>
                <CardDescription className="text-xs">
                  For foundation records and communication. These details are never rendered on the public website.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      placeholder="name@deesha.org"
                      className="min-h-10 text-sm"
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
                      className="min-h-10 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Card Preview & Publishing Actions */}
          <div className="space-y-6 lg:col-span-5">
            {/* Live Public Card Preview */}
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/70 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Live Public Preview</CardTitle>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Who We Are Card
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 flex flex-col items-center">
                {/* Simulated TeamCard exactly as rendered on /about */}
                <div className="w-full max-w-[270px] overflow-hidden rounded-2xl bg-card border border-border shadow-md transition-shadow">
                  {/* Portrait Area */}
                  <div className="relative aspect-[4/5.2] w-full overflow-hidden bg-muted">
                    {imageUrl && isSafeMediaUrl(imageUrl) ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/50">
                        <User className="h-16 w-16 stroke-[1.2]" />
                        <span className="text-xs font-medium mt-1">Photo Preview</span>
                      </div>
                    )}

                    {/* Tier badge overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-xs", activeTierMeta.badgeTone)}>
                        {activeTierMeta.label}
                      </span>
                    </div>

                    {/* Star badge overlay for Hero featured */}
                    {isFeatured && (
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className="inline-flex size-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md ring-2 ring-white"
                          title="Featured in Hero collage"
                        >
                          <Star className="size-4 fill-slate-950 text-slate-950" />
                        </span>
                      </div>
                    )}

                    {/* Bio overlay preview if bio is provided */}
                    {bio && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-6 text-white">
                        <p className="text-[11px] leading-tight text-white/90 line-clamp-3">
                          {bio}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Details */}
                  <div className="p-3.5 space-y-1">
                    <p className="font-bold text-foreground text-sm leading-snug truncate">
                      {name || "Member Name"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {role || "Position / Role"}
                    </p>

                    {/* Social icons preview */}
                    <div className="flex items-center gap-1.5 pt-2">
                      {Object.entries(socials)
                        .filter(([_, href]) => href && isSafeWebsiteUrl(href))
                        .map(([key]) => {
                          const config = SOCIAL_ICONS[key]
                          if (!config) return null
                          return (
                            <span
                              key={key}
                              className="inline-flex size-6 items-center justify-center rounded bg-muted text-muted-foreground"
                              title={config.label}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3">
                                <path d={config.svg} />
                              </svg>
                            </span>
                          )
                        })}
                      {!Object.values(socials).some((v) => v && isSafeWebsiteUrl(v)) && (
                        <span className="text-[10px] text-muted-foreground/60 italic">No social links</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center mt-3 max-w-[260px]">
                  Real-time preview of how this member will look in the <strong>{activeTierMeta.label}</strong> group.
                </p>
              </CardContent>
            </Card>

            {/* Publishing & Actions Card */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Visibility & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {isPublished ? (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Label htmlFor="isPublished" className="text-xs font-semibold cursor-pointer">
                        Show on Website
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isPublished
                        ? "Visible to public visitors under Who We Are."
                        : "Hidden from public website."}
                    </p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    className="data-[state=checked]:bg-brand-primary"
                    onCheckedChange={(checked) => {
                      setIsPublished(checked)
                      if (!checked) setIsFeatured(false)
                      setDirty(true)
                    }}
                  />
                </div>

                {/* Hero Collage Toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground",
                        )}
                      />
                      <Label htmlFor="isFeatured" className="text-xs font-semibold cursor-pointer">
                        Hero Collage (Top 3)
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isFeatured
                        ? "Portrait is featured in the 3-photo collage in the Hero section."
                        : "Turn on to feature this member in the Hero collage."}
                    </p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    disabled={!isPublished}
                    className="data-[state=checked]:bg-brand-primary"
                    onCheckedChange={(checked) => {
                      setIsFeatured(checked)
                      setDirty(true)
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={busy || !!uploadError}
                    className="min-h-11 w-full text-sm font-semibold shadow-xs bg-brand-primary text-white hover:bg-brand-primary-dark"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {member ? "Save Profile Changes" : "Publish Team Member"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (dirty && !window.confirm("Discard unsaved team member changes?")) return
                        clearGuard()
                        router.back()
                      }}
                      disabled={busy}
                      className="min-h-10 flex-1 text-xs"
                    >
                      Cancel
                    </Button>

                    {member && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                        disabled={busy}
                        className="min-h-10 text-xs px-3"
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

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden sticky bottom-0 z-30 -mx-4 -mb-6 sm:-mx-6 sm:-mb-6 border-t border-border bg-background/95 backdrop-blur-md p-3.5 shadow-lg pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (dirty && !window.confirm("Discard unsaved team member changes?")) return
              clearGuard()
              router.back()
            }}
            disabled={busy}
            className="min-h-11 px-4 text-xs font-medium"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={busy || !!uploadError}
            className="min-h-11 flex-1 text-xs sm:text-sm font-semibold shadow-xs bg-brand-primary text-white hover:bg-brand-primary-dark"
          >
            {isLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {member ? "Save Changes" : "Publish Member"}
          </Button>
        </div>
      </div>

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
