# Who We Are CMS plan

Status: full page-owned CMS and audit fixes implemented; 87 focused tests pass.
Public fallback desktop/mobile inspection is recorded. Actual saved-data,
authenticated publishing/upload, and deployed-policy acceptance remain pending.
See [current evidence](./implementation-status-2026-10-14.md).
Updated 2026-10-14. [Original audit](./analysis.md). [Tasks](./cms-tasks.md).

## Outcome

Make every page-owned editorial value and media choice on `/about` manageable
from `/admin/about`, with the same clear brand tabs, focused forms, and publishing
controls used for What We Do. Preserve the current public layout, URLs, anchors,
team-record ownership, and saved legacy content.

“Complete CMS” means copy, media, alt/accessibility descriptions, links, approved
appearance options, section visibility and SEO. It does not mean editable JSX,
arbitrary CSS, a new page builder, duplicated team databases, or automatic
restoration of retired sections.

## Admin structure

Main tab order follows rendered sections:

**Hero → Who We Are → How We Do It → Governance → Our People → Partners → Get Involved → Page settings**

- Use the same event-settings reference tab hover/active styling and no underline.
  On narrow viewports, scroll the track rather than compressing labels.
- Use the admin shell's inset; avoid a second centered/padded page wrapper.
- One saved baseline, unsaved document, Save & publish and Discard controls.
  Sticky bar clears the existing header. Keep controls named on small screens.
- Copy first; optional appearance/advanced settings initially collapsed.
- Choose one step/tier/category at a time; validation selects its owner and focuses
  the first invalid control. Editing one field must retain unrelated errors.
- View public page opens saved `/about` in a labeled new tab. Unsaved preview,
  if introduced, must use the same renderer and accurately identify its limits.
- Page settings holds SEO, optional section visibility, and clearly labeled
  retained Journey/sinceBadge content. Journey remains not shown by default.

## CMS coverage map

These additions are now implemented; the table records the original scope.

| Tab | Preserve existing values | Add managed values / controls |
|---|---|---|
| Hero | Existing copy, headline lines, CTA pairs, trust badges, badge as photo caption; first three published Team portraits | Breadcrumb label; structured trust entries; accurate emphasis guidance; labeled Manage Team link |
| Who We Are | Label/headline, paragraphs, quote, flow labels | Video URL, accessible title, optional poster/captions/transcript; four structured flow slots with approved icon/tone choices |
| How We Do It | Title/subtitle/closingLine; step id/title/body/color | Section label; focused step chooser; approved color control; explicit four-step structure |
| Governance | Seed every visible hard-coded string | Header label/lead/accent/description, four tier title/subtitle/description sets, Operational Level label, two operational title/description sets, stable IDs and approved presentation variants |
| Our People | Published team records remain in `team_members` | Section label/heading/accent/description, empty-state copy, visibility; Manage Team handoff; correct no-published-members behavior |
| Partners | Current six category tiles and their visual defaults | Header label/heading/accent/description; six category label/icon/tone slots; clarify actual partner-record ownership |
| Get Involved | Current final CTA as exact defaults | Heading, description, primary and secondary label/URL pairs |
| Page settings | All legacy Journey and sinceBadge values | SEO title/description/keywords/social image+alt; non-Hero section visibility if useful; preserve canonical route and system accessibility labels |

Default list structure stays compatible: four flow slots, four process steps,
four governance tiers, two operational teams, six partner categories, two final
actions. Existing saved lists must not be silently truncated to fit new controls.
First inventory actual data; either support its current count or provide an
explicit repair workflow. Free-form structural expansion can be a later slice.

## Data and publishing contract

1. Keep `about_page_content` as the page-owned JSON source. Add fields
   additively with defaults copied from current public code. No automatic SQL
   replacement/backfill of existing copy; no new table is needed for these fields.
   No page-content schema migration is required: new section values are added
   to the existing JSON when the editor saves. Older records receive safe missing-
   field defaults in code. Existing Team tables/columns and storage remain in use.
   Storage role hardening is a separate prepared migration (069), not yet applied.
2. Share a runtime schema between loader, client validation, and save API. Bound
   text/lists, validate URL protocols, validate icon/theme enums, preserve IDs,
   and enforce media/alt relationships. Allow meaningful optional empty values.
3. Missing document uses defaults. Database failure in admin is a failed load,
   not an editable default document. Distinguish malformed/legacy records from
   absent content; preserve recoverable data and report corruption clearly.
4. Legacy compatibility must preserve current resolved output without replacing
   unrelated saved copy. Normalize known legacy records deliberately, by stable
   ID where available, not milestone position. Keep unknown legacy keys in a
   controlled preservation envelope or require a reviewed repair; never silently
   strip corrupted/extra content and declare success.
5. Fix the Journey title updater and saved-baseline behavior before adding new
   content controls. This includes snapshots during save and blocking conflicting
   edits, so edits can't be incorrectly marked saved.
6. Align page/API `settings` permission and require authenticated same-origin
   requests. Use the authenticated admin identity for `updated_by`; client userId
   is not authoritative. Return useful validation paths, not raw database details.
7. Invalidate the actual page/admin consumers after persistence, with explicit
   behavior if invalidation fails after a successful write. Verify save/reload;
   don't equate an HTTP error with proof that content did not persist.
8. Keep a read-only snapshot of real loaded content before compatibility work.
   Preserve all unrelated workspace changes and use incremental, reversible diffs.

## Ownership and default decisions

- Keep `/about` and `/admin/about`; no `/whoweare` alias is introduced automatically.
- User clarification (2026-10-12): team photos are already managed in `/admin/team`;
  link that existing manager from Hero and Our People in a labeled new tab.
  Keep the current first-three-published-member Hero selection and the published
  profile grid. No duplicate photo uploader, About portrait records, new team
  table, or separate Hero-selection UI is planned. Explain that Team publication
  and ordering also affect the Hero. Stable IDs can improve render identity
  without changing ownership or the current selection policy.
- Preserve existing team upload bucket/limit (`team-photos`, 5 MB). New intro media
  uses existing media-service capabilities with deliberate image/video limits;
  inspect actual supported buckets before choosing one. No automatic upload.
- Successful empty team queries must be distinguished from database outages.
  Preserve an explicit temporary legacy fallback policy until live data is
  reviewed; intentional unpublishing should be able to produce an empty section.
- The Partners panel controls visible category tiles. A partner logo display is
  outside parity scope; if requested later, use existing published partner records.
- Journey stays retained and inactive; `/our-story` is a separate feature. Keep
  `#journey` compatibility until saved links have been reviewed.
- SEO is page-owned, while canonical host, site organization metadata, header,
  footer, newsletter, intro overlay and accessibility settings remain shared.
- Colors/icons use a limited approved palette/registry. Layout, decorative SVGs,
  fonts, breakpoints, animation geometry and semantic IDs stay in code.
- Default visibility preserves every currently visible section; Hero keeps a
  meaningful h1. Hiding an anchor-owning section must reveal affected CTA/footer
  links for review rather than silently breaking navigation.

## Verification and refinement

Source checks: every old path retained; new fields reach their intended public
consumer; no duplicated records, key/index drift, URL changes, or unauthorized
permission expansion. Review current tracked and untracked files at every slice.

Browser acceptance: initial parity desktop/mobile; keyboard/readers; 200% text;
high/inverted contrast; reduced-motion/sensory preferences; first-load overlays;
video/poster/captions failure and playback; missing/team-empty states; all links;
field error routing; edits across tabs; discard before/after save; failed-save
retention; authenticated save/reload/public update; external-manager handoffs.

Automated checks remain opt-in per AGENTS.md. When requested, use focused schema,
loader and save tests plus targeted lint/typecheck. Build ignores TS errors in
this repository and cannot prove type safety. Existing unrelated failures must
be reported rather than suppressed.

Do not label a phase complete solely because the code exists. Each slice has
source and runtime acceptance recorded separately, with a review checkpoint
before the next group of changes.

## Risks and remaining choices

| Risk | Treatment |
|---|---|
| Existing About/Hero work changes during this audit | Preserve it; refresh inventory before editing |
| Partial/corrupted saved JSON | Snapshot, schema/compatibility review, explicit repair; no default overwrite |
| Hero and Team share ordering | Preserve the existing behavior and explain it beside Manage Team |
| Legacy copy and hidden content disappear | Preserve fields, show inactive status, avoid broad resets/migrations |
| New lists exceed fixed visual geometry | Preserve existing data; bounded structures and representative runtime checks |
| CMS introduces unsafe media/links/colors | Validate data server-side; approved registries and scoped contrast styling |
| Shared manager fixes become scope creep | Narrow separate tasks with consumer/permission review |
| Browser tool remains unavailable | Finish source work, record pending acceptance; don't claim visual/save success |

Potential later decisions: a `/whoweare` alias, independent Hero portrait selection,
partner-logo display, Journey reactivation, and unrestricted step/category counts.
None is required to manage the currently rendered page.

