import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { ABOUT_PAGE_SETTINGS_KEY, DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import { normalizeAboutPageSettings, resolvePublicAboutSettings } from "./about-settings-normalization"

const readAboutDocument = cache(async () => {
  const supabase = await createClient()
  return supabase.from("site_settings").select("value").eq("key", ABOUT_PAGE_SETTINGS_KEY).maybeSingle()
})

export const getAboutPageSettings = cache(async () => {
  const { data, error } = await readAboutDocument()
  if (error) throw new Error("Could not load About content. Please try again before editing.")
  // Only an absent row gets defaults; invalid or inaccessible records must never become editable defaults.
  try {
    return normalizeAboutPageSettings(data ? data.value : DEFAULT_ABOUT_PAGE_SETTINGS)
  } catch {
    throw new Error("Saved About content is invalid. Restore or repair the record before editing.")
  }
})

export const getPublicAboutPageSettings = cache(async () => {
  try {
    const { data, error } = await readAboutDocument()
    if (error) throw error
    return resolvePublicAboutSettings(data ? data.value : DEFAULT_ABOUT_PAGE_SETTINGS)
  } catch (error) {
    console.error("Public About content recovery", error)
    return structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
  }
})
