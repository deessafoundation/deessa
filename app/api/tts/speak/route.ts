// ── Nepali (and English) neural speech synthesis ────────────────────────────
// The browser Web Speech API can only use voices the visitor's device has
// installed, and virtually no device ships a Nepali (ne-NP) voice. That forces
// a Hindi substitute: correct Devanagari words, wrong accent. This route gives
// a genuine, fluent Nepali voice by synthesizing audio server-side with Google
// Cloud Text-to-Speech, which has real ne-NP neural voices.
//
// Activation: set GOOGLE_TTS_API_KEY (a Google Cloud API key with the
// "Cloud Text-to-Speech API" enabled). When the key is absent this route
// returns 501 so the client transparently falls back to the browser voice.
//
// Privacy: only text already extracted from the PUBLIC page is synthesized.
// Raw content is never logged here.

import { isSupportedSpeechLocale, type SupportedSpeechLocale } from "@/lib/tts/types"

const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"

const LIMITS = {
  /** Google caps a single synthesize request; keep well under it. */
  maxChars: 1_800,
  upstreamTimeoutMs: 12_000,
} as const

/**
 * Voice selection per locale.
 *
 * Nepali is requested by `languageCode` + `ssmlGender` and deliberately WITHOUT
 * an explicit voice name: Google's `voices.list` endpoint returns nothing for
 * ne-NP and the documented ne-NP-*-A names are rejected as non-existent, yet
 * synthesis by languageCode alone returns correct Nepali audio. Naming a voice
 * here is what breaks it, so we let Google resolve the voice.
 *
 * English can safely name a specific neural voice, which sounds better than the
 * default it would otherwise pick.
 */
const VOICE_BY_LOCALE: Record<
  SupportedSpeechLocale,
  { languageCode: string; name?: string; ssmlGender?: "FEMALE" | "MALE" }
> = {
  "ne-NP": {
    languageCode: "ne-NP",
    ssmlGender: "FEMALE",
  },
  "en-US": {
    languageCode: "en-US",
    name: "en-US-Neural2-C",
    ssmlGender: "FEMALE",
  },
}

// ── Rate limiting (coarse, per IP) ──────────────────────────────────────────

const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 120
const hits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count += 1
  if (entry.count > RATE_MAX_REQUESTS) return true
  if (hits.size > 5_000) {
    for (const [k, v] of hits) {
      if (now > v.resetAt) hits.delete(k)
    }
  }
  return false
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface SpeakRequestBody {
  text?: unknown
  locale?: unknown
  rate?: unknown
  pitch?: unknown
}

export async function GET(): Promise<Response> {
  // Lets the client detect availability without sending any text.
  const enabled = Boolean(process.env.GOOGLE_TTS_API_KEY)
  return Response.json({ enabled }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    // No cloud voice configured — the client falls back to the browser voice.
    return Response.json({ error: "not-configured" }, { status: 501 })
  }

  if (isRateLimited(clientKey(request))) {
    return Response.json(
      { error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  let body: SpeakRequestBody
  try {
    body = (await request.json()) as SpeakRequestBody
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text) {
    return Response.json({ error: "text-required" }, { status: 400 })
  }
  if (text.length > LIMITS.maxChars) {
    return Response.json({ error: "text-too-long" }, { status: 413 })
  }

  const locale = isSupportedSpeechLocale(body.locale) ? body.locale : "ne-NP"
  const voice = VOICE_BY_LOCALE[locale]

  // Web Speech rate/pitch are ~[0.5..2] multipliers. Google speakingRate is
  // [0.25..4] and pitch is semitones [-20..20]; map conservatively.
  const rate = clamp(typeof body.rate === "number" ? body.rate : 1, 0.5, 2)
  const pitchInput = typeof body.pitch === "number" ? body.pitch : 1
  // pitch 1 -> 0 semitones; 0.5 -> -6; 2 -> +6 (gentle, keeps it natural).
  const pitchSemitones = clamp((pitchInput - 1) * 6, -10, 10)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LIMITS.upstreamTimeoutMs)

  try {
    const upstream = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voice.languageCode,
          // `name` is omitted for Nepali on purpose — see VOICE_BY_LOCALE.
          ...(voice.name ? { name: voice.name } : {}),
          ...(voice.ssmlGender ? { ssmlGender: voice.ssmlGender } : {}),
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: rate,
          pitch: pitchSemitones,
        },
      }),
    })

    if (!upstream.ok) {
      // Retry with languageCode only. A named voice is the usual cause of a
      // rejection (names get retired, and ne-NP has no listable names at all),
      // while languageCode alone reliably resolves a correct-language voice.
      const retry = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: voice.languageCode },
          audioConfig: { audioEncoding: "MP3", speakingRate: rate, pitch: pitchSemitones },
        }),
      })
      if (!retry.ok) {
        return Response.json({ error: "synthesis-failed" }, { status: 502 })
      }
      const retryPayload = (await retry.json()) as { audioContent?: unknown }
      if (typeof retryPayload.audioContent !== "string") {
        return Response.json({ error: "synthesis-failed" }, { status: 502 })
      }
      return Response.json(
        { audioContent: retryPayload.audioContent, mimeType: "audio/mpeg" },
        { headers: { "Cache-Control": "public, max-age=86400" } }
      )
    }

    const payload = (await upstream.json()) as { audioContent?: unknown }
    if (typeof payload.audioContent !== "string") {
      return Response.json({ error: "synthesis-failed" }, { status: 502 })
    }

    return Response.json(
      { audioContent: payload.audioContent, mimeType: "audio/mpeg" },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    )
  } catch {
    return Response.json({ error: "synthesis-failed" }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
