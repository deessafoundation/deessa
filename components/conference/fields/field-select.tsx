"use client"

import type { FieldProps } from "./index"
import { FancySelect } from "@/components/ui/fancy-select"

export function FieldSelect({ field, value, error, onChange, onBlur }: FieldProps) {
  const strVal = typeof value === "string" ? value : String(value ?? "")
  const options = (field.options ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
  }))

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
      <FancySelect
        value={strVal}
        onValueChange={(val) => {
          onChange(val)
        }}
        options={options}
        placeholder={field.placeholder ?? `Select ${field.label ?? "an option"}...`}
        disabled={field.disabled}
      />
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
