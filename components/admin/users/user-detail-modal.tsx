"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Save,
  RotateCcw,
  Loader2,
  Trash2,
  KeyRound,
  UserCheck,
  Calendar,
  AlertTriangle,
  History,
  Sparkles,
  Lock,
  Link2,
  CheckCheck,
  Code,
  Mail,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAuditLogToPlainLanguage } from "@/lib/utils/audit-formatter"
import {
  updateAdminUser,
  deleteAdminUser,
  sendAdminPasswordResetEmailAction,
  generateAdminPasswordResetLink,
  getAdminUserActivityLogs,
  type AdminActivityLogItem,
} from "@/lib/actions/admin-users"
import { getActionTheme } from "./system-audit-client"
import { notifications } from "@/lib/notifications"
import { ADMIN_ROLES } from "@/lib/validations/admin-users"
import type { AdminUser, AdminRole } from "@/lib/types/admin"

interface UserDetailModalProps {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAdminId: string
  currentAdminRole: AdminRole
}

interface RoleDefinition {
  title: string
  tagline: string
  description: string
  badgeColor: string
  borderActive: string
  bgSelected: string
  icon: React.ElementType
  domains: {
    name: string
    allowed: boolean
    detail: string
  }[]
}

const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  SUPER_ADMIN: {
    title: "Super Admin",
    tagline: "Unrestricted System Authority",
    description: "Complete authority across all application modules, security controls, site configuration, and database administration.",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    borderActive: "border-rose-500 ring-2 ring-rose-500/20",
    bgSelected: "bg-rose-500/[0.04]",
    icon: ShieldAlert,
    domains: [
      { name: "User Administration", allowed: true, detail: "Create, edit, suspend, and delete admin users" },
      { name: "Financial Oversight", allowed: true, detail: "Review donations, verify receipts, export audits" },
      { name: "Site Configuration", allowed: true, detail: "Branding, payments, typography, accessibility" },
      { name: "Content Publishing", allowed: true, detail: "Publish programs, stories, events, and media" },
    ],
  },
  ADMIN: {
    title: "Administrator",
    tagline: "Operational Management",
    description: "Broad administrative control over day-to-day operations, submissions, visitor engagements, and editorial workflows.",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    borderActive: "border-indigo-500 ring-2 ring-indigo-500/20",
    bgSelected: "bg-indigo-500/[0.04]",
    icon: Shield,
    domains: [
      { name: "Content Publishing", allowed: true, detail: "Publish programs, stories, events, and media" },
      { name: "Inquiries & Support", allowed: true, detail: "Review contact forms and support tickets" },
      { name: "Financial Oversight", allowed: false, detail: "Read-only transaction list; no receipt editing" },
      { name: "User Administration", allowed: false, detail: "Cannot modify or invite administrative users" },
    ],
  },
  EDITOR: {
    title: "Content Editor",
    tagline: "Editorial & Storytelling",
    description: "Focused on drafting, editing, and publishing news, programs, photo essays, and community outreach announcements.",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
    bgSelected: "bg-emerald-500/[0.04]",
    icon: FileText,
    domains: [
      { name: "Content Publishing", allowed: true, detail: "Draft & publish stories, events, and programs" },
      { name: "Media Assets", allowed: true, detail: "Upload images, manage photo wall & banners" },
      { name: "Financial Oversight", allowed: false, detail: "No access to donation records or tax receipts" },
      { name: "Site Configuration", allowed: false, detail: "No access to payment rails or core settings" },
    ],
  },
  FINANCE: {
    title: "Finance Manager",
    tagline: "Financial Verification & Receipts",
    description: "Specialized in donation verification, bank transfer reconciliation, automated receipts, and fiscal audit compliance.",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    bgSelected: "bg-purple-500/[0.04]",
    icon: CreditCard,
    domains: [
      { name: "Financial Oversight", allowed: true, detail: "Review donor payments, approve bank receipts, issue tax letters" },
      { name: "Audit Trail", allowed: true, detail: "Access immutable donation ledger and fiscal CSV exports" },
      { name: "Content Publishing", allowed: false, detail: "Cannot modify programs, stories, or photo galleries" },
      { name: "User Administration", allowed: false, detail: "No access to administrator role assignment" },
    ],
  },
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
  currentAdminId,
  currentAdminRole,
}: UserDetailModalProps) {
  const router = useRouter()

  // Form states
  const [role, setRole] = useState<AdminRole>(user?.role || "EDITOR")
  const [isActive, setIsActive] = useState<boolean>(user?.is_active ?? true)
  const [fullName, setFullName] = useState<string>(user?.full_name || "")

  // Recovery & link states
  const [recoveryLinks, setRecoveryLinks] = useState<Record<string, string>>({})
  const [copiedRecoveryLink, setCopiedRecoveryLink] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [emailSentSuccess, setEmailSentSuccess] = useState(false)

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  // Activity logs tab
  const [activeTab, setActiveTab] = useState<"access" | "security" | "activity">("access")
  const [logs, setLogs] = useState<AdminActivityLogItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [userLogsDisplayMode, setUserLogsDisplayMode] = useState<"plain" | "json">("plain")

  const recoveryLink = user ? recoveryLinks[user.id] : undefined

  // Adjust form state during render when user changes (React 19 idiomatic pattern)
  const [prevUserId, setPrevUserId] = useState<string | null>(null)
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id)
    setRole(user.role)
    setIsActive(user.is_active)
    setFullName(user.full_name)
    setCopiedEmail(false)
    setCopiedId(false)
    setCopiedRecoveryLink(false)
    setEmailSentSuccess(false)
    setActiveTab("access")
  }

  // Fetch activity logs for this user when opening
  useEffect(() => {
    let ignore = false
    if (open && user?.id) {
      getAdminUserActivityLogs(user.id, 12)
        .then((res) => {
          if (!ignore) {
            setLogs(res.logs || [])
            setLoadingLogs(false)
          }
        })
        .catch(() => {
          if (!ignore) {
            setLogs([])
            setLoadingLogs(false)
          }
        })
    }
    return () => {
      ignore = true
    }
  }, [open, user?.id])

  const isSelf = Boolean(user && user.id === currentAdminId)
  const canModify = currentAdminRole === "SUPER_ADMIN"

  const isDirty = Boolean(
    user && (role !== user.role || isActive !== user.is_active || fullName !== user.full_name)
  )

  const handleCopyId = () => {
    if (!user) return
    navigator.clipboard.writeText(user.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
    notifications.showInfo({ description: "System User ID copied to clipboard." })
  }

  const handleCopyEmail = () => {
    if (!user) return
    navigator.clipboard.writeText(user.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
    notifications.showInfo({ description: "Email address copied." })
  }

  const handleSave = useCallback(async () => {
    if (!user || !isDirty || isSaving || !canModify) return
    setIsSaving(true)

    try {
      const result = await updateAdminUser(user.id, {
        role,
        is_active: isActive,
        fullName,
      })

      if (result.error) {
        notifications.showError({
          title: "Update Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Account Updated",
          description: `Permissions for ${fullName || user.email} have been saved.`,
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to update account.",
      })
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, isSaving, canModify, user, role, isActive, fullName, router])

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, handleSave])

  const handleDelete = async () => {
    if (!user) return
    setIsDeleting(true)

    try {
      const result = await deleteAdminUser(user.id)

      if (result.error) {
        notifications.showError({
          title: "Delete Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Account Removed",
          description: `${user.full_name} has been permanently deleted.`,
        })
        onOpenChange(false)
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to delete account.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendResetEmail = async () => {
    if (!user || isSendingEmail) return
    setIsSendingEmail(true)

    try {
      const result = await sendAdminPasswordResetEmailAction(user.id)
      if (result.error) {
        notifications.showError({
          title: "Email Dispatch Failed",
          description: result.error,
        })
      } else {
        setEmailSentSuccess(true)
        notifications.showSuccess({
          title: "Reset Email Sent",
          description: `A secure single-use recovery link was emailed to ${user.email}.`,
        })
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to dispatch reset email.",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleGenerateRecoveryLink = async () => {
    if (!user) return
    setIsGeneratingLink(true)
    try {
      const result = await generateAdminPasswordResetLink(user.id)
      if (result.error) {
        notifications.showError({
          title: "Link Generation Failed",
          description: result.error,
        })
      } else if (result.link) {
        setRecoveryLinks((prev) => ({ ...prev, [user.id]: result.link as string }))
        notifications.showSuccess({
          title: "Setup Link Generated",
          description: "Single-use recovery link created. Share securely with the user.",
        })
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to generate link.",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleCopyRecoveryLink = () => {
    if (!recoveryLink) return
    navigator.clipboard.writeText(recoveryLink)
    setCopiedRecoveryLink(true)
    setTimeout(() => setCopiedRecoveryLink(false), 2000)
    notifications.showInfo({ description: "Single-use setup link copied to clipboard." })
  }

  const currentRoleDef = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.EDITOR

  const roleThemeBanner = {
    SUPER_ADMIN: "from-rose-500/10 via-rose-500/[0.03] to-transparent",
    ADMIN: "from-indigo-500/10 via-indigo-500/[0.03] to-transparent",
    EDITOR: "from-emerald-500/10 via-emerald-500/[0.03] to-transparent",
    FINANCE: "from-purple-500/10 via-purple-500/[0.03] to-transparent",
  }[role] || "from-muted/40 via-muted/10 to-transparent"

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-4xl h-[86vh] max-h-[860px] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* 1. Refined Executive Hero Identity Header */}
        <DialogHeader className={cn("p-5 sm:p-6 border-b shrink-0 bg-gradient-to-r transition-colors duration-300", roleThemeBanner)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="h-13 w-13 border-2 border-background shadow-sm">
                  {user.avatar_url && (
                    <AvatarImage src={user.avatar_url} alt={user.full_name} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                    {user.full_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ring-1",
                    isActive
                      ? "bg-emerald-500 ring-emerald-400/40"
                      : "bg-destructive ring-destructive/40"
                  )}
                  title={isActive ? "Account is active" : "Account is suspended"}
                />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                    {user.full_name}
                  </DialogTitle>
                  {isSelf && (
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold px-2 py-0.5">
                      You
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5", currentRoleDef.badgeColor)}>
                    {currentRoleDef.title}
                  </Badge>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                    {isActive ? "Active" : "Suspended"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-sans text-xs cursor-pointer"
                    title="Click to copy email address"
                  >
                    <span className="truncate max-w-[200px] sm:max-w-xs">{user.email}</span>
                    {copiedEmail ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <Copy className="h-3 w-3 opacity-60 shrink-0" />}
                  </button>

                  <span className="text-border">•</span>

                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-muted font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Click to copy full UUID"
                  >
                    <span>ID: {user.id.slice(0, 8)}...</span>
                    {copiedId ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <Copy className="h-2.5 w-2.5 opacity-50 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Manage administrator role, security credentials, active access status, and audit history.
          </DialogDescription>
        </DialogHeader>

        {/* 2. Unified Modern Tab Bar */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "access" | "security" | "activity")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="w-full border-b border-border/60 px-5 sm:px-6 bg-muted/20 py-2.5 flex items-center justify-between shrink-0">
            <TabsList
              aria-label="User governance sections"
              className="h-auto bg-muted/60 p-1 rounded-xl border border-border/60 gap-1 inline-flex"
            >
              <TabsTrigger
                value="access"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:border-border/50 data-[state=active]:font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <span>Access & Role</span>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:border-border/50 data-[state=active]:font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>Security & Password</span>
              </TabsTrigger>

              <TabsTrigger
                value="activity"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs data-[state=active]:border-border/50 data-[state=active]:font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <History className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Audit Trail ({logs.length})</span>
              </TabsTrigger>
            </TabsList>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[11px]">Clearance:</span>
              <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold border", currentRoleDef.badgeColor)}>
                {currentRoleDef.title}
              </span>
            </div>
          </div>

          {/* 3. Tab Contents: Balanced & Spacious Workspace */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* ── TAB 1: ACCESS & ROLE ── */}
            <TabsContent value="access" className="mt-0 space-y-6 outline-none">
              {/* Self-Protection Alert */}
              {isSelf && (
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 text-xs sm:text-sm flex items-start gap-3">
                  <UserCheck className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <span className="leading-relaxed">
                    You are managing your own account. Self-suspension and role demotion are locked to protect ongoing administrative session integrity.
                  </span>
                </div>
              )}

              {/* 1. Unified Profile & Console Authorization Bento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Administrator Profile Identity */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      Administrator Profile
                    </span>
                    <span className="text-[11px] text-muted-foreground font-sans">Identity details</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-full-name" className="text-xs font-semibold text-foreground">
                        Display Full Name
                      </Label>
                      <Input
                        id="modal-full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!canModify || isSaving}
                        placeholder="Administrator full name"
                        className="h-10 text-xs sm:text-sm bg-background/50 focus-visible:bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Authentication Email
                      </Label>
                      <div className="relative">
                        <Input
                          value={user.email}
                          disabled
                          readOnly
                          className="h-10 text-xs font-mono bg-muted/40 pr-8 text-muted-foreground cursor-default"
                        />
                        <Lock className="h-3.5 w-3.5 text-muted-foreground absolute right-3 top-3 opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Console Access Authorization */}
                <div
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs flex flex-col justify-between",
                    isActive
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : "border-amber-500/30 bg-amber-500/[0.02]"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Shield className={cn("h-3.5 w-3.5", isActive ? "text-emerald-600" : "text-amber-600")} />
                        Console Authorization
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                        {isActive ? "Active & Permitted" : "Suspended"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isActive
                        ? "User is authorized to authenticate into the admin console and execute permitted operational workflows."
                        : "Account suspended. Active login sessions are terminated immediately and subsequent logins rejected."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="modal-status-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
                        {isActive ? "Revoke System Access" : "Grant System Access"}
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        {isSelf ? "Self-suspension locked" : "Toggle account active state"}
                      </p>
                    </div>

                    <Switch
                      id="modal-status-toggle"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={isSelf || !canModify || isSaving}
                      aria-label="Toggle user active status"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Visual Role Selector Cards (4 Cards Grid) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned Role & Privilege Tier
                  </span>
                  {isSelf ? (
                    <span className="text-xs text-muted-foreground">Self-role changes locked</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Click a role card to reassign</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ADMIN_ROLES.map((r) => {
                    const rDef = ROLE_DEFINITIONS[r]
                    const Icon = rDef.icon
                    const isSelected = role === r

                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => {
                          if (!isSelf && canModify && !isSaving) {
                            setRole(r)
                          }
                        }}
                        disabled={isSelf || !canModify || isSaving}
                        className={cn(
                          "p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all relative group cursor-pointer shadow-2xs hover:shadow-xs",
                          isSelf || !canModify
                            ? "opacity-80 cursor-not-allowed"
                            : "hover:border-primary/40",
                          isSelected
                            ? cn("border-2 shadow-xs ring-1 ring-primary/20", rDef.borderActive, rDef.bgSelected)
                            : "border-border/80 bg-card hover:bg-muted/30"
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className={cn("p-2 rounded-xl border shrink-0 transition-transform group-hover:scale-105", rDef.badgeColor)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {isSelected ? (
                            <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-border/80 shrink-0 group-hover:border-primary/50" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">{rDef.title}</h4>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                            {rDef.tagline}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 pt-0.5">
                            {rDef.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Operational Clearance Scopes for Selected Role */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-muted/15 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Operational Clearance for {currentRoleDef.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">Principle of least privilege</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentRoleDef.domains.map((domain, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors",
                        domain.allowed
                          ? "bg-card border-border/70 text-foreground"
                          : "bg-muted/40 border-dashed border-border/60 text-muted-foreground/80 opacity-75"
                      )}
                    >
                      {domain.allowed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs leading-tight text-foreground">{domain.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] px-1.5 py-0 font-normal leading-tight",
                              domain.allowed
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {domain.allowed ? "Permitted" : "Restricted"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{domain.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 2: SECURITY & CREDENTIALS ── */}
            <TabsContent value="security" className="mt-0 space-y-6 outline-none">
              {/* Zero-Knowledge Security Policy Banner */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                <div className="space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-xs sm:text-sm text-foreground">Zero-Knowledge Credential Policy Active</p>
                  <p className="text-xs text-muted-foreground">
                    Super administrators cannot view or directly set passwords for other users. Authentication secrets are established privately by the account owner using single-use cryptographic tokens (NIST SP 800-63B / SOC 2 compliance).
                  </p>
                </div>
              </div>

              {/* 1. Two-Column Zero-Knowledge Recovery Console */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Column A: Automated Email Dispatch */}
                {canModify ? (
                  <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          Automated Email Dispatch
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Send an official, branded recovery email directly to <strong>{user.email}</strong> with a single-use link valid for 24 hours.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {emailSentSuccess && (
                        <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>Reset email dispatched to {user.email}.</span>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleSendResetEmail}
                        disabled={isSendingEmail}
                        className="h-9 w-full sm:w-auto text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Dispatching Email...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Send Password Reset Email</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border bg-muted/20 text-xs text-muted-foreground">
                    Only Super Administrators have permission to initiate credential recovery.
                  </div>
                )}

                {/* Column B: Manual Single-Use Recovery Link */}
                {canModify ? (
                  <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5 text-indigo-500" />
                          Manual Setup Link
                        </span>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80">
                          Single-Use
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Generate a signed 24-hour setup URL for manual handoff (e.g. sharing securely via WhatsApp, Signal, or Slack).
                      </p>
                    </div>

                    {recoveryLink ? (
                      <div className="p-3 rounded-xl border border-indigo-500/30 bg-background space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-600 flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ready · Single-use link
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">Expires in 24h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Input
                            readOnly
                            value={recoveryLink}
                            className="h-8 font-mono text-[11px] bg-muted/40 select-all"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCopyRecoveryLink}
                            className="h-8 px-2.5 text-xs gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedRecoveryLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedRecoveryLink ? "Copied" : "Copy"}</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateRecoveryLink}
                        disabled={isGeneratingLink}
                        className="h-9 w-full sm:w-auto text-xs gap-1.5 cursor-pointer self-start"
                      >
                        {isGeneratingLink ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Generate Secure Link</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* 2. Identity & Authentication Metadata (3-Cell Bento) */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Authentication & Identity Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      Auth Provider
                    </span>
                    <span className="font-semibold text-foreground text-xs block">
                      Supabase Auth (JWT)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-muted-foreground" />
                      User UUID
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="font-mono text-[11px] text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate w-full text-left"
                      title="Click to copy full ID"
                    >
                      <span className="truncate">{user.id}</span>
                      <Copy className="h-3 w-3 shrink-0 opacity-60" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Member Since
                    </span>
                    <span className="font-semibold text-foreground text-xs block">
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Danger Zone: Permanent Account Revocation */}
              {canModify && !isSelf && (
                <div className="p-4 sm:p-5 rounded-2xl border border-destructive/20 bg-destructive/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs sm:text-sm font-bold text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Danger Zone: Permanent Account Revocation
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                      Irreversibly delete this administrator record from Supabase Auth and database tables. Active sessions are immediately terminated.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        className="h-9 text-xs sm:text-sm gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Administrator Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete <strong>{user.full_name}</strong> ({user.email})?
                          This action is irreversible and immediately terminates all active administrative access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          {isDeleting ? "Deleting..." : "Confirm Permanent Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 3: AUDIT TRAIL ── */}
            <TabsContent value="activity" className="mt-0 space-y-4 outline-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">Recent Security & Activity History</h4>
                  <p className="text-xs text-muted-foreground">Chronological log of administrative actions linked to this account.</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                    <button
                      type="button"
                      onClick={() => setUserLogsDisplayMode("plain")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                        userLogsDisplayMode === "plain"
                          ? "bg-background text-foreground shadow-2xs font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Display human-readable descriptions (Default)"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Plain Language</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserLogsDisplayMode("json")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                        userLogsDisplayMode === "json"
                          ? "bg-background text-foreground shadow-2xs font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Display raw JSON payloads"
                    >
                      <Code className="h-3 w-3" />
                      <span>Raw JSON</span>
                    </button>
                  </div>

                  {loadingLogs && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>

              {logs.length === 0 && !loadingLogs ? (
                <div className="p-12 sm:p-14 rounded-2xl border border-dashed border-border/80 text-center space-y-2">
                  <History className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No recent activity logged</p>
                  <p className="text-xs text-muted-foreground">
                    Action entries will automatically appear here as operations are performed.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 divide-y divide-border/60 overflow-hidden bg-card text-xs sm:text-sm shadow-2xs">
                  {logs.map((log) => {
                    const formatted = formatAuditLogToPlainLanguage(log)
                    const theme = getActionTheme(log.action, log.entity_type)
                    const ActionIcon = theme.icon

                    return (
                      <div key={log.id} className="p-3.5 sm:p-4 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={cn("p-2 rounded-lg border mt-0.5 shrink-0", theme.iconContainer)}>
                            <ActionIcon className="h-4 w-4" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border", theme.badgeClass)}>
                                {log.action}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal">
                                {log.entity_type}
                              </Badge>
                            </div>

                            {userLogsDisplayMode === "plain" ? (
                              <div className="space-y-1">
                                <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                  {formatted.narrative || formatted.headline}
                                </p>
                                {formatted.attributes.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                    {formatted.attributes.map((attr, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-[10px] text-muted-foreground font-mono"
                                      >
                                        <span className="text-muted-foreground/70 font-sans">{attr.label}:</span>
                                        <span className="font-semibold text-foreground">{attr.value}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              log.new_data && typeof log.new_data === "object" && (
                                <p className="text-xs text-muted-foreground font-mono break-all bg-muted/40 p-2 rounded-lg">
                                  {JSON.stringify(log.new_data)}
                                </p>
                              )
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                          {new Date(log.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* 4. Spacious Modal Sticky Footer */}
        <div className="p-4 px-6 sm:px-8 border-t bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications pending.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                Account settings synchronized.
              </span>
            )}
            <span className="hidden md:inline text-muted-foreground/60 text-xs">
              (Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded">Ctrl+S</kbd> to save)
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRole(user.role)
                setIsActive(user.is_active)
                setFullName(user.full_name)
              }}
              disabled={!isDirty || isSaving}
              className="h-9 px-3.5 text-xs sm:text-sm cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving || !canModify}
              className="h-9 px-4 text-xs sm:text-sm min-w-[130px] shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
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
      </DialogContent>
    </Dialog>
  )
}
