# What We Do admin UX plan

Status: Phase 1 reviewed; Phase 2 navigation implemented and browser inspected. Hero presentation from Phase 3 and user-requested area-detail grouping from Phase 5 are implemented and browser checked. Phase 4 card presentation and Phase 5 Ways to Help are implemented and source-reviewed; their browser verification is blocked by tool initialization failure. Publishing acceptance remains pending.
Updated: 2026-10-12.
Tasks: [ux-tasks.md](./ux-tasks.md).
Baseline: [Phase 1 field inventory and evidence](./phase-1-baseline.md).

## Objective and scope

Help a content editor understand which part of `/whatwedo` they are editing,
make a focused change, and publish confidently. Use the supplied screenshot's
rounded horizontal navigation, icon-and-label tabs, and clear selected state.
The main tabs are Hero → Areas of Work → Area detail pages → Ways to Help → Programs.

This is an admin presentation and workflow change. Preserve the existing
content document, public rendering, permissions, media services, and program
CMS. No migration, dependency addition, public redesign, or default-content
reset is needed. Four existing core areas do not mean a new four-card limit.

This proposal is stored beside the existing feature documentation because
`tasks/plan.md` and `tasks/todo.md` contain unfinished Facebook-post work.
Those files must remain intact.

## Current behavior and dependencies

| Responsibility | Source of truth | Consumer / constraint |
|---|---|---|
| Load page content | `lib/data/what-we-do-settings.ts` | Validates the complete `site_settings` document; database failures throw instead of returning defaults |
| Content shape and compatibility | `lib/types/what-we-do-settings.ts` | Key `what_we_do_content`; legacy presentation defaults; immutable identities; URL validation; up to 20 cards |
| Main editor state | `components/admin/what-we-do/what-we-do-manager.tsx` | One complete document, saved baseline, dirty state, whole-document validation, save/discard |
| Area card editor | `components/admin/what-we-do/cards-editor.tsx` | Selection by stable slug; content, appearance, visibility, layout, add/remove/reorder, single-card preview |
| Persistence | `app/api/admin/what-we-do-settings/route.ts` | Settings permission, same-origin check, server validation, whole-document upsert, route revalidation |
| Main public page | `app/(public)/whatwedo/page.tsx` | Hero; introduction + cards; published programs; Ways to Help |
| Public cards | `components/what-we-do/whatwedo-pillars.tsx` | Filters hidden cards and always puts Advocacy first without modifying saved order |
| Area route resolution | `app/(public)/whatwedo/[slug]/page.tsx` | Known area routes take precedence; other slugs resolve published programs |
| Temporary rollout | `lib/data/what-we-do-availability.ts` | Awareness, Training, Resources show coming-soon pages |
| Advocacy detail | `components/what-we-do/advocacy-detail.tsx` | Reads lead video and all existing area videos, deduplicates URLs; reads animated story and inclusive-school module |
| Published program listing | `lib/programs/data.ts` | Reads `program_publications`; owned by `/admin/programs` |
| Shared controls | `components/ui/tabs.tsx`, admin media picker | Reuse existing Radix controls and media behavior; scope styling to this feature |

Homepage What We Do settings and its similarly named manager are separate.
Do not change them as part of this work.

## Refined information architecture

### Main page navigation

Five main tabs, defaulting to Hero, as requested on 2026-10-12:

| Tab | Editor contents | Existing storage paths |
|---|---|---|
| Hero | Headline group, supporting text, two actions, three photo slots | `hero.*` |
| Areas of Work | Section introduction, card chooser, one selected card editor; secondary appearance/layout controls | `introduction.*`, `cards.*`, `cardsLayout.*` |
| Area detail pages | Area chooser, grouped page fields, and existing Advocacy/Training modules | `areas.*`, `animatedStory.*`, `inclusiveSchool.*`, `inclusiveLearning.*` |
| Ways to Help | Section introduction and one selected help action | `support.*` |
| Programs | Explanation of the connection and a Manage Programs action | No new settings; link to `/admin/programs` |

Keep the track horizontal. On narrow screens allow horizontal scrolling with
the selected tab brought into view; do not compress labels into unreadable
columns. Preserve Radix tab keyboard behavior and visible focus. The blue
active state must also have a non-color selection cue and contrast-mode rules.
Match the event settings page's existing tabs exactly: muted track, primary
active surface and foreground, medium-weight labels, shadow-md, and primary/10
hover background with primary text. Use the same Card/CardContent spacing,
track/tab radii, padding, and transition. Tabs have no underline. This explicit
reference supersedes the earlier custom pale-blue/Deep Ocean treatment.

Use a compact page header and one Save & publish / Discard bar. Offset sticky
content below the existing admin header; do not change the shared admin shell.
Tabs and action controls must remain reachable at enlarged text sizes.

### Detail and help content

**Area detail pages** and **Ways to Help** now belong in the main tab track,
before Programs. This user-requested refinement supersedes the original
secondary-navigation plan. All five tabs stay visible in each destination,
use the same unsaved document and publishing controls, and show one editor at
a time. No separate navigation-button row or Back to main page action is needed.

- Area detail pages: choose an existing area; identify the public URL and
  current Live / Coming soon status. Preserve access to every currently
  editable field, including fields not presently used by public renderers.
- Advocacy: expose its currently active modules and explain that the other
  area video fields also feed this page during the temporary rollout. Group
  controls without changing their storage paths or duplicating their values.
- Animated story: enabled does not guarantee public display. Its video must
  be available and not duplicated; do not promise that every enabled section
  is visible. Keep existing availability logic.
- Inclusive learning: retain under Training, marked as saved content for a
  coming-soon destination. Do not silently activate Training.
- Ways to Help: retain section copy and all three action cards.

Phase 2 originally used secondary destinations and a return button. Subsequent
requests advanced area-detail grouping and promoted both destinations into main
tabs. The editor chooses an area first and uses collapsible groups, with
Advocacy/Training modules under their owning area. Validation for a module keeps
Area detail pages selected in the main track while opening its owning area/group.

A renamed screen is not a renamed database field. Validation must route old
paths to their new editing destinations from the first regrouping change:

| Error path root | Destination |
|---|---|
| `hero` | Hero |
| `introduction`, `cards`, `cardsLayout` | Areas of Work |
| `areas` | Area detail pages, correct area |
| `animatedStory`, `inclusiveSchool` | Area detail pages, Advocacy module |
| `inclusiveLearning` | Area detail pages, Training module |
| `support` | Ways to Help |

In Phase 2, routing opens the owning primary or secondary destination and its
existing section choice. Selecting the specific invalid area/card, expanding
its controls, and focusing the field belong to Phase 6. An introduction error
must open Areas of Work immediately after introduction moves into that tab.

### Deliberate forms

- Hero: friendly labels, related fields together, photos shown with thumbnails
  and alt-text inputs. Retain all four existing heading fragments and their
  styled roles; do not merge them into a single field with a conversion rule.
- Areas: introduction first, compact card chooser, then selected card content.
  Appearance and grid settings start collapsed. Add/remove/reorder stay
  available under clearly labeled management controls. No new fixed limit.
- Card visibility and destination availability are separate statuses. A
  visible card may open a coming-soon page or a custom external destination.
- Keep single-card preview behind a Preview card button opening a modal, so
  the form uses the full available width. Explain that it previews the selected
  card with unsaved edits, not grid layout.
  Do not add a whole-page preview builder to this simplification.
- Preserve Advocacy-first public ordering; show the explanation next to order
  controls. Changing rollout behavior is a separate product decision.
- Programs: open its existing manager in a new tab with an accessible notice,
  keeping the current editor and unsaved edits available. Do not create a
  second program editor or a new program data request just for a count.

## Preservation contract

1. Navigation, opening a disclosure, and selecting a card do not modify content
   or create dirty state. Switching destinations does not save or discard.
2. One settings state owns every field, including temporarily hidden content.
   UI-only selection keys never enter the POST payload.
3. Keep settings key, schema shape, stable identities, URLs, all stored copy,
   legacy defaults, photo/action tuple sizes, and media-picker constraints.
4. Preserve server authorization, origin checks, URL validation, save endpoint,
   full-document persistence, and revalidation targets during UI changes.
5. Existing custom cards, hidden cards, empty arrays, themes, ordering, and layout
   survive editing, saving, reloading, and discard. New cards start hidden.
6. Keep the public Advocacy-first rule, coming-soon gates, video aggregation,
   deduplication, and media availability behavior.
7. Reuse neutral controls without restyling other admin screens. New feature UI
   lives in `components/admin/what-we-do/`; colors/contrast in a local CSS module.
8. Preserve unrelated working-tree changes, especially the existing events work.

## Implementation sequence

1. **Baseline and field inventory:** capture the authenticated editor and public
   behavior when available; list all editable fields and map them to destinations.
2. **Navigation and grouping:** introduce the reference-style primary track,
   secondary destinations, Programs handoff, sticky offset, and validation routing.
   Keep existing field renderers and card editor during this slice.
3. **Hero form:** replace only its generic presentation with deliberate grouping,
   friendly labels, and photo slots, preserving all field paths.
4. **Areas form:** combine introduction with cards and collapse advanced controls.
   Preserve card operations, selection identity, and the existing preview.
5. **Secondary content:** group area/module fields and Ways to Help, with accurate
   rollout status and impact explanations; keep generic rendering where sufficient.
6. **Error recovery:** select the invalid area/card, expand its disclosure, focus
   the field, retain unrelated errors, and keep useful messages after failed saves.
7. **Focused verification and handoff:** review the changed admin flows, unchanged
   public flows, compatibility cases, and final diff; record actual results.

Each step should produce a small reviewable diff. Review after navigation,
after forms, and after error recovery. Do not call implementation complete
while required runtime checks are unavailable or unperformed.

## Risk review and refinements

| Risk / finding | Refinement |
|---|---|
| Fewer tabs accidentally drop content | Complete field inventory and explicit old-path routing before grouping |
| Collapsed invalid fields cannot be found | Error recovery opens the owning destination, card, and disclosure before focus |
| Tab remount resets local selection | Keep canonical content in manager in Phase 2; preserve card selection in Phase 4 and area/module selection in Phase 5 without mounting every hidden media picker |
| Four-card assumption removes custom content | Keep collection schema, identities, operations, and 20-card limit |
| Hero simplification changes styled heading | Retain existing fragments with editorial labels; no split/join conversion |
| Ordering controls suggest Advocacy can move away from first | Preserve rule and explain effective public order near controls |
| Editing a paused area's video changes live Advocacy | Explicit cross-page-impact guidance beside video fields |
| New Programs handoff loses edits | Open existing manager in a new tab; no save or discard on navigation |
| Shared tab styling changes other screens | Feature-scoped classes and CSS module |
| Sticky controls overlap admin header | Local offset and responsive browser check; no global header change |
| Save succeeded but revalidation throws | Existing API risk; separate server follow-up, not bundled into navigation work |
| Two admins save stale documents | Existing whole-document last-write behavior; use isolated test content and one editor for validation; concurrency redesign deferred |

Existing `beforeunload` protection does not reliably guard all client-side
sidebar navigation. Preserve it and do not claim comprehensive navigation
protection. A shared router/sidebar guard is outside this first admin UI change.

The save API's post-write refresh failure needs a separate narrowly reviewed
follow-up before claiming reliable distinction between save and refresh failure.
That follow-up must define the response contract and tests before changing it.

### Refinement history

- Pass 1 — page structure: reduced eight schema-oriented primary tabs to three
  page-oriented tabs; retained supporting/detail editors as secondary content.
- Pass 2 — compatibility: retained extensible cards, styled heading fragments,
  exact settings paths, rollout gates, and cross-area video ownership.
- Pass 3 — failure paths: moved validation routing into the navigation slice,
  added hidden-field recovery and state-preservation acceptance checks; isolated
  backend/concurrency/navigation risks from presentation changes.
- Phase 1 — traced every field/control and public consumer; recorded live public
  routes and mobile baseline. Clarified that paused-area subtitles/media affect
  Advocacy, uploads persist separately from settings discard, and the animated
  story currently renders. Authenticated admin checks remain unavailable.
- Phase 1 review — confirmed the settings/API/card-editor contracts against
  source again. Separated Phase 2 destination routing from Phase 5 form grouping
  and Phase 6 field recovery; added an explicit return path. Existing local card
  selection resets on tab remount, so preserving selection is a later form task,
  while preserving unsaved content is mandatory from the first navigation change.

Repeat the cycle per slice: understand the affected flow → implement the small
change → check against the preservation contract → record evidence → refine if
a defect or unmet criterion is found. Avoid open-ended cosmetic iteration.

## Verification and evidence

The user requested a careful plan. Automated tests, lint, formatting, and
typecheck remain opt-in under AGENTS.md; none ran for this planning pass.
Read the full accessibility standards and relevant installed Next.js guide
before implementation, particularly before touching navigation or revalidation.

When explicitly requested, the focused existing regression command is:

```powershell
pnpm exec jest --runInBand --runTestsByPath __tests__/what-we-do-settings.test.ts __tests__/what-we-do/settings.test.ts
```

Existing coverage addresses legacy documents, card round trips, invalid data,
permissions, same-origin enforcement, persistence, and revalidation. It does
not prove new tab interaction, focus, sticky positioning, or responsive behavior.
Add focused interaction coverage for changed nontrivial recovery/state behavior
using existing test infrastructure; do not add a dependency solely for this work.

Browser acceptance checks:

- Navigate every primary/secondary destination; untouched data and dirty state
  stay stable. Edit in multiple destinations, return, save once, reload.
- Discard restores content across all destinations. Failed saves retain edits.
- Put errors in an unselected card and a collapsed section; save locates them.
  Fix one error and confirm other errors remain visible; correct and retry.
- Exercise custom/hidden/no cards, add/remove/reorder, the last-card removal,
  media select/cancel, alt text, and non-default appearance/layout.
- Inspect desktop, narrow mobile, enlarged text, keyboard tab/arrow navigation,
  focus after errors, normal/high/inverted contrast, and sticky positioning.
- Confirm `/whatwedo`, all four area URLs, and a published program detail keep
  their existing routing, visibility, CTA URLs, and media behavior. Compare with
  baseline before intentionally publishing any content changes.
- Use isolated test/staging content for publishing checks; no speculative saves
  to live content and no reset to defaults. Distinguish unavailable media from
  a UI regression. Record auth/runtime limitations plainly.

Final readiness requires the contract, acceptance checks, and recorded evidence,
not merely a clean build. A build skips TypeScript errors in this repository.

## Rollback and remaining decisions

Because presentation does not migrate data, rollback the feature's implementation
diff without reverting unrelated work or restoring old public content. An already
published content edit is separate and requires a deliberately retained snapshot;
rolling back source does not undo that edit. Avoid destructive reset commands.

Conservative defaults pending user review: preserve all card capabilities; keep
Advocacy pinned first; preserve live rollout behavior. The user's five-tab order
is implemented. Runtime verification of the latest navigation remains pending
because browser control cannot initialize.
