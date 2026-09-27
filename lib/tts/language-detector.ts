// ── Language Detection ──────────────────────────────────────────────────────
// Script-based locale detection. Deliberately simple: this feature only needs
// to tell Devanagari (Nepali) apart from Latin (English), and script detection
// is far more reliable than statistical guessing for that job.
//
// This is NOT translation. It only decides which voice pronounces which text.

import {
  baseLanguageOf,
  isSupportedSpeechLocale,
  type SupportedSpeechLocale,
} from "./types"

const DEVANAGARI = /[\u0900-\u097F]/u
const DEVANAGARI_GLOBAL = /[\u0900-\u097F]/gu
const LATIN_GLOBAL = /[A-Za-z]/g

export function containsDevanagari(text: string): boolean {
  return DEVANAGARI.test(text)
}

/**
 * Decide the spoken locale for a string.
 *
 * `preferred` is the visitor's selected locale and wins on ties, but a string
 * that is predominantly Devanagari is always spoken as Nepali — reading
 * Devanagari with an English voice produces gibberish.
 */
export function detectLocale(
  text: string,
  preferred: SupportedSpeechLocale
): SupportedSpeechLocale {
  if (!text) return preferred

  const devanagariCount = (text.match(DEVANAGARI_GLOBAL) ?? []).length
  if (devanagariCount === 0) {
    // Pure Latin text under a Nepali preference: still Nepali-tagged content
    // may be romanised, so respect the visitor's choice.
    return preferred
  }

  const latinCount = (text.match(LATIN_GLOBAL) ?? []).length
  if (devanagariCount >= latinCount) return "ne-NP"

  // Mostly Latin with a few Devanagari words mixed in.
  return preferred === "ne-NP" ? "ne-NP" : "en-US"
}

/**
 * Resolve an author-supplied `data-tts-language` / `lang` value to a supported
 * locale, or `null` when it is unusable.
 */
export function normalizeLocaleTag(
  value: string | null | undefined
): SupportedSpeechLocale | null {
  if (!value) return null
  const trimmed = value.trim()
  if (isSupportedSpeechLocale(trimmed)) return trimmed

  switch (baseLanguageOf(trimmed)) {
    case "ne":
      return "ne-NP"
    case "en":
      return "en-US"
    default:
      return null
  }
}
