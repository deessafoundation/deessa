"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { notifications } from "@/lib/notifications"
import {
  confirmEventRegistration,
  cancelEventRegistration,
  markEventPaymentManual,
  extendEventRegistrationExpiry,
} from "@/lib/actions/events-module/event-registration"

interface EventStatusActionsProps {
  registrationId: string
  currentStatus: string
  paymentStatus: string
  fullName: string
  email: string
}

type LoadingKey = "confirm" | "cancel" | "markPaid" | "extendExpiry" | null
type InlineMessage = { type: "success" | "error"; text: string } | null

export function EventStatusActions({
  registrationId,
  currentStatus,
  paymentStatus,
  fullName,
  email,
}: EventStatusActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<LoadingKey>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [inlineMessage, setInlineMessage] = useState<InlineMessage>(null)

  const isPaid = paymentStatus === "paid"
  const isConfirmed = currentStatus === "confirmed"
  const isCancelled = currentStatus === "cancelled"
  const isPending = currentStatus === "pending"

  const showFeedback = (type: "success" | "error", text: string) => {
    setInlineMessage({ type, text })
    if (type === "success") notifications.showSuccess({ description: text })
    else notifications.showError({ description: text })
  }

  async function handleConfirm() {
    setShowConfirmModal(false)
    setLoading("confirm")
    setInlineMessage(null)
    const result = await confirmEventRegistration(registrationId, { force: !isPaid })
    setLoading(null)
    if (result.error) showFeedback("error", result.error)
    else { showFeedback("success", `Confirmed. Email sent to ${email}.`); router.refresh() }
  }

  async function handleCancel() {
    setShowCancelModal(false)
    setLoading("cancel")
    setInlineMessage(null)
    const result = await cancelEventRegistration(registrationId)
    setLoading(null)
    if (result.error) showFeedback("error", result.error)
    else { showFeedback("success", `Cancelled. Email sent to ${email}.`); router.refresh() }
  }

  async function handleMarkPaid() {
    setShowMarkPaidModal(false)
    setLoading("markPaid")
    setInlineMessage(null)
    const result = await markEventPaymentManual(registrationId)
    setLoading(null)
    if (result.error) showFeedback("error", result.error)
    else { showFeedback("success", "Marked as paid and confirmed."); router.refresh() }
  }

  async function handleExtendExpiry() {
    setShowExtendModal(false)
    setLoading("extendExpiry")
    setInlineMessage(null)
    const result = await extendEventRegistrationExpiry(registrationId, 24)
    setLoading(null)
    if (result.error) showFeedback("error", result.error)
    else { showFeedback("success", "Expiry extended by 24 hours."); router.refresh() }
  }

  return (
    <>
      {/* Inline feedback banner */}
      {inlineMessage && (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium mb-4 ${
          inlineMessage.type === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {inlineMessage.type === "success" ? (
            <CheckCircle className="mt-0.5 size-5 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0" />
          )}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!!loading || isConfirmed}
          title={!isPaid && !isConfirmed ? "Payment not received — will force-confirm" : undefined}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          {loading === "confirm" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4 transition-transform group-hover:scale-110" />}
          {isConfirmed ? "Already Confirmed" : !isPaid ? "Force Confirm" : "Confirm Registration"}
        </button>

        <button
          onClick={() => setShowCancelModal(true)}
          disabled={!!loading || isCancelled}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading === "cancel" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4 transition-transform group-hover:scale-110" />}
          {isCancelled ? "Already Cancelled" : "Cancel Registration"}
        </button>
      </div>

      {/* Payment Admin Actions */}
      {!isConfirmed && !isCancelled && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {!isPaid && (
            <button
              onClick={() => setShowMarkPaidModal(true)}
              disabled={!!loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading === "markPaid" ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5 transition-transform group-hover:scale-110" />}
              Mark as Paid
            </button>
          )}

          {(isPending || isCancelled) && !isPaid && (
            <button
              onClick={() => setShowExtendModal(true)}
              disabled={!!loading}
              className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700 transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading === "extendExpiry" ? <Loader2 className="size-3.5 animate-spin" /> : <Clock className="size-3.5 transition-transform group-hover:scale-110" />}
              Extend Expiry +24h
            </button>
          )}
        </div>
      )}

      {/* Action hint */}
      {!isConfirmed && !isCancelled && !inlineMessage && (
        <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
          {!isPaid ? (
            <>
              <span className="font-medium text-amber-600">Payment not received.</span>{" "}
              Use &quot;Mark as Paid&quot; to confirm without requiring payment, or &quot;Force Confirm&quot; to confirm anyway.
            </>
          ) : (
            <>
              &quot;Confirm Registration&quot; sends{" "}
              <span className="font-medium text-foreground">{email}</span> a confirmation email.
            </>
          )}
        </p>
      )}

      {/* ── Confirm Modal ── */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              {isPaid ? "Confirm Registration" : "Force Confirm"}
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              {isPaid
                ? <>Confirm <strong className="text-foreground">{fullName}</strong>&apos;s registration. A confirmation email will be sent.</>
                : <>Force confirm <strong className="text-foreground">{fullName}</strong>&apos;s registration without payment.</>}
            </DialogDescription>
          </DialogHeader>
          <div className={`rounded-xl border p-4 text-sm leading-relaxed ${
            isPaid
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-amber-100 bg-amber-50 text-amber-800"
          }`}>
            {isPaid ? (
              <>A <strong>confirmation email</strong> will be sent to <span className="font-semibold">{email}</span>.</>
            ) : (
              <>⚠ This will confirm without payment. Use only when payment was received through another channel.</>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={loading === "confirm"} className="bg-green-600 hover:bg-green-700 text-white">
              {loading === "confirm" && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPaid ? "Yes, Confirm" : "Yes, Force Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Modal ── */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              Cancel Registration
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              You are about to cancel <strong className="text-foreground">{fullName}</strong>&apos;s registration.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 leading-relaxed">
            A <strong>cancellation email</strong> will be sent to{" "}
            <span className="font-semibold">{email}</span>.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>Keep Registration</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading === "cancel"}>
              {loading === "cancel" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Mark as Paid Modal ── */}
      <Dialog open={showMarkPaidModal} onOpenChange={setShowMarkPaidModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <ShieldCheck className="size-5 text-amber-600" />
              </div>
              Manual Payment Override
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Manually mark <strong className="text-foreground">{fullName}</strong>&apos;s registration as paid and confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800 leading-relaxed">
            ⚠ This will <strong>bypass the payment gateway</strong>. Use only when you&apos;ve confirmed payment was received through another channel (e.g. bank transfer). This action is logged.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowMarkPaidModal(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={loading === "markPaid"} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading === "markPaid" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Extend Expiry Modal ── */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Clock className="size-5 text-purple-600" />
              </div>
              Extend Payment Expiry
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Extend the payment window for <strong className="text-foreground">{fullName}</strong> by 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-700 leading-relaxed">
            The current expiry deadline will be pushed forward by <strong>24 hours</strong>.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExtendModal(false)}>Cancel</Button>
            <Button onClick={handleExtendExpiry} disabled={loading === "extendExpiry"} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading === "extendExpiry" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Extend +24h
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
