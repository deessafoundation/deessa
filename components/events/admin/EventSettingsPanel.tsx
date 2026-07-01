"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Loader2,
  Eye,
  EyeOff,
  Pause,
  Play,
  Archive,
  RotateCcw,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react"
import {
  setEventStatus,
  deleteEvent,
  duplicateEvent,
} from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type { EventModuleEvent, EventStatus } from "@/lib/types/events-module"

interface EventSettingsPanelProps {
  event: EventModuleEvent
  canDelete: boolean
}

const statusColors: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  disabled: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
}

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  disabled: "Disabled",
  archived: "Archived",
}

export function EventSettingsPanel({
  event,
  canDelete: canDeleteEvent,
}: EventSettingsPanelProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)

  async function handleStatusChange(newStatus: EventStatus) {
    setIsLoading(newStatus)

    const result = await setEventStatus(event.id, newStatus)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({
        description: `Event ${newStatus === "archived" ? "archived" : "updated"}.`,
      })
      router.refresh()
    }
    setIsLoading(null)
  }

  async function handleDelete() {
    setIsLoading("delete")

    const result = await deleteEvent(event.id)

    if (result.error) {
      notifications.showError({ description: result.error })
      setIsLoading(null)
    } else {
      notifications.showSuccess({ description: "Event deleted." })
      router.push("/admin/events")
    }
  }

  async function handleDuplicate() {
    setIsLoading("duplicate")

    const result = await duplicateEvent(event.id)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else if (result.data) {
      notifications.showSuccess({ description: "Event duplicated. Redirecting..." })
      router.push(`/admin/events/${result.data.id}/details`)
    }
    setIsLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Status Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Event Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Current status:</span>
            <Badge
              variant="secondary"
              className={statusColors[event.status]}
            >
              {statusLabels[event.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.status === "draft" && (
              <Button
                onClick={() => handleStatusChange("published")}
                disabled={isLoading !== null}
              >
                {isLoading === "published" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            )}

            {event.status === "published" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("disabled")}
                disabled={isLoading !== null}
              >
                {isLoading === "disabled" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="mr-2 h-4 w-4" />
                )}
                Disable
              </Button>
            )}

            {event.status === "disabled" && (
              <Button
                onClick={() => handleStatusChange("published")}
                disabled={isLoading !== null}
              >
                {isLoading === "published" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Re-enable
              </Button>
            )}

            {(event.status === "published" || event.status === "disabled") && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("archived")}
                disabled={isLoading !== null}
              >
                {isLoading === "archived" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archive
              </Button>
            )}

            {event.status === "archived" && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange("draft")}
                disabled={isLoading !== null}
              >
                {isLoading === "draft" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Restore to Draft
              </Button>
            )}
          </div>

          {event.status === "published" && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/events/${event.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog
            open={duplicateDialogOpen}
            onOpenChange={setDuplicateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Duplicate Event</DialogTitle>
                <DialogDescription>
                  This will create a new draft event with the same details,
                  agenda, ticket types, email templates, and form schema.
                  Registrations will NOT be copied.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDuplicateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDuplicate}
                  disabled={isLoading === "duplicate"}
                >
                  {isLoading === "duplicate" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Duplicate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full justify-start"
                disabled={!canDeleteEvent}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{event.title}&quot;?
                  This action cannot be undone. All event data, agenda, forms,
                  and email templates will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading === "delete"}
                >
                  {isLoading === "delete" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!canDeleteEvent && (
            <p className="text-sm text-muted-foreground">
              This event has registrations and cannot be deleted. Archive it
              instead.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
