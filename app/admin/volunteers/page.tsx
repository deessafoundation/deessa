import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { fetchVolunteers } from "@/lib/data/volunteers"
import { VolunteersClient } from "@/components/admin/volunteers/volunteers-client"
import Link from "next/link"
import { ArrowLeft, Users2, Heart } from "lucide-react"

export const metadata = {
  title: "Volunteer Applications & CRM | Admin",
  description: "Review volunteer sign-ups, evaluate skill sets, and assign program initiatives",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkVolunteersPermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser) return false

  return hasPermission(adminUser.role as AdminRole, "volunteers")
}

export default async function VolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    skill?: string
    availability?: string
    page?: string
  }>
}) {
  const hasAccess = await checkVolunteersPermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const params = await searchParams
  const pageNum = Math.max(1, parseInt(params.page || "1", 10))

  const { volunteers, stats, pagination } = await fetchVolunteers({
    search: params.search,
    status: params.status,
    skill: params.skill,
    availability: params.availability,
    page: pageNum,
    pageSize: 20,
  })

  return (
    <div className="space-y-6">
      {/* ── Header & Breadcrumbs ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link
              href="/admin"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Admin Console</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Volunteers</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Users2 className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Volunteer Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Review applicant dossiers, triage skill sets, and mobilize field ambassadors
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Events &rarr;
          </Link>
          <Link
            href="/admin/programs"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Programs &rarr;
          </Link>
        </div>
      </div>

      {/* ── Client Master Ledger ────────────────────────────────────── */}
      <VolunteersClient
        initialVolunteers={volunteers}
        stats={stats}
        pagination={pagination}
        initialFilters={{
          search: params.search || "",
          status: params.status || "all",
          skill: params.skill || "all",
          availability: params.availability || "all",
        }}
      />
    </div>
  )
}
