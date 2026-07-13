import { getActiveFormSchema } from "@/lib/actions/conference-form-schema"
import { getAllEvents, getCurrentEvent } from "@/lib/actions/events"
import { ConferenceFormBuilder } from "@/components/admin/conference-form-builder"

export const metadata = {
  title: "Form Builder | Conference Settings | Admin",
}

interface PageProps {
  searchParams: Promise<{ event?: string }>
}

export default async function FormBuilderPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  // Fetch all events
  const events = await getAllEvents()
  
  // Determine which event to use
  let selectedEventId = params.event
  if (!selectedEventId) {
    // Default to current event
    const currentEvent = await getCurrentEvent()
    selectedEventId = currentEvent?.id
  }
  
  // Fetch schema for selected event
  const schema = await getActiveFormSchema(selectedEventId)
  
  // If no schema found, use default
  if (!schema) {
    throw new Error("No form schema found. Please create an event first.")
  }

  return (
    <ConferenceFormBuilder
      initialSchema={schema}
      events={events}
      selectedEventId={selectedEventId || null}
    />
  )
}
