"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Copy,
  Trash2,
  Mail,
  Type,
  AlignLeft,
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
  ArrowRightLeft,
  CalendarRange,
  PenTool,
  Star,
  SlidersHorizontal,
  Repeat,
  Pilcrow,
} from "lucide-react"
import type { FormField, FieldType } from "@/lib/types/conference-form-schema"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SortableFieldCardProps {
  field: FormField
  isSelected: boolean
  steps: { id: string; label: string }[]
  currentStepId: string
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveToStep: (stepId: string) => void
}

const TYPE_ICONS: Record<FieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  tel: Phone,
  number: Hash,
  select: ChevronDown,
  radio: Circle,
  checkbox: CheckSquare,
  toggle: ToggleLeft,
  date: Calendar,
  heading: Heading1,
  paragraph: FileText,
  url: Link,
  file: Upload,
  dateRange: CalendarRange,
  signature: PenTool,
  rating: Star,
  slider: SlidersHorizontal,
  repeating: Repeat,
  richText: Pilcrow,
}

export function SortableFieldCard({
  field,
  isSelected,
  steps,
  currentStepId,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveToStep,
}: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = TYPE_ICONS[field.type] || Type
  const otherSteps = steps.filter((s) => s.id !== currentStepId)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all cursor-pointer ${
        isDragging
          ? "opacity-90 scale-[1.02] shadow-lg border-primary bg-white z-50"
          : isSelected
            ? "border-primary/40 bg-primary/5"
            : "border-gray-200 bg-white hover:bg-gray-50/80 hover:border-gray-300"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Type icon */}
      <div className={`shrink-0 flex size-7 items-center justify-center rounded-md ${
        isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
      }`}>
        <Icon className="size-3.5" />
      </div>

      {/* Label + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-black truncate">
            {field.label}
          </span>
          {field.required && (
            <span className="text-red-500 text-xs font-bold">*</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {field.conditional && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
              conditional
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        {/* Move to step (only if multiple steps) */}
        {otherSteps.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Move to step"
              >
                <ArrowRightLeft className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {otherSteps.map((step) => (
                <DropdownMenuItem
                  key={step.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveToStep(step.id)
                  }}
                >
                  Move to {step.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          title="Duplicate"
        >
          <Copy className="size-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
