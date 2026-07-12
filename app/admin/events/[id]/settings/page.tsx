import { EventSettingsClient } from "@/components/events/admin/EventSettingsClient"

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EventSettingsClient eventId={id} />
}
