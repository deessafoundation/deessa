'use client'

/**
 * Accessibility Provider
 * 
 * Unified accessibility system using React Context.
 * Manages all accessibility preferences with localStorage persistence.
 * 
 * Features:
 * - Single source of truth for all accessibility settings
 * - Automatic localStorage persistence
 * - CSS variable injection
 * - Body class management
 * - System preference detection (prefers-reduced-motion, etc.)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  AccessibilityPreferences,
  AccessibilityContextValue,
  StoredAccessibilityData,
} from '@/lib/types/accessibility'
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  STORAGE_CONFIG,
  decodeAccessibilityData,
  validatePreferences,
  preferencesEqual,
} from '@/lib/types/accessibility'
import { liveAnnouncer } from '@/lib/utils/accessibility'

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
)

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    DEFAULT_ACCESSIBILITY_PREFERENCES
  )
  const [isLoading, setIsLoading] = useState(true)
  const isModified = !preferencesEqual(preferences, DEFAULT_ACCESSIBILITY_PREFERENCES)

  // ============================================================================
  // INITIALIZATION - Load from localStorage/sessionStorage with V1/V2 → V3 migration
  // ============================================================================

  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Check for system preferences first
        const systemPrefersReducedMotion =
          window.matchMedia('(prefers-reduced-motion: reduce)').matches

        let loaded: AccessibilityPreferences | null = null
        for (const storageName of ['localStorage', 'sessionStorage'] as const) {
          try {
            const storage = window[storageName]
            const stored = storage.getItem(STORAGE_CONFIG.KEY)
            if (!stored) continue
            const parsed: unknown = JSON.parse(stored)
            loaded = decodeAccessibilityData(parsed)
            if (loaded) {
              if ((parsed as { version: unknown }).version !== STORAGE_CONFIG.VERSION) {
                try { storage.setItem(STORAGE_CONFIG.KEY + '-pre-v4', stored) } catch { /* Migration works even when backup storage is full. */ }
              }
              break
            }
          } catch { /* Try the other storage if denied or malformed. */ }
        }
        const initial = loaded ?? { ...DEFAULT_ACCESSIBILITY_PREFERENCES }
        if (systemPrefersReducedMotion) initial.reduceMotion = true
        setPreferences(initial)

      } catch (error) {
        console.error('❌ Failed to load accessibility preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // ============================================================================
  // PERSISTENCE - Save to localStorage with sessionStorage fallback
  // ============================================================================

  useEffect(() => {
    if (isLoading) return // Don't persist during initial load

    try {
      const dataToStore: StoredAccessibilityData = {
        version: STORAGE_CONFIG.VERSION,
        preferences,
        lastUpdated: new Date().toISOString(),
      }

      const serialized = JSON.stringify(dataToStore)

      // Check size (localStorage typically has 5-10MB limit)
      if (serialized.length > STORAGE_CONFIG.MAX_SIZE) {
        console.error('⚠️ Accessibility data too large for storage')
        liveAnnouncer.announce(
          'Accessibility settings are too large to save.',
          'assertive'
        )
        return
      }

      // Try localStorage first (persistent across sessions)
      try {
        localStorage.setItem(STORAGE_CONFIG.KEY, serialized)
        console.log('💾 Accessibility preferences saved to localStorage')
      } catch {
        try {
          sessionStorage.setItem(STORAGE_CONFIG.KEY, serialized)
          liveAnnouncer.announce('Accessibility settings saved for this session only.', 'polite')
        } catch {
          liveAnnouncer.announce('Accessibility settings work, but browser storage is unavailable. Changes cannot be saved.', 'polite')
        }
      }


    } catch (error) {
      console.error('❌ Failed to save accessibility preferences:', error)
      
      liveAnnouncer.announce(
        'Unable to save accessibility settings. An error occurred.',
        'assertive'
      )
    }
  }, [preferences, isLoading])

  // ============================================================================
  // CSS VARIABLES - Apply to document root
  // ============================================================================

  useEffect(() => {
    const root = document.documentElement

    // Set data attribute on html element for scoped CSS
    root.setAttribute('data-a11y-scope', 'public')

    // Apply CSS variables
    root.style.setProperty('--a11y-text-scale', String(preferences.textScale))
    
    // Line spacing: null means use site default (remove override)
    if (preferences.lineSpacing !== null) {
      root.style.setProperty('--a11y-line-height', String(preferences.lineSpacing))
    } else {
      root.style.removeProperty('--a11y-line-height')
    }
    
    // Letter spacing: null means use site default (remove override)
    if (preferences.letterSpacing !== null) {
      root.style.setProperty('--a11y-letter-spacing', `${preferences.letterSpacing}em`)
    } else {
      root.style.removeProperty('--a11y-letter-spacing')
    }

    // Animation duration (0 if sensory-friendly or reduced motion)
    const animationMultiplier =
      preferences.sensoryFriendly || preferences.reduceMotion ? 0 : 1
    root.style.setProperty(
      '--a11y-animation-duration',
      String(animationMultiplier)
    )

    // Transition duration
    const transitionDuration =
      preferences.sensoryFriendly || preferences.reduceMotion ? '0ms' : '200ms'
    root.style.setProperty('--a11y-transition-duration', transitionDuration)

    // Set data attribute for high text scale (>= 1.5) to trigger anti-clipping CSS
    if (preferences.textScale >= 1.5) {
      root.setAttribute('data-text-scale-high', 'true')
    } else {
      root.removeAttribute('data-text-scale-high')
    }

    console.log('🎨 CSS variables updated')

    // Cleanup on unmount
    return () => {
      root.removeAttribute('data-a11y-scope')
      root.removeAttribute('data-text-scale-high')
      root.style.removeProperty('--a11y-text-scale')
      root.style.removeProperty('--a11y-line-height')
      root.style.removeProperty('--a11y-letter-spacing')
      root.style.removeProperty('--a11y-animation-duration')
      root.style.removeProperty('--a11y-transition-duration')
    }
  }, [preferences])

  // ============================================================================
  // BODY CLASSES - Apply visual modes
  // ============================================================================

  useEffect(() => {
    const body = document.body

    // High Contrast
    body.classList.toggle('high-contrast', preferences.contrastMode === 'high')
    body.dataset.a11yContrast = preferences.contrastMode
    document.documentElement.dataset.a11yNegative = String(preferences.contrastMode === 'negative')
    body.dataset.a11yCursor = preferences.cursorMode
    if (preferences.bigCursor) body.dataset.a11yBigCursor = 'true'; else delete body.dataset.a11yBigCursor;

    // Reduce Motion
    body.classList.toggle('reduce-motion', preferences.reduceMotion)

    // Sensory Friendly (automatically includes reduced motion)
    body.classList.toggle('sensory-friendly', preferences.sensoryFriendly)
    if (preferences.sensoryFriendly && !preferences.reduceMotion) {
      // Sensory-friendly mode should always have reduced motion
      body.classList.add('reduce-motion')
    }

    // Font Family (V2)
    body.classList.remove('font-default', 'font-system', 'font-opendyslexic')
    body.classList.add(`font-${preferences.fontFamily}`)

    // Link Highlight
    body.classList.toggle('link-highlight', preferences.linkHighlight)

    // Reading Mode
    body.classList.toggle('reading-mode', preferences.readingMode)

    return () => {
      body.classList.remove('high-contrast', 'reduce-motion', 'sensory-friendly', 'font-default', 'font-system', 'font-opendyslexic', 'link-highlight', 'reading-mode')
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
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !preferences.reduceMotion) {
        // System now prefers reduced motion
        setPreferences((prev) => ({
          ...prev,
          reduceMotion: true,
        }))

        liveAnnouncer.announce(
          'Reduced motion enabled based on system preferences',
          'polite'
        )
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences.reduceMotion])

  // ============================================================================
  // UPDATE FUNCTIONS
  // ============================================================================

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K]
    ) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value }

        // If enabling sensory-friendly, also enable reduce motion
        if (key === 'sensoryFriendly' && value === true) {
          updated.reduceMotion = true
        }

        return validatePreferences(updated)
      })

      // Announce change to screen readers
      const labels: Record<keyof AccessibilityPreferences, string> = {
        textScale: 'Text size',
        fontFamily: 'Font family',
        contrastMode: 'Contrast',
        cursorMode: 'Reading aid',
        bigCursor: 'Large cursor',
        guideSticker: 'Reading guide friend',
        reduceMotion: 'Reduced motion',
        sensoryFriendly: 'Sensory-friendly mode',
        linkHighlight: 'Link highlighting',
        lineSpacing: 'Line spacing',
        letterSpacing: 'Letter spacing',
        readingMode: 'Reading mode',
        dictionaryMode: 'Dictionary mode',
        widgetPosition: 'Widget position',
      }

      const label = labels[key]
      const state = typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : String(value ?? 'default')

      liveAnnouncer.announce(`${label} ${state}`, 'polite')
    },
    []
  )

  const updatePreferences = useCallback(
    (updates: Partial<AccessibilityPreferences>) => {
      setPreferences((prev) => {
        const merged = { ...prev, ...updates }

        // If enabling sensory-friendly, also enable reduce motion
        if (updates.sensoryFriendly === true) {
          merged.reduceMotion = true
        }

        return validatePreferences(merged)
      })

      liveAnnouncer.announce('Accessibility settings updated', 'polite')
    },
    []
  )

  const resetAll = useCallback(() => {
    setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES)
    liveAnnouncer.announce('All accessibility settings reset to defaults', 'polite')
  }, [])

  const resetPreference = useCallback(
    (key: keyof AccessibilityPreferences) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: DEFAULT_ACCESSIBILITY_PREFERENCES[key],
      }))

      const labels: Record<keyof AccessibilityPreferences, string> = {
        textScale: 'Text size',
        fontFamily: 'Font family',
        contrastMode: 'Contrast',
        cursorMode: 'Reading aid',
        bigCursor: 'Large cursor',
        guideSticker: 'Reading guide friend',
        reduceMotion: 'Reduced motion',
        sensoryFriendly: 'Sensory-friendly mode',
        linkHighlight: 'Link highlighting',
        lineSpacing: 'Line spacing',
        letterSpacing: 'Letter spacing',
        readingMode: 'Reading mode',
        dictionaryMode: 'Dictionary mode',
        widgetPosition: 'Widget position',
      }

      liveAnnouncer.announce(`${labels[key]} reset to default`, 'polite')
    },
    []
  )

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AccessibilityContextValue = {
    preferences,
    updatePreference,
    updatePreferences,
    resetAll,
    resetPreference,
    isModified,
    isLoading,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// ============================================================================
// HOOK FOR CONSUMING CONTEXT
// ============================================================================

/**
 * Hook to access accessibility context
 * Must be used within AccessibilityProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { preferences, updatePreference } = useAccessibility()
 *   
 *   return (
 *     <button onClick={() => updatePreference('contrastMode', preferences.contrastMode === 'normal' ? 'high' : 'normal')}>
 *       Toggle High Contrast
 *     </button>
 *   )
 * }
 * ```
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)

  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider. ' +
        'Wrap your app with <AccessibilityProvider> in your root layout.'
    )
  }

  return context
}
