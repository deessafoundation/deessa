"use client"

import type { FormField } from "@/lib/types/conference-form-schema"
import type { FieldProps } from "./index"

export function FieldTextarea({ field, value, error, onChange, onBlur }: FieldProps) {
  const strVal = typeof value === "string" ? value : String(value ?? "")
  const charCount = strVal.length
  const minLength = field.validation?.minLength
  const maxLength = field.validation?.maxLength

  const getCharCountColor = () => {
    if (maxLength && charCount > maxLength) return "text-red-500"
    if (minLength && charCount < minLength) return "text-amber-500"
    return "text-black/30"
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field.label && (
        <label htmlFor={field.id} className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span aria-hidden="true" className="text-red-500">*</span>}
        </label>
      )}
      {field.helpText && (
        <p id={`${field.id}-help`} className="text-xs text-foreground-muted">{field.helpText}</p>
      )}
      <textarea
        id={field.id}
        aria-required={field.required}
        aria-invalid={!!error}
        aria-describedby={[field.helpText ? `${field.id}-help` : null, error ? `${field.id}-error` : null].filter(Boolean).join(" ") || undefined}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        rows={4}
        maxLength={maxLength}
        className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-base text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border focus:border-primary focus:ring-primary/20"
        }`}
      />
      {(minLength !== undefined || maxLength !== undefined) && (
        <div className="flex items-center justify-end gap-1">
          <span className={`text-xs tabular-nums ${getCharCountColor()}`}>
            {charCount}
          </span>
          {maxLength !== undefined && (
            <span className="text-xs text-black/30">/ {maxLength}</span>
          )}
        </div>
      )}
      {error && <p id={`${field.id}-error`} role="alert" className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
