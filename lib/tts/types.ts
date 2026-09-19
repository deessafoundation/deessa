// ── Text-to-Speech Types ────────────────────────────────────────────────────
// Shared type surface for the bilingual (English / Nepali) TTS accessibility
// feature. Keep this module free of DOM/browser access so it can be imported
// from server components and unit tests alike.

/** Locales the feature is allowed to speak in. */
export type SupportedSpeechLocale = "en-US" | "ne-NP"

export const SUPPORTED_SPEECH_LOCALES: readonly SupportedSpeechLocale[] = [
  "en-US",
  "ne-NP",
] as const

export function isSupportedSpeechLocale(
  value: unknown
): value is SupportedSpeechLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_SPEECH_LOCALES as readonly string[]).includes(value)
  )
}

/** Base language tag, used for "same language, different region" fallbacks. */
export function baseLanguageOf(locale: string): string {
  return locale.toLowerCase().split(/[-_]/)[0] ?? ""
}

/** The semantic role of a readable chunk. Drives pacing and highlighting. */
export type SpeechSectionKind =
  | "heading"
  | "paragraph"
  | "list-item"
  | "caption"
  | "table"
  | "control"

/**
 * One readable unit of page content. `element` is the DOM node used for
 * highlighting and scroll-into-view; it is intentionally not serialisable.
 */
export interface SpeechSection {
  id: string
  text: string
  locale: SupportedSpeechLocale
  element: HTMLElement
  kind: SpeechSectionKind
}

/** A single utterance-sized slice of a section. */
export interface SpeechChunk {
  sectionId: string
  sectionIndex: number
  chunkIndex: number
  text: string
  locale: SupportedSpeechLocale
}

// ── Provider contract ───────────────────────────────────────────────────────

export interface TtsVoice {
  /** Stable identifier used for persistence. */
  id: string
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export interface TtsSpeakRequest {
  text: string
  locale: SupportedSpeechLocale
  voiceId?: string | null
  rate: number
  pitch: number
  volume?: number
}

export type TtsEvent =
  | "start"
  | "end"
  | "pause"
  | "resume"
  | "boundary"
  | "error"

export interface TtsEventPayload {
  /** Character offset inside the current utterance, for `boundary`. */
  charIndex?: number
  /** Machine-readable error category — never raw page content. */
  errorCode?: TtsErrorCode
  message?: string
}

export type TtsEventHandler = (payload: TtsEventPayload) => void

export type TtsErrorCode =
  | "unsupported"
  | "no-voice"
  | "not-allowed"
  | "interrupted"
  | "synthesis-failed"
  | "stalled"
  | "network"
  | "empty-content"
  | "content-too-long"

export interface TtsProvider {
  readonly id: string
  isSupported(): boolean | Promise<boolean>
  getVoices(locale?: SupportedSpeechLocale): Promise<TtsVoice[]>
  speak(request: TtsSpeakRequest): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  on(event: TtsEvent, handler: TtsEventHandler): () => void
  dispose?(): void
}

// ── Playback state ──────────────────────────────────────────────────────────

export type TtsStatus =
  | "idle"
  | "loading"
  | "speaking"
  | "paused"
  | "finished"
  | "error"
  | "unsupported"

// ── Tunables ────────────────────────────────────────────────────────────────

export const TTS_LIMITS = {
  /** Browser engines get unreliable past a few hundred characters. */
  maxCharsPerUtterance: 500,
  /** Guard against runaway pages. */
  maxCharsPerPage: 120_000,
  minSectionChars: 2,
  minRate: 0.75,
  maxRate: 1.5,
  defaultRate: 1,
  minPitch: 0.8,
  maxPitch: 1.2,
  defaultPitch: 1,
} as const

/** Attribute hooks authors can use to steer the extractor. */
export const TTS_ATTRIBUTES = {
  root: "data-tts-root",
  ignore: "data-tts-ignore",
  text: "data-tts-text",
  section: "data-tts-section",
  language: "data-tts-language",
  priority: "data-tts-priority",
  active: "data-tts-active",
} as const
