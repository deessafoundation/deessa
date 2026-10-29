# Who We Are: completion and quality audit

Reviewed 2026-10-13 against the current workspace, including tracked and untracked
changes. This review covers `/about`, `/admin/about`, the migrated Partners flow,
and the Team/media services those surfaces depend on. It is not a whole-repository
security certification. No published content or database record was changed.

## Verdict

The tab styling and Partners record-management migration are implemented. The
complete Who We Are CMS is not implemented, and the editing/publication flow has
unresolved correctness and accessibility issues. The existing field inventory
maps the work on paper; mapping is not evidence that every field has a working
editor and public consumer. Do not mark the full feature complete yet.

## Current section-to-admin mapping

| Public section | Implemented owner / controls | Remaining work |
| --- | --- | --- |
| Hero | About Hero tab: caption, heading lines, subtitle, CTA labels/destinations, trust text. First three published portraits come from Team; Hero links to `/admin/team`. | Correct field naming; structured trust editing; field accessibility; safe empty Team behavior. |
| Who We Are intro | About Who We Are tab: label, headline, paragraphs, quote, flow text. | Video source/title/poster/captions/transcript are not managed; unused photo/since badge remains presented as a live control; flow editor needs repair. |
| How We Do It | About How We Do It tab: title, subtitle, step title/body, closing sentence. | Section label remains fixed; existing step colors/IDs are retained but have no controls; focused step editing is not implemented. |
| Governance | `OrgStructure.tsx` renders fixed header, four tiers, and two operational teams. | No settings fields, admin editor, or public settings binding. |
| Our People | Member records and publication are managed at `/admin/team`; public profiles load those records. | Section heading/description/empty state remain fixed. Empty publication and keyboard/social interactions need repair. |
| Partners & Supporters | About Partners tab manages the existing `partners` table: add/edit/delete, logo, description, website, type, and publication. | About still renders six fixed category tiles and does not consume partner records. Category heading/copy/labels/icons are not managed. Publishing a record does not change those About tiles. |
| Get Involved | Public CTA heading, description, both labels and both destinations are fixed in `AboutSections.tsx`. | No settings/editor/binding. |
| Page settings | Static SEO metadata in public `page.tsx`. | No page SEO controls or section-visibility controls. |
| Retained Journey | About Journey tab stores legacy milestones and explicitly says the section is hidden. | Keep as retained content; do not count it as a live public section or automatically restore it. |
| Shared site shell | Navbar/footer/newsletter remain shared components. | Keep ownership outside About rather than duplicating shared content. |

## Required fixes before sign-off

### 1. P1: removing a logo can destroy the published file before Save

Evidence: `components/admin/media/file-upload.tsx:107` clears the draft and then
calls storage removal at line 129. `components/admin/partners/partner-form.tsx:119`
reuses this uploader for the existing saved logo.

Concrete case: the current admin owns the stored logo, opens Edit, clicks Remove,
then cancels. The partner row still contains the original URL, but the storage
object has already been deleted. Published content and another record using that
same URL can break despite cancelling. This is an inherited shared-uploader issue,
now present in the embedded Partners flow.

Fix: remove the logo from the draft only. Any actual file cleanup must occur after
confirmed persistence, with ownership and shared-reference checks. Cover remove
→ cancel, remove → failed save, and multiple records referencing one object.

### 2. P1: a saved-content failure can take down the public About page

Evidence: `lib/data/about-settings.ts:10` throws for a database error and line 16
throws for invalid saved content. Public `app/(public)/about/page.tsx:48` awaits
the same strict reader without a public recovery path.

Concrete case: a database read fails, or retained Journey contains an image without
alternative text that the new whole-document schema rejects. The public route
fails even if its live Hero/intro/process content is otherwise usable. Journey is
not rendered, yet its invalid data can prevent all live sections from rendering.

Fix: keep the admin's refusal to expose editable defaults, but define a separate
public availability policy using validated live content and an approved recovery
path. Do not silently replace published copy or repair the database during loading.

### 3. P1: empty publication restores static Team profiles

Evidence: `app/(public)/about/page.tsx:40` returns `fallbackTeamMembers` whenever
the successful published-member query returns an empty array.

Concrete case: unpublish every team member in `/admin/team`. About displays the
static profiles and portraits instead of an intentional empty state. The query's
empty result and its failure are treated as the same outcome. This is pre-existing
behavior; keeping Team ownership requires correcting it.

Fix: preserve a successful empty array. Decide database-error recovery separately.
Use stable database IDs instead of names as React keys when carrying records into
both the Hero and Team grid.

### 4. P2: Save can run before the logo upload completes

Evidence: uploader loading is private state in `file-upload.tsx:33`; Partner Save
is disabled only for the record submission at `partner-form.tsx:169`. No upload
status is passed to the parent.

Concrete case: select a logo on a slow connection and immediately click Save. The
form captures the previous/empty logo URL; a successful record save closes the
dialog, while the new upload can finish afterward without updating that record.

Fix: propagate upload progress/error, prevent Save and destructive closure while
an upload is pending, and submit only its confirmed resulting URL. Failed uploads
should leave the form usable without claiming the new image was saved.

### 5. P2: comma-separated inputs cannot reliably append an item by typing

Evidence: `about-manager-client.tsx:272` and line 376 display joined arrays and
split/trim/filter the input on every keystroke.

Concrete case: type a trailing comma to add a second flow label or trust badge.
Filtering the empty item immediately removes the delimiter from the controlled
input, so subsequent text is appended to the preceding item. Pasting a complete
list is not an adequate editing flow.

Fix: use individual item inputs with add/remove controls, or retain raw input text
until parsing on blur/save. Preserve existing lists and embedded commas in copy.

### 6. P2: mandatory field and keyboard accessibility is incomplete

Evidence: most About fields use sibling `<Label>` and `<Input>`/`<Textarea>`
without matching `htmlFor`/`id` or another accessible-name mechanism, beginning at
`about-manager-client.tsx:201`. The paragraph Delete icon near line 346 has no
accessible action name. The common uploader uses a `hidden` file input at
`file-upload.tsx:221` and a clickable label instead of a keyboard-operable upload
control.

Concrete case: a screen-reader user reaches an unnamed heading field; a keyboard
user cannot tab to the hidden file input or use a non-focusable label as an upload
button. These gaps are not covered by passing backend tests.

Fix: associate each field, give repeated row actions contextual names, and provide
an actual keyboard-operable upload control. Add field-level error context and
focus the first invalid control instead of only showing a raw path summary.

### 7. P2: the Team card consumes Enter intended for social links

Evidence: `AboutSections.tsx:410` makes the entire article a button; its keyboard
handler at line 416 prevents Enter/Space defaults without checking the event
target. Social anchors are descendants, starting at line 444, and remain focusable
when their desktop overlay is translated outside the visible card.

Concrete case: focus a social link and press Enter. The event reaches the article,
which prevents navigation and toggles the card. A hidden overlay link can also be
reached before its contents are made visible.

Fix: separate the profile expansion control from social navigation, or at minimum
restrict expansion key handling to the card itself and synchronize visible/focusable
content. Test mobile overlays, keyboard navigation, and screen-reader semantics.

### 8. P2: the admin presents a non-rendered field as live content

Evidence: `about-manager-client.tsx:298` calls `intro.sinceBadge` “Photo Badge Text”;
the current public intro renders a video and never reads that field. The same form
description still refers to a photo. The Hero “Badge Text” is actually a caption.

Fix: move unused fields into clearly retained settings; rename controls to match
their visible public use. Otherwise editors can save correctly and reasonably
conclude the system is broken because nothing changes publicly.

## Security review: controls present and remaining concerns

- Settings writes authenticate through `getCurrentAdmin`, require Settings
  permission, check request origin, validate the complete document, reject unsafe
  URL schemes/credentials/control characters, and use the authenticated ID for
  `updated_by`. Editors' Partners access does not grant Settings access.
- Partners reads and writes check Partners permission. Database queries use the
  Supabase query builder, and public/settings copy renders through React escaping.
  Save/update failures and post-write invalidation failure are differentiated.
- The checked-in database policies permit partner/team mutations for active
  SUPER_ADMIN/ADMIN/EDITOR roles and settings mutations for SUPER_ADMIN/ADMIN.
  These are source evidence, not verification of the deployed policies.
- **Storage role checks need verification/hardening.** The checked-in partner-logo
  storage policies (`003-storage-setup.sql:75`) allow any authenticated user to
  upload in their UID folder, rather than requiring an active Partners administrator.
  The role guard on a partner-row save does not guard direct storage uploads.
  Confirm deployed rules and enforce the intended role at the storage boundary.
- **Partner validation/error handling needs refinement.** Name/type/protocol
  checks exist, but fields have no individual length limits, and database
  `error.message` is returned to the form. Return useful generic failures and log
  database details server-side. The server-action body has a 6 MB ceiling; it does
  not substitute for field constraints.
- **HTTP logos conflict with image policy.** Partner URLs currently permit HTTP,
  while `next.config.mjs` restricts images to local/data/blob/HTTPS sources. A
  record can save a logo URL that the browser blocks. Validate media independently
  from website links and provide a safe legacy-content correction flow.
- **Activity logging can fail silently.** Partner actions catch thrown logging
  errors, but Supabase normally returns an `error` property. That returned error
  is not inspected. Preserve successful mutation status while recording a failed
  audit-log write rather than silently claiming an auditable flow.
- No release dependency audit, live RLS/bucket-policy inspection, session-expiry
  test, or deployed-header inspection was performed. No new auth flow, role grant,
  storage policy, or sensitive-data category was introduced during this review.

## Other flow and acceptance gaps

The About unload warning protects hard reload/tab closure, but not navigation to
another admin page through a client-side sidebar link. Unsaved edits need an
intentional navigation policy. Partner forms also have no independent dirty-state
warning. Tab switching within the current About manager retains the page draft.

The intro video still has unconditional autoplay and no caption-track/transcript
controls. AboutSections reads accessibility preferences but does not use them to
gate playback/reveal animations. Global CSS suppresses CSS transitions/animations;
it alone does not demonstrate control of native video or JavaScript-driven motion.
Inspect the clip's audio content before deciding its caption requirement.

The default secondary Hero destination `/impact#reports` has no matching reports
anchor in the inspected Impact source. Check actual scrolling and choose a valid
published destination. Only the primary `#journey` CTA currently gets a legacy
rewrite to `/our-story`.

## Verification performed

User explicitly authorized focused regression tests on 2026-10-13.

Command:

```powershell
node node_modules/jest/bin/jest.js --runInBand --runTestsByPath __tests__/about/settings.test.ts __tests__/about/partners.test.ts
```

Result: **2 suites passed, 37 tests passed**. The original `pnpm exec jest` could
not resolve the launcher despite Jest being installed; the repository's direct
Node/Jest invocation worked. The settings suite initially could not resolve
`server-only`; its framework-marker mock was corrected to `{ virtual: true }`.
No production code was changed for that harness repair.

A separate temporary copy of the Partners actions had its permission checks
removed and was tested through an isolated Jest alias. The Finance permission
test failed as expected (1 failed, 10 passed), demonstrating that the regression
test detects that weakening. The temporary files were removed; the application
actions were never altered for this experiment.

The passing tests cover schema/normalization, settings auth/origin/size/write
behavior, Partners permission/validation/read/write behavior, navigation access,
and cache-failure status using mocks. They do not exercise React form interaction,
real uploads/deletion, deployed Supabase policies, or real cache behavior.

Browser control was retried against the user-opened `/admin/about` tab. It failed
before connection because its kernel-assets path was missing. The installed Kimi
fallback daemon was not running, and its startup failed during log rotation with
Access denied. No screenshot, computed-layout/contrast inspection, authenticated
visual flow, or desktop/mobile sign-off is claimed. Prettier, ESLint, full
typecheck, production build, and unrelated suites were not run.

## Ordered completion work

1. Repair destructive logo removal, upload/save sequencing, public-load recovery,
   and intentional empty-Team publication; add targeted behavioral regression cases.
2. Repair accessible names/keyboard flows, structured list editing, misleading
   retained-field copy, and unsaved-navigation behavior.
3. Complete Governance, Our People section copy, Partners category content,
   Get Involved, intro media, and Page settings with additive settings and bindings.
4. Verify connected record compatibility, storage/RLS rules, saved/public parity,
   mobile/desktop layout, contrast, motion, focus, and failure/retry flows in a
   functioning browser. Preserve existing records and public layout throughout.

This order finishes the data/editing contract before adding more controls. The
remaining CMS fields can extend the current About JSON document; moving Partners
does not require copying records into it or creating a new SQL table. Storage
policy hardening, if required by deployed-policy inspection, is a separate change.
