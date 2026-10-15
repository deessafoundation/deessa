# Partners System Architecture

## Overview

The universal partners system supports both **global partners** (available across all contexts) and **context-specific partners** (created within and owned by a specific event, page, or other context).

## Database Schema

### Tables

1. **`partners`** — Master directory of all partners
   - Stores partner details (name, logo, website, description)
   - Tracks context ownership via `created_context_type` and `created_context_id`
   - Global partners: `created_context_type IS NULL`
   - Event-specific: `created_context_type = 'event'`, `created_context_id = <event_id>`

2. **`partner_categories`** — Configurable categories per context
   - Each context (event, homepage, etc.) can define its own categories
   - Examples: "Organizing Partners", "Sponsors", "Media Partners"
   - Ordered by `display_order`

3. **`context_partners`** — Junction table linking partners to contexts
   - Links `partners` to specific contexts (events, homepage, etc.)
   - Assigns partners to categories
   - Controls visibility (`is_visible`)
   - Ordered within categories by `display_order`

### Context Ownership Rules

| Partner Type | `created_context_type` | `created_context_id` | Visibility |
|-------------|----------------------|---------------------|------------|
| **Global** | `NULL` | `NULL` | Available in all contexts |
| **Event-specific** | `'event'` | `<event_id>` | Only available in that specific event |
| **Homepage-specific** | `'homepage'` | `NULL` | Only available on homepage |

## Architecture Decisions

### ✅ Chosen: Single `partners` table with ownership tracking

**Rationale:**
- Maintains referential integrity (single source of truth)
- Prevents duplicate partner records
- Allows event-specific partners without separate table
- Future flexibility (can promote event partner to global if needed)

### ❌ Rejected: Separate `event_partners` table

**Why:**
- Would create data duplication
- Harder to maintain consistency
- No clear upgrade path for event→global promotion

### ❌ Rejected: Boolean `is_global` flag only

**Why:**
- Doesn't track *which* event owns a partner
- Can't distinguish between Event A's partner vs Event B's partner
- Makes "available partners" query ambiguous

## Data Flow

### Creating a Global Partner

```typescript
// From /admin/partners page
createPartner({
  name: "UNICEF",
  logo: "https://...",
  website: "https://unicef.org",
  created_context_type: null,      // ← Global
  created_context_id: null,
})
```

### Creating an Event-Specific Partner

```typescript
// From event settings → Partners tab → "Create New"
createPartner({
  name: "Local NGO",
  logo: "https://...",
  website: "https://local-ngo.org",
  created_context_type: "event",    // ← Event-specific
  created_context_id: eventId,
})
```

### Fetching Available Partners for an Event

```sql
-- Uses database function: get_available_partners_for_context()
SELECT * FROM partners
WHERE is_published = true
AND (
  created_context_type IS NULL              -- Global partners
  OR (
    created_context_type = 'event'          -- Event-specific partners
    AND created_context_id = <event_id>
  )
)
ORDER BY name ASC
```

### Linking a Partner to an Event

```typescript
// Available partners dropdown → "Add to Event"
createContextPartner({
  context_type: "event",
  context_id: eventId,
  partner_id: selectedPartnerId,
  category_key: "organizers",
  display_order: 0,
  is_visible: true,
})
```

## User Experience

### Event Settings → Partners Tab

**Two Buttons:**
1. **"Add from Available"** — Select from global partners OR partners created in this event
2. **"Create New"** — Inline form to create event-specific partner (NOT global)

**Behavior:**
- Partners created inline → `created_context_type = 'event'`
- Partners added from dropdown → Already exist (global or event-specific)
- Hidden partners → Stay visible in admin (grayed out), hidden from public

### /admin/partners Page (Global Directory)

**Behavior:**
- Only shows global partners (`created_context_type IS NULL`)
- Partners created here are available in all events/contexts
- Used for organization-wide partners (UNICEF, Red Cross, etc.)

## Migration Path

### Running the Migration

```bash
# 1. Add context ownership columns to partners table
psql -d <database> -f scripts/db/migrations/073-partner-context-ownership.sql

# OR via Supabase dashboard:
# Paste SQL from 073-partner-context-ownership.sql into SQL Editor
```

### Backward Compatibility

- ✅ All existing partners automatically become global (`created_context_type = NULL`)
- ✅ Existing `context_partners` links remain intact
- ✅ No data loss or breaking changes
- ✅ Legacy `logo` and `sort_order` fields preserved

## Validation Rules

### Unique Constraints

1. **One partner per context**
   ```sql
   -- A partner can only be linked once per event
   CREATE UNIQUE INDEX uq_partner_per_context_not_null
     ON context_partners(context_type, context_id, partner_id)
     WHERE context_id IS NOT NULL;
   ```

2. **One category key per context**
   ```sql
   -- Each category key must be unique within a context
   CREATE UNIQUE INDEX uq_partner_category_per_context_not_null
     ON partner_categories(context_type, context_id, category_key)
     WHERE context_id IS NOT NULL;
   ```

### Client-Side Checks

- **Duplicate partner:** Check if `linkedPartners.some((p) => p.partner_id === selectedPartner)`
- **Logo file size:** Max 2MB (JPG, PNG, WebP, SVG only)
- **Required fields:** Partner name, category assignment

## API Endpoints

### Event Partners

| Endpoint | Purpose | Returns |
|---------|---------|---------|
| `GET /api/admin/events/[id]/partners/categories` | Fetch event's categories | `PartnerCategory[]` |
| `GET /api/admin/events/[id]/partners/available` | Fetch available partners (global + event-specific) | `Partner[]` |
| `GET /api/admin/events/[id]/partners/linked` | Fetch partners linked to event (including hidden) | `ContextPartnerDetailed[]` |

### Key Implementation Detail

```typescript
// app/api/admin/events/[id]/partners/available/route.ts
const { data: partners } = await supabase.rpc(
  "get_available_partners_for_context",
  {
    p_context_type: "event",
    p_context_id: eventId,
  }
)
```

## Server Actions

### Partner CRUD

- `createPartner(input)` — Create global OR context-specific partner
- `updatePartner(id, input)` — Update partner details
- `deletePartner(id)` — Delete partner (cascades to context_partners)
- `uploadPartnerLogo(id, file)` — Upload logo to storage bucket

### Category CRUD

- `createPartnerCategory(input)` — Create category for context
- `updatePartnerCategory(id, input)` — Update category label/order
- `deletePartnerCategory(id)` — Delete category + unlink all partners
- `reorderCategories(input)` — Bulk reorder categories

### Context Links CRUD

- `createContextPartner(input)` — Link partner to context
- `updateContextPartner(id, input)` — Update category/visibility/order
- `deleteContextPartner(id)` — Unlink partner from context
- `reorderPartners(input)` — Bulk reorder partners within category

## Future Enhancements

### Potential Features

1. **Partner promotion:** Convert event-specific → global
2. **Partner templates:** Copy partner configurations between events
3. **Usage analytics:** Track which contexts use which partners
4. **Partner dashboard:** See all contexts where a partner appears
5. **Bulk operations:** Add multiple partners to multiple events at once

### Extension Points

- New context types: `'program'`, `'project'`, `'about'`, `'story'`
- Custom category configurations per context type
- Per-partner metadata (contact info, agreement dates, sponsorship tiers)
- Partner logo versioning (multiple logo variants per partner)

## Testing Checklist

- [ ] Create global partner from /admin/partners
- [ ] Create event-specific partner from event settings
- [ ] Verify event partner NOT visible in global directory
- [ ] Verify global partner IS available in all events
- [ ] Link existing global partner to event
- [ ] Upload logo to storage bucket
- [ ] Toggle partner visibility (grayed in admin, hidden in public)
- [ ] Reorder partners within category
- [ ] Reorder categories
- [ ] Delete partner (verify cascade to context_partners)
- [ ] Delete category (verify partners unlinked)

## References

- Database schema: `scripts/db/migrations/070-universal-partners-system.sql`
- Ownership migration: `scripts/db/migrations/073-partner-context-ownership.sql`
- TypeScript types: `lib/types/partners.ts`
- Server actions: `lib/actions/context-partners.ts`
- UI component: `components/admin/events/partners-editor.tsx`

---

**Last Updated:** October 28, 2026  
**Status:** ✅ Implemented and integrated
