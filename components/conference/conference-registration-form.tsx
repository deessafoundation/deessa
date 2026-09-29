"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { StepProgressBar } from "./step-progress-bar"
import { DynamicStep } from "./dynamic-step"
import { Step4Review } from "./step4-review"
import { registerForConference } from "@/lib/actions/conference-registration"
import { validateFieldValue } from "@/lib/validation/form-schema"
import { filterVisibleSteps } from "@/lib/validation/conditional-engine"
import type { FormSchema, FormStep } from "@/lib/types/conference-form-schema"

interface ConferenceRegistrationFormProps {
  schema: FormSchema | null
}

export function ConferenceRegistrationForm({ schema }: ConferenceRegistrationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // If no schema, use an empty one (fallback — shouldn't happen after seed)
  const allSteps: FormStep[] = schema?.steps ?? []
  // Filter steps based on conditional logic
  const steps = useMemo(() => filterVisibleSteps(allSteps, formData), [allSteps, formData])
  const totalSteps = steps.length + 1 // +1 for the review/consent step
  const isFirst = currentStep === 0
  const isLastFormStep = currentStep === steps.length - 1
  const isReviewStep = currentStep === steps.length

  const stepLabels = [
    ...steps.map((s) => s.label),
    "Review & Submit",
  ]

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
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [totalSteps])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const handleEdit = useCallback((step: number) => {
    // Convert 1-based step param to 0-based
    setCurrentStep(step - 1)
  }, [])

  const handleSubmit = async (consent: { consentTerms: boolean; consentNewsletter: boolean }) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await registerForConference({
        fullName: String(formData.full_name ?? ""),
        email: String(formData.email ?? ""),
        phone: String(formData.phone ?? ""),
        organization: String(formData.organization ?? ""),
        role: String(formData.role ?? ""),
        attendanceMode: String(formData.attendance_mode ?? ""),
        workshops: Array.isArray(formData.workshops) ? formData.workshops : [],
        dietaryPreference: String(formData.dietary_preference ?? ""),
        tshirtSize: String(formData.tshirt_size ?? ""),
        heardVia: Array.isArray(formData.heard_via) ? formData.heard_via : [],
        emergencyContactName: String(formData.emergency_contact_name ?? ""),
        emergencyContactPhone: String(formData.emergency_contact_phone ?? ""),
        ...consent,
        // Dynamic fields — everything not in core goes into customFields
        customFields: extractCustomFields(formData),
        formSchemaVersion: schema?.version ?? 1,
      })

      if (result.success && result.registrationId) {
        if (result.paymentRequired) {
          const params = new URLSearchParams({
            rid: result.registrationId,
            email: String(formData.email ?? ""),
            name: String(formData.full_name ?? ""),
            amount: String(result.paymentAmount ?? ""),
            currency: result.paymentCurrency ?? "NPR",
            expiryHours: String(result.expiryHours ?? 24),
          })
          router.push(`/conference/register/payment-options?${params.toString()}`)
        } else {
          router.push(
            `/conference/register/success?id=${result.registrationId}&name=${encodeURIComponent(String(formData.full_name ?? ""))}&email=${encodeURIComponent(String(formData.email ?? ""))}`
          )
        }
      } else {
        setSubmitError(result.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-8 sm:px-6">
        {/* Logo row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              D
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">deessa Foundation</span>
          </div>
          <a
            href="/conference"
            className="flex items-center gap-1 text-sm font-semibold text-foreground-muted transition-colors hover:text-primary"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Conference
          </a>
        </div>

        {/* Progress */}
        <StepProgressBar
          step={currentStep + 1}
          total={totalSteps}
          label={stepLabels[currentStep] ?? ""}
        />
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Decorative blob */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 p-8 sm:p-10">
            {steps.length > 0 && currentStep < steps.length && (
              <DynamicStep
                step={steps[currentStep]}
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
                onNext={isLastFormStep ? () => handleNext() : handleNext}
                onBack={currentStep > 0 ? handleBack : undefined}
                isFirst={isFirst}
                isLast={isLastFormStep}
              />
            )}

            {isReviewStep && (
              <Step4Review
                data={buildReviewData(formData, steps)}
                onEdit={handleEdit}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                error={submitError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractCustomFields(data: Record<string, unknown>): Record<string, unknown> {
  const coreFieldIds = [
    "full_name", "email", "phone", "organization",
    "role", "attendance_mode", "workshops",
    "dietary_preference", "tshirt_size", "heard_via",
    "emergency_contact_name", "emergency_contact_phone",
    "consent_terms", "consent_newsletter",
  ] as const

  const custom: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (!(coreFieldIds as readonly string[]).includes(key)) {
      custom[key] = value
    }
  }
  return custom
}

function buildReviewData(
  formData: Record<string, unknown>,
  steps: FormStep[],
): {
  step1: { fullName: string; email: string; phone: string; organization: string }
  step2: { role: string; attendanceMode: string; workshops: string[] }
  step3: { dietaryPreference: string; tshirtSize: string; heardVia: string[]; emergencyContactName: string; emergencyContactPhone: string }
} {
  return {
    step1: {
      fullName: String(formData.full_name ?? ""),
      email: String(formData.email ?? ""),
      phone: String(formData.phone ?? ""),
      organization: String(formData.organization ?? ""),
    },
    step2: {
      role: String(formData.role ?? ""),
      attendanceMode: String(formData.attendance_mode ?? ""),
      workshops: Array.isArray(formData.workshops) ? formData.workshops : [],
    },
    step3: {
      dietaryPreference: String(formData.dietary_preference ?? ""),
      tshirtSize: String(formData.tshirt_size ?? ""),
      heardVia: Array.isArray(formData.heard_via) ? formData.heard_via : [],
      emergencyContactName: String(formData.emergency_contact_name ?? ""),
      emergencyContactPhone: String(formData.emergency_contact_phone ?? ""),
    },
  }
}
