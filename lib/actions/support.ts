"use server"

import { randomUUID } from "crypto"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendSupportEmails } from "@/lib/email/support-mailer"

const SUPPORT_BUCKET = "support-screenshots"
const MAX_SCREENSHOT_SIZE = 2 * 1024 * 1024
const ALLOWED_SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"]

const supportSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  issueType: z.string().trim().min(2).max(80),
  pageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  browserInfo: z.string().trim().max(500).optional().or(z.literal("")),
  summary: z.string().trim().min(5).max(140),
  details: z.string().trim().min(10).max(4000),
})

export type SupportSubmissionResult = {
  success: boolean
  message: string
  error?: string
}

function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim()
}

export async function submitSupportReport(formData: FormData): Promise<SupportSubmissionResult> {
  try {
    const screenshotFile = formData.get("screenshot")
    const parsed = supportSchema.safeParse({
      name: sanitizeText(String(formData.get("name") ?? "")),
      email: sanitizeText(String(formData.get("email") ?? "")),
      issueType: sanitizeText(String(formData.get("issueType") ?? "")),
      pageUrl: sanitizeText(String(formData.get("pageUrl") ?? "")),
      browserInfo: sanitizeText(String(formData.get("browserInfo") ?? "")),
      summary: sanitizeText(String(formData.get("summary") ?? "")),
      details: sanitizeText(String(formData.get("details") ?? "")),
    })

    if (!parsed.success) {
      return { success: false, message: "Please complete the support form with valid details." }
    }

    const values = parsed.data
    const submissionId = randomUUID()
    let screenshotPath: string | null = null
    let screenshotName: string | null = null

    const rateLimit = await checkRateLimit({
      identifier: `support:${values.email.toLowerCase()}`,
      maxAttempts: 3,
      windowMinutes: 60,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Please wait before sending another support report.",
      }
    }

    if (screenshotFile instanceof File && screenshotFile.size > 0) {
      if (!ALLOWED_SCREENSHOT_TYPES.includes(screenshotFile.type)) {
        return { success: false, message: "Please upload a JPG, PNG, or WEBP screenshot." }
      }

      if (screenshotFile.size > MAX_SCREENSHOT_SIZE) {
        return { success: false, message: "Screenshot must be 2MB or smaller." }
      }

      // Store original filename for display
      screenshotName = screenshotFile.name
      
      // Generate a better filename format
      const fileExtension = screenshotFile.name.split('.').pop() || 'png'
      const sanitizedName = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30) // Limit length
      
      const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-')
      
      const shortId = submissionId.split('-')[0] // First segment of UUID
      
      // Format: {name}_{timestamp}_{id}.{ext}
      // Example: farhan-alam_2026-05-29_14-25-30_a3f9b2c1.png
      const newFileName = `${sanitizedName}_${timestamp}_${shortId}.${fileExtension}`
      screenshotPath = `${submissionId}/${newFileName}`
      
      const screenshotBytes = Buffer.from(await screenshotFile.arrayBuffer())

      const serviceSupabase = createServiceRoleClient()
      const { error: uploadError } = await serviceSupabase.storage.from(SUPPORT_BUCKET).upload(screenshotPath, screenshotBytes, {
        contentType: screenshotFile.type,
        upsert: false,
        cacheControl: "3600",
      })

      if (uploadError) {
        return {
          success: false,
          message: "We could not upload the screenshot. Please try again.",
          error: uploadError.message,
        }
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("contact_submissions").insert({
      id: submissionId,
      name: values.name,
      email: values.email,
      subject: values.issueType,
      message: `${values.summary}\n\n${values.details}`,
      issue_type: values.issueType,
      page_url: values.pageUrl || null,
      browser_info: values.browserInfo || null,
      screenshot_path: screenshotPath,
      screenshot_name: screenshotName,
    })

    if (error) {
      if (screenshotPath) {
        try {
          const serviceSupabase = createServiceRoleClient()
          await serviceSupabase.storage.from(SUPPORT_BUCKET).remove([screenshotPath])
        } catch {
          // Ignore cleanup failures.
        }
      }

      return {
        success: false,
        message: "Failed to submit your report. Please try again.",
        error: error.message,
      }
    }

    sendSupportEmails({
      name: values.name,
      email: values.email,
      issueType: values.issueType,
      summary: values.summary,
      details: values.details,
      pageUrl: values.pageUrl || undefined,
      browserInfo: values.browserInfo || undefined,
      screenshotName: screenshotName || undefined,
    }).catch((err) => {
      console.error("Support notification email error (non-fatal):", err)
    })

    return {
      success: true,
      message: "Thanks. Your report has been received and will be reviewed shortly.",
    }
  } catch (err) {
    console.error("Support report submission error:", err)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}