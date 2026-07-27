"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Label } from "@/components/ui/label"

interface FieldSliderProps {
  field: FormField
  value: number | null
  onChange: (value: number | null) => void
  onBlur?: () => void
  error?: string
}

export function FieldSlider({ field, value, onChange, onBlur, error }: FieldSliderProps) {
  const min = field.sliderConfig?.min ?? 0
  const max = field.sliderConfig?.max ?? 100
  const step = field.sliderConfig?.step ?? 1
  const unit = field.sliderConfig?.unit ?? ""
  const currentValue = value ?? min

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-sm font-medium text-black">
          {currentValue}{unit}
        </span>
      </div>

      <div className="relative pt-1 pb-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:shadow-md
          `}
          aria-label={field.label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-black/30">{min}{unit}</span>
          <span className="text-[10px] text-black/30">{max}{unit}</span>
        </div>
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
