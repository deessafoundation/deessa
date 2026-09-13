---
title: "Homepage CMS Migration Guide"
description: "This document tracks the migration of hard-coded homepage content into a CMS-managed system. The migration is designe..."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Homepage CMS Migration Guide

## ðŸ“‹ Overview

This document tracks the migration of hard-coded homepage content into a CMS-managed system. The migration is designed to be **safe, incremental, and reversible** with zero downtime.

## âœ… Phase 1: Database Schema & Types (COMPLETED)

### What Was Created

1. **Database Migration** (`scripts/037-homepage-cms-schema.sql`)
   - Added 8 new keys to `site_settings` table
   - Populated with current hard-coded values as defaults
   - Created helper functions for data access
   - **Status**: âœ… Ready to run (safe, no breaking changes)

2. **TypeScript Types** (`lib/types/homepage-settings.ts`)
   - Complete type definitions for all homepage content
   - Default values and constants
   - **Status**: âœ… Complete

3. **Data Loaders** (`lib/data/homepage-settings.ts`)
   - Server-side functions to fetch CMS content
   - Built-in fallbacks to prevent site breakage
   - Follows existing patterns from `site-settings.ts`
   - **Status**: âœ… Complete

### New CMS Keys Added

| Key | Purpose | Current Location |
|-----|---------|------------------|
| `homepage_stats` | Stats section (8 stats) | `ImpactClientPage.tsx` (stats1, stats2) |
| `homepage_programs` | Program blocks (3 programs) | `ImpactClientPage.tsx` (programs array) |
| `homepage_hero_ctas` | Hero CTA buttons | Hard-coded in hero component |
| `homepage_cta_cards` | Get Involved cards | Hard-coded in sections |
| `homepage_banners` | Brush stroke quotes | Hard-coded in components |
| `homepage_marquee_settings` | Partner logo marquee | Hard-coded settings |
| `homepage_seo` | SEO metadata | Hard-coded in layout |
| `homepage_flags` | Feature toggles | Hard-coded booleans |

### How to Run Phase 1

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d your-database -f scripts/037-homepage-cms-schema.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `scripts/037-homepage-cms-schema.sql`
3. Click "Run"

**This is 100% safe** - it only adds new data, doesn't modify existing code.

---

## ðŸ”„ Phase 2: Code Migration (NEXT STEP)

### What Needs to Change

Replace hard-coded arrays with CMS loader calls. This is done **one component at a time** with fallbacks.

#### 2.1 Migrate Stats Section

**File**: `app/(public)/impact/ImpactClientPage.tsx`

**Current Code** (lines ~616):
```typescript
const stats1 = [
  { value: 10000, suffix: "+", label: "Lives Impacted", sublabel: "Across Nepal" },
  // ... more stats
]
const stats2 = [
  { value: 120, suffix: "+", label: "Villages Served", sublabel: "Rural Nepal" },
  // ... more stats
]
```

**New Code**:
```typescript
import { getHomepageStats } from "@/lib/data/homepage-settings"

// In component or page:
const { stats } = await getHomepageStats()
const stats1 = stats.slice(0, 4)
const stats2 = stats.slice(4, 8)
```

#### 2.2 Migrate Programs Section

**File**: `app/(public)/impact/ImpactClientPage.tsx`

**Current Code**:
```typescript
const programs = [
  {
    badge: "ðŸ“š Education",
    headline: "Building Classrooms, Building Futures",
    // ... more fields
  },
  // ... more programs
]
```

**New Code**:
```typescript
import { getHomepagePrograms } from "@/lib/data/homepage-settings"

const { programs } = await getHomepagePrograms()
```

#### 2.3 Migrate Partners List

**File**: `components/homepage-sections.tsx`

**Action**: Replace hard-coded partners array with database query from existing `partners` table.

### Migration Checklist

- [ ] Backup current `ImpactClientPage.tsx`
- [ ] Migrate stats section
- [ ] Test stats display
- [ ] Migrate programs section
- [ ] Test programs display
- [ ] Migrate partners section
- [ ] Test partners display
- [ ] Run full page test
- [ ] Deploy to staging
- [ ] Verify no regressions

---

## ðŸŽ¨ Phase 3: Admin UI (FUTURE)

### Admin Interface Requirements

Create `/admin/homepage-manager` page with sections:

1. **Hero Section**
   - Edit title, subtitle, badge
   - Manage CTA buttons
   - Upload hero images

2. **Stats Manager**
   - Add/edit/remove stats
   - Reorder stats
   - Toggle highlight

3. **Programs Manager**
   - Edit program blocks
   - Upload images
   - Reorder programs

4. **CTA Cards Manager**
   - Edit card content
   - Change colors/icons
   - Toggle visibility

5. **Banners Manager**
   - Edit brush stroke quotes
   - Change colors
   - Toggle animations

6. **Settings**
   - Marquee settings
   - Feature flags
   - SEO metadata

### Admin UI Components Needed

- Form with rich text editor
- Image uploader
- Drag-and-drop reordering
- Color picker
- Preview panel
- Save/publish workflow

---

## ðŸ”’ Safety Features

### Built-in Fallbacks

Every loader function includes:
1. **Try-catch blocks** - Catches database errors
2. **Default values** - Returns hard-coded defaults if DB fails
3. **Merge strategy** - Ensures all required fields exist
4. **Console logging** - Logs errors for debugging

### Rollback Plan

If anything goes wrong:

1. **Immediate**: Site continues working with fallback values
2. **Quick fix**: Revert code changes (git revert)
3. **Database**: Delete new keys from `site_settings` table

```sql
-- Emergency rollback (if needed)
DELETE FROM site_settings WHERE key LIKE 'homepage_%';
```

---

## ðŸ“Š Current vs Future State

### Before (Current)

```
Homepage Component
    â†“
Hard-coded arrays in code
    â†“
Requires developer + deployment to change
```

### After (Target)

```
Homepage Component
    â†“
CMS Loader Functions (with fallbacks)
    â†“
Database (site_settings table)
    â†“
Admin UI (editors can update)
```

---

## ðŸ§ª Testing Strategy

### Unit Tests
- Test each loader function
- Test fallback behavior
- Test data merging

### Integration Tests
- Test full page render
- Test with missing DB data
- Test with partial DB data

### Manual Tests
- Visual regression testing
- Cross-browser testing
- Mobile responsiveness
- Performance testing

---

## ðŸ“ Notes

### Why This Approach?

1. **Safe**: No breaking changes, everything has fallbacks
2. **Incremental**: Migrate one section at a time
3. **Reversible**: Easy to roll back if needed
4. **Testable**: Each phase can be tested independently
5. **Maintainable**: Clear separation of concerns

### What's NOT Changing

- Layout structure (stays in code)
- Styling and design tokens (stays in code)
- Animation implementations (stays in code)
- Component logic (stays in code)

Only **content** moves to CMS, not **code**.

---

## ðŸš€ Next Actions

1. **Run Phase 1 migration** (SQL script)
2. **Verify data in Supabase** (check site_settings table)
3. **Start Phase 2** (migrate one component)
4. **Test thoroughly**
5. **Deploy to staging**
6. **Plan Phase 3** (admin UI design)

---

## ðŸ“ž Questions?

- Check existing `site-settings.ts` for similar patterns
- Review `getHomeHeroSettings()` function as reference
- All loaders follow the same safe pattern

---

**Last Updated**: Phase 1 Complete
**Status**: âœ… Ready for Phase 2
**Risk Level**: ðŸŸ¢ Low (all changes are additive with fallbacks)
