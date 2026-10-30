/**
 * Intro Video configuration types and defaults.
 *
 * Configurable via Admin → Site Settings → Intro Video.
 * Persisted in `site_settings` under key `intro_video`.
 */

export type IntroVideoFrequency = "every_visit" | "session" | "cooldown" | "once_ever"

export interface IntroVideoMedia {
  /** 16:9 widescreen video optimized for desktop and laptop displays */
  desktopVideoUrl: string
  /** Optional poster frame displayed while the desktop video buffers */
  desktopPosterUrl?: string
  /** 9:16 vertical video optimized for mobile portrait displays */
  mobileVideoUrl?: string
  /** Optional poster frame displayed while the mobile video buffers */
  mobilePosterUrl?: string
  /** If true and mobileVideoUrl is empty, use desktop video on mobile viewports */
  useDesktopFallbackOnMobile: boolean
}

export interface IntroVideoBehavior {
  /** Playback frequency rule */
  frequency: IntroVideoFrequency
  /** Cooldown time in minutes when frequency is 'cooldown' (default: 30) */
  cooldownMinutes: number
  /** If true, the intro only plays when visiting the root homepage ('/') */
  homepageOnly: boolean
  /** Whether the user can skip the intro video */
  allowSkip: boolean
  /** Delay in seconds before the skip button appears (0 = immediately visible) */
  skipDelaySeconds: number
  /** Whether the video starts muted (required by browser autoplay policies) */
  mutedByDefault: boolean
}

export interface IntroVideoTransition {
  /** Whether to play the signature flying logo outro animation to the navbar */
  enableLogoFlyTransition: boolean
  /** Custom logo URL to fly to navbar (defaults to /logo.png) */
  logoUrl?: string
  /** Total fade-out duration in milliseconds when dismissing (default: 1000) */
  fadeDurationMs: number
}

export interface IntroVideoConfig {
  /** Master toggle: when false, the intro video and pre-paint gate are completely bypassed */
  enabled: boolean
  /** Media source URLs for desktop and mobile viewports */
  media: IntroVideoMedia
  /** Playback frequency, timing, and route rules */
  behavior: IntroVideoBehavior
  /** Outro animation and transition settings */
  transition: IntroVideoTransition
}

export const INTRO_VIDEO_SETTINGS_KEY = "intro_video"

export const DEFAULT_INTRO_VIDEO_CONFIG: IntroVideoConfig = {
  enabled: true,
  media: {
    desktopVideoUrl: "/Deesa-Intro%20.mp4",
    desktopPosterUrl: "",
    mobileVideoUrl: "",
    mobilePosterUrl: "",
    useDesktopFallbackOnMobile: true,
  },
  behavior: {
    frequency: "cooldown",
    cooldownMinutes: 30,
    homepageOnly: false,
    allowSkip: true,
    skipDelaySeconds: 0,
    mutedByDefault: true,
  },
  transition: {
    enableLogoFlyTransition: true,
    logoUrl: "/logo.png",
    fadeDurationMs: 1000,
  },
}
