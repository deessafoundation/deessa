// ── Section Translation (English → Nepali) ──────────────────────────────────
// The site is authored in English. When a visitor picks नेपाली, the extracted
// sections are translated here before playback so a Nepali voice speaks Nepali
// words rather than mispronouncing English ones.
//
// This runs AFTER extraction, so it inherits every extraction guarantee for
// free: reading order, skipped video/audio/iframe media, hidden and duplicate
// content removal, and the sensitive-field exclusions. Nothing here re-walks
// the DOM.
//
// Cache policy: in memory, for this page session only. The implementation plan
// forbids persisting page text to local storage, so this is deliberately not
// written to disk. The server route keeps the shared, longer-lived cache.

import { containsDevanagari } from "./language-detector"
import { normalizeForSpeech } from "./text-normalizer"
import type { SpeechSection } from "./types"

const ENDPOINT = "/api/tts/translate"
const TARGET = "ne"

/** Keep requests comfortably inside the route's own limits. */
const BATCH_MAX_TEXTS = 300
const BATCH_MAX_CHARS = 120_000

const LATIN_LETTER = /[A-Za-z]/

/** Session-scoped cache. Key is the source string; value is the Nepali text. */
const sessionCache = new Map<string, string>()

export interface TranslationOutcome {
  /** Sections to speak. Same order and same DOM elements as the input. */
  sections: SpeechSection[]
  /** How many sections were translated successfully. */
  translated: number
  /** How many needed translation but could not be translated. */
  failed: number
}

/**
 * A section needs translation when it inherited the Nepali preference but its
 * text is still Latin script.
 *
 * Sections the author explicitly marked as English (`data-tts-language="en-US"`
 * or `lang="en"`) arrive tagged `en-US` and are intentionally left alone — the
 * spec treats a declared locale as deliberate, and they keep their English
 * voice.
 */
function needsTranslation(section: SpeechSection): boolean {
  if (section.locale !== "ne-NP") return false
  if (containsDevanagari(section.text)) return false
  return LATIN_LETTER.test(section.text)
}

/** Split into request-sized batches, bounded by both count and characters. */
function batch(texts: string[]): string[][] {
  const batches: string[][] = []
  let current: string[] = []
  let chars = 0

  for (const text of texts) {
    const wouldExceed =
      current.length >= BATCH_MAX_TEXTS || chars + text.length > BATCH_MAX_CHARS
    if (current.length > 0 && wouldExceed) {
      batches.push(current)
      current = []
      chars = 0
    }
    current.push(text)
    chars += text.length
  }
  if (current.length > 0) batches.push(current)
  return batches
}

async function requestBatch(texts: string[]): Promise<Array<string | null>> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target: TARGET }),
  })
  if (!response.ok) throw new Error(`translate failed: ${response.status}`)

  const payload: unknown = await response.json()
  const translations = (payload as { translations?: unknown })?.translations
  if (!Array.isArray(translations)) throw new Error("malformed response")

  return texts.map((_, index) => {
    const value = translations[index]
    return typeof value === "string" && value.trim() ? value : null
  })
}

/**
 * Translate every section that needs it, then return a new section list.
 *
 * Failure is never fatal: a section that could not be translated is returned
 * with its English text and its locale switched to `en-US`, so the playback
 * loop reads it with an English voice instead of mispronouncing English with a
 * Nepali one. The visitor still hears the page.
 */
export async function translateSectionsToNepali(
  sections: SpeechSection[]
): Promise<TranslationOutcome> {
  const candidateIndexes = sections.reduce<number[]>((acc, section, index) => {
    if (needsTranslation(section)) acc.push(index)
    return acc
  }, [])

  if (candidateIndexes.length === 0) {
    return { sections, translated: 0, failed: 0 }
  }

  // Unique, uncached sources only — a page repeats plenty of short strings.
  const missing = Array.from(
    new Set(
      candidateIndexes
        .map((index) => sections[index]!.text)
        .filter((text) => !sessionCache.has(text))
    )
  )

  for (const group of batch(missing)) {
    try {
      const results = await requestBatch(group)
      group.forEach((source, index) => {
        const translated = results[index]
        if (translated) sessionCache.set(source, translated)
      })
    } catch {
      // Network down, route error, or malformed payload. Leave these uncached;
      // the per-section fallback below handles them.
    }
  }

  let translated = 0
  let failed = 0
  const candidates = new Set(candidateIndexes)

  const next = sections.map((section, index) => {
    if (!candidates.has(index)) return section

    const nepali = sessionCache.get(section.text)
    if (!nepali) {
      failed += 1
      // Read the original English, with an English voice.
      return { ...section, locale: "en-US" as const }
    }

    translated += 1
    return {
      ...section,
      text: normalizeForSpeech(nepali, "ne-NP"),
      locale: "ne-NP" as const,
    }
  })

  return { sections: next, translated, failed }
}

/** Test/debug helper. Not used in the UI. */
export function clearTranslationCache(): void {
  sessionCache.clear()
}
