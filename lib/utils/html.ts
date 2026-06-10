/**
 * Shared HTML escaping utility for email templates.
 * Escapes the 5 critical HTML special characters to prevent XSS
 * when interpolating user-supplied values into HTML strings.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
