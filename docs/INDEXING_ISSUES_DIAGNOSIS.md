# Indexing Issues Diagnosis & Solutions

## 🔍 Current Situation

**Pages Indexed:** 24  
**Expected Pages:** 68+ (24 indexed + 44 not indexed)  
**Last Analysis:** September 12, 2026

### ✅ What IS Being Indexed

1. Homepage (/)
2. Main section pages (stories, events, podcasts, contact, impact, about, press, newsletter-archive)
3. A few content detail pages:
   - 1 event detail
   - 6 podcast episodes
4. Some filtered/parameter pages (stories?filter=featured, programs?category=art)
5. Conference registration page
6. 2 PDF resources

### ❌ What's NOT Being Indexed (44 pages)

Based on typical site structure, the missing pages likely include:
- Individual story detail pages (most stories)
- Individual program detail pages
- Remaining podcast episodes
- Remaining event pages
- Other important pages

---

## 🔎 Why Pages Aren't Indexed

### Common Reasons

1. **Not in Sitemap** ❌
2. **Blocked by robots.txt** ❌
3. **No internal links** ❌
4. **Pages require authentication** ❌
5. **Duplicate content issues** ⚠️
6. **Low-quality or thin content** ⚠️
7. **Recently published** ⚠️
8. **Crawl budget limitations** ⚠️
9. **Pages not generated yet (ISR/SSR)** ⚠️
10. **Soft 404 errors** ⚠️

---

## 🔧 Immediate Actions

### 1. Check Google Search Console Errors

**Where to Look:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate to: **Indexing → Pages**
3. Look at "Why pages aren't indexed" section

**Common Issues to Check:**

#### A. "Discovered - currently not indexed"
**Meaning:** Google found the URL but hasn't crawled it yet  
**Solutions:**
- Request indexing manually for important pages
- Improve internal linking to these pages
- Wait (Google will eventually crawl them)

#### B. "Crawled - currently not indexed"
**Meaning:** Google crawled but decided not to index  
**Reasons:**
- Low-quality content
- Duplicate content
- Thin content (too short)
- Low page value

**Solutions:**
- Improve content quality
- Add unique, valuable content (minimum 300 words)
- Add images, headings, internal links
- Make content more comprehensive

#### C. "Excluded by 'noindex' tag"
**Meaning:** Page has noindex directive  
**Solution:** Remove noindex tag from pages you want indexed

#### D. "Alternate page with proper canonical tag"
**Meaning:** This is a duplicate, and canonical points elsewhere  
**Solution:** Review canonical URLs

#### E. "Duplicate without user-selected canonical"
**Meaning:** Google detected duplicate content  
**Solution:** Add canonical tags or consolidate content

#### F. "Not found (404)"
**Meaning:** Page returns 404 error  
**Solution:** Fix broken links or redirect to correct URLs

---

## 📋 Step-by-Step Diagnostic Process

### Step 1: Check Your Sitemap

```bash
# Check if sitemap is accessible
curl https://www.deessafoundation.com/sitemap.xml
```

**Verify:**
- [ ] All story pages are listed
- [ ] All program pages are listed
- [ ] All podcast pages are listed
- [ ] All event pages are listed
- [ ] URLs are correct (no typos)
- [ ] Last modified dates are present

**Expected URLs in Sitemap:**
- `/stories/[slug]` for each published story
- `/programs/[slug]` for each published program
- `/podcasts/[slug]` for each published podcast
- `/events/[slug]` for each published event

### Step 2: Check Robots.txt

```bash
# Check robots.txt
curl https://www.deessafoundation.com/robots.txt
```

**Verify:**
- [ ] Not blocking important pages
- [ ] Sitemap URL is present
- [ ] No accidental disallow rules

### Step 3: Check Individual Pages

Pick a few unindexed pages and test:

```bash
# Check if page exists
curl -I https://www.deessafoundation.com/stories/[slug]

# Check if page has noindex
curl https://www.deessafoundation.com/stories/[slug] | grep -i "noindex"

# Check robots meta tag
curl https://www.deessafoundation.com/stories/[slug] | grep -i "robots"
```

### Step 4: Check Internal Linking

**Run this query in GSC:**
1. Go to **Links → Internal links**
2. Sort by "Target pages"
3. Check if unindexed pages have internal links

**Problem:** If pages have 0-1 internal links, they're hard for Google to discover

### Step 5: Manual Indexing Request

For important pages not indexed:

1. Go to URL Inspection tool in GSC
2. Enter the URL
3. Click "Request Indexing"
4. Wait 1-2 weeks

**Limit:** You can request ~10-15 URLs per day

---

## 🚀 Solutions & Action Plan

### Immediate Actions (Today)

#### 1. Verify Sitemap Contains All Pages

**Check the sitemap generation:**

```typescript
// app/sitemap.ts should be generating dynamic URLs
// Verify the database queries are returning data

// Test locally:
npm run dev
// Visit: http://localhost:3000/sitemap.xml
```

**Expected Output:**
- Homepage
- Static pages (about, contact, etc.)
- ALL published stories
- ALL published programs  
- ALL published podcasts
- ALL published events

#### 2. Request Manual Indexing for Top Pages

**Priority Pages to Request Indexing:**
1. Top 5 most important story pages
2. Top 3 program pages
3. Your-story page (`/our-story`)
4. Donate page (`/donate`)
5. Get-involved page (`/get-involved`)

**How:**
1. GSC → URL Inspection
2. Paste URL
3. Request Indexing
4. Repeat for each page

#### 3. Check for Noindex Tags

**Run this check:**

```bash
# Check if pages have noindex (they shouldn't)
curl https://www.deessafoundation.com/stories/[any-story-slug] | grep -i "noindex"
```

**If found:** Remove noindex from pages you want indexed

#### 4. Improve Internal Linking

**Add more internal links to unindexed pages:**
- Link to story pages from homepage
- Link to program pages from stories
- Cross-link related content
- Add "Featured Content" sections

### Short-Term Actions (This Week)

#### 5. Content Quality Audit

For each unindexed page, verify:
- [ ] Minimum 300 words of unique content
- [ ] At least one image with alt text
- [ ] Proper heading structure (h1, h2, h3)
- [ ] 3-5 internal links to other pages
- [ ] Unique title and meta description
- [ ] No duplicate content from other pages

#### 6. Fix Any Duplicate Content

**Check for duplicates:**
1. GSC → Coverage → Excluded
2. Look for "Duplicate without user-selected canonical"
3. Review those pages

**Solutions:**
- Add canonical tags
- Make content more unique
- Consolidate duplicate pages
- Use 301 redirects if appropriate

#### 7. Improve Page Load Speed

Slow pages may not be fully crawled:
- Check PageSpeed Insights
- Optimize images
- Reduce JavaScript
- Enable caching

#### 8. Add More High-Quality Content

**For thin pages (under 300 words):**
- Expand content with more details
- Add images and media
- Include statistics or data
- Add testimonials or quotes
- Create comprehensive guides

### Medium-Term Actions (This Month)

#### 9. Create HTML Sitemap Page

Create a user-facing sitemap at `/sitemap-page` or `/site-map`:

```tsx
// app/(public)/site-map/page.tsx
export default function SitemapPage() {
  return (
    <div>
      <h1>Site Map</h1>
      
      <section>
        <h2>About Us</h2>
        <ul>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/our-story">Our Story</Link></li>
          <li><Link href="/impact">Impact</Link></li>
        </ul>
      </section>

      <section>
        <h2>Programs</h2>
        <ul>
          {/* List all programs */}
        </ul>
      </section>

      <section>
        <h2>Stories</h2>
        <ul>
          {/* List all stories */}
        </ul>
      </section>
      
      {/* More sections */}
    </div>
  )
}
```

**Benefits:**
- Helps users navigate
- Provides internal links to all pages
- Helps Google discover pages

#### 10. Implement Pagination Properly

If you have pagination:

```tsx
// Add rel="next" and rel="prev" links
<link rel="prev" href="/stories?page=1" />
<link rel="next" href="/stories?page=3" />
```

#### 11. Monitor Progress Weekly

**Create a tracking spreadsheet:**

| URL | Status | Date Requested | Date Indexed | Notes |
|-----|--------|----------------|--------------|-------|
| /stories/story-1 | Not Indexed | Sept 12 | - | Content thin |
| /programs/program-1 | Not Indexed | Sept 12 | - | No internal links |

---

## 📊 Google Search Console Deep Dive

### What to Check Weekly

#### 1. Coverage Report
**Path:** Indexing → Pages

**Check:**
- Valid pages (should increase)
- Error pages (should decrease)
- Excluded pages (review reasons)
- Warning pages (review issues)

#### 2. Sitemap Report
**Path:** Indexing → Sitemaps

**Check:**
- Sitemap was successfully read
- Number of URLs discovered
- Number of URLs submitted vs. indexed

**Expected:**
- Submitted: 60+ URLs
- Indexed: Should grow weekly

#### 3. URL Inspection
**Path:** URL Inspection (top bar)

**For each unindexed page, check:**
- Coverage: "URL is on Google" or not
- Crawl: Last crawl date
- Indexing: Allowed or blocked
- Mobile usability: Any issues
- Structured data: Valid or errors

#### 4. Enhancement Reports

**Mobile Usability:**
- [ ] No errors
- [ ] All pages mobile-friendly

**Core Web Vitals:**
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

**Structured Data:**
- [ ] No errors in Article schema
- [ ] No errors in Event schema
- [ ] No errors in Breadcrumb schema

---

## 🔍 Debugging Specific Issues

### Issue 1: Stories Not Indexed

**Possible Causes:**
1. Not in sitemap → Check `app/sitemap.ts`
2. Thin content → Add more content (min 300 words)
3. No internal links → Add links from homepage/other stories
4. Duplicate content → Make each story unique
5. Recently published → Wait 2-4 weeks

**Quick Fixes:**
```typescript
// Ensure stories are in sitemap
// app/sitemap.ts

const { data: stories } = await supabase
  .from('stories')
  .select('slug, updated_at, published_at')
  .eq('is_published', true) // ← Make sure this is true

if (stories) {
  stories.forEach((story) => {
    routes.push({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: new Date(story.updated_at || story.published_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })
}
```

### Issue 2: Programs Not Indexed

**Same as stories**, plus:
- Verify database table name is correct
- Check if `is_published` field exists and is true
- Verify slugs are correct and unique

### Issue 3: Podcasts Partially Indexed

**Only 6 out of many episodes are indexed.**

**Possible Causes:**
1. Newer episodes not in sitemap yet
2. Episodes published but not marked as published in DB
3. Duplicate content (similar titles/descriptions)
4. Low content quality (short descriptions)

**Solutions:**
- Verify all episodes in sitemap
- Add unique, detailed descriptions (200+ words)
- Include transcripts
- Add show notes

### Issue 4: Events Not Indexed

**Possible Causes:**
1. Past events (Google may not index old events)
2. Events in sitemap but not live yet
3. Event pages have thin content
4. No event schema markup

**Solutions:**
- Focus on upcoming/future events
- Add detailed event descriptions
- Include agenda, speakers, venue details
- Ensure Event schema is present

---

## 🛠️ Technical Improvements

### 1. Improve Sitemap Generation

**Current:**
```typescript
// Ensure service role key is available at build time
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Verify Environment Variables:**
- NEXT_PUBLIC_SUPABASE_URL is set
- SUPABASE_SERVICE_ROLE_KEY is set (for build time)

### 2. Add Sitemap Index for Large Sites

If you have 100+ URLs:

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Return all URLs
  // Or implement sitemap index:
  // /sitemap.xml → points to:
  //   - /sitemap-pages.xml (static pages)
  //   - /sitemap-stories.xml (stories)
  //   - /sitemap-programs.xml (programs)
  //   - /sitemap-events.xml (events)
}
```

### 3. Add Last Modified Dates

**Ensure all entries have lastModified:**

```typescript
{
  url: `${baseUrl}/stories/${story.slug}`,
  lastModified: new Date(story.updated_at || story.published_at), // ← Important!
  changeFrequency: 'monthly',
  priority: 0.7,
}
```

### 4. Implement Change Frequency Accurately

**Update changeFrequency based on content type:**

```typescript
// Stories - rarely change after publish
changeFrequency: 'yearly',

// Programs - may update occasionally  
changeFrequency: 'monthly',

// Events - change frequently (dates, speakers)
changeFrequency: 'weekly',

// Homepage - updates often
changeFrequency: 'daily',
```

---

## 📈 Monitoring Progress

### Week 1 Checklist

- [ ] Submit corrected sitemap to GSC
- [ ] Request indexing for top 10 pages
- [ ] Fix any coverage errors in GSC
- [ ] Add internal links to unindexed pages
- [ ] Verify all pages return 200 status

### Week 2 Checklist

- [ ] Check GSC for newly indexed pages
- [ ] Request indexing for next 10 pages
- [ ] Review and fix any new errors
- [ ] Improve content on thin pages
- [ ] Add more internal links

### Week 3 Checklist

- [ ] Compare indexed pages vs. Week 1
- [ ] Continue requesting indexing
- [ ] Monitor Core Web Vitals
- [ ] Check for duplicate content issues
- [ ] Update old content

### Week 4 Checklist

- [ ] Generate progress report
- [ ] Identify remaining unindexed pages
- [ ] Analyze why specific pages aren't indexing
- [ ] Adjust strategy based on results
- [ ] Plan next month's SEO tasks

### Monthly Tracking Metrics

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Target |
|--------|--------|--------|--------|--------|--------|
| Indexed Pages | 24 | - | - | - | 60+ |
| Total Impressions | - | - | - | - | +20% |
| Average Position | - | - | - | - | <20 |
| Click-Through Rate | - | - | - | - | >2% |

---

## 🎯 Expected Timeline

### Week 1-2: Discovery
- Google discovers more pages from sitemap
- Some pages move to "Discovered - not yet indexed"

### Week 3-4: Initial Indexing
- Google starts indexing high-quality pages
- 10-15 new pages indexed

### Month 2: Acceleration
- More pages indexed as Google understands site structure
- 20-30 additional pages indexed

### Month 3: Stabilization
- Most quality pages should be indexed
- Target: 60-70 pages indexed (90%+ of public pages)

---

## 🚨 Red Flags to Watch For

### 1. Decreasing Indexed Pages
**Cause:** Pages being de-indexed  
**Action:** Check for:
- Duplicate content
- Quality issues
- Technical errors
- Manual actions (penalties)

### 2. High Crawl Errors
**Cause:** Server or code issues  
**Action:** Check for:
- 404 errors
- 500 server errors
- Timeout issues
- DNS problems

### 3. Sudden Drop in Impressions
**Cause:** Indexing or ranking issues  
**Action:** Check for:
- Algorithm updates
- Manual actions
- Technical problems
- Competitor changes

---

## 📞 Getting Expert Help

### When to Consider SEO Consultant

If after 3 months:
- Still < 50% pages indexed
- No improvement in rankings
- Organic traffic declining
- Unable to identify issues

### Free Resources

1. **Google Search Central Community**
   - https://support.google.com/webmasters/community

2. **Reddit r/SEO**
   - Active community for troubleshooting

3. **WebmasterWorld**
   - Technical SEO discussions

---

## ✅ Success Indicators

You'll know it's working when:

- ✓ Indexed pages increase by 10-15 per month
- ✓ GSC shows "Valid" for most submitted URLs
- ✓ Organic traffic increases
- ✓ Pages appear in search for brand queries
- ✓ Click-through rate improves
- ✓ No critical errors in GSC

---

**Next Steps:** Start with the "Immediate Actions" section and work through systematically. Document everything in GSC screenshots for tracking progress.

---

*Created: September 12, 2026*  
*Last Updated: September 12, 2026*
