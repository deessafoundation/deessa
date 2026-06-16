"use server"

// ── Conference Form Templates Actions ───────────────────────────────────────
// Server actions for managing form templates (save, load, clone).
// Phase 4 enhancement: Reusable form configurations.

import { createClient } from "@/lib/supabase/server"
import { FormSchema } from "@/lib/types/conference-form-schema"
import { Result } from "@/lib/types"

export interface FormTemplate {
  id: string
  name: string
  description?: string
  category?: string
  isPublic: boolean
  formConfig: FormSchema
  createdBy: string
  timesUsed: number
  createdAt: string
  updatedAt: string
}

/**
 * Fetches all available templates (public + user's own).
 */
export async function getFormTemplates(
  category?: string
): Promise<Result<FormTemplate[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from("conference_form_templates")
      .select("*")
      .is("deleted_at", null)
      .order("times_used", { ascending: false })
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching templates:", error)
      return { success: false, error: "Failed to fetch templates" }
    }

    const templates: FormTemplate[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      isPublic: row.is_public,
      formConfig: row.form_config as FormSchema,
      createdBy: row.created_by,
      timesUsed: row.times_used,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return { success: true, data: templates }
  } catch (error) {
    console.error("Error in getFormTemplates:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Fetches a single template by ID.
 */
export async function getFormTemplateById(
  templateId: string
): Promise<Result<FormTemplate>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("conference_form_templates")
      .select("*")
      .eq("id", templateId)
      .is("deleted_at", null)
      .single()

    if (error) {
      console.error("Error fetching template:", error)
      return { success: false, error: "Template not found" }
    }

    const template: FormTemplate = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isPublic: data.is_public,
      formConfig: data.form_config as FormSchema,
      createdBy: data.created_by,
      timesUsed: data.times_used,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return { success: true, data: template }
  } catch (error) {
    console.error("Error in getFormTemplateById:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Saves current form configuration as a template.
 */
export async function saveFormAsTemplate(params: {
  name: string
  description?: string
  category?: string
  isPublic?: boolean
  formConfig: FormSchema
}): Promise<Result<string>> {
  try {
    const supabase = await createClient()

    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Insert template
    const { data, error } = await supabase
      .from("conference_form_templates")
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
      console.error("Error saving template:", error)
      return { success: false, error: "Failed to save template" }
    }

    return { success: true, data: data.id }
  } catch (error) {
    console.error("Error in saveFormAsTemplate:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Updates an existing template.
 */
export async function updateFormTemplate(params: {
  templateId: string
  name?: string
  description?: string
  category?: string
  isPublic?: boolean
  formConfig?: FormSchema
}): Promise<Result<void>> {
  try {
    const supabase = await createClient()

    const updates: any = {}
    if (params.name) updates.name = params.name
    if (params.description !== undefined) updates.description = params.description
    if (params.category !== undefined) updates.category = params.category
    if (params.isPublic !== undefined) updates.is_public = params.isPublic
    if (params.formConfig) updates.form_config = params.formConfig

    const { error } = await supabase
      .from("conference_form_templates")
      .update(updates)
      .eq("id", params.templateId)

    if (error) {
      console.error("Error updating template:", error)
      return { success: false, error: "Failed to update template" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateFormTemplate:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Deletes a template (soft delete).
 */
export async function deleteFormTemplate(
  templateId: string
): Promise<Result<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("conference_form_templates")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", templateId)

    if (error) {
      console.error("Error deleting template:", error)
      return { success: false, error: "Failed to delete template" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteFormTemplate:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Applies a template to an event (creates new schema from template).
 */
export async function applyTemplateToEvent(params: {
  templateId: string
  eventId: string
  activate?: boolean
}): Promise<Result<number>> {
  try {
    const supabase = await createClient()

    // Fetch the template
    const templateResult = await getFormTemplateById(params.templateId)
    if (!templateResult.success || !templateResult.data) {
      return {
        success: false,
        error: templateResult.error || "Template not found",
      }
    }

    const template = templateResult.data

    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Get next version number for this event
    const { data: existingSchemas } = await supabase
      .from("conference_form_schemas")
      .select("version")
      .eq("event_id", params.eventId)
      .order("version", { ascending: false })
      .limit(1)

    const nextVersion = existingSchemas && existingSchemas.length > 0
      ? existingSchemas[0].version + 1
      : 1

    // If activating, deactivate all other schemas for this event
    if (params.activate) {
      await supabase
        .from("conference_form_schemas")
        .update({ is_active: false })
        .eq("event_id", params.eventId)
    }

    // Create new schema from template
    const { error } = await supabase
      .from("conference_form_schemas")
      .insert({
        event_id: params.eventId,
        version: nextVersion,
        is_active: params.activate || false,
        form_config: template.formConfig,
        created_by: user.id,
        notes: `Applied from template: ${template.name}`,
      })

    if (error) {
      console.error("Error applying template:", error)
      return { success: false, error: "Failed to apply template" }
    }

    // Increment template usage count
    await supabase
      .from("conference_form_templates")
      .update({ times_used: template.timesUsed + 1 })
      .eq("id", params.templateId)

    return { success: true, data: nextVersion }
  } catch (error) {
    console.error("Error in applyTemplateToEvent:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Get template categories (distinct values).
 */
export async function getTemplateCategories(): Promise<Result<string[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("conference_form_templates")
      .select("category")
      .is("deleted_at", null)
      .not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return { success: false, error: "Failed to fetch categories" }
    }

    // Extract unique categories
    const categories = [
      ...new Set(data.map((row) => row.category).filter(Boolean)),
    ] as string[]

    return { success: true, data: categories }
  } catch (error) {
    console.error("Error in getTemplateCategories:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
