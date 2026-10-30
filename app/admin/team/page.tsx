import Link from "next/link"
import { getTeamMembers } from "@/lib/actions/admin-team"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Users, Eye, EyeOff, Star, ExternalLink } from "lucide-react"
import { TeamTable } from "@/components/admin/team/team-table"

export const metadata = {
  title: "Team & Governance | Admin",
  description: "Manage foundation team members and organizational tiers",
}

export default async function TeamPage() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")

  let team: any[] = []
  try {
    team = (await getTeamMembers()) || []
  } catch {
    return (
      <div role="alert" className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h1 className="text-xl font-bold text-destructive">Team members could not be loaded</h1>
        <p className="text-sm text-muted-foreground">
          Could not establish connection to the team records. Saved data has not been affected.
        </p>
        <a href="/admin/team" className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs">
          Try again
        </a>
      </div>
    )
  }

  const totalMembers = team.length
  const publishedCount = team.filter((m) => m.is_published).length
  const hiddenCount = totalMembers - publishedCount
  const heroCount = team.filter((m) => m.is_featured && m.is_published).length

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
            <span>About Foundation</span>
            <span>•</span>
            <span className="text-primary">Governance & Team</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Team Members
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Organize leadership, board members, advisors, and operational specialists across the 6 governance tiers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-10 text-xs gap-1.5 justify-center">
            <a href="/about#team" target="_blank" rel="noopener noreferrer">
              <span>View on Site</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </Button>

          <Button asChild size="sm" className="min-h-11 sm:min-h-10 text-xs gap-1.5 justify-center bg-brand-primary text-white hover:bg-brand-primary-dark">
            <Link href="/admin/team/new">
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Members</p>
            <Users className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {totalMembers}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Published</p>
            <Eye className="h-4 w-4 text-black dark:text-white" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Hidden</p>
            <EyeOff className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground/80">
            {hiddenCount}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Hero Collage</p>
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-amber-600">
            {heroCount} / 3
          </p>
        </div>
      </div>

      {/* Main Table Interface */}
      <TeamTable members={team} />
    </div>
  )
}
