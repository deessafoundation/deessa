import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"

export interface ValidationError {
  path: string // e.g. "steps[0].fields[2].label"
  message: string
  severity: "error" | "warning"
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

/**
 * Validates a form schema before saving
 */
export function validateFormSchema(schema: FormSchema): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // 1. Check steps exist
  if (schema.steps.length === 0) {
    errors.push({
      path: "steps",
      message: "Form must have at least one step",
      severity: "error",
    })
    return { valid: false, errors, warnings }
  }

  // 2. Check each step has at least one field
  schema.steps.forEach((step, stepIndex) => {
    if (step.fields.length === 0) {
      warnings.push({
        path: `steps[${stepIndex}]`,
        message: `Step "${step.label}" has no fields`,
        severity: "warning",
      })
    }

    // Check step has label
    if (!step.label || step.label.trim() === "") {
      errors.push({
        path: `steps[${stepIndex}].label`,
        message: `Step ${stepIndex + 1} must have a label`,
        severity: "error",
      })
    }
  })

  // 3. Collect all field IDs and check for duplicates
  const fieldIds = new Set<string>()
  const duplicateIds = new Set<string>()

  schema.steps.forEach((step, stepIndex) => {
    step.fields.forEach((field, fieldIndex) => {
      if (fieldIds.has(field.id)) {
        duplicateIds.add(field.id)
        errors.push({
          path: `steps[${stepIndex}].fields[${fieldIndex}].id`,
          message: `Duplicate field ID: "${field.id}"`,
          severity: "error",
        })
      }
      fieldIds.add(field.id)

      // Validate individual field
      const fieldErrors = validateField(field, stepIndex, fieldIndex, schema)
      errors.push(...fieldErrors)
    })
  })

  // 4. Check conditional logic dependencies
  const conditionalErrors = validateConditionalLogic(schema)
  errors.push(...conditionalErrors)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a single field
 */
function validateField(
  field: FormField,
  stepIndex: number,
  fieldIndex: number,
  schema: FormSchema
): ValidationError[] {
  const errors: ValidationError[] = []
  const basePath = `steps[${stepIndex}].fields[${fieldIndex}]`

  // Check field has label
  if (!field.label || field.label.trim() === "") {
    errors.push({
      path: `${basePath}.label`,
      message: "Field must have a label",
      severity: "error",
    })
  }

  // Check fields with options have at least one option
  if (["select", "radio", "checkbox"].includes(field.type)) {
    if (!field.options || field.options.length === 0) {
      errors.push({
        path: `${basePath}.options`,
        message: `Field "${field.label}" must have at least one option`,
        severity: "error",
      })
    } else {
      // Check options have labels
      field.options.forEach((option, optIndex) => {
        if (!option.label || option.label.trim() === "") {
          errors.push({
            path: `${basePath}.options[${optIndex}].label`,
            message: `Option ${optIndex + 1} must have a label`,
            severity: "error",
          })
        }
      })
    }
  }

  // Check checkbox min/max selections are valid
  if (field.type === "checkbox") {
    if (field.minSelections !== undefined && field.maxSelections !== undefined) {
      if (field.minSelections > field.maxSelections) {
        errors.push({
          path: `${basePath}.minSelections`,
          message: "Min selections cannot be greater than max selections",
          severity: "error",
        })
      }
    }

    if (field.maxSelections !== undefined && field.options) {
      if (field.maxSelections > field.options.length) {
        errors.push({
          path: `${basePath}.maxSelections`,
          message: "Max selections cannot exceed number of options",
          severity: "error",
        })
      }
    }
  }

  // Check validation rules
  if (field.validation) {
    if (
      field.validation.minLength !== undefined &&
      field.validation.maxLength !== undefined
    ) {
      if (field.validation.minLength > field.validation.maxLength) {
        errors.push({
          path: `${basePath}.validation.minLength`,
          message: "Min length cannot be greater than max length",
          severity: "error",
        })
      }
    }

    if (field.validation.min !== undefined && field.validation.max !== undefined) {
      if (field.validation.min > field.validation.max) {
        errors.push({
          path: `${basePath}.validation.min`,
          message: "Min value cannot be greater than max value",
          severity: "error",
        })
      }
    }
  }

  return errors
}

/**
 * Validates conditional logic dependencies
 */
function validateConditionalLogic(schema: FormSchema): ValidationError[] {
  const errors: ValidationError[] = []
  const fieldMap = new Map<string, { stepIndex: number; fieldIndex: number }>()

  // Build field map with positions
  schema.steps.forEach((step, stepIndex) => {
    step.fields.forEach((field, fieldIndex) => {
      fieldMap.set(field.id, { stepIndex, fieldIndex })
    })
  })

  // Check each field's conditional logic
  schema.steps.forEach((step, stepIndex) => {
    step.fields.forEach((field, fieldIndex) => {
      if (!field.conditional) return

      const basePath = `steps[${stepIndex}].fields[${fieldIndex}].conditional`

      // Check dependency field exists
      if (!fieldMap.has(field.conditional.dependsOn)) {
        errors.push({
          path: `${basePath}.dependsOn`,
          message: `Field "${field.label}" depends on non-existent field: "${field.conditional.dependsOn}"`,
          severity: "error",
        })
        return
      }

      // Check dependency comes before this field
      const depPosition = fieldMap.get(field.conditional.dependsOn)!
      if (
        depPosition.stepIndex > stepIndex ||
        (depPosition.stepIndex === stepIndex && depPosition.fieldIndex >= fieldIndex)
      ) {
        errors.push({
          path: `${basePath}.dependsOn`,
          message: `Field "${field.label}" can only depend on fields that come before it`,
          severity: "error",
        })
      }

      // Check for circular dependencies
      if (hasCircularDependency(field.id, schema, fieldMap)) {
        errors.push({
          path: `${basePath}.dependsOn`,
          message: `Circular dependency detected for field "${field.label}"`,
          severity: "error",
        })
      }

      // Check value is provided for operators that require one
      const OPERATORS_NEEDING_VALUE = [
        "equals", "notEquals", "contains", "notContains",
        "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual",
      ]
      if (
        OPERATORS_NEEDING_VALUE.includes(field.conditional.operator) &&
        (!field.conditional.value || field.conditional.value.trim() === "")
      ) {
        errors.push({
          path: `${basePath}.value`,
          message: `Field "${field.label}" conditional logic requires a comparison value`,
          severity: "error",
        })
      }

      // Validate nested conditions if present
      if (field.conditional.conditions && field.conditional.conditions.length > 0) {
        field.conditional.conditions.forEach((nestedCond, nestedIndex) => {
          if (!fieldMap.has(nestedCond.dependsOn)) {
            errors.push({
              path: `${basePath}.conditions[${nestedIndex}].dependsOn`,
              message: `Field "${field.label}" nested condition references non-existent field "${nestedCond.dependsOn}"`,
              severity: "error",
            })
          }
          if (
            OPERATORS_NEEDING_VALUE.includes(nestedCond.operator) &&
            (!nestedCond.value || nestedCond.value.trim() === "")
          ) {
            errors.push({
              path: `${basePath}.conditions[${nestedIndex}].value`,
              message: `Field "${field.label}" nested condition requires a comparison value`,
              severity: "error",
            })
          }
        })
      }
    })
  })

  return errors
}

/**
 * Checks for circular dependencies in conditional logic
 */
function hasCircularDependency(
  fieldId: string,
  schema: FormSchema,
  fieldMap: Map<string, { stepIndex: number; fieldIndex: number }>,
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(fieldId)) return true
  visited.add(fieldId)

  const position = fieldMap.get(fieldId)
  if (!position) return false

  const field = schema.steps[position.stepIndex].fields[position.fieldIndex]
  if (!field.conditional) return false

  // Check direct dependency
  if (hasCircularDependency(field.conditional.dependsOn, schema, fieldMap, new Set(visited))) {
    return true
  }

  // Check nested conditions
  if (field.conditional.conditions) {
    for (const nestedCond of field.conditional.conditions) {
      if (hasCircularDependency(nestedCond.dependsOn, schema, fieldMap, new Set(visited))) {
        return true
      }
    }
  }

  return false
}

/**
 * Formats validation errors into a human-readable message
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return ""

  const lines: string[] = []

  if (result.errors.length > 0) {
    lines.push("❌ Errors:")
    result.errors.forEach((error) => {
      lines.push(`  • ${error.message}`)
    })
  }

  if (result.warnings.length > 0) {
    if (lines.length > 0) lines.push("")
    lines.push("⚠️ Warnings:")
    result.warnings.forEach((warning) => {
      lines.push(`  • ${warning.message}`)
    })
  }

  return lines.join("\n")
}
