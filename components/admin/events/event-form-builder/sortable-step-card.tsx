"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { GripVertical, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react"
import { SortableFieldCard } from "./sortable-field-card"
import type { FormStep, FormField, FieldType } from "@/lib/types/conference-form-schema"

interface SortableStepCardProps {
  step: FormStep
  isSelectedFieldId: string | null
  isSelectedStep: boolean
  allSteps: { id: string; label: string }[]
  onSelectField: (fieldId: string) => void
  onSelectStep: () => void
  onUpdateStep: (updates: Partial<FormStep>) => void
  onRemoveStep: () => void
  onRemoveField: (fieldId: string) => void
  onDuplicateField: (fieldId: string) => void
  onMoveFieldToStep: (toStepId: string, fieldId: string) => void
  expanded: boolean
  onToggleExpand: () => void
}

export function SortableStepCard({
  step,
  isSelectedFieldId,
  isSelectedStep,
  allSteps,
  onSelectField,
  onSelectStep,
  onUpdateStep,
  onRemoveStep,
  onRemoveField,
  onDuplicateField,
  onMoveFieldToStep,
  expanded,
  onToggleExpand,
}: SortableStepCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Make the field list area a droppable zone
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `step-fields-${step.id}`,
    data: { type: "step-fields", stepId: step.id },
  })

  const fieldIds = step.fields.map((f) => f.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelectStep}
      className={`rounded-xl border-2 transition-all cursor-pointer ${
        isDragging
          ? "opacity-90 shadow-lg border-primary bg-white z-40"
          : isSelectedStep
            ? "border-primary/60 bg-primary/[0.02] shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Step header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${isSelectedStep ? "border-primary/10" : "border-gray-100"}`}>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
        >
          <GripVertical className="size-4" />
        </button>

        {/* Expand/collapse */}
        <button
          onClick={onToggleExpand}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {/* Step number */}
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {step.order + 1}
        </div>

        {/* Label */}
        {isEditingLabel ? (
          <input
            autoFocus
            value={step.label}
            onChange={(e) => onUpdateStep({ label: e.target.value })}
            onBlur={() => setIsEditingLabel(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditingLabel(false)
            }}
            className="flex-1 min-w-0 text-sm font-semibold text-black bg-transparent border-none p-0 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingLabel(true)}
            className="flex-1 min-w-0 text-left text-sm font-semibold text-black hover:text-primary transition-colors truncate"
          >
            {step.label}
          </button>
        )}

        {/* Field count */}
        <span className="text-xs text-black/30 shrink-0">
          {step.fields.length} field{step.fields.length !== 1 ? "s" : ""}
        </span>

        {/* Delete */}
        <button
          onClick={onRemoveStep}
          className="shrink-0 flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete step"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 py-3">
          {/* Description */}
          {isEditingDesc ? (
            <input
              autoFocus
              value={step.description || ""}
              onChange={(e) => onUpdateStep({ description: e.target.value })}
              onBlur={() => setIsEditingDesc(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingDesc(false)
              }}
              placeholder="Add a description..."
              className="w-full text-xs text-black/50 bg-transparent border-none p-0 focus:outline-none mb-3"
            />
          ) : (
            <button
              onClick={() => setIsEditingDesc(true)}
              className="w-full text-left text-xs text-black/30 hover:text-black/50 transition-colors mb-3"
            >
              {step.description || "+ Add description"}
            </button>
          )}

          {/* Fields */}
          <div ref={setDroppableRef} className="space-y-1.5 min-h-[40px]">
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              {step.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-xs text-black/30">
                    No fields yet. Click a field type on the left to add one.
                  </p>
                </div>
              ) : (
                step.fields.map((field) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    isSelected={isSelectedFieldId === field.id}
                    steps={allSteps}
                    currentStepId={step.id}
                    onSelect={() => onSelectField(field.id)}
                    onDuplicate={() => onDuplicateField(field.id)}
                    onDelete={() => onRemoveField(field.id)}
                    onMoveToStep={(toStepId) =>
                      onMoveFieldToStep(toStepId, field.id)
                    }
                  />
                ))
              )}
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  )
}
