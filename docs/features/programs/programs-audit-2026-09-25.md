# Program templates and lifecycle audit — 25 September 2026

## Result

All four categories have category-specific editing and rendering paths. This audit fixed field loss, draft validation, misleading success states, permission checks and several editor usability problems. The program regression suite passes. **The full production flow is not certified:** database atomicity, destructive media cleanup and live browser verification remain open.

## Field and design coverage

| Category | Fixed editor content reviewed | Rendering baseline |
| --- | --- | --- |
| Service | Hero title/description/actions, sticker/note/photo note, image metadata; facts; support cards; journey/handwritten note; story/attribution/mini stats; FAQ; CTA; metrics; gallery | Service demo, `program-demo.module.css` |
| Outreach | Journal hero/stamp/location/captions/actions; ribbon; opening; activity postcards; photo essay; community quote; invitation; separate metrics and gallery | Outreach demo, `program-demo.module.css` |
| Research | Concept hero/status/tags/actions; question; approach; interactive concept checklist/disclaimer; numbered insights; resources; invitation; metrics; gallery | Research demo, `program-demo.module.css` |
| Campaign | Split hero/captions/actions; progress; purpose; promise cards; milestones; family story/detail text; reach; gallery; participation cards | Campaign demo, `campaign-concept.module.css` |

The three editorial editors show eight fixed panels even for an empty draft. Older additional sections are preserved. Layout controls are hidden in template mode. Repeated Outreach stats/gallery sections are edited independently. Image replacement preserves descriptive metadata. Service normalizing/rendering now carries image alt text, captions and focal points through, plus editorial heading formatting and icons.

Removed controls with no effect in their fixed layouts: Campaign feature numbers, Research feature icons, Outreach ribbon period/source, and Outreach quote image. Their existing data is preserved. Section titles/descriptions and relevant footnotes remain available without requiring an admin to choose layouts.

This is a source-level coverage review, not evidence that every field was individually entered and persisted through a real browser. Research communication-board choices and some structural labels remain fixed UI. Related-program IDs and SEO image selection are not fully exposed/persisted by this editor. Duplicate/custom Service sections are preserved but the fixed Service form principally edits the first matching section.

### Visual parity limits

The templates reuse demo CSS and their corresponding section structures. A Service demo screenshot and the published Service DOM were inspected. The existing published Service title was plain text; matching the demo's exact line breaks/accent requires formatted content. New rendering support does not rewrite existing records.

A fresh complete desktop/mobile screenshot comparison of all four categories was not completed in this audit. Exact pixel parity is therefore unverified. Some Service headings and fixed anchor names still need comparison against custom content. Shared CSS alone does not establish pixel parity.

## Lifecycle verification

| Operation | Controlled server-action tests | Real authenticated browser during this audit |
| --- | --- | --- |
| Create | All four categories | Service passed |
| Save | All four; revision conflict and literal ampersand covered | Service passed, revision increment observed |
| Publish | All four; strict validation, archived rejection | Not verified |
| Unpublish | All four; publication-removal failure checked | Not verified |
| Archive / restore | All four; removal errors checked | Not verified |
| Delete | All four; published deletion rejected | Not verified through UI |
| Restore version | Content, metadata and SEO checked | Not verified |
| Image upload / deletion | Unauthorized mutations and published URL reference protection checked | Real upload not verified |

These are mocked database tests, not transaction, RLS or concurrency integration tests. The browser began showing stale content/loading states after initial create/save, with React DOM removal errors in development logs. A root cause was not established. The temporary audit program was deleted using an exact-ID, draft-only guarded cleanup after confirming no publications, versions or assets. Existing published fixture records were not modified.

## Fixes made

- Separate partial-draft validation from publication requirements, so initial fixed-template drafts can save while incomplete content cannot publish.
- Detect zero-row optimistic revision writes; check publication-removal and metadata-write errors instead of returning false success.
- Publish against the revision saved by the editor; prevent archived publication.
- Save complete publication version metadata and restore metadata/SEO with content.
- Require an active admin with program permissions before server mutations or privileged storage access.
- Validate asset paths, canonical URLs, size and actual file signatures during registration. Protect media referenced by URLs or IDs in drafts, publications and history.
- Reject unsafe image/resource URL schemes and malformed internal paths. Validate duplicate section IDs and empty enabled image slots before publication.
- Preserve literal text rather than double-encoding punctuation. Preserve hero changes when changing category and make dirty-state updates account for edits during saving.
- Improve labels, remove-button names, mobile toolbar wrapping and destructive-action wording.
- Make image registration failure an upload error instead of selecting an untracked image and displaying success. The previous image stays selected; the newly uploaded object may remain for cleanup.

## Open findings, ordered by impact

1. **High — lifecycle writes are not atomic.** Saving, publishing, unpublishing, archiving and restoring span multiple database requests. Error checks improve reporting but do not roll back earlier writes or serialize simultaneous editors. Move each transition into a transaction-backed database operation with authorization and revision/status checks inside the transaction. Validate using real competing sessions and injected write failures.
2. **High — whole-program deletion removes storage objects before deleting the database record.** A later database failure can leave an existing program with missing images. It also bypasses the cross-program reference checks used by individual media deletion. Use a committed database deletion plus reference-aware deferred media cleanup; retain shared objects. The current individual-image protection does not resolve this path.
3. **Security migration pending — P11 is written but not deployed.** `P11-program-audit-log-security.sql` restricts the security-definer audit helper and binds its actor to the authenticated admin. Apply it in each environment and verify anonymous, inactive, wrong-role and actor-impersonation calls are rejected. Source inspection is not evidence of the deployed database's state.
4. **Live editor verification incomplete.** Investigate the observed stale/loading/DOM behavior, then repeat save/reload, publish/public-page, unpublish/404, archive/restore, image replacement and deletion on temporary records in all four categories, at desktop and mobile widths.
5. **Media edges remain.** Individual deletion reference checks are not transactional. The separate server-action uploader advertises 10 MB while the server-action body limit is 6 MB; the fixed editor's direct-storage picker follows a different upload path. Registration failures may leave unused storage objects.
6. **Not every schema capability is an editable fixed-template field.** Related programs, SEO image selection, interactive-board choices and certain structural labels remain outside the simple forms. Audit optional image clearing and custom/legacy content separately before claiming every possible schema field works.

## Checks

- `pnpm test --config jest.programs.config.cjs --runInBand`: **45 passed, 3 suites**.
- Focused ESLint over program actions/schema, Service form, edit page, section forms, fixed panels and AssetPicker: **passed**.
- `node scripts/db/programs-migrations/generate-p07.cjs --check`: **passed**, four categories with eight sections each.
- Full TypeScript check: repository-wide failures remain in unrelated areas; the captured diagnostics contained no errors matching the reviewed program paths. This is not a clean repository build.

P07 is a destructive fixture reset for its four named test slugs. Validation above did not execute it against a database. P11 was not applied. No claim of exhaustive security testing, production deployment or complete browser verification is made.
