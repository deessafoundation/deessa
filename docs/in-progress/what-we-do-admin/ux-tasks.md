# What We Do admin UX tasks

Plan: [ux-plan.md](./ux-plan.md).
Status: Phase 1 reviewed; Phase 2 navigation browser inspected. Phase 3 Hero presentation and requested area-detail grouping from Phase 5 implemented and browser checked. Phase 4 card presentation and Phase 5 Ways to Help implemented and source-reviewed; their browser verification is blocked by tool initialization failure. Publishing acceptance pending.
Automated verification runs only when explicitly requested under AGENTS.md.
The separate Facebook-post tasks in `tasks/` are untouched.

Current navigation refinement (2026-10-12): Hero / Areas of Work / Area detail
pages / Ways to Help / Programs share one main tab bar. This supersedes the
earlier secondary-destination/return-button plan recorded below. Programs remains
last. Existing tab styles and all field editors are retained; module-error
destinations map to the Area detail pages tab. Source review and the markup
detector found no issues. Browser startup still failed before opening a tab, so
the new five-tab keyboard/mobile and validation flow needs runtime verification.
No automated suites were run and no content was published.

## 1. Capture baseline and field inventory

Description: establish what each editable field affects before regrouping it.

- [x] Inventory all editable leaves, immutable fields, media slots, and old-to-new destinations, including paused and currently unused fields.
- [x] Capture authenticated admin desktop/mobile and existing public routes when accessible; record unavailable access instead of assuming a visual baseline. Public desktop/mobile and area routes inspected; admin requires sign-in and populated programs are unavailable.
- [x] Review current working tree and full accessibility standards; read relevant installed Next.js documentation before code edits.

Evidence: [Phase 1 baseline and full field inventory](./phase-1-baseline.md).
Authenticated editor screenshots, persistence/interaction checks, and populated
program details remain pending; completion above includes documenting these gaps.

Verification: source-to-field comparison and read-only browser baseline.
Dependencies: none. Scope: small; feature planning documents only.

## 2. Introduce navigation and grouping

Description: make the page structure understandable while retaining existing forms.

- [x] Keep the four existing detail-section forms inside Area detail pages; add Back to main page returning to the last primary tab. Individual-area grouping stays in Phase 5.
- [x] Hero / Areas of Work / Programs use the reference-style horizontal track; Hero is default; detail pages and Ways to Help stay reachable through secondary destinations.
- [x] Navigation keeps one content state, existing save/discard behavior, and every field; old validation paths open their correct new destination. Confirmed in source; runtime acceptance below remains pending.
- [ ] Programs handoff opens `/admin/programs` in a labeled new tab; sticky controls sit below the admin header and navigation remains keyboard/mobile accessible.

Verification: navigate all destinations without dirtying data; edit in more than one destination and return; exercise an error in a secondary destination; inspect focus/contrast/scrolling.
At this phase, error routing opens the destination and existing section choice;
specific invalid-card/area selection and field focus remain Phase 6 acceptance checks.
Dependencies: 1. Scope: medium; manager, local CSS module, inventory documentation.

Implementation evidence (2026-10-11):

- In the initial navigation slice, manager and its co-located CSS module were the only feature implementation
  changes. Shared Tabs, CardsEditor, generic Fields, schema, save API, public
  renderers, media services, and Programs manager remain unchanged.
- Introduction uses its original paths inside Areas of Work. All four existing
  detail forms and Ways to Help retain their original settings paths. Validation
  maps introduction/cardsLayout to cards and retains the other root destinations.
- Navigation stores only UI selection; dirty comparison and parsed whole-document
  save still use the same settings state. Programs opens a labeled new tab.
- Source-reviewed Radix semantics, focus return to a selected tab/support heading,
  overflow track, local 64px sticky offset, high/inverted contrast, forced colors,
  and reduced-motion styles. These are implemented, not browser-verified claims.
- Impeccable's markup detector returned no findings on the manager. No formatter,
  lint, typecheck, build, or test suite ran for this slice.
- Browser visit to `/admin/what-we-do` redirected to `/admin/login`. Authenticated
  desktop/mobile screenshots, arrow-key/focus behavior, contrast, sticky overlap,
  validation navigation, save/reload/discard, and Programs handoff remain pending.
  No content was published and no authentication bypass was added.

Phase 2 user refinements (2026-10-11):

- Tabs now use existing Ocean Blue / Deep Ocean and pale-blue brand tokens;
  removed the underline and retained bold selection and keyboard focus styling.
- CardsEditor now uses the full editor width. Preview card opens the existing
  Radix Dialog with the selected card's current unsaved values and visibility.
  The same public preview renderer stays non-interactive; modal content remains
  readable to assistive technology. Empty collections have no Preview button.
- Card operations and saved data paths are unchanged. The markup detector found
  no issues. Modal open/close, focus return, mobile sizing, and authenticated
  visual checks remain pending; no test suite or typecheck ran.

## Checkpoint A: structure

Exact-reference tab correction (2026-10-11):

- Matched `components/admin/events/event-settings-client.tsx` tab styles while
  retaining Radix tab semantics. Theme tokens now match the reference for the
  normal, hover, and active states; outer Card spacing matches too.
- Authenticated browser access is now available. Compared computed styles on
  the reference and What We Do: identical active/inactive colors, hover colors,
  10px/12px tab padding, 12px tab radius, 4px track padding, 16px track radius,
  500 font weight, 150ms transition, and visible shadow geometry.
- Confirmed arrow-key activation, selected Areas of Work, and unchanged Up to
  date/save-disabled state. Checked at desktop and 390px viewport: narrow track
  scrolls inside its container and settled document width stays within viewport.
- Screenshot: `C:/Users/istaq/.codex/visualizations/2026/10/11/01a12b79-fa0e-7543-9237-cfbd1c3e6156/what-we-do-tabs.jpg`.
- Markup detector found no issues. No content was edited or published. Save,
  validation recovery, modal, and contrast-mode runtime acceptance still remain
  pending; automated suites/typecheck/lint were not run.

- [x] Every old editable field remains reachable and mapped in source; no schema/API/public-renderer changes are included.
- [ ] Navigation and save state behave as expected; record evidence and refine unresolved findings before proceeding.

## 3. Simplify Hero editing

Description: replace generic Hero presentation with an intentional editorial form.

- [x] Friendly labels group headline, supporting copy, actions, and three photos; every old Hero path remains editable.
- [x] Preserve four heading fragments, button URLs, image order, alt text, and media-picker buckets/type/size limits.
- [ ] Field changes, picker select/cancel, save/discard, and error labels retain existing contracts.

Verification: compare before/after payloads for a representative edited Hero and untouched sections; inspect form and public Hero with isolated content when available.
Dependencies: 2. Scope: small/medium; manager or one feature-owned Hero form and local styles.

Hero slice evidence (2026-10-11):

- Added feature-owned HeroEditor; manager routes Hero through it while retaining
  the same canonical updater. All 17 input IDs/settings paths were compared with
  the inventory. Public renderer, schema, save API, and media services are unchanged.
- Four editorial groups replace recursively nested fieldsets. Fixed-position
  thumbnails use the public image crops, with URL and alt text alongside them.
  Public captions remain read-only context. Preview failures never edit content.
- A temporary headline edit survived switching to Areas of Work and back.
  An invalid third-photo URL produced the original inline error and prevented
  saving through client validation. Exact values were restored afterward.
- Picker cancellation left the document clean. Keyboard URL selection changed
  only the chosen photo's source; all other photo URLs and alt text were retained.
  Closing and selection returned focus to the originating Choose image button.
  The browser click API could not target Select Media reliably; keyboard activation
  completed the selection. No media upload or content publication was performed.
- At 390px, settled document width was 377px. All three thumbnails loaded; desktop
  and mobile screenshots were inspected. Browser console had no errors. The
  markup detector returned no findings; automated tests/lint/typecheck/build did
  not run under the repository's opt-in rule.
- Screenshots: `C:/Users/istaq/.codex/visualizations/2026/10/11/01a12b79-fa0e-7543-9237-cfbd1c3e6156/hero-editor.jpg`
  and the adjacent `hero-editor-mobile.jpg`.
- Save/reload persistence, upload, and contrast-mode runtime acceptance remain
  pending; the existing field-error focus/retention work remains Phase 6.

## 4. Simplify Areas of Work editing

Description: make the introduction and selected card a coherent section.

- [x] Introduction appears with the card chooser; content comes first, with appearance/grid settings collapsed initially and management actions still available.
- [ ] Preserve custom/hidden cards, stable slug selection, add/remove/reorder, 20-card limit, current preview, and every presentation value.
- [ ] Explain Advocacy-first order and separate visibility from destination availability; removing a selected card chooses the nearest surviving card safely.

Verification: cover four default cards, custom cards, hidden cards, zero cards, removing the last card, adding, moving, selection stability, and discard.
Dependencies: 3. Scope: medium; manager, cards editor, local styles, focused behavior coverage if needed.

Phase 4 implementation and source review (2026-10-12):

- Introduction labels describe the section label and heading fragments while
  retaining original paths. Selected-card title and description lead the form,
  followed by badge and link fields. The preview remains a button/modal.
- Native Card appearance and Grid layout disclosures start closed. Existing
  options, flags, IDs, and update paths remain intact; grid controls remain
  available even with zero cards. No dependency or shared-component change.
- Lifted selected slug into the manager so tab changes do not reset it. Removal
  chooses the successor at the old index, or predecessor for the last card;
  removing the sole card selects no card. A missing slug after discard falls back
  to the first restored card. These cases were traced in source, not exercised.
- Existing hidden defaults, 20-card limit, stable-slug reorder, and immutable
  settings updates are retained. All 12 editable card values, both grid values,
  and all four introduction values remain reachable in source. Schema, API,
  media services, Programs, and public rendering are unchanged.
- Explained visibility versus destination availability and public Advocacy-first
  order. New disclosures and revised action targets use 44px minimum sizes and
  visible keyboard focus; colors use the existing theme tokens.
- Browser control failed before opening a tab: it could not write its kernel
  assets because a required path was missing. A reset did not resolve it. No
  current screenshot, mobile, modal, focus, add/remove/reorder, or save/discard
  runtime result is claimed. Those checks remain pending before Phase 6.
- No content was published. Automated suites, lint, typecheck, formatting, and
  build were not run under the repository's opt-in rule. The markup detector
  returned no findings on CardsEditor and the manager.

## 5. Group secondary content accurately

Description: make detail-page ownership understandable without moving stored content.

Area-detail grouping was advanced by the user's explicit request after Phase 2.
Hero is implemented and browser checked; the card form is implemented with
browser checks pending. Ways to Help now has a focused editorial form with
browser checks pending.

- [ ] Every area/module and Ways to Help field remains reachable through a clearly labeled secondary destination and return path.
- [x] Identify live/coming-soon destinations, cross-area video effects on Advocacy, and story availability conditions without changing public rollout behavior.
- [ ] Preserve media controls, tuple/list behavior, immutable identities, disabled controls during save, and canonical error paths.

Verification: compare field inventory with new UI and trace each video/module to its existing consumer; edit one secondary field and confirm unrelated data remains intact.
Dependencies: 4. Scope: medium; manager and up to two feature-owned form files only if needed.

Requested hierarchy and spacing evidence (2026-10-11):

- Removed the manager's extra padding and centered width limit. Browser measured
  the heading at x=280 beside a sidebar ending at x=256: the shell's 24px inset.
  Shared admin layout and other screens were not changed.
- Added feature-owned AreaDetailEditor with one selected area, accurate status
  and URL, six single-open content groups, and modules under their owning area.
  Existing Fields/media behavior, settings paths, schema, API, and public renderers
  remain intact. Editorial field labels are clearer in these detail forms only.
- Opened all six Advocacy groups in the browser and found all 31 editable inputs
  for the current saved area. Immutable area/learning-item identities remain in
  the canonical settings document; group slices are presentation only.
- Verified arrow-key selection and 390px layout. After responsive layout settled,
  document width was 377px within the 390px viewport; track scrolling stays local.
- Made two temporary invalid edits in an agent-created browser tab. Validation
  opened Awareness / Calls to action for its invalid URL and Training / Inclusive
  Learning for missing alt text, even after returning to the main page. Client
  validation prevented persistence. Restored both exact values; Up to date and
  disabled Save returned. No content was published.
- Browser console reported no errors. Markup detector found no issues on the new
  detail editor. Tests, typecheck, lint, and build were not run. Successful POST,
  media upload/playback, contrast-mode runtime checks, and invalid-field focus
  remain outside these completed checks.
- Screenshot: `C:/Users/istaq/.codex/visualizations/2026/10/11/01a12b79-fa0e-7543-9237-cfbd1c3e6156/area-detail-hierarchy.jpg`.

Requested Ways to Help slice (2026-10-12):

- Added feature-owned SupportEditor. Section introduction uses four explicit
  labels; an action chooser displays Donation, Partnership, or Volunteering's
  four editable fields. All 16 original paths and input/error IDs are retained.
- Public source maps the three saved action positions to fixed donation,
  partnership, and volunteering layouts. This slice preserves that tuple,
  action order, public renderer, schema, API, icons, and styles.
- Action selection lives in manager UI state and survives leaving/returning.
  First-error routing selects the owning action before opening Ways to Help;
  all action error badges use the original dotted paths. The canonical updater,
  whole-document validation/save, discard, and busy disabling remain in use.
- Source-reviewed field wiring, required/error associations, fixed indices,
  responsive grids, 44px action selectors, and unchanged settings consumers.
  The markup detector reported no findings on SupportEditor or the manager.
- Browser control again failed before opening a tab because its kernel asset
  path could not be found. Visual, keyboard/mobile, multi-action edit retention,
  invalid unselected-action routing, and save/discard runtime checks remain
  pending. No screenshot or successful persistence is claimed.
- No content was published. Tests, typecheck, lint, formatting, and build were
  not run, in accordance with the repository's opt-in verification rule.

## Checkpoint B: forms

- [ ] Reachable fields and edit/save payloads satisfy the preservation contract, including temporarily hidden content and custom cards.
- [ ] Public behavior and all current destination URLs remain intact; review form flow and refine actual usability problems.

## 6. Improve validation recovery

Description: let editors locate and fix errors without losing useful feedback.

- [ ] Failed validation opens the owning destination, selects the invalid card/area, expands its disclosure, and focuses the first invalid field with an accessible message.
- [ ] Editing one field retains unrelated errors; structural card changes clear or recompute index-based errors so they cannot attach to the wrong card.
- [ ] Ordinary API failures retain edits; successful save resets the saved baseline; busy state prevents conflicting edits and repeated submits.

Verification: put errors across Hero, introduction, an unselected card, and secondary content; fix one at a time, reorder/remove where relevant, retry, and discard. Add focused tests for new nontrivial behavior, with execution opt-in.
Dependencies: 5; 2 already provides basic path routing. Scope: medium; manager, cards editor, focused test file.

## 7. Review, verify, and record handoff

Description: establish evidence for completion and document residual limitations.

- [ ] Review full feature diff, tracked/untracked files, path casing, imports, field inventory, and preserved security/storage boundaries.
- [ ] Complete available browser checks in the plan; run focused automated checks only when explicitly requested, recording pre-existing failures and unperformed checks.
- [ ] Update feature operating documentation with navigation, public impact, rollout/order caveats, save behavior, evidence, and rollback instructions.

Verification: plan browser checklist; existing schema/API suites when requested; targeted checks only as relevant. Do not use build success as proof of TypeScript or authenticated correctness.
Dependencies: 6. Scope: small; feature docs and final evidence.

## Checkpoint C: readiness

- [ ] Acceptance criteria have evidence; unresolved runtime/auth limitations are explicit.
- [ ] User-visible flow is clear and requested publishing behavior is checked with isolated content before calling the implementation ready.

## Separate follow-ups, excluded from the UI slices

- Save-versus-revalidation failure response: define contract, add post-write failure coverage, then make a separate API change if included in a later request.
- App-wide internal-navigation protection and multi-admin concurrency need separate designs; the UI change must not imply those guarantees.
- Changing the four-card policy, unpinning Advocacy, or activating paused area routes requires a deliberate product decision and separate scope.

## Refinement log

- [x] Rechecked public/admin ownership and clarified Programs handoff.
- [x] Refined initial four-card assumption to preserve custom cards and stable data paths.
- [x] Traced shared Advocacy videos and temporary rollout rules.
- [x] Moved error-destination mapping into the first navigation slice.
- [x] Defined small sequential changes, checkpoints, verification boundaries, and rollback.
- [x] User authorized Phase 1; completed its source/public baseline and refined cross-page video/subtitle effects, upload/discard semantics, and current story display evidence.
