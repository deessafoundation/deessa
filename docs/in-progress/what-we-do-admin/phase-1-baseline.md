# Phase 1: What We Do editor baseline and field inventory

Recorded: 2026-10-11. Source baseline: Git HEAD `180a0e4` plus the existing working tree.
Scope: read-only source/browser analysis and documentation. No application,
schema, API, media, or saved-content changes. Phase 2 has not started.

## Evidence and limitations

| Surface | Observation | Evidence / limit |
|---|---|---|
| `/admin/what-we-do` | Redirects to `/admin/login` in the available in-app browser | Direct navigation; authenticated desktop/mobile form captures and save/discard checks unavailable |
| `/whatwedo`, desktop | Hero, introduction, four cards, Programs, Ways to Help rendered | DOM/AX inspection and viewport screenshot in tool history; current default viewport, not a fixed desktop-size assertion |
| `/whatwedo`, 390 × 844 | Hero and actions rendered; mobile navigation present; no document horizontal overflow at this viewport | DOM measurement and viewport screenshot in tool history; not a complete mobile/contrast audit |
| Main area cards | Advocacy → Awareness & Community Engagement → Training → Resources | Rendered link order; destinations remain their four existing area URLs |
| Programs listing | “No published programs yet.” | Current rendered empty state only; populated listing/program-detail baseline unavailable |
| `/whatwedo/advocacy` | Live lead video, three other area video players, animated-story module, inclusive-school module, action/audience/closing content | DOM/AX inspection; five play buttons present; video playback/downloads not exercised |
| `/whatwedo/awareness` | Awareness & Community Engagement; coming-soon state | Settled AX snapshot after ignoring initial loading state |
| `/whatwedo/training` | Training; coming-soon state | Rendered route/heading/content observation |
| `/whatwedo/resources` | Resources; coming-soon state | Waited for observed shared “This section is taking shape” heading; confirmed final route/content |

Screenshots were captured in this chat's tool history; no standalone screenshot
files were exported. Browser viewport override was reset and temporary tabs
closed. No login was attempted, server started, settings toggled, form submitted,
media uploaded, or content published. Tests, lint, formatting, and typecheck did
not run. The brief intro overlay had ended before its Skip control could be
clicked; screenshots were captured after confirming it had disappeared.

## Inventory notation and completeness

`c` denotes any existing card index, `a` any of awareness/training/resources/
advocacy, and `i` any existing list/object index. Paths below are the original
storage/validation paths, not proposed UI-state identifiers. Each grouped row
explicitly names all leaves it covers. Do not drop an unused/paused field.

Inventory was compared against `DEFAULT_WHAT_WE_DO_SETTINGS`, explicit card and
layout schemas, `WHAT_WE_DO_AREAS`, the recursive `Fields` renderer, specialized
`CardsEditor`, and public consumers. Card presentation fields are normalized by
the schema even though the raw default cards omit them.

## Hero → primary Hero tab

All fields currently render under Hero & images.

| Paths | Current control | Public effect / preservation |
|---|---|---|
| `hero.breadcrumb` | Text input | Current breadcrumb label |
| `hero.eyebrow` | Text input | Small introductory label |
| `hero.headingStart`, `hero.headingEmphasis` | Separate text inputs | First heading line; keep both original fields |
| `hero.headingEnd` | Text input | Second heading line |
| `hero.headingAccent` | Text input | Accent heading line and underline |
| `hero.description` | Textarea | Hero supporting copy |
| `hero.primaryLabel`, `hero.primaryHref` | Text inputs | Primary action label and destination; currently `#programs` |
| `hero.secondaryLabel`, `hero.secondaryHref` | Text inputs | Secondary action label and destination; currently `/donate` |
| `hero.photos.i.src` | URL input + image picker | Three fixed photo slots; slot 0 also supplies decorative background image |
| `hero.photos.i.alt` | Text input | Meaningful figure image descriptions; decorative background keeps empty alt |

Photo captions, crops, frame layout, icons, and heading line structure are code
owned. They are not missing CMS fields to introduce during this simplification.

## Introduction → primary Areas of Work tab

Currently a separate Introduction tab; all four leaves are editable.

| Paths | Current control | Public effect |
|---|---|---|
| `introduction.label` | Text input | Section eyebrow |
| `introduction.title`, `introduction.titleAccent` | Text inputs | Section heading and accent fragment |
| `introduction.description` | Textarea | Copy immediately above the area cards |

## Cards and layout → primary Areas of Work tab

Currently specialized Areas of work editor. Applies to every saved card,
including custom and hidden cards, not just the four defaults.

| Paths | Current control | Public effect / preservation |
|---|---|---|
| `cards.c.slug` | No editable control | Stable identity, selection, React key, default presentation lookup, and matching known area's coming-soon card; never derive from edited title |
| `cards.c.title` | Text input | Card heading; matched coming-soon heading |
| `cards.c.description` | Textarea | Card copy; matched coming-soon introductory copy |
| `cards.c.buttonLabel` | Text input | Card link text and accessible name |
| `cards.c.href` | URL input | Actual destination; independent of slug and does not create a route |
| `cards.c.tag` | Text input | Badge; empty string hides it |
| `cards.c.icon` | Enum select | Card icon and matched coming-soon icon |
| `cards.c.accent` | Enum select | Card color theme |
| `cards.c.arrow` | Enum select | Link arrow variant |
| `cards.c.enabled` | Switch | Whether card appears in the public main-page collection |
| `cards.c.showIcon`, `cards.c.showArrow`, `cards.c.showDecoration` | Switches | Individual card presentation flags |
| `cardsLayout.columns` | Enum select | Responsive grid's desktop column choice, 1–4 |
| `cardsLayout.spacing` | Enum select | Compact / comfortable gaps |

Operations: choose card, add hidden card, remove with confirmation, move earlier/
later, and view inert single-card preview. The preview ignores grid layout and
shows a selected hidden card too. Visibility does not remove its destination
route. Coming-soon pages use matched card icon/title/description regardless of
its visibility and card decoration flags.

Saved ordering is retained, but public rendering promotes Advocacy to first.
Custom destinations remain local paths, anchors, or HTTPS URLs. Removing a card
does not remove its area route, media file, or program.

## Area details → secondary Area detail pages destination

Currently all four areas appear as nested fieldsets in Area detail pages.

| Paths (for every `a`) | Current control | Current public use |
|---|---|---|
| `areas.a.id`, `areas.a.labelClass` | Hidden by generic renderer; schema literals | Preserve identity and future generic area styling; not editorial fields |
| `areas.a.label` | Text input | Metadata title for all areas; live Advocacy label/breadcrumb/player badge; fallback label on a coming-soon page |
| `areas.a.headline` | Text input | Live Advocacy heading; other full-detail headings retained while paused |
| `areas.a.subtitle` | Text input | Metadata description for all areas; live Advocacy intro; paused-area video description in Advocacy gallery; coming-soon fallback if card missing |
| `areas.a.videoSrc` | URL input + video picker | Advocacy lead or deduplicated gallery video, including videos saved under paused areas |
| `areas.a.videoLabel` | Text input | Lead/gallery accessible video label and gallery heading; unavailable-media copy |
| `areas.a.posterSrc` | URL input + image picker | Lead/gallery poster image |
| `areas.a.playButtonLabel` | Text input | Player's visible watch label at applicable viewport; accessible play name uses videoLabel |
| `areas.a.panelTitle` | Text input | Live Advocacy purpose heading; other detail fields retained while paused |
| `areas.a.description` | Textarea | Live Advocacy purpose text; other detail fields retained |
| `areas.a.highlights.i` | Text input per existing item | Live Advocacy purpose list; other detail lists retained |
| `areas.a.learningTitle` | Text input | Live Advocacy action section heading; other detail headings retained |
| `areas.a.learningItems.i.title` | Text input | Live Advocacy action-item title; other detail values retained |
| `areas.a.learningItems.i.description` | Textarea | Live Advocacy action-item copy; other detail values retained |
| `areas.a.learningItems.i.icon`, `areas.a.learningItems.i.color` | Hidden; schema literals | Generic area's icon/color identities retained; current Advocacy renderer does not use these values |
| `areas.a.audienceTitle` | Text input | Live Advocacy audience section heading; other detail values retained |
| `areas.a.audienceDescription` | Textarea | Live Advocacy audience copy; other detail values retained |
| `areas.a.audiences.i` | Text input per existing item | Live Advocacy audience chips; other detail lists retained |
| `areas.a.ctaLabel`, `areas.a.ctaHref` | Text inputs | Live Advocacy secondary hero action; other detail actions retained |
| `areas.a.closingTitle` | Text input | Live Advocacy closing heading; other detail values retained |
| `areas.a.closingDescription` | Textarea | Live Advocacy closing copy; other detail values retained |
| `areas.a.closingButtonLabel`, `areas.a.closingButtonHref` | Text inputs | Live Advocacy closing action; other detail values retained |

Advocacy aggregates `Object.values(content.areas)` without copying fields. It
excludes duplicate sources and its own lead source. Thus a paused destination
does not imply that its media/subtitle edits are invisible on the live website.

## Animated story → Area detail pages / Advocacy module

Currently a standalone Animated story tab. Public Advocacy includes the module
when enabled, its source is available by the existing local-manifest/HTTPS
condition, and its source is not in the deduplication set. The dormant generic
Awareness renderer also references it; Awareness is currently paused.

| Paths | Current control | Public effect |
|---|---|---|
| `animatedStory.enabled` | Checkbox | Module enable condition, not guarantee of playback/display |
| `animatedStory.videoSrc` | URL input + video picker | Video source |
| `animatedStory.posterSrc` | URL input + image picker | Poster |
| `animatedStory.videoLabel`, `animatedStory.areaLabel`, `animatedStory.playButtonLabel` | Text inputs | Video accessible label/title, badge, watch label |
| `animatedStory.eyebrow`, `animatedStory.title` | Text inputs | Section eyebrow and heading |
| `animatedStory.description` | Textarea | Supporting copy |
| `animatedStory.listTitle` | Text input | Conversation list heading |
| `animatedStory.items.i` | Text input per existing item | Conversation prompts |

## Inclusive schools → Area detail pages / Advocacy module

Currently a standalone Inclusive schools tab; enabled module is live on Advocacy.

| Paths | Current control | Public effect |
|---|---|---|
| `inclusiveSchool.enabled` | Checkbox | Module visibility |
| `inclusiveSchool.imageSrc` | URL input + image picker | Illustration source |
| `inclusiveSchool.imageAlt` | Text input | Illustration alternative text |
| `inclusiveSchool.eyebrow`, `inclusiveSchool.title` | Text inputs | Eyebrow and heading |
| `inclusiveSchool.introduction`, `inclusiveSchool.description` | Textareas | Introductory and supporting copy |
| `inclusiveSchool.items.i` | Text input per existing item | Inclusion principles list |

## Inclusive learning → Area detail pages / Training module

Currently a standalone Inclusive learning tab. Saved content is retained but
the public Training route is paused before the full-detail renderer executes.

| Paths | Current control | Intended full-detail effect |
|---|---|---|
| `inclusiveLearning.enabled` | Checkbox | Module visibility when Training is activated separately |
| `inclusiveLearning.imageSrc` | URL input + image picker | Illustration source |
| `inclusiveLearning.imageAlt` | Text input | Illustration alternative text |
| `inclusiveLearning.eyebrow`, `inclusiveLearning.title` | Text inputs | Eyebrow and heading |
| `inclusiveLearning.quote`, `inclusiveLearning.description` | Textareas | Quote and supporting copy |
| `inclusiveLearning.listTitle` | Text input | List heading |
| `inclusiveLearning.items.i` | Text input per existing item | Teaching principles list |

## Ways to Help → secondary Ways to Help destination

Currently Ways to help tab; all leaves affect the main public page.

| Paths | Current control | Public effect |
|---|---|---|
| `support.label` | Text input | Eyebrow |
| `support.title`, `support.titleAccent` | Text inputs | Heading and accent fragment |
| `support.description` | Textarea | Section supporting copy |
| `support.actions.i.title` | Text input | Action-card heading |
| `support.actions.i.description` | Textarea | Action-card copy |
| `support.actions.i.cta`, `support.actions.i.href` | Text inputs | Button label and destination |

Three fixed action slots retain code-owned donate/partner/volunteer icon,
styling, and primary/secondary treatment. Renaming a title does not reassign
its visual role. Do not convert these to reorderable/custom cards in this scope.

## Programs → primary Programs tab with external manager handoff

No Programs leaves exist in this settings document. Public heading, description,
category labels, pagination behavior, and empty states are code owned. Listing
entries come from `program_publications` via `getPublishedProgramCards()`,
ordered by display_order and publication time. Program details use the existing
publication document and route. Do not add settings fields, duplicate fetching,
or imply that this editor changes program publication status.

## Validation, media, and state contract

- Generic scalar text is trimmed, required, and capped at 10,000 characters;
  card badge alone may be empty. Explicit card identity has its own syntax and
  80-character cap; tag is capped at 80 characters.
- Generic immutable string keys are `id`, `slug`, `labelClass`, `icon`, `color`.
  The dedicated card schema is an exception: card icon is an editable supported
  enum; card slug is not editable. Generic label values are editable, not literals.
- Objects are strict. URLs allow safe local paths, anchors for hrefs, or HTTPS;
  src fields do not permit anchors. Preserve validation and parsed-save trimming.
- Hero photos, support actions, and each area's learningItems are fixed tuples
  of three. String lists (highlights, audiences, module items) permit 1–20 saved
  entries, but the current generic editor only edits existing slots. Do not
  accidentally add/remove list items while simplifying layouts.
- Cards allow 0–20 entries, unique stable slugs, supported icon/theme/arrow enums,
  visibility flags, and schema defaults for missing legacy presentation fields.
- Media picker: image sources use `hero-images`, `image/*`, 10 MB; video sources
  use `hero-videos`, `video/mp4`, 100 MB. Keep existing library/upload/URL behavior.
- Uploading media writes to storage before Save & publish. Discard restores the
  settings document, not uploaded files. Do not promise that discard undoes uploads.
- Whole-document save remains POST `{ settings: parsed.data }` to the existing
  endpoint; one settings state owns fields across old/new destinations. All
  required hidden or inactive content is still validated and persisted.
- Save requires authenticated settings permission, matching request origin,
  and valid server-side content. Successful upsert retains updated_by/updated_at
  and revalidates main page, each area URL, and the admin editor.
- Current state: initial selected section is cards; dirty uses complete-document
  comparison; ordinary failure keeps edits; save disables controls; discard
  confirms and restores the last saved document; beforeunload warns on dirty.
- Changing any field currently clears every error. First-error routing opens an
  old top-level tab but does not select the invalid card or focus the field.
  These are recorded existing deficiencies, not verified new behavior.

## Phase 2 requirements derived from this baseline

1. All above paths remain reachable with the same field/control contracts. Use
   the plan's explicit old-path routing when regrouping tabs, including module
   errors and `cardsLayout` errors.
2. Keep page state outside tab panels and secondary destinations. Navigating
   does not dirty, save, discard, or mutate selection into the POST document.
3. Feature styling must not change shared tab controls or public components.
   Admin header is `h-16 sticky top-0 z-40`; existing local save bar is also
   sticky top-0 at z-20. Offset only the feature bar; visual overlap remains
   unconfirmed until authenticated inspection.
4. Preserve rollout gates, Advocacy-first ordering, and all media consumers.
   Program handoff opens existing manager in a clearly announced new tab.
5. Preserve scoped high/inverted-contrast selectors required by AGENTS.md.
   Current public preference runtime uses normal/high/negative (legacy inverted
   preferences migrate); admin does not mount that public provider. Do not add
   new preferences or change the provider to style this editor.

## Readiness record

- Review pass on 2026-10-11: rechecked manager state/validation, card selection
  and operations, persistence API, existing regression coverage, and feature
  documentation. No feature implementation code has changed. The plan now
  distinguishes initial destination routing from later form grouping and field
  recovery, and explicitly requires a return path from secondary destinations.
- Source field inventory, public-consumer map, and field-preservation contract:
  complete for this phase.
- Working tree reviewed: preserve unrelated events-page, events-document, and
  community-posts admin-page changes. Existing UX plan/checklist files remain
  part of this feature work.
- Full accessibility standards and component ownership guide read. Installed
  Next.js server/client boundaries, useRouter guidance, and revalidatePath
  behavior reviewed; no framework code changed.
- Public baseline captured and observed limitations recorded. Authenticated
  admin baseline, populated programs, successful persistence, playback, keyboard/
  contrast/200%-text checks remain unverified.
- Phase 1 analysis is complete with these explicit runtime gaps. Phase 2 can
  use the preservation map; authenticated visual validation is still required
  before calling the eventual UI implementation ready.
