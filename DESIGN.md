---
name: deessa Foundation public brand evidence
description: Existing public-site visual patterns and scoped events implementation reference
colors:
  ocean-blue: "rgb(63 171 222)"
  deep-ocean: "rgb(11 95 138)"
  light-blue: "rgb(232 246 252)"
  white: "#fff"
  public-copy: "#445e7b"
  pale-blue: "#f2f8fc"
  logo-yellow: "rgb(247 197 43)"
typography:
  display:
    fontFamily: '"Marissa Font", "Comic Neue", sans-serif'
    fontWeight: 400
  body:
    fontFamily: '"Comic Neue", sans-serif'
rounded:
  events-card: "16px"
  events-input: "8px"
  pill: "999px"
components:
  events-primary:
    backgroundColor: "{colors.deep-ocean}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
---

# Design System: deessa Foundation public brand evidence

## Overview

**Creative North Star: "Existing public-site continuity"**

This is an extracted reference, restricted to the public brand evidence in global CSS, the donate page, and the finalized `/events` implementation. It does not prescribe a new global visual world or describe administrative interfaces. The existing public site is authoritative.

**Key Characteristics:**

- Ocean-blue identity and pale-blue supporting surfaces.
- Marissa headings and Comic Neue copy, respecting accessibility font overrides.
- Rounded actions and restrained existing watercolor artwork.

## Colors

Ocean Blue, Deep Ocean, and Logo Yellow are incumbent global brand colors. Light Blue and white provide supporting surfaces; Public Copy is shared by events and donate. Pale Blue appears in global newsletter styling and events empty states. The latest events hero uses a scoped lighter blue-white surface and a yellow heading underline. Page-specific shades stay in their component modules.

## Typography

The public-page evidence pairs Marissa headings with Comic Neue body copy. Accessibility font modes override decorative headings. Events scales its hero heading responsively and uses stronger Comic Neue labels for filters and dates.

## Layout

Events uses a centered maximum-width container (80rem) and a desktop split hero: title and copy beside five illustrative photographic scenes arranged three above two. The desktop hero scales the preceding treatment by approximately 25% at normal zoom, following the reported preference for Chrome 125%: maximum width 1400px, gap 45px, and padding 40px. The aspect-ratio collage retains its three-top/two-bottom composition. Photos are absolutely positioned; copy and collage stack on smaller screens, preserving earlier mobile sizing. At 1920px the observed hero is 590px tall. Actual Chrome zoom has not been tested. Horizontal listing rows split image and details on desktop and stack on mobile. A compact host invitation follows the list. These are events-specific patterns, not mandatory layouts for every public page. Controls wrap; long titles and enlarged text need room to reflow.

## Elevation & Depth

The latest events surface uses pale-blue tonal sections, low-opacity watercolor, and bordered white rows rather than elevated listing cards. Contrast modes remove watercolor decoration and preserve explicit borders.

## Shapes

Events rows use gently rounded corners, fields use smaller corners, and actions and category chips use pill shapes. Hero scenes use five individually authored SVG Bézier clip paths, rather than circular border radii. White SVG contour outlines preserve narrow channels between photos; authored doodles sit around the composition. This records the implemented events surface rather than replacing the global radius token.

## Components

The standalone summit detail surface preserves the same public blue palette and type. Its wide contained poster is followed by date/time/location facts, a desktop content-and-partner split that stacks on mobile, and a final registration invitation. Facebook registration actions use blue pill styling; pale-blue partner and invitation panels remain scoped to this surface. This is a detail-page pattern, independent of the illustrative events hero.

Events primary actions use Deep Ocean with white copy. The desktop hero has a 14px foundation label, Events heading clamped from 88px to 110px with yellow underline, a 40px Marissa tagline, 20px body copy capped at 425px, and 17px CTA copy with 54px minimum height. Mobile retains its earlier scale. Five generated scenes use cover cropping inside custom SVG shapes; the communication scene uses a reduced 1.2 scale to crop less tightly toward the hands, with descriptive alt text and a visually hidden illustrative-imagery figure caption; they are not actual-event photographs. CMS event posters remain contained in listing rows, alongside full start/end dates and event-detail links. Search is labeled and lives with filters in native `details` when more than one event exists. Period and category buttons expose selection with `aria-pressed`. Result counts use a visually hidden polite live status. The compact host invitation links to contact.

## Do's and Don'ts

### Do:

- Do follow the existing public-site palette, type, and assets.
- Do keep events-specific color and contrast rules in its CSS module.
- Do respect accessibility font modes and explicit focus and selection states.

### Don't:

- Don't treat the events layout as a new global identity.
- Don't reintroduce the rejected warm-paper editorial direction for events.
- Don't use arbitrary hexadecimal Tailwind color classes on interactive elements or their ancestors; repository contrast selectors can override them.




