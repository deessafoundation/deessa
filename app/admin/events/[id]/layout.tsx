import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { EventModuleEvent } from "@/lib/types/events-module"

async function getEvent(id: string): Promise<EventModuleEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as EventModuleEvent
}

export default async function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  return <div className="space-y-6">{children}</div>
}
