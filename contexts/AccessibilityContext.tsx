"use client"

// ── Accessibility Context ───────────────────────────────────────────────────
// Single owner of every accessibility preference and the whole TTS playback
// state machine. Mounted once per public page tree; never in /admin.
//
// Playback model: sections are split into utterance-sized chunks and spoken one
// at a time. A monotonically increasing "playback token" is the cancellation
// primitive — any command that changes what should be spoken bumps the token,
// so in-flight loops from the previous command exit at their next checkpoint
// instead of fighting over the engine.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { usePathname } from "next/navigation"

import { extractSections, resolveTtsRoot } from "@/lib/tts/content-extractor"
import { getPanelStrings, type PanelStrings } from "@/lib/tts/i18n"
import {
  notifyMediaPlaying,
  onMediaPlaying,
  pauseAllNativeMedia,
} from "@/lib/tts/media-coordinator"
import {
  DEFAULT_PREFERENCES,
  TEXT_SIZE_RANGE,
  clearPreferences,
  loadPreferences,
  savePreferences,
  type AccessibilityPreferences,
} from "@/lib/tts/preferences"
import { chunkText } from "@/lib/tts/text-normalizer"
import { translateSectionsToNepali } from "@/lib/tts/translator"
import {
  TTS_ATTRIBUTES,
  TTS_LIMITS,
  type SpeechSection,
  type SupportedSpeechLocale,
  type TtsErrorCode,
  type TtsStatus,
  type TtsVoice,
} from "@/lib/tts/types"
import type { WebSpeechTtsProvider } from "@/lib/tts/providers/web-speech-provider"

interface AccessibilityContextValue {
  // Panel
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  launcherRef: RefObject<HTMLButtonElement | null>

  /** Preferences are only meaningful once this is true. */
  isHydrated: boolean

  // Preferences
  preferences: AccessibilityPreferences
  setLocale: (locale: SupportedSpeechLocale) => void
  setVoice: (voiceId: string | null) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setHighlight: (enabled: boolean) => void
  setAutoRead: (enabled: boolean) => void
  setTextSize: (size: number) => void
  setHighContrast: (enabled: boolean) => void
  setReduceMotion: (enabled: boolean) => void
  setCalmingMode: (enabled: boolean) => void
  resetAll: () => void

  // TTS state
  status: TtsStatus
  isSupported: boolean
  sectionCount: number
  currentSectionIndex: number
  voices: TtsVoice[]
  /** null = not checked yet. */
  hasVoiceForLocale: boolean | null
  /**
   * Set when the chosen voice is a different language that shares the script
   * (a Hindi voice reading Nepali). Disclosed in the UI; never silent.
   */
  substituteVoice: { name: string; lang: string } | null
  /**
   * Outcome of the last Nepali translation pass. "partial" means some sections
   * fell back to English; "failed" means none could be translated.
   */
  translationOutcome: "none" | "partial" | "failed"
  errorCode: TtsErrorCode | null

  // TTS commands
  readPage: () => void
  readSection: (index: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  previous: () => void
  restart: () => void

  /** Localised strings for the current panel language. */
  strings: PanelStrings
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
)

/** Time to let a new route paint before extracting its content. */
const ROUTE_SETTLE_MS = 350
const MUTATION_DEBOUNCE_MS = 500

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(DEFAULT_PREFERENCES)

  const [status, setStatus] = useState<TtsStatus>("idle")
  const [isSupported, setIsSupported] = useState(true)
  const [voices, setVoices] = useState<TtsVoice[]>([])
  const [hasVoiceForLocale, setHasVoiceForLocale] = useState<boolean | null>(
    null
  )
  const [substituteVoice, setSubstituteVoice] = useState<{
    name: string
    lang: string
  } | null>(null)
  const [errorCode, setErrorCode] = useState<TtsErrorCode | null>(null)
  const [translationOutcome, setTranslationOutcome] = useState<
    "none" | "partial" | "failed"
  >("none")
  const [sectionCount, setSectionCount] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1)

  const providerRef = useRef<WebSpeechTtsProvider | null>(null)
  const sectionsRef = useRef<SpeechSection[]>([])
  const playbackTokenRef = useRef(0)
  const highlightedRef = useRef<HTMLElement | null>(null)
  const launcherRef = useRef<HTMLButtonElement | null>(null)
  const pendingRescanRef = useRef(false)

  // Mirrors of state read inside long-lived callbacks, so those callbacks stay
  // referentially stable and never close over a stale render.
  const preferencesRef = useRef(preferences)
  const statusRef = useRef(status)
  const sectionIndexRef = useRef(currentSectionIndex)
  preferencesRef.current = preferences
  statusRef.current = status
  sectionIndexRef.current = currentSectionIndex

  // ── Preferences: hydrate, then persist ───────────────────────────────────

  useEffect(() => {
    setPreferences(loadPreferences())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    savePreferences(preferences)
  }, [preferences, isHydrated])

  const updatePreferences = useCallback(
    (patch: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...patch }))
    },
    []
  )

  // ── Visual preference side effects ───────────────────────────────────────

  useEffect(() => {
    if (!isHydrated) return
    const root = document.documentElement
    if (preferences.textSize === DEFAULT_PREFERENCES.textSize) {
      root.style.removeProperty("font-size")
    } else {
      root.style.fontSize = `${preferences.textSize}%`
    }
  }, [preferences.textSize, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    document.body.classList.toggle("high-contrast", preferences.highContrast)
  }, [preferences.highContrast, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    document.body.classList.toggle("reduce-motion", preferences.reduceMotion)
  }, [preferences.reduceMotion, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    document.body.classList.toggle("calming-mode", preferences.calmingMode)
  }, [preferences.calmingMode, isHydrated])

  // ── Highlighting ─────────────────────────────────────────────────────────

  const clearHighlight = useCallback(() => {
    const previous = highlightedRef.current
    if (previous) {
      previous.removeAttribute(TTS_ATTRIBUTES.active)
      highlightedRef.current = null
    }
  }, [])

  const applyHighlight = useCallback(
    (element: HTMLElement) => {
      clearHighlight()
      if (!preferencesRef.current.highlight) return
      if (!element.isConnected) return

      element.setAttribute(TTS_ATTRIBUTES.active, "true")
      highlightedRef.current = element

      // Scroll only when the section is substantially outside the viewport.
      const rect = element.getBoundingClientRect()
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight
      const isComfortablyVisible = rect.top >= 0 && rect.bottom <= viewportHeight
      if (isComfortablyVisible) return

      const prefersReducedMotion =
        preferencesRef.current.reduceMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      element.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      })
    },
    [clearHighlight]
  )

  // ── Provider bootstrap (lazy) ────────────────────────────────────────────

  const ensureProvider =
    useCallback(async (): Promise<WebSpeechTtsProvider | null> => {
      if (providerRef.current) return providerRef.current
      if (typeof window === "undefined") return null

      if (!("speechSynthesis" in window)) {
        setIsSupported(false)
        setStatus("unsupported")
        return null
      }

      try {
        const { WebSpeechTtsProvider: Provider } = await import(
          "@/lib/tts/providers/web-speech-provider"
        )
        const provider = new Provider()
        if (!provider.isSupported()) {
          setIsSupported(false)
          setStatus("unsupported")
          return null
        }
        providerRef.current = provider
        return provider
      } catch {
        setIsSupported(false)
        setStatus("unsupported")
        return null
      }
    }, [])

  /** Refresh the voice list, locale availability, and substitute disclosure. */
  const refreshVoices = useCallback(
    async (locale: SupportedSpeechLocale) => {
      const provider = await ensureProvider()
      if (!provider) return
      try {
        const [available, resolved] = await Promise.all([
          provider.getVoices(locale),
          provider.describeVoiceFor(locale, preferencesRef.current.voiceId),
        ])
        setVoices(available)
        setHasVoiceForLocale(resolved !== null)
        setSubstituteVoice(
          resolved?.isScriptSubstitute
            ? { name: resolved.voiceName, lang: resolved.voiceLang }
            : null
        )
      } catch {
        setVoices([])
        setHasVoiceForLocale(false)
        setSubstituteVoice(null)
      }
    },
    [ensureProvider]
  )

  // Load the engine when the panel opens, or once the browser goes idle.
  useEffect(() => {
    if (!isHydrated || !isPanelOpen) return
    void refreshVoices(preferences.locale)
  }, [isPanelOpen, isHydrated, preferences.locale, refreshVoices])

  useEffect(() => {
    if (!isHydrated || isPanelOpen) return
    if (typeof window.requestIdleCallback !== "function") return
    const handle = window.requestIdleCallback(() => {
      void ensureProvider()
    })
    return () => window.cancelIdleCallback?.(handle)
  }, [isHydrated, isPanelOpen, ensureProvider])

  // ── Content extraction ───────────────────────────────────────────────────

  const rescan = useCallback(() => {
    if (typeof window === "undefined") return
    const result = extractSections({
      preferredLocale: preferencesRef.current.locale,
    })
    sectionsRef.current = result.sections
    setSectionCount(result.sections.length)
    return result
  }, [])

  // ── Playback ─────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    playbackTokenRef.current += 1
    providerRef.current?.stop()
    clearHighlight()
    setCurrentSectionIndex(-1)
    setStatus((prev) => (prev === "unsupported" ? prev : "idle"))
  }, [clearHighlight])

  /**
   * Speak sections sequentially from `startIndex` until the page ends, the
   * playback token is bumped, or the engine reports a real failure.
   */
  const startPlayback = useCallback(
    async (startIndex: number) => {
      const token = ++playbackTokenRef.current
      const isCurrent = () => playbackTokenRef.current === token

      setErrorCode(null)
      setStatus("loading")

      const provider = await ensureProvider()
      if (!provider || !isCurrent()) return

      if (sectionsRef.current.length === 0) rescan()
      if (sectionsRef.current.length === 0) {
        setStatus("error")
        setErrorCode("empty-content")
        return
      }

      // Speech becomes the only audio source while it runs.
      pauseAllNativeMedia()

      const preferredLocale = preferencesRef.current.locale

      // ── Nepali reading mode ────────────────────────────────────────────────
      // The site is authored in English, so sections that merely inherited the
      // Nepali preference are translated before they are spoken. This runs on
      // the already-extracted list, so reading order and every extraction rule
      // (skipped video/iframe media, hidden and duplicate content, sensitive
      // fields) are preserved untouched.
      if (preferredLocale === "ne-NP") {
        setStatus("translating")
        let outcome: "none" | "partial" | "failed" = "none"
        try {
          const result = await translateSectionsToNepali(sectionsRef.current)
          if (!isCurrent()) return
          sectionsRef.current = result.sections
          if (result.failed > 0) {
            outcome = result.translated > 0 ? "partial" : "failed"
          }
        } catch {
          // Translation is best-effort: keep the English sections and read them
          // with an English voice rather than failing the whole read.
          if (!isCurrent()) return
          outcome = "failed"
        }
        setTranslationOutcome(outcome)
        setStatus("loading")
      } else {
        setTranslationOutcome("none")
      }

      const sections = sectionsRef.current

      // Work out which locales this device can actually speak. A page may mix
      // English and Nepali, and a missing Nepali voice should skip those
      // sections rather than abort the whole read.
      const localesInUse = new Set(sections.map((section) => section.locale))
      localesInUse.add(preferredLocale)
      const speakable = new Set<SupportedSpeechLocale>()
      for (const locale of localesInUse) {
        const resolved = await provider.describeVoiceFor(
          locale,
          locale === preferredLocale ? preferencesRef.current.voiceId : null
        )
        if (!resolved) continue
        speakable.add(locale)
        if (locale === preferredLocale) {
          setSubstituteVoice(
            resolved.isScriptSubstitute
              ? { name: resolved.voiceName, lang: resolved.voiceLang }
              : null
          )
        }
      }
      if (!isCurrent()) return

      setHasVoiceForLocale(speakable.has(preferredLocale))

      const playableSections = sections.filter((section) =>
        speakable.has(section.locale)
      )
      if (playableSections.length === 0) {
        setStatus("error")
        setErrorCode("no-voice")
        return
      }

      for (let index = Math.max(0, startIndex); index < sections.length; index++) {
        if (!isCurrent()) return

        const section = sections[index]
        if (!section.element.isConnected) continue
        // No voice for this section's language: skip rather than mispronounce.
        if (!speakable.has(section.locale)) continue

        setCurrentSectionIndex(index)
        applyHighlight(section.element)

        const chunks = chunkText(section.text, TTS_LIMITS.maxCharsPerUtterance)

        for (const chunk of chunks) {
          if (!isCurrent()) return
          try {
            setStatus("speaking")
            await provider.speak({
              text: chunk,
              locale: section.locale,
              // A saved voice only applies to the locale it was chosen for.
              voiceId:
                section.locale === preferredLocale
                  ? preferencesRef.current.voiceId
                  : null,
              rate: preferencesRef.current.rate,
              pitch: preferencesRef.current.pitch,
            })
          } catch (error) {
            if (!isCurrent()) return
            const code = getErrorCode(error)
            if (code === "interrupted") return
            clearHighlight()
            setStatus("error")
            setErrorCode(code)
            return
          }
        }
      }

      if (!isCurrent()) return
      clearHighlight()
      setCurrentSectionIndex(-1)
      setStatus("finished")

      if (pendingRescanRef.current) {
        pendingRescanRef.current = false
        rescan()
      }
    },
    [ensureProvider, rescan, applyHighlight, clearHighlight]
  )

  const readPage = useCallback(() => {
    rescan()
    void startPlayback(0)
  }, [rescan, startPlayback])

  const readSection = useCallback(
    (index: number) => {
      void startPlayback(index)
    },
    [startPlayback]
  )

  const pause = useCallback(() => {
    if (!providerRef.current) return
    providerRef.current.pause()
    setStatus((prev) => (prev === "speaking" ? "paused" : prev))
  }, [])

  const resume = useCallback(() => {
    if (!providerRef.current) return
    providerRef.current.resume()
    setStatus((prev) => (prev === "paused" ? "speaking" : prev))
  }, [])

  const next = useCallback(() => {
    const total = sectionsRef.current.length
    if (total === 0) return
    const current = sectionIndexRef.current
    if (current >= total - 1) return
    void startPlayback(Math.max(0, current + 1))
  }, [startPlayback])

  const previous = useCallback(() => {
    if (sectionsRef.current.length === 0) return
    void startPlayback(Math.max(0, sectionIndexRef.current - 1))
  }, [startPlayback])

  // ── Route changes always cancel old speech ───────────────────────────────

  useEffect(() => {
    if (!isHydrated) return

    // Read before the reset below, so it still reflects the page we are leaving:
    // was speech actually running at the moment of this navigation?
    //
    // Only an already-running read may carry over to the next page, and a read
    // can only be running because the visitor pressed play in this session. On
    // a first load or a reload there is nothing in flight, so this is false and
    // the page stays silent until play is pressed. "paused" is deliberately
    // excluded: the visitor stopped the audio themselves.
    const wasReadingAloud =
      statusRef.current === "speaking" ||
      statusRef.current === "loading" ||
      statusRef.current === "translating"

    playbackTokenRef.current += 1
    providerRef.current?.stop()
    clearHighlight()
    setCurrentSectionIndex(-1)
    setStatus((prev) => (prev === "unsupported" ? prev : "idle"))
    setErrorCode(null)
    setTranslationOutcome("none")
    sectionsRef.current = []
    setSectionCount(0)
    pendingRescanRef.current = false

    const timer = setTimeout(() => {
      rescan()
      if (
        wasReadingAloud &&
        preferencesRef.current.autoRead &&
        sectionsRef.current.length > 0
      ) {
        void startPlayback(0)
      }
    }, ROUTE_SETTLE_MS)

    return () => clearTimeout(timer)
  }, [pathname, isHydrated, rescan, clearHighlight, startPlayback])

  // ── Dynamic content ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isHydrated) return
    const root = resolveTtsRoot()
    if (!root || typeof MutationObserver === "undefined") return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new MutationObserver((records) => {
      // Ignore mutations we caused ourselves (highlighting) and panel churn.
      const meaningful = records.some((record) => {
        if (
          record.type === "attributes" &&
          record.attributeName === TTS_ATTRIBUTES.active
        ) {
          return false
        }
        const target = record.target as HTMLElement
        if (target?.closest?.("[data-tts-panel]")) return false
        return record.type === "childList" && record.addedNodes.length > 0
      })
      if (!meaningful) return

      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const activeElement =
          sectionsRef.current[sectionIndexRef.current]?.element
        const activeRemoved = activeElement ? !activeElement.isConnected : false

        // Re-indexing mid-sentence would move the ground under the visitor, so
        // queue the update unless the section being read has disappeared.
        if (statusRef.current === "speaking" && !activeRemoved) {
          pendingRescanRef.current = true
          return
        }
        rescan()
      }, MUTATION_DEBOUNCE_MS)
    })

    observer.observe(root, { childList: true, subtree: true })
    return () => {
      if (timer) clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname, isHydrated, rescan])

  // ── Language / voice changes cancel in-flight speech ─────────────────────

  const setLocale = useCallback(
    (locale: SupportedSpeechLocale) => {
      stop()
      setHasVoiceForLocale(null)
      setSubstituteVoice(null)
      setTranslationOutcome("none")
      updatePreferences({ locale, voiceId: null })
      void refreshVoices(locale)
      // Locale feeds script detection, so the section list must be rebuilt.
      sectionsRef.current = []
      setSectionCount(0)
    },
    [stop, updatePreferences, refreshVoices]
  )

  const setVoice = useCallback(
    (voiceId: string | null) => {
      stop()
      updatePreferences({ voiceId })
    },
    [stop, updatePreferences]
  )

  const setRate = useCallback(
    (rate: number) => {
      updatePreferences({
        rate: clamp(rate, TTS_LIMITS.minRate, TTS_LIMITS.maxRate),
      })
    },
    [updatePreferences]
  )

  const setPitch = useCallback(
    (pitch: number) => {
      updatePreferences({
        pitch: clamp(pitch, TTS_LIMITS.minPitch, TTS_LIMITS.maxPitch),
      })
    },
    [updatePreferences]
  )

  const setHighlight = useCallback(
    (enabled: boolean) => {
      updatePreferences({ highlight: enabled })
      if (!enabled) {
        clearHighlight()
        return
      }
      const active = sectionsRef.current[sectionIndexRef.current]?.element
      if (active) applyHighlight(active)
    },
    [updatePreferences, clearHighlight, applyHighlight]
  )

  const setAutoRead = useCallback(
    (enabled: boolean) => updatePreferences({ autoRead: enabled }),
    [updatePreferences]
  )

  const setTextSize = useCallback(
    (size: number) =>
      updatePreferences({
        textSize: clamp(size, TEXT_SIZE_RANGE.min, TEXT_SIZE_RANGE.max),
      }),
    [updatePreferences]
  )

  const setHighContrast = useCallback(
    (enabled: boolean) => updatePreferences({ highContrast: enabled }),
    [updatePreferences]
  )

  const setReduceMotion = useCallback(
    (enabled: boolean) => updatePreferences({ reduceMotion: enabled }),
    [updatePreferences]
  )

  const setCalmingMode = useCallback(
    (enabled: boolean) => updatePreferences({ calmingMode: enabled }),
    [updatePreferences]
  )

  const resetAll = useCallback(() => {
    stop()
    clearPreferences()
    setPreferences({ ...DEFAULT_PREFERENCES })
    setErrorCode(null)
  }, [stop])

  // ── Media exclusivity ────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onMediaPlaying(() => stop())

    // `play` does not bubble, so listen in the capture phase.
    const onPlay = (event: Event) => {
      const target = event.target as HTMLMediaElement | null
      if (!target || target.muted) return
      stop()
    }
    document.addEventListener("play", onPlay, true)

    return () => {
      unsubscribe()
      document.removeEventListener("play", onPlay, true)
    }
  }, [stop])

  // Stop speech when the tab is hidden so audio does not follow the visitor.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stop()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [stop])

  // Belt and braces: cancel on navigation away and on unmount.
  useEffect(() => {
    const onPageHide = () => providerRef.current?.stop()
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.removeEventListener("pagehide", onPageHide)
      providerRef.current?.dispose()
      providerRef.current = null
    }
  }, [])

  // ── Panel ────────────────────────────────────────────────────────────────

  const openPanel = useCallback(() => setIsPanelOpen(true), [])
  const closePanel = useCallback(() => setIsPanelOpen(false), [])
  const togglePanel = useCallback(() => setIsPanelOpen((open) => !open), [])

  const strings = useMemo(
    () => getPanelStrings(preferences.locale),
    [preferences.locale]
  )

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      isPanelOpen,
      openPanel,
      closePanel,
      togglePanel,
      launcherRef,
      isHydrated,
      preferences,
      setLocale,
      setVoice,
      setRate,
      setPitch,
      setHighlight,
      setAutoRead,
      setTextSize,
      setHighContrast,
      setReduceMotion,
      setCalmingMode,
      resetAll,
      status,
      isSupported,
      sectionCount,
      currentSectionIndex,
      voices,
      hasVoiceForLocale,
      substituteVoice,
      translationOutcome,
      errorCode,
      readPage,
      readSection,
      pause,
      resume,
      stop,
      next,
      previous,
      restart: readPage,
      strings,
    }),
    [
      isPanelOpen,
      openPanel,
      closePanel,
      togglePanel,
      isHydrated,
      preferences,
      setLocale,
      setVoice,
      setRate,
      setPitch,
      setHighlight,
      setAutoRead,
      setTextSize,
      setHighContrast,
      setReduceMotion,
      setCalmingMode,
      resetAll,
      status,
      isSupported,
      sectionCount,
      currentSectionIndex,
      voices,
      hasVoiceForLocale,
      substituteVoice,
      translationOutcome,
      errorCode,
      readPage,
      readSection,
      pause,
      resume,
      stop,
      next,
      previous,
      strings,
    ]
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    )
  }
  return context
}

/** Non-throwing variant for components that may render outside the provider. */
export function useOptionalAccessibility(): AccessibilityContextValue | null {
  return useContext(AccessibilityContext)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getErrorCode(error: unknown): TtsErrorCode {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: TtsErrorCode }).code
  }
  return "synthesis-failed"
}

export { notifyMediaPlaying }
