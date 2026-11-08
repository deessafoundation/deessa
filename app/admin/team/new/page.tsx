import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { ArrowLeft, UserPlus, Users } from "lucide-react"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"

export const metadata = {
  title: "Add Team Member | Team Admin",
  description: "Add a new team or governance member",
}

export default async function NewTeamMemberPage() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "team")) redirect("/admin")

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4 sm:pb-5">
        <div className="space-y-1.5 min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors py-1 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Team Directory</span>
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/60 shrink-0">/</span>
            <span className="text-foreground font-medium truncate max-w-[140px] sm:max-w-[200px]">New Member</span>
          </nav>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Add Team Member
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Add a leader, board member, advisor, or operational specialist to appear in the Who We Are section.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pt-1 sm:pt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shrink-0">
            <UserPlus className="size-3.5" />
            <span>Draft Member</span>
          </span>
          <Link
            href="/admin/team"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            <Users className="size-3.5" />
            <span className="hidden sm:inline">View</span> Directory
          </Link>
        </div>
      </div>

      <TeamMemberForm />
    </div>
  )
}
