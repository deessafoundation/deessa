import { JSDOM } from 'jsdom'
import { dictionarySource, type DictionaryResult } from './terms'

export class DictionaryError extends Error {
  constructor(public code: string, message: string, public status = 502, public retryAfter = 0) { super(message) }
}

function plainText(html: string) {
  // fragment() has no browsing context: scripts cannot execute and resources cannot load.
  const fragment = JSDOM.fragment(html)
  fragment.querySelectorAll('script, style, iframe, object, template, .reference, .mw-editsection').forEach(node => node.remove())
  fragment.querySelectorAll('br').forEach(node => node.replaceWith(' '))
  fragment.querySelectorAll('p, div, li').forEach(node => node.append(' '))
  const text = (fragment.textContent ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 600 ? `${text.slice(0, 599).trimEnd()}…` : text
}

export function parseDefinitions(data: unknown, term: string): DictionaryResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new DictionaryError('invalid_response', 'The dictionary returned an invalid response.')
  const english = (data as { en?: unknown }).en
  if (english === undefined || (Array.isArray(english) && !english.length)) throw new DictionaryError('no_english', 'No English definition is available for this word.', 404)
  if (!Array.isArray(english)) throw new DictionaryError('invalid_response', 'The dictionary returned an invalid response.')
  const senses: DictionaryResult['senses'] = []
  for (const entry of english) {
    if (!entry || typeof entry.partOfSpeech !== 'string' || !Array.isArray(entry.definitions)) continue
    for (const sense of entry.definitions) {
      if (typeof sense?.definition !== 'string') continue
      const definition = plainText(sense.definition)
      if (definition) senses.push({ partOfSpeech: plainText(entry.partOfSpeech).slice(0, 80), definition })
      if (senses.length === 3) break
    }
    if (senses.length === 3) break
  }
  if (!senses.length) throw new DictionaryError('invalid_response', 'The dictionary returned an invalid response.')
  return { term, language: 'en', senses, sourceUrl: dictionarySource(term), licenseName: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }
}

const cache = new Map<string, { expires: number; value: DictionaryResult | DictionaryError }>()
const pending = new Map<string, Promise<DictionaryResult>>()
let cooldownUntil = 0
let windowStart = 0
let requests = 0

async function readJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader()
  if (!reader || !response.headers.get('content-type')?.includes('json')) throw new DictionaryError('invalid_response', 'The dictionary returned an invalid response.')
  const decoder = new TextDecoder()
  let size = 0, text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 512 * 1024) throw new DictionaryError('invalid_response', 'The dictionary response was too large.')
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally { await reader.cancel().catch(() => {}) }
}

async function fetchDefinition(term: string) {
  const signal = AbortSignal.timeout(8000)
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com')
  const candidates = term === term.toLowerCase() ? [term] : [term, term.toLowerCase()]
  for (const candidate of candidates) {
    if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); requests = 0 }
    if (++requests > 120) throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', 429, 60)
    const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(candidate)}`, {
      headers: { Accept: 'application/json', 'User-Agent': `DeessaFoundationDictionary/1.0 (${site.origin}/contact)` },
      signal, redirect: 'error', cache: 'no-store',
    })
    if (response.status === 404) { await response.body?.cancel(); continue }
    if (response.status === 429 || response.status === 503) {
      const retry = response.headers.get('retry-after')
      const seconds = retry && /^\d+$/.test(retry) ? Number(retry) : retry ? Math.ceil((Date.parse(retry) - Date.now()) / 1000) : 5
      const wait = Number.isFinite(seconds) ? Math.max(5, seconds) : 5
      cooldownUntil = Date.now() + wait * 1000
      await response.body?.cancel()
      throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', response.status, wait)
    }
    if (!response.ok) { await response.body?.cancel(); throw new DictionaryError('unavailable', 'Dictionary is temporarily unavailable.', 503) }
    return parseDefinitions(await readJson(response), candidate)
  }
  throw new DictionaryError('not_found', 'No definition was found for this word.', 404)
}

export async function lookupDefinition(term: string): Promise<DictionaryResult> {
  const cached = cache.get(term)
  if (cached && cached.expires > Date.now()) {
    if (cached.value instanceof DictionaryError) throw cached.value
    return cached.value
  }
  cache.delete(term)
  const existing = pending.get(term)
  if (existing) return existing
  if (cooldownUntil > Date.now()) throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', 429, Math.ceil((cooldownUntil - Date.now()) / 1000))
  // ponytail: limits/cache are per process; the route also uses the existing distributed limiter when configured.
  if (pending.size >= 3) throw new DictionaryError('rate_limited', 'Dictionary is busy. Please try again shortly.', 429, 5)
  const remember = (value: DictionaryResult | DictionaryError, seconds: number) => {
    if (cache.size >= 500) cache.delete(cache.keys().next().value!)
    cache.set(term, { value, expires: Date.now() + seconds * 1000 })
  }
  const job = fetchDefinition(term).then(result => { remember(result, 86400); return result }).catch(error => {
    if (error instanceof DictionaryError) { if (error.status === 404) remember(error, 300); throw error }
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new DictionaryError('timeout', 'Dictionary took too long to respond. Please try again.', 504)
    throw new DictionaryError('unavailable', 'Dictionary is temporarily unavailable.', 503)
  }).finally(() => { pending.delete(term) })
  pending.set(term, job)
  return job
}
