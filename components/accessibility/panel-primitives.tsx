"use client"

// ── Accessibility Panel Primitives ──────────────────────────────────────────
// Small, dependency-free building blocks for the accessibility panel.
//
// These use native controls (button, input[type=range], select) rather than the
// project's Radix wrappers on purpose: the panel must stay fully operable with
// a keyboard and a screen reader even before any portal/JS-heavy primitive has
// hydrated, and native controls avoid rendering panel content into portals
// outside the panel's own `data-tts-panel` boundary.

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// ── Section wrapper ─────────────────────────────────────────────────────────

export function PanelSection({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  )
}

// ── Transport / action button ───────────────────────────────────────────────

export function ControlButton({
  icon,
  label,
  onClick,
  disabled,
  variant = "secondary",
  className,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary"
          ? "border-primary bg-primary text-white shadow-sm hover:bg-primary/90"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        className
      )}
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      {/* Visible text label: icons alone are not a sufficient affordance. */}
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  )
}

// ── Segmented two-option toggle (used for language) ────────────────────────

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** `lang` attribute so each label is pronounced in its own language. */
  lang?: string
}

export function SegmentedToggle<T extends string>({
  legend,
  icon,
  options,
  value,
  onChange,
}: {
  legend: string
  icon?: ReactNode
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {icon}
        {legend}
      </legend>
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
        {options.map((option) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              lang={option.lang}
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                "min-h-[40px] truncate rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

// ── Switch row ──────────────────────────────────────────────────────────────

export function SwitchRow({
  label,
  description,
  icon,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description?: string
  icon?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-slate-200 bg-white hover:border-primary/30"
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn("shrink-0", checked ? "text-primary" : "text-slate-400")}
        >
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-semibold leading-snug",
            checked ? "text-primary" : "text-slate-700"
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-snug text-slate-500">
            {description}
          </span>
        ) : null}
      </span>

      {/* Visual switch. State is announced via aria-checked on the button, so
          this is decorative. Knob *position* (not just colour) carries the
          state visually, which keeps it readable in forced-colors mode. */}
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-primary bg-primary" : "border-slate-400 bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-200",
            checked ? "left-[21px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  )
}

// ── Range field ─────────────────────────────────────────────────────────────

export function RangeField({
  id,
  label,
  icon,
  value,
  min,
  max,
  step,
  onChange,
  format,
  disabled,
}: {
  id: string
  label: string
  icon?: ReactNode
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  format: (value: number) => string
  disabled?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
        >
          {icon}
          {label}
        </label>
        <span
          aria-hidden="true"
          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700"
        >
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={format(value)}
        className={cn(
          "h-6 w-full cursor-pointer appearance-none bg-transparent",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Track + thumb are styled per-engine; see globals.css for the
          // shared `.a11y-range` rules.
          "a11y-range"
        )}
      />
    </div>
  )
}

// ── Select field ────────────────────────────────────────────────────────────

export function SelectField({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string
  label: string
  icon?: ReactNode
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  disabled?: boolean
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
      >
        {icon}
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-[44px] w-full truncate rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Inline notice ───────────────────────────────────────────────────────────

export function PanelNotice({
  icon,
  tone = "info",
  children,
}: {
  icon?: ReactNode
  tone?: "info" | "warning" | "error"
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed",
        tone === "info" && "border-slate-200 bg-slate-50 text-slate-600",
        tone === "warning" && "border-amber-300 bg-amber-50 text-amber-900",
        tone === "error" && "border-red-300 bg-red-50 text-red-900"
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="mt-px shrink-0">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
