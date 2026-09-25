// ── Cloud (neural) TTS provider ─────────────────────────────────────────────
// Speaks a locale using a genuine server-synthesized neural voice, fetched from
// /api/tts/speak (Google Cloud Text-to-Speech). This exists so Nepali (ne-NP)
// can be read by a real, fluent Nepali voice instead of a Hindi substitute —
// the browser Web Speech API cannot do that because almost no device ships a
// Nepali voice.
//
// The provider mirrors the WebSpeechTtsProvider contract exactly so the
// accessibility playback loop can use either interchangeably. Audio is played
// through a single reused HTMLAudioElement, and pause/resume/stop map onto it.

import {
  type SupportedSpeechLocale,
  type TtsErrorCode,
  type TtsEvent,
  type TtsEventHandler,
  type TtsEventPayload,
  type TtsProvider,
  type TtsSpeakRequest,
  type TtsVoice,
} from "../types"
import { TtsProviderError } from "./web-speech-provider"

/** Mirror of ResolvedVoiceInfo so callers can describe the chosen voice. */
export interface ResolvedVoiceInfo {
  voiceId: string
  voiceName: string
  voiceLang: string
  isScriptSubstitute: boolean
}

/** Human-facing names for the cloud voices, per locale. */
const CLOUD_VOICE_INFO: Record<SupportedSpeechLocale, { id: string; name: string; lang: string }> = {
  "ne-NP": { id: "cloud:ne-NP", name: "Nepali (Neural)", lang: "ne-NP" },
  "en-US": { id: "cloud:en-US", name: "English (Neural)", lang: "en-US" },
}

const SPEAK_ENDPOINT = "/api/tts/speak"

/**
 * True when the cloud synthesis route has a key configured. Cached per page
 * load so we do not probe on every read. Returns false on any error so the
 * caller falls back to the browser voice.
 */
export async function isCloudTtsAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false
  try {
    const res = await fetch(SPEAK_ENDPOINT, { method: "GET", cache: "no-store" })
    if (!res.ok) return false
    const data = (await res.json()) as { enabled?: unknown }
    return data.enabled === true
  } catch {
    return false
  }
}

export class CloudTtsProvider implements TtsProvider {
  readonly id = "cloud-tts"

  private audio: HTMLAudioElement | null = null
  private handlers = new Map<TtsEvent, Set<TtsEventHandler>>()
  private generation = 0
  private fetchController: AbortController | null = null
  private settlePlayback: (() => void) | null = null
  private available: boolean | null = null

  /** Which locales this provider is allowed to synthesize. */
  private readonly enabledLocales: ReadonlySet<SupportedSpeechLocale>

  constructor(enabledLocales: SupportedSpeechLocale[] = ["ne-NP"]) {
    this.enabledLocales = new Set(enabledLocales)
    if (typeof window !== "undefined") {
      this.audio = new Audio()
      this.audio.preload = "auto"
    }
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && typeof Audio !== "undefined"
  }

  async getVoices(locale?: SupportedSpeechLocale): Promise<TtsVoice[]> {
    if (!(await this.hasVoiceFor(locale ?? "ne-NP"))) return []
    const targets = locale ? [locale] : (["ne-NP", "en-US"] as SupportedSpeechLocale[])
    return targets
      .filter((l) => this.enabledLocales.has(l))
      .map((l) => {
        const info = CLOUD_VOICE_INFO[l]
        return { id: info.id, name: info.name, lang: info.lang, localService: false, default: true }
      })
  }

  /** True when the cloud route is configured AND this locale is enabled. */
  async hasVoiceFor(locale: SupportedSpeechLocale): Promise<boolean> {
    if (!this.enabledLocales.has(locale)) return false
    if (this.available === null) this.available = await isCloudTtsAvailable()
    return this.available
  }

  async describeVoiceFor(
    locale: SupportedSpeechLocale,
    _voiceId?: string | null
  ): Promise<ResolvedVoiceInfo | null> {
    if (!(await this.hasVoiceFor(locale))) return null
    const info = CLOUD_VOICE_INFO[locale]
    return {
      voiceId: info.id,
      voiceName: info.name,
      voiceLang: info.lang,
      // A genuine same-language neural voice — never a script substitute.
      isScriptSubstitute: false,
    }
  }

  async speak(request: TtsSpeakRequest): Promise<void> {
    if (!this.isSupported() || !this.audio) {
      throw new TtsProviderError("unsupported", "Audio playback unavailable")
    }
    const text = request.text.trim()
    if (!text) return

    // Each request owns its fetch and playback. A stopped request must never
    // attach its late response to the shared audio element.
    this.stop()
    const generation = this.generation
    const controller = new AbortController()
    this.fetchController = controller

    let audioUrl: string
    try {
      const res = await fetch(SPEAK_ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          locale: request.locale,
          rate: request.rate,
          pitch: request.pitch,
        }),
      })
      if (res.status === 501) {
        // Key removed at runtime: report no-voice so the caller can fall back.
        throw new TtsProviderError("no-voice", "Cloud voice not configured")
      }
      if (!res.ok) {
        const code: TtsErrorCode = res.status === 429 ? "network" : "synthesis-failed"
        throw new TtsProviderError(code, `Cloud synthesis failed (${res.status})`)
      }
      const data = (await res.json()) as { audioContent?: unknown; mimeType?: unknown }
      if (typeof data.audioContent !== "string") {
        throw new TtsProviderError("synthesis-failed", "No audio returned")
      }
      const mime = typeof data.mimeType === "string" ? data.mimeType : "audio/mpeg"
      audioUrl = `data:${mime};base64,${data.audioContent}`
    } catch (error) {
      if (generation !== this.generation || controller.signal.aborted) return
      if (error instanceof TtsProviderError) throw error
      throw new TtsProviderError("network", error instanceof Error ? error.message : "fetch failed")
    } finally {
      if (this.fetchController === controller) this.fetchController = null
    }

    if (generation !== this.generation) return

    const audio = this.audio
    return new Promise<void>((resolve, reject) => {
      let settled = false
      const cleanup = () => {
        audio.onended = null
        audio.onerror = null
        audio.onplay = null
        audio.onpause = null
      }
      const finish = (fn: () => void) => {
        if (settled) return
        settled = true
        cleanup()
        if (this.settlePlayback === cancelPlayback) this.settlePlayback = null
        fn()
      }
      const cancelPlayback = () => finish(resolve)
      this.settlePlayback = cancelPlayback

      audio.onplay = () => this.emit("start")
      audio.onended = () =>
        finish(() => {
          this.emit("end")
          resolve()
        })
      audio.onerror = () =>
        finish(() => {
          // A stop() clears the src, which fires error; treat as interruption.
          if (generation !== this.generation) {
            resolve()
            return
          }
          this.emit("error", { errorCode: "synthesis-failed" })
          reject(new TtsProviderError("synthesis-failed", "audio playback failed"))
        })

      audio.src = audioUrl
      // playbackRate also honours rate for responsiveness if the server rate
      // was clamped; keep it at 1 since the server already applied rate.
      audio.playbackRate = 1
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err: unknown) => {
          if (generation !== this.generation) {
            finish(resolve)
            return
          }
          // Autoplay policies can block the very first play; report not-allowed
          // so the UI can prompt the user to press play.
          const isNotAllowed =
            err instanceof DOMException && err.name === "NotAllowedError"
          finish(() => {
            const code: TtsErrorCode = isNotAllowed ? "not-allowed" : "synthesis-failed"
            this.emit("error", { errorCode: code })
            reject(new TtsProviderError(code, err instanceof Error ? err.message : "play() failed"))
          })
        })
      }
    })
  }

  pause(): void {
    try {
      if (this.audio && !this.audio.paused) {
        this.audio.pause()
        this.emit("pause")
      }
    } catch {
      /* no-op */
    }
  }

  resume(): void {
    try {
      if (this.audio && this.audio.paused && this.audio.src) {
        void this.audio.play()
        this.emit("resume")
      }
    } catch {
      /* no-op */
    }
  }

  stop(): void {
    this.generation += 1
    this.fetchController?.abort()
    this.fetchController = null
    this.settlePlayback?.()
    try {
      if (this.audio) {
        this.audio.pause()
        this.audio.removeAttribute("src")
        this.audio.load()
      }
    } catch {
      /* no-op */
    }
  }

  on(event: TtsEvent, handler: TtsEventHandler): () => void {
    const set = this.handlers.get(event) ?? new Set()
    set.add(handler)
    this.handlers.set(event, set)
    return () => set.delete(handler)
  }

  dispose(): void {
    this.stop()
    this.handlers.clear()
    this.audio = null
  }

  private emit(event: TtsEvent, payload: TtsEventPayload = {}): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of Array.from(set)) {
      try {
        handler(payload)
      } catch {
        /* a broken subscriber must not break playback */
      }
    }
  }
}
