"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

interface FieldDateProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function FieldDate({ field, value, onChange, onBlur, error }: FieldDateProps) {
  const { label, placeholder, helpText, required, dateValidation } = field

  // Parse min/max dates
  const getDateString = (dateStr?: string): string | undefined => {
    if (!dateStr) return undefined
    if (dateStr === "today") return new Date().toISOString().split("T")[0]
    
    // Handle "today+30d" format
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

  // Check if date is disabled
  const isDateDisabled = (dateStr: string): boolean => {
    if (!dateValidation) return false

    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()

    // Check disabled days of week
    if (
      dateValidation.disabledDaysOfWeek &&
      dateValidation.disabledDaysOfWeek.includes(dayOfWeek)
    ) {
      return true
    }

    // Check specific disabled dates
    if (
      dateValidation.disabledDates &&
      dateValidation.disabledDates.includes(dateStr)
    ) {
      return true
    }

    return false
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // Validate against disabled dates
    if (newValue && isDateDisabled(newValue)) {
      return // Don't update if date is disabled
    }

    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={field.id}
          type="date"
          value={value || ""}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          min={minDate}
          max={maxDate}
          required={required}
          className={error ? "border-destructive" : ""}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${field.id}-error` : helpText ? `${field.id}-help` : undefined
          }
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
