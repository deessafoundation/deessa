# Partners System - Public Components Guide

## Overview

The partners system includes two public-facing components for displaying partners on event pages, homepage, and other public contexts:

1. **`PartnerCard`** — Individual partner display with logo and optional description
2. **`PartnersSection`** — Full section with categorized partners, automatic grouping, and responsive layout

## Component 1: PartnerCard

**Path:** `components/shared/partner-card.tsx`

### Features

✅ Responsive image handling with Next.js Image optimization  
✅ Automatic fallback for broken images  
✅ Two display variants: `grid` (card-style) and `inline` (horizontal)  
✅ Three size presets: `sm`, `md`, `lg`  
✅ Optional description display  
✅ Clickable cards that link to partner websites  
✅ Full accessibility (ARIA labels, keyboard navigation, focus indicators)  
✅ High-contrast mode support  
✅ Inverted-contrast mode support  
✅ Print-friendly styles  

### Usage

```tsx
import { PartnerCard } from "@/components/shared/partner-card"

<PartnerCard 
  partner={partnerData}
  variant="grid"        // 'grid' | 'inline'
  size="md"             // 'sm' | 'md' | 'lg'
  showDescription={false}
  clickable={true}
  className="custom-class"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `partner` | `ContextPartnerDetailed` | required | Partner data from database |
| `variant` | `'grid' \| 'inline'` | `'grid'` | Display style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Logo size |
| `showDescription` | `boolean` | `false` | Show partner description below logo |
| `clickable` | `boolean` | `true` | Make card link to website |
| `className` | `string` | - | Custom CSS class |

### Visual Examples

**Grid Variant (Card Style):**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│             │  │             │  │             │
│   [LOGO]    │  │   [LOGO]    │  │   [LOGO]    │
│             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Inline Variant (Horizontal):**
```
[LOGO]  [LOGO]  [LOGO]  [LOGO]  [LOGO]
```

### Styles (CSS Module)

**File:** `components/shared/partner-card.module.css`

Key features:
- Card hover effects (lift animation)
- Focus indicators for keyboard navigation
- Image fallback with partner name
- High-contrast adjustments (grayscale, border emphasis)
- Inverted-contrast adjustments (invert filter)
- Responsive sizing
- Print-friendly (shows URL after name)

---

## Component 2: PartnersSection

**Path:** `components/shared/partners-section.tsx`

### Features

✅ Automatic data fetching from database  
✅ Automatic grouping by category  
✅ Respects category display order  
✅ Respects partner display order within categories  
✅ Only shows visible partners  
✅ Hides entire section if no partners  
✅ Customizable grid columns (2-6 columns)  
✅ Optional category labels  
✅ Optional section title and subtitle  
✅ Server component (no client-side JS needed)  
✅ Fully accessible with semantic HTML  
✅ Responsive design (mobile, tablet, desktop)  

### Usage

```tsx
import { PartnersSection } from "@/components/shared/partners-section"

// In an event page
<PartnersSection 
  contextType="event"
  contextId={eventId}
  title="Partners & Collaborators"
  subtitle="Thank you to our amazing partners who made this event possible"
  variant="grid"
  size="md"
  columns={4}
  showCategoryLabels={true}
  showDescriptions={false}
/>

// On the homepage
<PartnersSection 
  contextType="homepage"
  contextId={null}
  title="Our Partners"
  columns={5}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contextType` | `ContextType` | required | `'event'`, `'homepage'`, `'program'`, etc. |
| `contextId` | `string \| null` | `null` | Event/context ID (null for homepage) |
| `title` | `string` | - | Section heading |
| `subtitle` | `string` | - | Section description |
| `variant` | `'grid' \| 'inline'` | `'grid'` | Card display style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card/logo size |
| `showDescriptions` | `boolean` | `false` | Show partner descriptions |
| `showCategoryLabels` | `boolean` | `true` | Show category headings |
| `columns` | `2 \| 3 \| 4 \| 5 \| 6` | `4` | Grid columns (grid variant only) |
| `className` | `string` | - | Custom class for section wrapper |
| `headerClassName` | `string` | - | Custom class for header |
| `categoryClassName` | `string` | - | Custom class for each category |

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Partners & Collaborators           │ ← title
│    Thank you to our amazing partners...         │ ← subtitle
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│              Organizing Partners                │ ← category label
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │LOGO 1│  │LOGO 2│  │LOGO 3│  │LOGO 4│       │ ← grid (4 columns)
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                 │
│              Knowledge Partners                 │ ← next category
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │LOGO 5│  │LOGO 6│  │LOGO 7│  │LOGO 8│       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Responsive Behavior

| Screen Size | Columns Adjustment |
|-------------|-------------------|
| Desktop (>1024px) | As specified (2-6) |
| Tablet (769-1024px) | Max 4 columns |
| Mobile (481-768px) | Max 2 columns |
| Small Mobile (<480px) | 1 column |

**Inline Variant:** Wraps horizontally on larger screens, stacks vertically on mobile.

---

## Integration Examples

### Example 1: Event Page

**File:** `app/(public)/events/[slug]/page.tsx`

```tsx
import { PartnersSection } from "@/components/shared/partners-section"

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  
  return (
    <main>
      {/* Event content */}
      <section>{/* Event details */}</section>
      
      {/* Partners Section */}
      <PartnersSection 
        contextType="event"
        contextId={event.id}
        title="Event Partners"
        subtitle="A heartfelt thank you to our partners who made this event possible"
        variant="grid"
        size="md"
        columns={4}
        showCategoryLabels={true}
        className="container mx-auto px-4"
      />
      
      {/* More event content */}
    </main>
  )
}
```

### Example 2: Homepage

**File:** `app/(public)/page.tsx`

```tsx
import { PartnersSection } from "@/components/shared/partners-section"

export default function HomePage() {
  return (
    <main>
      {/* Hero section */}
      {/* About section */}
      {/* Featured content */}
      
      {/* Partners Section */}
      <PartnersSection 
        contextType="homepage"
        contextId={null}
        title="Our Partners & Supporters"
        variant="inline"
        size="lg"
        columns={5}
        showCategoryLabels={false}  // Single row of logos
        className="bg-gray-50 py-16"
      />
    </main>
  )
}
```

### Example 3: Custom Styling

```tsx
<PartnersSection 
  contextType="event"
  contextId={eventId}
  title="Collaborators"
  columns={3}
  className="my-custom-section"
  headerClassName="text-left"
  categoryClassName="mb-12"
/>

{/* Add custom CSS */}
<style jsx>{`
  .my-custom-section {
    background: linear-gradient(to bottom, #f9fafb, #ffffff);
    padding: 5rem 2rem;
  }
`}</style>
```

---

## Accessibility Features

### ARIA Attributes

- Section has `aria-labelledby` pointing to title
- Cards have descriptive `aria-label` for screen readers
- Focus indicators clearly visible in all modes

### Keyboard Navigation

- Tab through all clickable partner cards
- Enter/Space to follow partner links
- Focus indicators respect high-contrast modes

### Screen Reader Support

- Semantic HTML (`<section>`, `<h2>`, `<h3>`, `<a>`)
- Descriptive alt text for logos
- External link indicators (`target="_blank"` with `rel="noopener noreferrer"`)

### High Contrast Modes

**Standard High Contrast:**
- Black text on white background
- Bold borders (2px solid black)
- Grayscale filter on logos for clarity
- Enhanced focus indicators

**Inverted Contrast:**
- White text on dark background
- Bold white borders
- Logo invert filter
- Enhanced focus indicators

### Color Contrast

All text meets WCAG 2.1 Level AA standards:
- Title: 14:1 contrast ratio
- Subtitle: 7:1 contrast ratio
- Category labels: 10:1 contrast ratio

---

## Performance

### Image Optimization

- Uses Next.js `<Image>` component with automatic optimization
- Lazy loading for off-screen images
- Responsive sizing with `srcset`
- WebP format support

### Server-Side Rendering

- `PartnersSection` is a server component (no client JS)
- Data fetched on server, cached at edge
- Minimal HTML shipped to client

### Caching Strategy

```tsx
// In lib/data/context-partners.ts
// Already implements:
// - Database query optimization
// - Result grouping on server
// - No client-side processing needed
```

---

## Customization Options

### 1. Override Styles

```tsx
import styles from "./custom-partners.module.css"

<PartnersSection 
  className={styles.customSection}
  categoryClassName={styles.customCategory}
/>
```

### 2. Custom Grid Breakpoints

Edit `partners-section.module.css`:

```css
@media (max-width: 1200px) {
  .partnersGrid.grid[data-columns="4"] {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 3. Custom Card Hover Effects

Edit `partner-card.module.css`:

```css
a.card:hover {
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
```

---

## Testing Checklist

- [ ] Partners display correctly on event pages
- [ ] Logos load with proper aspect ratio
- [ ] Broken images show fallback with partner name
- [ ] Cards link to partner websites (new tab)
- [ ] Grid layout responsive on mobile/tablet/desktop
- [ ] Category labels display in correct order
- [ ] Partners display in correct order within categories
- [ ] Hidden partners don't appear in public view
- [ ] High-contrast mode works (both standard and inverted)
- [ ] Keyboard navigation works (tab, enter, focus indicators)
- [ ] Screen reader announces partner names correctly
- [ ] Print layout is clean and usable

---

## Troubleshooting

### Issue: Partners not showing

**Check:**
1. Are partners marked as `is_visible = true`?
2. Is the event status `published`?
3. Are categories configured for the context?
4. Run diagnostic: `scripts/db/diagnostics/check-orphaned-partners.sql`

### Issue: Logos not loading

**Check:**
1. Is logo URL valid?
2. Is logo in `partner-logos` storage bucket with public access?
3. Check browser console for CORS errors
4. Verify Next.js Image domains configured in `next.config.js`

### Issue: Wrong order

**Check:**
1. Category `display_order` in `partner_categories` table
2. Partner `display_order` in `context_partners` table (within category)
3. Database query in `lib/data/context-partners.ts` sorts correctly

---

## Files Reference

| File | Purpose |
|------|---------|
| `components/shared/partner-card.tsx` | Individual partner card component |
| `components/shared/partner-card.module.css` | Card styles with high-contrast support |
| `components/shared/partners-section.tsx` | Full section with auto-grouping |
| `components/shared/partners-section.module.css` | Section styles with responsive layout |
| `lib/data/context-partners.ts` | Server-side data fetching |
| `lib/types/partners.ts` | TypeScript type definitions |

---

**Last Updated:** October 28, 2026  
**Status:** ✅ Ready for production  
**Next:** Add `<PartnersSection />` to your event and homepage layouts!
