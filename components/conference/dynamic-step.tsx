"use client"

import { useCallback } from "react"
import { FIELD_REGISTRY, type FieldProps } from "./fields"
import type { FormStep, FormField } from "@/lib/types/conference-form-schema"
import { validateFieldValue } from "@/lib/validation/form-schema"
import { filterVisibleFields } from "@/lib/validation/conditional-engine"

interface DynamicStepProps {
  step: FormStep
  formData: Record<string, unknown>
  errors: Record<string, string>
  onFieldChange: (fieldId: string, value: unknown) => void
  onFieldBlur?: (fieldId: string) => void
  onNext?: () => void
  onBack?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function DynamicStep({
  step,
  formData,
  errors,
  onFieldChange,
  onFieldBlur,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
}: DynamicStepProps) {
  // Validate field on blur
  const handleBlur = useCallback(
    (field: FormField) => {
      if (onFieldBlur) {
        onFieldBlur(field.id)
      }
    },
    [onFieldBlur],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate all visible fields before proceeding
    const visibleFields = filterVisibleFields(step.fields, formData)
    let hasError = false
    for (const field of visibleFields) {
      if (field.type === "heading" || field.type === "paragraph") continue
      const value = formData[field.id]
      const error = validateFieldValue(field, value)
      if (error) {
        hasError = true
        // Report the first error via onFieldBlur
        if (onFieldBlur) onFieldBlur(field.id)
        break
      }
    }
    if (!hasError && onNext) {
      onNext()
    }
  }

  // Filter fields based on conditional logic
  const visibleFields = filterVisibleFields(step.fields, formData)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Section heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{step.label}</h1>
        {step.description && (
          <p className="text-sm text-foreground-muted">{step.description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visibleFields
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            const FieldComponent = FIELD_REGISTRY[field.type]
            if (!FieldComponent) {
              console.warn(`Unknown field type: ${field.type} for field "${field.id}"`)
              return null
            }

            const fieldProps: FieldProps = {
              field,
              value: formData[field.id],
              error: errors[field.id],
              onChange: (val: unknown) => onFieldChange(field.id, val),
              onBlur: () => handleBlur(field),
            }

            const isHalfWidth = field.width === "half"
            const wrapperClass = isHalfWidth ? "md:col-span-1" : "md:col-span-2"

            return (
              <div key={field.id} className={wrapperClass}>
                <FieldComponent {...fieldProps} />
              </div>
            )
          })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back
          </button>
        ) : (
          <span className="invisible">Back</span>
        )}

        {onNext && (
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          >
            {isLast ? "Continue to Review" : "Next Step"}
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
