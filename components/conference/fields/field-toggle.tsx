"use client"

import type { FieldProps } from "./index"

export function FieldToggle({ field, value, error, onChange, onBlur }: FieldProps) {
  const boolVal = value === true
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={boolVal}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          className="mt-0.5 size-5 rounded border-border text-primary focus:ring-primary"
        />
        <div className="flex flex-col">
          <span className="text-sm text-foreground">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {field.helpText && (
            <span className="text-xs text-foreground-muted">{field.helpText}</span>
          )}
        </div>
      </label>
      {error && <p className="text-xs text-destructive font-medium ml-8">{error}</p>}
    </div>
  )
}
