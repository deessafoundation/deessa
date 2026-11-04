"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { getVolunteerSkills } from "@/lib/actions/admin-dashboard"

interface SkillData {
  topSkills: Array<{ label: string; value: number }>
  topInterests: Array<{ label: string; value: number }>
  availability: Array<{ label: string; value: number }>
  statusBreakdown: Array<{ label: string; value: number }>
}

const chartConfig = {
  value: {
    label: "Count",
    color: "#6366f1",
  },
} satisfies ChartConfig

export function VolunteerSkillsChart() {
  const [data, setData] = useState<SkillData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("skills")

  useEffect(() => {
    getVolunteerSkills()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const currentData = tab === "skills" ? data?.topSkills : data?.topInterests

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 items-start p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Volunteer Insights</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Skills and interests breakdown
            {data && (
              <>
                {" — "}
                <span className="tabular-nums font-semibold text-foreground">
                  {data.statusBreakdown.find((s) => s.label === "pending")?.value || 0}
                </span>{" "}
                pending
              </>
            )}
          </CardDescription>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="shrink-0 self-start sm:self-auto">
          <TabsList className="h-8 bg-muted/60 p-0.5 rounded-xl border border-border/50" aria-label="Volunteer insights category">
            <TabsTrigger value="skills" className="text-xs px-2.5 h-7 rounded-lg">Skills</TabsTrigger>
            <TabsTrigger value="interests" className="text-xs px-2.5 h-7 rounded-lg">Interests</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        {loading ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            Loading...
          </div>
        ) : !currentData || currentData.length === 0 ? (
          <div className="h-[240px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
            No volunteer data yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[240px] sm:h-[280px] w-full min-w-0 max-w-full">
              <BarChart
                data={currentData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={95}
                  tickFormatter={(val) => val.length > 14 ? val.slice(0, 14) + "..." : val}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            {data.availability.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {data.availability.map((a) => (
                    <div key={a.label} className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">{a.label}:</span>
                      <span className="font-medium">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
