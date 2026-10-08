"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2, Upload, X, QrCode, CheckCircle, AlertCircle } from "lucide-react"
import { StepProgressBar } from "@/components/conference/step-progress-bar"
import { DynamicStep } from "@/components/conference/dynamic-step"
import { validateFieldValue } from "@/lib/validation/form-schema"
import { filterVisibleSteps } from "@/lib/validation/conditional-engine"
import { registerForEvent } from "@/lib/actions/events-module/event-registration"
import type { FormSchema, FormStep } from "@/lib/types/conference-form-schema"
import type { EventModuleEvent, EventTicketType } from "@/lib/types/events-module"
import { EventRegistrationClosed } from "./event-error"

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

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"online" | "qr" | "venue" | null>(null)
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [screenshotError, setScreenshotError] = useState<string | null>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  const allSteps: FormStep[] = schema?.steps ?? []
  // Filter steps based on conditional logic
  const steps = useMemo(() => filterVisibleSteps(allSteps, formData), [allSteps, formData])

  // Check if registration is closed (client-side guard)
  const now = new Date()
  const eventDate = new Date(event.event_date)
  eventDate.setHours(23, 59, 59, 999)
  const isPastEvent = eventDate < now
  const isRegistrationClosedByDate = !!(
    event.registration_close_at && new Date(event.registration_close_at) < now
  )
  const isRegistrationClosed = isPastEvent || isRegistrationClosedByDate || !event.registration_enabled

  const hasTicketStep = !event.is_free
  // Count enabled payment methods for paid events
  const enabledPaymentMethods: string[] = []
  if (!event.is_free) {
    if (event.allow_online_payment !== false) enabledPaymentMethods.push("online")
    if (event.allow_qr_payment && (event.payment_qr_image_url || event.payment_bank_name)) enabledPaymentMethods.push("qr")
    if (event.allow_pay_at_venue) enabledPaymentMethods.push("venue")
  }
  // Show payment method step only when 2+ methods are available
  const hasPaymentMethodStep = enabledPaymentMethods.length >= 2
  // Auto-assign when exactly 1 method is available
  const autoPaymentMethod = enabledPaymentMethods.length === 1 ? enabledPaymentMethods[0] as "online" | "qr" | "venue" : null
  // Screenshot step only when user chose QR payment
  const hasScreenshotStep = (hasPaymentMethodStep ? paymentMethod : autoPaymentMethod) === "qr"
  const totalSteps =
    steps.length +
    (hasTicketStep ? 1 : 0) +
    (hasPaymentMethodStep ? 1 : 0) +
    (hasScreenshotStep ? 1 : 0) +
    1
  const isFirst = currentStep === 0
  const ticketStepIndex = hasTicketStep ? steps.length : -1
  const paymentMethodStepIndex = hasPaymentMethodStep ? steps.length + (hasTicketStep ? 1 : 0) : -1
  const screenshotStepIndex = hasScreenshotStep ? steps.length + (hasTicketStep ? 1 : 0) + (hasPaymentMethodStep ? 1 : 0) : -1
  const reviewStepIndex = totalSteps - 1
  const isReviewStep = currentStep === reviewStepIndex

  const stepLabels = [
    ...steps.map((s) => s.label),
    ...(hasTicketStep ? ["Select Ticket"] : []),
    ...(hasPaymentMethodStep ? ["Payment Method"] : []),
    ...(hasScreenshotStep ? ["Payment Screenshot"] : []),
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
    // Validate all fields in the current step before advancing
    const currentStepData = steps[currentStep]
    if (currentStepData?.fields) {
      const newErrors: Record<string, string> = {}
      for (const field of currentStepData.fields) {
        const value = formData[field.id]
        const error = validateFieldValue(field, value)
        if (error) newErrors[field.id] = error
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }))
        return
      }
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [currentStep, steps, formData, totalSteps])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => {
      const prev = Math.max(s - 1, 0)
      // If going back from screenshot step to payment method step, allow it
      return prev
    })
  }, [])

  const handleEdit = useCallback((step: number) => {
    setCurrentStep(step - 1)
  }, [])

  // Payment screenshot upload handler
  const handleScreenshotUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setScreenshotError("Invalid file type. Accepted: JPEG, PNG, WEBP, GIF")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setScreenshotError("File too large. Maximum size is 5MB")
      return
    }

    setScreenshotError(null)
    setUploadingScreenshot(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/events/upload-payment-screenshot", {
        method: "POST",
        body: formDataUpload,
      })

      const result = await response.json()

      if (!result.ok) {
        setScreenshotError(result.error || "Upload failed. Please try again.")
        return
      }

      setPaymentScreenshotUrl(result.path)
    } catch (err) {
      setScreenshotError("Upload failed. Please try again.")
    } finally {
      setUploadingScreenshot(false)
    }
  }, [])

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleScreenshotUpload(file)
    if (e.target) e.target.value = ""
  }

  const handleScreenshotDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Validate file type on drop too
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        setScreenshotError("Invalid file type. Accepted: JPEG, PNG, WEBP, GIF")
        return
      }
      handleScreenshotUpload(file)
    }
  }

  const handleRemoveScreenshot = () => {
    setPaymentScreenshotUrl(null)
    setScreenshotError(null)
  }

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
        {
          ...formData,
          payment_screenshot_url: paymentScreenshotUrl || undefined,
          payment_method: paymentMethod || autoPaymentMethod || undefined,
        }
      )

        const effectiveMethod = paymentMethod || autoPaymentMethod
        if (result.success && result.registrationId) {
          if (result.paymentRequired) {
            // Online payment → redirect to payment options
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
          } else if (effectiveMethod === "qr") {
          // QR payment → redirect to pending verification
          router.push(
            `/events/${event.slug}/register/pending-verification?id=${result.registrationId}&name=${encodeURIComponent(
              String(formData.full_name ?? "")
            )}&email=${encodeURIComponent(String(formData.email ?? ""))}`
          )
        } else {
          // Free event, pay at venue, or no payment needed → success page
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
            { label: "Ticket Type", value: `${ticket.name}, ${ticket.currency} ${ticket.price}` },
          ],
        })
      }
    }

    // Add payment method info if applicable
    const effectiveMethod = paymentMethod || autoPaymentMethod
    if (effectiveMethod) {
      sections.push({
        title: "Payment Method",
        stepIndex: paymentMethodStepIndex,
        rows: [
          {
            label: "Method",
            value: effectiveMethod === "qr" ? "QR Code Payment" : effectiveMethod === "venue" ? "Pay at Venue" : "Online Payment",
          },
        ],
      })
    }

    // Add payment screenshot info if QR payment
    if (hasScreenshotStep && paymentScreenshotUrl) {
      sections.push({
        title: "Payment Screenshot",
        stepIndex: screenshotStepIndex,
        rows: [
          { label: "Screenshot", value: "Uploaded" },
        ],
      })
    }

    return sections
  }

  // Screen reader announcement for step changes
  const stepAnnouncement = `Step ${currentStep + 1} of ${totalSteps}: ${stepLabels[currentStep] ?? ""}`

  if (isRegistrationClosed) {
    return <EventRegistrationClosed eventHref={`/events/${event.slug}`} ended={isPastEvent} />
  }

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
              deessa Foundation
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
        <div className="mb-4 rounded-xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-primary-light/30 to-brand-purple/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Registering for</p>
          <p className="mt-1 text-lg font-bold text-foreground">{event.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-foreground-muted">
            <span className="inline-flex items-center gap-1">
              <svg className="size-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {new Date(event.event_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {event.event_time && (
              <>
                <span className="text-black/20">·</span>
                <span className="inline-flex items-center gap-1">
                  <svg className="size-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.event_time}
                </span>
              </>
            )}
            <span className="text-black/20">·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="size-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {event.location}
            </span>
          </div>
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
        <div className="relative min-h-[50vh] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
                isLast={currentStep === steps.length - 1 && !hasTicketStep && !hasPaymentMethodStep}
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
                    .map((ticket) => {
                      const now = new Date()
                      const salesStart = ticket.sales_start ? new Date(ticket.sales_start) : null
                      const salesEnd = ticket.sales_end ? new Date(ticket.sales_end) : null
                      const isSoldOut = ticket.capacity != null && ticket.capacity - (ticket.sold_count || 0) <= 0
                      const isNotYetOnSale = salesStart !== null && salesStart > now
                      const isSalesEnded = salesEnd !== null && salesEnd < now
                      const isDisabled = isSoldOut || isNotYetOnSale || isSalesEnded

                      const getBadge = () => {
                        if (isSoldOut) return { text: "Sold out", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
                        if (isNotYetOnSale) return { text: `Sales open ${salesStart!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
                        if (isSalesEnded) return { text: "Sales ended", className: "bg-black/10 text-black/50" }
                        return null
                      }

                      const badge = getBadge()
                      const spotsLeft = ticket.capacity != null ? ticket.capacity - (ticket.sold_count || 0) : null

                      return (
                      <label
                        key={ticket.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isDisabled
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
                            disabled={isDisabled}
                            onChange={() => setSelectedTicketId(ticket.id)}
                            className="h-4 w-4 text-primary"
                            aria-label={`${ticket.name} - ${ticket.price_tbd ? "Pricing TBD" : ticket.price === 0 ? "Free" : `${ticket.currency} ${ticket.price}`}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{ticket.name}</p>
                              {badge && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                                  {badge.text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {ticket.capacity ? (
                                <p className="text-xs text-muted-foreground">
                                  {isSoldOut
                                    ? "Sold out"
                                    : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available`}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">Unlimited</p>
                              )}
                              {isNotYetOnSale && salesStart && (
                                <p className="text-xs text-muted-foreground">
                                  · Opens {salesStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              )}
                              {isSalesEnded && salesEnd && (
                                <p className="text-xs text-muted-foreground">
                                  · Ended {salesEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              )}
                            </div>
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
                  {ticketTypes.length === 0 && (
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

            {/* Payment Method Choice Step */}
            {hasPaymentMethodStep && currentStep === paymentMethodStepIndex && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Payment Method
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Choose how you&apos;d like to pay for this event.
                  </p>
                </div>

                <div className="space-y-3" role="radiogroup" aria-label="Select payment method">
                  {/* Online Payment Option */}
                  {enabledPaymentMethods.includes("online") && (
                    <label
                      className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "online"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => {
                          setPaymentMethod("online")
                          setPaymentScreenshotUrl(null)
                          setScreenshotError(null)
                        }}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">Pay Online</p>
                          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            International
                          </span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          eSewa, Khalti, Stripe; instant verification
                        </p>
                      </div>
                      <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "online" ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {paymentMethod === "online" && (
                          <div className="size-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </label>
                  )}

                  {/* QR Code Payment Option */}
                  {enabledPaymentMethods.includes("qr") && (
                    <label
                      className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "qr"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value="qr"
                        checked={paymentMethod === "qr"}
                        onChange={() => setPaymentMethod("qr")}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <QrCode className="size-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">QR / Bank Transfer</p>
                          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                            Nepal Only
                          </span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          Scan QR or transfer to bank; upload a screenshot for verification
                        </p>
                      </div>
                      <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "qr" ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {paymentMethod === "qr" && (
                          <div className="size-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </label>
                  )}

                  {/* Pay at Venue Option */}
                  {enabledPaymentMethods.includes("venue") && (
                    <label
                      className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "venue"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value="venue"
                        checked={paymentMethod === "venue"}
                        onChange={() => {
                          setPaymentMethod("venue")
                          setPaymentScreenshotUrl(null)
                          setScreenshotError(null)
                        }}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                        <svg className="size-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">Pay at Venue</p>
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                            On Arrival
                          </span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          Complete registration now, pay cash or card at the check-in desk
                        </p>
                      </div>
                      <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "venue" ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {paymentMethod === "venue" && (
                          <div className="size-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </label>
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
                    disabled={!paymentMethod}
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

            {/* Payment Screenshot Step */}
            {hasScreenshotStep && currentStep === screenshotStepIndex && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Payment Screenshot
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Upload proof of your payment to complete registration.
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="size-4 text-primary" />
                    <p className="text-sm font-bold text-primary">Scan to Pay</p>
                  </div>
                  <div className="flex justify-center mb-3">
                    <img
                      src={event.payment_qr_image_url!}
                      alt="Payment QR Code"
                      className="h-48 w-48 object-contain rounded-lg bg-white p-2 shadow-sm"
                    />
                  </div>
                  {event.payment_instructions && (
                    <p className="text-xs text-black/60 text-center leading-relaxed">
                      {event.payment_instructions}
                    </p>
                  )}
                </div>

                {/* Bank Transfer Details (if provided) */}
                {(event.payment_bank_name || event.payment_account_name || event.payment_account_number) && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="size-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                      <p className="text-sm font-bold text-blue-700">Or Transfer to Bank Account</p>
                    </div>
                    <div className="grid gap-2 text-sm">
                      {event.payment_bank_name && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">Bank:</span>
                          <span className="text-foreground">{event.payment_bank_name}</span>
                        </div>
                      )}
                      {event.payment_account_name && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">Account Name:</span>
                          <span className="text-foreground">{event.payment_account_name}</span>
                        </div>
                      )}
                      {event.payment_account_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">Account No:</span>
                          <span className="text-foreground font-mono">{event.payment_account_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Upload Payment Screenshot <span className="text-destructive">*</span>
                  </label>

                  {paymentScreenshotUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-800">Screenshot uploaded</p>
                          <p className="text-xs text-green-600 truncate">{paymentScreenshotUrl.split("/").pop()}</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove payment screenshot"
                          onClick={handleRemoveScreenshot}
                          className="p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <X className="h-4 w-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label="Upload payment screenshot"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          screenshotInputRef.current?.click()
                        }
                      }}
                      onDrop={handleScreenshotDrop}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                      onClick={() => screenshotInputRef.current?.click()}
                    >
                      <input
                        ref={screenshotInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleScreenshotFileChange}
                        className="hidden"
                      />
                      {uploadingScreenshot ? (
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
                      ) : (
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      )}
                      <p className="text-sm font-medium text-foreground">
                        {uploadingScreenshot ? "Uploading..." : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP, GIF up to 5MB
                      </p>
                    </div>
                  )}

                  {screenshotError && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{screenshotError}</span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Please ensure the screenshot clearly shows the transaction ID, amount, and date.
                  </p>
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
                    disabled={!paymentScreenshotUrl}
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
                            href="https://deessafoundation.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            Terms and Conditions
                          </a>{" "}
                          and the{" "}
                          <a
                            href="https://deessafoundation.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            Data Privacy Policy
                          </a>{" "}
                          of the deessa Foundation.
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
                          upcoming deessa Foundation events via email.
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
