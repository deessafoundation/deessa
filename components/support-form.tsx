"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bug, CheckCircle, FileImage, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
import { notifications } from "@/lib/notifications"

interface SupportFormProps {
  initialPageUrl?: string
}

const issueTypes = ["Bug Report", "Feature Request", "Content Issue", "Accessibility Issue", "Other"] as const
const ISSUE_TYPE_OPTIONS = issueTypes.map((t) => ({ value: t, label: t }))
const MAX_SCREENSHOT_SIZE = 2 * 1024 * 1024
const ALLOWED_SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export function SupportForm({ initialPageUrl = "" }: SupportFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const successRef = useRef<HTMLDivElement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "Bug Report",
    pageUrl: initialPageUrl,
    browserInfo: "",
    summary: "",
    details: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFormData((prev) => ({
        ...prev,
        browserInfo: window.navigator.userAgent,
        pageUrl: initialPageUrl,
      }))
    }
  }, [initialPageUrl])

  useEffect(() => {
    if (isSubmitted) {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [isSubmitted])

  const previewAlt = useMemo(() => screenshotFile?.name || "Screenshot preview", [screenshotFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview)
    }

    if (file && (!ALLOWED_SCREENSHOT_TYPES.includes(file.type as (typeof ALLOWED_SCREENSHOT_TYPES)[number]) || file.size > MAX_SCREENSHOT_SIZE)) {
      setScreenshotFile(null)
      setScreenshotPreview(null)
      const validationMessage =
        file.size > MAX_SCREENSHOT_SIZE ? "Screenshot must be 2MB or smaller." : "Please upload a JPG, PNG, or WEBP screenshot."
      setError(validationMessage)
      notifications.showError({
        title: "Invalid screenshot",
        description: validationMessage,
      })
      e.target.value = ""
      return
    }

    setScreenshotFile(file)
    setScreenshotPreview(file ? URL.createObjectURL(file) : null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = new FormData()
      payload.set("name", formData.name)
      payload.set("email", formData.email)
      payload.set("issueType", formData.issueType)
      payload.set("pageUrl", formData.pageUrl)
      payload.set("browserInfo", formData.browserInfo)
      payload.set("summary", formData.summary)
      payload.set("details", formData.details)

      if (screenshotFile) {
        payload.set("screenshot", screenshotFile)
      }

      const response = await fetch("/api/support/submit", {
        method: "POST",
        body: payload,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsSubmitted(true)
        if (screenshotPreview) {
          URL.revokeObjectURL(screenshotPreview)
        }
        setScreenshotPreview(null)
        setScreenshotFile(null)
        setFormData({
          name: "",
          email: "",
          issueType: "Bug Report",
          pageUrl: initialPageUrl,
          browserInfo: typeof window !== "undefined" ? window.navigator.userAgent : "",
          summary: "",
          details: "",
        })
        notifications.showSuccess({
          title: "Report submitted",
          description: "Thanks for helping us improve the site. We received your report.",
        })
      } else {
        const message = result.message || "We couldn't submit your report. Please try again."
        setError(message)
        notifications.showError({
          title: "Submission failed",
          description: message,
        })
      }
    } catch {
      const message = "We couldn't submit your report. Please check your connection and try again."
      setError(message)
      notifications.showError({
        title: "Submission failed",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div
        ref={successRef}
        className="flex min-h-[520px] flex-col justify-center rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8 text-center shadow-2xl shadow-emerald-100/50 sm:p-12"
      >
        <div className="mx-auto mb-6 inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500 shadow-2xl shadow-emerald-500/30">
          <CheckCircle className="size-10 text-white" strokeWidth={2.5} />
        </div>
        
        <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Sparkles className="size-4" />
          Report Submitted
        </div>
        
        <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Thanks. We&apos;re on it.
        </h3>
        
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
          We&apos;ve logged your report and will review it as part of the launch work. If you remember anything else,
          you can send another report at any time.
        </p>

        <div className="mx-auto mt-8 grid w-full max-w-xl gap-3 text-left sm:grid-cols-3">
          {[
            { label: "Captured Safely", icon: "🔒" },
            { label: "Queued for Review", icon: "📋" },
            { label: "We'll Follow Up", icon: "✉️" },
          ].map((item) => (
            <div 
              key={item.label} 
              className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-center shadow-sm"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-semibold text-slate-800">{item.label}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setIsSubmitted(false)}
          size="lg"
          className="mx-auto mt-10 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-8 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          Send Another Report
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl shadow-slate-900/20">
            <Bug className="size-6" />
          </div>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Sparkles className="size-3.5" />
              Quick Report
            </div>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Tell us what happened</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Include the page you were on, what you expected, and a screenshot if you have one. Clear reports help us fix things faster.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-900">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-900">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="issueType" className="mb-2 block text-sm font-bold text-slate-900">
              What Best Describes It?
            </label>
            <FancySelect
              value={formData.issueType}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, issueType: val }))}
              options={ISSUE_TYPE_OPTIONS}
            />
          </div>
          <div>
            <label htmlFor="pageUrl" className="mb-2 block text-sm font-bold text-slate-900">
              Page URL
            </label>
            <input
              id="pageUrl"
              name="pageUrl"
              type="url"
              value={formData.pageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
            <p className="mt-2 text-xs text-slate-500">Paste the exact page where the problem happened.</p>
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="mb-2 block text-sm font-bold text-slate-900">
            Short Summary
          </label>
          <input
            id="summary"
            name="summary"
            type="text"
            required
            value={formData.summary}
            onChange={handleChange}
            placeholder="Example: The signup button did not respond"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label htmlFor="details" className="mb-2 block text-sm font-bold text-slate-900">
            Describe the Issue
          </label>
          <textarea
            id="details"
            name="details"
            rows={6}
            required
            value={formData.details}
            onChange={handleChange}
            placeholder="Tell us what happened, what you expected, and anything else that helps us reproduce it."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label htmlFor="screenshot" className="mb-2 block text-sm font-bold text-slate-900">
            Screenshot <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-sky-500 file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-white file:shadow-lg file:shadow-cyan-500/25 hover:border-slate-400 hover:bg-slate-100"
          />
          <p className="mt-2 text-xs text-slate-500">PNG, JPG, or WEBP up to 2MB.</p>

          {screenshotPreview && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <FileImage className="size-4 text-slate-600" />
                  <span className="font-medium">{previewAlt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (screenshotPreview) {
                      URL.revokeObjectURL(screenshotPreview)
                    }
                    setScreenshotPreview(null)
                    setScreenshotFile(null)
                  }}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="size-3.5" />
                  Remove
                </button>
              </div>
              <div className="relative aspect-video bg-slate-100">
                <img src={screenshotPreview} alt={previewAlt} className="h-full w-full object-contain" />
              </div>
            </div>
          )}
        </div>

        <input type="hidden" name="browserInfo" value={formData.browserInfo} />

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-slate-500">
            We only use this information to reproduce and fix the issue.
          </p>
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-8 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Sending Report...
              </>
            ) : (
              <>
                <Bug className="mr-2 size-5" />
                Send Report
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
