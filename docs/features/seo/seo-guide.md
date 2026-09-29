---
title: "SEO Implementation Guide - deessa Foundation Website"
description: "This guide documents the SEO improvements implemented for the deessa Foundation website, following Google's SEO Start..."
owner: "deessa Team"
status: active
category: standards
audience: admin
last_updated: 2026-09-12
---
# SEO Implementation Guide - deessa Foundation Website

## Overview

This guide documents the SEO improvements implemented for the deessa Foundation website, following Google's SEO Starter Guide best practices. The implementation focuses on making the site more discoverable, understandable, and valuable to both users and search engines.

## Table of Contents

1. [Structured Data (Schema.org)](#structured-data)
2. [Metadata Implementation](#metadata-implementation)
3. [Image Optimization](#image-optimization)
4. [URL Structure](#url-structure)
5. [Content Guidelines](#content-guidelines)
6. [Technical SEO](#technical-seo)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Best Practices for Content Creators](#best-practices-for-content-creators)

---

## Structured Data (Schema.org)

### What is Structured Data?

Structured data helps search engines understand your content and enables rich results in search. We've implemented JSON-LD structured data across the site.

### Implemented Structured Data Types

#### 1. Organization (Site-wide)
Located in: `app/layout.tsx`

Defines the organization's basic information, contact points, and social media profiles.

```typescript
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "deessa Foundation",
  "url": "https://deessafoundation.com",
  "logo": "https://deessafoundation.com/favicon.png",
  "description": "A non-profit organization dedicated to...",
  "foundingDate": "2022"
}
```

#### 2. WebSite (Site-wide)
Enables Google to show a search box in search results.

#### 3. Article (Stories & Blog Posts)
Used for: `/stories/[slug]`

Helps stories appear in Google News and rich search results.

#### 4. Event (Events)
Used for: `/events/[slug]`

Enables events to appear in Google Events search results.

#### 5. BreadcrumbList (All detail pages)
Helps Google display breadcrumb navigation in search results.

### How to Add Structured Data

For new content types, use the utilities in `lib/seo/structured-data.ts`:

```typescript
import { getArticleStructuredData } from '@/lib/seo/structured-data'

const structuredData = getArticleStructuredData({
  title: "Your Article Title",
  description: "Article description",
  slug: "article-slug",
  image: "/path/to/image.jpg",
  publishedAt: "2026-01-01",
  updatedAt: "2026-01-15",
})
```

---

## Metadata Implementation

### SEO Metadata Best Practices

#### Title Tags
- **Length**: 50-60 characters (including site name)
- **Format**: `Page Title | deessa Foundation`
- **Guidelines**:
  - Be descriptive and concise
  - Include primary keyword naturally
  - Each page should have a unique title

#### Meta Descriptions
- **Length**: 50-160 characters
- **Guidelines**:
  - Summarize page content accurately
  - Include a call-to-action when appropriate
  - Make it compelling to encourage clicks

### Using the Metadata Utility

All pages should use the standardized metadata generator:

```typescript
import { generateSEOMetadata } from '@/lib/seo/metadata-utils'

export const metadata = generateSEOMetadata({
  title: "Page Title",
  description: "Compelling description under 160 characters",
  path: "/page-path",
  keywords: ["keyword1", "keyword2", "keyword3"],
  image: "/path/to/og-image.jpg",
})
```

### Open Graph & Twitter Cards

All pages automatically include:
- **Open Graph** metadata for Facebook, LinkedIn sharing
- **Twitter Card** metadata for Twitter sharing
- Proper image dimensions (1200x630px recommended)

---

## Image Optimization

### Current Implementation

The site uses Next.js Image component with:
- Automatic WebP/AVIF format conversion
- Responsive image sizes
- Lazy loading by default

### Best Practices for Images

#### 1. Alt Text (CRITICAL for SEO)

**Good Alt Text:**
```tsx
<Image 
  src="/child-learning.jpg" 
  alt="Young girl reading a book in a Nepali classroom with colorful educational posters"
  width={800}
  height={600}
/>
```

**Bad Alt Text:**
```tsx
alt="image" // Too generic
alt="" // Empty (only for decorative images)
alt="DSC_1234.jpg" // File name
```

**Alt Text Guidelines:**
- Describe what's in the image
- Be specific and descriptive
- Include context when relevant
- Keep it under 125 characters
- Don't start with "Image of" or "Picture of"
- For decorative images, use empty alt: `alt=""`

#### 2. Image File Names

**Good:** `nepal-autism-support-program.jpg`  
**Bad:** `IMG_1234.jpg`, `photo.jpg`

#### 3. Image Dimensions

- **Hero Images**: 1920x1080px
- **Open Graph**: 1200x630px
- **Thumbnails**: 400x300px
- **Team Photos**: 400x400px

#### 4. Lazy Loading

Next.js Image component handles lazy loading automatically. Only use `priority` for above-the-fold images:

```tsx
<Image 
  src="/hero.jpg" 
  alt="Description"
  priority // Only for hero images
/>
```

---

## URL Structure

### Current Structure

Our URLs follow a logical, descriptive pattern:

```
âœ“ GOOD:
/stories/helping-children-with-autism
/programs/education-in-karnali
/events/annual-conference-2026

âœ— BAD:
/stories/123
/p/abc456
/event?id=789
```

### URL Best Practices

1. **Use descriptive words**: URLs should indicate page content
2. **Use hyphens**: Separate words with hyphens, not underscores
3. **Keep it short**: Aim for 3-5 words maximum
4. **Lowercase only**: Avoid capital letters
5. **Avoid special characters**: Stick to letters, numbers, and hyphens

---

## Content Guidelines

### Writing for SEO

#### 1. Headings Structure

Use semantic HTML heading hierarchy:

```html
<h1>Page Title</h1>          <!-- One per page -->
  <h2>Main Section</h2>       <!-- Multiple OK -->
    <h3>Subsection</h3>       <!-- Multiple OK -->
```

#### 2. Content Length

- **Minimum**: 300 words for substantial pages
- **Ideal**: 500-800 words for stories and program pages
- **Focus**: Quality over quantity - make every word count

#### 3. Keyword Usage

- Include primary keyword in:
  - Page title
  - First paragraph
  - At least one heading
  - Image alt text
  - URL (slug)
- Use naturally - avoid keyword stuffing

#### 4. Internal Linking

Link to related content using descriptive anchor text:

**Good:**
```tsx
Learn more about our <Link href="/programs/education">education programs in Nepal</Link>.
```

**Bad:**
```tsx
<Link href="/programs/education">Click here</Link> to learn more.
```

---

## Technical SEO

### Robots.txt (Dynamic)

Located at: `app/robots.ts`

**Allows:**
- All public pages
- Sitemap access

**Disallows:**
- Admin panel (`/admin`)
- API routes (`/api`)
- Payment callbacks
- Internal tools

### Sitemap (Dynamic)

Located at: `app/sitemap.ts`

Automatically includes:
- Static pages (home, about, contact, etc.)
- Dynamic content from database:
  - Published stories
  - Published programs
  - Published podcasts
  - Published events

**Update Frequency:**
- Homepage: daily
- Static pages: monthly
- Dynamic content: uses actual update timestamps

### Canonical URLs

All pages include canonical URLs to prevent duplicate content issues:

```html
<link rel="canonical" href="https://deessafoundation.com/page-path" />
```

### Page Speed

**Already Implemented:**
- Next.js App Router (React Server Components)
- Image optimization (WebP/AVIF)
- Font optimization (Google Fonts)
- Vercel Analytics & Speed Insights

**Next.config.mjs Settings:**
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  minimumCacheTTL: 60,
}
```

---

## Monitoring & Analytics

### Google Search Console Setup

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add property: `deessafoundation.com`
   - Verify ownership (DNS or file upload)

2. **Submit Sitemap**
   ```
   https://deessafoundation.com/sitemap.xml
   ```

3. **Monitor These Metrics**
   - Total clicks
   - Total impressions
   - Average CTR
   - Average position
   - Coverage issues
   - Core Web Vitals

### Vercel Analytics

Already installed via `@vercel/analytics` package.

View metrics at: [Vercel Dashboard](https://vercel.com)

### Core Web Vitals Monitoring

Installed via `@vercel/speed-insights`.

**Target Metrics:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## Best Practices for Content Creators

### Creating a New Story

1. **Write compelling title** (50-60 characters)
2. **Add excerpt** (50-160 characters) - used as meta description
3. **Choose descriptive slug** (lowercase, hyphens)
4. **Upload featured image** (1200x630px minimum)
5. **Write descriptive alt text** for all images
6. **Select appropriate category**
7. **Set publish date**

### Creating a New Program

1. **Use descriptive program name**
2. **Write detailed description** (minimum 300 words)
3. **Add high-quality featured image**
4. **Include location information**
5. **Set appropriate category**

### Creating a New Event

1. **Use clear event title**
2. **Write compelling short description** (for meta)
3. **Upload banner image** (1920x1080px)
4. **Set accurate date and time**
5. **Include location details**
6. **Enable registration if applicable**

---

## Testing Your SEO

### Tools to Use

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test structured data implementation

2. **Google Mobile-Friendly Test**
   - URL: https://search.google.com/test/mobile-friendly
   - Ensure mobile optimization

3. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Check Core Web Vitals

4. **Social Media Preview**
   - LinkedIn Post Inspector
   - Facebook Sharing Debugger
   - Twitter Card Validator

### Manual Checklist

Before publishing new content, verify:

- [ ] Unique, descriptive title (50-60 chars)
- [ ] Compelling meta description (50-160 chars)
- [ ] Descriptive URL slug
- [ ] Featured image with alt text
- [ ] All images have descriptive alt text
- [ ] Content is at least 300 words
- [ ] Headings follow hierarchy (h1 â†’ h2 â†’ h3)
- [ ] Internal links to related content
- [ ] No broken links
- [ ] Mobile-friendly
- [ ] Fast loading time

---

## Common SEO Mistakes to Avoid

### âŒ DON'T

1. **Keyword Stuffing**: Unnaturally repeating keywords
2. **Duplicate Content**: Copy-pasting content from other pages
3. **Generic Alt Text**: "image", "photo", "picture"
4. **Missing Metadata**: No title or description
5. **Broken Links**: Links to non-existent pages
6. **Slow Loading**: Large, unoptimized images
7. **No Mobile Optimization**: Content not mobile-friendly
8. **Hidden Content**: Using CSS to hide keyword-stuffed text

### âœ“ DO

1. **Write for Humans First**: Focus on user value
2. **Use Natural Language**: Write conversationally
3. **Be Descriptive**: Clear, specific titles and descriptions
4. **Keep URLs Clean**: Short, readable, descriptive
5. **Optimize Images**: Compress, add alt text
6. **Link Internally**: Connect related content
7. **Update Content**: Keep information fresh
8. **Mobile First**: Test on mobile devices

---

## Quick Reference: File Locations

```
SEO Implementation Files:
â”œâ”€â”€ lib/seo/
â”‚   â”œâ”€â”€ structured-data.ts         # Schema.org generators
â”‚   â””â”€â”€ metadata-utils.ts          # Metadata helpers
â”œâ”€â”€ components/seo/
â”‚   â””â”€â”€ structured-data.tsx        # Structured data component
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ layout.tsx                 # Global metadata & structured data
â”‚   â”œâ”€â”€ robots.ts                  # Robots.txt config
â”‚   â””â”€â”€ sitemap.ts                 # Sitemap generator
â””â”€â”€ docs/
    â””â”€â”€ SEO_GUIDE.md               # This document
```

---

## Support & Resources

### Internal Resources

- SEO Utilities: `lib/seo/`
- Components: `components/seo/`
- This Guide: `docs/SEO_GUIDE.md`

### External Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org Documentation](https://schema.org/)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Web.dev SEO](https://web.dev/learn/seo/)

### Getting Help

For SEO questions or issues:
1. Check this guide first
2. Review Google Search Console for specific issues
3. Test with Google's tools (Rich Results, Mobile-Friendly)
4. Consult the development team

---

## Changelog

### Version 1.0 (September 2026)
- âœ… Implemented structured data (Organization, WebSite, Article, Event, Breadcrumbs)
- âœ… Enhanced metadata across all pages
- âœ… Dynamic metadata for CMS content
- âœ… Created SEO utility functions
- âœ… Updated sitemap and robots.txt
- âœ… Improved image handling
- âœ… Added canonical URLs
- âœ… Implemented Core Web Vitals monitoring
- âœ… Created comprehensive documentation

---

## Next Steps

### Ongoing SEO Tasks

1. **Monthly**
   - Review Google Search Console
   - Check Core Web Vitals
   - Update any underperforming content

2. **Quarterly**
   - Audit internal links
   - Review and update meta descriptions
   - Check for broken links

3. **Annually**
   - Complete SEO audit
   - Review keyword strategy
   - Update this guide

### Future Enhancements

- [ ] Implement breadcrumb navigation UI
- [ ] Add FAQ schema for common questions
- [ ] Create video schema for podcast content
- [ ] Implement local business schema if applicable
- [ ] Add review/rating schema for testimonials
- [ ] Create AMP versions of key pages (if needed)

---

*Last Updated: September 12, 2026*  
*Document Maintained By: Development Team*
