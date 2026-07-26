/**
 * deessa Foundation bank accounts shown on the donate page.
 *
 * These are public details, deliberately committed rather than kept in env vars —
 * they are printed on the website and change roughly never.
 *
 * ⚠️ REPLACE THE PLACEHOLDERS BELOW with the real account details before deploying.
 * Verify every digit against a bank statement, not from memory. A wrong account
 * number silently sends donations to a stranger.
 */

export type BankAccount = {
  /** Stable key stored on the donation row — do not rename after go-live. */
  id: string
  /** Shown as the tab/section label. */
  label: string
  bankName: string
  accountName: string
  accountNumber: string
  branch?: string
  /** Required for international wires. */
  swiftCode?: string
  currency: "NPR" | "USD"
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "npr",
    label: "Within Nepal (NPR)",
    bankName: "REPLACE_ME Bank Ltd.",
    accountName: "deessa Foundation",
    accountNumber: "REPLACE_ME",
    branch: "REPLACE_ME, Kathmandu",
    currency: "NPR",
  },
  {
    id: "usd",
    label: "International (USD)",
    bankName: "REPLACE_ME Bank Ltd.",
    accountName: "deessa Foundation",
    accountNumber: "REPLACE_ME",
    branch: "REPLACE_ME, Kathmandu",
    swiftCode: "REPLACE_ME",
    currency: "USD",
  },
]

export function getBankAccount(id: string): BankAccount | undefined {
  return BANK_ACCOUNTS.find((a) => a.id === id)
}

/** True while placeholders are unreplaced — used to hide the option rather than show fake details. */
export function isBankTransferConfigured(): boolean {
  return BANK_ACCOUNTS.some(
    (a) => !a.accountNumber.includes("REPLACE_ME") && !a.bankName.includes("REPLACE_ME"),
  )
}

/** Only accounts with real details filled in. */
export function getConfiguredBankAccounts(): BankAccount[] {
  return BANK_ACCOUNTS.filter(
    (a) => !a.accountNumber.includes("REPLACE_ME") && !a.bankName.includes("REPLACE_ME"),
  )
}
