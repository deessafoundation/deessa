import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TeamTable } from "@/components/admin/team-table"

async function getTeamMembers() {
  const supabase = await createClient()
  const { data } = await supabase.from("team_members").select("*").order("sort_order", { ascending: true })
  return data || []
}

export default async function TeamPage() {
  const team = await getTeamMembers()

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
