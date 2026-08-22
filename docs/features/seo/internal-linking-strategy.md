---
title: "Internal Linking Strategy - Deesha Foundation"
description: "Internal linking is crucial for SEO and user experience. This document outlines the internal linking strategy impleme..."
owner: "Deesha Team"
status: active
category: reference
audience: developer
last_updated: 2026-09-12
---
# Internal Linking Strategy - Deesha Foundation

## Overview

Internal linking is crucial for SEO and user experience. This document outlines the internal linking strategy implemented across the Deesha Foundation website, following Google SEO best practices.

## Why Internal Linking Matters

1. **SEO Benefits:**
   - Helps search engines discover and index pages
   - Distributes page authority (link equity) across the site
   - Establishes site architecture and hierarchy
   - Improves rankings for linked pages

2. **User Experience Benefits:**
   - Guides users to related content
   - Reduces bounce rate
   - Increases pages per session
   - Improves content discoverability

3. **Website Structure:**
   - Defines the relationship between pages
   - Creates clear navigation paths
   - Establishes content clusters

---

## Current Implementation

### 1. Global Navigation (Site-wide)

**Header Navigation:**
Located in site header, accessible from every page:
- Home
- About
- Programs
- Stories
- Events
- Podcasts
- Get Involved / Donate
- Contact

**Footer Navigation:**
Comprehensive links in footer:
- About Us
  - Our Story
  - Who We Are
  - Impact
- Programs
  - All Programs
- Get Involved
  - Donate
  - Volunteer
  - Partner With Us
- Resources
  - Stories
  - Events
  - Podcasts
  - Press & Media
- Legal
  - Privacy Policy
  - Terms of Service

**Benefits:**
- âœ“ Every page is 3 clicks or less from home
- âœ“ Clear site hierarchy
- âœ“ Consistent navigation

---

### 2. Homepage Internal Links

**Hero Section:**
- Primary CTA buttons to key pages (Donate, Get Involved)

**Impact Stats Bar:**
- Links to impact page or programs

**Our Story Section:**
- "Read Our Full Story" â†’ `/our-story`
- "Learn About Our Work" â†’ `/programs`

**Programs Section:**
- Individual program cards â†’ `/programs/[slug]`
- "View All Programs" â†’ `/programs`

**Stories Section:**
- Featured story â†’ `/stories/[slug]`
- "Read More Stories" â†’ `/stories`

**Events Section:**
- Upcoming events â†’ `/events/[slug]`
- "View All Events" â†’ `/events`

**Testimonials Section:**
- Optional links to related stories

**Call-to-Action Sections:**
- "Donate Now" â†’ `/donate`
- "Contact Us" â†’ `/contact`
- "Get Involved" â†’ `/get-involved`

---

### 3. Content Detail Pages

#### Stories Detail Pages (`/stories/[slug]`)

**Implemented Links:**
- Breadcrumb navigation (structured data)
- "Back to Stories" link
- Category tag links (potential)
- Related Stories section at bottom:
  - Shows 3 related stories (same category first)
  - Includes thumbnail, title, excerpt
  - Links to story detail pages
- Share buttons (external, but important)
- Footer navigation

**Recommendation:**
```tsx
// Add contextual links within story content
<p>
  This story is part of our{" "}
  <Link href="/programs/autism-support">autism support program</Link>
  {" "}in Nepal.
</p>
```

#### Programs Detail Pages (`/programs/[slug]`)

**Implemented Links:**
- "Back to Programs" link
- Donation CTA â†’ `/donate`
- Related programs (if implemented)
- Contact link for more info
- Footer navigation

**Recommendation:**
- Add "Related Stories" section showing success stories from this program
- Link to relevant events
- Cross-link to similar programs

#### Events Detail Pages (`/events/[slug]`)

**Implemented Links:**
- "Back to Events" link
- Registration button â†’ `/events/[slug]/register`
- Location links (if applicable)
- Related events (upcoming/past)
- Footer navigation

#### Podcasts Detail Pages (`/podcasts/[slug]`)

**Implemented Links:**
- "Back to Podcasts" link
- Related episodes section
- Episode archive link
- All highlights link
- Newsletter signup
- Footer navigation

---

### 4. Category/Archive Pages

#### Stories Page (`/stories`)

**Implemented Links:**
- Featured story (large card)
- Story grid with multiple stories
- Pagination (if many stories)
- Category filters (if implemented)
- Individual story cards â†’ detail pages

#### Programs Page (`/programs`)

**Implemented Links:**
- Program category cards
- Individual program details â†’ `/programs/[slug]`
- "Support This Program" â†’ `/donate`

#### Events Page (`/events`)

**Implemented Links:**
- Featured upcoming event
- Event grid
- Event categories
- Register links â†’ `/events/[slug]/register`
- Individual event details â†’ `/events/[slug]`

#### Podcasts Page (`/podcasts`)

**Implemented Links:**
- Latest episode featured
- Episode archive
- Highlights carousel
- All episodes â†’ `/podcasts/episodes`
- All highlights â†’ `/podcasts/highlights`

---

## Internal Linking Best Practices

### âœ… DO:

1. **Use Descriptive Anchor Text**
   ```tsx
   // Good
   <Link href="/programs/education">
     education programs in rural Nepal
   </Link>
   
   // Bad
   <Link href="/programs/education">
     click here
   </Link>
   ```

2. **Link to Relevant Content**
   - Only link when it adds value
   - Link to related topics naturally
   - Don't force links

3. **Use Natural Language**
   ```tsx
   // Good
   "Learn more about our autism support initiative in Nepal"
   
   // Bad
   "autism support program autism support Nepal autism"
   ```

4. **Prioritize Important Pages**
   - More internal links = higher perceived importance
   - Link to key conversion pages (donate, contact)
   - Highlight new or important content

5. **Keep Links Visible and Accessible**
   - Distinguish links from regular text
   - Use proper contrast ratios
   - Include focus states for keyboard navigation

### âŒ DON'T:

1. **Don't Use Generic Anchor Text**
   - Avoid "click here", "read more", "this page"
   - Be specific and descriptive

2. **Don't Over-Link**
   - Too many links can be overwhelming
   - Quality over quantity
   - 2-5 contextual links per content section is ideal

3. **Don't Link to Irrelevant Pages**
   - Every link should add value
   - Maintain topical relevance

4. **Don't Use Same Anchor Text to Different Pages**
   - Confuses users and search engines
   - Each link should be unique and descriptive

5. **Don't Forget NoFollow When Appropriate**
   - User-generated content links
   - Paid links (though rare for non-profits)
   - Untrusted external content

---

## Link Patterns by Content Type

### Story Content Linking

**Within Story Content:**
```tsx
// Reference related program
"This success story is from our <Link href="/programs/education-karnali">
education program in Karnali</Link>."

// Link to related story
"Similar to <Link href="/stories/rameshs-journey">Ramesh's journey</Link>, 
this shows the impact of early intervention."

// Call to action
"<Link href="/donate">Support stories like this</Link> with your donation."
```

**At End of Story:**
- Related stories (3-4 stories)
- Related program link
- Donation CTA
- Share options

### Program Content Linking

**Within Program Content:**
```tsx
// Link to related stories
"Read about <Link href="/stories/education-success">children who benefited</Link> 
from this program."

// Link to events
"Join our <Link href="/events/education-workshop">upcoming workshop</Link> 
to learn more."

// Link to impact metrics
"See our <Link href="/impact">overall impact</Link> across all programs."
```

**At End of Program:**
- Related programs
- Success stories from this program
- Donation CTA specific to program
- Contact for partnership

### Event Content Linking

**Within Event Content:**
```tsx
// Link to related programs
"This event supports our <Link href="/programs/autism-awareness">
autism awareness program</Link>."

// Link to past events
"Similar to our <Link href="/events/2025-conference">2025 conference</Link>, 
this event will feature..."

// Link to stories
"Hear from <Link href="/stories/parent-testimonials">parents and caregivers</Link> 
at the event."
```

---

## Content Clusters Strategy

### Cluster 1: Education

**Pillar Page:** `/programs` (Education section)

**Supporting Content:**
- `/programs/education-karnali`
- `/programs/school-building`
- `/stories/education-success-stories`
- `/events/education-workshop`

**Internal Linking:**
- All supporting pages link back to pillar
- Pillar links to all supporting content
- Supporting pages cross-link when relevant

### Cluster 2: Autism Support

**Pillar Page:** `/programs` (Autism section) or `/our-story`

**Supporting Content:**
- `/programs/autism-support`
- `/stories/autism-stories`
- `/podcasts` (Living With Autism series)
- `/events/autism-awareness`

**Internal Linking:**
- Podcast episodes link to related stories
- Stories link to programs
- Events link to both programs and stories

### Cluster 3: Community Impact

**Pillar Page:** `/impact`

**Supporting Content:**
- All program pages
- Success stories
- Testimonials
- Impact statistics

**Internal Linking:**
- Impact page links to all programs
- Programs link back to impact
- Stories reference impact metrics

---

## Implementing New Links

### When Creating New Content

1. **Identify Related Content**
   - Find 2-3 related stories, programs, or pages
   - Ensure topical relevance

2. **Add Contextual Links**
   - Within first paragraph (if relevant)
   - In body content (2-3 links)
   - At end of content (related content section)

3. **Use Natural Anchor Text**
   - Extract phrase from context
   - Make it descriptive
   - Keep it concise (3-5 words ideal)

4. **Update Related Pages**
   - Add reciprocal links when appropriate
   - Update "Related Content" sections

### Code Example

```tsx
// In a story about education
export default function StoryPage({ story }: Props) {
  return (
    <article>
      <h1>{story.title}</h1>
      
      <div className="prose">
        <p>
          In 2024, our{" "}
          <Link 
            href="/programs/education-karnali"
            className="text-primary hover:underline"
          >
            education program in Karnali
          </Link>
          {" "}reached over 500 students...
        </p>
        
        {/* Story content */}
        
        <p>
          Want to help?{" "}
          <Link 
            href="/donate"
            className="font-semibold text-primary hover:underline"
          >
            Support our education programs
          </Link>
          {" "}today.
        </p>
      </div>
      
      {/* Related content section */}
      <section className="mt-12">
        <h2>Related Stories</h2>
        <div className="grid gap-6">
          {relatedStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </article>
  )
}
```

---

## Monitoring Internal Links

### Monthly Checks

1. **Broken Link Audit**
   - Use tools like Screaming Frog or Ahrefs
   - Fix or redirect broken links
   - Update changed URLs

2. **Top Linked Pages**
   - Review most linked pages
   - Ensure important pages have adequate links
   - Redistribute links if needed

3. **Orphan Pages**
   - Identify pages with no internal links
   - Add contextual links from relevant pages
   - Consider if page should be indexed

4. **Link Distribution**
   - Check if link authority is well distributed
   - Important pages should have more internal links
   - Balance between old and new content

### Tools to Use

- **Google Search Console:**
  - Check internal link counts
  - Identify crawl issues

- **Screaming Frog SEO Spider:**
  - Crawl entire site
  - Export all internal links
  - Identify broken links

- **Ahrefs / SEMrush:**
  - Internal link analysis
  - Page authority distribution
  - Link opportunities

---

## Action Items for Content Team

### Immediate (This Week)

1. **Review Top 10 Pages**
   - [ ] Homepage
   - [ ] About page
   - [ ] Programs page
   - [ ] Stories page
   - [ ] Top 3 story details
   - [ ] Top 3 program details

2. **Add Missing Links**
   - [ ] Link stories to related programs
   - [ ] Link programs to success stories
   - [ ] Add donation CTAs where appropriate

3. **Fix Generic Anchor Text**
   - [ ] Replace "click here" with descriptive text
   - [ ] Replace "read more" with specific titles
   - [ ] Update "learn more" to be more specific

### Ongoing (Monthly)

1. **New Content Checklist**
   - [ ] Identify 3 related pieces of content
   - [ ] Add contextual links in body
   - [ ] Add related content section at end
   - [ ] Update related pages to link back

2. **Content Updates**
   - [ ] Review old content monthly
   - [ ] Add links to new relevant content
   - [ ] Update outdated links
   - [ ] Remove broken links

3. **Link Audit**
   - [ ] Run broken link check
   - [ ] Review orphan pages
   - [ ] Check link distribution
   - [ ] Update internal link report

---

## Measuring Success

### Key Metrics

1. **Google Search Console**
   - Internal links per page
   - Click-through rate improvements
   - Ranking improvements for linked pages

2. **Google Analytics**
   - Pages per session (target: >2.5)
   - Bounce rate (target: <50%)
   - Average session duration (target: >2 minutes)
   - Internal link click rate

3. **User Behavior**
   - Scroll depth on content pages
   - Time on related content
   - Conversion rate from internal links

### Success Indicators

- âœ“ Average 3-5 internal links per content page
- âœ“ <5% broken links site-wide
- âœ“ No orphan pages (0 internal links)
- âœ“ Key pages have >10 internal links pointing to them
- âœ“ New content receives links within 1 week of publishing

---

## Resources

### Internal Resources
- SEO Guide: `docs/SEO_GUIDE.md`
- Content Guidelines: Section in SEO Guide
- Link patterns: This document

### External Resources
- [Google: Link Best Practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Moz: Internal Linking](https://moz.com/learn/seo/internal-link)
- [Ahrefs: Internal Linking Guide](https://ahrefs.com/blog/internal-links-for-seo/)

---

## Examples of Good Internal Linking

### Example 1: Story with Contextual Links

```
Title: "Empowering Children with Autism in Nepal"

Content:
"Through our autism support program in Kathmandu, 10-year-old Maya 
has made remarkable progress. Her journey began when her parents 
attended one of our parent training workshops last year.

Today, Maya attends regular school with support from our inclusive 
education initiative, which has helped over 200 children integrate 
into mainstream classrooms across Nepal.

Stories like Maya's inspire our continued work. Learn how you can 
support our mission to empower every child in Nepal."

Links:
- "autism support program in Kathmandu" â†’ /programs/autism-support
- "parent training workshops" â†’ /events/parent-training
- "inclusive education initiative" â†’ /programs/inclusive-education
- "support our mission" â†’ /donate
```

### Example 2: Program with Related Content

```
Program: "Education in Karnali"

Page includes:
- Link to impact page showing program results
- Link to 3 success stories from this program
- Link to upcoming events related to education
- Link to donate with program-specific tracking
- Link to volunteer opportunities in education
```

---

## Conclusion

A strong internal linking strategy benefits both SEO and user experience. By following the guidelines in this document and consistently implementing contextual links, the Deesha Foundation website will:

- Improve search engine rankings
- Increase user engagement
- Reduce bounce rates
- Better distribute page authority
- Guide users to conversion pages
- Create clear content relationships

**Remember:** Every new piece of content is an opportunity to strengthen your internal linking structure. Make it a habit to add 3-5 relevant internal links to every new page you create.

---

*Last Updated: September 12, 2026*  
*Maintained By: Content & Development Teams*
