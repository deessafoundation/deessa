# What We Do content editor

Planned admin UX simplification: [refined plan](./ux-plan.md) and
[implementation checklist](./ux-tasks.md). The current main tab order is
Hero / Areas of Work / Area detail pages / Ways to Help / Programs. All five
destinations share one persistent tab bar. Introduction appears above the cards in Areas of
Work. Programs opens its existing manager in a new tab. The forms and storage
contracts documented below remain current. Authenticated browser acceptance
for publishing remains pending. Navigation and the requested detail hierarchy
have now been inspected in the authenticated browser.
Phase 1 evidence and every preserved field are recorded in the
[baseline inventory](./phase-1-baseline.md), including runtime verification gaps.

## Hero editing

The Hero form groups headline, supporting copy, buttons, and photos. All 17
original fields keep their settings paths and validation IDs. The two first-line
headline fragments remain separate; the other two lines retain their existing
public appearance. Breadcrumb and above-headline labels stay editable.

Each of the three fixed photo positions has a thumbnail beside its URL and alt
text. Thumbnails reflect the public crop; the main photo also supplies the public
background. Public photo captions are displayed for context and remain code-owned.
Unsafe image URLs show a prompt instead of loading a preview; unavailable images
show a recovery message. These previews do not change saved values.

Choose image uses the existing image picker, `hero-images` bucket, `image/*`
acceptance, and 10 MB limit. Closing or selecting returns keyboard focus to the
corresponding button. Uploads retain the media service's existing immediate
storage behavior; page discard does not delete uploaded files.

Browser checks covered all fields, navigation with unsaved edits, URL validation,
picker cancellation and keyboard selection, and 390px layout. Temporary edits
were restored without publishing. Successful save/reload, upload, and contrast
mode runtime acceptance remain pending.

The editor is at `/admin/what-we-do`. The public `/whatwedo` page reads the same
validated document from `site_settings`, key `what_we_do_content`. Homepage cards
still use their separate homepage settings.

## Card management

The Areas of work editor manages card titles, descriptions, badges, links, icons,
color themes, arrow variants, visibility, decoration, ordering, desktop columns,
and grid spacing. Cards can be added and removed; new cards start hidden. The
collection supports up to 20 cards. Adding a card does not create a detail route;
its destination must be an existing page, local anchor, or HTTPS URL.

The immutable `slug` is a stable card identifier, not its destination. The stored
array defines display order. Public rendering uses each card's own settings,
never its array position. The admin preview reuses the public renderer and opens
from Preview card in a modal; the editing form uses the full available width.
Preview includes unsaved changes and hidden cards, and does not publish content.

The introduction has editorial labels, followed by the card chooser and the
selected card's copy. Card appearance and Grid layout are separate native
disclosures, closed initially. Appearance applies to the selected card; grid
controls apply to the collection. Both retain every original setting.

Card selection lives in the manager and uses the stable slug, so it survives
tab changes. Removing the selected card chooses
the next card at that position, or the preceding card when removing the last one.
Removing the only card shows the existing empty state; adding still starts hidden.
Discard retains selection if its slug still exists and otherwise shows the first
restored card. None of this selection state is part of the saved document.

This Phase 4 slice is source-reviewed. Browser verification is pending because
the browser-control tool failed to initialize on 2026-10-12. No screenshot or
runtime acceptance is claimed for these latest card-form changes.

## Area detail editing

Choose one destination: Advocacy, Awareness, Training, or Resources. The selected
area shows its public URL and Live / Coming soon status. Open one content group
at a time: introduction, video, purpose, learning, audience, or calls to action.
Animated Story and Inclusive Schools belong under Advocacy; Inclusive Learning
belongs under Training. These views reuse the original settings paths and media
controls. Changing the selected area or opening a group does not edit content.

Validation opens the owning area and group, including module errors. Live video
aggregation and coming-soon behavior are unchanged. Paused areas' introductory
copy and media can still affect Advocacy, as explained beside those fields.
The editor now relies on the admin shell's padding to avoid a doubled sidebar gap.

## Ways to Help editing

Edit the section label, two heading fragments, and introduction first. Then choose
Donation, Partnership, or Volunteering to edit that action's title, description,
button text, and destination URL. All 16 existing string fields retain their
original settings paths, input IDs, and validation messages. Public order,
icons, colors, and the three-action tuple are unchanged.

The chosen action stays selected when leaving and returning to Ways to Help.
Selecting an action does not change content. If the first validation error belongs
to an action, save opens Ways to Help with that action selected. Other actions
with errors are marked Needs attention. Edits still use the manager's canonical
settings document and existing Save & publish / Discard behavior.

This slice was source-reviewed on 2026-10-12. The markup detector found no issues.
Browser control still failed to initialize, so screenshots, keyboard/mobile
checks, validation routing, and save/discard runtime acceptance remain pending.
No content was published and no automated test suite was run.

## Storage and compatibility

No Supabase SQL migration is required. The existing JSON value accepts the new
fields and `cardsLayout` without a table change. Legacy documents are normalized
by `whatWeDoSettingsSchema` on load and on save. Only missing presentation fields
receive defaults; existing text, links, and explicit presentation settings are
preserved. Original icon/badge defaults are resolved by slug, so reordering does
not change a card's identity. New fields are persisted on the next content save.

Do not run a SQL backfill that replaces the settings document with defaults.
The application handles compatibility without overwriting saved content.

## Extending the editor

- Add supported icon names in `lib/types/what-we-do-settings.ts` and their Lucide
  components in `components/what-we-do/pillar-icons.ts`. The typed registry keeps
  renderer support aligned with the schema. Raw SVG markup is not accepted.
- Add color themes to `PILLAR_ACCENTS` and the public `pillar-card.module.css`.
  Pair foreground and background colors, retaining contrast-mode overrides.
- Card shape and validation are explicit; other existing page sections retain
  their existing content schema and media-picker behavior.
- Save authorization, same-origin checks, URL validation, and public-route
  revalidation continue through the existing settings API.

Regression coverage: `__tests__/what-we-do-settings.test.ts` covers legacy loading,
ordering, additions/removals, round trips, duplicate identifiers, and invalid
URLs/presentation fields. Tests, lint, formatting and type checking were not run,
per the repository's opt-in verification rule.

## Temporary Advocacy rollout

Advocacy is pinned first on the public page. Awareness, Training and Resources
retain their saved content and remain clickable. Their URLs show designed
coming-soon states with links to Advocacy and What We Do. The rollout gate
is documented in `lib/data/what-we-do-availability.ts` and the card renderer;
remove it when the other pages are ready. Saved admin order is not overwritten.

The Advocacy detail page now displays its lead video plus the other existing
area videos, deduplicated by source URL. Media still reads the existing area
fields, avoiding a duplicate settings collection or database migration. The
enabled animated-story section is also shown here when its local video exists
or it uses uploaded HTTPS media. Earlier inspection found its default MP4 absent;
the Phase 1 browser baseline on 2026-10-11 shows the animated-story section now
rendering. This verifies display, not playback. The existing availability gate
and player's media-failure handling remain in place. The homepage intro video
is outside this collection.

The gallery loads videos on demand and pauses other gallery players when a new
one starts. Public ordering and the previous rollout were browser inspected;
automated suites remain opt-in.
