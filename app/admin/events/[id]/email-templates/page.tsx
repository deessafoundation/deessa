import { redirect } from "next/navigation"

export default async function EventEmailTemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/events/${id}/settings?tab=email-templates`)
}
