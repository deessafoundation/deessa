"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Loader2,
  Lock,
} from "lucide-react"
import { updateReviewStatus } from "@/lib/actions/admin-donation-actions"
import { updateReviewStatusPolymorphic } from "@/lib/actions/admin-payment-actions"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface ReviewStatusCardProps {
  donationId?: string
  entityId?: string
  entityType?: "donation" | "event" | "conference"
  currentStatus: "unreviewed" | "verified" | "flagged" | "refunded"
  userRole: "ADMIN" | "SUPER_ADMIN" | "FINANCE" | "EDITOR"
}

export function ReviewStatusCard({
  donationId,
  entityId,
  entityType,
  currentStatus,
  userRole,
}: ReviewStatusCardProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const isPolymorphic = !!entityId && !!entityType

  const STATUS_CONFIG: Record<
    string,
    { label: string; className: string; icon: React.ReactNode; desc: string }
  > = {
    unreviewed: {
      label: "Unreviewed",
      className: "bg-muted text-muted-foreground border-border",
      icon: <Clock className="size-3.5" />,
      desc: "Pending staff verification and cross-check",
    },
    verified: {
      label: "Verified",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      icon: <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
      desc: "Cross-checked and cleared by finance staff",
    },
    flagged: {
      label: "Flagged",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      icon: <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />,
      desc: "Discrepancy or question requires investigation",
    },
    refunded: {
      label: "Refunded",
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
      icon: <RotateCcw className="size-3.5 text-rose-600 dark:text-rose-400" />,
      desc: "Payment reversed or pledge canceled",
    },
  }

  const handleStatusChange = async (newStatus: "unreviewed" | "verified" | "flagged" | "refunded") => {
    if (!isAdmin || newStatus === status || isLoading) return

    setIsLoading(true)
    setPendingStatus(newStatus)
    try {
      const result = isPolymorphic
        ? await updateReviewStatusPolymorphic({
            entityId: entityId!,
            entityType: entityType!,
            reviewStatus: newStatus,
          })
        : await updateReviewStatus({
            donationId: donationId!,
            reviewStatus: newStatus,
          })

      if (result.ok) {
        setStatus(newStatus)
        notifications.showSuccess({
          title: "Status Updated",
          description: result.message || `Review status set to ${newStatus.toUpperCase()}`,
        })
      } else {
        notifications.showError({
          title: "Update Failed",
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Update review status error:", error)
      notifications.showError({
        title: "Error",
        description: "Failed to update review status. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setPendingStatus(null)
    }
  }

  const currentCfg = STATUS_CONFIG[status] || STATUS_CONFIG.unreviewed

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Governance & Review</CardTitle>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs font-semibold gap-1.5 px-2.5 py-0.5", currentCfg.className)}
        >
          {currentCfg.icon}
          <span>{currentCfg.label}</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Current Stage
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentCfg.desc}</p>
        </div>

        {isAdmin ? (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Set Review Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { key: "verified", label: "Verified", icon: CheckCircle2 },
                  { key: "unreviewed", label: "Unreviewed", icon: Clock },
                  { key: "flagged", label: "Flag", icon: AlertTriangle },
                  { key: "refunded", label: "Refunded", icon: RotateCcw },
                ] as const
              ).map((item) => {
                const isSelected = status === item.key
                const isItemLoading = isLoading && pendingStatus === item.key
                const Icon = item.icon

                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleStatusChange(item.key)}
                    className={cn(
                      "h-9 text-xs justify-start gap-2 font-medium cursor-pointer transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {isItemLoading ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <Icon
                        className={cn(
                          "size-3.5",
                          isSelected ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/60 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            <span>Admin authorization required to modify review status.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
