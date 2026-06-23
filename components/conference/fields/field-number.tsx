"use client"

import type { FieldProps } from "./index"

export function FieldNumber({ field, value, error, onChange, onBlur }: FieldProps) {
  const numVal = value != null ? String(value) : ""
  return (
    <div className="flex flex-col gap-1.5">
      {field.label && (
        <label htmlFor={field.id} className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      )}
      {field.helpText && (
        <p className="text-xs text-foreground-muted">{field.helpText}</p>
      )}
      <input
        id={field.id}
        type="number"
        value={numVal}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        min={field.validation?.min}
        max={field.validation?.max}
        inputMode="numeric"
        className={`h-14 w-full rounded-xl border bg-background px-4 text-base text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border focus:border-primary focus:ring-primary/20"
        }`}
      />
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
