"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  FormSchema,
  FormSchemaMeta,
} from "@/lib/types/conference-form-schema";
import type { ActionResult } from "@/lib/types/events-module";

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

export async function getActiveFormSchema(
  eventId: string
): Promise<FormSchema | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_form_schemas")
      .select("form_config")
      .eq("event_id", eventId)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.form_config) {
      return null;
    }

    return data.form_config as FormSchema;
  } catch {
    return null;
  }
}

export async function getFormSchemaByVersion(
  eventId: string,
  version: number
): Promise<FormSchema | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_form_schemas")
      .select("form_config")
      .eq("event_id", eventId)
      .eq("version", version)
      .maybeSingle();

    if (error || !data?.form_config) return null;
    return data.form_config as FormSchema;
  } catch {
    return null;
  }
}

export async function getFormSchemaHistory(
  eventId: string
): Promise<FormSchemaMeta[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_form_schemas")
      .select("version, is_active, created_at, notes")
      .eq("event_id", eventId)
      .order("version", { ascending: false });

    if (error) return [];

    return (data ?? []).map((row) => ({
      version: row.version,
      isActive: row.is_active,
      createdAt: row.created_at,
      notes: row.notes,
    }));
  } catch {
    return [];
  }
}

// =============================================
// Write Operations
// =============================================

export async function createFormSchema(
  eventId: string,
  formConfig: FormSchema,
  publish: boolean = false
): Promise<ActionResult<{ version: number }>> {
  try {
    const { createServiceRoleClient } = await import("@/lib/supabase/service");
    const supabase = createServiceRoleClient();

    // Get the latest version for this event
    const { data: latest, error: latestError } = await supabase
      .from("event_form_schemas")
      .select("version")
      .eq("event_id", eventId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error("Error fetching latest version:", latestError);
    }

    const nextVersion = (latest?.version ?? 0) + 1;

    // If publishing, deactivate all current active schemas
    if (publish) {
      await supabase
        .from("event_form_schemas")
        .update({ is_active: false })
        .eq("event_id", eventId)
        .eq("is_active", true);
    }

    // Clean up any rows with null form_config (broken data from old inserts)
    await supabase
      .from("event_form_schemas")
      .delete()
      .eq("event_id", eventId)
      .is("form_config", null)

    const schemaToInsert = {
      event_id: eventId,
      version: nextVersion,
      is_active: publish,
      form_config: {
        ...formConfig,
        version: nextVersion,
        metadata: {
          ...formConfig.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
      notes: publish ? "Published via form builder" : "Draft saved",
    };

    console.log("Inserting schema:", { event_id: eventId, version: nextVersion, is_active: publish });

    const { data: insertData, error } = await supabase
      .from("event_form_schemas")
      .insert(schemaToInsert)
      .select("id, version, is_active");

    if (error) {
      console.error("Error inserting schema:", error);
      return { success: false, error: error.message };
    }

    console.log("Schema inserted successfully:", insertData);

    revalidatePath(`/admin/events/${eventId}/form-builder`);
    revalidatePath(`/admin/events/${eventId}/settings`);
    if (publish) {
      revalidatePath(`/events/register`);
    }

    return { success: true, data: { version: nextVersion } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create form schema",
    };
  }
}

export async function activateSchemaVersion(
  eventId: string,
  version: number
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    // Deactivate all schemas for this event
    const { error: deactivateError } = await supabase
      .from("event_form_schemas")
      .update({ is_active: false })
      .eq("event_id", eventId)
      .eq("is_active", true);

    if (deactivateError) {
      return { success: false, error: deactivateError.message };
    }

    // Activate the requested version
    const { error: activateError } = await supabase
      .from("event_form_schemas")
      .update({ is_active: true })
      .eq("event_id", eventId)
      .eq("version", version);

    if (activateError) {
      return { success: false, error: activateError.message };
    }

    revalidatePath(`/admin/events/${eventId}/form-builder`);
    revalidatePath(`/admin/events/${eventId}/settings`);
    revalidatePath(`/events/register`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to activate schema",
    };
  }
}
