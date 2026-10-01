# deessa Foundation — component naming

Date: 2026-10-01. Phase 2 standard, paired with [architecture.md](architecture.md). These rules govern later mapping; no filenames or exports were changed in Phase 2.

## Files and folders

Use lowercase kebab-case for component files and folders. Preserve meaningful domain words; do not mechanically remove prefixes just because a file enters a domain directory. Use `.tsx` for JSX and `.ts` for non-JSX modules, with existing extensions preserved during structural work unless an explicit reviewed mapping justifies changing them.

| Current example | Naming candidate, not an executed mapping |
| --- | --- |
| CmsProgramRenderer.tsx | cms-program-renderer.tsx |
| ProgramEditorDemo.tsx | program-editor-demo.tsx |
| CTASection.tsx | cta-section.tsx |
| FAQSectionForm.tsx | faq-section-form.tsx |
| HeroCTAsManager.tsx | hero-ctas-manager.tsx |
| SEOManager.tsx | seo-manager.tsx |
| EventFormBuilder/ | event-form-builder/ |
| useBuilderState.ts | use-builder-state.ts |
| useSectionState.ts | use-section-state.ts |
| GenericErrorPage.tsx | generic-error-page.tsx |

Acronym runs become one lowercase word: CMS → cms, CTA → cta, FAQ → faq, SEO → seo. Plural suffixes stay with the acronym: CTAs → ctas. Do not apply a blind character-by-character hyphenation regex. Existing numbered names such as step1-personal-details may remain; changing them to step-1 is unnecessary for lowercase kebab naming.

Domain vocabulary: `homepage`, `podcasts`, `programs`, `events`, `conference`, `donations`, `what-we-do`, and `errors`. Public and admin may each have the same domain name. Route slugs, query keys, database identifiers and external URLs do not change to match component folders. In particular, component normalization does not rename `/whatwedo` routes or the checkout directory.

The `home-` prefix is reserved for homepage-only usage, as AGENTS.md requires; it is not mandatory for every homepage file. A homepage-only arts composition can retain home-art-feature within arts. Cross-domain CircularTestimonials must not acquire home- merely because the homepage consumes it.

## Exports and identifiers

PascalCase is the convention for component declarations; hooks use `useCamelCase`. Preserve existing named/default exports, identifiers, interfaces, aliases and export signatures during this migration. Filename normalization does not entail symbol normalization: NotFoundErrorPage.tsx exports NotFound, which remains NotFound. Preserve CmsProgramRenderer and existing acronym casing inside code.

Do not rename schema field types, registry keys, TipTap extension names, persisted draft keys, CSS class keys, data attributes or test labels to match filenames. They may be runtime contracts rather than local identifiers.

## Hooks and supporting modules

Use `use-kebab-case.ts` for new non-JSX hooks. Keep feature-local hooks with the feature or its existing hooks/ subdirectory. Root hooks/ is for actual application-wide hooks, not a mandatory home for every hook. Do not move accessibility or editor hooks away from their subsystem merely to group hooks together.

The ui/use-mobile.tsx and ui/use-toast.ts copies require REVIEW because root hooks already exist and the toast API has a known mismatch. Do not overwrite the root copies or resolve that mismatch as a relocation. Their eventual relocation/removal decision must preserve all consumers and be explicitly reviewed. Existing `.tsx` hook extensions may stay until a reviewed mapping covers the change.

Use `.types.ts`, `.config.ts` and `.constants.ts` only when a separate module has a useful, accurate responsibility. Do not create tiny prop files or move declarations out of implementations for naming consistency. `program-sections/types.ts` contains runtime factories/defaults; retain it as a documented legacy mixed module for this migration. Its name must not cause a move to a type-only barrel. `section-actions.ts` and event `builder-actions.ts` are pure local helpers; their action names do not make them server actions. No server/client suffix or directive should be invented from a filename.

Keep subsystem entry points named index.ts/index.tsx where they already exist. Preserve the distinction between re-export barrels and the program section/event builder implementations. Do not add new index files just to shorten imports. New ordinary files should have descriptive names; renaming existing indexes is not required to pass this standard.

## CSS and assets

Pair a component-specific stylesheet with its component stem where accurate, for example about-hero.tsx and about-hero.module.css. Preserve system-wide stylesheet names such as programs.module.css when several components or routes use them. A matching-name rule does not justify duplicating or splitting shared CSS. Include every importer in a stylesheet mapping.

Keep CSS module exports, scoped contrast selectors, global CSS location and imported global styles unchanged. Treat static assets separately from module imports. `/astronaut.png` resolves from public, so renaming or archiving the component-folder PNG cannot be inferred from the URL. Its disposition remains REVIEW; do not silently delete either copy.

## Imports and reference updates

Preserve the repository's `@/` alias. Existing relative imports are legitimate; update them as needed for moved files without converting every import to one style. Preserve import type, export type, named/default bindings and lazy-loading behavior.

The exact mapping must include imports, re-exports, dynamic paths, test mock strings, fixture/script loaders, CSS imports and meaningful maintenance references. Do not rewrite historical snapshots to new paths. Do not replace runtime registry keys or URLs merely because a text search finds a matching word.

## Collision and Windows rules

Before execution, compare every target path case-insensitively against all other targets and existing kept files. Check folder/file and extension conflicts. Two equal-looking components are not automatically equivalent; preserve both and assign meaningful disambiguation or REVIEW. The active nested HomepageManagerClient and inactive root homepage-manager-client must not overwrite each other. Existing mobile/toast hook copies likewise cannot share a target without a separate retention decision.

For case-only renames on Windows, use a unique temporary path in the same verified workspace, then the final path, with Git tracking both operations. Check the temporary and destination names do not exist; never overwrite a destination or use a destructive reset to complete a rename. Avoid Windows reserved device names and trailing dots/spaces. Record both steps in the batch when needed. For other renames, use normal tracked moves after the mapping is reviewed.

Check stale paths with exact spelling and case-insensitive searches, then validate TypeScript/import resolution and affected behavior according to the batch strategy. Filesystem success on Windows is not proof the path works on a case-sensitive deployment.

## Review checklist for Phase 3

- Every source file has KEEP, MOVE, RENAME, MOVE + RENAME or REVIEW; archive/merge require separate justification and review.
- Every target conforms to domain vocabulary and filename rules or has a written exception.
- Existing exports, directives, runtime identifiers and extensions are preserved unless explicitly reviewed.
- Coherent systems, CSS importers and all non-import references are mapped together.
- No target collision, root-hook overwrite or accidental merge of active/legacy implementations exists.
- Unused files, mixed demo resources, old notification APIs and uncertain assets retain explicit dispositions.

These checks concern the future plan. No formatter, lint, typecheck, test suite or application build was run for this documentation phase.
