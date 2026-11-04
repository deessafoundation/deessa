"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils/date"
import { useState } from "react"

interface ActivityItem {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  user?: { full_name?: string; email?: string }
  created_at: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const actionConfig = {
  CREATE: { icon: Plus, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", label: "Created" },
  UPDATE: { icon: Pencil, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950", label: "Updated" },
  DELETE: { icon: Trash2, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950", label: "Deleted" },
}

const entityColors: Record<string, string> = {
  project: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  projects: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  event: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  events: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  story: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  stories: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  team_member: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  partner: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  impact_stat: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  donation: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  volunteer_application: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  contact_submission: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  homepage_settings: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
}

function getEntityHref(entityType: string, entityId?: string): string | null {
  if (entityType === "homepage_settings") return "/admin/homepage"
  const base = entityType.replace(/_/g, "-").replace(/s$/, "")
  if (entityId) return `/admin/${base === "team-member" ? "team" : base === "volunteer-application" ? "volunteers" : base === "contact-submission" ? "contacts" : entityType.replace(/_/g, "s").replace(/ie$/, "y")}/${entityId}`
  const listMap: Record<string, string> = {
    project: "/admin/projects",
    projects: "/admin/projects",
    event: "/admin/events",
    events: "/admin/events",
    story: "/admin/stories",
    stories: "/admin/stories",
    team_member: "/admin/team",
    partner: "/admin/partners",
    impact_stat: "/admin/stats",
    donation: "/admin/donations",
    volunteer_application: "/admin/volunteers",
    contact_submission: "/admin/contacts",
    homepage_settings: "/admin/homepage",
  }
  return listMap[entityType] || null
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false)
  const displayActivities = expanded ? activities : activities.slice(0, 6)

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 min-w-0">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">Recent Activity</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">Latest actions by admin users</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 min-w-0 w-full overflow-hidden">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <>
            <div className="space-y-3">
              {displayActivities.map((activity) => {
                const actionKey = (activity.action || "").toUpperCase()
                const action = actionConfig[actionKey as keyof typeof actionConfig] || actionConfig.UPDATE
                const Icon = action.icon
                const entityHref = getEntityHref(activity.entity_type, activity.entity_id)

                return (
                  <div key={activity.id} className="flex items-start gap-3 group">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                        action.bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", action.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        <span className="font-medium text-foreground">{activity.user?.full_name || "System"}</span>{" "}
                        <span className="text-muted-foreground">{action.label.toLowerCase()}{" "}</span>
                        {entityHref ? (
                          <Link href={entityHref} className="inline-block font-medium text-primary hover:underline">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] px-1.5 mx-0.5 whitespace-nowrap",
                                entityColors[activity.entity_type] || "bg-gray-100 text-gray-700"
                              )}
                            >
                              {activity.entity_type.replace(/_/g, " ")}
                            </Badge>
                          </Link>
                        ) : (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 mx-0.5 whitespace-nowrap",
                              entityColors[activity.entity_type] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {activity.entity_type.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {activities.length > 6 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-label={expanded ? "Show less activity" : `Show ${activities.length - 6} more activities`}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mt-4 mx-auto py-2 px-3 rounded-lg hover:bg-muted transition-colors min-h-[44px]"
              >
                {expanded ? "Show less" : `Show ${activities.length - 6} more`}
                <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
