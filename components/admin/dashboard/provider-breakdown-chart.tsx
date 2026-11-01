"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { useState, useEffect } from "react"
import { getDonationProviderBreakdown } from "@/lib/actions/admin-dashboard"

interface ProviderData {
  provider: string
  count: number
  amount: number
  fill: string
}

export function ProviderBreakdownChart() {
  const [data, setData] = useState<ProviderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDonationProviderBreakdown()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const totalAmount = data.reduce((s, d) => s + d.amount, 0)
  const totalDonations = data.reduce((s, d) => s + d.count, 0)

  const chartConfig = data.reduce((acc, d) => {
    acc[d.provider] = {
      label: d.provider.toUpperCase(),
      color: d.fill,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>) satisfies ChartConfig

  return (
    <Card className="w-full h-full min-w-0 overflow-hidden flex flex-col">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Payment Providers</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          <span className="tabular-nums font-semibold text-foreground">{totalDonations.toLocaleString()}</span> donations totalling{" "}
          <span className="tabular-nums font-semibold text-foreground">₹{totalAmount.toLocaleString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden flex-1 flex flex-col justify-between">
        {loading ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No completed donations yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] sm:h-[250px] w-full min-w-0 max-w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const item = data.find((d) => d.provider === name)
                        return [
                          `₹${Number(value).toLocaleString()} (${item?.count || 0})`,
                          String(name).toUpperCase(),
                        ]
                      }}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="provider"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-3 gap-y-1 text-xs justify-center pt-2" />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-3 sm:mt-4 space-y-1.5 w-full min-w-0">
              {data.map((d) => (
                <div
                  key={d.provider}
                  className="flex items-center justify-between gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg hover:bg-muted/40 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                    <span className="font-medium text-foreground truncate">{d.provider.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground shrink-0 text-right">
                    <span className="tabular-nums text-xs text-muted-foreground hidden xs:inline">{d.count} txns</span>
                    <span className="font-semibold text-foreground tabular-nums">₹{d.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
