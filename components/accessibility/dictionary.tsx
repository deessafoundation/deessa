'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { BookOpen, X, Search, Volume2 } from 'lucide-react'
import { useAccessibility } from '@/lib/hooks/use-accessibility'
import type { DictionaryMode } from '@/lib/types/accessibility'
import { dictionaryAllowedOnPath, dictionarySource, normalizeTerm, type DictionaryResult } from '@/lib/dictionary/terms'
import { useDictionaryTriggers } from './use-dictionary-triggers'
import styles from './dictionary.module.css'

type View = { term: string; anchor?: DOMRect; loading?: boolean; result?: DictionaryResult; message?: string; retry?: boolean }

export function AccessibilityDictionary() {
  const { preferences, isLoading } = useAccessibility()
  const path = usePathname()
  if (isLoading || preferences.dictionaryMode === 'off' || !dictionaryAllowedOnPath(path)) return null
  return <DictionarySession key={`${path}:${preferences.dictionaryMode}`} mode={preferences.dictionaryMode} />
}

function DictionarySession({ mode }: { mode: DictionaryMode }) {
  const [view, setView] = useState<View | null>(null)
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const cooldown = useRef(0)
  const card = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const abort = useRef<AbortController | null>(null)
  const serial = useRef(0)
  const previousFocus = useRef<HTMLElement | null>(null)
  const focusIntent = useRef<'input' | 'result' | null>(null)
  const cache = useRef(new Map<string, { value: DictionaryResult; expires: number }>())

  const close = useCallback(() => {
    serial.current++; abort.current?.abort()
    if (card.current?.contains(document.activeElement)) {
      const target = previousFocus.current?.isConnected ? previousFocus.current : launcher.current
      target?.focus()
    }
    focusIntent.current = null
    setView(null)
  }, [])

  const speak = useCallback((text: string, rate = 1) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const readWord = useCallback(() => {
    if (!view?.term) return
    if (!view.result) {
      speak(view.term)
      return
    }
    const fullText = `${view.term}. ` + view.result.senses.map(s => `${s.partOfSpeech}. ${s.definition}`).join(' ')
    speak(fullText)
  }, [view, speak])

  const spellWord = useCallback(() => {
    if (view?.term) speak(view.term.split('').join(', '), 0.6)
  }, [view, speak])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const open = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement
    focusIntent.current = 'input'
    setView(current => current ?? { term: '' })
    requestAnimationFrame(() => field.current?.focus())
  }, [])

  const lookup = useCallback(async (raw: string, anchor?: DOMRect) => {
    const requestId = ++serial.current
    abort.current?.abort()
    const term = normalizeTerm(raw)
    setInput(term ?? raw)
    if (!term) { setView({ term: '', message: 'Select or enter one English word, up to 64 characters.' }); return }
    if (cooldown.current > Date.now()) {
      setView({ term, anchor, message: 'Please wait a moment before trying again.', retry: true }); return
    }
    const cached = cache.current.get(term)
    if (cached && cached.expires > Date.now()) { setView({ term, anchor, result: cached.value }); return }
    if (!navigator.onLine) { setView({ term, anchor, message: 'You appear to be offline. Reconnect to look up this word.', retry: true }); return }
    const controller = new AbortController()
    abort.current = controller
    const timeout = setTimeout(() => controller.abort(), 10_000)
    setView({ term, anchor, loading: true })
    try {
      const response = await fetch(`/api/dictionary?term=${encodeURIComponent(term)}`, { signal: controller.signal, cache: 'no-store' })
      const data = await response.json()
      if (requestId !== serial.current) return
      if (!response.ok) {
        if (typeof data.retryAfter === 'number' && data.retryAfter > 0) { cooldown.current = Date.now() + data.retryAfter * 1000; setWaiting(true) }
        setView({ term, anchor, message: typeof data.message === 'string' ? data.message : 'Dictionary is temporarily unavailable.', retry: data.code !== 'disabled' && response.status !== 404 })
        return
      }
      if (!Array.isArray(data.senses) || !data.senses.length) throw new Error('Invalid dictionary result')
      if (cache.current.size >= 100) cache.current.delete(cache.current.keys().next().value!)
      cache.current.set(term, { value: data, expires: Date.now() + 86400_000 })
      setView({ term, anchor, result: data })
    } catch {
      if (requestId === serial.current) setView({ term, anchor, message: controller.signal.aborted ? 'Dictionary took too long to respond. Please try again.' : 'Dictionary could not connect. Please try again.', retry: true })
    } finally { clearTimeout(timeout) }
  }, [])

  useDictionaryTriggers(mode, lookup, close, open)
  useEffect(() => () => { serial.current++; abort.current?.abort() }, [])
  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => setWaiting(false), Math.min(2_147_483_647, Math.max(0, cooldown.current - Date.now())))
    return () => clearTimeout(timer)
  }, [waiting])
  useLayoutEffect(() => {
    if (!view || !card.current) return
    const element = card.current
    const position = () => {
      const viewport = window.visualViewport
      const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0
      const width = viewport?.width ?? innerWidth, height = viewport?.height ?? innerHeight
      element.style.maxHeight = `${Math.max(100, height - 32)}px`
      element.style.width = `${Math.min(384, width - 32)}px`
      const bounds = element.getBoundingClientRect()
      element.style.left = `${Math.max(left + 16, Math.min(view.anchor?.left ?? left + 16, left + width - bounds.width - 16))}px`
      element.style.top = `${Math.max(top + 16, Math.min(view.anchor ? view.anchor.bottom + 8 : top + height - bounds.height - 96, top + height - bounds.height - 16))}px`
    }
    position()
    const observer = new ResizeObserver(position)
    observer.observe(element)
    window.addEventListener('resize', position)
    window.visualViewport?.addEventListener('resize', position)
    window.visualViewport?.addEventListener('scroll', position)
    if (focusIntent.current === 'result' && !view.loading) { heading.current?.focus(); focusIntent.current = null }
    return () => { observer.disconnect(); window.removeEventListener('resize', position); window.visualViewport?.removeEventListener('resize', position); window.visualViewport?.removeEventListener('scroll', position) }
  }, [view])

  return createPortal(<div data-dictionary-ui="true">
    <button ref={launcher} type="button" className={styles.launcher} onClick={open} aria-expanded={Boolean(view)} aria-controls="dictionary-card">
      <BookOpen size={18} aria-hidden="true" />{view?.result ? 'Read definition' : 'Dictionary'}
    </button>
    {view && <div ref={card} id="dictionary-card" className={styles.card} role="region" aria-label="English dictionary">
      <div className={styles.cardHeaderFlex}>
        <form onSubmit={event => { event.preventDefault(); focusIntent.current = 'result'; void lookup(input) }} className={styles.searchForm}>
          <label htmlFor="dictionary-word" className={styles.srOnly}>Look up a word</label>
          <div className={styles.searchContainer}>
            <input ref={field} id="dictionary-word" placeholder={view.term || "Type a word..."} value={input} onChange={event => setInput(event.target.value)} maxLength={128} autoComplete="off" autoCapitalize="none" spellCheck={false} />
            <button type="submit" disabled={waiting} className={styles.searchBtn} aria-label="Search"><Search size={22} aria-hidden="true" /></button>
          </div>
        </form>
        <button type="button" onClick={close} aria-label="Close dictionary" className={styles.closeBtn}><X size={24} aria-hidden="true" /></button>
      </div>
      
      <div role="status" aria-live="polite" className={styles.status}>{view.loading ? 'Looking up…' : view.message || (view.result ? '' : 'Select a word on the page to see its meaning.')}</div>
      {view.result && <>
        <div className={styles.definitions}>
          {Object.entries(
            view.result.senses.reduce((acc, sense) => {
              if (!acc[sense.partOfSpeech]) acc[sense.partOfSpeech] = []
              acc[sense.partOfSpeech].push(sense.definition)
              return acc
            }, {} as Record<string, string[]>)
          ).map(([pos, defs]) => (
            <div key={pos} className={styles.senseGroup}>
              <p className={styles.inlineDef}>
                <strong className={styles.wordAndPos}>{view.term} ({pos}):</strong> {defs[0]}
              </p>
              {defs.slice(1).map((def, i) => (
                <p key={i} className={styles.inlineDefCont}>
                  {def}
                </p>
              ))}
            </div>
          ))}
        </div>
        
        <div className={styles.actionsBox}>
          <button type="button" className={styles.readBtn} onClick={readWord} aria-label="Read word aloud">
             <span className={styles.iconWrapper}><Volume2 size={16} aria-hidden="true" /></span> Read
          </button>
          <button type="button" className={styles.spellBtn} onClick={spellWord} aria-label="Spell word aloud">
             <span className={styles.iconWrapper}><Volume2 size={16} aria-hidden="true" /></span> Spell
          </button>
        </div>
        <div className={styles.source}>
          <a href={dictionarySource(view.result.term)} target="_blank" rel="noopener noreferrer">Read more on Wiktionary ↗</a>
        </div>
      </>}
      {view.message && <div className={styles.actions}>
        {view.retry && <button type="button" disabled={waiting} onClick={() => { focusIntent.current = 'result'; void lookup(view.term) }}>{waiting ? 'Please wait…' : 'Try again'}</button>}
      </div>}
    </div>}
  </div>, document.body)
}
