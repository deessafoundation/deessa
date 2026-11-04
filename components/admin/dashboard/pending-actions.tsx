"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, HandHeart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils/date"

interface PendingAction {
  id: string
  type: "volunteer" | "contact" | "donation"
  title: string
  subtitle: string
  href: string
  priority: "high" | "medium" | "low"
  created_at: string
}

interface PendingActionsProps {
  actions: PendingAction[]
}

const typeConfig = {
  volunteer: { icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
  contact: { icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
  donation: { icon: HandHeart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
}

const priorityBadge = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

export function PendingActions({ actions }: PendingActionsProps) {
  return (
    <Card className="w-full h-full min-w-0 overflow-hidden flex flex-col">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
            Pending Actions
            {actions.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full font-semibold">
                {actions.length}
              </Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">Items requiring your attention</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden flex flex-col flex-1">
        {actions.length === 0 ? (
          <div className="py-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm text-muted-foreground">All caught up! No pending actions.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-2 min-w-0 w-full max-h-[280px] sm:max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {actions.map((action) => {
                const config = typeConfig[action.type]
                const Icon = config.icon
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-border/70 p-2.5 sm:p-3 hover:bg-muted/40 hover:border-primary/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-w-0 w-full"
                  >
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className={cn("flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg shrink-0 mt-0.5 sm:mt-0", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate max-w-[200px] xs:max-w-none">{action.title}</p>
                          <Badge className={cn("text-[10px] px-1.5 py-0 shrink-0 font-medium", priorityBadge[action.priority])}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-full">{action.subtitle}</p>
                        <div className="flex sm:hidden items-center pt-0.5 text-[10px] text-muted-foreground">
                          <span>{formatRelativeTime(action.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(action.created_at)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex sm:hidden shrink-0 self-center">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
            {actions.length > 4 && (
              <p className="text-[11px] text-center text-muted-foreground pt-2 border-t border-border/40 mt-2 shrink-0">
                Showing {actions.length} pending items · Scroll for more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
