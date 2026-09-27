// ── Composite TTS provider ──────────────────────────────────────────────────
// Routes each locale to the best available engine:
//   • Nepali (ne-NP): the cloud neural provider when a server key is
//     configured — a genuine, fluent Nepali voice.
//   • Everything else, and Nepali when no cloud key exists: the browser
//     Web Speech provider (which, for Nepali with no ne-NP voice installed,
//     falls back to a Hindi-accented substitute — the old behaviour).
//
// It exposes the same surface the accessibility playback loop already uses, so
// the loop stays engine-agnostic. Per-locale routing is decided by asking each
// engine whether it can genuinely voice that locale.

import {
  type SupportedSpeechLocale,
  type TtsEvent,
  type TtsEventHandler,
  type TtsProvider,
  type TtsSpeakRequest,
  type TtsVoice,
} from "../types"
import { CloudTtsProvider, type ResolvedVoiceInfo } from "./cloud-tts-provider"
import { WebSpeechTtsProvider } from "./web-speech-provider"

export class CompositeTtsProvider {
  readonly id = "composite-tts"

  private readonly web: WebSpeechTtsProvider
  private readonly cloud: CloudTtsProvider
  /** The engine currently mid-utterance, so pause/resume/stop hit the right one. */
  private active: TtsProvider | null = null
  private generation = 0

  constructor(cloudLocales: SupportedSpeechLocale[] = ["ne-NP"]) {
    this.web = new WebSpeechTtsProvider()
    this.cloud = new CloudTtsProvider(cloudLocales)
  }

  isSupported(): boolean {
    // Web Speech is the baseline; if it is unsupported the feature is off.
    return this.web.isSupported()
  }

  /** Choose the engine that can genuinely voice this locale, cloud first. */
  private async engineFor(locale: SupportedSpeechLocale): Promise<TtsProvider> {
    if (await this.cloud.hasVoiceFor(locale)) {
      return this.cloud as unknown as TtsProvider
    }
    return this.web as unknown as TtsProvider
  }

  async getVoices(locale?: SupportedSpeechLocale): Promise<TtsVoice[]> {
    if (!locale) return this.web.getVoices()
    const cloudVoices = await this.cloud.getVoices(locale)
    const webVoices = await this.web.getVoices(locale)
    // Cloud (genuine neural) voices rank first, then browser voices.
    return [...cloudVoices, ...webVoices]
  }

  async describeVoiceFor(
    locale: SupportedSpeechLocale,
    voiceId?: string | null
  ): Promise<ResolvedVoiceInfo | null> {
    // A genuine cloud voice for this locale always wins over a browser
    // substitute, which is the whole point: Nepali should sound Nepali.
    if (await this.cloud.hasVoiceFor(locale)) {
      // If the user explicitly picked a browser voice, honour it; otherwise
      // use the cloud voice.
      if (voiceId && !voiceId.startsWith("cloud:")) {
        const web = await this.web.describeVoiceFor(locale, voiceId)
        if (web && !web.isScriptSubstitute) return web
      }
      return this.cloud.describeVoiceFor(locale, voiceId)
    }
    return this.web.describeVoiceFor(locale, voiceId)
  }

  async hasVoiceFor(locale: SupportedSpeechLocale): Promise<boolean> {
    if (await this.cloud.hasVoiceFor(locale)) return true
    return this.web.hasVoiceFor(locale)
  }

  async speak(request: TtsSpeakRequest): Promise<void> {
    const generation = this.generation
    // A user-chosen browser voice for this locale overrides cloud routing.
    const preferWeb = Boolean(request.voiceId && !request.voiceId.startsWith("cloud:"))
    const engine = preferWeb
      ? (this.web as unknown as TtsProvider)
      : await this.engineFor(request.locale)
    if (generation !== this.generation) return
    this.active = engine
    // The cloud provider does not understand browser voice ids; drop them.
    const outgoing =
      engine === (this.cloud as unknown as TtsProvider)
        ? { ...request, voiceId: null }
        : request
    return engine.speak(outgoing)
  }

  pause(): void {
    this.active?.pause()
  }

  resume(): void {
    this.active?.resume()
  }

  stop(): void {
    this.generation += 1
    // Stop both so nothing lingers if the active engine changed mid-read.
    this.web.stop()
    this.cloud.stop()
  }

  on(event: TtsEvent, handler: TtsEventHandler): () => void {
    const offWeb = this.web.on(event, handler)
    const offCloud = this.cloud.on(event, handler)
    return () => {
      offWeb()
      offCloud()
    }
  }

  dispose(): void {
    this.web.dispose()
    this.cloud.dispose()
  }
}
