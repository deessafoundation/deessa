"use client"

import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/admin/rich-text-editor/rich-text-editor"
import type { ProgramSection } from "@/lib/programs/content"

interface Props {
  content: Extract<ProgramSection["content"], { type: "rich_text" }>
  onChange: (content: ProgramSection["content"]) => void
}

export function RichTextSectionForm({ content, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Body Content</Label>
      <RichTextEditor
        content={content.body}
        onChange={(body) => onChange({ ...content, body })}
        placeholder="Write your content here..."
        className="min-h-[200px]"
      />
    </div>
  )
}
