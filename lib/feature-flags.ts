/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for gradual rollouts and A/B testing.
 * Uses environment variables to control feature availability.
 */

// ============================================================================
// ACCESSIBILITY SYSTEM FLAGS
// ============================================================================

export const ACCESSIBILITY_FLAGS = {
  /**
   * Master switch for new accessibility system
   * When false, old components remain active
   */
  NEW_SYSTEM: process.env.NEXT_PUBLIC_ENABLE_NEW_A11Y === 'true',
  
  /**
   * Enable sensory-friendly mode feature
   * Reduces animations, visual density, and stimulation
   */
  SENSORY_MODE: process.env.NEXT_PUBLIC_ENABLE_SENSORY_MODE === 'true',
  
  /**
   * Enable OpenDyslexic font toggle
   * Requires font files to be present in public/fonts/opendyslexic/
   */
  DYSLEXIA_FONT: process.env.NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT === 'true',
  
  /**
   * Percentage of users to include in rollout (0-100)
   * 0 = disabled for all, 100 = enabled for all
   */
  ROLLOUT_PCT: parseInt(
    process.env.NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE || '0',
    10
  ),
} as const

/**
 * Simple hash function for deterministic user bucketing
 * Ensures same user always gets same experience
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Determines if accessibility system should be enabled for current user
 * 
 * @param userId - Optional user ID for logged-in users
 * @returns true if accessibility system should be active
 * 
 * @example
 * ```tsx
 * // In a component
 * if (isAccessibilityEnabled()) {
 *   return <NewAccessibilityWidget />
 * } else {
 *   return <OldAccessibilityWidget />
 * }
 * ```
 */
export function isAccessibilityEnabled(userId?: string): boolean {
  // Master switch off
  if (!ACCESSIBILITY_FLAGS.NEW_SYSTEM) return false
  
  // Full rollout
  if (ACCESSIBILITY_FLAGS.ROLLOUT_PCT === 100) return true
  
  // No rollout
  if (ACCESSIBILITY_FLAGS.ROLLOUT_PCT === 0) return false
  
  // Percentage-based rollout
  // Use userId if available, otherwise use session ID
  if (typeof window === 'undefined') return false
  
  const identifier =
    userId ||
    sessionStorage.getItem('a11y-session-id') ||
    (() => {
      const newId = `session-${Date.now()}-${Math.random()}`
      sessionStorage.setItem('a11y-session-id', newId)
      return newId
    })()
  
  const hash = simpleHash(identifier)
  return (hash % 100) < ACCESSIBILITY_FLAGS.ROLLOUT_PCT
}

/**
 * Check if a specific accessibility feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof typeof ACCESSIBILITY_FLAGS
): boolean {
  return ACCESSIBILITY_FLAGS[feature] === true
}

// ============================================================================
// OTHER FEATURE FLAGS (Example - expand as needed)
// ============================================================================

export const FEATURE_FLAGS = {
  // Programs CMS: when false, /whatwedo serves old projects page; when true, serves CMS publications
  PROGRAMS_CMS: process.env.NEXT_PUBLIC_PROGRAMS_CMS === 'true',
  // Add other feature flags here as needed
  // EXAMPLE_FEATURE: process.env.NEXT_PUBLIC_EXAMPLE_FEATURE === 'true',
} as const

/**
 * Debug helper - log all feature flags (development only)
 */
export function logFeatureFlags(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚩 Feature Flags')
    console.log('Accessibility System:', ACCESSIBILITY_FLAGS.NEW_SYSTEM)
    console.log('Sensory Mode:', ACCESSIBILITY_FLAGS.SENSORY_MODE)
    console.log('Dyslexia Font:', ACCESSIBILITY_FLAGS.DYSLEXIA_FONT)
    console.log('Rollout Percentage:', ACCESSIBILITY_FLAGS.ROLLOUT_PCT + '%')
    console.log('Enabled for User:', isAccessibilityEnabled())
    console.groupEnd()
  }
}
