import { describe, it, expect } from '@jest/globals'
import { DEFAULT_ACCESSIBILITY_PREFERENCES as defaults, ACCESSIBILITY_PRESETS, decodeAccessibilityData, validatePreferences, preferencesEqual, nextCursorMode, nextContrastMode, nextFontFamily } from '../../lib/types/accessibility'

describe('accessibility V3 compatibility', () => {
  it.each([true, false])('migrates V2 contrast %s without losing unrelated preferences', highContrast => {
    const preferences = { textScale: 1.7, fontFamily: 'system', highContrast, reduceMotion: true, sensoryFriendly: false, linkHighlight: true, lineSpacing: null, letterSpacing: 0.08, readingMode: true }
    const result = decodeAccessibilityData({ version: 2, preferences, lastUpdated: 'old' })!
    const { highContrast: legacy, ...preserved } = preferences
    expect(result).toEqual({ ...preserved, contrastMode: legacy ? 'high' : 'normal', cursorMode: 'off', guideSticker: 'butterfly', dictionaryMode: 'off', bigCursor: defaults.bigCursor, widgetPosition: defaults.widgetPosition })
    expect(result).not.toHaveProperty('highContrast')
  })
  it('migrates V1 font and scale', () => {
    const result = decodeAccessibilityData({ version: '1.0', lastUpdated: 'old', preferences: { ...defaults, textScale: 0.8, dyslexiaFont: true, highContrast: true, lineSpacing: 1.7 } })!
    expect(result).toMatchObject({ textScale: 1, fontFamily: 'opendyslexic', contrastMode: 'high', cursorMode: 'off', lineSpacing: 1.7 })
  })
  it('round-trips V3 and preserves null spacing', () => {
    const preferences = { ...defaults, contrastMode: 'negative' as const, cursorMode: 'guide' as const }
    expect(decodeAccessibilityData(JSON.parse(JSON.stringify({ version: 3, preferences, lastUpdated: 'now' })))).toEqual(preferences)
  })
  it('rejects unsupported data and sanitizes invalid enums', () => {
    for (const value of [null, 'bad', {}, { version: 20, preferences: {} }]) expect(decodeAccessibilityData(value)).toBeNull()
    const result = decodeAccessibilityData({ version: 3, lastUpdated: 'now', preferences: { ...defaults, contrastMode: 'bad', cursorMode: 'bad', textScale: NaN } })!
    expect(result).toEqual(defaults)
  })
  it('includes both new settings in equality and defaults', () => {
    expect(preferencesEqual(defaults, { ...defaults, cursorMode: 'mask' })).toBe(false)
    expect(preferencesEqual(defaults, { ...defaults, contrastMode: 'negative' })).toBe(false)
    expect(validatePreferences(defaults)).toEqual(defaults)
    expect(ACCESSIBILITY_PRESETS.lowVision.contrastMode).toBe('high')
    for (const preset of Object.values(ACCESSIBILITY_PRESETS)) expect(preset.cursorMode).toBe('off')
  })
  it('cycles exactly and returns to off', () => {
    expect(['off', 'mask', 'guide'].map(mode => nextCursorMode(mode as typeof defaults.cursorMode))).toEqual(['mask', 'guide', 'off'])
  })
})

it('cycles contrast and fonts and migrates the retired inverted palette', () => {
  expect(nextContrastMode('normal')).toBe('high')
  expect(nextContrastMode('high')).toBe('negative')
  expect(nextContrastMode('negative')).toBe('normal')
  expect(nextFontFamily('default')).toBe('system')
  expect(nextFontFamily('system')).toBe('opendyslexic')
  expect(nextFontFamily('opendyslexic')).toBe('default')
  expect(decodeAccessibilityData({ version: 3, lastUpdated: 'old', preferences: { ...defaults, contrastMode: 'inverted' } })?.contrastMode).toBe('high')
})

it('persists guide friend, defaults old settings and validates unknown stickers', () => {
  const saved = { version: 3, lastUpdated: 'now', preferences: { ...defaults, guideSticker: 'rocket' } }
  expect(decodeAccessibilityData(saved)?.guideSticker).toBe('rocket')
  expect(decodeAccessibilityData({ ...saved, preferences: { guideSticker: 'unknown' } })?.guideSticker).toBe('butterfly')
  expect(decodeAccessibilityData({ ...saved, preferences: { cursorMode: 'guide' } })?.guideSticker).toBe('butterfly')
  expect(preferencesEqual(defaults, { ...defaults, guideSticker: 'star' })).toBe(false)
})
