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
    <Card>
      <CardHeader>
        <CardTitle>Donations by Category</CardTitle>
        <CardDescription>
          ₹{totalAmount.toLocaleString()} distributed across project categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No donations linked to projects yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
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
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={3}
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
              {data.map((d) => {
                const pct = totalAmount > 0 ? Math.round((d.amount / totalAmount) * 100) : 0
                return (
                  <div key={d.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="font-medium">{categoryLabels[d.category] || d.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{d.count} donations</span>
                      <span className="font-medium text-foreground">₹{d.amount.toLocaleString()}</span>
                      <span className="text-xs w-10 text-right">{pct}%</span>
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
