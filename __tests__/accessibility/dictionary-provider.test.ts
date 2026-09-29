import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { lookupDefinition } from '../../lib/dictionary/wiktionary'

const payload = { en: [{ partOfSpeech: 'Noun', definitions: [{ definition: 'A <b>definition</b>.' }] }] }
afterEach(() => jest.restoreAllMocks())

describe('Wiktionary failure and cache behaviour', () => {
  it('deduplicates, caches and falls back to lowercase only after a genuine miss', async () => {
    const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 404 })).mockResolvedValueOnce(Response.json(payload))
    const [first, second] = await Promise.all([lookupDefinition('Uppercase'), lookupDefinition('Uppercase')])
    expect(first).toEqual(second)
    expect(first.term).toBe('uppercase')
    expect(await lookupDefinition('Uppercase')).toEqual(first)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][0]).toBe('https://en.wiktionary.org/api/rest_v1/page/definition/Uppercase')
  })
  it('does not cache a broken response as a missing definition', async () => {
    const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json({ en: 'invalid' })).mockResolvedValueOnce(Response.json(payload))
    await expect(lookupDefinition('recoverable')).rejects.toMatchObject({ code: 'invalid_response', status: 502 })
    expect((await lookupDefinition('recoverable')).senses).toHaveLength(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('caches a genuine miss, distinguishes timeouts and honors rate-limit cooldown', async () => {
    const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 404 }))
    await expect(lookupDefinition('nonexistentword')).rejects.toMatchObject({ code: 'not_found' })
    await expect(lookupDefinition('nonexistentword')).rejects.toMatchObject({ code: 'not_found' })
    expect(fetcher).toHaveBeenCalledTimes(1)
    fetcher.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'))
    await expect(lookupDefinition('timedout')).rejects.toMatchObject({ code: 'timeout', status: 504 })
    fetcher.mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '10' } }))
    await expect(lookupDefinition('busy')).rejects.toMatchObject({ code: 'rate_limited', retryAfter: 10 })
    await expect(lookupDefinition('another')).rejects.toMatchObject({ code: 'rate_limited' })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
})
