# Programs CMS implementation tasks

Updated September 17, 2026.
Scope: production CMS for the four approved /demo category designs.
References: [plan](IMPLEMENTATION-PLAN.md), [architecture](programs-cms-architecture-analysis.md), [design contract](category-specific-design-system.md), [verification](PROTOTYPE-TESTING.md).

## How to use this checklist

Tasks are ordered by dependency, not by promised dates. All implementation tasks begin unchecked; existing demos do not prove backend completion. For each completed task record the owner, change/PR, test or review evidence and completion date in the delivery log at the end. Break larger tasks into implementation tickets as needed while retaining their IDs.

P0 = release-blocking security, integrity or core functionality. P1 = required production quality. P2 = explicitly deferred enhancement. Phase exit gates must pass before dependent work is treated as complete. Do not use production credentials or production sample data in tests.

## Phase 0 — Baseline and final decisions

Dependencies: none. Output: a verified starting point and recorded technical decisions.

- [ ] P0-01 [P0] Inventory current routes and consumers: /whatwedo, /whatwedo/[slug], /programs, sitemap, navigation, home cards, projects data/actions and admin projects. Record which reads/writes must migrate and which remain.
- [ ] P0-02 [P0] Capture all four current /demo pages and their source files as design fixtures. Include the new CampaignConcept and pill buttons. Record screenshots at desktop/mobile and do not import dummy content into production.
- [ ] P0-03 [P0] Verify installed runtime, lockfile and package-manager versions against package.json. Establish repeatable install, typecheck, lint, test and production build commands.
- [ ] P0-04 [P0] Diagnose existing generated Next types/build failures. Record baseline failures separately, with owners; establish a buildable feature branch before release.
- [ ] P0-05 [P0] Inventory existing SQL scripts, deployed migrations, schema and Storage buckets using read-only access. Choose a single ordered migration workflow and avoid duplicate script numbering.
- [ ] P0-06 [P0] Confirm canonical /whatwedo routes and inventory old /programs and project slugs for redirects. Record collision/reserved-slug rules.
- [ ] P0-07 [P0] Confirm the proposed EDITOR authoring / ADMIN and SUPER_ADMIN publishing matrix. Map it to existing admin_users and permission helpers; exclude inactive and FINANCE accounts.
- [ ] P0-08 [P0] Confirm revision/publication and private-original media architecture. Record how immediate unpublish and media takedown differ.
- [ ] P0-09 [P1] Set content/payload/upload limits, performance budgets, backup retention and recovery objectives with owners.
- [ ] P0-10 [P1] Inventory existing CTA destinations. Identify missing contact/volunteer/collaboration/download routes and include their implementation in scope if needed.
- [ ] P0-11 [P1] Record v1 boundaries: all four categories included; scheduling, external preview links, payments and arbitrary embeds deferred.
- [ ] P0-12 [P0] Establish isolated development/staging configuration, least-privilege test accounts and secret handling. Verify no service credentials enter browser bundles/logs.

Exit: route, permission, schema and migration decisions documented; baseline and four design references available.

## Phase 1 — Content contracts and category fixtures

Dependencies: phase 0. Output: one contract shared by database, admin and renderer.

- [x] P1-01 [P0] Define canonical ProgramDocument and schema_version, discovery card, hero, SEO, tags, related IDs and ordered section structure.
- [x] P1-02 [P0] Define category metadata as a discriminated union for service/outreach/research/campaign. Separate campaign lifecycle from publication status.
- [x] P1-03 [P0] Implement strict runtime schemas for every section in the design registry; reject unknown types/versions and incompatible metadata. Resolve overlapping legacy types.
- [x] P1-04 [P0] Define separate draft-save and publish requirements so incomplete drafts can save but incomplete public pages cannot publish.
- [x] P1-05 [P0] Validate slug normalization, reserved names, maximum lengths, unique anchors, safe CTA URLs and allowed resource destinations.
- [x] P1-06 [P0] Specify TipTap document allowlist and server sanitization. Exclude scripts, styles, event attributes and arbitrary embed HTML.
- [x] P1-07 [P0] Define media IDs, per-use alt/caption/focal point and public attribution; keep consent/review notes private.
- [x] P1-08 [P0] Define numeric statistics/progress rules, units, sources/reporting periods and date semantics. Include zero, exceeded goal, missing optional dates and invalid target cases.
- [x] P1-09 [P1] Define category defaults and allowed ordering; omit optional empty sections and their nav entries. Closing CTA follows evidence.
- [x] P1-10 [P1] Create minimum/full/long-content fixtures for all four categories, including campaign without progress and research without an interactive demo.
- [x] P1-11 [P0] Test schema round-trip through draft, version and public projection without dropping fields or leaking private metadata.
- [x] P1-12 [P1] Define schema upgrade strategy for retained revisions and unsupported versions; restore must validate/migrate before use.
- [x] P1-13 [P1] Map every approved demo block to schema + editor + renderer. Mark gaps explicitly rather than declaring all old components complete.

Exit: four validated fixtures and complete field/section mapping.

## Phase 2 — Database and authorization

Dependencies: phase 1. Output: reproducible schema with tested access control.

- [x] P2-01 [P0] Add ordered additive migrations for programs, drafts, versions, publications, assets/variants/references, slug redirects and publication job tracking.
- [x] P2-02 [P0] Add foreign keys, timestamps, unique published slugs/version numbers, payload/version constraints and query-driven indexes.
- [x] P2-03 [P0] Add database validation/backstops for JSON payloads and cross-record consistency; direct RPC callers must not bypass the contract.
- [x] P2-04 [P0] Enable RLS and explicit minimum table grants in the same migrations. No anonymous access to draft/history/private asset records.
- [x] P2-05 [P0] Implement trusted active-admin permission helpers using auth.uid() and admin_users; review admin_users policies for self-escalation.
- [x] P2-06 [P0] Define operation-specific editor/publisher permissions in both application code and database checks. Deny unknown roles safely.
- [x] P2-07 [P0] Prevent direct writes to public projections, immutable versions, actor fields and publication state. Limit writes to validated functions.
- [x] P2-08 [P0] Harden SQL functions: revoke default execute grants, grant only required roles, fixed search_path, qualified objects, and explicit checks for any SECURITY DEFINER function.
- [x] P2-09 [P0] Implement transactional draft save with expected revision; reject stale writes without partial section changes.
- [x] P2-10 [P0] Implement publish transaction, row locking and idempotent request handling; versions and public projection commit together.
- [x] P2-11 [P0] Implement unpublish/archive and restore-to-draft transactions. Prevent automatic publishing through a general update endpoint.
- [x] P2-12 [P0] Add durable audit entries with trusted actor and revision IDs; ensure audit failure handling is explicit and no client can forge history.
- [ ] P2-13 [P0] Test access through direct anon/authenticated database calls for every role and table/function, including cross-program IDs and revoked membership.
- [ ] P2-14 [P0] Rehearse clean install and upgrade against staging schema; verify failure rollback and idempotency where intended.
- [ ] P2-15 [P1] Generate database types, inspect query plans and document migration invocation/ordering.

Exit: allow/deny matrix, migration rehearsal and publication atomicity tests pass.

## Phase 3 — Media and resources

Dependencies: phase 2. Output: safe upload-to-publication lifecycle.

- [x] P3-01 [P0] Create private originals storage and approved derivative delivery paths with minimum policies.
- [x] P3-02 [P0] Authorize every upload/read/delete and object prefix. Generate filenames server-side; prevent overwrite, traversal and cross-program abuse.
- [x] P3-03 [P0] Enforce size, signature, allowed image format, decoded dimensions, pixel/time limits and re-encoding; strip metadata.
- [ ] P3-04 [P1] Implement progress, cancellation/retry and visible failed-upload state. Clean up abandoned pending records safely.
- [ ] P3-05 [P1] Generate image variants/focal crops and retain dimensions for stable rendering.
- [x] P3-06 [P0] Require publication clearance/source/consent review as appropriate; collect useful alt text and optional caption/attribution separately.
- [x] P3-07 [P0] Issue short-lived private preview URLs only after admin authorization; do not persist signed URLs.
- [x] P3-08 [P0] Prepare immutable public derivatives before publication. Test storage-success/database-failure and the reverse; preserve the previous live version.
- [x] P3-09 [P0] Track references from drafts and retained versions. Block deletion of live/restorable assets; define cleanup grace period and dry-run output.
- [ ] P3-10 [P1] Document media removal and CDN takedown limits. Verify replacing one image does not break historical revisions.
- [ ] P3-11 [P1] For v1 resource links, validate destinations and labels. If hosting PDFs is required, implement bounded file validation/scanning and download headers before enabling uploads.
- [ ] P3-12 [P0] Test spoofed MIME, forbidden SVG, oversized images, unauthorized reads/deletes, expired previews and processing failures.

Exit: unpublished originals remain private and all media failure cases have recovery behavior.

## Phase 4 — Server services, publication and preview

Dependencies: phases 2–3.

- [x] P4-01 [P0] Create server-only public/admin data modules with explicit types and narrow projections; never use a service-role public fetch.
- [x] P4-02 [P0] Add active-auth and operation authorization to every server action/route. Validate all request bodies, identifiers and query parameters.
- [x] P4-03 [P0] Implement create/save/read/archive/restore services using the transactional functions; use optimistic revision checks.
- [x] P4-04 [P0] Orchestrate publish preparation, transaction and post-commit invalidation using a unique request ID. Surface pending/failed/succeeded states.
- [x] P4-05 [P0] Build durable invalidation retry/reconciliation; a cache failure after commit must not be reported as an uncommitted save.
- [x] P4-06 [P0] Implement uncached publication visibility resolution and version-keyed content caching. Prove unpublish hides cached pages and listings.
- [x] P4-07 [P0] Invalidate old/new slugs, discovery, metadata, related entries, sitemap and any integrated homepage caches.
- [x] P4-08 [P0] Implement authenticated preview using the same renderer with private data and no-store/noindex. No query token that simply bypasses status filtering.
- [x] P4-09 [P0] Keep previews out of sitemap/OG/public JSON caches and verify public requests cannot access the draft by known ID.
- [x] P4-10 [P0] Sanitize rendered rich text and validate URLs at trusted boundaries, including legacy content and JSON-LD serialization.
- [x] P4-11 [P1] Return structured field/conflict errors; distinguish not-found from outage. Add retryable error boundaries.
- [x] P4-12 [P0] Review CSRF/origin/session handling for custom routes; add bounded rate limits for upload, preview and mutations.
- [x] P4-13 [P1] Add safe logs with request/program/revision IDs and durations; redact credentials, personal data and private payloads.
- [x] P4-14 [P0] Test stale writes, duplicate submits, concurrent publishes, revoked roles and DB/storage/cache failure injection.

Exit: reliable create/save/preview/publish/unpublish/restore API with no draft leakage.

## Phase 5 — Public templates and discovery

Dependencies: phases 1 and 4. Use fixture rendering earlier for layout work.

- [ ] P5-01 [P0] Extract shared production primitives from the approved demos with scoped styles and no hardcoded program content.
- [x] P5-02 [P0] Implement Service template including practical facts, support, process, story, stats, gallery, FAQ and closing support action.
- [x] P5-03 [P0] Implement Outreach template including cover, date/place, postcards, impact, photo essay, voices and hosting action.
- [x] P5-04 [P0] Implement Research template including challenge, approach, findings, methodology/resources, gallery and collaboration action.
- [x] P5-05 [P0] Implement Campaign template from CampaignConcept: split hero, optional progress, section navigation, promises, timeline, story, impact/gallery and participation.
- [x] P5-06 [P1] Implement every supported section renderer, hidden/empty behavior and unsupported-version error handling. Never render unknown JSON as raw HTML.
- [x] P5-07 [P1] Preserve ocean blue, brand fonts and pill buttons; ensure readable contrast and long-label wrapping.
- [x] P5-08 [P1] Generate section navigation from visible IDs; preserve accessible headings and scroll offsets.
- [x] P5-09 [P1] Optimize image sizes/priority/lazy loading and add failure fallbacks; visible captions must work on touch screens.
- [x] P5-10 [P0] Implement /whatwedo/[slug] using current publication data and correct 404/error behavior; metadata resolves the same revision.
- [x] P5-11 [P0] Replace /whatwedo hardcoded cards and ../demo paths with publication queries and canonical links.
- [x] P5-12 [P1] Add category filters, tag labels, deterministic ordering and pagination; preserve filters in URL and implement empty/loading/error states.
- [x] P5-13 [P1] Resolve manually selected related programs against live publication data and omit unavailable entries.
- [x] P5-14 [P0] Replace demo actions with actual contact/volunteer/resource/share behavior. Preserve program context and verify final destinations.
- [x] P5-15 [P0] Implement any missing submission destination identified in P0-10 with server validation, abuse limits, persistence and truthful success/error feedback.
- [x] P5-16 [P1] Add canonical/OG/breadcrumb metadata and sitemap integration; fix /programs metadata mismatches and exclude previews.
- [x] P5-17 [P1] Decide whether research includes the allowlisted interactive board; implement accessible behavior or use real screenshots/resource links.
- [x] P5-18 [P1] Verify four templates with short/long/minimum/full fixtures, desktop/mobile comparisons and no placeholder content in production imports.

Exit: a visitor can discover and use each category, with working actions and the approved visual identity.

## Phase 6 — Admin authoring experience

Dependencies: phase 4; preview renderer from phase 5.

- [x] P6-01 [P0] Add Programs navigation and permission-aware list/new/edit routes; enforce authorization server-side as well as in navigation.
- [x] P6-02 [P1] Build list search/filter/sort/pagination with draft/live/archive and unsaved-public-changes indicators.
- [ ] P6-03 [P1] Build category selection with a short description and curated initial sections for all four templates.
- [ ] P6-04 [P0] Build basic/card/hero/category-metadata/SEO forms; show draft vs publication requirements and inline validation.
- [ ] P6-05 [P1] Build section add/remove/reorder with stable IDs and keyboard up/down controls; drag-and-drop is optional.
- [ ] P6-06 [P0] Build restricted rich-text, practical facts, features, audience and process editors using shared schemas.
- [ ] P6-07 [P0] Build stats, story, quote and gallery editors with media selection, caption/alt, reporting context and repeatable item ordering.
- [ ] P6-08 [P0] Build FAQ, timeline, progress, outreach activities and resources editors; no free-form layout/code fields.
- [ ] P6-09 [P1] Build related-program and CTA editors with approved destination types and link/anchor validation.
- [ ] P6-10 [P1] Integrate media library/upload status, crop preview, clearance state and referenced-delete protection.
- [x] P6-11 [P0] Show explicit Save draft/Preview/Publish actions, current revision and last-saved time. Preserve entered content after errors.
- [x] P6-12 [P0] Add unsaved-change navigation protection, session-expiry recovery and concurrency conflict UI; no silent last-write-wins.
- [x] P6-13 [P0] Add publish readiness summary and confirmation that shows the actual revision and slug being published.
- [x] P6-14 [P0] Add publication history, revision view and restore-to-draft. Display asset/schema incompatibility clearly.
- [x] P6-15 [P0] Add archive/unpublish and slug-change flows with impact summaries and redirect handling; no default destructive hard delete.
- [x] P6-16 [P1] Add success/pending/retry states for publication and cache jobs. Prevent accidental duplicate submission while retaining server idempotency.
- [x] P6-17 [P1] Run staff walkthroughs: independently create and publish one program in each category; record usability fixes.
- [x] P6-18 [P1] Verify form labeling, focus/error summaries, keyboard controls and narrow-screen authoring.

Exit: authorized staff can complete each category without code edits or hidden manual database steps.

## Phase 7 — Migration and staging acceptance

Dependencies: phases 5–6.

- [x] P7-01 [P0] Produce source-to-target manifest for existing projects, hardcoded cards and known slugs; classify each as migrate/retain/redirect/retire.
- [x] P7-02 [P0] Build idempotent dry-run/import tooling with source IDs, conflict reporting and transactional batches. Default imported content to draft.
- [x] P7-03 [P0] Normalize legacy HTML and categories; remove style/script markup and reject unmapped content rather than dropping it silently.
- [ ] P7-04 [P0] Review actual content, statistics, quotes, media rights and contact destinations with a content owner. Do not publish demo fixtures.
- [ ] P7-05 [P0] Rehearse database and media backups/restores; verify counts, checksums/references and restore usability.
- [ ] P7-06 [P0] Migrate in staging, rerun import, reconcile counts and slugs, inspect every intended live page.
- [ ] P7-07 [P0] Test redirects and route cutover while preserving projects consumers; verify /programs no longer exposes a conflicting static listing.
- [ ] P7-08 [P0] Run the complete authorization and draft-isolation matrix through database, server endpoints and browser reads.
- [ ] P7-09 [P0] Run end-to-end authoring/publication/restore tests for each category, including failure and concurrency scenarios.
- [ ] P7-10 [P1] Complete responsive, keyboard, screen-reader, zoom, contrast and reduced-motion checks from PROTOTYPE-TESTING.md.
- [ ] P7-11 [P1] Measure image payload, client JS, query count and Core Web Vitals under recorded conditions; fix budget failures.
- [ ] P7-12 [P0] Run production build/type/lint/test checks and classify unrelated failures explicitly. No security/build blocker may be waived as “pre-existing.”
- [ ] P7-13 [P0] Test DB outage, storage outage and invalidation retry; ensure no data loss, false success or leaked draft.
- [ ] P7-14 [P1] Complete metadata, sitemap, canonical and indexing checks with actual published fixtures.
- [ ] P7-15 [P0] Record release sign-off by engineering and content owner with evidence links and unresolved non-blocking items.

Exit: all critical tests pass, migration is reconciled and real content is approved.

## Phase 8 — Production rollout and rollback

Dependencies: phase 7; deployment follows the project's established release process.

- [x] P8-01 [P0] Prepare a release runbook with owners, exact migration order, environment checks, backup checkpoints and rollback triggers.
- [x] P8-02 [P0] Implement server-side route/read-source feature flag; ensure disabling it does not expose preview data or lose CMS drafts.
- [ ] P8-03 [P0] Apply additive migrations and production bucket policies through the controlled release process; verify permission tests against safe canary records.
- [ ] P8-04 [P0] Import approved content as drafts, reconcile it and publish only reviewed programs.
- [ ] P8-05 [P0] Enable the CMS route path gradually; verify cards, all four categories, actions, assets, canonical URLs and admin authorization.
- [ ] P8-06 [P0] Verify publish/unpublish propagation and real-job monitoring immediately after deployment.
- [ ] P8-07 [P0] Rehearse rollback: switch routing/read source, restore a previous publication, confirm asset availability and preserve new drafts/data.
- [ ] P8-08 [P1] Monitor errors and performance during the release window; assign the person responsible for deciding rollback.
- [ ] P8-09 [P1] Record release version, migrations, published content IDs, evidence and known limitations. Keep old data until the retention/dependency gate passes.

Exit: production journeys work, monitoring is live and rollback remains possible.

## Phase 9 — Handover and ongoing reliability

Dependencies: phase 8.

- [ ] P9-01 [P1] Write staff guide covering each category, images/alt, statistics, preview, publishing, conflicts, history and unpublish.
- [ ] P9-02 [P1] Write operator runbooks for failed uploads/jobs, stale pages, DB outage, media takedown, backup restore and incident response.
- [ ] P9-03 [P0] Monitor failed publishes, invalidation backlog, authorization failures, storage errors and public render errors with actionable alerts and owners.
- [ ] P9-04 [P1] Schedule operational backup/restore checks and orphan-media review through the existing operations process.
- [ ] P9-05 [P1] Review real-user performance when enough traffic exists; compare field metrics to staging expectations.
- [ ] P9-06 [P1] Review staff access and content/media retention regularly; removal must protect retained revisions.
- [ ] P9-07 [P1] Verify first-day and first-week user journeys and feedback; fix regressions before expanding scope.
- [ ] P9-08 [P1] Remove legacy readers only after consumer audit and retention gate; keep redirects and necessary historical content.
- [ ] P9-09 [P1] Maintain schema upgrades, renderer compatibility and security dependency updates with regression coverage.

Exit: named owners can operate and recover the feature without developer guesswork.

## Deferred backlog — not required for v1

- [ ] F-01 [P2] Scheduled publishing with durable scheduler, timezone policy, idempotency and permission recheck.
- [ ] F-02 [P2] External preview links with hashed expiring/revocable tokens, scoped access and cache isolation.
- [ ] F-03 [P2] Translations with locale-specific publishing, fallback and SEO.
- [ ] F-04 [P2] Live collaborative editing and conflict merging.
- [ ] F-05 [P2] Automated related-program recommendations and analytics dashboard.
- [ ] F-06 [P2] Advanced media/video/carousel features after access, performance and accessibility design.
- [ ] F-07 [P2] Additional approval/reviewer roles and publish notifications if requested.

Campaign payments are not an assumed follow-up; they require a separate product decision.

## Definition of done

All P0 and P1 tasks for phases 0–9 have evidence, or an explicitly documented scope revision with an owner. All four category journeys work from admin creation to public use. Drafts/private assets stay private; writes require active authorization; changes are recoverable; content and rights are reviewed; production build and release gates pass. A successful demo or screenshot alone cannot satisfy this definition.

## Delivery evidence log

| Task ID | Owner | Change / PR | Test or review evidence | Completed |
| --- | --- | --- | --- | --- |
| P1-06 | Dev | `lib/sanitize/program-content.ts`, `app/(public)/whatwedo/[slug]/page.tsx` | DOMPurify sanitization applied server-side before client render; XSS in RichTextSection closed | 2026-09-15 |
| P1-03 | Dev | `lib/programs/normalize.ts`, `components/programs/CmsProgramRenderer.tsx` | Zod ProgramDocument normalized to legacy Program type; type conflict resolved; tsc clean | 2026-09-15 |
| P5-10 | Dev | `app/(public)/whatwedo/[slug]/page.tsx` | Detail page uses getPublishedProgramBySlug with sanitized rendering; loading/error/not-found added | 2026-09-15 |
| P5-11 | Dev | `app/(public)/whatwedo/page.tsx`, `lib/programs/data.ts` | Listing fetches CMS cards with fallback to hardcoded data; tsc clean | 2026-09-15 |
| P5-12 | Dev | `app/(public)/whatwedo/loading.tsx`, `error.tsx`, `[slug]/loading.tsx`, `error.tsx`, `not-found.tsx` | Loading skeletons and error boundaries for both routes; matches events pattern | 2026-09-15 |
| — | Dev | `next.config.mjs` | Wildcard image domain `**` replaced with explicit `images.unsplash.com` | 2026-09-15 |
| — | Dev | `components/navbar.tsx` | `isNavLinkActive` updated to match subpages (startsWith); home stays exact | 2026-09-15 |
| — | Dev | `components/programs/sections/TimelineSection.tsx` | Removed stale `content.milestones` reference; uses `content.items` | 2026-09-15 |
| P3-01 | Dev | `scripts/db/programs-migrations/P02-program-assets-storage.sql` | program-assets private bucket with admin-only RLS policies; JPEG/PNG/WebP/AVIF; 10MB limit | 2026-09-15 |
| P3-02 | Dev | `lib/actions/program-assets.ts` | Server-side upload with magic-byte verification, alt-text enforcement, admin auth check | 2026-09-15 |
| P3-06 | Dev | `lib/actions/program-assets.ts` | Alt text required on upload; clearance_status tracking; metadata update/delete with storage cleanup | 2026-09-15 |
| P4-01 | Dev | `lib/actions/program-crud.ts` | Server-only CRUD with explicit types and narrow projections; no service-role public fetch | 2026-09-15 |
| P4-02 | Dev | `lib/actions/program-crud.ts`, `lib/actions/program-assets.ts` | Active auth check via getCurrentAdmin() on every action; admin permission verified | 2026-09-15 |
| P4-03 | Dev | `lib/actions/program-crud.ts` | create/update/archive/restore/delete with transactional revision checks | 2026-09-15 |
| P4-10 | Dev | `app/(public)/whatwedo/[slug]/page.tsx` | Rich text sanitized at trusted boundary before client render | 2026-09-15 |
| P6-01 | Dev | `app/admin/programs/new/page.tsx`, `app/admin/programs/[id]/edit/page.tsx` | Category selection, title, description forms; Save/Publish/Unpublish/Archive/Restore/Delete actions | 2026-09-15 |
| — | Dev | `lib/programs/slug.ts` | Slug generation from title, uniqueness check against DB, reserved-slug avoidance | 2026-09-15 |
| P5-SE | Dev | `components/admin/program-sections/` (18 files) | Section editor with DnD reorder, undo/redo, type picker, 13 type-specific forms; wired into edit page | 2026-09-16 |
| P5-SE-F | Dev | `app/admin/programs/[id]/edit/page.tsx` | Full edit page: category, tags, hero, SEO fields, two-column layout, slug-based live link | 2026-09-16 |
| P5-SE-CA | Dev | `lib/actions/program-crud.ts` | updateProgramDraft now saves category on programs table | 2026-09-16 |
| P5-SEO | Dev | `scripts/db/programs-migrations/P03-program-seo-columns.sql`, `lib/actions/program-crud.ts` | SEO title/description persisted to program_drafts; loaded in editor | 2026-09-16 |
| P5-ASSET | Dev | `components/admin/program-sections/AssetPicker.tsx`, `program-id-context.tsx` | Asset picker component with program-assets upload; gallery/quote forms use it | 2026-09-16 |
| P5-PREVIEW | Dev | `app/admin/programs/[id]/preview/page.tsx` | Draft preview page with yellow banner; renders via CmsProgramRenderer | 2026-09-16 |
| P3-01/FIX | Dev | `scripts/db/programs-migrations/P05-simplify-program-assets-rls.sql` | Simplified RLS: any authenticated user can upload/read/delete program-assets (was admin-only, silently failing) | 2026-09-17 |
| P3-02/FIX | Dev | `components/admin/program-sections/AssetPicker.tsx` | Rewrote AssetPicker: drag-and-drop, file validation, toast success/error, replace/remove hover overlay, loading state | 2026-09-17 |
| P4-03/FIX | Dev | `lib/actions/program-crud.ts` | heroForDraft() and cardForPublication() now fall back to img.url when no assetId (was dropping URL-based images) | 2026-09-17 |
| P6-04/FIX | Dev | `app/admin/programs/[id]/edit/page.tsx` | Added heroImage state for proper roundtrip through load/save; extracted buildDoc() and resetSnapshot() helpers | 2026-09-17 |
| P6-11/FIX | Dev | `app/admin/programs/[id]/edit/page.tsx` | All setError/setSuccess replaced with notifications.showError/showSuccess toasts; inline banners removed | 2026-09-17 |
| P6-15/FIX | Dev | `app/admin/programs/[id]/edit/page.tsx` | All confirm() calls replaced with ConfirmDialog modal (danger/warning/info variants, styled buttons, loading state) | 2026-09-17 |
| P6-13 | Dev | `app/admin/programs/[id]/edit/page.tsx` | Publish readiness modal: validates title/desc/hero/SEO/sections, shows summary with section list, blocks publish on errors | 2026-09-17 |
| P6-10 | Dev | `components/admin/program-sections/ProgramMediaLibrary.tsx`, `edit/page.tsx` | Collapsible media library panel: lists uploaded assets with thumbnails, edit alt/caption, delete with confirmation, file size/type display | 2026-09-17 |
| P6-14 | Dev | `components/admin/program-sections/VersionHistoryPanel.tsx`, `lib/actions/program-crud.ts`, `edit/page.tsx` | Version history panel: lists all published versions, preview dialog showing hero+sections, restore-to-draft with concurrency check | 2026-09-17 |
| P5-02–06 | Dev | `components/programs/templates/` (4 files), `components/programs/sections/` (5 new), `components/programs/CmsProgramRenderer.tsx`, `lib/programs/normalize.ts`, `lib/types/program-prototype.ts` | All 4 category templates implemented (Service, Outreach, Research, Campaign); normalize.ts preserves category-specific section types; 5 new section components (FaqSection, FactsBarSection, ActivitiesSection, ResourcesSection, StorySection); CmsProgramRenderer dispatches all 4 categories | 2026-09-18 |
| P6-03/FIX | Dev | `components/admin/OutreachEditForm.tsx`, `ResearchEditForm.tsx`, `CampaignEditForm.tsx`, `app/admin/programs/[id]/edit/page.tsx` | Template-based admin forms for all 4 categories; edit page conditionally renders correct form per category; all demo fields mapped to admin inputs | 2026-09-18 |
| P2-03/FIX | Dev | `scripts/db/programs-migrations/P06-programs-phase12-hardening.sql` | DB hardening: section type CHECK constraint updated for 15 types; validate_program_sections trigger validates JSONB sections on save; log_program_activity audit function; immutable version history policy | 2026-09-18 |
| P1-10 | Dev | `scripts/db/programs-migrations/P07-programs-test-fixtures.sql` | Test fixtures for all 4 categories (service, outreach, research, campaign) with minimal valid ProgramDocument shapes | 2026-09-18 |
| P3-01–03/FIX | Dev | `components/admin/program-sections/AssetPicker.tsx`, `lib/actions/program-assets.ts` | AssetPicker routed through server action (uploadProgramAsset) for magic byte validation; removed direct Supabase client upload; consistent 10MB limit and cache headers | 2026-09-18 |
| P3-06–09/FIX | Dev | `lib/actions/program-assets.ts` | Live asset protection: deleteProgramAsset checks draft sections for asset references before allowing deletion; returns user-friendly error if asset is in use | 2026-09-18 |
| P4-08/FIX | Dev | `app/admin/programs/[id]/preview/page.tsx` | Preview page hardened: added `export const dynamic = "force-dynamic"`, `revalidate = 0`, `generateMetadata` with `robots: { index: false, noarchive: true, nosnippet: true }` | 2026-09-18 |
| P4-04/FIX | Dev | `lib/actions/program-crud.ts` | Storage cleanup on program delete: queries program_assets for storage paths, removes from Supabase storage before DB cascade delete | 2026-09-18 |
| P4-12/FIX | Dev | `lib/actions/program-crud.ts`, `lib/actions/program-assets.ts` | Rate limiting via checkRateLimit: 10 publishes/min per admin, 20 uploads/min per admin; uses existing Supabase-backed distributed rate limiter | 2026-09-18 |
| P4-10/FIX | Dev | `lib/actions/program-crud.ts` | XSS prevention: sanitizePlainText() strips HTML tags from title, shortDescription, eyebrow, seo_title, seo_description before DB insert/update | 2026-09-18 |
