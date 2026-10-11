# Standalone accessibility summit

The public Nepal Accessibility Summit 2026 page is independent of CMS publication status. It retains `/events/nepal-accessibility-summit-2026`, with a registration redirect to the Facebook event. The public listing merges a hardcoded event and deduplicates the same slug; the sitemap preserves the static route. The dynamic event route's `generateStaticParams` filters this slug to avoid a static/dynamic prerender collision. No administrative publication changes are part of this implementation; the user manages unpublishing the CMS record.

Sources are `lib/data/accessibility-summit.ts`, `components/events/accessibility-summit.tsx`, and its CSS module. The user-provided poster is copied to `public/events/accessibility-summit/poster.jpg`. It supplies actual summit artwork rather than the illustrative hero scenes documented separately.

## Content authority

The parent task extracted public information from the [Facebook event](https://www.facebook.com/events/2012481132746254/): 30 November at 9 AM through 1 December at 5 PM, Nepal time, Pokhara, focus areas, and partner names. The implementation uses the supplied Facebook share link as its registration destination. Summit contact information comes from the extracted record. The venue remains “to be announced.” Stale CMS tickets and agenda are not carried into this page.

The page presents the two-day date range, start/end time, location, six focus areas, organizers and supporting partners, summit email, and repeated Facebook registration links. Registration copy sends visitors to Facebook for information and updates; the standalone page does not invent a ticket workflow.

## Brand and layout

The page follows the existing blue public brand, Marissa headings with accessibility font overrides, Comic Neue body copy, rounded actions, and pale-blue supporting panels. A contained wide poster follows the heading and registration action; a three-column facts row stacks on mobile. Main copy and focus areas sit beside a partner panel on desktop, with a final invitation below. Per-page color, focus, high/inverted contrast, forced-colors, and print rules live in its co-located CSS module.

## Verification and limits

The parent task reviewed `summit-desktop.png` and `summit-mobile.png`: poster loaded, Facebook hrefs matched the implementation, and no horizontal overflow appeared. `summit-preview.png` records the delivered page. Browser checks confirmed the legacy registration URL redirects to Facebook event `2012481132746254`; `/events` shows Upcoming (1) with exactly one summit card using the new poster and title, and View event details opens the static page.

Final reviewer disposition: ship. The detector reported zero primary findings with palette advisories only. The static-parameter collision safeguard was a subsequent source change and was not verified through a build. No formatter, ESLint, typecheck, tests, or build ran. Source contrast rules are not a runtime accessibility certification; screen-reader and comprehensive compliance checks were not performed.
