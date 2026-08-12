// ── Zod Validation Schemas for Dynamic Form Fields ──────────────────────────
// Validates a single field value or an entire step's data against the schema.

import { z } from "zod"
import type { FormField, FieldOption } from "@/lib/types/conference-form-schema"

// ── Validate a single field value ─────────────────────────────────────────────
// Returns an error message string if invalid, or null if valid.

export function validateFieldValue(
  field: FormField,
  value: unknown,
): string | null {
  try {
    switch (field.type) {
      case "text":
      case "textarea": {
        const strVal = String(value ?? "")
        if (field.required && strVal.trim().length === 0) {
          return `${field.label} is required.`
        }
        if (strVal.length > 0 && field.validation?.minLength != null && strVal.length < field.validation.minLength) {
          return `${field.label} must be at least ${field.validation.minLength} characters.`
        }
        if (field.validation?.maxLength != null && strVal.length > field.validation.maxLength) {
          return `${field.label} must be at most ${field.validation.maxLength} characters.`
        }
        if (field.validation?.pattern && strVal.length > 0) {
          const re = new RegExp(field.validation.pattern)
          if (!re.test(strVal)) {
            return field.validation.patternMessage ?? `${field.label} has an invalid format.`
          }
        }
        return null
      }

      case "email": {
        const strVal = String(value ?? "").trim()
        if (field.required && strVal.length === 0) {
          return `${field.label} is required.`
        }
        if (strVal.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(strVal)) {
            return "Please enter a valid email address."
          }
        }
        return null
      }

      case "tel": {
        const strVal = String(value ?? "").trim()
        if (field.required && strVal.length === 0) {
          return `${field.label} is required.`
        }
        return null
      }

      case "number": {
        if (value == null || value === "") {
          if (field.required) return `${field.label} is required.`
          return null
        }
        const num = Number(value)
        if (isNaN(num)) return `${field.label} must be a valid number.`
        if (field.validation?.min != null && num < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min}.`
        }
        if (field.validation?.max != null && num > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max}.`
        }
        return null
      }

      case "select": {
        const strVal = String(value ?? "")
        const validValues = (field.options ?? []).map((o) => o.value)
        if (field.required) {
          if (!strVal || strVal.length === 0) return `Please select a ${field.label}.`
        }
        // Always validate that value is in options list when non-empty
        if (strVal && !validValues.includes(strVal)) return `Invalid selection for ${field.label}.`
        return null
      }

      case "radio": {
        const strVal = String(value ?? "")
        const validValues = (field.options ?? []).map((o) => o.value)
        if (field.required && !strVal) {
          return `Please select a ${field.label}.`
        }
        // Always validate that value is in options list when non-empty
        if (strVal && !validValues.includes(strVal)) return `Invalid selection for ${field.label}.`
        return null
      }

      case "checkbox": {
        const arr = Array.isArray(value) ? value : []
        if (field.required && arr.length === 0) {
          return `Please select at least one ${field.label}.`
        }
        if (field.minSelections != null && arr.length < field.minSelections) {
          return `Please select at least ${field.minSelections} ${field.label} options.`
        }
        if (field.maxSelections != null && arr.length > field.maxSelections) {
          return `You can select at most ${field.maxSelections} ${field.label} options.`
        }
        return null
      }

      case "toggle": {
        if (field.required && value !== true) {
          return `${field.label} is required to continue.`
        }
        return null
      }

      case "heading":
      case "paragraph": {
        return null
      }

      case "date": {
        const strVal = String(value ?? "")
        if (field.required && strVal.trim().length === 0) {
          return `${field.label} is required.`
        }
        if (strVal.length > 0 && isNaN(Date.parse(strVal))) {
          return `${field.label} must be a valid date.`
        }
        return null
      }

      case "dateRange": {
        const range = value as { start: string; end: string } | null
        if (field.required && (!range || !range.start || !range.end)) {
          return `${field.label} requires both start and end dates.`
        }
        if (range?.start && range?.end) {
          if (isNaN(Date.parse(range.start)) || isNaN(Date.parse(range.end))) {
            return `${field.label} contains invalid dates.`
          }
          if (new Date(range.start) > new Date(range.end)) {
            return `${field.label} end date must be after start date.`
          }
        }
        return null
      }

      case "url": {
        const strVal = String(value ?? "").trim()
        if (field.required && strVal.length === 0) {
          return `${field.label} is required.`
        }
        if (strVal.length > 0) {
          try {
            new URL(strVal)
          } catch {
            return `${field.label} must be a valid URL.`
          }
        }
        return null
      }

      case "file": {
        if (field.required) {
          if (Array.isArray(value) && value.length === 0) return `${field.label} is required.`
          if (!value || value === "") return `${field.label} is required.`
        }
        return null
      }

      case "signature": {
        const strVal = String(value ?? "")
        if (field.required && strVal.length === 0) {
          return `${field.label} is required.`
        }
        return null
      }

      case "rating": {
        if (field.required && (value == null || value === null)) {
          return `${field.label} is required.`
        }
        return null
      }

      case "slider": {
        if (field.required && (value == null || value === "")) {
          return `${field.label} is required.`
        }
        return null
      }

      case "repeating": {
        const arr = Array.isArray(value) ? value : []
        if (field.required && arr.length === 0) {
          return `${field.label} requires at least one entry.`
        }
        if (field.repeatingConfig?.minRows && arr.length < field.repeatingConfig.minRows) {
          return `${field.label} requires at least ${field.repeatingConfig.minRows} entries.`
        }
        return null
      }

      case "richText": {
        const strVal = String(value ?? "").replace(/<[^>]*>/g, "").trim()
        if (field.required && strVal.length === 0) {
          return `${field.label} is required.`
        }
        return null
      }

      default: {
        return null
      }
    }
  } catch {
    return `Invalid value for ${field.label}.`
  }
}

// ── Validate all fields in a step ─────────────────────────────────────────────
// Returns a map of field ID → error message. Empty object means all valid.

export function validateStepFields(
  fields: FormField[],
  data: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    // Skip display-only fields
    if (field.type === "heading" || field.type === "paragraph") continue

    const value = data[field.id]
    const error = validateFieldValue(field, value)
    if (error) {
      errors[field.id] = error
    }
  }

  return errors
}

// ── Build the label from options for display ─────────────────────────────────
export function getOptionLabel(options: FieldOption[] | undefined, value: string): string {
  if (!options) return value
  const opt = options.find((o) => o.value === value)
  return opt?.label ?? value
}
