/**
 * Support Form Email Service
 *
 * Sends two emails on every support form submission (bug reports, feature requests):
 *   1. Internal notification → support team (GOOGLE_EMAIL)
 *   2. Confirmation reply → the person who submitted the report
 *
 * Different from contact-mailer.ts - focused on technical support/bugs
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

function escapeHtml(str: string): string {
  return baseEscapeHtml(str).replace(/\n/g, "<br>")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupportEmailParams {
  name: string
  email: string
  issueType: string
  summary: string
  details: string
  pageUrl?: string
  browserInfo?: string
  screenshotName?: string
}

export interface EmailResult {
  success: boolean
  message: string
}

// ── 1. Internal notification email (to support team) ──────────────────────────

function buildInternalSupportEmail(params: SupportEmailParams): string {
  const getIssueIcon = (type: string) => {
    if (type.toLowerCase().includes('bug')) return '🐛'
    if (type.toLowerCase().includes('feature')) return '💡'
    if (type.toLowerCase().includes('improvement')) return '✨'
    return '📋'
  }

  const getIssueBadgeColor = (type: string) => {
    if (type.toLowerCase().includes('bug')) return 'background:#fee2e2;color:#991b1b;'
    if (type.toLowerCase().includes('feature')) return 'background:#dbeafe;color:#1e40af;'
    if (type.toLowerCase().includes('improvement')) return 'background:#fef3c7;color:#92400e;'
    return 'background:#f3f4f6;color:#374151;'
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Support Report: ${escapeHtml(params.summary)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 680px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 18px rgba(15,23,42,0.06); }
    .header { background: linear-gradient(135deg,#dc2626 0%,#ea580c 100%); padding: 28px 32px; text-align: center; }
    .header .icon { font-size: 48px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.92); margin: 0; font-size: 14px; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .meta { background: #f8fafc; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .meta-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { font-weight: 700; color: #64748b; min-width: 100px; }
    .meta-value { color: #0f172a; word-break: break-word; }
    .field { margin-bottom: 20px; }
    .field label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
    .field .value { font-size: 15px; color: #0f172a; line-height: 1.6; }
    .summary-box { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 16px; font-size: 15px; font-weight: 600; color: #92400e; margin-bottom: 20px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; font-size: 14px; color: #334155; line-height: 1.7; }
    .tech-info { background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin-top: 20px; }
    .tech-info-item { font-size: 13px; color: #475569; margin-bottom: 8px; }
    .tech-info-item:last-child { margin-bottom: 0; }
    .tech-info-label { font-weight: 700; color: #334155; }
    .action-box { background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 16px 18px; margin-top: 24px; }
    .action-box p { margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6; }
    .divider { border: none; border-top: 1px solid #eef2f7; margin: 24px 0; }
    .footer { padding: 16px 32px; background: #ffffff; border-top: 1px solid #f1f5f9; font-size: 13px; color: #6b7280; text-align: center; }
    a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">${getIssueIcon(params.issueType)}</div>
      <h1>New Support Report</h1>
      <p>Technical issue reported via website support form</p>
    </div>
    <div class="body">
      <div class="badge" style="${getIssueBadgeColor(params.issueType)}">${escapeHtml(params.issueType)}</div>

      <div class="meta">
        <div class="meta-row">
          <div class="meta-label">Reporter:</div>
          <div class="meta-value">${escapeHtml(params.name)} &lt;${escapeHtml(params.email)}&gt;</div>
        </div>
        ${params.screenshotName ? `
        <div class="meta-row">
          <div class="meta-label">Screenshot:</div>
          <div class="meta-value">✅ ${escapeHtml(params.screenshotName)} (view in admin panel)</div>
        </div>
        ` : ''}
      </div>

      <div class="field">
        <label>Summary</label>
        <div class="summary-box">${escapeHtml(params.summary)}</div>
      </div>

      <div class="field">
        <label>Detailed Description</label>
        <div class="details-box">${escapeHtml(params.details)}</div>
      </div>

      ${params.pageUrl || params.browserInfo ? `
      <div class="tech-info">
        <div class="field">
          <label style="margin-bottom: 10px;">Technical Context</label>
        </div>
        ${params.pageUrl ? `
        <div class="tech-info-item">
          <span class="tech-info-label">Page URL:</span> 
          <a href="${escapeHtml(params.pageUrl)}" target="_blank">${escapeHtml(params.pageUrl)}</a>
        </div>
        ` : ''}
        ${params.browserInfo ? `
        <div class="tech-info-item">
          <span class="tech-info-label">Browser:</span> ${escapeHtml(params.browserInfo)}
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="action-box">
        <p><strong>⚡ Action Required:</strong> Review this report in the admin panel, assign to a team member, and respond within 24 hours. Reply to this email to contact the reporter directly.</p>
      </div>
    </div>
    <div class="footer">
      DEESSA Foundation Support Team · <a href="mailto:support@deessafoundation.com">support@deessafoundation.com</a>
    </div>
  </div>
</body>
</html>
`
}

// ── 2. Confirmation email (to the reporter) ───────────────────────────────────

function buildSupportConfirmationEmail(params: SupportEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Support Report Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7fafc; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 640px; margin: 0 auto; overflow: hidden; box-shadow: 0 6px 24px rgba(2,6,23,0.06); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center; }
    .header .icon { font-size: 56px; margin-bottom: 14px; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.92); margin: 0; font-size: 15px; }
    .body { padding: 28px 32px; }
    .body p { color: #334155; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
    .summary-box { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .summary-label { font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .summary-value { font-size: 16px; font-weight: 600; color: #14532d; }
    .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px 18px; margin: 20px 0; }
    .info-box p { margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6; }
    .steps { background: #f8fafc; border-radius: 10px; padding: 20px 24px; margin: 20px 0; }
    .step { display: flex; gap: 14px; margin-bottom: 16px; }
    .step:last-child { margin-bottom: 0; }
    .step-number { flex-shrink: 0; width: 28px; height: 28px; background: #3b82f6; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
    .step-content { flex: 1; padding-top: 2px; }
    .step-title { font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 4px; }
    .step-desc { font-size: 13px; color: #64748b; line-height: 1.5; }
    .divider { border: none; border-top: 1px solid #eef2f7; margin: 24px 0; }
    .footer { padding: 20px 32px; background: #ffffff; border-top: 1px solid #f1f5f9; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.6; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">✅</div>
      <h1>Report Received Successfully</h1>
      <p>Our support team will review your report shortly</p>
    </div>
    <div class="body">
      <p>Hi <strong>${escapeHtml(params.name)}</strong>,</p>
      <p>Thank you for taking the time to report this issue. We've received your support report and our technical team will investigate it as soon as possible.</p>

      <div class="summary-box">
        <div class="summary-label">Your Report</div>
        <div class="summary-value">${escapeHtml(params.summary)}</div>
      </div>

      <div class="info-box">
        <p><strong>📋 Report Type:</strong> ${escapeHtml(params.issueType)}<br />
        <strong>📧 Confirmation sent to:</strong> ${escapeHtml(params.email)}</p>
      </div>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Review & Assignment</div>
            <div class="step-desc">Our team will review your report and assign it to the appropriate developer or support specialist.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Investigation</div>
            <div class="step-desc">We'll investigate the issue, reproduce it if possible, and determine the best solution.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Resolution & Update</div>
            <div class="step-desc">You'll receive an email update once we've resolved the issue or need more information from you.</div>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <p style="font-size:14px; margin-bottom:8px;"><strong>Expected Response Time:</strong> We aim to respond within <strong>24-48 hours</strong> for most reports. Critical bugs affecting many users will be prioritized.</p>
      
      <p style="font-size:14px; margin-bottom:8px;"><strong>Need Urgent Help?</strong> If this is a critical issue affecting your work, please email <a href="mailto:support@deessafoundation.com">support@deessafoundation.com</a> with <strong>URGENT</strong> in the subject line.</p>

      <p style="font-size:14px; margin-top:20px;">Thank you for helping us improve!<br /><strong>DEESSA Foundation Support Team</strong></p>
    </div>
    <div class="footer">
      DEESSA Foundation · Thamel, Kathmandu, Nepal 44600<br />
      Questions? Reply to this email or contact <a href="mailto:support@deessafoundation.com">support@deessafoundation.com</a>
    </div>
  </div>
</body>
</html>
`
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Sends two emails for support reports:
 *   1. Internal notification to the support team
 *   2. Confirmation to the person who submitted the report
 *
 * Non-fatal — if email fails, the DB submission still succeeds.
 */
export async function sendSupportEmails(params: SupportEmailParams): Promise<EmailResult> {
  try {
    const transporter = createGmailTransporter()
    const orgEmail = process.env.GOOGLE_EMAIL!
    const supportEmail = process.env.SUPPORT_NOTIFY_EMAIL || orgEmail

    // Send both emails in parallel
    const [internalResult, confirmationResult] = await Promise.allSettled([
      // 1. Internal notification (reply-to: reporter so team can reply directly)
      transporter.sendMail({
        from: `"DEESSA Support System" <${orgEmail}>`,
        to: supportEmail,
        replyTo: `"${params.name}" <${params.email}>`,
        subject: `[Support] ${params.issueType}: ${params.summary}`,
        html: buildInternalSupportEmail(params),
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@deessafoundation.com?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),

      // 2. Confirmation to the reporter
      transporter.sendMail({
        from: `"DEESSA Foundation Support" <${orgEmail}>`,
        to: params.email,
        subject: `Support Report Received — ${params.issueType}`,
        html: buildSupportConfirmationEmail(params),
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@deessafoundation.com?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    ])

    if (internalResult.status === "rejected") {
      console.error("Internal support email failed:", internalResult.reason)
    }

    if (confirmationResult.status === "rejected") {
      console.error("Support confirmation email failed:", confirmationResult.reason)
    }

    return { success: true, message: "Support emails sent successfully" }
  } catch (error) {
    console.error("Support email error:", error)

    // In development without credentials, warn and continue
    if (
      error instanceof Error &&
      error.message.includes("not configured") &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("Email not configured — skipping email send (dev mode):", {
        to: params.email,
        issueType: params.issueType,
      })
      return { success: true, message: "Email skipped (development mode — no credentials)" }
    }

    return { success: false, message: "Failed to send support confirmation email" }
  }
}
