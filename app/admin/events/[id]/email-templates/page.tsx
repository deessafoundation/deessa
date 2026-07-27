import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EmailTemplateEditor } from "@/components/events/admin/EmailTemplateEditor"
import type { EventEmailTemplate } from "@/lib/types/events-module"

async function getEvent(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", id)
    .single()
  return data
}

async function getEmailTemplates(
  eventId: string
): Promise<EventEmailTemplate[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_email_templates")
    .select("*")
    .eq("event_id", eventId)
    .order("template_type")
  return (data || []) as EventEmailTemplate[]
}

export default async function EventEmailTemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, templates] = await Promise.all([
    getEvent(id),
    getEmailTemplates(id),
  ])

  if (!event) {
    notFound()
  }

  return <EmailTemplateEditor eventId={id} templates={templates} />
}
