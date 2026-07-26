"use server"

import { randomUUID } from "crypto"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
import { getBankAccount, getConfiguredBankAccounts } from "@/lib/payments/bank-details"

/**
 * Bank transfer donations.
 *
 * Unlike Stripe/eSewa this is NOT a payment gateway — there is no adapter, no
 * webhook, and nothing to verify programmatically. The donor tells us they sent
 * money; an admin checks the bank statement and flips the donation to
 * `completed` via changePaymentStatus(), which fires the existing receipt
 * generation. That is why `bank` is deliberately absent from the
 * PaymentProvider union: nothing in the gateway pipeline should try to handle it.
 *
 * Rows created here are ALWAYS `pending`. Nothing a donor submits can mark a
 * donation paid.
 */

const PROOF_BUCKET = "bank-transfer-proofs"
const MAX_PROOF_SIZE = 5 * 1024 * 1024
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

const bankDonationSchema = z.object({
  donorName: z.string().trim().min(2).max(120),
  donorEmail: z.string().trim().email().max(254),
  donorPhone: z.string().trim().max(30).optional().or(z.literal("")),
  amount: z.number().positive().max(10_000_000),
  accountId: z.string().trim().min(1).max(40),
  transactionRef: z.string().trim().min(3).max(120),
  // Matches <input type="date">; must parse as a DATE column server-side.
  transferDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  donorMessage: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type BankDonationResult = {
  ok: boolean
  message: string
  donationId?: string
}

function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim()
}

export async function submitBankTransfer(formData: FormData): Promise<BankDonationResult> {
  try {
    if (getConfiguredBankAccounts().length === 0) {
      return { ok: false, message: "Bank transfer is not available right now. Please contact us." }
    }

    const rawAmount = Number(formData.get("amount"))
    const parsed = bankDonationSchema.safeParse({
      donorName: sanitizeText(String(formData.get("donorName") ?? "")),
      donorEmail: sanitizeText(String(formData.get("donorEmail") ?? "")),
      donorPhone: sanitizeText(String(formData.get("donorPhone") ?? "")),
      amount: Number.isFinite(rawAmount) ? rawAmount : Number.NaN,
      accountId: sanitizeText(String(formData.get("accountId") ?? "")),
      transactionRef: sanitizeText(String(formData.get("transactionRef") ?? "")),
      transferDate: sanitizeText(String(formData.get("transferDate") ?? "")),
      donorMessage: sanitizeText(String(formData.get("donorMessage") ?? "")),
    })

    if (!parsed.success) {
      return { ok: false, message: "Please complete every required field with valid details." }
    }

    const values = parsed.data

    // The account must be one we actually publish — currency comes from the
    // account, never from the client, so a donor cannot claim USD for an NPR wire.
    const account = getBankAccount(values.accountId)
    if (!account || !getConfiguredBankAccounts().some((a) => a.id === account.id)) {
      return { ok: false, message: "Please choose one of the listed bank accounts." }
    }

    const rateLimit = await checkRateLimit({
      identifier: `bank-donation:${values.donorEmail.toLowerCase()}`,
      maxAttempts: 5,
      windowMinutes: 60,
    })

    if (!rateLimit.allowed) {
      return {
        ok: false,
        message: "You have submitted several transfers recently. Please wait a while or contact us.",
      }
    }

    // Optional proof of transfer (deposit slip / screenshot).
    const proofFile = formData.get("proof")
    let proofPath: string | null = null

    if (proofFile instanceof File && proofFile.size > 0) {
      if (!ALLOWED_PROOF_TYPES.includes(proofFile.type)) {
        return { ok: false, message: "Proof must be a JPG, PNG, WEBP, or PDF file." }
      }
      if (proofFile.size > MAX_PROOF_SIZE) {
        return { ok: false, message: "Proof must be 5MB or smaller." }
      }

      const extension = proofFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin"
      proofPath = `${randomUUID()}/proof.${extension}`

      const { error: uploadError } = await createServiceRoleClient()
        .storage.from(PROOF_BUCKET)
        .upload(proofPath, Buffer.from(await proofFile.arrayBuffer()), {
          contentType: proofFile.type,
          upsert: false,
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Bank transfer proof upload failed:", uploadError)
        return { ok: false, message: "We could not upload your proof of transfer. Please try again." }
      }
    }

    // Insert through the anon client so the RLS policy from migration 040 still
    // applies: pending only, no confirmation or provider-reference fields.
    const supabase = await createClient()
    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        amount: Number(values.amount.toFixed(2)),
        currency: account.currency,
        donor_name: values.donorName,
        donor_email: values.donorEmail,
        donor_phone: values.donorPhone || null,
        donor_message: values.donorMessage || null,
        is_monthly: false,
        payment_status: "pending",
        provider: "bank",
      })
      .select()
      .single()

    if (error || !donation) {
      console.error("Bank donation insert failed:", error)
      if (proofPath) {
        try {
          await createServiceRoleClient().storage.from(PROOF_BUCKET).remove([proofPath])
        } catch {
          // Ignore cleanup failures.
        }
      }
      return { ok: false, message: "We could not record your transfer. Please try again." }
    }

    // provider_ref / payment_id are blocked for anon by policy 040, so set them
    // with the service role — same two-step the gateway flow uses.
    const { error: updateError } = await createServiceRoleClient()
      .from("donations")
      .update({
        provider_ref: values.transactionRef,
        payment_id: `bank:${values.transactionRef}`,
        bank_account_id: account.id,
        bank_transfer_date: values.transferDate || null,
        bank_proof_path: proofPath,
      })
      .eq("id", donation.id)

    if (updateError) {
      // The donation row exists and an admin can still match it by name/amount,
      // so this is logged rather than surfaced as a failure to the donor.
      console.error("Failed to attach bank transfer reference:", updateError)
    }

    return {
      ok: true,
      donationId: donation.id,
      message:
        "Thank you. We have recorded your transfer and will email your receipt once our team confirms it with the bank, usually within 2 working days.",
    }
  } catch (err) {
    console.error("submitBankTransfer error:", err)
    return { ok: false, message: "An unexpected error occurred. Please try again." }
  }
}
