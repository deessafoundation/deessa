"use client"

import { useState } from "react"
import { FormField } from "@/lib/types/conference-form-schema"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"

interface FieldRatingProps {
  field: FormField
  value: number | null
  onChange: (value: number | null) => void
  onBlur?: () => void
  error?: string
}

export function FieldRating({ field, value, onChange, onBlur, error }: FieldRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const maxStars = field.ratingConfig?.maxStars ?? 5
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const isActive = (hoverValue ?? value ?? 0) >= star
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(value === star ? null : star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} out of ${maxStars}`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  isActive
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-100 text-gray-300"
                }`}
              />
            </button>
          )
        })}
        {value != null && (
          <span className="ml-2 text-sm text-black/40">
            {value}/{maxStars}
          </span>
        )}
      </div>

      {field.helpText && !error && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
