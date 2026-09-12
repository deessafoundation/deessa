# SEO: Sitemap & Robots.txt Implementation Summary

## Implementation Overview

This document summarizes the dynamic sitemap and robots.txt implementation for the Deesha Foundation website, serving both public marketing content and an admin panel from a single domain.

## Files Created/Modified

### 1. `app/sitemap.ts` (NEW)
Dynamic sitemap generation following Next.js Metadata API conventions.

### 2. `app/robots.ts` (NEW)
Robots.txt configuration with explicit allow/disallow rules.

### 3. `app/admin/layout.tsx` (MODIFIED)
Added `robots: { index: false, follow: false }` metadata for defense-in-depth protection.

---

## Sitemap Routes (`/sitemap.xml`)

### Static Public Routes Included (18 pages)

**High Priority (0.9-1.0):**
- `/` - Homepage (priority: 1.0, daily updates)
- `/about` - About page (priority: 0.9, monthly)
- `/whatwedo` - Programs listing (priority: 0.9, weekly)
- `/get-involved` - Get Involved page (priority: 0.9, monthly)
- `/donate` - Donation page (priority: 0.9, monthly)

**Medium Priority (0.7-0.8):**
- `/our-story` - Our Story page (priority: 0.8, monthly)
- `/stories` - Stories listing (priority: 0.8, weekly)
- `/podcasts` - Podcasts listing (priority: 0.8, weekly)
- `/podcasts/episodes` - Podcast episodes (priority: 0.7, weekly)
- `/events` - Events listing (priority: 0.8, weekly)
- `/impact` - Impact page (priority: 0.8, monthly)
- `/contact` - Contact page (priority: 0.7, monthly)
- `/conference` - Conference page (priority: 0.7, monthly)

**Lower Priority (0.3-0.6):**
- `/podcasts/highlights` - Podcast highlights (priority: 0.6, weekly)
- `/press` - Press page (priority: 0.6, monthly)
- `/newsletter-archive` - Newsletter archive (priority: 0.5, monthly)
- `/privacy` - Privacy policy (priority: 0.3, yearly)
- `/terms` - Terms of service (priority: 0.3, yearly)

### Dynamic Routes Included (Database-Driven)

**Stories (priority: 0.7, monthly):**
- `/stories/[slug]` - Individual story pages
- Only published stories (`is_published = true`)
- Last modified date from `updated_at` or `published_at`

**Programs/Projects (priority: 0.7, monthly):**
- `/whatwedo/[slug]` - Individual program pages
- Only published programs (`is_published = true`)
- Last modified date from `updated_at` or `created_at`

**Podcasts (priority: 0.6, monthly):**
- `/podcasts/[slug]` - Individual podcast episode pages
- Only published podcasts (`published = true`)
- Last modified date from `updated_at` or `published_at`

**Total Dynamic Routes:** Varies based on database content

---

## Robots.txt Disallowed Routes (`/robots.txt`)

### Admin Panel (Complete Protection)
- `/admin/` - Admin root
- `/admin/*` - All admin routes including:
  - `/admin/login`
  - `/admin/cms`
  - `/admin/conference`
  - `/admin/contacts`
  - `/admin/donations`
  - `/admin/events`
  - `/admin/homepage`
  - `/admin/media`
  - `/admin/monitoring`
  - `/admin/newsletter`
  - `/admin/notifications`
  - `/admin/partners`
  - `/admin/payments`
  - `/admin/podcasts`
  - `/admin/profile`
  - `/admin/projects`
  - `/admin/settings`
  - `/admin/setup`
  - `/admin/stats`
  - `/admin/stories`
  - `/admin/support`
  - `/admin/team`
  - `/admin/users`
  - `/admin/volunteers`

### API Routes
- `/api/` - API root
- `/api/*` - All API routes including:
  - `/api/admin/*`
  - `/api/conference/*`
  - `/api/cron/*`
  - `/api/health`
  - `/api/monitoring/*`
  - `/api/payments/*`
  - `/api/receipts/*`
  - `/api/support/*`
  - `/api/upload`
  - `/api/webhooks/*`
  - `/api/youtube/*`

### Internal Tools & Testing
- `/demo/` - Demo pages root
- `/demo/*` - All demo routes
- `/test-cms/` - CMS testing page
- `/test-cms/*` - CMS testing routes

### Payment Callbacks (Not Useful for Search)
- `/complete-payment` - Payment completion callback
- `/donate/success` - Donation success page
- `/donate/cancel` - Donation cancel page
- `/payments/` - Payment gateway callbacks
- `/payments/*` - All payment routes

### Verification Routes (Token-Based URLs)
- `/verify/` - Email/certificate verification
- `/verify/*` - Verification pages with token parameters
- `/conference/register/` - Conference registration (contains sensitive tokens)
- `/conference/register/*`

---

## Defense in Depth: Admin Protection

### Layer 1: robots.txt
Explicitly disallows `/admin/*` in robots.txt

### Layer 2: Meta Robots Tag
Admin layout exports:
```typescript
export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  }
}
```

This ensures that even if a search engine ignores robots.txt or an admin page is linked externally, it will not be indexed.

### Layer 3: Authentication (Existing)
All admin routes are already protected by authentication middleware in `app/admin/layout.tsx` - unauthenticated users are redirected to `/admin/login`.

---

## Configuration

### Environment Variables Required

**Production:**
```env
NEXT_PUBLIC_SITE_URL=https://deessafoundation.com
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

**Development:**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

The sitemap will use `NEXT_PUBLIC_SITE_URL` to generate absolute URLs. Falls back to `https://deessafoundation.com` if not set.

---

## Verification Checklist

### Local Testing
- [ ] Visit `http://localhost:3000/sitemap.xml` - should show XML sitemap
- [ ] Visit `http://localhost:3000/robots.txt` - should show robots.txt
- [ ] Verify sitemap includes all static routes (18 pages)
- [ ] Verify sitemap includes dynamic routes (stories, programs, podcasts)
- [ ] Verify no admin, api, or demo routes in sitemap
- [ ] Verify robots.txt disallows all admin, api, demo, payment routes

### Production Testing
- [ ] Deploy to production/staging environment
- [ ] Visit `https://deessafoundation.com/sitemap.xml`
- [ ] Visit `https://deessafoundation.com/robots.txt`
- [ ] Verify all URLs use production domain (not localhost)
- [ ] View page source of any `/admin/*` page - should contain:
  ```html
  <meta name="robots" content="noindex, nofollow">
  ```

### Search Console
- [ ] Submit sitemap to Google Search Console: `https://deessafoundation.com/sitemap.xml`
- [ ] Monitor for crawl errors
- [ ] Verify no admin pages appear in search results after re-crawl

---

## Routes NOT Included (Intentionally Excluded)

### Admin Panel
All routes under `/admin/*` are excluded from sitemap and disallowed in robots.txt for security.

### API Routes
All routes under `/api/*` are not indexable by design.

### Internal Tools
- `/demo/*` - Demo/testing pages
- `/test-cms` - CMS testing interface

### Payment Callbacks
- `/complete-payment` - Generic payment callback
- `/donate/success` - Donation success redirect
- `/donate/cancel` - Donation cancel redirect
- `/payments/khalti/*` - Payment gateway callbacks

### Verification URLs
- `/verify/*` - Contains verification tokens, not useful for search
- `/conference/register/*` - Contains registration tokens

### Draft Content
- Unpublished stories (`is_published = false`)
- Unpublished programs (`is_published = false`)
- Unpublished podcasts (`published = false`)
- Unpublished events (`is_published = false`)

---

## Ambiguous Routes - Review Needed

### `/support` Page
**Current Status:** NOT included in sitemap
**Reason:** Need to confirm if this is a public support/help page or internal support ticket system
**Action:** If public help page → Add to sitemap. If internal tickets → Leave excluded.

---

## Future Considerations

### Content Updates
The sitemap automatically regenerates on each request in production (or at build time for static exports). When you:
- Publish a new story → Automatically appears in sitemap
- Publish a new program → Automatically appears in sitemap
- Publish a new podcast → Automatically appears in sitemap
- Unpublish content → Automatically removed from sitemap

### Additional Dynamic Content
If you add new content types (e.g., blog posts, team member profiles), update `app/sitemap.ts` to include:
```typescript
const { data: newContent } = await supabase
  .from('new_table')
  .select('slug, updated_at')
  .eq('is_published', true)
```

### Route Changes
If you add new public routes, add them to the `staticRoutes` array in `app/sitemap.ts`.

---

## Technical Notes

### Why Service Role Key?
The sitemap generation runs at build time or in serverless functions without user authentication context. We use `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security (RLS) policies and fetch all published content.

### Performance
The sitemap queries are optimized:
- Only fetches necessary fields (`slug`, `updated_at`, `published_at`)
- Uses `is_published = true` filter at database level
- Parallel queries for all content types
- Falls back gracefully if database is unavailable

### Security
- Service role key is only used in server-side sitemap generation
- Never exposed to client
- Admin routes have triple protection: auth middleware, robots.txt, and meta robots tags

---

## Support & Troubleshooting

### Sitemap not showing dynamic content?
Check environment variables:
```bash
# Verify these are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Admin pages appearing in search?
1. Check robots.txt is serving correctly at `/robots.txt`
2. Verify meta robots tag in admin page source
3. Request re-crawl in Google Search Console
4. Note: It may take time for search engines to remove already-indexed pages

### Need to block additional routes?
Add to the `disallow` array in `app/robots.ts`:
```typescript
disallow: [
  // ... existing rules
  '/new-internal-route/',
  '/another-private-section/*',
]
```

---

## Deployment Notes

This implementation follows Next.js App Router conventions and will work in:
- ✅ Next.js standalone mode (SSR)
- ✅ Vercel deployment
- ✅ Static export (`output: 'export'`) - will generate sitemap at build time
- ✅ Docker deployments
- ✅ Any Node.js environment

No additional configuration or plugins required.
