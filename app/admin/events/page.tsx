"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Eye,
  EyeOff,
  ExternalLink,
  Users,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  Table as TableIcon,
  LayoutGrid,
  X,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { EventModuleEvent } from "@/lib/types/events-module"

const statusBadgeStyles: Record<string, string> = {
  published: "bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-300 border-0",
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0",
  disabled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border-0",
  archived: "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-0",
}

const categoryBadgeStyles: Record<string, string> = {
  conference: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-0",
  workshop: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-0",
  seminar: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-0",
  meetup: "bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border-0",
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0",
}

const ITEMS_PER_PAGE = 8

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventModuleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [currentPage, setCurrentPage] = useState(1)

  // Initialize view mode based on screen width on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(max-width: 767px)")
    if (mql.matches) {
      requestAnimationFrame(() => setViewMode("cards"))
    }
    const handler = (e: MediaQueryListEvent) => {
      setViewMode(e.matches ? "cards" : "table")
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/admin/events")
        const data = await res.json()
        setEvents(data.events || [])
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Search text filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesQuery =
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.short_description?.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }

      // Status filter
      if (statusFilter !== "all" && e.status !== statusFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && e.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [events, search, statusFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE))
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage summits, workshops, ticketing, and attendee registrations.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shadow-2xs gap-1.5 font-medium">
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">{events.length}</p>
                  <p className="text-xs text-muted-foreground truncate">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">
                    {events.filter((e) => e.status === "published").length}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">
                    {events.filter((e) => e.status === "draft").length}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">
                    {events.filter((e) => new Date(e.event_date) >= new Date()).length}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter & View Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, venue, or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 text-xs sm:text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="h-10 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger className="h-10 w-[130px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle Pill (Table vs Cards) */}
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
              aria-label="Table View"
            >
              <TableIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-6 space-y-4">
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ) : paginatedEvents.length === 0 ? (
        <Card className="border border-dashed border-border/80 shadow-2xs">
          <CardContent className="p-12 text-center text-muted-foreground">
            {search || statusFilter !== "all" || categoryFilter !== "all" ? (
              <>
                <Search className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p className="text-base font-semibold text-foreground">No events match your criteria</p>
                <p className="text-xs mt-1">Try clearing filters or adjusting your search query.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("all")
                    setCategoryFilter("all")
                    setCurrentPage(1)
                  }}
                  className="mt-4 text-xs"
                >
                  Reset Filters
                </Button>
              </>
            ) : (
              <>
                <Calendar className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p className="text-base font-semibold text-foreground">No events found</p>
                <p className="text-xs mt-1 mb-4">Create your first event to start accepting registrations.</p>
                <Button asChild size="sm" className="text-xs gap-1.5">
                  <Link href="/admin/events/new">
                    <Plus className="h-3.5 w-3.5" />
                    Create First Event
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="p-0 py-0 gap-0 border border-border/80 shadow-2xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-none">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-16 text-center text-xs font-semibold">S.No</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEvents.map((event, index) => (
                    <TableRow
                      key={event.id}
                      onClick={() => router.push(`/admin/events/${event.id}`)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors group"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/admin/events/${event.id}`)
                        }
                      }}
                    >
                      {/* S.No */}
                      <TableCell className="text-center font-medium text-xs text-muted-foreground w-16">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>

                      {/* Title + Thumbnail + Short Abstract */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="size-9 rounded-lg object-cover border border-border/80 shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/60">
                              <Calendar className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[260px] sm:max-w-xs">
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {event.title}
                            </p>
                            {(event.short_description || event.description) && (
                              <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                                {event.short_description || event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium text-foreground">
                            {new Date(event.event_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {event.event_time && (
                            <p className="text-muted-foreground text-[11px] mt-0.5">{event.event_time}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[160px]">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{event.location || "Venue TBD"}</span>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[11px] px-2.5 py-0.5 font-semibold capitalize border-0 shadow-2xs",
                            categoryBadgeStyles[event.category] || categoryBadgeStyles.general
                          )}
                        >
                          {event.category}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[11px] px-2.5 py-0.5 font-semibold capitalize border-0 shadow-2xs",
                            statusBadgeStyles[event.status] || statusBadgeStyles.draft
                          )}
                        >
                          {event.status === "published" && <Eye className="mr-1 h-3 w-3 inline" />}
                          {event.status === "draft" && <EyeOff className="mr-1 h-3 w-3 inline" />}
                          {event.status}
                        </Badge>
                      </TableCell>

                      {/* Actions with Micro-interactions */}
                      <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="size-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                            title="Registrations"
                            aria-label="Registrations"
                          >
                            <Link href={`/admin/events/${event.id}`}>
                              <Users className="size-4 transition-transform duration-200 group-hover/btn:scale-110" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="size-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                            title="Settings"
                            aria-label="Settings"
                          >
                            <Link href={`/admin/events/${event.id}/settings`}>
                              <Settings className="size-4 transition-transform duration-300 group-hover/btn:rotate-45" />
                            </Link>
                          </Button>

                          {event.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="size-8 p-0 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                              title="View Public Page"
                              aria-label="View Public Page"
                            >
                              <Link href={`/events/${event.slug || event.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* CARD / GRID VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedEvents.map((event) => (
            <Card
              key={event.id}
              onClick={() => router.push(`/admin/events/${event.id}`)}
              className="p-0 py-0 gap-0 border border-border/80 shadow-2xs overflow-hidden cursor-pointer hover:border-border hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Poster / Header Image */}
                <div className="relative h-40 w-full bg-muted/60 overflow-hidden border-b border-border/60">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/50">
                      <Calendar className="size-10 mb-1" />
                      <span className="text-xs font-medium">No cover image</span>
                    </div>
                  )}

                  {/* Top Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <Badge
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 font-semibold capitalize border-0 shadow-xs",
                        categoryBadgeStyles[event.category] || categoryBadgeStyles.general
                      )}
                    >
                      {event.category}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 font-semibold capitalize border-0 shadow-xs",
                        statusBadgeStyles[event.status] || statusBadgeStyles.draft
                      )}
                    >
                      {event.status === "published" && <Eye className="mr-1 h-3 w-3 inline" />}
                      {event.status === "draft" && <EyeOff className="mr-1 h-3 w-3 inline" />}
                      {event.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-2.5">
                  <h3 className="font-semibold text-base leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {(event.short_description || event.description) && (
                    <p className="text-xs text-muted-foreground line-clamp-1 truncate leading-relaxed">
                      {event.short_description || event.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {new Date(event.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {event.event_time && ` • ${event.event_time}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{event.location || "Venue TBD"}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Actions - Full Width Quick Actions */}
              <div
                className="p-3 bg-muted/20 border-t border-border/60 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 h-8.5 text-xs font-medium gap-1.5 shadow-2xs hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all duration-150 active:scale-[0.98] group/btn"
                >
                  <Link href={`/admin/events/${event.id}`}>
                    <Users className="size-3.5 transition-transform duration-200 group-hover/btn:scale-110" />
                    <span>Registrations</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 h-8.5 text-xs font-medium gap-1.5 shadow-2xs hover:bg-muted transition-all duration-150 active:scale-[0.98] group/btn"
                >
                  <Link href={`/admin/events/${event.id}/settings`}>
                    <Settings className="size-3.5 transition-transform duration-300 group-hover/btn:rotate-45" />
                    <span>Settings</span>
                  </Link>
                </Button>

                {event.status === "published" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="size-8.5 p-0 shrink-0 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group/btn"
                    title="View Public Page"
                    aria-label="View Public Page"
                  >
                    <Link href={`/events/${event.slug || event.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of{" "}
            {filteredEvents.length} events
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs gap-1 shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>

            <span className="text-xs font-medium px-2 text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
