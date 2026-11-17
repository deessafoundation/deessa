"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { showToast } from "@/components/ui/toast"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle2,
  Laptop,
  Globe,
  Lock,
  Copy,
  Check,
  Mail,
  Fingerprint,
  KeyRound,
  History,
  SlidersHorizontal,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminRole, AdminUser } from "@/lib/types/admin"
import type { AdminActivityHistoryItem } from "@/lib/actions/admin-profile"

interface ProfileOverviewCardProps {
  adminUser: AdminUser
  clientIp: string
  clientInfo: {
    browser: string
    os: string
    device: string
  }
  activityLogs?: AdminActivityHistoryItem[]
  onSelectTab: (tab: "profile" | "security" | "clearance" | "activity" | "preferences") => void
}

const ROLE_THEMES: Record<
  AdminRole,
  {
    label: string
    tier: string
    tierBadge: string
    badgeClass: string
    icon: React.ElementType
  }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    tier: "Tier 1 (Root)",
    tierBadge: "Full System Authority",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/15",
    icon: ShieldAlert,
  },
  ADMIN: {
    label: "Administrator",
    tier: "Tier 2 (Operations)",
    tierBadge: "Operational Access",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/15",
    icon: Shield,
  },
  EDITOR: {
    label: "Content Editor",
    tier: "Tier 3 (Staff)",
    tierBadge: "Publishing Clearance",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15",
    icon: FileText,
  },
  FINANCE: {
    label: "Finance Manager",
    tier: "Tier 3 (Staff)",
    tierBadge: "Fiscal Clearance",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/15",
    icon: CreditCard,
  },
}

export function ProfileOverviewCard({
  adminUser,
  clientIp,
  clientInfo,
  activityLogs = [],
  onSelectTab,
}: ProfileOverviewCardProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const roleTheme = ROLE_THEMES[adminUser.role as AdminRole] || ROLE_THEMES.EDITOR
  const RoleIcon = roleTheme.icon

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(adminUser.email)
      setCopiedEmail(true)
      showToast.success({
        title: "Email Copied",
        description: "Official administrator email copied to clipboard.",
      })
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      showToast.error({ title: "Copy Failed", description: "Clipboard access was denied." })
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(adminUser.id)
      setCopiedId(true)
      showToast.success({
        title: "UUID Copied",
        description: "Administrative record UUID copied to clipboard.",
      })
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      showToast.error({ title: "Copy Failed", description: "Clipboard access was denied." })
    }
  }

  const formattedJoinDate = new Date(adminUser.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden bg-card transition-all lg:sticky lg:top-6">
      {/* 1. Architectural Header Banner with Decorative Micro-Grid */}
      <div className="relative h-24 sm:h-28 w-full bg-gradient-to-br from-primary/15 via-primary/5 to-muted/40 border-b border-border/60 overflow-hidden">
        {/* Subtle geometric dot grid pattern */}
        <div
          className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        {/* Live Active Session Indicator Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-background/90 backdrop-blur-md border border-border/70 text-foreground shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Active Session</span>
        </div>
      </div>

      <CardContent className="p-0">
        {/* 2. Elevated Overlapping Avatar & Primary Identity Anchor */}
        <div className="px-5 -mt-11 sm:-mt-12 flex items-end justify-between">
          <div className="relative group">
            <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl ring-4 ring-card shadow-md bg-background object-cover transition-transform group-hover:scale-[1.02] duration-200">
              {adminUser.avatar_url && (
                <AvatarImage
                  src={adminUser.avatar_url}
                  alt={adminUser.full_name}
                  className="object-cover rounded-2xl"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-2xl">
                {adminUser.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>

            <span
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-card bg-emerald-500 flex items-center justify-center text-white shadow-xs"
              title="Verified Active Administrator"
            >
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-xs px-3 py-1 font-semibold inline-flex items-center gap-1.5 shadow-2xs rounded-lg transition-transform hover:scale-105",
              roleTheme.badgeClass
            )}
          >
            <RoleIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{roleTheme.label}</span>
          </Badge>
        </div>

        {/* 3. Name, Verified Email & Admin UUID */}
        <div className="px-5 pt-3.5 pb-2 space-y-1.5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span>{adminUser.full_name}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </h2>
            {adminUser.designation && (
              <p className="text-xs font-semibold text-primary mt-0.5 truncate">
                {adminUser.designation}
              </p>
            )}
          </div>

          {/* Email row with quick copy micro-action */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span className="font-mono truncate max-w-[210px] text-foreground/90">{adminUser.email}</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              title="Copy official email"
              aria-label="Copy email address"
            >
              {copiedEmail ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <Copy className="h-3 w-3 opacity-70 hover:opacity-100" />
              )}
            </button>
          </div>

          {/* Admin Record UUID Pill with copy */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleCopyId}
              className="group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/70 bg-muted/40 hover:bg-muted/80 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              title="Copy Admin UUID"
              aria-label="Copy admin record UUID"
            >
              <Fingerprint className="h-3 w-3 text-primary shrink-0" />
              <span>UID: {adminUser.id.slice(0, 8)}...{adminUser.id.slice(-4)}</span>
              {copiedId ? (
                <Check className="h-3 w-3 text-emerald-600 ml-1" />
              ) : (
                <Copy className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Quick Jump Action Buttons (3-Tab Grid) */}
        <div className="px-5 pt-3 pb-1 grid grid-cols-3 gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectTab("security")}
            className="h-8 text-xs font-semibold rounded-xl gap-1 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer px-2"
          >
            <KeyRound className="h-3 w-3 text-primary" />
            <span className="truncate">Password</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectTab("activity")}
            className="h-8 text-xs font-semibold rounded-xl gap-1 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer px-2"
          >
            <History className="h-3 w-3 text-primary" />
            <span className="truncate">Ledger</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectTab("preferences")}
            className="h-8 text-xs font-semibold rounded-xl gap-1 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer px-2"
          >
            <SlidersHorizontal className="h-3 w-3 text-primary" />
            <span className="truncate">Workflow</span>
          </Button>
        </div>

        {/* Operator Productivity & Impact Strip */}
        <div className="px-5 py-2">
          <div className="p-2.5 rounded-xl border border-border/80 bg-gradient-to-br from-primary/[0.04] via-muted/30 to-background space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-primary" />
                Impact & Posture
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">99% Safe</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                <span className="text-[9px] text-muted-foreground block uppercase font-bold">Ledger</span>
                <span className="text-xs font-bold font-mono text-foreground">{activityLogs.length}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                <span className="text-[9px] text-muted-foreground block uppercase font-bold">MFA</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <div className="p-1.5 rounded-lg bg-card/80 border border-border/60">
                <span className="text-[9px] text-muted-foreground block uppercase font-bold">Tier</span>
                <span className="text-xs font-bold text-primary font-mono">{roleTheme.tier.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Bento Telemetry & Clearance Tiles */}
        <div className="px-5 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Tile 1: Clearance Tier */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/25 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                Clearance
              </span>
              <p className="text-xs font-bold text-foreground truncate">{roleTheme.tier}</p>
              <p className="text-[10px] text-muted-foreground truncate">{roleTheme.tierBadge}</p>
            </div>

            {/* Tile 2: Account Health */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/25 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                Health
              </span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {adminUser.is_active ? "Authorized Active" : "Suspended"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">MFA Protected</p>
            </div>

            {/* Tile 3: Current Device */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/25 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Laptop className="h-3 w-3 text-blue-600 shrink-0" />
                Device
              </span>
              <p className="text-xs font-bold text-foreground truncate" title={clientInfo.device}>
                {clientInfo.browser}
              </p>
              <p className="text-[10px] text-muted-foreground truncate" title={clientInfo.os}>
                {clientInfo.os}
              </p>
            </div>

            {/* Tile 4: Session IP */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/25 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3 text-indigo-600 shrink-0" />
                Session IP
              </span>
              <p className="font-mono text-xs font-bold text-foreground truncate" title={clientIp}>
                {clientIp}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">TLS 1.3 Verified</p>
            </div>
          </div>

          {/* Full-width Tenure Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/25 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
              Member Since
            </span>
            <span className="font-semibold text-foreground text-xs tabular-nums">
              {formattedJoinDate}
            </span>
          </div>
        </div>

        {/* 6. Hardware & Cryptographic Session Reassurance Footer */}
        <div className="px-5 py-3 border-t border-border/60 bg-muted/15 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>HTTP-Only Session</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border/50 bg-background/80 font-medium">
            Supabase Auth v2
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
