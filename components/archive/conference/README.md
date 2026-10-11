# Conference UI archive

Archived on 2026-10-10 after the user confirmed that the conference workflow was retired and had no registrations. Keep these files for an observation period; deletion requires a later decision.

This archive contains **18 legacy component files** and **14 former route files**. Production code must never import this directory. Original implementations, exports, directives, styles, field IDs and URLs are preserved; only module paths changed where relocation required it.

| Directory | Contents |
|---|---|
| `public/` | Legacy registration wrapper, review screen, step 1–3 type providers and standalone preview renderer |
| `admin/` | Legacy registration management controls and conference form builder |
| `routes/public/conference/` | Former conference landing, registration and payment-result pages |
| `routes/public/complete-payment/` | Former conference payment-link page |
| `routes/admin/conference/` | Former conference registration, settings and form-builder routes |

Route files are outside `app/` and no longer define routes. Temporary redirects send `/conference` and its descendants to `/events`, `/admin/conference` and its descendants to `/admin/events`, and `/complete-payment` to `/events`.

## Active event dependencies

The 25 components used by modern events were moved to `components/events/public/registration/` and `components/admin/events/event-form-builder/`. The shared schema contract is now `lib/types/event-form-schema.ts`. They are active production files, not archive candidates. Preserve the field registry/repeating-field cycle, all 20 field-type keys and schema contracts.

## Restoration and later deletion

The [move manifest](../../../docs/in-progress/conference-retirement/manifest.json) records source/destination paths, before/after hashes and import adjustments. The [retirement record](../../../docs/in-progress/conference-retirement/README.md) describes navigation/configuration edits and retained backend scope.

Before restoration, check target collisions and subsequent changes. Reverse the relevant imports and moves together. Restore route files under `app/` only with their component dependencies and remove the applicable redirects. Do not overwrite newer code. Archived step 1–3 types are consumed by the archived review screen and must stay together.

Before deletion, observe public event registration and admin event creation, form editing, previews, templates, conditional fields, uploads and payments. Repeat the dependency search and run the appropriate explicitly authorized checks. This relocation did not execute those workflows or build/test/lint/typecheck commands. Archived TypeScript remains included by the current TypeScript configuration.

Conference backend actions, APIs, payment branches, email services, finance support, monitoring and expiry cron remain for a separate cleanup. Do not remove their tables, storage, migrations or shared packages as part of deleting this UI archive.
