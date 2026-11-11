/**
 * Newsletter & Campaign Email Template
 * Responsive, email-client safe HTML template for Deesha Foundation newsletters.
 *
 * Design guidelines:
 * - Email-client safe inline CSS table layout (Outlook, Apple Mail, Gmail, Yahoo compatible)
 * - Brand palette: Deesha Warm White, Ocean Blue (#0B5F8A / #3FABDE), Charcoal (#1e293b)
 * - CAN-SPAM / GDPR mandatory footer with physical contact and 1-click unsubscribe
 * - Dynamic merge tags support ({{name}}, {{unsubscribe_url}})
 */

import { getAppBaseUrl } from "@/lib/utils"
import { escapeHtml } from "@/lib/utils/html"

export interface NewsletterEmailTemplateProps {
  subscriberName?: string | null
  subject: string
  previewText?: string | null
  contentHtml: string
  unsubscribeUrl: string
  campaignId?: string
  isTest?: boolean
}

export function buildNewsletterEmailHtml({
  subscriberName,
  subject,
  previewText,
  contentHtml,
  unsubscribeUrl,
  campaignId,
  isTest = false,
}: NewsletterEmailTemplateProps): string {
  const siteUrl = getAppBaseUrl()
  const currentYear = new Date().getFullYear()
  const recipientGreeting = subscriberName && subscriberName.trim()
    ? `Dear ${escapeHtml(subscriberName.trim())},`
    : "Dear Supporter & Community Friend,"

  // Archive web link if campaignId provided
  const webVersionUrl = campaignId
    ? `${siteUrl}/newsletter-archive/${encodeURIComponent(campaignId)}`
    : `${siteUrl}/newsletter-archive`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px !important; margin: 0 auto !important; }
    .content-body p { margin-top: 0; margin-bottom: 16px; font-size: 16px; line-height: 1.6; color: #334155; }
    .content-body h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
    .content-body h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px; }
    .content-body h3 { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 16px; margin-bottom: 8px; }
    .content-body ul, .content-body ol { margin-top: 0; margin-bottom: 16px; padding-left: 24px; font-size: 16px; line-height: 1.6; color: #334155; }
    .content-body li { margin-bottom: 6px; }
    .content-body blockquote { border-left: 4px solid #3FABDE; margin: 16px 0; padding: 10px 16px; background-color: #f0fdf4; color: #0f172a; font-style: italic; }
    .content-body a { color: #0B5F8A; text-decoration: underline; }
    .content-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  ${
    previewText
      ? `<div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
          ${escapeHtml(previewText)}
          ${"&nbsp;&zwnj;".repeat(80)}
        </div>`
      : ""
  }

  ${
    isTest
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-bottom: 2px solid #f59e0b;">
          <tr>
            <td align="center" style="padding: 10px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #92400e;">
              [TEST BROADCAST] This is a preview email dispatched for internal review only.
            </td>
          </tr>
        </table>`
      : ""
  }

  <!-- Main Background Container -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Email Card Box -->
        <table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B5F8A 0%, #033a59 100%); padding: 32px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        deessa Foundation
                      </span>
                    </a>
                    <p style="margin: 6px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 500; color: #bae6fd; letter-spacing: 0.5px; text-transform: uppercase;">
                      Empowering Autistic Children & Families in Nepal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Body -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #0f172a; line-height: 1.5;">
                ${recipientGreeting}
              </p>

              <!-- Dynamic Content -->
              <div class="content-body" style="color: #334155; font-size: 16px; line-height: 1.65;">
                ${contentHtml}
              </div>

              <!-- Warm Sign-off -->
              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                  Warm regards,
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  The deessa Foundation Community Team
                </p>
              </div>

            </td>
          </tr>

          <!-- Compliance & Legal Footer (CAN-SPAM / GDPR) -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                You are receiving this communication because you subscribed to updates from <strong>deessa Foundation</strong>.
              </p>
              
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">
                deessa Foundation · Kathmandu, Nepal · Registered Non-Profit Organization
              </p>

              <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px; font-size: 12px;">
                    <a href="${siteUrl}" target="_blank" style="color: #0B5F8A; text-decoration: underline;">Visit Website</a>
                  </td>
                  <td style="color: #cbd5e1;">·</td>
                  <td style="padding: 0 8px; font-size: 12px;">
                    <a href="${webVersionUrl}" target="_blank" style="color: #0B5F8A; text-decoration: underline;">View in Browser</a>
                  </td>
                  <td style="color: #cbd5e1;">·</td>
                  <td style="padding: 0 8px; font-size: 12px;">
                    <a href="${unsubscribeUrl}" target="_blank" style="color: #dc2626; text-decoration: underline; font-weight: 500;">Unsubscribe</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0 0; font-size: 11px; color: #94a3b8;">
                © ${currentYear} deessa Foundation. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildWelcomeEmailHtml({
  name,
  unsubscribeUrl,
}: {
  name?: string | null
  unsubscribeUrl: string
}): string {
  const siteUrl = getAppBaseUrl()

  const welcomeBody = `
    <p>Welcome to the <strong>deessa Foundation</strong> community! We are honored to have you with us on our journey to empower autistic children and their families across Nepal.</p>
    
    <p>As a subscriber to our community updates, you will receive:</p>
    <ul>
      <li>Inspiring firsthand stories from families and changemakers.</li>
      <li>Invitations to upcoming training sessions, inclusive workshops, and conferences.</li>
      <li>Milestones and transparent impact reports from our ground-level initiatives.</li>
      <li>Practical educational resources and neurodiversity advocacy insights.</li>
    </ul>

    <p style="margin-top: 24px;">
      <a href="${siteUrl}/whatwedo" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 14px;">
        Explore Our Initiatives →
      </a>
    </p>

    <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
      If you ever have any questions, ideas, or feedback, you can reply directly to this email or reach us anytime at <a href="${siteUrl}/contact" style="color: #0B5F8A;">our contact center</a>.
    </p>
  `

  return buildNewsletterEmailHtml({
    subscriberName: name,
    subject: "Welcome to deessa Foundation Community!",
    previewText: "Thank you for joining our mission to empower autistic children and families in Nepal.",
    contentHtml: welcomeBody,
    unsubscribeUrl,
  })
}
