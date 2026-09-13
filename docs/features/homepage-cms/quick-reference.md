---
title: "Homepage CMS - Quick Reference Guide"
description: "Documentation for homepage cms - quick reference guide"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Homepage CMS - Quick Reference Guide

## ðŸš€ Quick Start

### Access Admin Panel
```
URL: /admin/homepage
```

**Note**: The old `/admin/homepage-manager` path has been removed. All functionality is now at `/admin/homepage`.

### 14 Available Managers
1. **Carousel** - Hero carousel slides
2. **Hero** - Impact page hero section
3. **Stats** - Homepage statistics bar
4. **Programs** - Program showcase blocks
5. **Hero CTAs** - Hero call-to-action buttons
6. **CTA Cards** - Get Involved cards
7. **Banners** - Brush stroke quotes
8. **Marquee** - Partner logos settings
9. **Trust** - Trust indicators
10. **Stories** - Featured stories rules
11. **Testimonials** - User testimonials
12. **Timeline** - Organization milestones
13. **SEO** - Meta tags and OG image
14. **Flags** - Feature toggles

---

## ðŸ“‹ Database Keys

| Manager | Database Key | Type |
|---------|-------------|------|
| Hero Carousel | `homepage_hero_carousel` | JSON |
| Hero (Impact) | `home_hero_settings` | JSON |
| Stats | `homepage_stats` | JSON |
| Programs | `homepage_programs` | JSON |
| Hero CTAs | `homepage_hero_ctas` | JSON |
| CTA Cards | `homepage_cta_cards` | JSON |
| Banners | `homepage_banners` | JSON |
| Marquee | `homepage_marquee_settings` | JSON |
| Trust | `homepage_trust_indicators` | JSON |
| Stories | `homepage_featured_stories_rules` | JSON |
| Testimonials | `homepage_testimonials` | JSON |
| Timeline | `homepage_timeline` | JSON |
| SEO | `homepage_seo` | JSON |
| Flags | `homepage_flags` | JSON |

---

## ðŸ”§ Data Loaders

```typescript
// Import from lib/data/homepage-settings.ts
import {
  getHomepageHeroCarousel,
  getHomepageStats,
  getHomepagePrograms,
  getHomepageHeroCTAs,
  getHomepageCTACards,
  getHomepageBanners,
  getHomepageMarqueeSettings,
  getHomepageSEO,
  getHomepageFlags,
  getHomepageTrustIndicators,
  getHomepageFeaturedStoriesRules,
  getHomepageTestimonials,
  getHomepageTimeline,
  getAllHomepageSettings, // Get all at once
} from '@/lib/data/homepage-settings'
```

---

## ðŸŽ¨ Frontend Integration

### Homepage Sections Using CMS

```typescript
// app/(public)/page.tsx

// 1. Hero Carousel
<HeroCarousel slides={heroSlides} interval={heroCarouselSettings.interval} />

// 2. Stats Bar
<ImpactStatsBar stats={statsSettings.stats} />

// 3. Programs (not yet integrated - still hard-coded)
<ProgramsSection programs={programsSettings.programs} />

// 4. Timeline
<TimelineSection timeline={timelineSettings} />

// 5. Testimonials
<TestimonialsSection testimonials={testimonialsSettings} />

// 6. Partners Marquee
<PartnersSection settings={marqueeSettings} />
```

---

## ðŸ“ Common Tasks

### Add New Testimonial
1. Go to `/admin/homepage`
2. Click **Testimonials** tab
3. Click **Add Testimonial**
4. Fill in: name, role, location, image URL, quote, rating
5. Set order and visibility
6. Click **Save Changes**

### Reorder Timeline Milestones
1. Go to `/admin/homepage`
2. Click **Timeline** tab
3. Drag milestones to reorder
4. Click **Save Changes**

### Update Hero Carousel
1. Go to `/admin/homepage`
2. Click **Carousel** tab
3. Edit existing slides or add new ones
4. Set interval and autoplay
5. Click **Save Changes**

### Change Marquee Speed
1. Go to `/admin/homepage`
2. Click **Marquee** tab
3. Adjust speed slider (1-100)
4. Toggle pause on hover
5. Click **Save Changes**

---

## ðŸ” SQL Queries

### View All Homepage Settings
```sql
SELECT key, description, category 
FROM site_settings 
WHERE category = 'homepage' 
ORDER BY key;
```

### Get Specific Setting
```sql
SELECT value 
FROM site_settings 
WHERE key = 'homepage_stats';
```

### Update Setting Manually
```sql
UPDATE site_settings 
SET value = '{"stats": [...]}', updated_at = NOW() 
WHERE key = 'homepage_stats';
```

### Delete Setting (Rollback)
```sql
DELETE FROM site_settings 
WHERE key = 'homepage_hero_carousel';
```

---

## ðŸ› Troubleshooting

### Admin UI Not Loading
1. Check user has admin role
2. Verify database connection
3. Check browser console for errors
4. Clear browser cache

### Changes Not Appearing on Frontend
1. Verify you clicked "Save Changes"
2. Check for success toast notification
3. Hard refresh homepage (Ctrl+Shift+R)
4. Check database: `SELECT value FROM site_settings WHERE key = 'homepage_stats'`

### TypeScript Errors in IDE
1. Restart TypeScript server: `Ctrl+Shift+P` â†’ "Restart TS Server"
2. Rebuild: `npm run build`
3. Check imports are correct

### Fallback Data Showing Instead of CMS
1. Verify database has the key
2. Check data loader is being called
3. Verify JSON structure matches type definition
4. Check browser console for fetch errors

---

## ðŸ“Š Type Definitions

All types are in `lib/types/homepage-settings.ts`:

```typescript
// Example: Stats
interface HomepageStat {
  value: number
  suffix?: string
  label: string
  sublabel?: string
  order: number
  highlight?: boolean
  icon?: string
}

interface HomepageStatsSettings {
  stats: HomepageStat[]
}
```

---

## ðŸŽ¯ Best Practices

### Content Guidelines
- **Images**: Use high-quality images (min 1920x1080 for hero)
- **Text**: Keep headlines under 60 characters
- **Stats**: Use meaningful numbers with context
- **Order**: Lower numbers appear first (1, 2, 3...)
- **Visibility**: Hide items instead of deleting (preserves data)

### Performance
- Optimize images before uploading
- Use CDN URLs when possible
- Keep JSON payloads small
- Limit number of visible items (3-6 recommended)

### Maintenance
- Review content quarterly
- Update stats annually
- Archive old testimonials
- Keep timeline current

---

## ðŸ” Security

### Admin Access
- Only users with `role = 'admin'` can access `/admin/homepage-manager`
- Activity logging tracks all changes
- Changes are atomic (all-or-nothing saves)

### Data Validation
- All inputs are validated client-side
- Server validates JSON structure
- SQL injection protected (parameterized queries)
- XSS protection via React escaping

---

## ðŸ“ž Quick Links

- **Admin Panel**: `/admin/homepage`
- **Homepage**: `/`
- **Impact Page**: `/impact`
- **Type Definitions**: `lib/types/homepage-settings.ts`
- **Data Loaders**: `lib/data/homepage-settings.ts`
- **Components**: `components/homepage-sections.tsx`
- **Manager Components**: `components/admin/homepage-manager/`
- **API Route**: `app/api/admin/homepage-settings/route.ts`

---

## ðŸŽ“ Training Checklist

For new admins:
- [ ] Access admin panel
- [ ] Navigate all 14 tabs
- [ ] Edit a stat (Stats tab)
- [ ] Reorder items (drag-and-drop)
- [ ] Add a new testimonial
- [ ] Save changes
- [ ] Preview on homepage
- [ ] Understand fallback system

---

**Last Updated**: May 31, 2026  
**Version**: 1.0.0
