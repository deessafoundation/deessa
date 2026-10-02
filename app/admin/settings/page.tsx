import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { getSiteSettings } from "@/lib/actions/admin-settings"
import { getPaymentSettings, isProviderEnvConfigured, type PaymentProvider } from "@/lib/payments/config"
import { createClient } from "@/lib/supabase/server"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { SettingsTabs } from "@/components/admin/settings/settings-tabs"

export default async function SiteSettingsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  // Fetch all settings data in parallel
  const [siteSettings, paymentSettings, orgResult] = await Promise.all([
    getSiteSettings(),
    getPaymentSettings(),
    (async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "organization_details")
        .single()
      return data?.value ?? null
    })(),
  ])

  // Convert site settings array to object
  const settingsObj: Record<string, Record<string, unknown>> = {}
  siteSettings?.forEach((s) => {
    settingsObj[s.key] = s.value as Record<string, unknown>
  })

  // Build env configured map
  const providers: PaymentProvider[] = ["stripe", "khalti", "esewa"]
  const envConfigured = providers.reduce<Record<PaymentProvider, boolean>>((acc, provider) => {
    acc[provider] = isProviderEnvConfigured(provider)
    return acc
  }, {} as Record<PaymentProvider, boolean>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage site-wide configurations and features</p>
      </div>

      <SettingsTabs
        siteSettings={settingsObj}
        paymentSettings={paymentSettings}
        envConfigured={envConfigured}
        organizationDetails={orgResult}
      />
    </div>
  )
}
