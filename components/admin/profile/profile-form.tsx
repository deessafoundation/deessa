"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Save,
  Upload,
  Link2,
  Trash2,
  Lock,
  Camera,
  ShieldAlert,
  Shield,
  FileText,
  CreditCard,
  Briefcase,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updateProfile, uploadAdminAvatar } from "@/lib/actions/admin-profile"
import { notifications } from "@/lib/notifications"
import type { AdminUser, AdminRole } from "@/lib/types/admin"

interface ProfileFormProps {
  adminUser: AdminUser
}

const ROLE_THEMES: Record<
  AdminRole,
  {
    label: string
    badgeClass: string
    icon: React.ElementType
  }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: ShieldAlert,
  },
  ADMIN: {
    label: "Administrator",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Shield,
  },
  EDITOR: {
    label: "Content Editor",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: FileText,
  },
  FINANCE: {
    label: "Finance Manager",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: CreditCard,
  },
}

export function ProfileForm({ adminUser }: ProfileFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [fullName, setFullName] = useState(adminUser.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(adminUser.avatar_url || "")
  const [designation, setDesignation] = useState(adminUser.designation || "")
  const [phone, setPhone] = useState(adminUser.phone || "")
  const [avatarMode, setAvatarMode] = useState<"upload" | "url">("upload")

  // Async action states
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const isDirty =
    fullName.trim() !== (adminUser.full_name || "").trim() ||
    avatarUrl.trim() !== (adminUser.avatar_url || "").trim() ||
    designation.trim() !== (adminUser.designation || "").trim() ||
    phone.trim() !== (adminUser.phone || "").trim()

  const roleTheme = ROLE_THEMES[adminUser.role] || ROLE_THEMES.EDITOR
  const RoleIcon = roleTheme.icon

  const handleCopyId = () => {
    navigator.clipboard.writeText(adminUser.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
    notifications.showInfo({ description: "System User ID copied to clipboard." })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      notifications.showError({
        title: "Invalid File Type",
        description: "Please choose an image file (JPEG, PNG, WebP, or GIF).",
      })
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      notifications.showError({
        title: "File Too Large",
        description: "Image size must be under 3MB.",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadAdminAvatar(formData)
      if (result.error) {
        notifications.showError({
          title: "Upload Failed",
          description: result.error,
        })
      } else if (result.url) {
        setAvatarUrl(result.url)
        notifications.showSuccess({
          title: "Avatar Uploaded",
          description: "Click 'Save Changes' below to apply your new profile photo.",
        })
      }
    } catch (err) {
      notifications.showError({
        title: "Upload Error",
        description: err instanceof Error ? err.message : "Failed to upload image.",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl("")
    notifications.showInfo({
      description: "Avatar cleared. Click 'Save Changes' to apply initials fallback.",
    })
  }

  const handleReset = () => {
    setFullName(adminUser.full_name || "")
    setAvatarUrl(adminUser.avatar_url || "")
    setDesignation(adminUser.designation || "")
    setPhone(adminUser.phone || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || fullName.trim().length < 2) {
      notifications.showError({
        title: "Validation Error",
        description: "Full name must be at least 2 characters long.",
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
        designation: designation.trim() || null,
        phone: phone.trim() || null,
      })

      if (result.error) {
        notifications.showError({
          title: "Update Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Profile Updated",
          description: "Your administrator profile has been updated successfully.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to update profile.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Interactive Avatar Customizer */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {fullName?.charAt(0) || adminUser.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Upload trigger overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload photo"
                className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 cursor-pointer"
              >
                <Camera className="h-5 w-5" />
                <span className="text-[9px] font-semibold">Change</span>
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Profile Picture</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Upload a professional headshot or photo. Max size 3MB (JPEG, PNG, WebP).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-7 text-xs gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" />
                      <span>Choose File</span>
                    </>
                  )}
                </Button>

                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="h-7 text-xs text-destructive hover:text-destructive px-2"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setAvatarMode("upload")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer",
                avatarMode === "upload"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setAvatarMode("url")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer",
                avatarMode === "url"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Direct URL
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload profile image"
        />

        {/* Direct URL input fallback */}
        {avatarMode === "url" && (
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <Label htmlFor="avatar-url-input" className="text-xs font-semibold flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              Direct Image URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="avatar-url-input"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-9 text-xs"
              />
              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="h-9 px-2 text-xs text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Provide a publicly accessible secure link (HTTPS) pointing to your image.
            </p>
          </div>
        )}
      </div>

      {/* 2. Personal Information Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Display Full Name <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {fullName.length} / 70
            </span>
          </div>
          <Input
            id="profile-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={70}
            required
            placeholder="Your official administrator name"
            className="h-10 text-sm max-w-md"
          />
        </div>

        {/* Login Email Address (Read-only) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Account Login Email
            </Label>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium px-2 py-0">
              Verified Primary Email
            </Badge>
          </div>
          <div className="relative max-w-md">
            <Input
              id="profile-email"
              type="email"
              value={adminUser.email}
              disabled
              className="h-10 text-sm bg-muted/50 cursor-not-allowed pr-9 font-medium"
            />
            <Lock className="h-4 w-4 text-muted-foreground/70 absolute right-3 top-3 pointer-events-none" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md">
            Your login email is anchored to your security credentials. To modify your account email, please contact a Super Administrator.
          </p>
        </div>

        {/* Extended Identity: Designation & Emergency Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-designation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Administrative Designation
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {designation.length} / 80
              </span>
            </div>
            <Input
              id="profile-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              maxLength={80}
              placeholder="e.g. Senior Treasury Auditor"
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Emergency Phone / Contact
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {phone.length} / 25
              </span>
            </div>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={25}
              placeholder="e.g. +977 9801234567"
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Identity & Role Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/15 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Assigned Authority Role
            </span>
            <div className="pt-0.5">
              <Badge
                variant="outline"
                className={cn("text-xs px-2.5 py-0.5 font-medium inline-flex items-center gap-1.5", roleTheme.badgeClass)}
              >
                <RoleIcon className="h-3.5 w-3.5" />
                <span>{roleTheme.label}</span>
              </Badge>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/15 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              System Admin ID
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-mono text-xs text-foreground truncate select-all">
                {adminUser.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer shrink-0"
                title="Copy Full UUID"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Footer */}
      <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              You have unsaved profile changes.
            </span>
          ) : (
            <span>All profile details are synchronized.</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="h-9 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Discard
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || isSaving}
            className="h-9 text-xs min-w-[130px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
