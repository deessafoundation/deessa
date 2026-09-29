# Programs CMS Quick Reference

**TL;DR:** Build a Supabase-powered dynamic Programs CMS following the proven Events Module pattern.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    USER REQUESTS                        │
│                  /whatwedo/autism-support               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   NEXT.JS APP                           │
│  ┌────────────────┐              ┌─────────────────┐   │
│  │  /whatwedo     │              │  /admin/programs│   │
│  │  (Public List) │              │  (Admin Panel)  │   │
│  └────────────────┘              └─────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  programs   │  │program_      │  │program_      │  │
│  │  (main)     │  │sections      │  │media         │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
│  ┌─────────────┐  ┌──────────────┐                    │
│  │program_     │  │program_faqs  │                    │
│  │statistics   │  │              │                    │
│  └─────────────┘  └──────────────┘                    │
│                                                         │
│  Storage: programs/ (images)                           │
└─────────────────────────────────────────────────────────┘
```

---

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `programs` | Core program info | title, slug, description, status, category |
| `program_sections` | Repeatable content blocks | section_type, title, description, icon |
| `program_media` | Image gallery | image_url, media_type, display_order |
| `program_statistics` | Impact metrics | stat_value, stat_label, color |
| `program_faqs` | Q&A | question, answer |

---

## Key Improvements Over Original Plan

### ✅ What's Better

1. **Flexible Content:** Sections table allows unlimited highlights/approaches/testimonials
2. **Rich Media:** Gallery instead of 2 fixed images
3. **Dynamic Stats:** Database-driven impact numbers (not hardcoded)
4. **Preview Mode:** Safe review before publishing
5. **Related Content:** Link to stories, events, team members
6. **FAQs:** Built-in Q&A system

### 📊 Data Model Comparison

**Original Plan (Single Table):**
```
programs
├── title
├── description
├── hero_title
├── hero_description
├── why_it_matters
├── cover_image
└── hero_image
```

**Improved Plan (Relational):**
```
programs (main)
├── program_sections (1:many)
├── program_media (1:many)
├── program_statistics (1:many)
└── program_faqs (1:many)
```

**Why?** Easier to add/remove content without schema changes.

---

## Admin Panel Structure

```
/admin/programs
├── List Page (search, filter, stats)
├── /new (create form)
└── /[id]/edit (multi-tab editor)
    ├── Tab 1: Basic Info
    ├── Tab 2: Hero & Visuals
    ├── Tab 3: Content Sections
    ├── Tab 4: Gallery
    ├── Tab 5: Statistics
    ├── Tab 6: FAQs
    ├── Tab 7: SEO
    └── Tab 8: Settings
```

---

## Public Frontend Structure

### `/whatwedo` (List Page)
- Hero with photo mosaic
- 4 Pillars grid (Awareness, Training, Resources, Advocacy)
- Filterable programs grid (fetch from DB)
- CTA banner

### `/whatwedo/[slug]` (Detail Page)
- Hero section
- Why It Matters
- What We Do (highlights)
- Our Approach
- Our Impact (statistics)
- Gallery
- FAQs
- Related programs/stories
- Get Involved CTA

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | Supabase Auth + RLS |
| Server Actions | Next.js Server Actions |
| Types | TypeScript + Zod |

---

## Security Checklist

- [x] RLS policies on all tables
- [x] Admin authentication required
- [x] Public can only view published programs
- [x] Image upload validation (type, size)
- [x] XSS prevention (sanitize HTML)
- [x] Preview tokens non-guessable (UUID)
- [x] SQL injection prevention (parameterized queries)

---

## Migration Steps

1. **Create tables:** Run `063-programs-cms-schema.sql`
2. **Seed data:** 3 default programs inserted
3. **Create storage bucket:** `programs` bucket
4. **Apply RLS:** Policies for public/admin access
5. **Test manually:** Insert, update, delete via Supabase UI

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Database & Types | 3 days | Schema + TypeScript types |
| 2. Server Actions | 4 days | CRUD + image upload |
| 3. Admin UI | 7 days | List + form + tabs |
| 4. Public Frontend | 7 days | List + detail pages |
| 5. Polish & Launch | 3 days | Testing + docs |

**Total:** 3-4 weeks (1 developer)

---

## File Structure

```
lib/
├── types/
│   └── programs.ts              (TypeScript types)
├── actions/
│   └── admin-programs.ts        (Server actions)
└── supabase/
    ├── client.ts
    └── server.ts

app/
├── admin/
│   └── programs/
│       ├── page.tsx             (List page)
│       ├── new/
│       │   └── page.tsx         (Create form)
│       └── [id]/
│           └── edit/
│               └── page.tsx     (Edit form)
├── (public)/
│   └── whatwedo/
│       ├── page.tsx             (Public list)
│       └── [slug]/
│           └── page.tsx         (Detail page)
└── api/
    └── programs/
        └── route.ts             (API endpoint)

scripts/
└── 063-programs-cms-schema.sql  (Migration)

components/
└── admin/
    └── programs/
        ├── ProgramForm.tsx
        ├── SectionEditor.tsx
        ├── MediaUploader.tsx
        ├── StatisticsEditor.tsx
        └── FAQEditor.tsx
```

---

## Example Queries

### Fetch all published programs
```typescript
const { data } = await supabase
  .from('programs')
  .select('*')
  .eq('status', 'published')
  .order('display_order')
```

### Fetch program with all relations
```typescript
const { data } = await supabase
  .from('programs')
  .select(`
    *,
    sections:program_sections(*),
    media:program_media(*),
    statistics:program_statistics(*),
    faqs:program_faqs(*)
  `)
  .eq('slug', slug)
  .single()
```

### Create program
```typescript
const { data } = await supabase
  .from('programs')
  .insert({
    title: 'New Program',
    slug: 'new-program',
    description: 'Description',
    category: 'autism',
    status: 'draft'
  })
  .select()
  .single()
```

### Upload image
```typescript
const { data } = await supabase.storage
  .from('programs')
  .upload(`${programId}/${filename}`, file)

const publicUrl = supabase.storage
  .from('programs')
  .getPublicUrl(data.path).data.publicUrl
```

---

## Testing Scenarios

### Admin Panel
1. Create program → should save as draft
2. Upload images → should appear in gallery
3. Add highlights → should reorder via drag-drop
4. Generate preview token → should open preview
5. Publish program → should appear on public site
6. Search programs → should filter correctly

### Public Site
1. Visit /whatwedo → should list published programs
2. Filter by category → should show filtered results
3. Click program → should show detail page
4. View with preview token → should show draft
5. No preview token on draft → should 404

---

## Common Pitfalls to Avoid

❌ **Don't store images in database** → Use Supabase Storage  
❌ **Don't make everything public** → Use RLS  
❌ **Don't forget indexes** → Slow queries  
❌ **Don't skip TypeScript types** → Runtime errors  
❌ **Don't ignore mobile responsive** → Bad UX  
❌ **Don't hardcode colors** → Use theme system  

---

## Performance Tips

1. **Use indexes** on commonly queried columns (status, category, slug)
2. **Limit SELECT fields** - don't fetch everything if you only need title
3. **Paginate lists** - don't load 1000 programs at once
4. **Optimize images** - Use Next.js Image component
5. **Cache published programs** - 60s TTL on public pages
6. **Use database views** for complex JOINs

---

## When to Use This System

✅ **Good For:**
- Dynamic program management
- Content that changes frequently
- Multiple admins editing content
- Need for preview before publish
- Programs with similar structure

❌ **Not Good For:**
- One-time static pages
- Highly custom layouts per program
- Real-time collaboration (use CMS like Sanity)

---

## Learn from Events Module

Your Events Module (050-events-module-schema.sql) is **excellent** and shows:
- Proper RLS policies
- Good use of CHECK constraints
- Cascading deletes (ON DELETE CASCADE)
- Helper functions
- Audit timestamps

**The Programs CMS follows the same proven pattern.**

---

## Questions?

1. Should programs link directly to donation campaigns?
2. Do you want A/B testing for CTAs?
3. Should there be program-specific volunteer forms?
4. Do you want revision history/rollback?
5. Should admins get notified on program edits?

---

## Ready to Start?

**Next Actions:**
1. Review the full architecture doc (`programs-cms-architecture-analysis.md`)
2. Run the migration script
3. Create TypeScript types
4. Build server actions
5. Start with admin list page
6. Then public detail page

Let me know which part you want to implement first!
