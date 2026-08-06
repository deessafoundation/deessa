"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  EventTicketType,
  CreateTicketTypeInput,
  ActionResult,
} from "@/lib/types/events-module";

// Auth guard for admin operations
async function requireAdmin() {
  const supabase = await createClient();
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    throw new Error("Session expired. Please log in again.");
  }
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

export async function getTicketTypes(
  eventId: string
): Promise<EventTicketType[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("event_ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order");

    if (error) {
      console.error("Failed to fetch ticket types:", error);
      return [];
    }

    return (data || []) as EventTicketType[];
  } catch (err) {
    console.error("Error fetching ticket types:", err);
    return [];
  }
}

// =============================================
// Write Operations
// =============================================

export async function createTicketType(
  input: CreateTicketTypeInput
): Promise<ActionResult<EventTicketType>> {
  try {
    const { supabase } = await requireAdmin();

    // Get next sort_order
    const { data: existing } = await supabase
      .from("event_ticket_types")
      .select("sort_order")
      .eq("event_id", input.event_id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("event_ticket_types")
      .insert({
        event_id: input.event_id,
        name: input.name,
        price: input.price || 0,
        price_tbd: input.price_tbd ?? false,
        currency: input.currency || "NPR",
        capacity: input.capacity || null,
        sales_start: input.sales_start || null,
        sales_end: input.sales_end || null,
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${input.event_id}/pricing`);
    return { success: true, data: data as EventTicketType };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateTicketType(
  id: string,
  input: Partial<CreateTicketTypeInput>
): Promise<ActionResult<EventTicketType>> {
  try {
    const { supabase } = await requireAdmin();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.price_tbd !== undefined) updateData.price_tbd = input.price_tbd;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.sales_start !== undefined) updateData.sales_start = input.sales_start;
    if (input.sales_end !== undefined) updateData.sales_end = input.sales_end;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order;

    const { data, error } = await supabase
      .from("event_ticket_types")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (input.event_id) {
      revalidatePath(`/admin/events/${input.event_id}/pricing`);
    }
    return { success: true, data: data as EventTicketType };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteTicketType(
  id: string,
  eventId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("event_ticket_types")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}/pricing`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
