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
    <Card>
      <CardHeader>
        <CardTitle>Fundraising Progress</CardTitle>
        <CardDescription>
          ₹{totalRaised.toLocaleString()} raised of ₹{totalGoal.toLocaleString()} goal
          {totalGoal > 0 && ` (${Math.round((totalRaised / totalGoal) * 100)}%)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
            No published projects with fundraising data
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
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
                  width={75}
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
                <Bar dataKey="goal" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={24} />
                <Bar dataKey="raised" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((d) => (
                <div key={d.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-muted-foreground">{categoryLabels[d.category] || d.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{d.progress}%</span>
                    <span className="text-xs text-muted-foreground">({d.count})</span>
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
