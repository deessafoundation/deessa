# deessa Foundation — component dependency map

Snapshot: 2026-10-01. Static source findings; no migration or runtime validation.

The complete direct edges, their source line numbers, import kinds and type-only flags are in [component-evidence.json](component-evidence.json). [Per-file profiles](component-details.md) list direct consumers and transitive app/test ancestors for all 434 files. This document explains the relationships that influence architectural decisions. Arrows mean “imports”; they do not establish rendered use of every exported symbol.

## Relationships to preserve

| Importing source | Dependency | Meaning / migration risk |
| --- | --- | --- |
| `app/(public)/layout.tsx` | NavbarWrapper, Footer, IntroVideo, DevelopmentNoticeModal, GlobalVideoModal, accessibility components | Layout-wide blast radius; not homepage-only. |
| `components/navbar-wrapper.tsx:1` | `lib/support/settings.ts` → `lib/supabase/server.ts` → `next/headers` | Server data wrapper; do not introduce a client barrel above it. |
| `components/global-video-modal.tsx:4` | `podcasts/podcast-video-modal.tsx` | Public shell currently depends on a podcast-folder implementation. Review ownership rather than assuming the shell is independent. |
| `components/events/public/event-registration-form.tsx:7` | conference StepProgressBar and DynamicStep | Public events depend on the conference rendering engine. |
| `components/admin/form-preview.tsx:5` | conference DynamicFormRenderer → DynamicStep | Admin conference preview uses the same rendering system. |
| `components/conference/dynamic-step.tsx:4` | `conference/fields/index.ts` | Schema-driven field selection, not a fixed JSX-only list. |
| `components/events/admin/EventFormBuilder/index.tsx` | conference FIELD_REGISTRY and FormTemplateChooser | Admin event builder previews public field renderers and loads event templates through a conference-named directory. |
| `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:10` | EnhancedConditionalEditor | Shared with conference form-field and form-step editors. |
| `components/programs/CmsProgramRenderer.tsx:4` | templates/index.ts → four category templates | A rename must cover the barrel, category dispatch, public detail page and admin preview. |
| `components/programs/templates/EditorialParts.tsx:4` | `demo/DemoInteractions.tsx` | CommunicationBoard is rendered in the production content switch. Demo-folder retention affects production. |
| Program templates and EditorialParts | `demo/programs.module.css`; CampaignTemplate also uses `demo/campaign-concept.module.css` | Shared styles must move with all references, not only demo routes. |
| `app/(public)/demo/program-editor/page.tsx` | `admin/ProgramEditorDemo.tsx` → ServiceEditForm / EditorialProgramEditor | Deliberate public demo → admin editor relationship; sample save/restore uses memory. |
| `components/admin/payments/payment-detail-client.tsx:43` | donations review status, notes, activity, status-change and error boundary | Finance components cross donation/payment folders. |
| `components/admin/support/support-detail-client.tsx:21` | donations ActivityTimeline | An additional cross-domain admin consumer. |
| `components/admin/rich-text-editor.tsx` | story actions plus extensions/dialogs/hooks | Used by story editing and program rich-text sections; not a domain-neutral editor merely because its UI is reusable. |
| `components/admin/media-library-client.tsx:67` | MediaPicker, rendered at line 1041 | Active usage disproves the archived deletion recommendation. |
| `components/admin/story-form.tsx:22` | `app/print-styles.css` | A global CSS dependency outside the component tree. |
| `lib/notifications.ts:3` | `components/ui/toast.tsx` | Component consumers are not limited to routes and components. |
| `hooks/use-toast.ts:6` | old toast types in `ui/toast.tsx` | Type-only relationship still matters to a full typecheck. |
| `data/programs/*demo-document*.ts` | `components/programs/demo/demo-content.ts` | Fixtures consume component-folder constants; offline generation follows these imports. |

## Cycles and barrels

One syntactic value-import cycle involving components was found:

```text
conference/fields/index.ts
  → field-repeating.tsx
  → index.ts (FIELD_REGISTRY)
```

The registry imports FieldRepeating at line 27; FieldRepeating imports FIELD_REGISTRY at line 7 and selects nested fields inside its render. That delayed lookup explains the relationship; it does not prove all bundling scenarios safe. Moving these files must preserve their mutual resolution. Do not rewrite recursion or split contracts as an incidental move.

The all-import graph also contains reverse `import type` edges from checkbox, email, heading, number, paragraph, radio, select, tel, text, textarea and toggle fields to FieldProps in the registry. Those extra edges are not runtime cycles. The collector only distinguishes explicit type-only syntax; it does not perform compiler symbol/type analysis.

Existing re-export indexes:

- `admin/dashboard/index.ts`: dashboard exports consumed by the admin home page.
- `conference/fields/index.ts`: imports, registry construction and re-exports.
- `form/index.ts`: FormField/TextareaField wrappers consumed by contact and volunteer forms.
- `programs/templates/index.ts`: four category-template exports consumed by CmsProgramRenderer.

`admin/program-sections/index.tsx` and `events/admin/EventFormBuilder/index.tsx` are editor implementations, not merely barrels. Preserve that distinction. The historic “no barrel files exist” claim must not drive naming decisions.

## Public/admin interpretation

No direct UI → non-UI component import was found. Domain-specific props in a UI file remain an ownership concern even without such an edge. Public event code depends on conference code; admin event code depends on other admin controls and public form renderers. Those can be legitimate reuse relationships.

Production program renderers are also used by admin previews. A component being consumed in admin does not make it admin-owned. Conversely, moving a domain action consumer into shared/ does not make it generic. No new globally shared folder should be created until its contract and allowed dependencies are defined.

## Dynamic and non-import references

- No resolved `import()` target under components/ was found in the scanned application source. Dynamic imports still exist for libraries and actions; component registry selection is a separate kind of dynamic behavior.
- FIELD_REGISTRY selects components by schema field type. SectionFormFactory and EditorialParts select rendering by content type. CmsProgramRenderer selects category templates. Their names/keys/contracts must survive migration.
- `__tests__/programs/template-editor.test.tsx:13–14` contains Jest mock path strings for SectionFormFactory and AssetPicker. Both have ordinary imports too, but changing only imports leaves mocks stale.
- `scripts/db/programs-migrations/generate-p07.cjs:13` implements an alias-aware custom loader. It loads demo fixture documents, which import `components/programs/demo/demo-content.ts`. These loader edges are manually identified and are not all present in the static module graph. Do not execute database migration scripts for component verification.
- `scripts/archive/migrate-programs.ts:398` requires files discovered under data/programs. Its component-folder relationships are indirect through those files. It was inspected, not executed.
- NotFoundErrorPage uses the URL `/astronaut.png`; this resolves to public/, not the same-named component asset. Preserve both until an explicit asset disposition exists.
- Next configuration comments refer to SafeImage and receipt preview. They are documentation references, not module imports; update relevant maintenance references with eventual moves.
- Accessibility selectors and CSS module classes are runtime contracts beyond import paths. Do not rewrite them during structural moves.

## Ambiguity dispositions

These preserve the Phase 1 findings. Phase 2 dispositions below link them to [architecture.md](architecture.md); exact file targets remain Phase 3 work. IDs match tasks.md.

| ID | Disposition | Evidence/decision needed before a target is assigned |
| --- | --- | --- |
| A01 | STANDARD SET | Direct components/<domain>/ folders, including podcasts; consistent with AGENTS.md. No features layer. |
| A02 | EXCEPTION RETAINED | Keep conference-owned schema rendering and its event/admin consumers; no engine extraction or field deletion. |
| A03 | EXCEPTION RETAINED | Keep conference builder controls and existing event-action coupling; no builder consolidation. |
| A04 | CONSTRAINT RETAINED; target REVIEW | Production-used demo CSS and mixed interactions stay program-owned; exact destinations require complete mapping. |
| A05 | BOUNDARIES SET | Finance for action-bearing review controls; common for generic error/confirmation and cross-domain admin activity; media for authenticated uploads. |
| A06 | EXCEPTION RETAINED | Preserve public program-editor demo, fixture state and media guards; exact placement follows the mapping. |
| A07 | OWNERSHIP SET | Neutral cards/layout/browser controls may remain UI; retain form/photo-wall/seo systems; root ShareButton belongs to podcasts. |
| A08 | OPEN — retention review | 97 files lack app-entry ancestry. Inactive chains, types, installed primitives and assets need separate decisions. |
| A09 | CONFIRMED source mismatch; validation open | Capture actual typecheck baseline when authorized for migration; do not claim checks have run or fix it incidentally. |
| A10 | CONSTRAINTS SET | Preserve NavbarWrapper server behavior, explicit directives, existing barrels and recursive registry cycle; no new global barrel. |

## Limits

This map is not a compiler/bundler result or a security audit. Import edges may be unused; barrel reachability overapproximates actual rendered symbols. App-layout descendants are affected even when only the layout appears as an ancestor. Runtime database schemas, external consumers and deployed behavior were not inspected. Recollect evidence after source drift and before final mapping.
