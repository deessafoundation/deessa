# deessa Foundation — component guide

Use this guide when adding or changing components. The root [AGENTS.md](../AGENTS.md) and [accessibility standards](../docs/in-progress/accessibility-feature/STANDARDS.md) apply as well. The completed reorganization changed file placement and import paths while preserving existing component contracts.

## Choose the owner first

Place components directly under `components/<feature>/`. Do not add a `components/features/` layer or put new component implementations at the component root. A folder with one useful component is valid; create folders when real files need them.

| Location | What belongs here |
|---|---|
| `<feature>/` | Public feature presentation and workflows, such as `about/`, `conference/`, `donations/`, `events/`, `podcasts/`, `programs/`, and `what-we-do/` |
| `homepage/` | Homepage composition and local helpers |
| `layout/` | Public navigation, footer, and shell composition |
| `ui/` | Domain-neutral controls and building blocks; no business actions or admin services |
| `shared/` | Presentation with demonstrated reuse across unrelated features and a neutral contract |
| `errors/` | Application-wide error presentation; feature-specific errors stay with their feature |
| `admin/<feature>/` | Privileged management forms, controls, editors, and their local helpers |
| `admin/common/` | Shared admin presentation with caller-supplied behavior |
| `admin/media/` | Authenticated media selection and upload |
| `admin/finance/` | Existing shared donation/payment review controls |
| `form/`, `photo-wall/`, `seo/`, `accessibility/` | Existing coherent systems; retain their ownership and boundaries |
| `archive/` | Temporary historical code awaiting observation and a separate deletion decision; never a source of new production imports |

Admin previews can consume public renderers without transferring their ownership to admin. Keep coherent systems such as program templates, section editors, conference fields, event builders, and rich-text extensions together. Keep feature hooks and helpers near their callers; root `hooks/` is for application-wide hooks. Static public assets belong under `public/` when served by URL.

## Name files and exports

- Use lowercase **kebab-case** for new folders and filenames: `event-registration-form.tsx`, `program-section-list.tsx`, `faq-section-form.tsx`.
- Use `.tsx` when a module contains JSX and `.ts` for non-JSX modules. Name new hooks `use-<purpose>.ts`, such as `use-registration-state.ts`.
- Use **PascalCase** for component declarations (`EventRegistrationForm`) and `useCamelCase` for hook functions (`useRegistrationState`). Keep existing named/default exports and identifier casing when relocating code.
- Treat acronym runs as words: CMS → `cms`, CTA → `cta`, FAQ → `faq`, SEO → `seo`; CTAs → `ctas`.
- Choose names that describe responsibility. Avoid generic names such as `helper`, `new-component`, or `manager` without a meaningful feature context.
- The `home-` prefix is reserved for homepage-only components; it is optional, and does not require moving an otherwise feature-owned homepage composition.
- Use the established folder vocabulary, including `homepage`, `donations`, `what-we-do`, and `errors`. Component names do not rename `/whatwedo` routes, database fields, registry keys, or external URLs.
- Co-locate component CSS Modules, preferably with the same stem: `about-hero.tsx` and `about-hero.module.css`. Keep accurate shared stylesheet names when several modules consume them.
- Separate `.types.ts`, `.config.ts`, or `.constants.ts` files only when they have a useful responsibility. Do not split tiny files just for consistency.

Existing exceptions, including the retained REVIEW files and archived historical names, are not instructions to rename more code automatically.

## Preserve dependency and execution boundaries

Use the existing `@/` alias for imports across features; relative imports within a system are also valid. Match filename case exactly, including on Windows. Preserve `import type`, re-exports, dynamic loading, and named/default bindings.

UI building blocks must not import feature or admin services. Shared presentation must have a neutral contract. Public features may use their own components and neutral shared systems. Admin features may use their own services and public renderers for previews. Avoid new cross-feature coupling without a concrete need and explicit review.

Existing exceptions are documented in the [architecture record](../docs/in-progress/reorganization/components/architecture.md), including the shared conference/event renderer, public editor demos using admin editors, and production program templates using resources under `programs/demo/`. A `demo` folder name does not establish that a file is unused.

Preserve `"use client"`, `"use server"`, provider order, server actions, authorization checks, and request context. Folder placement is not an authorization boundary. Read the relevant installed Next.js guide under `node_modules/next/dist/docs/` before changing framework behavior. Do not add a global components barrel or a new `index.ts` merely to shorten imports; retain existing subsystem entry points.

## Styling and accessibility

Read the full [accessibility standards](../docs/in-progress/accessibility-feature/STANDARDS.md) before editing UI. Use Tailwind utilities and `cn()` for ordinary styling; use co-located CSS Modules for animations, custom-property layers, scoped component colors/contrast corrections, and print/forced-colors rules. Global CSS stays under `app/`. Inline styles are for dynamic values only.

Do not use arbitrary `bg-[#…]` or `text-[#…]` Tailwind colors on buttons, links, or their containing ancestors. Existing global contrast selectors can make controls unreadable. Use scoped CSS Module classes and approved `data-*` variant hooks. Scope high/inverted contrast overrides to the component, pair foregrounds with surfaces, and explicitly set SVG strokes/colors where required by the standards. Preserve CSS class keys, selectors, asset URLs, keyboard behavior, and accessible labels during relocation.

## Before adding or moving a component

1. Search existing implementations and callers. Reuse a suitable component; do not create duplicate hooks or speculative shared abstractions.
2. Choose its actual owner and a descriptive name. Check target collisions, including case-insensitive Windows collisions; never overwrite another implementation.
3. Keep the change focused. A structural move updates paths and required references; behavior changes belong in a separate reviewed change.
4. Update all callers, re-exports, type imports, dynamic loaders, mocks, CSS imports, and meaningful maintenance references. Preserve historical evidence verbatim.
5. Review the complete Git changes, including untracked destinations. Account for each deletion as a move or explicitly authorized removal, and verify that code outside the approved edits is unchanged.
6. Follow the verification scope authorized by the user and root AGENTS.md. When requested, run the appropriate build, targeted tests, and affected workflow checks. Record pre-existing failures and untested behavior. A successful build alone does not prove type safety because this project currently skips build-time TypeScript validation.

The [archive README](archive/README.md) describes restoration and later deletion criteria. Do not automatically delete archived files or the ten retained reviewed dependencies.
