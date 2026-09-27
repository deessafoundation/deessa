import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { JSDOM } from 'jsdom'
import { selectedWord } from '../../lib/dictionary/selection'
import { dictionaryAllowedOnPath } from '../../lib/dictionary/terms'

let dom: JSDOM
beforeEach(() => {
  dom = new JSDOM('<main id="main-content"><p id="word">neurodiversity</p><p id="mixed">neuro<span data-dictionary-exclude>diversity</span></p><form><p id="private">private</p></form><p hidden id="hidden">hidden</p><p id="joined">neuro<input aria-label="secret">diversity</p></main>')
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, NodeFilter: dom.window.NodeFilter })
})
afterEach(() => { dom.window.close(); Reflect.deleteProperty(globalThis, 'window'); Reflect.deleteProperty(globalThis, 'document'); Reflect.deleteProperty(globalThis, 'NodeFilter') })

function select(id: string) {
  const range = document.createRange()
  range.selectNodeContents(document.getElementById(id)!)
  const selection = window.getSelection()!
  selection.removeAllRanges(); selection.addRange(range)
  return selectedWord(selection, document.getElementById('main-content')!)
}

describe('automatic lookup privacy', () => {
  it('looks up public text but rejects hidden, form and partially excluded selections', () => {
    expect(select('word')?.term).toBe('neurodiversity')
    for (const id of ['private', 'mixed', 'hidden', 'joined']) expect(select(id)).toBeNull()
  })
  it('excludes sensitive public routes without excluding ordinary content', () => {
    for (const path of ['/donate', '/donate/success', '/complete-payment', '/payments/khalti/return', '/verify/abc', '/conference/register/success', '/events/example/register', '/admin']) expect(dictionaryAllowedOnPath(path)).toBe(false)
    for (const path of ['/our-story', '/support', '/conference', '/events/example']) expect(dictionaryAllowedOnPath(path)).toBe(true)
  })
})
