import { getPaymentSettings } from "@/lib/payments/config"
import { createClient } from "@/lib/supabase/server"

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }))

function settingsResult(value: unknown, error: unknown = null) {
  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { value }, error }) }) }) }),
  })
}

describe("payment provider settings", () => {
  it("does not re-enable a disabled primary provider", async () => {
    settingsResult({ enabledProviders: ["stripe"], primaryProvider: "esewa" })
    const settings = await getPaymentSettings()
    expect(settings.enabledProviders).toEqual(["stripe"])
    expect(settings.primaryProvider).toBe("stripe")
  })

  it("preserves an explicitly empty enabled list", async () => {
    settingsResult({ enabledProviders: [], primaryProvider: "esewa" })
    expect((await getPaymentSettings()).enabledProviders).toEqual([])
  })

  it("does not enable gateways when settings cannot be read", async () => {
    settingsResult(null, { message: "Unavailable" })
    expect((await getPaymentSettings()).enabledProviders).toEqual([])
  })
})
