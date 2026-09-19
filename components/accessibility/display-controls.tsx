"use client"

// ── Display & Motion Controls ───────────────────────────────────────────────
// The pre-existing accessibility features (text size, high contrast, reduce
// motion, calming mode, reset), now reading and writing the shared
// AccessibilityContext so they persist across routes alongside TTS settings.

import {
  Contrast,
  MonitorPause,
  Palette,
  RotateCcw,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { useAccessibility } from "@/contexts/AccessibilityContext"
import { TEXT_SIZE_RANGE } from "@/lib/tts/preferences"
import { cn } from "@/lib/utils"

import { PanelSection, SwitchRow } from "./panel-primitives"

export function DisplayControls() {
  const {
    strings,
    preferences,
    setTextSize,
    setHighContrast,
    setReduceMotion,
    setCalmingMode,
    resetAll,
  } = useAccessibility()

  const { textSize } = preferences
  const atMin = textSize <= TEXT_SIZE_RANGE.min
  const atMax = textSize >= TEXT_SIZE_RANGE.max
  const fillPercent =
    ((textSize - TEXT_SIZE_RANGE.min) /
      (TEXT_SIZE_RANGE.max - TEXT_SIZE_RANGE.min)) *
    100

  return (
    <div className="space-y-4">
      <PanelSection
        title={`${strings.textSize} (${textSize}%)`}
        icon={<Type aria-hidden="true" className="size-3.5" />}
      >
        <div className="flex items-center gap-2.5">
          <StepButton
            label={strings.decreaseTextSize}
            disabled={atMin}
            onClick={() => setTextSize(textSize - TEXT_SIZE_RANGE.step)}
            icon={<ZoomOut aria-hidden="true" className="size-4" />}
          />
          {/* Decorative: the accessible value lives on the buttons' labels
              and the heading above. */}
          <div
            aria-hidden="true"
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <StepButton
            label={strings.increaseTextSize}
            disabled={atMax}
            onClick={() => setTextSize(textSize + TEXT_SIZE_RANGE.step)}
            icon={<ZoomIn aria-hidden="true" className="size-4" />}
          />
        </div>
      </PanelSection>

      <div className="space-y-2">
        <SwitchRow
          label={strings.highContrast}
          icon={<Contrast className="size-[18px]" />}
          checked={preferences.highContrast}
          onChange={setHighContrast}
        />
        <SwitchRow
          label={strings.reduceMotion}
          icon={<MonitorPause className="size-[18px]" />}
          checked={preferences.reduceMotion}
          onChange={setReduceMotion}
        />
        <SwitchRow
          label={strings.calmingMode}
          icon={<Palette className="size-[18px]" />}
          checked={preferences.calmingMode}
          onChange={setCalmingMode}
        />
      </div>

      <button
        type="button"
        onClick={resetAll}
        className={cn(
          "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors",
          "hover:border-slate-400 hover:text-slate-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        {strings.resetAll}
      </button>
    </div>
  )
}

function StepButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      {icon}
    </button>
  )
}
