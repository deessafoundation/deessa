"use client"

import { useState } from "react"
import { Plus, Type, Mail, Phone, Hash, Calendar, ChevronDown, CheckSquare, ToggleLeft, Heading1, FileText, Link2, Upload } from "lucide-react"
import type { FormSchema, FieldType, FormField } from "@/lib/types/conference-form-schema"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
import { FormStepEditor } from "./form-step-editor"

const FIELD_TYPES: Array<{
  type: FieldType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    type: "text",
    label: "Text Input",
    icon: Type,
    description: "Single-line text",
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: FileText,
    description: "Multi-line text",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Email address",
  },
  {
    type: "tel",
    label: "Phone",
    icon: Phone,
    description: "Phone number",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input",
  },
  {
    type: "select",
    label: "Dropdown",
    icon: ChevronDown,
    description: "Single choice",
  },
  {
    type: "radio",
    label: "Radio Buttons",
    icon: CheckSquare,
    description: "Single choice",
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: CheckSquare,
    description: "Multiple choice",
  },
  {
    type: "toggle",
    label: "Toggle",
    icon: ToggleLeft,
    description: "Yes/No switch",
  },
  {
    type: "heading",
    label: "Heading",
    icon: Heading1,
    description: "Section title",
  },
  {
    type: "date",
    label: "Date Picker",
    icon: Calendar,
    description: "Date selection",
  },
  {
    type: "url",
    label: "URL Input",
    icon: Link2,
    description: "Website link",
  },
  {
    type: "file",
    label: "File Upload",
    icon: Upload,
    description: "Document/image upload",
  },
]

interface FormFieldPaletteProps {
  schema: FormSchema
  onSchemaChange: (schema: FormSchema) => void
}

export function FormFieldPalette({ schema, onSchemaChange }: FormFieldPaletteProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    schema.steps.length > 0 ? schema.steps[0].id : null
  )
  const createNewField = (type: FieldType): FormField => {
    const fieldId = `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    
    const baseField: FormField = {
      id: fieldId,
      type,
      label: getDefaultLabel(type),
      required: false,
      storage: "custom",
      order: 0,
      width: "full",
    }

    // Add default options for select/radio/checkbox fields
    if (["select", "radio", "checkbox"].includes(type)) {
      baseField.options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ]
    }

    return baseField
  }

  const getDefaultLabel = (type: FieldType): string => {
    const labels: Record<FieldType, string> = {
      text: "New Text Field",
      textarea: "New Text Area",
      email: "New Email Field",
      tel: "New Phone Field",
      number: "New Number Field",
      select: "New Dropdown",
      radio: "New Radio Group",
      checkbox: "New Checkbox Group",
      toggle: "New Toggle",
      heading: "Section Heading",
      paragraph: "Information Text",
      date: "New Date Field",
      url: "New URL Field",
      file: "New File Upload",
      dateRange: "New Date Range",
      signature: "New Signature",
      rating: "New Rating",
      slider: "New Slider",
      repeating: "New Repeating Section",
      richText: "New Rich Text",
    }
    return labels[type]
  }

  const addFieldToStep = (type: FieldType) => {
    const newField = createNewField(type)
    
    const updatedSchema = { ...schema }
    
    // If no steps exist, create a default one
    if (updatedSchema.steps.length === 0) {
      const newStep = {
        id: "step_1",
        label: "Step 1",
        order: 0,
        fields: [newField],
      }
      updatedSchema.steps = [newStep]
      setSelectedStepId(newStep.id)
    } else {
      // Add to the selected step (or first step if none selected)
      const targetStepId = selectedStepId || updatedSchema.steps[0].id
      const stepIndex = updatedSchema.steps.findIndex((s) => s.id === targetStepId)
      
      if (stepIndex !== -1) {
        const step = { ...updatedSchema.steps[stepIndex] }
        step.fields = [...step.fields, newField]
        updatedSchema.steps[stepIndex] = step
      }
    }

    onSchemaChange(updatedSchema)
  }

  // Update selected step when steps change
  const effectiveSelectedStepId =
    selectedStepId && schema.steps.some((s) => s.id === selectedStepId)
      ? selectedStepId
      : schema.steps.length > 0
      ? schema.steps[0].id
      : null

  if (effectiveSelectedStepId !== selectedStepId) {
    setSelectedStepId(effectiveSelectedStepId)
  }

  return (
    <div className="space-y-4">
      {/* Step Management */}
      <FormStepEditor schema={schema} onSchemaChange={onSchemaChange} />

      {/* Target Step Selector */}
      {schema.steps.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Add fields to:
          </label>
          <FancySelect
            value={selectedStepId || ""}
            onValueChange={(val) => setSelectedStepId(val)}
            options={schema.steps.map((step, index) => ({ value: step.id, label: `${index + 1}. ${step.label}` }))}
            size="sm"
          />
        </div>
      )}

      {/* Field Types */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Field Types</h3>
          <p className="text-xs text-muted-foreground">
            {schema.steps.length > 0
              ? `Click to add to ${
                  schema.steps.find((s) => s.id === selectedStepId)?.label || "selected step"
                }`
              : "Create a step first to add fields"}
          </p>
        </div>

        <div className="p-3 space-y-2">
          {FIELD_TYPES.map((fieldType) => {
            const Icon = fieldType.icon
            const disabled = schema.steps.length === 0
            return (
              <button
                key={fieldType.type}
                onClick={() => !disabled && addFieldToStep(fieldType.type)}
                disabled={disabled}
                className={`w-full flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-all ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                }`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {fieldType.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fieldType.description}
                  </div>
                </div>
                <Plus className="size-4 shrink-0 text-muted-foreground" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
