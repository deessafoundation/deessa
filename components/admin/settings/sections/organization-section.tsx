"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Receipt } from "lucide-react"
import { OrganizationSettingsForm, type OrganizationDetails } from "@/components/admin/settings/organization-settings-form"

interface OrganizationSectionProps {
  initialData?: Record<string, unknown> | null
}

export function OrganizationSection({ initialData }: OrganizationSectionProps) {
  return (
    <div className="space-y-6">
      {/* Informational Header */}
      <Card className="border border-border/80 bg-gradient-to-r from-teal-500/5 via-teal-500/[0.02] to-transparent shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400 shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Legal Non-Profit Entity & Receipt Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Official registration numbers, tax exemptions, and digital signatory configuration printed on all automated donation receipts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg font-bold">Organization Details & Fiscal Identification</CardTitle>
          <CardDescription>
            These legal details appear on computerized donation receipts, 80G tax certificates, and annual reports
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <OrganizationSettingsForm initialData={(initialData as unknown as OrganizationDetails) ?? undefined} />
        </CardContent>
      </Card>

      {/* Receipt Info Card */}
      <Card className="border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
            <Receipt className="h-5 w-5" />
            <CardTitle className="text-base font-bold">Automated Receipt Numbering Architecture</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-blue-800 dark:text-blue-300/90 space-y-2">
          <p>
            • Receipt numbers follow the standardized schema: <strong>PREFIX-YEAR-SEQUENCE</strong> (e.g. <code>DF-2026-1042</code>).
          </p>
          <p>
            • Each receipt receives a cryptographically verifiable transaction token to prevent duplicate or falsified donations.
          </p>
          <p>
            • Authorized signatory signature and official organization stamp are embedded into the PDF receipt automatically upon confirmed payment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
