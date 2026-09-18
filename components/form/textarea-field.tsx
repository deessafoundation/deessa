"use client"

import type React from "react"
import { forwardRef } from "react"

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string | null
  hideLabel?: boolean
  helperText?: string
}

/**
 * Accessible textarea field component with built-in WCAG compliance
 * 
 * Features:
 * - Proper label association
 * - Error state with aria-invalid
 * - Error message with aria-describedby
 * - Helper text support
 * - Screen reader friendly
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hideLabel = false, helperText, id, className = "", rows = 4, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`
    const errorId = `${fieldId}-error`
    const helperId = `${fieldId}-helper`
    
    const hasError = Boolean(error)
    const hasHelper = Boolean(helperText)
    
    const ariaDescribedBy = [
      hasError ? errorId : null,
      hasHelper ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className={hideLabel ? "sr-only" : "block text-sm font-medium text-foreground"}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full px-4 py-3 rounded-lg border resize-none
            ${hasError 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
              : "border-border focus:border-primary focus:ring-primary/20"
            }
            bg-surface text-foreground placeholder:text-foreground-muted
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        
        {hasHelper && !hasError && (
          <p id={helperId} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        )}
        
        {hasError && (
          <p id={errorId} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

TextareaField.displayName = "TextareaField"
