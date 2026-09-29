"use client"

// ── Listen to this page (Streamlined with Progressive Disclosure) ─────────────
// Playback transport, quick language & speed pills, and expandable advanced audio settings.
// Uses the unified accessibility context (contexts/accessibility-provider).

import { useId, useMemo } from "react"
import {
  AlertTriangle,
  AudioLines,
  ChevronDown,
  Gauge,
  Highlighter,
  Info,
  Languages,
  Mic,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Square,
  Volume2,
} from "lucide-react"

import { useAccessibility } from "@/contexts/accessibility-provider"
import { TTS_LIMITS, type SupportedSpeechLocale } from "@/lib/tts/types"
import { cn } from "@/lib/utils"

import { ControlButton, PanelNotice, RangeField, SwitchRow } from "./panel-primitives"
import { FancySelect } from "@/components/ui/fancy-select"

export function TtsControls() {
  const {
    ttsStrings: strings,
    ttsStatus: status,
    ttsIsSupported: isSupported,
    preferences,
    ttsVoices: voices,
    ttsHasVoiceForLocale: hasVoiceForLocale,
    ttsSubstituteVoice: substituteVoice,
    ttsTranslationOutcome: translationOutcome,
    ttsErrorCode: errorCode,
    ttsSectionCount: sectionCount,
    ttsCurrentSectionIndex: currentSectionIndex,
    ttsReadPage: readPage,
    ttsPause: pause,
    ttsResume: resume,
    ttsStop: stop,
    ttsNext: next,
    ttsPrevious: previous,
    ttsRestart: restart,
    setTtsLocale: setLocale,
    setTtsVoice: setVoice,
    setTtsRate: setRate,
    setTtsPitch: setPitch,
    setTtsHighlight: setHighlight,
    setTtsAutoRead: setAutoRead,
  } = useAccessibility()

  const idPrefix = useId()
  const isSpeaking = status === "speaking"
  const isPaused = status === "paused"
  const isActive = isSpeaking || isPaused
  const isBusy = status === "loading" || status === "translating"

  const voiceMissing = hasVoiceForLocale === false
  const disabled = !isSupported || voiceMissing

  const voiceOptions = useMemo(() => {
    const selectedBase = preferences.ttsLocale.split("-")[0]
    return [
      { value: "", label: strings.voiceDefault },
      ...voices.map((voice) => {
        const parts = [voice.name]
        if (!voice.lang.toLowerCase().startsWith(selectedBase ?? "")) {
          parts.push(`— ${describeLanguage(voice.lang, preferences.ttsLocale)}`)
        }
        if (!voice.localService) parts.push("(online)")
        return { value: voice.id, label: parts.join(" ") }
      }),
    ]
  }, [voices, strings.voiceDefault, preferences.ttsLocale])

  const statusLabel = (() => {
    switch (status) {
      case "loading":
        return strings.statusLoading
      case "translating":
        return strings.statusTranslating
      case "speaking":
        return strings.statusSpeaking
      case "paused":
        return strings.statusPaused
      case "finished":
        return strings.statusFinished
      case "error":
      case "unsupported":
        return strings.statusError
      default:
        return strings.statusReady
    }
  })()

  const progressLabel =
    isActive && currentSectionIndex >= 0 && sectionCount > 0
      ? strings.sectionProgress(currentSectionIndex + 1, sectionCount)
      : null

  const errorMessage = (() => {
    if (!isSupported) return strings.unsupported
    if (voiceMissing) return strings.noVoiceInstalled
    switch (errorCode) {
      case "empty-content":
        return strings.nothingToRead
      case "not-allowed":
        return strings.errorBlocked
      case "no-voice":
        return strings.noVoiceInstalled
      case null:
      case undefined:
        return null
      default:
        return strings.errorGeneric
    }
  })()

  const languageOptions: Array<{ value: SupportedSpeechLocale; label: string; lang: string }> = [
    { value: "en-US", label: "English", lang: "en" },
    { value: "ne-NP", label: "नेपाली", lang: "ne" },
  ]

  const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5]

  return (
    <div className="space-y-3">
      {/* ── Header: Title + Language Toggle in One Row ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Volume2 aria-hidden="true" className="size-4" />
          </div>
          <span className="text-sm font-extrabold text-slate-800">{strings.listenToPage}</span>
        </div>

        {/* Compact Segmented Language Pills */}
        <div className="flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label={strings.language}>
          {languageOptions.map((opt) => {
            const isSelected = preferences.ttsLocale === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                lang={opt.lang}
                onClick={() => setLocale(opt.value)}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-md transition-all",
                  isSelected
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50",
                )}
                aria-pressed={isSelected}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Status Banner (only shown during active playback, loading, or errors) ── */}
      {(isActive || isBusy || status === "finished" || status === "error" || status === "unsupported") && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
            status === "error" || status === "unsupported"
              ? "bg-red-50 text-red-800"
              : isActive || isBusy
                ? "bg-primary/10 text-primary"
                : "bg-slate-100 text-slate-600",
          )}
        >
          <AudioLines aria-hidden="true" className={cn("size-3.5 shrink-0", isSpeaking && "animate-pulse")} />
          <span className="min-w-0 truncate">
            {statusLabel}
            {progressLabel ? ` · ${progressLabel}` : ""}
          </span>
        </div>
      )}

      {/* ── Error & Translation Notices ── */}
      {errorMessage ? (
        <PanelNotice
          tone={voiceMissing || !isSupported ? "warning" : "error"}
          icon={<AlertTriangle className="size-4" />}
        >
          <p className="font-semibold">{errorMessage}</p>
          {voiceMissing ? <p className="mt-1 opacity-90">{strings.noVoiceHelp}</p> : null}
        </PanelNotice>
      ) : null}

      {!errorMessage && translationOutcome !== "none" ? (
        <PanelNotice tone="warning" icon={<Languages className="size-4" />}>
          <p className="font-semibold">
            {translationOutcome === "failed" ? strings.translationFailedTitle : strings.translationPartialTitle}
          </p>
          <p className="mt-1 opacity-90">
            {translationOutcome === "failed" ? strings.translationFailedHelp : strings.translationPartialHelp}
          </p>
        </PanelNotice>
      ) : null}

      {!errorMessage && substituteVoice ? (
        <PanelNotice tone="warning" icon={<Languages className="size-4" />}>
          <p className="font-semibold">
            {strings.substituteVoiceTitle(describeLanguage(substituteVoice.lang, preferences.ttsLocale))}
          </p>
          <p className="mt-1 opacity-90">{strings.substituteVoiceHelp}</p>
        </PanelNotice>
      ) : null}

      {/* ── Primary Action / Transport ── */}
      {!isActive ? (
        <div className="space-y-2">
          {/* Reads from the section currently on screen (top of page → whole page). */}
          <button
            type="button"
            onClick={readPage}
            disabled={disabled || isBusy}
            className={cn(
              "flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all",
              "hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Play aria-hidden="true" className="size-4 shrink-0 fill-current" />
            {strings.readPage}
          </button>
          {status === "finished" ? (
            <button
              type="button"
              onClick={restart}
              disabled={disabled || isBusy}
              className={cn(
                "flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors",
                "hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Repeat aria-hidden="true" className="size-3.5" />
              {strings.restart}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            <ControlButton
              icon={<SkipBack className="size-4" />}
              label={strings.previousSection}
              onClick={previous}
              disabled={disabled || !isActive}
            />
            {isPaused ? (
              <ControlButton
                variant="primary"
                icon={<Play className="size-4 fill-current" />}
                label={strings.resume}
                onClick={resume}
                disabled={disabled}
              />
            ) : (
              <ControlButton
                variant="primary"
                icon={<Pause className="size-4 fill-current" />}
                label={strings.pause}
                onClick={pause}
                disabled={disabled || !isSpeaking}
              />
            )}
            <ControlButton
              icon={<Square className="size-4 fill-current" />}
              label={strings.stop}
              onClick={stop}
              disabled={disabled || !isActive}
            />
            <ControlButton
              icon={<SkipForward className="size-4" />}
              label={strings.nextSection}
              onClick={next}
              disabled={disabled || !isActive}
            />
          </div>

          <button
            type="button"
            onClick={restart}
            disabled={disabled}
            className={cn(
              "flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors",
              "hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Repeat aria-hidden="true" className="size-3.5" />
            {strings.restart}
          </button>
        </div>
      )}

      {/* ── Quick Speed Selector Row ── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Gauge aria-hidden="true" className="size-3.5 text-slate-400" />
          {strings.speed}
        </span>
        <div className="flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label={strings.speed}>
          {SPEED_PRESETS.map((rateVal) => {
            const isSelected = Math.abs(preferences.ttsRate - rateVal) < 0.05
            return (
              <button
                key={rateVal}
                type="button"
                onClick={() => setRate(rateVal)}
                disabled={disabled}
                className={cn(
                  "px-2 py-0.5 text-xs font-bold rounded-md transition-all tabular-nums",
                  isSelected
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
                )}
                aria-pressed={isSelected}
              >
                {rateVal}×
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Progressive Disclosure: Voice & Advanced Settings ── */}
      <details className="group rounded-xl border border-slate-200/80 bg-slate-50/50 transition-colors open:bg-white open:border-slate-300">
        <summary className="flex cursor-pointer select-none items-center justify-between px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal
              aria-hidden="true"
              className="size-3.5 text-slate-400 group-open:text-primary transition-colors"
            />
            Voice & Advanced Settings
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>

        <div className="space-y-3.5 border-t border-slate-100 p-3 pt-3">
          {/* Voice Select */}
          <div className="min-w-0">
            <label
              id={`${idPrefix}-voice-label`}
              className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
            >
              <Mic aria-hidden="true" className="size-3.5" />
              {strings.voice}
            </label>
            <FancySelect
              id={`${idPrefix}-voice`}
              aria-labelledby={`${idPrefix}-voice-label`}
              size="sm"
              value={preferences.ttsVoiceId ?? ""}
              onValueChange={(value) => setVoice(value === "" ? null : value)}
              options={voiceOptions}
              disabled={disabled || voices.length === 0}
              placeholder={strings.voiceDefault}
            />
          </div>

          {/* Pitch Range */}
          <RangeField
            id={`${idPrefix}-pitch`}
            label={strings.pitch}
            icon={<AudioLines aria-hidden="true" className="size-3.5" />}
            value={preferences.ttsPitch}
            min={TTS_LIMITS.minPitch}
            max={TTS_LIMITS.maxPitch}
            step={0.05}
            onChange={setPitch}
            format={(v) => v.toFixed(2).replace(/0$/, "")}
            disabled={disabled}
          />

          {/* Highlight & Auto-read switches */}
          <div className="space-y-2">
            <SwitchRow
              label={strings.highlightSpokenText}
              icon={<Highlighter className="size-[18px]" />}
              checked={preferences.ttsHighlight}
              onChange={setHighlight}
            />
            <SwitchRow
              label={strings.autoReadNewPages}
              description={strings.autoReadHint}
              icon={<Repeat className="size-[18px]" />}
              checked={preferences.ttsAutoRead}
              onChange={setAutoRead}
              disabled={disabled}
            />
          </div>

          <PanelNotice icon={<Info className="size-4" />}>{strings.keyboardHint}</PanelNotice>
        </div>
      </details>
    </div>
  )
}

function describeLanguage(tag: string, displayLocale: SupportedSpeechLocale) {
  try {
    const names = new Intl.DisplayNames([displayLocale], { type: "language" })
    return names.of(tag) ?? tag
  } catch {
    return tag
  }
}
