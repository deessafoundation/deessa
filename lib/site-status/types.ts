/**
 * Site-wide UI visibility flags — types and constants.
 *
 * Kept free of server-only imports so both the admin client components and the
 * server-side reader in `./settings` can share them.
 */

export interface SiteUiFlags {
  /** Homepage "Development Mode" report-a-bug popup. */
  devNotice: boolean
  /** "Beta" pill rendered in the navbar (desktop, mobile and drawer). */
  betaBadge: boolean
  /** Public /stories page & articles visibility. When false, hides from nav and returns 404. */
  storiesEnabled: boolean
}

/** Matches the behavior the `NEXT_PUBLIC_SITE_STATUS` env var produced. */
export const DEFAULT_SITE_UI_FLAGS: SiteUiFlags = {
  devNotice: true,
  betaBadge: true,
  storiesEnabled: true,
}

export const SITE_UI_FLAGS_KEY = "site_ui_flags"
