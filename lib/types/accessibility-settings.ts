/**
 * Accessibility feature flags and configuration types.
 *
 * Configurable via Admin → Site Settings → Accessibility.
 * Persisted in `site_settings` under key `accessibility_settings`.
 */

export interface AccessibilityFeaturesConfig {
  /** Text-to-speech audio reader ("Listen to this page") */
  textToSpeech: boolean
  /** Font family selector (e.g. OpenDyslexic, Comic Neue, Sans-serif) */
  fontStyle: boolean
  /** Text size adjustment slider */
  textScaling: boolean
  /** Line height and character spacing sliders */
  spacingControls: boolean
  /** High contrast and inverted/negative contrast modes */
  contrastMode: boolean
  /** Sensory-friendly mode (mutes saturation, removes high stimulation) */
  sensoryFriendly: boolean
  /** Reduce motion toggle (disables UI animations and transitions) */
  reduceMotion: boolean
  /** Reading assist (reading guide / read line and reading mask) */
  readingGuide: boolean
  /** Reading dictionary for word lookups and definitions */
  readingDictionary: boolean
  /** Large pointer / cursor toggle */
  bigCursor: boolean
  /** Screen position selector for the floating button */
  widgetPosition: boolean
}

export interface AccessibilityConfig {
  /** Master toggle: when false, the floating accessibility button and toolbar are completely hidden */
  enabled: boolean
  /** Granular feature availability flags */
  features: AccessibilityFeaturesConfig
}

export const ACCESSIBILITY_SETTINGS_KEY = "accessibility_settings"

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enabled: true,
  features: {
    textToSpeech: true,
    fontStyle: true,
    textScaling: true,
    spacingControls: true,
    contrastMode: true,
    sensoryFriendly: true,
    reduceMotion: true,
    readingGuide: true,
    readingDictionary: true,
    bigCursor: true,
    widgetPosition: true,
  },
}
