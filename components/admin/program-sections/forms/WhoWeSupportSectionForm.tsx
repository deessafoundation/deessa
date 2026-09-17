"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "who_we_support" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function WhoWeSupportSectionForm({ content, onChange }: Props) {
  const groups = content.groups

  function update(index: number, field: string, value: string) {
    const next = groups.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    onChange({ ...content, groups: next })
  }

  function add() {
    if (groups.length >= 12) return
    onChange({ ...content, groups: [...groups, { title: "", description: "" }] })
  }

  function remove(index: number) {
    if (groups.length <= 1) return
    onChange({ ...content, groups: groups.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Target Groups ({groups.length}/12)</Label>

      {groups.map((group, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Group {i + 1}</span>
            {groups.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Title *</Label>
            <Input
              value={group.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="Children with ASD"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Description *</Label>
            <textarea
              value={group.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="Who they are and what they need"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Age Range</Label>
            <Input
              value={group.ageRange ?? ""}
              onChange={(e) => update(i, "ageRange", e.target.value)}
              placeholder="2-12 years"
              className="h-7 text-xs"
            />
          </div>
        </div>
      ))}

      {groups.length < 12 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Group
        </Button>
      )}
    </div>
  )
}
