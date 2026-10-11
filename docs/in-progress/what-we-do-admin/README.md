# What We Do content editor

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
never its array position. The admin preview reuses the public renderer.

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
or it uses uploaded HTTPS media. Its default MP4 is absent from the local public
assets, so it is currently omitted rather than presenting a broken player. The
player also handles media failures. The homepage intro video is outside this collection.

The gallery loads videos on demand and pauses other gallery players when a new
one starts. Public ordering and the previous rollout were browser inspected;
automated suites remain opt-in.
