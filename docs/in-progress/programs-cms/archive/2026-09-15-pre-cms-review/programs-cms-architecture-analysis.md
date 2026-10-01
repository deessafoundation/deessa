# Programs CMS Architecture Analysis & Improvement Plan

**Date:** September 13, 2026  
**Project:** deessa Foundation Website  
**Objective:** Design and implement a Supabase-powered dynamic programs/CMS system

---

## Executive Summary

Your proposed architecture is **excellent and production-ready**. The Supabase + Next.js approach perfectly fits the deessa Foundation website. After analyzing your existing codebase, I've identified several **strategic improvements** and a clear implementation path.

**Key Finding:** You already have a mature **Events Module** (050-events-module-schema.sql) that we can **learn from and adapt** for the Programs CMS.

---

## Current State Analysis

### ✅ What You Already Have

1. **Admin Panel Infrastructure**
   - Mature admin system at `/admin`
   - Existing admin authentication and roles (SUPER_ADMIN, ADMIN, EDITOR, FINANCE)
   - Admin users table and RLS policies
   - Established UI patterns (events page as reference)

2. **Database Foundation**
   - Supabase fully configured with @supabase/ssr
   - Storage buckets system already in place
   - RLS policies pattern established
   - Helper functions pattern (is_admin_user())

3. **Events Module as Template**
   - Complete CRUD system: events, registrations, agenda, forms
   - Admin UI with search, filters, pagination
   - Image upload system
   - Status management (draft/published/archived)
   - Category system

4. **Frontend Patterns**
   - `/whatwedo` page exists with hardcoded data
   - Dynamic routing already set up (`/whatwedo/[slug]`)
   - Client components with filtering
   - Responsive design with brand styling

5. **Type Safety**
   - TypeScript throughout
   - Established type patterns (see `lib/types/events-module.ts`)
   - Server action patterns established

### ⚠️ Current Gaps

1. **No Programs Database Table**
   - Currently using hardcoded array in page.tsx
   - No admin UI to manage programs
   - No image storage for programs

2. **Limited Whatwedo Content**
   - Only 3 hardcoded programs
   - No dynamic content sections
   - No highlights, statistics, or dynamic features

3. **No Content Relationships**
   - Programs not linked to stories, events, or team members
   - Missing "impact metrics" per program
   - No "related programs" functionality

---

## Improved Architecture Plan

### Proposed Database Schema

I recommend **5 core tables** + 1 view:

```sql
1. programs                    -- Core program records
2. program_sections            -- Repeatable content blocks (highlights, approaches, etc.)
3. program_media               -- Image gallery per program
4. program_statistics          -- Impact metrics per program
5. program_faqs                -- Frequently asked questions per program
```

**View:**
```sql
programs_with_stats            -- JOIN view for admin/public consumption
```

---

### Table Schemas (Detailed)

#### 1. `programs` (Core Table)

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,              -- For cards
  description TEXT NOT NULL,                     -- Main overview
  
  -- Hero Section
  hero_title TEXT,
  hero_description TEXT,
  cover_image TEXT,                              -- Card thumbnail
  hero_image TEXT,                               -- Detail page hero
  
  -- Content Sections
  why_it_matters TEXT,                           -- Problem/context section
  our_approach TEXT,                             -- How we solve it
  impact_statement TEXT,                         -- Impact summary
  
  -- Categorization
  category TEXT NOT NULL 
    CHECK (category IN ('autism', 'education', 'health', 'empowerment', 'training', 'advocacy', 'relief')),
  
  -- Visual Identity
  category_label TEXT NOT NULL,                  -- Display label (e.g., "🧩 AUTISM SUPPORT")
  category_color TEXT DEFAULT 'bg-gray-500',     -- Tailwind class for badge
  theme_color TEXT DEFAULT '#29b6c8',            -- Hex for accents
  
  -- Status & Publishing
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  -- CTA Configuration
  cta_label TEXT DEFAULT 'Get Involved',
  cta_url TEXT DEFAULT '/donate',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  
  -- Audit
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_programs_status_order ON programs(status, display_order);
CREATE INDEX idx_programs_category ON programs(category, status);
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_featured ON programs(is_featured, status) WHERE is_featured = TRUE;
```

#### 2. `program_sections` (Repeatable Content Blocks)

```sql
CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Section Type
  section_type TEXT NOT NULL 
    CHECK (section_type IN ('highlight', 'approach', 'impact', 'testimonial', 'partner')),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,                                     -- Icon name or emoji
  image_url TEXT,                                -- Optional image
  
  -- Metadata
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_sections_program ON program_sections(program_id, display_order);
CREATE INDEX idx_program_sections_type ON program_sections(program_id, section_type);
```

**Example Usage:**
- **Highlights:** "What We Do" bullet points
- **Approaches:** Step-by-step methodology
- **Impact:** Success stories snippets
- **Testimonials:** Quotes from beneficiaries
- **Partners:** Supporting organizations

#### 3. `program_media` (Image Gallery)

```sql
CREATE TABLE program_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Media Info
  image_url TEXT NOT NULL,                       -- Supabase Storage path
  image_alt TEXT,
  caption TEXT,
  
  -- Type
  media_type TEXT NOT NULL DEFAULT 'gallery'
    CHECK (media_type IN ('gallery', 'hero', 'thumbnail', 'before_after', 'team')),
  
  -- Ordering
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_media_program ON program_media(program_id, display_order);
```

#### 4. `program_statistics` (Impact Metrics)

```sql
CREATE TABLE program_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Stat Display
  stat_value TEXT NOT NULL,                      -- "500+", "Rs 2.5M", "25"
  stat_label TEXT NOT NULL,                      -- "families supported"
  stat_sublabel TEXT,                            -- "since 2020"
  
  -- Visual
  icon TEXT,
  color TEXT DEFAULT '#29b6c8',
  
  -- Ordering
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_stats_program ON program_statistics(program_id, display_order);
```

#### 5. `program_faqs` (Frequently Asked Questions)

```sql
CREATE TABLE program_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_faqs_program ON program_faqs(program_id, display_order);
```

---

### Storage Buckets

```sql
-- Create programs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('programs', 'programs', true);

-- RLS Policies
CREATE POLICY "Public can view program images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'programs');

CREATE POLICY "Admins can upload program images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'programs' 
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  );

CREATE POLICY "Admins can update program images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'programs' 
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  );

CREATE POLICY "Admins can delete program images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'programs' 
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  );
```

---

### RLS Policies

```sql
-- PUBLIC: Read published programs
CREATE POLICY "Public can view published programs"
  ON programs FOR SELECT
  USING (status = 'published');

-- ADMIN: Full access
CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  USING (is_admin_user());

-- Similar policies for child tables (program_sections, program_media, etc.)
```

---

## Architecture Improvements

### 1. **Enhanced Content Flexibility**

Your original plan had most content in the main table. I'm recommending **related tables** because:

✅ **Admin can add/remove highlights without schema changes**  
✅ **Flexible image galleries** (not just 1-2 images)  
✅ **Dynamic statistics** that update independently  
✅ **Section reordering** via drag-and-drop (display_order)  

### 2. **Related Content System**

Add relationships to existing tables:

```sql
-- Link programs to stories
ALTER TABLE stories ADD COLUMN program_id UUID REFERENCES programs(id);
CREATE INDEX idx_stories_program ON stories(program_id);

-- Link programs to events
ALTER TABLE events ADD COLUMN program_id UUID REFERENCES events(id);
CREATE INDEX idx_events_program ON events(program_id);

-- Link programs to projects (if you use them)
ALTER TABLE projects ADD COLUMN program_id UUID REFERENCES programs(id);
```

**Why?** This lets you show:
- "Stories from this program" on detail pages
- "Upcoming events" for a program
- "Active projects" under a program

### 3. **Preview Mode**

Add to `programs` table:

```sql
ALTER TABLE programs ADD COLUMN preview_token TEXT UNIQUE;
```

**Flow:**
1. Admin clicks "Preview" → generates token
2. Opens `/whatwedo/[slug]?preview=<token>`
3. Page shows draft content if token valid
4. No need to publish to see changes

### 4. **Revision History** (Optional)

```sql
CREATE TABLE program_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  revision_data JSONB NOT NULL,              -- Full program snapshot
  changed_by UUID REFERENCES admin_users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Why?** Rollback capability if content changes break something.

### 5. **Slug Auto-Generation**

Add a database function:

```sql
CREATE OR REPLACE FUNCTION generate_unique_slug(p_title TEXT, p_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Convert title to slug
  base_slug := lower(trim(regexp_replace(p_title, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  final_slug := base_slug;
  
  -- Check uniqueness
  WHILE EXISTS (
    SELECT 1 FROM programs 
    WHERE slug = final_slug 
    AND (p_id IS NULL OR id != p_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
```

---

## Admin Panel UI Structure

### Navigation Addition

```
Content
│
├── Programs          ← NEW
├── Stories
├── Events
└── ...
```

### `/admin/programs` (List Page)

**UI Components:**
- Search bar (search by title, description, category)
- Filter dropdown (status, category, featured)
- Sort options (newest, oldest, alphabetical, display order)
- Stats cards (Total, Published, Drafts, Featured)
- Table/Grid view toggle

**Table Columns:**
- Thumbnail image
- Title + Short description
- Category badge
- Status badge
- Featured star icon
- Display order
- Actions (Edit, View, Duplicate, Delete)

**Actions:**
- + Create Program
- Bulk actions (Publish, Archive, Delete)
- Drag-to-reorder (for display_order)

### `/admin/programs/new` & `/admin/programs/[id]/edit` (Form)

**Multi-tab Interface:**

#### Tab 1: Basic Information
- Program Name
- URL Slug (auto-generated, editable)
- Category dropdown
- Category Label (emoji + text)
- Short Description (textarea, 200 char limit)
- Full Description (rich text editor)
- Status (Draft/Published)
- Featured toggle
- Display Order

#### Tab 2: Hero & Visuals
- Hero Title
- Hero Description
- Cover Image (card thumbnail) - Upload + URL input
- Hero Image (detail page) - Upload + URL input
- Theme Color picker

#### Tab 3: Content Sections
- Why It Matters (rich text)
- Our Approach (rich text)
- Impact Statement (rich text)

**Highlights Section:**
- List of highlights (title, description, icon)
- + Add Highlight button
- Drag to reorder
- Delete individual highlights

#### Tab 4: Gallery
- Image upload area (drag & drop)
- Grid of uploaded images
- Reorder images
- Set featured image
- Add captions/alt text

#### Tab 5: Statistics
- List of stats (value, label, sublabel, icon)
- + Add Statistic button
- Inline editing
- Reorder stats

#### Tab 6: FAQs
- Accordion of Q&As
- + Add FAQ button
- Expand/collapse all

#### Tab 7: SEO
- Meta Title
- Meta Description
- OG Image
- Preview card

#### Tab 8: Settings
- CTA Button label
- CTA Button URL
- Related programs picker
- Preview token generation

**Footer Actions:**
- Save Draft
- Preview (opens in new tab)
- Publish
- Delete

---

## Public Frontend Structure

### `/whatwedo` (Updated)

**Changes from current:**
1. Fetch programs from database instead of hardcoded array
2. Add filtering by category (same UI)
3. Add "Featured Programs" section at top
4. Add stats summary (Total programs, Categories, Families helped)

### `/whatwedo/[slug]` (Detail Page)

**Proposed Layout:**

```
┌─────────────────────────────────────┐
│           HERO SECTION              │
│   Hero Image + Title + Description  │
│   CTA Button                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       WHY IT MATTERS               │
│   Problem/context explanation       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        WHAT WE DO                  │
│   Grid of highlights                │
│   (from program_sections)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        OUR APPROACH                │
│   Step-by-step methodology          │
│   (from program_sections)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        OUR IMPACT                  │
│   Statistics grid                   │
│   (from program_statistics)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        GALLERY                     │
│   Image carousel/grid               │
│   (from program_media)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        FAQs                        │
│   Accordion                         │
│   (from program_faqs)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     RELATED PROGRAMS               │
│   Cards of 3 related programs       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     RELATED STORIES                │
│   Stories tagged with this program  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        GET INVOLVED                │
│   Donate | Volunteer | Partner      │
└─────────────────────────────────────┘
```

---

## Type Definitions

**File:** `lib/types/programs.ts`

```typescript
export type ProgramStatus = 'draft' | 'published' | 'archived'

export type ProgramCategory = 
  | 'autism' 
  | 'education' 
  | 'health' 
  | 'empowerment' 
  | 'training' 
  | 'advocacy' 
  | 'relief'

export type SectionType = 
  | 'highlight' 
  | 'approach' 
  | 'impact' 
  | 'testimonial' 
  | 'partner'

export type MediaType = 
  | 'gallery' 
  | 'hero' 
  | 'thumbnail' 
  | 'before_after' 
  | 'team'

export interface Program {
  id: string
  title: string
  slug: string
  short_description: string
  description: string
  
  hero_title: string | null
  hero_description: string | null
  cover_image: string | null
  hero_image: string | null
  
  why_it_matters: string | null
  our_approach: string | null
  impact_statement: string | null
  
  category: ProgramCategory
  category_label: string
  category_color: string
  theme_color: string
  
  status: ProgramStatus
  is_featured: boolean
  display_order: number
  
  cta_label: string
  cta_url: string
  
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  
  preview_token: string | null
  
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProgramSection {
  id: string
  program_id: string
  section_type: SectionType
  title: string
  description: string | null
  icon: string | null
  image_url: string | null
  display_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface ProgramMedia {
  id: string
  program_id: string
  image_url: string
  image_alt: string | null
  caption: string | null
  media_type: MediaType
  display_order: number
  is_featured: boolean
  uploaded_at: string
}

export interface ProgramStatistic {
  id: string
  program_id: string
  stat_value: string
  stat_label: string
  stat_sublabel: string | null
  icon: string | null
  color: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProgramFAQ {
  id: string
  program_id: string
  question: string
  answer: string
  display_order: number
  created_at: string
}

// Full program with all relations
export interface ProgramWithRelations extends Program {
  sections: ProgramSection[]
  media: ProgramMedia[]
  statistics: ProgramStatistic[]
  faqs: ProgramFAQ[]
  related_stories?: Story[]
  related_events?: Event[]
}

// Input types for server actions
export interface CreateProgramInput {
  title: string
  slug?: string
  short_description: string
  description: string
  category: ProgramCategory
  category_label: string
  hero_title?: string
  hero_description?: string
  cover_image?: string
  hero_image?: string
  status?: ProgramStatus
}

export interface UpdateProgramInput extends Partial<CreateProgramInput> {
  id: string
}
```

---

## Server Actions Structure

**File:** `lib/actions/admin-programs.ts`

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Program, CreateProgramInput, UpdateProgramInput } from '@/lib/types/programs'

export async function getPrograms(filters?: {
  status?: string
  category?: string
  search?: string
}) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('programs')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Program[]
}

export async function getProgramBySlug(slug: string, previewToken?: string) {
  const supabase = await createServerClient()
  
  let query = supabase
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
  
  // If preview token provided, skip status check
  if (!previewToken) {
    query = query.eq('status', 'published')
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // Verify preview token if provided
  if (previewToken && data.preview_token !== previewToken) {
    throw new Error('Invalid preview token')
  }
  
  return data
}

export async function createProgram(input: CreateProgramInput) {
  const supabase = await createServerClient()
  
  // Auto-generate slug if not provided
  const slug = input.slug || generateSlug(input.title)
  
  const { data, error } = await supabase
    .from('programs')
    .insert({ ...input, slug })
    .select()
    .single()
  
  if (error) throw error
  return data as Program
}

export async function updateProgram(input: UpdateProgramInput) {
  const supabase = await createServerClient()
  
  const { id, ...updates } = input
  
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Program
}

export async function deleteProgram(id: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

export async function generatePreviewToken(programId: string) {
  const supabase = await createServerClient()
  
  const token = crypto.randomUUID()
  
  const { error } = await supabase
    .from('programs')
    .update({ preview_token: token })
    .eq('id', programId)
  
  if (error) throw error
  return token
}

// Helper function
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
```

---

## API Routes (Optional)

For client-side fetching:

**File:** `app/api/programs/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  
  const supabase = await createServerClient()
  
  let query = supabase
    .from('programs')
    .select('*')
    .eq('status', 'published')
    .order('display_order')
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ programs: data })
}
```

---

## Migration Script

**File:** `scripts/db/migrations/063-programs-cms-schema.sql`

```sql
-- =============================================
-- PROGRAMS CMS SCHEMA
-- Migration: 063-programs-cms-schema.sql
-- Date: September 13, 2026
-- =============================================

-- 1. PROGRAMS TABLE
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Hero Section
  hero_title TEXT,
  hero_description TEXT,
  cover_image TEXT,
  hero_image TEXT,
  
  -- Content Sections
  why_it_matters TEXT,
  our_approach TEXT,
  impact_statement TEXT,
  
  -- Categorization
  category TEXT NOT NULL 
    CHECK (category IN ('autism', 'education', 'health', 'empowerment', 'training', 'advocacy', 'relief')),
  category_label TEXT NOT NULL,
  category_color TEXT DEFAULT 'bg-gray-500',
  theme_color TEXT DEFAULT '#29b6c8',
  
  -- Status & Publishing
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  -- CTA Configuration
  cta_label TEXT DEFAULT 'Get Involved',
  cta_url TEXT DEFAULT '/donate',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  
  -- Preview
  preview_token TEXT UNIQUE,
  
  -- Audit
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_programs_status_order ON programs(status, display_order);
CREATE INDEX idx_programs_category ON programs(category, status);
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_featured ON programs(is_featured, status) WHERE is_featured = TRUE;

-- RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published programs"
  ON programs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  USING (is_admin_user());

-- 2. PROGRAM SECTIONS
CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  section_type TEXT NOT NULL 
    CHECK (section_type IN ('highlight', 'approach', 'impact', 'testimonial', 'partner')),
  
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_sections_program ON program_sections(program_id, display_order);

ALTER TABLE program_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sections for published programs"
  ON program_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_sections.program_id 
      AND programs.status = 'published'
    )
  );

CREATE POLICY "Admins can manage sections"
  ON program_sections FOR ALL
  USING (is_admin_user());

-- 3. PROGRAM MEDIA
CREATE TABLE program_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  image_alt TEXT,
  caption TEXT,
  
  media_type TEXT NOT NULL DEFAULT 'gallery'
    CHECK (media_type IN ('gallery', 'hero', 'thumbnail', 'before_after', 'team')),
  
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_media_program ON program_media(program_id, display_order);

ALTER TABLE program_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media for published programs"
  ON program_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_media.program_id 
      AND programs.status = 'published'
    )
  );

CREATE POLICY "Admins can manage media"
  ON program_media FOR ALL
  USING (is_admin_user());

-- 4. PROGRAM STATISTICS
CREATE TABLE program_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  stat_value TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  stat_sublabel TEXT,
  
  icon TEXT,
  color TEXT DEFAULT '#29b6c8',
  
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_stats_program ON program_statistics(program_id, display_order);

ALTER TABLE program_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stats for published programs"
  ON program_statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_statistics.program_id 
      AND programs.status = 'published'
    )
  );

CREATE POLICY "Admins can manage statistics"
  ON program_statistics FOR ALL
  USING (is_admin_user());

-- 5. PROGRAM FAQs
CREATE TABLE program_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_faqs_program ON program_faqs(program_id, display_order);

ALTER TABLE program_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view FAQs for published programs"
  ON program_faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE programs.id = program_faqs.program_id 
      AND programs.status = 'published'
    )
  );

CREATE POLICY "Admins can manage FAQs"
  ON program_faqs FOR ALL
  USING (is_admin_user());

-- 6. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('programs', 'programs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public can view program images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'programs');

CREATE POLICY "Admins can upload program images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'programs' AND is_admin_user());

CREATE POLICY "Admins can update program images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'programs' AND is_admin_user());

CREATE POLICY "Admins can delete program images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'programs' AND is_admin_user());

-- 7. HELPER VIEW
CREATE OR REPLACE VIEW programs_with_stats AS
SELECT 
  p.*,
  COUNT(DISTINCT ps.id) as sections_count,
  COUNT(DISTINCT pm.id) as media_count,
  COUNT(DISTINCT pst.id) as statistics_count,
  COUNT(DISTINCT pf.id) as faqs_count
FROM programs p
LEFT JOIN program_sections ps ON p.id = ps.program_id
LEFT JOIN program_media pm ON p.id = pm.program_id
LEFT JOIN program_statistics pst ON p.id = pst.program_id
LEFT JOIN program_faqs pf ON p.id = pf.program_id
GROUP BY p.id;

-- 8. SEED DEFAULT PROGRAMS
INSERT INTO programs (
  title, slug, short_description, description, category, category_label, 
  category_color, cover_image, status, is_featured, display_order
) VALUES 
(
  'Every Mind Is a Gift',
  'autism-support',
  'Therapy, family counseling, and inclusive education programs for children with autism across Nepal.',
  'Our autism support program provides comprehensive therapy, family counseling, and inclusive education to help children with autism thrive. We work directly with families, educators, and communities to create supportive environments.',
  'autism',
  '🧩 AUTISM SUPPORT',
  'bg-orange-500',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  'published',
  true,
  1
),
(
  'Women Who Lead, Communities That Thrive',
  'women-empowerment',
  'Skill development, microfinance access, and leadership training for women across 25 districts.',
  'We empower women through vocational training, microfinance access, and leadership development programs. Our goal is to create self-sufficient entrepreneurs and community leaders.',
  'empowerment',
  '👩 EMPOWERMENT',
  'bg-purple-500',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
  'published',
  true,
  2
),
(
  'Creative Expression, Lasting Skills',
  'art-training',
  'Art workshops and vocational training programs that equip youth with tools for sustainable livelihoods.',
  'Through art and creative expression, we teach youth practical skills that lead to sustainable livelihoods. Our programs combine creativity with vocational training.',
  'training',
  '🎨 TRAINING',
  'bg-teal-500',
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80',
  'published',
  true,
  3
);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
```

---

## Implementation Roadmap

### Phase 1: Database & Types (Week 1)
- [ ] Run migration script (063-programs-cms-schema.sql)
- [ ] Create TypeScript types (lib/types/programs.ts)
- [ ] Test database queries manually
- [ ] Verify RLS policies work

### Phase 2: Server Actions (Week 1-2)
- [ ] Create lib/actions/admin-programs.ts
- [ ] Implement CRUD operations
- [ ] Add image upload helpers
- [ ] Test with Postman/curl

### Phase 3: Admin UI (Week 2-3)
- [ ] Create /admin/programs list page
- [ ] Create /admin/programs/new form
- [ ] Create /admin/programs/[id]/edit form
- [ ] Add image upload UI
- [ ] Add drag-and-drop reordering

### Phase 4: Public Frontend (Week 3-4)
- [ ] Update /whatwedo page to fetch from DB
- [ ] Update /whatwedo/[slug] detail page
- [ ] Add preview mode
- [ ] Add SEO metadata
- [ ] Test responsiveness

### Phase 5: Polish & Launch (Week 4)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success toasts
- [ ] Migration documentation
- [ ] Admin training materials
- [ ] Launch 🚀

---

## Testing Checklist

### Database
- [ ] Programs can be created with all fields
- [ ] Sections can be added/reordered
- [ ] Media uploads work
- [ ] Statistics display correctly
- [ ] FAQs accordion works
- [ ] RLS policies block unauthorized access
- [ ] Public can view published programs only
- [ ] Admins can CRUD all data

### Admin Panel
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Form validation works
- [ ] Image upload works
- [ ] Preview generation works
- [ ] Delete has confirmation
- [ ] Bulk actions work

### Public Site
- [ ] Programs list loads
- [ ] Category filtering works
- [ ] Detail page renders correctly
- [ ] Related content shows up
- [ ] Preview mode works
- [ ] SEO tags present
- [ ] Mobile responsive
- [ ] Accessibility (keyboard nav, screen readers)

---

## Security Considerations

1. **RLS Policies**
   - ✅ Public can only read published programs
   - ✅ Admins need authentication
   - ✅ Prevent SQL injection via parameterized queries

2. **Image Upload**
   - ✅ File type validation (jpg, png, webp only)
   - ✅ File size limits (5MB max)
   - ✅ Sanitize filenames
   - ✅ Use Supabase Storage (not direct DB storage)

3. **Preview Tokens**
   - ✅ UUID-based (non-guessable)
   - ✅ Single-use or time-limited
   - ✅ Verified on every request

4. **XSS Prevention**
   - ✅ Sanitize HTML in rich text fields
   - ✅ Use DOMPurify for user-generated content
   - ✅ Escape special characters

---

## Performance Optimizations

1. **Database**
   - Indexes on commonly queried columns
   - Use `select('*')` sparingly
   - Implement pagination for lists

2. **Images**
   - Use Next.js Image component
   - Lazy load images below fold
   - Serve WebP format
   - Use Supabase image transformations

3. **Caching**
   - Cache published programs (60s TTL)
   - Invalidate on publish/update
   - Use Next.js ISR for detail pages

4. **API**
   - Rate limit API routes
   - Return only necessary fields
   - Use database views for complex joins

---

## Comparison with Your Original Plan

| Feature | Your Plan | Improved Plan | Benefit |
|---------|-----------|---------------|---------|
| Content flexibility | Single table | Related tables | Easier to add/remove content blocks |
| Media | 2-3 fixed images | Unlimited gallery | Richer storytelling |
| Statistics | Hardcoded | Dynamic table | Real-time updates |
| Preview | Not mentioned | Token-based | Safe pre-publish review |
| Related content | Not mentioned | Linked stories/events | Better navigation |
| FAQs | Not mentioned | Dedicated table | User self-service |
| Revision history | Not mentioned | Optional snapshots | Rollback capability |
| Slug generation | Manual | Auto + unique check | Prevents conflicts |

---

## Why This Is Better Than Your Original

1. **More Flexible:** Admin can add/remove sections without code changes
2. **Richer Content:** Support for galleries, FAQs, testimonials
3. **Better UX:** Preview mode, related content, structured sections
4. **Scalable:** Can handle 100+ programs without performance issues
5. **Maintainable:** Clear separation of concerns, TypeScript types
6. **Proven Pattern:** Mirrors your successful Events Module

---

## Next Steps

1. **Review this document** - Make sure you agree with the approach
2. **Run the migration** - Execute 063-programs-cms-schema.sql
3. **Create types** - lib/types/programs.ts
4. **Build server actions** - lib/actions/admin-programs.ts
5. **Start with admin list page** - /admin/programs
6. **Then detail page** - /whatwedo/[slug]

---

## Questions to Clarify

1. **Do you want revision history?** (Adds complexity but useful for rollback)
2. **Do you want related programs auto-suggested?** (Based on category/tags)
3. **Should programs link to donation campaigns?** (Direct funding per program)
4. **Do you want A/B testing for CTAs?** (Test different button text)
5. **Should there be program-specific contact forms?** (Inquiries per program)

Let me know which parts you'd like me to start implementing first!
