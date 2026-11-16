import { redirect } from "next/navigation"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import NotificationCenterClient from "@/components/admin/notifications/notification-center-client"

export const metadata = {
  title: "Notifications | Admin",
  description: "View and manage your notifications",
}

export default async function NotificationsPage() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    redirect("/admin/login")
  }

  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN"
  const serviceSupabase = createServiceRoleClient()

  // Fetch current admin's own notifications
  const { data: myData } = await serviceSupabase
    .from("admin_notifications")
    .select("*")
    .eq("user_id", currentAdmin.user_id)
    .order("created_at", { ascending: false })
    .limit(100)

  // For Super Admins, also fetch all system notifications and admin users map
  let allNotifs: typeof myData = []
  const adminUsersMap: Record<string, { full_name: string; email: string }> = {}

  if (isSuperAdmin) {
    const [{ data: allData }, { data: usersData }] = await Promise.all([
      serviceSupabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      serviceSupabase
        .from("admin_users")
        .select("user_id, full_name, email"),
    ])

    allNotifs = allData || []
    if (usersData) {
      usersData.forEach((u) => {
        if (u.user_id) {
          adminUsersMap[u.user_id] = { full_name: u.full_name || "Admin", email: u.email }
        }
      })
    }
  }

  return (
    <NotificationCenterClient
      currentUserId={currentAdmin.user_id}
      currentUserRole={currentAdmin.role}
      initialMyNotifications={myData || []}
      initialAllNotifications={allNotifs || []}
      adminUsersMap={adminUsersMap}
    />
  )
}
