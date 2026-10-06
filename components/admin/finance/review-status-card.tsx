"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FancySelect } from "@/components/ui/fancy-select"
import { updateReviewStatus } from "@/lib/actions/admin-donation-actions"
import { updateReviewStatusPolymorphic } from "@/lib/actions/admin-payment-actions"
import { notifications } from "@/lib/notifications"

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

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const isPolymorphic = !!entityId && !!entityType

  const getStatusColor = (s: string) => {
    switch (s) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "flagged":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "refunded":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!isAdmin) return

    setIsLoading(true)
    try {
      const result = isPolymorphic
        ? await updateReviewStatusPolymorphic({
            entityId: entityId!,
            entityType: entityType!,
            reviewStatus: newStatus as any,
          })
        : await updateReviewStatus({
            donationId: donationId!,
            reviewStatus: newStatus as any,
          })

      if (result.ok) {
        setStatus(newStatus as any)
        notifications.showSuccess({
          title: "Success",
          description: result.message,
        })
      } else {
        notifications.showError({
          title: "Error",
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
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Current Status</div>
          <Badge variant="outline" className={getStatusColor(status)}>
            {status.toUpperCase()}
          </Badge>
        </div>

        {isAdmin && (
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Change Status</div>
            <FancySelect
              value={status}
              onValueChange={handleStatusChange}
              disabled={isLoading}
              options={[
                { value: "unreviewed", label: "Unreviewed" },
                { value: "verified", label: "Verified" },
                { value: "flagged", label: "Flagged" },
                { value: "refunded", label: "Refunded" },
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
