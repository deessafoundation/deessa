"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "resources" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function ResourcesSectionForm({ content, onChange }: Props) {
  const resources = content.resources

  function update(index: number, field: string, value: string) {
    const next = resources.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    onChange({ ...content, resources: next })
  }

  function add() {
    if (resources.length >= 20) return
    onChange({ ...content, resources: [...resources, { label: "", description: "", url: "/" }] })
  }

  function remove(index: number) {
    if (resources.length <= 1) return
    onChange({ ...content, resources: resources.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Resources ({resources.length}/20)</Label>

      {resources.map((res, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Resource {i + 1}</span>
            {resources.length > 1 && (
              <Button variant="ghost" size="icon-sm" aria-label={`Remove item ${i + 1}`} onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <label className="space-y-1 block"><span className="text-[11px]">Label *</span><Input
              value={res.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Resource name"
              className="h-7 text-xs"
            /></label>
          <label className="space-y-1 block"><span className="text-[11px]">Description</span><textarea
              value={res.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What this resource provides"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            /></label>
          <label className="space-y-1 block"><span className="text-[11px]">URL *</span><Input
              value={res.url}
              onChange={(e) => update(i, "url", e.target.value)}
              placeholder="/resources/guide"
              className="h-7 text-xs font-mono"
            /></label>
        </div>
      ))}

      {resources.length < 20 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Resource
        </Button>
      )}
    </div>
  )
}
