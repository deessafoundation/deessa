"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Code2,
  Calendar,
  AlertTriangle,
  FileCheck,
} from "lucide-react"
import { toast } from "sonner"
import { retryReceiptGeneration, resolveReceiptFailure } from "./actions"
import Link from "next/link"

interface ReceiptFailure {
  id: string
  donation_id: string
  error_type: string
  error_message: string
  error_stack: string | null
  attempt_count: number
  last_attempt_at: string
  created_at: string
  donations: {
    id: string
    amount: number
    currency: string
    donor_name: string
    donor_email: string
    created_at: string
    payment_status: string
  } | null
}

interface FailedReceiptsClientProps {
  failures: ReceiptFailure[]
}

export function FailedReceiptsClient({ failures: initialFailures }: FailedReceiptsClientProps) {
  const [failures, setFailures] = useState(initialFailures)
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())
  const [resolveTarget, setResolveTarget] = useState<ReceiptFailure | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRetry = async (failure: ReceiptFailure) => {
    if (!failure.donations) {
      toast.error("Cannot retry: Linked donation record not found")
      return
    }

    setRetryingIds((prev) => new Set(prev).add(failure.id))

    try {
      const result = await retryReceiptGeneration(failure.donation_id)

      if (result.success) {
        // Mark as resolved in DB
        await resolveReceiptFailure(failure.id, "Auto-resolved after successful manual retry")

        // Remove from UI list
        setFailures((prev) => prev.filter((f) => f.id !== failure.id))

        toast.success("Receipt PDF generated and stored successfully!")
      } else {
        toast.error(`Retry failed: ${result.message}`)
      }
    } catch (error) {
      toast.error(`Retry failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev)
        next.delete(failure.id)
        return next
      })
    }
  }

  const handleConfirmResolve = async () => {
    if (!resolveTarget) return

    setIsResolving(true)
    try {
      await resolveReceiptFailure(resolveTarget.id, resolutionNotes.trim() || "Manually resolved by administrator")
      setFailures((prev) => prev.filter((f) => f.id !== resolveTarget.id))
      toast.success("Failure item marked as resolved")
      setResolveTarget(null)
      setResolutionNotes("")
    } catch (error) {
      toast.error(`Failed to resolve: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsResolving(false)
    }
  }

  const getErrorTypeBadge = (errorType: string) => {
    const type = errorType.toLowerCase()
    if (type.includes("generation") || type.includes("pdf")) {
      return <Badge variant="destructive" className="font-mono text-[10px]">PDF_GENERATION_FAILED</Badge>
    }
    if (type.includes("storage")) {
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono text-[10px]">STORAGE_WRITE_FAILED</Badge>
    }
    if (type.includes("rpc")) {
      return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-mono text-[10px]">RPC_EXEC_FAILED</Badge>
    }
    return (
      <Badge variant="outline" className="font-mono text-[10px]">
        {errorType.replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
  }

  if (failures.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-3">
        <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Zero Unresolved Receipt Failures</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            All donation receipt PDFs have been successfully compiled and stored in cloud storage.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/admin/payments/monitoring"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <span>View Delivery Monitoring Dashboard &rarr;</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{failures.length}</span> unresolved receipt failure{failures.length !== 1 ? "s" : ""}
        </p>
      </div>

      {failures.map((failure, index) => {
        const isRetrying = retryingIds.has(failure.id)
        const donation = failure.donations
        const sNo = index + 1

        return (
          <Card key={failure.id} className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                      S.No #{sNo}
                    </span>
                    <CardTitle className="text-base font-semibold">
                      {donation?.donor_name || "Unknown Donor"}
                    </CardTitle>
                    {getErrorTypeBadge(failure.error_type)}
                  </div>

                  <CardDescription className="text-xs flex flex-wrap items-center gap-2">
                    <span>{donation?.donor_email || "No email available"}</span>
                    {donation && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          {donation.currency} {donation.amount.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="capitalize text-muted-foreground">Status: {donation.payment_status}</span>
                      </>
                    )}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1.5 self-start">
                  <Link
                    href={`/admin/payments/${failure.donation_id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono px-2 py-1 rounded bg-primary/5 border border-primary/15"
                  >
                    <span>Inspect Ledger</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Error Callout */}
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-destructive font-medium">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="size-3.5" />
                    <span>Error Diagnostic:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(failure.error_message, `err-${failure.id}`)}
                    className="hover:underline flex items-center gap-1"
                  >
                    {copiedId === `err-${failure.id}` ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-mono text-foreground break-all">
                  {failure.error_message}
                </p>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[11px] text-muted-foreground block">Retry Attempts</span>
                  <span className="font-mono font-semibold text-foreground">{failure.attempt_count} / 3</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[11px] text-muted-foreground block">Last Attempt</span>
                  <span className="font-medium text-foreground">{new Date(failure.last_attempt_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[11px] text-muted-foreground block">First Failed</span>
                  <span className="font-medium text-foreground">{new Date(failure.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[11px] text-muted-foreground block">Donation ID</span>
                  <span className="font-mono text-muted-foreground truncate block">{failure.donation_id.slice(0, 10)}...</span>
                </div>
              </div>

              {/* Stack Trace Collapsible */}
              {failure.error_stack && (
                <details className="text-xs rounded-lg border border-border/40 bg-muted/20 overflow-hidden group">
                  <summary className="p-2.5 cursor-pointer font-medium text-muted-foreground hover:text-foreground flex items-center justify-between select-none">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="size-3.5" />
                      <span>Inspect Raw Stack Trace</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-3 border-t border-border/40 bg-muted/50">
                    <pre className="text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-48 whitespace-pre-wrap">
                      {failure.error_stack}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>

            {/* Side-by-side action buttons on mobile */}
            <CardFooter className="p-3.5 sm:p-4 border-t border-border/40 bg-muted/10 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setResolveTarget(failure)
                  setResolutionNotes("")
                }}
                className="flex-1 sm:flex-none h-10 px-4 text-xs font-medium"
              >
                <FileCheck className="size-3.5 mr-1.5 text-muted-foreground" />
                Resolve Manually
              </Button>

              <Button
                type="button"
                onClick={() => handleRetry(failure)}
                disabled={isRetrying || !donation}
                size="sm"
                className="flex-1 sm:flex-none h-10 px-4 text-xs font-medium"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Retry Receipt
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}

      {/* Manual Resolution Dialog */}
      <Dialog open={!!resolveTarget} onOpenChange={(open) => !open && setResolveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-base font-semibold">Mark Failure as Resolved</DialogTitle>
            <DialogDescription className="text-xs">
              Resolve this dead-letter queue item if you generated the receipt manually or confirmed it is already delivered.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-foreground">Resolution Notes (Optional)</label>
            <Textarea
              placeholder="e.g. Receipt manually issued and sent via support ticket #481"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolveTarget(null)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmResolve}
              disabled={isResolving}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Mark as Resolved"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
