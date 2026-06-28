"use client"

import { Info, X } from "lucide-react"
import { FancySelect } from "@/components/ui/fancy-select"
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"

interface FormConditionalEditorProps {
  field: FormField
  schema: FormSchema
  onUpdate: (updates: Partial<FormField>) => void
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not Equals" },
  { value: "isEmpty", label: "Is Empty" },
  { value: "isNotEmpty", label: "Is Not Empty" },
] as const

export function FormConditionalEditor({
  field,
  schema,
  onUpdate,
}: FormConditionalEditorProps) {
  // Get all fields that come before this field (can only depend on earlier fields)
  const getAvailableDependencyFields = (): FormField[] => {
    const availableFields: FormField[] = []
    let foundCurrentField = false

    for (const step of schema.steps) {
      if (foundCurrentField) break

      for (const f of step.fields) {
        if (f.id === field.id) {
          foundCurrentField = true
          break
        }
        // Only non-display fields can be dependencies
        if (!["heading", "paragraph"].includes(f.type)) {
          availableFields.push(f)
        }
      }
    }

    return availableFields
  }

  const availableFields = getAvailableDependencyFields()

  const enableConditional = () => {
    if (availableFields.length === 0) {
      alert("No fields available to create a dependency. Add fields before this one first.")
      return
    }

    onUpdate({
      conditional: {
        dependsOn: availableFields[0].id,
        operator: "equals",
        value: "",
      },
    })
  }

  const disableConditional = () => {
    onUpdate({ conditional: undefined })
  }

  const updateConditional = (updates: Partial<NonNullable<FormField["conditional"]>>) => {
    if (!field.conditional) return

    onUpdate({
      conditional: {
        ...field.conditional,
        ...updates,
      },
    })
  }

  const getDependentField = () => {
    if (!field.conditional) return null
    return availableFields.find((f) => f.id === field.conditional?.dependsOn)
  }

  const dependentField = getDependentField()
  const needsValue = field.conditional && ["equals", "notEquals"].includes(field.conditional.operator)

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-foreground">Conditional Logic</h4>
        {field.conditional ? (
          <button
            onClick={disableConditional}
            className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            Disable
          </button>
        ) : (
          <button
            onClick={enableConditional}
            disabled={availableFields.length === 0}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enable
          </button>
        )}
      </div>

      {availableFields.length === 0 && !field.conditional && (
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <Info className="size-3.5 inline mr-1" />
          No fields available. Add fields before this one to create conditional logic.
        </div>
      )}

      {field.conditional ? (
        <div className="space-y-3">
          {/* Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
            <Info className="size-3.5 inline mr-1" />
            This field will only show when the condition below is met.
          </div>

          {/* Depends On */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Show when field:
            </label>
            <FancySelect
              value={field.conditional.dependsOn}
              onValueChange={(val) => updateConditional({ dependsOn: val })}
              options={availableFields.map((f) => ({ value: f.id, label: f.label }))}
              size="sm"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Condition:
            </label>
            <FancySelect
              value={field.conditional.operator}
              onValueChange={(val) =>
                updateConditional({
                  operator: val as any,
                  value: ["isEmpty", "isNotEmpty"].includes(val) ? "" : field.conditional!.value,
                })
              }
              options={OPERATORS.map((op) => ({ value: op.value, label: op.label }))}
              size="sm"
            />
          </div>

          {/* Value (for equals/notEquals) */}
          {needsValue && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Value:
              </label>
              
              {/* If dependency field has options, show dropdown */}
              {dependentField?.options && dependentField.options.length > 0 ? (
                <FancySelect
                  value={field.conditional.value}
                  onValueChange={(val) => updateConditional({ value: val })}
                  options={[{ value: "", label: "-- Select value --" }, ...dependentField.options.map((opt) => ({ value: opt.value, label: opt.label }))]}
                  size="sm"
                />
              ) : (
                <input
                  type="text"
                  value={field.conditional.value}
                  onChange={(e) => updateConditional({ value: e.target.value })}
                  placeholder="Enter comparison value"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg bg-muted p-3 text-xs">
            <p className="font-medium text-foreground mb-1">Summary:</p>
            <p className="text-muted-foreground">
              Show "<strong>{field.label}</strong>" when "
              <strong>{dependentField?.label || "Unknown Field"}</strong>"{" "}
              <strong>{OPERATORS.find((op) => op.value === field.conditional!.operator)?.label.toLowerCase()}</strong>
              {needsValue && field.conditional.value && (
                <>
                  {" "}
                  "<strong>{field.conditional.value}</strong>"
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        availableFields.length > 0 && (
          <div className="rounded-lg border-2 border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No conditional logic set
            </p>
            <p className="text-xs text-muted-foreground">
              Click "Enable" to show this field only when certain conditions are met
            </p>
          </div>
        )
      )}
    </div>
  )
}
