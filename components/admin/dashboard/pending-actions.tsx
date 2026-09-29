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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pending Actions
          {actions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {actions.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Items requiring your attention</CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm text-muted-foreground">All caught up! No pending actions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => {
              const config = typeConfig[action.type]
              const Icon = config.icon
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{action.title}</p>
                      <Badge className={cn("text-[10px] px-1.5 py-0", priorityBadge[action.priority])}>
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{action.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(action.created_at)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
