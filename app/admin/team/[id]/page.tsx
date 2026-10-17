import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getTeamMember } from "@/lib/actions/admin-team"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")
  const member = await getTeamMember(id)

  if (!member) {
    notFound()
  }

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
        <h1 className="text-2xl font-bold">Edit Team Member</h1>
        <p className="text-muted-foreground">Update {member.name}&apos;s profile</p>
      </div>

      <TeamMemberForm member={member} />
    </div>
  )
}
