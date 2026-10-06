"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Send,
  ExternalLink,
  User,
  Mail,
  Phone,
  MessageSquare,
  Hash,
  FileText,
  Archive,
  ArchiveRestore,
  Mail as MailIcon,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { notifications } from "@/lib/notifications"
import { formatCurrency } from "@/lib/utils/currency"
import { markEventPaymentManual, extendEventRegistrationExpiry } from "@/lib/actions/events-module/event-registration"
import { ReviewStatusCard } from "@/components/admin/finance/review-status-card"
import { ReviewNotesSection } from "@/components/admin/finance/review-notes-section"
import { ActivityTimeline } from "@/components/admin/common/activity-timeline"
import { StatusChangeModal } from "@/components/admin/finance/status-change-modal"
import { ErrorBoundary } from "@/components/admin/common/error-boundary"
import { buildActivityTimeline } from "@/lib/utils/activity-timeline"
import { getProviderDashboardUrl, getProviderDashboardLabel } from "@/lib/utils/provider-dashboard"
import { resendReceipt, exportTransactionPDF } from "@/lib/actions/admin-donation-actions"

interface PaymentDetailData {
  type: "donation" | "event" | "conference"
  id: string
  name: string
  email: string
  phone: string | null
  amount: number | null
  currency: string
  provider: string | null
  status: string
  paymentId: string | null
  verificationId: string | null
  createdAt: string
  confirmedAt: string | null
  context: string
  contextDetail: string | null
  donorMessage: string | null
  isMonthly: boolean
  receiptNumber: string | null
  receiptSentAt: string | null
  reviewStatus: string | null
  reviewedAt: string | null
  reviewedByName: string | null
  sessionRefs: {
    stripeSessionId: string | null
    khaltiPidx: string | null
    esewaTransactionUuid: string | null
    paymentIntentId: string | null
    sessionId: string | null
    subscriptionId: string | null
    customerId: string | null
  }
  paymentEvents: any[]
  reviewNotes: any[]
  statusChanges: any[]
  paymentData: any
  registrationStatus: string | null
  ticketName: string | null
  eventTitle: string | null
  eventDate: string | null
  expiresAt: string | null
  paymentOverrideBy: string | null
  paymentInitiatedAt: string | null
  paymentPaidAt: string | null
  paymentFailedAt: string | null
  archivedAt: string | null
}

function formatTs(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
      title="Copy"
    >
      {copied ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
    </button>
  )
}

const statusConfig: Record<string, { className: string; label: string }> = {
  paid: { className: "bg-emerald-100 text-emerald-700", label: "Paid" },
  completed: { className: "bg-emerald-100 text-emerald-700", label: "Completed" },
  pending: { className: "bg-amber-100 text-amber-700", label: "Pending" },
  unpaid: { className: "bg-amber-100 text-amber-700", label: "Unpaid" },
  failed: { className: "bg-red-100 text-red-700", label: "Failed" },
  refunded: { className: "bg-purple-100 text-purple-700", label: "Refunded" },
  review: { className: "bg-orange-100 text-orange-700", label: "Under Review" },
  confirmed: { className: "bg-emerald-100 text-emerald-700", label: "Confirmed" },
  cancelled: { className: "bg-red-100 text-red-700", label: "Cancelled" },
  expired: { className: "bg-slate-100 text-slate-500", label: "Expired" },
}

const typeConfig: Record<string, { className: string; label: string }> = {
  donation: { className: "bg-pink-100 text-pink-700", label: "Donation" },
  event: { className: "bg-blue-100 text-blue-700", label: "Event" },
  conference: { className: "bg-indigo-100 text-indigo-700", label: "Conference" },
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ComponentType<any> }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[160px]">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      <p className="text-sm text-foreground text-right">{value || "—"}</p>
    </div>
  )
}

export function PaymentDetailClient({ data, userRole }: { data: PaymentDetailData; userRole: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"markPaid" | "extend" | "resend" | "archive" | "resendReceipt" | "exportPdf" | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const sc = statusConfig[(data.status || "").toLowerCase()] || statusConfig.pending
  const tc = typeConfig[data.type] || typeConfig.donation
  const isDonation = data.type === "donation"
  const isEvent = data.type === "event" || data.type === "conference"
  const isPaid = ["paid", "completed"].includes((data.status || "").toLowerCase())
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const isArchived = !!data.archivedAt

  // Build activity timeline for all types
  let timelineEvents: any[] = []
  try {
    if (isDonation) {
      timelineEvents = buildActivityTimeline({
        donation: {
          id: data.id,
          created_at: data.createdAt,
          confirmed_at: data.confirmedAt,
          receipt_sent_at: data.receiptSentAt,
          receipt_number: data.receiptNumber,
          amount: data.amount || 0,
          currency: data.currency,
          provider: data.provider || "",
          donor_email: data.email,
        },
        reviewNotes: data.reviewNotes || [],
        statusChanges: data.statusChanges || [],
        paymentEvents: data.paymentEvents || [],
      })
    } else {
      timelineEvents = buildActivityTimeline({
        registration: {
          id: data.id,
          created_at: data.createdAt,
          confirmed_at: data.confirmedAt,
          payment_paid_at: data.paymentPaidAt,
          payment_failed_at: data.paymentFailedAt,
          amount: data.amount || 0,
          currency: data.currency,
          provider: data.provider || "",
          email: data.email,
        },
        reviewNotes: data.reviewNotes || [],
        statusChanges: data.statusChanges || [],
        paymentEvents: data.paymentEvents || [],
      })
    }
  } catch {
    timelineEvents = []
  }

  // Session refs
  const sessionEntries = Object.entries(data.sessionRefs).filter(([, v]) => v)
  const sessionLabels: Record<string, string> = {
    stripeSessionId: "Stripe Session ID",
    khaltiPidx: "Khalti PIDX",
    esewaTransactionUuid: "eSewa Transaction UUID",
    paymentIntentId: "Stripe Payment Intent",
    sessionId: "Stripe Session",
    subscriptionId: "Stripe Subscription",
    customerId: "Stripe Customer",
  }

  // ── Action Handlers ─────────────────────────────────────────────

  async function handleMarkPaid() {
    setShowMarkPaidModal(false)
    setLoading("markPaid")
    const result = await markEventPaymentManual(data.id)
    setLoading(null)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Marked as paid and confirmed." })
      router.refresh()
    }
  }

  async function handleExtendExpiry() {
    setShowExtendModal(false)
    setLoading("extend")
    const result = await extendEventRegistrationExpiry(data.id, 24)
    setLoading(null)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Expiry extended by 24 hours." })
      router.refresh()
    }
  }

  async function handleResendLink() {
    setLoading("resend")
    try {
      const res = await fetch("/api/events/resend-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: data.id, email: data.email }),
      })
      const result = await res.json()
      if (!result.ok) {
        notifications.showError({ description: result.error || "Failed to resend" })
      } else {
        notifications.showSuccess({ description: result.message || "Payment link resent" })
      }
    } catch {
      notifications.showError({ description: "Failed to resend payment link" })
    } finally {
      setLoading(null)
    }
  }

  async function handleResendReceipt() {
    setLoading("resendReceipt")
    try {
      const result = await resendReceipt({ donationId: data.id })
      if (result.ok) {
        notifications.showSuccess({ description: result.message })
      } else {
        notifications.showError({ description: result.message })
      }
    } catch {
      notifications.showError({ description: "Failed to resend receipt" })
    } finally {
      setLoading(null)
    }
  }

  async function handleExportPDF() {
    setLoading("exportPdf")
    try {
      const result = await exportTransactionPDF({ donationId: data.id })
      if (result.ok && result.pdfUrl) {
        const link = document.createElement("a")
        link.href = result.pdfUrl
        link.download = result.fileName || `transaction-${data.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        notifications.showSuccess({ description: result.message })
      } else {
        notifications.showError({ description: result.message || "Failed to export" })
      }
    } catch {
      notifications.showError({ description: "Failed to export transaction" })
    } finally {
      setLoading(null)
    }
  }

  function handleViewDashboard() {
    if (!data.provider) return
    const dashboardData = {
      provider: data.provider,
      payment_intent_id: data.paymentData?.payment_intent_id || data.sessionRefs.paymentIntentId || null,
      session_id: data.paymentData?.session_id || data.sessionRefs.sessionId || null,
      payment_id: data.paymentId || null,
    }
    const url = getProviderDashboardUrl(data.provider, dashboardData, data.sessionRefs)
    if (url) {
      window.open(url, "_blank")
    } else {
      notifications.showError({ description: "Provider dashboard link not available for this transaction." })
    }
  }

  async function handleArchive() {
    setShowArchiveModal(false)
    setLoading("archive")
    try {
      const { archivePayment, unarchivePayment } = await import("@/lib/actions/archive-payment")
      const action = isArchived ? unarchivePayment : archivePayment
      const result = await action(data.id, data.type)
      if (result.error) {
        notifications.showError({ description: result.error })
      } else {
        notifications.showSuccess({
          description: isArchived ? "Record restored from archive." : "Record archived.",
        })
        router.refresh()
      }
    } catch {
      notifications.showError({ description: "Failed to update archive status" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/payments" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Payments
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">
          {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Payment
        </span>
      </div>

      {/* ── Header Card ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                {data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
                  <Badge variant="outline" className={`gap-1 text-xs ${tc.className}`}>
                    {tc.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{data.email}</p>
                {data.context && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.context}
                    {data.contextDetail && ` — ${data.contextDetail}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge variant="outline" className={`gap-1 px-3 py-1 ${sc.className}`}>
                {sc.label}
              </Badge>
              {data.amount && (
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(data.amount, data.currency, { showCode: true })}
                </p>
              )}
            </div>
          </div>

          {/* ── Action Buttons ──────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {/* Resend Receipt — donations only, admin only, when receipt exists */}
            {isDonation && isAdmin && data.receiptNumber && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendReceipt}
                disabled={!!loading}
                className="gap-2"
              >
                {loading === "resendReceipt" ? <Loader2 className="size-4 animate-spin" /> : <MailIcon className="size-4" />}
                Resend Receipt
              </Button>
            )}

            {/* Change Status — admin only */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
                disabled={!!loading}
                className="gap-2"
              >
                Change Status
              </Button>
            )}

            {/* Export PDF — donations only */}
            {isDonation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={!!loading}
                className="gap-2"
              >
                {loading === "exportPdf" ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                Export PDF
              </Button>
            )}

            {/* View in Provider Dashboard */}
            {data.provider && data.provider !== "fonepay" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleViewDashboard}
                disabled={!!loading}
                className="gap-2"
              >
                <ExternalLink className="size-4" />
                {getProviderDashboardLabel(data.provider)}
              </Button>
            )}

            {/* Resend Payment Link — events/conference only, unpaid */}
            {isEvent && !isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendLink}
                disabled={!!loading}
                className="gap-2"
              >
                {loading === "resend" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Resend Payment Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Left Column (3/4) ──────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Payer Info + Payment Details side by side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Payer Info */}
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-muted-foreground" />
                  Payer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                <DetailRow label="Full Name" value={data.name} icon={User} />
                <DetailRow label="Email" value={data.email} icon={Mail} />
                {data.phone && <DetailRow label="Phone" value={data.phone} icon={Phone} />}
                {data.donorMessage && (
                  <div className="border-b border-border py-3 last:border-b-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MessageSquare className="size-3.5" />
                      Message
                    </div>
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2">{data.donorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-muted-foreground" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                <DetailRow label="Amount" value={data.amount ? formatCurrency(data.amount, data.currency, { showCode: true }) : null} icon={DollarSign} />
                <DetailRow label="Provider" value={data.provider?.charAt(0).toUpperCase() + (data.provider?.slice(1) || "")} icon={CreditCard} />
                <DetailRow label="Status" value={sc.label} />
                {data.paymentId && (
                  <div className="flex flex-col gap-1 border-b border-border py-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="size-3.5" />
                      Payment Reference
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-xs text-foreground break-all select-all bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                        {data.paymentId}
                      </p>
                      <CopyButton text={data.paymentId} />
                    </div>
                  </div>
                )}
                {data.verificationId && (
                  <DetailRow label="Verification ID" value={data.verificationId} icon={FileText} />
                )}
                {data.receiptNumber && (
                  <DetailRow label="Receipt Number" value={data.receiptNumber} icon={FileText} />
                )}
                {data.isMonthly !== undefined && (
                  <DetailRow label="Type" value={data.isMonthly ? "Monthly Recurring" : "One-time"} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Context Info (for event/conference) */}
          {isEvent && (data.eventTitle || data.ticketName || data.registrationStatus) && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4 text-muted-foreground" />
                  Registration Context
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                {data.eventTitle && <DetailRow label="Event" value={data.eventTitle} icon={Calendar} />}
                {data.ticketName && <DetailRow label="Ticket Type" value={data.ticketName} icon={FileText} />}
                {data.registrationStatus && (
                  <DetailRow
                    label="Registration Status"
                    value={data.registrationStatus.charAt(0).toUpperCase() + data.registrationStatus.slice(1)}
                  />
                )}
                {data.eventDate && (
                  <DetailRow
                    label="Event Date"
                    value={new Date(data.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    icon={Calendar}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Session References */}
          {sessionEntries.length > 0 && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="size-4 text-muted-foreground" />
                  Provider Session References
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                {sessionEntries.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0">
                    <p className="text-sm text-muted-foreground">{sessionLabels[key] || key}</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-xs text-foreground break-all select-all bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                        {value as string}
                      </p>
                      <CopyButton text={value as string} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right Column (1/4) ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline" className={`text-xs ${tc.className}`}>{tc.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className={`text-xs ${sc.className}`}>{sc.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm font-medium capitalize">{data.provider || "—"}</span>
              </div>
              {data.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold">{formatCurrency(data.amount, data.currency, { showCode: true })}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatTs(data.createdAt)}</span>
              </div>
              {data.confirmedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="text-sm">{formatTs(data.confirmedAt)}</span>
                </div>
              )}
              {data.receiptSentAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receipt Sent</span>
                  <span className="text-sm">{formatTs(data.receiptSentAt)}</span>
                </div>
              )}
              {isDonation && data.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviewed</span>
                  <span className="text-sm">{formatTs(data.reviewedAt)}</span>
                </div>
              )}
              {isDonation && data.reviewedByName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviewed By</span>
                  <span className="text-sm">{data.reviewedByName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Actions (for event/conference unpaid) */}
          {isEvent && !isPaid && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="text-base">Payment Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <button
                  onClick={handleResendLink}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
                >
                  {loading === "resend" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Resend Payment Link
                </button>
                <button
                  onClick={() => setShowMarkPaidModal(true)}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
                >
                  <ShieldCheck className="size-4" />
                  Mark as Paid
                </button>
                <button
                  onClick={() => setShowExtendModal(true)}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-60"
                >
                  <RotateCcw className="size-4" />
                  Extend Expiry +24h
                </button>
              </CardContent>
            </Card>
          )}

          {/* Archive/Unarchive */}
          <Card>
            <CardContent className="p-6">
              <button
                onClick={() => setShowArchiveModal(true)}
                disabled={!!loading}
                className={`group flex items-center justify-center gap-2 w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-60 ${
                  isArchived
                    ? "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 hover:shadow-sm active:scale-[0.98]"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm active:scale-[0.98]"
                }`}
              >
                {isArchived ? (
                  <ArchiveRestore className="size-4 transition-transform group-hover:rotate-[-10deg]" />
                ) : (
                  <Archive className="size-4 transition-transform group-hover:scale-110" />
                )}
                {isArchived ? "Restore from Archive" : "Archive Record"}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Full Width: Review & Timeline ────────────────────────────── */}
      {/* Review Management Section — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
          <ErrorBoundary>
            <ReviewStatusCard
              entityId={data.id}
              entityType={data.type}
              donationId={isDonation ? data.id : undefined}
              currentStatus={(data.reviewStatus || "unreviewed") as any}
              userRole={userRole as any}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <ReviewNotesSection
              entityId={data.id}
              entityType={data.type}
              donationId={isDonation ? data.id : undefined}
              notes={data.reviewNotes || []}
              userRole={userRole as any}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Activity Timeline — full width */}
      {timelineEvents.length > 0 && (
        <div className="mt-6">
          <ErrorBoundary>
            <ActivityTimeline events={timelineEvents} />
          </ErrorBoundary>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isArchived ? "bg-green-100" : "bg-slate-100"}`}>
                {isArchived ? <ArchiveRestore className="size-5 text-green-600" /> : <Archive className="size-5 text-slate-600" />}
              </div>
              {isArchived ? "Restore Record" : "Archive Record"}
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              {isArchived
                ? <>Restore <strong className="text-foreground">{data.name}</strong>&apos;s payment record from the archive?</>
                : <>Archive <strong className="text-foreground">{data.name}</strong>&apos;s payment record?</>
              }
            </DialogDescription>
          </DialogHeader>
          <div className={`rounded-xl border p-4 text-sm leading-relaxed ${
            isArchived
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}>
            {isArchived
              ? "This record will reappear in the payments listing, reports, and search results."
              : "This record will be hidden from the default listing but retained for audit and compliance purposes. You can restore it anytime from this page."
            }
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowArchiveModal(false)}>Cancel</Button>
            <Button onClick={handleArchive} disabled={loading === "archive"} className={isArchived ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-600 hover:bg-slate-700 text-white"}>
              {loading === "archive" && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isArchived ? "Yes, Restore" : "Yes, Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Manually mark <strong className="text-foreground">{data.name}</strong>&apos;s payment as paid and confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800 leading-relaxed">
            ⚠ This will <strong>bypass the payment gateway</strong>. Use only when you&apos;ve confirmed payment was received through another channel. This action is logged.
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowMarkPaidModal(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={loading === "markPaid"} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading === "markPaid" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Extend the payment window for <strong className="text-foreground">{data.name}</strong> by 24 hours?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-700 leading-relaxed">
            The current expiry deadline will be pushed forward by <strong>24 hours</strong>, giving the registrant more time to complete their payment.
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowExtendModal(false)}>Cancel</Button>
            <Button onClick={handleExtendExpiry} disabled={loading === "extend"} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading === "extend" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Extend +24h
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <StatusChangeModal
        entityId={data.id}
        entityType={data.type}
        donationId={isDonation ? data.id : undefined}
        currentStatus={data.status}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
