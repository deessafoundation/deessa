/**
 * Support Reassignment Email Template
 * Sent when a support report is reassigned from one admin to another
 */

import { getAppBaseUrl } from '@/lib/utils'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface SupportReassignmentTemplateProps {
  assigneeName: string
  previousAssignee: string
  reassignedBy: string
  reportId: string
  reportSubject: string
  reporterName: string
  reporterEmail: string
  issueType?: string
  status?: string
  isNewAssignee: boolean // true for new assignee, false for previous assignee
}

export function SupportReassignmentTemplate({
  assigneeName,
  previousAssignee,
  reassignedBy,
  reportId,
  reportSubject,
  reporterName,
  reporterEmail,
  issueType,
  status,
  isNewAssignee,
}: SupportReassignmentTemplateProps): string {
  const safeAssigneeName = escapeHtml(assigneeName || 'there')
  const safePreviousAssignee = escapeHtml(previousAssignee)
  const safeReassignedBy = escapeHtml(reassignedBy || 'Admin')
  const safeReportId = escapeHtml(reportId)
  const safeSubject = escapeHtml(reportSubject || 'Support Request')
  const safeReporterName = escapeHtml(reporterName)
  const safeReporterEmail = escapeHtml(reporterEmail)
  const safeIssueType = escapeHtml(issueType || 'General')
  const safeStatus = escapeHtml(status || 'open')
  const siteUrl = getAppBaseUrl()

  // Different content for new assignee vs previous assignee
  const headerGradient = isNewAssignee 
    ? 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#6366F1 100%)'
    : 'linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#f59e0b 100%)'
  
  const headerIcon = isNewAssignee ? '🔄' : '↩️'
  const headerTitle = isNewAssignee ? 'Report Reassigned to You' : 'Report Reassigned'
  const headerSubtitle = isNewAssignee
    ? `This report was reassigned from ${safePreviousAssignee} by ${safeReassignedBy}`
    : `This report has been reassigned to ${assigneeName}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#3FABDE;border-radius:12px;padding:10px 16px;">
                    <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">DEESSA</span>
                    <span style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-left:8px;">Foundation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              <table width="100%" cellpadding="0" cellspacing="0">
                
                <!-- Header -->
                <tr>
                  <td style="background:${headerGradient};padding:40px 36px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:14px;">${headerIcon}</div>
                    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">${headerTitle}</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.92);font-size:15px;line-height:1.6;">
                      ${headerSubtitle}
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 36px 40px;">
                    <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
                      Hello <strong>${safeAssigneeName}</strong>,
                    </p>

                    ${isNewAssignee ? `
                    <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.7;">
                      A support report has been reassigned to you from <strong>${safePreviousAssignee}</strong>. Please review the details below and take appropriate action.
                    </p>
                    ` : `
                    <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.7;">
                      The support report you were working on has been reassigned to <strong>${safeAssigneeName}</strong>. You are no longer responsible for this report.
                    </p>
                    `}

                    <!-- Report Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #E2E8F0;border-radius:16px;overflow:hidden;margin-bottom:28px;">
                      <tr style="background:linear-gradient(90deg,${isNewAssignee ? '#F5F3FF' : '#FEF3C7'},#F8FAFC);">
                        <td style="padding:14px 18px;">
                          <p style="margin:0;font-size:11px;font-weight:700;color:${isNewAssignee ? '#8B5CF6' : '#d97706'};text-transform:uppercase;letter-spacing:1px;">Support Report</p>
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
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">
                                ${safeReporterName}<br/>
                                <span style="font-size:12px;color:#64748B;font-weight:400;">${safeReporterEmail}</span>
                              </td>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;text-transform:capitalize;">${safeIssueType}</td>
                            </tr>
                            <tr>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Status</td>
                              <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Reassigned By</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;text-transform:capitalize;">${safeStatus}</td>
                              <td style="font-size:14px;font-weight:600;color:#0F172A;">${safeReassignedBy}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:0 12px;">
                          <div style="border-top:2px dashed #E2E8F0;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:16px 18px;">
                          <p style="margin:0 0 6px;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;">Assignment History</p>
                          <p style="margin:0;font-size:13px;color:#0F172A;">
                            <strong>Previous:</strong> ${safePreviousAssignee}<br/>
                            <strong>Current:</strong> ${safeAssigneeName}
                          </p>
                        </td>
                      </tr>
                    </table>

                    ${isNewAssignee ? `
                    <!-- Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${siteUrl}/admin/support/${encodeURIComponent(reportId)}"
                             style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                            View & Respond
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Box -->
                    <div style="background:#FEF3C7;border:1.5px solid #FCD34D;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
                      <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                        <strong>⚡ Action Required:</strong> Please review this report and continue where ${safePreviousAssignee} left off. Check the activity timeline for any notes or updates.
                      </p>
                    </div>
                    ` : `
                    <!-- Info Box for Previous Assignee -->
                    <div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
                      <p style="margin:0;font-size:13px;color:#1E40AF;line-height:1.6;">
                        <strong>ℹ️ No Action Required:</strong> This report has been reassigned to ${safeAssigneeName}. You can still view the report for reference, but you are no longer responsible for responding.
                      </p>
                    </div>

                    <!-- View Button for Previous Assignee -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${siteUrl}/admin/support/${encodeURIComponent(reportId)}"
                             style="display:inline-block;background:#fff;border:2px solid #d97706;color:#d97706;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:12px 32px;letter-spacing:0.3px;">
                            View Report (Read-Only)
                          </a>
                        </td>
                      </tr>
                    </table>
                    `}

                    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                      Questions? Contact the admin team at
                      <a href="mailto:admin@deessa.org.np" style="color:${isNewAssignee ? '#8B5CF6' : '#d97706'};">admin@deessa.org.np</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">DEESSA Foundation — Admin Portal</p>
              <p style="margin:0;font-size:11px;color:#CBD5E1;">
                <a href="${siteUrl}/admin" style="color:${isNewAssignee ? '#8B5CF6' : '#d97706'};">Admin Dashboard</a> · 
                <a href="${siteUrl}/admin/support" style="color:${isNewAssignee ? '#8B5CF6' : '#d97706'};">Support Center</a>
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
