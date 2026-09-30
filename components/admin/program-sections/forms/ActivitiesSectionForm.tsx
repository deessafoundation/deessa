"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "activities" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function ActivitiesSectionForm({ content, onChange }: Props) {
  const activities = content.activities

  function update(index: number, field: string, value: string) {
    const next = activities.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    onChange({ ...content, activities: next })
  }

  function add() {
    if (activities.length >= 20) return
    onChange({ ...content, activities: [...activities, { place: "", date: "", title: "", description: "" }] })
  }

  function remove(index: number) {
    if (activities.length <= 1) return
    onChange({ ...content, activities: activities.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Activities ({activities.length}/20)</Label>

      {activities.map((act, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Activity {i + 1}</span>
            {activities.length > 1 && (
              <Button variant="ghost" size="icon-sm" aria-label={`Remove item ${i + 1}`} onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <label className="space-y-1 block"><span className="text-[11px]">Title *</span><Input
              value={act.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="Activity name"
              className="h-7 text-xs"
            /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 block"><span className="text-[11px]">Place *</span><Input
                value={act.place}
                onChange={(e) => update(i, "place", e.target.value)}
                placeholder="Venue or location"
                className="h-7 text-xs"
              /></label>
            <label className="space-y-1 block"><span className="text-[11px]">Date *</span><Input
                value={act.date}
                onChange={(e) => update(i, "date", e.target.value)}
                placeholder="March 15, 2024"
                className="h-7 text-xs"
              /></label>
          </div>
          <label className="space-y-1 block"><span className="text-[11px]">Description</span><textarea
              value={act.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What happens at this activity"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            /></label>
          <label className="space-y-1 block"><span className="text-[11px]">Count</span><Input
              value={act.count ?? ""}
              onChange={(e) => update(i, "count", e.target.value)}
              placeholder="45 attendees"
              className="h-7 text-xs"
            /></label>
        </div>
      ))}

      {activities.length < 20 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Activity
        </Button>
      )}
    </div>
  )
}
