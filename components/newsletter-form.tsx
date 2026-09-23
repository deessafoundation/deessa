"use client"

import type React from "react"

import { useState } from "react"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"

interface NewsletterFormProps {
  variant?: "inline" | "stacked" | "footer"
  className?: string
}

export function NewsletterForm({ variant = "inline", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await subscribeToNewsletter(email)

    setIsLoading(false)

    if (result.success) {
      setIsSubmitted(true)
    } else {
      setError(result.message)
    }
  }

  if (isSubmitted) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="size-5" />
        <span className="text-sm font-medium">Thanks for subscribing!</span>
      </div>
    )
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className={className} noValidate>
        <label
          htmlFor="footer-newsletter-email"
          className="font-comic mb-1.5 block text-[0.7rem] font-bold text-newsletter-navy"
        >
          Email address <span className="text-red-600">*</span>
        </label>
        <div className="flex items-stretch gap-2">
          <input
            id="footer-newsletter-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "footer-newsletter-error" : undefined}
            className="newsletter-input font-comic h-9 min-w-0 flex-1 appearance-none rounded-[8px] border border-newsletter-input-border bg-white px-3 text-[0.72rem] text-newsletter-navy transition-colors duration-200 placeholder:text-newsletter-placeholder focus-visible:border-newsletter-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newsletter-heading/35"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="font-comic inline-flex h-9 shrink-0 appearance-none items-center justify-center gap-1.5 rounded-[8px] bg-newsletter-subscribe px-5 text-[0.72rem] font-bold text-white transition-colors duration-200 hover:bg-newsletter-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newsletter-heading focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Subscribe</span>
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>
        {error && (
          <p id="footer-newsletter-error" role="alert" className="font-comic mt-1.5 text-[0.65rem] text-red-600">
            {error}
          </p>
        )}
      </form>
    )
  }

  if (variant === "stacked") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          required
          className="w-full h-11 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Send className="size-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="flex-1">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          required
          className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <Button type="submit" className="rounded-lg h-11 px-6" disabled={isLoading}>
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
    </form>
  )
}
