# Editorial CMS templates

Campaign, Outreach and Research at `/whatwedo/[slug]` now consume the CMS document directly and reuse the demo CSS modules. Service retains its existing editorial template. Sections respect their saved order and enabled state, including repeated section types.

## Design mapping and editor fields

| Category | Reference | CMS editor controls |
| --- | --- | --- |
| Campaign | `/demo/1000-families` | Split hero, image label and two captions, progress, purpose, promise cards, journey milestones, illustrated story and expanded story text, reach metrics, staggered gallery, participation cards with eyebrow/title/description/link |
| Outreach | `/demo/community-outreach` | Stamp, introductory note, cover location and captions, impact ribbon, opening copy, activity postcards, photo essay, community quote, CTA, metrics and gallery |
| Research | `/demo/deessa-companion` | Status, tags, concept-card label/title/routines/brand/credit/figure caption, optional uploaded hero image, question strip, research stages, communication board checklist/disclaimer, insights, resource accordions, CTA, metrics and gallery |

All four categories use fixed template forms. Campaign, Outreach and Research show named accordion panels in template order, matching the Service editing flow. Admins enter headings, descriptions, cards, captions, links and images without section-builder, ordering or layout controls. Existing extra sections remain editable and hidden sections can be restored without losing their content. Missing template sections are created only when edited. Relevant panels expose footnotes and expanded story text. Hero, story and gallery images retain alt text and focal points; story and gallery captions are editable. Use newlines and `*accent text*` in display headings. Links accept internal paths and section anchors.

The communication board is a built-in interactive component with fixed example choices, not an arbitrary app builder. Its surrounding editorial content is editable. Production CTAs use configured destinations instead of the demo's placeholder popups.

## Persistence

Draft saves retain the canonical hero object, including both actions, image metadata and editorial fields. The editor, draft preview, public renderer and publication path support older drafts containing `cta`, `secondaryCta` and string image URLs. Optional editorial fields live in existing JSON documents; no database migration is required. Existing content is not replaced with demo copy.

## Verification

- `pnpm test --config jest.programs.config.cjs --runInBand`: 23 passing tests covering all four fixture documents, schema/JSON round-trips, old hero compatibility, unsafe link rejection, public section rendering, fixed editor panels, first-keystroke panel stability, isolated Outreach edits, hero image metadata, both Service actions and handwritten journey notes.
- Focused ESLint check: no errors.
- TypeScript: no diagnostics in changed program files; full repository check remains blocked by unrelated diagnostics.
- Local browser inspection: desktop and 390px mobile layouts; no horizontal overflow on the three CMS fixtures; Research board interaction and anchor navigation verified.
- Final editor browser click-through was blocked by a browser-tool initialization error. The development-only `/demo/program-editor` route provides all four editors with schema-validated in-memory save/restore for manual checks. It returns 404 outside development.
- Authenticated image upload and admin save/publish were not exercised because the local browser redirects to sign-in. No database publications were changed.

Development-only comparison routes are `/demo/cms-templates/campaign`, `/demo/cms-templates/outreach` and `/demo/cms-templates/research`. They use representative CMS documents and return 404 outside development.
