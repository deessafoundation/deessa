import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"

export const metadata = {
  title: "Add Team Member | Team Admin",
  description: "Add a new team or governance member",
}

export default async function NewTeamMemberPage() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link
            href="/admin/team"
            className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Team Directory</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">New Member</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Add Team Member
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
          Add a leader, board member, advisor, or operational specialist to appear in the Who We Are section.
        </p>
      </div>

      <TeamMemberForm />
    </div>
  )
}
