// ── Accessibility Preferences ───────────────────────────────────────────────
// One versioned localStorage key holds every non-sensitive accessibility
// preference. Never store page text, browsing history, form data or audio.

import {
  TTS_LIMITS,
  isSupportedSpeechLocale,
  type SupportedSpeechLocale,
} from "./types"

export const PREFERENCES_STORAGE_KEY = "deessa.accessibility.preferences"
export const PREFERENCES_VERSION = 1

export interface AccessibilityPreferences {
  version: number
  locale: SupportedSpeechLocale
  voiceId: string | null
  rate: number
  pitch: number
  highlight: boolean
  autoRead: boolean
  textSize: number
  highContrast: boolean
  reduceMotion: boolean
  calmingMode: boolean
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  version: PREFERENCES_VERSION,
  locale: "en-US",
  voiceId: null,
  rate: TTS_LIMITS.defaultRate,
  pitch: TTS_LIMITS.defaultPitch,
  highlight: true,
  // Auto-read must stay off until a visitor explicitly opts in.
  autoRead: false,
  textSize: 100,
  highContrast: false,
  reduceMotion: false,
  calmingMode: false,
}

export const TEXT_SIZE_RANGE = { min: 80, max: 140, step: 10 } as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

/**
 * Validate and coerce an unknown blob into safe preferences.
 * Unknown or out-of-range values silently fall back to defaults.
 */
export function validatePreferences(input: unknown): AccessibilityPreferences {
  if (!input || typeof input !== "object") return { ...DEFAULT_PREFERENCES }
  const raw = input as Record<string, unknown>

  const locale = isSupportedSpeechLocale(raw.locale)
    ? raw.locale
    : DEFAULT_PREFERENCES.locale

  return {
    version: PREFERENCES_VERSION,
    locale,
    voiceId:
      typeof raw.voiceId === "string" && raw.voiceId.length > 0
        ? raw.voiceId
        : null,
    rate: clamp(
      roundTo(asNumber(raw.rate, DEFAULT_PREFERENCES.rate), 2),
      TTS_LIMITS.minRate,
      TTS_LIMITS.maxRate
    ),
    pitch: clamp(
      roundTo(asNumber(raw.pitch, DEFAULT_PREFERENCES.pitch), 2),
      TTS_LIMITS.minPitch,
      TTS_LIMITS.maxPitch
    ),
    highlight: asBoolean(raw.highlight, DEFAULT_PREFERENCES.highlight),
    autoRead: asBoolean(raw.autoRead, DEFAULT_PREFERENCES.autoRead),
    textSize: clamp(
      Math.round(asNumber(raw.textSize, DEFAULT_PREFERENCES.textSize) / 10) * 10,
      TEXT_SIZE_RANGE.min,
      TEXT_SIZE_RANGE.max
    ),
    highContrast: asBoolean(
      raw.highContrast,
      DEFAULT_PREFERENCES.highContrast
    ),
    reduceMotion: asBoolean(
      raw.reduceMotion,
      DEFAULT_PREFERENCES.reduceMotion
    ),
    calmingMode: asBoolean(raw.calmingMode, DEFAULT_PREFERENCES.calmingMode),
  }
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Read stored preferences. Safe to call only after hydration. */
export function loadPreferences(): AccessibilityPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES }
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!stored) return { ...DEFAULT_PREFERENCES }
    return validatePreferences(JSON.parse(stored))
  } catch {
    // Corrupt JSON or blocked storage: fall back rather than break the page.
    return { ...DEFAULT_PREFERENCES }
  }
}

export function savePreferences(prefs: AccessibilityPreferences): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(validatePreferences(prefs))
    )
  } catch {
    // Private browsing / quota exceeded. Preferences stay session-only.
  }
}

export function clearPreferences(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY)
  } catch {
    /* no-op */
  }
}
