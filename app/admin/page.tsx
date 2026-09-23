import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
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
  DonationTrendChart,
  ContentActivityChart,
  ProviderBreakdownChart,
  PendingActions,
  ActivityFeed,
  SystemHealthCard,
  FundraisingProgressChart,
  VolunteerSkillsChart,
  MonthlyVsOneTimeChart,
  EventCapacityChart,
  DonationByCategoryChart,
} from "@/components/admin/dashboard"

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

  return adminUser
}

async function getDashboardStats(role: AdminRole) {
  const supabase = await createClient()

  const stats: Record<string, number | string> = {}

  if (hasPermission(role, "projects")) {
    const { count } = await supabase.from("projects").select("*", { count: "exact", head: true })
    stats.projects = count || 0
  }

  if (hasPermission(role, "events")) {
    const { count } = await supabase.from("events").select("*", { count: "exact", head: true })
    stats.events = count || 0
  }

  if (hasPermission(role, "stories")) {
    const { count } = await supabase.from("stories").select("*", { count: "exact", head: true })
    stats.stories = count || 0
  }

  if (hasPermission(role, "team")) {
    const { count } = await supabase.from("team_members").select("*", { count: "exact", head: true })
    stats.team = count || 0
  }

  if (hasPermission(role, "partners")) {
    const { count } = await supabase.from("partners").select("*", { count: "exact", head: true })
    stats.partners = count || 0
  }

  if (canViewFinance(role)) {
    const { count: donationsCount } = await supabase.from("donations").select("*", { count: "exact", head: true })
    const { data: donationsTotal } = await supabase.from("donations").select("amount").eq("payment_status", "completed")
    stats.donations = donationsCount || 0
    stats.totalDonations = donationsTotal?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  }

  if (hasPermission(role, "volunteers")) {
    const { count } = await supabase
      .from("volunteer_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
    stats.pendingVolunteers = count || 0
  }

  if (hasPermission(role, "contacts")) {
    const { count } = await supabase.from("contact_submissions").select("*", { count: "exact", head: true })
    stats.contacts = count || 0
  }

  if (hasPermission(role, "newsletters")) {
    const { count } = await supabase
      .from("newsletter_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
    stats.subscribers = count || 0
  }

  if (canManageUsers(role)) {
    const { count } = await supabase.from("admin_users").select("*", { count: "exact", head: true })
    stats.adminUsers = count || 0
  }

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

  const { data: receipts } = await supabase
    .from("donations")
    .select("id")
    .gte("created_at", oneDayAgo)

  const { data: failures } = await supabase
    .from("receipt_failures")
    .select("id")
    .gte("created_at", oneDayAgo)

  const totalReceipts = (receipts?.length || 0) + (failures?.length || 0)
  const receiptSuccessRate = totalReceipts > 0 ? ((totalReceipts - (failures?.length || 0)) / totalReceipts) * 100 : 100

  const { data: emails } = await supabase
    .from("donations")
    .select("id")
    .eq("receipt_sent", true)
    .gte("created_at", oneDayAgo)

  const { data: emailFailures } = await supabase
    .from("email_failures")
    .select("id")
    .gte("created_at", oneDayAgo)

  const totalEmails = (emails?.length || 0) + (emailFailures?.length || 0)
  const emailSuccessRate = totalEmails > 0 ? ((totalEmails - (emailFailures?.length || 0)) / totalEmails) * 100 : 100

  return { receiptSuccessRate, emailSuccessRate }
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect("/admin/login")
  }

  const role = adminUser.role as AdminRole
  const stats = await getDashboardStats(role)
  const [trends, recentActivity, pendingActions, systemHealth] = await Promise.all([
    getDashboardTrends(role),
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

  if (hasPermission(role, "projects")) {
    quickActions.push({
      href: "/admin/projects/new",
      icon: FolderKanban,
      title: "Add New Project",
    })
  }

  if (hasPermission(role, "events")) {
    quickActions.push({
      href: "/admin/events/new",
      icon: Calendar,
      title: "Create Event",
    })
  }

  if (hasPermission(role, "stories")) {
    quickActions.push({
      href: "/admin/stories/new",
      icon: FileText,
      title: "Write Story",
    })
  }

  if (hasPermission(role, "stats")) {
    quickActions.push({
      href: "/admin/stats",
      icon: BarChart3,
      title: "Update Stats",
    })
  }

  if (hasPermission(role, "settings")) {
    quickActions.push({
      href: "/admin/settings",
      icon: Settings,
      title: "Site Settings",
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {adminUser.full_name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your foundation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="w-fit">
            {getRoleDisplayName(role)}
          </Badge>
        </div>
      </div>

      {/* Role Info Card */}
      {role !== "SUPER_ADMIN" && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{getRoleDisplayName(role)}:</span>{" "}
              {getRoleDescription(role)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            href={stat.href}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Quick Actions Row */}
      {quickActions.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <action.icon className="h-4 w-4" />
                  {action.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row — Finance roles */}
      {canViewFinance(role) && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
              <DonationTrendChart />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ChartSkeleton />}>
              <ProviderBreakdownChart />
            </Suspense>
          </div>
        </div>
      )}

      {/* Finance Insights Row */}
      {canViewFinance(role) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<ChartSkeleton />}>
            <MonthlyVsOneTimeChart />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <DonationByCategoryChart />
          </Suspense>
        </div>
      )}

      {/* Charts Row — Content roles */}
      {hasPermission(role, "projects") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<ChartSkeleton />}>
            <ContentActivityChart />
          </Suspense>
          <div>
            <Suspense fallback={<ChartSkeleton />}>
              <PendingActions actions={pendingActions} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Projects & Volunteers Row */}
      {hasPermission(role, "projects") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<ChartSkeleton />}>
            <FundraisingProgressChart />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <VolunteerSkillsChart />
          </Suspense>
        </div>
      )}

      {/* Events Row */}
      {hasPermission(role, "events") && (
        <Suspense fallback={<ChartSkeleton />}>
          <EventCapacityChart />
        </Suspense>
      )}

      {/* System Health — Admin only */}
      {systemHealth && (
        <SystemHealthCard
          receiptSuccessRate={systemHealth.receiptSuccessRate}
          emailSuccessRate={systemHealth.emailSuccessRate}
        />
      )}

      {/* Activity Feed */}
      <ActivityFeed activities={recentActivity} />
    </div>
  )
}
