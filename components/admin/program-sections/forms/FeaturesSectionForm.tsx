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
  content: Extract<ProgramSection["content"], { type: "features" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function FeaturesSectionForm({ content, onChange }: Props) {
  const features = content.features

  function update(index: number, field: string, value: string) {
    const next = features.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    onChange({ ...content, features: next })
  }

  function add() {
    if (features.length >= 12) return
    onChange({ ...content, features: [...features, { title: "", description: "" }] })
  }

  function remove(index: number) {
    if (features.length <= 1) return
    onChange({ ...content, features: features.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Features ({features.length}/12)</Label>
        <Select
          value={content.layout}
          onValueChange={(layout: "grid" | "list") => onChange({ ...content, layout })}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {features.map((feat, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Feature {i + 1}</span>
            {features.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} className="h-6 w-6 text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Title *</Label>
            <Input
              value={feat.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="Feature name"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Description *</Label>
            <textarea
              value={feat.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What this feature does"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Icon (emoji)</Label>
              <Input
                value={feat.icon ?? ""}
                onChange={(e) => update(i, "icon", e.target.value)}
                placeholder="💊"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Number Badge</Label>
              <Input
                value={feat.number ?? ""}
                onChange={(e) => update(i, "number", e.target.value)}
                placeholder="01"
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
      ))}

      {features.length < 12 && (
        <Button variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Feature
        </Button>
      )}
    </div>
  )
}
