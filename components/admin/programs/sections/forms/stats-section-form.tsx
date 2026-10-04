"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  hideAttribution?: boolean
  content: Extract<ProgramSection["content"], { type: "stats" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function StatsSectionForm({ content, onChange, hideAttribution = false }: Props) {
  const stats = content.stats

  function update(index: number, field: string, value: string) {
    const next = stats.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onChange({ ...content, stats: next })
  }

  function add() {
    if (stats.length >= 12) return
    onChange({ ...content, stats: [...stats, { value: "", label: "" }] })
  }

  function remove(index: number) {
    if (stats.length <= 1) return
    onChange({ ...content, stats: stats.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Statistics ({stats.length}/12)</Label>
      {stats.map((stat, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Stat {i + 1}</span>
            {stats.length > 1 && (
              <Button variant="ghost" size="icon-sm" aria-label={`Remove item ${i + 1}`} onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 block"><span className="text-[11px]">Value *</span><Input
                value={stat.value}
                onChange={(e) => update(i, "value", e.target.value)}
                placeholder="1,200+"
                className="h-7 text-xs"
              /></label>
            <label className="space-y-1 block"><span className="text-[11px]">Label *</span><Input
                value={stat.label}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Families Reached"
                className="h-7 text-xs"
              /></label>
          </div>
          {!hideAttribution && <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 block"><span className="text-[11px]">Period</span><Input
                value={stat.period ?? ""}
                onChange={(e) => update(i, "period", e.target.value)}
                placeholder="2024"
                className="h-7 text-xs"
              /></label>
            <label className="space-y-1 block"><span className="text-[11px]">Source</span><Input
                value={stat.source ?? ""}
                onChange={(e) => update(i, "source", e.target.value)}
                placeholder="WHO Report"
                className="h-7 text-xs"
              /></label>
          </div>}
        </div>
      ))}
      {stats.length < 12 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Stat
        </Button>
      )}
    </div>
  )
}
