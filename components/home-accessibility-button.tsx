"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Accessibility, Type, Contrast, ZoomIn, ZoomOut, RotateCcw, X, Pause, Palette, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from "@/lib/types/accessibility"

export function HomeAccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { preferences, updatePreference, resetAll, resetPreference } = useAccessibility()
  
  // Refs for focus management
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Check if individual settings are modified from default
  const isTextScaleModified = preferences.textScale !== DEFAULT_ACCESSIBILITY_PREFERENCES.textScale
  const isLineSpacingModified = preferences.lineSpacing !== DEFAULT_ACCESSIBILITY_PREFERENCES.lineSpacing
  const isLetterSpacingModified = preferences.letterSpacing !== DEFAULT_ACCESSIBILITY_PREFERENCES.letterSpacing
  const isFontFamilyModified = preferences.fontFamily !== DEFAULT_ACCESSIBILITY_PREFERENCES.fontFamily
  const isHighContrastModified = preferences.highContrast !== DEFAULT_ACCESSIBILITY_PREFERENCES.highContrast
  const isReduceMotionModified = preferences.reduceMotion !== DEFAULT_ACCESSIBILITY_PREFERENCES.reduceMotion
  const isSensoryFriendlyModified = preferences.sensoryFriendly !== DEFAULT_ACCESSIBILITY_PREFERENCES.sensoryFriendly

  // Modified indicator component
  const ModifiedIndicator = () => (
    <span 
      className="inline-flex items-center justify-center w-2 h-2 bg-amber-500 rounded-full ring-2 ring-amber-100" 
      aria-label="Modified from default"
      title="Modified from default"
    />
  )

  // Ensure we only render portal on client side
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Focus management: trap focus and return focus on close
  useEffect(() => {
    if (isOpen) {
      // Store what had focus before opening
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus the first interactive element in the panel after a brief delay
      setTimeout(() => {
        const firstButton = panelRef.current?.querySelector('button, input, select') as HTMLElement
        firstButton?.focus()
      }, 100)
    } else if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      // Return focus to the button when closing
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Listen for custom event from footer link
  useEffect(() => {
    const handleOpenPanel = () => {
      setIsOpen(true)
    }
    
    window.addEventListener('openAccessibilityPanel', handleOpenPanel)
    return () => window.removeEventListener('openAccessibilityPanel', handleOpenPanel)
  }, [])

  // Convenience functions for text scale (V2: 1.0-2.0 range)
  const increaseTextSize = () => {
    const newSize = Math.min(2.0, preferences.textScale + 0.1)
    updatePreference('textScale', newSize)
  }

  const decreaseTextSize = () => {
    const newSize = Math.max(1.0, preferences.textScale - 0.1)
    updatePreference('textScale', newSize)
  }

  // Calculate font size percentage for display
  const fontSizePercent = Math.round(preferences.textScale * 100)

  // The actual button and panel JSX
  const buttonContent = (
    <>
      {/* Floating circular button on right side */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "accessibility-button fixed z-50 w-14 h-14 rounded-full shadow-lg transition-shadow duration-300 flex items-center justify-center group",
          isOpen
            ? "bg-primary text-white shadow-xl"
            : "bg-primary text-white hover:shadow-2xl",
          !preferences.sensoryFriendly && "hover:scale-110 transition-transform"
        )}
        style={{ 
          position: 'fixed',
          right: '1.5rem',
          bottom: '1.5rem',
          top: 'auto',
          left: 'auto'
        }}
        aria-label="Accessibility options"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        title="Accessibility options"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Accessibility panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="accessibility-panel"
            className={cn(
              "accessibility-panel fixed z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 sm:p-6 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-140px)] overflow-y-auto",
              !preferences.sensoryFriendly && "animate-in fade-in slide-in-from-bottom-4 duration-300"
            )}
            style={{ 
              position: 'fixed',
              right: '1rem',
              bottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 1.5rem))',
              top: 'auto',
              left: 'auto'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-panel-title"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 id="accessibility-panel-title" className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-primary" />
                Accessibility
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                aria-label="Close accessibility panel"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Type className="w-4 h-4 inline" />
                    <span>Text Size ({fontSizePercent}%)</span>
                    {isTextScaleModified && <ModifiedIndicator />}
                  </label>
                  {isTextScaleModified && (
                    <button
                      onClick={() => resetPreference('textScale')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Reset text size to default"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decreaseTextSize}
                    disabled={preferences.textScale <= 1.0}
                    className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Decrease font size"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${((preferences.textScale - 1.0) / 1.0) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={fontSizePercent}
                      aria-valuemin={100}
                      aria-valuemax={200}
                    />
                  </div>
                  <button
                    onClick={increaseTextSize}
                    disabled={preferences.textScale >= 2.0}
                    className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Increase font size"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="line-spacing-slider"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <span>Line Spacing ({preferences.lineSpacing !== null ? preferences.lineSpacing.toFixed(1) : 'Default'})</span>
                    {isLineSpacingModified && <ModifiedIndicator />}
                  </label>
                  {isLineSpacingModified && (
                    <button
                      onClick={() => resetPreference('lineSpacing')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Reset line spacing to default"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  id="line-spacing-slider"
                  type="range"
                  min="1.5"
                  max="2.5"
                  step="0.1"
                  value={preferences.lineSpacing ?? 1.5}
                  onChange={(e) => updatePreference('lineSpacing', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  aria-label={`Line spacing: ${preferences.lineSpacing !== null ? preferences.lineSpacing.toFixed(1) : 'default'}`}
                  aria-valuemin={1.5}
                  aria-valuemax={2.5}
                  aria-valuenow={preferences.lineSpacing ?? 1.5}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Compact</span>
                  <span>Comfortable</span>
                  <span>Spacious</span>
                </div>
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="letter-spacing-slider"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <span>Letter Spacing ({preferences.letterSpacing !== null ? (preferences.letterSpacing * 100).toFixed(0) + '%' : 'Default'})</span>
                    {isLetterSpacingModified && <ModifiedIndicator />}
                  </label>
                  {isLetterSpacingModified && (
                    <button
                      onClick={() => resetPreference('letterSpacing')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Reset letter spacing to default"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  id="letter-spacing-slider"
                  type="range"
                  min="0"
                  max="0.12"
                  step="0.01"
                  value={preferences.letterSpacing ?? 0}
                  onChange={(e) => updatePreference('letterSpacing', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  aria-label={`Letter spacing: ${preferences.letterSpacing !== null ? (preferences.letterSpacing * 100).toFixed(0) : '0'} percent`}
                  aria-valuemin={0}
                  aria-valuemax={12}
                  aria-valuenow={(preferences.letterSpacing ?? 0) * 100}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Normal</span>
                  <span>Wide</span>
                </div>
              </div>

              {/* High Contrast */}
              <div className="relative">
                <button
                  onClick={() => updatePreference('highContrast', !preferences.highContrast)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all touch-manipulation",
                    preferences.highContrast
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30"
                  )}
                  aria-pressed={preferences.highContrast}
                >
                  <Contrast className="w-5 h-5" />
                  <span className="font-semibold text-sm flex items-center gap-2">
                    High Contrast
                    {isHighContrastModified && <ModifiedIndicator />}
                  </span>
                  <span className={cn(
                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                    preferences.highContrast ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {preferences.highContrast ? "ON" : "OFF"}
                  </span>
                </button>
                {isHighContrastModified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resetPreference('highContrast')
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    aria-label="Reset high contrast to default"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reduced Motion */}
              <div className="relative">
                <button
                  onClick={() => updatePreference('reduceMotion', !preferences.reduceMotion)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all touch-manipulation",
                    preferences.reduceMotion
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30"
                  )}
                  aria-pressed={preferences.reduceMotion}
                >
                  <Pause className="w-5 h-5" />
                  <span className="font-semibold text-sm flex items-center gap-2">
                    Reduce Motion
                    {isReduceMotionModified && <ModifiedIndicator />}
                  </span>
                  <span className={cn(
                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                    preferences.reduceMotion ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {preferences.reduceMotion ? "ON" : "OFF"}
                  </span>
                </button>
                {isReduceMotionModified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resetPreference('reduceMotion')
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    aria-label="Reset reduce motion to default"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sensory-Friendly Mode (replaces old Calming Mode) */}
              <div className="relative">
                <button
                  onClick={() => updatePreference('sensoryFriendly', !preferences.sensoryFriendly)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all touch-manipulation",
                    preferences.sensoryFriendly
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30"
                  )}
                  aria-pressed={preferences.sensoryFriendly}
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-semibold text-sm flex items-center gap-2">
                    Sensory-Friendly Mode
                    {isSensoryFriendlyModified && <ModifiedIndicator />}
                  </span>
                  <span className={cn(
                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                    preferences.sensoryFriendly ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {preferences.sensoryFriendly ? "ON" : "OFF"}
                  </span>
                </button>
                {isSensoryFriendlyModified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resetPreference('sensoryFriendly')
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    aria-label="Reset sensory-friendly mode to default"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Font Family (V2) - Replaces old Dyslexia Font toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="font-family-select"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Type className="w-4 h-4 inline" />
                    <span>Font Family</span>
                    {isFontFamilyModified && <ModifiedIndicator />}
                  </label>
                  {isFontFamilyModified && (
                    <button
                      onClick={() => resetPreference('fontFamily')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Reset font family to default"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <select
                  id="font-family-select"
                  value={preferences.fontFamily}
                  onChange={(e) => updatePreference('fontFamily', e.target.value as 'default' | 'system' | 'opendyslexic')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  aria-label="Choose font family"
                >
                  <option value="default">Default (Site Font)</option>
                  <option value="system">System Font</option>
                  <option value="opendyslexic">OpenDyslexic (Dyslexia-Friendly)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  {preferences.fontFamily === 'default' && 'Using the site\'s designed typography'}
                  {preferences.fontFamily === 'system' && 'Using your device\'s system font'}
                  {preferences.fontFamily === 'opendyslexic' && 'Font designed for better readability'}
                </p>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  resetAll()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-all text-sm font-semibold touch-manipulation"
                aria-label="Reset all accessibility settings to defaults"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
              These settings are saved automatically and persist across pages.
            </p>

            {/* Keyboard shortcuts help */}
            <details className="mt-4 border-t border-slate-200 pt-4">
              <summary className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-primary flex items-center gap-2 transition-colors">
                <Keyboard className="w-4 h-4" />
                Keyboard Shortcuts
              </summary>
              <dl className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Esc</kbd>
                  </dt>
                  <dd className="text-slate-500">Close panel</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Tab</kbd>
                    <span className="text-slate-400">/</span>
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Shift+Tab</kbd>
                  </dt>
                  <dd className="text-slate-500">Navigate controls</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Space</kbd>
                  </dt>
                  <dd className="text-slate-500">Toggle switches</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">↑ ↓</kbd>
                  </dt>
                  <dd className="text-slate-500">Adjust sliders</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-xs">Enter</kbd>
                  </dt>
                  <dd className="text-slate-500">Select dropdown</dd>
                </div>
              </dl>
            </details>
          </div>
        </>
      )}
    </>
  )

  // Use portal to render directly to document.body, bypassing all parent containers
  // This ensures position:fixed works correctly regardless of parent CSS properties
  if (!mounted) return null
  
  return createPortal(buttonContent, document.body)
}
