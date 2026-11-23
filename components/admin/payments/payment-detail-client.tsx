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
  FileDown,
  Building,
  Maximize2,
  Download,
  AlertTriangle,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
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
import { cn } from "@/lib/utils"
import styles from "./payments.module.css"

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
  bankProofUrl?: string | null
  bankAccountId?: string | null
  bankTransferDate?: string | null
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

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  review: {
    label: "In Review",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
}

const typeConfig: Record<string, { label: string; className: string }> = {
  donation: {
    label: "Donation",
    className: styles.badgeDonation,
  },
  event: {
    label: "Event Registration",
    className: styles.badgeEvent,
  },
  conference: {
    label: "Conference Registration",
    className: styles.badgeConference,
  },
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

function CopyButton({ text, label = "Value" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    notifications.showSuccess({ description: `${label} copied to clipboard.` })
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0 cursor-pointer"
      title={`Copy ${label}`}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function PaymentDetailClient({ data, userRole }: { data: PaymentDetailData; userRole: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"markPaid" | "extend" | "resend" | "archive" | "resendReceipt" | "exportPdf" | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const sc = statusConfig[(data.status || "").toLowerCase()] || statusConfig.pending
  const tc = typeConfig[data.type] || typeConfig.donation
  const isDonation = data.type === "donation"
  const isEvent = data.type === "event" || data.type === "conference"
  const isPaid = ["paid", "completed"].includes((data.status || "").toLowerCase())
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const isArchived = !!data.archivedAt

  // Build activity timeline
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

  // Session references
  const sessionEntries = Object.entries(data.sessionRefs).filter(([, v]) => Boolean(v))
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
          description: isArchived ? "Record restored from archive." : "Record moved to archive.",
        })
        router.refresh()
      }
    } catch {
      notifications.showError({ description: "Failed to update archive status" })
    } finally {
      setLoading(null)
    }
  }

  // 4-milestone lifecycle steps
  const isGatewaySettled = isPaid || Boolean(data.confirmedAt) || Boolean(data.paymentPaidAt)
  const isReceiptIssued = Boolean(data.receiptNumber) || Boolean(data.receiptSentAt)
  const isAudited = data.reviewStatus === "verified" || Boolean(data.reviewedAt)

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Top Navigation ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link
            href="/admin/payments"
            className="hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="size-3.5" />
            <span>Master Ledger</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground capitalize">
            {data.type} Dossier
          </span>
        </div>

        {/* 1-Click ID Copy Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/80 px-2.5 py-1 rounded-lg text-xs font-mono text-muted-foreground">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/80">UUID:</span>
            <span className="truncate max-w-[160px] sm:max-w-none">{data.id}</span>
            <CopyButton text={data.id} label="Transaction UUID" />
          </div>
        </div>
      </div>

      {/* ── Master Header Banner ────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* Contributor Profile */}
            <div className="flex items-start gap-4">
              <div className="size-14 sm:size-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-lg sm:text-xl font-bold text-primary shrink-0 shadow-2xs">
                {(data.name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                    {data.name}
                  </h1>
                  <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5", tc.className)}>
                    {tc.label}
                  </Badge>
                  {isArchived && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                      Archived
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{data.email}</p>
                {data.context && (
                  <p className="text-xs text-muted-foreground font-medium">
                    {data.context}
                    {data.contextDetail && ` — ${data.contextDetail}`}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Amount & Status Badge */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
              <Badge
                variant="outline"
                className={cn("text-xs font-semibold px-3 py-1 gap-1.5", sc.className)}
              >
                <span className={cn("size-2 rounded-full animate-pulse", sc.dotColor)} />
                {sc.label}
              </Badge>
              {data.amount !== null && (
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(data.amount, data.currency || "NPR", { showCode: true })}
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-border/70">
            {/* Status Change Modal Trigger */}
            {isAdmin && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
                disabled={Boolean(loading)}
                className="h-9 px-3.5 font-medium gap-1.5 shadow-2xs"
              >
                <ShieldCheck className="size-4" />
                <span>Change Status</span>
              </Button>
            )}

            {/* Provider Dashboard Link */}
            {data.provider && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDashboard}
                disabled={Boolean(loading)}
                className="h-9 px-3.5 font-medium gap-1.5 shadow-2xs"
              >
                <ExternalLink className="size-4 text-primary" />
                <span>{getProviderDashboardLabel(data.provider)}</span>
              </Button>
            )}

            {/* Resend Receipt (Donations) */}
            {isDonation && isAdmin && data.receiptNumber && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendReceipt}
                disabled={Boolean(loading)}
                className="h-9 px-3 font-medium gap-1.5 shadow-2xs"
              >
                {loading === "resendReceipt" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                <span>Resend Receipt</span>
              </Button>
            )}

            {/* Export PDF (Donations) */}
            {isDonation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={Boolean(loading)}
                className="h-9 px-3 font-medium gap-1.5 shadow-2xs"
              >
                {loading === "exportPdf" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                <span>Export PDF</span>
              </Button>
            )}

            {/* Resend Payment Link (Event/Conference unpaid) */}
            {isEvent && !isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendLink}
                disabled={Boolean(loading)}
                className="h-9 px-3 font-medium gap-1.5 shadow-2xs"
              >
                {loading === "resend" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4 text-primary" />
                )}
                <span>Resend Payment Link</span>
              </Button>
            )}

            {/* Archive / Restore Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveModal(true)}
              disabled={Boolean(loading)}
              className="h-9 px-3 font-medium gap-1.5 ml-auto text-muted-foreground hover:text-foreground"
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="size-4 text-emerald-600" />
                  <span>Restore Record</span>
                </>
              ) : (
                <>
                  <Archive className="size-4 text-amber-600" />
                  <span>Archive</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 4-Milestone Lifecycle Stepper ────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Transaction Lifecycle Stepper</span>
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground">
              4-Phase Verification Rail
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Step 1: Initiated */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-card">
              <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold text-foreground">1. Initiated</p>
                <p className="text-[11px] text-muted-foreground">{formatTs(data.createdAt)}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Logged to clearinghouse</span>
              </div>
            </div>

            {/* Step 2: Gateway Settled */}
            <div className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border",
              isGatewaySettled
                ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                : "border-border/60 bg-muted/20 opacity-70"
            )}>
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                isGatewaySettled
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              )}>
                {isGatewaySettled ? <Check className="size-4" /> : <Clock className="size-4" />}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold">2. Gateway Settled</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.confirmedAt || data.paymentPaidAt
                    ? formatTs(data.confirmedAt || data.paymentPaidAt)
                    : isPaid
                      ? "Settled"
                      : "Awaiting settlement"}
                </p>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Provider: {data.provider || "Manual"}
                </span>
              </div>
            </div>

            {/* Step 3: Official Receipt */}
            <div className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border",
              isReceiptIssued
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border/60 bg-muted/20 opacity-70"
            )}>
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                isReceiptIssued
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              )}>
                {isReceiptIssued ? <Check className="size-4" /> : <FileText className="size-4" />}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold">3. Official Receipt</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.receiptNumber ? `#${data.receiptNumber}` : isDonation ? "Pending issuance" : "N/A (Registration)"}
                </p>
                {data.receiptSentAt && (
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Sent {formatTs(data.receiptSentAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Step 4: Staff Audited */}
            <div className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border",
              isAudited
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border/60 bg-muted/20 opacity-70"
            )}>
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                isAudited
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              )}>
                {isAudited ? <ShieldCheck className="size-4" /> : <Clock className="size-4" />}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold">4. Staff Audited</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.reviewedByName ? `By ${data.reviewedByName}` : "Unreviewed"}
                </p>
                {data.reviewedAt && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatTs(data.reviewedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Two Column Core Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Payer Info + Technical References + Deposit Slip */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payer / Registrant Dossier Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Payer & Contributor Dossier</span>
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                {data.email}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/60 space-y-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs text-muted-foreground font-medium">Full Legal Name</span>
                <span className="text-sm font-semibold text-foreground">{data.name}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground font-medium">Email Address</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${data.email}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {data.email}
                  </a>
                  <CopyButton text={data.email} label="Email" />
                </div>
              </div>

              {data.phone && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground font-medium">Phone Number</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${data.phone}`}
                      className="text-xs font-mono text-foreground hover:underline"
                    >
                      {data.phone}
                    </a>
                    <CopyButton text={data.phone} label="Phone" />
                  </div>
                </div>
              )}

              {/* Event/Conference Context Fields */}
              {data.eventTitle && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground font-medium">Registered Event</span>
                  <span className="text-xs font-semibold text-foreground">{data.eventTitle}</span>
                </div>
              )}

              {data.ticketName && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground font-medium">Ticket Tier</span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {data.ticketName}
                  </Badge>
                </div>
              )}

              {data.contextDetail && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground font-medium">Registration Detail</span>
                  <span className="text-xs text-foreground font-medium">{data.contextDetail}</span>
                </div>
              )}

              {data.donorMessage && (
                <div className="pt-3 space-y-1.5">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <MessageSquare className="size-3.5" />
                    Donor Message
                  </span>
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xl border border-border/60 leading-relaxed italic">
                    &ldquo;{data.donorMessage}&rdquo;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit Slip Verification Studio (When bank slip exists) */}
          {data.bankProofUrl && (
            <Card className="border-primary/30 shadow-xs overflow-hidden bg-gradient-to-br from-primary/5 via-card to-transparent">
              <CardHeader className="py-4 px-6 border-b border-primary/20 bg-primary/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-4" />
                  <span>Deposit Slip Verification Studio</span>
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-mono border-primary/30 text-primary">
                  Verified Attachment
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-primary/30 bg-muted/20 max-h-64 flex items-center justify-center shadow-xs"
                >
                  <img
                    src={data.bankProofUrl}
                    alt="Bank Deposit Slip Proof"
                    className="w-full h-auto max-h-64 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                    <Maximize2 className="size-4" />
                    <span>Click to Zoom Fullscreen</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLightboxOpen(true)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Maximize2 className="size-3.5" />
                    <span>Expand Inspector</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs gap-1.5"
                  >
                    <a href={data.bankProofUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="size-3.5" />
                      <span>Download Voucher</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Telemetry & Session References */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Technical Telemetry & Session Refs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/60 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-muted-foreground font-medium">Gateway Provider</span>
                <span className="text-xs font-semibold capitalize text-foreground">
                  {data.provider || "Direct / Manual"}
                </span>
              </div>

              {data.paymentId && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-medium">Payment ID / Ref</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {data.paymentId}
                    </span>
                    <CopyButton text={data.paymentId} label="Payment Reference" />
                  </div>
                </div>
              )}

              {data.verificationId && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-medium">Verification Hash</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {data.verificationId}
                    </span>
                    <CopyButton text={data.verificationId} label="Verification Hash" />
                  </div>
                </div>
              )}

              {/* Dynamic Gateway Sessions */}
              {sessionEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {sessionLabels[key] || key}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-0.5 rounded max-w-[200px] truncate">
                      {value as string}
                    </span>
                    <CopyButton text={value as string} label={sessionLabels[key] || key} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Summary & Quick Management Actions */}
        <div className="space-y-6">
          {/* Quick Transaction Summary Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-semibold">Ledger Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className={cn("text-[10px] font-medium", tc.className)}>
                  {tc.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Settlement Status</span>
                <Badge variant="outline" className={cn("text-[10px] font-medium gap-1 px-2 py-0.5", sc.className)}>
                  <span className={cn("size-1.5 rounded-full animate-pulse", sc.dotColor)} />
                  {sc.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gateway</span>
                <span className="font-medium capitalize text-foreground">{data.provider || "Manual"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gross Amount</span>
                <span className="font-bold text-sm text-foreground tabular-nums">
                  {data.amount !== null
                    ? formatCurrency(data.amount, data.currency || "NPR", { showCode: true })
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Initiated Date</span>
                <span className="font-medium text-foreground">{formatTs(data.createdAt)}</span>
              </div>

              {data.confirmedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confirmed Date</span>
                  <span className="font-medium text-foreground">{formatTs(data.confirmedAt)}</span>
                </div>
              )}

              {data.receiptNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Receipt Number</span>
                  <span className="font-mono font-bold text-foreground">#{data.receiptNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event/Conference Action Studio (If unpaid) */}
          {isEvent && !isPaid && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
                <CardTitle className="text-sm font-semibold">Payment Action Studio</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendLink}
                  disabled={Boolean(loading)}
                  className="w-full justify-start gap-2 h-10 font-medium"
                >
                  {loading === "resend" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 text-primary" />}
                  <span>Resend Payment Link</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMarkPaidModal(true)}
                  disabled={Boolean(loading)}
                  className="w-full justify-start gap-2 h-10 font-medium border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                >
                  <ShieldCheck className="size-4" />
                  <span>Manual Payment Override</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExtendModal(true)}
                  disabled={Boolean(loading)}
                  className="w-full justify-start gap-2 h-10 font-medium border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
                >
                  <RotateCcw className="size-4" />
                  <span>Extend Expiry (+24 Hours)</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Review Management (Admin Only) ──────────────────────────── */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
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

      {/* ── Activity Timeline ───────────────────────────────────────── */}
      {timelineEvents.length > 0 && (
        <div className="pt-2">
          <ErrorBoundary>
            <ActivityTimeline events={timelineEvents} />
          </ErrorBoundary>
        </div>
      )}

      {/* ── Lightbox Modal for Deposit Voucher ──────────────────────── */}
      {data.bankProofUrl && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-black/95 text-white border-zinc-800">
            <DialogHeader className="p-4 sm:p-5 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-900/80">
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Full-Resolution Deposit Slip Voucher</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Inspect deposit voucher seal, stamp, transaction reference, and signature.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 font-medium border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                >
                  <a href={data.bankProofUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </a>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={data.bankProofUrl}
                alt="Full Resolution Deposit Slip"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Mobile Responsive Side-by-Side Buttons */}
            <DialogFooter className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLightboxOpen(false)}
                className="flex-1 sm:flex-none text-xs border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white h-10 px-4 font-medium"
              >
                Close Inspector
              </Button>
              <Button
                size="sm"
                asChild
                className="flex-1 sm:flex-none text-xs bg-primary text-primary-foreground h-10 px-4 font-semibold"
              >
                <a href={data.bankProofUrl} target="_blank" rel="noopener noreferrer">
                  <span>Open Full Tab</span>
                  <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Archive Confirmation Modal (Side-by-side mobile buttons) ── */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isArchived ? "bg-emerald-100" : "bg-muted"}`}>
                {isArchived ? <ArchiveRestore className="size-5 text-emerald-600" /> : <Archive className="size-5 text-muted-foreground" />}
              </div>
              <span>{isArchived ? "Restore Record" : "Archive Record"}</span>
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              {isArchived
                ? <>Restore <strong className="text-foreground">{data.name}</strong>&apos;s payment record from the archive?</>
                : <>Archive <strong className="text-foreground">{data.name}</strong>&apos;s payment record?</>
              }
            </DialogDescription>
          </DialogHeader>
          <div className={cn(
            "rounded-xl border p-4 text-xs sm:text-sm leading-relaxed",
            isArchived ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-border bg-muted/30 text-muted-foreground"
          )}>
            {isArchived
              ? "This record will reappear in the payments ledger, reports, and search results."
              : "This record will be hidden from the default listing but retained for audit and compliance purposes."}
          </div>
          {/* Side-by-Side Mobile Responsive DialogFooter */}
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowArchiveModal(false)}
              disabled={Boolean(loading)}
              className="flex-1 sm:flex-none h-10 px-4 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleArchive}
              disabled={Boolean(loading)}
              className={cn(
                "flex-1 sm:flex-none h-10 px-5 font-semibold text-white",
                isArchived ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-700 hover:bg-slate-800"
              )}
            >
              {loading === "archive" && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isArchived ? "Yes, Restore" : "Yes, Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manual Override Modal (Side-by-side mobile buttons) ──────── */}
      <Dialog open={showMarkPaidModal} onOpenChange={setShowMarkPaidModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <ShieldCheck className="size-5 text-amber-600" />
              </div>
              <span>Manual Payment Override</span>
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Manually mark <strong className="text-foreground">{data.name}</strong>&apos;s payment as paid and confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 leading-relaxed">
            ⚠ This will <strong>bypass the payment gateway</strong>. Use only when you have confirmed payment was received through an external channel. This action is logged.
          </div>
          {/* Side-by-Side Mobile Responsive DialogFooter */}
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMarkPaidModal(false)}
              disabled={Boolean(loading)}
              className="flex-1 sm:flex-none h-10 px-4 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMarkPaid}
              disabled={loading === "markPaid"}
              className="flex-1 sm:flex-none h-10 px-5 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading === "markPaid" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Extend Expiry Modal (Side-by-side mobile buttons) ────────── */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <RotateCcw className="size-5 text-purple-600" />
              </div>
              <span>Extend Payment Expiry</span>
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Extend the payment window for <strong className="text-foreground">{data.name}</strong> by 24 hours?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs sm:text-sm text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 leading-relaxed">
            The expiry deadline will be pushed forward by <strong>24 hours</strong>, allowing the registrant to complete payment.
          </div>
          {/* Side-by-Side Mobile Responsive DialogFooter */}
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExtendModal(false)}
              disabled={Boolean(loading)}
              className="flex-1 sm:flex-none h-10 px-4 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExtendExpiry}
              disabled={loading === "extend"}
              className="flex-1 sm:flex-none h-10 px-5 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading === "extend" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Extend +24h
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Status Change Modal ─────────────────────────────────────── */}
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
