import { createClient } from "@/lib/supabase/server"
import { getCachedAdminUser } from "@/lib/supabase/get-admin-user"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FolderKanban,
  Calendar,
  FileText,
  Users,
  HandHeart,
  Heart,
  MessageSquare,
  Building,
  BarChart3,
  Newspaper,
  Settings,
  UserCog,
  Home,
  LayoutDashboard,
  IndianRupee,
  Layers,
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import {
  type AdminRole,
  hasPermission,
  canViewFinance,
  canManageUsers,
  getRoleDisplayName,
  getRoleDescription,
} from "@/lib/types/admin"
import { getDashboardTrends, getPendingActions } from "@/lib/actions/admin-dashboard"
import {
  DashboardStatCard,
  KpiMetricsGrid,
  DonationTrendChart,
  ContentActivityChart,
  ProviderBreakdownChart,
  PendingActions,
  ActivityFeed,
  SystemHealthCard,
  DashboardDateFilter,
  FundraisingProgressChart,
  VolunteerSkillsChart,
  MonthlyVsOneTimeChart,
  EventCapacityChart,
  DonationByCategoryChart,
} from "@/components/admin/dashboard"

async function getDashboardStats(role: AdminRole) {
  const supabase = await createClient()
  const stats: Record<string, number | string> = {}
  const promises: Promise<void>[] = []

  if (hasPermission(role, "projects")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("projects").select("*", { count: "exact", head: true })
        stats.projects = count || 0
      })()
    )
  }

  if (hasPermission(role, "events")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("events").select("*", { count: "exact", head: true })
        stats.events = count || 0
      })()
    )
  }

  if (hasPermission(role, "stories")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("stories").select("*", { count: "exact", head: true })
        stats.stories = count || 0
      })()
    )
  }

  if (hasPermission(role, "team")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("team_members").select("*", { count: "exact", head: true })
        stats.team = count || 0
      })()
    )
  }

  if (hasPermission(role, "partners")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("partners").select("*", { count: "exact", head: true })
        stats.partners = count || 0
      })()
    )
  }

  if (canViewFinance(role)) {
    promises.push(
      (async () => {
        const [countRes, totalRes] = await Promise.all([
          supabase.from("donations").select("*", { count: "exact", head: true }),
          supabase.from("donations").select("amount").eq("payment_status", "completed"),
        ])
        stats.donations = countRes.count || 0
        stats.totalDonations = totalRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      })()
    )
  }

  if (hasPermission(role, "volunteers")) {
    promises.push(
      (async () => {
        const { count } = await supabase
          .from("volunteer_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
        stats.pendingVolunteers = count || 0
      })()
    )
  }

  if (hasPermission(role, "contacts")) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("contact_submissions").select("*", { count: "exact", head: true })
        stats.contacts = count || 0
      })()
    )
  }

  if (hasPermission(role, "newsletters")) {
    promises.push(
      (async () => {
        const { count } = await supabase
          .from("newsletter_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
        stats.subscribers = count || 0
      })()
    )
  }

  if (canManageUsers(role)) {
    promises.push(
      (async () => {
        const { count } = await supabase.from("admin_users").select("*", { count: "exact", head: true })
        stats.adminUsers = count || 0
      })()
    )
  }

  await Promise.all(promises)
  return stats
}

async function getRecentActivity(role: AdminRole, userId: string) {
  const supabase = await createClient()

  const query = supabase
    .from("activity_logs")
    .select(`
      *,
      user:admin_users(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(15)

  if (role === "EDITOR" || role === "FINANCE") {
    query.eq("user_id", userId)
  }

  const { data } = await query
  return data || []
}

async function getSystemHealth() {
  const supabase = await createClient()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [receiptsRes, failuresRes, emailsRes, emailFailuresRes] = await Promise.all([
    supabase.from("donations").select("id").gte("created_at", oneDayAgo),
    supabase.from("receipt_failures").select("id").gte("created_at", oneDayAgo),
    supabase.from("donations").select("id").eq("receipt_sent", true).gte("created_at", oneDayAgo),
    supabase.from("email_failures").select("id").gte("created_at", oneDayAgo),
  ])

  const receipts = receiptsRes.data
  const failures = failuresRes.data
  const totalReceipts = (receipts?.length || 0) + (failures?.length || 0)
  const receiptSuccessRate = totalReceipts > 0 ? ((totalReceipts - (failures?.length || 0)) / totalReceipts) * 100 : 100

  const emails = emailsRes.data
  const emailFailures = emailFailuresRes.data
  const totalEmails = (emails?.length || 0) + (emailFailures?.length || 0)
  const emailSuccessRate = totalEmails > 0 ? ((totalEmails - (emailFailures?.length || 0)) / totalEmails) * 100 : 100

  return { receiptSuccessRate, emailSuccessRate }
}

function ChartSkeleton() {
  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <div className="p-4 sm:p-6 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
      <CardContent className="px-3 sm:px-6">
        <Skeleton className="h-[240px] sm:h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ range?: string; view?: string; tab?: string }>
}) {
  const adminUser = await getCachedAdminUser()

  if (!adminUser) {
    redirect("/admin/login")
  }

  const resolvedParams = props.searchParams ? await props.searchParams : {}
  const range = resolvedParams.range || "30d"
  const activeTab = resolvedParams.tab || resolvedParams.view || "overview"
  const role = adminUser.role as AdminRole

  const [stats, trends, recentActivity, pendingActions, systemHealth] = await Promise.all([
    getDashboardStats(role),
    getDashboardTrends(role, range),
    getRecentActivity(role, adminUser.id),
    getPendingActions(role),
    canManageUsers(role) ? getSystemHealth() : Promise.resolve(null),
  ])

  const statCards = []

  if (hasPermission(role, "projects")) {
    statCards.push({
      title: "Total Projects",
      value: stats.projects,
      icon: "FolderKanban",
      href: "/admin/projects",
      color: "text-blue-600",
      trend: trends.projects,
    })
  }

  if (hasPermission(role, "events")) {
    statCards.push({
      title: "Events",
      value: stats.events,
      icon: "Calendar",
      href: "/admin/events",
      color: "text-green-600",
      trend: trends.events,
    })
  }

  if (hasPermission(role, "stories")) {
    statCards.push({
      title: "Stories",
      value: stats.stories,
      icon: "FileText",
      href: "/admin/stories",
      color: "text-purple-600",
      trend: trends.stories,
    })
  }

  if (hasPermission(role, "team")) {
    statCards.push({
      title: "Team Members",
      value: stats.team,
      icon: "Users",
      href: "/admin/team",
      color: "text-orange-600",
      trend: trends.team,
    })
  }

  if (hasPermission(role, "partners")) {
    statCards.push({
      title: "Partners",
      value: stats.partners,
      icon: "Building",
      href: "/admin/partners",
      color: "text-cyan-600",
      trend: trends.partners,
    })
  }

  if (canViewFinance(role)) {
    statCards.push({
      title: "Total Donations",
      value: `₹${((stats.totalDonations as number) || 0).toLocaleString()}`,
      icon: "HandHeart",
      href: "/admin/donations",
      color: "text-pink-600",
      trend: trends.totalDonations,
    })
  }

  if (hasPermission(role, "volunteers")) {
    statCards.push({
      title: "Pending Volunteers",
      value: stats.pendingVolunteers,
      icon: "Heart",
      href: "/admin/volunteers",
      color: "text-red-600",
      trend: trends.pendingVolunteers,
    })
  }

  if (hasPermission(role, "contacts")) {
    statCards.push({
      title: "Contact Messages",
      value: stats.contacts,
      icon: "MessageSquare",
      href: "/admin/contacts",
      color: "text-amber-600",
      trend: trends.contacts,
    })
  }

  if (hasPermission(role, "newsletters")) {
    statCards.push({
      title: "Subscribers",
      value: stats.subscribers,
      icon: "Newspaper",
      href: "/admin/newsletter",
      color: "text-indigo-600",
      trend: trends.subscribers,
    })
  }

  if (canManageUsers(role)) {
    statCards.push({
      title: "Admin Users",
      value: stats.adminUsers,
      icon: "UserCog",
      href: "/admin/users",
      color: "text-slate-600",
      trend: undefined,
    })
  }

  const quickActions = []

  if (hasPermission(role, "settings") || hasPermission(role, "projects")) {
    quickActions.push({
      href: "/admin/homepage",
      icon: Home,
      title: "Homepage CMS",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400",
    })
  }

  if (hasPermission(role, "projects")) {
    quickActions.push({
      href: "/admin/projects/new",
      icon: FolderKanban,
      title: "Add Project",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
    })
  }

  if (hasPermission(role, "events")) {
    quickActions.push({
      href: "/admin/events/new",
      icon: Calendar,
      title: "Create Event",
      color: "text-green-600 bg-green-50 dark:bg-green-950/60 dark:text-green-400",
    })
  }

  if (hasPermission(role, "stories")) {
    quickActions.push({
      href: "/admin/stories/new",
      icon: FileText,
      title: "Write Story",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
    })
  }

  if (canViewFinance(role)) {
    quickActions.push({
      href: "/admin/donations",
      icon: HandHeart,
      title: "Donations",
      color: "text-pink-600 bg-pink-50 dark:bg-pink-950/60 dark:text-pink-400",
    })
  }

  if (hasPermission(role, "volunteers")) {
    quickActions.push({
      href: "/admin/volunteers",
      icon: Heart,
      title: "Volunteers",
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400",
    })
  }

  if (hasPermission(role, "stats")) {
    quickActions.push({
      href: "/admin/stats",
      icon: BarChart3,
      title: "Update Stats",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
    })
  }

  if (hasPermission(role, "settings")) {
    quickActions.push({
      href: "/admin/settings",
      icon: Settings,
      title: "Site Settings",
      color: "text-slate-600 bg-slate-100 dark:bg-slate-900/60 dark:text-slate-300",
    })
  }

  const hasContent = hasPermission(role, "projects") || hasPermission(role, "events") || hasPermission(role, "stories")
  const hasCommunity = hasPermission(role, "volunteers") || hasPermission(role, "contacts") || hasPermission(role, "newsletters")

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Executive Welcome & Timeframe Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {adminUser.full_name.split(" ")[0]}
            </h1>
            <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2 bg-muted/50 border-primary/20 text-foreground">
              {getRoleDisplayName(role)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational dashboard and impact metrics for deessa Foundation.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <DashboardDateFilter />
        </div>
      </div>

      {/* Role Info Banner */}
      {role !== "SUPER_ADMIN" && (
        <Card className="bg-muted/30 border-dashed border-border/80">
          <CardContent className="py-3 px-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{getRoleDisplayName(role)} Access:</span>{" "}
              {getRoleDescription(role)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Overview */}
      <KpiMetricsGrid statCards={statCards} />

      {/* Quick Launch Strip */}
      {quickActions.length > 0 && (
        <div className="space-y-2.5 w-full min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 w-full min-w-0">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/40 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[84px] h-full min-w-0"
              >
                <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 mb-1.5 shrink-0", action.color)}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-tight px-1 truncate max-w-full">
                  {action.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cockpit Workspace Navigation */}
      <Tabs defaultValue={activeTab} className="space-y-6 w-full min-w-0">
        <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none touch-pan-x border-b border-border/40">
          <TabsList aria-label="Dashboard cockpit workspaces" className="h-auto bg-transparent border-0 p-0 gap-1.5 sm:gap-2 inline-flex w-auto justify-start min-w-full sm:min-w-0 pb-1.5">
            <TabsTrigger
              value="overview"
              className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:animate-pulse" />
              <span className="font-semibold transition-all">Overview</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
            </TabsTrigger>

            {canViewFinance(role) && (
              <TabsTrigger
                value="finance"
                className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
              >
                <IndianRupee className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:animate-pulse" />
                <span className="font-semibold transition-all">Finance & Giving</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
              </TabsTrigger>
            )}

            {hasContent && (
              <TabsTrigger
                value="content"
                className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
              >
                <FolderKanban className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:animate-pulse" />
                <span className="font-semibold transition-all">Programs & Content</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
              </TabsTrigger>
            )}

            {hasCommunity && (
              <TabsTrigger
                value="community"
                className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
              >
                <Users className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:animate-pulse" />
                <span className="font-semibold transition-all">Community & People</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
              </TabsTrigger>
            )}

            <TabsTrigger
              value="all"
              className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
            >
              <Layers className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:animate-pulse" />
              <span className="font-semibold transition-all">All Modules</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Executive Overview */}
        <TabsContent value="overview" className="space-y-6 focus-visible:outline-none w-full min-w-0">
          {/* Bento Row 1: Primary Pulse & Attention Items */}
          <div className="grid gap-6 lg:grid-cols-3 w-full min-w-0 items-stretch">
            <div className={cn("w-full min-w-0", canViewFinance(role) || hasPermission(role, "projects") ? "lg:col-span-2" : "lg:col-span-3")}>
              <Suspense fallback={<ChartSkeleton />}>
                {canViewFinance(role) ? (
                  <DonationTrendChart initialRange={range} />
                ) : (
                  <ContentActivityChart initialRange={range} />
                )}
              </Suspense>
            </div>
            <div className="w-full min-w-0 lg:col-span-1">
              <Suspense fallback={<ChartSkeleton />}>
                <PendingActions actions={pendingActions} />
              </Suspense>
            </div>
          </div>

          {/* Bento Row 2: Campaign & Program Highlights */}
          {(hasPermission(role, "projects") || canViewFinance(role)) && (
            <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0 items-stretch">
              {hasPermission(role, "projects") && (
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <FundraisingProgressChart />
                  </Suspense>
                </div>
              )}
              {canViewFinance(role) ? (
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ProviderBreakdownChart />
                  </Suspense>
                </div>
              ) : hasPermission(role, "events") ? (
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <EventCapacityChart />
                  </Suspense>
                </div>
              ) : null}
            </div>
          )}

          {/* Bento Row 3: Operations & Activity */}
          <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
            {systemHealth && (
              <div className="w-full min-w-0">
                <SystemHealthCard
                  receiptSuccessRate={systemHealth.receiptSuccessRate}
                  emailSuccessRate={systemHealth.emailSuccessRate}
                />
              </div>
            )}
            <div className={cn("w-full min-w-0", systemHealth ? "" : "lg:col-span-2")}>
              <ActivityFeed activities={recentActivity} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Finance & Giving */}
        {canViewFinance(role) && (
          <TabsContent value="finance" className="space-y-6 focus-visible:outline-none w-full min-w-0">
            <div className="grid gap-6 lg:grid-cols-3 w-full min-w-0">
              <div className="w-full min-w-0 lg:col-span-2">
                <Suspense fallback={<ChartSkeleton />}>
                  <DonationTrendChart initialRange={range} />
                </Suspense>
              </div>
              <div className="w-full min-w-0 lg:col-span-1">
                <Suspense fallback={<ChartSkeleton />}>
                  <ProviderBreakdownChart />
                </Suspense>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <MonthlyVsOneTimeChart />
                </Suspense>
              </div>
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <DonationByCategoryChart />
                </Suspense>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Tab 3: Programs & Content */}
        {hasContent && (
          <TabsContent value="content" className="space-y-6 focus-visible:outline-none w-full min-w-0">
            <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <ContentActivityChart initialRange={range} />
                </Suspense>
              </div>
              {hasPermission(role, "projects") && (
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <FundraisingProgressChart />
                  </Suspense>
                </div>
              )}
            </div>
            {hasPermission(role, "events") && (
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <EventCapacityChart />
                </Suspense>
              </div>
            )}
          </TabsContent>
        )}

        {/* Tab 4: Community & People */}
        {hasCommunity && (
          <TabsContent value="community" className="space-y-6 focus-visible:outline-none w-full min-w-0">
            <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
              {hasPermission(role, "volunteers") && (
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <VolunteerSkillsChart />
                  </Suspense>
                </div>
              )}
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <PendingActions actions={pendingActions} />
                </Suspense>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Tab 5: All Modules (Complete Comprehensive View) */}
        <TabsContent value="all" className="space-y-8 focus-visible:outline-none w-full min-w-0">
          {canViewFinance(role) && (
            <div className="space-y-4 w-full min-w-0">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Financial Operations & Revenue
              </h3>
              <div className="grid gap-6 lg:grid-cols-3 w-full min-w-0">
                <div className="w-full min-w-0 lg:col-span-2">
                  <Suspense fallback={<ChartSkeleton />}>
                    <DonationTrendChart initialRange={range} />
                  </Suspense>
                </div>
                <div className="w-full min-w-0 lg:col-span-1">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ProviderBreakdownChart />
                  </Suspense>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <MonthlyVsOneTimeChart />
                  </Suspense>
                </div>
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <DonationByCategoryChart />
                  </Suspense>
                </div>
              </div>
            </div>
          )}

          {hasPermission(role, "projects") && (
            <div className="space-y-4 w-full min-w-0">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Content & Editorial Activity
              </h3>
              <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ContentActivityChart initialRange={range} />
                  </Suspense>
                </div>
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <PendingActions actions={pendingActions} />
                  </Suspense>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2 w-full min-w-0">
                <div className="w-full min-w-0">
                  <Suspense fallback={<ChartSkeleton />}>
                    <FundraisingProgressChart />
                  </Suspense>
                </div>
                {hasPermission(role, "volunteers") && (
                  <div className="w-full min-w-0">
                    <Suspense fallback={<ChartSkeleton />}>
                      <VolunteerSkillsChart />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasPermission(role, "events") && (
            <div className="space-y-4 w-full min-w-0">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Events & Engagements
              </h3>
              <div className="w-full min-w-0">
                <Suspense fallback={<ChartSkeleton />}>
                  <EventCapacityChart />
                </Suspense>
              </div>
            </div>
          )}

          <div className="space-y-4 w-full min-w-0">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              System Operations & Audit Logs
            </h3>
            {systemHealth && (
              <div className="w-full min-w-0">
                <SystemHealthCard
                  receiptSuccessRate={systemHealth.receiptSuccessRate}
                  emailSuccessRate={systemHealth.emailSuccessRate}
                />
              </div>
            )}
            <div className="w-full min-w-0">
              <ActivityFeed activities={recentActivity} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
