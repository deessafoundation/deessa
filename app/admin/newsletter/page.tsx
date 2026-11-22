import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import {
  fetchNewsletterSubscribers,
  fetchNewsletterCampaigns,
  type SubscriberStatus,
} from "@/lib/data/newsletter"
import { NewsletterClient } from "@/components/admin/newsletter/newsletter-client"

export const metadata = {
  title: "Newsletter & Community Broadcasts | Admin",
  description: "Manage subscriber directory, craft branded campaigns, and track broadcast analytics.",
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

interface NewsletterPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    source?: string
    page?: string
    pageSize?: string
    tab?: string
  }>
}

export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const admin = await getAdminSession()
  if (!admin) {
    redirect("/admin")
  }

  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const pageSize = parseInt(params.pageSize || "15", 10)
  const status = (params.status || "all") as "all" | SubscriberStatus
  const source = params.source || "all"
  const search = params.search || ""

  const [subscribersData, campaignsData] = await Promise.all([
    fetchNewsletterSubscribers({
      page,
      pageSize,
      status,
      source,
      search,
    }),
    fetchNewsletterCampaigns({
      page: 1,
      pageSize: 20,
    }),
  ])

  return (
    <NewsletterClient
      initialSubscribersData={subscribersData}
      initialCampaignsData={campaignsData}
      adminEmail={admin.email}
    />
  )
}
