"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProgramSection } from "@/lib/programs/content"
import { AssetPicker } from "../AssetPicker"

interface Props {
  content: Extract<ProgramSection["content"], { type: "quote" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function QuoteSectionForm({ content, onChange }: Props) {
  function update(field: string, value: string) {
    onChange({ ...content, [field]: value } as typeof content)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px]">Quote Text *</Label>
        <textarea
          value={content.quote}
          onChange={(e) => update("quote", e.target.value)}
          placeholder="The quote text"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Person Name *</Label>
        <Input
          value={content.person}
          onChange={(e) => update("person", e.target.value)}
          placeholder="Jane Doe"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Role</Label>
        <Input
          value={content.role ?? ""}
          onChange={(e) => update("role", e.target.value)}
          placeholder="Program Participant"
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Location</Label>
        <Input
          value={content.location ?? ""}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Kathmandu, Nepal"
          className="h-7 text-xs"
        />
      </div>
      <AssetPicker
        assetId={content.image?.assetId ?? null}
        url={content.image?.url}
        alt={content.image?.alt || content.person}
        onPick={(pick) =>
          onChange({
            ...content,
            image: { ...(content.image ?? { alt: content.person }), ...pick },
          } as typeof content)
        }
        onClear={() =>
          onChange({
            ...content,
            image: content.image?.alt ? { ...content.image, assetId: undefined, url: undefined } : undefined,
          } as typeof content)
        }
        label="Author Photo"
      />
    </div>
  )
}
