import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventRegistrationForm } from "@/components/events/public/event-registration-form"
import type { EventModuleEvent, EventTicketType } from "@/lib/types/events-module"
import type { FormSchema } from "@/lib/types/conference-form-schema"

async function getEvent(slug: string): Promise<EventModuleEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  if (error) return null
  return data as EventModuleEvent
}

async function getActiveFormSchema(
  eventId: string
): Promise<FormSchema | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_form_schemas")
    .select("form_config")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.form_config as FormSchema) || null
}

async function getTicketTypes(eventId: string): Promise<EventTicketType[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .or(`sales_end.is.null,sales_end.gt.${now}`)
    .or(`sales_start.is.null,sales_start.lte.${now}`)
    .order("sort_order")
  return (data || []) as EventTicketType[]
}

export const metadata = {
  title: "Register | Event",
}

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const [schema, ticketTypes] = await Promise.all([
    getActiveFormSchema(event.id),
    getTicketTypes(event.id),
  ])

  // Debug: log ticket types to help diagnose "Invalid ticket type" errors
  console.log("[Register Page]", {
    eventId: event.id,
    eventSlug: slug,
    isFree: event.is_free,
    ticketTypeCount: ticketTypes.length,
    ticketTypeIds: ticketTypes.map((t) => t.id),
  })

  return (
    <EventRegistrationForm
      event={event}
      schema={schema}
      ticketTypes={ticketTypes}
    />
  )
}
