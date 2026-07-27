"use client"

import type { FieldProps } from "./index"

export function FieldRadio({ field, value, error, onChange, onBlur }: FieldProps) {
  const strVal = typeof value === "string" ? value : String(value ?? "")
  return (
    <div className="flex flex-col gap-1.5">
      <fieldset>
        {field.label && (
          <legend className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 mb-3">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </legend>
        )}
        {field.helpText && (
          <p className="text-xs text-foreground-muted mb-2">{field.helpText}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all ${
                strVal === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={strVal === opt.value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={opt.disabled}
                className="sr-only"
              />
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
