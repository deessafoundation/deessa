"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAdminActivity } from "@/lib/audit/audit-logger"

interface CleanupResult {
  success: boolean
  orphanedCount: number
  deletedIds: string[]
  error?: string
}

/**
 * Check for and remove orphaned context_partners records
 * (records where the partner_id doesn't exist in partners table)
 */
export async function cleanupOrphanedPartners(eventId: string): Promise<CleanupResult> {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, orphanedCount: 0, deletedIds: [], error: "Unauthorized" }
    }

    const { data: admin } = await supabase.from("admin_users").select("id, email, user_id").eq("user_id", user.id).single()

    if (!admin) {
      return { success: false, orphanedCount: 0, deletedIds: [], error: "Unauthorized: Not an admin" }
    }

    // Fetch all context_partners for this event
    const { data: rawLinks, error: rawError } = await supabase
      .from("context_partners")
      .select("id, partner_id, category_key")
      .eq("context_type", "event")
      .eq("context_id", eventId)

    if (rawError) {
      console.error("Error fetching context_partners:", rawError)
      return { success: false, orphanedCount: 0, deletedIds: [], error: rawError.message }
    }

    if (!rawLinks || rawLinks.length === 0) {
      return { success: true, orphanedCount: 0, deletedIds: [] }
    }

    // Fetch actual partners to check which exist
    const partnerIds = rawLinks.map((r) => r.partner_id)
    const { data: existingPartners, error: partnersError } = await supabase
      .from("partners")
      .select("id")
      .in("id", partnerIds)

    if (partnersError) {
      console.error("Error fetching partners:", partnersError)
      return { success: false, orphanedCount: 0, deletedIds: [], error: partnersError.message }
    }

    const existingPartnerIds = new Set(existingPartners?.map((p) => p.id) || [])

    // Find orphaned records
    const orphanedRecords = rawLinks.filter((r) => !existingPartnerIds.has(r.partner_id))

    if (orphanedRecords.length === 0) {
      return { success: true, orphanedCount: 0, deletedIds: [] }
    }

    // Delete orphaned records
    const orphanedIds = orphanedRecords.map((r) => r.id)
    const { error: deleteError } = await supabase.from("context_partners").delete().in("id", orphanedIds)

    if (deleteError) {
      console.error("Error deleting orphaned records:", deleteError)
      return {
        success: false,
        orphanedCount: orphanedRecords.length,
        deletedIds: [],
        error: deleteError.message,
      }
    }

    // Log activity
    void logAdminActivity({
      action: "ORPHANED_PARTNERS_CLEANED",
      domain: "EVENT",
      entityType: "context_partners",
      entityId: eventId,
      description: `Cleaned up ${orphanedIds.length} orphaned partner link(s) for event ${eventId}`,
      oldData: {
        event_id: eventId,
        deleted_count: orphanedIds.length,
        orphaned_ids: orphanedIds,
        orphaned_partner_ids: orphanedRecords.map((r) => r.partner_id),
      },
      actorId: admin.user_id,
      actorEmail: admin.email,
    })

    revalidatePath(`/admin/events/${eventId}/settings`)

    return {
      success: true,
      orphanedCount: orphanedRecords.length,
      deletedIds: orphanedIds,
    }
  } catch (err) {
    console.error("Error cleaning up orphaned partners:", err)
    return {
      success: false,
      orphanedCount: 0,
      deletedIds: [],
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

