"use client"

// ── Floating TTS Mini-Player Dock ─────────────────────────────────────────────
// A lightweight, detached audio pill that floats at the bottom of the screen
// whenever text-to-speech is active, allowing visitors to listen, pause, skip,
// and adjust speed while reading without having the full panel blocking the page.

import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AudioLines, Loader2, Pause, Play, SkipBack, SkipForward, SlidersHorizontal, Square } from "lucide-react"

import { useAccessibility } from "@/contexts/accessibility-provider"
import { cn } from "@/lib/utils"

const subscribeToMount = () => () => {}
const clientMounted = () => true
const serverMounted = () => false

export function TtsMiniPlayer() {
  const mounted = useSyncExternalStore(subscribeToMount, clientMounted, serverMounted)
  const {
    ttsStatus: status,
    ttsStrings: strings,
    ttsSectionCount: sectionCount,
    ttsCurrentSectionIndex: currentSectionIndex,
    preferences,
    ttsPause: pause,
    ttsResume: resume,
    ttsStop: stop,
    ttsNext: next,
    ttsPrevious: previous,
    setTtsRate: setRate,
  } = useAccessibility()

  if (!mounted) return null

  const isSpeaking = status === "speaking"
  const isPaused = status === "paused"
  const isBusy = status === "loading" || status === "translating"
  const isTtsActive = isSpeaking || isPaused || isBusy

  if (!isTtsActive) return null

  const progressLabel =
    currentSectionIndex >= 0 && sectionCount > 0 ? `${currentSectionIndex + 1}/${sectionCount}` : null

  const cycleSpeed = () => {
    const SPEEDS = [0.75, 1.0, 1.25, 1.5]
    const currentIndex = SPEEDS.findIndex((s) => Math.abs(s - preferences.ttsRate) < 0.05)
    const nextSpeed = SPEEDS[(currentIndex + 1) % SPEEDS.length] ?? 1.0
    setRate(nextSpeed)
  }

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent("openAccessibilityPanel"))
  }

  const content = (
    <div
      role="region"
      aria-label="Audio reader controls"
      data-tts-panel=""
      data-tts-ignore=""
      className={cn(
        "fixed z-50 bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2",
        "w-[calc(100vw-1.5rem)] sm:w-auto max-w-md",
        "flex items-center justify-between sm:justify-start gap-2 sm:gap-3",
        "px-3.5 py-2.5 rounded-2xl sm:rounded-full",
        "bg-slate-900/95 text-white backdrop-blur-xl shadow-2xl border border-white/10",
        "animate-in fade-in slide-in-from-bottom-5 duration-300",
      )}
    >
      {/* ── Status Indicator & Section Counter ── */}
      <div className="flex items-center gap-2 pl-1 pr-1.5 shrink-0 min-w-0">
        {isBusy ? (
          <Loader2 className="size-4 animate-spin text-amber-400 shrink-0" aria-hidden="true" />
        ) : isSpeaking ? (
          <AudioLines className="size-4 text-emerald-400 animate-pulse shrink-0" aria-hidden="true" />
        ) : (
          <Pause className="size-4 text-amber-400 shrink-0" aria-hidden="true" />
        )}

        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[11px] font-bold text-slate-200 truncate">
            {status === "translating"
              ? "Translating..."
              : status === "loading"
                ? "Loading voice..."
                : isPaused
                  ? "Paused"
                  : "Reading"}
          </span>
          {progressLabel && (
            <span className="text-[10px] font-medium text-slate-400 tabular-nums">Section {progressLabel}</span>
          )}
        </div>
      </div>

      <div className="h-6 w-px bg-white/15 shrink-0" aria-hidden="true" />

      {/* ── Transport Buttons ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Previous */}
        <button
          type="button"
          onClick={previous}
          disabled={isBusy}
          aria-label={strings.previousSection}
          className="flex size-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SkipBack className="size-3.5 fill-current" />
        </button>

        {/* Play / Pause Toggle */}
        {isPaused ? (
          <button
            type="button"
            onClick={resume}
            disabled={isBusy}
            aria-label={strings.resume}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play className="size-4 fill-current ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            disabled={isBusy}
            aria-label={strings.pause}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Pause className="size-4 fill-current" />
          </button>
        )}

        {/* Next */}
        <button
          type="button"
          onClick={next}
          disabled={isBusy}
          aria-label={strings.nextSection}
          className="flex size-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SkipForward className="size-3.5 fill-current" />
        </button>

        {/* Stop */}
        <button
          type="button"
          onClick={stop}
          aria-label={strings.stop}
          className="flex size-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Square className="size-3.5 fill-current" />
        </button>
      </div>

      <div className="h-6 w-px bg-white/15 shrink-0" aria-hidden="true" />

      {/* ── Speed Quick Toggle & Settings Trigger ── */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={cycleSpeed}
          title="Change playback speed"
          aria-label={`Playback speed: ${preferences.ttsRate}x. Click to change.`}
          className="flex h-7 items-center justify-center rounded-lg bg-white/10 px-2 text-[11px] font-bold text-slate-200 transition-colors hover:bg-white/20 hover:text-white tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {preferences.ttsRate}×
        </button>

        <button
          type="button"
          onClick={openSettings}
          title="Open accessibility settings"
          aria-label="Open accessibility settings"
          className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
