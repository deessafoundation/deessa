import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { fetchSupportTickets } from "@/lib/data/support"
import { SupportClient } from "@/components/admin/support/support-client"

export const metadata = {
  title: "Support Reports & Diagnostics | Admin",
  description:
    "Review technical bug reports, view attached user screenshots, triage diagnostics, and collaborate on fixes.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkSupportPermission() {
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

  return hasPermission(adminUser.role as AdminRole, "contacts")
}

export default async function SupportAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    issueType?: string
    hasScreenshot?: string
    assignee?: string
    archived?: string
    page?: string
  }>
}) {
  const hasAccess = await checkSupportPermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const search = params.search || undefined
  const status = params.status || undefined
  const issueType = params.issueType || undefined
  const hasScreenshot =
    params.hasScreenshot === "true" ? true : params.hasScreenshot === "false" ? false : undefined
  const assignee = params.assignee || undefined
  const archived = params.archived === "true" ? true : undefined

  const data = await fetchSupportTickets({
    page,
    pageSize: 10,
    search,
    status,
    issueType,
    hasScreenshot,
    assignee,
    archived,
  })

  return <SupportClient initialData={data} />
}
