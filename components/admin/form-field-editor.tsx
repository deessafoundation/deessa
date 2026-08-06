"use client"

import { X, Lock, Plus, Trash2, GripVertical } from "lucide-react"
import type { FormSchema, FormField, FieldOption } from "@/lib/types/conference-form-schema"
import { Button } from "@/components/ui/button"
import { EnhancedConditionalEditor } from "./conference-form-builder/EnhancedConditionalEditor"

interface FormFieldEditorProps {
  field: FormField
  schema: FormSchema
  onSchemaChange: (schema: FormSchema) => void
  onClose: () => void
}

const LOCKED_FIELDS = ["full_name", "email", "consent_terms"]

export function FormFieldEditor({
  field,
  schema,
  onSchemaChange,
  onClose,
}: FormFieldEditorProps) {
  const isLocked = LOCKED_FIELDS.includes(field.id)

  const updateField = (updates: Partial<FormField>) => {
    const updatedSchema = { ...schema }
    
    for (const step of updatedSchema.steps) {
      const fieldIndex = step.fields.findIndex((f) => f.id === field.id)
      if (fieldIndex !== -1) {
        step.fields[fieldIndex] = { ...step.fields[fieldIndex], ...updates }
        break
      }
    }
    
    onSchemaChange(updatedSchema)
  }

  const addOption = () => {
    const newOption: FieldOption = {
      value: `option_${Date.now()}`,
      label: "New Option",
    }
    
    const updatedOptions = [...(field.options || []), newOption]
    updateField({ options: updatedOptions })
  }

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const updatedOptions = [...(field.options || [])]
    updatedOptions[index] = { ...updatedOptions[index], ...updates }
    updateField({ options: updatedOptions })
  }

  const deleteOption = (index: number) => {
    const updatedOptions = (field.options || []).filter((_, i) => i !== index)
    updateField({ options: updatedOptions })
  }

  const hasOptions = ["select", "radio", "checkbox"].includes(field.type)
  const hasMinMax = field.type === "checkbox"

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Field Properties</h3>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {isLocked && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <Lock className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold">Required Field</p>
              <p className="mt-1">This field is required for legal/system reasons and cannot be removed or made optional.</p>
            </div>
          </div>
        )}

        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            disabled={isLocked}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Placeholder (for input fields) */}
        {!["heading", "paragraph", "toggle"].includes(field.type) && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              placeholder="e.g. Enter your name..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Help Text */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Help Text
          </label>
          <textarea
            value={field.helpText || ""}
            onChange={(e) => updateField({ helpText: e.target.value })}
            placeholder="Additional guidance for users..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Required Toggle */}
        {!["heading", "paragraph"].includes(field.type) && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Required</p>
              <p className="text-xs text-muted-foreground">Users must fill this field</p>
            </div>
            <button
              onClick={() => updateField({ required: !field.required })}
              disabled={isLocked && field.required}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.required ? "bg-primary" : "bg-muted-foreground/30"
              } ${isLocked && field.required ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  field.required ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}

        {/* Width Selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Width
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["full", "half"] as const).map((width) => (
              <button
                key={width}
                onClick={() => updateField({ width })}
                className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                  field.width === width
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                {width === "full" ? "Full Width" : "Half Width"}
              </button>
            ))}
          </div>
        </div>

        {/* Options Editor (for select/radio/checkbox) */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">
                Options
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={addOption}
                className="h-7 gap-1.5"
              >
                <Plus className="size-3" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                >
                  <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder="Option label"
                    className="flex-1 rounded border-0 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => deleteOption(index)}
                    className="flex size-7 items-center justify-center rounded text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              
              {(!field.options || field.options.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No options yet. Click Add to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Min/Max Selections (for checkbox) */}
        {hasMinMax && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Min Selections
              </label>
              <input
                type="number"
                min="0"
                value={field.minSelections || ""}
                onChange={(e) => updateField({ minSelections: parseInt(e.target.value) || undefined })}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Max Selections
              </label>
              <input
                type="number"
                min="1"
                value={field.maxSelections || ""}
                onChange={(e) => updateField({ maxSelections: parseInt(e.target.value) || undefined })}
                placeholder="No limit"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Validation Section */}
        {["text", "textarea", "email", "tel", "number"].includes(field.type) && (
          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-xs font-semibold text-foreground mb-3">Validation</h4>
            
            <div className="space-y-3">
              {["text", "textarea", "email", "tel"].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Min Length
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={field.validation?.minLength || ""}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...field.validation,
                            minLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Max Length
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={field.validation?.maxLength || ""}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...field.validation,
                            maxLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {field.type === "number" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Min Value
                    </label>
                    <input
                      type="number"
                      value={field.validation?.min || ""}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...field.validation,
                            min: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Max Value
                    </label>
                    <input
                      type="number"
                      value={field.validation?.max || ""}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...field.validation,
                            max: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conditional Logic */}
        {!["heading", "paragraph"].includes(field.type) && (
          <EnhancedConditionalEditor
            key={field.id}
            field={field}
            allFields={schema.steps.flatMap((s) => s.fields)}
            onChange={(conditional) => updateField({ conditional })}
          />
        )}

        {/* Field Info */}
        <div className="border-t border-border pt-4 mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Field ID:</span>
            <code className="font-mono bg-muted px-2 py-0.5 rounded">{field.id}</code>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="capitalize font-medium">{field.storage}</span>
          </div>
          {field.storage === "core" && field.coreColumn && (
            <div className="flex justify-between">
              <span>Column:</span>
              <code className="font-mono bg-muted px-2 py-0.5 rounded">{field.coreColumn}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
