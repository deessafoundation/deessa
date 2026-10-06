import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PricingEditor } from "@/components/admin/events/pricing-editor"
import type { EventTicketType } from "@/lib/types/events-module"

async function getEvent(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("id, title, is_free")
    .eq("id", id)
    .single()
  return data
}

async function getTicketTypes(eventId: string): Promise<EventTicketType[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order")
  return (data || []) as EventTicketType[]
}

export default async function EventPricingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, ticketTypes] = await Promise.all([
    getEvent(id),
    getTicketTypes(id),
  ])

  if (!event) {
    notFound()
  }

  return (
    <PricingEditor
      eventId={id}
      ticketTypes={ticketTypes}
      isFree={event.is_free}
    />
  )
}
