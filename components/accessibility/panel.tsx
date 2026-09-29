"use client"

import { useState, useEffect, useRef, useSyncExternalStore, type ComponentType } from "react"
import { createPortal } from "react-dom"
import {
  Accessibility,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Pause,
  Palette,
  Keyboard,
  BookOpen,
  Eye,
  Wrench,
  MousePointer2,
} from "lucide-react"
import { ReadingGuideSticker } from "./reading-guide-sticker"
import { TtsControls } from "./tts-controls"
import { TtsMiniPlayer } from "./tts-mini-player"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import { dictionaryAllowedOnPath } from "@/lib/dictionary/terms"
import {
  DICTIONARY_LABELS,
  DICTIONARY_MODES,
  GUIDE_STICKERS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  CURSOR_LABELS,
  CURSOR_MODES,
  CONTRAST_LABELS,
  CONTRAST_MODES,
  FONT_LABELS,
  FONT_MODES,
  WIDGET_POSITIONS,
  WIDGET_POSITION_LABELS,
} from "@/lib/types/accessibility"

const subscribeToMount = () => () => {}
const clientMounted = () => true
const serverMounted = () => false

// Reusable Segmented Control for 1-click toggles
const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  isHighContrast = false,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (val: T) => void
  isHighContrast?: boolean
}) => (
  <div className="flex bg-slate-100/80 p-1 rounded-xl w-full border border-slate-200/60 shadow-inner" role="radiogroup">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role="radio"
        aria-checked={value === opt.value}
        onClick={() => onChange(opt.value)}
        className={cn(
          "flex-1 text-[11px] sm:text-xs font-semibold py-2 px-1 rounded-lg transition-all duration-200 truncate border-[1.5px]",
          value === opt.value
            ? isHighContrast
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-primary shadow-sm border-primary/20 text-shadow-sm"
            : isHighContrast
              ? "text-slate-700 hover:text-slate-900 border-transparent hover:bg-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border-transparent",
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

// Reusable elegant Toggle
const Toggle = ({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  isModified,
  onReset,
  isHighContrast = false,
}: {
  label: string
  description?: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  checked: boolean
  onChange: (val: boolean) => void
  isModified?: boolean
  onReset?: () => void
  isHighContrast?: boolean
}) => (
  <div
    className="relative group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary/20 bg-slate-50/50 transition-colors cursor-pointer"
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={(e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        onChange(!checked)
      }
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "p-1.5 rounded-lg transition-colors border",
          checked
            ? isHighContrast
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-primary text-white shadow-sm border-primary/20"
            : "bg-slate-200 text-slate-500 border-transparent",
        )}
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <span className="text-sm font-bold text-slate-800">{label}</span>
        {description && (
          <span className="block text-[11px] text-slate-500 font-medium leading-tight">{description}</span>
        )}
      </div>
    </div>
    <div
      className={cn(
        "w-11 h-6 shrink-0 rounded-full p-0.5 transition-colors duration-200 relative shadow-inner border-2",
        checked
          ? isHighContrast
            ? "bg-slate-900 border-slate-900"
            : "bg-primary border-primary"
          : "bg-slate-300 border-transparent",
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full shadow-sm transition-transform duration-200 border",
          checked
            ? isHighContrast
              ? "bg-white border-slate-200 translate-x-5"
              : "bg-white border-primary/20 translate-x-5"
            : "bg-white border-slate-200 translate-x-0",
        )}
      />
    </div>
    {isModified && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onReset?.()
        }}
        className="absolute -right-2 -top-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-primary hidden group-hover:flex z-10 p-1 transition-colors relative"
        type="button"
        aria-label="Reset"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    )}
  </div>
)

// Smart modifier indicator with built-in hidden reset functionality
const ModifiedIndicator = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group relative flex items-center justify-center p-1 w-6 h-6 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
    title="Modified setting. Click to restore default."
    aria-label="Restore setting to default"
    type="button"
  >
    <span className="w-2 h-2 bg-amber-500 rounded-full group-hover:scale-0 transition-transform absolute" />
    <RotateCcw className="w-3.5 h-3.5 text-slate-500 scale-0 group-hover:scale-100 transition-transform absolute" />
  </button>
)

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const dictionaryAllowed = dictionaryAllowedOnPath(usePathname())
  const mounted = useSyncExternalStore(subscribeToMount, clientMounted, serverMounted)
  const { preferences, updatePreference, resetAll, resetPreference, isModified, ttsStatus } = useAccessibility()
  const isTtsActive = ttsStatus === "speaking" || ttsStatus === "loading" || ttsStatus === "translating"

  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Modification checks
  const isTextScaleModified = preferences.textScale !== DEFAULT_ACCESSIBILITY_PREFERENCES.textScale
  const isLineSpacingModified = preferences.lineSpacing !== DEFAULT_ACCESSIBILITY_PREFERENCES.lineSpacing
  const isLetterSpacingModified = preferences.letterSpacing !== DEFAULT_ACCESSIBILITY_PREFERENCES.letterSpacing
  const isFontFamilyModified = preferences.fontFamily !== DEFAULT_ACCESSIBILITY_PREFERENCES.fontFamily
  const isHighContrastModified = preferences.contrastMode !== "normal"
  const isReduceMotionModified = preferences.reduceMotion !== DEFAULT_ACCESSIBILITY_PREFERENCES.reduceMotion
  const isSensoryFriendlyModified = preferences.sensoryFriendly !== DEFAULT_ACCESSIBILITY_PREFERENCES.sensoryFriendly
  const isDictionaryModified = preferences.dictionaryMode !== DEFAULT_ACCESSIBILITY_PREFERENCES.dictionaryMode
  const isCursorModified = preferences.cursorMode !== DEFAULT_ACCESSIBILITY_PREFERENCES.cursorMode
  const isBigCursorModified = preferences.bigCursor !== DEFAULT_ACCESSIBILITY_PREFERENCES.bigCursor
  const isWidgetPositionModified = preferences.widgetPosition !== DEFAULT_ACCESSIBILITY_PREFERENCES.widgetPosition

  // Write positioning CSS custom properties to :root so globals.css !important rules
  // respect the user's chosen position instead of locking to bottom-right.
  useEffect(() => {
    const root = document.documentElement
    const pos = preferences.widgetPosition ?? "bottom-right"
    const isRight = pos === "bottom-right" || pos === "middle-right"
    const isBottom = pos === "bottom-right" || pos === "bottom-left"
    const isMiddle = pos === "middle-right" || pos === "middle-left"

    // Button — centered vertically in middle mode via translateY(-50%)
    root.style.setProperty("--a11y-btn-top", isMiddle ? "50%" : "auto")
    root.style.setProperty("--a11y-btn-right", isRight ? "1.5rem" : "auto")
    root.style.setProperty("--a11y-btn-bottom", isBottom ? "1.5rem" : "auto")
    root.style.setProperty("--a11y-btn-left", !isRight ? "1.5rem" : "auto")
    root.style.setProperty("--a11y-btn-transform", isMiddle ? "translateY(-50%)" : "none")

    if (isMiddle) {
      // MIDDLE mode: open panel BESIDE the button (inward from screen edge),
      // vertically centered with the button.
      // Button width = 3.5rem (w-14), gap = 0.75rem, edge = 1.5rem
      // → panel edge offset = 1.5rem + 3.5rem + 0.75rem = 5.75rem
      const panelEdge = "5.75rem"
      root.style.setProperty("--a11y-panel-top", "50%")
      root.style.setProperty("--a11y-panel-right", isRight ? panelEdge : "auto")
      root.style.setProperty("--a11y-panel-left", !isRight ? panelEdge : "auto")
      root.style.setProperty("--a11y-panel-bottom", "auto")
      root.style.setProperty("--a11y-panel-transform", "translateY(-50%)")
    } else {
      // BOTTOM mode: open panel ABOVE the button (existing behaviour, works great)
      root.style.setProperty("--a11y-panel-top", "auto")
      root.style.setProperty("--a11y-panel-right", isRight ? "1rem" : "auto")
      root.style.setProperty("--a11y-panel-left", !isRight ? "1rem" : "auto")
      root.style.setProperty("--a11y-panel-bottom", "max(6rem, calc(env(safe-area-inset-bottom) + 1.5rem))")
      root.style.setProperty("--a11y-panel-transform", "none")
    }

    return () => {
      root.style.removeProperty("--a11y-btn-top")
      root.style.removeProperty("--a11y-btn-right")
      root.style.removeProperty("--a11y-btn-bottom")
      root.style.removeProperty("--a11y-btn-left")
      root.style.removeProperty("--a11y-btn-transform")
      root.style.removeProperty("--a11y-panel-top")
      root.style.removeProperty("--a11y-panel-right")
      root.style.removeProperty("--a11y-panel-bottom")
      root.style.removeProperty("--a11y-panel-left")
      root.style.removeProperty("--a11y-panel-transform")
    }
  }, [preferences.widgetPosition])

  // Option arrays for SegmentedControls
  const contrastOptions = CONTRAST_MODES.map((mode) => ({ value: mode, label: CONTRAST_LABELS[mode] }))
  const fontOptions = FONT_MODES.map((mode) => ({ value: mode, label: FONT_LABELS[mode] }))
  const dictionaryOptions = DICTIONARY_MODES.map((mode) => ({ value: mode, label: DICTIONARY_LABELS[mode] }))
  const cursorOptions = CURSOR_MODES.map((mode) => ({ value: mode, label: CURSOR_LABELS[mode] }))
  const widgetPositionOptions = WIDGET_POSITIONS.map((p) => ({ value: p, label: WIDGET_POSITION_LABELS[p] }))

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current =
        document.activeElement === document.body ? buttonRef.current : (document.activeElement as HTMLElement)
      const focusTimer = setTimeout(() => {
        const firstButton = panelRef.current?.querySelector("button, input, select") as HTMLElement
        firstButton?.focus()
      }, 50)
      return () => clearTimeout(focusTimer)
    } else if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Tab" && isOpen && panelRef.current) {
        const controls = [
          ...panelRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]"),
        ].filter((node) => node.getClientRects().length)
        const first = controls[0],
          last = controls[controls.length - 1]
        if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
          e.preventDefault()
          last?.focus()
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || !panelRef.current.contains(document.activeElement))
        ) {
          e.preventDefault()
          first?.focus()
        }
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  useEffect(() => {
    const handleOpenPanel = () => setIsOpen(true)
    window.addEventListener("openAccessibilityPanel", handleOpenPanel)
    return () => window.removeEventListener("openAccessibilityPanel", handleOpenPanel)
  }, [])

  const fontSizePercent = Math.round(preferences.textScale * 100)

  const buttonContent = (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-tts-ignore=""
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "accessibility-button fixed z-50 w-14 h-14 rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center group",
          isOpen
            ? "bg-primary text-white shadow-xl scale-95 ring-4 ring-primary/20"
            : "bg-primary text-white hover:shadow-2xl hover:scale-105",
        )}
        aria-label="Accessibility options"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-6 h-6 stroke-[2.5]" />
        {isTtsActive && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white" />
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent transition-all"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="accessibility-panel"
            data-tts-panel=""
            data-tts-ignore=""
            className={cn(
              "accessibility-panel fixed z-50 rounded-3xl p-4 sm:p-5 w-[360px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden transition-colors",
              "bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl",
              !preferences.sensoryFriendly && "animate-in fade-in slide-in-from-bottom-6 duration-300 zoom-in-95",
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-panel-title"
          >
            {/* Intelligent Header */}
            <div className="flex flex-col gap-1 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3
                  id="accessibility-panel-title"
                  className="font-extrabold text-slate-800 text-lg flex items-center gap-2.5 tracking-tight"
                >
                  <div className="p-1.5 bg-primary/10 text-primary rounded-xl shadow-sm">
                    <Accessibility className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  Accessibility
                </h3>
                <div className="flex items-center gap-1.5">
                  {isModified && (
                    <button
                      onClick={resetAll}
                      type="button"
                      className="text-[11px] font-bold text-slate-400 hover:text-amber-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-amber-50"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 0. LISTEN TO THIS PAGE (TTS) */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <TtsControls />
            </div>

            <div className="space-y-6 pb-2">
              {/* 1. TYPOGRAPHY */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" strokeWidth={3} /> Typography
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Font Style</label>
                    {isFontFamilyModified && <ModifiedIndicator onClick={() => resetPreference("fontFamily")} />}
                  </div>
                  <SegmentedControl
                    options={fontOptions}
                    value={preferences.fontFamily}
                    onChange={(val) => updatePreference("fontFamily", val)}
                    isHighContrast={isHighContrastModified}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">
                      Text Size <span className="text-slate-400 font-medium ml-1">({fontSizePercent}%)</span>
                    </label>
                    {isTextScaleModified && <ModifiedIndicator onClick={() => resetPreference("textScale")} />}
                  </div>
                  <div className="flex items-center gap-3 p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                    <button
                      type="button"
                      onClick={() => updatePreference("textScale", Math.max(1.0, preferences.textScale - 0.1))}
                      disabled={preferences.textScale <= 1.0}
                      className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                      aria-label="Decrease text size"
                    >
                      <ZoomOut className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 px-1">
                      <input
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.1"
                        value={preferences.textScale}
                        onChange={(e) => updatePreference("textScale", parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-primary cursor-pointer"
                        aria-label="Adjust text size"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updatePreference("textScale", Math.min(2.0, preferences.textScale + 0.1))}
                      disabled={preferences.textScale >= 2.0}
                      className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                      aria-label="Increase text size"
                    >
                      <ZoomIn className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-bold text-slate-700">
                        Line Height{" "}
                        <span className="text-slate-400 font-medium ml-1">({preferences.lineSpacing ?? 1.5})</span>
                      </label>
                      {isLineSpacingModified && <ModifiedIndicator onClick={() => resetPreference("lineSpacing")} />}
                    </div>
                    <div className="flex items-center gap-3 p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                      <button
                        type="button"
                        onClick={() =>
                          updatePreference("lineSpacing", Math.max(1.5, (preferences.lineSpacing ?? 1.5) - 0.1))
                        }
                        disabled={(preferences.lineSpacing ?? 1.5) <= 1.5}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                        aria-label="Decrease line height"
                      >
                        <ZoomOut className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <div className="flex-1 px-1">
                        <input
                          type="range"
                          min="1.5"
                          max="2.5"
                          step="0.1"
                          value={preferences.lineSpacing ?? 1.5}
                          onChange={(e) => updatePreference("lineSpacing", parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-primary cursor-pointer"
                          aria-label="Adjust line height"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePreference("lineSpacing", Math.min(2.5, (preferences.lineSpacing ?? 1.5) + 0.1))
                        }
                        disabled={(preferences.lineSpacing ?? 1.5) >= 2.5}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                        aria-label="Increase line height"
                      >
                        <ZoomIn className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-bold text-slate-700">
                        Character Space{" "}
                        <span className="text-slate-400 font-medium ml-1">({preferences.letterSpacing ?? 0})</span>
                      </label>
                      {isLetterSpacingModified && (
                        <ModifiedIndicator onClick={() => resetPreference("letterSpacing")} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                      <button
                        type="button"
                        onClick={() =>
                          updatePreference("letterSpacing", Math.max(0, (preferences.letterSpacing ?? 0) - 0.01))
                        }
                        disabled={(preferences.letterSpacing ?? 0) <= 0}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                        aria-label="Decrease character space"
                      >
                        <ZoomOut className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <div className="flex-1 px-1">
                        <input
                          type="range"
                          min="0"
                          max="0.12"
                          step="0.01"
                          value={preferences.letterSpacing ?? 0}
                          onChange={(e) => updatePreference("letterSpacing", parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-primary cursor-pointer"
                          aria-label="Adjust character space"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePreference("letterSpacing", Math.min(0.12, (preferences.letterSpacing ?? 0) + 0.01))
                        }
                        disabled={(preferences.letterSpacing ?? 0) >= 0.12}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
                        aria-label="Increase character space"
                      >
                        <ZoomIn className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. VISUALS & FOCUS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-1 border-t border-slate-100/60 mt-2">
                  <Eye className="w-3.5 h-3.5" strokeWidth={3} /> Visuals & Focus
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Contrast</label>
                    {isHighContrastModified && <ModifiedIndicator onClick={() => resetPreference("contrastMode")} />}
                  </div>
                  <SegmentedControl
                    options={contrastOptions}
                    value={preferences.contrastMode}
                    onChange={(val) => updatePreference("contrastMode", val)}
                    isHighContrast={isHighContrastModified}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Toggle
                    label="Sensory-Friendly Mode"
                    description="Mutes bright colors & removes auto-play elements"
                    icon={Palette}
                    checked={preferences.sensoryFriendly}
                    onChange={(val) => updatePreference("sensoryFriendly", val)}
                    isModified={isSensoryFriendlyModified}
                    onReset={() => resetPreference("sensoryFriendly")}
                    isHighContrast={isHighContrastModified}
                  />
                  <Toggle
                    label="Reduce Motion"
                    description="Disables UI animations & slick transitions"
                    icon={Pause}
                    checked={preferences.reduceMotion}
                    onChange={(val) => updatePreference("reduceMotion", val)}
                    isModified={isReduceMotionModified}
                    onReset={() => resetPreference("reduceMotion")}
                    isHighContrast={isHighContrastModified}
                  />
                </div>
              </div>

              {/* 3. ASSISTIVE TOOLS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-1 border-t border-slate-100/60 mt-2">
                  <Wrench className="w-3.5 h-3.5" strokeWidth={3} /> Assistive Tools
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Reading Dictionary</label>
                    {isDictionaryModified && <ModifiedIndicator onClick={() => resetPreference("dictionaryMode")} />}
                  </div>
                  <SegmentedControl
                    options={dictionaryOptions}
                    value={preferences.dictionaryMode}
                    onChange={(val) => updatePreference("dictionaryMode", val)}
                    isHighContrast={isHighContrastModified}
                  />
                  {preferences.dictionaryMode !== "off" && dictionaryAllowed && (
                    <div className="px-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          requestAnimationFrame(() => window.dispatchEvent(new Event("openAccessibilityDictionary")))
                        }}
                        className="text-xs text-primary font-bold hover:underline py-1 flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" strokeWidth={3} /> Look up a word right now
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Toggle
                    label="Large Cursor"
                    description="Increases pointer size for easier tracking"
                    icon={MousePointer2}
                    checked={preferences.bigCursor}
                    onChange={(val) => updatePreference("bigCursor", val)}
                    isModified={isBigCursorModified}
                    onReset={() => resetPreference("bigCursor")}
                    isHighContrast={isHighContrastModified}
                  />
                </div>

                <div className="space-y-1.5 pb-2 pt-1 border-t border-slate-100/60 mt-4">
                  <div className="flex items-center justify-between px-1 mt-2">
                    <label className="text-sm font-bold text-slate-700">Reading Assist</label>
                    {isCursorModified && <ModifiedIndicator onClick={() => resetPreference("cursorMode")} />}
                  </div>
                  <SegmentedControl
                    options={cursorOptions}
                    value={preferences.cursorMode}
                    onChange={(val) => updatePreference("cursorMode", val)}
                    isHighContrast={isHighContrastModified}
                  />

                  {preferences.cursorMode === "guide" && (
                    <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm relative animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-bold text-slate-600 mb-2.5">Choose your reading buddy:</p>
                      <div className="flex flex-wrap gap-2">
                        {GUIDE_STICKERS.map((sticker) => (
                          <button
                            key={sticker.id}
                            type="button"
                            aria-label={sticker.label}
                            title={sticker.label}
                            onClick={() => updatePreference("guideSticker", sticker.id)}
                            className={cn(
                              "h-10 w-10 rounded-lg border-2 p-1 text-xl flex items-center justify-center transition-all bg-white",
                              preferences.guideSticker === sticker.id
                                ? "border-primary ring-2 ring-primary/20 scale-110 shadow-md"
                                : "border-slate-200 hover:border-primary/50",
                            )}
                          >
                            <ReadingGuideSticker id={sticker.id} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. WIDGET POSITION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-1 border-t border-slate-100/60 mt-2">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                  Button Placement
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Widget Position</label>
                    {isWidgetPositionModified && (
                      <ModifiedIndicator onClick={() => resetPreference("widgetPosition")} />
                    )}
                  </div>
                  <SegmentedControl
                    options={widgetPositionOptions}
                    value={preferences.widgetPosition}
                    onChange={(val) => updatePreference("widgetPosition", val)}
                    isHighContrast={isHighContrastModified}
                  />
                  <p className="text-[10px] text-slate-400 px-1 leading-tight">
                    Choose where the <span className="font-semibold">♿ button</span> anchors on your screen.
                  </p>
                </div>
              </div>
            </div>

            <details className="mt-2 border-t border-slate-100 pt-4 group">
              <summary className="text-xs font-bold text-slate-500 cursor-pointer hover:text-primary flex items-center gap-2 transition-colors list-none outline-none">
                <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
              </summary>
              <dl className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono shadow-sm">
                      Esc
                    </kbd>
                  </dt>
                  <dd>Close</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono shadow-sm">
                      Tab
                    </kbd>
                  </dt>
                  <dd>Navigate</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono shadow-sm">
                      Space
                    </kbd>
                  </dt>
                  <dd>Toggle</dd>
                </div>
              </dl>
            </details>
          </div>
        </>
      )}
    </>
  )

  if (!mounted) return null
  return (
    <>
      {createPortal(buttonContent, document.body)}
      <TtsMiniPlayer />
    </>
  )
}
