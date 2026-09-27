import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendSupportReplyEmail } from '@/lib/email/support-reply'
import { sendSupportAssignmentEmail } from '@/lib/email/support-assignment'
import { sendReassignmentEmails } from '@/lib/email/support-reassignment-mailer'
import { sendUnassignmentEmail } from '@/lib/email/support-unassignment-mailer'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, action, payload } = body
    if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })

    const supabase = createServiceRoleClient()

    // require authenticated admin session and resolve performer from admin profile
    let performerFromAuth: string | null = null
    try {
      const currentAdmin = await getCurrentAdmin()
      if (!currentAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      performerFromAuth = currentAdmin.full_name || currentAdmin.email || 'admin'
    } catch (e) {
      console.error('Auth lookup failed', e)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // record the admin action (performed_by always the authenticated user)
    const record = {
      report_id: id,
      action_type: action,
      payload: payload || null,
      performed_by: performerFromAuth,
      created_at: new Date().toISOString(),
    }

    await supabase.from('support_admin_actions').insert(record)

    // also update summary fields on contact_submissions for some actions
    if (action === 'mark-reviewed') {
      await supabase.from('contact_submissions').update({ reviewed: true }).eq('id', id)
    }

    if (action === 'change-status' && payload?.status) {
      await supabase.from('contact_submissions').update({ status: payload.status }).eq('id', id)
    }

    if (action === 'assign' && payload?.assignee) {
      // First, get the current report to check if it's already assigned (reassignment case)
      const { data: currentReport } = await supabase
        .from('contact_submissions')
        .select('assignee, subject, message, name, email, issue_type, status, page_url')
        .eq('id', id)
        .single()
      
      const isReassignment = currentReport?.assignee && currentReport.assignee !== payload.assignee
      
      // Update the assignee
      await supabase.from('contact_submissions').update({ assignee: payload.assignee }).eq('id', id)
      
      // Get the new assignee details from admin_users
      const { data: newAssigneeAdmin } = await supabase
        .from('admin_users')
        .select('email, full_name, user_id')
        .eq('email', payload.assignee)
        .single()
      
      if (newAssigneeAdmin && currentReport) {
        const reportSubject = currentReport.subject || currentReport.message?.split('\n')[0] || 'Support Request'
        
        if (isReassignment) {
          // REASSIGNMENT CASE: Get previous assignee details
          const { data: previousAssigneeAdmin } = await supabase
            .from('admin_users')
            .select('email, full_name, user_id')
            .eq('email', currentReport.assignee)
            .single()
          
          if (previousAssigneeAdmin) {
            // Create notifications for both admins
            await Promise.all([
              // Notification for new assignee
              supabase.from('admin_notifications').insert({
                user_id: newAssigneeAdmin.user_id,
                type: 'assignment',
                title: 'Support Report Reassigned to You',
                message: `A support report has been reassigned to you from ${previousAssigneeAdmin.full_name}: "${reportSubject}"`,
                link: `/admin/support/${id}`,
                metadata: {
                  report_id: id,
                  reporter_name: currentReport.name,
                  reporter_email: currentReport.email,
                  reassigned_by: performerFromAuth,
                  previous_assignee: previousAssigneeAdmin.full_name,
                },
              }),
              // Notification for previous assignee
              supabase.from('admin_notifications').insert({
                user_id: previousAssigneeAdmin.user_id,
                type: 'assignment',
                title: 'Support Report Reassigned',
                message: `Your support report has been reassigned to ${newAssigneeAdmin.full_name}: "${reportSubject}"`,
                link: `/admin/support/${id}`,
                metadata: {
                  report_id: id,
                  reporter_name: currentReport.name,
                  reporter_email: currentReport.email,
                  reassigned_by: performerFromAuth,
                  new_assignee: newAssigneeAdmin.full_name,
                },
              }),
            ])
            
            // Send reassignment emails to both admins
            try {
              await sendReassignmentEmails({
                newAssigneeEmail: newAssigneeAdmin.email,
                newAssigneeName: newAssigneeAdmin.full_name,
                previousAssigneeEmail: previousAssigneeAdmin.email,
                previousAssigneeName: previousAssigneeAdmin.full_name,
                reassignedBy: performerFromAuth,
                reportId: id,
                reportSubject,
                reporterName: currentReport.name,
                reporterEmail: currentReport.email,
                issueType: currentReport.issue_type,
                status: currentReport.status,
              })
            } catch (emailError) {
              console.error('Failed to send reassignment emails:', emailError)
              // Don't fail the reassignment if email fails
            }
          }
        } else {
          // INITIAL ASSIGNMENT CASE
          // Create in-app notification
          await supabase.from('admin_notifications').insert({
            user_id: newAssigneeAdmin.user_id,
            type: 'assignment',
            title: 'New Support Assignment',
            message: `You've been assigned a support report: "${reportSubject}"`,
            link: `/admin/support/${id}`,
            metadata: {
              report_id: id,
              reporter_name: currentReport.name,
              reporter_email: currentReport.email,
              assigned_by: performerFromAuth,
            },
          })
          
          // Send assignment notification email
          try {
            await sendSupportAssignmentEmail({
              to: newAssigneeAdmin.email,
              assigneeName: newAssigneeAdmin.full_name,
              assignedBy: performerFromAuth,
              reportId: id,
              reportSubject,
              reporterName: currentReport.name,
              reporterEmail: currentReport.email,
              issueType: currentReport.issue_type,
              status: currentReport.status,
              pageUrl: currentReport.page_url,
            })
          } catch (emailError) {
            console.error('Failed to send assignment email:', emailError)
            // Don't fail the assignment if email fails
          }
        }
      }
    }

    if (action === 'unassign') {
      // Get the current report to find who was assigned
      const { data: currentReport } = await supabase
        .from('contact_submissions')
        .select('assignee, subject, message, name, issue_type')
        .eq('id', id)
        .single()
      
      if (currentReport?.assignee) {
        // Get the previous assignee details
        const { data: previousAssigneeAdmin } = await supabase
          .from('admin_users')
          .select('email, full_name, user_id')
          .eq('email', currentReport.assignee)
          .single()
        
        if (previousAssigneeAdmin) {
          const reportSubject = currentReport.subject || currentReport.message?.split('\n')[0] || 'Support Request'
          
          // Create in-app notification
          await supabase.from('admin_notifications').insert({
            user_id: previousAssigneeAdmin.user_id,
            type: 'assignment',
            title: 'Unassigned from Support Report',
            message: `You've been unassigned from: "${reportSubject}"`,
            link: `/admin/support/${id}`,
            metadata: {
              report_id: id,
              reporter_name: currentReport.name,
              unassigned_by: performerFromAuth,
            },
          })
          
          // Send unassignment email
          try {
            await sendUnassignmentEmail({
              assigneeEmail: previousAssigneeAdmin.email,
              assigneeName: previousAssigneeAdmin.full_name,
              unassignedBy: performerFromAuth,
              reportId: id,
              reportSubject,
              reporterName: currentReport.name,
              issueType: currentReport.issue_type,
            })
          } catch (emailError) {
            console.error('Failed to send unassignment email:', emailError)
            // Don't fail the unassignment if email fails
          }
        }
      }
      
      // Update the report to remove assignee
      await supabase.from('contact_submissions').update({ assignee: null }).eq('id', id)
    }

    if (action === 'add-note' && payload?.note) {
      // append to internal_notes using a readable timestamp and the admin display name
      const { data } = await supabase.from('contact_submissions').select('internal_notes').eq('id', id).single()
      const existing = data?.internal_notes || ''
      const noteTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const nextLine = `[${noteTime}] ${performerFromAuth}: ${payload.note || ''}`
      const next = existing ? `${existing}\n${nextLine}` : nextLine
      await supabase.from('contact_submissions').update({ internal_notes: next }).eq('id', id)
    }

    if (action === 'archive') {
      await supabase.from('contact_submissions').update({ archived: true }).eq('id', id)
    }

    if (action === 'unarchive') {
      await supabase.from('contact_submissions').update({ archived: false }).eq('id', id)
    }

    if (action === 'send-reply') {
      if (!payload?.to || !payload?.subject || !payload?.message) {
        return NextResponse.json(
          { error: 'A recipient, subject, and message are required to send a reply.' },
          { status: 400 }
        )
      }

      try {
        await sendSupportReplyEmail({
          to: payload.to,
          toName: payload.toName,
          subject: payload.subject,
          message: payload.message,
          reportId: id,
          reportStatus: payload.reportStatus ?? null,
          performed_by: record.performed_by,
        })
      } catch (emailError) {
        console.error('Failed to send support reply email:', emailError)
        const message =
          emailError instanceof Error && emailError.message.includes('not configured')
            ? 'Email is not configured on the server (missing GOOGLE_EMAIL / GOOGLE_APP_PASSWORD).'
            : emailError instanceof Error
              ? `Could not send the reply email: ${emailError.message}`
              : 'Could not send the reply email.'
        return NextResponse.json({ error: message }, { status: 502 })
      }

      // record that a reply was sent (non-fatal — the email already went out)
      const { error: updateError } = await supabase
        .from('contact_submissions')
        .update({ last_reply_sent_at: new Date().toISOString() })
        .eq('id', id)
      if (updateError) {
        console.error('Reply sent but failed to update last_reply_sent_at:', updateError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin support action error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
