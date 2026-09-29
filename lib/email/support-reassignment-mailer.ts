"use server"

import nodemailer from 'nodemailer'
import { SupportReassignmentTemplate } from './templates/support-reassignment'

function createGmailTransporter() {
  const user = process.env.GOOGLE_EMAIL
  const pass = process.env.GOOGLE_APP_PASSWORD
  if (!user || !pass) throw new Error('GOOGLE_EMAIL or GOOGLE_APP_PASSWORD not configured')
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

export async function sendReassignmentEmails(opts: {
  newAssigneeEmail: string
  newAssigneeName: string
  previousAssigneeEmail: string
  previousAssigneeName: string
  reassignedBy: string
  reportId: string
  reportSubject: string
  reporterName: string
  reporterEmail: string
  issueType?: string
  status?: string
}) {
  const transporter = createGmailTransporter()
  const orgEmail = process.env.GOOGLE_EMAIL!

  // Email to new assignee (action required)
  const newAssigneeHtml = SupportReassignmentTemplate({
    assigneeName: opts.newAssigneeName,
    previousAssignee: opts.previousAssigneeName,
    reassignedBy: opts.reassignedBy,
    reportId: opts.reportId,
    reportSubject: opts.reportSubject,
    reporterName: opts.reporterName,
    reporterEmail: opts.reporterEmail,
    issueType: opts.issueType,
    status: opts.status,
    isNewAssignee: true,
  })

  // Email to previous assignee (informational)
  const previousAssigneeHtml = SupportReassignmentTemplate({
    assigneeName: opts.newAssigneeName,
    previousAssignee: opts.previousAssigneeName,
    reassignedBy: opts.reassignedBy,
    reportId: opts.reportId,
    reportSubject: opts.reportSubject,
    reporterName: opts.reporterName,
    reporterEmail: opts.reporterEmail,
    issueType: opts.issueType,
    status: opts.status,
    isNewAssignee: false,
  })

  // Send both emails
  await Promise.all([
    transporter.sendMail({
      from: `"deessa Foundation Admin" <${orgEmail}>`,
      to: opts.newAssigneeEmail,
      subject: `🔄 Support Report Reassigned to You: ${opts.reportSubject}`,
      html: newAssigneeHtml,
    }),
    transporter.sendMail({
      from: `"deessa Foundation Admin" <${orgEmail}>`,
      to: opts.previousAssigneeEmail,
      subject: `↩️ Support Report Reassigned: ${opts.reportSubject}`,
      html: previousAssigneeHtml,
    }),
  ])
}
