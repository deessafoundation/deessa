/**
 * Contact Form Email Service
 *
 * Sends two emails on every contact form submission:
 *   1. Internal notification → org team (GOOGLE_EMAIL)
 *   2. Confirmation reply → the person who submitted the form
 *
 * Uses the same Gmail transporter pattern as receipt-mailer.ts and
 * conference-mailer.ts (GOOGLE_EMAIL + GOOGLE_APP_PASSWORD).
 */

"use server"

import nodemailer from "nodemailer"

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContactEmailParams {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface EmailResult {
  success: boolean
  message: string
}

// ── 1. Internal notification email (to org team) ──────────────────────────────

function buildInternalEmail(params: ContactEmailParams): string {
  const orgEmail = process.env.GOOGLE_EMAIL || ""
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
    a { color: #4f46e5; text-decoration: none; }
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
        <div class="value">Reply to this notification to contact the sender directly, or assign to the appropriate team member.</div>
      </div>
    </div>
    <div class="footer">
      DEESSA Foundation — replies should go to the sender's address above. For internal routing, use your normal inbox labels.
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
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 20px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.92); margin: 0; font-size: 14px; }
    .body { padding: 24px 28px; }
    .body p { color: #334155; line-height: 1.6; margin: 0 0 14px; font-size: 15px; }
    .summary { background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin: 18px 0; }
    .summary-row { display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; }
    .summary-label { font-weight: 700; color: #6b7280; min-width: 84px; }
    .summary-value { color: #0f172a; }
    .message-box { background: #f6f8ff; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 12px 14px; font-size: 14px; color: #111827; line-height: 1.6; margin: 8px 0 18px; }
    .divider { border: none; border-top: 1px solid #eef2f7; margin: 20px 0; }
    .footer { padding: 16px 28px; background: #ffffff; border-top: 1px solid #f1f5f9; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5; }
    a { color: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Thanks — we received your message</h1>
      <p>One of our team members will be in touch as soon as possible.</p>
    </div>
    <div class="body">
      <p>Hi <strong>${escapeHtml(params.name)}</strong>,</p>
      <p>Thanks for contacting DEESSA Foundation. We've received your message and will respond within <strong>1–2 business days</strong>. If your request is urgent, please email <a href="mailto:support@dessafoundation.org">support@dessafoundation.org</a> with the word <strong>URGENT</strong> in the subject line.</p>

      <div class="summary">
        <div class="summary-row">
          <div class="summary-label">Subject</div>
          <div class="summary-value">${escapeHtml(params.subject)}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Sent to</div>
          <div class="summary-value">support@dessafoundation.org</div>
        </div>
      </div>

      <p style="font-size:13px; color:#475569; margin-bottom:6px;">Your message</p>
      <div class="message-box">${escapeHtml(params.message)}</div>

      <hr class="divider" />
      <p style="font-size:14px; margin-bottom:8px;">What happens next: our team will review your message, and a reply will be sent to this email address. If we need additional details, we may follow up requesting clarification.</p>
      <p style="font-size:14px;">Warm regards,<br /><strong>DEESSA Foundation Team</strong></p>
    </div>
    <div class="footer">
      DEESSA Foundation · Thamel, Kathmandu, Nepal 44600<br />
      This is an automated confirmation. To follow up, reply to this message or contact <a href="mailto:support@dessafoundation.org">support@dessafoundation.org</a>.
    </div>
  </div>
</body>
</html>
`
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Sends two emails:
 *   1. Internal notification to the org team's inbox
 *   2. Confirmation to the person who submitted the form
 *
 * Non-fatal — if email fails, the DB submission still succeeds.
 */
export async function sendContactEmails(params: ContactEmailParams): Promise<EmailResult> {
  try {
    const transporter = createGmailTransporter()
    const orgEmail = process.env.GOOGLE_EMAIL!
    const contactEmail = process.env.CONTACT_NOTIFY_EMAIL || orgEmail

    // Send both emails in parallel
    const [internalResult] = await Promise.allSettled([
      // 1. Internal notification (reply-to: sender so the team can reply directly)
      transporter.sendMail({
        from: `"DEESSA Foundation Website" <${orgEmail}>`,
        to: contactEmail,
        replyTo: `"${params.name}" <${params.email}>`,
        subject: `[Contact Form] ${params.subject} — ${params.name}`,
        html: buildInternalEmail(params),
      }),

      // 2. Confirmation to the sender
      transporter.sendMail({
        from: `"DEESSA Foundation" <${orgEmail}>`,
        to: params.email,
        subject: `We received your message — DEESSA Foundation`,
        html: buildConfirmationEmail(params),
      }),
    ])

    if (internalResult.status === "rejected") {
      console.error("Internal contact email failed:", internalResult.reason)
    }

    return { success: true, message: "Emails sent successfully" }
  } catch (error) {
    console.error("Contact email error:", error)

    // In development without credentials, warn and continue
    if (
      error instanceof Error &&
      error.message.includes("not configured") &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("Email not configured — skipping email send (dev mode):", {
        to: params.email,
        subject: params.subject,
      })
      return { success: true, message: "Email skipped (development mode — no credentials)" }
    }

    return { success: false, message: "Failed to send confirmation email" }
  }
}
