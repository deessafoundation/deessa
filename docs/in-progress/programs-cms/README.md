# Programs CMS documentation

Updated: September 15, 2026.
Status: implementation planning; four static design references exist. Production CMS work is not complete.

## Start here

1. [Implementation plan](IMPLEMENTATION-PLAN.md): scope, decisions, dependencies and release gates.
2. [Implementation tasks](tasks.md): ordered, checkable work from discovery to production operations.
3. [Architecture](programs-cms-architecture-analysis.md): data model, publishing, access control and migration.
4. [Category design contract](category-specific-design-system.md): the four current designs and their content requirements.
5. [Testing plan](PROTOTYPE-TESTING.md): verification matrix and release evidence.
6. [Quick reference](programs-cms-quick-reference.md): concise implementation rules.
7. [UI/UX review](ui-ux-review.md): remaining production UX work.
8. [Visual reference guide](visual-mockups-service-campaign.md): current source locations; the filename is retained for existing links.

## Design authority

The four current demo pages are the visual reference:

| Category | Preview | Current source |
| --- | --- | --- |
| Service | /demo/aac-support | components/programs/demo/ProgramDemos.tsx |
| Outreach | /demo/community-outreach | components/programs/demo/ProgramDemos.tsx |
| Research | /demo/deessa-companion | components/programs/demo/ProgramDemos.tsx |
| Campaign | /demo/1000-families | components/programs/demo/CampaignConcept.tsx, wrapped by CampaignDemo |

Use /demo for direct links or /demo/programs to compare them. Shared styles are in program-demo.module.css; the campaign also uses campaign-concept.module.css.

Preserve ocean blue, the site's Marissa/DM Sans/Comic Neue typography, pill-shaped action buttons and the distinct compositions. Do not restore the old purple/yellow campaign, deep-blue panels or donation section. The campaign reference is the light, split, photo-led redesign.

All demo copy, figures, dates, testimonials and imagery are illustrative. Design acceptance does not establish factual accuracy, media permission, accessibility compliance or production readiness.

## Product direction

Visitors discover published program cards on /whatwedo and open /whatwedo/[slug]. Admins manage content through /admin/programs. Supabase stores content; category templates own presentation. Four categories describe the format of work; subject tags such as communication or education are separate.

The /demo routes stay as design fixtures. Production renders from published CMS content, not from the demos or the old data/programs datasets.

## Document precedence

Current user decisions and the demo designs govern appearance. IMPLEMENTATION-PLAN.md governs implementation scope; the architecture document governs its proposed technical contract; tasks.md tracks delivery.

Earlier documents are preserved in [archive/2026-09-15-pre-cms-review](archive/2026-09-15-pre-cms-review/README.md). They are historical, not migration scripts or current instructions. This refresh replaces contradictory schema proposals, unsafe authorization examples, old route assumptions and unverified completion claims.
