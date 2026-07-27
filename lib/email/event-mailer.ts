/**
 * Event Email Service
 * Sends emails using event-specific templates from event_email_templates table.
 *
 * Uses the same nodemailer/Gmail pattern as conference-mailer.ts
 */

"use server"

import nodemailer from "nodemailer"
import { getAppBaseUrl } from "@/lib/utils"
import { interpolateTemplate } from "@/lib/utils/template-interpolation"

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD

  if (!user || !pass) {
    throw new Error("GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}

export interface EventEmailResult {
  success: boolean
  message: string
  messageId?: string
}

interface SendEventEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail(
  params: SendEventEmailParams
): Promise<EventEmailResult> {
  try {
    const transporter = createGmailTransporter()

    const info = await transporter.sendMail({
      from: `"DEESSA Foundation" <${process.env.GOOGLE_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@deessafoundation.com?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    console.log("Event email sent:", info.messageId)
    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Event email error:", error)
    if (error instanceof Error && error.message.includes("not configured")) {
      console.warn("Email not configured — skipping email send.")
      return { success: false, message: "Email service not configured" }
    }
    return { success: false, message: "Failed to send email" }
  }
}

/**
 * Build HTML email from event template with variable interpolation.
 */
function buildEmailHtml(
  templateHtml: string,
  vars: Record<string, string>
): string {
  const interpolated = interpolateTemplate(templateHtml, vars)

  // Wrap in basic email template if not already wrapped
  if (!interpolated.includes("<html")) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          ${interpolated}
        </div>
      </body>
      </html>
    `
  }

  return interpolated
}

/**
 * Send a confirmation email using the event's confirmation template.
 */
export async function sendEventConfirmationEmail(params: {
  to: string
  fullName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  ticketName?: string
  ticketPrice?: string
  registrationId: string
  templateHtml: string
  templateSubject: string
}): Promise<EventEmailResult> {
  const vars = {
    full_name: params.fullName,
    email: params.to,
    event_title: params.eventTitle,
    event_date: params.eventDate,
    event_location: params.eventLocation,
    ticket_name: params.ticketName || "",
    ticket_price: params.ticketPrice || "Free",
    registration_id: params.registrationId,
    site_url: getAppBaseUrl(),
  }

  const subject = interpolateTemplate(params.templateSubject, vars)
  const html = buildEmailHtml(params.templateHtml, vars)

  return sendEmail({ to: params.to, subject, html })
}

/**
 * Send a cancellation email using the event's cancellation template.
 */
export async function sendEventCancellationEmail(params: {
  to: string
  fullName: string
  eventTitle: string
  eventDate: string
  registrationId: string
  templateHtml: string
  templateSubject: string
}): Promise<EventEmailResult> {
  const vars = {
    full_name: params.fullName,
    email: params.to,
    event_title: params.eventTitle,
    event_date: params.eventDate,
    registration_id: params.registrationId,
    site_url: getAppBaseUrl(),
  }

  const subject = interpolateTemplate(params.templateSubject, vars)
  const html = buildEmailHtml(params.templateHtml, vars)

  return sendEmail({ to: params.to, subject, html })
}

/**
 * Send a reminder email using the event's reminder template.
 */
export async function sendEventReminderEmail(params: {
  to: string
  fullName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  templateHtml: string
  templateSubject: string
}): Promise<EventEmailResult> {
  const vars = {
    full_name: params.fullName,
    email: params.to,
    event_title: params.eventTitle,
    event_date: params.eventDate,
    event_location: params.eventLocation,
    site_url: getAppBaseUrl(),
  }

  const subject = interpolateTemplate(params.templateSubject, vars)
  const html = buildEmailHtml(params.templateHtml, vars)

  return sendEmail({ to: params.to, subject, html })
}

/**
 * Send a custom email with admin-provided subject and body.
 */
export async function sendEventCustomEmail(params: {
  to: string
  subject: string
  body: string
}): Promise<EventEmailResult> {
  // Convert plain text to basic HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="white-space:pre-wrap;line-height:1.6;color:#333;">
          ${params.body.replace(/\n/g, "<br>")}
        </div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#999;">
          Sent by DEESSA Foundation Admin
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: params.to, subject: params.subject, html })
}
