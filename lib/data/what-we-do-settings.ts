import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_WHAT_WE_DO_SETTINGS, WHAT_WE_DO_SETTINGS_KEY, whatWeDoSettingsSchema } from "@/lib/types/what-we-do-settings"

export const getWhatWeDoSettings = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", WHAT_WE_DO_SETTINGS_KEY).maybeSingle()
  // Missing content uses the initial document. Database failures must not be
  // disguised as a successful load in the editor (which could overwrite content).
  if (error) throw new Error("Could not load What We Do content. Please try again.")
  if (!data) return DEFAULT_WHAT_WE_DO_SETTINGS
  return whatWeDoSettingsSchema.parse(data.value)
})
