"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role env vars")
  return createServiceClient(url, key)
}

type EntityType = "donation" | "event" | "conference"

const tableMap: Record<EntityType, string> = {
  donation: "donations",
  event: "event_registrations",
  conference: "conference_registrations",
}

const reviewFkColumn: Record<EntityType, string> = {
  donation: "donation_id",
  event: "event_registration_id",
  conference: "conference_registration_id",
}

// ============================================================================
// 1. Change Payment Status (polymorphic)
// ============================================================================

export async function changePaymentStatusPolymorphic(input: {
  entityId: string
  entityType: EntityType
  newStatus: string
  reason: string
}): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "Unauthorized" }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role, full_name")
      .eq("user_id", user.id)
      .single()

    if (adminError || !adminUser) return { ok: false, message: "Admin user not found" }
    if (!["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
      return { ok: false, message: "Insufficient permissions." }
    }

    if (!input.reason || input.reason.trim().length < 10) {
      return { ok: false, message: "Reason must be at least 10 characters" }
    }

    const serviceSupabase = getServiceSupabase()
    const table = tableMap[input.entityType]

    const { data: record, error: recordError } = await serviceSupabase
      .from(table)
      .select("payment_status")
      .eq("id", input.entityId)
      .single()

    if (recordError || !record) return { ok: false, message: "Record not found" }
    if (record.payment_status === input.newStatus) {
      return { ok: false, message: `Status is already set to ${input.newStatus}` }
    }

    const { error: updateError } = await serviceSupabase
      .from(table)
      .update({ payment_status: input.newStatus })
      .eq("id", input.entityId)

    if (updateError) return { ok: false, message: "Failed to update status" }

    // Log to status_change_log
    const logPayload: any = {
      admin_user_id: adminUser.id,
      old_status: record.payment_status,
      new_status: input.newStatus,
      reason: input.reason.trim(),
    }
    logPayload[reviewFkColumn[input.entityType]] = input.entityId

    await serviceSupabase.from("status_change_log").insert(logPayload)

    // Log to payment_events
    const eventPayload: any = {
      provider: "system",
      event_id: `manual_status_change:${input.entityId}:${Date.now()}`,
      event_type: "manual_status_change",
      raw_payload: {
        admin_name: adminUser.full_name,
        old_status: record.payment_status,
        new_status: input.newStatus,
        reason: input.reason.trim(),
        entity_type: input.entityType,
      },
    }
    eventPayload[reviewFkColumn[input.entityType]] = input.entityId

    await serviceSupabase.from("payment_events").insert(eventPayload)

    revalidatePath(`/admin/payments/${input.entityId}`)
    revalidatePath("/admin/payments")

    return {
      ok: true,
      message: `Status updated from ${record.payment_status} to ${input.newStatus}`,
    }
  } catch (error) {
    console.error("changePaymentStatusPolymorphic error:", error)
    return { ok: false, message: "An unexpected error occurred" }
  }
}

// ============================================================================
// 2. Add Review Note (polymorphic)
// ============================================================================

export async function addReviewNotePolymorphic(input: {
  entityId: string
  entityType: EntityType
  noteText: string
}): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "Unauthorized" }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("user_id", user.id)
      .single()

    if (adminError || !adminUser) return { ok: false, message: "Admin user not found" }
    if (!["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
      return { ok: false, message: "Insufficient permissions." }
    }

    if (!input.noteText || input.noteText.trim().length < 10) {
      return { ok: false, message: "Note must be at least 10 characters" }
    }

    const serviceSupabase = getServiceSupabase()
    const fkCol = reviewFkColumn[input.entityType]

    const insertPayload: any = {
      admin_user_id: adminUser.id,
      note_text: input.noteText.trim(),
    }
    insertPayload[fkCol] = input.entityId

    const { error: insertError } = await serviceSupabase.from("review_notes").insert(insertPayload)
    if (insertError) return { ok: false, message: "Failed to add note" }

    revalidatePath(`/admin/payments/${input.entityId}`)
    return { ok: true, message: "Review note added successfully" }
  } catch (error) {
    console.error("addReviewNotePolymorphic error:", error)
    return { ok: false, message: "An unexpected error occurred" }
  }
}

// ============================================================================
// 3. Update Review Status (polymorphic)
// ============================================================================

export async function updateReviewStatusPolymorphic(input: {
  entityId: string
  entityType: EntityType
  reviewStatus: "unreviewed" | "verified" | "flagged" | "refunded"
}): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "Unauthorized" }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("user_id", user.id)
      .single()

    if (adminError || !adminUser) return { ok: false, message: "Admin user not found" }
    if (!["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
      return { ok: false, message: "Insufficient permissions." }
    }

    const serviceSupabase = getServiceSupabase()
    const table = tableMap[input.entityType]

    const { error: updateError } = await serviceSupabase
      .from(table)
      .update({
        review_status: input.reviewStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser.id,
      })
      .eq("id", input.entityId)

    if (updateError) return { ok: false, message: "Failed to update review status" }

    revalidatePath(`/admin/payments/${input.entityId}`)
    revalidatePath("/admin/payments")
    return { ok: true, message: "Review status updated successfully" }
  } catch (error) {
    console.error("updateReviewStatusPolymorphic error:", error)
    return { ok: false, message: "An unexpected error occurred" }
  }
}
