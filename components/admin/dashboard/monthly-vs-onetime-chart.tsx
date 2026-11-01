"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { getMonthlyVsOneTimeDonations } from "@/lib/actions/admin-dashboard"

interface MonthlyData {
  month: string
  recurring: number
  oneTime: number
  total: number
}

const chartConfig = {
  recurring: {
    label: "Recurring",
    color: "#8b5cf6",
  },
  oneTime: {
    label: "One-Time",
    color: "#06b6d4",
  },
} satisfies ChartConfig

export function MonthlyVsOneTimeChart() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMonthlyVsOneTimeDonations()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const totalRecurring = data.reduce((s, d) => s + d.recurring, 0)
  const totalOneTime = data.reduce((s, d) => s + d.oneTime, 0)

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Donation Types</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Recurring vs one-time donations — <span className="tabular-nums font-semibold text-foreground">₹{(totalRecurring + totalOneTime).toLocaleString()}</span> total
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        {loading ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No donation data for the last 6 months
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.recurring.color }} />
                <span className="text-xs sm:text-sm">
                  <span className="font-semibold tabular-nums">₹{totalRecurring.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Recurring</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.oneTime.color }} />
                <span className="text-xs sm:text-sm">
                  <span className="font-semibold tabular-nums">₹{totalOneTime.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">One-Time</span>
                </span>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] sm:h-[250px] w-full min-w-0 max-w-full">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRecurring" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-recurring)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-recurring)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillOneTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-oneTime)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-oneTime)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={45}
                  tickFormatter={(val) =>
                    val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, String(name) === "recurring" ? "Recurring" : "One-Time"]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="recurring"
                  stroke="var(--color-recurring)"
                  fill="url(#fillRecurring)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="oneTime"
                  stroke="var(--color-oneTime)"
                  fill="url(#fillOneTime)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
