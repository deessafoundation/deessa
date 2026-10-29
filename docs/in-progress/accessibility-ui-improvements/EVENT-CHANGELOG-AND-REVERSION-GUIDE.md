# Nepal Accessibility Summit 2026 — Changes & Post-Event Reversion Guide

**Created:** 2026-10-29  
**Purpose:** Comprehensive inventory of all modifications applied for the Nepal Accessibility Summit 2026 and donor accessibility compliance, with complete step-by-step restoration instructions to reverse or adjust any change after the event.

---

## 1. Summary of Changes

### Color System Calibration: Accessible Ocean Blue (`#0275b1`)
- **Original Brand Ocean Blue (`#3FABDE`)**: Contrast on white is **2.60:1** (fails WCAG AA threshold of 4.5:1).
- **Previous Attempt (`#0B5F8A`)**: Deep navy/teal, 6.96:1 contrast, but deemed too dark and diverged from the ocean blue visual identity.
- **Calibrated Accessible Ocean Blue (`#0275b1`)**:
  - Contrast ratio against white: **5.02:1** (passes WCAG AA 4.5:1).
  - Contrast ratio of white text on `#0275b1`: **5.02:1** (passes WCAG AA 4.5:1).
  - Donate button hover: Preserved original `scale(1.03)` + shadow expansion with richer `#015c8c` hover tone.
  - Register button hover: Preserved original soft ocean-tint hover fill (`rgba(2, 117, 177, 0.15)`) with `#015c8c` text and border.
  - Nav links hover: Preserved original expanding glowing gradient underline (`group-hover:w-[45%] group-hover:opacity-100`) and pulse animation, with smooth `#0275b1` text color transition.

| Component / Area | File(s) | Pre-Event State | Event / Current State | Reversion Feasibility |
| :--- | :--- | :--- | :--- | :--- |
| **Events Typography** | `components/events/accessibility-summit.module.css`, `components/events/events-landing.module.css` | Used Marissa Font (`"Marissa Font", "Comic Neue", sans-serif`) with text-stroke. | Clean sans-serif stack (`DM Sans`, system-ui, sans-serif) per donor requirement. | 1-minute revert (restore font-family & text-stroke). |
| **Summit Page Visuals** | `components/events/accessibility-summit.module.css`, `components/events/accessibility-summit.tsx` | Gray hero (`#f9fafb`), light blue links (`#3FABDE`), lower contrast text (`#6b7280`). | Pure white background (`#ffffff`), dark near-black body (`#111827`), accessible link colors with underline, accessible primary/secondary buttons. | 1-minute revert (or keep as permanent improvement). |
| **Events Hero Brand Casing** | `components/events/events-landing.tsx` | Uppercase `DEESSA FOUNDATION`. | Lowercase `deessa Foundation` per global brand naming standard. | Permanent brand fix (keep). |
| **Navbar Buttons & Links** | `components/layout/navbar.tsx`, `components/layout/navbar.module.css` | White on cyan `#3FABDE` (2.3:1 contrast, failing AA), inline hex classes. | Default color is crisp black (`#000000`, 21:1 contrast) with accessible Ocean Blue (`#0275b1`) hover color and preserved original hover scaling and expanding glowing underline. | Fully reversible or retainable. |
| **Footer Feedback Button** | `components/layout/footer.tsx` | No Feedback button in bottom bar; resources column had no Feedback link. | Feedback button in bottom bar and resources column linking to `/support`. | 1-minute revert (remove the Link elements). |
| **Website Features** | `app/(public)/layout.tsx`, Site Settings | Intro video & Dev mode notice active. | Intro video and Dev notice modal disabled in site configuration. | Re-enable in Admin $\to$ Site Settings $\to$ Site UI Flags. |
| **Accessibility Button / Widget** | `app/(public)/layout.tsx`, Site Settings | Always rendered as a floating widget over public viewports. | Made configurable in site settings and hidden from public interface to reduce screen clutter. | Re-enable in Admin $\to$ Site Settings $\to$ Accessibility Settings. |

---

## 2. Step-by-Step Reversion Instructions

If the foundation decides to revert any or all of these changes after the Nepal Accessibility Summit concludes, follow the instructions below:

### A. Reverting Events Typography Back to Marissa Font

If you wish to re-enable the Marissa display font on the event pages:

1. In `components/events/accessibility-summit.module.css`:
   Change:
   ```css
   .title {
     ...
     font-family: var(--font-dm-sans, "DM Sans"), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     font-weight: 700;
     ...
   }
   ```
   Back to:
   ```css
   :global(body:not(.dyslexia-font):not(.font-opendyslexic):not(.font-readable)) .title {
     font-family: "Marissa Font", "Comic Neue", sans-serif;
     font-weight: 400;
     -webkit-text-stroke: 0.5px currentColor;
   }
   ```

2. In `components/events/events-landing.module.css`:
   Change:
   ```css
   :global(body:not(.dyslexia-font):not(.font-opendyslexic):not(.font-readable)) .page .title {
     font-family: var(--font-dm-sans, "DM Sans"), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     font-weight: 700;
     -webkit-text-stroke: 0;
   }
   ```
   Back to:
   ```css
   :global(body:not(.dyslexia-font):not(.font-opendyslexic):not(.font-readable)) .page .title {
     font-family: "Marissa Font", "Comic Neue", sans-serif;
     font-weight: 400;
     -webkit-text-stroke: 0.5px currentColor;
   }
   ```

---

### B. Reverting Navbar Buttons to Original Cyan Styling

If you wish to restore the original `#3FABDE` button and nav link styling:

1. In `components/layout/navbar.module.css`:
   Restore `.registerBtn` and `.donateBtn` to the original colors, or remove the scoped classes in `components/layout/navbar.tsx` lines 270–288 and lines 355–372.

*Note: The original white-on-cyan button had a contrast ratio of 2.6:1, which does not pass WCAG 2.2 Level AA. Retaining the accessible ocean blue (`#0275b1`) is strongly recommended for ongoing accessibility.*

---

### C. Reverting Footer Feedback Button

If you wish to remove the Feedback button from the footer:

1. In `components/layout/footer.tsx`:
   - Remove `{ label: "Website Feedback", href: "/support", icon: MessageSquare },` from `footerLinks.resources`.
   - In lines 415–435, remove the `md:justify-self-end` `Feedback` button container.

---

### D. Re-enabling Development Mode or Intro Video

- **Intro Video**: Navigate to Admin $\to$ Site Settings $\to$ Intro Video, or update `site_settings` under key `intro_video` to set `enabled: true`.
- **Development Notice Modal / Beta Badge**: Navigate to Admin $\to$ Site Settings $\to$ Site status indicators, or set `devNotice: true` and `betaBadge: true` under key `site_ui_flags`.

---

### E. Re-enabling the Floating Accessibility Button / Widget

If you wish to display the floating accessibility widget again on the public site:

- Navigate to Admin $\to$ Site Settings $\to$ Accessibility Settings (or update `site_settings` key `accessibility_settings`), and set `enabled: true`.
- Layout reference: `app/(public)/layout.tsx` lines 79–81: `<AccessibilityPanel config={a11yConfig} />`.
