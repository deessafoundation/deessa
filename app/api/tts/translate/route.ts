// ── Translation Endpoint (English → Nepali) ─────────────────────────────────
// Used by the accessibility reading mode: the site is authored in English, so
// when a visitor chooses नेपाली the extracted section text is translated here
// before it is spoken.
//
// Why this runs on the server and not in the browser:
//  - the upstream endpoints send no CORS headers, so a direct fetch fails;
//  - one process-level cache serves every visitor, instead of each browser
//    paying for the same translation;
//  - if a keyed provider is adopted later, its credential stays server-only
//    and no client code has to change.
//
// Privacy: only text already extracted from the PUBLIC page is accepted. The
// extractor excludes password, payment and other sensitive fields before this
// route is ever reached, and raw content is never logged here.

import { chunkText } from "@/lib/tts/text-normalizer"

/** Only English → Nepali is offered today. */
const SOURCE_LANG = "en"
const TARGET_LANG = "ne"

const LIMITS = {
  /** Max sections accepted in one request. */
  maxTexts: 400,
  /** Text longer than this is not translated; it is returned untranslated. */
  maxCharsPerText: 20_000,
  /** Max characters across the whole request. */
  maxTotalChars: 200_000,
  /** Upstream URL length is the real constraint, so keep pieces small. */
  maxCharsPerUpstreamCall: 700,
  /**
   * Newline-packed batching. Many sections share ONE upstream call, which is
   * what makes a whole page translatable instead of just the first screenful:
   * a 150-section page becomes ~10 calls rather than 150, so the free endpoint
   * is not rate-limited part-way down the page.
   */
  batchMaxChars: 1_600,
  batchMaxItems: 20,
  /** Parallel upstream calls. Kept low: these are free, shared endpoints. */
  concurrency: 3,
  upstreamTimeoutMs: 10_000,
} as const

/**
 * Process-level translation cache. Bounded, insertion-ordered eviction.
 * Holds only public page text, never anything visitor-specific.
 */
const CACHE_LIMIT = 8_000
const cache = new Map<string, string>()
const LATIN_LETTERS = /[A-Za-z]/g
const DEVANAGARI_CHARACTERS = /[\u0900-\u097F]/g

/** A provider can return the English source unchanged while reporting success. */
function isNepaliResult(source: string, translated: string): boolean {
  if (!translated.trim()) return false
  const sourceLatin = (source.match(LATIN_LETTERS) ?? []).length
  if (sourceLatin > 0 && translated.trim().toLowerCase() === source.trim().toLowerCase()) {
    return false
  }
  if (sourceLatin < 20) return true
  const translatedLatin = (translated.match(LATIN_LETTERS) ?? []).length
  const translatedNepali = (translated.match(DEVANAGARI_CHARACTERS) ?? []).length
  return translatedNepali > translatedLatin
}

function cacheGet(key: string): string | undefined {
  return cache.get(key)
}

function cacheSet(key: string, value: string): void {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, value)
  while (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

// ── Rate limiting ───────────────────────────────────────────────────────────
// Coarse per-IP budget. The upstream providers are free and shared, so the
// point is to stop one client from burning the whole allowance.

const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 30
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

  // Opportunistic cleanup so the map cannot grow without bound.
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

// ── Upstream providers ──────────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(),
    LIMITS.upstreamTimeoutMs
  )
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Google's public web-translate endpoint. No key, best Nepali quality of the
 * free options. It is undocumented, so treat any shape mismatch as a failure
 * and let the caller fall through to the next provider.
 *
 * Response shape: [[[translated, source, ...], ...], ...]
 */
async function translateViaGoogle(text: string): Promise<string | null> {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${SOURCE_LANG}&tl=${TARGET_LANG}&dt=t` +
    `&q=${encodeURIComponent(text)}`

  const response = await fetchWithTimeout(url)
  if (!response.ok) return null

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null

  const parts: string[] = []
  for (const segment of payload[0] as unknown[]) {
    if (Array.isArray(segment) && typeof segment[0] === "string") {
      parts.push(segment[0])
    }
  }
  const joined = parts.join("").trim()
  return joined.length > 0 ? joined : null
}

/**
 * MyMemory translation memory. Documented free tier, no key. Quality is below
 * Google's for Nepali, so it is only a fallback.
 */
async function translateViaMyMemory(text: string): Promise<string | null> {
  const url =
    `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(text)}` +
    `&langpair=${SOURCE_LANG}|${TARGET_LANG}`

  const response = await fetchWithTimeout(url)
  if (!response.ok) return null

  const payload: unknown = await response.json()
  if (typeof payload !== "object" || payload === null) return null

  const data = (payload as { responseData?: { translatedText?: unknown } })
    .responseData
  const translated = data?.translatedText
  if (typeof translated !== "string") return null

  const trimmed = translated.trim()
  // MyMemory reports quota/errors inside the success field as upper-case text.
  if (!trimmed || trimmed.startsWith("MYMEMORY WARNING")) return null
  return trimmed
}

const PROVIDERS: Array<(text: string) => Promise<string | null>> = [
  translateViaGoogle,
  translateViaMyMemory,
]

/** Translate one piece, trying each provider in order. */
async function translatePiece(text: string): Promise<string | null> {
  for (const provider of PROVIDERS) {
    try {
      const result = await provider(text)
      if (result && isNepaliResult(text, result)) return result
    } catch {
      // Network error, timeout or malformed payload: try the next provider.
    }
  }
  return null
}

/**
 * Translate one section. Long text is split at sentence boundaries first,
 * because the upstream endpoints are URL-length bound. A single failed piece
 * fails the whole section, so a section is never half-English.
 */
async function translateSection(text: string): Promise<string | null> {
  const pieces =
    text.length <= LIMITS.maxCharsPerUpstreamCall
      ? [text]
      : chunkText(text, LIMITS.maxCharsPerUpstreamCall)

  const out: string[] = []
  for (const piece of pieces) {
    const translated = await translatePiece(piece)
    if (!translated) return null
    out.push(translated)
  }
  return out.join(" ").trim()
}

/**
 * Translate MANY short sections in a single upstream call by packing them as
 * newline-separated lines, which the endpoint preserves in its output.
 *
 * Returns `null` when the line count comes back different from what went in —
 * the engine merged or split something and the results can no longer be
 * mapped to their sources. Alignment is verified rather than assumed, because
 * silently shifting translations onto the wrong sections would be far worse
 * than falling back to one call per section.
 */
async function translateBatchViaGoogle(
  texts: string[]
): Promise<string[] | null> {
  const joined = texts.join("\n")
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${SOURCE_LANG}&tl=${TARGET_LANG}&dt=t` +
    `&q=${encodeURIComponent(joined)}`

  const response = await fetchWithTimeout(url)
  if (!response.ok) return null

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null

  const parts: string[] = []
  for (const segment of payload[0] as unknown[]) {
    if (Array.isArray(segment) && typeof segment[0] === "string") {
      parts.push(segment[0])
    }
  }

  const lines = parts.join("").split("\n")
  if (lines.length !== texts.length) return null

  const trimmed = lines.map((line) => line.trim())
  if (trimmed.some((line, index) => !isNepaliResult(texts[index]!, line))) return null
  return trimmed
}

/** Group texts into newline-packable batches. Long or multi-line text is solo. */
function packBatches(texts: string[]): string[][] {
  const batches: string[][] = []
  let current: string[] = []
  let chars = 0

  for (const text of texts) {
    // A text containing a newline would break line-alignment, and a long one
    // needs sentence chunking, so both are translated on their own.
    if (text.includes("\n") || text.length > LIMITS.batchMaxChars) {
      if (current.length > 0) {
        batches.push(current)
        current = []
        chars = 0
      }
      batches.push([text])
      continue
    }

    const wouldExceed =
      current.length >= LIMITS.batchMaxItems ||
      chars + text.length + 1 > LIMITS.batchMaxChars
    if (current.length > 0 && wouldExceed) {
      batches.push(current)
      current = []
      chars = 0
    }
    current.push(text)
    chars += text.length + 1
  }
  if (current.length > 0) batches.push(current)
  return batches
}

/**
 * Translate a list of unique sources, packing where possible and degrading
 * gracefully: batch → per-text → null. A null means "keep the English".
 */
async function translateMany(
  sources: string[]
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>()
  const batches = packBatches(sources)

  await runPool(batches, LIMITS.concurrency, async (group) => {
    // Single-item groups skip the packing attempt entirely.
    if (group.length > 1) {
      try {
        const batched = await translateBatchViaGoogle(group)
        if (batched) {
          group.forEach((source, index) => out.set(source, batched[index]!))
          return
        }
      } catch {
        // Fall through to per-text translation below.
      }
    }

    for (const source of group) {
      if (source.length > LIMITS.maxCharsPerText) {
        out.set(source, null)
        continue
      }
      try {
        const translated = await translateSection(source)
        out.set(source, translated && isNepaliResult(source, translated) ? translated : null)
      } catch {
        out.set(source, null)
      }
    }
  })

  return out
}

/** Resolve tasks with bounded parallelism, preserving input order. */
async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++
        results[index] = await worker(items[index]!)
      }
    }
  )

  await Promise.all(runners)
  return results
}

// ── Route ───────────────────────────────────────────────────────────────────

interface TranslateRequestBody {
  texts?: unknown
  target?: unknown
}

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited(clientKey(request))) {
    return Response.json(
      { error: "rate-limited" },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  let body: TranslateRequestBody
  try {
    body = (await request.json()) as TranslateRequestBody
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 })
  }

  // Target is validated against an allowlist rather than passed through.
  if (body.target !== undefined && body.target !== TARGET_LANG) {
    return Response.json({ error: "unsupported-target" }, { status: 400 })
  }

  const raw = body.texts
  if (!Array.isArray(raw)) {
    return Response.json({ error: "texts-required" }, { status: 400 })
  }
  if (raw.length > LIMITS.maxTexts) {
    return Response.json({ error: "too-many-texts" }, { status: 413 })
  }

  const texts: string[] = []
  let totalChars = 0
  for (const entry of raw) {
    if (typeof entry !== "string") {
      return Response.json({ error: "texts-must-be-strings" }, { status: 400 })
    }
    totalChars += entry.length
    texts.push(entry)
  }
  if (totalChars > LIMITS.maxTotalChars) {
    return Response.json({ error: "payload-too-large" }, { status: 413 })
  }

  // Unique, uncached sources only — a page repeats plenty of short strings,
  // and the free upstream allowance is the scarce resource.
  const sources: string[] = []
  const seen = new Set<string>()
  for (const text of texts) {
    if (!text.trim()) continue
    const cached = cacheGet(`${TARGET_LANG}::${text}`)
    if (cached !== undefined && isNepaliResult(text, cached)) continue
    if (seen.has(text)) continue
    seen.add(text)
    sources.push(text)
  }

  if (sources.length > 0) {
    const fresh = await translateMany(sources)
    for (const [source, translated] of fresh) {
      if (translated && isNepaliResult(source, translated)) {
        cacheSet(`${TARGET_LANG}::${source}`, translated)
      }
    }
  }

  let failed = 0
  const translations = texts.map((text) => {
    const cached = cacheGet(`${TARGET_LANG}::${text}`)
    if (cached !== undefined && isNepaliResult(text, cached)) return cached
    failed += 1
    // null tells the client to stop Nepali playback and offer a retry.
    return null
  })

  return Response.json(
    { translations, failed, target: TARGET_LANG },
    {
      // Public page content, safe to cache at the edge; the in-process cache
      // already absorbs most repeats.
      headers: { "Cache-Control": "public, max-age=3600" },
    }
  )
}
