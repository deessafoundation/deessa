"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileOverviewCard } from "./profile-overview-card"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { RoleClearanceCard } from "./role-clearance-card"
import { ProfileActivityLedger } from "./profile-activity-ledger"
import { SessionManagerCard } from "./session-manager-card"
import { MfaPostureCard } from "./mfa-posture-card"
import { PreferencesForm } from "./preferences-form"
import {
  User,
  KeyRound,
  ShieldCheck,
  Clock,
  ShieldAlert,
  Shield,
  FileText,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminRole, AdminUser } from "@/lib/types/admin"
import type { AdminActivityHistoryItem, PasswordHygieneMetrics } from "@/lib/actions/admin-profile"

interface ProfileHubProps {
  adminUser: AdminUser
  clientIp: string
  clientInfo: {
    browser: string
    os: string
    device: string
  }
  activityLogs: AdminActivityHistoryItem[]
  passwordHygiene?: PasswordHygieneMetrics
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
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    icon: ShieldAlert,
  },
  ADMIN: {
    label: "Administrator",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    icon: Shield,
  },
  EDITOR: {
    label: "Content Editor",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: FileText,
  },
  FINANCE: {
    label: "Finance Manager",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    icon: CreditCard,
  },
}

export function ProfileHub({
  adminUser,
  clientIp,
  clientInfo,
  activityLogs,
  passwordHygiene,
}: ProfileHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawTab = (searchParams.get("tab") || "profile").toLowerCase()
  const validTabs = ["profile", "security", "clearance", "activity", "preferences"]
  const activeTabId = validTabs.includes(rawTab) ? rawTab : "profile"

  const handleTabChange = (val: string) => {
    router.push(`/admin/profile?tab=${val}`, { scroll: false })
  }

  const roleTheme = ROLE_THEMES[adminUser.role as AdminRole] || ROLE_THEMES.EDITOR
  const RoleIcon = roleTheme.icon

  const PROFILE_TABS = [
    {
      id: "profile",
      label: "Profile Info",
      icon: User,
    },
    {
      id: "security",
      label: "Security & Password",
      icon: KeyRound,
    },
    {
      id: "clearance",
      label: "Clearance & Access",
      icon: ShieldCheck,
    },
    {
      id: "activity",
      label: "Audit Ledger",
      icon: Clock,
      badge: activityLogs.length,
    },
    {
      id: "preferences",
      label: "Preferences & Workflow",
      icon: SlidersHorizontal,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration Portal
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-medium text-foreground">Identity & Privileges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your personal identity, privileged security credentials, role authorization, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-xs px-2.5 py-1 font-semibold inline-flex items-center gap-1.5 shadow-2xs rounded-lg", roleTheme.badgeClass)}
          >
            <RoleIcon className="h-3.5 w-3.5" />
            <span>{roleTheme.label}</span>
          </Badge>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Active Session
          </span>
        </div>
      </div>

      {/* 2. Unified Portal Navigation Tabs (Matching Admin Settings & Dashboard) */}
      <Tabs value={activeTabId} onValueChange={handleTabChange} className="space-y-6 w-full min-w-0">
        <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none touch-pan-x border-b border-border/60">
          <TabsList
            aria-label="Profile navigation sections"
            className="h-auto bg-transparent border-0 p-0 gap-1.5 sm:gap-2 inline-flex w-auto justify-start min-w-full sm:min-w-0 pb-1.5"
          >
            {PROFILE_TABS.map((tab) => {
              const Icon = tab.icon

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground cursor-pointer overflow-hidden"
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="font-semibold transition-all">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono bg-muted-foreground/15 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* 3. Main Workspace Grid: Details on Left, Profile Overview Card on Right */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {/* Left Column (Desktop: 2 cols): Active Tab & Details Content */}
          <div className="lg:col-span-2 min-w-0">
            {/* TAB 1: Profile Information */}
            <TabsContent value="profile" className="mt-0 outline-none">
              <Card className="border border-border/80 shadow-xs rounded-2xl overflow-hidden bg-card">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/15">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Update your public administrative identity, contact avatar, and display details.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground shrink-0">
                      ID: {adminUser.id.slice(0, 8)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <ProfileForm adminUser={adminUser} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Security & Password */}
            <TabsContent value="security" className="mt-0 space-y-6 outline-none">
              <Card className="border border-border/80 shadow-xs rounded-2xl overflow-hidden bg-card">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/15">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                        Change Password
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Ensure your administrative account remains protected with strong, high-entropy credentials.
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Zero-Knowledge Guard
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <PasswordForm passwordHygiene={passwordHygiene} />
                </CardContent>
              </Card>

              {/* Active Session & Remote Device Invalidation Card */}
              <SessionManagerCard clientIp={clientIp} clientInfo={clientInfo} />

              {/* Multi-Factor Authentication Posture & Tier Enforcement */}
              <MfaPostureCard role={adminUser.role as AdminRole} />
            </TabsContent>

            {/* TAB 3: Role & Clearance */}
            <TabsContent value="clearance" className="mt-0 outline-none">
              <RoleClearanceCard role={adminUser.role as AdminRole} />
            </TabsContent>

            {/* TAB 4: Activity History */}
            <TabsContent value="activity" className="mt-0 outline-none">
              <Card className="border border-border/80 shadow-xs rounded-2xl overflow-hidden bg-card">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/15">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                        Personal Audit Ledger
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Chronological record of operations executed under {adminUser.full_name}.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0 shadow-2xs">
                      {activityLogs.length} Events Logged
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <ProfileActivityLedger
                    initialLogs={activityLogs}
                    adminName={adminUser.full_name}
                    defaultView={adminUser.preferences?.ledgerDefaultView || "table"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: Preferences & Personal Workflow */}
            <TabsContent value="preferences" className="mt-0 outline-none">
              <Card className="border border-border/80 shadow-xs rounded-2xl overflow-hidden bg-card">
                <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/15">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                        Preferences & Personal Workflow
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Configure your operational defaults, audit view modes, and administrative workspace environment.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground shrink-0">
                      Personal Workspace
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <PreferencesForm adminUser={adminUser} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Right Column (Desktop: 1 col): Profile Overview Card (Sticky on desktop) */}
          <div className="lg:col-span-1">
            <ProfileOverviewCard
              adminUser={adminUser}
              clientIp={clientIp}
              clientInfo={clientInfo}
              activityLogs={activityLogs}
              onSelectTab={(tab) => handleTabChange(tab)}
            />
          </div>
        </div>
      </Tabs>
    </div>
  )
}
