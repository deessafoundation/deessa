import { createClient } from "@/lib/supabase/server"
import { DEFAULT_TYPOGRAPHY_CONFIG, SITE_TYPOGRAPHY_KEY, type TypographyConfig } from "./types"

/**
 * Reads site-wide typography settings from `site_settings`.
 * Falls back to DEFAULT_TYPOGRAPHY_CONFIG ("warm-inclusive") if unconfigured.
 */
export async function getTypographyConfig(): Promise<TypographyConfig> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SITE_TYPOGRAPHY_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_TYPOGRAPHY_CONFIG
    }

    const value = data.value as Record<string, unknown>
    return {
      theme: (value.theme as TypographyConfig["theme"]) || DEFAULT_TYPOGRAPHY_CONFIG.theme,
      headingFont: typeof value.headingFont === "string" ? value.headingFont : undefined,
      bodyFont: typeof value.bodyFont === "string" ? value.bodyFont : undefined,
    }
  } catch {
    return DEFAULT_TYPOGRAPHY_CONFIG
  }
}
