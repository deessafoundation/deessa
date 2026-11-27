"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Loader2, CheckCircle, X, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField, TextareaField } from "@/components/form"
import { submitVolunteerApplication } from "@/lib/actions/volunteer"
import styles from "./volunteer-form.module.css"

interface VolunteerFormProps {
  isOpen: boolean
  onClose: () => void
  roleTitle?: string
}

const skillOptions = [
  "Teaching/Education",
  "Healthcare/Medical",
  "Construction/Building",
  "IT/Technology",
  "Marketing/Communications",
  "Finance/Accounting",
  "Legal",
  "Photography/Videography",
  "Languages/Translation",
  "Project Management",
]

const interestOptions = [
  "Education Programs",
  "Healthcare Initiatives",
  "Women Empowerment",
  "Disaster Relief",
  "Community Development",
  "Environmental Projects",
]

export function VolunteerForm({ isOpen, onClose, roleTitle }: VolunteerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    occupation: "",
    skills: [] as string[],
    availability: "",
    interests: [] as string[],
    message: "",
  })

  // Escape key listener & focus trapping
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent body scrolling while modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Pre-fill when roleTitle changes
  useEffect(() => {
    if (roleTitle && !formData.message.includes(roleTitle)) {
      setFormData((prev) => ({
        ...prev,
        message: prev.message ? `${prev.message}\nInterested role: ${roleTitle}` : `Applying for: ${roleTitle}`,
      }))
    }
  }, [roleTitle])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleCheckboxChange = (field: "skills" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }))
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      occupation: "",
      skills: [],
      availability: "",
      interests: [],
      message: "",
    })
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.skills.length === 0) {
      setError("Please select at least one skill or capability.")
      return
    }

    if (formData.interests.length === 0) {
      setError("Please select at least one program area of interest.")
      return
    }

    if (!formData.availability) {
      setError("Please select your availability.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await submitVolunteerApplication({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        occupation: formData.occupation || undefined,
        skills: formData.skills,
        availability: formData.availability,
        interests: formData.interests,
        message: formData.message || undefined,
      })

      setIsLoading(false)

      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.message || "Failed to submit application. Please try again.")
      }
    } catch (err) {
      setIsLoading(false)
      setError("An unexpected network error occurred. Please try again.")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="volunteer-modal-title"
      ref={modalRef}
    >
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      <div className={styles.modalCard}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 id="volunteer-modal-title" className="text-lg font-bold text-foreground">
              Volunteer Application
            </h2>
            {roleTitle ? (
              <p className="text-xs text-primary font-medium mt-0.5">Interested in: {roleTitle}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Join the grassroots movement in Nepal</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close volunteer application dialog"
            className={styles.closeButton}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {isSubmitted ? (
            <div className="text-center py-8 px-4" aria-live="polite">
              <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                <CheckCircle className="size-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Application Received!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm leading-relaxed">
                Thank you, <strong className="text-foreground">{formData.fullName}</strong>, for stepping up to make a
                difference. We have sent a confirmation email to <strong className="text-foreground">{formData.email}</strong>.
                Our team will review your application and reach out within 3 to 5 business days.
              </p>
              <div className="flex justify-center">
                <Button onClick={handleClose} className="rounded-full px-8 h-10">
                  Return to Site
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Volunteer application form">
              {error && (
                <div
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2.5"
                  role="alert"
                >
                  <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  1. Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="fullName"
                    name="fullName"
                    type="text"
                    label="Full Name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="h-10 rounded-lg text-sm"
                  />

                  <FormField
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="h-10 rounded-lg text-sm"
                  />

                  <FormField
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Phone / Mobile Number"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-10 rounded-lg text-sm"
                  />

                  <FormField
                    id="occupation"
                    name="occupation"
                    type="text"
                    label="Current Occupation / Student"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Skills */}
              <div role="group" aria-labelledby="skills-heading" className="space-y-2.5">
                <h3 id="skills-heading" className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  2. Skills & Capabilities <span className="text-primary">*</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skillOptions.map((skill) => {
                    const isChecked = formData.skills.includes(skill)
                    return (
                      <label
                        key={skill}
                        className={`${styles.checkboxItem} ${isChecked ? styles.checkboxItemActive : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange("skills", skill)}
                          className="size-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium text-foreground">{skill}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1.5">
                <label htmlFor="availability" className="block text-sm font-semibold text-foreground uppercase tracking-wide">
                  3. Availability Commitment <span className="text-primary">*</span>
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select your availability...</option>
                  <option value="weekdays">Weekdays only (Part-time)</option>
                  <option value="weekends">Weekends only</option>
                  <option value="flexible">Flexible / Project-based</option>
                  <option value="fulltime">Full-time On-site (2+ weeks)</option>
                  <option value="remote">Remote only (Global)</option>
                </select>
              </div>

              {/* Interests */}
              <div role="group" aria-labelledby="interests-heading" className="space-y-2.5">
                <h3 id="interests-heading" className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  4. Program Interests <span className="text-primary">*</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {interestOptions.map((interest) => {
                    const isChecked = formData.interests.includes(interest)
                    return (
                      <label
                        key={interest}
                        className={`${styles.checkboxItem} ${isChecked ? styles.checkboxItemActive : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange("interests", interest)}
                          className="size-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-medium text-foreground">{interest}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Message / Motivation */}
              <TextareaField
                id="message"
                name="message"
                label="5. Statement of Motivation (Optional)"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what inspires you to volunteer with Deesha Foundation..."
                className="rounded-lg text-sm"
              />

              {/* Form Actions with side-by-side mobile buttons */}
              <div className="pt-2 flex flex-row items-center justify-end gap-2.5 sm:gap-3 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none h-10 px-5"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none h-10 px-6 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
