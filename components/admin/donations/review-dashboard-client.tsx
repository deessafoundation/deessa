"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  CreditCard,
  Building,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Download,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { ReviewActionDialog } from "./review-action-dialog"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

interface PaymentEvent {
  id: string
  provider: string
  event_id: string
  event_type: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw_payload: any
  created_at: string
}

interface Donation {
  id: string
  amount: number
  currency: string
  donor_name: string
  donor_email: string
  donor_phone: string | null
  payment_status: string
  provider: string | null
  provider_ref: string | null
  created_at: string
  confirmed_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes?: string | null
  review_status?: string | null
  bank_proof_path?: string | null
  bank_proof_url?: string | null
  bank_account_id?: string | null
  bank_transfer_date?: string | null
  payment_events: PaymentEvent[]
}

interface ReviewDashboardClientProps {
  donations: Donation[]
}

export function ReviewDashboardClient({ donations: initialDonations }: ReviewDashboardClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [donations, setDonations] = useState(initialDonations)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [expandedPayloads, setExpandedPayloads] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [providerFilter, setProviderFilter] = useState("all")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeVoucherUrl, setActiveVoucherUrl] = useState<string | null>(null)

  const handleActionComplete = (donationId: string) => {
    setDonations((prev) => prev.filter((d) => d.id !== donationId))
    setSelectedDonation(null)
    setActionType(null)
    startTransition(() => {
      router.refresh()
    })
  }

  const togglePayloadExpansion = (donationId: string) => {
    setExpandedPayloads((prev) => {
      const next = new Set(prev)
      if (next.has(donationId)) {
        next.delete(donationId)
      } else {
        next.add(donationId)
      }
      return next
    })
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedKey(label)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  // Calculate age in hours
  const getAgeInHours = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    return Math.floor(diff / (1000 * 60 * 60))
  }

  // Discrepancy detector
  const getAmountMismatchDetails = (donation: Donation) => {
    const event = donation.payment_events?.find(
      (e) => e.raw_payload && (e.raw_payload.amount || e.raw_payload.total_amount)
    )

    if (!event) return null

    const reportedAmount =
      event.raw_payload.amount || event.raw_payload.total_amount
    const isStripe = event.provider === "stripe"
    const actualAmount = isStripe ? reportedAmount / 100 : reportedAmount
    const expectedAmount = donation.amount

    if (actualAmount !== expectedAmount) {
      return {
        mismatch: true,
        expected: expectedAmount,
        actual: actualAmount,
        currency: donation.currency,
      }
    }

    return {
      mismatch: false,
      expected: expectedAmount,
      actual: actualAmount,
      currency: donation.currency,
    }
  }

  // Filtered queue
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (providerFilter !== "all" && d.provider?.toLowerCase() !== providerFilter.toLowerCase()) {
        return false
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const matchesName = (d.donor_name || "").toLowerCase().includes(q)
        const matchesEmail = (d.donor_email || "").toLowerCase().includes(q)
        const matchesRef = (d.provider_ref || "").toLowerCase().includes(q)
        const matchesId = d.id.toLowerCase().includes(q)
        return matchesName || matchesEmail || matchesRef || matchesId
      }
      return true
    })
  }, [donations, search, providerFilter])

  // KPI Metrics
  const queueKpis = useMemo(() => {
    const totalCount = donations.length
    const escalated = donations.filter((d) => getAgeInHours(d.created_at) > 24).length
    const totalValue = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    return { totalCount, escalated, totalValue }
  }, [donations])

  // Provider badge helper
  const getProviderBadge = (provider: string | null) => {
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
      <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5">
        {provider || "Direct"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Queue Depth */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Queue Depth
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tabular-nums">
                {queueKpis.totalCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">transactions awaiting review</p>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Escalated (> 24h) */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Escalated (&gt; 24h)
              </span>
              <div
                className={cn(
                  "text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums",
                  queueKpis.escalated > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                )}
              >
                {queueKpis.escalated}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">requires prioritized triage</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Value Under Review */}
        <Card className={cn(styles.kpiCard, "border-border/70 shadow-xs")}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Value Under Review
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tabular-nums">
                {formatCurrency(queueKpis.totalValue, "NPR", { showCode: true })}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">cumulative pledge volume</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Search & Filter Toolbar ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor, email, reference ID..."
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-muted/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="h-9 text-xs w-[150px] bg-muted/30">
              <SelectValue placeholder="All Gateways" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="khalti">Khalti</SelectItem>
              <SelectItem value="esewa">eSewa</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>

          {(search || providerFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setProviderFilter("all")
              }}
              className="h-9 text-xs px-2 text-muted-foreground cursor-pointer"
            >
              <RotateCcw className="size-3 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Queue Cards List ───────────────────────────────────────── */}
      {donations.length === 0 ? (
        <Card className="border-border/70 shadow-xs">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Review Queue Cleared</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 mb-6">
              All flagged transactions and bank deposit vouchers have been reviewed and resolved.
            </p>
            <Button asChild variant="outline" className="gap-2 text-xs">
              <Link href="/admin/donations">
                <ArrowLeft className="size-4" />
                <span>Return to Donations Ledger</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredDonations.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Search className="size-8 text-muted-foreground mb-3" />
            <h3 className="text-base font-bold text-foreground">No Matching Transactions</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              No items in the review queue matched your search query or provider filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("")
                setProviderFilter("all")
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => {
            const amountDetails = getAmountMismatchDetails(donation)
            const ageHours = getAgeInHours(donation.created_at)
            const isOld = ageHours > 24
            const isExpanded = expandedPayloads.has(donation.id)
            const latestEvent = donation.payment_events?.[0]
            const relativeTime = formatRelativeTime(donation.created_at)
            const isBank = donation.provider?.toLowerCase() === "bank" || !!donation.bank_proof_url

            return (
              <Card
                key={donation.id}
                className={cn(
                  "border transition-all shadow-xs overflow-hidden bg-card",
                  isOld
                    ? "border-amber-500/50 bg-amber-50/15 dark:bg-amber-950/10"
                    : "border-border/80"
                )}
              >
                {/* Header */}
                <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {(donation.donor_name || "?")
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground truncate">
                            {donation.donor_name || "Anonymous Donor"}
                          </h3>
                          {isOld && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0.5 gap-1 font-semibold"
                            >
                              <Clock className="size-3" />
                              {ageHours}h in queue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {donation.donor_email}
                          {donation.donor_phone && ` • ${donation.donor_phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {getProviderBadge(donation.provider)}
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold text-xs px-2.5 py-0.5"
                      >
                        Under Review
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Amount Breakdown Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 sm:p-4 rounded-xl bg-muted/30 border border-border/60">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                        Expected Donation Amount
                      </span>
                      <div className="text-2xl font-bold tabular-nums text-foreground">
                        {formatCurrency(donation.amount, donation.currency, { showCode: true })}
                      </div>
                    </div>

                    {amountDetails ? (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                          Gateway Reported Amount
                        </span>
                        <div
                          className={cn(
                            "text-2xl font-bold tabular-nums",
                            amountDetails.mismatch
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {formatCurrency(amountDetails.actual, amountDetails.currency, { showCode: true })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                          Gateway Confirmation
                        </span>
                        <span className="text-xs text-muted-foreground italic">
                          Awaiting webhook or deposit slip inspection
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amount Mismatch Banner */}
                  {amountDetails?.mismatch && (
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" />
                      <AlertDescription className="text-xs font-medium leading-relaxed">
                        <strong>Discrepancy Detected:</strong> Donor pledged{" "}
                        {formatCurrency(amountDetails.expected, amountDetails.currency)}, but provider recorded{" "}
                        {formatCurrency(amountDetails.actual, amountDetails.currency)}. Reconcile in provider console before approving.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Bank Deposit Voucher Preview (if Bank Transfer) */}
                  {isBank && donation.bank_proof_url && (
                    <div className="p-3.5 rounded-xl border border-primary/25 bg-primary/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                          <Building className="size-3.5" />
                          Attached Bank Deposit Slip
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveVoucherUrl(donation.bank_proof_url!)}
                          className="h-7 text-xs gap-1 text-primary hover:text-primary cursor-pointer"
                        >
                          <Maximize2 className="size-3" />
                          <span>Inspect Fullscreen</span>
                        </Button>
                      </div>

                      <div
                        onClick={() => setActiveVoucherUrl(donation.bank_proof_url!)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-primary/20 max-h-48 flex items-center justify-center bg-background"
                      >
                        <img
                          src={donation.bank_proof_url}
                          alt="Bank Deposit Slip Proof"
                          className="w-full h-auto max-h-48 object-contain rounded-lg transition-transform group-hover:scale-101"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs">
                          <Maximize2 className="size-3.5" />
                          <span>Click to Zoom & Reconcile</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs p-3 rounded-xl bg-muted/20 border border-border/50">
                    <div>
                      <span className="text-[11px] text-muted-foreground font-medium block">Pledged:</span>
                      <span className="font-semibold text-foreground truncate block">
                        {relativeTime || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground font-medium block">Provider Ref:</span>
                      {donation.provider_ref ? (
                        <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                          <span className="truncate">{donation.provider_ref}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(donation.provider_ref!, "Reference")}
                            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                            title="Copy reference"
                          >
                            {copiedKey === "Reference" ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground font-medium block">Transaction ID:</span>
                      <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                        <span className="truncate">{donation.id.slice(0, 10)}...</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(donation.id, "ID")}
                          className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedKey === "ID" ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground font-medium block">Deep Ledger:</span>
                      <Link
                        href={`/admin/donations/${donation.id}`}
                        className="text-primary hover:underline font-semibold inline-flex items-center gap-1 text-xs"
                      >
                        <span>Open Record</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Previous Staff Notes If Any */}
                  {donation.review_notes && (
                    <div className="rounded-xl border border-border/60 p-3 bg-muted/30 text-xs space-y-1">
                      <span className="font-semibold text-foreground block text-[11px]">
                        Attached Audit Note:
                      </span>
                      <p className="text-muted-foreground italic">&ldquo;{donation.review_notes}&rdquo;</p>
                    </div>
                  )}

                  {/* Collapsible Webhook Diagnostics */}
                  {latestEvent && (
                    <div className="rounded-xl border border-border/70 overflow-hidden bg-card">
                      <button
                        type="button"
                        onClick={() => togglePayloadExpansion(donation.id)}
                        className="w-full flex items-center justify-between p-3 text-xs font-semibold hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard className="size-3.5" />
                          <span>Gateway Webhook Payload ({latestEvent.provider})</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-3 border-t border-border/60 bg-muted/20 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px]">
                            <p><strong>Event ID:</strong> {latestEvent.event_id}</p>
                            <p><strong>Event Type:</strong> {latestEvent.event_type || "N/A"}</p>
                          </div>
                          <pre className="text-[11px] font-mono bg-muted p-3 rounded-lg overflow-x-auto max-h-52 overflow-y-auto border border-border/40">
                            {JSON.stringify(latestEvent.raw_payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Footer Action Buttons with Side-by-Side Mobile Ergonomics */}
                <CardFooter className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs w-full sm:w-auto gap-1.5 cursor-pointer"
                  >
                    <Link href={`/admin/donations/${donation.id}`}>
                      <span>Inspect Details</span>
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>

                  <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedDonation(donation)
                        setActionType("reject")
                      }}
                      className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 cursor-pointer"
                    >
                      <XCircle className="size-3.5 mr-1.5" />
                      <span>Reject</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedDonation(donation)
                        setActionType("approve")
                      }}
                      className="flex-1 sm:flex-none h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5 mr-1.5" />
                      <span>Approve</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Review Action Dialog ──────────────────────────────────── */}
      {selectedDonation && actionType && (
        <ReviewActionDialog
          donation={selectedDonation}
          actionType={actionType}
          onClose={() => {
            setSelectedDonation(null)
            setActionType(null)
          }}
          onComplete={handleActionComplete}
        />
      )}

      {/* ── Fullscreen Lightbox Modal for Bank Voucher ────────────── */}
      {activeVoucherUrl && (
        <Dialog open={!!activeVoucherUrl} onOpenChange={() => setActiveVoucherUrl(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-black/95 text-white border-zinc-800">
            <DialogHeader className="p-4 sm:p-5 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-900/80">
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Review Queue Deposit Voucher Inspector</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Verify bank deposit slip seal, account number, amount, and date before approval.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 font-medium border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                >
                  <a href={activeVoucherUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </a>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={activeVoucherUrl}
                alt="Full Resolution Deposit Slip"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <DialogFooter className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveVoucherUrl(null)}
                className="flex-1 sm:flex-none text-xs border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
              >
                Close Inspector
              </Button>
              <Button
                size="sm"
                asChild
                className="flex-1 sm:flex-none text-xs bg-primary text-primary-foreground"
              >
                <a href={activeVoucherUrl} target="_blank" rel="noopener noreferrer">
                  <span>Open Full Tab</span>
                  <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
