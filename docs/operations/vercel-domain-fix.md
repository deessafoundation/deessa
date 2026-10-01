---
title: "Fix Sitemap Domain in Vercel Production"
description: "Google Search Console shows this error when submitting the sitemap:"
owner: "deessa Team"
status: operational
category: operations
audience: developer
last_updated: 2026-09-12
---
# Fix Sitemap Domain in Vercel Production

## Problem

Google Search Console shows this error when submitting the sitemap:
```
This URL is not allowed for a Sitemap at this location.
URL: https://deessa-foundation.vercel.app
URL: https://deessa-foundation.vercel.app/about
URL: https://deessa-foundation.vercel.app/our-story
```

**Root Cause:** The sitemap is generating URLs with the Vercel deployment domain (`deessa-foundation.vercel.app`) instead of your custom domain (`deessafoundation.com`).

## Solution: Update Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Select your project: **deessa-foundation**
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Update NEXT_PUBLIC_SITE_URL

Find the `NEXT_PUBLIC_SITE_URL` environment variable and update it:

**Current Value (Wrong):**
```
https://deessa-foundation.vercel.app
```

**New Value (Correct):**
```
https://deessafoundation.com
```

### Step 3: Set Environment Scope

Make sure to set this for:
-  **Production** (most important!)
- ⚠️ **Preview** (optional - can use Vercel URL for preview deployments)
- ⚠️ **Development** (optional - keep as localhost or Vercel URL)

**Recommended Setup:**

| Environment | NEXT_PUBLIC_SITE_URL Value |
|-------------|----------------------------|
| Production  | `https://deessafoundation.com` |
| Preview     | `https://deessa-foundation.vercel.app` |
| Development | `http://localhost:3000` |

### Step 4: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest production deployment
3. Click **Redeploy**
4. Select **Use existing build cache** (faster)
5. Click **Redeploy**

**OR** push a new commit to trigger automatic deployment.

### Step 5: Verify the Fix

Once redeployed:

1. Visit: `https://deessafoundation.com/sitemap.xml`
2. Check that all `<loc>` URLs now use `https://deessafoundation.com`
3. Example:
   ```xml
   <url>
     <loc>https://deessafoundation.com</loc>
     <lastmod>2024-01-07T12:00:00.000Z</lastmod>
   </url>
   <url>
     <loc>https://deessafoundation.com/about</loc>
     <lastmod>2024-01-07T12:00:00.000Z</lastmod>
   </url>
   ```

### Step 6: Resubmit to Google Search Console

1. Go to Google Search Console: https://search.google.com/search-console
2. Select property: `deessafoundation.com`
3. Navigate to **Sitemaps** (left sidebar)
4. Remove the old sitemap submission (if any)
5. Add new sitemap: `https://deessafoundation.com/sitemap.xml`
6. Click **Submit**
7. Wait a few minutes for Google to fetch and validate

 The error should now be resolved!

---

## Alternative: Automatic Domain Detection

If you want the sitemap to automatically use the correct domain based on the request, you can modify `app/sitemap.ts`:

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // This will use the environment variable, or fall back to deessafoundation.com
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'
  
  // ... rest of the code
}
```

This is already implemented in your `app/sitemap.ts`, so once you update the Vercel environment variable, it will work correctly.

---

## Other URLs to Update in Vercel (Important!)

While you're in the Vercel environment variables, also update these to use `deessafoundation.com`:

### Payment Gateway Callback URLs

**eSewa:**
```
ESEWA_SUCCESS_URL=https://deessafoundation.com/api/payments/esewa/success
ESEWA_FAILURE_URL=https://deessafoundation.com/api/payments/esewa/failure
```

**Khalti:**
```
KHALTI_RETURN_URL=https://deessafoundation.com/payments/khalti/return
```

### Why This Matters:
- Payment gateways will call these URLs after payment
- If they're pointing to Vercel URLs, payments might fail or redirect incorrectly
- Using your custom domain ensures consistent user experience

---

## Verification Checklist

After making all changes and redeploying:

- [ ] Environment variable `NEXT_PUBLIC_SITE_URL` updated in Vercel
- [ ] Production deployment completed successfully
- [ ] Visited `https://deessafoundation.com/sitemap.xml` - all URLs use custom domain
- [ ] Visited `https://deessafoundation.com/robots.txt` - sitemap reference correct
- [ ] Resubmitted sitemap to Google Search Console
- [ ] Google Search Console shows no errors
- [ ] Payment callback URLs updated (optional but recommended)
- [ ] Test donation flow to ensure payments still work

---

## Common Mistakes to Avoid

❌ **Don't** update the environment variable in `.env.local` only - this is local development
 **Do** update it in Vercel Dashboard → Settings → Environment Variables

❌ **Don't** forget to redeploy after changing environment variables
 **Do** trigger a new deployment (Vercel doesn't auto-deploy on env changes)

❌ **Don't** use the Vercel URL (`deessa-foundation.vercel.app`) for production
 **Do** use your custom domain (`deessafoundation.com`)

---

## Quick Reference: Vercel Environment Variable Update

**URL:** https://vercel.com/[your-team]/deessa-foundation/settings/environment-variables

**Variable:** `NEXT_PUBLIC_SITE_URL`  
**Production Value:** `https://deessafoundation.com`  
**Action:** Click **Save** → Click **Redeploy**

That's it! 🎉
