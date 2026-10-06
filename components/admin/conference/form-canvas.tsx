"use client"

import { GripVertical, Trash2, Lock, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react"
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"
import { Button } from "@/components/ui/button"

interface FormCanvasProps {
  schema: FormSchema
  selectedFieldId: string | null
  onSchemaChange: (schema: FormSchema) => void
  onFieldSelect: (fieldId: string | null) => void
}

const LOCKED_FIELDS = ["full_name", "email", "consent_terms"]

export function FormCanvas({
  schema,
  selectedFieldId,
  onSchemaChange,
  onFieldSelect,
}: FormCanvasProps) {
  const isLockedField = (fieldId: string) => LOCKED_FIELDS.includes(fieldId)

  const moveField = (stepId: string, fieldId: string, direction: "up" | "down") => {
    const updatedSchema = { ...schema }
    const stepIndex = updatedSchema.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const step = { ...updatedSchema.steps[stepIndex] }
    const fieldIndex = step.fields.findIndex((f) => f.id === fieldId)
    if (fieldIndex === -1) return

    const newIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1
    if (newIndex < 0 || newIndex >= step.fields.length) return

    const fields = [...step.fields]
    ;[fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]]
    
    step.fields = fields
    updatedSchema.steps[stepIndex] = step
    onSchemaChange(updatedSchema)
  }

  const deleteField = (stepId: string, fieldId: string) => {
    if (isLockedField(fieldId)) {
      alert("This field is required and cannot be deleted.")
      return
    }

    if (!confirm("Are you sure you want to delete this field?")) return

    const updatedSchema = { ...schema }
    const stepIndex = updatedSchema.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const step = { ...updatedSchema.steps[stepIndex] }
    step.fields = step.fields.filter((f) => f.id !== fieldId)
    
    updatedSchema.steps[stepIndex] = step
    onSchemaChange(updatedSchema)

    if (selectedFieldId === fieldId) {
      onFieldSelect(null)
    }
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
      case "textarea":
        return "T"
      case "email":
        return "@"
      case "tel":
        return "📞"
      case "number":
        return "#"
      case "select":
        return "▼"
      case "radio":
        return "◯"
      case "checkbox":
        return "☑"
      case "toggle":
        return "⚡"
      case "heading":
        return "H"
      default:
        return "?"
    }
  }

  return (
    <div className="space-y-6">
      {schema.steps.map((step, stepIndex) => (
        <div key={step.id} className="rounded-xl border border-border bg-card">
          {/* Step Header */}
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.label}
                </h3>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {stepIndex + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="p-4 space-y-2">
            {step.fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm font-medium text-muted-foreground">
                  No fields yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add fields from the left panel
                </p>
              </div>
            ) : (
              step.fields.map((field, fieldIndex) => (
                <div
                  key={field.id}
                  onClick={() => onFieldSelect(field.id)}
                  className={`group relative rounded-lg border-2 p-3 transition-all cursor-pointer ${
                    selectedFieldId === field.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Field Type Icon */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-mono font-bold text-muted-foreground">
                      {getFieldIcon(field.type)}
                    </div>

                    {/* Field Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-xs font-semibold text-red-500">*</span>
                        )}
                        {isLockedField(field.id) && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                        {field.storage === "core" && field.id !== "full_name" && field.id !== "email" && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{field.type}</span>
                        {field.placeholder && (
                          <>
                            <span>•</span>
                            <span className="truncate">{field.placeholder}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(step.id, field.id, "up")
                        }}
                        disabled={fieldIndex === 0}
                        className="flex size-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(step.id, field.id, "down")
                        }}
                        disabled={fieldIndex === step.fields.length - 1}
                        className="flex size-7 items-center justify-center rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      {!isLockedField(field.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(step.id, field.id)
                          }}
                          className="flex size-7 items-center justify-center rounded text-red-500 hover:bg-red-50"
                          title="Delete field"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Width indicator */}
                  {field.width === "half" && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        Half width
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {schema.steps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-lg font-medium text-foreground">No steps yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add fields from the left panel to create your first step
          </p>
        </div>
      )}
    </div>
  )
}
