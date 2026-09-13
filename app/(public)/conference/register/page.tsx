import { ConferenceRegistrationForm } from "@/components/conference/conference-registration-form"
import { getActiveFormSchema } from "@/lib/actions/conference-form-schema"

export const metadata = {
  title: "Register | DEESSA National Conference 2026",
  description:
    "Register for the DEESSA National Conference 2026, Oct 15–17 in Kathmandu, Nepal.",
}

export default async function ConferenceRegisterPage() {
  // Fetch the active form schema, falls back gracefully if no schema exists yet
  const schema = await getActiveFormSchema()

  return <ConferenceRegistrationForm schema={schema} />
}
