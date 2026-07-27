"use client"

import { useState, useEffect, useCallback } from "react"
import { Save, Loader2, StickyNote } from "lucide-react"
import { notifications } from "@/lib/notifications"
import {
  addEventRegistrationNote,
  getEventRegistrationNotes,
} from "@/lib/actions/events-module/event-registration"
import { Button } from "@/components/ui/button"

interface EventRegistrationNotesProps {
  registrationId: string
}

interface NoteEntry {
  id: string
  note: string
  created_by: string | null
  created_at: string
}

export function EventRegistrationNotes({
  registrationId,
}: EventRegistrationNotesProps) {
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    const data = await getEventRegistrationNotes(registrationId)
    setNotes(data)
    setLoading(false)
  }, [registrationId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleSave = async () => {
    if (!note.trim()) return
    setSaving(true)
    try {
      const result = await addEventRegistrationNote(registrationId, note)
      if (result.error) {
        notifications.showError({ description: result.error })
      } else {
        setNote("")
        notifications.showSuccess({ description: "Note added." })
        fetchNotes()
      }
    } catch {
      notifications.showError({ description: "Failed to save note." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add new note */}
      <div className="flex flex-col gap-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          aria-label="Add admin note"
          placeholder="Add a note about this registrant..."
          className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {note.length > 0 ? `${note.length} characters` : ""}
          </p>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !note.trim()}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saving ? "Saving..." : "Add Note"}
          </Button>
        </div>
      </div>

      {/* Notes history */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Notes History
        </p>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border bg-muted/20 p-3"
              >
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {entry.note}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StickyNote className="size-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {entry.created_by && <span className="font-medium">{entry.created_by}</span>}
                    {entry.created_by && " • "}
                    {new Date(entry.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
