"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDefaultTemplateHtml } from "@/lib/email/templates/default-event-templates";
import type {
  EventEmailTemplate,
  EmailTemplateType,
  CreateEmailTemplateInput,
  ActionResult,
} from "@/lib/types/events-module";

// Auth guard for admin operations
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!admin) throw new Error("Unauthorized: Not an admin user");
  return { supabase, admin };
}

// =============================================
// Read Operations
// =============================================

export async function getEmailTemplates(
  eventId: string
): Promise<EventEmailTemplate[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_email_templates")
      .select("*")
      .eq("event_id", eventId)
      .order("template_type");

    if (error) {
      console.error("Failed to fetch email templates:", error);
      return [];
    }

    return (data || []) as EventEmailTemplate[];
  } catch (err) {
    console.error("Error fetching email templates:", err);
    return [];
  }
}

export async function getEmailTemplate(
  eventId: string,
  templateType: EmailTemplateType
): Promise<EventEmailTemplate | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_email_templates")
      .select("*")
      .eq("event_id", eventId)
      .eq("template_type", templateType)
      .maybeSingle();

    if (error || !data) return null;
    return data as EventEmailTemplate;
  } catch {
    return null;
  }
}

// =============================================
// Write Operations
// =============================================

export async function upsertEmailTemplate(
  input: CreateEmailTemplateInput
): Promise<ActionResult<EventEmailTemplate>> {
  try {
    const { supabase } = await requireAdmin();

    // If an id is provided, update that specific template (used for editing custom templates)
    if (input.id) {
      const { data, error } = await supabase
        .from("event_email_templates")
        .update({
          label: input.label ?? null,
          subject: input.subject,
          body_html: input.body_html,
          body_text: input.body_text || null,
          is_active: input.is_active ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/admin/events/${input.event_id}/settings`);
      return { success: true, data: data as EventEmailTemplate };
    }

    // For standard types: upsert by (event_id, template_type) — one per event
    if (input.template_type !== "custom") {
      const { data: existing } = await supabase
        .from("event_email_templates")
        .select("id")
        .eq("event_id", input.event_id)
        .eq("template_type", input.template_type)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("event_email_templates")
          .update({
            subject: input.subject,
            body_html: input.body_html,
            body_text: input.body_text || null,
            is_active: input.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        revalidatePath(`/admin/events/${input.event_id}/settings`);
        return { success: true, data: data as EventEmailTemplate };
      }
    }

    // Insert new (custom templates or first standard template)
    const { data, error } = await supabase
      .from("event_email_templates")
      .insert({
        event_id: input.event_id,
        template_type: input.template_type,
        label: input.label ?? null,
        subject: input.subject,
        body_html: input.body_html,
        body_text: input.body_text || null,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${input.event_id}/settings`);
    return { success: true, data: data as EventEmailTemplate };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteEmailTemplate(
  id: string,
  eventId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("event_email_templates")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}/email-templates`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// =============================================
// Default Template Operations
// =============================================

/**
 * Create all 4 default email templates for an event.
 * Called when a new event is created. Skips templates that already exist.
 */
export async function createDefaultEmailTemplates(
  eventId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    const templateTypes = [
      "confirmation",
      "payment_receipt",
      "reminder",
      "cancellation",
    ] as const;

    const templatesToInsert = templateTypes.map((type) => {
      const tpl = getDefaultTemplateHtml(type);
      return {
        event_id: eventId,
        template_type: type,
        subject: tpl.subject,
        body_html: tpl.body_html,
        body_text: null,
        is_active: true,
      };
    });

    // Use upsert to skip existing templates (unique constraint on event_id + template_type)
    const { error } = await supabase
      .from("event_email_templates")
      .upsert(templatesToInsert, {
        onConflict: "event_id,template_type",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("Failed to create default email templates:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true };
  } catch (err) {
    console.error("Error creating default email templates:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Seed any missing default email templates for an existing event.
 * Safe to call multiple times — only inserts templates that don't exist yet.
 */
export async function seedMissingTemplates(
  eventId: string
): Promise<ActionResult<{ inserted: number }>> {
  try {
    const { supabase } = await requireAdmin();

    const templateTypes = ["confirmation", "payment_receipt", "reminder", "cancellation"] as const;

    // Check which types already exist
    const { data: existing } = await supabase
      .from("event_email_templates")
      .select("template_type")
      .eq("event_id", eventId);

    const existingTypes = new Set((existing || []).map((t) => t.template_type));
    const missingTypes = templateTypes.filter((t) => !existingTypes.has(t));

    if (missingTypes.length === 0) {
      return { success: true, data: { inserted: 0 } };
    }

    const templatesToInsert = missingTypes.map((type) => {
      const tpl = getDefaultTemplateHtml(type);
      return {
        event_id: eventId,
        template_type: type,
        subject: tpl.subject,
        body_html: tpl.body_html,
        body_text: null,
        is_active: true,
      };
    });

    const { error } = await supabase
      .from("event_email_templates")
      .insert(templatesToInsert);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true, data: { inserted: missingTypes.length } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Reset a single email template back to its default version.
 */
export async function resetToDefaultTemplate(
  eventId: string,
  templateType: EmailTemplateType
): Promise<ActionResult<EventEmailTemplate>> {
  try {
    const { supabase } = await requireAdmin();

    // Only the 4 standard types have defaults
    if (templateType === "custom") {
      return { success: false, error: "Custom templates have no default version" };
    }

    const defaultTemplate = getDefaultTemplateHtml(templateType);

    // Upsert the default template
    const { data: existing } = await supabase
      .from("event_email_templates")
      .select("id")
      .eq("event_id", eventId)
      .eq("template_type", templateType)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("event_email_templates")
        .update({
          subject: defaultTemplate.subject,
          body_html: defaultTemplate.body_html,
          body_text: null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/admin/events/${eventId}/settings`);
      return { success: true, data: data as EventEmailTemplate };
    } else {
      const { data, error } = await supabase
        .from("event_email_templates")
        .insert({
          event_id: eventId,
          template_type: templateType,
          subject: defaultTemplate.subject,
          body_html: defaultTemplate.body_html,
          body_text: null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/admin/events/${eventId}/settings`);
      return { success: true, data: data as EventEmailTemplate };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
