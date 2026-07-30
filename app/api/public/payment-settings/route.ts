import { NextResponse } from "next/server"
import { getPaymentSettings, isProviderEnvConfigured, type PaymentProvider } from "@/lib/payments/config"

/**
 * GET /api/public/payment-settings
 *
 * Public endpoint that returns payment provider availability.
 * Used by client-side pages (pending-payment, donate) to show
 * which providers are enabled and configured.
 *
 * No auth required — this is non-sensitive configuration info.
 */
export async function GET() {
  try {
    const settings = await getPaymentSettings()

    const providers: PaymentProvider[] = ["stripe", "khalti", "esewa"]
    const providerStatus = providers.reduce<
      Record<PaymentProvider, { enabled: boolean; configured: boolean; available: boolean }>
    >(
      (acc, provider) => {
        const enabled = settings.enabledProviders.includes(provider)
        const configured = isProviderEnvConfigured(provider)
        acc[provider] = {
          enabled,
          configured,
          available: enabled && configured,
        }
        return acc
      },
      {} as Record<PaymentProvider, { enabled: boolean; configured: boolean; available: boolean }>,
    )

    return NextResponse.json({
      ok: true,
      settings: {
        enabledProviders: settings.enabledProviders,
        primaryProvider: settings.primaryProvider,
        defaultCurrency: settings.defaultCurrency,
        allowRecurring: settings.allowRecurring,
      },
      providerStatus,
    })
  } catch (error) {
    console.error("Failed to fetch public payment settings:", error)
    return NextResponse.json(
      { ok: false, error: "Failed to load payment settings" },
      { status: 500 },
    )
  }
}
