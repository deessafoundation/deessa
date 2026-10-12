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
}

/** Matches the behavior the `NEXT_PUBLIC_SITE_STATUS` env var produced. */
export const DEFAULT_SITE_UI_FLAGS: SiteUiFlags = {
  devNotice: true,
  betaBadge: true,
}

export const SITE_UI_FLAGS_KEY = "site_ui_flags"
