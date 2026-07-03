"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Undo2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { notifications } from "@/lib/notifications"
import {
  checkInEventRegistration,
  undoCheckInEventRegistration,
} from "@/lib/actions/events-module/event-registration"

interface EventCheckInButtonProps {
  registrationId: string
  isCheckedIn: boolean
  checkedInAt: string | null
  checkedInBy: string | null
}

export function EventCheckInButton({
  registrationId,
  isCheckedIn,
  checkedInAt,
  checkedInBy,
}: EventCheckInButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showUndoModal, setShowUndoModal] = useState(false)

  async function handleCheckIn() {
    setLoading(true)
    const result = await checkInEventRegistration(registrationId)
    setLoading(false)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Attendee checked in." })
      router.refresh()
    }
  }

  async function handleUndo() {
    setLoading(true)
    const result = await undoCheckInEventRegistration(registrationId)
    setLoading(false)
    setShowUndoModal(false)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Check-in undone." })
      router.refresh()
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Check-in Status
            </p>
            {isCheckedIn ? (
              <div className="mt-1">
                <p className="text-sm font-medium text-green-600">Checked In</p>
                {checkedInAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(checkedInAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {checkedInBy && ` by ${checkedInBy}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Not checked in</p>
            )}
          </div>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isCheckedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUndoModal(true)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Undo2 className="mr-1 h-3.5 w-3.5" />
              Undo
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleCheckIn}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Check In
            </Button>
          )}
        </div>
      </div>

      {/* Undo Confirmation Modal */}
      <Dialog open={showUndoModal} onOpenChange={setShowUndoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Check-in</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo this check-in? The attendee will no
              longer be marked as checked in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUndoModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUndo}
              disabled={loading}
              variant="outline"
              className="text-orange-600"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Undo Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
