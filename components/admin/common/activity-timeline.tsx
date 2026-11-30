"use client"

import { useState, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Cog,
  User,
  Zap,
  ArrowRight,
  FileText,
  Receipt,
  Mail,
  ChevronDown,
  ChevronUp,
  History,
  Copy,
  Check,
} from "lucide-react"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/lib/utils/activity-timeline"

interface ActivityTimelineProps {
  events: TimelineEvent[]
}

export const ActivityTimeline = memo(function ActivityTimeline({ events }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<"all" | "system" | "admin" | "webhooks">("all")
  const [displayCount, setDisplayCount] = useState(50)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedId(id)
      notifications.showSuccess("Event payload copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Cog className="size-3.5 text-primary" />
      case "admin":
      case "status_change":
      case "note_added":
        return <User className="size-3.5 text-amber-600 dark:text-amber-400" />
      case "webhook":
        return <Zap className="size-3.5 text-purple-600 dark:text-purple-400" />
      case "receipt":
        return <Receipt className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      case "email":
        return <Mail className="size-3.5 text-sky-600 dark:text-sky-400" />
      default:
        return <FileText className="size-3.5 text-muted-foreground" />
    }
  }

  const getEventNodeClass = (type: string) => {
    switch (type) {
      case "system":
        return "bg-primary/10 border-primary/30 text-primary"
      case "admin":
      case "status_change":
      case "note_added":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
      case "webhook":
        return "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
      case "receipt":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      case "email":
        return "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  const filterEvents = (eventsList: TimelineEvent[]) => {
    if (filter === "all") return eventsList

    if (filter === "system") {
      return eventsList.filter((e) => e.type === "system" || e.type === "receipt" || e.type === "email")
    }

    if (filter === "admin") {
      return eventsList.filter(
        (e) => e.type === "admin" || e.type === "status_change" || e.type === "note_added"
      )
    }

    if (filter === "webhooks") {
      return eventsList.filter((e) => e.type === "webhook")
    }

    return eventsList
  }

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  // Render metadata in a structured, clean layout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMetadata = (metadata: any, eventType: string, eventId: string) => {
    if (!metadata || Object.keys(metadata).length === 0) return null

    // Status change metadata
    if (eventType === "status_change" && metadata.reason) {
      return (
        <div className="space-y-2 mt-2 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Transition:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <Badge variant="outline" className="text-[10px] capitalize bg-background">
                {metadata.oldStatus}
              </Badge>
              <ArrowRight className="size-3 text-muted-foreground" />
              <Badge variant="outline" className="text-[10px] capitalize bg-background font-semibold text-primary">
                {metadata.newStatus}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Stated Reason:</span>
            <p className="text-xs bg-card p-2 rounded-lg border border-border/70 text-foreground italic">
              &ldquo;{metadata.reason}&rdquo;
            </p>
          </div>
        </div>
      )
    }

    // Note added metadata
    if (eventType === "note_added" && metadata.noteText) {
      return (
        <div className="mt-2 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Note Content:</span>
          <p className="text-xs bg-card p-2 rounded-lg border border-border/70 text-foreground whitespace-pre-wrap">
            {metadata.noteText}
          </p>
        </div>
      )
    }

    // Webhook metadata
    if (eventType === "webhook") {
      const jsonString = JSON.stringify(metadata, null, 2)
      return (
        <div className="space-y-2 mt-2 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {metadata.event_type && (
              <Badge variant="secondary" className="text-[10px] font-mono">
                {metadata.event_type}
              </Badge>
            )}
            {metadata.provider && (
              <span className="text-xs capitalize font-medium text-muted-foreground">
                Gateway: {metadata.provider}
              </span>
            )}
            {metadata.status && (
              <Badge variant="outline" className="text-[10px] capitalize">
                {metadata.status}
              </Badge>
            )}
          </div>

          <div className="relative mt-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-mono text-muted-foreground">RAW PAYLOAD</span>
              <button
                type="button"
                onClick={(e) => handleCopy(jsonString, eventId, e)}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
              >
                {copiedId === eventId ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-card p-3 rounded-lg border border-border/70 overflow-x-auto max-h-48 text-foreground">
              {jsonString}
            </pre>
          </div>
        </div>
      )
    }

    // Generic metadata display
    return (
      <div className="space-y-1.5 mt-2 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-[11px] font-medium text-muted-foreground capitalize min-w-[90px]">
              {key.replace(/_/g, " ")}:
            </span>
            <span className="text-xs font-mono flex-1 text-foreground break-all">
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const filteredEvents = filterEvents(events)
  const displayedEvents = filteredEvents.slice(0, displayCount)
  const hasMore = filteredEvents.length > displayCount

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">
            Activity & Audit Log ({filteredEvents.length})
          </CardTitle>
        </div>

        {/* Filter buttons pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/70 overflow-x-auto">
          {(["all", "system", "admin", "webhooks"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer",
                filter === mode
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {displayedEvents.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-10 italic border border-dashed rounded-xl p-4">
            No chronological events recorded under this filter.
          </div>
        ) : (
          <div className="space-y-4 relative">
            {displayedEvents.map((event, index) => {
              const isExpanded = expandedEvents.has(event.id)
              const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0
              const isLast = index === displayedEvents.length - 1

              return (
                <div key={event.id} className="flex gap-3.5 relative group">
                  {/* Timeline Line & Node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "size-7 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110",
                        getEventNodeClass(event.type)
                      )}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    {!isLast && <div className="w-0.5 grow bg-border/80 my-1.5" />}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 pb-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {event.actor}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono uppercase px-1.5 py-0">
                          {event.type}
                        </Badge>
                      </div>

                      <span
                        className="text-[11px] text-muted-foreground shrink-0 cursor-help"
                        title={formatAbsoluteTime(event.timestamp) || undefined}
                      >
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                      {event.description}
                    </p>

                    {/* Metadata Toggle */}
                    {hasMetadata && (
                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(event.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="size-3" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="size-3" />
                              <span>View Payload / Details</span>
                            </>
                          )}
                        </button>

                        {isExpanded && renderMetadata(event.metadata, event.type, event.id)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisplayCount((prev) => prev + 50)}
                className="w-full text-xs h-8 mt-2 cursor-pointer shadow-2xs"
              >
                Load More Events ({filteredEvents.length - displayCount} remaining)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
