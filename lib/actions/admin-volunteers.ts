"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { sendVolunteerStatusEmail } from "@/lib/email/volunteer-mailer"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export interface UpdateVolunteerInput {
  id: string
  status: "pending" | "approved" | "rejected"
  adminNotes?: string
  assignedRole?: string
  sendNotification?: boolean
}

/**
 * Update a volunteer application with audit logging & review notes
 */
export async function updateVolunteerApplication(input: UpdateVolunteerInput) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized: Administrator sign-in required" }

    const serviceSupabase = createServiceRoleClient()

    // 1. Fetch current record to get contact details for notification
    const { data: currentRecord } = await serviceSupabase
      .from("volunteer_applications")
      .select("id, full_name, email")
      .eq("id", input.id)
      .single()

    // 2. Update status
    const { error: updateError } = await serviceSupabase
      .from("volunteer_applications")
      .update({ status: input.status })
      .eq("id", input.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 3. Record review metadata in activity_logs
    void logAdminActivity({
      action: `VOLUNTEER_${input.status.toUpperCase()}`,
      domain: "COMMUNICATIONS",
      entityType: "volunteer_applications",
      entityId: input.id,
      description: `Updated volunteer application status to ${input.status}`,
      newData: {
        status: input.status,
        notes: input.adminNotes || null,
        assigned_role: input.assignedRole || null,
        notification_sent: !!input.sendNotification,
      },
    })

    // 4. Optionally dispatch candidate decision email
    if (input.sendNotification && currentRecord?.email) {
      void sendVolunteerStatusEmail({
        fullName: currentRecord.full_name,
        email: currentRecord.email,
        status: input.status,
        assignedRole: input.assignedRole,
        notes: input.adminNotes,
      }).catch((mailErr) => {
        console.warn("[updateVolunteerApplication] Notification email failed:", mailErr)
      })
    }

    revalidatePath("/admin/volunteers")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[updateVolunteerApplication Error]:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update volunteer application",
    }
  }
}

/**
 * Send an email notification manually to a candidate regarding their application status
 */
export async function sendCandidateNotification(
  id: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, message: "Unauthorized" }

    const serviceSupabase = createServiceRoleClient()

    const { data: record, error } = await serviceSupabase
      .from("volunteer_applications")
      .select("id, full_name, email, status")
      .eq("id", id)
      .single()

    if (error || !record) {
      return { success: false, message: "Candidate record not found" }
    }

    // Get latest assigned role if any from activity logs
    const { data: logs } = await serviceSupabase
      .from("activity_logs")
      .select("new_data")
      .eq("entity_type", "volunteer_application")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(1)

    const assignedRole = logs?.[0]?.new_data?.assigned_role || null

    const result = await sendVolunteerStatusEmail({
      fullName: record.full_name,
      email: record.email,
      status: record.status as "pending" | "approved" | "rejected",
      assignedRole,
      notes: notes || undefined,
    })

    if (result.success) {
      // Log that notification was sent
      void logAdminActivity({
        action: "VOLUNTEER_EMAIL_NOTIFIED",
        domain: "VOLUNTEER",
        entityType: "volunteer_applications",
        entityId: id,
        description: `Dispatched volunteer status email notification to ${record.email}`,
        newData: {
          recipient: record.email,
          status: record.status,
          assigned_role: assignedRole,
        },
        actorId: admin.user_id,
        actorEmail: admin.email,
      })
    }

    return result
  } catch (err) {
    console.error("[sendCandidateNotification Error]:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to dispatch email",
    }
  }
}

/**
 * Legacy compatibility wrapper for updateVolunteerStatus
 */
export async function updateVolunteerStatus(id: string, status: string) {
  return updateVolunteerApplication({
    id,
    status: status as "pending" | "approved" | "rejected",
  })
}

/**
 * Bulk update multiple volunteer applications
 */
export async function bulkUpdateVolunteerStatus(
  ids: string[],
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized" }

    if (!ids || ids.length === 0) {
      return { success: false, error: "No volunteers selected" }
    }

    const serviceSupabase = createServiceRoleClient()

    const { error: updateError } = await serviceSupabase
      .from("volunteer_applications")
      .update({ status })
      .in("id", ids)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    void logAdminActivity({
      action: `VOLUNTEER_BULK_${status.toUpperCase()}`,
      domain: "COMMUNICATIONS",
      entityType: "volunteer_applications",
      entityId: "bulk",
      description: `Bulk updated ${ids.length} volunteer application(s) to ${status}`,
      newData: {
        status,
        notes: adminNotes || "Bulk status change",
        count: ids.length,
        ids,
      },
    })

    revalidatePath("/admin/volunteers")
    revalidatePath("/admin")

    return { success: true, count: ids.length }
  } catch (error) {
    console.error("[bulkUpdateVolunteerStatus Error]:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update volunteers",
    }
  }
}

/**
 * Delete a volunteer application
 */
export async function deleteVolunteerApplication(id: string) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized" }

    const serviceSupabase = createServiceRoleClient()

    const { error } = await serviceSupabase
      .from("volunteer_applications")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log deletion
    void logAdminActivity({
      action: "VOLUNTEER_DELETED",
      domain: "COMMUNICATIONS",
      entityType: "volunteer_applications",
      entityId: id,
      description: `Deleted volunteer application ${id}`,
    })

    revalidatePath("/admin/volunteers")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("[deleteVolunteerApplication Error]:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete volunteer",
    }
  }
}

/**
 * Register a volunteer manually (e.g. Walk-in / Offline / Direct Outreach)
 */
export async function createManualVolunteer(data: {
  fullName: string
  email: string
  phone: string
  occupation?: string
  skills?: string[]
  availability?: string
  interests?: string[]
  message?: string
  status?: "pending" | "approved" | "rejected"
  adminNotes?: string
}) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized" }

    const serviceSupabase = createServiceRoleClient()

    const { data: newRow, error } = await serviceSupabase
      .from("volunteer_applications")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        occupation: data.occupation || null,
        skills: data.skills || [],
        availability: data.availability || "Flexible",
        interests: data.interests || [],
        message: data.message || null,
        status: data.status || "approved",
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    void logAdminActivity({
      action: "VOLUNTEER_MANUAL_REGISTRATION",
      domain: "COMMUNICATIONS",
      entityType: "volunteer_applications",
      entityId: newRow.id,
      description: `Created manual volunteer registration for ${data.fullName}`,
      newData: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        notes: data.adminNotes || null,
      },
    })

    revalidatePath("/admin/volunteers")
    revalidatePath("/admin")

    return { success: true, volunteer: newRow }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create volunteer entry",
    }
  }
}
