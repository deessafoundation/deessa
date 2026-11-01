"use client"

import { useState } from "react"
import { DashboardStatCard } from "./dashboard-stat-card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardItem {
  title: string
  value: string | number
  icon: string
  href: string
  color: string
  trend?: {
    current: number
    previous: number
    change: number
  }
}

interface KpiMetricsGridProps {
  statCards: StatCardItem[]
}

export function KpiMetricsGrid({ statCards }: KpiMetricsGridProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-3 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Performance Indicators
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {statCards.length} metrics monitored
        </span>
      </div>

      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-0">
        {statCards.map((stat, idx) => {
          // On mobile, show the top 4 cards by default, expand on toggle.
          // On desktop (sm: and above), all cards are always visible.
          const isHiddenMobile = !expanded && idx >= 4
          return (
            <div
              key={stat.title}
              className={cn("h-full w-full min-w-0", isHiddenMobile && "hidden sm:block")}
            >
              <DashboardStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                href={stat.href}
                color={stat.color}
                trend={stat.trend}
              />
            </div>
          )
        })}
      </div>

      {statCards.length > 4 && (
        <div className="flex sm:hidden justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Show fewer metrics" : `Show all ${statCards.length} metrics`}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground h-9 px-3 rounded-xl border border-border/60 hover:bg-muted/50"
          >
            {expanded ? "Show fewer metrics" : `Show all ${statCards.length} metrics`}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")}
            />
          </Button>
        </div>
      )}
    </div>
  )
}
