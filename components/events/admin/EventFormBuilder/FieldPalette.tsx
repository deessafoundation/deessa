"use client"

import { useState } from "react"
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  ChevronDown,
  Circle,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Heading1,
  FileText,
  Link,
  Upload,
  CalendarRange,
  PenTool,
  Star,
  SlidersHorizontal,
  Repeat,
  Pilcrow,
  ChevronRight,
} from "lucide-react"
import type { FieldType } from "@/lib/types/conference-form-schema"

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void
  targetStepId: string | null
}

interface FieldCategory {
  name: string
  icon: typeof Type
  fields: { type: FieldType; label: string; icon: typeof Type }[]
}

const FIELD_CATEGORIES: FieldCategory[] = [
  {
    name: "Input",
    icon: Type,
    fields: [
      { type: "text", label: "Text", icon: Type },
      { type: "textarea", label: "Text Area", icon: AlignLeft },
      { type: "email", label: "Email", icon: Mail },
      { type: "tel", label: "Phone", icon: Phone },
      { type: "number", label: "Number", icon: Hash },
      { type: "url", label: "URL", icon: Link },
    ],
  },
  {
    name: "Choice",
    icon: CheckSquare,
    fields: [
      { type: "select", label: "Dropdown", icon: ChevronDown },
      { type: "radio", label: "Radio", icon: Circle },
      { type: "checkbox", label: "Checkbox", icon: CheckSquare },
      { type: "toggle", label: "Toggle", icon: ToggleLeft },
    ],
  },
  {
    name: "Date & Time",
    icon: Calendar,
    fields: [
      { type: "date", label: "Date", icon: Calendar },
      { type: "dateRange", label: "Date Range", icon: CalendarRange },
    ],
  },
  {
    name: "Media & Files",
    icon: Upload,
    fields: [
      { type: "file", label: "File Upload", icon: Upload },
      { type: "signature", label: "Signature", icon: PenTool },
    ],
  },
  {
    name: "Feedback",
    icon: Star,
    fields: [
      { type: "rating", label: "Rating", icon: Star },
      { type: "slider", label: "Slider", icon: SlidersHorizontal },
    ],
  },
  {
    name: "Layout",
    icon: Heading1,
    fields: [
      { type: "heading", label: "Heading", icon: Heading1 },
      { type: "paragraph", label: "Paragraph", icon: FileText },
      { type: "richText", label: "Rich Text", icon: Pilcrow },
      { type: "repeating", label: "Repeating", icon: Repeat },
    ],
  },
]

export function FieldPalette({ onAddField, targetStepId }: FieldPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(FIELD_CATEGORIES.map((c) => c.name))
  )

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2 px-1">
        Field Types
      </h3>

      {FIELD_CATEGORIES.map((category) => {
        const isExpanded = expandedCategories.has(category.name)
        const CategoryIcon = category.icon

        return (
          <div key={category.name}>
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-black/50 hover:bg-gray-100 hover:text-black/80 transition-all"
            >
              <CategoryIcon className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">{category.name}</span>
              <ChevronRight
                className={`size-3.5 shrink-0 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="grid grid-cols-2 gap-1 pb-2 px-0.5">
                {category.fields.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => onAddField(type)}
                    disabled={!targetStepId}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-2 text-xs font-medium text-black/60 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!targetStepId ? "Add a step first" : `Add ${label}`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {!targetStepId && (
        <p className="text-xs text-black/30 text-center pt-2">
          Add a step to start adding fields
        </p>
      )}
    </div>
  )
}
