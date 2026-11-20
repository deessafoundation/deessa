import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { getPartners, getPartnerEvents } from "@/lib/actions/admin-partners"
import { hasPermission } from "@/lib/types/admin"
import { PartnersListClient } from "@/components/admin/partners/partners-list-client"

export const metadata: Metadata = {
  title: "Partner Organizations | Admin",
  description: "Manage global institutional partners, corporate sponsors, and funding donors.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PartnersPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  const canManagePartners = hasPermission(admin.role, "partners") || hasPermission(admin.role, "settings")
  if (!canManagePartners) redirect("/admin")

  const [partners, events] = await Promise.all([
    getPartners(),
    getPartnerEvents(),
  ])

  return <PartnersListClient initialPartners={partners} initialEvents={events} />
}
