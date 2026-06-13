// Simple input sanitization for user-provided strings
// Prevents XSS and cleans up input

/**
 * Sanitize a string by removing HTML tags and trimming whitespace
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

/**
 * Sanitize an email address (lowercase, trim, basic validation)
 */
export function sanitizeEmail(input: string): string {
  return input.toLowerCase().trim()
}

/**
 * Sanitize a phone number (keep only digits, spaces, dashes, plus)
 */
export function sanitizePhone(input: string): string {
  return input.replace(/[^0-9\s\-+()]/g, "").trim()
}

/**
 * Sanitize a URL (basic check for valid protocol)
 */
export function sanitizeUrl(input: string): string {
  const trimmed = input.trim()
  // Allow relative URLs and common protocols
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed
  }
  return ""
}

/**
 * Sanitize a slug (lowercase, alphanumeric, hyphens only)
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
