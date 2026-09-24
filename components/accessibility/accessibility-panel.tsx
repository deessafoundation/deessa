"use client"

// ── Accessibility Panel ─────────────────────────────────────────────────────
// The single accessibility launcher + panel for public pages.
//
// The panel is intentionally NON-modal: visitors need to see the highlighted
// section being read while the controls stay open, and they must be able to Tab
// out into the page. So there is no focus trap and no opaque backdrop — just
// Escape to close, click-outside to dismiss, and focus return to the launcher.

import { useCallback, useEffect, useId, useRef } from "react"
import { Accessibility, Settings2, Volume2, X } from "lucide-react"

import { useAccessibility } from "@/contexts/AccessibilityContext"
import { htmlLangFor } from "@/lib/tts/i18n"
import { cn } from "@/lib/utils"

import { DisplayControls } from "./display-controls"
import { TtsControls } from "./tts-controls"

export function AccessibilityPanel() {
  const {
    isPanelOpen,
    openPanel,
    closePanel,
    launcherRef,
    strings,
    preferences,
    status,
    stop,
    pause,
    resume,
    next,
    previous,
  } = useAccessibility()

  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const wasOpenRef = useRef(false)

  const isActive = status === "speaking" || status === "paused"
  const panelLang = htmlLangFor(preferences.locale)

  // ── Focus management ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isPanelOpen) {
      wasOpenRef.current = true
      // Move focus into the panel so keyboard users land on the controls.
      panelRef.current?.focus()
      return
    }
    // Only pull focus back if we are closing a panel the user had opened,
    // otherwise we would steal focus on first render.
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      launcherRef.current?.focus()
    }
  }, [isPanelOpen, launcherRef])

  // ── Dismiss on outside interaction ───────────────────────────────────────

  useEffect(() => {
    if (!isPanelOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (launcherRef.current?.contains(target)) return
      closePanel()
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isPanelOpen, closePanel, launcherRef])

  // Escape also works after the visitor has tabbed out of the panel into the
  // page, which is a supported flow because the panel is non-modal.
  useEffect(() => {
    if (!isPanelOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (panelRef.current?.contains(event.target as Node)) return

      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      // Let text entry and other dialogs handle their own Escape first.
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return
      }
      if (target?.closest("[role='dialog']")) return

      if (isActive) stop()
      else closePanel()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isPanelOpen, isActive, stop, closePanel])

  // ── Panel-scoped keyboard shortcuts ──────────────────────────────────────

  const onPanelKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      const isTextEntry =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable === true

      if (event.key === "Escape") {
        event.preventDefault()
        // Escape stops speech first; a second press closes the panel.
        if (isActive) stop()
        else closePanel()
        return
      }

      if (isTextEntry) return

      // Space must keep activating a focused button.
      if (event.key === " " && tag !== "BUTTON") {
        event.preventDefault()
        if (status === "speaking") pause()
        else if (status === "paused") resume()
        return
      }

      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault()
        next()
        return
      }
      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault()
        previous()
      }
    },
    [isActive, status, stop, closePanel, pause, resume, next, previous]
  )

  return (
    <>
      {/* ── Launcher ─────────────────────────────────────────────────────── */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isPanelOpen ? closePanel() : openPanel())}
        aria-expanded={isPanelOpen}
        aria-controls={panelId}
        aria-label={isPanelOpen ? strings.close : strings.open}
        title={isPanelOpen ? strings.close : strings.open}
        data-tts-ignore=""
        className={cn(
          "fixed right-0 top-[42%] z-[60] flex -translate-y-1/2 items-center gap-1.5 max-sm:bottom-24 max-sm:right-3 max-sm:top-auto max-sm:z-40 max-sm:translate-y-0",
          "rounded-l-2xl bg-primary py-3.5 pl-3 pr-2.5 text-white shadow-lg max-sm:rounded-full max-sm:p-2.5",
          "transition-[padding,background-color] duration-200",
          "hover:bg-primary/90 sm:hover:pr-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isActive && "ring-2 ring-white/70"
        )}
      >
        <Accessibility aria-hidden="true" className="size-6 shrink-0" />
        <span
          aria-hidden="true"
          className="hidden text-[11px] font-bold tracking-wide sm:block"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {strings.accessibility}
        </span>
        {/* Speaking indicator, so the launcher reflects playback when closed. */}
        {isActive ? (
          <span
            aria-hidden="true"
            className="absolute -left-1 top-2 flex size-3 items-center justify-center"
          >
            <span className="absolute inline-flex size-3 animate-ping rounded-full bg-white/80" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
        ) : null}
      </button>

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {isPanelOpen ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={strings.accessibility}
          lang={panelLang}
          tabIndex={-1}
          onKeyDown={onPanelKeyDown}
          data-tts-panel=""
          data-tts-ignore=""
          className={cn(
            // Mobile: bottom sheet.
            "fixed inset-x-0 bottom-0 z-[70] flex max-h-[86dvh] flex-col",
            "rounded-t-3xl border border-slate-200 bg-white shadow-2xl",
            "focus-visible:outline-none",
            // Tablet and up: floating card anchored to the right edge, clear of
            // the launcher tab.
            "sm:inset-x-auto sm:bottom-auto sm:right-16 sm:top-1/2 sm:max-h-[88vh] sm:w-[380px]",
            "sm:-translate-y-1/2 sm:rounded-2xl",
            "lg:w-[400px]",
            "motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-200",
            "motion-safe:sm:slide-in-from-right"
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 rounded-t-3xl bg-primary px-4 py-3.5 text-white sm:rounded-t-2xl sm:px-5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20"
            >
              <Accessibility className="size-5" />
            </span>
            <h2 className="min-w-0 flex-1 text-base font-bold leading-tight sm:text-lg">
              <span lang="en">Accessibility</span>
              <span aria-hidden="true" className="px-1.5 opacity-60">
                /
              </span>
              <span lang="ne">पहुँचयोग्यता</span>
            </h2>
            <button
              type="button"
              onClick={closePanel}
              aria-label={strings.close}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                "hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              )}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            <TtsControls />

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                <Settings2 aria-hidden="true" className="size-3.5" />
                {strings.display}
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <DisplayControls />

            <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
              <Volume2 aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {strings.footerNote}
            </p>
          </div>

          {/* Safe-area padding for phones with a home bar. */}
          <div
            aria-hidden="true"
            className="h-[env(safe-area-inset-bottom)] shrink-0 sm:hidden"
          />
        </div>
      ) : null}
    </>
  )
}
