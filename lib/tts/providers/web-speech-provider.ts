// ── Web Speech API Provider ─────────────────────────────────────────────────
// Default TTS provider. Speech is produced by the visitor's own browser, so no
// page content leaves the device.
//
// Browser quirks this file works around:
//  - Chromium returns an empty voice list on first call and fires
//    `voiceschanged` later.
//  - `cancel()` fires an `error` event with code `interrupted`/`canceled`,
//    which must not be surfaced as a real failure.
//  - Long utterances stall silently in several engines, so callers chunk text
//    and we add a watchdog on top.
//  - Safari occasionally leaves the queue in a paused state after `cancel()`.

import {
  baseLanguageOf,
  type SupportedSpeechLocale,
  type TtsErrorCode,
  type TtsEvent,
  type TtsEventHandler,
  type TtsEventPayload,
  type TtsProvider,
  type TtsSpeakRequest,
  type TtsVoice,
} from "../types"

/** Locale codes some engines report instead of the canonical tag. */
const LOCALE_ALIASES: Record<SupportedSpeechLocale, string[]> = {
  "en-US": ["en-us", "en_us", "en-gb", "en_gb", "en-in", "en"],
  "ne-NP": ["ne-np", "ne_np", "ne", "nep", "ne-in"],
}

/**
 * Same-script substitutes, tried only after every genuine match has failed.
 *
 * Almost no browser ships a Nepali voice, which would otherwise leave Nepali
 * permanently unavailable. Nepali, Hindi, Marathi and Sanskrit all use
 * Devanagari, and Hindi voices ship broadly on Windows, Android, macOS and iOS,
 * so a Hindi voice renders Nepali text intelligibly — with a Hindi accent and
 * Hindi vowel lengths, which is a real compromise, not a fix.
 *
 * Two rules make this honest rather than sloppy:
 *   1. It is always disclosed in the UI; it never happens silently.
 *   2. English is deliberately absent. A Latin-script voice fed Devanagari
 *      produces either silence or nonsense, so falling back to it is worse
 *      than reporting that no voice exists.
 */
const SCRIPT_SUBSTITUTES: Record<SupportedSpeechLocale, string[]> = {
  "en-US": [],
  "ne-NP": ["hi-in", "hi", "mr-in", "mr", "sa-in", "sa"],
}

/** Which voice was chosen for a locale, and whether it is a compromise. */
export interface ResolvedVoiceInfo {
  voiceId: string
  voiceName: string
  voiceLang: string
  /** True when the voice is a different language that shares the script. */
  isScriptSubstitute: boolean
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/_/g, "-")
}

function voiceIdFor(voice: SpeechSynthesisVoice): string {
  // voiceURI is the most stable identifier available; name disambiguates the
  // handful of engines that reuse URIs across languages.
  return `${voice.voiceURI}::${voice.lang}`
}

export class WebSpeechTtsProvider implements TtsProvider {
  readonly id = "web-speech"

  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private voicesLoaded = false
  private voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null
  private handlers = new Map<TtsEvent, Set<TtsEventHandler>>()
  private currentUtterance: SpeechSynthesisUtterance | null = null
  /**
   * Utterances we deliberately interrupted. Tracked per-utterance rather than
   * as a single flag: skipping sections cancels the old utterance and starts a
   * new one in the same tick, and a shared flag would be cleared before the
   * old utterance's `error` event arrived.
   */
  private cancelled = new WeakSet<SpeechSynthesisUtterance>()
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private voicesChangedListener: (() => void) | null = null

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis
    }
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance === "function"
    )
  }

  // ── Events ───────────────────────────────────────────────────────────────

  on(event: TtsEvent, handler: TtsEventHandler): () => void {
    const set = this.handlers.get(event) ?? new Set()
    set.add(handler)
    this.handlers.set(event, set)
    return () => {
      set.delete(handler)
    }
  }

  private emit(event: TtsEvent, payload: TtsEventPayload = {}): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of Array.from(set)) {
      try {
        handler(payload)
      } catch {
        // A broken subscriber must not take down playback.
      }
    }
  }

  // ── Voices ───────────────────────────────────────────────────────────────

  /**
   * Resolve the voice list, waiting for `voiceschanged` when the first read
   * comes back empty. Resolves with whatever is available after the timeout
   * rather than hanging the UI.
   */
  private loadVoices(timeoutMs = 3000): Promise<SpeechSynthesisVoice[]> {
    if (!this.synth) return Promise.resolve([])
    if (this.voicesLoaded && this.voices.length > 0) {
      return Promise.resolve(this.voices)
    }
    if (this.voicesPromise) return this.voicesPromise

    this.voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const synth = this.synth as SpeechSynthesis

      const settle = () => {
        this.voices = synth.getVoices() ?? []
        this.voicesLoaded = this.voices.length > 0
        cleanup()
        resolve(this.voices)
      }

      const immediate = synth.getVoices() ?? []
      if (immediate.length > 0) {
        this.voices = immediate
        this.voicesLoaded = true
        this.voicesPromise = null
        resolve(immediate)
        return
      }

      const timer = setTimeout(settle, timeoutMs)
      const onChanged = () => {
        const next = synth.getVoices() ?? []
        if (next.length > 0) {
          clearTimeout(timer)
          settle()
        }
      }

      const cleanup = () => {
        clearTimeout(timer)
        synth.removeEventListener?.("voiceschanged", onChanged)
        this.voicesPromise = null
      }

      synth.addEventListener?.("voiceschanged", onChanged)

      // Keep a long-lived listener so later installs are picked up too.
      if (!this.voicesChangedListener) {
        this.voicesChangedListener = () => {
          this.voices = synth.getVoices() ?? []
          this.voicesLoaded = this.voices.length > 0
        }
        synth.addEventListener?.("voiceschanged", this.voicesChangedListener)
      }
    })

    return this.voicesPromise
  }

  async getVoices(locale?: SupportedSpeechLocale): Promise<TtsVoice[]> {
    const all = await this.loadVoices()
    if (!locale) return all.map(toTtsVoice).sort(compareVoices)

    // Include same-script substitutes, otherwise the Nepali voice dropdown is
    // empty on the many devices that ship no Nepali voice.
    const filtered = all.filter(
      (v) => matchesLocale(v, locale) || isScriptSubstituteVoice(v, locale)
    )
    return filtered.map(toTtsVoice).sort(compareVoices)
  }

  /**
   * Pick the best voice for a locale.
   *
   * Order: requested id -> exact locale -> alias locale -> same base language
   * -> same-script substitute (flagged). Returns `null` when nothing at all can
   * render the script, so callers can report that honestly instead of speaking
   * Devanagari with an English voice.
   */
  private resolveVoiceInfo(
    locale: SupportedSpeechLocale,
    voiceId?: string | null
  ): { voice: SpeechSynthesisVoice; isScriptSubstitute: boolean } | null {
    if (this.voices.length === 0) return null

    const pick = (
      candidates: SpeechSynthesisVoice[],
      isScriptSubstitute: boolean
    ) =>
      candidates.length > 0
        ? { voice: candidates.sort(compareRawVoices)[0], isScriptSubstitute }
        : null

    // An explicit choice wins, but is still labelled if it is a substitute.
    if (voiceId) {
      const requested = this.voices.find((v) => voiceIdFor(v) === voiceId)
      if (requested) {
        if (matchesLocale(requested, locale)) {
          return { voice: requested, isScriptSubstitute: false }
        }
        if (isScriptSubstituteVoice(requested, locale)) {
          return { voice: requested, isScriptSubstitute: true }
        }
      }
    }

    const target = normalizeTag(locale)
    const exact = pick(
      this.voices.filter((v) => normalizeTag(v.lang) === target),
      false
    )
    if (exact) return exact

    for (const alias of LOCALE_ALIASES[locale]) {
      const hit = pick(
        this.voices.filter((v) => normalizeTag(v.lang) === alias),
        false
      )
      if (hit) return hit
    }

    const base = baseLanguageOf(locale)
    const sameLanguage = pick(
      this.voices.filter((v) => baseLanguageOf(v.lang) === base),
      false
    )
    if (sameLanguage) return sameLanguage

    // Last resort: a different language that shares the script, in preference
    // order. Always flagged so the UI can disclose the compromise.
    for (const substitute of SCRIPT_SUBSTITUTES[locale]) {
      const hit = pick(
        this.voices.filter((v) => normalizeTag(v.lang) === substitute),
        true
      )
      if (hit) return hit
    }
    const substituteBases = new Set(
      SCRIPT_SUBSTITUTES[locale].map(baseLanguageOf)
    )
    return pick(
      this.voices.filter((v) => substituteBases.has(baseLanguageOf(v.lang))),
      true
    )
  }

  private resolveVoice(
    locale: SupportedSpeechLocale,
    voiceId?: string | null
  ): SpeechSynthesisVoice | null {
    return this.resolveVoiceInfo(locale, voiceId)?.voice ?? null
  }

  /** True when the engine has any voice able to render this locale's script. */
  async hasVoiceFor(locale: SupportedSpeechLocale): Promise<boolean> {
    await this.loadVoices()
    return this.resolveVoiceInfo(locale) !== null
  }

  /**
   * Describe the voice that would actually be used, including whether it is a
   * same-script stand-in. The UI needs this to disclose the compromise.
   */
  async describeVoiceFor(
    locale: SupportedSpeechLocale,
    voiceId?: string | null
  ): Promise<ResolvedVoiceInfo | null> {
    await this.loadVoices()
    const resolved = this.resolveVoiceInfo(locale, voiceId)
    if (!resolved) return null
    return {
      voiceId: voiceIdFor(resolved.voice),
      voiceName: resolved.voice.name,
      voiceLang: resolved.voice.lang,
      isScriptSubstitute: resolved.isScriptSubstitute,
    }
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /**
   * Speak one chunk. Resolves when the utterance finishes and rejects with a
   * `TtsProviderError` on genuine failures. An intentional `stop()` resolves
   * quietly so callers do not treat it as an error.
   */
  async speak(request: TtsSpeakRequest): Promise<void> {
    if (!this.isSupported() || !this.synth) {
      throw new TtsProviderError("unsupported", "Speech synthesis unavailable")
    }

    const text = request.text.trim()
    if (!text) return

    await this.loadVoices()

    const voice = this.resolveVoice(request.locale, request.voiceId)
    if (!voice) {
      throw new TtsProviderError(
        "no-voice",
        `No voice available for ${request.locale}`
      )
    }

    const synth = this.synth

    // Clear any residue from a previous utterance before queueing a new one,
    // marking it as an intentional interruption first. A paused queue ignores
    // cancel() in several engines, so resume before cancelling.
    if (this.currentUtterance) this.cancelled.add(this.currentUtterance)
    if (synth.paused) synth.resume()
    synth.cancel()

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.lang = voice.lang || request.locale
      utterance.rate = request.rate
      utterance.pitch = request.pitch
      utterance.volume = request.volume ?? 1

      let settled = false
      const finish = (fn: () => void) => {
        if (settled) return
        settled = true
        this.clearWatchdog()
        this.currentUtterance = null
        fn()
      }

      const onStall = () =>
        finish(() =>
          reject(new TtsProviderError("stalled", "Speech engine stalled"))
        )
      const rearm = () => this.armWatchdog(utterance, text, request.rate, onStall)

      utterance.onstart = () => {
        this.emit("start")
        rearm()
      }

      utterance.onboundary = (event) => {
        rearm()
        this.emit("boundary", { charIndex: event.charIndex })
      }

      utterance.onpause = () => {
        this.clearWatchdog()
        this.emit("pause")
      }

      utterance.onresume = () => {
        rearm()
        this.emit("resume")
      }

      utterance.onend = () => {
        finish(() => {
          this.emit("end")
          resolve()
        })
      }

      utterance.onerror = (event) => {
        const raw = (event as SpeechSynthesisErrorEvent).error
        // `interrupted` / `canceled` are the expected result of stop(), and of
        // the defensive cancel() above. Never surface them as failures.
        if (
          this.cancelled.has(utterance) ||
          raw === "interrupted" ||
          raw === "canceled"
        ) {
          finish(resolve)
          return
        }
        finish(() => {
          const code = mapErrorCode(raw)
          this.emit("error", { errorCode: code, message: raw })
          reject(new TtsProviderError(code, raw ?? "synthesis failed"))
        })
      }

      this.currentUtterance = utterance

      // Safari can be left paused by a prior cancel(); make sure we are not.
      if (synth.paused) synth.resume()

      try {
        synth.speak(utterance)
      } catch (error) {
        finish(() =>
          reject(
            new TtsProviderError(
              "synthesis-failed",
              error instanceof Error ? error.message : "speak() threw"
            )
          )
        )
      }
    })
  }

  pause(): void {
    if (!this.synth) return
    try {
      if (this.synth.speaking && !this.synth.paused) {
        this.clearWatchdog()
        this.synth.pause()
      }
    } catch {
      /* engine refused; UI state is reconciled by the caller */
    }
  }

  resume(): void {
    if (!this.synth) return
    try {
      if (this.synth.paused) this.synth.resume()
    } catch {
      /* no-op */
    }
  }

  stop(): void {
    if (!this.synth) return
    if (this.currentUtterance) this.cancelled.add(this.currentUtterance)
    this.clearWatchdog()
    try {
      // Resume first: a paused queue ignores cancel() in some engines.
      if (this.synth.paused) this.synth.resume()
      this.synth.cancel()
    } catch {
      /* no-op */
    }
    this.currentUtterance = null
  }

  dispose(): void {
    this.stop()
    this.handlers.clear()
    if (this.synth && this.voicesChangedListener) {
      this.synth.removeEventListener?.(
        "voiceschanged",
        this.voicesChangedListener
      )
      this.voicesChangedListener = null
    }
  }

  // ── Stall detection ──────────────────────────────────────────────────────

  /**
   * Generous upper bound on how long a chunk should take. ~12 chars/second at
   * 1x is slow for every engine tested, plus a fixed 5s of slack.
   */
  private armWatchdog(
    utterance: SpeechSynthesisUtterance,
    text: string,
    rate: number,
    onStall: () => void
  ): void {
    this.clearWatchdog()
    const safeRate = Math.max(0.5, rate)
    const estimatedMs = (text.length / 12) * 1000 * (1 / safeRate)
    const timeoutMs = Math.min(120_000, estimatedMs + 5000)
    this.watchdog = setTimeout(() => {
      if (this.cancelled.has(utterance)) return
      // Some engines never fire `pause`; treat a paused queue as healthy and
      // keep waiting instead of reporting a false stall.
      if (this.synth?.paused) {
        this.armWatchdog(utterance, text, rate, onStall)
        return
      }
      this.emit("error", { errorCode: "stalled" })
      onStall()
    }, timeoutMs)
  }

  private clearWatchdog(): void {
    if (this.watchdog) {
      clearTimeout(this.watchdog)
      this.watchdog = null
    }
  }
}

export class TtsProviderError extends Error {
  readonly code: TtsErrorCode
  constructor(code: TtsErrorCode, message: string) {
    super(message)
    this.name = "TtsProviderError"
    this.code = code
  }
}

function mapErrorCode(raw: string | undefined): TtsErrorCode {
  switch (raw) {
    case "not-allowed":
    case "audio-busy":
      return "not-allowed"
    case "network":
      return "network"
    case "language-unavailable":
    case "voice-unavailable":
      return "no-voice"
    case "interrupted":
    case "canceled":
      return "interrupted"
    default:
      return "synthesis-failed"
  }
}

function matchesLocale(
  voice: SpeechSynthesisVoice,
  locale: SupportedSpeechLocale
): boolean {
  const tag = normalizeTag(voice.lang)
  if (tag === normalizeTag(locale)) return true
  if (LOCALE_ALIASES[locale].includes(tag)) return true
  return baseLanguageOf(tag) === baseLanguageOf(locale)
}

/** True when the voice is a different language that shares the script. */
function isScriptSubstituteVoice(
  voice: SpeechSynthesisVoice,
  locale: SupportedSpeechLocale
): boolean {
  const substitutes = SCRIPT_SUBSTITUTES[locale]
  if (substitutes.length === 0) return false
  const tag = normalizeTag(voice.lang)
  if (substitutes.includes(tag)) return true
  return substitutes.map(baseLanguageOf).includes(baseLanguageOf(tag))
}

function toTtsVoice(voice: SpeechSynthesisVoice): TtsVoice {
  return {
    id: voiceIdFor(voice),
    name: voice.name,
    lang: voice.lang,
    localService: voice.localService,
    default: voice.default,
  }
}

/** Prefer on-device voices, then engine defaults, then alphabetical. */
function compareRawVoices(
  a: SpeechSynthesisVoice,
  b: SpeechSynthesisVoice
): number {
  if (a.localService !== b.localService) return a.localService ? -1 : 1
  if (a.default !== b.default) return a.default ? -1 : 1
  return a.name.localeCompare(b.name)
}

function compareVoices(a: TtsVoice, b: TtsVoice): number {
  if (a.localService !== b.localService) return a.localService ? -1 : 1
  if (a.default !== b.default) return a.default ? -1 : 1
  return a.name.localeCompare(b.name)
}
