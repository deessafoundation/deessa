# 🚀 Quick Integration Guide - Adding More CMS Sections

## Pattern for Integrating Existing CMS Loaders

Follow this 3-step pattern to integrate any section that already has a CMS loader:

---

## Step 1: Update Component to Accept Props

### Before (Hard-coded):
```typescript
export function MySection() {
  const data = [
    { id: 1, title: "Item 1" },
    { id: 2, title: "Item 2" },
  ]
  
  return <section>...</section>
}
```

### After (CMS-powered):
```typescript
import type { MyDataType } from "@/lib/types/homepage-settings"

interface MySectionProps {
  data?: MyDataType[]
}

export function MySection({ data }: MySectionProps) {
  // Fallback to defaults if not provided
  const defaultData = [
    { id: 1, title: "Item 1" },
    { id: 2, title: "Item 2" },
  ]
  
  const displayData = data || defaultData
  
  return <section>...</section>
}
```

**Key Points:**
- ✅ Import type from `@/lib/types/homepage-settings`
- ✅ Make prop optional with `?`
- ✅ Keep default data as fallback
- ✅ Use `displayData = data || defaultData` pattern

---

## Step 2: Fetch CMS Data in Page

### In `app/(public)/page.tsx`:

```typescript
import { getMyCMSData } from "@/lib/data/homepage-settings"

export default async function HomePage() {
  // Fetch CMS data
  const myData = await getMyCMSData()
  
  return (
    <SecretKeyListener>
      {/* Pass CMS data as props */}
      <MySection data={myData.items} />
    </SecretKeyListener>
  )
}
```

**Key Points:**
- ✅ Import loader from `@/lib/data/homepage-settings`
- ✅ Make component `async`
- ✅ Await the loader function
- ✅ Pass data as props

---

## Step 3: Test & Verify

### Checklist:
- [ ] Component displays correctly with CMS data
- [ ] Component displays correctly with fallback data (if CMS unavailable)
- [ ] No TypeScript errors
- [ ] Admin UI can edit the data
- [ ] Changes in admin reflect on homepage
- [ ] No breaking changes to existing functionality

---

## 🎯 Ready-to-Integrate Sections

These sections already have CMS loaders and admin UI - just need integration:

### 1. Hero Carousel
**Loader:** `getHomeHeroSettings()` (in `lib/data/site-settings.ts`)  
**Admin UI:** ✅ HeroManager  
**Component:** `components/hero-carousel.tsx`

**Integration:**
```typescript
// In page.tsx
import { getHomeHeroSettings } from "@/lib/data/site-settings"

const heroSettings = await getHomeHeroSettings()

// Pass to component
<HeroCarousel settings={heroSettings} />
```

---

### 2. Programs Section
**Loader:** `getHomepagePrograms()` (in `lib/data/homepage-settings.ts`)  
**Admin UI:** ✅ ProgramsManager  
**Component:** `components/homepage-sections.tsx` → `ProgramsSection`

**Integration:**
```typescript
// In page.tsx
import { getHomepagePrograms } from "@/lib/data/homepage-settings"

const programsSettings = await getHomepagePrograms()

// Update component
interface ProgramsSectionProps {
  programs?: HomepageProgram[]
}

export function ProgramsSection({ programs }: ProgramsSectionProps) {
  const defaultPrograms = [...]
  const displayPrograms = programs || defaultPrograms
  // ... rest of component
}

// In page.tsx
<ProgramsSection programs={programsSettings.programs} />
```

---

### 3. Partners Section
**Loader:** `getHomepageMarqueeSettings()` (in `lib/data/homepage-settings.ts`)  
**Admin UI:** ✅ MarqueeManager  
**Component:** `components/homepage-sections.tsx` → `PartnersSection`

**Integration:**
```typescript
// In page.tsx
import { getHomepageMarqueeSettings } from "@/lib/data/homepage-settings"

const marqueeSettings = await getHomepageMarqueeSettings()

// Update component
interface PartnersSectionProps {
  settings?: HomepageMarqueeSettings
}

export function PartnersSection({ settings }: PartnersSectionProps) {
  const defaultSettings = { enabled: true, speed: 50, ... }
  const displaySettings = settings || defaultSettings
  // ... rest of component
}

// In page.tsx
<PartnersSection settings={marqueeSettings} />
```

---

## 🔧 Common Patterns

### Pattern 1: Array Data (Stats, Programs, CTAs)
```typescript
interface Props {
  items?: ItemType[]
}

export function Component({ items }: Props) {
  const defaultItems = [...]
  const displayItems = items || defaultItems
  
  return (
    <div>
      {displayItems.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  )
}
```

### Pattern 2: Settings Object (Marquee, Flags, SEO)
```typescript
interface Props {
  settings?: SettingsType
}

export function Component({ settings }: Props) {
  const defaultSettings = { enabled: true, ... }
  const displaySettings = settings || defaultSettings
  
  return (
    <div>
      {displaySettings.enabled && <Content />}
    </div>
  )
}
```

### Pattern 3: Nested Data (Hero with Images)
```typescript
interface Props {
  hero?: HeroSettings
}

export function Component({ hero }: Props) {
  const defaultHero = {
    title: "Default",
    images: [...]
  }
  const displayHero = hero || defaultHero
  
  return (
    <div>
      <h1>{displayHero.title}</h1>
      {displayHero.images.map(img => (
        <img key={img.id} src={img.src} />
      ))}
    </div>
  )
}
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Don't: Remove fallback data
```typescript
// BAD - breaks if CMS unavailable
export function Component({ data }: Props) {
  return <div>{data.map(...)}</div> // Error if data is undefined!
}
```

### ✅ Do: Always provide fallback
```typescript
// GOOD - works even if CMS unavailable
export function Component({ data }: Props) {
  const displayData = data || defaultData
  return <div>{displayData.map(...)}</div>
}
```

---

### ❌ Don't: Make props required
```typescript
// BAD - forces all callers to provide data
interface Props {
  data: DataType[] // Required!
}
```

### ✅ Do: Make props optional
```typescript
// GOOD - allows gradual migration
interface Props {
  data?: DataType[] // Optional
}
```

---

### ❌ Don't: Forget to import types
```typescript
// BAD - no type safety
interface Props {
  data?: any[]
}
```

### ✅ Do: Import proper types
```typescript
// GOOD - full type safety
import type { HomepageStat } from "@/lib/types/homepage-settings"

interface Props {
  data?: HomepageStat[]
}
```

---

## 🎯 Integration Priority

### High Priority (Do First):
1. ✅ **Impact Stats Bar** - DONE
2. ⬜ **Hero Carousel** - Loader exists, just needs integration
3. ⬜ **Programs Section** - Loader exists, just needs integration

### Medium Priority (Do Next):
4. ⬜ **Partners Section** - Loader exists, needs partner data in DB
5. ⬜ **Hero CTAs** - Loader exists, needs integration
6. ⬜ **CTA Cards** - Loader exists, needs integration

### Low Priority (Future):
7. ⬜ **Testimonials** - Needs new loader + admin UI
8. ⬜ **Timeline** - Needs new loader + admin UI
9. ⬜ **Banners** - Loader exists, needs integration

---

## 📚 Reference Files

- **Types:** `lib/types/homepage-settings.ts`
- **Loaders:** `lib/data/homepage-settings.ts`
- **Admin UI:** `app/admin/homepage-manager/`
- **Components:** `components/homepage-sections.tsx`
- **Homepage:** `app/(public)/page.tsx`

---

## 🎉 Success Checklist

After integrating a section, verify:

- [ ] ✅ Component accepts optional props
- [ ] ✅ Fallback data is provided
- [ ] ✅ CMS data is fetched in page.tsx
- [ ] ✅ Props are passed to component
- [ ] ✅ No TypeScript errors
- [ ] ✅ Admin UI can edit the data
- [ ] ✅ Changes reflect on homepage
- [ ] ✅ Site works if CMS unavailable
- [ ] ✅ No breaking changes

---

**Last Updated:** [Current Date]
**Pattern Established By:** Kiro AI Assistant
