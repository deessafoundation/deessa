"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  Repeat,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Receipt,
  CreditCard,
  Building,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

interface TransactionOverviewProps {
  donation: {
    id: string
    amount: number
    currency: string
    payment_status: string
    provider: string
    receipt_number?: string | null
    created_at: string
    confirmed_at?: string | null
    receipt_sent_at?: string | null
    reviewed_at?: string | null
    reviewed_by?: string | null
    is_monthly?: boolean
    verification_id?: string | null
    payment_method?: string | null
  }
  reviewedByName?: string | null
}

export function TransactionOverview({ donation, reviewedByName }: TransactionOverviewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedKey(label)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const isCompleted = donation.payment_status?.toLowerCase() === "completed"
  const isFailed = donation.payment_status?.toLowerCase() === "failed"
  const isUnderReview = donation.payment_status?.toLowerCase() === "review"
  const hasReceipt = !!donation.receipt_number
  const isAudited = !!donation.reviewed_by || !!reviewedByName

  // Provider badge helper
  const getProviderBadge = (provider: string) => {
    const p = (provider || "").toLowerCase()
    if (p === "stripe") {
      return (
        <Badge variant="outline" className={cn("text-xs font-medium gap-1 px-2.5 py-0.5", styles.badgeStripe)}>
          <CreditCard className="size-3" /> Stripe
        </Badge>
      )
    }
    if (p === "khalti") {
      return (
        <Badge variant="outline" className={cn("text-xs font-medium gap-1 px-2.5 py-0.5", styles.badgeKhalti)}>
          <Building className="size-3" /> Khalti
        </Badge>
      )
    }
    if (p === "esewa") {
      return (
        <Badge variant="outline" className={cn("text-xs font-medium gap-1 px-2.5 py-0.5", styles.badgeEsewa)}>
          <Building className="size-3" /> eSewa
        </Badge>
      )
    }
    if (p === "bank" || p === "bank_transfer") {
      return (
        <Badge variant="outline" className={cn("text-xs font-medium gap-1 px-2.5 py-0.5", styles.badgeBank)}>
          <Building className="size-3" /> Bank Transfer
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs font-medium gap-1 px-2.5 py-0.5">
        {provider || "Direct"}
      </Badge>
    )
  }

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
      <CardContent className="p-5 sm:p-7 space-y-6">
        {/* ── Top Financial Amount Banner ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Settled Gross Contribution
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Sparkles className="size-3" /> Verified Entry
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums text-foreground">
              {formatCurrency(donation.amount, donation.currency, { showCode: true })}
            </div>
            <p className="text-xs text-muted-foreground">
              Recorded in <span className="font-semibold text-foreground">{donation.currency}</span> currency ledger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            {/* Gift Cadence */}
            <Badge
              variant={donation.is_monthly ? "default" : "secondary"}
              className="text-xs font-semibold gap-1.5 px-3 py-1 bg-background text-foreground border border-border shadow-2xs"
            >
              {donation.is_monthly ? (
                <>
                  <Repeat className="size-3 text-primary animate-spin" />
                  <span>Monthly Recurring</span>
                </>
              ) : (
                <span>One-Time Gift</span>
              )}
            </Badge>

            {/* Gateway Pill */}
            {getProviderBadge(donation.provider)}

            {/* Official Receipt Pill */}
            {donation.receipt_number ? (
              <Badge
                variant="outline"
                className="text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 px-2.5 py-1"
              >
                <Receipt className="size-3" />
                <span>{donation.receipt_number}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground border-dashed px-2.5 py-1">
                Receipt Unissued
              </Badge>
            )}
          </div>
        </div>

        {/* ── Transaction Lifecycle Stepper ──────────────────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
            <span>Transaction Lifecycle Pipeline</span>
            <span className="text-[11px] font-mono text-muted-foreground lowercase">
              status: {donation.payment_status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
            {/* Step 1: Initiated */}
            <div className="flex items-start sm:flex-col gap-3 sm:gap-2">
              <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">1. Initiated</p>
                <p className="text-[11px] text-muted-foreground truncate" title={formatAbsoluteTime(donation.created_at) || undefined}>
                  {formatRelativeTime(donation.created_at) || "Initiated"}
                </p>
              </div>
            </div>

            {/* Step 2: Payment Cleared / Confirmed */}
            <div className="flex items-start sm:flex-col gap-3 sm:gap-2">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border",
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                    : isFailed
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40"
                    : isUnderReview
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4" />
                ) : isFailed ? (
                  <XCircle className="size-4" />
                ) : isUnderReview ? (
                  <Clock className="size-4 animate-pulse" />
                ) : (
                  <Clock className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">2. Payment Settlement</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {donation.confirmed_at
                    ? formatRelativeTime(donation.confirmed_at)
                    : isFailed
                    ? "Payment Failed"
                    : isUnderReview
                    ? "Under Review"
                    : "Awaiting Clearance"}
                </p>
              </div>
            </div>

            {/* Step 3: Receipt Issued */}
            <div className="flex items-start sm:flex-col gap-3 sm:gap-2">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border",
                  hasReceipt
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {hasReceipt ? <FileCheck className="size-4" /> : <Receipt className="size-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">3. Official Receipt</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {donation.receipt_sent_at
                    ? `Dispatched ${formatRelativeTime(donation.receipt_sent_at)}`
                    : hasReceipt
                    ? "Generated"
                    : "Pending Generation"}
                </p>
              </div>
            </div>

            {/* Step 4: Governance / Audit */}
            <div className="flex items-start sm:flex-col gap-3 sm:gap-2">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border",
                  isAudited
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                <ShieldCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">4. Staff Governance</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {reviewedByName
                    ? `Audited by ${reviewedByName}`
                    : donation.reviewed_at
                    ? `Reviewed ${formatRelativeTime(donation.reviewed_at)}`
                    : "Standard Automated"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Identifiers & Cryptographic References ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Identifiers Column */}
          <div className="space-y-3 p-4 rounded-xl bg-card border border-border/70">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Cryptographic & System References
            </span>

            {/* Canonical Donation ID */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Canonical Donation ID</span>
                <span className="text-[10px] font-mono">UUID v4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-mono bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border/60 break-all flex-1 select-all">
                  {donation.id}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(donation.id, "Transaction ID")}
                  title="Copy Canonical ID"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
                >
                  {copiedKey === "Transaction ID" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Official Receipt Number */}
            {donation.receipt_number && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Official Receipt Number</span>
                  <span className="text-[10px] font-mono">Tax / Accounting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="text-xs font-mono font-bold bg-muted/60 text-primary px-2.5 py-1.5 rounded-lg border border-border/60 break-all flex-1 select-all">
                    {donation.receipt_number}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(donation.receipt_number!, "Receipt #")}
                    title="Copy Receipt #"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
                  >
                    {copiedKey === "Receipt #" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Public Verification UUID */}
            {donation.verification_id && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Public Verification Hash</span>
                  <span className="text-[10px] font-mono">Anti-Tamper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="text-xs font-mono bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border/60 break-all flex-1 select-all">
                    {donation.verification_id}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(donation.verification_id!, "Verification Hash")}
                    title="Copy Verification Hash"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
                  >
                    {copiedKey === "Verification Hash" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps Matrix Column */}
          <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Financial Audit Timestamps
            </span>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-muted-foreground block text-[11px] mb-0.5 flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" /> Initiated
                </span>
                <span className="font-semibold text-foreground block">
                  {formatRelativeTime(donation.created_at) || "—"}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {formatAbsoluteTime(donation.created_at)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-muted-foreground block text-[11px] mb-0.5 flex items-center gap-1">
                  <Check className="size-3 text-emerald-600" /> Settled / Confirmed
                </span>
                <span className="font-semibold text-foreground block">
                  {formatRelativeTime(donation.confirmed_at) || "Pending"}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {formatAbsoluteTime(donation.confirmed_at) || "Not settled"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-muted-foreground block text-[11px] mb-0.5 flex items-center gap-1">
                  <FileCheck className="size-3 text-sky-600" /> Receipt Sent
                </span>
                <span className="font-semibold text-foreground block">
                  {formatRelativeTime(donation.receipt_sent_at) || "Not sent"}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {formatAbsoluteTime(donation.receipt_sent_at) || "Pending dispatch"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-muted-foreground block text-[11px] mb-0.5 flex items-center gap-1">
                  <UserCheck className="size-3 text-purple-600" /> Staff Auditor
                </span>
                <span className="font-semibold text-foreground block truncate">
                  {reviewedByName || (donation.reviewed_by ? "Staff Admin" : "System Automated")}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {donation.reviewed_at ? formatRelativeTime(donation.reviewed_at) : "Routine workflow"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
