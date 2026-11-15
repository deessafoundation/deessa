import { redirect } from "next/navigation"

export default async function EventMediaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/events/${id}/settings?tab=media`)
}
