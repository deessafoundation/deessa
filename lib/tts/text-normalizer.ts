// ── Text Normalization for Speech ───────────────────────────────────────────
// Turns on-screen text into something a speech engine pronounces sensibly.
// Pure functions only: no DOM, no browser APIs.

import { TTS_LIMITS, type SupportedSpeechLocale } from "./types"

/**
 * Locale-scoped pronunciation overrides.
 *
 * Keys are matched case-insensitively on whole words only, so "deessa" will
 * not corrupt an unrelated substring. Keep this list content-focused and
 * conservative — broad replacements cause more problems than they solve.
 *
 * NEVER use hyphens to mark syllable breaks. Speech engines treat a short
 * hyphenated token as an initialism and spell it out letter by letter, so
 * "Dee-sa" comes out as "D S A". Write respellings as ordinary words and let
 * the engine's grapheme-to-phoneme rules do the work.
 *
 * Use spaces only when you genuinely want letters read individually ("N G O").
 */
/**
 * How the organisation's name should be spoken.
 *
 * "deessa" is a Nepali word meaning a way or direction, so it must be spoken as
 * that word — not spelled out, and not read with English letter values. The
 * only correct written spelling is "Deessa"; "Deesha" is a misspelling that is
 * still matched below purely to catch it in older CMS content.
 *
 * ── TUNING ────────────────────────────────────────────────────────────────
 * These two constants are the only place the name's pronunciation is defined.
 * If the final syllable should be "shaa" rather than "saa", change them to
 * "Deeshaa" / "दिशा" and nothing else needs touching.
 */
const ORG_NAME_SPOKEN_EN = "Deesaa" // reads roughly "dee-SAA"
const ORG_NAME_SPOKEN_NE = "दीसा"

const PRONUNCIATION_DICTIONARY: Record<
  SupportedSpeechLocale,
  Array<[pattern: string, replacement: string]>
> = {
  "en-US": [
    ["Deessa", ORG_NAME_SPOKEN_EN],
    // Legacy misspelling; must still sound identical to the correct spelling.
    ["Deesha", ORG_NAME_SPOKEN_EN],
    ["NGO", "N G O"],
    ["NPR", "Nepalese Rupees"],
    ["PDF", "P D F"],
    ["SDG", "S D G"],
    ["SDGs", "S D Gs"],
    ["CMS", "C M S"],
    ["FAQ", "F A Q"],
    ["FAQs", "F A Qs"],
    ["WCAG", "W C A G"],
    ["Rs.", "Rupees"],
    ["Rs", "Rupees"],
  ],
  "ne-NP": [
    // Hand the Devanagari voice the actual Nepali word rather than a romanised
    // spelling, so it is pronounced natively instead of letter by letter.
    ["Deessa", ORG_NAME_SPOKEN_NE],
    ["Deesha", ORG_NAME_SPOKEN_NE],
    ["NGO", "एन जी ओ"],
    ["NPR", "नेपाली रुपैयाँ"],
    ["PDF", "पी डी एफ"],
    ["Rs.", "रुपैयाँ"],
    ["Rs", "रुपैयाँ"],
  ],
}

/** Characters that are decorative in print but noisy in speech. */
const DECORATIVE_CHARS =
  /[•·▪▸►▶●◆◇■□★☆✦✧❖➤➔→←↑↓⇒⟶—–_~`^|]+/g

/** Emoji and pictographs. Stripped rather than described. */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2B00}-\u{2BFF}]/gu

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * True when a string is "word-ish" on both ends, meaning we can safely apply
 * word-boundary matching. Devanagari and trailing dots break `\b`, so those
 * entries fall back to a looser guard.
 */
function buildDictionaryRegExp(pattern: string): RegExp {
  const escaped = escapeRegExp(pattern)
  const startsWord = /^[A-Za-z0-9]/.test(pattern)
  const endsWord = /[A-Za-z0-9]$/.test(pattern)
  const prefix = startsWord ? "(?<![\\p{L}\\p{N}])" : ""
  const suffix = endsWord ? "(?![\\p{L}\\p{N}])" : ""
  return new RegExp(`${prefix}${escaped}${suffix}`, "giu")
}

const COMPILED_DICTIONARY: Record<
  SupportedSpeechLocale,
  Array<[RegExp, string]>
> = {
  "en-US": PRONUNCIATION_DICTIONARY["en-US"].map(([p, r]) => [
    buildDictionaryRegExp(p),
    r,
  ]),
  "ne-NP": PRONUNCIATION_DICTIONARY["ne-NP"].map(([p, r]) => [
    buildDictionaryRegExp(p),
    r,
  ]),
}

/** Collapse whitespace, drop decorations, keep sentence punctuation. */
export function normalizeWhitespace(input: string): string {
  return input
    .replace(ZERO_WIDTH, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Speak URLs, emails and phone numbers in a way that does not read every
 * slash and hyphen. Long URLs are reduced to their domain.
 */
function normalizeMachineText(input: string): string {
  return (
    input
      // Emails: "hello@deessa.org" -> "hello at deessa dot org"
      .replace(
        /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
        (_m, user: string, domain: string) =>
          `${user.replace(/[._%+-]/g, " ")} at ${domain.replace(/\./g, " dot ")}`
      )
      // Full URLs: keep the host, drop the protocol and path noise.
      .replace(
        /\bhttps?:\/\/(?:www\.)?([^\s/]+)(\/\S*)?/gi,
        (_m, host: string) => `${host.replace(/\./g, " dot ")}`
      )
      // Bare www hosts.
      .replace(/\bwww\.([^\s/]+)/gi, (_m, host: string) =>
        host.replace(/\./g, " dot ")
      )
  )
}

/** Percentages, currency and thousands separators. */
function normalizeNumbers(
  input: string,
  locale: SupportedSpeechLocale
): string {
  const percent = locale === "ne-NP" ? " प्रतिशत" : " percent"
  return input
    .replace(/(\d)\s*%/g, `$1${percent}`)
    // 1,200,000 -> 1200000 so engines read it as a number, not three groups.
    .replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => m.replace(/,/g, ""))
}

/**
 * Split camelCase / PascalCase runs that leak in from slugs or code. Only
 * applied to Latin text so Devanagari is untouched.
 */
function splitCamelCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2")
}

function applyDictionary(
  input: string,
  locale: SupportedSpeechLocale
): string {
  let output = input
  for (const [pattern, replacement] of COMPILED_DICTIONARY[locale]) {
    output = output.replace(pattern, replacement)
  }
  return output
}

/**
 * Full normalization pipeline for a piece of visible text.
 * Returns an empty string when nothing speakable remains.
 */
export function normalizeForSpeech(
  input: string,
  locale: SupportedSpeechLocale
): string {
  if (!input) return ""

  let text = normalizeWhitespace(input)
  if (!text) return ""

  text = text.replace(EMOJI, " ")
  text = text.replace(DECORATIVE_CHARS, " ")
  text = normalizeMachineText(text)
  text = splitCamelCase(text)
  text = normalizeNumbers(text, locale)
  text = applyDictionary(text, locale)

  // Collapse runs of repeated sentence punctuation ("!!!" -> "!") while
  // preserving a single terminator, which engines use for pacing.
  text = text.replace(/([.!?])\1+/g, "$1")
  text = text.replace(/\s+([,.!?;:])/g, "$1")
  text = normalizeWhitespace(text)

  // Anything left with no letters or digits is decoration.
  if (!/[\p{L}\p{N}]/u.test(text)) return ""

  return text
}

/**
 * Split text at sentence boundaries into utterance-sized chunks.
 *
 * Handles both Latin terminators and the Devanagari danda (।). Falls back to
 * clause and then hard-width splitting so a single unpunctuated wall of text
 * still yields usable chunks.
 */
export function chunkText(
  text: string,
  maxChars: number = TTS_LIMITS.maxCharsPerUtterance
): string[] {
  const normalized = normalizeWhitespace(text)
  if (!normalized) return []
  if (normalized.length <= maxChars) return [normalized]

  const sentences = splitSentences(normalized)
  const chunks: string[] = []
  let current = ""

  const push = () => {
    const trimmed = current.trim()
    if (trimmed) chunks.push(trimmed)
    current = ""
  }

  for (const sentence of sentences) {
    for (const piece of hardSplit(sentence, maxChars)) {
      if (!current) {
        current = piece
        continue
      }
      if (current.length + 1 + piece.length <= maxChars) {
        current = `${current} ${piece}`
      } else {
        push()
        current = piece
      }
    }
  }
  push()

  return chunks
}

function splitSentences(text: string): string[] {
  // Keep the terminator attached to the sentence it ends.
  return text
    .split(/(?<=[.!?।॥])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Break an over-long sentence at clause marks, then at whitespace. */
function hardSplit(sentence: string, maxChars: number): string[] {
  if (sentence.length <= maxChars) return [sentence]

  const clauses = sentence
    .split(/(?<=[,;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const out: string[] = []
  for (const clause of clauses) {
    if (clause.length <= maxChars) {
      out.push(clause)
      continue
    }
    // Last resort: split on word boundaries at the width limit.
    let remaining = clause
    while (remaining.length > maxChars) {
      let cut = remaining.lastIndexOf(" ", maxChars)
      if (cut <= 0) cut = maxChars
      out.push(remaining.slice(0, cut).trim())
      remaining = remaining.slice(cut).trim()
    }
    if (remaining) out.push(remaining)
  }
  return out
}
