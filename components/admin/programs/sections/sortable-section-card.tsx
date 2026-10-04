"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical, Copy, Trash2, Eye, EyeOff,
  FileText, BarChart3, Images, LayoutGrid, ListOrdered, Clock,
  Quote, HelpCircle, TrendingUp, MousePointerClick, Calendar,
  BookOpen, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProgramSection } from "@/lib/programs/content"
import { SECTION_TYPE_MAP } from "../../program-sections/types"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, BarChart3, Images, LayoutGrid, ListOrdered, Clock,
  Quote, HelpCircle, TrendingUp, MousePointerClick, Calendar,
  BookOpen, Users,
}

interface SortableSectionCardProps {
  section: ProgramSection
  index: number
  isSelected: boolean
  isDisabled: boolean
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleEnabled: (id: string) => void
}

export function SortableSectionCard({
  section,
  index,
  isSelected,
  isDisabled,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleEnabled,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = SECTION_TYPE_MAP[section.content.type]
  const Icon = config ? ICON_MAP[config.icon] : null
  const heading = section.heading || section.content.type.replace(/_/g, " ")
  const accentColor = config?.accent ?? "#3FABDE"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 transition-all",
        isSelected && "ring-2 ring-primary",
        isDisabled && "opacity-50",
        isDragging && "shadow-lg opacity-90"
      )}
      onClick={() => onSelect(section.id)}
    >
      {/* Color accent bar */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type icon */}
      {Icon && (
        <span className="shrink-0" style={{ color: accentColor }}>
          <Icon className="h-4 w-4" />
        </span>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{heading}</span>
          <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
            {config?.label ?? section.content.type}
          </Badge>
          {isDisabled && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              Disabled
            </Badge>
          )}
        </div>
        {section.heading && (
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {section.content.type}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onToggleEnabled(section.id) }}
          title={isDisabled ? "Enable" : "Disable"}
        >
          {isDisabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onDuplicate(section.id) }}
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onRemove(section.id) }}
          title="Delete"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
