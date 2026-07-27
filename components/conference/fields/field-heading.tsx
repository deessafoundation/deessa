"use client"

import type { FieldProps } from "./index"

export function FieldHeading({ field }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{field.label}</h2>
      {field.helpText && (
        <p className="text-sm text-foreground-muted">{field.helpText}</p>
      )}
    </div>
  )
}
