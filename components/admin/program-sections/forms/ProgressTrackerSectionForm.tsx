"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "progress_tracker" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function ProgressTrackerSectionForm({ content, onChange }: Props) {
  function update(field: string, value: string | number) {
    onChange({ ...content, [field]: value } as typeof content)
  }

  const percentage = content.goal > 0 ? Math.min(100, Math.round((content.current / content.goal) * 100)) : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Current Value *</Label>
          <Input
            type="number"
            value={content.current}
            onChange={(e) => update("current", Number(e.target.value))}
            min={0}
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Goal *</Label>
          <Input
            type="number"
            value={content.goal}
            onChange={(e) => update("goal", Number(e.target.value))}
            min={1}
            className="h-7 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Unit *</Label>
        <Input
          value={content.unit}
          onChange={(e) => update("unit", e.target.value)}
          placeholder="families, dollars, etc."
          className="h-7 text-xs"
        />
      </div>
      <div className="rounded-md bg-muted p-2 text-center text-xs text-muted-foreground">
        {percentage}% complete ({content.current} / {content.goal} {content.unit || "units"})
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">As of Date (ISO)</Label>
        <Input
          value={content.asOf ?? ""}
          onChange={(e) => update("asOf", e.target.value)}
          placeholder="2024-12-31T00:00:00Z"
          className="h-7 text-xs font-mono"
        />
      </div>
    </div>
  )
}
