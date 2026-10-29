import { createClient } from "@/lib/supabase/server"
import {
  DEFAULT_ACCESSIBILITY_CONFIG,
  ACCESSIBILITY_SETTINGS_KEY,
  type AccessibilityConfig,
} from "@/lib/types/accessibility-settings"

/**
 * Server-side helper to fetch accessibility configuration from `site_settings`.
 * Falls back safely to DEFAULT_ACCESSIBILITY_CONFIG on error or if unconfigured.
 */
export async function getAccessibilityConfig(): Promise<AccessibilityConfig> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", ACCESSIBILITY_SETTINGS_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_ACCESSIBILITY_CONFIG
    }

    const val = data.value as Partial<AccessibilityConfig>
    const features = val.features || {}

    return {
      enabled: val.enabled ?? DEFAULT_ACCESSIBILITY_CONFIG.enabled,
      features: {
        textToSpeech: features.textToSpeech ?? DEFAULT_ACCESSIBILITY_CONFIG.features.textToSpeech,
        fontStyle: features.fontStyle ?? DEFAULT_ACCESSIBILITY_CONFIG.features.fontStyle,
        textScaling: features.textScaling ?? DEFAULT_ACCESSIBILITY_CONFIG.features.textScaling,
        spacingControls: features.spacingControls ?? DEFAULT_ACCESSIBILITY_CONFIG.features.spacingControls,
        contrastMode: features.contrastMode ?? DEFAULT_ACCESSIBILITY_CONFIG.features.contrastMode,
        sensoryFriendly: features.sensoryFriendly ?? DEFAULT_ACCESSIBILITY_CONFIG.features.sensoryFriendly,
        reduceMotion: features.reduceMotion ?? DEFAULT_ACCESSIBILITY_CONFIG.features.reduceMotion,
        readingGuide: features.readingGuide ?? DEFAULT_ACCESSIBILITY_CONFIG.features.readingGuide,
        readingDictionary: features.readingDictionary ?? DEFAULT_ACCESSIBILITY_CONFIG.features.readingDictionary,
        bigCursor: features.bigCursor ?? DEFAULT_ACCESSIBILITY_CONFIG.features.bigCursor,
        widgetPosition: features.widgetPosition ?? DEFAULT_ACCESSIBILITY_CONFIG.features.widgetPosition,
      },
    }
  } catch {
    return DEFAULT_ACCESSIBILITY_CONFIG
  }
}
