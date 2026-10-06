import { EventSettingsClient } from "@/components/admin/events/event-settings-client"

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EventSettingsClient eventId={id} />
}
