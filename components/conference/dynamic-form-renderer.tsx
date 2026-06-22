"use client"

import { useState, useCallback } from "react"
import { StepProgressBar } from "./step-progress-bar"
import { DynamicStep } from "./dynamic-step"
import { validateFieldValue } from "@/lib/validation/form-schema"
import type { FormSchema, FormStep } from "@/lib/types/conference-form-schema"

interface DynamicFormRendererProps {
  schema: FormSchema
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function DynamicFormRenderer({ schema, onSubmit }: DynamicFormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps: FormStep[] = schema?.steps ?? []
  const totalSteps = steps.length
  const isFirst = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const stepLabels = steps.map((s) => s.label)

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error for this field when value changes
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleFieldBlur = useCallback((fieldId: string) => {
    // Find the field definition and validate
    for (const step of steps) {
      const field = step.fields.find((f) => f.id === fieldId)
      if (field) {
        const value = formData[fieldId]
        const error = validateFieldValue(field, value)
        setErrors((prev) => {
          if (error) return { ...prev, [fieldId]: error }
          const next = { ...prev }
          delete next[fieldId]
          return next
        })
        return
      }
    }
  }, [steps, formData])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Submit the form
      setIsSubmitting(true)
      onSubmit(formData).finally(() => setIsSubmitting(false))
    } else {
      setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
    }
  }, [isLastStep, totalSteps, formData, onSubmit])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">No form steps configured</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please add steps and fields to the form
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <StepProgressBar
        step={currentStep + 1}
        total={totalSteps}
        label={stepLabels[currentStep] ?? ""}
      />

      {/* Current Step */}
      {steps[currentStep] && (
        <DynamicStep
          step={steps[currentStep]}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
          onNext={handleNext}
          onBack={currentStep > 0 ? handleBack : undefined}
          isFirst={isFirst}
          isLast={isLastStep}
        />
      )}
    </div>
  )
}
