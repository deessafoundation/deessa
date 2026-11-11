import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { CampaignStudio } from "@/components/admin/newsletter/campaign-studio"
import { fetchNewsletterCampaignById } from "@/lib/data/newsletter"
import { createServiceRoleClient } from "@/lib/supabase/service"

export const metadata = {
  title: "Edit Campaign Studio | Admin Newsletter",
  description: "Review, edit, and broadcast newsletter campaigns for Deesha Foundation.",
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

interface EditCampaignPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect("/admin")
  }

  const { id } = await params
  const campaign = await fetchNewsletterCampaignById(id)

  if (!campaign) {
    notFound()
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
      mode="edit"
      campaign={campaign}
      activeSubscriberCount={activeSubscriberCount}
      adminEmail={admin.email}
    />
  )
}
