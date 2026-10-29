# Who We Are CMS — implementation and acceptance

Updated 2026-10-14. Supersedes the implementation verdict in the
[2026-10-13 audit](./completion-audit-2026-10-13.md).

The complete page-owned CMS is implemented. All 87 focused tests pass in seven
suites. This is source and regression-test completion, not authenticated
deployment acceptance. No published page document, Team record, Partner record,
or stored media object was modified during this work.

## Field ownership and consumers

| Admin tab | Managed content | Public consumer |
| --- | --- | --- |
| Hero | Breadcrumb, heading lines, introduction, both action pairs, photo caption, individual trust entries | `components/about/about-hero.tsx` |
| Who We Are | Label/headline, individual paragraphs, quote, flow labels/icons/colors, video URL/upload/title/poster, captions/language/label, transcript, autoplay/speech settings | `app/(public)/about/AboutSections.tsx` and `about-intro.module.css` |
| How We Do It | Label/title/subtitle, every saved step's title/body/color, closing line; IDs/order retained | `AboutSections.tsx` |
| Governance | Section heading/copy, four tier title/subtitle/description/appearance sets, operational heading, two operational team title/description sets | `OrgStructure.tsx` |
| Our People | Section label/title/accent/description, empty and unavailable messages, Manage Team handoff | `AboutSections.tsx`, `components/about/team-card.tsx`, `lib/data/about-team.ts` |
| Partners | Section heading/copy and six category labels/icons/colors; separate embedded organization-record manager | `AboutSections.tsx` for categories; existing `partners` table for organization records |
| Get Involved | Heading/description and both action label/destination pairs | `AboutSections.tsx` |
| Page settings | SEO title/description/keywords/social image/description/no-index, six non-Hero visibility switches, retained Journey and sinceBadge fields | Public `page.tsx` metadata, section visibility, and preserved settings document |

Team portraits, biographies, social links, publication, and saved ordering stay
owned by `/admin/team`. Hero uses the first three published members. Zero, one,
and two members do not create fictional fallback records or empty photo slots.
The Hero photo caption is shown only when portraits exist. The Team section
distinguishes a successful empty result from a failed load.

Partner records remain in the existing table, with legacy admin URLs redirected
to the embedded manager. About's six informational category tiles are explicitly
separate from organization logos. Shared navigation, footer, and newsletter
remain shared site features. Journey remains retired publicly.

## Correctness and UX fixes

- Brand tabs follow public page order, match the established What We Do states,
  have no active underline, and scroll locally on narrow screens.
- Focused step/tier/category editors and collapsed media/retained controls reduce
  simultaneous fields. Lists use separate named inputs, preserving embedded
  commas, empty lists, and legacy counts without silently truncating them.
- All edited fields have associated labels; errors select their tab/item, open
  collapsed controls, and focus the affected field. Icon actions are named.
- Page drafts survive tab switches and failed saves. Confirmed saves advance the
  saved baseline; Discard restores that baseline and clears uploader errors.
  Save/upload pending states block competing actions.
- Draft media removal never deletes a storage object. Cancel/Discard therefore
  cannot break a saved or shared image. Failed uploads retain existing media;
  retry, Keep current media, and draft removal provide recovery paths.
- Sidebar/header navigation and unloads warn about dirty/busy forms. Team form
  back links and Cancel also protect edits. The optional Navigation API adds
  protection for cancelable browser navigations; unsupported/non-cancelable
  history transitions still need browser-specific acceptance.
- Team profile expansion uses a native button separate from social anchors.
  Hidden desktop overlays are inert; mobile overlays remain available. Unsafe
  links/media are filtered. Reduced-motion states avoid blanket transforms that
  would incorrectly reveal inert content.
- Removing intro media produces a text-only layout. Speech-bearing videos require
  captions in validation. Actual caption/transcript content must be accurate and
  supplied by the content owner; it was not invented for the existing clip.
- The known default Annual Reports action pointed to a missing anchor. Only the
  exact legacy label/destination pair now resolves to View Our Impact at
  `/impact`; custom actions are preserved.

## Data and security

The existing `about_page_content` JSON remains the page source. Missing fields
receive additive defaults in memory; unknown legacy keys and explicit values
survive strict admin normalization/save. Invalid or failed admin loads cannot
become editable fallback documents. Public recovery keeps valid sections and
never writes its fallback document to storage.

The Settings API requires an active authorized administrator, same-origin
requests, a bounded body, and whole-document validation. It derives
`updated_by` from the authenticated administrator. Team and Partner server
actions require their respective permissions, bound individual fields, validate
links/media independently, and return generic database failures. Missing/denied
mutation rows are not false successes. Activity-log and cache failures after
persistence return saved-with-warning results rather than prompting duplicate
writes. Team writes do not silently drop social links if migration 060 is absent.

The prepared migration
[`069-about-media-policy-roles.sql`](../../../scripts/db/migrations/069-about-media-policy-roles.sql)
adds restrictive INSERT/UPDATE/DELETE checks for partner-logos, team-photos, and
videos: active SUPER_ADMIN/ADMIN/EDITOR plus the existing uploader UID folder.
Public reads and stored objects are unchanged. It also fixes the existing role
helper's search path. Restrictive policies combine with existing permissive
policies rather than allowing another permissive policy to bypass the guard.
See [PostgreSQL policy semantics](https://www.postgresql.org/docs/current/sql-createpolicy.html)
and [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control).

**Migration 069 is prepared, not applied.** Its prerequisites are migrations 002
and 003. Team social fields require the existing migration
`060-add-team-social-links.sql`. No new CMS table or page-copy backfill is needed.
Deployed policies/column grants have not been inspected. In particular, public
components select no Team email/phone, but live database grants must also be
checked before treating those columns as private at the API boundary.

## Verification evidence

User-authorized command:

```text
node node_modules/jest/bin/jest.js --config jest.about.config.cjs --runInBand
Test Suites: 7 passed, 7 total
Tests:       87 passed, 87 total
```

Coverage includes compatibility and retained keys; strict/public load outcomes;
permission/origin/validation/write failures; saved-with-warning behavior;
Partner and Team permissions, input validation, missing rows, social-link
preservation, reorder failure; active administrator enforcement; field labels;
public section bindings/visibility; empty/unavailable Team handling; profile
button/social-link separation; media removal rendering; managed SEO/canonical;
and inactive-session login rendering without an admin shell or redirect loop.

The Impeccable source detector reported only advisory existing public colors,
including retained Journey styling. No new admin markup findings were reported.
Those incumbent colors were preserved.

Browser access recovered on 2026-10-14. Port 3000 serves a different application;
this project was started with `pnpm dev --port 3005`. The public About route
rendered at desktop 1440×1000 and mobile 390×844. All seven live section headings
and one h1 were present; measured page width did not exceed either viewport.
An empty Hero photo column found during inspection was corrected. The browser
displayed the intended Team-unavailable state and public defaults while Supabase
requests failed. [Public fallback screenshot](./evidence/public-fallback-2026-10-14.jpg).

The protected admin route reached the real login screen. No authentication
bypass, production-content test write, or destructive media test was performed.
Authenticated desktop/mobile/keyboard/contrast publishing, actual saved-record
compatibility, session expiry, upload cancellation, and live RLS checks remain
pending a working database connection and administrator session.

Prettier, ESLint, full typecheck/build, dependency audit, and unrelated suites were
not run. AGENTS.md makes those checks opt-in; the focused tests were authorized.

## Remaining acceptance and rollback

1. Confirm the target environment and inspect deployed Team/Partner/settings and
   storage policies; apply/review migration 069 through the project's database
   deployment process. Verify role denial and owner-folder checks with real
   sessions, including ordinary authenticated users and deactivated admins.
2. Capture the actual saved JSON and records before live acceptance. In an
   approved test environment, verify each section's edit → publish → reload and
   edit → discard behavior, slow/failed uploads, dirty navigation, and
   missing/deleted records. Verify video accessibility assets.
3. Complete authenticated responsive/keyboard/contrast/reduced-motion checks.

Rollback source changes selectively because unrelated work is present in this
checkout. Do not reset the working tree. No data rollback is needed for this
implementation session. Retain saved-document snapshots before future test
publishing. Uploaded files are deliberately retained until an explicit,
reference-aware cleanup process is approved; draft cancellation does not purge
them. Team reordering currently detects/reports partial failure and refreshes
consumers; it does not promise transactional rollback.
