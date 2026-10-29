import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { getPartners } from "@/lib/actions/admin-partners"
import { hasPermission, type Partner } from "@/lib/types/admin"
import { getAboutPageSettings } from "@/lib/data/about-settings"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import AboutManagerClient from "@/components/admin/about/about-manager-client"

export const metadata = {
  title: "Who We Are | Admin",
  description: "Manage the About page content and partners",
}

export default async function AboutManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; partner?: string | string[] }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")
  const canEditPage = hasPermission(admin.role, "settings")
  const canManagePartners = hasPermission(admin.role, "partners")
  if (!canEditPage && !canManagePartners) redirect("/admin")

  const query = await searchParams
  const tab = typeof query.tab === "string" ? query.tab : undefined
  const partner = typeof query.partner === "string" ? query.partner : undefined
  // Each manager remains available if the other content source cannot be loaded.
  const [settingsResult, partnersResult] = await Promise.allSettled([
    canEditPage ? getAboutPageSettings() : Promise.resolve(null),
    canManagePartners ? getPartners() : Promise.resolve(null),
  ])
  const pageLoadError = settingsResult.status === "rejected"
    ? "Could not load the saved About page content. Refresh to try again."
    : undefined
  const partnersError = partnersResult.status === "rejected"
    ? "Could not load partners. Please try again."
    : undefined
  const settings = settingsResult.status === "fulfilled" && settingsResult.value
    ? settingsResult.value : DEFAULT_ABOUT_PAGE_SETTINGS
  const partners = partnersResult.status === "fulfilled" ? partnersResult.value as Partner[] | null : null
  const pageTabs = ["hero", "intro", "howWeDoIt", "governance", "people", "getInvolved", "pageSettings"]
  const initialTab = canManagePartners && (tab === "partners" || partner || !canEditPage)
    ? "partners" : tab === "journey" ? "pageSettings" : canEditPage && tab && pageTabs.includes(tab) ? tab : "hero"

  return (
    <AboutManagerClient
      initialSettings={settings}
      userId={admin.user_id}
      canEditPage={canEditPage}
      canManagePartners={canManagePartners}
      initialTab={initialTab}
      initialPartners={partners}
      partnersError={partnersError}
      initialPartner={canManagePartners ? partner : undefined}
      pageLoadError={pageLoadError}
    />
  )
}
