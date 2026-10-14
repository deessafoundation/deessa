import { redirect } from "next/navigation"

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/about?tab=partners&partner=${encodeURIComponent(id)}`)
}
