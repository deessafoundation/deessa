import { redirect } from "next/navigation"
import { accessibilitySummit } from "@/lib/data/accessibility-summit"

export default function SummitRegistrationPage() {
  redirect(accessibilitySummit.facebookUrl)
}
