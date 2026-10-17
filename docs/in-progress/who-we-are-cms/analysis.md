# Who We Are: detailed source audit

Audited 2026-10-12 against the current workspace, including uncommitted public
About/Hero changes. This is a source inventory, not a screenshot or database
snapshot. Browser control failed before opening a tab because its kernel asset
path could not be found. No content was saved and no automated suite ran.

## Route, ownership, and composition

The navbar's Who We Are link targets `/about`. The page is
`app/(public)/about/page.tsx`; no `/whoweare` route or configured alias was found.
`/admin/about` loads `about_page_content` from `site_settings` through
`getAboutPageSettings`. The public page uses the same reader.

The current public sequence is:

1. Hero with three team portraits.
2. Who We Are introduction with video, paragraphs, quote, and four flow labels.
3. How We Do It with four numbered steps and closing sentence.
4. Governance: four tiers plus two operational teams.
5. Our People / Meet the Changemakers: published team profiles.
6. Partners & Supporters: six sector/category icon tiles.
7. Final Get Involved call to action.
8. Shared newsletter/footer and public accessibility surfaces.

Our Journey is commented out in the public component. It is still loaded,
stored, and editable in the current admin. The Hero rewrites a saved primary
URL of `#journey` to `/our-story`. That separate route exists and is outside
this page's content document. Resource/document styles remain in the local
stylesheet, but no corresponding resources section renders in AboutSections.
Do not infer active content from section-number comments or retained CSS.

## Sources of truth

| Responsibility | Current owner | Public effect |
|---|---|---|
| Hero/intro/process/Journey content | `lib/types/about-settings.ts`, key `about_page_content` | Settings passed through the About server page |
| Loading and legacy substitutions | `lib/data/about-settings.ts` | Root default merge plus copy/year replacements and milestone merging |
| Page editing | `components/admin/about/about-manager-client.tsx` | Four admin tabs; direct client state updates |
| Settings persistence | `app/api/admin/about-settings/route.ts` | Whole supplied settings value upserted using service role |
| Hero layout | `components/about/about-hero.tsx` and local CSS module | Headline splitting, buttons, trust icons, first-three portraits |
| Intro/process/team/partners/CTA | `app/(public)/about/AboutSections.tsx` and local CSS modules | Mix of settings, team data, and hard-coded content |
| Governance | `app/(public)/about/OrgStructure.tsx` and local CSS module | Hard-coded section, four tiers, two operational teams |
| Team records | `team_members`, `/admin/team`, `lib/actions/admin-team.ts` | Both Hero images and profile grid |
| Partner records | `partners`, `/admin/partners`, `lib/actions/admin-partners.ts` | NOT consumed by the About category tiles |
| Page SEO | `generateSEOMetadata` call in About page | Static title, description, keywords, `/about` canonical, default OG image |
| Navbar/footer/newsletter/intro overlay | Public layout and `components/layout/*` | Shared site content/behavior, not About-specific settings |

## Complete existing settings inventory

Paths below refer to the existing document, not a new schema. Index ranges
describe defaults; connected saved arrays have not been inspected.

| Existing path | Current admin | Current public behavior |
|---|---|---|
| `hero.badge` | Badge Text | Caption below the portrait collage, not an above-heading badge |
| `hero.headlineLine1` | Text input | First headline line |
| `hero.headlineLine2` | Text input | Last two words emphasized when longer than two words; otherwise all words |
| `hero.subtitle` | Textarea | Supporting paragraph |
| `hero.primaryCtaLabel` | Text input | First button text |
| `hero.primaryCtaUrl` | Text input | First destination; `#journey` maps to `/our-story` |
| `hero.secondaryCtaLabel` | Text input | Second button text |
| `hero.secondaryCtaUrl` | Text input | Second destination; default `/impact#reports` |
| `hero.trustBadges[]` | Comma-separated input | List; first ShieldCheck icon, all later Users icons |
| `intro.sinceBadge` | Photo Badge Text | Retained but not rendered; reader changes 2015 to 2022 |
| `intro.label` | Eyebrow Label | Small label above introduction headline |
| `intro.headline` | Textarea | Special emphasis on trailing “just as they are”; otherwise last word |
| `intro.paragraphs[]` | Add/remove textareas | Paragraph order preserved |
| `intro.quote` | Textarea | Quote panel with decorative Quote icon |
| `intro.flowSteps[]` | Comma-separated input | Labels mapped by index to Eye, MessageCircle, Heart, Sprout; later items use Heart |
| `howWeDoIt.title` | Textarea | Heading; last word emphasized |
| `howWeDoIt.subtitle` | Textarea | Supporting copy |
| `howWeDoIt.steps[].id` | Retained, no control | React identity |
| `howWeDoIt.steps[].title` | Text input per step | Step title |
| `howWeDoIt.steps[].body` | Textarea per step | Step description |
| `howWeDoIt.steps[].color` | Retained, no control | Number and timeline marker color |
| `howWeDoIt.closingLine` | Textarea | Closing sentence |
| `journey.label` | Text input | Not currently rendered |
| `journey.title` | Text input | Not currently rendered |
| `journey.subtitle` | Textarea | Not currently rendered |
| `journey.milestones[].id` | Stable value, generated on add | Retained legacy identity |
| `journey.milestones[].year` | Text input | Retained legacy content; loader may substitute year for one old milestone |
| `journey.milestones[].title` | Text input | Retained; current updater has a structural bug |
| `journey.milestones[].description` | Textarea | Retained legacy content |
| `journey.milestones[].image` | URL input | Optional legacy image; no media picker |
| `journey.milestones[].imageAlt` | Text input | Optional legacy alternative text |
| `journey.milestones[].sourceUrl` | URL input | Provenance; not linked even in the commented renderer |

Default structure: two trust badges, three intro paragraphs, four flow labels,
four process steps, four legacy milestones. Array limits are not enforced by a
shared runtime schema. Process IDs/colors and milestone IDs must not disappear
during form restructuring.

## Public detail inventory and CMS gaps

### Hero

- Hard-coded Home breadcrumb destination `/` and current label Who We Are.
- Editorial copy is already managed, but field naming describes an older layout.
- Primary/secondary button icons and visual treatments are fixed.
- Heading emphasis is derived, so an editor cannot select an arbitrary phrase.
- Photos come from the first three published team members in `sort_order` order.
  There is no About-specific selection, source URL, alternative-text override,
  or crop control. Alt text is the member name.
- First portrait spans two grid rows; other two stack. All crop at 50% / 30%.
  Missing image uses `/image_coming_soon.png`; no Hero image-error retry exists.
- Reordering/unpublishing a team member can change both Hero and team listing.
  Fewer than three records leave fewer images rather than filling every slot.
- Photos are eager-loaded; first has high fetch priority. Remote HTTP-prefixed
  images bypass Next image optimization. Media validation is needed at the data
  boundary rather than relying on rendering settings.
- Trust text is editable, but positional icons and comma parsing constrain it.

Proposed controls after the user's clarification: editorial groups, structured
trust entries, breadcrumb label, and a Manage Team link. Keep first-three
selection, photo editing in `/admin/team`, and existing photo geometry. No
separate portrait chooser or duplicate photo uploader is required.

### Who We Are introduction

- Label, headline, paragraph list, quote, and flow labels are managed.
- Video `/every_child.mp4` and accessible label Every child has potential are
  hard-coded. Native controls, autoplay, muted, playsInline, metadata preload,
  and 16:9 crop are fixed; no poster or caption track is supplied.
- Add media-picker controls for source/poster, accessible title, captions and
  transcript support where needed, with safe URLs and useful media errors.
  Playback/content of the clip has not been inspected.
- The since/photo badge remains an unused legacy field; it should not be sold
  as a live page control.
- Flow grid assumes four labels. Comma parsing can create any count, while the
  icon list and desktop grid remain positional. Decorative arrow list items also
  affect nth-child color selectors. Preserve the actual four-item baseline before
  allowing structural changes or semantic icon/tone selection.

### How We Do It

- Title, subtitle, step titles/bodies, and closing sentence already have controls.
- Visible section label How We Do It and section accessible name are hard-coded.
- Four-column desktop layout; numbers derive from position. Stable IDs/colors
  are persisted but not editable in the admin.
- No admin add/remove/reorder or count guidance for process steps.
- Add a label field and focused step editor. Keep four-step structure initially;
  safe palette controls can expose existing colors without raw CSS/class inputs.

### Governance

All editorial values are hard-coded. Required CMS coverage:

| Group | Fields / current items |
|---|---|
| Header | Governance label; “How the Foundation Is” heading lead; “Organized” accent; description |
| Founding Vision | Title, Concept Designer & Co-Founders subtitle, description |
| Governing Board | Title, Executive Board subtitle, description |
| Advisory Circle | Title, Advisory Board & Thematic Advisors subtitle, description |
| General Assembly | Title, General Members subtitle, description |
| Operational level | Operational Level heading |
| Working Team | Title and description |
| Technical Team | Title and description |

Four tiers use fixed semantic accents/icons: vision (Lightbulb/purple), board
(Network/blue), advisory (UsersRound/green), assembly (UsersRound/orange). Working
and Technical teams use UsersRound/Wrench, with a Cog header. Preserve hierarchy
and stable IDs; expose approved appearance options only in collapsed controls.
The current h2 labels Governance; the longer headline is a paragraph. Preserve
semantics or change them as a deliberate accessibility fix, not an accidental
side effect of binding content.

### Our People

- Page heading Our People / Meet the / Changemakers, description, and empty-state
  copy Team members coming soon are hard-coded.
- Database fields already managed in `/admin/team`: name, role, bio, image,
  six social URLs (Facebook, Twitter/X, LinkedIn, Instagram, TikTok, WhatsApp),
  publication status and order. Email/phone are stored there but NOT selected
  or displayed by the public About query; keep them private to their owner.
- Public query filters published members and sorts ascending. On an error OR
  an empty result it substitutes three code-defined fallback members.
  Thus intentionally unpublishing everyone still shows fallback profiles.
- Names are React keys; duplicate names can collide. Prefer database IDs for
  identity without duplicating team records into About settings.
- Team cards activate on hover, click, Enter, or Space. Desktop portraits are
  grayscale until active; small screens always reveal the text overlay.
- Portrait retries once with a cache-busting URL, then shows a first-letter tile.
  No explicit image alt field exists beyond name.
- Social links open new tabs with noopener/noreferrer. They are nested inside a
  role=button profile card, and inactive desktop overlays can still contain
  focusable links. Keyboard/reader behavior needs focused runtime inspection.
- Add page-level heading/copy/visibility controls and a labeled new-tab Manage
  Team handoff. Keep record CRUD/publication in `/admin/team`.

### Partners & Supporters

- Header is fixed: Collaboration label; Our Partners & Supporters heading;
  Working across sectors with organizations who share our vision description.
- Six fixed tiles: Partnerships/Handshake, Global NGOs/Globe,
  Education/GraduationCap, Healthcare/HeartPulse, Water/Droplet,
  Environment/Trees. Colors are fixed by category. Tiles are informational,
  not links and not actual organization logos.
- `/admin/partners` edits partner records, but this page never fetches them.
  The About admin's note promising separately managed partner logos is misleading.
- Add page-owned header and category-label/approved icon/theme controls. Default
  to the same six tiles. Connecting a logo grid would be a distinct public feature
  and should not silently replace this section.

### Final call to action

Currently all six editorial values are hard-coded: Ready to Make a Difference
headline; supporting paragraph; Donate Now label and `/donate`; Join Our Team
label and `/get-involved`. Add focused section-copy and two-action controls.
Keep desktop/mobile blue paint-wave SVGs, classes, button icons, and responsive
composition as presentation, not CMS markup.

### SEO, anchors, shell, and non-rendered content

- Page title, description, seven keywords and fallback OG image come from the
  static `generateSEOMetadata` call/helper. Add page SEO fields while retaining
  the `/about` canonical and site-level metadata conventions.
- Preserve `#team`, `#partners`, `#organization`, `about-hero-title`,
  `about-intro-title`, `governance-heading`, and `about-final-cta-heading`.
  Existing footer links target `/about#team` and `/about#partners`.
- `#journey` is absent from rendered output; only the primary Hero CTA gets the
  compatibility rewrite. Other saved links to that anchor require review.
- `/impact#reports` is used by the Hero/default footer. No reports anchor was
  found in the inspected Impact source; confirm the destination at runtime.
- Global navbar/footer/newsletter and accessibility/intro/development overlays
  belong to the public layout. Do not copy them into About settings. Any need for
  global shell CMS should be its own feature, with one shared source of truth.
- Journey, unused sinceBadge, and resource stylesheet rules are retained legacy
  material. Preserve content; don't automatically restore or delete sections.

## Responsive and interaction preservation

| Surface | Current source behavior to preserve/check |
|---|---|
| Hero | Two-column at lg, stacked below 1024; responsive headline clamp; three-photo collage; large-text mode forces one column |
| Intro | Two-column desktop; one column at <=760px; <=600px visually places label/headline before video; <=420px flow becomes 2x2 and hides arrows |
| Process | One column, then two at sm, four at md; decorative dashed connector and reveal animation |
| Governance | One/two/four columns; operational team pair at md; hover lift |
| Team | One/two/three columns; keyboard/click/hover expansion; mobile overlay visible |
| Partners | Wrapping six category tiles, horizontal row at lg; hover lift/scale |
| Final CTA | Stacked mobile with mobile wave; horizontal desktop with separate wave and large buttons |
| Accessibility | Hero/intro/governance/CTA have scoped contrast rules; global About/team overrides also exist; dyslexia/text scaling, forced colors and print must be checked |
| Motion/video | AboutSections reads preferences but doesn't directly gate its native autoplay/reveal props; global protections and reduced-motion behavior require runtime checks |

The source contains static inline colors and arbitrary color classes in several
older sections. Future edits must follow current STANDARDS.md, avoid introducing
them on controls/ancestors, preserve selector contracts, and inspect high and
inverted contrast before claiming parity. Do not redesign the public page while
adding CMS bindings.

## Priority findings before expansion

1. **Unvalidated settings persistence.** API accepts any truthy `settings`, with
   no shared runtime schema, URL validation, bounds, or same-origin check.
2. **Permission mismatch.** `/admin/about` requires `settings`; EDITOR lacks
   that permission. POST nevertheless explicitly accepts EDITOR. Align intended
   policy at the server boundary rather than broadening page access by accident.
3. **Unsafe load fallback.** DB errors return defaults just like absent content.
   Opening admin during an outage and saving can overwrite real content with
   defaults. Root merging does not validate/deep-complete nested objects.
4. **Journey title updater corrupts shape.** Manager line ~499 uses
   `journey: { ...p, milestones }`, inserting the root document into Journey.
5. **Reset baseline is stale.** Successful save does not replace a saved snapshot;
   Reset always restores initialSettings, including after a successful save.
6. **Dirty state is a flag.** Editing back to the original value remains dirty.
   Inputs and list actions remain editable during saving, so changes made after
   the submitted snapshot can incorrectly be marked saved. No unload guard.
7. **False preview.** Preview opens the saved public page, not unsaved content;
   labeling should say View public page unless a genuine preview is provided.
8. **Ownership/UI mismatch.** Journey and sinceBadge controls have no current
   public effect; governance/categories/final CTA/video have no editing controls.
9. **Read-time editorial rewrites.** Intro/hero/process copy and years are changed
   by the reader; milestones inherit defaults by array index. Reordering/removal
   can associate defaults with the wrong item. Preserve current resolved output,
   but replace ongoing positional rewriting with an explicit compatibility rule.
10. **Feedback/accessibility gaps.** Many admin Labels lack htmlFor/IDs; repeated
    array controls and icon-only removals lack names; small-screen Save/Preview
    become unnamed icons, Reset is hidden; current spacing/sticky header duplicates
    the admin shell. No inline validation or error destination/focus handling.
11. **Dependency issues.** Empty team publication revives fallback profiles;
    team reorder ignores update errors; partner manager is not a page consumer.
    Scope shared-manager changes separately and verify their real consumers.
12. **Cache contract is implicit.** About POST doesn't explicitly revalidate;
    public layout currently force-dynamic, so absence of revalidation alone is
    not proof of stale output. Define save/invalidation failure semantics and
    verify fresh public requests after saving.

## Verification boundaries

Confirmed: route/components, field consumers, admin wiring, source-level issues,
CSS behavior declarations, and existence of `/every_child.mp4`, fallback portrait
images, and `/image_coming_soon.png` on disk. Existence does not prove playback,
correct imagery, captions, permissions, or reachable external links.

Not confirmed: live settings/team data, migration state, screenshots, browser
console/network, actual responsive/contrast/focus behavior, media playback,
successful save/reload, SEO output, and all link destinations. These must be
acceptance checks, not assumed successes.

