/**
 * Site Typography Configuration
 *
 * Defines available typography themes and settings stored in `site_settings`.
 */

export type TypographyTheme = "warm-inclusive" | "classic-brand" | "modern-clean"

export interface TypographyConfig {
  /** Active typography theme */
  theme: TypographyTheme
  /** Optional custom heading font name */
  headingFont?: string
  /** Optional custom body font name */
  bodyFont?: string
}

export const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
  theme: "warm-inclusive",
}

export const SITE_TYPOGRAPHY_KEY = "site_typography"
