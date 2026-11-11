"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Eye,
  EyeOff,
  Key,
  Sparkles,
  Loader2,
  CheckCircle2,
  Shield,
  ShieldAlert,
  FileText,
  CreditCard,
  User,
  Mail,
  Lock,
  Check,
  ShieldCheck,
} from "lucide-react"
import { createAdminUser } from "@/lib/actions/admin-users"
import { notifications } from "@/lib/notifications"
import { ADMIN_ROLES } from "@/lib/validations/admin-users"
import type { AdminRole } from "@/lib/types/admin"
import { cn } from "@/lib/utils"

interface CreateAdminUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_DETAILS: Record<
  AdminRole,
  {
    title: string
    tagline: string
    description: string
    icon: React.ElementType
    badgeColor: string
    borderActive: string
    bgSelected: string
    permissions: string[]
  }
> = {
  SUPER_ADMIN: {
    title: "Super Admin",
    tagline: "Unrestricted Authority",
    description: "Complete access across all system settings, user credentials, and database tables.",
    icon: ShieldAlert,
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    borderActive: "border-rose-500 ring-2 ring-rose-500/20",
    bgSelected: "bg-rose-500/[0.04]",
    permissions: ["Full system control", "Manage admin users", "Site configuration", "Financial reviews"],
  },
  ADMIN: {
    title: "Administrator",
    tagline: "Operations & Inquiries",
    description: "Moderate submissions, publish site content, handle support tickets, and view metrics.",
    icon: Shield,
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    borderActive: "border-indigo-500 ring-2 ring-indigo-500/20",
    bgSelected: "bg-indigo-500/[0.04]",
    permissions: ["Manage programs & stories", "Event registrations", "Volunteer reviews", "View finances"],
  },
  EDITOR: {
    title: "Content Editor",
    tagline: "Editorial & Media",
    description: "Drafting, editing, and publishing news, programs, photo essays, and announcements.",
    icon: FileText,
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
    bgSelected: "bg-emerald-500/[0.04]",
    permissions: ["Publish stories & events", "Edit team profiles", "Homepage content", "No financial access"],
  },
  FINANCE: {
    title: "Finance Manager",
    tagline: "Donations & Receipts",
    description: "Specialized in donation verification, bank transfer reconciliation, and tax receipts.",
    icon: CreditCard,
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    bgSelected: "bg-purple-500/[0.04]",
    permissions: ["Direct donations review", "Bank transfer approvals", "Payment transaction logs", "Tax receipts"],
  },
}

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "Empty", color: "bg-muted" }
  let score = 0
  if (pass.length >= 8) score += 1
  if (pass.length >= 12) score += 1
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass)) score += 1

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" }
  if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500" }
  return { score: 3, label: "Strong", color: "bg-emerald-500" }
}

export function CreateAdminUserModal({ open, onOpenChange }: CreateAdminUserModalProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<AdminRole>("EDITOR")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*"
    let generated = ""
    for (let i = 0; i < 14; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(generated)
    setShowPassword(true)
    notifications.showInfo({
      title: "Strong Password Generated",
      description: "Remember to share this temporary password securely with the user.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || password.length < 8) return

    setIsSubmitting(true)

    try {
      const result = await createAdminUser({
        fullName,
        email,
        password,
        role,
      })

      if (result.error) {
        notifications.showError({
          title: "Failed to Create User",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Admin Account Created",
          description: `${fullName} has been granted ${ROLE_DETAILS[role].title} access.`,
        })
        onOpenChange(false)
        setFullName("")
        setEmail("")
        setPassword("")
        setRole("EDITOR")
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to create administrator account.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeRoleDetails = ROLE_DETAILS[role] || ROLE_DETAILS.EDITOR
  const passwordStrength = calculatePasswordStrength(password)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-2xl md:max-w-3xl max-w-2xl h-auto max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Provision Administrator Account
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Create a privileged team credential with scoped access control and audit tracking.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body: Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Identity Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Team Member Identity
                </span>
                <span className="text-[11px] text-muted-foreground">Required fields *</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="create-fullName" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-fullName"
                    placeholder="e.g. Alisha Shrestha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-10 text-xs sm:text-sm bg-background"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="create-email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Work Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="alisha@deessa.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-10 text-xs sm:text-sm bg-background"
                  />
                </div>
              </div>
            </div>

            {/* 2. Role Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Administrative Privilege Tier
                </span>
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5", activeRoleDetails.badgeColor)}>
                  {activeRoleDetails.title} Selected
                </Badge>
              </div>

              {/* Visual Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADMIN_ROLES.map((r) => {
                  const rDetails = ROLE_DETAILS[r]
                  const Icon = rDetails.icon
                  const isSelected = role === r

                  return (
                    <div
                      key={r}
                      onClick={() => !isSubmitting && setRole(r)}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer",
                        isSelected
                          ? cn("border-2 shadow-xs", rDetails.borderActive, rDetails.bgSelected)
                          : "border-border/80 bg-card hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg border", rDetails.badgeColor)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-foreground">{rDetails.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{rDetails.tagline}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {rDetails.description}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Role Permissions Preview Box */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Permissions clearance for {activeRoleDetails.title}:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {activeRoleDetails.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Initial Credentials Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Security Credentials
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGeneratePassword}
                  disabled={isSubmitting}
                  className="h-6 text-[11px] px-2 text-primary hover:text-primary gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Strong Token
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Initial Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    className="h-10 pr-10 font-mono text-xs sm:text-sm bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Feedback */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Strength Assessment</span>
                      <span className={cn(
                        "font-semibold",
                        passwordStrength.score === 1 && "text-rose-600",
                        passwordStrength.score === 2 && "text-amber-600",
                        passwordStrength.score === 3 && "text-emerald-600"
                      )}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 h-1.5">
                      <div className={cn("rounded-full h-full transition-all", passwordStrength.score >= 1 ? passwordStrength.color : "bg-muted")} />
                      <div className={cn("rounded-full h-full transition-all", passwordStrength.score >= 2 ? passwordStrength.color : "bg-muted")} />
                      <div className={cn("rounded-full h-full transition-all", passwordStrength.score >= 3 ? passwordStrength.color : "bg-muted")} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Sticky Footer */}
          <div className="p-4 border-t bg-card flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Password will be encrypted via Supabase Auth.
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !email.trim() || password.length < 8}
                className="h-9 text-xs min-w-[150px] shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
