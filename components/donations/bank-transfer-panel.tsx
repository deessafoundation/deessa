"use client"

import type React from "react"

import { useState } from "react"
import { Building2, Copy, Check, Loader2, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { notifications } from "@/lib/notifications"
import { submitBankTransfer } from "@/lib/actions/bank-donation"
import type { BankAccount } from "@/lib/payments/bank-details"

interface BankTransferPanelProps {
  accounts: BankAccount[]
}

function CopyableRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      notifications.showError({ description: "Could not copy. Please select the text manually." })
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-foreground-muted shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-foreground text-right break-all">{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded hover:bg-primary/10 text-foreground-muted hover:text-primary transition-colors"
        >
          {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export function BankTransferPanel({ accounts }: BankTransferPanelProps) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0]

  if (!account) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("accountId", account.id)

      const result = await submitBankTransfer(formData)

      if (result.ok) {
        setSubmitted(true)
        notifications.showSuccess({ title: "Transfer recorded", description: result.message })
      } else {
        notifications.showError({ description: result.message })
      }
    } catch {
      notifications.showError({ description: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <div className="size-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="size-7 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Thank you</h3>
        <p className="text-foreground-muted max-w-md mx-auto">
          We have recorded your transfer. Our team will confirm it against our bank statement and email
          your receipt, usually within 2 working days.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-1">
          <Building2 className="size-5 text-primary" />
          Donate by Bank Transfer
        </h3>
        <p className="text-sm text-foreground-muted">
          Transfer directly to our account, then tell us below so we can send your receipt.
        </p>
      </div>

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="min-w-0 space-y-6">
        {accounts.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccountId(a.id)}
                aria-pressed={a.id === account.id}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  a.id === account.id
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-foreground-muted border-border hover:border-primary/40",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-background rounded-xl border border-border px-4 py-2">
          <CopyableRow label="Bank" value={account.bankName} />
          <CopyableRow label="Account name" value={account.accountName} />
          <CopyableRow label="Account number" value={account.accountNumber} />
          {account.branch && <CopyableRow label="Branch" value={account.branch} />}
          {account.swiftCode && <CopyableRow label="SWIFT / BIC" value={account.swiftCode} />}
          <CopyableRow label="Currency" value={account.currency} />
        </div>

        <div className="flex gap-3 items-start bg-primary/5 border border-primary/20 rounded-xl p-4">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground-muted">
            Bank transfers are confirmed by hand, so your receipt is not instant. Fill in the form below
            after transferring so we can match your payment to your name.
          </p>
        </div>

        </div>
        <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
          <h4 className="text-lg font-bold">Already transferred? Let us know.</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bt-name" className="block text-sm font-medium text-foreground mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="bt-name"
                name="donorName"
                required
                minLength={2}
                maxLength={120}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label htmlFor="bt-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="bt-email"
                name="donorEmail"
                type="email"
                required
                maxLength={254}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-foreground-muted mt-1">Your receipt goes here.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bt-amount" className="block text-sm font-medium text-foreground mb-1.5">
                Amount transferred ({account.currency}) <span className="text-red-500">*</span>
              </label>
              <input
                id="bt-amount"
                name="amount"
                type="number"
                required
                min="1"
                step="0.01"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label htmlFor="bt-phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone
              </label>
              <input
                id="bt-phone"
                name="donorPhone"
                type="tel"
                maxLength={30}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bt-ref" className="block text-sm font-medium text-foreground mb-1.5">
                Transaction reference <span className="text-red-500">*</span>
              </label>
              <input
                id="bt-ref"
                name="transactionRef"
                required
                minLength={3}
                maxLength={120}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-foreground-muted mt-1">
                From your bank receipt or statement.
              </p>
            </div>
            <div>
              <label htmlFor="bt-date" className="block text-sm font-medium text-foreground mb-1.5">
                Date of transfer
              </label>
              <input
                id="bt-date"
                name="transferDate"
                type="date"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bt-proof" className="block text-sm font-medium text-foreground mb-1.5">
              Proof of transfer
            </label>
            <input
              id="bt-proof"
              name="proof"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Optional, but speeds up confirmation. JPG, PNG, WEBP, or PDF, up to 5MB.
            </p>
          </div>

          <div>
            <label htmlFor="bt-message" className="block text-sm font-medium text-foreground mb-1.5">
              Message
            </label>
            <Textarea id="bt-message" name="donorMessage" rows={3} maxLength={2000} />
          </div>

          <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Recording your transfer...
              </>
            ) : (
              "I've Made the Transfer"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
