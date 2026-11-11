/**
 * Volunteer Email Service
 *
 * Sends transactional notifications for the volunteer lifecycle:
 *   1. Application submission:
 *      - Internal alert ?org team (GOOGLE_EMAIL) with candidate dossier & direct review link
 *      - Confirmation ?applicant with submitted details & timeline
 *   2. Status update (e.g. Approved / Assigned):
 *      - Welcome onboarding email with assigned department and orientation notes
 *
 * Uses nodemailer with GOOGLE_EMAIL + GOOGLE_APP_PASSWORD with non-blocking error handling.
 */

"use server"

import nodemailer from "nodemailer"
import { escapeHtml as baseEscapeHtml } from "@/lib/utils/html"

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

export interface VolunteerApplicationEmailParams {
  id?: string
  fullName: string
  email: string
  phone: string
  occupation?: string | null
  skills: string[]
  availability: string
  interests: string[]
  message?: string | null
}

export interface VolunteerStatusEmailParams {
  fullName: string
  email: string
  status: "approved" | "rejected" | "pending"
  assignedRole?: string | null
  notes?: string | null
}

export interface EmailDispatchResult {
  success: boolean
  message: string
  sentToApplicant?: boolean
  sentToOrg?: boolean
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

// ── 1. Internal notification email (to org team) ──────────────────────────────

function buildInternalVolunteerAlertHtml(params: VolunteerApplicationEmailParams): string {
  const adminUrl = `${getSiteUrl()}/admin/volunteers?search=${encodeURIComponent(params.email)}`
  const skillsBadges = (params.skills || [])
    .map(
      (s) =>
        `<span style="display:inline-block;background:#eff6ff;color:#1e40af;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${escapeHtml(s)}</span>`
    )
    .join(" ")

  const interestsBadges = (params.interests || [])
    .map(
      (i) =>
        `<span style="display:inline-block;background:#f0fdf4;color:#166534;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${escapeHtml(i)}</span>`
    )
    .join(" ")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Volunteer Applicant: ${escapeHtml(params.fullName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; border-radius: 14px; max-width: 640px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 26px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 28px 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .item label { display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 4px; }
    .item .val { font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .section-title { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin: 20px 0 8px; }
    .message-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #334155; margin-top: 6px; }
    .cta-container { text-align: center; margin: 30px 0 10px; }
    .cta-btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(2,132,199,0.25); }
    .footer { padding: 18px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New Volunteer Application</h1>
      <p>A new applicant has registered via the public volunteer portal</p>
    </div>
    <div class="body">
      <div class="grid">
        <div class="item">
          <label>Applicant Name</label>
          <div class="val">${escapeHtml(params.fullName)}</div>
        </div>
        <div class="item">
          <label>Occupation</label>
          <div class="val">${escapeHtml(params.occupation) || "Not provided"}</div>
        </div>
        <div class="item">
          <label>Email Address</label>
          <div class="val"><a href="mailto:${escapeHtml(params.email)}" style="color:#0284c7;text-decoration:none;">${escapeHtml(params.email)}</a></div>
        </div>
        <div class="item">
          <label>Phone Number</label>
          <div class="val"><a href="tel:${escapeHtml(params.phone)}" style="color:#0284c7;text-decoration:none;">${escapeHtml(params.phone)}</a></div>
        </div>
        <div class="item" style="grid-column: 1 / -1;">
          <label>Availability Commitment</label>
          <div class="val" style="text-transform: capitalize;">${escapeHtml(params.availability)}</div>
        </div>
      </div>

      <div class="section-title">Skills & Capabilities</div>
      <div>${skillsBadges || '<span style="color:#94a3b8;font-size:13px;">None selected</span>'}</div>

      <div class="section-title">Program Interests</div>
      <div>${interestsBadges || '<span style="color:#94a3b8;font-size:13px;">None selected</span>'}</div>

      ${
        params.message
          ? `
        <div class="section-title">Statement of Motivation</div>
        <div class="message-box">${escapeHtml(params.message)}</div>
      `
          : ""
      }

      <div class="cta-container">
        <a href="${adminUrl}" class="cta-btn">Open Candidate in Admin CRM &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Deesha Foundation CRM &bull; Direct applicant triage &bull; Accessible via Admin Workspace
    </div>
  </div>
</body>
</html>
`
}

// ── 2. Applicant Confirmation Email ──────────────────────────────────────────

function buildApplicantConfirmationHtml(params: VolunteerApplicationEmailParams): string {
  const firstName = params.fullName.split(" ")[0] || params.fullName

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Applying to Volunteer with Deesha Foundation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; border-radius: 14px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 32px 28px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 14px; opacity: 0.95; }
    .body { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px 22px; margin: 22px 0; }
    .highlight-box h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; }
    .steps { list-style: none; padding: 0; margin: 0; }
    .steps li { position: relative; padding-left: 28px; margin-bottom: 12px; font-size: 14px; }
    .steps li::before { content: "✓"; position: absolute; left: 0; top: 0; width: 20px; height: 20px; background: #0284c7; color: #ffffff; border-radius: 50%; font-size: 11px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; }
    .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: center; }
    .footer a { color: #0284c7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Welcome to the Mission, ${escapeHtml(firstName)}!</h1>
      <p>Your volunteer application has been received with gratitude</p>
    </div>
    <div class="body">
      <p>Namaste <strong>${escapeHtml(params.fullName)}</strong>,</p>
      <p>
        Thank you for offering your energy, skills, and heart to the <strong>Deesha Foundation</strong>. Grassroots empowerment and transformative community initiatives across Nepal depend on compassionate volunteers like you.
      </p>

      <div class="highlight-box">
        <h3>What Happens Next</h3>
        <ul class="steps">
          <li><strong>Application Review:</strong> Our volunteer coordination team will review your background and availability against active field & remote programs.</li>
          <li><strong>Outreach:</strong> You will hear back within 3 to 5 business days with next steps or an introductory onboarding sync.</li>
          <li><strong>Placement:</strong> We match your preferred skills with community programs where you will create the deepest tangible impact.</li>
        </ul>
      </div>

      <p>
        If you have urgent questions, need to update your availability, or have portfolio materials to share, please reply directly to this email or reach us at <a href="mailto:info@deesha.org" style="color:#0284c7;">info@deesha.org</a>.
      </p>

      <p style="margin-top: 28px;">
        With sincere gratitude,<br />
        <strong>The Deesha Foundation Team</strong><br />
        <span style="font-size:13px;color:#64748b;">Kathmandu, Nepal</span>
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

// ── 3. Volunteer Status Decision Email (Approved / Assigned) ─────────────────

function buildStatusDecisionHtml(params: VolunteerStatusEmailParams): string {
  const isApproved = params.status === "approved"
  const firstName = params.fullName.split(" ")[0] || params.fullName

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isApproved ? "Welcome to the Team!" : "Update on your Deesha Application"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; border-radius: 14px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: ${isApproved ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "linear-gradient(135deg, #475569 0%, #334155 100%)"}; padding: 32px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; }
    .header p { margin: 0; font-size: 14px; opacity: 0.95; }
    .body { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .body p { margin: 0 0 16px; }
    .role-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 16px; font-weight: 700; font-size: 15px; margin: 12px 0 18px; }
    .notes-box { background: #f8fafc; border-left: 4px solid ${isApproved ? "#059669" : "#64748b"}; padding: 14px 18px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 16px 0; }
    .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: center; }
    .footer a { color: #059669; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${isApproved ? "Congratulations, You're Approved!" : "Volunteer Application Update"}</h1>
      <p>${isApproved ? "We are thrilled to welcome you to Deesha Foundation" : "Thank you for your commitment to our mission"}</p>
    </div>
    <div class="body">
      <p>Namaste <strong>${escapeHtml(params.fullName)}</strong>,</p>

      ${
        isApproved
          ? `
        <p>We are delighted to inform you that your volunteer application with <strong>Deesha Foundation</strong> has been <strong>approved</strong>!</p>
        
        ${
          params.assignedRole
            ? `
          <p>You have been assigned to the following department / initiative:</p>
          <div class="role-badge">🌟 ${escapeHtml(params.assignedRole)}</div>
        `
            : ""
        }

        ${
          params.notes
            ? `
          <p><strong>Coordinator Notes:</strong></p>
          <div class="notes-box">${escapeHtml(params.notes)}</div>
        `
            : ""
        }

        <p>Our volunteer coordinator will be reaching out to schedule your onboarding session and share details about your first assignment.</p>
      `
          : `
        <p>Thank you so much for your interest in volunteering with Deesha Foundation. At this moment, we are unable to match your application with our current open field positions.</p>
        
        ${
          params.notes
            ? `
          <div class="notes-box">${escapeHtml(params.notes)}</div>
        `
            : ""
        }

        <p>We have kept your profile in our candidate pool and will gladly reach out when new opportunities aligning with your skills arise.</p>
      `
      }

      <p style="margin-top: 28px;">
        Warm regards,<br />
        <strong>Volunteer Management Team</strong><br />
        Deesha Foundation
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Deesha Foundation. All rights reserved.
    </div>
  </div>
</body>
</html>
`
}

// ── Main Public Dispatch Functions ───────────────────────────────────────────

/**
 * Dispatches notification emails when a new volunteer registers.
 * Non-blocking: failures are logged without interrupting the caller.
 */
export async function sendVolunteerApplicationEmails(
  params: VolunteerApplicationEmailParams
): Promise<EmailDispatchResult> {
  const orgEmail = process.env.GOOGLE_EMAIL

  if (!orgEmail || !process.env.GOOGLE_APP_PASSWORD) {
    console.warn("[VolunteerMailer] Email credentials not configured; skipping email dispatch")
    return {
      success: false,
      message: "Email credentials not configured",
      sentToApplicant: false,
      sentToOrg: false,
    }
  }

  let transporter: nodemailer.Transporter
  try {
    transporter = createGmailTransporter()
  } catch (err) {
    console.error("[VolunteerMailer] Failed to create transporter:", err)
    return { success: false, message: "Mailer initialization failed" }
  }

  const results: { org: boolean; applicant: boolean } = { org: false, applicant: false }

  // 1. Send Internal Alert to Organization Team
  try {
    await transporter.sendMail({
      from: `"Deesha Volunteer Portal" <${orgEmail}>`,
      to: orgEmail,
      replyTo: params.email,
      subject: `New Volunteer Application: ${params.fullName} (${params.skills?.slice(0, 2).join(", ") || "General"})`,
      html: buildInternalVolunteerAlertHtml(params),
    })
    results.org = true
  } catch (err) {
    console.error("[VolunteerMailer] Failed to send internal notification email:", err)
  }

  // 2. Send Confirmation Email to Applicant
  try {
    await transporter.sendMail({
      from: `"Deesha Foundation" <${orgEmail}>`,
      to: params.email,
      subject: `Application Received - Volunteer with Deesha Foundation`,
      html: buildApplicantConfirmationHtml(params),
    })
    results.applicant = true
  } catch (err) {
    console.error("[VolunteerMailer] Failed to send applicant confirmation email:", err)
  }

  return {
    success: results.org || results.applicant,
    message: results.org && results.applicant ? "All emails dispatched successfully" : "Partial email delivery",
    sentToOrg: results.org,
    sentToApplicant: results.applicant,
  }
}

/**
 * Dispatches a status decision email to the candidate when their application is updated.
 */
export async function sendVolunteerStatusEmail(
  params: VolunteerStatusEmailParams
): Promise<EmailDispatchResult> {
  const orgEmail = process.env.GOOGLE_EMAIL

  if (!orgEmail || !process.env.GOOGLE_APP_PASSWORD) {
    console.warn("[VolunteerMailer] Email credentials not configured; skipping status email")
    return { success: false, message: "Email credentials not configured" }
  }

  try {
    const transporter = createGmailTransporter()
    await transporter.sendMail({
      from: `"Deesha Foundation" <${orgEmail}>`,
      to: params.email,
      subject:
        params.status === "approved"
          ? "Welcome to the Deesha Foundation Team! 🎉"
          : "Update Regarding Your Volunteer Application with Deesha Foundation",
      html: buildStatusDecisionHtml(params),
    })

    return { success: true, message: "Status email sent to candidate", sentToApplicant: true }
  } catch (err) {
    console.error("[VolunteerMailer] Failed to send status email to applicant:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to send status update email",
    }
  }
}
