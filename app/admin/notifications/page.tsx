import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import NotificationCenterClient from "@/components/admin/notification-center-client"

async function checkAdminAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single()

  if (!adminUser) return false

  return true
}

async function getNotifications() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return data || []
}

export const metadata = {
  title: "Notifications | Admin",
  description: "View and manage your notifications",
}

export default async function NotificationsPage() {
  const hasAccess = await checkAdminAccess()
  if (!hasAccess) {
    redirect("/admin")
  }

  const notifications = await getNotifications()

  return <NotificationCenterClient initialNotifications={notifications} />
}
