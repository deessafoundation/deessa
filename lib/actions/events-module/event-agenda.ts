"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/audit/audit-logger";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";
import type {
  EventAgendaItem,
  CreateAgendaItemInput,
  ActionResult,
} from "@/lib/types/events-module";

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

export async function getAgendaItems(
  eventId: string
): Promise<EventAgendaItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_agenda_items")
      .select("*")
      .eq("event_id", eventId)
      .order("day_number")
      .order("sort_order");

    if (error) {
      console.error("Failed to fetch agenda items:", error);
      return [];
    }

    return (data || []) as EventAgendaItem[];
  } catch (err) {
    console.error("Error fetching agenda items:", err);
    return [];
  }
}

export async function getAgendaDays(
  eventId: string
): Promise<{ day_number: number; day_label: string | null }[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_agenda_items")
      .select("day_number, day_label")
      .eq("event_id", eventId)
      .order("day_number");

    if (error) return [];

    // Deduplicate by day_number
    const seen = new Set<number>();
    const days: { day_number: number; day_label: string | null }[] = [];

    for (const row of data || []) {
      if (!seen.has(row.day_number)) {
        seen.add(row.day_number);
        days.push({ day_number: row.day_number, day_label: row.day_label });
      }
    }

    return days;
  } catch {
    return [];
  }
}

// =============================================
// Write Operations
// =============================================

export async function createAgendaItem(
  input: CreateAgendaItemInput
): Promise<ActionResult<EventAgendaItem>> {
  try {
    const { supabase } = await requireAdmin();

    // Get next sort_order for this day
    const { data: existing } = await supabase
      .from("event_agenda_items")
      .select("sort_order")
      .eq("event_id", input.event_id)
      .eq("day_number", input.day_number || 1)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder = existing && existing.length > 0
      ? existing[0].sort_order + 1
      : 0;

    const { data, error } = await supabase
      .from("event_agenda_items")
      .insert({
        event_id: input.event_id,
        day_number: input.day_number || 1,
        day_label: input.day_label || null,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
        title: input.title,
        description: input.description || null,
        speaker_name: input.speaker_name || null,
        speaker_title: input.speaker_title || null,
        track_or_room: input.track_or_room || null,
        highlighted: input.highlighted ?? false,
        sort_order: input.sort_order ?? nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminActivity({
      action: "EVENT_AGENDA_CREATED",
      domain: "EVENTS",
      entityType: "event_agenda_items",
      entityId: data.id,
      summary: `Admin added agenda item "${data.title}" (Day ${data.day_number})`,
      newData: data,
    });

    revalidatePath(`/admin/events/${input.event_id}/settings`);
    return { success: true, data: data as EventAgendaItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateAgendaItem(
  id: string,
  input: Partial<CreateAgendaItemInput>
): Promise<ActionResult<EventAgendaItem>> {
  try {
    const { supabase } = await requireAdmin();

    const updateData: Record<string, unknown> = {};
    if (input.day_number !== undefined) updateData.day_number = input.day_number;
    if (input.day_label !== undefined) updateData.day_label = input.day_label;
    if (input.start_time !== undefined) updateData.start_time = input.start_time;
    if (input.end_time !== undefined) updateData.end_time = input.end_time;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.speaker_name !== undefined) updateData.speaker_name = input.speaker_name;
    if (input.speaker_title !== undefined) updateData.speaker_title = input.speaker_title;
    if (input.track_or_room !== undefined) updateData.track_or_room = input.track_or_room;
    if (input.highlighted !== undefined) updateData.highlighted = input.highlighted;
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("event_agenda_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminActivity({
      action: "EVENT_AGENDA_UPDATED",
      domain: "EVENTS",
      entityType: "event_agenda_items",
      entityId: id,
      summary: `Admin updated agenda item "${data.title}"`,
      newData: updateData,
    });

    if (input.event_id) {
      revalidatePath(`/admin/events/${input.event_id}/settings`);
    }
    return { success: true, data: data as EventAgendaItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteAgendaItem(
  id: string,
  eventId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("event_agenda_items")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminActivity({
      action: "EVENT_AGENDA_DELETED",
      domain: "EVENTS",
      entityType: "event_agenda_items",
      entityId: id,
      summary: `Admin deleted agenda item ${id} for event ${eventId}`,
      oldData: { id, eventId },
    });

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function reorderAgendaItems(
  eventId: string,
  itemIds: string[]
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    // Update sort_order for each item, validating event ownership
    const updates = itemIds.map((id, index) =>
      supabase
        .from("event_agenda_items")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("event_id", eventId) // Validate event ownership
    );

    await Promise.all(updates);

    await logAdminActivity({
      action: "EVENT_AGENDA_REORDERED",
      domain: "EVENTS",
      entityType: "event_agenda_items",
      entityId: eventId,
      summary: `Admin reordered ${itemIds.length} agenda items for event ${eventId}`,
      newData: { count: itemIds.length, itemIds },
    });

    revalidatePath(`/admin/events/${eventId}/settings`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
