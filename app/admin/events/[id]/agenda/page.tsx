import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AgendaEditor } from "@/components/admin/events/agenda-editor"
import type { EventAgendaItem } from "@/lib/types/events-module"

async function getEvent(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", id)
    .single()
  return data
}

async function getAgenda(eventId: string): Promise<EventAgendaItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_agenda_items")
    .select("*")
    .eq("event_id", eventId)
    .order("day_number")
    .order("sort_order")
  return (data || []) as EventAgendaItem[]
}

export default async function EventAgendaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, agendaItems] = await Promise.all([
    getEvent(id),
    getAgenda(id),
  ])

  if (!event) {
    notFound()
  }

  return <AgendaEditor eventId={id} items={agendaItems} />
}
