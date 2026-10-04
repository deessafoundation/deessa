"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Send,
  History,
  Copy,
  Check,
  Eye,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { markEventPaymentManual, extendEventRegistrationExpiry } from "@/lib/actions/events-module/event-registration"

interface PaymentEvent {
  id: string
  provider: string
  event_id: string
  created_at: string
}

interface EventPaymentInfoProps {
  registrationId: string
  paymentStatus: string | null
  paymentAmount: number | null
  paymentCurrency: string | null
  paymentProvider: string | null
  paymentId: string | null
  stripeSessionId: string | null
  khaltiPidx: string | null
  esewaTransactionUuid: string | null
  paymentInitiatedAt: string | null
  paymentPaidAt: string | null
  paymentFailedAt: string | null
  paymentReviewAt: string | null
  paymentOverrideBy: string | null
  expiresAt: string | null
  email: string
  fullName: string
  paymentEvents: PaymentEvent[]
  paymentScreenshotUrl: string | null
}

function formatTs(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function PaymentBadge({ status }: { status?: string | null }) {
  if (status === "paid")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>
  if (status === "failed")
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>
  if (status === "refunded")
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Refunded</Badge>
  if (status === "review")
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Under Review</Badge>
  return <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100">Unpaid</Badge>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-1 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
    </button>
  )
}

function ProviderIcon({ provider }: { provider: string | null }) {
  if (!provider) return <CreditCard className="size-4 text-muted-foreground" />
  switch (provider.toLowerCase()) {
    case "stripe":
      return <span className="text-sm">💳</span>
    case "khalti":
      return <span className="text-sm">🟣</span>
    case "esewa":
      return <span className="text-sm">🟢</span>
    case "qr":
    case "manual":
      return <span className="text-sm">📱</span>
    default:
      return <CreditCard className="size-4 text-muted-foreground" />
  }
}

export function EventPaymentInfo({
  registrationId,
  paymentStatus,
  paymentAmount,
  paymentCurrency,
  paymentProvider,
  paymentId,
  stripeSessionId,
  khaltiPidx,
  esewaTransactionUuid,
  paymentInitiatedAt,
  paymentPaidAt,
  paymentFailedAt,
  paymentReviewAt,
  paymentOverrideBy,
  expiresAt,
  email,
  fullName,
  paymentEvents,
  paymentScreenshotUrl,
}: EventPaymentInfoProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"resend" | "markPaid" | "extend" | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [inlineMessage, setInlineMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const isPaid = paymentStatus === "paid"
  const isFailed = paymentStatus === "failed"
  const isReview = paymentStatus === "review"
  const isUnpaid = !paymentStatus || paymentStatus === "unpaid"

  const showFeedback = (type: "success" | "error", text: string) => {
    setInlineMessage({ type, text })
    if (type === "success") notifications.showSuccess({ description: text })
    else notifications.showError({ description: text })
  }

  async function handleResendLink() {
    setLoading("resend")
    setInlineMessage(null)
    try {
      const res = await fetch("/api/events/resend-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, email }),
      })
      const data = await res.json()
      if (!data.ok) showFeedback("error", data.error || "Failed to resend payment link")
      else showFeedback("success", data.message || `Payment link resent to ${email}`)
    } catch {
      showFeedback("error", "Failed to resend payment link")
    } finally {
      setLoading(null)
    }
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
    setLoading("extend")
    setInlineMessage(null)
    const result = await extendEventRegistrationExpiry(registrationId, 24)
    setLoading(null)
    if (result.error) showFeedback("error", result.error)
    else { showFeedback("success", "Expiry extended by 24 hours."); router.refresh() }
  }

  // Build session reference display
  const sessionRef = stripeSessionId || khaltiPidx || esewaTransactionUuid || null
  const sessionLabel = stripeSessionId
    ? "Stripe Session ID"
    : khaltiPidx
      ? "Khalti PIDX"
      : esewaTransactionUuid
        ? "eSewa Transaction UUID"
        : null

  // Build timeline from timestamps + payment events
  type TimelineEntry = { icon: string; label: string; ts: string | null; color: string }
  const timeline: TimelineEntry[] = []

  if (paymentInitiatedAt) {
    timeline.push({ icon: "💳", label: "Payment initiated", ts: formatTs(paymentInitiatedAt), color: "text-amber-600" })
  }

  // Add payment_events as webhook received entries
  for (const pe of paymentEvents) {
    timeline.push({
      icon: "🔔",
      label: `Webhook received (${pe.provider})`,
      ts: formatTs(pe.created_at),
      color: "text-blue-600",
    })
  }

  if (paymentPaidAt) {
    timeline.push({ icon: "✅", label: "Payment confirmed", ts: formatTs(paymentPaidAt), color: "text-green-600" })
  }

  if (paymentFailedAt) {
    timeline.push({ icon: "❌", label: "Payment failed", ts: formatTs(paymentFailedAt), color: "text-red-600" })
  }

  if (paymentReviewAt) {
    timeline.push({ icon: "🔍", label: "Flagged for review", ts: formatTs(paymentReviewAt), color: "text-orange-600" })
  }

  if (paymentOverrideBy) {
    timeline.push({
      icon: "🛡️",
      label: `Manually marked paid by ${paymentOverrideBy}`,
      ts: paymentPaidAt ? formatTs(paymentPaidAt) : null,
      color: "text-purple-600",
    })
  }

  if (expiresAt && !isPaid) {
    const isExpired = new Date(expiresAt) < new Date()
    timeline.push({
      icon: isExpired ? "⏰" : "⏳",
      label: isExpired ? "Payment link expired" : `Payment link expires ${formatTs(expiresAt)}`,
      ts: null,
      color: isExpired ? "text-red-500" : "text-amber-500",
    })
  }

  timeline.reverse()

  return (
    <Card>
      <CardHeader className="border-b border-border px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="size-4 text-muted-foreground" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        {/* Inline feedback */}
        {inlineMessage && (
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
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

        {/* Status + Amount row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProviderIcon provider={paymentProvider} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {paymentProvider ? paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1) : "Unknown Provider"}
              </p>
              {paymentAmount && (
                <p className="text-xs text-muted-foreground">
                  {paymentCurrency || "NPR"} {Number(paymentAmount).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <PaymentBadge status={paymentStatus} />
        </div>

        {/* Session reference */}
        {sessionRef && (
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">{sessionLabel}</p>
            <div className="flex items-center gap-1">
              <p className="font-mono text-xs text-foreground break-all select-all">
                {sessionRef}
              </p>
              <CopyButton text={sessionRef} />
            </div>
          </div>
        )}

        {/* Internal payment_id */}
        {paymentId && (
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">Internal Payment Reference</p>
            <div className="flex items-center gap-1">
              <p className="font-mono text-xs text-foreground break-all select-all">
                {paymentId}
              </p>
              <CopyButton text={paymentId} />
            </div>
          </div>
        )}

        {/* Payment timeline */}
        {timeline.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Timeline
              </p>
            </div>
            <div className="relative space-y-0">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                      {entry.icon}
                    </div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border my-0.5" />}
                  </div>
                  <div className="pb-3 pt-0.5">
                    <p className={`text-xs font-medium ${entry.color}`}>{entry.label}</p>
                    {entry.ts && (
                      <p className="text-[11px] text-muted-foreground">{entry.ts}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiry warning */}
        {expiresAt && !isPaid && (
          <div className={`rounded-lg border px-3 py-2 text-xs ${
            new Date(expiresAt) < new Date()
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="size-3.5" />
              <span className="font-medium">
                {new Date(expiresAt) < new Date()
                  ? "Payment link has expired"
                  : `Expires ${formatTs(expiresAt)}`}
              </span>
            </div>
          </div>
        )}

        {/* Payment Screenshot (QR payments) */}
        {paymentScreenshotUrl && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📸</span>
              <p className="text-xs font-semibold text-blue-700">Payment Screenshot</p>
            </div>
            <button
              type="button"
              onClick={() => setShowScreenshotModal(true)}
              className="group relative w-full rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer"
            >
              <img
                src={paymentScreenshotUrl}
                alt="Payment screenshot"
                className="w-full h-auto max-h-64 object-contain transition-all duration-200 group-hover:opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
                <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg">
                  <Eye className="size-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">View Full Image</span>
                </div>
              </div>
            </button>
            <p className="mt-2 text-[11px] text-blue-600">
              Uploaded by attendee — verify payment details above
            </p>
          </div>
        )}

        {/* Screenshot Full View Modal */}
        <Dialog open={showScreenshotModal} onOpenChange={setShowScreenshotModal}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center justify-between">
                <span>Payment Screenshot</span>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              <img
                src={paymentScreenshotUrl!}
                alt="Payment screenshot - full view"
                className="w-full h-auto rounded-lg border border-border"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Admin actions */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Payment Actions
          </p>
          <div className="flex flex-col gap-2">
            {/* Resend payment link */}
            {isUnpaid && (
              <button
                onClick={handleResendLink}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
              >
                {loading === "resend" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Resend Payment Link
              </button>
            )}

            {/* Mark as paid */}
            {!isPaid && (
              <button
                onClick={() => setShowMarkPaidModal(true)}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
              >
                {loading === "markPaid" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                Mark as Paid (Manual Override)
              </button>
            )}

            {/* Extend expiry */}
            {!isPaid && (
              <button
                onClick={() => setShowExtendModal(true)}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-60"
              >
                {loading === "extend" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                Extend Expiry +24h
              </button>
            )}
          </div>
        </div>

        {/* Mark as Paid Modal */}
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
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowMarkPaidModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleMarkPaid} disabled={loading === "markPaid"} className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                {loading === "markPaid" && <Loader2 className="mr-2 size-4 animate-spin" />}
                Yes, Mark as Paid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Expiry Modal */}
        <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <RotateCcw className="size-5 text-purple-600" />
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
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowExtendModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleExtendExpiry} disabled={loading === "extend"} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                {loading === "extend" && <Loader2 className="mr-2 size-4 animate-spin" />}
                Yes, Extend +24h
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
