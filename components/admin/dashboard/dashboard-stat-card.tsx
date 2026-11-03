"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FolderKanban,
  Calendar,
  FileText,
  Users,
  HandHeart,
  Heart,
  MessageSquare,
  Building,
  BarChart3,
  Newspaper,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  FolderKanban,
  Calendar,
  FileText,
  Users,
  HandHeart,
  Heart,
  MessageSquare,
  Building,
  BarChart3,
  Newspaper,
  UserCog,
  Settings,
}

interface DashboardStatCardProps {
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

export function DashboardStatCard({ title, value, icon, href, color, trend }: DashboardStatCardProps) {
  const Icon = (icon && iconMap[icon]) || BarChart3
  const trendDirection = trend ? (trend.change > 0 ? "up" : trend.change < 0 ? "down" : "neutral") : null

  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
    >
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full group hover:border-primary/40 hover:-translate-y-0.5 py-3 sm:py-5 gap-2 sm:gap-4">
        <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6 pb-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
            {title}
          </CardTitle>
          <div className="p-1 sm:p-1.5 rounded-lg bg-muted/60 transition-transform group-hover:scale-110 shrink-0">
            <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", color)} />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <div className="text-lg sm:text-2xl font-bold tracking-tight tabular-nums truncate">{value}</div>
            {trendDirection && (
              <div
                className={cn(
                  "flex items-center gap-1 text-[10px] sm:text-xs font-medium rounded-full px-1.5 py-0.5 shrink-0 w-fit",
                  trendDirection === "up" && "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
                  trendDirection === "down" && "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950",
                  trendDirection === "neutral" && "text-muted-foreground bg-muted"
                )}
              >
                {trendDirection === "up" && <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                {trendDirection === "down" && <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                {trendDirection === "neutral" && <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                <span className="tabular-nums">{Math.abs(trend!.change)}%</span>
              </div>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 tabular-nums truncate min-h-[1rem]">
            {trend && trend.previous > 0 ? `vs ${trend.previous.toLocaleString()} prev` : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
