/**
 * Bank transfer donations.
 *
 * The money-critical rule: nothing a donor submits can mark a donation paid,
 * and the currency comes from OUR account list, never from the request.
 *
 * Note: jest.config.js sets `resetMocks: true`, so every mock implementation
 * must be (re)established in beforeEach — implementations passed to jest.fn()
 * inside a jest.mock factory are wiped before each test.
 */

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
import { getBankAccount, getConfiguredBankAccounts } from "@/lib/payments/bank-details"
import { submitBankTransfer } from "@/lib/actions/bank-donation"

jest.mock("@/lib/supabase/server", () => ({ createClient: jest.fn() }))
jest.mock("@/lib/supabase/service", () => ({ createServiceRoleClient: jest.fn() }))
jest.mock("@/lib/rate-limit", () => ({ checkRateLimit: jest.fn() }))
jest.mock("@/lib/payments/bank-details", () => ({
  getConfiguredBankAccounts: jest.fn(),
  getBankAccount: jest.fn(),
}))

const NPR_ACCOUNT = {
  id: "npr",
  label: "Within Nepal (NPR)",
  bankName: "Test Bank Ltd.",
  accountName: "deessa Foundation",
  accountNumber: "0123456789",
  currency: "NPR" as const,
}

let insertPayload: Record<string, unknown> | null
let updatePayload: Record<string, unknown> | null
let insertResult: { data: { id: string } | null; error: unknown }

function buildForm(overrides: Record<string, string> = {}) {
  const form = new FormData()
  const fields: Record<string, string> = {
    donorName: "Asha Sharma",
    donorEmail: "asha@example.com",
    amount: "5000",
    accountId: "npr",
    transactionRef: "TXN-99887766",
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

beforeEach(() => {
  insertPayload = null
  updatePayload = null
  insertResult = { data: { id: "donation-uuid" }, error: null }

  ;(getConfiguredBankAccounts as jest.Mock).mockImplementation(() => [NPR_ACCOUNT])
  ;(getBankAccount as jest.Mock).mockImplementation((id: string) =>
    id === "npr" ? NPR_ACCOUNT : undefined,
  )
  ;(checkRateLimit as jest.Mock).mockResolvedValue({ allowed: true })

  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({
      insert: (payload: Record<string, unknown>) => {
        insertPayload = payload
        return { select: () => ({ single: async () => insertResult }) }
      },
    }),
  })

  ;(createServiceRoleClient as jest.Mock).mockReturnValue({
    from: () => ({
      update: (payload: Record<string, unknown>) => {
        updatePayload = payload
        return { eq: async () => ({ error: null }) }
      },
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        remove: async () => ({ error: null }),
      }),
    },
  })
})

describe("submitBankTransfer", () => {
  it("always creates the donation as pending", async () => {
    const result = await submitBankTransfer(buildForm())

    expect(result.ok).toBe(true)
    expect(insertPayload).toMatchObject({
      payment_status: "pending",
      provider: "bank",
    })
  })

  it("takes currency from the account, not the submitted form", async () => {
    // A donor claiming USD against the NPR account must still be recorded as NPR.
    await submitBankTransfer(buildForm({ currency: "USD" }))

    expect(insertPayload).toMatchObject({ currency: "NPR" })
  })

  it("never lets the donor set a confirmed status", async () => {
    await submitBankTransfer(buildForm({ payment_status: "completed" }))

    expect(insertPayload).toMatchObject({ payment_status: "pending" })
  })

  it("rejects an account we do not publish", async () => {
    const result = await submitBankTransfer(buildForm({ accountId: "attacker-account" }))

    expect(result.ok).toBe(false)
    expect(insertPayload).toBeNull()
  })

  it("rejects a malformed transfer date rather than writing it", async () => {
    const result = await submitBankTransfer(buildForm({ transferDate: "yesterday" }))

    expect(result.ok).toBe(false)
    expect(insertPayload).toBeNull()
  })

  it("rejects submissions once rate limited", async () => {
    ;(checkRateLimit as jest.Mock).mockResolvedValue({ allowed: false })

    const result = await submitBankTransfer(buildForm())

    expect(result.ok).toBe(false)
    expect(insertPayload).toBeNull()
  })

  it("attaches the reference with the service role after insert", async () => {
    await submitBankTransfer(buildForm())

    expect(updatePayload).toMatchObject({
      provider_ref: "TXN-99887766",
      payment_id: "bank:TXN-99887766",
      bank_account_id: "npr",
    })
  })

  it("refuses submissions when no account is configured", async () => {
    ;(getConfiguredBankAccounts as jest.Mock).mockImplementation(() => [])

    const result = await submitBankTransfer(buildForm())

    expect(result.ok).toBe(false)
    expect(insertPayload).toBeNull()
  })
})

describe("bank-details placeholders", () => {
  it("treats unreplaced REPLACE_ME details as unconfigured", () => {
    // Fail closed: never show donors a fake account number.
    const actual = jest.requireActual("@/lib/payments/bank-details")

    expect(actual.getConfiguredBankAccounts()).toHaveLength(0)
    expect(actual.isBankTransferConfigured()).toBe(false)
  })
})
