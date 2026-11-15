"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { sendContactReplyEmail } from "@/lib/email/contact-mailer"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export type ContactStatus = "open" | "in_progress" | "resolved" | "closed"

export interface UpdateContactStatusInput {
  id: string
  status: ContactStatus
  adminNotes?: string
}

export interface AssignContactInput {
  id: string
  assigneeEmail: string | null
  notes?: string
}

export interface SaveContactNotesInput {
  id: string
  internalNotes: string
}

export interface SendContactReplyInput {
  id: string
  replyContent: string
  markResolved?: boolean
}

/**
 * Verify administrator authentication and contact module permissions
 */
async function getAuthorizedAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Administrator session required")
  }
  if (!hasPermission(admin.role, "contacts")) {
    throw new Error("Forbidden: You do not have permission to manage contact messages")
  }
  return admin
}

/**
 * Update the status of a contact submission with audit logging
 */
export async function updateContactStatus(input: UpdateContactStatusInput) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const updatePayload: Record<string, unknown> = {
      status: input.status,
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

    // Record audit trail in activity_logs
    void logAdminActivity({
      action: `CONTACT_STATUS_${input.status.toUpperCase()}`,
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: input.id,
      description: `Updated contact inquiry status to ${input.status}`,
      newData: {
        status: input.status,
        notes: input.adminNotes || null,
      },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true }
  } catch (err) {
    console.error("[updateContactStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update contact status",
    }
  }
}

/**
 * Assign a contact submission to a staff member
 */
export async function assignContact(input: AssignContactInput) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    // Fetch current status to automatically promote "open" to "in_progress" upon assignment
    const { data: current } = await serviceSupabase
      .from("contact_submissions")
      .select("status")
      .eq("id", input.id)
      .single()

    const newStatus =
      current?.status === "open" && input.assigneeEmail ? "in_progress" : current?.status || "open"

    const updatePayload: Record<string, unknown> = {
      assignee: input.assigneeEmail || null,
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

    // Log assignment audit
    void logAdminActivity({
      action: "CONTACT_ASSIGNED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: input.id,
      description: `Assigned contact inquiry to ${input.assigneeEmail || "Unassigned"}`,
      newData: {
        assignee: input.assigneeEmail || "Unassigned",
        status: newStatus,
      },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true }
  } catch (err) {
    console.error("[assignContact Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign contact",
    }
  }
}

/**
 * Save staff internal notes on an inquiry
 */
export async function saveContactInternalNotes(input: SaveContactNotesInput) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({
        internal_notes: input.internalNotes.trim() || null,
      })
      .eq("id", input.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: "CONTACT_NOTES_UPDATED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: input.id,
      description: `Updated internal notes on contact inquiry ${input.id}`,
      newData: {
        notes_preview: input.internalNotes.slice(0, 100),
      },
    })

    revalidatePath("/admin/contacts")
    return { success: true }
  } catch (err) {
    console.error("[saveContactInternalNotes Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save internal notes",
    }
  }
}

/**
 * Send an official email reply directly to the inquirer
 */
export async function sendContactReply(input: SendContactReplyInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { data: record, error: fetchError } = await serviceSupabase
      .from("contact_submissions")
      .select("id, name, email, subject, message, status")
      .eq("id", input.id)
      .single()

    if (fetchError || !record) {
      return { success: false, error: "Inquiry record not found" }
    }

    if (!record.email) {
      return { success: false, error: "Inquirer has no email address on file" }
    }

    // 1. Dispatch email via nodemailer
    const emailResult = await sendContactReplyEmail({
      to: record.email,
      toName: record.name || "Friend",
      originalSubject: record.subject || "General Inquiry",
      originalMessage: record.message,
      replyContent: input.replyContent.trim(),
      adminName: admin.email?.split("@")[0] || "Deesha Support",
      adminEmail: admin.email || undefined,
    })

    if (!emailResult.success) {
      return { success: false, error: emailResult.message }
    }

    // 2. Update contact record status and reply timestamp
    const targetStatus: ContactStatus = input.markResolved ? "resolved" : "in_progress"
    const nowIso = new Date().toISOString()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({
        status: targetStatus,
        reviewed: true,
        last_reply_sent_at: nowIso,
      })
      .eq("id", input.id)

    if (updateError) {
      console.warn("[sendContactReply] DB update warning:", updateError)
    }

    // 3. Record audit trail
    void logAdminActivity({
      action: "CONTACT_EMAIL_REPLIED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: input.id,
      description: `Sent official email reply to ${record.email} regarding "${record.subject || "General Inquiry"}"`,
      newData: {
        recipient: record.email,
        subject: record.subject,
        reply_preview: input.replyContent.slice(0, 120),
        status: targetStatus,
      },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return {
      success: true,
      message: `Reply sent to ${record.email} and status set to ${targetStatus}`,
    }
  } catch (err) {
    console.error("[sendContactReply Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email reply",
    }
  }
}

/**
 * Archive or restore a contact submission
 */
export async function archiveContact(id: string, archived: boolean) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({ archived })
      .eq("id", id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: archived ? "CONTACT_ARCHIVED" : "CONTACT_RESTORED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: id,
      description: `${archived ? "Archived" : "Restored"} contact inquiry ${id}`,
      newData: { archived },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true }
  } catch (err) {
    console.error("[archiveContact Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update archive state",
    }
  }
}

/**
 * Permanently delete a contact submission
 */
export async function deleteContactSubmission(id: string) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error: deleteError } = await serviceSupabase
      .from("contact_submissions")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    void logAdminActivity({
      action: "CONTACT_DELETED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: id,
      description: `Permanently deleted contact inquiry ${id}`,
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true }
  } catch (err) {
    console.error("[deleteContactSubmission Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete submission",
    }
  }
}

/**
 * Bulk update multiple contact submissions' status
 */
export async function bulkUpdateContactStatus(
  ids: string[],
  status: ContactStatus
) {
  try {
    await getAuthorizedAdmin()
    if (!ids || ids.length === 0) {
      return { success: false, error: "No inquiries selected" }
    }

    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("contact_submissions")
      .update({ status, reviewed: true })
      .in("id", ids)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: `CONTACT_BULK_${status.toUpperCase()}`,
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: "bulk",
      description: `Bulk updated ${ids.length} contact inquiry/inquiries to ${status}`,
      newData: { count: ids.length, status, ids },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkUpdateContactStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk update inquiries",
    }
  }
}

/**
 * Bulk archive or restore multiple contact submissions
 */
export async function bulkArchiveContacts(ids: string[], archived: boolean) {
  try {
    await getAuthorizedAdmin()
    if (!ids || ids.length === 0) {
      return { success: false, error: "No inquiries selected" }
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
      action: archived ? "CONTACT_BULK_ARCHIVED" : "CONTACT_BULK_RESTORED",
      domain: "COMMUNICATIONS",
      entityType: "contact_submissions",
      entityId: "bulk",
      description: `Bulk ${archived ? "archived" : "restored"} ${ids.length} contact inquiry/inquiries`,
      newData: { count: ids.length, archived, ids },
    })

    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkArchiveContacts Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk update archive state",
    }
  }
}

/**
 * Fetch a single contact submission by ID
 */
export async function getContactById(id: string) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { data, error } = await serviceSupabase
      .from("contact_submissions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || "Contact submission not found" }
    }

    return {
      success: true,
      contact: {
        id: data.id,
        name: data.name || "Anonymous",
        email: data.email || "",
        phone: data.phone || null,
        subject: data.subject || "No Subject",
        message: data.message || "",
        created_at: data.created_at || new Date().toISOString(),
        issue_type: data.issue_type || null,
        page_url: data.page_url || null,
        browser_info: data.browser_info || null,
        screenshot_path: data.screenshot_path || null,
        screenshot_name: data.screenshot_name || null,
        reviewed: Boolean(data.reviewed),
        status: (data.status || "open") as ContactStatus,
        assignee: data.assignee || null,
        internal_notes: data.internal_notes || null,
        archived: Boolean(data.archived),
        last_reply_sent_at: data.last_reply_sent_at || null,
      },
    }
  } catch (err) {
    console.error("[getContactById Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load contact submission",
    }
  }
}
