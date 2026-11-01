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
    label: "Amount (₹)",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Donations",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface DonationTrendChartProps {
  initialRange?: string
}

export function DonationTrendChart({ initialRange = "30d" }: DonationTrendChartProps = {}) {
  const [range, setRange] = useState(initialRange)
  const [data, setData] = useState<DonationTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (initialRange && initialRange !== range) {
      setRange(initialRange)
    }
  }, [initialRange])

  useEffect(() => {
    setLoading(true)
    getDonationTrend(range)
      .then(setData)
      .finally(() => setLoading(false))
  }, [range])

  const totalAmount = data.reduce((s, d) => s + d.amount, 0)
  const totalDonations = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="w-full h-full min-w-0 overflow-hidden flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 pb-2 sm:pb-4 min-w-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Donation Trend</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            <span className="tabular-nums font-semibold text-foreground">{totalDonations.toLocaleString()}</span> donations totalling{" "}
            <span className="tabular-nums font-semibold text-foreground">₹{totalAmount.toLocaleString()}</span>
          </CardDescription>
        </div>
        <Tabs value={range} onValueChange={setRange} className="shrink-0 self-start sm:self-auto">
          <TabsList className="h-8 bg-muted/60 p-0.5 rounded-xl border border-border/50" aria-label="Donation trend timeframe">
            <TabsTrigger value="7d" aria-label="7 days trend" className="text-xs px-2.5 h-7 rounded-lg hover:text-primary">7D</TabsTrigger>
            <TabsTrigger value="30d" aria-label="30 days trend" className="text-xs px-2.5 h-7 rounded-lg hover:text-primary">30D</TabsTrigger>
            <TabsTrigger value="90d" aria-label="90 days trend" className="text-xs px-2.5 h-7 rounded-lg hover:text-primary">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No donation data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] sm:h-[280px] w-full min-w-0 max-w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                tickMargin={6}
                minTickGap={16}
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                width={40}
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
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
