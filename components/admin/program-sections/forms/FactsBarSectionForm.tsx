"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "facts_bar" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function FactsBarSectionForm({ content, onChange }: Props) {
  const facts = content.facts

  function update(index: number, field: string, value: string) {
    const next = facts.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    onChange({ ...content, facts: next })
  }

  function add() {
    if (facts.length >= 6) return
    onChange({ ...content, facts: [...facts, { label: "", value: "" }] })
  }

  function remove(index: number) {
    if (facts.length <= 1) return
    onChange({ ...content, facts: facts.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">Facts ({facts.length}/6)</Label>

      {facts.map((fact, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Fact {i + 1}</span>
            {facts.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Label *</Label>
            <Input
              value={fact.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="e.g. THE PROGRAM"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Value *</Label>
            <Input
              value={fact.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="e.g. AAC communication support"
              className="h-7 text-xs"
            />
          </div>
        </div>
      ))}

      {facts.length < 6 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Fact
        </Button>
      )}
    </div>
  )
}
