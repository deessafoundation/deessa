// ── Accessibility Utilities ─────────────────────────────────────────────────
// Phase 5: WCAG 2.1 AA compliance helpers for form components.

/**
 * Generates accessible field IDs that are unique and descriptive.
 */
export function generateAccessibleId(prefix: string, suffix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6)
  const parts = [prefix, timestamp, random, suffix].filter(Boolean)
  return parts.join("-")
}

/**
 * Creates proper ARIA labels for form fields.
 */
export function createAriaLabel(
  label: string,
  required?: boolean,
  helpText?: string
): string {
  let ariaLabel = label
  
  if (required) {
    ariaLabel += ", required"
  }
  
  if (helpText) {
    ariaLabel += `. ${helpText}`
  }
  
  return ariaLabel
}

/**
 * Generates ARIA attributes for form fields.
 */
export function getFieldAriaAttributes(params: {
  fieldId: string
  label: string
  required?: boolean
  error?: string
  helpText?: string
  disabled?: boolean
}) {
  const { fieldId, label, required, error, helpText, disabled } = params
  
  const attributes: Record<string, any> = {
    id: fieldId,
    "aria-label": createAriaLabel(label, required, helpText),
    "aria-required": required || false,
    "aria-disabled": disabled || false,
  }
  
  if (error) {
    attributes["aria-invalid"] = true
    attributes["aria-errormessage"] = `${fieldId}-error`
  }
  
  if (helpText && !error) {
    attributes["aria-describedby"] = `${fieldId}-help`
  }
  
  return attributes
}

/**
 * Checks if a color combination meets WCAG AA contrast ratio (4.5:1 for normal text).
 */
export function meetsContrastRatio(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const ratio = calculateContrastRatio(foreground, background)
  const requiredRatio = largeText ? 3 : 4.5 // WCAG AA requirements
  return ratio >= requiredRatio
}

/**
 * Calculates contrast ratio between two colors.
 * Algorithm from WCAG 2.1 guidelines.
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1)
  const lum2 = getRelativeLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Gets relative luminance of a color.
 */
function getRelativeLuminance(color: string): number {
  // Parse hex color
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  // Apply sRGB gamma correction
  const [rLin, gLin, bLin] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )
  
  // Calculate relative luminance
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Creates accessible error announcements for screen readers.
 */
export function announceError(error: string, fieldLabel: string): string {
  return `Error in ${fieldLabel}: ${error}`
}

/**
 * Creates accessible success announcements for screen readers.
 */
export function announceSuccess(message: string): string {
  return `Success: ${message}`
}

/**
 * Manages focus for keyboard navigation.
 */
export class FocusManager {
  private focusableElements: HTMLElement[] = []
  private currentIndex = 0
  
  constructor(container: HTMLElement) {
    this.updateFocusableElements(container)
  }
  
  updateFocusableElements(container: HTMLElement): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')
    
    this.focusableElements = Array.from(
      container.querySelectorAll(selector)
    ) as HTMLElement[]
  }
  
  focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus()
      this.currentIndex = 0
    }
  }
  
  focusLast(): void {
    if (this.focusableElements.length > 0) {
      const lastIndex = this.focusableElements.length - 1
      this.focusableElements[lastIndex].focus()
      this.currentIndex = lastIndex
    }
  }
  
  focusNext(): void {
    if (this.focusableElements.length === 0) return
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length
    this.focusableElements[this.currentIndex].focus()
  }
  
  focusPrevious(): void {
    if (this.focusableElements.length === 0) return
    
    this.currentIndex = 
      (this.currentIndex - 1 + this.focusableElements.length) % 
      this.focusableElements.length
    this.focusableElements[this.currentIndex].focus()
  }
}

/**
 * Keyboard navigation handler for forms.
 */
export function handleFormKeyDown(
  event: KeyboardEvent,
  callbacks: {
    onNext?: () => void
    onPrevious?: () => void
    onSubmit?: () => void
    onCancel?: () => void
  }
): void {
  const { onNext, onPrevious, onSubmit, onCancel } = callbacks
  
  switch (event.key) {
    case "ArrowRight":
      if (event.ctrlKey && onNext) {
        event.preventDefault()
        onNext()
      }
      break
      
    case "ArrowLeft":
      if (event.ctrlKey && onPrevious) {
        event.preventDefault()
        onPrevious()
      }
      break
      
    case "Enter":
      if (event.ctrlKey && onSubmit) {
        event.preventDefault()
        onSubmit()
      }
      break
      
    case "Escape":
      if (onCancel) {
        event.preventDefault()
        onCancel()
      }
      break
  }
}

/**
 * Live region announcer for dynamic content changes.
 */
export class LiveAnnouncer {
  private announcer: HTMLElement | null = null
  
  constructor() {
    this.createAnnouncer()
  }
  
  private createAnnouncer(): void {
    // Check if already exists
    let existing = document.getElementById("live-announcer")
    if (existing) {
      this.announcer = existing
      return
    }
    
    // Create new announcer
    const announcer = document.createElement("div")
    announcer.id = "live-announcer"
    announcer.setAttribute("role", "status")
    announcer.setAttribute("aria-live", "polite")
    announcer.setAttribute("aria-atomic", "true")
    announcer.style.position = "absolute"
    announcer.style.left = "-10000px"
    announcer.style.width = "1px"
    announcer.style.height = "1px"
    announcer.style.overflow = "hidden"
    
    document.body.appendChild(announcer)
    this.announcer = announcer
  }
  
  announce(message: string, priority: "polite" | "assertive" = "polite"): void {
    if (!this.announcer) return
    
    this.announcer.setAttribute("aria-live", priority)
    this.announcer.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = ""
      }
    }, 1000)
  }
}

// Singleton instance
export const liveAnnouncer = new LiveAnnouncer()
