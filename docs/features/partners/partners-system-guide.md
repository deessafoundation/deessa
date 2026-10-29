# Universal Partners System - Admin Guide

## Overview

The universal partners system allows you to link partners/sponsors/collaborators to any context (events, homepage, programs, etc.) with fully configurable categories and dual-level ordering.

## Key Features

- ✅ **Universal**: Works anywhere (events, homepage, programs, about, etc.)
- ✅ **Configurable Categories**: Each context can have its own category structure
- ✅ **Dual-Level Ordering**: Order categories AND partners within each category
- ✅ **Visibility Control**: Show/hide partners without deleting them
- ✅ **Logo Upload**: 2MB storage bucket for partner logos
- ✅ **Responsive**: Automatically adapts to mobile/tablet/desktop
- ✅ **Accessible**: High-contrast mode support, keyboard navigation, screen readers

## Quick Start

### 1. For Events

1. Go to **Admin → Events → [Select Event] → Partners** tab
2. **Configure Categories** tab:
   - Click "Copy Defaults" to create the standard 5-category structure, OR
   - Click "Add Category" to create custom categories
3. **Manage Partners** tab:
   - Select a partner from the dropdown
   - Choose which category to add them to
   - Click "Add Partner"
   - Use ↑↓ buttons to reorder partners
   - Use the category dropdown to move partners between categories
   - Toggle "Visible/Hidden" to control visibility

### 2. For Homepage

Coming soon - will follow the same pattern as events.

## Default Categories

The system includes 5 default categories:

1. **Organizing Partners** - Main organizing institutions
2. **In Collaboration With** - Collaborative partner organizations  
3. **Knowledge Partners** - Academic/research institutions
4. **Technical Partners** - Technology/platform providers
5. **Co-organizers** - Equal-level organizing partners

You can customize these names, add more, or remove categories as needed.

## Database Structure

### Tables

- `partners` - Master partner directory (existing table, updated)
- `partner_categories` - Category definitions per context
- `context_partners` - Links partners to contexts with category assignment

### Key Fields

**partner_categories:**
- `context_type` - 'event', 'homepage', 'program', etc.
- `context_id` - Specific ID (e.g., event ID) or NULL for global
- `category_key` - Programmatic key (e.g., 'organizers')
- `category_label` - Display name (e.g., 'Organizing Partners')
- `display_order` - Category ordering (0, 1, 2...)

**context_partners:**
- `context_type` + `context_id` - Which context this link is for
- `partner_id` - Which partner
- `category_key` - Which category
- `display_order` - Partner order within category
- `is_visible` - Show/hide control

## Display on Public Pages

### Usage Example

```tsx
import { PartnersSection } from "@/components/shared/partners-section"

// In your page component
<PartnersSection
  contextType="event"
  contextId={eventId}
  title="Event Partners"
  subtitle="Organizations supporting this event"
  columns={4}
  variant="grid"
  size="md"
/>
```

### Props

- `contextType` - 'event' | 'homepage' | 'program' | 'about' | 'story' | 'project'
- `contextId` - Context ID or null for global contexts
- `title` - Section heading (optional)
- `subtitle` - Section description (optional)
- `variant` - 'grid' | 'inline' (default: 'grid')
- `size` - 'sm' | 'md' | 'lg' (default: 'md')
- `columns` - 2 | 3 | 4 | 5 | 6 (default: 4, auto-responsive)
- `showCategoryLabels` - boolean (default: true)
- `showDescriptions` - boolean (default: false)

## Advanced Features

### Logo Upload

Partners can have logos stored in two ways:
1. **Legacy URL** - `partners.logo` field (existing)
2. **Storage Bucket** - `partners.logo_storage_path` (new, preferred)

The system automatically prefers storage bucket logos and falls back to URL logos.

### Ordering

**Category Ordering:**
- Use ↑↓ buttons in the Categories tab
- Changes the order categories appear on the public page

**Partner Ordering:**
- Use ↑↓ buttons next to each partner
- Only affects order within that specific category
- Independent per category

### Visibility

Partners can be hidden without deletion:
- Click "Visible" → "Hidden" button
- Partner stays in the system but doesn't show publicly
- Useful for temporary sponsors or seasonal partnerships

### Copy Between Contexts

Coming soon: Ability to copy category structure and partners from one event to another.

## Troubleshooting

### "No categories yet"
- Click "Configure Categories" tab
- Click "Copy Defaults" button OR manually add categories

### Partners not showing on public page
- Check `is_visible` is true in admin
- For events, check event status is 'published'
- Verify categories exist for that context
- Check browser console for errors

### Logo not displaying
- Ensure logo was uploaded successfully
- Check file size is under 2MB
- Verify file type is JPEG, PNG, WebP, or SVG
- Check storage bucket permissions (should be automatic)

## Migration Files

The system was created with 3 migration files:

1. `070-universal-partners-system.sql` - Core tables and structure
2. `071-seed-default-categories.sql` - Homepage default categories
3. `072-partner-logos-storage.sql` - Storage bucket for logos

## API/Actions Reference

All server actions are in `lib/actions/context-partners.ts`:

- `createPartner()` - Create new partner in master directory
- `updatePartner()` - Update partner details
- `deletePartner()` - Delete partner (cascades to all contexts)
- `uploadPartnerLogo()` - Upload logo to storage
- `createPartnerCategory()` - Create category for a context
- `updatePartnerCategory()` - Update category label/order
- `deletePartnerCategory()` - Delete category (removes all partners in it)
- `reorderCategories()` - Batch reorder categories
- `createContextPartner()` - Link partner to context
- `updateContextPartner()` - Update link (category, order, visibility)
- `deleteContextPartner()` - Remove partner from context
- `bulkCreateContextPartners()` - Link multiple partners at once
- `reorderPartners()` - Batch reorder partners within category

## Future Enhancements

- [ ] Bulk import partners from CSV
- [ ] Copy category structure between events
- [ ] Partner analytics (impressions, clicks)
- [ ] Partner portal (self-service logo updates)
- [ ] Multi-language support for category labels
- [ ] Export partner list to PDF/Excel
- [ ] Partner tier system with benefits
- [ ] Automatic logo optimization/resizing

## Support

For issues or questions, contact the development team or check:
- Database migrations: `scripts/db/migrations/070-*.sql`
- Types: `lib/types/partners.ts`
- Actions: `lib/actions/context-partners.ts`
- Data layer: `lib/data/context-partners.ts`
- Components: `components/shared/partner*.tsx`
