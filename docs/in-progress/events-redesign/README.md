# Events redesign implementation record

The finalized `/events` page follows the existing public-site brand. The user rejected the earlier warm-paper editorial direction and explicitly requested consistency with the rest of the site. This record describes the events implementation; it does not establish a replacement global identity or product strategy.

## Visual authority and final direction

Sources: `components/events/events-landing.tsx`, its co-located CSS module, `app/globals.css`, and the public donate page's CSS module. The incumbent system uses Ocean Blue, deep blue text and actions, Comic Neue body copy, Marissa headings, rounded controls, and watercolor artwork. The latest user-supplied screenshot directs the composition: an Events heading with a yellow underline, a Marissa tagline, a five-scene collage, horizontal event rows, and a compact host invitation. The site's own brand colors remain authoritative.

Global brand evidence includes `--brand-primary` (63 171 222), `--brand-primary-dark` (11 95 138), `--primary-light` (232 246 252), and logo yellow (`#f7c52b`). Events derives its action blue from the existing dark brand token. White surfaces, muted copy (`#445e7b`), pale-blue supporting areas, and watercolor artwork have public-page precedents. The hero's `#f8fbfd` surface, borders, collage shapes, and contrast rules remain scoped in its CSS module.

Marissa headings follow the public donate page's font pattern, with Comic Neue fallback. Accessibility font modes bypass that heading assignment. The hero uses the existing `/artWork/art-watercolor-splash.webp` asset at low opacity; sensory-friendly and contrast modes remove the decoration.

Five generated photographic scenes are referenced at `public/events/hero/{connection,workshop,conversation,creative-learning,communication}.png`. They illustrate Nepali community connection and learning, including blue clothing and inclusive participation. They do not document actual foundation events or make event claims. A visually hidden figure caption says “Illustrative imagery created for deessa.” Three custom SVG Bézier-clipped scenes sit above two; this illustrative collage is separate from CMS event posters.

## Problems addressed

- The rejected editorial treatment introduced a visual identity disconnected from the public site. The final page restores existing typography, blue palette, rounded shapes, and artwork.
- Visitors need a useful event listing without a repeated featured card. Horizontal image/date/details rows show start and end dates, venue, category, free entry, and event-detail links.
- Filtering needs understandable recovery. Search, category, free-only, and upcoming/past controls lead to a result count and specific empty states with a clear-filters action when applicable.
- Posters should remain legible. Artwork uses contained images rather than cropping, with an unavailable-artwork fallback.

## Implementation scope

The hero presents illustrative scenes rather than a featured CMS event. The first upcoming event receives a next-on-calendar or happening-now badge in the listing. Upcoming/past classification uses the event end date when present, otherwise its start date. Search matches title, short description, location, and venue; categories are drawn from available event data. Search and filters sit inside native `details` only when more than one event exists. Detail links retain `/events/[slug]`; host links use `/contact`.

The user reported that Chrome at 125% zoom felt correctly sized. The desktop hero therefore scales the prior treatment by approximately 25% at normal browser zoom: maximum width 1400px, gap 45px, padding 40px, heading clamp from 88px to 110px, 40px tagline, 20px body copy capped at 425px, 14px foundation label, and 17px CTA copy with a 54px minimum height. Earlier mobile sizing is preserved. The collage retains its aspect-ratio composition rather than a fixed height. Five photos use custom SVG Bézier clip paths and white contours in a three-top/two-bottom composition, with authored doodles. The communication photo scale is reduced from 1.5 to 1.2 to crop less tightly. Copy and collage stack on smaller screens. Event rows split into image and details at the large breakpoint and stack on smaller screens. The compact inline host invitation follows the list. Controls wrap or stack; long content has minimum-width and wrapping safeguards, and enlarged text can stack date summaries.

Contrast styles stay scoped to the CSS module. Selected controls invert foreground/background; dark high-contrast actions explicitly set SVG strokes. Focus outlines, reduced-motion, forced-colors, and print rules are present in source. These source provisions are not a full accessibility certification.

## Verification and limits

The latest screenshot-directed revision was reviewed through full-page screenshots at desktop (1280px) and mobile (390px), saved as `.impeccable/review/desktop.png` and `.impeccable/review/mobile.png`. `events-hero-preview.png` records the current desktop hero. The latest desktop/mobile screenshots cover the compact hero, with no horizontal overflow at mobile 390px. All five generated hero images and the CMS event poster loaded. Neither viewport showed horizontal overflow. Explore events reached the upcoming section; Past events (0) displayed an honest empty state, and Upcoming restored the event.

High-contrast and text-scaling behavior in this revision remain untested. Earlier filtering, high-contrast, and 200% text checks covered the preceding layout and are historical evidence only. Latest screenshots cover desktop 1280px, wide desktop 1920px, and mobile 390px, saved as desktop.png, wide-desktop.png, and mobile.png under .impeccable/review/. At 1920px the hero measured 590px high with no horizontal overflow. Actual Chrome 125% zoom was not tested; sizing responds to the reported preference. The reviewer confirmed greater presence at both desktop widths, preserved communication context, and no mobile issues. Final disposition: ship. Earlier detector results belong to preceding revisions.

No formatter, ESLint, typecheck, test suite, or production build was run, consistent with the repository's opt-in verification instruction. No screen-reader evaluation or comprehensive compliance audit was performed. Source rules for inverted contrast, forced colors, print, and reduced motion should not be read as runtime verification of every mode.

Existing poster dates differ from CMS dates in some content. The page displays CMS dates; reconciling those posters is a content-maintenance task and was not part of this redesign.






