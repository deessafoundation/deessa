"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  EventModuleEvent,
  EventStatus,
  EventCategory,
  CreateEventInput,
  UpdateEventInput,
  EventFilters,
  PaginatedResult,
  ActionResult,
} from "@/lib/types/events-module";

// =============================================
// Auth Guard (defense-in-depth)
// =============================================
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify admin status
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!admin) {
    throw new Error("Unauthorized: Not an admin user");
  }

  return { supabase, admin };
}

// =============================================
// Read Operations
// =============================================

/**
 * Get published events for public listing.
 * Only returns events with status='published'.
 */
export async function getPublishedEvents(): Promise<EventModuleEvent[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch published events:", error);
      return [];
    }

    return (data || []) as EventModuleEvent[];
  } catch (err) {
    console.error("Error fetching published events:", err);
    return [];
  }
}

/**
 * Get all events for admin (any status).
 */
export async function getAllEvents(
  filters?: EventFilters
): Promise<PaginatedResult<EventModuleEvent>> {
  try {
    const supabase = await createClient();
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase.from("events").select("*", { count: "exact" });

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.search) {
      // Sanitize search input for PostgREST
      const sanitizedSearch = filters.search
        .replace(/'/g, "''")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
      query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
    }

    // Paginate and order
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Failed to fetch events:", error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    return {
      data: (data || []) as EventModuleEvent[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (err) {
    console.error("Error fetching events:", err);
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

/**
 * Get a single event by ID (admin use).
 */
export async function getEventById(
  id: string
): Promise<EventModuleEvent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch event by ID:", error);
      return null;
    }

    return data as EventModuleEvent;
  } catch (err) {
    console.error("Error fetching event by ID:", err);
    return null;
  }
}

/**
 * Get a single event by slug (public use).
 * Only returns published events.
 */
export async function getEventBySlug(
  slug: string
): Promise<EventModuleEvent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Failed to fetch event by slug:", error);
      return null;
    }

    return data as EventModuleEvent;
  } catch (err) {
    console.error("Error fetching event by slug:", err);
    return null;
  }
}

/**
 * Get event by slug for admin (any status).
 */
export async function getEventBySlugAdmin(
  slug: string
): Promise<EventModuleEvent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Failed to fetch event by slug (admin):", error);
      return null;
    }

    return data as EventModuleEvent;
  } catch (err) {
    console.error("Error fetching event by slug (admin):", err);
    return null;
  }
}

// =============================================
// Write Operations
// =============================================

/**
 * Create a new event.
 * Sets status='draft' by default.
 */
export async function createEvent(
  input: CreateEventInput
): Promise<ActionResult<EventModuleEvent>> {
  try {
    const { supabase, admin } = await requireAdmin();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", input.slug)
      .single();

    if (existing) {
      return { success: false, error: "An event with this slug already exists" };
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: input.title,
        slug: input.slug,
        description: input.description,
        short_description: input.short_description || null,
        event_date: input.event_date,
        event_time: input.event_time || null,
        event_end_date: input.event_end_date || null,
        location: input.location,
        venue_name: input.venue_name || null,
        address: input.address || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        image: input.image || null,
        banner_url: input.banner_url || null,
        gallery: input.gallery || [],
        status: "draft",
        category: input.category || "general",
        registration_enabled: input.registration_enabled ?? true,
        registration_open_at: input.registration_open_at || null,
        registration_close_at: input.registration_close_at || null,
        max_capacity: input.max_capacity ?? null,
        is_free: input.is_free ?? false,
        allow_online_payment: input.allow_online_payment ?? true,
        allow_qr_payment: input.allow_qr_payment ?? false,
        allow_pay_at_venue: input.allow_pay_at_venue ?? false,
        payment_qr_image_url: input.payment_qr_image_url || null,
        payment_instructions: input.payment_instructions || null,
        payment_bank_name: input.payment_bank_name || null,
        payment_account_name: input.payment_account_name || null,
        payment_account_number: input.payment_account_number || null,
        contact_email: input.contact_email || null,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create event:", error);
      return { success: false, error: error.message };
    }

    // Create default email templates directly (reuse authenticated client)
    const defaultTemplateTypes = ["confirmation", "payment_receipt", "reminder", "cancellation", "payment_reminder"] as const;
    const { getDefaultTemplateHtml } = await import(
      "@/lib/email/templates/default-event-templates"
    );
    const templatesToInsert = defaultTemplateTypes.map((type) => {
      const tpl = getDefaultTemplateHtml(type);
      return {
        event_id: data.id,
        template_type: type,
        subject: tpl.subject,
        body_html: tpl.body_html,
        body_text: null,
        is_active: true,
      };
    });
    const { error: tplError } = await supabase
      .from("event_email_templates")
      .upsert(templatesToInsert, { onConflict: "event_id,template_type", ignoreDuplicates: true });
    if (tplError) {
      console.error("Failed to create default email templates:", tplError);
    }

    return { success: true, data: data as EventModuleEvent };
  } catch (err) {
    console.error("Error creating event:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update an existing event.
 */
export async function updateEvent(
  id: string,
  input: UpdateEventInput
): Promise<ActionResult<EventModuleEvent>> {
  try {
    const { supabase } = await requireAdmin();

    // If slug is changing, check uniqueness
    if (input.slug) {
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("slug", input.slug)
        .neq("id", id)
        .single();

      if (existing) {
        return {
          success: false,
          error: "An event with this slug already exists",
        };
      }
    }

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.short_description !== undefined)
      updateData.short_description = input.short_description;
    if (input.event_date !== undefined) updateData.event_date = input.event_date;
    if (input.event_time !== undefined) updateData.event_time = input.event_time;
    if (input.event_end_date !== undefined)
      updateData.event_end_date = input.event_end_date;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.venue_name !== undefined) updateData.venue_name = input.venue_name;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.image !== undefined) updateData.image = input.image;
    if (input.banner_url !== undefined) updateData.banner_url = input.banner_url;
    if (input.gallery !== undefined) updateData.gallery = input.gallery;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.registration_enabled !== undefined)
      updateData.registration_enabled = input.registration_enabled;
    if (input.registration_open_at !== undefined)
      updateData.registration_open_at = input.registration_open_at;
    if (input.registration_close_at !== undefined)
      updateData.registration_close_at = input.registration_close_at;
    if (input.max_capacity !== undefined)
      updateData.max_capacity = input.max_capacity;
    if (input.is_free !== undefined) updateData.is_free = input.is_free;
    if (input.allow_online_payment !== undefined) updateData.allow_online_payment = input.allow_online_payment;
    if (input.allow_qr_payment !== undefined) updateData.allow_qr_payment = input.allow_qr_payment;
    if (input.allow_pay_at_venue !== undefined) updateData.allow_pay_at_venue = input.allow_pay_at_venue;
    if (input.payment_qr_image_url !== undefined)
      updateData.payment_qr_image_url = input.payment_qr_image_url;
    if (input.payment_instructions !== undefined)
      updateData.payment_instructions = input.payment_instructions;
    if (input.payment_bank_name !== undefined)
      updateData.payment_bank_name = input.payment_bank_name;
    if (input.payment_account_name !== undefined)
      updateData.payment_account_name = input.payment_account_name;
    if (input.payment_account_number !== undefined)
      updateData.payment_account_number = input.payment_account_number;
    if (input.contact_email !== undefined)
      updateData.contact_email = input.contact_email;
    if (input.status !== undefined) updateData.status = input.status;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update event:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EventModuleEvent };
  } catch (err) {
    console.error("Error updating event:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Set event status with transition validation.
 */
export async function setEventStatus(
  id: string,
  newStatus: EventStatus
): Promise<ActionResult<EventModuleEvent>> {
  try {
    const { supabase } = await requireAdmin();

    // Get current status
    const { data: current, error: fetchError } = await supabase
      .from("events")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return { success: false, error: "Event not found" };
    }

    // Validate transition
    const validTransitions: Record<EventStatus, EventStatus[]> = {
      draft: ["published"],
      published: ["disabled", "archived"],
      disabled: ["published", "archived"],
      archived: ["draft"],
    };

    const currentStatus = current.status as EventStatus;
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition from "${currentStatus}" to "${newStatus}"`,
      };
    }

    // Update status
    const { data, error } = await supabase
      .from("events")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to set event status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");

    return { success: true, data: data as EventModuleEvent };
  } catch (err) {
    console.error("Error setting event status:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Duplicate an event as a new draft.
 * Copies: details, agenda, ticket types, email templates, active form schema.
 * Does NOT copy: registrations.
 */
export async function duplicateEvent(
  id: string
): Promise<ActionResult<EventModuleEvent>> {
  try {
    const { supabase } = await requireAdmin();

    // Get the original event
    const { data: original, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !original) {
      return { success: false, error: "Event not found" };
    }

    // Create new event with "(Copy)" suffix
    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const { data: newEvent, error: createError } = await supabase
      .from("events")
      .insert({
        title: `${original.title} (Copy)`,
        slug: newSlug,
        description: original.description,
        short_description: original.short_description,
        event_date: original.event_date,
        event_time: original.event_time,
        event_end_date: original.event_end_date,
        location: original.location,
        venue_name: original.venue_name,
        address: original.address,
        latitude: original.latitude,
        longitude: original.longitude,
        image: original.image,
        banner_url: original.banner_url,
        gallery: original.gallery,
        status: "draft",
        category: original.category,
        registration_enabled: original.registration_enabled,
        registration_open_at: original.registration_open_at,
        registration_close_at: original.registration_close_at,
        max_capacity: original.max_capacity,
        is_free: original.is_free,
        allow_online_payment: original.allow_online_payment,
        allow_qr_payment: original.allow_qr_payment,
        allow_pay_at_venue: original.allow_pay_at_venue,
        payment_qr_image_url: original.payment_qr_image_url,
        payment_instructions: original.payment_instructions,
        payment_bank_name: original.payment_bank_name,
        payment_account_name: original.payment_account_name,
        payment_account_number: original.payment_account_number,
        contact_email: original.contact_email,
        created_by: original.created_by,
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to duplicate event:", createError);
      return { success: false, error: createError.message };
    }

    // Copy agenda items
    const { data: agendaItems } = await supabase
      .from("event_agenda_items")
      .select("*")
      .eq("event_id", id);

    if (agendaItems && agendaItems.length > 0) {
      const newAgendaItems = agendaItems.map((item) => ({
        event_id: newEvent.id,
        day_number: item.day_number,
        day_label: item.day_label,
        start_time: item.start_time,
        end_time: item.end_time,
        title: item.title,
        description: item.description,
        speaker_name: item.speaker_name,
        speaker_title: item.speaker_title,
        track_or_room: item.track_or_room,
        highlighted: item.highlighted,
        sort_order: item.sort_order,
      }));

      await supabase.from("event_agenda_items").insert(newAgendaItems);
    }

    // Copy ticket types
    const { data: ticketTypes } = await supabase
      .from("event_ticket_types")
      .select("*")
      .eq("event_id", id);

    if (ticketTypes && ticketTypes.length > 0) {
      const newTicketTypes = ticketTypes.map((ticket) => ({
        event_id: newEvent.id,
        name: ticket.name,
        price: ticket.price,
        currency: ticket.currency,
        capacity: ticket.capacity,
        sales_start: ticket.sales_start,
        sales_end: ticket.sales_end,
        is_active: ticket.is_active,
        sort_order: ticket.sort_order,
      }));

      await supabase.from("event_ticket_types").insert(newTicketTypes);
    }

    // Copy email templates
    const { data: emailTemplates } = await supabase
      .from("event_email_templates")
      .select("*")
      .eq("event_id", id);

    if (emailTemplates && emailTemplates.length > 0) {
      const newEmailTemplates = emailTemplates.map((template) => ({
        event_id: newEvent.id,
        template_type: template.template_type,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        is_active: template.is_active,
      }));

      await supabase.from("event_email_templates").insert(newEmailTemplates);
    }

    // Copy active form schema (as new version 1, active)
    const { data: activeSchema } = await supabase
      .from("event_form_schemas")
      .select("*")
      .eq("event_id", id)
      .eq("is_active", true)
      .single();

    if (activeSchema) {
      await supabase.from("event_form_schemas").insert({
        event_id: newEvent.id,
        version: 1,
        is_active: true,
        form_config: activeSchema.form_config,
        created_by: activeSchema.created_by,
        notes: `Copied from event "${original.title}"`,
      });
    }

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${newEvent.id}`);

    return { success: true, data: newEvent as EventModuleEvent };
  } catch (err) {
    console.error("Error duplicating event:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Archive an event (soft-remove from active lists).
 */
export async function archiveEvent(
  id: string
): Promise<ActionResult<EventModuleEvent>> {
  return setEventStatus(id, "archived");
}

/**
 * Restore an archived event back to draft.
 */
export async function restoreEvent(
  id: string
): Promise<ActionResult<EventModuleEvent>> {
  return setEventStatus(id, "draft");
}

/**
 * Delete an event.
 * Only allowed if event has zero registrations (guarded by can_delete_event()).
 */
export async function deleteEvent(
  id: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAdmin();

    // Check if event can be deleted (no registrations)
    const { data: canDelete } = await supabase.rpc("can_delete_event", {
      p_event_id: id,
    });

    if (canDelete === false) {
      return {
        success: false,
        error:
          "Cannot delete event with existing registrations. Archive the event instead.",
      };
    }

    // Delete the event (cascades to agenda, tickets, email templates, form schemas)
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete event:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error deleting event:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check if an event can be deleted (has no registrations).
 */
export async function canDeleteEvent(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data } = await supabase.rpc("can_delete_event", {
      p_event_id: id,
    });

    return data === true;
  } catch (err) {
    console.error("Error checking can_delete_event:", err);
    return false;
  }
}
