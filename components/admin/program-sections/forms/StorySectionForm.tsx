"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"
import { AssetPicker } from "../AssetPicker"
import { ImageMetadataFields } from "../ImageMetadataFields"

interface Props {
  content: Extract<ProgramSection["content"], { type: "story" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function StorySectionForm({ content, onChange }: Props) {
  const stats = content.stats || []

  function update(field: string, value: string) {
    onChange({ ...content, [field]: value } as typeof content)
  }

  function updateStat(index: number, field: string, value: string) {
    const next = stats.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onChange({ ...content, stats: next } as typeof content)
  }

  function addStat() {
    if (stats.length >= 4) return
    onChange({ ...content, stats: [...stats, { value: "", label: "" }] } as typeof content)
  }

  function removeStat(index: number) {
    onChange({ ...content, stats: stats.filter((_, i) => i !== index) } as typeof content)
  }

  return (
    <div className="space-y-3">
      <label className="space-y-1 block"><span className="text-[11px]">Story Quote *</span><textarea
          value={content.quote}
          onChange={(e) => update("quote", e.target.value)}
          placeholder="A memorable quote from this story"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        /></label>
      <label className="space-y-1 block"><span className="text-[11px]">Description</span><textarea
          value={content.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="A short paragraph about this story"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        /></label>
      <label className="space-y-1 block"><span className="text-[11px]">Person Name *</span><Input
          value={content.person}
          onChange={(e) => update("person", e.target.value)}
          placeholder="Jane Doe"
          className="h-7 text-xs"
        /></label>
      <label className="space-y-1 block"><span className="text-[11px]">Role</span><Input
          value={content.role ?? ""}
          onChange={(e) => update("role", e.target.value)}
          placeholder="Program Participant"
          className="h-7 text-xs"
        /></label>
      <label className="space-y-1 block"><span className="text-[11px]">Location</span><Input
          value={content.location ?? ""}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Kathmandu, Nepal"
          className="h-7 text-xs"
        /></label>

      <AssetPicker
        assetId={content.image?.assetId ?? null}
        url={content.image?.url}
        alt={content.image?.alt || "Story image"}
        onPick={(pick) =>
          onChange({
            ...content,
            image: { ...content.image, ...pick, alt: content.image?.alt || "Story image" },
          } as typeof content)
        }
        onClear={() =>
          onChange({
            ...content,
            image: undefined,
          } as typeof content)
        }
        label="Story Photo"
      />
      {content.image && <ImageMetadataFields image={content.image} onChange={image => onChange({ ...content, image })} />}

      <div className="h-px bg-border" />
      <Label className="text-xs">Mini Stats ({stats.length}/4)</Label>

      {stats.map((stat, i) => (
        <div key={i} className="flex items-end gap-2 rounded-lg border p-3">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <label className="space-y-1 block"><span className="text-[11px]">Value *</span><Input
                value={stat.value}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                placeholder="120"
                className="h-7 text-xs"
              /></label>
            <label className="space-y-1 block"><span className="text-[11px]">Label *</span><Input
                value={stat.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="families"
                className="h-7 text-xs"
              /></label>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => removeStat(i)} className="h-7 w-7 text-destructive shrink-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {stats.length < 4 && (
        <Button variant="outline" size="sm" onClick={addStat} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Mini Stat
        </Button>
      )}
    </div>
  )
}
