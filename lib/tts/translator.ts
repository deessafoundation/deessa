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

import { normalizeForSpeech } from "./text-normalizer"
import type { SpeechSection } from "./types"

const ENDPOINT = "/api/tts/translate"
const TARGET = "ne"

/** Keep requests comfortably inside the route's own limits. */
const BATCH_MAX_TEXTS = 300
const BATCH_MAX_CHARS = 120_000
const REQUEST_TIMEOUT_MS = 30_000

const LATIN_LETTERS = /[A-Za-z]/g
const DEVANAGARI_CHARACTERS = /[\u0900-\u097F]/g

/** Session-scoped cache. Key is the source string; value is the Nepali text. */
const sessionCache = new Map<string, string>()
// A translated section can legitimately retain Latin names, addresses, or
// placeholders. Do not send its output back through English → Nepali on the
// next/previous transport buttons.
let translatedSections = new WeakSet<SpeechSection>()

export interface TranslationOutcome {
  /** Sections to speak. Same order and same DOM elements as the input. */
  sections: SpeechSection[]
  /** How many sections were translated successfully. */
  translated: number
  /** How many needed translation but could not be translated. */
  failed: number
  /** Input indexes that must be skipped instead of speaking untranslated text. */
  failedIndexes: number[]
}

/**
 * In Nepali reading mode, a section needs translation when its text is
 * predominantly Latin script. Normalization can insert a few Nepali
 * words (for example, "deessa" becomes "दीसा") into an English paragraph;
 * one Devanagari word must not make us skip the whole paragraph.
 */
function needsTranslation(section: SpeechSection): boolean {
  if (translatedSections.has(section)) return false
  const latinCount = (section.text.match(LATIN_LETTERS) ?? []).length
  const devanagariCount = (section.text.match(DEVANAGARI_CHARACTERS) ?? []).length
  return latinCount > devanagariCount
}

/** Reject an untranslated English paragraph returned as a successful result. */
function isNepaliResult(source: string, translated: string): boolean {
  const sourceLatin = (source.match(LATIN_LETTERS) ?? []).length
  if (sourceLatin > 0 && translated.trim().toLowerCase() === source.trim().toLowerCase()) {
    return false
  }
  if (sourceLatin < 20) return true
  const translatedLatin = (translated.match(LATIN_LETTERS) ?? []).length
  const translatedNepali = (translated.match(DEVANAGARI_CHARACTERS) ?? []).length
  return translatedNepali > translatedLatin
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

async function requestBatch(texts: string[], signal?: AbortSignal): Promise<Array<string | null>> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target: TARGET }),
    signal: AbortSignal.any([AbortSignal.timeout(REQUEST_TIMEOUT_MS), ...(signal ? [signal] : [])]),
  })
  if (!response.ok) throw new Error(`translate failed: ${response.status}`)

  const payload: unknown = await response.json()
  const translations = (payload as { translations?: unknown })?.translations
  if (!Array.isArray(translations)) throw new Error("malformed response")

  return texts.map((_, index) => {
    const value = translations[index]
    return typeof value === "string" && value.trim() && isNepaliResult(texts[index]!, value)
      ? value
      : null
  })
}

/**
 * Translate every section that needs it, then return a new section list.
 *
 * A section that could not be translated stays unchanged and is counted as a
 * failure. Callers skip failedIndexes so untranslated English is never read
 * in Nepali mode; the other sections can continue and failures can be retried.
 */
export async function translateSectionsToNepali(
  sections: SpeechSection[],
  signal?: AbortSignal,
): Promise<TranslationOutcome> {
  const candidateIndexes = sections.reduce<number[]>((acc, section, index) => {
    if (needsTranslation(section)) acc.push(index)
    return acc
  }, [])

  if (candidateIndexes.length === 0) {
    return { sections, translated: 0, failed: 0, failedIndexes: [] }
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
    signal?.throwIfAborted()
    // A service outage is different from one rejected translation. Let the
    // caller offer a retry instead of waiting through every remaining group.
    const results = await requestBatch(group, signal)
    signal?.throwIfAborted()
    group.forEach((source, index) => {
      const translated = results[index]
      if (translated) sessionCache.set(source, translated)
    })
  }

  let translated = 0
  let failed = 0
  const failedIndexes: number[] = []
  const candidates = new Set(candidateIndexes)

  const next = sections.map((section, index) => {
    if (!candidates.has(index)) return section

    const nepali = sessionCache.get(section.text)
    if (!nepali) {
      failed += 1
      failedIndexes.push(index)
      return section
    }

    translated += 1
    const translatedSection = {
      ...section,
      text: normalizeForSpeech(nepali, "ne-NP"),
      locale: "ne-NP" as const,
    }
    translatedSections.add(translatedSection)
    return translatedSection
  })

  return { sections: next, translated, failed, failedIndexes }
}

/** Test/debug helper. Not used in the UI. */
export function clearTranslationCache(): void {
  sessionCache.clear()
  translatedSections = new WeakSet<SpeechSection>()
}
