"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "how_it_works" | "timeline" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function StepsSectionForm({ content, onChange }: Props) {
  const items = content.items
  const isTimeline = content.type === "timeline"
  const handwrittenNote = content.handwrittenNote

  function update(index: number, field: string, value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    onChange({ ...content, items: next } as typeof content)
  }

  function updateHandwrittenNote(value: string) {
    onChange({ ...content, handwrittenNote: value || undefined } as typeof content)
  }

  function add() {
    if (items.length >= 20) return
    const newItem = isTimeline
      ? { title: "", description: "", date: "", status: "upcoming" as const }
      : { title: "", description: "" }
    onChange({ ...content, items: [...items, newItem] } as typeof content)
  }

  function remove(index: number) {
    if (items.length <= 1) return
    onChange({ ...content, items: items.filter((_, i) => i !== index) } as typeof content)
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">
        {isTimeline ? "Milestones" : "Steps"} ({items.length}/20)
      </Label>

      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {isTimeline ? `Milestone ${i + 1}` : `Step ${i + 1}`}
            </span>
            {items.length > 1 && (
              <Button variant="ghost" size="icon-sm" aria-label={`Remove item ${i + 1}`} onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <label className="space-y-1 block"><span className="text-[11px]">Title *</span><Input
              value={item.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder={isTimeline ? "Milestone name" : "Step name"}
              className="h-7 text-xs"
            /></label>
          <label className="space-y-1 block"><span className="text-[11px]">Description *</span><textarea
              value={item.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What happens at this step"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            /></label>
          {isTimeline && (
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 block"><span className="text-[11px]">Date</span><Input
                  value={item.date ?? ""}
                  onChange={(e) => update(i, "date", e.target.value)}
                  placeholder="Jan 2024"
                  className="h-7 text-xs"
                /></label>
              <div className="space-y-1">
                <Label className="text-[11px]">Status</Label>
                <Select
                  value={item.status ?? ""}
                  onValueChange={(val) => update(i, "status", val)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      ))}

      {items.length < 20 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add {isTimeline ? "Milestone" : "Step"}
        </Button>
      )}

      {!isTimeline && (
        <div className="space-y-1 pt-2">
          <Label className="text-[11px]">Handwritten Note</Label>
          <Input
            value={handwrittenNote ?? ""}
            onChange={(e) => updateHandwrittenNote(e.target.value)}
            placeholder="e.g. Small steps count, too."
            className="h-7 text-xs"
          />
        </div>
      )}
    </div>
  )
}
