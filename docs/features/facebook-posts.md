# Community Facebook posts

**Initial Implementation:** 2026-10-10  
**Major Enhancement:** 2026-10-11  
**Status:** Feature-complete with admin UX, analytics, scheduling, and public community page

## Overview

A comprehensive community post management system that showcases Facebook posts on the homepage and a dedicated `/community` page. Features include excerpt management, tag organization, post scheduling, drag-and-drop reordering, analytics tracking, search/filtering, bulk operations, and full accessibility support.

## Activate

1. **Apply database migrations** in order:
   - `scripts/db/migrations/065-facebook-posts.sql` (base tables and RLS)
   - `scripts/db/migrations/066-facebook-post-url-constraint.sql` (if needed for URL constraint fix)
   - `scripts/db/migrations/067-facebook-posts-enhancements.sql` (excerpt, tags, scheduling, analytics)

2. **Restart dev server** after migrations so Facebook iframe previews are allowed by CSP.

3. **No external dependencies** required: no Facebook access token, Meta login, new packages, or cron jobs.

## Admin Interface

### Location
**Admin → Community Posts** (`/admin/community-posts`)

### Features

#### List View
- **Paginated table** displaying all posts (50 per page)
- **Real-time search** across title, URL, and excerpt
- **Status filtering** (All / Published / Draft)
- **Bulk operations:**
  - Select individual posts or all on page
  - Bulk publish/unpublish/delete
- **Analytics display:** View count and click count per post
- **Quick actions:** View details button on each row
- **Drag-and-drop reordering** via "Reorder Posts" button
- **Responsive design** with mobile-friendly table

#### Post Editor (`/admin/community-posts/[id]` or `/new`)
- **Facebook URL field** with expandable format help showing supported URL patterns
- **Card title** (1-120 chars) with character counter
- **Excerpt field** (optional, 1-500 chars) for homepage preview text
- **Tag management:**
  - Add up to 10 tags per post
  - Enter tag and press Enter or click Add
  - Remove tags individually
- **Display order** (0-10,000, lower = higher priority)
- **Publishing options:**
  - Publish on homepage checkbox
  - Optional scheduling with datetime picker
  - Posts only appear after scheduled datetime
- **Preview modes:**
  - Admin view: Full 720px iframe with caption
  - Homepage view: Compact 480px iframe without caption (matches public display)
- **Post statistics** (for existing posts): Views, clicks, scheduled date
- **Delete option** with confirmation

#### Supported URL Formats
- Share links: `https://www.facebook.com/share/p/[id]`
- Post links: `https://www.facebook.com/[page]/posts/[id]`
- Permalink: `https://www.facebook.com/permalink.php?story_fbid=...&id=...`
- Story: `https://www.facebook.com/story.php?story_fbid=...&id=...`
- Photos: `https://www.facebook.com/photo.php?fbid=...`
- Full iframe embed code (extracts href parameter automatically)

If migration 065 was copied from rich text and its URL check contains `[https://...](https://...)`, normal links fail the constraint. Apply `scripts/db/migrations/066-facebook-post-url-constraint.sql` to repair that check without deleting records. If the table does not exist, apply the original raw 065 file first. Save errors now distinguish constraint rejection, missing storage, denied database access, duplicate links, and validation errors. Database repair and live save verification remain pending; no diagnosis is confirmed without the reported error.

Settings permission is required (active ADMIN/SUPER_ADMIN under current role rules). Every mutation checks authorization server-side. Database public access is SELECT-only and restricted to published rows; mutations use the existing private service-role client. Removing an entry affects only the website, never Facebook.

## Public Display

### Homepage (`/`)
**Location:** Between Testimonials and Contact sections

**Behavior:**
- Displays **first 3 published posts** ordered by `display_order` (lowest first), then by `created_at` (newest first)
- Respects `published_at` scheduling (only shows posts where `published_at` is null or in the past)
- Always renders section, even when empty (shows follow buttons and "Check back soon" message)
- Each post card displays:
  - Facebook branding badge
  - Post date
  - Admin-defined title (2-line truncation)
  - Excerpt text (3-line truncation, if provided)
  - Embedded Facebook iframe (480px height, compact mode without caption)
  - Link to original Facebook post
- **"View all moments" button** links to `/community` page
- **Follow buttons** for Instagram and Facebook
- **Analytics tracking:**
  - View: Tracked when 50% of card is visible (IntersectionObserver)
  - Click: Tracked when title or card link is clicked

### Community Page (`/community`)
**Public URL:** `/community`

**Features:**
- Displays **all published posts** (12 per page)
- 3-column responsive grid (1 column mobile, 2 tablet, 3 desktop)
- Each post card shows:
  - Title, date, excerpt, tags (max 3 visible + count)
  - Facebook iframe embed
  - Click-tracked link to original post
- Pagination controls (Previous/Next)
- Empty state when no posts exist
- Breadcrumb "Back to home" link
- Follow CTAs at bottom
- SEO metadata optimized for community stories
- Full analytics tracking (views + clicks)

### Empty States
- **Homepage:** Shows section header, "Check back soon" message, and follow buttons
- **Community page:** Shows "No posts yet" message with follow CTAs

## New Features (2026-10-11 Enhancement)

### Content Management
1. **Excerpt field** (1-500 chars): Add descriptive text displayed on homepage cards, improving context and engagement
2. **Tag system:** Organize posts with up to 10 tags per post; tags appear on community page cards
3. **Scheduling:** Set `published_at` datetime to schedule posts for future publication
4. **Improved display order:** Drag-and-drop reordering interface in admin for visual post arrangement

### Admin UX Improvements
1. **Real-time search:** Filter posts by title, URL, or excerpt content
2. **Status filtering:** View all posts, only published, or only drafts
3. **Bulk operations:** Select multiple posts to publish, unpublish, or delete at once
4. **Preview modes:** Toggle between admin view (full iframe) and homepage view (compact) to see exactly what visitors see
5. **URL format help:** Expandable help section showing supported Facebook URL formats with examples
6. **Character counters:** Real-time feedback on title (120) and excerpt (500) character limits
7. **Enhanced error messages:** Specific, actionable errors for database issues

### Analytics
1. **View tracking:** Automatic tracking when post card is 50% visible using IntersectionObserver
2. **Click tracking:** Records clicks on post title/card links
3. **Admin dashboard:** View counts and click counts displayed in admin list table
4. **Database functions:** Efficient increment operations for analytics (`increment_facebook_post_views`, `increment_facebook_post_clicks`)

### Public Features
1. **Community page:** New `/community` route showing all published posts with pagination
2. **SEO optimization:** Dedicated metadata for community page
3. **Tag display:** Shows up to 3 tags per post card on community page
4. **Empty state improvements:** Homepage section always renders, shows follow CTAs when no posts

### Accessibility
1. **High-contrast mode:** All new components support `body.high-contrast` with proper color overrides
2. **Inverted-contrast mode:** Full support for `body.inverted-contrast` theme
3. **Forced colors mode:** Windows High Contrast compatibility
4. **No inline colors:** All components use semantic Tailwind classes (no `bg-[#...]` or `text-[#...]`)
5. **Keyboard navigation:** Full keyboard support for drag-and-drop reordering
6. **Screen reader friendly:** Proper ARIA labels, semantic HTML, and focus management

## Database Schema (Post-Enhancement)

```sql
CREATE TABLE facebook_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL UNIQUE,
  title text NOT NULL,
  image_url text,                    -- Optional cover photo (preserved but not used on homepage)
  image_alt text,                    -- Alt text for cover photo
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- New fields (migration 067)
  excerpt text,                      -- 1-500 chars, displayed on cards
  tags text[] DEFAULT '{}',          -- Up to 10 tags per post
  published_at timestamptz,          -- Scheduled publish datetime
  views integer NOT NULL DEFAULT 0,  -- View count (tracked client-side)
  clicks integer NOT NULL DEFAULT 0  -- Click count (tracked client-side)
);
```

**Indexes:**
- `facebook_posts_published_order_idx` - Published posts ordered by display_order and created_at
- `facebook_posts_scheduled_idx` - Scheduled posts by published_at
- `facebook_posts_tags_idx` - GIN index for tag queries
- `facebook_posts_analytics_idx` - Views and clicks for analytics queries

**RLS Policy:**
- Public: `SELECT` only for `is_published = true AND (published_at IS NULL OR published_at <= now())`
- Admin mutations: Require `settings` permission via service role


## Technical Implementation

### File Structure

**Database:**
- `scripts/db/migrations/065-facebook-posts.sql` - Base table, RLS, indexes
- `scripts/db/migrations/066-facebook-post-url-constraint.sql` - URL constraint fix (optional)
- `scripts/db/migrations/067-facebook-posts-enhancements.sql` - Excerpt, tags, analytics, scheduling

**Server Actions:**
- `lib/actions/facebook-posts.ts` - CRUD operations, bulk actions, reordering, analytics tracking
- `lib/data/facebook-posts.ts` - Public data fetching (homepage, community page)

**Types:**
- `lib/facebook-posts/types.ts` - TypeScript interfaces, URL normalization, embed URL generation

**Admin Components:**
- `app/admin/community-posts/page.tsx` - List view page (server component)
- `app/admin/community-posts/[id]/page.tsx` - Detail/edit page (server component)
- `components/admin/facebook-posts/community-posts-list.tsx` - Enhanced list UI (client)
- `components/admin/facebook-posts/facebook-posts-manager.tsx` - Post editor form (client)
- `components/admin/facebook-posts/posts-reorder.tsx` - Drag-and-drop reordering modal (client)

**Public Components:**
- `app/(public)/community/page.tsx` - Public community page (server component)
- `components/facebook-posts/community-section.tsx` - Homepage section (server component)
- `components/facebook-posts/facebook-post-preview.tsx` - Facebook iframe embed (client)
- `components/facebook-posts/post-analytics-tracker.tsx` - View tracking (client)
- `components/facebook-posts/tracked-post-link.tsx` - Click tracking (client)

**Styles:**
- `components/facebook-posts/community-section.module.css` - Scoped styles with accessibility modes

### Key Dependencies

- **@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities** - Drag-and-drop reordering
- **date-fns** - Relative date formatting (e.g., "3 days ago")
- **sonner** - Toast notifications for bulk actions
- **zod** - Schema validation for forms and server actions

### Authorization

All mutations require:
- Active admin account (`is_active !== false`)
- `settings` permission (currently ADMIN or SUPER_ADMIN roles)
- Authorization checked server-side in every action

Public reads:
- Anonymous access via Supabase RLS policy
- Respects `is_published = true` and `published_at <= now()`

### URL Processing

1. Admin pastes Facebook URL or iframe code
2. `normalizeFacebookPostUrl()` extracts and validates:
   - If iframe code: extracts `href` parameter from `src` attribute
   - Validates host is facebook.com (www, m, or mobile)
   - Validates path matches supported patterns
   - Normalizes to canonical `www.facebook.com` URL
   - Removes tracking parameters
   - Rejects unsupported formats (videos, Reels, pages)
3. Normalized URL stored in database
4. `facebookEmbedUrl()` generates official Facebook embed URL for iframes

### Analytics Implementation

**View Tracking:**
```typescript
// PostAnalyticsTracker component
IntersectionObserver({
  threshold: 0.5  // Track when 50% visible
})
→ trackFacebookPostView(postId)
→ increment_facebook_post_views(post_id) SQL function
```

**Click Tracking:**
```typescript
// TrackedPostLink component
onClick handler
→ trackFacebookPostClick(postId)  // Fire and forget
→ increment_facebook_post_clicks(post_id) SQL function
→ Default link behavior proceeds
```

Both tracking functions:
- Use service role client for database writes
- Silent fail (no user-facing errors)
- Atomic increment operations (no race conditions)

### Scheduling Logic

Posts with `is_published = true` and `published_at` set:
- **Admin view:** Appears in list with "Scheduled: [date]" badge
- **Public view:** Hidden until `published_at <= now()`
- **Query filter:** `WHERE (published_at IS NULL OR published_at <= now())`

No cron job required; filter applied at query time.

## Migration Guide

### From 065 to 067

If you have existing posts from migration 065:

1. **Backup database** before applying 067
2. **Apply 067-facebook-posts-enhancements.sql**
3. **Existing posts automatically get:**
   - Empty excerpt (NULL)
   - Empty tags array ([])
   - No scheduled date (NULL)
   - Zero views and clicks (0)
4. **Update posts** via admin to add excerpts and tags
5. **No data loss** - all existing posts remain published and visible

### Adding Excerpt to Existing Posts

Recommended workflow:
1. Go to Admin → Community Posts
2. Use search to find posts without excerpts
3. Edit each post and add 150-300 character excerpt
4. Excerpts significantly improve engagement on homepage

## Performance Considerations

1. **Lazy loading:** Facebook iframes use `loading="lazy"` attribute
2. **Analytics:** Fire-and-forget requests don't block rendering
3. **Pagination:** 50 posts per page in admin, 12 on public page
4. **Indexes:** Optimized queries for published posts, scheduled posts, and analytics
5. **RLS:** Database-level filtering prevents unauthorized access
6. **Caching:** Pages use `dynamic = "force-dynamic"` to reflect latest posts

## Known Limitations

1. **Facebook embed accessibility:** Cross-origin iframe content cannot be styled or controlled for accessibility
2. **Scheduled post precision:** Checks on page load, not real-time (acceptable for content publishing)
3. **Analytics accuracy:** Client-side tracking can be blocked by ad blockers or privacy extensions
4. **Facebook availability:** Embeds depend on Facebook uptime and visitor's network access
5. **Mobile preview:** Share links may require full permalink to preview (Facebook API limitation)

## Testing Checklist

Before deploying to production:

- [ ] Apply all three migrations in order
- [ ] Create test post with all fields (title, excerpt, tags, schedule)
- [ ] Verify homepage displays max 3 posts
- [ ] Verify community page pagination works
- [ ] Test bulk publish/unpublish/delete
- [ ] Test drag-and-drop reordering
- [ ] Verify scheduled posts don't appear before publish time
- [ ] Test analytics tracking (view + click counts increment)
- [ ] Test search and filtering in admin
- [ ] Test high-contrast and inverted-contrast modes
- [ ] Test keyboard navigation (tab through forms, drag-and-drop)
- [ ] Verify empty states on homepage and community page
- [ ] Test with real Facebook post URL

## Review Status

**Initial implementation (2026-10-10):** Source review completed for entry points, RLS, URL handling, and CSP scope.

**Enhancement implementation (2026-10-11):** Complete feature implementation with:
- ✅ Database migrations for all new fields
- ✅ TypeScript types and validation schemas
- ✅ Server actions for CRUD, bulk ops, analytics
- ✅ Admin UI with search, filters, reordering, bulk actions
- ✅ Public community page with pagination
- ✅ Analytics tracking (views + clicks)
- ✅ Accessibility compliance (high-contrast modes, no inline colors)
- ✅ Empty state handling
- ✅ Scheduling support
- ✅ Tag management
- ✅ Preview mode toggle

**Not yet verified:**
- Real Facebook embed with live post URL
- Authenticated CRUD operations in production
- Analytics tracking in production environment
- Scheduled post behavior at exact publish time

Verification is opt-in per repository `AGENTS.md` guidelines. Focused parser tests exist in `__tests__/facebook-posts.test.ts` for future authorized run.
