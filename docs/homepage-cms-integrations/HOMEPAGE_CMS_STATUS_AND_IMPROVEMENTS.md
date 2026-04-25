# Homepage CMS - Current Status & Improvement Plan

## 📊 Current Implementation Status

### ✅ What's Complete (Phase 1-3)

#### 1. **Database Schema** ✓
- SQL migration created: `scripts/037-homepage-cms-schema.sql`
- 11 CMS keys defined in `site_settings` table
- All keys have proper JSON structure

#### 2. **TypeScript Types** ✓
- Complete type definitions in `lib/types/homepage-settings.ts`
- 10 major type interfaces with full field definitions
- Default fallback values defined

#### 3. **Data Loaders** ✓
- 10 individual loader functions in `lib/data/homepage-settings.ts`
- 1 combined loader: `getAllHomepageSettings()`
- Triple-layer fallback system (DB → loader defaults → component fallbacks)
- All loaders include try-catch error handling

#### 4. **Admin UI** ✓
- Complete admin interface at `/admin/homepage-manager`
- 11 fully functional manager components:
  1. **HeroManager** - Hero text & images
  2. **StatsManager** - Stats with drag-and-drop
  3. **ProgramsManager** - Program blocks
  4. **HeroCTAsManager** - Hero CTA buttons
  5. **CTACardsManager** - Get Involved cards
  6. **BannersManager** - Brush stroke banners
  7. **MarqueeManager** - Partner marquee settings
  8. **TrustIndicatorsManager** - Trust badges
  9. **FeaturedStoriesManager** - Story selection rules
  10. **SEOManager** - SEO metadata
  11. **FlagsManager** - Feature toggles
- Save/Reset/Preview functionality
- Activity logging
- Authentication & role checking

#### 5. **Frontend Integration** ✓ (Partial)
- **Impact Page** (`/impact`) - ✅ FULLY INTEGRATED
  - Uses `getHomepageStats()` and `getHomepagePrograms()`
  - Props passed to `ImpactClientPage.tsx`
  - Fallbacks in place

---

## ⚠️ What's NOT Yet Integrated

### Homepage (`app/(public)/page.tsx`) - Still Using Hard-Coded Data

The main homepage at `/` is **NOT** using CMS data yet. Here's what's still hard-coded:

#### 1. **Hero Carousel** - Hard-coded
```typescript
const heroSlides: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/...",
    title: "Hope for Every Child in Nepal",
    subtitle: "A society where everyone is understood...",
    cta: "Start Donating",
    ctaHref: "/donate",
  },
  // ... 3 more slides
]
```
**CMS Available:** `getHomeHeroSettings()` exists but not used on homepage

#### 2. **ImpactStatsBar** - Hard-coded in `homepage-sections.tsx`
```typescript
const stats = [
  { value: 10000, suffix: "+", label: "Children Supported" },
  { value: 50, suffix: "+", label: "Schools Built" },
  { value: 25, suffix: "+", label: "Districts Reached" },
  { value: 500, suffix: "+", label: "Trained Teachers" },
]
```
**CMS Available:** `getHomepageStats()` exists but not used

#### 3. **ProgramsSection** - Hard-coded in `homepage-sections.tsx`
```typescript
const corePillars = [
  {
    icon: GraduationCap,
    title: "Education",
    description: "Building schools, training teachers...",
    stat: "50+",
    statLabel: "Schools",
  },
  // ... 3 more pillars
]
```
**CMS Available:** `getHomepagePrograms()` exists but not used

#### 4. **PartnersSection** - Hard-coded logos
- Partner logos are SVG components in `homepage-sections.tsx`
- No database integration yet
**CMS Available:** `getHomepageMarqueeSettings()` exists but partners need DB table

#### 5. **TestimonialsSection** - Hard-coded
```typescript
const testimonials = [
  {
    name: "Sita Sharma",
    role: "Parent, Kathmandu",
    quote: "Deessa Foundation changed my daughter's life...",
  },
  // ... 2 more testimonials
]
```
**CMS Available:** No CMS loader exists yet (needs to be added)

#### 6. **TimelineSection** - Hard-coded
```typescript
const milestones = [
  {
    year: "2015",
    milestone: "Founded in Kathmandu",
    description: "Deesha Foundation began...",
  },
  // ... 5 more milestones
]
```
**CMS Available:** No CMS loader exists yet (needs to be added)

---

## 🎯 Improvement Plan

### Phase 4: Complete Homepage Integration

#### Step 1: Integrate Existing CMS Data into Homepage
**Files to modify:**
- `app/(public)/page.tsx` - Make it async, fetch CMS data
- `components/homepage-sections.tsx` - Convert to accept props

**Changes needed:**

1. **ImpactStatsBar** - Use `getHomepageStats()`
   ```typescript
   // In page.tsx
   const statsSettings = await getHomepageStats()
   
   // Pass to component
   <ImpactStatsBar stats={statsSettings.stats} />
   ```

2. **ProgramsSection** - Use `getHomepagePrograms()`
   ```typescript
   const programsSettings = await getHomepagePrograms()
   <ProgramsSection programs={programsSettings.programs} />
   ```

3. **Hero Carousel** - Use `getHomeHeroSettings()`
   ```typescript
   const heroSettings = await getHomeHeroSettings()
   <HeroCarousel slides={heroSettings} />
   ```

#### Step 2: Add Missing CMS Features

**A. Testimonials CMS**
1. Create `homepage_testimonials` key in database
2. Add types to `lib/types/homepage-settings.ts`
3. Add loader `getHomepageTestimonials()` to `lib/data/homepage-settings.ts`
4. Create `TestimonialsManager.tsx` component
5. Add to admin UI

**B. Timeline CMS**
1. Create `homepage_timeline` key in database
2. Add types for timeline milestones
3. Add loader `getHomepageTimeline()`
4. Create `TimelineManager.tsx` component
5. Add to admin UI

**C. Partners Database Integration**
1. Use existing `partners` table (if exists) or create new one
2. Add loader `getHomepagePartners()`
3. Create `PartnersManager.tsx` component
4. Replace SVG logos with database-driven images

#### Step 3: Refactor Components for CMS

**Convert these sections from client components to server-fetched:**

```typescript
// OLD: homepage-sections.tsx (client component with hard-coded data)
export function ImpactStatsBar() {
  const stats = [/* hard-coded */]
  return <section>...</section>
}

// NEW: homepage-sections.tsx (accepts props)
interface ImpactStatsBarProps {
  stats: HomepageStat[]
}

export function ImpactStatsBar({ stats }: ImpactStatsBarProps) {
  return <section>...</section>
}
```

---

## 🔧 Technical Improvements

### 1. **Consolidate Duplicate Code**
- `ImpactClientPage.tsx` has its own stats/programs arrays
- `homepage-sections.tsx` has different stats/programs arrays
- **Solution:** Both should use the same CMS loaders

### 2. **Add Caching**
```typescript
// Add to data loaders
import { unstable_cache } from 'next/cache'

export const getHomepageStats = unstable_cache(
  async () => {
    // ... existing code
  },
  ['homepage-stats'],
  { revalidate: 3600 } // Cache for 1 hour
)
```

### 3. **Add Revalidation API**
Create `/api/revalidate/homepage` to clear cache when admin saves:
```typescript
// In admin save handler
await fetch('/api/revalidate/homepage', { method: 'POST' })
```

### 4. **Add Image Upload**
- Currently images are URLs
- Add image upload to admin UI
- Store in Supabase Storage
- Generate optimized URLs

### 5. **Add Preview Mode**
- Add "Preview" button in admin that shows changes before saving
- Use Next.js Draft Mode or query params

---

## 📋 Priority Action Items

### 🔴 High Priority (Do First)
1. ✅ **Integrate existing CMS into homepage** - Use `getHomepageStats()`, `getHomepagePrograms()`, `getHomeHeroSettings()`
2. ✅ **Refactor `homepage-sections.tsx`** - Convert to accept props instead of hard-coded data
3. ✅ **Update `app/(public)/page.tsx`** - Make async, fetch CMS data, pass as props

### 🟡 Medium Priority (Do Next)
4. ⬜ **Add Testimonials CMS** - Schema, types, loader, admin UI
5. ⬜ **Add Timeline CMS** - Schema, types, loader, admin UI
6. ⬜ **Add Partners Database** - Schema, types, loader, admin UI
7. ⬜ **Add caching** - Improve performance with `unstable_cache`

### 🟢 Low Priority (Nice to Have)
8. ⬜ **Add image upload** - Replace URL inputs with file uploads
9. ⬜ **Add preview mode** - Show changes before saving
10. ⬜ **Add revalidation API** - Clear cache on save
11. ⬜ **Add version history** - Track changes over time

---

## 🚀 Quick Start: Integrate Existing CMS (Steps 1-3)

### Step 1: Update `homepage-sections.tsx`

**Change these components to accept props:**

```typescript
// ImpactStatsBar
interface ImpactStatsBarProps {
  stats: HomepageStat[]
}
export function ImpactStatsBar({ stats }: ImpactStatsBarProps) {
  // Use stats prop instead of hard-coded array
}

// ProgramsSection
interface ProgramsSectionProps {
  programs: HomepageProgram[]
}
export function ProgramsSection({ programs }: ProgramsSectionProps) {
  // Use programs prop instead of hard-coded array
}
```

### Step 2: Update `app/(public)/page.tsx`

```typescript
import { getHomepageStats, getHomepagePrograms } from "@/lib/data/homepage-settings"
import { getHomeHeroSettings } from "@/lib/data/site-settings"

export default async function HomePage() {
  // Fetch CMS data
  const statsSettings = await getHomepageStats()
  const programsSettings = await getHomepagePrograms()
  const heroSettings = await getHomeHeroSettings()

  return (
    <SecretKeyListener>
      <HomeAccessibilityButton />
      
      {/* Pass CMS data as props */}
      <HeroCarousel slides={heroSettings} />
      <ImpactStatsBar stats={statsSettings.stats} />
      <OurStorySection />
      <MissionVisionSection />
      <ProgramsSection programs={programsSettings.programs} />
      <TimelineSection />
      <TestimonialsSection />
      <PartnersSection />
      <ContactSection />
      <GlobalEnhancements />
    </SecretKeyListener>
  )
}
```

### Step 3: Update `hero-carousel.tsx`

Make it accept `HomeHeroSettings` instead of `HeroSlide[]`

---

## 📊 Current vs Target State

| Component | Current State | Target State | Status |
|-----------|---------------|--------------|--------|
| Hero Carousel | Hard-coded slides | CMS-powered | ⬜ Not integrated |
| Impact Stats Bar | Hard-coded stats | CMS-powered | ⬜ Not integrated |
| Programs Section | Hard-coded programs | CMS-powered | ⬜ Not integrated |
| Testimonials | Hard-coded | CMS-powered | ⬜ No CMS exists |
| Timeline | Hard-coded | CMS-powered | ⬜ No CMS exists |
| Partners | Hard-coded SVGs | CMS-powered | ⬜ No CMS exists |
| Impact Page | ✅ CMS-powered | ✅ CMS-powered | ✅ Complete |
| Admin UI | ✅ Complete | ✅ Complete | ✅ Complete |

---

## 🎯 Success Criteria

### When is this complete?

1. ✅ All homepage sections use CMS data (no hard-coded arrays)
2. ✅ Admin can edit all homepage content without touching code
3. ✅ Changes in admin UI reflect immediately on homepage
4. ✅ Fallbacks work if database is unavailable
5. ✅ No TypeScript errors
6. ✅ No breaking changes to existing functionality

---

## 📝 Notes

- **Zero Breaking Changes:** All changes maintain backward compatibility
- **Triple Fallback System:** DB → Loader defaults → Component fallbacks
- **Production Ready:** Admin UI is fully functional and tested
- **Next Step:** Integrate existing CMS loaders into homepage components

---

**Last Updated:** Context Transfer Summary
**Status:** Phase 1-3 Complete, Phase 4 (Homepage Integration) Pending
