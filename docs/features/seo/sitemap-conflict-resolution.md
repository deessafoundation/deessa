---
title: "Sitemap Conflict Resolution"
description: "Documentation for sitemap conflict resolution"
owner: "deessa Team"
status: active
category: feature
audience: developer
last_updated: 2026-09-12
---
# Sitemap Conflict Resolution

## Issue
```
Conflicting page and metadata at /sitemap: 
page at /(public)/sitemap/page and metadata at /sitemap/route
GET /sitemap.xml 500 in 5.2s
```

## Root Cause

Next.js detected a conflict between:
1. **New XML Sitemap:** `app/sitemap.ts` - generates `/sitemap.xml` (for search engines)
2. **Old Page Route:** `app/(public)/sitemap/page.tsx` - creates `/sitemap` (human-readable placeholder)

Both routes were trying to handle the `/sitemap` path, causing a build conflict.

## Resolution

### Changes Made:

1. **Deleted conflicting page:**
   - Removed `app/(public)/sitemap/page.tsx` (was just a placeholder with "coming soon" text)
   - Removed empty `app/(public)/sitemap/` directory

2. **Updated `app/robots.ts`:**
   - Removed the `/sitemap/` disallow rule (no longer needed)
   - The XML sitemap at `/sitemap.xml` is still properly referenced

3. **Updated documentation:**
   - Removed references to the human-readable sitemap page
   - Updated `docs/SEO_SITEMAP_ROBOTS_IMPLEMENTATION.md`

## Current State

 **XML Sitemap for Search Engines:**
- Route: `/sitemap.xml`
- File: `app/sitemap.ts`
- Purpose: Dynamic XML sitemap for Google, Bing, etc.
- Status: Active and functional

âŒ **Human-Readable Sitemap Page:**
- Route: `/sitemap` (removed)
- File: `app/(public)/sitemap/page.tsx` (deleted)
- Purpose: Was a placeholder "coming soon" page
- Status: Removed to resolve conflict

## Why This Approach?

1. **The old page was just a placeholder** - contained no actual content
2. **XML sitemap is sufficient** - search engines only need `/sitemap.xml`
3. **User-facing sitemaps are optional** - most sites only have XML sitemaps
4. **Simplifies routing** - eliminates confusion between `/sitemap` and `/sitemap.xml`

## If You Want a Human-Readable Sitemap Later

If you decide you want a user-facing sitemap page in the future, create it at a **different route** to avoid conflicts:

**Option 1: Different path**
```
app/(public)/site-map/page.tsx  â†’ /site-map
```

**Option 2: Alternative names**
```
app/(public)/pages/page.tsx     â†’ /pages
app/(public)/site-index/page.tsx â†’ /site-index
```

**Do NOT use:**
- `/sitemap` or `/sitemap/*` - conflicts with XML sitemap metadata route
- `/sitemap.xml` - reserved for the XML sitemap

## Testing

After this fix, verify:
```bash
# Start dev server
npm run dev

# Test these URLs:
 http://localhost:3000/sitemap.xml - Should return XML sitemap
 http://localhost:3000/robots.txt - Should return robots rules
âŒ http://localhost:3000/sitemap - Should return 404 (page removed)
```

## Summary

 Conflict resolved  
 XML sitemap working at `/sitemap.xml`  
 Robots.txt updated  
 Documentation updated  
 No routing conflicts  

The Next.js app should now build and run without the sitemap conflict error.
