import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { getImpactStats } from "@/lib/actions/admin-stats"
import { hasPermission } from "@/lib/types/admin"
import { StatsListClient } from "@/components/admin/impact/stats-list-client"

export const metadata: Metadata = {
  title: "Impact Statistics | Admin",
  description: "Manage figures, key metrics, and progress milestones shown across the homepage and impact page.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ImpactStatsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  const canManageStats = hasPermission(admin.role, "stats")
  if (!canManageStats) redirect("/admin")

  const stats = await getImpactStats()

  return <StatsListClient initialStats={stats} />
}
