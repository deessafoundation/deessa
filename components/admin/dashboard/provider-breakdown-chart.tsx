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
    <Card>
      <CardHeader>
        <CardTitle>Payment Providers</CardTitle>
        <CardDescription>
          {totalDonations} donations totalling ₹{totalAmount.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            No completed donations yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {data.map((d) => (
                <div key={d.provider} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="font-medium">{d.provider.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{d.count} donations</span>
                    <span className="font-medium text-foreground">₹{d.amount.toLocaleString()}</span>
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
