"use server"

import nodemailer from 'nodemailer'
import { SupportAssignmentTemplate } from './templates/support-assignment'

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD
  if (!user || !pass) throw new Error('GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured')
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

export async function sendSupportAssignmentEmail(opts: {
  to: string
  assigneeName: string
  assignedBy: string
  reportId: string
  reportSubject: string
  reporterName: string
  reporterEmail: string
  issueType?: string
  status?: string
  pageUrl?: string
}) {
  const transporter = createGmailTransporter()
  const orgEmail = process.env.GOOGLE_EMAIL!

  const html = SupportAssignmentTemplate({
    assigneeName: opts.assigneeName,
    assignedBy: opts.assignedBy,
    reportId: opts.reportId,
    reportSubject: opts.reportSubject,
    reporterName: opts.reporterName,
    reporterEmail: opts.reporterEmail,
    issueType: opts.issueType,
    status: opts.status,
    pageUrl: opts.pageUrl,
  })

  await transporter.sendMail({
    from: `"deessa Foundation Admin" <${orgEmail}>`,
    to: opts.to,
    subject: `🔔 New Support Assignment: ${opts.reportSubject}`,
    html,
  })
}
