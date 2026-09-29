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
  const Icon = iconMap[icon]
  const trendDirection = trend ? (trend.change > 0 ? "up" : trend.change < 0 ? "down" : "neutral") : null

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full group hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", color)} />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold">{value}</div>
            {trendDirection && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
                  trendDirection === "up" && "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
                  trendDirection === "down" && "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950",
                  trendDirection === "neutral" && "text-muted-foreground bg-muted"
                )}
              >
                {trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
                {trendDirection === "down" && <TrendingDown className="h-3 w-3" />}
                {trendDirection === "neutral" && <Minus className="h-3 w-3" />}
                {Math.abs(trend!.change)}%
              </div>
            )}
          </div>
          {trend && trend.previous > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              vs {trend.previous} in prev. period
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
