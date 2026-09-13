/**
 * About Page ("Who We Are") CMS Data Access
 *
 * @module lib/data/about-settings
 */

import { createClient } from "@/lib/supabase/server"
import {
  ABOUT_PAGE_SETTINGS_KEY,
  DEFAULT_ABOUT_PAGE_SETTINGS,
  type AboutPageSettings,
} from "@/lib/types/about-settings"

const LEGACY_INTRO_HEADLINES = new Set([
  "Every child deserves to be understood, accepted, and valued, just as they are.",
  "Every child deserves to be understood, accepted, and valued — just as they are.",
])
const UPDATED_INTRO_HEADLINE = "Every child deserves to be understood, accepted, and valued just as they are."

async function getAboutSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single()

    if (error || !data?.value) {
      return defaultValue
    }

    return {
      ...defaultValue,
      ...data.value,
    } as T
  } catch (error) {
    console.error(`Exception fetching ${key}:`, error)
    return defaultValue
  }
}

/**
 * Get the full About page CMS content with fallback to defaults.
 */
export async function getAboutPageSettings(): Promise<AboutPageSettings> {
  const settings = await getAboutSetting<AboutPageSettings>(ABOUT_PAGE_SETTINGS_KEY, DEFAULT_ABOUT_PAGE_SETTINGS)
  const usesLegacyIntro = LEGACY_INTRO_HEADLINES.has(settings.intro.headline)

  return {
    ...settings,
    intro: {
      ...(usesLegacyIntro
        ? { ...DEFAULT_ABOUT_PAGE_SETTINGS.intro, headline: UPDATED_INTRO_HEADLINE }
        : settings.intro),
      sinceBadge: settings.intro.sinceBadge.replace(/\b2015\b/g, "2022"),
    },
  }
}
