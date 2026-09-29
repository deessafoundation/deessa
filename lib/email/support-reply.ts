"use server"

import nodemailer from 'nodemailer'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { SupportReplyTemplate } from './templates/support-reply'

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD
  if (!user || !pass) throw new Error('GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured')
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

export async function sendSupportReplyEmail(opts: { to: string; toName?: string; subject: string; message: string; reportId: string; reportStatus?: string | null; performed_by?: string }) {
  const transporter = createGmailTransporter()
  const orgEmail = process.env.GOOGLE_EMAIL!

  const senderName = opts.performed_by || 'deessa Foundation'
  const html = SupportReplyTemplate({
    recipientName: opts.toName || 'there',
    senderName,
    subject: opts.subject,
    message: opts.message,
    reportId: opts.reportId,
    reportStatus: opts.reportStatus,
  })

  // Fail fast with a clear error if the SMTP credentials are wrong/unreachable.
  try {
    await transporter.verify()
  } catch (verifyError) {
    const detail = verifyError instanceof Error ? verifyError.message : String(verifyError)
    throw new Error(`Email server connection failed: ${detail}`)
  }

  await transporter.sendMail({
    from: `"deessa Foundation" <${orgEmail}>`,
    to: opts.to,
    subject: opts.subject,
    html,
  })

  // Log reply in support_admin_actions table (preserve who performed it when provided).
  // The email already went out — a logging failure must not surface as a send failure.
  try {
    const supabase = createServiceRoleClient()
    await supabase.from('support_admin_actions').insert({
      report_id: opts.reportId,
      action_type: 'sent-reply',
      payload: { to: opts.to, subject: opts.subject, reportStatus: opts.reportStatus ?? null },
      performed_by: opts.performed_by || 'admin',
      created_at: new Date().toISOString(),
    })
  } catch (logError) {
    console.error('Support reply sent but audit log insert failed:', logError)
  }
}
