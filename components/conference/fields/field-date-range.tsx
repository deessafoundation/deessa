"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarRange } from "lucide-react"

interface FieldDateRangeProps {
  field: FormField
  value: { start: string; end: string } | null
  onChange: (value: { start: string; end: string } | null) => void
  error?: string
}

export function FieldDateRange({ field, value, onChange, error }: FieldDateRangeProps) {
  const { label, helpText, required, dateValidation, dateRangeConfig } = field

  const getDateString = (dateStr?: string): string | undefined => {
    if (!dateStr) return undefined
    if (dateStr === "today") return new Date().toISOString().split("T")[0]
    if (dateStr.startsWith("today")) {
      const match = dateStr.match(/today([+-]\d+)d/)
      if (match) {
        const days = parseInt(match[1])
        const date = new Date()
        date.setDate(date.getDate() + days)
        return date.toISOString().split("T")[0]
      }
    }
    return dateStr
  }

  const minDate = getDateString(dateValidation?.minDate)
  const maxDate = getDateString(dateValidation?.maxDate)

  const isDateDisabled = (dateStr: string): boolean => {
    if (!dateValidation) return false
    const date = new Date(dateStr)
    if (dateValidation.disabledDaysOfWeek?.includes(date.getDay())) return true
    if (dateValidation.disabledDates?.includes(dateStr)) return true
    return false
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value
    if (newStart && isDateDisabled(newStart)) return
    onChange({ start: newStart, end: value?.end ?? "" })
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value
    if (newEnd && isDateDisabled(newEnd)) return

    // Validate span constraints
    if (value?.start && newEnd && dateRangeConfig) {
      const start = new Date(value.start)
      const end = new Date(newEnd)
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (dateRangeConfig.maxSpan && diffDays > dateRangeConfig.maxSpan) return
      if (dateRangeConfig.minSpan && diffDays < dateRangeConfig.minSpan) return
    }

    onChange({ start: value?.start ?? "", end: newEnd })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">From</span>
          <div className="relative">
            <Input
              id={field.id}
              type="date"
              value={value?.start ?? ""}
              onChange={handleStartChange}
              min={minDate}
              max={value?.end || maxDate}
              className={error ? "border-destructive" : ""}
              aria-invalid={!!error}
            />
            <CalendarRange className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">To</span>
          <div className="relative">
            <Input
              type="date"
              value={value?.end ?? ""}
              onChange={handleEndChange}
              min={value?.start || minDate}
              max={maxDate}
              className={error ? "border-destructive" : ""}
              aria-invalid={!!error}
            />
            <CalendarRange className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {helpText && !error && (
        <p id={`${field.id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {error && (
        <p id={`${field.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
