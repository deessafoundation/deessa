"use client"

import { Eye, EyeOff, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProgramSection } from "@/lib/programs/content"
import { SECTION_TYPE_MAP } from "./types"
import { SectionFormFactory } from "./forms/SectionFormFactory"

interface SectionPropertiesPanelProps {
  section: ProgramSection | null
  onUpdate: (sectionId: string, updates: Partial<ProgramSection>) => void
  onUpdateContent: (content: ProgramSection["content"]) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
}

export function SectionPropertiesPanel({
  section,
  onUpdate,
  onUpdateContent,
  onRemove,
  onDuplicate,
}: SectionPropertiesPanelProps) {
  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Select a section to edit its content</p>
      </div>
    )
  }

  const config = SECTION_TYPE_MAP[section.content.type]
  const accentColor = config?.accent ?? "#3FABDE"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3" style={{ borderBottom: `3px solid ${accentColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">
              {section.heading || config?.label || section.content.type}
            </CardTitle>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {config?.label ?? section.content.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDuplicate(section.id)}
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(section.id)}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Common fields */}
        <div className="space-y-2">
          <Label htmlFor="section-heading" className="text-xs">Eyebrow / Section Heading</Label>
          <Input
            id="section-heading"
            value={section.heading ?? ""}
            onChange={(e) => onUpdate(section.id, { heading: e.target.value || undefined })}
            placeholder="Optional heading displayed above section"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="section-intro" className="text-xs">Display Heading</Label>
          <textarea
            id="section-intro"
            value={section.intro ?? ""}
            onChange={(e) => onUpdate(section.id, { intro: e.target.value || undefined })}
            placeholder="Large heading; line breaks and *accent text* supported"
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="section-description" className="text-xs">Description</Label>
          <textarea
            id="section-description"
            value={section.description ?? ""}
            onChange={(e) => onUpdate(section.id, { description: e.target.value || undefined })}
            placeholder="Optional description paragraph shown below the heading"
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <p className="text-xs text-muted-foreground">Section link: #{section.id}</p>
        {["stats", "gallery", "rich_text", "features"].includes(section.content.type) && <label className="block space-y-1 text-xs">Layout
          <select className="w-full rounded border bg-background p-2" value={section.presentation || ""} onChange={event => onUpdate(section.id, { presentation: (event.target.value || undefined) as ProgramSection["presentation"] })}>
            <option value="">Category default</option>
            <option value="auto">Standard section</option>
            {section.content.type === "stats" && <option value="ribbon">Outreach impact ribbon</option>}
            {section.content.type === "gallery" && <option value="essay">Photo essay</option>}
            {section.content.type === "rich_text" && <option value="question">Research question strip</option>}
            {section.content.type === "features" && <option value="insights">Research insights</option>}
          </select>
        </label>}
        <label className="block space-y-1 text-xs">Footnote
          <Input maxLength={300} value={section.footnote || ""} onChange={event => onUpdate(section.id, { footnote: event.target.value })} />
        </label>
        {["story", "quote"].includes(section.content.type) && <>
          <label className="block space-y-1 text-xs">Expanded story label
            <Input maxLength={120} value={section.detailLabel || ""} onChange={event => onUpdate(section.id, { detailLabel: event.target.value })} />
          </label>
          <label className="block space-y-1 text-xs">Expanded story text
            <textarea className="w-full rounded border bg-background p-2" rows={4} maxLength={4000} value={section.detailText || ""} onChange={event => onUpdate(section.id, { detailText: event.target.value })} />
          </label>
        </>}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Enabled</Label>
          <Switch
            checked={section.enabled}
            onCheckedChange={(checked) => onUpdate(section.id, { enabled: checked })}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Type-specific form */}
        <SectionFormFactory
          section={section}
          onChange={onUpdateContent}
        />
      </CardContent>
    </Card>
  )
}
