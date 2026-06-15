"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import type { FormSchema, FormSchemaMeta } from "@/lib/types/conference-form-schema"

// ── Get the active form schema for an event ──────────────────────────────────
// Falls back to current event if no eventId provided (backward compatible).

export async function getActiveFormSchema(eventId?: string): Promise<FormSchema | null> {
  try {
    const supabase = await createClient()

    // If no event_id provided, try to get current event
    let targetEventId = eventId
    if (!targetEventId) {
      const { getCurrentEvent } = await import("./events")
      const currentEvent = await getCurrentEvent()
      targetEventId = currentEvent?.id
    }

    // If we have an event ID, query for that event's active schema
    if (targetEventId) {
      const { data, error } = await supabase
        .from("conference_form_schemas")
        .select("form_config")
        .eq("event_id", targetEventId)
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && data?.form_config) {
        return data.form_config as FormSchema
      }
    }

    // Fallback: get any active schema (legacy support)
    const { data, error } = await supabase
      .from("conference_form_schemas")
      .select("form_config")
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data?.form_config) {
      return null
    }

    return data.form_config as FormSchema
  } catch {
    return null
  }
}

// ── Get a specific schema version ────────────────────────────────────────────

export async function getFormSchemaByVersion(
  version: number,
  eventId?: string,
): Promise<FormSchema | null> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from("conference_form_schemas")
      .select("form_config")
      .eq("version", version)

    if (eventId) {
      query = query.eq("event_id", eventId)
    }

    const { data, error } = await query.maybeSingle()

    if (error || !data?.form_config) return null
    return data.form_config as FormSchema
  } catch {
    return null
  }
}

// ── Create a new form schema (new version) ──────────────────────────────────

export async function createFormSchema(
  schema: FormSchema,
  adminId: string,
  eventId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string; version?: number }> {
  try {
    const supabase = await createClient()

    // Get the latest version for this event
    const { data: latest } = await supabase
      .from("conference_form_schemas")
      .select("version")
      .eq("event_id", eventId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = (latest?.version ?? 0) + 1

    const { error } = await supabase.from("conference_form_schemas").insert({
      event_id: eventId,
      version: nextVersion,
      is_active: false,
      form_config: { ...schema, version: nextVersion },
      created_by: adminId,
      notes: notes ?? null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, version: nextVersion }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create form schema",
    }
  }
}

// ── Activate a schema version (deactivates others for the same event) ────────

export async function activateSchemaVersion(
  version: number,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized" }
    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
      return { success: false, error: "Only admins can activate form schemas" }
    }

    const supabase = await createClient()

    // Deactivate all schemas for this event
    const { error: deactivateError } = await supabase
      .from("conference_form_schemas")
      .update({ is_active: false })
      .eq("event_id", eventId)
      .eq("is_active", true)

    if (deactivateError) {
      return { success: false, error: deactivateError.message }
    }

    // Activate the requested version
    const { error: activateError } = await supabase
      .from("conference_form_schemas")
      .update({ is_active: true })
      .eq("event_id", eventId)
      .eq("version", version)

    if (activateError) {
      return { success: false, error: activateError.message }
    }

    revalidatePath("/conference/register")
    revalidatePath("/admin/conference/settings/form-builder")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to activate schema",
    }
  }
}

// ── Get schema version history for an event ──────────────────────────────────

export async function getFormSchemaHistory(
  eventId: string,
): Promise<{ version: number; isActive: boolean; createdAt: string; notes: string | null }[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("conference_form_schemas")
      .select("version, is_active, created_at, notes")
      .eq("event_id", eventId)
      .order("version", { ascending: false })

    if (error) return []

    return (data ?? []).map((row) => ({
      version: row.version,
      isActive: row.is_active,
      createdAt: row.created_at,
      notes: row.notes,
    }))
  } catch {
    return []
  }
}

// ── Update form schema (creates new version and optionally activates) ────────

export async function updateFormSchema(
  schema: FormSchema,
  eventId: string,
  publish: boolean = false,
): Promise<{ success: boolean; error?: string; version?: number }> {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return { success: false, error: "Unauthorized" }
    if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
      return { success: false, error: "Only admins can update form schemas" }
    }

    // If no event ID provided, use current event as fallback
    let targetEventId = eventId
    if (!targetEventId) {
      const { getCurrentEvent } = await import("./events")
      const currentEvent = await getCurrentEvent()
      if (!currentEvent) {
        return { success: false, error: "No event found. Please select an event or create one first." }
      }
      targetEventId = currentEvent.id
    }
    
    const supabase = await createClient()

    // Get the latest version for this event
    const { data: latest } = await supabase
      .from("conference_form_schemas")
      .select("version")
      .eq("event_id", targetEventId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = (latest?.version ?? 0) + 1

    // If publishing, deactivate all current active schemas first
    if (publish) {
      await supabase
        .from("conference_form_schemas")
        .update({ is_active: false })
        .eq("event_id", targetEventId)
        .eq("is_active", true)
    }

    // Insert new version
    const { error } = await supabase.from("conference_form_schemas").insert({
      event_id: targetEventId,
      version: nextVersion,
      is_active: publish,
      form_config: { ...schema, version: nextVersion, metadata: { ...schema.metadata, updatedAt: new Date().toISOString() } },
      created_by: admin.id,
      notes: publish ? "Published via form builder" : "Draft saved via form builder",
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths
    if (publish) {
      revalidatePath("/conference/register")
    }
    revalidatePath("/admin/conference/settings/form-builder")

    return { success: true, version: nextVersion }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update form schema",
    }
  }
}
