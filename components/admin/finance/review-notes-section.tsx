"use client"

import { useState, useEffect, useTransition, memo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MessageSquare, Loader2, Sparkles, User, Clock, CheckCircle2 } from "lucide-react"
import { addReviewNote } from "@/lib/actions/admin-donation-actions"
import { addReviewNotePolymorphic } from "@/lib/actions/admin-payment-actions"
import { notifications } from "@/lib/notifications"
import { formatRelativeTime, formatAbsoluteTime } from "@/lib/utils/date-formatting"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import styles from "../donations/donations.module.css"

interface ReviewNote {
  id: string
  note_text: string
  created_at: string
  admin_users?: {
    full_name?: string | null
    email?: string | null
  } | null
}

interface ReviewNotesSectionProps {
  donationId?: string
  entityId?: string
  entityType?: "donation" | "event" | "conference"
  notes: ReviewNote[]
  userRole: "ADMIN" | "SUPER_ADMIN" | "FINANCE" | "EDITOR"
}

const NOTE_PRESETS = [
  "Verified against bank statement ledger.",
  "Donor contacted and confirmed transaction intent.",
  "Receipt re-issued and dispatched to donor email.",
  "Flagged for accounting supervisor review.",
]

export const ReviewNotesSection = memo(function ReviewNotesSection({
  donationId,
  entityId,
  entityType,
  notes,
  userRole,
}: ReviewNotesSectionProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [notesList, setNotesList] = useState<ReviewNote[]>(notes || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)

  // Keep notesList in sync whenever incoming notes prop updates from server
  useEffect(() => {
    if (notes) {
      setNotesList(notes)
    }
  }, [notes])

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)
  const isPolymorphic = !!entityId && !!entityType

  const handleSubmit = async () => {
    if (noteText.trim().length < 10) {
      notifications.showError({
        title: "Validation Error",
        description: "Note must be at least 10 characters long.",
      })
      return
    }

    setIsSubmitting(true)
    const submittedText = noteText.trim()

    try {
      const result = isPolymorphic
        ? await addReviewNotePolymorphic({
            entityId: entityId!,
            entityType: entityType!,
            noteText: submittedText,
          })
        : await addReviewNote({
            donationId: donationId!,
            noteText: submittedText,
          })

      if (result.ok) {
        // Optimistically insert new note at the top of the list so it appears immediately!
        const optimisticNote: ReviewNote = {
          id: `opt-${Date.now()}`,
          note_text: submittedText,
          created_at: new Date().toISOString(),
          admin_users: {
            full_name: "Staff Admin (You)",
            email: "",
          },
        }

        setNotesList((prev) => [optimisticNote, ...prev])
        notifications.showSuccess({
          title: "Note Recorded",
          description: result.message || "Review note attached successfully.",
        })
        setNoteText("")
        setIsDialogOpen(false)

        // Trigger a background refresh to synchronize server state
        startTransition(() => {
          router.refresh()
        })
      } else {
        notifications.showError({
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Add review note error:", error)
      notifications.showError({
        title: "Error",
        description: "Failed to add review note. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedNotes = notesList.slice(0, displayCount)
  const hasMore = notesList.length > displayCount

  return (
    <Card id="staff-notes" className="border-border/80 shadow-xs overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">
            Staff Notes
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-mono font-semibold px-2 py-0.5 ml-1">
            {notesList.length}
          </Badge>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="gap-1.5 h-8 text-xs font-semibold bg-primary text-primary-foreground shadow-2xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Note</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {displayedNotes.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8 italic border border-dashed rounded-xl p-4">
            No internal staff notes recorded yet. Click &ldquo;Add Note&rdquo; above to record observations.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotes.map((note) => {
              const authorName = note.admin_users?.full_name || "Staff Admin"
              const initials = authorName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={note.id}
                  className={cn(
                    styles.reviewNoteCard,
                    "p-3.5 rounded-xl border border-border/60 space-y-2 text-xs"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {initials || <User className="size-3" />}
                      </div>
                      <span className="font-semibold text-foreground truncate">{authorName}</span>
                    </div>

                    <span
                      className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0"
                      title={formatAbsoluteTime(note.created_at) || undefined}
                    >
                      <Clock className="size-3" />
                      {formatRelativeTime(note.created_at)}
                    </span>
                  </div>

                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {note.note_text}
                  </p>
                </div>
              )
            })}

            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="w-full text-xs h-8 cursor-pointer"
              >
                Load More ({notesList.length - displayCount} remaining)
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* ── Add Note Dialog (with Side-by-Side Mobile Buttons) ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Staff Review Note</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Internal immutable note for audit records and team cross-referencing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NOTE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNoteText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors text-left cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Note Details
              </label>
              <Textarea
                placeholder="Enter audit observations, bank receipt verification details..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className={cn(
                  "resize-none text-xs sm:text-sm bg-muted/20",
                  noteText.length > 0 && noteText.trim().length < 10
                    ? "border-amber-500 focus-visible:ring-amber-500"
                    : ""
                )}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-[11px]">
                <span
                  className={cn(
                    noteText.length > 0 && noteText.trim().length < 10
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {noteText.trim().length} / 10 characters minimum
                </span>
                {noteText.length > 0 && noteText.trim().length < 10 && (
                  <span className="text-amber-600 dark:text-amber-400">Needs more detail</span>
                )}
              </div>
            </div>
          </div>

          {/* Dialog Footer - Side by side on mobile */}
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none text-xs h-9 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || noteText.trim().length < 10}
              className="flex-1 sm:flex-none text-xs h-9 font-semibold bg-primary text-primary-foreground cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Note</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
})
