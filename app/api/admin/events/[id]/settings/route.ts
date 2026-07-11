import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const [
      { data: event },
      { data: registrations },
      { data: formSchema },
      { data: ticketTypes },
    ] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase
        .from("event_registrations")
        .select("status, payment_status, payment_amount", { count: "exact" })
        .eq("event_id", id),
      supabase
        .from("event_form_schemas")
        .select("version, is_active")
        .eq("event_id", id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("event_ticket_types")
        .select("id, is_active")
        .eq("event_id", id),
    ])

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const regs = registrations || []
    const total = regs.length
    const confirmed = regs.filter((r) => r.status === "confirmed").length
    const pending = regs.filter((r) => r.status === "pending").length
    const cancelled = regs.filter((r) => r.status === "cancelled").length
    const revenue = regs
      .filter((r) => r.payment_status === "paid")
      .reduce((sum, r) => sum + (r.payment_amount || 0), 0)

    const activeTickets = (ticketTypes || []).filter((t) => t.is_active)

    let formStatus = "No form"
    let formVersion = 0
    if (formSchema) {
      formVersion = formSchema.version
      formStatus = formSchema.is_active ? "Active" : "Draft"
    }

    return NextResponse.json({
      event,
      stats: {
        total,
        confirmed,
        pending,
        cancelled,
        revenue,
        formStatus,
        formVersion,
        ticketTypes: activeTickets.length,
        isFree: event.is_free,
      },
      ticketTypes: activeTickets,
    })
  } catch (error) {
    console.error("Error fetching event settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
