"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { getContentActivity } from "@/lib/actions/admin-dashboard"
import { cn } from "@/lib/utils"

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

interface ContentActivityChartProps {
  initialRange?: string
}

export function ContentActivityChart({ initialRange = "30d" }: ContentActivityChartProps = {}) {
  const [range, setRange] = useState(initialRange)
  const [data, setData] = useState<ContentActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (initialRange && initialRange !== range) {
      setRange(initialRange)
    }
  }, [initialRange])

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
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 items-start p-4 sm:p-6 pb-2 sm:pb-4 min-w-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Content Activity</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            <span className="tabular-nums font-semibold text-foreground">{totalProjects}</span> projects,{" "}
            <span className="tabular-nums font-semibold text-foreground">{totalEvents}</span> events,{" "}
            <span className="tabular-nums font-semibold text-foreground">{totalStories}</span> stories created
          </CardDescription>
        </div>
        <div className="flex gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50 shrink-0 self-start sm:self-auto">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              aria-label={`${r.toUpperCase()} timeframe`}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg transition-all min-h-[30px] min-w-[36px] flex items-center justify-center border border-transparent",
                range === r
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm scale-[1.01] border-primary/30 font-semibold"
                  : "text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/80"
              )}
            >
              {r === "7d" ? "7D" : r === "30d" ? "30D" : "90D"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        {loading ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading chart...
          </div>
        ) : totalProjects + totalEvents + totalStories === 0 ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No content created in this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] sm:h-[280px] w-full min-w-0 max-w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={35} allowDecimals={false} />
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
              <Bar dataKey="projects" fill="var(--color-projects)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="events" fill="var(--color-events)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="stories" fill="var(--color-stories)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
