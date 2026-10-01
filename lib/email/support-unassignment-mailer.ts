"use server"

import nodemailer from 'nodemailer'
import { SupportUnassignmentTemplate } from './templates/support-unassignment'

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD
  if (!user || !pass) throw new Error('GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured')
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

export async function sendUnassignmentEmail(opts: {
  assigneeEmail: string
  assigneeName: string
  unassignedBy: string
  reportId: string
  reportSubject: string
  reporterName: string
  issueType?: string
}) {
  const transporter = createGmailTransporter()
  const orgEmail = process.env.GOOGLE_EMAIL!

  const html = SupportUnassignmentTemplate({
    assigneeName: opts.assigneeName,
    unassignedBy: opts.unassignedBy,
    reportId: opts.reportId,
    reportSubject: opts.reportSubject,
    reporterName: opts.reporterName,
    issueType: opts.issueType,
  })

  await transporter.sendMail({
    from: `"deessa Foundation Admin" <${orgEmail}>`,
    to: opts.assigneeEmail,
    subject: `🔓 Unassigned from Support Report: ${opts.reportSubject}`,
    html,
  })
}
