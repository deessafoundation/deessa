"use client"

import type { FieldProps } from "./index"
import { Check } from "lucide-react"

export function FieldCheckbox({ field, value, error, onChange, onBlur }: FieldProps) {
  const selected = Array.isArray(value) ? value : []
  const maxReached = field.maxSelections != null && selected.length >= field.maxSelections

  const toggle = (optValue: string) => {
    const updated = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue]
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      {field.label && (
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
          {field.maxSelections && (
            <span className="font-normal text-foreground-muted text-xs">
              (choose up to {field.maxSelections})
            </span>
          )}
        </p>
      )}
      {field.helpText && (
        <p className="text-xs text-foreground-muted">{field.helpText}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((opt) => {
          const isSelected = selected.includes(opt.value)
          const isDisabled = maxReached && !isSelected
          return (
            <button
              key={opt.value}
              type="button"
              disabled={isDisabled || opt.disabled}
              aria-pressed={isSelected}
              onClick={() => toggle(opt.value)}
              onBlur={onBlur}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : isDisabled
                  ? "cursor-not-allowed border-border text-foreground-muted opacity-50"
                  : "border-gray-200 bg-white text-black/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <span className={`flex size-4 shrink-0 items-center justify-center rounded border transition-all ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white"
              }`}>
                {isSelected && <Check className="size-3" />}
              </span>
              {opt.label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[10px] text-black/30">
          {selected.length} selected{field.maxSelections ? ` of ${field.maxSelections}` : ""}
        </p>
      )}
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
