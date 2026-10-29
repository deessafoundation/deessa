import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"

export default async function NewTeamMemberPage() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/team"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Team
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Add Team Member</h1>
        <p className="text-muted-foreground">Add a new team member to display on your website</p>
      </div>

      <TeamMemberForm />
    </div>
  )
}
