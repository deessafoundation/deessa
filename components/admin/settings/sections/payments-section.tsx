"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ShieldCheck, Key, CheckCircle2, AlertCircle } from "lucide-react"
import { PaymentSettingsForm } from "@/components/admin/finance/payment-settings-form"
import type { PaymentSettings, PaymentProvider } from "@/lib/payments/config"

interface PaymentsSectionProps {
  settings: PaymentSettings
  envConfigured: Record<PaymentProvider, boolean>
}

export function PaymentsSection({ settings, envConfigured }: PaymentsSectionProps) {
  const configuredCount = Object.values(envConfigured).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <Card className="border border-border/80 bg-gradient-to-r from-emerald-500/5 via-emerald-500/[0.02] to-transparent shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Payment Gateways & Currencies</h3>
                <p className="text-sm text-muted-foreground">
                  Configure checkout payment rails, primary gateway defaults, and base operating currency for public donations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 font-semibold bg-background/60">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                {configuredCount} Gateways Secret Keys Detected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gateway Environment Status Indicator */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(["stripe", "khalti", "esewa"] as PaymentProvider[]).map((prov) => {
          const isConfigured = envConfigured[prov]
          const isEnabled = settings.enabledProviders.includes(prov)
          const isPrimary = settings.primaryProvider === prov

          return (
            <Card key={prov} className="border border-border/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-wide">{prov}</span>
                {isPrimary && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/90">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isConfigured ? (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Env Keys Present
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    Missing Env Keys
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gateway State: <span className="font-semibold text-foreground">{isEnabled ? "Enabled" : "Disabled"}</span>
              </p>
            </Card>
          )
        })}
      </div>

      {/* Primary Payment Settings Form */}
      <PaymentSettingsForm settings={settings} envConfigured={envConfigured} />

      {/* Security Best Practices */}
      <Card className="border border-border/80 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            Security & Credential Management
          </p>
          <p>
            In compliance with PCI-DSS guidelines, private API keys, webhook signing secrets, and merchant credentials are never stored in the database.
            Configure them directly inside your deployment environment variables (e.g. <code>STRIPE_SECRET_KEY</code>, <code>KHALTI_SECRET_KEY</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
