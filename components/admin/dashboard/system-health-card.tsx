"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemHealthCardProps {
  receiptSuccessRate: number
  emailSuccessRate: number
}

export function SystemHealthCard({ receiptSuccessRate, emailSuccessRate }: SystemHealthCardProps) {
  const getRateColor = (rate: number) => {
    if (rate >= 95) return "text-emerald-600 dark:text-emerald-400"
    if (rate >= 80) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getRateBarColor = (rate: number) => {
    if (rate >= 95) return "bg-emerald-500"
    if (rate >= 80) return "bg-amber-500"
    return "bg-red-500"
  }

  const getRateBadge = (rate: number) => {
    if (rate >= 95) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
    if (rate >= 80) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
  }

  const boundedReceiptRate = Math.min(Math.max(receiptSuccessRate, 0), 100)
  const boundedEmailRate = Math.min(Math.max(emailSuccessRate, 0), 100)

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold tracking-tight">
              <Activity className="h-4 w-4 text-emerald-600" />
              System Health
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Payment & email delivery status (24h)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Receipts Delivery</span>
              <Badge className={getRateBadge(receiptSuccessRate)}>
                {receiptSuccessRate >= 95 ? "Healthy" : receiptSuccessRate >= 80 ? "Warning" : "Critical"}
              </Badge>
            </div>
            <div className={cn("text-2xl sm:text-3xl font-bold tracking-tight tabular-nums", getRateColor(receiptSuccessRate))}>
              {receiptSuccessRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getRateBarColor(receiptSuccessRate))}
                style={{ width: `${boundedReceiptRate}%` }}
              />
            </div>
          </div>
          <div className="space-y-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Emails Dispatch</span>
              <Badge className={getRateBadge(emailSuccessRate)}>
                {emailSuccessRate >= 95 ? "Healthy" : emailSuccessRate >= 80 ? "Warning" : "Critical"}
              </Badge>
            </div>
            <div className={cn("text-2xl sm:text-3xl font-bold tracking-tight tabular-nums", getRateColor(emailSuccessRate))}>
              {emailSuccessRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getRateBarColor(emailSuccessRate))}
                style={{ width: `${boundedEmailRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
