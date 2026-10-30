import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Eye, EyeOff } from "lucide-react"
import { getTeamMember } from "@/lib/actions/admin-team"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { redirect } from "next/navigation"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"
import { TEAM_TIER_DETAILS, type TeamTier } from "@/lib/types/team-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getTeamMember(id).catch(() => null)
  return {
    title: member ? `Edit ${member.name} | Team Admin` : "Edit Team Member | Admin",
  }
}

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

  const tierKey = (member.tier as TeamTier) || "vision"
  const tierMeta = TEAM_TIER_DETAILS[tierKey] || TEAM_TIER_DETAILS.vision

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Team Directory</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{member.name}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {member.name}
            </h1>
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", tierMeta.badgeTone)}>
              {tierMeta.label}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
              member.is_published
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-muted text-muted-foreground border border-border"
            )}>
              {member.is_published ? (
                <>
                  <Eye className="h-3 w-3 text-emerald-600" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  Hidden
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Position: <span className="text-foreground font-medium">{member.role}</span>
          </p>
        </div>

        {member.is_published && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9 w-full sm:w-auto text-xs gap-1.5 justify-center">
              <a href="/about#team" target="_blank" rel="noopener noreferrer">
                <span>View on Website</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </Button>
          </div>
        )}
      </div>

      <TeamMemberForm member={member} />
    </div>
  )
}
