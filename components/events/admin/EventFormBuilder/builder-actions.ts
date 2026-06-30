import type { FormSchema, FormStep, FormField, FieldType } from "@/lib/types/conference-form-schema"

// ── ID Generator ──────────────────────────────────────────────────────────────
export function generateId(prefix = "field"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ── Default labels for field types ─────────────────────────────────────────────
const DEFAULT_LABELS: Record<FieldType, string> = {
  text: "Text Field",
  textarea: "Text Area",
  email: "Email Address",
  tel: "Phone Number",
  number: "Number",
  select: "Dropdown",
  radio: "Radio Group",
  checkbox: "Checkbox Group",
  toggle: "Toggle",
  heading: "Section Heading",
  paragraph: "Paragraph",
  date: "Date",
  url: "URL",
  file: "File Upload",
  dateRange: "Date Range",
  signature: "Signature",
  rating: "Rating",
  slider: "Slider",
  repeating: "Repeating Section",
  richText: "Rich Text",
}

// ── Create a new field ─────────────────────────────────────────────────────────
export function createField(type: FieldType, order: number): FormField {
  return {
    id: generateId(),
    type,
    label: DEFAULT_LABELS[type] || "New Field",
    required: false,
    storage: "custom",
    order,
    ...(type === "heading" || type === "paragraph" ? {} : {}),
    ...(type === "select" || type === "radio" || type === "checkbox"
      ? { options: [{ value: "option_1", label: "Option 1" }] }
      : {}),
  }
}

// ── Create a new step ──────────────────────────────────────────────────────────
export function createStep(order: number): FormStep {
  return {
    id: generateId("step"),
    label: `Step ${order + 1}`,
    description: "",
    order,
    fields: [],
  }
}

// ── Duplicate a field ──────────────────────────────────────────────────────────
export function duplicateField(field: FormField, newOrder: number): FormField {
  return {
    ...field,
    id: generateId(),
    label: `${field.label} (copy)`,
    order: newOrder,
    options: field.options
      ? field.options.map((o) => ({ ...o }))
      : undefined,
    conditional: undefined, // Don't copy conditional logic
  }
}

// ── Add field to step ──────────────────────────────────────────────────────────
export function addFieldToStep(schema: FormSchema, stepId: string, type: FieldType): FormSchema {
  const step = schema.steps.find((s) => s.id === stepId)
  if (!step) return schema

  const newField = createField(type, step.fields.length)

  return {
    ...schema,
    steps: schema.steps.map((s) =>
      s.id === stepId ? { ...s, fields: [...s.fields, newField] } : s
    ),
  }
}

// ── Remove field from step ─────────────────────────────────────────────────────
export function removeFieldFromStep(schema: FormSchema, stepId: string, fieldId: string): FormSchema {
  return {
    ...schema,
    steps: schema.steps.map((s) =>
      s.id === stepId
        ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
        : s
    ),
  }
}

// ── Update field ───────────────────────────────────────────────────────────────
export function updateFieldInSchema(
  schema: FormSchema,
  stepId: string,
  fieldId: string,
  updates: Partial<FormField>
): FormSchema {
  return {
    ...schema,
    steps: schema.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            fields: s.fields.map((f) =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          }
        : s
    ),
  }
}

// ── Reorder fields within a step (after DnD) ──────────────────────────────────
export function reorderFieldsInStep(
  schema: FormSchema,
  stepId: string,
  oldIndex: number,
  newIndex: number
): FormSchema {
  return {
    ...schema,
    steps: schema.steps.map((s) => {
      if (s.id !== stepId) return s
      const fields = [...s.fields]
      const [moved] = fields.splice(oldIndex, 1)
      fields.splice(newIndex, 0, moved)
      return { ...s, fields: fields.map((f, i) => ({ ...f, order: i })) }
    }),
  }
}

// ── Move field to a different step ─────────────────────────────────────────────
export function moveFieldToStep(
  schema: FormSchema,
  fromStepId: string,
  toStepId: string,
  fieldId: string,
  newIndex?: number
): FormSchema {
  const fromStep = schema.steps.find((s) => s.id === fromStepId)
  const toStep = schema.steps.find((s) => s.id === toStepId)
  if (!fromStep || !toStep) return schema

  const field = fromStep.fields.find((f) => f.id === fieldId)
  if (!field) return schema

  const insertAt = newIndex ?? toStep.fields.length

  return {
    ...schema,
    steps: schema.steps.map((s) => {
      if (s.id === fromStepId) {
        return {
          ...s,
          fields: s.fields
            .filter((f) => f.id !== fieldId)
            .map((f, i) => ({ ...f, order: i })),
        }
      }
      if (s.id === toStepId) {
        const newFields = [...s.fields]
        newFields.splice(insertAt, 0, { ...field, order: insertAt })
        return { ...s, fields: newFields.map((f, i) => ({ ...f, order: i })) }
      }
      return s
    }),
  }
}

// ── Reorder steps (after DnD) ─────────────────────────────────────────────────
export function reorderSteps(schema: FormSchema, oldIndex: number, newIndex: number): FormSchema {
  const steps = [...schema.steps]
  const [moved] = steps.splice(oldIndex, 1)
  steps.splice(newIndex, 0, moved)
  return { ...schema, steps: steps.map((s, i) => ({ ...s, order: i })) }
}

// ── Add step ──────────────────────────────────────────────────────────────────
export function addStep(schema: FormSchema): FormSchema {
  const newStep = createStep(schema.steps.length)
  return { ...schema, steps: [...schema.steps, newStep] }
}

// ── Remove step ───────────────────────────────────────────────────────────────
export function removeStep(schema: FormSchema, stepId: string): FormSchema {
  return {
    ...schema,
    steps: schema.steps
      .filter((s) => s.id !== stepId)
      .map((s, i) => ({ ...s, order: i })),
  }
}

// ── Update step ───────────────────────────────────────────────────────────────
export function updateStepInSchema(
  schema: FormSchema,
  stepId: string,
  updates: Partial<FormStep>
): FormSchema {
  return {
    ...schema,
    steps: schema.steps.map((s) =>
      s.id === stepId ? { ...s, ...updates } : s
    ),
  }
}

// ── Find which step a field belongs to ─────────────────────────────────────────
export function findFieldStep(schema: FormSchema, fieldId: string): FormStep | undefined {
  return schema.steps.find((s) => s.fields.some((f) => f.id === fieldId))
}

// ── Find a field by ID ─────────────────────────────────────────────────────────
export function findField(schema: FormSchema, fieldId: string): FormField | undefined {
  for (const step of schema.steps) {
    const field = step.fields.find((f) => f.id === fieldId)
    if (field) return field
  }
  return undefined
}

// ── Count total fields ─────────────────────────────────────────────────────────
export function countFields(schema: FormSchema): number {
  return schema.steps.reduce((sum, s) => sum + s.fields.length, 0)
}
