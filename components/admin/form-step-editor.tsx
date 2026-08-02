"use client"

import { Plus, ChevronUp, ChevronDown, Trash2, Edit2, Check, X } from "lucide-react"
import { useState } from "react"
import type { FormSchema, FormStep, FieldConditional } from "@/lib/types/conference-form-schema"
import { Button } from "@/components/ui/button"
import { EnhancedConditionalEditor } from "./conference-form-builder/EnhancedConditionalEditor"

interface FormStepEditorProps {
  schema: FormSchema
  onSchemaChange: (schema: FormSchema) => void
}

export function FormStepEditor({ schema, onSchemaChange }: FormStepEditorProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editConditional, setEditConditional] = useState<FieldConditional | undefined>(undefined)

  const addStep = () => {
    const newStep: FormStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      label: `Step ${schema.steps.length + 1}`,
      description: "",
      order: schema.steps.length,
      fields: [],
    }

    const updatedSchema = {
      ...schema,
      steps: [...schema.steps, newStep],
    }

    onSchemaChange(updatedSchema)
  }

  const startEditing = (step: FormStep) => {
    setEditingStepId(step.id)
    setEditLabel(step.label)
    setEditDescription(step.description || "")
    setEditConditional(step.conditional)
  }

  const saveEdit = () => {
    if (!editingStepId) return

    const updatedSchema = { ...schema }
    const stepIndex = updatedSchema.steps.findIndex((s) => s.id === editingStepId)
    
    if (stepIndex !== -1) {
      updatedSchema.steps[stepIndex] = {
        ...updatedSchema.steps[stepIndex],
        label: editLabel,
        description: editDescription,
        conditional: editConditional,
      }
      onSchemaChange(updatedSchema)
    }

    setEditingStepId(null)
  }

  const cancelEdit = () => {
    setEditingStepId(null)
    setEditLabel("")
    setEditDescription("")
    setEditConditional(undefined)
  }

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const stepIndex = schema.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const newIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1
    if (newIndex < 0 || newIndex >= schema.steps.length) return

    const updatedSteps = [...schema.steps]
    ;[updatedSteps[stepIndex], updatedSteps[newIndex]] = [
      updatedSteps[newIndex],
      updatedSteps[stepIndex],
    ]

    // Update order property
    updatedSteps.forEach((step, index) => {
      step.order = index
    })

    onSchemaChange({ ...schema, steps: updatedSteps })
  }

  const deleteStep = (stepId: string) => {
    const step = schema.steps.find((s) => s.id === stepId)
    if (!step) return

    const fieldCount = step.fields.length
    const message =
      fieldCount > 0
        ? `Are you sure you want to delete this step? It contains ${fieldCount} field${fieldCount !== 1 ? "s" : ""} that will be permanently removed.`
        : "Are you sure you want to delete this step?"

    if (!confirm(message)) return

    const updatedSteps = schema.steps
      .filter((s) => s.id !== stepId)
      .map((step, index) => ({ ...step, order: index }))

    onSchemaChange({ ...schema, steps: updatedSteps })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Form Steps</h3>
            <p className="text-xs text-muted-foreground">
              Organize your form into multiple pages
            </p>
          </div>
          <Button size="sm" onClick={addStep} className="gap-1.5">
            <Plus className="size-3.5" />
            Add Step
          </Button>
        </div>

        <div className="p-3 space-y-2">
          {schema.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-muted-foreground">
                No steps yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Step" to create one
              </p>
            </div>
          ) : (
            schema.steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-lg border border-border bg-background"
              >
                {editingStepId === step.id ? (
                  // Edit Mode
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Step Label
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="e.g. Personal Details"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="e.g. Please provide your contact information"
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    {/* Step Conditional Logic */}
                    <EnhancedConditionalEditor
                      key={`step-${step.id}`}
                      field={{
                        id: step.id,
                        type: "heading" as const,
                        label: step.label,
                        order: 0,
                        storage: "custom" as const,
                        required: false,
                        conditional: editConditional,
                      }}
                      allFields={schema.steps.flatMap((s) => s.fields)}
                      onChange={(conditional) => {
                        setEditConditional(conditional)
                      }}
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="size-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                      >
                        <Check className="size-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Step Number */}
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {step.label}
                          {step.conditional && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              Conditional
                            </span>
                          )}
                        </div>
                        {step.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {step.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.fields.length} field{step.fields.length !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => startEditing(step)}
                          className="flex size-7 items-center justify-center rounded hover:bg-muted transition-colors"
                          title="Edit step"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => moveStep(step.id, "up")}
                          disabled={index === 0}
                          className="flex size-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          onClick={() => moveStep(step.id, "down")}
                          disabled={index === schema.steps.length - 1}
                          className="flex size-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="flex size-7 items-center justify-center rounded text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete step"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
