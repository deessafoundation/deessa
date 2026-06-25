"use client"

import type { FieldProps } from "./index"

export function FieldParagraph({ field }: FieldProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <svg className="size-5 shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="text-sm font-medium text-primary">{field.label}</p>
        {field.helpText && (
          <p className="text-xs text-primary/60 mt-1">{field.helpText}</p>
        )}
      </div>
    </div>
  )
}
