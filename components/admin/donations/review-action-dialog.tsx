"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react"
import { reviewDonation } from "@/lib/actions/admin-donation-review"
import { formatCurrency } from "@/lib/utils/currency"
import { notifications } from "@/lib/notifications"

interface Donation {
  id: string
  amount: number
  currency: string
  donor_name: string
  donor_email: string
  payment_status: string
  provider: string | null
}

interface ReviewActionDialogProps {
  donation: Donation
  actionType: "approve" | "reject"
  onClose: () => void
  onComplete: (donationId: string) => void
}

const APPROVAL_PRESETS = [
  "Amount discrepancy verified manually with gateway provider.",
  "Bank statement verified against submitted deposit voucher.",
  "Payment cleared after temporary 3DS bank delay.",
  "Approved per supervisor authorization.",
]

const REJECTION_PRESETS = [
  "Payment could not be verified in gateway or bank statement.",
  "Amount mismatch could not be resolved. Please re-initiate donation.",
  "Invalid or unreadable deposit slip voucher.",
  "Duplicate payment pledge canceled per donor request.",
]

export function ReviewActionDialog({
  donation,
  actionType,
  onClose,
  onComplete,
}: ReviewActionDialogProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isApprove = actionType === "approve"
  const presets = isApprove ? APPROVAL_PRESETS : REJECTION_PRESETS

  const handleSubmit = async () => {
    if (!notes.trim()) {
      notifications.showError({
        title: "Notes Required",
        description: "Please provide explanatory notes for this audit action.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await reviewDonation({
        donationId: donation.id,
        decision: actionType,
        notes: notes.trim(),
      })

      if (result.success) {
        notifications.showSuccess(result.message)
        onComplete(donation.id)
      } else {
        notifications.showError({
          title: "Action Failed",
          description: result.message,
        })
      }
    } catch (error) {
      notifications.showError({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isApprove ? (
              <>
                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <span>Approve & Confirm Donation</span>
              </>
            ) : (
              <>
                <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                  <XCircle className="size-5" />
                </div>
                <span>Reject Flagged Donation</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {isApprove
              ? "Confirm receipt of funds, generate an official receipt, and notify the donor."
              : "Mark this transaction as failed and inform the donor with a resolution notice."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Donation Summary Card */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Donor Name:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {donation.donor_name || "Anonymous"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Donor Email:</span>
              <span className="font-medium text-foreground truncate max-w-[220px]">
                {donation.donor_email || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/40">
              <span className="text-muted-foreground font-medium">Contribution Amount:</span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {formatCurrency(donation.amount, donation.currency, { showCode: true })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Payment Provider:</span>
              <span className="font-semibold uppercase tracking-wider text-[11px] text-primary">
                {donation.provider || "Direct"}
              </span>
            </div>
          </div>

          {/* Audit Alert */}
          <Alert
            variant={isApprove ? "default" : "destructive"}
            className={
              isApprove
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
                : ""
            }
          >
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs leading-relaxed">
              {isApprove ? (
                <>
                  <strong>Audit Impact:</strong> Marking this transaction as confirmed will generate
                  an official tax receipt and email it directly to <strong>{donation.donor_email}</strong>.
                </>
              ) : (
                <>
                  <strong>Audit Impact:</strong> Marking this transaction as failed will cancel receipt
                  generation and deliver your rejection notice to <strong>{donation.donor_email}</strong>.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Notes & Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="review-notes" className="text-xs font-semibold">
                {isApprove ? "Audit Approval Notes" : "Rejection Reason (Emailed to Donor)"} <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-medium">Required for Audit</span>
            </div>

            <Textarea
              id="review-notes"
              placeholder={
                isApprove
                  ? "e.g., Verified in Nepal Bank statement reference #94821"
                  : "e.g., Deposit slip voucher could not be matched with bank ledger."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              className="text-xs sm:text-sm font-medium"
            />

            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1.5 font-medium">
                <Sparkles className="size-3 text-primary" /> Quick Audit Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNotes(preset)}
                    className="text-[11px] px-2 py-1 rounded-md border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
                  >
                    {preset.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Side-by-Side Mobile Buttons */}
        <DialogFooter className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none h-10 px-4 font-medium text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !notes.trim()}
            variant={isApprove ? "default" : "destructive"}
            className={
              isApprove
                ? "flex-1 sm:flex-none h-10 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
                : "flex-1 sm:flex-none h-10 px-5 font-semibold text-xs cursor-pointer"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isApprove ? (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                <span>Confirm Approval</span>
              </>
            ) : (
              <>
                <XCircle className="mr-2 size-4" />
                <span>Confirm Rejection</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
