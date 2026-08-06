"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"
import { StepProgressBar } from "@/components/conference/step-progress-bar"
import { DynamicStep } from "@/components/conference/dynamic-step"
import { validateFieldValue } from "@/lib/validation/form-schema"
import { registerForEvent } from "@/lib/actions/events-module/event-registration"
import type { FormSchema, FormStep } from "@/lib/types/conference-form-schema"
import type { EventModuleEvent, EventTicketType } from "@/lib/types/events-module"

interface EventRegistrationFormProps {
  event: EventModuleEvent
  schema: FormSchema | null
  ticketTypes: EventTicketType[]
}

export function EventRegistrationForm({
  event,
  schema,
  ticketTypes,
}: EventRegistrationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentNewsletter, setConsentNewsletter] = useState(false)

  const steps: FormStep[] = schema?.steps ?? []
  // +1 for ticket selection (if paid), +1 for review/consent
  const hasTicketStep = !event.is_free && ticketTypes.length > 0
  const totalSteps = steps.length + (hasTicketStep ? 1 : 0) + 1
  const isFirst = currentStep === 0
  const ticketStepIndex = hasTicketStep ? steps.length : -1
  const reviewStepIndex = totalSteps - 1
  const isReviewStep = currentStep === reviewStepIndex

  const stepLabels = [
    ...steps.map((s) => s.label),
    ...(hasTicketStep ? ["Select Ticket"] : []),
    "Review & Submit",
  ]

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleFieldBlur = useCallback(
    (fieldId: string) => {
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
    },
    [steps, formData]
  )

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [totalSteps])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const handleEdit = useCallback((step: number) => {
    setCurrentStep(step - 1)
  }, [])

  const handleSubmit = async (consent: {
    consentTerms: boolean
    consentNewsletter: boolean
  }) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await registerForEvent(
        {
          event_id: event.id,
          full_name: String(formData.full_name ?? ""),
          email: String(formData.email ?? ""),
          phone: String(formData.phone ?? ""),
          consent_terms: consent.consentTerms,
          consent_marketing: consent.consentNewsletter,
          form_schema_version: schema?.version,
          ticket_type_id: selectedTicketId || undefined,
        },
        formData
      )

      if (result.success && result.registrationId) {
        if (result.paymentRequired) {
          const params = new URLSearchParams({
            rid: result.registrationId,
            email: String(formData.email ?? ""),
            name: String(formData.full_name ?? ""),
            amount: String(result.paymentAmount ?? ""),
            currency: result.paymentCurrency ?? "NPR",
            expiryHours: String(result.expiryHours ?? 24),
            slug: event.slug,
            eventName: event.title,
          })
          router.push(
            `/events/${event.slug}/register/payment-options?${params.toString()}`
          )
        } else {
          router.push(
            `/events/${event.slug}/register/success?id=${result.registrationId}&name=${encodeURIComponent(
              String(formData.full_name ?? "")
            )}&email=${encodeURIComponent(String(formData.email ?? ""))}`
          )
        }
      } else {
        setSubmitError(
          result.message || "Registration failed. Please try again."
        )
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Build review data grouped by step
  const buildReviewSections = () => {
    const sections: { title: string; stepIndex: number; rows: { label: string; value: string | string[] | undefined }[] }[] = []

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const rows: { label: string; value: string | string[] | undefined }[] = []

      for (const field of step.fields) {
        if (field.type === "heading" || field.type === "paragraph") continue
        const value = formData[field.id]
        if (value !== undefined && value !== "" && value !== null) {
          let displayValue: string | string[] = Array.isArray(value) ? value : String(value)
          if (field.type === "file" && typeof displayValue === "string" && displayValue.includes("/")) {
            displayValue = decodeURIComponent(displayValue.split("/").pop() || displayValue)
          }
          rows.push({
            label: field.label,
            value: displayValue,
          })
        }
      }

      if (rows.length > 0) {
        sections.push({
          title: step.label,
          stepIndex: i,
          rows,
        })
      }
    }

    // Add ticket info if paid
    if (hasTicketStep && selectedTicketId) {
      const ticket = ticketTypes.find((t) => t.id === selectedTicketId)
      if (ticket) {
        sections.push({
          title: "Ticket Selection",
          stepIndex: ticketStepIndex,
          rows: [
            { label: "Ticket Type", value: `${ticket.name} — ${ticket.currency} ${ticket.price}` },
          ],
        })
      }
    }

    return sections
  }

  // Screen reader announcement for step changes
  const stepAnnouncement = `Step ${currentStep + 1} of ${totalSteps}: ${stepLabels[currentStep] ?? ""}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Screen reader live region for step announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {stepAnnouncement}
      </div>
      {/* Header */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              D
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Deessa Foundation
            </span>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="flex items-center gap-1 text-sm font-semibold text-foreground-muted transition-colors hover:text-primary"
          >
            <ChevronLeft className="size-4" />
            Back to Event
          </Link>
        </div>

        {/* Event Context */}
        <div className="mb-4 rounded-xl border bg-surface p-4">
          <p className="text-sm text-muted-foreground">Registering for</p>
          <p className="font-bold">{event.title}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(event.event_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {event.event_time && ` • ${event.event_time}`}
            {` • ${event.location}`}
          </p>
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
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Form Steps */}
            {currentStep < steps.length && steps.length > 0 && (
              <DynamicStep
                step={steps[currentStep]}
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
                onNext={handleNext}
                onBack={currentStep > 0 ? handleBack : undefined}
                isFirst={isFirst}
                isLast={currentStep === steps.length - 1 && !hasTicketStep}
              />
            )}

            {/* Ticket Selection Step */}
            {hasTicketStep && currentStep === ticketStepIndex && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Select Ticket
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Choose the ticket type that works best for you.
                  </p>
                </div>

                <div className="space-y-3" role="radiogroup" aria-label="Select ticket type">
                  {ticketTypes
                    .filter((t) => {
                      if (!t.is_active) return false
                      const now = new Date()
                      if (t.sales_end && new Date(t.sales_end) < now) return false
                      if (t.sales_start && new Date(t.sales_start) > now) return false
                      return true
                    })
                    .map((ticket) => {
                      const isSoldOut = ticket.capacity != null && ticket.capacity - (ticket.sold_count || 0) <= 0
                      const isUnavailable = isSoldOut || ticket.price_tbd
                      return (
                      <label
                        key={ticket.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isUnavailable
                            ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                            : selectedTicketId === ticket.id
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-border hover:border-primary/50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="ticket"
                            value={ticket.id}
                            checked={selectedTicketId === ticket.id}
                            disabled={isUnavailable}
                            onChange={() => setSelectedTicketId(ticket.id)}
                            className="h-4 w-4 text-primary"
                            aria-label={`${ticket.name} - ${ticket.price_tbd ? "Pricing TBD" : ticket.price === 0 ? "Free" : `${ticket.currency} ${ticket.price}`}`}
                          />
                          <div>
                            <p className="font-medium">{ticket.name}</p>
                            {ticket.price_tbd ? (
                              <p className="text-xs text-muted-foreground">Registration opens once pricing is finalized</p>
                            ) : ticket.capacity && (
                              <p className="text-xs text-muted-foreground">
                                {ticket.capacity - (ticket.sold_count || 0) <= 0
                                  ? "Sold out"
                                  : `${ticket.capacity - (ticket.sold_count || 0)} spots available`}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-bold">
                          {ticket.price_tbd
                            ? "TBD"
                            : ticket.price === 0
                            ? "Free"
                            : `${ticket.currency} ${ticket.price}`}
                        </p>
                      </label>
                      )
                    })}
                  {ticketTypes.filter((t) => {
                    if (!t.is_active) return false
                    const now = new Date()
                    if (t.sales_end && new Date(t.sales_end) < now) return false
                    if (t.sales_start && new Date(t.sales_start) > now) return false
                    return true
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tickets are currently available for this event.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!selectedTicketId}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Continue
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {isReviewStep && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Review <span className="font-normal">&</span> Submit
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Please review your details carefully before final submission.
                  </p>
                </div>

                {/* Review Card */}
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm divide-y divide-border">
                  {buildReviewSections().map((section) => (
                    <ReviewSection
                      key={section.title}
                      title={section.title}
                      onEdit={() => handleEdit(section.stepIndex + 1)}
                      rows={section.rows}
                    />
                  ))}

                  {/* Consent Section */}
                  <div className="bg-primary/5 p-6">
                    <h2 className="mb-4 text-base font-bold text-foreground">
                      Consent <span className="font-normal">&</span> Privacy
                    </h2>
                    <div className="space-y-4">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          required
                          checked={consentTerms}
                          onChange={(e) => setConsentTerms(e.target.checked)}
                          className="mt-0.5 size-5 rounded border-border text-primary focus:ring-primary"
                          aria-required="true"
                          aria-label="I agree to the Terms and Conditions and Data Privacy Policy"
                        />
                        <span className="text-sm text-foreground-muted">
                          I agree to the{" "}
                          <a
                            href="https://deessa.org/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            Terms and Conditions
                          </a>{" "}
                          and the{" "}
                          <a
                            href="https://deessa.org/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            Data Privacy Policy
                          </a>{" "}
                          of the Deessa Foundation.
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={consentNewsletter}
                          onChange={(e) => setConsentNewsletter(e.target.checked)}
                          className="mt-0.5 size-5 rounded border-border text-primary focus:ring-primary"
                          aria-label="I consent to receiving future newsletters and updates"
                        />
                        <span className="text-sm text-foreground-muted">
                          I consent to receiving future newsletters and updates about
                          upcoming Deessa Foundation events via email.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {submitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit({ consentTerms, consentNewsletter })}
                    disabled={isSubmitting || !consentTerms}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <svg
                          className="size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewSection({
  title,
  onEdit,
  rows,
}: {
  title: string
  onEdit: () => void
  rows: { label: string; value: string | string[] | undefined }[]
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-5">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      </div>
      <div className="p-4 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-6 py-2">
            <p className="text-sm text-foreground-muted">{row.label}</p>
            {Array.isArray(row.value) ? (
              <div className="flex flex-wrap justify-end gap-1">
                {row.value.map((v, index) => (
                  <span key={`${v}-${index}`} className="inline-block rounded bg-muted px-2 py-1 text-xs font-medium text-foreground">
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-right text-sm font-semibold text-foreground">
                {row.value || "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
