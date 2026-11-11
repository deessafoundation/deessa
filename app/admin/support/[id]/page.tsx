import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "Support Ticket Detail | Admin",
}

export default async function SupportReportDetail({ params }: Props) {
  const { id } = await params
  redirect(`/admin/support?id=${encodeURIComponent(id)}`)
}
