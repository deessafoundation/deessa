/**
 * Newsletter Email Dispatcher & Batch Mailer
 *
 * Implements:
 * 1. Safe throttled batch sending with chunking (15 recipients/chunk, 500ms delay)
 *    to prevent Gmail SMTP rate-limit suspensions.
 * 2. Dynamic merge-tag interpolation ({{name}}, {{unsubscribe_url}}).
 * 3. Pre-flight test email dispatch for admin verification.
 * 4. Automatic welcome email for new community subscribers.
 */

"use server"

import nodemailer from "nodemailer"
import { getAppBaseUrl } from "@/lib/utils"
import {
  buildNewsletterEmailHtml,
  buildWelcomeEmailHtml,
} from "./templates/newsletter"

const BATCH_SIZE = 15
const BATCH_DELAY_MS = 600

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD

  if (!user || !pass) {
    throw new Error("GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured in environment")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface RecipientInfo {
  email: string
  name?: string | null
  unsubscribe_token: string
}

export interface DispatchCampaignParams {
  campaignId: string
  subject: string
  previewText?: string | null
  contentHtml: string
  recipients: RecipientInfo[]
}

export interface DispatchCampaignResult {
  total: number
  sent: number
  failed: number
  errors: string[]
}

/**
 * Replace merge tags in content for a specific recipient
 */
function interpolateContent(content: string, recipient: RecipientInfo, unsubscribeUrl: string): string {
  const displayName = recipient.name && recipient.name.trim() ? recipient.name.trim() : "Friend"
  return content
    .replace(/\{\{\s*name\s*\}\}/gi, displayName)
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl)
    .replace(/\{\{\s*current_year\s*\}\}/gi, String(new Date().getFullYear()))
}

/**
 * Dispatch an individual test email to the administrator
 */
export async function sendTestNewsletterEmail({
  toEmail,
  subject,
  previewText,
  contentHtml,
}: {
  toEmail: string
  subject: string
  previewText?: string | null
  contentHtml: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createGmailTransporter()
    const siteUrl = getAppBaseUrl()
    const testUnsubscribeUrl = `${siteUrl}/unsubscribe?token=test-preview-only`

    const sampleRecipient: RecipientInfo = {
      email: toEmail,
      name: "Admin Reviewer",
      unsubscribe_token: "test-preview-only",
    }

    const processedHtml = interpolateContent(contentHtml, sampleRecipient, testUnsubscribeUrl)

    const finalHtml = buildNewsletterEmailHtml({
      subscriberName: sampleRecipient.name,
      subject: `[TEST] ${subject}`,
      previewText,
      contentHtml: processedHtml,
      unsubscribeUrl: testUnsubscribeUrl,
      isTest: true,
    })

    await transporter.sendMail({
      from: `"deessa Foundation" <${process.env.GOOGLE_EMAIL}>`,
      to: toEmail,
      subject: `[TEST] ${subject}`,
      html: finalHtml,
    })

    return { success: true }
  } catch (err) {
    console.error("[sendTestNewsletterEmail Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send test email",
    }
  }
}

/**
 * Dispatch welcome email to a new subscriber
 */
export async function sendWelcomeNewsletterEmail({
  email,
  name,
  unsubscribeToken,
}: {
  email: string
  name?: string | null
  unsubscribeToken: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createGmailTransporter()
    const siteUrl = getAppBaseUrl()
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`

    const html = buildWelcomeEmailHtml({
      name,
      unsubscribeUrl,
    })

    await transporter.sendMail({
      from: `"deessa Foundation" <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "Welcome to the deessa Foundation Community!",
      html,
    })

    return { success: true }
  } catch (err) {
    console.error("[sendWelcomeNewsletterEmail Error (non-fatal)]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send welcome email",
    }
  }
}

/**
 * Safely broadcast a campaign to all recipients using chunked batch throttling
 */
export async function sendNewsletterCampaignBatch({
  campaignId,
  subject,
  previewText,
  contentHtml,
  recipients,
}: DispatchCampaignParams): Promise<DispatchCampaignResult> {
  const transporter = createGmailTransporter()
  const siteUrl = getAppBaseUrl()

  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Chunk recipients
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE)

    const promises = chunk.map(async (recipient) => {
      try {
        const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(recipient.unsubscribe_token)}`
        const personalizedBody = interpolateContent(contentHtml, recipient, unsubscribeUrl)

        const html = buildNewsletterEmailHtml({
          subscriberName: recipient.name,
          subject,
          previewText,
          contentHtml: personalizedBody,
          unsubscribeUrl,
          campaignId,
          isTest: false,
        })

        await transporter.sendMail({
          from: `"deessa Foundation" <${process.env.GOOGLE_EMAIL}>`,
          to: recipient.email,
          subject,
          html,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        })

        sent += 1
      } catch (err) {
        failed += 1
        const errMsg = err instanceof Error ? err.message : "Unknown dispatch error"
        errors.push(`${recipient.email}: ${errMsg}`)
        console.error(`[Campaign Dispatch Error - ${recipient.email}]:`, err)
      }
    })

    await Promise.all(promises)

    // Jittered pause between chunks to respect SMTP rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
    errors,
  }
}
