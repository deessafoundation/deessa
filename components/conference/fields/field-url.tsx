"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2, ExternalLink } from "lucide-react"
import { useState } from "react"

interface FieldUrlProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function FieldUrl({ field, value, onChange, onBlur, error }: FieldUrlProps) {
  const { label, placeholder, helpText, required } = field
  const [isValid, setIsValid] = useState(true)

  const validateUrl = (url: string): boolean => {
    if (!url) return true // Empty is valid unless required
    
    try {
      const urlObj = new URL(url)
      // Must be http or https
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsValid(validateUrl(newValue))
  }

  const handleBlur = () => {
    // Auto-add https:// if missing and value looks like a domain
    if (value && !value.match(/^https?:\/\//i) && value.includes(".")) {
      const corrected = `https://${value}`
      if (validateUrl(corrected)) {
        onChange(corrected)
        setIsValid(true)
      }
    }
    onBlur?.()
  }

  const showPreview = value && isValid && validateUrl(value)

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={field.id}
          type="url"
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || "https://example.com"}
          required={required}
          className={`pl-10 ${error || !isValid ? "border-destructive" : ""}`}
          aria-invalid={!!error || !isValid}
          aria-describedby={
            error
              ? `${field.id}-error`
              : helpText
              ? `${field.id}-help`
              : undefined
          }
        />
        {showPreview && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open URL in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {helpText && !error && isValid && (
        <p id={`${field.id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {!isValid && value && !error && (
        <p className="text-sm text-destructive">
          Please enter a valid URL (must start with http:// or https://)
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
