export function isSafeMediaUrl(value: string) {
  if (typeof value !== "string" || !value || /[\u0000-\u001f\u007f\\]/.test(value)) return false
  if (/^\/(?!\/)/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
  } catch { return false }
}

export function isSafeWebsiteUrl(value: string) {
  if (typeof value !== "string" || !value || /[\u0000-\u001f\u007f\\]/.test(value)) return false
  try {
    const url = new URL(value)
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}
