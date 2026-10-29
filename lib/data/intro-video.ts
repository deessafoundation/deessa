import { createClient } from "@/lib/supabase/server"
import {
  DEFAULT_INTRO_VIDEO_CONFIG,
  INTRO_VIDEO_SETTINGS_KEY,
  type IntroVideoConfig,
} from "@/lib/types/intro-video"

/**
 * Server-side helper to fetch intro video configuration from `site_settings`.
 * Falls back safely to DEFAULT_INTRO_VIDEO_CONFIG if unconfigured or on error.
 */
export async function getIntroVideoConfig(): Promise<IntroVideoConfig> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", INTRO_VIDEO_SETTINGS_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_INTRO_VIDEO_CONFIG
    }

    const val = data.value as Partial<IntroVideoConfig>

    return {
      enabled: val.enabled ?? DEFAULT_INTRO_VIDEO_CONFIG.enabled,
      media: {
        desktopVideoUrl: val.media?.desktopVideoUrl ?? DEFAULT_INTRO_VIDEO_CONFIG.media.desktopVideoUrl,
        desktopPosterUrl: val.media?.desktopPosterUrl ?? DEFAULT_INTRO_VIDEO_CONFIG.media.desktopPosterUrl,
        mobileVideoUrl: val.media?.mobileVideoUrl ?? DEFAULT_INTRO_VIDEO_CONFIG.media.mobileVideoUrl,
        mobilePosterUrl: val.media?.mobilePosterUrl ?? DEFAULT_INTRO_VIDEO_CONFIG.media.mobilePosterUrl,
        useDesktopFallbackOnMobile:
          val.media?.useDesktopFallbackOnMobile ?? DEFAULT_INTRO_VIDEO_CONFIG.media.useDesktopFallbackOnMobile,
      },
      behavior: {
        frequency: val.behavior?.frequency ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.frequency,
        cooldownMinutes: val.behavior?.cooldownMinutes ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.cooldownMinutes,
        homepageOnly: val.behavior?.homepageOnly ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.homepageOnly,
        allowSkip: val.behavior?.allowSkip ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.allowSkip,
        skipDelaySeconds: val.behavior?.skipDelaySeconds ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.skipDelaySeconds,
        mutedByDefault: val.behavior?.mutedByDefault ?? DEFAULT_INTRO_VIDEO_CONFIG.behavior.mutedByDefault,
      },
      transition: {
        enableLogoFlyTransition:
          val.transition?.enableLogoFlyTransition ?? DEFAULT_INTRO_VIDEO_CONFIG.transition.enableLogoFlyTransition,
        logoUrl: val.transition?.logoUrl ?? DEFAULT_INTRO_VIDEO_CONFIG.transition.logoUrl,
        fadeDurationMs: val.transition?.fadeDurationMs ?? DEFAULT_INTRO_VIDEO_CONFIG.transition.fadeDurationMs,
      },
    }
  } catch {
    return DEFAULT_INTRO_VIDEO_CONFIG
  }
}
