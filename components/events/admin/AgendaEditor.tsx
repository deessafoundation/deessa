"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TimePicker } from "@/components/ui/time-picker"
import {
  Plus,
  Trash2,
  User,
  Loader2,
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react"
import {
  createAgendaItem,
  updateAgendaItem,
  deleteAgendaItem,
  reorderAgendaItems,
} from "@/lib/actions/events-module/event-agenda"
import { notifications } from "@/lib/notifications"
import type { EventAgendaItem } from "@/lib/types/events-module"

interface AgendaEditorProps {
  eventId: string
  items: EventAgendaItem[]
}

export function AgendaEditor({ eventId, items: initialItems }: AgendaEditorProps) {
  const [localItems, setLocalItems] = useState<EventAgendaItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  const [addStartTime, setAddStartTime] = useState<Date | null>(null)
  const [addEndTime, setAddEndTime] = useState<Date | null>(null)

  function formatTimeFromDate(date: Date): string {
    const h = date.getHours()
    const m = date.getMinutes()
    const displayH = h % 12 || 12
    const period = h >= 12 ? "PM" : "AM"
    return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`
  }

  // Group items by day — use LOCAL sort_order so reorder reflects immediately
  const groupedByDay = useMemo(() => {
    const grouped = localItems.reduce(
      (acc, item) => {
        const day = item.day_number
        if (!acc[day]) acc[day] = { day_label: item.day_label, items: [] }
        acc[day].items.push(item)
        return acc
      },
      {} as Record<number, { day_label: string | null; items: EventAgendaItem[] }>
    )
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([day, data]) => ({
        day: Number(day),
        day_label: data.day_label,
        // Sort by sort_order so reordering is reflected instantly
        items: [...data.items].sort((a, b) => a.sort_order - b.sort_order),
      }))
  }, [localItems])

  // Helper: persist sort_order for all items in a day
  async function persistDayOrder(dayNumber: number, dayItems: EventAgendaItem[]) {
    const ids = dayItems.map((i) => i.id)
    const result = await reorderAgendaItems(eventId, ids)
    if (result.error) {
      notifications.showError({ description: "Failed to save order" })
    }
  }

  // --- Inline field update ---
  async function handleFieldUpdate(
    id: string,
    field: keyof EventAgendaItem,
    value: string | number | null | boolean
  ) {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
    setIsLoading(id)
    const result = await updateAgendaItem(id, { event_id: eventId, [field]: value })
    if (result.error) {
      notifications.showError({ description: result.error })
      setLocalItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [field]: initialItems.find((i) => i.id === id)?.[field] ?? value }
            : item
        )
      )
    }
    setIsLoading(null)
  }

  // --- Toggle highlight (star) ---
  async function handleToggleHighlight(id: string) {
    const item = localItems.find((i) => i.id === id)
    if (!item) return
    const newValue = !item.highlighted
    setLocalItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, highlighted: newValue } : i))
    )
    const result = await updateAgendaItem(id, { event_id: eventId, highlighted: newValue })
    if (result.error) {
      notifications.showError({ description: result.error })
      setLocalItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, highlighted: !newValue } : i))
      )
    }
  }

  // --- Move item up/down within its day (array swap like conference settings) ---
  async function handleMove(id: string, dir: -1 | 1) {
    const item = localItems.find((i) => i.id === id)
    if (!item) return

    // Get day items sorted by sort_order from LOCAL state
    const dayItems = localItems
      .filter((i) => i.day_number === item.day_number)
      .sort((a, b) => a.sort_order - b.sort_order)

    const idx = dayItems.findIndex((i) => i.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= dayItems.length) return

    // Swap in the array
    const newDayItems = [...dayItems]
    ;[newDayItems[idx], newDayItems[swapIdx]] = [newDayItems[swapIdx], newDayItems[idx]]

    // Assign new sort_orders
    const reordered = newDayItems.map((i, pos) => ({ ...i, sort_order: pos }))

    // Optimistic update — update local state with new sort_orders
    setLocalItems((prev) => {
      const updated = [...prev]
      reordered.forEach((ri) => {
        const idx2 = updated.findIndex((i) => i.id === ri.id)
        if (idx2 !== -1) updated[idx2] = { ...updated[idx2], sort_order: ri.sort_order }
      })
      return updated
    })

    // Persist to server
    setIsLoading(id)
    await persistDayOrder(item.day_number, reordered)
    setIsLoading(null)
  }

  // --- Add new session ---
  async function handleAdd(formData: FormData) {
    setIsLoading("add")
    const result = await createAgendaItem({
      event_id: eventId,
      day_number: Number(formData.get("day_number")) || 1,
      day_label: (formData.get("day_label") as string) || undefined,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      speaker_name: (formData.get("speaker_name") as string) || undefined,
      speaker_title: (formData.get("speaker_title") as string) || undefined,
      start_time: addStartTime ? formatTimeFromDate(addStartTime) : undefined,
      end_time: addEndTime ? formatTimeFromDate(addEndTime) : undefined,
      track_or_room: (formData.get("track_or_room") as string) || undefined,
    })

    if (result.error) {
      notifications.showError({ description: result.error })
    } else if (result.data) {
      notifications.showSuccess({ description: "Session added successfully." })
      setLocalItems((prev) => [...prev, result.data!])
      setShowAddForm(false)
      setAddStartTime(null)
      setAddEndTime(null)
    }
    setIsLoading(null)
  }

  // --- Delete session ---
  async function handleDelete(id: string) {
    const removed = localItems.find((i) => i.id === id)
    setLocalItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteDialogOpen(null)

    const result = await deleteAgendaItem(id, eventId)
    if (result.error) {
      notifications.showError({ description: result.error })
      if (removed) setLocalItems((prev) => [...prev, removed])
    } else {
      notifications.showSuccess({ description: "Session deleted." })
    }
  }

  const totalSessions = localItems.length
  const totalDays = groupedByDay.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {totalSessions} session{totalSessions !== 1 ? "s" : ""} across{" "}
            {totalDays} day{totalDays !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="size-4" />
          Add Session
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              <Plus className="size-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              New Session
            </span>
          </div>
          <form action={handleAdd} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Day Number
                </Label>
                <Input name="day_number" type="number" min="1" defaultValue="1" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Day Label
                </Label>
                <Input name="day_label" placeholder="e.g. Day 1: Opening" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Start Time
                </Label>
                <TimePicker value={addStartTime} onChange={setAddStartTime} placeholder="Pick start time" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Title *
                </Label>
                <Input name="title" required className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  End Time
                </Label>
                <TimePicker value={addEndTime} onChange={setAddEndTime} placeholder="Pick end time" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Description
              </Label>
              <Textarea name="description" rows={2} className="rounded-lg text-sm" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Speaker Name
                </Label>
                <Input name="speaker_name" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Speaker Title
                </Label>
                <Input name="speaker_title" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Room / Track
                </Label>
                <Input name="track_or_room" className="h-9 rounded-lg text-sm" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={isLoading === "add"} className="gap-2">
                {isLoading === "add" && <Loader2 className="size-3.5 animate-spin" />}
                Add Session
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setAddStartTime(null)
                  setAddEndTime(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Agenda by Day */}
      {groupedByDay.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          <CalendarDays className="mb-3 size-10 opacity-30" />
          <p className="font-medium text-foreground/80">No sessions yet</p>
          <p className="mt-1">Add sessions to build your event agenda.</p>
        </div>
      ) : (
        groupedByDay.map(({ day, day_label, items: dayItems }) => (
          <div key={day} className="space-y-0">
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  D{day}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Day {day}
                </span>
              </div>
              {day_label && (
                <span className="text-xs text-muted-foreground">{day_label}</span>
              )}
              <div className="flex-1 border-b border-border" />
              <span className="text-xs text-muted-foreground">
                {dayItems.length} session{dayItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Session cards */}
            <div className="flex flex-col gap-2">
              {dayItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    item.highlighted
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-center gap-2">
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(item.id, -1)}
                        disabled={idx === 0}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30 text-xs"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(item.id, 1)}
                        disabled={idx === dayItems.length - 1}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30 text-xs"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Number circle */}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </div>

                    {/* Time input */}
                    <input
                      type="text"
                      defaultValue={item.start_time || ""}
                      placeholder="09:00 AM"
                      onBlur={(e) => {
                        if (e.target.value !== (item.start_time || "")) {
                          handleFieldUpdate(item.id, "start_time", e.target.value || null)
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                      className="w-28 shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />

                    {(item.start_time || item.end_time) && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}

                    {/* End time input */}
                    <input
                      type="text"
                      defaultValue={item.end_time || ""}
                      placeholder="10:30 AM"
                      onBlur={(e) => {
                        if (e.target.value !== (item.end_time || "")) {
                          handleFieldUpdate(item.id, "end_time", e.target.value || null)
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                      className="w-28 shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />

                    {/* Title input */}
                    <input
                      type="text"
                      defaultValue={item.title}
                      onBlur={(e) => {
                        if (e.target.value !== item.title) {
                          handleFieldUpdate(item.id, "title", e.target.value)
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                      className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />

                    {/* Highlight / Star toggle */}
                    <button
                      onClick={() => handleToggleHighlight(item.id)}
                      title={item.highlighted ? "Remove highlight" : "Highlight session"}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        item.highlighted
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Star className={`size-4 ${item.highlighted ? "fill-primary" : ""}`} />
                    </button>

                    {/* Delete */}
                    <Dialog
                      open={deleteDialogOpen === item.id}
                      onOpenChange={(open) => setDeleteDialogOpen(open ? item.id : null)}
                    >
                      <DialogTrigger asChild>
                        <button
                          title="Delete session"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Session</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{item.title}&quot;? This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Description */}
                  <div className="ml-[3.75rem] mt-2">
                    <input
                      type="text"
                      defaultValue={item.description || ""}
                      placeholder="Short description of this session..."
                      onBlur={(e) => {
                        if (e.target.value !== (item.description || "")) {
                          handleFieldUpdate(item.id, "description", e.target.value || null)
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Meta row */}
                  {(item.speaker_name || item.speaker_title || item.track_or_room) && (
                    <div className="ml-[3.75rem] mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {item.speaker_name && (
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {item.speaker_name}
                        </span>
                      )}
                      {item.speaker_title && (
                        <span className="text-muted-foreground/70">{item.speaker_title}</span>
                      )}
                      {item.track_or_room && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          <MapPin className="size-3" />
                          {item.track_or_room}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Footer */}
      {groupedByDay.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="size-3.5" />
            Add Another Session
          </Button>
          <p className="text-xs text-muted-foreground">
            Click <Star className="mx-0.5 inline size-3" /> to highlight a session.{" "}
            Use arrows to reorder.
          </p>
        </div>
      )}
    </div>
  )
}
