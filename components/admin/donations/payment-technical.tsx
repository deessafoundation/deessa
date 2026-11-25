"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Copy,
  Check,
  Building,
  CreditCard,
  Maximize2,
  ExternalLink,
  Download,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

interface PaymentTechnicalProps {
  payment: {
    payment_intent_id?: string | null
    session_id?: string | null
    subscription_id?: string | null
    customer_id?: string | null
    payment_id?: string | null
    verification_id?: string | null
    bank_account_id?: string | null
    bank_transfer_date?: string | null
    bank_proof_url?: string | null
  }
  provider: string
}

export function PaymentTechnical({ payment, provider }: PaymentTechnicalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedField(label)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } else {
      notifications.showError({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
      })
    }
  }

  const isBank = provider?.toLowerCase() === "bank" || provider?.toLowerCase() === "bank_transfer" || !!payment.bank_proof_url

  // Collect available non-empty technical fields
  const technicalFields = [
    { label: "Payment Intent ID", value: payment.payment_intent_id, tag: "Stripe Settlement" },
    { label: "Checkout Session ID", value: payment.session_id, tag: "Gateway Session" },
    { label: "Subscription ID", value: payment.subscription_id, tag: "Recurring Plan" },
    { label: "Customer ID", value: payment.customer_id, tag: "Donor Gateway Identity" },
    { label: "Gateway Reference / Payment ID", value: payment.payment_id, tag: "Provider Ref" },
    { label: "Verification Hash", value: payment.verification_id, tag: "Ledger UUID" },
    { label: "Destination Bank Account", value: payment.bank_account_id, tag: "Bank Ledger" },
    { label: "Bank Transfer Deposit Date", value: payment.bank_transfer_date ? formatAbsoluteTime(payment.bank_transfer_date) : null, tag: "Settlement Date" },
  ].filter((f) => Boolean(f.value))

  return (
    <>
      <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {isBank ? (
              <Building className="size-4 text-primary" />
            ) : (
              <CreditCard className="size-4 text-primary" />
            )}
            <CardTitle className="text-base font-bold">
              {isBank ? "Bank Reconciliation & Proof" : "Payment Technical Telemetry"}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs capitalize font-medium">
            {provider || "Direct"}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* ── Bank Slip Verification Studio (When Bank Transfer) ── */}
          {isBank && (
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-transparent p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  Deposit Slip Verification Studio
                </span>
                {payment.bank_account_id && (
                  <Badge variant="secondary" className="text-xs font-mono font-medium">
                    Account: {payment.bank_account_id}
                  </Badge>
                )}
              </div>

              {/* Deposit Slip Visual Preview Card */}
              {payment.bank_proof_url ? (
                <div className="space-y-3">
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className={cn(
                      styles.voucherPreview,
                      "relative group cursor-pointer overflow-hidden rounded-xl border border-primary/30 bg-muted/20 max-h-64 flex items-center justify-center shadow-xs"
                    )}
                  >
                    <img
                      src={payment.bank_proof_url}
                      alt="Bank Deposit Slip Proof"
                      className="w-full h-auto max-h-64 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                      <Maximize2 className="size-4" />
                      <span>Click to Zoom Fullscreen</span>
                    </div>
                  </div>

                  {/* Slip Quick Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLightboxOpen(true)}
                      className="h-8 text-xs gap-1.5 font-medium shadow-2xs cursor-pointer"
                    >
                      <Maximize2 className="size-3.5 text-primary" />
                      <span>Inspect Voucher</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs gap-1.5 font-medium shadow-2xs"
                      >
                        <a href={payment.bank_proof_url} download target="_blank" rel="noopener noreferrer">
                          <Download className="size-3.5" />
                          <span>Download Voucher</span>
                        </a>
                      </Button>

                      <a
                        href={payment.bank_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline pl-1"
                      >
                        <ExternalLink className="size-3" /> Raw URL
                      </a>
                    </div>
                  </div>

                  {/* Reconciliation Checklist */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 text-xs space-y-1.5 mt-2">
                    <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                      Reconciliation Checklist
                    </span>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Verify deposited amount against official bank statement records.</li>
                      <li>Confirm account number matches target foundation account.</li>
                      <li>Cross-check transaction date: {payment.bank_transfer_date ? new Date(payment.bank_transfer_date).toLocaleDateString() : "Check slip date"}.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-500/30 p-6 text-center bg-background/60">
                  <AlertTriangle className="size-7 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">No Deposit Slip Attached</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    Donor registered a bank transfer pledge without uploading a deposit voucher image. Confirm clearance via bank statement before marking completed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Technical Identifiers Grid (Only Non-Empty Fields) ── */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Gateway Telemetry & References
            </span>

            {technicalFields.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border/70 text-center text-xs text-muted-foreground italic">
                No external gateway session tokens registered for this transaction. Standard checkout pipeline applied.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {technicalFields.map((field) => (
                  <div
                    key={field.label}
                    className="p-3 rounded-xl bg-muted/20 border border-border/60 hover:bg-muted/30 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">{field.label}</span>
                      <span className="text-[10px] font-mono">{field.tag}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-mono bg-muted/60 px-2 py-1 rounded-md border border-border/60 flex-1 truncate select-all text-foreground font-semibold">
                        {field.value}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(field.value!, field.label)}
                        title={`Copy ${field.label}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border border-border/60 shrink-0"
                      >
                        {copiedField === field.label ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Fullscreen Lightbox Modal for Bank Voucher ── */}
      {payment.bank_proof_url && (
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
                  <a href={payment.bank_proof_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </a>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={payment.bank_proof_url}
                alt="Full Resolution Deposit Slip"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <DialogFooter className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLightboxOpen(false)}
                className="flex-1 sm:flex-none text-xs border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
              >
                Close Inspector
              </Button>
              <Button
                size="sm"
                asChild
                className="flex-1 sm:flex-none text-xs bg-primary text-primary-foreground"
              >
                <a href={payment.bank_proof_url} target="_blank" rel="noopener noreferrer">
                  <span>Open Full Tab</span>
                  <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
