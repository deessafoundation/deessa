"use client"

import Link from "next/link"
import {
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  Settings,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Archive,
  CreditCard,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EventStatus } from "@/lib/types/events-module"

interface EventHubHeaderProps {
  event: {
    id: string
    title: string
    slug: string
    category: string
    status: EventStatus | string
    event_date: string
    event_time?: string | null
    location: string
    venue_name?: string | null
    is_free?: boolean
  }
  activeSection: "registrations" | "settings"
  registrationCount?: number
  className?: string
}

const statusBadgeStyles: Record<string, { label: string; className: string; icon: typeof Eye }> = {
  published: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: Eye,
  },
  draft: {
    label: "Draft",
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    icon: EyeOff,
  },
  disabled: {
    label: "Disabled",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: Pause,
  },
  archived: {
    label: "Archived",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: Archive,
  },
}

export function EventHubHeader({
  event,
  activeSection,
  registrationCount,
  className,
}: EventHubHeaderProps) {
  const statusConfig = statusBadgeStyles[event.status] || {
    label: event.status,
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    icon: EyeOff,
  }
  const StatusIcon = statusConfig.icon

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link
          href="/admin/events"
          className="hover:text-foreground transition-colors font-medium"
        >
          Events
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="truncate max-w-[200px] sm:max-w-xs text-foreground font-medium" title={event.title}>
          {event.title}
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="text-muted-foreground font-normal">
          {activeSection === "registrations" ? "Registrations & Attendees" : "Configuration & Settings"}
        </span>
      </nav>

      {/* Main Header Title & Controls Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-4">
        {/* Title + Badges + Public Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {event.title}
              </h1>
              <Badge
                variant="outline"
                className={cn("text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5", statusConfig.className)}
              >
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
              {event.category && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium capitalize bg-primary/10 text-primary border-primary/20"
                >
                  {event.category}
                </Badge>
              )}
            </div>

            {/* Event Meta Information Chips */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 sm:gap-x-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span>
                  {formattedDate}
                  {event.event_time && ` • ${event.event_time}`}
                </span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                <MapPin className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span className="truncate" title={event.venue_name || event.location}>
                  {event.venue_name ? `${event.venue_name}, ${event.location}` : event.location}
                </span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span>{event.is_free ? "Free Event" : "Paid Tickets"}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button to Public Event Page */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            {event.status === "published" ? (
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs sm:text-sm">
                <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                  View Public Page
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                  <Sparkles className="size-3.5 text-muted-foreground" />
                  Preview Event
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Primary Navigation Switcher (Segmented Control) */}
        <div className="pt-2 border-t border-border/60">
          <div className="inline-flex w-full sm:w-auto items-center rounded-xl border border-border bg-muted/40 p-1">
            <Link
              href={`/admin/events/${event.id}`}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
                activeSection === "registrations"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Users className="size-4 shrink-0" />
              <span>Registrations & Attendees</span>
              {typeof registrationCount === "number" && (
                <Badge
                  variant={activeSection === "registrations" ? "default" : "secondary"}
                  className="ml-1 text-[11px] px-1.5 py-0 h-4 font-semibold"
                >
                  {registrationCount}
                </Badge>
              )}
            </Link>

            <Link
              href={`/admin/events/${event.id}/settings`}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
                activeSection === "settings"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Settings className="size-4 shrink-0" />
              <span>Event Configuration</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
