# Current visual references: all four categories

Updated September 15, 2026. This filename is retained for compatibility; the earlier two-category mockups are archived.

| Preview | Implementation reference |
| --- | --- |
| /demo/aac-support | ServiceDemo in components/programs/demo/ProgramDemos.tsx |
| /demo/community-outreach | OutreachDemo in components/programs/demo/ProgramDemos.tsx |
| /demo/deessa-companion | ResearchDemo in components/programs/demo/ProgramDemos.tsx |
| /demo/1000-families | components/programs/demo/CampaignConcept.tsx |

Shared styles: components/programs/demo/program-demo.module.css.
Campaign styles: components/programs/demo/campaign-concept.module.css.
Interactive examples: components/programs/demo/DemoInteractions.tsx.
Entry points: /demo and /demo/programs.

The campaign reference is the current light, photo-led split layout, not the old full-bleed purple/yellow concept. Preserve the site's fonts, ocean blue, pill buttons and category-specific page rhythm. There is no donation section.

Before extracting production templates, capture full-page desktop/mobile references and map every visible block to the [content contract](category-specific-design-system.md). Source code contains static data and demonstration interactions; visual acceptance does not make those production implementations.

Review these references with minimum content, long content, omitted optional sections and realistic image crops. The production renderer should retain each category's character while handling variable CMS content.
