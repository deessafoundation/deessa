import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { Card, CardContent } from "@/components/ui/card"
import { ProgramsListClient, type ProgramListItem } from "@/components/admin/programs/programs-list-client"
import type { ProgramCategory } from "@/lib/programs/content"

export const metadata = {
  title: "Programs CMS | Admin",
  description: "Manage initiatives across Service, Outreach, Research, and Campaign categories",
}

function heroThumb(hero: unknown): string | null {
  if (typeof hero === "string") return hero || null
  if (!hero || typeof hero !== "object") return null
  const image = (hero as { image?: unknown }).image
  if (typeof image === "string") return image || null
  if (image && typeof image === "object") {
    const o = image as { assetId?: string; url?: string }
    if (o.assetId) return `/api/assets/${o.assetId}`
    if (o.url) return o.url
  }
  return null
}

async function requireProgramsAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", user.id)
    .single()
  if (!admin?.is_active || !hasPermission(admin.role as AdminRole, "programs")) {
    redirect("/admin")
  }
}

export default async function AdminProgramsPage() {
  await requireProgramsAccess()
  const supabase = await createClient()

  const { data: programs, error } = await supabase
    .from("programs")
    .select("id, slug, status, updated_at, created_at, title, category, short_description")
    .order("updated_at", { ascending: false })

  if (error) {
    const code = "code" in error ? error.code : undefined
    const isMissingTable = code === "42P01" || code === "PGRST205"
    const isPermissionError = code === "42501" || code === "PGRST116"
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Programs CMS</h1>
          <p className="text-muted-foreground">Manage the four public program categories.</p>
        </div>
        <Card>
          <CardContent className="flex items-start gap-3 p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="font-semibold">Programs CMS is not ready yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isMissingTable
                  ? "Apply scripts/db/programs-migrations/P01-programs-cms-foundation.sql in the Supabase SQL Editor, then refresh this page."
                  : isPermissionError
                    ? "The CMS tables exist, but this admin account does not have the required programs permission or database policy."
                    : "The CMS tables could not be loaded. Check the Supabase migration and server logs before retrying."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const programIds = programs?.map((p) => p.id) || []

  // Hero thumbnails from drafts
  const heroMap: Record<string, string | null> = {}
  if (programIds.length > 0) {
    const { data: drafts } = await supabase
      .from("program_drafts")
      .select("program_id, hero")
      .in("program_id", programIds)
    if (drafts) {
      for (const d of drafts) {
        heroMap[d.program_id] = heroThumb(d.hero)
      }
    }
  }

  const items: ProgramListItem[] = (programs || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title || p.slug,
    category: (p.category || "service") as ProgramCategory,
    status: p.status || "draft",
    short_description: p.short_description || null,
    updated_at: p.updated_at,
    created_at: p.created_at,
    hero_thumb: heroMap[p.id] || null,
  }))

  return (
    <div className="space-y-6">
      <ProgramsListClient initialPrograms={items} />
    </div>
  )
}
