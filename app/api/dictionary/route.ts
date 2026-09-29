import { createHash } from 'node:crypto'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { normalizeTerm } from '@/lib/dictionary/terms'
import { DictionaryError, lookupDefinition } from '@/lib/dictionary/wiktionary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const clients = new Map<string, { count: number; until: number }>()

export async function GET(request: Request) {
  const started = Date.now()
  try {
    if (process.env.DICTIONARY_ENABLED === 'false') throw new DictionaryError('disabled', 'Dictionary is currently unavailable.', 503)
    if (request.headers.get('sec-fetch-site') === 'cross-site') throw new DictionaryError('forbidden', 'Please use the dictionary on this website.', 403)
    const input = new URL(request.url).searchParams.get('term') ?? ''
    const term = input.length <= 128 ? normalizeTerm(input) : null
    if (!term) throw new DictionaryError('invalid_term', 'Select or enter one English word, up to 64 characters.', 400)

    // Proxy headers are only a client identity when the deployment overwrites them.
    const ip = process.env.VERCEL || process.env.DICTIONARY_TRUST_PROXY === 'true' ? getClientIP(request) : null
    const identity = createHash('sha256').update(ip ?? 'shared').digest('hex').slice(0, 24)
    const now = Date.now()
    for (const [key, value] of clients) if (value.until <= now) clients.delete(key)
    if (!clients.has(identity) && clients.size >= 1000) throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', 429, 60)
    const local = clients.get(identity) ?? { count: 0, until: now + 60_000 }
    clients.set(identity, local)
    if (++local.count > 30) throw new DictionaryError('rate_limited', 'Please wait before looking up another word.', 429, Math.ceil((local.until - now) / 1000))

    const distributed = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    if (distributed) {
      // A lookup can make two upstream requests for a case-sensitive miss.
      for (const [identifier, maxAttempts] of [['dictionary:global', 60], [`dictionary:client:${identity}`, 30]] as const) {
        const limit = await checkRateLimit({ identifier, maxAttempts, windowMinutes: 1 })
        // The shared helper fails open for existing callers; this optional external feature fails closed.
        if (!limit.resetAt) throw new DictionaryError('unavailable', 'Dictionary is temporarily unavailable.', 503)
        if (!limit.allowed) throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', 429, Math.max(5, Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)))
      }
    } else if (process.env.NODE_ENV === 'production' && process.env.DICTIONARY_SINGLE_PROCESS !== 'true') {
      throw new DictionaryError('unavailable', 'Dictionary is temporarily unavailable.', 503)
    }
    const result = await lookupDefinition(term)
    // Explicit in-process provider cache; never cache HTTP errors or bypass the kill switch at a CDN.
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const failure = error instanceof DictionaryError ? error : new DictionaryError('unavailable', 'Dictionary is temporarily unavailable.', 503)
    if (failure.status >= 500) console.warn('dictionary_lookup', { code: failure.code, durationMs: Date.now() - started })
    return Response.json({ code: failure.code, message: failure.message, retryAfter: failure.retryAfter }, {
      status: failure.status,
      headers: { 'Cache-Control': 'no-store', ...(failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {}) },
    })
  }
}
