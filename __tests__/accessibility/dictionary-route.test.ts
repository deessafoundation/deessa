import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { GET } from '../../app/api/dictionary/route'
import { lookupDefinition, DictionaryError } from '../../lib/dictionary/wiktionary'

jest.mock('../../lib/dictionary/wiktionary', () => {
  const original = jest.requireActual<typeof import('../../lib/dictionary/wiktionary')>('../../lib/dictionary/wiktionary')
  return { ...original, lookupDefinition: jest.fn() }
})
jest.mock('../../lib/rate-limit', () => ({ getClientIP: () => null, checkRateLimit: jest.fn(async () => ({ allowed: true, resetAt: new Date(Date.now() + 60000) })) }))
const lookup = jest.mocked(lookupDefinition)
const previous = process.env.DICTIONARY_ENABLED
beforeEach(() => { lookup.mockReset(); delete process.env.DICTIONARY_ENABLED })
afterEach(() => { if (previous === undefined) delete process.env.DICTIONARY_ENABLED; else process.env.DICTIONARY_ENABLED = previous })

describe('dictionary route', () => {
  it('rejects sentences and disabled lookups before contacting the provider', async () => {
    expect((await GET(new Request('http://localhost/api/dictionary?term=two%20words'))).status).toBe(400)
    process.env.DICTIONARY_ENABLED = 'false'
    expect((await GET(new Request('http://localhost/api/dictionary?term=hello'))).status).toBe(503)
    expect(lookup).not.toHaveBeenCalled()
  })
  it('returns actionable failures without caching an outage as a missing word', async () => {
    lookup.mockRejectedValueOnce(new DictionaryError('rate_limited', 'Please wait.', 429, 15))
    const response = await GET(new Request('http://localhost/api/dictionary?term=hello'))
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('15')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toMatchObject({ code: 'rate_limited' })
  })
})
