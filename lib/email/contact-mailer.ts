/**
 * Contact Form Email Service
 *
 * Handles both:
 *   1. Incoming public submission emails:
 *      - Internal notification → org team (GOOGLE_EMAIL)
 *      - Confirmation reply → the person who submitted the form
 *   2. Administrative staff direct reply emails:
 *      - Official branded response → the inquirer
 *
 * Uses the same Gmail transporter pattern as receipt-mailer.ts and
 * conference-mailer.ts (GOOGLE_EMAIL + GOOGLE_APP_PASSWORD).
 */

"use server"

import nodemailer from "nodemailer"
import { escapeHtml as baseEscapeHtml } from "@/lib/utils/html"

// ── Shared transporter ────────────────────────────────────────────────────────

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

function escapeHtml(str?: string | null): string {
  if (!str) return ""
  return baseEscapeHtml(str).replace(/\n/g, "<br>")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContactEmailParams {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface ContactReplyEmailParams {
  to: string
  toName: string
  originalSubject: string
  originalMessage?: string | null
  replyContent: string
  adminName?: string | null
  adminEmail?: string | null
}

export interface EmailResult {
  success: boolean
  message: string
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

// ── 1. Internal notification email (to org team) ──────────────────────────────

function buildInternalEmail(params: ContactEmailParams): string {
  const adminUrl = `${getSiteUrl()}/admin/contacts?search=${encodeURIComponent(params.email)}`
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Website contact: ${escapeHtml(params.subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 640px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 18px rgba(15,23,42,0.06); }
    .header { background: linear-gradient(90deg,#0f172a 0%,#1e293b 100%); padding: 24px 28px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 24px 28px; }
    .meta { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
    .meta .item { font-size:13px; color:#374151; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 6px; }
    .field .value { font-size: 15px; color: #0f172a; }
    .message-box { background: #fbfdff; border-left: 4px solid #6366f1; border-radius: 6px; padding: 14px 16px; font-size: 14px; color: #111827; line-height: 1.6; }
    .divider { border: none; border-top: 1px solid #eef2f7; margin: 20px 0; }
    .footer { padding: 14px 28px; background: #ffffff; border-top: 1px solid #f1f5f9; font-size: 13px; color: #6b7280; text-align: left; }
    .cta { display: inline-block; background: #0284c7; color: #ffffff !important; padding: 10px 22px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-decoration: none; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New website contact request</h1>
      <p>Submitted via the site contact form — quick details below</p>
    </div>
    <div class="body">
      <div class="meta">
        <div class="item"><strong>From:</strong> ${escapeHtml(params.name)} &lt;${escapeHtml(params.email)}&gt;</div>
        ${params.phone ? `<div class="item"><strong>Phone:</strong> ${escapeHtml(params.phone)}</div>` : ``}
      </div>

      <div class="field">
        <label>Subject</label>
        <div class="value">${escapeHtml(params.subject)}</div>
      </div>

      <div class="field">
        <label>Message</label>
        <div class="message-box">${escapeHtml(params.message)}</div>
      </div>

      <hr class="divider" />

      <div class="field">
        <label>Action</label>
        <div class="value">
          Reply directly to this notification or open the inquiry in the Admin Console:
          <br />
          <a href="${adminUrl}" class="cta">View in Admin CRM &rarr;</a>
        </div>
      </div>
    </div>
    <div class="footer">
      Deesha Foundation CRM — replies can be drafted directly in the Admin Console.
    </div>
  </div>
</body>
</html>
`
}

// ── 2. Confirmation email (to the sender) ─────────────────────────────────────

function buildConfirmationEmail(params: ContactEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7fafc; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 640px; margin: 0 auto; overflow: hidden; box-shadow: 0 6px 24px rgba(2,6,23,0.06); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 20px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.92); margin: 0; font-size: 14px; }
    .body { padding: 24px 28px; }
    .body p { color: #334155; line-height: 1.6; margin: 0 0 14px; font-size: 15px; }
    .summary { background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin: 18px 0; }
    .summary-row { display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; }
    .summary-label { font-weight: 700; color: #6b7280; min-width: 84px; }
    .summary-value { color: #0f172a; }
    .message-box { background: #f6f8ff; border-left: 4px solid #0284c7; border-radius: 6px; padding: 12px 14px; font-size: 14px; color: #111827; line-height: 1.6; margin: 8px 0 18px; }
    .footer { padding: 16px 28px; background: #ffffff; border-top: 1px solid #f1f5f9; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5; }
    a { color: #0284c7; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Thanks — we received your message</h1>
      <p>Deesha Foundation team has received your submission</p>
    </div>
    <div class="body">
      <p>Namaste <strong>${escapeHtml(params.name)}</strong>,</p>
      <p>
        Thank you for contacting the <strong>Deesha Foundation</strong>. A member of our team will review your inquiry and get back to you shortly (typically within 1 business day).
      </p>

      <div class="summary">
        <div class="summary-row">
          <div class="summary-label">Subject:</div>
          <div class="summary-value"><strong>${escapeHtml(params.subject)}</strong></div>
        </div>
        ${params.phone ? `
          <div class="summary-row">
            <div class="summary-label">Phone:</div>
            <div class="summary-value">${escapeHtml(params.phone)}</div>
          </div>
        ` : ""}
      </div>

      <p style="margin-bottom: 6px; font-weight: 600; color: #475569; font-size: 13px;">Your Submitted Message:</p>
      <div class="message-box">${escapeHtml(params.message)}</div>

      <p style="margin-top: 22px;">
        If you have urgent inquiries, feel free to reply directly to this email or reach us through our official hotline.
      </p>
      <p style="margin-top: 14px; color: #64748b;">
        Warm regards,<br />
        <strong>Deesha Foundation Team</strong><br />
        Kathmandu, Nepal
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Deesha Foundation. All rights reserved.<br />
      Visit our website at <a href="${getSiteUrl()}">deesha.org</a>
    </div>
  </div>
</body>
</html>
`
}

// ── 3. Administrative Staff Direct Reply Email ───────────────────────────────

function buildStaffReplyEmailHtml(params: ContactReplyEmailParams): string {
  const staffName = params.adminName || "Deesha Foundation Team"

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Response to your inquiry: ${escapeHtml(params.originalSubject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; border-radius: 14px; max-width: 640px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0 0 6px; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; opacity: 0.95; }
    .body { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .body p { margin: 0 0 16px; }
    .reply-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 18px 20px; border-radius: 8px; font-size: 15px; line-height: 1.65; color: #0f172a; margin: 20px 0; }
    .quote-box { background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin-top: 24px; border: 1px solid #e2e8f0; }
    .quote-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px; }
    .quote-text { font-size: 13px; color: #475569; line-height: 1.5; font-style: italic; }
    .signature { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
    .footer a { color: #0284c7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Deesha Foundation Response</h1>
      <p>Re: ${escapeHtml(params.originalSubject)}</p>
    </div>
    <div class="body">
      <p>Dear <strong>${escapeHtml(params.toName)}</strong>,</p>
      
      <p>Thank you for reaching out to the Deesha Foundation. Regarding your inquiry, our team has reviewed your message:</p>

      <div class="reply-box">
        ${escapeHtml(params.replyContent)}
      </div>

      <p>If you have any further questions or follow-up details to share, please reply directly to this email and we will be glad to assist you.</p>

      ${
        params.originalMessage
          ? `
        <div class="quote-box">
          <div class="quote-title">Original Inquiry (${escapeHtml(params.originalSubject)})</div>
          <div class="quote-text">${escapeHtml(params.originalMessage)}</div>
        </div>
      `
          : ""
      }

      <div class="signature">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${escapeHtml(staffName)}</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Deesha Foundation &bull; Kathmandu, Nepal</p>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Deesha Foundation. All rights reserved.<br />
      Visit our website at <a href="${getSiteUrl()}">deesha.org</a>
    </div>
  </div>
</body>
</html>
`
}

// ── Public Dispatch Handlers ──────────────────────────────────────────────────

/**
 * Sends incoming contact form notifications:
 *   1. Internal alert to organization team
 *   2. Confirmation to the person who submitted the form
 */
export async function sendContactEmails(params: ContactEmailParams): Promise<EmailResult> {
  try {
    const transporter = createGmailTransporter()
    const orgEmail = process.env.GOOGLE_EMAIL!
    const contactEmail = process.env.CONTACT_NOTIFY_EMAIL || orgEmail

    // Send both emails in parallel
    const [internalResult, confirmResult] = await Promise.allSettled([
      // 1. Internal notification
      transporter.sendMail({
        from: `"Deesha Contact Portal" <${orgEmail}>`,
        to: contactEmail,
        replyTo: `"${params.name}" <${params.email}>`,
        subject: `[Contact Form] ${params.subject} — ${params.name}`,
        html: buildInternalEmail(params),
      }),

      // 2. Confirmation to sender
      transporter.sendMail({
        from: `"Deesha Foundation" <${orgEmail}>`,
        to: params.email,
        subject: `We received your message — Deesha Foundation`,
        html: buildConfirmationEmail(params),
      }),
    ])

    if (internalResult.status === "rejected") {
      console.error("Internal contact email failed:", internalResult.reason)
    }
    if (confirmResult.status === "rejected") {
      console.error("Applicant confirmation email failed:", confirmResult.reason)
    }

    return { success: true, message: "Emails sent successfully" }
  } catch (error) {
    console.error("Contact email error:", error)

    if (
      error instanceof Error &&
      error.message.includes("not configured") &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("Email credentials not configured (development mode — skipping dispatch)")
      return { success: true, message: "Email skipped (development mode)" }
    }

    return { success: false, message: "Failed to send confirmation email" }
  }
}

/**
 * Dispatches an official staff reply email directly to an inquirer.
 */
export async function sendContactReplyEmail(
  params: ContactReplyEmailParams
): Promise<EmailResult> {
  const orgEmail = process.env.GOOGLE_EMAIL

  if (!orgEmail || !process.env.GOOGLE_APP_PASSWORD) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[sendContactReplyEmail] Credentials missing in development mode, simulating success")
      return { success: true, message: "Simulated reply in development mode" }
    }
    return { success: false, message: "Google email credentials not configured in environment" }
  }

  try {
    const transporter = createGmailTransporter()
    const fromAddress = `"Deesha Foundation" <${orgEmail}>`
    const replyToAddress = params.adminEmail || orgEmail

    await transporter.sendMail({
      from: fromAddress,
      to: params.to,
      replyTo: replyToAddress,
      subject: `Re: ${params.originalSubject} — Deesha Foundation`,
      html: buildStaffReplyEmailHtml(params),
    })

    return { success: true, message: "Reply dispatched to inquirer successfully" }
  } catch (error) {
    console.error("[sendContactReplyEmail Error]:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to dispatch reply email",
    }
  }
}
