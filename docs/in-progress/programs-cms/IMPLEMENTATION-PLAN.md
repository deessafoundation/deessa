# Programs CMS implementation plan

Version 2 · September 15, 2026
Status: proposed production implementation based on the four current demo designs.
Execution checklist: [tasks.md](tasks.md).

## 1. Intended outcome

An active authorized admin can create, preview, revise and publish a Service, Outreach, Research or Campaign program without writing code. Visitors discover that program on /whatwedo and see a complete category-specific page at /whatwedo/[slug]. Publishing updates the card, page, metadata and search consistently. Saving a draft never changes the public version.

Preserve the current /demo designs and pill buttons. Remove demo-only explanatory copy and nonfunctional demo actions from production. There is no campaign donation module in this release.

## 2. Findings from the repository review

| Finding | Implementation consequence |
| --- | --- |
| Four demo designs now exist; the old plan described two | Deliver all four templates and editors in v1 |
| Current CampaignDemo uses CampaignConcept.tsx | Use the recent split hero, progress panel, timeline and story layout |
| Existing section components and program-prototype.ts describe an earlier design | Reuse selectively; do not assume they implement the current demos |
| /whatwedo currently contains hardcoded cards, including ../demo slugs | Replace with published card data and valid canonical links |
| /whatwedo/[slug] reads projects through lib/data/projects.ts | Inventory and migrate existing content before replacing this route |
| Existing detail metadata/breadcrumbs use /programs while the route is /whatwedo | Unify canonical links, redirects, sitemap and breadcrumbs |
| /programs uses two static datasets | Retire or redirect that listing during cutover |
| admin_users has role and is_active; ROLE_PERMISSIONS lacks programs | Extend existing authorization, enforce it on every operation and in the database |
| RichTextSection renders raw content.body through dangerouslySetInnerHTML | Add a server-side sanitization contract before CMS HTML can render |
| Database scripts currently live in scripts/; no supabase directory was found | Establish one tracked migration workflow before creating schema files |
| package.json declares Next 16, React 19, TypeScript 6, existing TipTap/Zod | Verify lockfile/runtime; do not implement against the old Next 14/React 18 assumptions |
| A prior tsc run failed in generated .next/dev/types/routes.d.ts | Establish a reproducible baseline; do not label the project type-safe yet |

This is a source review, not a full audit of the application or a verification of a deployed database.

## 3. Release scope

Required for v1:
- Four templates with category defaults, validated content, galleries, statistics, stories, FAQs/resources where relevant and working action destinations.
- Program cards, filtering by category, subject tags, ordering, pagination and related-program links.
- Structured admin forms, media management, draft preview, version history, restore-to-draft and explicit publishing.
- Atomic publication, conflict protection, audit records, RLS and storage policies.
- SEO, accessibility, error handling, cache correctness, migration and rollback evidence.
- Staff guidance, monitoring and a tested recovery runbook.

Deferred: scheduled publishing, external shareable draft links, collaborative live editing, automated related-content recommendations, campaign payment handling, translations, analytics dashboards, A/B testing, arbitrary embeds and a general-purpose page builder. Defer advanced gallery modes unless separately implemented and tested. V1 uses the demonstrated grid/photo-story layouts.

Existing contact, volunteer and collaboration destinations should be reused. If a required destination does not exist, its bounded implementation and abuse protections become a release task. A demo toast is not a working production CTA.

## 4. Decisions to carry into implementation

| Area | Decision |
| --- | --- |
| Public URLs | /whatwedo and /whatwedo/[slug]; plan mapped redirects from /programs and historical slugs |
| Design | Current four demos; category selects a curated template, not arbitrary theme/color controls |
| Content model | Private editable draft + immutable revision payload + explicit public publication projection |
| Sections | Versioned discriminated union; content and category metadata validated together |
| Draft preview | Authenticated admin-only, same renderer, no-store and noindex |
| Roles | Active EDITOR edits/previews; active ADMIN and SUPER_ADMIN also publish/unpublish/restore; FINANCE has no program access |
| Publishing | Explicit transaction; optimistic revision check; no publish-on-save |
| Media | Private originals; publish only cleared derivatives; immutable asset paths |
| Migration | Preserve projects and other modules until dependency audit and cutover verification |
| Scheduling | Deferred; no unused scheduler or publish_at promise in v1 |
| Estimates | Estimate after contract and baseline gates; old 4-week/6–8-week claims are not commitments |

The role matrix is a proposed conservative extension of existing roles; confirm it in phase 0 before implementing permissions.

## 5. Delivery phases and gates

| Phase | Deliverable | Depends on | Exit evidence |
| --- | --- | --- | --- |
| 0 | Baseline, inventory, route and role decisions | None | Source map, migration inventory, recorded decisions |
| 1 | Validated content contract for all four designs | 0 | Four round-trip fixtures and section coverage matrix |
| 2 | Schema, transactions, RLS and permissions | 1 | Migration rehearsal and direct allow/deny database tests |
| 3 | Safe media upload and publication lifecycle | 2 | Invalid upload, private access and referenced-delete tests |
| 4 | Server services, preview and publication/cache workflow | 2–3 | Atomicity, conflicts, retry and no-draft-leak tests |
| 5 | Four dynamic templates and public discovery | 1, 4 | Fixture parity, links, metadata and failure states |
| 6 | Admin authoring and revision workflow | 4–5 | Staff can complete create-to-publish in each category |
| 7 | Rehearsed content migration and staging acceptance | 5–6 | Content reconciliation, full verification matrix |
| 8 | Controlled production rollout and recovery | 7 | Smoke checks, rollback drill, owner sign-off |
| 9 | Monitoring, staff handover and maintenance | 8 | Runbooks, ownership and post-launch checks |

Security tests accompany each phase; phase 7 consolidates release evidence rather than introducing security testing at the end. No production mutation is part of this documentation update.

## 6. Publishing and availability requirements

The public read model contains only the selected published revision. Editing the draft of a live program leaves the public version untouched. Restore creates a new draft revision; it does not silently replace the live page.

Publish validates all required content and approved assets, creates an immutable revision and updates its public projection in one database transaction. Media preparation happens before that transaction; failure leaves the previous publication intact. Retry uses a request identifier so repeated clicks do not create duplicate publications.

Normal updates invalidate card/detail/metadata caches after commit. Unpublish must hide the program immediately through an uncached publication-visibility check; background stale revalidation alone is insufficient. Database failures return a recoverable error rather than an empty success list or a false 404. See the architecture document for details.

## 7. Acceptance and quality

- No draft content, unpublished revision, private media, editorial note or audit record is accessible anonymously.
- No ordinary signed-in, inactive or FINANCE user can edit or publish.
- Editors cannot change role, publication pointer or audit actor through direct API calls.
- All four templates render minimum and full content without demo imports, broken anchors or forced placeholder sections.
- Rich text, URLs, files and JSON are validated server-side; unsafe markup never reaches a browser.
- Page actions lead to real destinations; forms, if added, confirm actual persisted submission.
- Responsive and keyboard/screen-reader checks target WCAG 2.2 AA; do not claim conformance before testing.
- Set measured performance budgets before implementation; suggested targets: LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75 when field traffic is sufficient. Use repeatable staging lab runs before field data exists.
- Migration preserves existing links and independently used projects data; rollback can restore prior routing and content without dropping data.

## 8. References

Technical details and authoritative links are in [architecture](programs-cms-architecture-analysis.md). The [tasks](tasks.md) are the actionable definition of delivery. Historical SQL examples have been archived and must not be run as production migrations.
