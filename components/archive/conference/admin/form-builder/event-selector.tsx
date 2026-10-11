"use client"

import { useState } from "react"
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { FancySelect } from "@/components/ui/fancy-select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Event } from "@/lib/actions/events"
import { getEventStatus } from "@/lib/utils/event-helpers"

interface EventSelectorProps {
  events: Event[]
  selectedEventId: string | null
  onEventChange: (eventId: string) => void
  activeSchemaVersion?: number
  lastUpdated?: string
  registrationCount?: number
  hasUnsavedChanges?: boolean
}

export function EventSelector({
  events,
  selectedEventId,
  onEventChange,
  activeSchemaVersion,
  lastUpdated,
  registrationCount,
  hasUnsavedChanges = false,
}: EventSelectorProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const handleEventChange = (newEventId: string) => {
    if (hasUnsavedChanges) {
      setPendingEventId(newEventId)
      setShowWarning(true)
    } else {
      onEventChange(newEventId)
    }
  }

  const confirmEventChange = () => {
    if (pendingEventId) {
      onEventChange(pendingEventId)
      setShowWarning(false)
      setPendingEventId(null)
    }
  }

  const cancelEventChange = () => {
    setShowWarning(false)
    setPendingEventId(null)
  }

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event)
    
    if (status === "current") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          🟢 Current
        </Badge>
      )
    }
    if (status === "past") {
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
          🔴 Past
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        ⚪ Future
      </Badge>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Event Selector Card */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Event Selector */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Editing Form For:
            </label>
            <FancySelect
              value={selectedEventId || ""}
              onValueChange={handleEventChange}
              placeholder="Select an event..."
              options={events.map((event) => {
                const status = getEventStatus(event)
                return {
                  value: event.id,
                  label: `${event.title} (${formatDate(event.event_date)})${status === "current" ? " — Current" : ""}`,
                }
              })}
              className="w-full lg:w-[400px]"
              size="sm"
            />
          </div>

          {/* Right: Event Info */}
          {selectedEvent && (
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(selectedEvent)}
              
              {activeSchemaVersion && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>Active Version: v{activeSchemaVersion}</span>
                </div>
              )}
              
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Updated: {formatDate(lastUpdated)}</span>
                </div>
              )}
              
              {typeof registrationCount === "number" && (
                <Badge variant="secondary" className="font-normal">
                  {registrationCount} {registrationCount === 1 ? "registration" : "registrations"}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Event Details Row */}
        {selectedEvent && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Date:</span>{" "}
                {formatDate(selectedEvent.event_date)}
                {selectedEvent.event_time && ` at ${selectedEvent.event_time}`}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedEvent.location}
              </div>
              <div>
                <span className="font-medium">Category:</span>{" "}
                <span className="capitalize">{selectedEvent.category}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {showWarning && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="size-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-amber-900">You have unsaved changes</p>
              <p className="text-sm text-amber-700 mt-1">
                Switching events will discard your unsaved changes. Do you want to continue?
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={cancelEventChange}
                className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEventChange}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Switch Event
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
