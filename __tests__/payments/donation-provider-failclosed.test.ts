/**
 * Regression tests for provider-substitution fail-closed behaviour (audit fix 1.6).
 *
 * The bug: startDonation() used to silently swap an unavailable provider for
 * the first available one, and currency is derived from the provider AFTER that
 * swap. A donor who entered 5000 expecting NPR (~$37) would be charged
 * $5000 USD. Downstream fail-closed verification cannot catch it, because the
 * donation row and the provider session both agree on the wrong currency.
 *
 * These tests lock in: no substitution, no donation row created, and the
 * currency always matches the provider the donor actually selected.
 *
 * Note: jest.config.js sets `resetMocks: true`, so mock implementations must be
 * (re)established in beforeEach.
 */

import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getPaymentSettings, getSupportedProviders } from "@/lib/payments/config"
import { startStripeCheckout } from "@/lib/payments/stripe"
import { startEsewaPayment } from "@/lib/payments/esewa"
import { startDonation } from "@/lib/actions/donation"

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }))
jest.mock("@/lib/payments/config", () => ({
  getPaymentSettings: jest.fn(),
  getSupportedProviders: jest.fn(),
}))
jest.mock("@/lib/payments/stripe", () => ({ startStripeCheckout: jest.fn() }))
jest.mock("@/lib/payments/esewa", () => ({ startEsewaPayment: jest.fn() }))
jest.mock("@/lib/payments/khalti", () => ({ startKhaltiPayment: jest.fn() }))

let insertPayload: Record<string, unknown> | null

const BASE_INPUT = {
  amount: 5000,
  donorName: "Asha Sharma",
  donorEmail: "asha@example.com",
  isMonthly: false,
} as const

beforeEach(() => {
  insertPayload = null
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key"

  ;(getPaymentSettings as jest.Mock).mockResolvedValue({
    enabledProviders: ["stripe", "esewa"],
    primaryProvider: "stripe",
    defaultCurrency: "USD",
    allowRecurring: false,
  })

  ;(createServiceClient as jest.Mock).mockReturnValue({
    from: () => ({
      insert: (payload: Record<string, unknown>) => {
        insertPayload = payload
        return {
          select: () => ({ single: async () => ({ data: { id: "donation-uuid", ...payload }, error: null }) }),
        }
      },
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  })

  ;(startStripeCheckout as jest.Mock).mockResolvedValue({
    redirectUrl: "https://checkout.stripe.com/c/pay/cs_test_x",
    sessionId: "cs_test_x",
  })
  ;(startEsewaPayment as jest.Mock).mockResolvedValue({
    redirectUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    transactionUuid: "1700000000-donation-uuid",
    referenceId: "ref-1",
    formData: { amount: "5000" },
  })
})

describe("startDonation — provider availability fails closed", () => {
  it("rejects an unavailable provider instead of substituting", async () => {
    // Donor picked eSewa (NPR), but only Stripe (USD) is available.
    ;(getSupportedProviders as jest.Mock).mockReturnValue(["stripe"])

    const result = await startDonation({ ...BASE_INPUT, provider: "esewa" })

    expect(result.ok).toBe(false)
    expect(result.redirectUrl).toBeUndefined()
    expect(result.message).toMatch(/unavailable/i)
  })

  it("creates NO donation row when the provider is unavailable", async () => {
    ;(getSupportedProviders as jest.Mock).mockReturnValue(["stripe"])

    await startDonation({ ...BASE_INPUT, provider: "esewa" })

    // The critical assertion: nothing was persisted, so there is no row that
    // could later be charged in the wrong currency.
    expect(insertPayload).toBeNull()
    expect(startStripeCheckout as jest.Mock).not.toHaveBeenCalled()
    expect(startEsewaPayment as jest.Mock).not.toHaveBeenCalled()
  })

  it("never charges USD for a donation the donor selected in NPR", async () => {
    // This is the exact 135x-overcharge scenario the fix prevents.
    ;(getSupportedProviders as jest.Mock).mockReturnValue(["stripe"])

    const result = await startDonation({ ...BASE_INPUT, provider: "esewa" })

    expect(result.ok).toBe(false)
    // If a row had been written with currency USD at amount 5000, that is the bug.
    expect(insertPayload).toBeNull()
  })

  it("still succeeds normally when the requested provider IS available", async () => {
    ;(getSupportedProviders as jest.Mock).mockReturnValue(["stripe", "esewa"])

    const result = await startDonation({ ...BASE_INPUT, provider: "esewa" })

    expect(result.ok).toBe(true)
    // Currency matches the provider the donor actually selected.
    expect(insertPayload).toMatchObject({ provider: "esewa", currency: "NPR", payment_status: "pending" })
  })

  it("uses USD for a stripe donation (currency follows the selected provider)", async () => {
    ;(getSupportedProviders as jest.Mock).mockReturnValue(["stripe", "esewa"])

    const result = await startDonation({ ...BASE_INPUT, provider: "stripe" })

    expect(result.ok).toBe(true)
    expect(insertPayload).toMatchObject({ provider: "stripe", currency: "USD", payment_status: "pending" })
  })

  it("still reports the no-methods-configured case distinctly", async () => {
    ;(getSupportedProviders as jest.Mock).mockReturnValue([])

    const result = await startDonation({ ...BASE_INPUT, provider: "stripe" })

    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/no payment methods/i)
    expect(insertPayload).toBeNull()
  })
})
