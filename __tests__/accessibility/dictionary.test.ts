import { describe, it, expect } from '@jest/globals'
import { normalizeTerm } from '../../lib/dictionary/terms'
import { parseDefinitions } from '../../lib/dictionary/wiktionary'
import { decodeAccessibilityData, DEFAULT_ACCESSIBILITY_PREFERENCES as defaults, preferencesEqual } from '../../lib/types/accessibility'

describe('dictionary boundaries', () => {
  it('preserves case and accents and accepts only a single bounded Latin word', () => {
    expect(normalizeTerm(' “Neurodiversity,” ')).toBe('Neurodiversity')
    expect(normalizeTerm('cafe\u0301')).toBe('café')
    expect(normalizeTerm('well-being')).toBe('well-being')
    for (const word of ['two words', 'https://example.com', '<script>', '123', 'नेपाल', 'a'.repeat(65), 'a\nword']) expect(normalizeTerm(word)).toBeNull()
  })
  it('extracts bounded text, decodes entities, removes executable and reference content', () => {
    const result = parseDefinitions({ en: [{ partOfSpeech: 'Noun', definitions: [{ definition: '<b>A &amp; B</b><script>bad()</script><sup class="reference">[1]</sup><br>Meaning.' }] }] }, 'Word')
    expect(result.senses).toEqual([{ partOfSpeech: 'Noun', definition: 'A & B Meaning.' }])
    expect(result.sourceUrl).toBe('https://en.wiktionary.org/wiki/Word#English')
    expect(result.licenseName).toBe('CC BY-SA 4.0')
    expect(() => parseDefinitions({ fr: [] }, 'Word')).toThrow('No English definition')
    expect(() => parseDefinitions({ en: 'wrong' }, 'Word')).toThrow('invalid response')
  })
  it('migrates V3 without losing preferences and round trips enabled V4 settings', () => {
    const old = { ...defaults, textScale: 1.8, cursorMode: 'guide', guideSticker: 'rocket', dictionaryMode: undefined }
    expect(decodeAccessibilityData({ version: 3, lastUpdated: 'old', preferences: old })).toMatchObject({ textScale: 1.8, cursorMode: 'guide', guideSticker: 'rocket', dictionaryMode: 'off' })
    const enabled = { ...defaults, dictionaryMode: 'hover' as const }
    expect(decodeAccessibilityData({ version: 4, lastUpdated: 'now', preferences: enabled })).toEqual(enabled)
    expect(preferencesEqual(defaults, enabled)).toBe(false)
  })
})
