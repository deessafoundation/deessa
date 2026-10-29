import Link from "next/link"
import { getTeamMembers } from "@/lib/actions/admin-team"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TeamTable } from "@/components/admin/team/team-table"

export default async function TeamPage() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")
  let team
  try { team = await getTeamMembers() }
  catch {
    return <div role="alert" className="space-y-4 rounded-xl border p-6">
      <h1 className="text-2xl font-bold">Team members could not be loaded</h1>
      <p>Refresh this page to try again. Saved team records have not been changed.</p>
      <a href="/admin/team" className="inline-flex min-h-11 items-center underline">Try again</a>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team</p>
        </div>
        <Button asChild>
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Link>
        </Button>
      </div>

      <TeamTable members={team} />
    </div>
  )
}
