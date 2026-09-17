"use client"

import { Plus, Trash2, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { ProgramSection } from "@/lib/programs/content"
import { AssetPicker, AssetPick } from "../AssetPicker"

interface Props {
  content: Extract<ProgramSection["content"], { type: "gallery" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function GallerySectionForm({ content, onChange }: Props) {
  const images = content.images

  function updateImage(index: number, pick: AssetPick) {
    const next = images.map((img, i) => (i === index ? { ...img, ...pick } : img))
    onChange({ ...content, images: next })
  }

  function updateImageField(index: number, field: "alt" | "caption", value: string) {
    const next = images.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    onChange({ ...content, images: next })
  }

  function addImage() {
    if (images.length >= 8) return
    onChange({ ...content, images: [...images, { alt: "" }] })
  }

  function removeImage(index: number) {
    onChange({ ...content, images: images.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Images ({images.length}/8)</Label>
        <Select
          value={content.layout}
          onValueChange={(layout: "grid" | "story") => onChange({ ...content, layout })}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="story">Story</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {images.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-6 text-center">
          <p className="text-xs text-muted-foreground">No images yet. Add one to get started.</p>
        </div>
      )}

      {images.map((img, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Image {i + 1}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => removeImage(i)} className="h-6 w-6 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          <AssetPicker
            assetId={img.assetId ?? null}
            url={img.url}
            alt={img.alt}
            onPick={(pick) => updateImage(i, pick)}
            onClear={() => updateImage(i, { assetId: undefined, url: undefined })}
            label="Upload Image"
          />

          <div className="space-y-1">
            <Label className="text-[11px]">Alt Text * <span className="text-muted-foreground">(required for accessibility)</span></Label>
            <Input
              value={img.alt}
              onChange={(e) => updateImageField(i, "alt", e.target.value)}
              placeholder="Describe this image for screen readers"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Caption</Label>
            <Input
              value={img.caption ?? ""}
              onChange={(e) => updateImageField(i, "caption", e.target.value)}
              placeholder="Optional caption shown below image"
              className="h-7 text-xs"
            />
          </div>
        </div>
      ))}

      {images.length < 8 && (
        <Button variant="outline" size="sm" onClick={addImage} className="w-full gap-1.5 text-xs">
          <Plus className="h-3 w-3" /> Add Image
        </Button>
      )}
    </div>
  )
}
