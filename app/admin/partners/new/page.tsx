import { redirect } from "next/navigation"

export default function NewPartnerPage() {
  redirect("/admin/about?tab=partners&partner=new")
}
