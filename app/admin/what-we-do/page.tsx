import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { getWhatWeDoSettings } from "@/lib/data/what-we-do-settings"
import { WhatWeDoManager } from "@/components/admin/what-we-do/what-we-do-manager"

export default async function WhatWeDoAdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")
  if (!hasPermission(admin.role, "settings")) redirect("/admin")
  return <WhatWeDoManager initialSettings={await getWhatWeDoSettings()} />
}
