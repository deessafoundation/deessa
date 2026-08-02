import { redirect } from "next/navigation"

export default function OrganizationSettingsPage() {
  redirect("/admin/settings?tab=organization")
}
