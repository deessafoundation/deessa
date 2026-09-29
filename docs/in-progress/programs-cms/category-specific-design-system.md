# Category design and content contract

Updated September 15, 2026. The current four /demo pages are the visual authority.

## Shared brand rules

Use ocean blue and the existing site typography: Marissa for expressive headings, DM Sans for body/operational text, Comic Neue where already appropriate. Action buttons are pill-shaped. Preserve visible focus, sufficient text contrast, touch targets and reduced-motion support. Do not restore yellow accents, old purple campaign styling, deep-blue promotional panels or campaign donation controls.

Frontend templates own spacing, typography, color, image ratios and responsive behavior. Admins manage content and select from supported section options. Do not expose arbitrary CSS, fonts or HTML layouts.

## Four distinct templates

| Category | Reference | Composition to preserve |
| --- | --- | --- |
| Service | /demo/aac-support | Soft split hero with portrait, practical facts, support cards, journey steps, family story, FAQ, impact and gallery |
| Outreach | /demo/community-outreach | Field-journal introduction, large cover with place/date, summary ribbon, location postcards, photo essay, community voices |
| Research | /demo/deessa-companion | Editorial title, concept visual, question strip, approach, optional bounded demo, findings and open-notebook resources |
| Campaign | /demo/1000-families | Light split hero, integrated progress panel, local navigation, purpose, three promises, timeline, expandable story, impact, staggered gallery, participation |

These are four templates, not four individual pages hardcoded forever. Multiple programs must be creatable in each category.

## Common content

Required at publication: internal title, slug, category, discovery card title/summary/image/alt, hero title/summary, meaningful introductory content and a valid visitor next step (contact, resource or another relevant destination). Use an explicit decorative flag only for genuinely decorative images. A photo-led hero needs an approved image; research may use an approved built-in concept visual.

Optional: eyebrow, tags, secondary action, section navigation, related programs, SEO overrides, additional sections. Omitted content removes its section and navigation link without leaving empty space.

Each section has a stable ID, type, optional heading/intro, enabled flag and typed content. Section IDs are unique within the program and validated for anchor use. Order is explicit; templates provide sensible defaults and protect required structure.

## Category metadata and default narrative

### Service

Metadata: audience/eligibility, location or delivery mode, availability, cost description if applicable, service access instructions and enquiry destination.

Default order: hero → practical facts → about/support → process → outcomes → family story → gallery → FAQs → closing support action.

Preserve the current visual treatment while moving the final action after supporting evidence in the production template; the demo currently has extra stats/gallery appended after its CTA. Avoid repeating the same statistic in multiple blocks unless derived from a shared value.

### Outreach

Metadata: date/date range, places, audiences, activities, organizers/partners when provided and session-hosting destination.

Default order: introduction/cover → summary → context → locations and activities → impact → photo essay/gallery → community voice → outcomes/next steps → host/connect action.

Support a single location and a longer multi-stop journal. Date fields are structured; editorial labels remain editable. Skip empty partners/outcomes sections rather than fabricate them.

### Research

Metadata: lifecycle (concept/pilot/published/completed), challenge, approach/methodology, findings status, resources and collaboration destination.

Default order: hero → question → approach → innovation/demo or screenshots → findings/results → methodology/resources → gallery → collaboration action.

The communication board in /demo is illustrative, not the production Companion app. Allow it only as an explicitly selected, maintained built-in demo block or replace it with approved screenshots and a real app/resource link. No arbitrary executable code from the CMS. Findings need reporting context; conceptual examples must not appear as measured results.

### Campaign

Metadata: lifecycle, goal statement, audience, optional metric current/target/unit, as-of date, optional start/end dates, milestone status and participation destinations.

Default order follows CampaignConcept.tsx: hero → optional progress → section nav → purpose → promises → timeline → story → reach → gallery → participation.

Progress is optional for awareness campaigns. Zero is valid; target must be positive; completed campaigns need an appropriate closing message. No donation section or payment integration. Sharing should provide working copy/share behavior or a real resource, with an accessible fallback.

## Section registry for v1

Each row requires a schema, editor, renderer, empty-state rule and tests before it is considered supported.

| Type | Structured content | Main uses |
| --- | --- | --- |
| rich_text | Restricted editor document | About, purpose, methodology |
| practical_facts | Label/value entries, optional safe link | Service facts; research context |
| features | Stable items with title/body/approved icon | Support cards; campaign promises |
| who_we_support | Audience items and eligibility notes | Services |
| how_it_works | Ordered process steps | Service journey; research approach |
| stats | Value, unit/label, period, public source context | All categories |
| story | Image, intro/body, optional quote and attribution | Family or field story |
| quote | Quote, public attribution, optional image | Community voices |
| gallery | Asset references, alt/caption, focal point | All; category-specific grid treatment |
| faq | Question/answer items | Service questions; campaign participation guidance |
| timeline | Milestones, dates and states | Campaign journey |
| progress_tracker | Current/target/unit/as-of, optional dates | Campaign progress |
| activities | Place/date/activity/count items | Outreach postcards |
| resources | Label, description, asset or approved URL, type | Research notebook/downloads |
| related_programs | Bounded program IDs | Optional discovery |
| cta | Heading/body and validated action list | Closing next step |
| built_in_demo | Allowlisted component ID and bounded configuration | Optional research interaction |

Section names/counts are this proposed contract, not a claim that these components already exist. Consolidate overlapping old types during phase 1 rather than maintain aliases indefinitely. Dedicated video/carousel behavior is deferred; resources can link to approved destinations.

## Data/design boundary

Fixture data must round-trip through validation, storage mapping and renderer with the same section order and appearance. The old data/programs files and lib/types/program-prototype.ts are legacy inputs, not the final schema.

Editorial metadata (reviewer, consent, internal evidence) stays private. Public stats may carry a reporting period and public source, but never private family details. Assets are references, not permanent signed URLs. Public actions need clear labels, meaningful destinations and campaign/program context.

## Visual acceptance

Capture desktop and 390px screenshots of the full current demos as a baseline. Verify the production renderer at 320, 390, 768 and 1440px with short, long, missing optional and full content. Review typography, image crop, buttons, gallery captions and page rhythm. No claim of WCAG compliance follows from visual similarity alone.
