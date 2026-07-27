import { getConferenceSettings } from "@/lib/actions/conference-settings"
import { ConferenceSettingsForm } from "@/components/admin/conference-settings-form"

export const metadata = {
  title: "Conference Settings | Admin",
}

export default async function ConferenceSettingsPage() {
  const settings = await getConferenceSettings()

  return <ConferenceSettingsForm settings={settings} />
}
