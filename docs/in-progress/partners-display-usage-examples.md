# Partners Display - Usage Examples

## Overview

The `PartnersDisplay` component is highly reusable and supports 4 different layout types per category, allowing you to match various design patterns.

## Layout Types

| Layout | Use Case | Appearance |
|--------|----------|------------|
| **`icon-grid`** | Organizers with icons | 2-column grid with icons above names |
| **`full-bar`** | Featured collaborator | Full-width centered bar with large text |
| **`text-grid`** | Ranked co-organizers | 4-column grid of bordered text cards |
| **`logo-grid`** | Standard partners | 2-column grid with partner logos |

## Example 1: Event Partners (Matching Screenshot)

This recreates the design from your screenshot:

```tsx
import { PartnersDisplay } from "@/components/shared/partners-display"

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  
  return (
    <main>
      {/* Event content */}
      
      <PartnersDisplay 
        contextType="event"
        contextId={event.id}
        categoryLayouts={{
          // Organizers with icons (Deessa Foundation, Social Artist)
          organizers: "icon-grid",
          
          // In Collaboration With - full-width bar (GIZ)
          in_collaboration: "full-bar",
          
          // Knowledge and Technical - side by side text
          knowledge_partner: "text-grid",
          technical_partner: "text-grid",
          
          // Co-Organizers - 4-column grid (BYAN, CBM, INF, etc.)
          co_organizers: "text-grid",
        }}
        className="container mx-auto px-4"
      />
    </main>
  )
}
```

### Database Setup

Make sure your partner categories are configured:

```sql
-- In admin panel, create these categories for your event:
-- 1. Organizers (category_key: 'organizers', display_order: 0)
-- 2. In Collaboration (category_key: 'in_collaboration', display_order: 1)
-- 3. Knowledge Partner (category_key: 'knowledge_partner', display_order: 2)
-- 4. Technical Partner (category_key: 'technical_partner', display_order: 3)
-- 5. Co-Organizers (category_key: 'co_organizers', display_order: 4)
```

Then add partners to each category in the admin panel.

## Example 2: Simple Logo Grid

For a standard partner section with all logos:

```tsx
<PartnersDisplay 
  contextType="event"
  contextId={eventId}
  title="Our Partners"
  subtitle="Thank you to everyone who made this possible"
  defaultLayout="logo-grid"  // All categories use logo grid
/>
```

## Example 3: Mixed Layouts

Different layouts for different category types:

```tsx
<PartnersDisplay 
  contextType="event"
  contextId={eventId}
  categoryLayouts={{
    // Main organizers with icons
    organizers: "icon-grid",
    
    // Sponsors as logo grid
    sponsors: "logo-grid",
    
    // Media partners as text cards
    media_partners: "text-grid",
  }}
  defaultLayout="logo-grid"  // Fallback for unlisted categories
/>
```

## Example 4: Homepage Partners

Simple inline logos for homepage:

```tsx
<PartnersDisplay 
  contextType="homepage"
  contextId={null}
  title="Trusted Partners"
  defaultLayout="logo-grid"
  className="bg-gray-50 py-16"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contextType` | `ContextType` | required | `'event'`, `'homepage'`, etc. |
| `contextId` | `string \| null` | `null` | Event ID (null for homepage) |
| `title` | `string` | - | Section heading |
| `subtitle` | `string` | - | Section description |
| `categoryLayouts` | `Record<string, Layout>` | `{}` | Per-category layout override |
| `defaultLayout` | `Layout` | `'logo-grid'` | Default if category not specified |
| `className` | `string` | - | Custom wrapper class |

### Layout Types

- `'icon-grid'` — 2-column grid with icons
- `'full-bar'` — Full-width centered bar
- `'text-grid'` — 4-column text cards
- `'logo-grid'` — 2-column logo grid

## Icon Mapping

The component automatically shows icons for these categories:

| Category Key | Icon | Customization |
|--------------|------|---------------|
| `organizers` | Users | Edit in `categoryIcons` map |
| `in_collaboration` | Building2 | - |
| `knowledge_partner` | Lightbulb | - |
| `technical_partner` | Code | - |
| `co_organizers` | Award | - |
| `sponsors` | Building2 | - |

To add more icons, edit `components/shared/partners-display.tsx`:

```tsx
import { YourIcon } from "lucide-react"

const categoryIcons: Record<string, React.ComponentType> = {
  organizers: Users,
  your_category: YourIcon,  // Add here
  // ...
}
```

## Styling Customization

### Override Colors

The component uses your brand colors from `app/globals.css`:

- **Primary**: `--brand-primary` (Ocean Blue)
- **Dark**: `--brand-primary-dark` (Deep Ocean)

To customize per-instance:

```tsx
<PartnersDisplay 
  contextType="event"
  contextId={eventId}
  className="custom-partners"
/>

<style jsx>{`
  :global(.custom-partners) {
    /* Override CSS custom properties */
    --brand-primary: 214 51 108; /* Pink */
  }
`}</style>
```

### Override Specific Layout

Create a custom CSS module and pass `className`:

```css
/* custom-partners.module.css */
.eventPartners :global(.categoryLabel) {
  color: #d6336c; /* Custom color */
  font-size: 1rem;
}

.eventPartners :global(.textCard) {
  border-color: #95c11f; /* Green border */
}
```

```tsx
import styles from "./custom-partners.module.css"

<PartnersDisplay 
  contextType="event"
  contextId={eventId}
  className={styles.eventPartners}
/>
```

## Accessibility Features

✅ **Keyboard Navigation**: Tab through all clickable partners  
✅ **Screen Readers**: Descriptive ARIA labels, semantic HTML  
✅ **Focus Indicators**: Clear focus rings in all modes  
✅ **High Contrast**: Bold borders, enhanced contrast  
✅ **Inverted Contrast**: Dark background support  
✅ **Color Contrast**: All text meets WCAG AA standards  

## Responsive Behavior

| Breakpoint | Icon Grid | Text Grid | Logo Grid | Full Bar |
|------------|-----------|-----------|-----------|----------|
| Desktop (>768px) | 2 columns | 4 columns | 2 columns | Full width |
| Tablet (481-768px) | 2 columns | 2 columns | 2 columns | Full width |
| Mobile (<480px) | 1 column | 1 column | 2 columns | Full width |

## Common Patterns

### Pattern 1: Tiered Partners

Main organizers with icons, supporting partners with text:

```tsx
categoryLayouts={{
  organizers: "icon-grid",
  supporters: "text-grid",
  media: "text-grid",
}}
```

### Pattern 2: Featured + Grid

One featured collaborator, rest as logos:

```tsx
categoryLayouts={{
  primary_partner: "full-bar",
  sponsors: "logo-grid",
  technical: "logo-grid",
}}
```

### Pattern 3: All Text

Minimal design, no logos:

```tsx
defaultLayout="text-grid"
```

## Testing Checklist

- [ ] Partners display in correct category order
- [ ] Partners display in correct order within categories
- [ ] Icons appear for configured categories
- [ ] Full-bar layout centers text properly
- [ ] Text grid shows 4 columns on desktop
- [ ] Logo grid shows partner logos
- [ ] Clickable partners link to websites (new tab)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus indicators visible
- [ ] High-contrast mode works
- [ ] Responsive layouts work on mobile
- [ ] Hidden partners don't appear
- [ ] Empty categories are hidden

---

**Last Updated:** October 28, 2026  
**Component:** `components/shared/partners-display.tsx`  
**Styles:** `components/shared/partners-display.module.css`
