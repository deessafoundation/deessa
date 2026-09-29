"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SystemHealthCardProps {
  receiptSuccessRate: number
  emailSuccessRate: number
}

export function SystemHealthCard({ receiptSuccessRate, emailSuccessRate }: SystemHealthCardProps) {
  const getRateColor = (rate: number) => {
    if (rate >= 95) return "text-emerald-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getRateBadge = (rate: number) => {
    if (rate >= 95) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
    if (rate >= 80) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Payment & email delivery status (24h)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receipts</span>
              <Badge className={getRateBadge(receiptSuccessRate)}>
                {receiptSuccessRate >= 95 ? "Healthy" : receiptSuccessRate >= 80 ? "Warning" : "Critical"}
              </Badge>
            </div>
            <div className={`text-3xl font-bold ${getRateColor(receiptSuccessRate)}`}>
              {receiptSuccessRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-current rounded-full transition-all"
                style={{ width: `${receiptSuccessRate}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Emails</span>
              <Badge className={getRateBadge(emailSuccessRate)}>
                {emailSuccessRate >= 95 ? "Healthy" : emailSuccessRate >= 80 ? "Warning" : "Critical"}
              </Badge>
            </div>
            <div className={`text-3xl font-bold ${getRateColor(emailSuccessRate)}`}>
              {emailSuccessRate.toFixed(1)}%
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-current rounded-full transition-all"
                style={{ width: `${emailSuccessRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
