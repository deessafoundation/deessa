# Conference UI retirement — 2026-10-10

## Scope and naming

The user confirmed that no conference registrations exist and requested reversible archival while preserving modern public/admin events. This phase relocates event-owned components and schema types, archives obsolete conference UI/routes and retires navigation entry points. No file content was permanently discarded and no database, storage or CMS record was changed.

Follow `components/README.md`: lowercase kebab-case filenames/folders, preserved export names and coherent subsystems. Existing filenames already fit these rules. `lib/types/conference-form-schema.ts` was renamed to `lib/types/event-form-schema.ts`; its declarations and runtime helpers are byte-identical. Active and archived consumers have updated import paths.

## Inventory

| Classification | Count | Destination |
|---|---:|---|
| Public event renderer, progress bar and field registry/renderers | 23 | `components/events/public/registration/` |
| Admin event template chooser and conditional editor | 2 | `components/admin/events/event-form-builder/` |
| Shared schema contract | 1 | `lib/types/event-form-schema.ts` |
| Legacy conference components | 18 | `components/archive/conference/public/` and `admin/` |
| Legacy route files, including complete payment | 14 | `components/archive/conference/routes/` |
| **Total moves** | **58** | See [manifest.json](manifest.json) |

Moved contents match the originals with only recorded import-specifier replacements. Preserve the existing registry barrel and repeating-field cycle. No wrappers, compatibility re-exports, dependencies, styling edits or event behavior changes were introduced.

## Retirement edits outside imports

| File | Change |
|---|---|
| `next.config.mjs` | Temporary 307 redirects: `/conference/:path*` → `/events`, `/admin/conference/:path*` → `/admin/events`, `/complete-payment` → `/events` |
| `components/layout/navbar.tsx` | Registration fallback points to `/events` |
| `lib/support/settings.ts` | Default/empty registration href points to `/events`; saved event assignment behavior preserved |
| `components/admin/layout/admin-nav-config.ts` | Conference navigation entry and unused icon removed |
| `app/sitemap.ts` | `/conference` removed |
| `app/robots.ts` | Obsolete conference registration exclusions removed |

Saved CMS hrefs were not rewritten; old conference hrefs are covered by temporary redirects. Modern `conference` event/template categories remain. Next.js configuration changes require a server restart.

## Structural review

- All **58 moves** accounted for with before/after hashes and exact destination casing.
- All **2,757 local source-module relationships** preserved after mapping old paths to new, including archived consumers, relative imports, re-exports and dynamic imports.
- **Zero production imports from `components/archive/`** and zero newly unresolved local source references.
- All **69 existing event UI/route/action files** preserved apart from recorded import replacements.
- **1,305 other snapshot files** unchanged before adding this documentation, excluding six intentional retirement edits.
- Both pre-existing donation-file modifications preserved exactly.

The source scanner had 11 baseline references outside its resolved graph: eight image imports, two generated `.next` declaration imports and the pre-existing `@/lib/types` import in `conference-form-templates.ts`. Their reference state is unchanged. This is not a TypeScript diagnostic or a claim that the images are missing.

No build, lint, formatting, typecheck, test suite or browser workflow was run, following the opt-in rule. Source comparisons establish structural preservation, not successful registration, authenticated mutations, payments or accessibility conformance.

## Separate backend phase

Conference server actions/settings, registration types, schema/template actions, APIs/export endpoint, mailer/templates, shared payment callbacks and `PaymentService` branches, finance support, monitoring and the expiry cron with its `vercel.json` schedule remain. Backend consumers import the relocated schema type; implementations are otherwise unchanged.

The expiry endpoint remains available because its schedule remains configured. Remove them together in the backend phase. Shared branches cannot be archived through file moves alone without editing active shared modules. No table, foreign key, storage object, migration, package or event category was removed.

## Observation and restoration

Keep the archive while exercising public events and authenticated admin events through normal use. Before deletion, repeat dependency review and perform explicitly authorized build/workflow checks.

For restoration, reverse manifest imports and moves, checking hashes and collisions before overwriting. Restore the six retirement edits above when re-enabling conference UI. Preserve unrelated work. Original URLs inside archived files are historical restoration data.

## Subsequent authorized registration fix

After the archival review, the user requested a fix for hidden presentation fields blocking participant registration. `components/events/public/event-registration-form.tsx` now derives visible fields before navigation, validation and review, skipping steps with no visible fields. This intentionally changes that component beyond the original import-only manifest. Preserve this subsequent fix when reversing archival imports. Participant, presenter and both branches reached ticket selection in real local browser checks; presenter details remain required. No event schemas or registration records were changed. See [verification-review.md](verification-review.md).
