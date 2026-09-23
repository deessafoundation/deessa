"use client"

import type React from "react"

import { useState } from "react"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField, TextareaField } from "@/components/form"
import { submitContactForm } from "@/lib/actions/contact"

interface ContactFormProps {
  initialSubject?: string
  initialMessage?: string
}

export function ContactForm({ initialSubject = "", initialMessage = "" }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: initialSubject,
    message: initialMessage,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await submitContactForm({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject,
      message: formData.message,
    })

    setIsLoading(false)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.message)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
        <p className="text-green-700">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
        <Button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: initialSubject, message: initialMessage })
          }}
          variant="outline"
          className="mt-4 rounded-full"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Contact form">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="firstName"
          type="text"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="h-12 rounded-xl"
        />
        
        <FormField
          id="lastName"
          type="text"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="h-12 rounded-xl"
        />
      </div>
      
      <FormField
        id="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        className="h-12 rounded-xl"
      />
      
      <FormField
        id="phone"
        type="tel"
        label="Phone Number"
        helperText="Optional"
        value={formData.phone}
        onChange={handleChange}
        className="h-12 rounded-xl"
      />
      
      <div className="space-y-1.5">
        <label htmlFor="subject" className="block text-sm font-medium text-foreground">
          Subject
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <select
          id="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          aria-required="true"
          className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select a topic</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Donation Questions">Donation Questions</option>
          <option value="Donation Support">Donation Support</option>
          <option value="Volunteering">Volunteering</option>
          <option value="Partnership Opportunities">Partnership Opportunities</option>
          <option value="Media & Press">Media &amp; Press</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <TextareaField
        id="message"
        label="Message"
        rows={5}
        value={formData.message}
        onChange={handleChange}
        required
        placeholder="How can we help you?"
        className="rounded-xl"
      />
      
      <Button type="submit" size="lg" className="w-full rounded-full h-12" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
