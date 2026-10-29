# Site UI Flags — admin-configurable dev notice & Beta badge

Date: 2026-10-27

## What changed

The homepage "Development Mode" popup (`DevelopmentNoticeModal`) and the amber
"Beta" pill in the navbar were gated by the build-time env var
`NEXT_PUBLIC_SITE_STATUS !== "live"`. Because Next.js inlines `NEXT_PUBLIC_*`
values at build time, hiding either one required an env edit plus a full
redeploy.

Both are now controlled at **Admin → Site Settings → Site tab → "Site Status
Indicators"** card, stored in `site_settings` under the key `site_ui_flags`:

```json
{ "devNotice": true, "betaBadge": true }
```

Defaults are `true` (matching the old `development` env value), so nothing
changes visually until an admin flips a switch. Saving calls the existing
`updateSiteSetting()` server action (upserts, logs to `activity_logs`,
`revalidatePath("/")`), so changes apply to the public site immediately.

## The env var is gone

`NEXT_PUBLIC_SITE_STATUS` was removed from code and from `.env.example`,
`.env`, and `.env.local`. **Delete it from Vercel project env vars too** — it
is no longer read anywhere.

## Files

| File | Role |
| --- | --- |
| `lib/site-status/types.ts` | `SiteUiFlags`, `SITE_UI_FLAGS_KEY`, `DEFAULT_SITE_UI_FLAGS` — client-safe (no server imports) |
| `lib/site-status/settings.ts` | `getSiteUiFlags()` server reader; falls back to defaults on error/missing row |
| `components/admin/settings/site-status-card.tsx` | Admin switches card |
| `components/admin/settings/settings-tabs.tsx` | Mounts the card in the Site tab, passes current values server-loaded |
| `app/(public)/layout.tsx` | Fetches flags once per request, passes to modal + `NavbarWrapper` |
| `components/layout/navbar-wrapper.tsx` | Receives `siteFlags`, forwards `showBetaBadge` to `Navbar` |
| `components/layout/navbar.tsx` | New `showBetaBadge` prop replaces the 3 env checks (desktop badge, mobile badge, drawer badge) |
| `components/layout/development-notice-modal.tsx` | New `enabled` prop replaces the module-level env const |

The public layout fetches the flags once and shares them with both consumers,
so there is a single `site_settings` read per request — no extra query.

## Gotcha to remember

The popup's "Report an Issue" button links to `/support`, which is gated by the
separate `support_enabled` setting ("Manage Support Feature" card). If support
is disabled while the popup is on, the popup links to a blocked page. The two
switches are intentionally on the same admin tab to make that easy to notice.

## Verification status

Not run (opt-in per repo policy): `pnpm run lint`, `pnpm run typecheck`,
`pnpm build`. Manual review confirmed no remaining runtime references to
`NEXT_PUBLIC_SITE_STATUS` and patterns copied from working equivalents
(`SupportToggleModal`, `site-settings-form.tsx`).
