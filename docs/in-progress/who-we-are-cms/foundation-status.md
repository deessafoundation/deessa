# Who We Are: loading/save foundation

Implemented and source-reviewed on 2026-10-12. This is the first implementation
slice, not completion of the full CMS or Checkpoint A acceptance.

## Delivered source

- `lib/types/about-settings.ts`: shared schema for current Hero, intro, process
  and retained Journey fields. Validates text/list bounds, stable unique IDs,
  link/media protocols, safe hex colors and image alternative text. Optional
  display copy and explicit empty lists remain supported. Unknown legacy keys
  are preserved rather than stripped, including the old `whatWeDo` section.
- `lib/data/about-settings-normalization.ts`: pure compatibility function. Fills
  missing fields without replacing existing lists/values; matches known steps
  and milestones by stable ID; preserves explicit image removal/custom years.
  Known legacy copy substitutions are narrow and do not reset custom intro
  paragraphs, quote or flow. Inputs are not intentionally mutated.
- `lib/data/about-settings.ts`: request-cached, server-only validated reader.
  A missing row receives defaults. Database failure, null/invalid values, empty
  malformed records, and the old nested-Journey corruption stop loading with
  a repair/retry message. Public and admin currently share this failure policy.
- `app/api/admin/about-settings/route.ts`: same settings permission as the admin
  page; same-origin check; JSON and 1 MB UTF-8 payload checks; whole-document
  validation before upsert; authenticated `updated_by`; generic write errors;
  structured validation paths. No normalization/default filling occurs on POST,
  so an incomplete submitted document cannot overwrite sections with defaults.
- Successful persistence revalidates `/about` and `/admin/about`. A refresh
  exception after persistence returns success with a warning, not a false write
  failure. A database write failure returns an error and requests no refresh.
- `components/admin/about/about-manager-client.tsx`: compares settings with a
  saved snapshot; advances that baseline only on confirmed success; Discard uses
  that latest baseline. Uses client validation and opens the first error's tab.
  A synchronous in-flight guard and disabled content fieldset prevent edits and
  repeated submit/discard during saving. Adds the unload warning, named mobile
  controls, public-page naming, visible validation/refresh messages, and fixes
  the Journey title update to spread `p.journey` instead of the root document.

The existing public component files, Hero redesign changes, Team/Partners
managers, metadata, canonical routes, and SQL scripts were not modified by this
slice. There is no dependency addition, database migration, data backfill,
live publication, or automatic Journey restoration.

## Preservation and limits

- Read normalization and save validation are deliberately separate: known old
  missing fields are completed on read; API input must be complete and valid.
- All current 71 default string leaves (including IDs/colors and legacy fields)
  remain represented in the document. Additional legacy keys also round-trip.
- Lists are capped at 100 items and text at 10,000 characters; the API caps the
  full request at 1 MB. Existing out-of-bounds/invalid documents require repair
  rather than truncation or silent fallback. Array emptiness is preserved.
- HTTP links, credentials in URLs, protocol-relative URLs, backslashes/control
  characters, invalid colors/IDs, duplicate IDs and image-without-alt fail
  validation. Media accepts local paths or HTTPS; button/source URLs also allow
  anchors. Optional media/source fields can be explicitly empty.
- Any previously saved nested-Journey corruption now requires restoration or
  repair before this shared reader can render the page/editor. No connected
  record was inspected or rewritten; do not claim it already meets the schema.
- Narrow legacy updates may reveal custom intro copy that the old reader hid by
  replacing the whole intro. This preserves the editor's saved content, but
  actual public copy must be compared with a live baseline before acceptance.
- Full inline field associations/focus and unrelated-error retention are still
  part of the form/navigation phase. The foundation currently provides a
  section-routed validation summary. App-wide internal navigation protection
  and multi-admin concurrency are separate concerns.

## Review and coverage

Source-reviewed all callers, current defaults and migrations, retained keys,
schema/normalization wiring, saved baseline, in-flight guards, permission/origin
checks, errors and post-write invalidation semantics. Installed Next.js
revalidatePath and Zod 4.5.4 declarations were inspected. The markup detector
reported no findings on the changed admin manager.

Regression cases in `__tests__/about/settings.test.ts` cover default/legacy
round trips; nested missing fields; explicit empty lists; input preservation;
ID-based milestones after reorder; custom years/image removal; custom intro copy;
malformed/nested-corrupt records; unsafe URLs; duplicate IDs/limits/alt text;
missing-row versus load failure; permission/origin rejection; incomplete/unsafe
requests; malformed JSON and UTF-8 size limits; complete persistence; write
failure; and refresh failure after successful persistence.

No automated tests, typecheck, lint, formatting, or build were executed, under
AGENTS.md's opt-in rule. When requested, the focused test command is:

`pnpm exec jest --runInBand __tests__/about/settings.test.ts`

Browser control again failed before opening a tab because its kernel asset path
was missing. No screenshot, mobile/contrast/focus test, authenticated save/reload,
public parity, or edit → save → edit → discard result is claimed.

Before Checkpoint A: inspect and snapshot real saved data; execute authorized
focused checks; verify load failure and valid legacy content; exercise dirty
reversion, save/discard baseline, busy controls, unload warning, failed saves,
structured validation and saved-with-refresh-warning behavior in the browser.

