/**
 * Default Email Templates for Event Module
 *
 * These are generalized versions of the conference design system,
 * using {{variable}} placeholders that get interpolated at send time.
 *
 * Design system:
 * - Inline styles only (email-client safe)
 * - Ocean Blue brand (#3FABDE / #0B5F8A)
 * - DEESSA brand badge
 * - Ticket-style cards with dashed dividers
 * - Consistent CTA button hierarchy
 * - Table-based layout (Outlook/Gmail/Apple Mail compatible)
 */

import { escapeHtml } from "@/lib/utils/html"

interface DefaultTemplate {
  subject: string
  body_html: string
}

// ── Shared helpers ──────────────────────────────────────────────────────────

const BRANDBadge = `
<a href="{{site_url}}" target="_blank" style="text-decoration:none;display:inline-block;">
  <img src="{{site_url}}/logo.png" alt="DEESSA Foundation" height="40" style="display:block;height:40px;width:auto;border:0;" />
</a>`

const FOOTER = `
<tr>
  <td align="center" style="padding:28px 0;">
    <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">DEESSA Foundation — Empowering Communities Across Nepal<br/>Thamel, Kathmandu, Nepal 44600</p>
    <p style="margin:0;font-size:11px;color:#CBD5E1;">
      You're receiving this because you registered at
      <a href="{{event_url}}" style="color:#3FABDE;">deessafoundation.com</a>
    </p>
  </td>
</tr>`

// ── 1. Confirmation Template ────────────────────────────────────────────────

export function defaultConfirmationTemplate(): DefaultTemplate {
  return {
    subject: "Your Registration is Confirmed! — {{event_title}}",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed — {{event_title}}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              ${BRANDBadge}
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

              <!-- Celebration Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0B5F8A 0%,#3FABDE 50%,#0B5F8A 100%);padding:48px 40px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:16px;">&#127881;</div>
                  <h1 style="margin:0 0 8px;color:#fff;font-size:30px;font-weight:800;line-height:1.2;">
                    You're Confirmed, {{full_name}}!
                  </h1>
                  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:16px;line-height:1.5;">
                    Your spot at <strong>{{event_title}}</strong><br />is officially secured.
                  </p>
                </td>
              </tr>

              <!-- Confirmed badge -->
              <tr>
                <td align="center" style="padding:20px 40px 0;background:#fff;">
                  <span style="display:inline-block;background:#DCFCE7;color:#15803D;font-size:13px;font-weight:700;padding:6px 18px;border-radius:100px;border:1.5px solid #BBF7D0;letter-spacing:0.3px;">
                    &#10003; &nbsp;Registration Confirmed
                  </span>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px 40px;">

                  <!-- Ticket Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #E2E8F0;border-radius:16px;overflow:hidden;margin-bottom:32px;">
                    <!-- Ticket Header -->
                    <tr style="background:linear-gradient(90deg,#EFF8FF,#F8FAFC);">
                      <td style="padding:16px 20px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#3FABDE;text-transform:uppercase;letter-spacing:1px;">{{event_title}}</p>
                        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#0F172A;">{{event_date}}</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#64748B;">{{event_location}}</p>
                      </td>
                      <td style="padding:16px 20px;text-align:right;vertical-align:top;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">ID</p>
                        <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0F172A;font-family:monospace;">{{registration_id}}</p>
                      </td>
                    </tr>
                    <!-- Dashed divider -->
                    <tr>
                      <td colspan="2" style="padding:0 12px;">
                        <div style="border-top:2px dashed #E2E8F0;"></div>
                      </td>
                    </tr>
                    <!-- Ticket Details -->
                    <tr>
                      <td colspan="2" style="padding:16px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Attendee</td>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Ticket</td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">{{full_name}}</td>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">{{ticket_name}}</td>
                          </tr>
                          <tr>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Email</td>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Price</td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;">{{email}}</td>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;">{{ticket_price}}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Event Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF8FF;border:1.5px solid #BAE0FF;border-radius:12px;margin-bottom:24px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0B5F8A;">&#128197; &nbsp;Event Details</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#1E6FA8;line-height:1.6;"><strong>Date:</strong> {{event_date}}</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#1E6FA8;line-height:1.6;"><strong>Location:</strong> {{event_location}}</p>
                        <p style="margin:0;font-size:13px;color:#1E6FA8;line-height:1.6;"><strong>Venue:</strong> {{venue_name}}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <a href="{{event_url}}"
                           style="display:inline-block;background:#3FABDE;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                          View Event Details
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                    Questions? <a href="mailto:{{contact_email}}" style="color:#3FABDE;">{{contact_email}}</a>
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          ${FOOTER}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

// ── 2. Payment Receipt Template ─────────────────────────────────────────────

export function defaultPaymentReceiptTemplate(): DefaultTemplate {
  return {
    subject: "Payment Received — {{event_title}}",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt — {{event_title}}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              ${BRANDBadge}
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0B5F8A 0%,#3FABDE 50%,#0B5F8A 100%);padding:48px 40px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:16px;">&#128176;</div>
                  <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">
                    Payment Confirmed!
                  </h1>
                  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:16px;line-height:1.5;">
                    Thank you <strong>{{full_name}}</strong> for your payment.<br />
                    Your registration for <strong>{{event_title}}</strong> is now confirmed.
                  </p>
                </td>
              </tr>

              <!-- Success badge -->
              <tr>
                <td align="center" style="padding:20px 40px 0;background:#fff;">
                  <span style="display:inline-block;background:#DCFCE7;color:#15803D;font-size:13px;font-weight:700;padding:6px 18px;border-radius:100px;border:1.5px solid #BBF7D0;letter-spacing:0.3px;">
                    &#10003; &nbsp;Payment Successful
                  </span>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px 40px;">

                  <!-- Receipt Ticket Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #E2E8F0;border-radius:16px;overflow:hidden;margin-bottom:32px;">
                    <!-- Ticket Header -->
                    <tr style="background:linear-gradient(90deg,#EFF8FF,#F8FAFC);">
                      <td style="padding:16px 20px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#3FABDE;text-transform:uppercase;letter-spacing:1px;">Payment Receipt</p>
                        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#0F172A;">{{event_title}}</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#64748B;">{{event_date}}</p>
                      </td>
                      <td style="padding:16px 20px;text-align:right;vertical-align:top;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">Registration ID</p>
                        <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#0F172A;font-family:monospace;">{{registration_id}}</p>
                      </td>
                    </tr>
                    <!-- Dashed divider -->
                    <tr>
                      <td colspan="2" style="padding:0 12px;">
                        <div style="border-top:2px dashed #E2E8F0;"></div>
                      </td>
                    </tr>
                    <!-- Details -->
                    <tr>
                      <td colspan="2" style="padding:16px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Attendee</td>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;width:50%;">Ticket</td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">{{full_name}}</td>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;padding-bottom:12px;">{{ticket_name}}</td>
                          </tr>
                          <tr>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Email</td>
                            <td style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Amount Paid</td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;font-weight:600;color:#0F172A;">{{email}}</td>
                            <td style="font-size:14px;font-weight:600;color:#15803D;">{{ticket_price}}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <a href="{{event_url}}"
                           style="display:inline-block;background:#3FABDE;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                          View Event Details
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                    Questions? <a href="mailto:{{contact_email}}" style="color:#3FABDE;">{{contact_email}}</a>
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          ${FOOTER}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

// ── 3. Reminder Template ────────────────────────────────────────────────────

export function defaultReminderTemplate(): DefaultTemplate {
  return {
    subject: "Reminder: {{event_title}} is coming up!",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Event Reminder — {{event_title}}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              ${BRANDBadge}
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0B5F8A 0%,#3FABDE 50%,#0B5F8A 100%);padding:48px 40px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:16px;">&#9200;</div>
                  <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">
                    See You Soon, {{full_name}}!
                  </h1>
                  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:16px;line-height:1.5;">
                    This is a friendly reminder about<br /><strong>{{event_title}}</strong>
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px 40px;">

                  <!-- Event Info Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF8FF;border:1.5px solid #BAE0FF;border-radius:12px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:24px;">
                        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0B5F8A;">&#128197; &nbsp;Event Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;font-size:14px;color:#1E6FA8;width:120px;vertical-align:top;"><strong>Event:</strong></td>
                            <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:600;">{{event_title}}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-size:14px;color:#1E6FA8;vertical-align:top;"><strong>Date:</strong></td>
                            <td style="padding:8px 0;font-size:14px;color:#0F172A;">{{event_date}}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-size:14px;color:#1E6FA8;vertical-align:top;"><strong>Location:</strong></td>
                            <td style="padding:8px 0;font-size:14px;color:#0F172A;">{{event_location}}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-size:14px;color:#1E6FA8;vertical-align:top;"><strong>Venue:</strong></td>
                            <td style="padding:8px 0;font-size:14px;color:#0F172A;">{{venue_name}}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Ticket Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:12px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#15803D;">&#127915; &nbsp;Your Registration</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#166534;line-height:1.6;"><strong>Ticket:</strong> {{ticket_name}}</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#166534;line-height:1.6;"><strong>Registration ID:</strong> <span style="font-family:monospace;">{{registration_id}}</span></p>
                        <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;"><strong>Email:</strong> {{email}}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- What to Bring -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0F172A;">&#128221; &nbsp;What to Bring</p>
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:4px 8px 4px 0;font-size:13px;color:#475569;">&#10003;</td>
                            <td style="padding:4px 0;font-size:13px;color:#475569;line-height:1.5;">Your registration confirmation (this email or screenshot)</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 8px 4px 0;font-size:13px;color:#475569;">&#10003;</td>
                            <td style="padding:4px 0;font-size:13px;color:#475569;line-height:1.5;">Valid photo ID</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 8px 4px 0;font-size:13px;color:#475569;">&#10003;</td>
                            <td style="padding:4px 0;font-size:13px;color:#475569;line-height:1.5;">Any required materials for your ticket type</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <a href="{{event_url}}"
                           style="display:inline-block;background:#3FABDE;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                          View Event Details
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
                    Questions? <a href="mailto:{{contact_email}}" style="color:#3FABDE;">{{contact_email}}</a>
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          ${FOOTER}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

// ── 4. Cancellation Template ────────────────────────────────────────────────

export function defaultCancellationTemplate(): DefaultTemplate {
  return {
    subject: "Registration Cancelled — {{event_title}}",
    body_html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Cancelled — {{event_title}}</title>
</head>
<body style="margin:0;padding:0;background:#FFF5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              ${BRANDBadge}
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(185,28,28,0.12);">

              <!-- Red header -->
              <tr>
                <td style="background:linear-gradient(135deg,#991B1B 0%,#DC2626 50%,#B91C1C 100%);padding:48px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                    <tr>
                      <td align="center" valign="middle"
                          style="width:72px;height:72px;background:rgba(255,255,255,0.25);border-radius:50%;font-size:34px;line-height:72px;text-align:center;font-weight:700;color:#fff;">
                        &#10005;
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,0.15);">
                    Registration Cancelled
                  </h1>
                  <p style="margin:0;color:rgba(255,255,255,0.92);font-size:15px;line-height:1.6;">
                    Hi {{full_name}}, your registration for<br />
                    <strong>{{event_title}}</strong><br />
                    has been cancelled.
                  </p>
                </td>
              </tr>

              <!-- Accent bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#991B1B,#DC2626,#EF4444);"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px 40px;">

                  <!-- Summary card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #FEE2E2;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                    <tr style="background:#FFF5F5;">
                      <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid #FEE2E2;width:42%;">
                        Registration ID
                      </td>
                      <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#1E293B;font-family:monospace;border-bottom:1px solid #FEE2E2;">
                        {{registration_id}}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid #FEE2E2;">
                        Attendee
                      </td>
                      <td style="padding:14px 20px;font-size:14px;color:#1E293B;border-bottom:1px solid #FEE2E2;">
                        {{full_name}}
                      </td>
                    </tr>
                    <tr style="background:#FFF5F5;">
                      <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.6px;">
                        Status
                      </td>
                      <td style="padding:14px 20px;">
                        <span style="display:inline-block;background:#FEE2E2;color:#DC2626;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;">
                          Cancelled
                        </span>
                      </td>
                    </tr>
                  </table>

                  <!-- Re-register note -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1.5px solid #FCA5A5;border-radius:14px;margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#991B1B;">&#128260; &nbsp;Want to re-register?</p>
                        <p style="margin:0;font-size:13px;color:#7F1D1D;line-height:1.7;">
                          If you believe this was done in error, please contact us immediately.
                          You can also register again if registration is still open.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTAs -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center" style="padding-bottom:12px;">
                        <a href="{{event_url}}"
                           style="display:inline-block;background:linear-gradient(135deg,#DC2626,#B91C1C);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;padding:14px 36px;letter-spacing:0.3px;">
                          Register Again
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <a href="mailto:{{contact_email}}"
                           style="display:inline-block;background:#F9FAFB;border:1.5px solid #E2E8F0;color:#374151;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;padding:12px 28px;">
                          Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.7;text-align:center;">
                    Questions? Email us at
                    <a href="mailto:{{contact_email}}" style="color:#DC2626;">{{contact_email}}</a>
                  </p>
                </td>
              </tr>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">DEESSA Foundation — Empowering Communities Across Nepal<br/>Thamel, Kathmandu, Nepal 44600</p>
              <p style="margin:0;font-size:11px;color:#CBD5E1;">
                <a href="{{event_url}}" style="color:#DC2626;">deessafoundation.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

// ── Export all defaults ──────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES = {
  confirmation: defaultConfirmationTemplate,
  payment_receipt: defaultPaymentReceiptTemplate,
  reminder: defaultReminderTemplate,
  cancellation: defaultCancellationTemplate,
} as const

export function getDefaultTemplateHtml(type: keyof typeof DEFAULT_TEMPLATES): DefaultTemplate {
  return DEFAULT_TEMPLATES[type]()
}
