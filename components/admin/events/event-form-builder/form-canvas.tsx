"use client"

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SortableStepCard } from "./sortable-step-card"
import type { FormStep } from "@/lib/types/conference-form-schema"

interface FormCanvasProps {
  steps: FormStep[]
  selectedFieldId: string | null
  selectedStepId: string | null
  expandedSteps: Set<string>
  onSelectField: (fieldId: string) => void
  onSelectStep: (stepId: string) => void
  onUpdateStep: (stepId: string, updates: Partial<FormStep>) => void
  onRemoveStep: (stepId: string) => void
  onRemoveField: (stepId: string, fieldId: string) => void
  onDuplicateField: (stepId: string, fieldId: string) => void
  onMoveFieldToStep: (fromStepId: string, toStepId: string, fieldId: string) => void
  onToggleExpand: (stepId: string) => void
  onAddStep: () => void
}

export function FormCanvas({
  steps,
  selectedFieldId,
  selectedStepId,
  expandedSteps,
  onSelectField,
  onSelectStep,
  onUpdateStep,
  onRemoveStep,
  onRemoveField,
  onDuplicateField,
  onMoveFieldToStep,
  onToggleExpand,
  onAddStep,
}: FormCanvasProps) {
  const stepIds = steps.map((s) => s.id)
  const allSteps = steps.map((s) => ({ id: s.id, label: s.label }))

  return (
    <div className="space-y-3">
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Plus className="size-6 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-black">No steps yet</p>
          <p className="mt-1 text-sm text-black/40 max-w-xs">
            Your form needs at least one step. Add a step to start building your registration form.
          </p>
          <Button onClick={onAddStep} className="mt-4 gap-2" size="sm">
            <Plus className="size-4" />
            Add Step
          </Button>
        </div>
      ) : (
        <>
          <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {steps.map((step) => (
                <SortableStepCard
                  key={step.id}
                  step={step}
                  isSelectedFieldId={selectedFieldId}
                  isSelectedStep={selectedStepId === step.id}
                  allSteps={allSteps}
                  onSelectField={onSelectField}
                  onSelectStep={() => onSelectStep(step.id)}
                  onUpdateStep={(updates) => onUpdateStep(step.id, updates)}
                  onRemoveStep={() => onRemoveStep(step.id)}
                  onRemoveField={(fieldId) => onRemoveField(step.id, fieldId)}
                  onDuplicateField={(fieldId) => onDuplicateField(step.id, fieldId)}
                  onMoveFieldToStep={(toStepId, fieldId) =>
                    onMoveFieldToStep(step.id, toStepId, fieldId)
                  }
                  expanded={expandedSteps.has(step.id)}
                  onToggleExpand={() => onToggleExpand(step.id)}
                />
              ))}
            </div>
          </SortableContext>

          <button
            onClick={onAddStep}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3 text-sm font-medium text-black/50 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="size-4" />
            Add Step
          </button>
        </>
      )}
    </div>
  )
}
