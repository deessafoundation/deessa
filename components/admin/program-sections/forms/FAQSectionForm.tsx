"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "faq" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function FAQSectionForm({ content, onChange }: Props) {
  const items = content.items

  function update(index: number, field: string, value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    onChange({ ...content, items: next })
  }

  function add() {
    if (items.length >= 20) return
    onChange({ ...content, items: [...items, { question: "", answer: "" }] })
  }

  function remove(index: number) {
    if (items.length <= 1) return
    onChange({ ...content, items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs">FAQ Items ({items.length}/20)</Label>

      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
            {items.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Question *</Label>
            <Input
              value={item.question}
              onChange={(e) => update(i, "question", e.target.value)}
              placeholder="What is...?"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Answer *</Label>
            <textarea
              value={item.answer}
              onChange={(e) => update(i, "answer", e.target.value)}
              placeholder="The answer to this question"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      ))}

      {items.length < 20 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add FAQ
        </Button>
      )}
    </div>
  )
}
