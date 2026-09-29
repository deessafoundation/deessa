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
        <label className="space-y-1 block"><span className="text-[11px]">Current Value *</span><Input
            type="number"
            value={content.current}
            onChange={(e) => update("current", Number(e.target.value))}
            min={0}
            className="h-7 text-xs"
          /></label>
        <label className="space-y-1 block"><span className="text-[11px]">Goal *</span><Input
            type="number"
            value={content.goal}
            onChange={(e) => update("goal", Number(e.target.value))}
            min={1}
            className="h-7 text-xs"
          /></label>
      </div>
      <label className="space-y-1 block"><span className="text-[11px]">Unit *</span><Input
          value={content.unit}
          onChange={(e) => update("unit", e.target.value)}
          placeholder="families, dollars, etc."
          className="h-7 text-xs"
        /></label>
      <div className="rounded-md bg-muted p-2 text-center text-xs text-muted-foreground">
        {percentage}% complete ({content.current} / {content.goal} {content.unit || "units"})
      </div>
      <label className="space-y-1 block"><span className="text-[11px]">Progress updated on</span><Input
          type="date"
          value={content.asOf?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...content, asOf: e.target.value ? e.target.value + "T00:00:00Z" : undefined })}
          className="h-7 text-xs font-mono"
        /></label>
    </div>
  )
}
