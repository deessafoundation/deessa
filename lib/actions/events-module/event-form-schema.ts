"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/audit/audit-logger";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";
import type {
  FormSchema,
  FormSchemaMeta,
} from "@/lib/types/event-form-schema";
import type { ActionResult } from "@/lib/types/events-module";

// Auth guard for admin operations
async function requireAdmin(allowedRoles?: string[]) {
  const supabase = await createClient();
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Unauthorized: Inactive or unauthorized admin session.");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
    throw new Error("Forbidden: Insufficient role permissions for this operation.");
  }

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
    const { admin } = await requireAdmin();
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

    void logAdminActivity({
      action: publish ? "EVENT_FORM_SCHEMA_PUBLISHED" : "EVENT_FORM_SCHEMA_SAVED",
      domain: "EVENT",
      entityType: "event_form_schemas",
      entityId: insertData?.[0]?.id || `${eventId}-v${nextVersion}`,
      description: `${publish ? "Published" : "Saved draft"} form schema v${nextVersion} for event ${eventId}`,
      newData: { event_id: eventId, version: nextVersion, is_active: publish },
      actorId: admin.user_id,
      actorEmail: admin.email,
    });

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
    const { supabase, admin } = await requireAdmin();

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

    void logAdminActivity({
      action: "EVENT_FORM_SCHEMA_ACTIVATED",
      domain: "EVENT",
      entityType: "event_form_schemas",
      entityId: `${eventId}-v${version}`,
      description: `Activated form schema v${version} for event ${eventId}`,
      newData: { event_id: eventId, version },
      actorId: admin.user_id,
      actorEmail: admin.email,
    });

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
