"use client"

// ── Listen to this page ─────────────────────────────────────────────────────
// Playback transport, language, voice, speed and highlight controls.

import { useId, useMemo } from "react"
import {
  AlertTriangle,
  AudioLines,
  Gauge,
  Globe,
  Highlighter,
  Info,
  Languages,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Repeat,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react"

import { useAccessibility } from "@/contexts/AccessibilityContext"
import { TTS_LIMITS, type SupportedSpeechLocale } from "@/lib/tts/types"
import { cn } from "@/lib/utils"

import {
  ControlButton,
  PanelNotice,
  RangeField,
  SegmentedToggle,
  SelectField,
  SwitchRow,
} from "./panel-primitives"

export function TtsControls() {
  const {
    strings,
    status,
    isSupported,
    preferences,
    voices,
    hasVoiceForLocale,
    substituteVoice,
    translationOutcome,
    errorCode,
    sectionCount,
    currentSectionIndex,
    readPage,
    pause,
    resume,
    stop,
    next,
    previous,
    restart,
    setLocale,
    setVoice,
    setRate,
    setPitch,
    setHighlight,
    setAutoRead,
  } = useAccessibility()

  const idPrefix = useId()
  const isSpeaking = status === "speaking"
  const isPaused = status === "paused"
  const isActive = isSpeaking || isPaused
  const isBusy = status === "loading" || status === "translating"

  // A missing voice is only blocking once we have actually checked.
  const voiceMissing = hasVoiceForLocale === false
  const disabled = !isSupported || voiceMissing

  const voiceOptions = useMemo(() => {
    const selectedBase = preferences.locale.split("-")[0]
    return [
      { value: "", label: strings.voiceDefault },
      ...voices.map((voice) => {
        const parts = [voice.name]
        // Flag same-script stand-ins so a Hindi voice in the Nepali list is
        // obviously a compromise rather than a mislabelled Nepali voice.
        if (!voice.lang.toLowerCase().startsWith(selectedBase)) {
          parts.push(`— ${describeLanguage(voice.lang, preferences.locale)}`)
        }
        if (!voice.localService) parts.push("(online)")
        return { value: voice.id, label: parts.join(" ") }
      }),
    ]
  }, [voices, strings.voiceDefault, preferences.locale])

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
        return strings.statusError
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

  const languageOptions: Array<{
    value: SupportedSpeechLocale
    label: string
    lang: string
  }> = [
    { value: "en-US", label: "English", lang: "en" },
    { value: "ne-NP", label: "नेपाली", lang: "ne" },
  ]

  return (
    <div className="space-y-4">
      {/* Heading card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
        <h3 className="flex items-center gap-2.5 text-base font-bold leading-snug text-slate-900">
          <Volume2 aria-hidden="true" className="size-5 shrink-0 text-primary" />
          {strings.listenToPage}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {strings.listenHint}
        </p>
      </div>

      {/* Status + progress. One polite live region for the whole feature. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold",
          status === "error" || status === "unsupported"
            ? "bg-red-50 text-red-800"
            : isActive || isBusy
              ? "bg-primary/10 text-primary"
              : "bg-slate-100 text-slate-600"
        )}
      >
        {isSpeaking ? (
          <AudioLines aria-hidden="true" className="size-4 shrink-0 animate-pulse" />
        ) : status === "error" || status === "unsupported" ? (
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <AudioLines aria-hidden="true" className="size-4 shrink-0" />
        )}
        <span className="min-w-0 truncate">
          {statusLabel}
          {progressLabel ? ` · ${progressLabel}` : ""}
        </span>
      </div>

      {errorMessage ? (
        <PanelNotice
          tone={voiceMissing || !isSupported ? "warning" : "error"}
          icon={<AlertTriangle className="size-4" />}
        >
          <p className="font-semibold">{errorMessage}</p>
          {voiceMissing ? (
            <p className="mt-1 opacity-90">{strings.noVoiceHelp}</p>
          ) : null}
        </PanelNotice>
      ) : null}

      {/* Nepali playback stops when any section remains untranslated. */}
      {!errorMessage && translationOutcome !== "none" ? (
        <PanelNotice tone="warning" icon={<Languages className="size-4" />}>
          <p className="font-semibold">
            {translationOutcome === "failed"
              ? strings.translationFailedTitle
              : strings.translationPartialTitle}
          </p>
          <p className="mt-1 opacity-90">
            {translationOutcome === "failed"
              ? strings.translationFailedHelp
              : strings.translationPartialHelp}
          </p>
        </PanelNotice>
      ) : null}

      {/* Same-script stand-in (a Hindi voice reading Nepali). Disclosed rather
          than applied silently, so nobody mistakes the accent for Nepali. */}
      {!errorMessage && substituteVoice ? (
        <PanelNotice tone="warning" icon={<Languages className="size-4" />}>
          <p className="font-semibold">
            {strings.substituteVoiceTitle(
              describeLanguage(substituteVoice.lang, preferences.locale)
            )}
          </p>
          <p className="mt-1 opacity-90">{strings.substituteVoiceHelp}</p>
        </PanelNotice>
      ) : null}

      {/* Primary action. A user gesture here is what unlocks audio. */}
      {!isActive ? (
        <button
          type="button"
          onClick={readPage}
          disabled={disabled || isBusy}
          className={cn(
            "flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors",
            "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <Play aria-hidden="true" className="size-5 shrink-0" />
          {status === "finished" ? strings.restart : strings.readPage}
        </button>
      ) : null}

      {/* Transport. 4-up on every breakpoint; labels stay visible. */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <ControlButton
          icon={<SkipBack className="size-5" />}
          label={strings.previousSection}
          onClick={previous}
          disabled={disabled || !isActive}
        />
        {isPaused ? (
          <ControlButton
            variant="primary"
            icon={<Play className="size-5" />}
            label={strings.resume}
            onClick={resume}
            disabled={disabled}
          />
        ) : (
          <ControlButton
            variant="primary"
            icon={<Pause className="size-5" />}
            label={strings.pause}
            onClick={pause}
            disabled={disabled || !isSpeaking}
          />
        )}
        <ControlButton
          icon={<Square className="size-5" />}
          label={strings.stop}
          onClick={stop}
          disabled={disabled || !isActive}
        />
        <ControlButton
          icon={<SkipForward className="size-5" />}
          label={strings.nextSection}
          onClick={next}
          disabled={disabled || !isActive}
        />
      </div>

      {isActive ? (
        <button
          type="button"
          onClick={restart}
          disabled={disabled}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition-colors",
            "hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <Repeat aria-hidden="true" className="size-4" />
          {strings.restart}
        </button>
      ) : null}

      {/* Language */}
      <SegmentedToggle
        legend={strings.language}
        icon={<Globe aria-hidden="true" className="size-3.5" />}
        options={languageOptions}
        value={preferences.locale}
        onChange={setLocale}
      />

      {/* Voice */}
      <SelectField
        id={`${idPrefix}-voice`}
        label={strings.voice}
        icon={<Mic aria-hidden="true" className="size-3.5" />}
        value={preferences.voiceId ?? ""}
        onChange={(value) => setVoice(value === "" ? null : value)}
        options={voiceOptions}
        disabled={disabled || voices.length === 0}
      />

      {/* Speed */}
      <RangeField
        id={`${idPrefix}-rate`}
        label={strings.speed}
        icon={<Gauge aria-hidden="true" className="size-3.5" />}
        value={preferences.rate}
        min={TTS_LIMITS.minRate}
        max={TTS_LIMITS.maxRate}
        step={0.05}
        onChange={setRate}
        format={(value) => `${value.toFixed(2).replace(/0$/, "")}×`}
        disabled={disabled}
      />

      {/* Pitch */}
      <RangeField
        id={`${idPrefix}-pitch`}
        label={strings.pitch}
        icon={<AudioLines aria-hidden="true" className="size-3.5" />}
        value={preferences.pitch}
        min={TTS_LIMITS.minPitch}
        max={TTS_LIMITS.maxPitch}
        step={0.05}
        onChange={setPitch}
        format={(value) => value.toFixed(2).replace(/0$/, "")}
        disabled={disabled}
      />

      {/* Highlight + auto-read */}
      <div className="space-y-2">
        <SwitchRow
          label={strings.highlightSpokenText}
          icon={<Highlighter className="size-[18px]" />}
          checked={preferences.highlight}
          onChange={setHighlight}
        />
        <SwitchRow
          label={strings.autoReadNewPages}
          description={strings.autoReadHint}
          icon={<Repeat className="size-[18px]" />}
          checked={preferences.autoRead}
          onChange={setAutoRead}
          disabled={disabled}
        />
      </div>

      <PanelNotice icon={<Info className="size-4" />}>
        {strings.keyboardHint}
      </PanelNotice>
    </div>
  )
}

/**
 * Human-readable language name for a BCP-47 tag, in the panel's own language —
 * so a Nepali visitor reads "हिन्दी", not "hi-IN". Falls back to the raw tag on
 * the rare engine without Intl.DisplayNames.
 */
function describeLanguage(tag: string, displayLocale: SupportedSpeechLocale) {
  try {
    const names = new Intl.DisplayNames([displayLocale], { type: "language" })
    return names.of(tag) ?? tag
  } catch {
    return tag
  }
}
