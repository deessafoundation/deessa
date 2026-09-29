"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { getContentActivity } from "@/lib/actions/admin-dashboard"

interface ContentActivityData {
  date: string
  projects: number
  events: number
  stories: number
}

const chartConfig = {
  projects: {
    label: "Projects",
    color: "#3b82f6",
  },
  events: {
    label: "Events",
    color: "#22c55e",
  },
  stories: {
    label: "Stories",
    color: "#a855f7",
  },
} satisfies ChartConfig

export function ContentActivityChart() {
  const [range, setRange] = useState("30d")
  const [data, setData] = useState<ContentActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getContentActivity(range)
      .then(setData)
      .finally(() => setLoading(false))
  }, [range])

  const totalProjects = data.reduce((s, d) => s + d.projects, 0)
  const totalEvents = data.reduce((s, d) => s + d.events, 0)
  const totalStories = data.reduce((s, d) => s + d.stories, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Content Activity</CardTitle>
          <CardDescription>
            {totalProjects} projects, {totalEvents} events, {totalStories} stories created
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {r === "7d" ? "7D" : r === "30d" ? "30D" : "90D"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Loading chart...
          </div>
        ) : totalProjects + totalEvents + totalStories === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No content created in this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
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
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="projects" fill="var(--color-projects)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="events" fill="var(--color-events)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="stories" fill="var(--color-stories)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
