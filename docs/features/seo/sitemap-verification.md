---
title: "Sitemap & Robots.txt Verification Checklist"
description: "bash"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Sitemap & Robots.txt Verification Checklist

## Quick Verification Steps

### 1. Local Development Testing

```bash
# Start your development server
npm run dev

# Then test these URLs in your browser:
```

- [ ] **Test Sitemap:** http://localhost:3000/sitemap.xml
  - Should return XML format
  - Should include homepage and ~18 static routes
  - Should include dynamic routes for stories, programs, podcasts
  - Should NOT include any `/admin/*`, `/api/*`, or `/demo/*` routes

- [ ] **Test Robots:** http://localhost:3000/robots.txt
  - Should return plain text format
  - Should show `Allow: /`
  - Should show multiple `Disallow:` entries for admin, api, demo
  - Should reference `Sitemap: http://localhost:3000/sitemap.xml`

- [ ] **Check Admin Page Meta Tags:**
  - Visit http://localhost:3000/admin
  - Right-click â†’ "View Page Source"
  - Search for `<meta name="robots"`
  - Should find: `<meta name="robots" content="noindex, nofollow">`

### 2. Production/Staging Testing

After deploying to your production or staging environment:

- [ ] **Production Sitemap:** https://deessafoundation.com/sitemap.xml
  - All URLs should use `https://deessafoundation.com` (not localhost)
  - Should include all published content

- [ ] **Production Robots:** https://deessafoundation.com/robots.txt
  - Sitemap reference should use production URL
  - All disallow rules present

- [ ] **Admin Meta Tags in Production:**
  - View source of https://deessafoundation.com/admin
  - Verify noindex meta tag is present

### 3. Search Console Integration

- [ ] Submit sitemap to Google Search Console:
  1. Go to https://search.google.com/search-console
  2. Select your property
  3. Navigate to "Sitemaps" in left sidebar
  4. Add sitemap URL: `https://deessafoundation.com/sitemap.xml`
  5. Click "Submit"

- [ ] Monitor for errors:
  - Check "Coverage" report for crawl errors
  - Review "Sitemaps" page for processing status

- [ ] Verify exclusions (after ~1 week):
  - Go to "Coverage" â†’ "Excluded"
  - Should see admin pages marked as "Excluded by 'noindex' tag"

### 4. Content Verification

Verify that published content appears in sitemap:

- [ ] **Test with a Published Story:**
  1. Create and publish a test story in admin panel
  2. Note the slug (e.g., `my-test-story`)
  3. Visit `/sitemap.xml`
  4. Search for `<loc>https://deessafoundation.com/stories/my-test-story</loc>`
  5. Should appear in the sitemap

- [ ] **Test with Unpublished Content:**
  1. Create a story but DO NOT publish it
  2. Visit `/sitemap.xml`
  3. Search for the unpublished story slug
  4. Should NOT appear in the sitemap

### 5. URL Format Validation

Check a few entries in the sitemap:

```xml
<!-- Each entry should follow this format: -->
<url>
  <loc>https://deessafoundation.com/whatwedo/education-initiative</loc>
  <lastmod>2024-01-15T10:30:00.000Z</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

- [ ] `<loc>` contains full absolute URL with HTTPS
- [ ] `<lastmod>` is in ISO 8601 format
- [ ] `<changefreq>` is one of: daily, weekly, monthly, yearly
- [ ] `<priority>` is between 0.0 and 1.0

### 6. Security Verification

- [ ] Run a Google search: `site:deessafoundation.com /admin`
  - Should show NO results (or "did not match any documents") after re-crawl
  - Note: Existing indexed pages may take time to be removed

- [ ] Check that all admin routes require authentication:
  - Try accessing `/admin/donations` while logged out
  - Should redirect to `/admin/login`

- [ ] Verify service role key is not exposed:
  - Check browser DevTools â†’ Network tab
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` never appears in any response

### 7. Performance Check

- [ ] Sitemap loads within 2-3 seconds
  - Even with hundreds of dynamic entries
  - If slower, consider pagination or caching

- [ ] No database errors in logs
  - Check server logs when accessing `/sitemap.xml`
  - Should see no Supabase connection errors

## Common Issues & Solutions

### Issue: Sitemap shows no dynamic content

**Solution:**
```bash
# Check environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify database tables exist and contain published content
```

### Issue: Admin pages still appear in Google

**Solution:**
- This is expected initially - Google needs to re-crawl
- Request URL removal in Search Console: "Removals" â†’ "Temporarily remove URL"
- Allow 1-2 weeks for full re-crawl and de-indexing

### Issue: Sitemap uses localhost URLs in production

**Solution:**
```bash
# Ensure production environment has this set:
NEXT_PUBLIC_SITE_URL=https://deessafoundation.com

# Redeploy after setting environment variable
```

### Issue: 404 error on /sitemap.xml

**Solution:**
```bash
# Rebuild and restart the application
npm run build
npm start

# Or redeploy to Vercel/hosting platform
```

## Validation Tools

Use these online tools to validate your implementation:

- [ ] **XML Sitemap Validator:** https://www.xml-sitemaps.com/validate-xml-sitemap.html
  - Paste your sitemap URL
  - Check for XML syntax errors

- [ ] **Google Rich Results Test:** https://search.google.com/test/rich-results
  - Test individual pages to see how Google sees them

- [ ] **Robots.txt Tester:** In Google Search Console
  - Go to Settings â†’ robots.txt Tester
  - Test specific URLs to see if they're blocked

## Sign-Off

Once all checklist items are complete:

- [ ] Local testing passed
- [ ] Production URLs verified
- [ ] Search Console sitemap submitted
- [ ] Admin protection confirmed
- [ ] No TypeScript errors
- [ ] Documentation reviewed

**Tested by:** _________________  
**Date:** _________________  
**Environment:** Development / Staging / Production  
**Status:** âœ… Approved / âš ï¸ Issues Found / âŒ Failed
