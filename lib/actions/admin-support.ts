"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { logAdminActivity } from "@/lib/audit/audit-logger"
import { sendSupportReplyEmail } from "@/lib/email/support-reply"
import { sendSupportAssignmentEmail } from "@/lib/email/support-assignment"
import { sendReassignmentEmails } from "@/lib/email/support-reassignment-mailer"
import { sendUnassignmentEmail } from "@/lib/email/support-unassignment-mailer"
import {
  fetchSupportTicketById,
  getSupportScreenshotSignedUrl,
  normalizeSupportStatus,
  type SupportTicket,
} from "@/lib/data/support"

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed"

export interface UpdateSupportStatusInput {
  id: string
  status: SupportStatus
  adminNotes?: string
}

export interface AssignSupportTicketInput {
  id: string
  assigneeEmail: string | null
  notes?: string
}

export interface SaveSupportNotesInput {
  id: string
  internalNotes: string
}

export interface SendSupportReplyInput {
  id: string
  replyContent: string
  markResolved?: boolean
}

/**
 * Verify administrator authentication and contact/support module permissions
 */
async function getAuthorizedAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Administrator session required")
  }
  if (!hasPermission(admin.role, "contacts")) {
    throw new Error("Forbidden: You do not have permission to manage support reports")
  }
  return admin
}

/**
 * Update the status of a support ticket with unified activity_logs and support_admin_actions
 */
export async function updateSupportStatus(input: UpdateSupportStatusInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const normalizedStatus = normalizeSupportStatus(input.status)

    const updatePayload: Record<string, unknown> = {
      status: normalizedStatus,
      reviewed: true,
    }

    if (input.adminNotes !== undefined) {
      updatePayload.internal_notes = input.adminNotes.trim() || null
    }

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update(updatePayload)
      .eq("id", input.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const adminIdentity = admin.full_name || admin.email || admin.id

    // 1. Unified system audit log
    void logAdminActivity({
      action: `SUPPORT_STATUS_${normalizedStatus.toUpperCase()}`,
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: input.id,
      description: `Updated support ticket #${input.id} status to ${normalizedStatus}`,
      newData: {
        status: normalizedStatus,
        notes: input.adminNotes || null,
        reviewed_by: adminIdentity,
      },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    // 2. Legacy support_admin_actions audit log for backward-compatible timelines
    try {
      await serviceSupabase.from("support_admin_actions").insert({
        report_id: input.id,
        action_type: "change-status",
        payload: { status: normalizedStatus, notes: input.adminNotes || null },
        performed_by: adminIdentity,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Non-fatal if legacy table is omitted
    }

    revalidatePath("/admin/support")
    revalidatePath(`/admin/support/${input.id}`)
    revalidatePath("/admin")

    return { success: true, status: normalizedStatus }
  } catch (err) {
    console.error("[updateSupportStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update support ticket status",
    }
  }
}

/**
 * Assign, reassign, or unassign a support ticket with team notifications & mailers
 */
export async function assignSupportTicket(input: AssignSupportTicketInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    // 1. Fetch current ticket to detect assignment transition
    const { data: current, error: fetchError } = await serviceSupabase
      .from("contact_submissions")
      .select("id, name, email, subject, message, status, assignee, issue_type, page_url")
      .eq("id", input.id)
      .single()

    if (fetchError || !current) {
      return { success: false, error: "Support report not found" }
    }

    const performer = admin.full_name || admin.email || "Administrator"
    const targetEmail =
      input.assigneeEmail === "unassigned" || !input.assigneeEmail ? null : input.assigneeEmail
    const reportSubject =
      current.subject || current.issue_type || current.message?.split("\n")[0] || "Support Request"

    // Transition from 'open' to 'in_progress' upon first assignment
    const newStatus =
      current.status === "open" && targetEmail ? "in_progress" : current.status || "open"

    const updatePayload: Record<string, unknown> = {
      assignee: targetEmail,
      status: newStatus,
      reviewed: true,
    }

    if (input.notes) {
      updatePayload.internal_notes = input.notes.trim()
    }

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update(updatePayload)
      .eq("id", input.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 2. Handle Team Notifications & Email Dispatching
    if (targetEmail) {
      // Fetch new assignee profile
      const { data: newAssignee } = await serviceSupabase
        .from("admin_users")
        .select("email, full_name, user_id")
        .eq("email", targetEmail)
        .single()

      const isReassignment = current.assignee && current.assignee !== targetEmail

      if (newAssignee) {
        if (isReassignment) {
          // Reassignment case: notify both new and previous assignees
          const { data: previousAssignee } = await serviceSupabase
            .from("admin_users")
            .select("email, full_name, user_id")
            .eq("email", current.assignee)
            .single()

          if (previousAssignee) {
            await Promise.allSettled([
              // In-app for new
              serviceSupabase.from("admin_notifications").insert({
                user_id: newAssignee.user_id,
                type: "assignment",
                title: "Support Report Reassigned to You",
                message: `A support ticket has been reassigned to you from ${previousAssignee.full_name}: "${reportSubject}"`,
                link: `/admin/support/${input.id}`,
                metadata: {
                  report_id: input.id,
                  reporter_name: current.name,
                  reporter_email: current.email,
                  reassigned_by: performer,
                  previous_assignee: previousAssignee.full_name,
                },
              }),
              // In-app for previous
              serviceSupabase.from("admin_notifications").insert({
                user_id: previousAssignee.user_id,
                type: "assignment",
                title: "Support Report Reassigned",
                message: `Your support ticket has been reassigned to ${newAssignee.full_name}: "${reportSubject}"`,
                link: `/admin/support/${input.id}`,
                metadata: {
                  report_id: input.id,
                  reporter_name: current.name,
                  reporter_email: current.email,
                  reassigned_by: performer,
                  new_assignee: newAssignee.full_name,
                },
              }),
              // Dual email dispatch
              sendReassignmentEmails({
                newAssigneeEmail: newAssignee.email,
                newAssigneeName: newAssignee.full_name,
                previousAssigneeEmail: previousAssignee.email,
                previousAssigneeName: previousAssignee.full_name,
                reassignedBy: performer,
                reportId: input.id,
                reportSubject,
                reporterName: current.name,
                reporterEmail: current.email,
                issueType: current.issue_type || undefined,
                status: newStatus,
              }),
            ])
          }
        } else {
          // Initial assignment case
          await Promise.allSettled([
            serviceSupabase.from("admin_notifications").insert({
              user_id: newAssignee.user_id,
              type: "assignment",
              title: "New Support Ticket Assigned",
              message: `You've been assigned a support ticket: "${reportSubject}"`,
              link: `/admin/support/${input.id}`,
              metadata: {
                report_id: input.id,
                reporter_name: current.name,
                reporter_email: current.email,
                assigned_by: performer,
              },
            }),
            sendSupportAssignmentEmail({
              to: newAssignee.email,
              assigneeName: newAssignee.full_name,
              assignedBy: performer,
              reportId: input.id,
              reportSubject,
              reporterName: current.name,
              reporterEmail: current.email,
              issueType: current.issue_type || undefined,
              status: newStatus,
              pageUrl: current.page_url || undefined,
            }),
          ])
        }
      }
    } else if (current.assignee && !targetEmail) {
      // Unassigned case
      const { data: previousAssignee } = await serviceSupabase
        .from("admin_users")
        .select("email, full_name, user_id")
        .eq("email", current.assignee)
        .single()

      if (previousAssignee) {
        await Promise.allSettled([
          serviceSupabase.from("admin_notifications").insert({
            user_id: previousAssignee.user_id,
            type: "assignment",
            title: "Unassigned from Support Report",
            message: `You have been unassigned from: "${reportSubject}"`,
            link: `/admin/support/${input.id}`,
          }),
          sendUnassignmentEmail({
            assigneeEmail: previousAssignee.email,
            assigneeName: previousAssignee.full_name,
            unassignedBy: performer,
            reportId: input.id,
            reportSubject,
            reporterName: current.name,
            issueType: current.issue_type || undefined,
          }),
        ])
      }
    }

    // 3. System activity log
    void logAdminActivity({
      action: targetEmail ? "SUPPORT_ASSIGNED" : "SUPPORT_UNASSIGNED",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: input.id,
      description: targetEmail
        ? `Assigned support ticket #${input.id} to ${targetEmail}`
        : `Unassigned support ticket #${input.id}`,
      newData: {
        assignee: targetEmail,
        assigned_by: performer,
      },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    // 4. Legacy timeline action
    try {
      await serviceSupabase.from("support_admin_actions").insert({
        report_id: input.id,
        action_type: targetEmail ? "assign" : "unassign",
        payload: { assignee: targetEmail },
        performed_by: performer,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Non-fatal
    }

    revalidatePath("/admin/support")
    revalidatePath(`/admin/support/${input.id}`)
    revalidatePath("/admin")

    return { success: true, assignee: targetEmail }
  } catch (err) {
    console.error("[assignSupportTicket Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign support ticket",
    }
  }
}

/**
 * Save internal technical notes on a support report
 */
export async function saveSupportInternalNotes(input: SaveSupportNotesInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const performer = admin.full_name || admin.email || "Administrator"
    const timestampStr = new Date().toISOString()
    const formattedNote = `[${timestampStr}] ${performer}: ${input.internalNotes.trim()}`

    // Fetch existing notes to append
    const { data: current } = await serviceSupabase
      .from("contact_submissions")
      .select("internal_notes")
      .eq("id", input.id)
      .single()

    const updatedNotes = current?.internal_notes
      ? `${current.internal_notes}\n${formattedNote}`
      : formattedNote

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({ internal_notes: updatedNotes })
      .eq("id", input.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: "SUPPORT_NOTE_SAVED",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: input.id,
      description: `Saved internal note on support ticket #${input.id}`,
      newData: { note: input.internalNotes.trim(), author: performer },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    try {
      await serviceSupabase.from("support_admin_actions").insert({
        report_id: input.id,
        action_type: "add-note",
        payload: { note: input.internalNotes.trim() },
        performed_by: performer,
        created_at: timestampStr,
      })
    } catch {
      // Non-fatal
    }

    revalidatePath("/admin/support")
    revalidatePath(`/admin/support/${input.id}`)

    return { success: true }
  } catch (err) {
    console.error("[saveSupportInternalNotes Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save internal note",
    }
  }
}

/**
 * Dispatch an official reply email to the reporter and optionally mark as resolved
 */
export async function sendSupportReply(input: SendSupportReplyInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    // 1. Fetch ticket details
    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("contact_submissions")
      .select("id, name, email, subject, issue_type, status")
      .eq("id", input.id)
      .single()

    if (fetchError || !ticket) {
      return { success: false, error: "Support report not found" }
    }

    const performer = admin.full_name || admin.email || "deessa Support Team"
    const subject = `Re: [${ticket.issue_type || "Support"}] ${ticket.subject || "Your Report"}`

    // 2. Dispatch email
    await sendSupportReplyEmail({
      to: ticket.email,
      toName: ticket.name,
      subject,
      message: input.replyContent.trim(),
      reportId: input.id,
      reportStatus: input.markResolved ? "resolved" : ticket.status,
      performed_by: performer,
    })

    // 3. Update status and reply timestamp
    const updatePayload: Record<string, unknown> = {
      last_reply_sent_at: new Date().toISOString(),
      reviewed: true,
    }

    if (input.markResolved) {
      updatePayload.status = "resolved"
    }

    await serviceSupabase
      .from("contact_submissions")
      .update(updatePayload)
      .eq("id", input.id)

    // 4. Log to activity_logs
    void logAdminActivity({
      action: "SUPPORT_REPLY_SENT",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: input.id,
      description: `Sent official reply to ${ticket.email} for ticket #${input.id}`,
      newData: {
        to: ticket.email,
        subject,
        markResolved: Boolean(input.markResolved),
        sent_by: performer,
      },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    revalidatePath("/admin/support")
    revalidatePath(`/admin/support/${input.id}`)

    return { success: true }
  } catch (err) {
    console.error("[sendSupportReply Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch support reply email",
    }
  }
}

/**
 * Archive or restore a support report
 */
export async function archiveSupportReport(id: string, archived: boolean) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({ archived })
      .eq("id", id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: archived ? "SUPPORT_ARCHIVED" : "SUPPORT_RESTORED",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: id,
      description: `${archived ? "Archived" : "Restored"} support ticket #${id}`,
      newData: { archived },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    try {
      await serviceSupabase.from("support_admin_actions").insert({
        report_id: id,
        action_type: archived ? "archive" : "unarchive",
        payload: { archived },
        performed_by: admin.full_name || admin.email || "admin",
      })
    } catch {
      // Non-fatal
    }

    revalidatePath("/admin/support")
    revalidatePath(`/admin/support/${id}`)

    return { success: true, archived }
  } catch (err) {
    console.error("[archiveSupportReport Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to archive support report",
    }
  }
}

/**
 * Permanently delete a support report and clean up screenshot storage
 */
export async function deleteSupportReport(id: string) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    // 1. Fetch screenshot path to clean up storage
    const { data: ticket } = await serviceSupabase
      .from("contact_submissions")
      .select("screenshot_path")
      .eq("id", id)
      .single()

    if (ticket?.screenshot_path) {
      try {
        await serviceSupabase.storage
          .from("support-screenshots")
          .remove([ticket.screenshot_path])
      } catch (storageErr) {
        console.warn("[deleteSupportReport] Storage cleanup warning:", storageErr)
      }
    }

    // 2. Delete submission record
    const { error: deleteError } = await serviceSupabase
      .from("contact_submissions")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    void logAdminActivity({
      action: "SUPPORT_DELETED",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: id,
      description: `Permanently deleted support ticket #${id}`,
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    revalidatePath("/admin/support")
    revalidatePath("/admin")

    return { success: true }
  } catch (err) {
    console.error("[deleteSupportReport Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete support report",
    }
  }
}

/**
 * Bulk update status for multiple support tickets
 */
export async function bulkUpdateSupportStatus(ids: string[], status: SupportStatus) {
  try {
    const admin = await getAuthorizedAdmin()
    if (!ids || ids.length === 0) {
      return { success: false, error: "No support reports selected" }
    }

    const normalizedStatus = normalizeSupportStatus(status)
    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({
        status: normalizedStatus,
        reviewed: true,
      })
      .in("id", ids)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: `SUPPORT_BULK_STATUS_${normalizedStatus.toUpperCase()}`,
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: "bulk",
      description: `Bulk updated ${ids.length} support ticket(s) to ${normalizedStatus}`,
      newData: { ids, status: normalizedStatus },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    revalidatePath("/admin/support")
    revalidatePath("/admin")

    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkUpdateSupportStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk update status",
    }
  }
}

/**
 * Bulk archive or restore multiple support reports
 */
export async function bulkArchiveSupportReports(ids: string[], archived: boolean) {
  try {
    const admin = await getAuthorizedAdmin()
    if (!ids || ids.length === 0) {
      return { success: false, error: "No support reports selected" }
    }

    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({ archived })
      .in("id", ids)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: archived ? "SUPPORT_BULK_ARCHIVED" : "SUPPORT_BULK_RESTORED",
      domain: "COMMUNICATION",
      entityType: "support_report",
      entityId: "bulk",
      description: `Bulk ${archived ? "archived" : "restored"} ${ids.length} support ticket(s)`,
      newData: { ids, archived },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    revalidatePath("/admin/support")
    revalidatePath("/admin")

    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkArchiveSupportReports Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk archive reports",
    }
  }
}

/**
 * Fetch a single support ticket by ID (server action wrapper for client components)
 */
export async function getSupportTicketByIdAction(id: string): Promise<{
  success: boolean
  ticket?: SupportTicket
  screenshotUrl?: string | null
  error?: string
}> {
  try {
    await getAuthorizedAdmin()
    const { ticket, screenshotUrl } = await fetchSupportTicketById(id)
    if (!ticket) {
      return { success: false, error: "Support report not found" }
    }
    return { success: true, ticket, screenshotUrl }
  } catch (err) {
    console.error("[getSupportTicketByIdAction Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch support report",
    }
  }
}

/**
 * Generate a signed screenshot URL on-demand for authorized admins
 */
export async function getSupportScreenshotUrlAction(path: string): Promise<{
  success: boolean
  signedUrl?: string | null
  error?: string
}> {
  try {
    await getAuthorizedAdmin()
    const signedUrl = await getSupportScreenshotSignedUrl(path)
    return { success: true, signedUrl }
  } catch (err) {
    console.error("[getSupportScreenshotUrlAction Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load screenshot",
    }
  }
}
