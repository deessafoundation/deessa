/**
 * Ticket capacity helpers — keeps event_ticket_types.sold_count in sync
 * when registrations are confirmed or cancelled.
 *
 * Works with any Supabase client (server action, service role, etc.)
 * Gracefully skips if sold_count column doesn't exist (migration 053 not run).
 */

export async function incrementTicketSoldCount(
  supabase: any,
  ticketTypeId: string | null | undefined
) {
  if (!ticketTypeId) return;

  // Try RPC first (if migration 053 created the function)
  const { error } = await supabase.rpc("increment_ticket_sold_count", {
    p_ticket_type_id: ticketTypeId,
  });

  if (error) {
    // Fallback: manual read-then-write
    const { data: tt } = await supabase
      .from("event_ticket_types")
      .select("sold_count")
      .eq("id", ticketTypeId)
      .single();

    if (tt) {
      await supabase
        .from("event_ticket_types")
        .update({ sold_count: (tt.sold_count || 0) + 1 })
        .eq("id", ticketTypeId);
    }
  }
}

export async function decrementTicketSoldCount(
  supabase: any,
  ticketTypeId: string | null | undefined
) {
  if (!ticketTypeId) return;

  const { error } = await supabase.rpc("decrement_ticket_sold_count", {
    p_ticket_type_id: ticketTypeId,
  });

  if (error) {
    const { data: tt } = await supabase
      .from("event_ticket_types")
      .select("sold_count")
      .eq("id", ticketTypeId)
      .single();

    if (tt && (tt.sold_count || 0) > 0) {
      await supabase
        .from("event_ticket_types")
        .update({ sold_count: (tt.sold_count || 0) - 1 })
        .eq("id", ticketTypeId);
    }
  }
}
