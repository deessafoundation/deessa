"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  Settings,
  XCircle,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Wifi,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { triggerReconciliation, checkProviderStatus } from "./actions"
import Link from "next/link"

interface SystemHealth {
  database: {
    status: string
    latency: number
    tablesExist: {
      payment_events: boolean
      receipt_failures: boolean
      email_failures: boolean
      review_notes: boolean
    }
  }
  reconciliation: {
    timestamp: string
    donationsChecked: number
    donationsReconciled: number
    status: string
  }
  alerts: {
    stuckDonations: number
    reviewDonations: number
  }
  environment: {
    stripeKey: boolean
    stripeWebhook: boolean
    khaltiKey: boolean
    esewaKey: boolean
    esewaMerchant: boolean
    supabaseUrl: boolean
    supabaseKey: boolean
    paymentMode: string
  }
  timestamp: string
}

interface SystemHealthClientProps {
  initialHealth: SystemHealth
}

export function SystemHealthClient({ initialHealth }: SystemHealthClientProps) {
  const [health] = useState(initialHealth)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isReconciling, setIsReconciling] = useState(false)
  const [isCheckingProviders, setIsCheckingProviders] = useState(false)
  const [providerStatus, setProviderStatus] = useState<any>(null)
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      window.location.reload()
    } catch {
      notifications.showError({ description: "Failed to refresh" })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleConfirmReconciliation = async () => {
    setIsReconciling(true)
    try {
      const result = await triggerReconciliation()
      if (result.success) {
        notifications.showSuccess({
          title: "Reconciliation Complete",
          description: result.message,
        })
        setReconcileDialogOpen(false)
        setTimeout(() => window.location.reload(), 1200)
      } else {
        notifications.showError({
          title: "Reconciliation Failed",
          description: result.message,
        })
      }
    } catch {
      notifications.showError({ description: "Failed to trigger reconciliation engine" })
    } finally {
      setIsReconciling(false)
    }
  }

  const handleCheckProviders = async () => {
    setIsCheckingProviders(true)
    try {
      const result = await checkProviderStatus()
      setProviderStatus(result)
      notifications.showSuccess("Gateway API connectivity check completed")
    } catch {
      notifications.showError({ description: "Failed to check provider status" })
    } finally {
      setIsCheckingProviders(false)
    }
  }

  const getLatencyBadge = (latency: number) => {
    if (latency < 150) {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">{latency}ms • Fast</Badge>
    }
    if (latency < 400) {
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-mono">{latency}ms • Normal</Badge>
    }
    return <Badge variant="destructive" className="text-[10px] font-mono">{latency}ms • High Latency</Badge>
  }

  const overallHealthy =
    health.database.status === "healthy" &&
    health.alerts.stuckDonations === 0 &&
    Object.values(health.database.tablesExist).every((exists) => exists)

  return (
    <div className="space-y-6">
      {/* Overall Health Status Hero */}
      <Card
        className={`rounded-2xl border shadow-2xs backdrop-blur-xs overflow-hidden transition-all ${
          overallHealthy
            ? "border-emerald-500/30 bg-emerald-500/[0.03]"
            : "border-amber-500/30 bg-amber-500/[0.03]"
        }`}
      >
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`size-11 rounded-xl flex items-center justify-center shadow-2xs ${
                  overallHealthy
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                }`}
              >
                {overallHealthy ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {overallHealthy ? "Payment System Operational" : "Operational Attention Advised"}
                  </CardTitle>
                  <span className="relative flex size-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        overallHealthy ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full size-2.5 ${
                        overallHealthy ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                  </span>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Last system diagnostic pulse at{" "}
                  <span className="font-medium text-foreground">
                    {new Date(health.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
                className="h-9 px-3 text-xs"
              >
                <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Telemetry
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bento Grid: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Database Engine & Schemas */}
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Database className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Supabase Postgres Engine</CardTitle>
                  <CardDescription className="text-xs">Database connectivity & table integrity</CardDescription>
                </div>
              </div>
              {getLatencyBadge(health.database.latency)}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="font-medium text-muted-foreground">Connection State</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium">
                {health.database.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Required Operational Tables
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(health.database.tablesExist).map(([tableName, exists]) => (
                  <div
                    key={tableName}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/50"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground">{tableName}</span>
                    {exists ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <XCircle className="size-4 text-destructive" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Auto-Reconciliation Engine */}
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Zap className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Payment Reconciliation Engine</CardTitle>
                  <CardDescription className="text-xs">Stuck pending recovery & status polling</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Cron Managed
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-[11px] text-muted-foreground block">Stuck &gt;1h</span>
                <span className={`text-lg font-bold font-mono ${health.alerts.stuckDonations > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                  {health.alerts.stuckDonations}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Pending payments</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-[11px] text-muted-foreground block">Audit Backlog</span>
                <span className="text-lg font-bold font-mono text-primary">
                  {health.alerts.reviewDonations}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Manual review needed</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Last Engine Run:</span>
              <span className="font-medium text-foreground">
                {health.reconciliation.timestamp
                  ? new Date(health.reconciliation.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "No run recorded yet"}
              </span>
            </div>

            <Button
              type="button"
              onClick={() => setReconcileDialogOpen(true)}
              disabled={isReconciling}
              className="w-full h-10 text-xs font-medium"
            >
              {isReconciling ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  Running Reconciliation...
                </>
              ) : (
                <>
                  <Zap className="size-3.5 mr-1.5" />
                  Trigger Manual Reconciliation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Gateway Credentials & Secrets */}
        <Card className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs shadow-2xs lg:col-span-2">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Payment Gateway Configurations</CardTitle>
                  <CardDescription className="text-xs">Active environment secrets and provider API status</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={health.environment.paymentMode === "live" ? "default" : "secondary"} className="text-xs font-mono">
                  MODE: {health.environment.paymentMode.toUpperCase()}
                </Badge>
                <Button
                  onClick={handleCheckProviders}
                  disabled={isCheckingProviders}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                >
                  <Wifi className={`size-3.5 mr-1.5 ${isCheckingProviders ? "animate-pulse" : ""}`} />
                  Test Gateway Ping
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Stripe Secret</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">Stripe</span>
                  {health.environment.stripeKey ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Stripe Webhook</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">Webhook</span>
                  {health.environment.stripeWebhook ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Khalti Secret</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">Khalti</span>
                  {health.environment.khaltiKey ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">eSewa Secret</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">eSewa Key</span>
                  {health.environment.esewaKey ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">eSewa Merchant</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">Merchant ID</span>
                  {health.environment.esewaMerchant ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Supabase Service</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-foreground">Service Key</span>
                  {health.environment.supabaseKey ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Provider Ping Test Result */}
            {providerStatus && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2 mt-2">
                <span className="text-xs font-semibold text-foreground block">
                  Live Gateway Ping Results
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(providerStatus).map(([provider, info]: [string, any]) => (
                    <div
                      key={provider}
                      className="p-2.5 rounded-lg border border-border/40 bg-background/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium capitalize text-foreground block">{provider}</span>
                        <span className="text-[10px] text-muted-foreground">{info.message || (info.healthy ? "Connected" : "Error")}</span>
                      </div>
                      {info.healthy ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <XCircle className="size-4 text-destructive" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manual Reconciliation Confirmation Dialog */}
      <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Zap className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Trigger Payment Auto-Reconciliation
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              This initiates an operational sweep across all payments that have remained pending for more than 60 minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-xs space-y-1.5 my-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Items in Scope:</span>
              <span className="font-semibold text-foreground">{health.alerts.stuckDonations} transaction(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Action:</span>
              <span className="font-medium text-foreground">Query gateway callback & verify status</span>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReconcileDialogOpen(false)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReconciliation}
              disabled={isReconciling}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              {isReconciling ? (
                <>
                  <RefreshCw className="size-4 mr-1.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Zap className="size-4 mr-1.5" />
                  Confirm Run
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
