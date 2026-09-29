/**
 * Support Unassignment Email Template
 * Sent when an admin is unassigned from a support report
 */

import { getAppBaseUrl } from '@/lib/utils'
import { escapeHtml } from '@/lib/utils/html'

export interface SupportUnassignmentTemplateProps {
  assigneeName: string
  unassignedBy: string
  reportId: string
  reportSubject: string
  reporterName: string
  issueType?: string
}

export function SupportUnassignmentTemplate({
  assigneeName,
  unassignedBy,
  reportId,
  reportSubject,
  reporterName,
  issueType,
}: SupportUnassignmentTemplateProps): string {
  const safeAssigneeName = escapeHtml(assigneeName || 'there')
  const safeUnassignedBy = escapeHtml(unassignedBy || 'Admin')
  const safeReportId = escapeHtml(reportId)
  const safeSubject = escapeHtml(reportSubject || 'Support Request')
  const safeReporterName = escapeHtml(reporterName)
  const safeIssueType = escapeHtml(issueType || 'General')
  const siteUrl = getAppBaseUrl()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unassigned from Support Report</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="${siteUrl}/logo.png" alt="deessa Foundation" height="40" style="display:block;height:40px;width:auto;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              <table width="100%" cellpadding="0" cellspacing="0">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#64748b 0%,#475569 50%,#64748b 100%);padding:40px 36px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:14px;">🔓</div>
                    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">Unassigned from Report</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.92);font-size:15px;line-height:1.6;">
                      You've been unassigned from a support report by <strong>${safeUnassignedBy}</strong>
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 36px 40px;">
                    <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
                      Hello <strong>${safeAssigneeName}</strong>,
                    </p>

                    <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.7;">
                      You have been unassigned from the following support report. You are no longer responsible for responding to this report.
                    </p>

                    <!-- Report Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #E2E8F0;border-radius:16px;overflow:hidden;margin-bottom:28px;">
                      <tr style="background:linear-gradient(90deg,#F1F5F9,#F8FAFC);">
                        <td style="padding:14px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Support Report</p>
                          <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0F172A;">${safeSubject}</p>
                        </td>
                        <td style="padding:14px 18px;text-align:right;vertical-align:top;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">ID</p>
                          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0F172A;font-family:monospace;">#${safeReportId.slice(0, 8)}</p>
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
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Reporter</td>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Issue Type</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">${safeReporterName}</td>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;text-transform:capitalize;">${safeIssueType}</td>
                            </tr>
                            <tr>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Unassigned By</td>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Status</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;">${safeUnassignedBy}</td>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;">Unassigned</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Box -->
                    <div style="background:#F1F5F9;border:1.5px solid #CBD5E1;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
                      <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                        <strong>ℹ️ No Action Required:</strong> This report is now unassigned and may be reassigned to another team member. You can still view the report for reference if needed.
                      </p>
                    </div>

                    <!-- View Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${siteUrl}/admin/support/${encodeURIComponent(reportId)}"
                             style="display:inline-block;background:#fff;border:2px solid#64748b;color:#64748b;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:12px 32px;letter-spacing:0.3px;">
                            View Report
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                      Questions? Contact the admin team at
                      <a href="mailto:admin@deessa.org.np" style="color:#64748b;">admin@deessa.org.np</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">deessa Foundation — Admin Portal</p>
              <p style="margin:0;font-size:11px;color:#CBD5E1;">
                <a href="${siteUrl}/admin" style="color:#64748b;">Admin Dashboard</a> · 
                <a href="${siteUrl}/admin/support" style="color:#64748b;">Support Center</a>
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
