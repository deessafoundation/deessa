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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Volunteer Insights</CardTitle>
          <CardDescription>
            Skills and interests breakdown
            {data && ` — ${data.statusBreakdown.find((s) => s.label === "pending")?.value || 0} pending`}
          </CardDescription>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8">
            <TabsTrigger value="skills" className="text-xs px-2">Skills</TabsTrigger>
            <TabsTrigger value="interests" className="text-xs px-2">Interests</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : !currentData || currentData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No volunteer data yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={currentData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
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
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={20} />
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
