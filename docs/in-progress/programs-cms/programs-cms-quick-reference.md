# Programs CMS quick reference

Updated September 15, 2026. See [plan](IMPLEMENTATION-PLAN.md), [architecture](programs-cms-architecture-analysis.md) and [tasks](tasks.md).

- Design source: the four current /demo pages; campaign uses CampaignConcept.tsx.
- Public routes: /whatwedo and /whatwedo/[slug].
- Admin routes: /admin/programs plus new/edit/preview/history workflow.
- Categories: service, outreach, research, campaign. Subject tags are separate.
- Brand: ocean blue, current fonts, pill buttons; no campaign donation section.
- Data: private draft → immutable revision → public publication projection.
- Save does not publish. Restore creates a draft. Publish is atomic and permission-checked.
- Authorization: trusted active admin_users record; proposed editor authoring and admin/super-admin publishing. No FINANCE writes.
- RLS, grants, SQL functions, server actions and Storage all enforce the same policy.
- Media: private originals, cleared immutable public derivatives, no persisted signed URLs.
- Validation: runtime schemas, restricted rich text, safe destinations, capped inputs and database backstops.
- Preview: authenticated, no-store, noindex, excluded from public caches and sitemap.
- Route migration: preserve projects and known slugs; rehearse before cutover.
- V1 includes all four categories, authoring, preview, revisions, publication, media, discovery, migration and recovery.
- Deferred: scheduling, public preview links, payments, live collaboration, translations and analytics dashboards.
- No demo copy, placeholder metrics or simulated actions should reach production.

## Sequence

Baseline → content contract → schema/security → media → server workflow → templates/discovery → admin editor → staging/migration → release → operations.

A task is complete only when its acceptance check and evidence are recorded. There are no copy-and-run migration snippets in this quick reference.
