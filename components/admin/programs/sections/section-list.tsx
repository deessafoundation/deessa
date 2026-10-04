"use client"

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, FileText, HelpCircle, BarChart3, Image, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProgramSection } from "@/lib/programs/content"
import { SortableSectionCard } from "./sortable-section-card"
import type { SectionType } from "../../program-sections/types"

interface SectionListProps {
  sections: ProgramSection[]
  allSections: ProgramSection[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleEnabled: (id: string) => void
  onAdd?: (type: SectionType) => void
}

const SUGGESTED_SECTIONS: { type: SectionType; label: string; description: string; icon: typeof FileText }[] = [
  { type: "rich_text", label: "Rich Text", description: "Write your program story", icon: FileText },
  { type: "features", label: "Features", description: "Highlight key features", icon: BarChart3 },
  { type: "gallery", label: "Gallery", description: "Show photos", icon: Image },
  { type: "quote", label: "Quote", description: "Share a testimonial", icon: MessageSquare },
  { type: "faq", label: "FAQ", description: "Answer common questions", icon: HelpCircle },
]

export function SectionList({
  sections,
  allSections,
  selectedId,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleEnabled,
  onAdd,
}: SectionListProps) {
  const ids = sections.map((s) => s.id)

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
        <div className="max-w-sm space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">No sections yet</p>
            <p className="text-xs text-muted-foreground">
              Add sections to build your program page. Each section becomes a visual block on the public page.
            </p>
          </div>
          {onAdd && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_SECTIONS.map(({ type, label, description, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => onAdd(type)}
                    className="flex items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Or use the <strong>Add Section</strong> button in the toolbar above for all types.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <SortableSectionCard
            key={section.id}
            section={section}
            index={index}
            isSelected={section.id === selectedId}
            isDisabled={!section.enabled}
            onSelect={onSelect}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            onToggleEnabled={onToggleEnabled}
          />
        ))}
      </div>
    </SortableContext>
  )
}
