"use client"

import type React from "react"
import { forwardRef } from "react"

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  hideLabel?: boolean
  helperText?: string
}

/**
 * Accessible form field component with built-in WCAG compliance
 * 
 * Features:
 * - Proper label association
 * - Error state with aria-invalid
 * - Error message with aria-describedby
 * - Helper text support
 * - Screen reader friendly
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hideLabel = false, helperText, id, className = "", ...props }, ref) => {
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
        
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full h-11 px-4 rounded-lg border
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

FormField.displayName = "FormField"
