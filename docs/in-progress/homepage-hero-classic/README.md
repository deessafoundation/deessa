# Homepage hero — classic dark banner restored

**Status:** Implemented (homepage renders the classic hero)
**Date:** 2026-10-28
**Scope:** `app/(public)/page.tsx`, `components/homepage/hero-carousel-classic.*`

---

## Why

Commit `d65d669` (*feat(home): light editorial hero, art section refresh and TTS fixes*, 2026-10-05) replaced the homepage's original full-bleed **dark banner slideshow** with the light editorial hero the site ships today. The client reviewed both and prefers the earlier design.

The request was explicitly **not** to revert or reset: keep the current work, take a backup of the page, write this record, and rebuild the classic design by hand from the old code.

## Decisions

| Question | Decision |
|---|---|
| Restore classic design? | Yes — hand-ported, no `git revert` / `git reset`. |
| A/B toggle switch? | **No.** No admin toggle, no feature flag, no database change. The classic design is simply the homepage hero. |
| Default variant | Classic (the client's pick). |
| Editorial design | Preserved in place, not deleted (see "Switching back"). |

## Where the old code came from

- Original component: `components/hero-carousel.tsx` as of **`d70c35a`** (parent of `d65d669`), i.e. the last revision before the editorial rewrite.
- Original high-contrast CSS: the `#home-hero` block of `components/homepage-sections.module.css` at the same revision.
- Both were read as source material and re-authored into new files against today's paths and assets. Nothing was checked out, reverted, or cherry-picked.

## Files

| File | Change |
|---|---|
| `components/homepage/hero-carousel-classic.tsx` | **New.** Hand-ported classic hero, exports `HeroCarouselClassic` and `HeroSlide`. |
| `components/homepage/hero-carousel-classic.module.css` | **New.** High-contrast rules restored for `#home-hero` (`data-hero-shade` / `data-hero-control`). |
| `app/(public)/page.tsx` | **Modified.** Imports and renders `HeroCarouselClassic`. Everything else (slide mapping, image normalization, content overrides) is unchanged. |
| `docs/in-progress/homepage-hero-classic/backup/page.tsx` | **Backup.** Byte-for-byte copy of `app/(public)/page.tsx` before this change. |
| `components/homepage/hero-carousel.tsx` + `.module.css` | **Untouched.** The editorial hero stays in the tree as the restorable design. |

## Deliberate adaptations from the original

The old code could not be copied verbatim — five things in it no longer exist:

1. **Import paths.** `@/components/homepage-image` moved to `@/components/homepage/homepage-image`; `./homepage-sections.module.css` became the co-located `./hero-carousel-classic.module.css`.
2. **Dead asset.** The original normalized `/home/hero/inclusion-begins-at-home-v2.jpg`, which `d65d669` deleted. Both saved filenames now resolve to the bundled `inclusion-begins-at-home.jpg` import (same approach the editorial hero uses).
3. **`btn-shine`.** That utility is no longer defined anywhere in the repo (only a historical doc mentions it), so the class was dropped from the primary button instead of shipping dead markup. The button keeps its shadow, sizing, and hover behavior.
4. **News ticker content.** The original ticker had a second item, *"Girls' leadership and participation through sport"*, removed by `232af11`. The restored component keeps the current single item — that was a content decision, not part of the visual design.
5. **Empty-state guard.** Added `if (!slides.length) return null`, matching the editorial hero, so an empty CMS list renders nothing instead of an empty dark banner.

The stray `eslint-disable-next-line react/jsx-no-comment-textnodes` directive in the original was dropped; it had no matching rule occurrence.

## What is preserved (behaviour and accessibility)

- `HeroSlide` shape, `interval` prop, autoplay with pause on hover/focus, page-reader (TTS) pause, `prefers-reduced-motion` / app preference handling, arrow-key navigation, dot + pause controls, `sr-only` live region.
- Accessibility contract: `id="home-hero"`, `role="region"`, `aria-roledescription="carousel"` / `"slide"`, `inert` + `aria-hidden` on inactive slides, `data-tts-*` hooks, `data-hero-shade` and `data-hero-control` hooks.
- High-contrast treatment matches the documented matrix (`STANDARDS.md` §3.4, Home row): grayscale photo, horizontal scrim 68% / 60% / 25% desktop, uniform 60% black on ≤767px, vertical scrim transparent, controls forced to white surfaces with black text, white focus outline.
- CMS content: the page still maps slides from `homepage_hero_carousel`, including the slide-1 title/subtitle override and image normalization.

## Switching back to the editorial design

Two edits in `app/(public)/page.tsx`:

```tsx
import { HeroCarousel } from "@/components/homepage/hero-carousel"
import type { HeroSlide } from "@/components/homepage/hero-carousel"
// ...
<HeroCarousel slides={heroSlides} interval={heroCarouselSettings.interval} />
```

The editorial component and its CSS module were not modified. To see the pre-change page file itself, open `backup/page.tsx` in this folder.

## Verification status

- Code review only: the port was checked against the original source, current component APIs (`HomepageImage`, `Button`, accessibility hooks, TTS types) and the current asset set.
- **Not yet run:** `pnpm run lint`, `pnpm run typecheck`, `pnpm build`, browser check of the homepage in normal / high-contrast / negative modes at desktop and mobile widths. Verification is opt-in in this repo — these should be run (and §3.7 of `STANDARDS.md` walked) before handing the page to the client.

## Follow-ups

- The unused editorial hero (`hero-carousel.tsx` + `hero-carousel.module.css`) is intentionally retained as the restorable design. If the client ever confirms classic is permanent, both it and this folder's backup can be removed in a dedicated cleanup with its own review.
