import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { CampaignStudio } from "@/components/admin/newsletter/campaign-studio"
import { fetchNewsletterCampaignById } from "@/lib/data/newsletter"
import { createServiceRoleClient } from "@/lib/supabase/service"

export const metadata = {
  title: "New Campaign Studio | Admin Newsletter",
  description: "Craft and preview responsive branded newsletter campaigns for Deesha Foundation.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getAdminSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, email, full_name")
    .eq("user_id", user.id)
    .single()

  if (!adminUser) return null
  if (!hasPermission(adminUser.role as AdminRole, "newsletters")) return null

  return {
    email: adminUser.email || user.email || "",
    role: adminUser.role,
  }
}

interface NewCampaignPageProps {
  searchParams: Promise<{
    duplicateFrom?: string
  }>
}

export default async function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect("/admin")
  }

  const { duplicateFrom } = await searchParams
  let duplicateData = undefined

  if (duplicateFrom) {
    const existing = await fetchNewsletterCampaignById(duplicateFrom)
    if (existing) {
      duplicateData = {
        title: `Copy of ${existing.title}`,
        subject: existing.subject,
        preview_text: existing.preview_text,
        content_html: existing.content_html,
        is_public: existing.is_public,
      }
    }
  }

  // Count active subscribers
  const serviceSupabase = createServiceRoleClient()
  const { count } = await serviceSupabase
    .from("newsletter_subscriptions")
    .select("id", { count: "exact", head: true })
    .or("status.eq.active,is_active.eq.true")

  const activeSubscriberCount = count || 0

  return (
    <CampaignStudio
      mode="create"
      activeSubscriberCount={activeSubscriberCount}
      adminEmail={admin.email}
      initialData={duplicateData}
    />
  )
}
