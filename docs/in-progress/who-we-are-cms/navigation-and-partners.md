# About tabs and Partners migration

Implemented in source on 2026-10-12 at the user's request. Runtime acceptance
remains pending; this does not complete the remaining public-section CMS work.

## Navigation and ownership

The existing About fields now use the What We Do tab treatment: a horizontal,
rounded muted track inside the same card inset, primary-color active tab with
shadow, primary-tinted hover, icons, no underline, and local horizontal overflow.
The page uses the admin shell's inset instead of adding another centered wrapper.
The CSS is owned by About and includes contrast, forced-color, and reduced-motion
rules. The currently implemented tabs are Hero, Who We Are, How We Do It,
Our Journey, and Partners. Journey remains explicitly retained and publicly hidden.
Governance, Our People, Get Involved, and Page settings await their implementation
slices; no placeholder editors were added for them.

Partners & Sponsors now lives inside the Partners tab, using the existing form,
logo upload bucket, table, publishing flag, sort order, and mutation actions.
Add/edit dialogs save the record in place; deletion keeps its confirmation and
shows failures without dismissing the dialog. Failed form submissions retain
entered values, and an in-flight guard prevents duplicate submit/close actions.
Tab changes keep the About draft. Partners saves and About page-copy saves are
independent; the page-copy save bar is hidden while managing Partners.

There is one sidebar entry, Who We Are. Its permission allows either Settings
or Partners access; the server and tabs still enforce each capability separately.
Editors retain Partners access and default to that tab, without access to page
copy or its Settings-protected API. The CMS directory's Partners shortcut points
directly to the new tab. Existing routes redirect as follows:

| Existing URL | Destination |
| --- | --- |
| `/admin/partners` | `/admin/about?tab=partners` |
| `/admin/partners/new` | `/admin/about?tab=partners&partner=new` |
| `/admin/partners/[id]` | `/admin/about?tab=partners&partner=[encoded id]` |

Unknown partner IDs show an explicit message; repeated query parameters are not
treated as valid tab/record selections. Partner-list failures have a retry state,
not an empty-list substitute. About-load failures disable page editing while
leaving Partners available; recovery adopts the loaded document only when the
editor has no unsaved page changes. Embedded edit links restore focus on close.

Partner actions now check Partners permission on reads and writes, validate name,
type and URL protocols, and revalidate the new admin path as well as existing
paths. A cache-refresh exception after a successful database mutation returns a
saved-with-warning result instead of asking the user to repeat the mutation.
Update/delete request the affected ID to avoid reporting a missing record as a
successful operation. Activity logging stays separate from mutation success.

## Database and public page

No SQL migration, new table, data copying, record deletion, dependency addition,
or live publication was performed. The About public section still renders its
existing six partner category tiles. Moving record management does not wire
those records into the public category section. Team photos remain managed at
`/admin/team`, linked from Hero; public component changes already in the workspace
were preserved.

## Evidence and outstanding checks

Source review traced the server loader, role filter, redirects, tab selection,
form callbacks, draft isolation, list refresh, errors, and existing consumers.
The Impeccable markup detector returned no findings on the four touched managers
and forms. Focused regression cases were added in `__tests__/about/partners.test.ts`
for permission rejection, Editor/sidebar access, load failure, unsafe URLs,
existing-table writes, new/old cache paths, write failure, and post-write cache
failure. These tests were not executed.

As required by AGENTS.md, Prettier, ESLint, typecheck, and test suites were not run.
Browser control could not initialize: kernel assets could not be written because
the tooling path was missing. No current screenshot, authenticated runtime
interaction, connected DB inspection, or save/delete smoke test is claimed.

Pending browser checks: desktop/mobile tab hover/active/overflow; arrow-key and
focus behavior; create/edit upload/save and failed-save retention; confirmed
delete/failure recovery; old list/new/edit deep links; missing-record/load retry;
Editor versus Admin access; page draft → Partners edit → return → save/discard;
contrast modes, forced colors, and large text. Use disposable test records for
mutation verification instead of altering published partner content.
