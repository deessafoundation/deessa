"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { getDonationTrend } from "@/lib/actions/admin-dashboard"

interface DonationTrendData {
  date: string
  amount: number
  count: number
}

const chartConfig = {
  amount: {
    label: "Amount (NPR)",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Donations",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function DonationTrendChart() {
  const [range, setRange] = useState("30d")
  const [data, setData] = useState<DonationTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDonationTrend(range)
      .then(setData)
      .finally(() => setLoading(false))
  }, [range])

  const totalAmount = data.reduce((s, d) => s + d.amount, 0)
  const totalDonations = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Donation Trend</CardTitle>
          <CardDescription>
            {totalDonations.toLocaleString()} donations totalling ₹{totalAmount.toLocaleString()}
          </CardDescription>
        </div>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No donation data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) =>
                  val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    }
                    formatter={(value, name) => {
                      if (name === "amount") return [`₹${Number(value).toLocaleString()}`, "Amount"]
                      return [value, "Count"]
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-amount)"
                fill="url(#fillAmount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
