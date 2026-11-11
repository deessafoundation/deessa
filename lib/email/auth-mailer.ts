/**
 * Admin Authentication Email Service
 * Sends transactional password recovery emails using Google Email (Gmail / Workspace).
 */

"use server"

import nodemailer from "nodemailer"
import { escapeHtml } from "@/lib/utils/html"

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

export interface SendAdminPasswordResetEmailParams {
  toEmail: string
  recipientName: string
  resetUrl: string
  requestedByAdminName?: string
}

export interface EmailResult {
  success: boolean
  message: string
  messageId?: string
}

export async function sendAdminPasswordResetEmail({
  toEmail,
  recipientName,
  resetUrl,
  requestedByAdminName,
}: SendAdminPasswordResetEmailParams): Promise<EmailResult> {
  try {
    const transporter = createGmailTransporter()
    const senderEmail = process.env.GOOGLE_EMAIL!

    const safeName = escapeHtml(recipientName)
    const safeUrl = resetUrl
    const safeAdmin = requestedByAdminName ? escapeHtml(requestedByAdminName) : "A Super Administrator"

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Administrator Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 4px;">
                      deessa Foundation
                    </span>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                      Administrative Password Reset
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                ${safeAdmin} has initiated a password reset for your administrative account. Please click the button below to set your confidential password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td style="border-radius: 10px; background-color: #0f172a;">
                    <a href="${safeUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      Set New Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Information Bento -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin: 24px 0 20px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
                  Security Advisory
                </p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #475569;">
                  <li>This link is cryptographically signed and expires in <strong>24 hours</strong>.</li>
                  <li>This link can only be used once. After saving, old links will be invalidated.</li>
                  <li>Super administrators will never ask for your password.</li>
                </ul>
              </div>

              <!-- Fallback Plain-Text Link -->
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; word-break: break-all; font-family: monospace; font-size: 11px; color: #0f172a; background-color: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                ${safeUrl}
              </p>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;">

              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request this password reset or believe this email was sent in error, please contact a super administrator immediately to secure your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} deessa Foundation · Management Portal Identity Services
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const info = await transporter.sendMail({
      from: `"deessa Foundation IAM" <${senderEmail}>`,
      to: toEmail,
      subject: "Action Required: Reset Your Administrator Password",
      html: htmlContent,
    })

    return {
      success: true,
      message: "Password reset email dispatched successfully.",
      messageId: info.messageId,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to dispatch email"
    console.error("[sendAdminPasswordResetEmail Error]:", errorMsg)
    return {
      success: false,
      message: errorMsg,
    }
  }
}
