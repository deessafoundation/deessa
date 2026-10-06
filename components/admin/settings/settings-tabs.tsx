"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form"
import { PaymentSettingsForm } from "@/components/admin/finance/payment-settings-form"
import { OrganizationSettingsForm } from "@/components/admin/settings/organization-settings-form"
import { SupportToggleModal } from "@/components/admin/support/support-toggle-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CreditCard, Building2 } from "lucide-react"
import type { PaymentSettings, PaymentProvider } from "@/lib/payments/config"

interface SettingsTabsProps {
  siteSettings: Record<string, Record<string, unknown>>
  paymentSettings: PaymentSettings
  envConfigured: Record<PaymentProvider, boolean>
  organizationDetails: Record<string, unknown> | null
}

export function SettingsTabs({
  siteSettings,
  paymentSettings,
  envConfigured,
  organizationDetails,
}: SettingsTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "site"

  const handleTabChange = (value: string) => {
    if (value === "site") {
      router.push("/admin/settings")
    } else {
      router.push(`/admin/settings?tab=${value}`)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="inline-flex h-auto gap-2 bg-transparent">
        <TabsTrigger
          value="site"
          className="relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:rounded-xl rounded-lg px-4 py-2.5 group"
        >
          <Settings className="h-4 w-4 mr-2 group-data-[state=active]:animate-pulse" />
          <span className="font-semibold">Site Settings</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
        </TabsTrigger>
        <TabsTrigger
          value="payments"
          className="relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:rounded-xl rounded-lg px-4 py-2.5 group"
        >
          <CreditCard className="h-4 w-4 mr-2 group-data-[state=active]:animate-pulse" />
          <span className="font-semibold">Payment Settings</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
        </TabsTrigger>
        <TabsTrigger
          value="organization"
          className="relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:scale-105 data-[state=active]:rounded-xl rounded-lg px-4 py-2.5 group"
        >
          <Building2 className="h-4 w-4 mr-2 group-data-[state=active]:animate-pulse" />
          <span className="font-semibold">Organization</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-data-[state=active]:animate-shimmer pointer-events-none" />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="site" className="mt-6 space-y-6">
        <SupportToggleModal />
        <SiteSettingsForm settings={siteSettings} />
      </TabsContent>

      <TabsContent value="payments" className="mt-6 space-y-6">
        <PaymentSettingsForm settings={paymentSettings} envConfigured={envConfigured} />
      </TabsContent>

      <TabsContent value="organization" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              These details will appear on donation receipts and official documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationSettingsForm initialData={organizationDetails as any} />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Receipt Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              • Receipt numbers are automatically generated in the format: <strong>PREFIX-YEAR-NUMBER</strong>
            </p>
            <p>
              • Each donation receives a unique receipt number for tracking and audit purposes
            </p>
            <p>
              • Tax and registration details are displayed on all generated receipts
            </p>
            <p>
              • Donors receive receipts via email and can download them anytime
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
