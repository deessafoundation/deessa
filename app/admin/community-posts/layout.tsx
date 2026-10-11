import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"

export default async function CommunityPostsLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.is_active === false) redirect("/admin/login")
  if (!hasPermission(admin.role as AdminRole, "settings")) redirect("/admin")
  return children
}
