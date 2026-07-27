"use server"

// ── Event Form Templates Actions ──────────────────────────────────────────
// Server actions for managing event form templates (save, load, apply).
// Queries the event_form_templates table (events module).

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FormSchema } from "@/lib/types/conference-form-schema"

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

export interface EventFormTemplate {
  id: string
  name: string
  description?: string
  category?: string
  isPublic: boolean
  formConfig: FormSchema
  createdBy?: string
  createdAt: string
}

/**
 * Fetches all available event templates (public ones).
 */
export async function getEventFormTemplates(
  category?: string
): Promise<Result<EventFormTemplate[]>> {
  try {
    // Use service role client to bypass RLS for template reads
    const { createServiceRoleClient } = await import("@/lib/supabase/service")
    const supabase = createServiceRoleClient()

    let query = supabase
      .from("event_form_templates")
      .select("*")
      .order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching event templates:", error)
      return { success: false, error: "Failed to fetch templates" }
    }

    const templates: EventFormTemplate[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      isPublic: row.is_public,
      formConfig: row.form_config as FormSchema,
      createdBy: row.created_by,
      createdAt: row.created_at,
    }))

    return { success: true, data: templates }
  } catch (error) {
    console.error("Error in getEventFormTemplates:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Fetches unique categories from event templates.
 */
export async function getEventTemplateCategories(): Promise<Result<string[]>> {
  try {
    // Use service role client to bypass RLS
    const { createServiceRoleClient } = await import("@/lib/supabase/service")
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("event_form_templates")
      .select("category")
      .not("category", "is", null)

    if (error) {
      return { success: false, error: "Failed to fetch categories" }
    }

    const categories = [...new Set(data.map((row) => row.category).filter(Boolean))] as string[]
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Saves a form schema as a new template.
 */
export async function saveEventFormAsTemplate(params: {
  name: string
  description?: string
  category?: string
  isPublic?: boolean
  formConfig: FormSchema
}): Promise<Result<string>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Use service role client for template operations (bypasses RLS)
    const { createServiceRoleClient } = await import("@/lib/supabase/service")
    const adminSupabase = createServiceRoleClient()

    const { data, error } = await adminSupabase
      .from("event_form_templates")
      .insert({
        name: params.name,
        description: params.description,
        category: params.category,
        is_public: params.isPublic || false,
        form_config: params.formConfig,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving event template:", error)
      return { success: false, error: "Failed to save template: " + error.message }
    }

    return { success: true, data: data.id }
  } catch (error) {
    console.error("Error in saveEventFormAsTemplate:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Applies a template to an event (copies the form_config to event_form_schemas).
 */
export async function applyEventTemplateToEvent(params: {
  templateId: string
  eventId: string
  activate?: boolean
}): Promise<Result<void>> {
  try {
    const supabase = await createClient()

    // Fetch the template (templates are public, no auth needed)
    const { data: template, error: templateError } = await supabase
      .from("event_form_templates")
      .select("form_config")
      .eq("id", params.templateId)
      .single()

    if (templateError || !template) {
      return { success: false, error: "Template not found" }
    }

    // Use service role client for schema operations (bypasses RLS)
    const { createServiceRoleClient } = await import("@/lib/supabase/service")
    const adminSupabase = createServiceRoleClient()

    // Get the latest version for this event
    const { data: latest } = await adminSupabase
      .from("event_form_schemas")
      .select("version")
      .eq("event_id", params.eventId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = (latest?.version ?? 0) + 1

    // Always deactivate old active schemas when applying a template
    // (the old template should not remain active)
    await adminSupabase
      .from("event_form_schemas")
      .update({ is_active: false })
      .eq("event_id", params.eventId)
      .eq("is_active", true)

    // Also clean up any rows with null form_config (broken data)
    await adminSupabase
      .from("event_form_schemas")
      .delete()
      .eq("event_id", params.eventId)
      .is("form_config", null)

    // Insert the new schema from template
    const { error } = await adminSupabase.from("event_form_schemas").insert({
      event_id: params.eventId,
      version: nextVersion,
      is_active: params.activate ?? false,
      form_config: {
        ...template.form_config,
        version: nextVersion,
        metadata: {
          ...template.form_config.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
      notes: `Applied from template`,
    })

    if (error) {
      console.error("Error applying template:", error)
      return { success: false, error: "Failed to apply template: " + error.message }
    }

    revalidatePath(`/admin/events/${params.eventId}/settings`)
    return { success: true }
  } catch (error) {
    console.error("Error in applyEventTemplateToEvent:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
