"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  FileDown,
  ExternalLink,
  ShieldAlert,
  Building,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./donations.module.css"

interface TransactionHeaderProps {
  donationId: string
  paymentStatus: string
  paymentProvider: string
  userRole: "ADMIN" | "SUPER_ADMIN" | "FINANCE" | "EDITOR"
  hasReceipt: boolean
  onResendReceipt?: () => void
  onChangeStatus?: () => void
  onExportPDF?: () => void
  onViewDashboard?: () => void
  isLoading?: boolean
}

export function TransactionHeader({
  donationId,
  paymentStatus,
  paymentProvider,
  userRole,
  hasReceipt,
  onResendReceipt,
  onChangeStatus,
  onExportPDF,
  onViewDashboard,
  isLoading = false,
}: TransactionHeaderProps) {
  const [copied, setCopied] = useState(false)

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const hasFinanceAccess = ["ADMIN", "SUPER_ADMIN", "FINANCE"].includes(userRole)

  const handleCopyId = async () => {
    const success = await copyToClipboard(donationId)
    if (success) {
      setCopied(true)
      notifications.showSuccess("Transaction ID copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Status badge styling with optical status dot/pulse
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          label: "Completed",
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
        }
      case "pending":
        return {
          label: "Pending Verification",
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
          icon: <Clock className="size-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />,
        }
      case "failed":
        return {
          label: "Failed / Declined",
          className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
          icon: <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />,
        }
      case "review":
        return {
          label: "Under Review",
          className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
          icon: <AlertTriangle className="size-3.5 text-orange-600 dark:text-orange-400 animate-pulse" />,
        }
      default:
        return {
          label: status.toUpperCase(),
          className: "bg-muted text-muted-foreground border-border",
          icon: <Clock className="size-3.5 text-muted-foreground" />,
        }
    }
  }

  // Provider badge styling
  const getProviderConfig = (provider: string) => {
    const p = (provider || "").toLowerCase()
    switch (p) {
      case "stripe":
        return {
          label: "Stripe",
          className: styles.badgeStripe,
          icon: <CreditCard className="size-3" />,
        }
      case "khalti":
        return {
          label: "Khalti",
          className: styles.badgeKhalti,
          icon: <Building className="size-3" />,
        }
      case "esewa":
        return {
          label: "eSewa",
          className: styles.badgeEsewa,
          icon: <Building className="size-3" />,
        }
      case "bank":
      case "bank_transfer":
        return {
          label: "Bank Transfer",
          className: styles.badgeBank,
          icon: <Building className="size-3" />,
        }
      default:
        return {
          label: (provider || "Manual").toUpperCase(),
          className: "bg-muted text-muted-foreground border-border",
          icon: <CreditCard className="size-3" />,
        }
    }
  }

  const statusConfig = getStatusConfig(paymentStatus)
  const provConfig = getProviderConfig(paymentProvider)

  return (
    <div className="space-y-4">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/donations"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Donations Ledger</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-mono">#{donationId.slice(0, 8)}</span>
        </div>

        <Link
          href={`/admin/donations/review`}
          className="hover:text-foreground transition-colors text-[11px] hidden sm:inline"
        >
          Review Queue &rarr;
        </Link>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-border/60">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Donation #{donationId.slice(0, 8)}
            </h1>

            {/* Quick Copy UUID Button */}
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy full Transaction UUID"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border border-border/60"
            >
              {copied ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span className="hidden sm:inline">UUID</span>
            </button>

            {/* Status & Gateway Badges */}
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn("text-xs font-semibold gap-1.5 px-2.5 py-0.5", statusConfig.className)}
              >
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </Badge>

              <Badge
                variant="outline"
                className={cn("text-xs font-medium gap-1 px-2.5 py-0.5", provConfig.className)}
              >
                {provConfig.icon}
                <span>{provConfig.label}</span>
              </Badge>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
            Canonical Ref: {donationId}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full lg:w-auto">
          {/* Change Status - Admin Only */}
          {isAdmin && onChangeStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeStatus}
              disabled={isLoading}
              className="gap-2 h-9 text-xs font-medium shadow-2xs touch-manipulation cursor-pointer"
            >
              <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Change Status</span>
            </Button>
          )}

          {/* Resend Receipt */}
          {isAdmin && hasReceipt && onResendReceipt && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResendReceipt}
              disabled={isLoading}
              className="gap-2 h-9 text-xs font-medium shadow-2xs touch-manipulation cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Mail className="size-3.5 text-primary" />
              )}
              <span>Resend Receipt</span>
            </Button>
          )}

          {/* Export PDF */}
          {hasFinanceAccess && onExportPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              disabled={isLoading}
              className="gap-2 h-9 text-xs font-medium shadow-2xs touch-manipulation cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <FileDown className="size-3.5" />
              )}
              <span>Export PDF</span>
            </Button>
          )}

          {/* View Gateway Dashboard */}
          {onViewDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDashboard}
              disabled={isLoading}
              className="gap-2 h-9 text-xs font-medium shadow-2xs touch-manipulation cursor-pointer"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>Gateway</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
