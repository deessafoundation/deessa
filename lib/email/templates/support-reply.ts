/**
 * Support Reply Email Template
 * Branded HTML template for admin support replies.
 */

import { getAppBaseUrl } from '@/lib/utils'
import { escapeHtml } from '@/lib/utils/html'

export interface SupportReplyTemplateProps {
  recipientName: string
  senderName: string
  subject: string
  message: string
  reportId: string
  reportStatus?: string | null
}

export function SupportReplyTemplate({
  recipientName,
  senderName,
  subject,
  message,
  reportId,
  reportStatus,
}: SupportReplyTemplateProps): string {
  const safeRecipientName = escapeHtml(recipientName || 'there')
  const safeSenderName = escapeHtml(senderName || 'DEESSA Foundation')
  const safeSubject = escapeHtml(subject || 'Support update')
  const safeReportId = escapeHtml(reportId)
  const safeStatus = escapeHtml(reportStatus || 'open')
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')
  const siteUrl = getAppBaseUrl()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="${siteUrl}/logo.png" alt="DEESSA Foundation" height="40" style="display:block;height:40px;width:auto;border:0;" />
              </a>
            </td>
          </tr>

          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#0B5F8A 0%,#3FABDE 50%,#0B5F8A 100%);padding:40px 36px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:14px;">✉️</div>
                    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">Support Update</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.92);font-size:15px;line-height:1.6;">
                      A reply from <strong>${safeSenderName}</strong> regarding your support request.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 36px 40px;">
                    <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
                      Hello <strong>${safeRecipientName}</strong>,
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #E2E8F0;border-radius:16px;overflow:hidden;margin-bottom:28px;">
                      <tr style="background:linear-gradient(90deg,#EFF8FF,#F8FAFC);">
                        <td style="padding:14px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#3FABDE;text-transform:uppercase;letter-spacing:1px;">Support Request</p>
                          <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0F172A;">${safeSubject}</p>
                        </td>
                        <td style="padding:14px 18px;text-align:right;vertical-align:top;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">ID</p>
                          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0F172A;font-family:monospace;">${safeReportId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:0 12px;">
                          <div style="border-top:2px dashed #E2E8F0;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:16px 18px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Sender</td>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Status</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">${safeSenderName}</td>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;text-transform:capitalize;">${safeStatus}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:20px 22px;margin-bottom:28px;">
                      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Message</p>
                      <div style="font-size:15px;color:#0F172A;line-height:1.75;white-space:pre-wrap;">${safeMessage}</div>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${siteUrl}/admin/support/${encodeURIComponent(reportId)}"
                             style="display:inline-block;background:linear-gradient(135deg,#0B5F8A,#3FABDE);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                            View Support Thread
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                      If you need more help, simply reply to this email or contact us at
                      <a href="mailto:support@deessa.org.np" style="color:#3FABDE;">support@deessa.org.np</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0;">
              <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">DEESSA Foundation — Empowering Communities Across Nepal</p>
              <p style="margin:0;font-size:11px;color:#CBD5E1;">
                <a href="${siteUrl}" style="color:#3FABDE;">deessafoundation.com</a>
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
