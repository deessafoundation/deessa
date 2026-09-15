/**
 * Accessibility Hook
 * 
 * Re-export of useAccessibility hook from the provider.
 * This file exists for better organization and to follow Next.js conventions
 * of keeping hooks in lib/hooks/.
 */

export { useAccessibility } from '@/contexts/accessibility-provider'

/**
 * Usage Example:
 * 
 * ```tsx
 * import { useAccessibility } from '@/lib/hooks/use-accessibility'
 * 
 * function MyComponent() {
 *   const { preferences, updatePreference } = useAccessibility()
 *   
 *   return (
 *     <div>
 *       <button 
 *         onClick={() => updatePreference('highContrast', !preferences.highContrast)}
 *         aria-pressed={preferences.highContrast}
 *       >
 *         {preferences.highContrast ? 'Disable' : 'Enable'} High Contrast
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
