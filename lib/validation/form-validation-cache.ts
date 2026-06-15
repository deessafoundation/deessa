// ── Form Validation Cache ───────────────────────────────────────────────────
// Phase 5: Performance optimization via validation result caching.
// Prevents redundant validation calls for unchanged field values.

import { FormField } from "@/lib/types/conference-form-schema"

interface CacheEntry {
  value: unknown
  error: string | null
  timestamp: number
}

class ValidationCache {
  private cache = new Map<string, CacheEntry>()
  private readonly maxAge = 5000 // 5 seconds
  private readonly maxSize = 100 // Max cached entries

  /**
   * Generates a cache key from field ID and value.
   */
  private getCacheKey(fieldId: string, value: unknown): string {
    // Simple serialization - good enough for most cases
    const valueStr = typeof value === "object" 
      ? JSON.stringify(value) 
      : String(value)
    return `${fieldId}:${valueStr}`
  }

  /**
   * Gets cached validation result if still valid.
   */
  get(fieldId: string, value: unknown): string | null | undefined {
    const key = this.getCacheKey(fieldId, value)
    const entry = this.cache.get(key)
    
    if (!entry) return undefined
    
    // Check if entry is still fresh
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return undefined
    }
    
    return entry.error
  }

  /**
   * Caches a validation result.
   */
  set(fieldId: string, value: unknown, error: string | null): void {
    // Enforce max size - remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    const key = this.getCacheKey(fieldId, value)
    this.cache.set(key, {
      value,
      error,
      timestamp: Date.now(),
    })
  }

  /**
   * Clears all cached validation results.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clears cache entries for a specific field.
   */
  clearField(fieldId: string): void {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${fieldId}:`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Gets cache statistics.
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    }
  }
}

// Singleton instance
export const validationCache = new ValidationCache()

/**
 * Wraps a validation function with caching.
 */
export function withCache<T extends (...args: any[]) => string | null>(
  fn: T,
  options?: { enabled?: boolean }
): T {
  const enabled = options?.enabled !== false
  
  return ((...args: any[]) => {
    if (!enabled) {
      return fn(...args)
    }
    
    const [field, value] = args as [FormField, unknown]
    const cached = validationCache.get(field.id, value)
    
    if (cached !== undefined) {
      return cached
    }
    
    const result = fn(...args)
    validationCache.set(field.id, value, result)
    
    return result
  }) as T
}
