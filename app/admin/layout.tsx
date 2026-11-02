import type React from "react"
import { getCachedAdminUser } from "@/lib/supabase/get-admin-user"
import { AdminLayoutContent } from "@/components/admin/layout/admin-layout-content"
import type { AdminUser } from "@/lib/types/admin"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Admin Panel | deessa Foundation",
  description: "Manage deessa Foundation website content",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getCachedAdminUser()

  if (!adminUser || !adminUser.is_active) {
    // Proxy protects admin routes; login must remain renderable for inactive sessions.
    return <>{children}</>
  }

  return (
    <AdminLayoutContent adminUser={adminUser as AdminUser}>
      {children}
    </AdminLayoutContent>
  )
}
