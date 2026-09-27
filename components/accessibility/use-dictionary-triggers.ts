'use client'

import { useEffect } from 'react'
import type { DictionaryMode } from '@/lib/types/accessibility'
import { modalIsOpen, selectedWord, wordAtPoint } from '@/lib/dictionary/selection'

export function useDictionaryTriggers(mode: DictionaryMode, lookup: (term: string, anchor?: DOMRect) => void, close: () => void, open: () => void) {
  useEffect(() => {
    const root = document.getElementById('main-content')
    if (!root) return
    let selectionTimer: ReturnType<typeof setTimeout>, hoverTimer: ReturnType<typeof setTimeout>
    let dragging = false
    let lastSelection: Range | null = null, lastHover: Range | null = null
    const same = (a: Range | null, b: Range) => a?.startContainer === b.startContainer && a.startOffset === b.startOffset && a.endContainer === b.endContainer && a.endOffset === b.endOffset
    const select = () => {
      clearTimeout(selectionTimer)
      clearTimeout(hoverTimer)
      if (dragging || modalIsOpen()) return
      selectionTimer = setTimeout(() => {
        if (dragging || modalIsOpen()) return
        const selection = selectedWord(window.getSelection(), root)
        if (!selection) { lastSelection = null; return }
        if (same(lastSelection, selection.range)) return
        lastSelection = selection.range
        lookup(selection.term, selection.range.getBoundingClientRect())
      }, 350)
    }
    const down = (event: PointerEvent) => {
      if ((event.target as Element).closest('[data-dictionary-ui]')) return
      dragging = true
      clearTimeout(hoverTimer); clearTimeout(selectionTimer)
      close()
    }
    const up = () => { dragging = false; select() }
    const move = (event: PointerEvent) => {
      if (mode !== 'hover' || dragging || event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      if ((event.target as Element).closest('[data-dictionary-ui]')) { clearTimeout(hoverTimer); return }
      if (modalIsOpen() || !window.getSelection()?.isCollapsed) { clearTimeout(hoverTimer); return }
      const word = wordAtPoint(event.clientX, event.clientY, root)
      if (!word) { clearTimeout(hoverTimer); lastHover = null; return }
      if (same(lastHover, word.range)) return
      clearTimeout(hoverTimer)
      lastHover = word.range
      hoverTimer = setTimeout(() => { if (!modalIsOpen()) lookup(word.term, word.range.getBoundingClientRect()) }, 600)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { clearTimeout(hoverTimer); clearTimeout(selectionTimer); close() }
    }
    const scroll = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-dictionary-ui]')) return
      clearTimeout(hoverTimer)
      lastHover = null
      if (!document.activeElement?.closest('[data-dictionary-ui]')) close()
    }
    const suspend = () => { if (modalIsOpen()) { clearTimeout(hoverTimer); clearTimeout(selectionTimer); close() } }
    const observer = new MutationObserver(suspend)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-modal', 'aria-hidden', 'inert'] })
    document.addEventListener('selectionchange', select)
    document.addEventListener('pointerdown', down)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('keydown', key)
    document.addEventListener('scroll', scroll, { capture: true, passive: true })
    window.addEventListener('openAccessibilityDictionary', open)
    return () => {
      clearTimeout(selectionTimer); clearTimeout(hoverTimer); observer.disconnect()
      document.removeEventListener('selectionchange', select)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('keydown', key)
      document.removeEventListener('scroll', scroll, true)
      window.removeEventListener('openAccessibilityDictionary', open)
    }
  }, [mode, lookup, close, open])
}
