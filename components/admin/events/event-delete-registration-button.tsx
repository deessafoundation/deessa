"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notifications } from "@/lib/notifications"
import { deleteEventRegistration } from "@/lib/actions/events-module/event-registration"
import { cn } from "@/lib/utils"

interface EventDeleteRegistrationButtonProps {
  registrationId: string
  eventId?: string
  shortId: string
  fullName: string
  email: string
  status: string
}

export function EventDeleteRegistrationButton({
  registrationId,
  eventId,
  shortId,
  fullName,
  status,
}: EventDeleteRegistrationButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCancelled = status === "cancelled"
  const canDelete = isCancelled && confirm.trim().toLowerCase() === shortId.trim().toLowerCase()

  function handleOpen() {
    if (!isCancelled) return
    setConfirm("")
    setError(null)
    setOpen(true)
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setConfirm("")
    setError(null)
  }

  async function handleDelete() {
    if (!canDelete || loading) return
    setLoading(true)
    setError(null)

    try {
      const result = await deleteEventRegistration(registrationId)
      if (result.success) {
        setOpen(false)
        notifications.showSuccess({ description: "Registration deleted successfully." })
        router.push(eventId ? `/admin/events/${eventId}` : "/admin/events")
        router.refresh()
      } else {
        setError(result.error || "Failed to delete registration.")
        setLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        disabled={!isCancelled}
        title={
          isCancelled
            ? "Permanently delete this registration"
            : "Registration must be cancelled before it can be deleted"
        }
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
          isCancelled
            ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 cursor-pointer"
            : "border-border bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
        )}
      >
        <Trash2 className="size-4 shrink-0" />
        <span className="flex-1 text-left">Delete Registration</span>
        {!isCancelled && (
          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cancelled only
          </span>
        )}
      </button>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={handleClose}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border p-6 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Delete Registration</h2>
                  <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-400">
                <p className="text-sm font-semibold mb-1">
                  Permanent deletion — no recovery possible
                </p>
                <p className="text-xs leading-relaxed text-rose-600/90 dark:text-rose-400/90">
                  All data for <strong className="text-foreground">{fullName}</strong>{" "}
                  (<code className="font-mono">{shortId}</code>) will be permanently deleted,
                  including attendance logs, payment records, and communication history.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs sm:text-sm font-medium text-foreground">
                  Type <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary font-bold">{shortId}</code> to confirm:
                </label>
                <input
                  type="text"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={shortId}
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/10">
              <Button variant="outline" onClick={handleClose} disabled={loading} size="sm">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!canDelete || loading}
                size="sm"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
