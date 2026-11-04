"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { useState, useEffect } from "react"
import { getDonationByCategory } from "@/lib/actions/admin-dashboard"

interface CategoryData {
  category: string
  amount: number
  count: number
  fill: string
}

const categoryLabels: Record<string, string> = {
  education: "Education",
  health: "Health",
  empowerment: "Empowerment",
  relief: "Relief",
  other: "Other",
}

export function DonationByCategoryChart() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDonationByCategory()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const totalAmount = data.reduce((s, d) => s + d.amount, 0)

  const chartConfig = data.reduce((acc, d) => {
    acc[d.category] = {
      label: categoryLabels[d.category] || d.category,
      color: d.fill,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Donations by Category</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          <span className="tabular-nums font-semibold text-foreground">₹{totalAmount.toLocaleString()}</span> distributed across project categories
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        {loading ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No donations linked to projects yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] sm:h-[260px] w-full min-w-0 max-w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const item = data.find((d) => d.category === name)
                        const pct = totalAmount > 0 ? Math.round((Number(value) / totalAmount) * 100) : 0
                        return [
                          `₹${Number(value).toLocaleString()} (${pct}%) — ${item?.count || 0} donations`,
                          categoryLabels[String(name)] || String(name),
                        ]
                      }}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
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
              {data.map((d) => {
                const pct = totalAmount > 0 ? Math.round((d.amount / totalAmount) * 100) : 0
                return (
                  <div key={d.category} className="flex items-center justify-between gap-2 text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg hover:bg-muted/40 transition-colors min-w-0">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="font-medium text-foreground truncate">{categoryLabels[d.category] || d.category}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground shrink-0 text-right">
                      <span className="tabular-nums text-xs text-muted-foreground hidden xs:inline">{d.count} txns</span>
                      <span className="font-semibold text-foreground tabular-nums">₹{d.amount.toLocaleString()}</span>
                      <span className="text-xs w-8 text-right tabular-nums">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
