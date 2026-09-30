"use client"

/**
 * Accessibility Provider (Unified)
 *
 * Single source of truth for all accessibility settings including TTS.
 * Visual prefs (font, contrast, cursor, spacing, …) + TTS state machine
 * in one context — no duplicate providers.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  STORAGE_CONFIG,
  decodeAccessibilityData,
  preferencesEqual,
  validatePreferences,
  type AccessibilityContextValue,
  type AccessibilityPreferences,
  type StoredAccessibilityData,
} from "@/lib/types/accessibility"
import { liveAnnouncer } from "@/lib/utils/accessibility"

import { extractSections, resolveTtsRoot } from "@/lib/tts/content-extractor"
import { getPanelStrings } from "@/lib/tts/i18n"
import { onMediaPlaying, pauseAllNativeMedia } from "@/lib/tts/media-coordinator"
import { findReadingStartIndex } from "@/lib/tts/reading-position"
import { chunkText } from "@/lib/tts/text-normalizer"
import { translateSectionsToNepali } from "@/lib/tts/translator"
import {
  TTS_ATTRIBUTES,
  TTS_EVENTS,
  TTS_LIMITS,
  type SpeechSection,
  type SupportedSpeechLocale,
  type TtsErrorCode,
  type TtsStatus,
  type TtsVoice,
} from "@/lib/tts/types"
import type { CompositeTtsProvider } from "@/lib/tts/providers/composite-tts-provider"

// ── Constants ────────────────────────────────────────────────────────────────

/** Time to let a new route paint before extracting its content. */
const ROUTE_SETTLE_MS = 350
const MUTATION_DEBOUNCE_MS = 500

// ── Context ──────────────────────────────────────────────────────────────────

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const pathname = usePathname()

  // ── Visual preferences state ───────────────────────────────────────────────

  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_ACCESSIBILITY_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const isModified = !preferencesEqual(preferences, DEFAULT_ACCESSIBILITY_PREFERENCES)

  // ── TTS state ─────────────────────────────────────────────────────────────

  const [ttsStatus, setTtsStatus] = useState<TtsStatus>("idle")
  const [ttsIsSupported, setTtsIsSupported] = useState(true)
  const [ttsVoices, setTtsVoices] = useState<TtsVoice[]>([])
  const [ttsHasVoiceForLocale, setTtsHasVoiceForLocale] = useState<boolean | null>(null)
  const [ttsSubstituteVoice, setTtsSubstituteVoice] = useState<{
    name: string
    lang: string
  } | null>(null)
  const [ttsErrorCode, setTtsErrorCode] = useState<TtsErrorCode | null>(null)
  const [ttsTranslationOutcome, setTtsTranslationOutcome] = useState<"none" | "partial" | "failed">("none")
  const [ttsSectionCount, setTtsSectionCount] = useState(0)
  const [ttsCurrentSectionIndex, setTtsCurrentSectionIndex] = useState(-1)

  // Engine + playback refs (not state — mutations don't need re-renders)
  const providerRef = useRef<CompositeTtsProvider | null>(null)
  const sectionsRef = useRef<SpeechSection[]>([])
  const playbackTokenRef = useRef(0)
  const highlightedRef = useRef<HTMLElement | null>(null)
  const pendingRescanRef = useRef(false)

  // Stable refs for long-lived callbacks that must not stale-close over state
  const preferencesRef = useRef(preferences)
  const ttsStatusRef = useRef(ttsStatus)
  const ttsSectionIndexRef = useRef(ttsCurrentSectionIndex)

  useEffect(() => {
    preferencesRef.current = preferences
    ttsStatusRef.current = ttsStatus
    ttsSectionIndexRef.current = ttsCurrentSectionIndex
  }, [preferences, ttsStatus, ttsCurrentSectionIndex])

  // ============================================================================
  // INITIALIZATION — Load from localStorage with migration
  // ============================================================================

  useEffect(() => {
    const load = () => {
      try {
        const systemPrefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        let loaded: AccessibilityPreferences | null = null
        let migrateOldLauncherDefault = false
        for (const storageName of ["localStorage", "sessionStorage"] as const) {
          try {
            const storage = window[storageName]
            const raw = storage.getItem(STORAGE_CONFIG.KEY)
            if (!raw) continue
            const parsed: unknown = JSON.parse(raw)
            loaded = decodeAccessibilityData(parsed)
            if (loaded) {
              migrateOldLauncherDefault =
                (parsed as { version?: unknown }).version === 4 &&
                loaded.widgetPosition === "bottom-right"
              // Back up older accessibility settings before migration.
              if ((parsed as { version?: unknown }).version !== STORAGE_CONFIG.VERSION) {
                try {
                  storage.setItem(STORAGE_CONFIG.KEY + "-pre-v5", raw)
                } catch {
                  // Migration works even when backup storage is full.
                }
              }
              break
            }
          } catch {
            // Try the other storage if denied or malformed.
          }
        }

        const initial = loaded ?? { ...DEFAULT_ACCESSIBILITY_PREFERENCES }
        // Move the old default to the new center-right position once, while preserving
        // an explicit position choice made after this settings version is saved.
        if (migrateOldLauncherDefault) initial.widgetPosition = "middle-right"
        if (systemPrefersReducedMotion) initial.reduceMotion = true
        setPreferences(initial)
      } catch (error) {
        console.error("❌ Failed to load accessibility preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ============================================================================
  // PERSISTENCE — Save to localStorage
  // ============================================================================

  useEffect(() => {
    if (isLoading) return
    try {
      const dataToStore: StoredAccessibilityData = {
        version: STORAGE_CONFIG.VERSION,
        preferences,
        lastUpdated: new Date().toISOString(),
      }
      const serialized = JSON.stringify(dataToStore)
      if (serialized.length > STORAGE_CONFIG.MAX_SIZE) {
        console.error("⚠️ Accessibility data too large for storage")
        liveAnnouncer.announce("Accessibility settings are too large to save.", "assertive")
        return
      }
      try {
        localStorage.setItem(STORAGE_CONFIG.KEY, serialized)
      } catch {
        try {
          sessionStorage.setItem(STORAGE_CONFIG.KEY, serialized)
          liveAnnouncer.announce("Accessibility settings saved for this session only.", "polite")
        } catch {
          liveAnnouncer.announce("Accessibility settings work, but browser storage is unavailable.", "polite")
        }
      }
    } catch (error) {
      console.error("❌ Failed to save accessibility preferences:", error)
      liveAnnouncer.announce("Unable to save accessibility settings.", "assertive")
    }
  }, [preferences, isLoading])

  // ============================================================================
  // CSS VARIABLES — Apply to :root
  // ============================================================================

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-a11y-scope", "public")
    root.style.setProperty("--a11y-text-scale", String(preferences.textScale))

    if (preferences.lineSpacing !== null) {
      root.style.setProperty("--a11y-line-height", String(preferences.lineSpacing))
    } else {
      root.style.removeProperty("--a11y-line-height")
    }

    if (preferences.letterSpacing !== null) {
      root.style.setProperty("--a11y-letter-spacing", `${preferences.letterSpacing}em`)
    } else {
      root.style.removeProperty("--a11y-letter-spacing")
    }

    const animationMultiplier = preferences.sensoryFriendly || preferences.reduceMotion ? 0 : 1
    root.style.setProperty("--a11y-animation-duration", String(animationMultiplier))

    const transitionDuration = preferences.sensoryFriendly || preferences.reduceMotion ? "0ms" : "200ms"
    root.style.setProperty("--a11y-transition-duration", transitionDuration)

    if (preferences.textScale >= 1.5) {
      root.setAttribute("data-text-scale-high", "true")
    } else {
      root.removeAttribute("data-text-scale-high")
    }

    return () => {
      root.removeAttribute("data-a11y-scope")
      root.removeAttribute("data-text-scale-high")
      root.style.removeProperty("--a11y-text-scale")
      root.style.removeProperty("--a11y-line-height")
      root.style.removeProperty("--a11y-letter-spacing")
      root.style.removeProperty("--a11y-animation-duration")
      root.style.removeProperty("--a11y-transition-duration")
    }
  }, [preferences])

  // ============================================================================
  // BODY CLASSES — Apply visual modes
  // ============================================================================

  useEffect(() => {
    const body = document.body
    body.classList.toggle("high-contrast", preferences.contrastMode === "high")
    body.dataset.a11yContrast = preferences.contrastMode
    document.documentElement.dataset.a11yNegative = String(preferences.contrastMode === "negative")
    body.dataset.a11yCursor = preferences.cursorMode
    if (preferences.bigCursor) {
      body.dataset.a11yBigCursor = "true"
    } else {
      delete body.dataset.a11yBigCursor
    }
    body.classList.toggle("reduce-motion", preferences.reduceMotion)
    body.classList.toggle("sensory-friendly", preferences.sensoryFriendly)
    if (preferences.sensoryFriendly && !preferences.reduceMotion) {
      body.classList.add("reduce-motion")
    }
    body.classList.remove("font-default", "font-system", "font-opendyslexic")
    body.classList.add(`font-${preferences.fontFamily}`)
    body.classList.toggle("link-highlight", preferences.linkHighlight)
    body.classList.toggle("reading-mode", preferences.readingMode)

    return () => {
      body.classList.remove(
        "high-contrast",
        "reduce-motion",
        "sensory-friendly",
        "font-default",
        "font-system",
        "font-opendyslexic",
        "link-highlight",
        "reading-mode",
      )
      delete body.dataset.a11yContrast
      delete document.documentElement.dataset.a11yNegative
      delete body.dataset.a11yCursor
      delete body.dataset.a11yBigCursor
    }
  }, [preferences])

  // ============================================================================
  // SYSTEM PREFERENCES LISTENER
  // ============================================================================

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !preferencesRef.current.reduceMotion) {
        setPreferences((prev) => ({ ...prev, reduceMotion: true }))
        liveAnnouncer.announce("Reduced motion enabled based on system preferences", "polite")
      }
    }
    mq.addEventListener("change", handleChange)
    return () => mq.removeEventListener("change", handleChange)
  }, [])

  // ============================================================================
  // TTS — HIGHLIGHTING
  // ============================================================================

  const clearHighlight = useCallback(() => {
    const previous = highlightedRef.current
    if (previous) {
      previous.removeAttribute(TTS_ATTRIBUTES.active)
      highlightedRef.current = null
    }
  }, [])

  const applyHighlight = useCallback(
    (element: HTMLElement, scrollTarget: HTMLElement = element) => {
      clearHighlight()
      if (!preferencesRef.current.ttsHighlight) return
      if (!element.isConnected) return
      element.setAttribute(TTS_ATTRIBUTES.active, "true")
      highlightedRef.current = element
      const rect = scrollTarget.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      if (rect.top >= 0 && rect.bottom <= viewportHeight) return
      const prefersReducedMotion =
        preferencesRef.current.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      scrollTarget.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      })
    },
    [clearHighlight],
  )

  // ============================================================================
  // TTS — ENGINE BOOTSTRAP
  // ============================================================================

  const ensureProvider = useCallback(async (): Promise<CompositeTtsProvider | null> => {
    if (providerRef.current) return providerRef.current
    if (typeof window === "undefined") return null
    if (!("speechSynthesis" in window)) {
      setTtsIsSupported(false)
      setTtsStatus("unsupported")
      return null
    }
    try {
      const { CompositeTtsProvider: Provider } = await import("@/lib/tts/providers/composite-tts-provider")
      const provider = new Provider(["ne-NP"])
      if (!provider.isSupported()) {
        setTtsIsSupported(false)
        setTtsStatus("unsupported")
        return null
      }
      providerRef.current = provider
      return provider
    } catch {
      setTtsIsSupported(false)
      setTtsStatus("unsupported")
      return null
    }
  }, [])

  const refreshTtsVoices = useCallback(
    async (locale: SupportedSpeechLocale) => {
      const provider = await ensureProvider()
      if (!provider) return
      try {
        const [available, resolved] = await Promise.all([
          provider.getVoices(locale),
          provider.describeVoiceFor(locale, preferencesRef.current.ttsVoiceId),
        ])
        setTtsVoices(available)
        setTtsHasVoiceForLocale(resolved !== null)
        setTtsSubstituteVoice(
          resolved?.isScriptSubstitute ? { name: resolved.voiceName, lang: resolved.voiceLang } : null,
        )
      } catch {
        setTtsVoices([])
        setTtsHasVoiceForLocale(false)
        setTtsSubstituteVoice(null)
      }
    },
    [ensureProvider],
  )

  // Idle bootstrap — warm up the engine and pre-load voices for the current
  // locale so the voice dropdown is usable immediately on first panel open.
  useEffect(() => {
    if (isLoading) return
    const locale = preferencesRef.current.ttsLocale
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => {
        void refreshTtsVoices(locale)
      })
      return () => window.cancelIdleCallback?.(handle)
    } else {
      // Fallback for browsers without requestIdleCallback (e.g. Safari <16)
      const timer = setTimeout(() => void refreshTtsVoices(locale), 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, refreshTtsVoices])

  // ============================================================================
  // TTS — CONTENT EXTRACTION
  // ============================================================================

  const ttsRescan = useCallback(() => {
    if (typeof window === "undefined") return
    const result = extractSections({ preferredLocale: preferencesRef.current.ttsLocale })
    sectionsRef.current = result.sections
    setTtsSectionCount(result.sections.length)
    return result
  }, [])

  // ============================================================================
  // TTS — STOP (defined before startPlayback so it can be referenced)
  // ============================================================================

  const ttsStop = useCallback(() => {
    playbackTokenRef.current += 1
    providerRef.current?.stop()
    clearHighlight()
    setTtsCurrentSectionIndex(-1)
    setTtsStatus((prev) => (prev === "unsupported" ? prev : "idle"))
  }, [clearHighlight])

  // ============================================================================
  // TTS — PLAYBACK LOOP
  // ============================================================================

  const startPlayback = useCallback(
    async (startIndex: number) => {
      const token = ++playbackTokenRef.current
      const isCurrent = () => playbackTokenRef.current === token

      providerRef.current?.stop()
      clearHighlight()
      setTtsErrorCode(null)
      setTtsStatus("loading")

      const provider = await ensureProvider()
      if (!provider || !isCurrent()) return

      if (sectionsRef.current.length === 0) ttsRescan()
      if (sectionsRef.current.length === 0) {
        setTtsStatus("error")
        setTtsErrorCode("empty-content")
        return
      }

      pauseAllNativeMedia()

      const preferredLocale = preferencesRef.current.ttsLocale

      // Translate to Nepali if needed. Only sections from the start point on
      // are translated: earlier ones are not about to be spoken, and skipping
      // them saves translation quota and time-to-first-word when reading
      // starts mid-page. "Previous" re-enters here and translates just the
      // one extra section (already-translated ones are skipped by the cache).
      if (preferredLocale === "ne-NP") {
        setTtsStatus("translating")
        let outcome: "none" | "partial" | "failed" = "none"
        const base = sectionsRef.current
        const translateFrom = Math.min(Math.max(0, startIndex), base.length)
        try {
          const result = await translateSectionsToNepali(base.slice(translateFrom))
          if (!isCurrent()) return
          sectionsRef.current = [...base.slice(0, translateFrom), ...result.sections]
          if (result.failed > 0) {
            outcome = result.translated > 0 ? "partial" : "failed"
          }
        } catch {
          if (!isCurrent()) return
          outcome = "failed"
        }
        setTtsTranslationOutcome(outcome)
        if (outcome !== "none") {
          setTtsStatus("error")
          return
        }
        setTtsStatus("loading")
      } else {
        setTtsTranslationOutcome("none")
      }

      const sections = sectionsRef.current

      // Resolve voices for all locales in use
      const localesInUse = new Set(sections.map((s) => s.locale))
      localesInUse.add(preferredLocale)
      const speakable = new Set<SupportedSpeechLocale>()
      for (const locale of localesInUse) {
        const resolved = await provider.describeVoiceFor(
          locale,
          locale === preferredLocale ? preferencesRef.current.ttsVoiceId : null,
        )
        if (!resolved) continue
        speakable.add(locale)
        if (locale === preferredLocale) {
          setTtsSubstituteVoice(
            resolved.isScriptSubstitute ? { name: resolved.voiceName, lang: resolved.voiceLang } : null,
          )
        }
      }
      if (!isCurrent()) return

      setTtsHasVoiceForLocale(speakable.has(preferredLocale))

      const playableSections = sections.filter((s) => speakable.has(s.locale))
      if (playableSections.length === 0) {
        setTtsStatus("error")
        setTtsErrorCode("no-voice")
        return
      }

      // Section loop
      for (let index = Math.max(0, startIndex); index < sections.length; index++) {
        if (!isCurrent()) return
        const section = sections[index]
        if (!section.element.isConnected) continue
        if (!speakable.has(section.locale)) continue

        // Activate carousel slide if needed
        if (section.element.hasAttribute(TTS_ATTRIBUTES.carouselSlide)) {
          section.element.dispatchEvent(new Event(TTS_EVENTS.activateCarouselSlide, { bubbles: true }))
        }

        setTtsCurrentSectionIndex(index)
        const carousel = section.element.hasAttribute(TTS_ATTRIBUTES.carouselSlide)
          ? section.element.closest<HTMLElement>("[aria-roledescription='carousel']")
          : null
        const highlightTarget = carousel
          ? (section.element.querySelector<HTMLElement>("[data-tts-highlight-target]") ?? section.element)
          : section.element
        applyHighlight(highlightTarget, carousel ?? highlightTarget)

        // Chunk + speak
        const chunks = chunkText(section.text, TTS_LIMITS.maxCharsPerUtterance)
        for (const chunk of chunks) {
          if (!isCurrent()) return
          try {
            setTtsStatus("speaking")
            await provider.speak({
              text: chunk,
              locale: section.locale,
              voiceId: section.locale === preferredLocale ? preferencesRef.current.ttsVoiceId : null,
              rate: preferencesRef.current.ttsRate,
              pitch: preferencesRef.current.ttsPitch,
            })
          } catch (error) {
            if (!isCurrent()) return
            const code = getTtsErrorCode(error)
            if (code === "interrupted") return
            clearHighlight()
            setTtsStatus("error")
            setTtsErrorCode(code)
            return
          }
        }
      }

      if (!isCurrent()) return
      clearHighlight()
      setTtsCurrentSectionIndex(-1)
      setTtsStatus("finished")

      if (pendingRescanRef.current) {
        pendingRescanRef.current = false
        ttsRescan()
      }
    },
    [ensureProvider, ttsRescan, applyHighlight, clearHighlight],
  )

  // ============================================================================
  // TTS — PUBLIC COMMANDS
  // ============================================================================

  /** Play: start from the section currently on screen. */
  const ttsReadPage = useCallback(() => {
    ttsRescan()
    void startPlayback(findReadingStartIndex(sectionsRef.current, resolveTtsRoot()))
  }, [ttsRescan, startPlayback])

  /** Restart: always from the first section of the page. */
  const ttsRestart = useCallback(() => {
    ttsRescan()
    void startPlayback(0)
  }, [ttsRescan, startPlayback])

  const ttsReadSection = useCallback(
    (index: number) => {
      void startPlayback(index)
    },
    [startPlayback],
  )

  const ttsPause = useCallback(() => {
    if (!providerRef.current) return
    providerRef.current.pause()
    setTtsStatus((prev) => (prev === "speaking" ? "paused" : prev))
  }, [])

  const ttsResume = useCallback(() => {
    if (!providerRef.current) return
    providerRef.current.resume()
    setTtsStatus((prev) => (prev === "paused" ? "speaking" : prev))
  }, [])

  const ttsNext = useCallback(() => {
    const total = sectionsRef.current.length
    if (total === 0) return
    const current = ttsSectionIndexRef.current
    if (current >= total - 1) return
    void startPlayback(Math.max(0, current + 1))
  }, [startPlayback])

  const ttsPrevious = useCallback(() => {
    if (sectionsRef.current.length === 0) return
    void startPlayback(Math.max(0, ttsSectionIndexRef.current - 1))
  }, [startPlayback])

  // ============================================================================
  // TTS — ROUTE CHANGES
  // ============================================================================

  useEffect(() => {
    if (isLoading) return

    const wasReadingAloud =
      ttsStatusRef.current === "speaking" ||
      ttsStatusRef.current === "loading" ||
      ttsStatusRef.current === "translating"

    playbackTokenRef.current += 1
    providerRef.current?.stop()
    clearHighlight()
    sectionsRef.current = []
    pendingRescanRef.current = false

    const timer = setTimeout(() => {
      setTtsCurrentSectionIndex(-1)
      setTtsStatus((prev) => (prev === "unsupported" ? prev : "idle"))
      setTtsErrorCode(null)
      setTtsTranslationOutcome("none")
      setTtsSectionCount(0)

      ttsRescan()
      if (wasReadingAloud && preferencesRef.current.ttsAutoRead && sectionsRef.current.length > 0) {
        // Normally the new page is at the top (index 0). Hash links and
        // back/forward scroll restoration land mid-page, so honour that too.
        void startPlayback(findReadingStartIndex(sectionsRef.current, resolveTtsRoot()))
      }
    }, ROUTE_SETTLE_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isLoading])

  // ============================================================================
  // TTS — DYNAMIC CONTENT (MutationObserver)
  // ============================================================================

  useEffect(() => {
    if (isLoading) return
    const root = resolveTtsRoot()
    if (!root || typeof MutationObserver === "undefined") return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new MutationObserver((records) => {
      const meaningful = records.some((record) => {
        if (record.type === "attributes" && record.attributeName === TTS_ATTRIBUTES.active) return false
        const target = record.target as HTMLElement
        if (target?.closest?.("[data-tts-panel]")) return false
        return record.type === "childList" && record.addedNodes.length > 0
      })
      if (!meaningful) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const activeEl = sectionsRef.current[ttsSectionIndexRef.current]?.element
        const activeRemoved = activeEl ? !activeEl.isConnected : false
        // Any in-flight playback owns the section list: swapping it while
        // loading/translating/paused desyncs the start index, the section
        // counter and Next/Previous from what is actually being read.
        const status = ttsStatusRef.current
        const playbackInFlight =
          status === "speaking" || status === "paused" || status === "loading" || status === "translating"
        if (playbackInFlight && !activeRemoved) {
          pendingRescanRef.current = true
          return
        }
        ttsRescan()
      }, MUTATION_DEBOUNCE_MS)
    })

    observer.observe(root, { childList: true, subtree: true })
    return () => {
      if (timer) clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname, isLoading, ttsRescan])

  // ============================================================================
  // TTS — LOCALE / VOICE / RATE / PITCH / HIGHLIGHT / AUTO-READ SETTERS
  // ============================================================================

  const setTtsLocale = useCallback(
    (locale: SupportedSpeechLocale) => {
      ttsStop()
      setTtsHasVoiceForLocale(null)
      setTtsSubstituteVoice(null)
      setTtsTranslationOutcome("none")
      setPreferences((prev) => ({ ...prev, ttsLocale: locale, ttsVoiceId: null }))
      void refreshTtsVoices(locale)
      sectionsRef.current = []
      setTtsSectionCount(0)
    },
    [ttsStop, refreshTtsVoices],
  )

  const setTtsVoice = useCallback(
    (voiceId: string | null) => {
      ttsStop()
      setPreferences((prev) => ({ ...prev, ttsVoiceId: voiceId }))
    },
    [ttsStop],
  )

  const setTtsRate = useCallback((rate: number) => {
    setPreferences((prev) => ({
      ...prev,
      ttsRate: Math.min(TTS_LIMITS.maxRate, Math.max(TTS_LIMITS.minRate, rate)),
    }))
  }, [])

  const setTtsPitch = useCallback((pitch: number) => {
    setPreferences((prev) => ({
      ...prev,
      ttsPitch: Math.min(TTS_LIMITS.maxPitch, Math.max(TTS_LIMITS.minPitch, pitch)),
    }))
  }, [])

  const setTtsHighlight = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => ({ ...prev, ttsHighlight: enabled }))
      if (!enabled) {
        clearHighlight()
        return
      }
      const active = sectionsRef.current[ttsSectionIndexRef.current]?.element
      if (active) applyHighlight(active)
    },
    [clearHighlight, applyHighlight],
  )

  const setTtsAutoRead = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, ttsAutoRead: enabled }))
  }, [])

  // ============================================================================
  // TTS — MEDIA EXCLUSIVITY
  // ============================================================================

  useEffect(() => {
    const unsubscribe = onMediaPlaying(() => ttsStop())
    const onPlay = (event: Event) => {
      const target = event.target as HTMLMediaElement | null
      if (!target || target.muted) return
      ttsStop()
    }
    document.addEventListener("play", onPlay, true)
    return () => {
      unsubscribe()
      document.removeEventListener("play", onPlay, true)
    }
  }, [ttsStop])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") ttsStop()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [ttsStop])

  useEffect(() => {
    const onPageHide = () => providerRef.current?.stop()
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.removeEventListener("pagehide", onPageHide)
      providerRef.current?.dispose()
      providerRef.current = null
    }
  }, [])

  // ============================================================================
  // TTS — I18N STRINGS (memoised)
  // ============================================================================

  const ttsStrings = useMemo(() => getPanelStrings(preferences.ttsLocale), [preferences.ttsLocale])

  // ============================================================================
  // VISUAL PREF UPDATERS
  // ============================================================================

  const PREF_LABELS: Record<keyof AccessibilityPreferences, string> = {
    textScale: "Text size",
    fontFamily: "Font family",
    contrastMode: "Contrast",
    cursorMode: "Reading aid",
    bigCursor: "Large cursor",
    guideSticker: "Reading guide friend",
    reduceMotion: "Reduced motion",
    sensoryFriendly: "Sensory-friendly mode",
    linkHighlight: "Link highlighting",
    lineSpacing: "Line spacing",
    letterSpacing: "Letter spacing",
    readingMode: "Reading mode",
    dictionaryMode: "Dictionary mode",
    widgetPosition: "Widget position",
    ttsLocale: "Language",
    ttsVoiceId: "Voice",
    ttsRate: "Speed",
    ttsPitch: "Pitch",
    ttsHighlight: "Text highlight",
    ttsAutoRead: "Auto-read",
  }

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value }
        if (key === "sensoryFriendly" && value === true) {
          updated.reduceMotion = true
        }
        return validatePreferences(updated)
      })
      const state = typeof value === "boolean" ? (value ? "enabled" : "disabled") : String(value ?? "default")
      liveAnnouncer.announce(`${PREF_LABELS[key]} ${state}`, "polite")
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => {
      const merged = { ...prev, ...updates }
      if (updates.sensoryFriendly === true) {
        merged.reduceMotion = true
      }
      return validatePreferences(merged)
    })
    liveAnnouncer.announce("Accessibility settings updated", "polite")
  }, [])

  const resetAll = useCallback(() => {
    // Stop TTS first
    playbackTokenRef.current += 1
    providerRef.current?.stop()
    clearHighlight()
    setTtsCurrentSectionIndex(-1)
    setTtsStatus((prev) => (prev === "unsupported" ? prev : "idle"))
    setTtsErrorCode(null)
    // Reset all preferences
    setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES)
    liveAnnouncer.announce("All accessibility settings reset to defaults", "polite")
  }, [clearHighlight])

  const resetPreference = useCallback((key: keyof AccessibilityPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: DEFAULT_ACCESSIBILITY_PREFERENCES[key],
    }))
    liveAnnouncer.announce(`${PREF_LABELS[key]} reset to default`, "polite")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AccessibilityContextValue = {
    // Visual prefs
    preferences,
    updatePreference,
    updatePreferences,
    resetAll,
    resetPreference,
    isModified,
    isLoading,
    // TTS state
    ttsStatus,
    status: ttsStatus,
    ttsIsSupported,
    ttsSectionCount,
    ttsCurrentSectionIndex,
    ttsVoices,
    ttsHasVoiceForLocale,
    ttsSubstituteVoice,
    ttsTranslationOutcome,
    ttsErrorCode,
    ttsStrings,
    // TTS commands
    ttsReadPage,
    ttsReadSection,
    ttsPause,
    ttsResume,
    ttsStop,
    ttsNext,
    ttsPrevious,
    ttsRestart,
    setTtsLocale,
    setTtsVoice,
    setTtsRate,
    setTtsPitch,
    setTtsHighlight,
    setTtsAutoRead,
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider. " +
        "Wrap your app with <AccessibilityProvider> in your root layout.",
    )
  }
  return context
}

/**
 * Optional hook that returns null if rendered outside AccessibilityProvider.
 * Used by media players, carousels, and testimonials.
 */
export function useOptionalAccessibility(): AccessibilityContextValue | null {
  return useContext(AccessibilityContext)
}

// Export for media players that need to notify TTS to stop
export { notifyMediaPlaying } from "@/lib/tts/media-coordinator"

// ── Internal helpers ──────────────────────────────────────────────────────────

function getTtsErrorCode(error: unknown): TtsErrorCode {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: TtsErrorCode }).code
  }
  return "synthesis-failed"
}
