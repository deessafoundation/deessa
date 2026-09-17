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
  content: Extract<ProgramSection["content"], { type: "cta" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function CTASectionForm({ content, onChange }: Props) {
  const buttons = content.buttons

  function updateButton(index: number, field: string, value: string) {
    const next = buttons.map((btn, i) => (i === index ? { ...btn, [field]: value } : btn))
    onChange({ ...content, buttons: next })
  }

  function addButton() {
    if (buttons.length >= 3) return
    onChange({ ...content, buttons: [...buttons, { label: "", url: "/", variant: "primary" }] })
  }

  function removeButton(index: number) {
    if (buttons.length <= 1) return
    onChange({ ...content, buttons: buttons.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Title *</Label>
        <Input
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Call to action heading"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Description</Label>
        <textarea
          value={content.description}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          placeholder="Supporting text"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="h-px bg-border" />
      <Label className="text-xs">Buttons ({buttons.length}/3)</Label>

      {buttons.map((btn, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Button {i + 1}</span>
            {buttons.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => removeButton(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Label *</Label>
            <Input
              value={btn.label}
              onChange={(e) => updateButton(i, "label", e.target.value)}
              placeholder="Donate Now"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">URL *</Label>
            <Input
              value={btn.url}
              onChange={(e) => updateButton(i, "url", e.target.value)}
              placeholder="/donate"
              className="h-7 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Variant</Label>
            <Select
              value={btn.variant}
              onValueChange={(val: "primary" | "secondary" | "outline") => updateButton(i, "variant", val)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}

      {buttons.length < 3 && (
        <Button variant="outline" size="sm" onClick={addButton} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Button
        </Button>
      )}
    </div>
  )
}
