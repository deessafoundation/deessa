# Programs CMS architecture

Updated September 15, 2026. Proposed contract for implementation, not deployed schema.
See [plan](IMPLEMENTATION-PLAN.md) and [tasks](tasks.md).

## Application boundary

Supabase holds structured content. Frontend category templates implement the four current demos. Admins can reorder supported sections and change content, not inject components, CSS, scripts or arbitrary layout classes.

Public discovery: /whatwedo. Detail: /whatwedo/[slug]. Admin: /admin/programs, /new, /[id]/edit, /[id]/preview and history within the editor. Preserve /demo as static design fixtures with noindex.

Reuse existing server/client Supabase factories, admin_users, activity_logs, permission conventions, UI components, TipTap and Zod after reviewing their behavior. Never assume a hidden admin menu is authorization.

## Proposed storage model

| Entity | Purpose / essential fields |
| --- | --- |
| programs | Stable UUID; archived_at; created/updated timestamps and actors. Private identity/control record |
| program_drafts | program_id unique; schema_version; payload JSONB; revision counter; updated_at/by. One editable draft |
| program_versions | UUID; program_id; monotonic version; schema_version; immutable complete public-safe payload; created_at/by; change summary |
| program_publications | program_id unique; version_id; slug unique; category; card projection; full public payload; published_at; first_published_at. Only currently visible publications |
| program_assets | UUID; private original path; validated MIME/dimensions/size; checksum; processing state; private attribution/consent/review fields |
| program_asset_variants | Asset ID; immutable approved derivative path; width/height/format; public delivery state |
| program_asset_references | Revision/draft identifier + asset ID + usage; protects media needed by current or retained versions |
| program_slug_redirects | Old slug unique; program_id; no user-supplied external destination |
| program_publish_jobs | Request ID unique; program ID; expected draft revision; state; retry count; invalidation event tracking |
| existing activity_logs | Authorized actor and action, target, revision and outcome; no secrets or raw sensitive content |

Names are proposed. Reconcile migration tooling and existing schema before generating SQL.

Use one typed payload for hero, discovery card, category metadata, SEO, related IDs and ordered sections. Do not build parallel program_statistics/program_faqs tables and also store the same information in sections. The public projection deliberately duplicates immutable publication data for safe reads; it is generated transactionally and is not independently editable.

Statistics, FAQs, galleries and stories live in sections. Media references use stable asset IDs. Private review/consent data must never be embedded in a published payload. Required attribution can have a separate public-safe field.

Program category is one of service, outreach, research, campaign. Publication status and campaign lifecycle are separate. A live campaign can be planned, active or completed without changing the CMS publishing workflow.

### Constraints

- UUID keys and foreign keys; unique program/version and published slug; enforced nonnegative revision/order.
- Lowercase ASCII slug with internal hyphens, bounded length, no slash, traversal, reserved route or redirect collision.
- schema_version required on draft/version/publication payloads; matching category metadata and section discriminants.
- Full JSON validation at the authoritative write boundary, including direct database RPC access. SQL constraints or a validated JSON-schema mechanism backstop application validation; reject malformed direct writes.
- Limit payload bytes, section count, repeated items and field lengths. Proposed initial bounds: 1 MiB payload, 30 sections, 24 gallery images per gallery, 100-character title; confirm against four fixtures.
- Strict finite progress numbers: current >=0, goal >0; show actual count, clamp visual percentage to 100; ISO dates with end >= start; derived countdown, never stored daysLeft.
- Slug uniqueness is enforced by the database at publish, not just a browser availability check.
- Search is optional for v1; category filtering and pagination are required. If search ships, index only publication fields with a language strategy and test PostgreSQL expression immutability. Do not copy the old generated search column untested.

## Revision and publication workflow

1. Save draft through an authorized transaction with expected revision. A mismatch returns a conflict and preserves the other editor's work.
2. Preview reads the draft using active admin authorization; never shares public cached fetches.
3. Publisher submits program ID, expected revision and unique request ID.
4. Prepare cleared media derivatives at immutable paths; do not expose originals. If processing fails, publication does not proceed.
5. Transaction locks the program, rechecks active role, expected revision, content schema, asset readiness and slug collision; writes an immutable version, replaces the public projection and records audit/invalidation intent.
6. Commit, then invalidate relevant caches. Failed invalidation is durable/retryable and visible to staff; do not report a database rollback when commit succeeded.
7. Repeated request IDs return the same result. Parallel publishes serialize; version allocation must not use an unlocked MAX(version)+1.
8. Restore copies a retained version into a new draft after schema compatibility validation and asset checks. Publishing restored content is separate.
9. Unpublish removes the public projection transactionally; archive also blocks edits until explicitly restored. Retained revisions stay private.

Public reads use a narrow projection with no privileged service key. RLS permits public read of program_publications only, not drafts or history. If a joined view is used, ensure it does not bypass underlying security.

## Authorization contract

| Principal | Public content | Draft/read/edit/upload | Publish/unpublish/archive/restore |
| --- | --- | --- | --- |
| Anonymous / ordinary authenticated | Yes | No | No |
| Inactive admin | Yes | No | No |
| Active FINANCE | Yes | No | No |
| Active EDITOR | Yes | Yes | No |
| Active ADMIN / SUPER_ADMIN | Yes | Yes | Yes |

Program write permissions must check auth.uid() against the existing trusted admin_users record and is_active. Never authorize from user-editable user_metadata. auth.role() is not the application's ADMIN role. Supabase explains both database roles and metadata trust in its [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

Enable RLS and explicit minimum grants on every new table. Prefer restricted mutation RPCs to direct writes on publication/version/control fields. Revoke public execute permissions by default. Any SECURITY DEFINER helper needs explicit actor checks, fixed safe search_path, schema-qualified objects and limited execute grants. Protect against role escalation through admin_users itself. Test using actual anon/authenticated principals, not only a service-role client.

Every server action validates input, authenticated user, active membership and operation permission. Review CSRF/origin behavior for custom endpoints, rate-limit costly operations and redact error details. Server-only service credentials may be used by narrowly scoped trusted jobs after authorization; never ship them to the client.

## Rich text and links

Use existing TipTap with a restricted schema. Canonical rich text is restricted editor JSON; server rendering produces sanitized HTML. Legacy HTML imports are normalized into that format and stripped of embedded style/script content.

Permit paragraphs, lists, emphasis and controlled heading levels. Sanitize again at the render boundary as defense against historical/imported data. Reject event handlers, scripts, arbitrary styles, unsafe SVG and javascript/data URL links. Validate CTA destinations as allowed internal paths, valid section anchors or approved HTTPS URLs; mailto/tel only for supported contact actions. External links opened in a new tab use safe rel values. No arbitrary iframe HTML; approved media providers require typed identifiers and consent-aware loading if introduced later.

## Media lifecycle

Private originals are uploaded to a private bucket with object policies. Public buckets bypass read access controls, so draft media cannot be protected merely by a database status flag; see [Supabase storage access models](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Proposed v1: JPEG/PNG/WebP only, max 10 MiB and 25 megapixels, bounded decode time and re-encoding to strip metadata. Validate actual file signatures and decoded dimensions, not just extension/MIME headers. Generate server-controlled object names; reject overwrite/path traversal. Alt text and public attribution belong to usage; consent and source records stay private.

Before publication, copy/re-encode only cleared derivatives to immutable public paths. Private preview uses short-lived signed URLs; renewal requires authorization. Do not save signed URLs in CMS content.

A public derivative, once downloaded, cannot be recalled. Unpublish removes page visibility but does not promise internet-wide media revocation. Document takedown and CDN-purge procedures separately. Block deletion of referenced assets; retain assets required for restore. Orphan cleanup has a grace period and a dry run. Handle database/storage partial failures with retryable jobs; these are not one cross-service transaction.

## Public delivery and caching

- Public listing and detail select only published data. Cards, metadata, structured data and body resolve the same version.
- Use deterministic pagination and category ordering. Related IDs resolve only currently published programs; drop unavailable references.
- Draft/admin responses are no-store, noindex, excluded from sitemap and public caches; authorization is required even with a known UUID.
- Cache immutable content by version ID. Check current publication visibility without caching before serving a detail and before emitting listing/related/sitemap entries. This is the initial strategy to avoid stale unpublished exposure; optimize only with equivalent guarantees.
- After publish invalidate the program, old/new slug, listing, related cards, homepage if integrated and sitemap.
- Next 16 revalidateTag with the max profile uses stale-while-revalidate; it alone does not give immediate withdrawal. Select and test the appropriate API for the calling context using [Next cache documentation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).
- Public database outages show a retryable error, not an empty successful listing. Distinguish missing content from failed queries.
- Generate canonical metadata with the chosen /whatwedo URL. Escape JSON-LD correctly and exclude drafts/demo content.

## Migration and recovery

Inventory projects, its consumers and inbound slugs. /whatwedo/[slug] currently reads that table; other features may still depend on it. Keep projects intact and introduce program-specific schema additively.

Produce an explicit mapping manifest with source ID, old slug, target category, target slug, publication decision and asset disposition. Migrate to drafts by default. Do not publish fabricated demo statistics or automatically download/re-host every stock photo. Content owner checks copy, numbers, rights and destinations.

Rehearse dry run, idempotent rerun and reconciliation in staging. Back up database and storage, validate restore separately, and cut over routes behind a server-side flag. Rollback switches routing/read source and restores a known published revision; it must not drop new tables or erase edits.

Database/SQL function migrations belong in the selected migration system, not an unconfigured Edge Functions directory. Existing scripts/ numbering needs reconciliation before new filenames are allocated.
