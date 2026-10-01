# deessa Foundation — component architecture

Date: 2026-10-01. Phase 2 standard for the forthcoming migration plan. This describes intended boundaries, not the current filesystem or executed moves. Evidence: [analysis](analysis.md), [dependency map](dependency-map.md), and all 434 [file profiles](component-details.md). Exact paths, collisions and batches belong to Phase 3; execution remains behind Phase 4.

## Decision 1: direct domain folders

Keep `components/<domain>/`, consistent with root AGENTS.md. Do not introduce an intermediate `features/` directory. Existing accessibility, arts, conference, podcasts and programs systems already fit this convention; a features layer would add moves without changing their dependency boundaries. Podcasts follows the same rule as every other domain.

The following is a category diagram, not a directory-creation checklist:

```text
components/
  ui/                    reusable controls and UI building blocks
  layout/                public shell and its composition
  shared/                proven cross-domain presentation, by responsibility
  errors/                application-level error presentation
  accessibility/         accessibility system
  arts/                  art presentation
  conference/            conference registration and existing schema renderer
  donations/             donation and receipt presentation
  events/                public event presentation and registration
  homepage/              homepage composition and local helpers
  podcasts/              podcast presentation
  programs/              public program rendering, templates and fixtures
  what-we-do/            activity-area presentation
  <other-domain>/        only when actual files justify it
  admin/
    layout/              admin shell
    <domain>/            domain forms, actions and editors
    media/               authenticated media selection/upload
    rich-text-editor/    coherent editor system, with documented coupling
    finance/             shared donation/payment review controls
    common/              cross-domain admin presentation only
```

Contact, volunteer, support, newsletter, press, about, stories, projects, team and partners are valid owners when justified by their contracts. Do not manufacture empty folders. A one-file domain is legitimate; file count alone does not justify flattening it. `form/`, `photo-wall/` and `seo/` may remain coherent cross-domain systems rather than being moved solely to populate shared/.

This decision does not require changing AGENTS.md. Its direct feature convention and homepage-only `home-` prefix remain authoritative. Existing special categories such as ui and admin are retained; layout/shared/errors are explicit responsibility categories within the same direct-folder convention.

## Decision 2: ownership follows contracts

| Category | Admission rule | Exclusions and consequences |
| --- | --- | --- |
| UI | Domain-neutral controls, layout or presentation building blocks that retain meaning in an unrelated app | No business actions, domain entities, admin services or feature imports. Reusability alone is insufficient. |
| Public domain | Owns business language, entities, workflows or content rendering | Admin preview use does not transfer ownership to admin. |
| Layout | Composes public navigation, footer and layout-wide behavior | Newsletter actions remain newsletter-owned; accessibility remains its own system. |
| Shared | Demonstrated reuse across unrelated domains and a neutral contract | Do not place single-domain widgets here based on possible future reuse. Organize by responsibility, never a miscellaneous bucket. |
| Admin domain | Editing, management and privileged workflow presentation for that domain | Keep forms, actions and local hooks together; do not group all delete buttons globally. |
| Admin common | Cross-domain admin presentation with caller-supplied behavior | Authenticated storage belongs to media; payment review actions belong to finance. |
| Errors | App-wide error/fallback presentation | Event-specific loading/error UI stays with events; program loading stays with programs. |

Generic composites such as StatCard and InitiativeCard have neutral contracts and may remain UI building blocks. This does not authorize renaming their exports or converting them into business cards. EventCard, ProjectCard, StoryCard and TeamMemberCard have domain meaning and should be mapped to their respective domains. Section and PrintButton are neutral layout/browser controls. LocationPicker is a neutral location-input control with provider and default-coordinate dependencies; preserve those dependencies rather than rewriting them during relocation.

FormField and TextareaField remain one coherent `form/` system, distinct from the React Hook Form adapter in ui. PhotoWall remains `photo-wall/`, serving impact, admin preview and demos. StructuredData remains `seo/`. SocialIcons and cross-domain testimonials qualify for shared presentation. ShareButton is podcast-owned because its share text explicitly says podcast. Homepage-only animation helpers stay with homepage unless evidence establishes wider use.

## Decision 3: allowed dependency directions

Arrows below mean imports, not a guarantee that every export renders. Existing library/action boundaries still apply.

| Importer | Allowed component dependencies |
| --- | --- |
| ui | Other ui building blocks; neutral hooks/utilities/packages outside components |
| shared, form, photo-wall, seo | Neutral UI and their own implementation; no admin/domain services unless explicitly recorded as an existing exception |
| public domain | Its own system, UI, neutral shared systems and the named exceptions below |
| public layout | Shell pieces, public accessibility, newsletter and the existing video adapter relationship |
| admin domain | Own system, UI, admin common/media/editor services, public renderers used for preview, and named cross-domain controls |
| admin common | UI and neutral admin presentation dependencies; no domain mutation actions |
| errors | UI and supporting utilities; no business workflow dependencies |
| app route/layout | Composition appropriate to that route, respecting server/client and authorization boundaries |

These are review rules, not new lint enforcement. Do not claim a clean graph by ignoring existing exceptions or adding suppressions. Folder placement is not an authorization boundary. Keep server actions, access checks, request context and provider placement unchanged.

### Explicit existing exceptions

| Relationship | Phase 2 disposition | Constraint for Phase 3 |
| --- | --- | --- |
| Events and admin previews → conference DynamicStep, progress and field registry | Keep the renderer conference-owned for this structural migration; record its event consumers | Preserve the whole field system and schema contracts. A neutral schema-engine extraction would be separate work. |
| Admin event builder → conference builder controls | Permit the current shared control dependency | Keep EnhancedConditionalEditor and FormTemplateChooser with the conference builder initially; preserve the latter's event-action dependency. No builder consolidation. |
| Public layout video adapter → podcast video modal | Preserve the current adapter/implementation relationship | Do not declare the modal generic without reviewing its full contract; no playback refactor. |
| Public program-editor demo → admin editors | Preserve the deliberate demo exception | Retain in-memory fixture behavior, real media guards and public demo route. No authorization changes. |
| Admin previews → public program templates | Allowed renderer reuse | Keep templates public-domain-owned. |
| Program templates → demo CSS and DemoInteractions | Keep production-used resources under program ownership; demo is not an archival unit | Exact destination remains REVIEW until every export and consumer is mapped. Moving the whole mixed module is possible; splitting CommunicationBoard is outside structural scope. |
| Rich-text editor → story actions and story draft hooks | Retain as an explicitly coupled admin service | Preserve editor extensions, serialization names and hooks. Do not advertise it as domain-neutral or split out persistence incidentally. |
| Admin support → ActivityTimeline currently under donations | Candidate admin common activity presentation | Preserve finance/status event semantics and all callers; do not generalize the contract. |
| Donation/payment screens → shared review controls | Candidate admin finance ownership | Status, notes and status-change controls retain their domain actions; donation and payment screens remain distinct domains. |

Existing exception paths are given in [dependency-map.md](dependency-map.md). Exceptions permit preserving existing behavior; they do not permit adding arbitrary new cross-domain dependencies.

## Decision 4: preserve systems and execution boundaries

Keep program templates, program section editors/forms, event form builder, conference registry, homepage managers and rich-text extensions as coherent subsystems. A move must not flatten their hooks, contexts, factories or local helpers. Keep the public programs renderer distinct from its admin editor. Admin event files currently nested under events are candidates for admin/events; all importers, including demos, must follow their exact mapping.

Preserve the four re-export indexes (dashboard, conference fields, form, program templates). The program-sections and EventFormBuilder index.tsx files are implementations. Do not introduce a global components barrel, wildcard export expansion or new barrel-based import style. The field registry/repeating-field cycle is a known constraint; preserve its resolution without rewriting recursion or moving type contracts as a hidden refactor.

Preserve `use client`, `use server`, import type, named/default exports and provider order. NavbarWrapper stays an async server-data wrapper even when located beside client Navbar. Do not route server modules through client barrels. No directive is not proof of server compatibility. Consult installed Next.js guides and fully read accessibility standards before later application edits.

CSS modules travel with their owning system and all consumers. Shared modules must not be renamed as though they serve only one component. Global CSS stays in app; this migration does not consolidate contrast rules or alter selectors. Keep module class keys, data attributes, print rules, animations and asset URLs intact.

## Inventory-group coverage

This table applies the rules to every top-level inventory group. Counts total 434; it is category coverage, not the Phase 3 per-file target map.

| Current group | Files | Standard applied |
| --- | ---: | --- |
| Root files | 39 | Separate shell, homepage, business domains and proven shared presentation; preserve five CSS modules and every importer. Inactive alternatives remain REVIEW. |
| accessibility | 10 | Keep coherent domain, local hook and two CSS modules; preserve external provider/TTS dependencies. |
| admin | 170 | Domain ownership for forms/actions; preserve dashboard, homepage, programs, media and rich-text systems. Finance/common distinctions as above. |
| arts | 3 | Keep arts domain and shared route/component stylesheet; home-art-feature is homepage-only composition with arts ownership. |
| conference | 29 | Keep registration separate from the internally coherent renderer; preserve shared-consumer exceptions and step1–3 type references. |
| donation | 2 | Normalize domain vocabulary to donations when mapped; keep receipt/amount root components in the same domain. |
| error-pages | 6 | Target errors category and kebab-case; component astronaut asset stays REVIEW pending asset disposition. |
| events | 32 | Separate public event files from admin event/editor files; preserve schema and conference-control dependencies. |
| form | 3 | Keep cross-domain field-wrapper system and barrel; no merger with ui/form. |
| photo-wall | 1 | Keep coherent cross-domain presentation system. |
| podcasts | 25 | Keep direct domain, styles and playback system; add root ShareButton only through exact mapping. |
| programs | 37 | Keep renderer/templates/sections/fixtures distinct; production-used demo modules and inactive sections need explicit dispositions. |
| seo | 1 | Keep dedicated cross-domain structured-data helper. |
| ui | 74 | Preserve neutral UI; map four domain cards to domains; duplicated hooks and legacy Toaster remain REVIEW. |
| whatwedo | 2 | Normalize component domain vocabulary to what-we-do, including related root files; routes remain unchanged. |

## Open file dispositions and exit criteria

Architecture choices A01–A07 and A10 now have rules or explicit preserved exceptions above. A08 retention and A09 toast compatibility remain open, as do exact mixed demo resource destinations. These do not prevent writing the mapping: use REVIEW with no executable move until resolved. Keep intentionally installed unused primitives distinguishable from inactive feature implementations; no automatic archiving, merging or deletion.

Phase 2 is complete when architecture and naming rules cover the inventory, remaining ambiguity is explicit, and documentation is consistent. Phase 3 must account for every file, including KEEP/REVIEW, check destination collisions and list every reference update. No application change is authorized by this document alone.
