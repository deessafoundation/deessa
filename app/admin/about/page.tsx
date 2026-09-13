/**
 * About Page ("Who We Are") Manager - Admin UI
 *
 * Edits the About page's Hero, Who We Are intro, and How We Do It sections.
 * Team members and partner logos are managed separately at /admin/team and /admin/partners.
 */

import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { getAboutPageSettings } from "@/lib/data/about-settings"
import AboutManagerClient from "@/components/admin/about-manager/AboutManagerClient"

export const metadata = {
  title: "About Page Manager | Admin",
  description: "Manage the About / Who We Are page content",
}

export default async function AboutManagerPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  const settings = await getAboutPageSettings()

  return <AboutManagerClient initialSettings={settings} userId={admin.user_id} />
}
