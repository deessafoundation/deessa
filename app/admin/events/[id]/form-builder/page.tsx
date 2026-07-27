import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventFormBuilder } from "@/components/events/admin/EventFormBuilder"
import type { FormSchema } from "@/lib/types/conference-form-schema"

async function getEvent(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", id)
    .single()
  return data
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

const DEFAULT_SCHEMA: FormSchema = {
  version: 1,
  steps: [
    {
      id: "personal",
      label: "Personal Details",
      description: "Please provide your contact information",
      order: 0,
      fields: [
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          required: true,
          storage: "core",
          order: 0,
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          required: true,
          storage: "core",
          order: 1,
        },
        {
          id: "phone",
          type: "tel",
          label: "Phone Number",
          required: false,
          storage: "core",
          order: 2,
        },
      ],
    },
  ],
  metadata: {
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export default async function EventFormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, activeSchema] = await Promise.all([
    getEvent(id),
    getActiveFormSchema(id),
  ])

  if (!event) {
    notFound()
  }

  return (
    <EventFormBuilder
      eventId={id}
      initialSchema={activeSchema || DEFAULT_SCHEMA}
    />
  )
}
