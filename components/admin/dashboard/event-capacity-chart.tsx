"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { useState, useEffect } from "react"
import { getEventCapacityData } from "@/lib/actions/admin-dashboard"

interface EventCapacityData {
  title: string
  registered: number
  capacity: number
  fillRate: number
  date: string
}

const chartConfig = {
  fillRate: {
    label: "Fill Rate %",
    color: "#10b981",
  },
} satisfies ChartConfig

function getBarColor(rate: number): string {
  if (rate >= 80) return "#10b981"
  if (rate >= 50) return "#f59e0b"
  return "#6366f1"
}

function getStatusBadge(rate: number) {
  if (rate >= 80) return { label: "Almost Full", variant: "bg-emerald-100 text-emerald-700" as const }
  if (rate >= 50) return { label: "Filling Up", variant: "bg-yellow-100 text-yellow-700" as const }
  return { label: "Open", variant: "bg-indigo-100 text-indigo-700" as const }
}

export function EventCapacityChart() {
  const [data, setData] = useState<EventCapacityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEventCapacityData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Capacity</CardTitle>
        <CardDescription>Registration fill rates for upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No upcoming events with registration
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="title" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${value}%`, "Fill Rate"]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload as EventCapacityData
                        return item ? `${item.title} (${item.registered}/${item.capacity})` : String(label)
                      }}
                    />
                  }
                />
                <Bar dataKey="fillRate" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.fillRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.map((d) => {
                const status = getStatusBadge(d.fillRate)
                return (
                  <div key={d.title} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.registered}/{d.capacity} registered</p>
                    </div>
                    <Badge className={`text-[10px] ${status.variant}`}>{status.label}</Badge>
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
