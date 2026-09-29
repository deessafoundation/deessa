/**
 * Accessibility System Type Definitions - Version 3
 *
 * TypeScript interfaces and types for the unified accessibility system.
 * All accessibility preferences are stored in a single object for easy
 * persistence and state management.
 *
 * Version History:
 * - V1: Initial implementation (string version "1.0", boolean dyslexiaFont, fixed spacing)
 * - V2: WCAG-aligned ranges, enum fontFamily, null spacing support
 */

// ── TTS type re-exports ───────────────────────────────────────────────────────
import {
  type SupportedSpeechLocale,
  type TtsStatus,
  type TtsVoice,
  type TtsErrorCode,
  TTS_LIMITS,
  isSupportedSpeechLocale,
} from "@/lib/tts/types"
import type { PanelStrings } from "@/lib/tts/i18n"
export type { SupportedSpeechLocale, TtsStatus, TtsVoice, TtsErrorCode } from "@/lib/tts/types"
export type { PanelStrings } from "@/lib/tts/i18n"

/**
 * Font family options for accessibility
 */
export type ContrastMode = "normal" | "high" | "negative"
export type DictionaryMode = "off" | "selection" | "hover"
export const DICTIONARY_MODES: DictionaryMode[] = ["off", "selection", "hover"]
export const DICTIONARY_LABELS: Record<DictionaryMode, string> = {
  off: "Off",
  selection: "Select words",
  hover: "Hover + select",
}
export const CONTRAST_MODES: ContrastMode[] = ["normal", "high", "negative"]
export const CONTRAST_LABELS: Record<ContrastMode, string> = {
  normal: "Normal",
  high: "High contrast",
  negative: "Negative colors",
}
export function nextContrastMode(mode: ContrastMode): ContrastMode {
  return CONTRAST_MODES[(CONTRAST_MODES.indexOf(mode) + 1) % CONTRAST_MODES.length]
}
export const GUIDE_STICKERS = [
  { id: "butterfly", label: "Butterfly", emoji: "🦋", image: null as string | null },
  { id: "star", label: "Star", emoji: "⭐", image: null as string | null },
  { id: "flower", label: "Flower", emoji: "🌸", image: null as string | null },
  { id: "bear", label: "Bear", emoji: "🐻", image: null as string | null },
  { id: "rocket", label: "Rocket", emoji: "🚀", image: null as string | null },
] as const
export type GuideSticker = (typeof GUIDE_STICKERS)[number]["id"]
export type CursorMode = "off" | "mask" | "guide"
export const CURSOR_MODES: CursorMode[] = ["off", "mask", "guide"]
export const CURSOR_LABELS: Record<CursorMode, string> = { off: "Off", mask: "Reading mask", guide: "Reading guide" }
export function nextCursorMode(mode: CursorMode): CursorMode {
  return CURSOR_MODES[(CURSOR_MODES.indexOf(mode) + 1) % CURSOR_MODES.length]
}

export type WidgetPosition = "bottom-right" | "bottom-left" | "middle-right" | "middle-left"
export const WIDGET_POSITIONS: WidgetPosition[] = ["bottom-right", "bottom-left", "middle-right", "middle-left"]
export const WIDGET_POSITION_LABELS: Record<WidgetPosition, string> = {
  "bottom-right": "B. Right",
  "bottom-left": "B. Left",
  "middle-right": "M. Right",
  "middle-left": "M. Left",
}

export type AccessibilityFontFamily = "default" | "system" | "opendyslexic"
export const FONT_MODES: AccessibilityFontFamily[] = ["default", "system", "opendyslexic"]
export const FONT_LABELS: Record<AccessibilityFontFamily, string> = {
  default: "Site font",
  system: "System font",
  opendyslexic: "OpenDyslexic",
}
export function nextFontFamily(font: AccessibilityFontFamily): AccessibilityFontFamily {
  return FONT_MODES[(FONT_MODES.indexOf(font) + 1) % FONT_MODES.length]
}

/**
 * Core accessibility preferences (Version 3)
 * All values have sensible defaults that work for most users
 */
export interface AccessibilityPreferences {
  // ============================================================================
  // TEXT CONTROLS
  // ============================================================================

  /**
   * Font size scaling factor
   * Range: 1.0 (100%) to 2.0 (200%) - WCAG 2.2 AA compliant
   * Default: 1.0 (100%)
   *
   * Note: V1 used 0.8-1.4 range, migrated values are clamped to 1.0 minimum
   */
  textScale: number

  /**
   * Font family selection
   * - 'default': Site's designed typography
   * - 'system': System font stack (faster, familiar)
   * - 'opendyslexic': OpenDyslexic font (designed for dyslexia)
   *
   * Default: 'default'
   *
   * Note: V1 used boolean dyslexiaFont, migrated as:
   *   false → 'default'
   *   true → 'opendyslexic'
   */
  fontFamily: AccessibilityFontFamily

  // ============================================================================
  // VISUAL MODES
  // ============================================================================

  /**
   * Explicit contrast palette; independent of cursor/reading aids
   * Defaults: normal contrast, cursor aids off
   */
  contrastMode: ContrastMode
  cursorMode: CursorMode
  bigCursor: boolean
  guideSticker: GuideSticker

  /**
   * Reduce motion (disable animations/transitions)
   * Default: false (or true if user's OS prefers reduced motion)
   */
  reduceMotion: boolean

  /**
   * Sensory-friendly mode (comprehensive: animations, density, colors)
   * When enabled, automatically enables reduceMotion
   * Default: false
   */
  sensoryFriendly: boolean

  /**
   * Highlight all links (underline/emphasize)
   * Default: false
   */
  linkHighlight: boolean

  // ============================================================================
  // TYPOGRAPHY CONTROLS
  // ============================================================================

  /**
   * Line spacing (line-height)
   * Range: 1.5 to 2.5
   * Special: null means "use site default" (no override)
   * Default: null (site default)
   *
   * Note: V1 always had a value (default 1.5), V2 allows null for site default
   */
  lineSpacing: number | null

  /**
   * Letter spacing
   * Range: 0 to 0.12em
   * Special: null means "use site default" (no override)
   * Default: null (site default)
   *
   * Note: V1 always had a value (default 0), V2 allows null for site default
   */
  letterSpacing: number | null

  // ============================================================================
  // CONTENT MODES
  // ============================================================================

  /**
   * Reading mode (distraction-free layout for content pages)
   * Default: false
   */
  readingMode: boolean
  dictionaryMode: DictionaryMode

  /**
   * Fixed preset position of the floating accessibility launcher button
   * Default: 'bottom-right'
   */
  widgetPosition: WidgetPosition

  // ============================================================================
  // TTS (TEXT-TO-SPEECH)
  // ============================================================================

  /** Language to speak in. Default: 'en-US' */
  ttsLocale: SupportedSpeechLocale
  /** User-chosen voice ID, null means browser/cloud default */
  ttsVoiceId: string | null
  /** Playback speed 0.75–1.5. Default: 1 */
  ttsRate: number
  /** Pitch 0.8–1.2. Default: 1 */
  ttsPitch: number
  /** Highlight spoken text on screen. Default: true */
  ttsHighlight: boolean
  /** Automatically read on route change when already reading. Default: false */
  ttsAutoRead: boolean
}

/**
 * Default preferences (V3 - sensible defaults for all users)
 */
export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  textScale: 1.0,
  fontFamily: "default",
  contrastMode: "normal",
  cursorMode: "off",
  bigCursor: false,
  guideSticker: "butterfly",
  reduceMotion: false,
  sensoryFriendly: false,
  linkHighlight: false,
  lineSpacing: null, // null = use site default
  letterSpacing: null, // null = use site default
  readingMode: false,
  dictionaryMode: "off",
  widgetPosition: "bottom-right",
  // TTS
  ttsLocale: "en-US" as SupportedSpeechLocale,
  ttsVoiceId: null,
  ttsRate: TTS_LIMITS.defaultRate,
  ttsPitch: TTS_LIMITS.defaultPitch,
  ttsHighlight: true,
  ttsAutoRead: false,
}

/**
 * localStorage schema for persisted preferences (Version 2)
 * Includes versioning for future migrations
 */
export interface StoredAccessibilityData {
  /**
   * Schema version for migrations
   * Current: 2 (integer)
   * Previous: "1" or "1.0" (string) - auto-migrated
   */
  version: number

  /**
   * User preferences (V3 schema)
   */
  preferences: AccessibilityPreferences

  /**
   * Last update timestamp (ISO 8601)
   */
  lastUpdated: string

  /**
   * Optional: User ID (for syncing across devices in future)
   */
  userId?: string
}

/**
 * Legacy V1 schema for migration
 * @deprecated Use StoredAccessibilityData (V3) instead
 */
export interface StoredAccessibilityDataV1 {
  version: "1" | "1.0" | 1
  preferences: {
    textScale: number // 0.8-1.4
    dyslexiaFont: boolean
    highContrast: boolean
    reduceMotion: boolean
    sensoryFriendly: boolean
    linkHighlight: boolean
    lineSpacing: number // always valued
    letterSpacing: number // always valued
    readingMode: boolean
  }
  lastUpdated: string
  userId?: string
}

/**
 * Context value provided by AccessibilityProvider
 */
export interface AccessibilityContextValue {
  /**
   * Current accessibility preferences
   */
  preferences: AccessibilityPreferences

  /**
   * Update a single preference
   */
  updatePreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void

  /**
   * Update multiple preferences at once
   */
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void

  /**
   * Reset all preferences to defaults
   */
  resetAll: () => void

  /**
   * Reset a single preference to default
   */
  resetPreference: (key: keyof AccessibilityPreferences) => void

  /**
   * Check if preferences have been modified from defaults
   */
  isModified: boolean

  /**
   * Loading state (true during initial load from localStorage)
   */
  isLoading: boolean

  // TTS state
  ttsStatus: TtsStatus
  /** Alias for ttsStatus to maintain backward compatibility with media/carousel integrations */
  status: TtsStatus
  ttsIsSupported: boolean
  ttsSectionCount: number
  ttsCurrentSectionIndex: number
  ttsVoices: TtsVoice[]
  ttsHasVoiceForLocale: boolean | null
  ttsSubstituteVoice: { name: string; lang: string } | null
  ttsTranslationOutcome: "none" | "partial" | "failed"
  ttsErrorCode: TtsErrorCode | null
  ttsStrings: PanelStrings
  // TTS commands
  ttsReadPage: () => void
  ttsReadSection: (index: number) => void
  ttsPause: () => void
  ttsResume: () => void
  ttsStop: () => void
  ttsNext: () => void
  ttsPrevious: () => void
  ttsRestart: () => void
  setTtsLocale: (locale: SupportedSpeechLocale) => void
  setTtsVoice: (voiceId: string | null) => void
  setTtsRate: (rate: number) => void
  setTtsPitch: (pitch: number) => void
  setTtsHighlight: (enabled: boolean) => void
  setTtsAutoRead: (enabled: boolean) => void
}

/**
 * localStorage configuration
 */
export const STORAGE_CONFIG = {
  /**
   * localStorage key for accessibility preferences
   */
  KEY: "deesha-a11y-preferences",

  /**
   * Current schema version (V3 - integer)
   */
  VERSION: 4,

  /**
   * Maximum storage size (approximate, in characters)
   * localStorage typically has 5-10MB limit
   */
  MAX_SIZE: 5000,
} as const

/**
 * Preset configurations for common use cases
 * Users can quickly apply these instead of configuring manually
 */
export const ACCESSIBILITY_PRESETS = {
  /**
   * Default - standard settings
   */
  default: DEFAULT_ACCESSIBILITY_PREFERENCES,

  /**
   * Low vision - larger text, high contrast
   */
  lowVision: {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    textScale: 1.5,
    contrastMode: "high",
    lineSpacing: 1.8,
    letterSpacing: 0.05,
  },

  /**
   * Dyslexia - specialized font, increased spacing
   */
  dyslexia: {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    fontFamily: "opendyslexic" as AccessibilityFontFamily,
    lineSpacing: 1.7,
    letterSpacing: 0.08,
    textScale: 1.2,
  },

  /**
   * Autism/Sensory - reduced stimulation, calm colors
   */
  sensory: {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    sensoryFriendly: true,
    reduceMotion: true,
    lineSpacing: 1.7,
  },

  /**
   * Motor disability - larger targets, reduced motion
   */
  motor: {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    textScale: 1.3,
    reduceMotion: true,
    linkHighlight: true,
  },
} as const

/**
 * Type guard to check if stored data is valid V3
 */
export function isValidStoredData(data: unknown): data is StoredAccessibilityData {
  if (typeof data !== "object" || data === null) return false

  const d = data as Record<string, unknown>

  return (
    typeof d.version === "number" &&
    d.version === 4 &&
    typeof d.preferences === "object" &&
    d.preferences !== null &&
    !Array.isArray(d.preferences) &&
    typeof d.lastUpdated === "string"
  )
}

/**
 * Type guard to check if stored data is legacy V1
 */
export function isValidStoredDataV1(data: unknown): data is StoredAccessibilityDataV1 {
  if (typeof data !== "object" || data === null) return false

  const d = data as Record<string, unknown>

  return (
    (d.version === "1" || d.version === "1.0" || d.version === 1) &&
    typeof d.preferences === "object" &&
    d.preferences !== null &&
    typeof d.lastUpdated === "string"
  )
}

/**
 * Type guard to check if preferences object is valid V3
 */
export function isValidPreferences(prefs: unknown): prefs is AccessibilityPreferences {
  if (typeof prefs !== "object" || prefs === null) return false

  const p = prefs as Record<string, unknown>

  const validFontFamily = p.fontFamily === "default" || p.fontFamily === "system" || p.fontFamily === "opendyslexic"

  return (
    typeof p.textScale === "number" &&
    validFontFamily &&
    ["normal", "high", "negative"].includes(p.contrastMode as string) &&
    typeof p.bigCursor === "boolean" &&
    CURSOR_MODES.includes(p.cursorMode as CursorMode) &&
    GUIDE_STICKERS.some((sticker) => sticker.id === p.guideSticker) &&
    typeof p.reduceMotion === "boolean" &&
    typeof p.sensoryFriendly === "boolean" &&
    typeof p.linkHighlight === "boolean" &&
    (typeof p.lineSpacing === "number" || p.lineSpacing === null) &&
    (typeof p.letterSpacing === "number" || p.letterSpacing === null) &&
    typeof p.readingMode === "boolean" &&
    DICTIONARY_MODES.includes(p.dictionaryMode as DictionaryMode) &&
    WIDGET_POSITIONS.includes(p.widgetPosition as WidgetPosition)
  )
}

/**
 * Validates and clamps numeric values to safe ranges (V3)
 */
export function validatePreferences(prefs: Partial<AccessibilityPreferences>): AccessibilityPreferences {
  // Validate fontFamily
  let fontFamily: AccessibilityFontFamily = "default"
  if (prefs.fontFamily === "default" || prefs.fontFamily === "system" || prefs.fontFamily === "opendyslexic") {
    fontFamily = prefs.fontFamily
  }

  return {
    textScale: clamp(prefs.textScale ?? 1.0, 1.0, 2.0), // V2: 1.0-2.0 range
    fontFamily,
    contrastMode:
      (prefs.contrastMode as string) === "inverted"
        ? "high"
        : prefs.contrastMode === "high" || prefs.contrastMode === "negative"
          ? prefs.contrastMode
          : "normal",
    bigCursor: Boolean(prefs.bigCursor),
    cursorMode: CURSOR_MODES.includes(prefs.cursorMode as CursorMode) ? prefs.cursorMode! : "off",
    guideSticker: GUIDE_STICKERS.some((sticker) => sticker.id === prefs.guideSticker)
      ? prefs.guideSticker!
      : "butterfly",
    reduceMotion: Boolean(prefs.reduceMotion),
    sensoryFriendly: Boolean(prefs.sensoryFriendly),
    linkHighlight: Boolean(prefs.linkHighlight),
    lineSpacing: prefs.lineSpacing == null ? null : clamp(prefs.lineSpacing ?? 1.5, 1.5, 2.5),
    letterSpacing: prefs.letterSpacing == null ? null : clamp(prefs.letterSpacing ?? 0, 0, 0.12),
    readingMode: Boolean(prefs.readingMode),
    dictionaryMode: DICTIONARY_MODES.includes(prefs.dictionaryMode as DictionaryMode) ? prefs.dictionaryMode! : "off",
    widgetPosition: WIDGET_POSITIONS.includes(prefs.widgetPosition as WidgetPosition)
      ? prefs.widgetPosition!
      : "bottom-right",
    // TTS
    ttsLocale: isSupportedSpeechLocale(prefs.ttsLocale) ? prefs.ttsLocale : "en-US",
    ttsVoiceId: typeof prefs.ttsVoiceId === "string" && prefs.ttsVoiceId.length > 0 ? prefs.ttsVoiceId : null,
    ttsRate: clamp(
      typeof prefs.ttsRate === "number" && Number.isFinite(prefs.ttsRate) ? prefs.ttsRate : TTS_LIMITS.defaultRate,
      TTS_LIMITS.minRate,
      TTS_LIMITS.maxRate,
    ),
    ttsPitch: clamp(
      typeof prefs.ttsPitch === "number" && Number.isFinite(prefs.ttsPitch) ? prefs.ttsPitch : TTS_LIMITS.defaultPitch,
      TTS_LIMITS.minPitch,
      TTS_LIMITS.maxPitch,
    ),
    ttsHighlight: typeof prefs.ttsHighlight === "boolean" ? prefs.ttsHighlight : true,
    ttsAutoRead: typeof prefs.ttsAutoRead === "boolean" ? prefs.ttsAutoRead : false,
  }
}

/**
 * Migrate V1 preferences to V3
 */
export function migrateV1toV3(v1Prefs: StoredAccessibilityDataV1["preferences"]): AccessibilityPreferences {
  // Text scale: Clamp 0.8-1.4 to new 1.0-2.0 range
  const textScale = Math.max(1.0, Math.min(2.0, v1Prefs.textScale))

  // Font family: Map boolean to enum
  const fontFamily: AccessibilityFontFamily = v1Prefs.dyslexiaFont ? "opendyslexic" : "default"

  // Spacing: Keep existing values (they're in valid range)
  // User explicitly set these, so preserve them
  const lineSpacing = v1Prefs.lineSpacing
  const letterSpacing = v1Prefs.letterSpacing

  const migrated: AccessibilityPreferences = {
    textScale,
    fontFamily,
    contrastMode: v1Prefs.highContrast === true ? "high" : "normal",
    cursorMode: "off",
    bigCursor: false,
    guideSticker: "butterfly",
    reduceMotion: v1Prefs.reduceMotion,
    sensoryFriendly: v1Prefs.sensoryFriendly,
    linkHighlight: v1Prefs.linkHighlight,
    lineSpacing,
    letterSpacing,
    readingMode: v1Prefs.readingMode,
    dictionaryMode: "off",
    widgetPosition: "bottom-right",
  }

  return validatePreferences(migrated)
}

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min
}

/**
 * Check if two preference objects are equal (V3)
 */
export function preferencesEqual(a: AccessibilityPreferences, b: AccessibilityPreferences): boolean {
  return (
    a.textScale === b.textScale &&
    a.fontFamily === b.fontFamily &&
    a.contrastMode === b.contrastMode &&
    a.bigCursor === b.bigCursor &&
    a.cursorMode === b.cursorMode &&
    a.guideSticker === b.guideSticker &&
    a.reduceMotion === b.reduceMotion &&
    a.sensoryFriendly === b.sensoryFriendly &&
    a.linkHighlight === b.linkHighlight &&
    a.lineSpacing === b.lineSpacing &&
    a.letterSpacing === b.letterSpacing &&
    a.readingMode === b.readingMode &&
    a.dictionaryMode === b.dictionaryMode &&
    a.widgetPosition === b.widgetPosition &&
    a.ttsLocale === b.ttsLocale &&
    a.ttsVoiceId === b.ttsVoiceId &&
    a.ttsRate === b.ttsRate &&
    a.ttsPitch === b.ttsPitch &&
    a.ttsHighlight === b.ttsHighlight &&
    a.ttsAutoRead === b.ttsAutoRead
  )
}

/** Read all supported schemas without persisting legacy fields. */
export function decodeAccessibilityData(data: unknown): AccessibilityPreferences | null {
  if (isValidStoredData(data)) return validatePreferences(data.preferences)
  if (isValidStoredDataV1(data)) return migrateV1toV3(data.preferences)
  if (!data || typeof data !== "object") return null
  const legacy = data as { version?: unknown; preferences?: Record<string, unknown> }
  if (
    legacy.version === 3 &&
    legacy.preferences &&
    typeof legacy.preferences === "object" &&
    !Array.isArray(legacy.preferences)
  )
    return validatePreferences({ ...legacy.preferences, dictionaryMode: "off" })
  if (legacy.version !== 2 || !legacy.preferences || typeof legacy.preferences !== "object") return null
  return validatePreferences({
    ...legacy.preferences,
    contrastMode: legacy.preferences.highContrast === true ? "high" : "normal",
    cursorMode: "off",
  })
}
