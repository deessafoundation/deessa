import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { canManageUsers, type AdminRole, type AdminUser } from "@/lib/types/admin"
import { AdminUsersClient } from "@/components/admin/users/admin-users-client"

export const metadata = {
  title: "Admin Users | Management Portal",
  description: "Manage system access, privileged roles, security policies, and team credentials.",
}

async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Failed to load admin users:", error)
    return []
  }

  const users = data as AdminUser[]

  // Enrich with last_sign_in_at from Supabase Auth admin
  try {
    const supabaseAdmin = createServiceRoleClient()
    const authMap = new Map<string, string | undefined>()
    let page = 1
    const maxPages = 10 // Safety cap (up to 1,000 users)

    while (page <= maxPages) {
      const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 100,
      })

      if (listError || !authData?.users || authData.users.length === 0) {
        break
      }

      for (const u of authData.users) {
        authMap.set(u.id, u.last_sign_in_at)
      }

      if (authData.users.length < 100) {
        break
      }
      page++
    }

    return users.map((u) => ({
      ...u,
      last_sign_in_at: u.user_id ? authMap.get(u.user_id) || null : null,
    }))
  } catch (authErr) {
    console.warn("Could not enrich admin users with auth metadata:", authErr)
  }

  return users
}

export default async function AdminUsersPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || !canManageUsers(currentAdmin.role as AdminRole)) {
    redirect("/admin")
  }

  const users = await getAdminUsers()

  return (
    <AdminUsersClient
      initialUsers={users}
      currentAdminId={currentAdmin.id}
      currentAdminRole={currentAdmin.role as AdminRole}
    />
  )
}
