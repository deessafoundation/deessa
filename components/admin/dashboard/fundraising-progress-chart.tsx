"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { useState, useEffect } from "react"
import { getFundraisingProgress } from "@/lib/actions/admin-dashboard"

interface FundraisingData {
  category: string
  raised: number
  goal: number
  count: number
  progress: number
  fill: string
}

const categoryLabels: Record<string, string> = {
  education: "Education",
  health: "Health",
  empowerment: "Empowerment",
  relief: "Relief",
  other: "Other",
}

export function FundraisingProgressChart() {
  const [data, setData] = useState<FundraisingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFundraisingProgress()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const totalRaised = data.reduce((s, d) => s + d.raised, 0)
  const totalGoal = data.reduce((s, d) => s + d.goal, 0)

  const chartConfig = data.reduce((acc, d) => {
    acc[d.category] = {
      label: categoryLabels[d.category] || d.category,
      color: d.fill,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card className="w-full h-full min-w-0 overflow-hidden flex flex-col">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Fundraising Progress</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          <span className="tabular-nums font-semibold text-foreground">₹{totalRaised.toLocaleString()}</span> raised of{" "}
          <span className="tabular-nums font-semibold text-foreground">₹{totalGoal.toLocaleString()}</span> goal
          {totalGoal > 0 && ` (${Math.round((totalRaised / totalGoal) * 100)}%)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No published projects with fundraising data
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] sm:h-[250px] w-full min-w-0 max-w-full">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}k`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => categoryLabels[val] || val}
                  width={68}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === "raised") return [`₹${Number(value).toLocaleString()}`, "Raised"]
                        if (name === "goal") return [`₹${Number(value).toLocaleString()}`, "Goal"]
                        return [value, String(name)]
                      }}
                    />
                  }
                />
                <Bar dataKey="goal" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false} />
                <Bar dataKey="raised" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
              {data.map((d) => (
                <div key={d.category} className="flex items-center justify-between text-xs sm:text-sm p-1.5 rounded-lg hover:bg-muted/30 transition-colors min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                    <span className="text-muted-foreground truncate">{categoryLabels[d.category] || d.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="font-semibold tabular-nums text-foreground">{d.progress}%</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">({d.count})</span>
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
