# Programs CMS - Complete Implementation Plan

**Status:** Design Finalized, Ready for Database Implementation  
**Last Updated:** September 15, 2026  
**Goal:** Make all program content manageable by admins through Supabase CMS

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Database Schema Design](#database-schema-design)
4. [Content Type Mapping](#content-type-mapping)
5. [Implementation Phases](#implementation-phases)
6. [Admin Interface Requirements](#admin-interface-requirements)
7. [Migration Strategy](#migration-strategy)
8. [Technical Architecture](#technical-architecture)

---

## Executive Summary

### What We Built (Phase 1: Design)
✅ **2 fully-designed program templates** with warm, compassionate NGO styling:
- **AAC Support** (Service Program) - 9 sections, split hero, list features
- **1000 Families Campaign** (Campaign Program) - 8 sections, progress tracker, timeline

✅ **11 reusable section components**:
- ProgramHero, RichTextSection, FeaturesSection, WhoWeSupportSection
- HowItWorksSection, StatsSection, QuoteSection, GallerySection
- ProgressTrackerSection, TimelineSection, CTASection

✅ **Complete TypeScript type system** in `lib/types/program-prototype.ts`

### What We Need (Phase 2: CMS Integration)
🎯 **Database schema** to store all program data in Supabase  
🎯 **Admin interface** for non-technical staff to create/edit programs  
🎯 **Dynamic page generation** from database instead of hardcoded files  
🎯 **Image uploads** to Supabase Storage  
🎯 **WYSIWYG editor** for rich text sections  

---

## Current State Analysis

### ✅ What's Working (Static Prototypes)

#### Data Structure
Current programs are defined in TypeScript files:
- `data/programs/aac-support.ts` (229 lines)
- `data/programs/1000-families.ts` (194 lines)

#### Type System
Complete TypeScript interfaces in `lib/types/program-prototype.ts`:
```typescript
// Core types
Program, ProgramHero, ProgramSection

// 13 section content types
RichTextContent, FeaturesContent, WhoWeSupportContent,
HowItWorksContent, StatsContent, QuoteContent, GalleryContent,
ProgressTrackerContent, TimelineContent, CTAContent, etc.

// Supporting types
Feature, TargetGroup, ProcessStep, TimelineItem,
Statistic, GalleryImage, CTAButton
```

#### Components
11 section components in `components/programs/sections/`:
- All components accept: `heading`, `content`, `theme`
- Fully responsive with animations
- WCAG AA accessible

#### Pages
Static pages at:
- `/demo/aac-support`
- `/demo/1000-families`

### ❌ What's Missing (CMS Requirements)

1. **No database storage** - Everything is hardcoded in TS files
2. **No admin interface** - Non-technical staff can't edit content
3. **No image management** - Images are hardcoded URLs
4. **No versioning** - Can't track changes or restore old versions
5. **No draft mode** - Changes go live immediately
6. **No SEO management** - Meta tags are hardcoded
7. **No analytics integration** - Can't track program performance

---

## Database Schema Design

### Core Tables

#### 1. `programs` (Master Table)
```sql
CREATE TABLE programs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic Info
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('service', 'campaign', 'outreach', 'research')),
  theme TEXT NOT NULL CHECK (theme IN ('warm', 'campaign', 'energetic', 'editorial')),
  eyebrow TEXT,
  short_description TEXT NOT NULL,
  tags TEXT[],
  
  -- Hero Section (JSONB for flexibility)
  hero JSONB NOT NULL,
  /* Expected structure:
  {
    "eyebrow": "🧩 AUTISM SUPPORT",
    "title": "Every Mind Is a Gift",
    "description": "Supporting children...",
    "image": "https://...",
    "imageAlt": "Child using AAC device",
    "layout": "split",
    "cta": {
      "label": "Get Support",
      "url": "/contact",
      "variant": "primary"
    },
    "secondaryCta": {
      "label": "Learn More →",
      "url": "#about"
    }
  }
  */
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  
  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
  ) STORED
);

CREATE INDEX programs_slug_idx ON programs(slug);
CREATE INDEX programs_category_idx ON programs(category);
CREATE INDEX programs_status_idx ON programs(status);
CREATE INDEX programs_search_idx ON programs USING GIN(search_vector);
CREATE INDEX programs_published_at_idx ON programs(published_at DESC);
```

#### 2. `program_sections` (Sections Table)
```sql
CREATE TABLE program_sections (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Section Info
  section_id TEXT NOT NULL, -- e.g., "about", "features", "how-it-works"
  type TEXT NOT NULL CHECK (type IN (
    'rich_text', 'features', 'who_we_support', 'how_it_works',
    'stats', 'quote', 'gallery', 'progress_tracker', 'timeline', 'cta'
  )),
  
  -- Display
  heading TEXT,
  subheading TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Content (JSONB for flexibility)
  content JSONB NOT NULL,
  
  -- Publishing
  is_visible BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(program_id, section_id)
);

CREATE INDEX program_sections_program_id_idx ON program_sections(program_id);
CREATE INDEX program_sections_order_idx ON program_sections(display_order);
```

#### 3. `program_images` (Image Assets)
```sql
CREATE TABLE program_images (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Image Info
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  url TEXT NOT NULL, -- Full public URL
  filename TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  
  -- Technical
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- bytes
  mime_type TEXT,
  
  -- Usage
  usage_type TEXT CHECK (usage_type IN ('hero', 'gallery', 'section', 'thumbnail')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX program_images_program_id_idx ON program_images(program_id);
```

#### 4. `program_versions` (Version History)
```sql
CREATE TABLE program_versions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Version Info
  version_number INTEGER NOT NULL,
  change_summary TEXT,
  
  -- Snapshot (entire program state)
  program_data JSONB NOT NULL,
  sections_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(program_id, version_number)
);

CREATE INDEX program_versions_program_id_idx ON program_versions(program_id);
```

---

## Content Type Mapping

### How TypeScript Types Map to JSONB

Each section's `content` field is stored as JSONB in `program_sections.content`. Here's how each type maps:

#### 1. Rich Text Content
```typescript
// TypeScript
interface RichTextContent {
  type: 'rich_text'
  body: string // HTML
}

// JSONB in database
{
  "type": "rich_text",
  "body": "<p class=\"lead\">Every child deserves...</p><h3>What is AAC?</h3>..."
}
```

#### 2. Features Content
```typescript
// TypeScript
interface FeaturesContent {
  type: 'features'
  layout: 'grid' | 'list'
  features: Feature[]
}

interface Feature {
  icon?: string
  title: string
  description: string
  link?: string
}

// JSONB in database
{
  "type": "features",
  "layout": "list",
  "features": [
    {
      "icon": "💬",
      "title": "Personalized AAC Strategies",
      "description": "Custom communication plans tailored..."
    },
    {
      "icon": "👨‍👩‍👧‍👦",
      "title": "Family & Caregiver Training",
      "description": "Comprehensive workshops..."
    }
  ]
}
```

#### 3. Who We Support Content
```typescript
// TypeScript
interface WhoWeSupportContent {
  type: 'who_we_support'
  targetGroups: TargetGroup[]
}

interface TargetGroup {
  icon?: string
  title: string
  ageRange?: string
  description: string
}

// JSONB in database
{
  "type": "who_we_support",
  "targetGroups": [
    {
      "icon": "🧒",
      "title": "Children with Autism",
      "ageRange": "2-12 years",
      "description": "Non-verbal or minimally verbal..."
    }
  ]
}
```

#### 4. How It Works Content
```typescript
// TypeScript
interface HowItWorksContent {
  type: 'how_it_works'
  steps: ProcessStep[]
}

interface ProcessStep {
  number: number
  title: string
  description: string
  icon?: string
}

// JSONB in database
{
  "type": "how_it_works",
  "steps": [
    {
      "number": 1,
      "title": "Initial Assessment",
      "description": "We meet your child and family..."
    },
    {
      "number": 2,
      "title": "Custom Plan Creation",
      "description": "We design a tailored AAC strategy..."
    }
  ]
}
```

#### 5. Stats Content
```typescript
// TypeScript
interface StatsContent {
  type: 'stats'
  stats: Statistic[]
}

interface Statistic {
  icon?: string
  value: string
  label: string
  sublabel?: string
}

// JSONB in database
{
  "type": "stats",
  "stats": [
    {
      "icon": "👨‍👩‍👧‍👦",
      "value": "500+",
      "label": "Families Supported",
      "sublabel": "Since 2020"
    }
  ]
}
```

#### 6. Quote Content
```typescript
// TypeScript
interface QuoteContent {
  type: 'quote'
  quote: string
  person: string
  role?: string
  location?: string
  photo?: string
}

// JSONB in database
{
  "type": "quote",
  "quote": "Before AAC, we didn't know what Maya needed...",
  "person": "Rajesh Kumar",
  "role": "Parent",
  "location": "Kathmandu, Nepal",
  "photo": "https://..."
}
```

#### 7. Gallery Content
```typescript
// TypeScript
interface GalleryContent {
  type: 'gallery'
  layout: 'grid' | 'masonry' | 'carousel'
  images: GalleryImage[]
}

interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

// JSONB in database
{
  "type": "gallery",
  "layout": "grid",
  "images": [
    {
      "url": "https://...",
      "alt": "Child using AAC device",
      "caption": "Learning to communicate with AAC tools"
    }
  ]
}
```

#### 8. Progress Tracker Content (Campaigns)
```typescript
// TypeScript
interface ProgressTrackerContent {
  type: 'progress_tracker'
  goal: number
  current: number
  unit: string
  startDate?: string
  endDate?: string
  daysLeft?: number
}

// JSONB in database
{
  "type": "progress_tracker",
  "goal": 1000,
  "current": 820,
  "unit": "families",
  "startDate": "January 1, 2024",
  "endDate": "December 31, 2024",
  "daysLeft": 87
}
```

#### 9. Timeline Content (Campaigns)
```typescript
// TypeScript
interface TimelineContent {
  type: 'timeline'
  items: TimelineItem[]
}

interface TimelineItem {
  date: string
  title: string
  description: string
  status?: 'completed' | 'active' | 'upcoming'
  image?: string
}

// JSONB in database
{
  "type": "timeline",
  "items": [
    {
      "date": "JAN-MAR",
      "title": "Launch Phase",
      "description": "250 families reached with initial training...",
      "status": "completed"
    }
  ]
}
```

#### 10. CTA Content
```typescript
// TypeScript
interface CTAContent {
  type: 'cta'
  title: string
  description: string
  buttons: CTAButton[]
  backgroundStyle?: 'gradient' | 'solid' | 'image'
}

interface CTAButton {
  label: string
  url: string
  variant: 'primary' | 'secondary' | 'outline'
  icon?: string
}

// JSONB in database
{
  "type": "cta",
  "title": "Ready to Get Started?",
  "description": "Every child deserves a voice...",
  "buttons": [
    {
      "label": "Contact Us",
      "url": "/contact",
      "variant": "primary"
    },
    {
      "label": "Download Brochure",
      "url": "/resources/aac-brochure.pdf",
      "variant": "outline"
    }
  ],
  "backgroundStyle": "gradient"
}
```

---

## Implementation Phases

### Phase 1: Foundation ✅ (COMPLETED)
**Duration:** Completed  
**Status:** ✅ Done

- [x] Design finalized (AAC Support, 1000 Families)
- [x] TypeScript types created
- [x] 11 section components built
- [x] Static prototypes working
- [x] Animations and accessibility implemented
- [x] Responsive design completed

### Phase 2: Database Setup 🎯 (NEXT)
**Duration:** 1-2 weeks  
**Status:** 🎯 Ready to start

#### Tasks:
1. **Create Migration Files**
   - [ ] `001-create-programs-table.sql`
   - [ ] `002-create-program-sections-table.sql`
   - [ ] `003-create-program-images-table.sql`
   - [ ] `004-create-program-versions-table.sql`
   - [ ] `005-create-indexes.sql`
   - [ ] `006-create-rls-policies.sql`

2. **Set Up Storage Bucket**
   - [ ] Create `program-images` bucket
   - [ ] Configure public access for published programs
   - [ ] Set up upload policies (10MB limit, image types only)
   - [ ] Create thumbnail generation function

3. **Create Database Functions**
   - [ ] `get_program_by_slug(slug TEXT)` → Returns full program with sections
   - [ ] `get_published_programs(category TEXT)` → List view
   - [ ] `create_program_version()` → Auto-versioning trigger
   - [ ] `publish_program(id UUID)` → Publish draft
   - [ ] `search_programs(query TEXT)` → Full-text search

4. **Row-Level Security Policies**
   ```sql
   -- Public can view published programs
   CREATE POLICY "Public can view published programs"
   ON programs FOR SELECT
   USING (status = 'published');
   
   -- Admins can do everything
   CREATE POLICY "Admins have full access"
   ON programs FOR ALL
   USING (auth.role() = 'admin');
   ```

### Phase 3: Data Migration 
**Duration:** 1 week  
**Status:** ⏳ Waiting on Phase 2

#### Tasks:
1. **Create Migration Scripts**
   - [ ] `migrate-aac-support.ts` → Parse TS file, insert into DB
   - [ ] `migrate-1000-families.ts` → Parse TS file, insert into DB
   - [ ] Verify data integrity
   - [ ] Test section rendering from DB

2. **Image Migration**
   - [ ] Download all Unsplash images
   - [ ] Upload to Supabase Storage
   - [ ] Update image URLs in database
   - [ ] Verify image loading

### Phase 4: API Layer
**Duration:** 1 week  
**Status:** ⏳ Waiting on Phase 3

#### Tasks:
1. **Create API Functions**
   ```typescript
   // lib/api/programs.ts
   
   export async function getProgram(slug: string): Promise<Program>
   export async function getAllPrograms(filters?: ProgramFilters): Promise<Program[]>
   export async function getProgramsByCategory(category: string): Promise<Program[]>
   export async function searchPrograms(query: string): Promise<Program[]>
   ```

2. **Update Page Components**
   - [ ] Convert `/demo/aac-support/page.tsx` to use API
   - [ ] Convert `/demo/1000-families/page.tsx` to use API
   - [ ] Create `/programs/[slug]/page.tsx` for all programs
   - [ ] Update sitemap generation

3. **Caching Strategy**
   - [ ] Use Next.js `revalidateTag('programs')`
   - [ ] Implement ISR with 60-second revalidation
   - [ ] Add cache invalidation on program update

### Phase 5: Admin Interface
**Duration:** 2-3 weeks  
**Status:** ⏳ Waiting on Phase 4

#### Tasks:
1. **Admin Dashboard**
   - [ ] `/admin/programs` → List all programs
   - [ ] `/admin/programs/new` → Create program
   - [ ] `/admin/programs/[id]/edit` → Edit program
   - [ ] `/admin/programs/[id]/preview` → Live preview

2. **Program Editor Components**
   - [ ] Basic info form (title, slug, category, theme)
   - [ ] Hero editor (drag & drop image upload)
   - [ ] Section builder (add/remove/reorder sections)
   - [ ] Section-specific editors for each type
   - [ ] WYSIWYG editor for rich text (TipTap or Lexical)
   - [ ] Image gallery manager
   - [ ] SEO meta editor

3. **Section Editors** (11 types)
   - [ ] RichTextEditor → WYSIWYG with markdown
   - [ ] FeaturesEditor → Dynamic array of features
   - [ ] WhoWeSupportEditor → Target groups builder
   - [ ] HowItWorksEditor → Step-by-step builder
   - [ ] StatsEditor → Stats grid builder
   - [ ] QuoteEditor → Testimonial form
   - [ ] GalleryEditor → Image uploader with drag-reorder
   - [ ] ProgressTrackerEditor → Goals & metrics
   - [ ] TimelineEditor → Phase builder
   - [ ] CTAEditor → Button builder

4. **Publishing Workflow**
   - [ ] Draft/Publish/Archive status
   - [ ] Preview mode (see changes before publishing)
   - [ ] Schedule publishing (publish_at)
   - [ ] Version history (restore old versions)

### Phase 6: Testing & Launch
**Duration:** 1 week  
**Status:** ⏳ Waiting on Phase 5

#### Tasks:
1. **Testing**
   - [ ] Create test programs in all 4 categories
   - [ ] Test all section types
   - [ ] Test image upload/delete
   - [ ] Test responsive design
   - [ ] Test accessibility (WCAG AA)
   - [ ] Performance testing (Core Web Vitals)

2. **Documentation**
   - [ ] Admin user guide
   - [ ] Content style guide
   - [ ] Image specifications
   - [ ] SEO best practices
   - [ ] Troubleshooting guide

3. **Launch**
   - [ ] Migrate existing programs
   - [ ] Train admin staff
   - [ ] Monitor for issues
   - [ ] Gather feedback

---

## Admin Interface Requirements

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│ DEESSA Foundation - Programs CMS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Programs                                                   │
│  [+ New Program]                        [Search...]         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ AAC Communication Support                             │ │
│  │ Service • Published • 9 sections                      │ │
│  │ Last updated: 2 days ago                              │ │
│  │ [Edit] [Preview] [•••]                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1000 Families Campaign 2024                           │ │
│  │ Campaign • Published • 8 sections                     │ │
│  │ Last updated: 5 hours ago                             │ │
│  │ [Edit] [Preview] [•••]                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Community Outreach Journal                            │ │
│  │ Outreach • Draft • 6 sections                         │ │
│  │ Last updated: 1 week ago                              │ │
│  │ [Edit] [Preview] [•••]                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Program Editor

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Program: AAC Communication Support                     │
│ [Save Draft] [Preview] [Publish]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BASIC INFORMATION                                           │
│ ─────────────────────────────────────────────────────────── │
│  Title:        [Every Mind Is a Gift                     ]  │
│  Slug:         [aac-support                              ]  │
│  Category:     [Service ▾]                                  │
│  Theme:        [Warm ▾]                                     │
│  Eyebrow:      [🧩 AUTISM SUPPORT                        ]  │
│  Short Desc:   [Supporting children and families...      ]  │
│  Tags:         [autism] [communication] [AAC] [+ Add]       │
│                                                             │
│ HERO SECTION                                                │
│ ─────────────────────────────────────────────────────────── │
│  Layout:       [Split ▾]                                    │
│  Title:        [Every Mind Is a Gift                     ]  │
│  Description:  [Supporting children and families thro... ]  │
│                                                             │
│  Hero Image:   [Upload Image] or [Choose from Library]     │
│  ┌───────────────────┐                                     │
│  │ [Preview Image]   │ child-aac-device.jpg                │
│  │                   │ 1200x800px                          │
│  └───────────────────┘ [Change] [Remove]                   │
│                                                             │
│  Primary CTA:  [Get Support] → [/contact]                  │
│  Secondary CTA:[Learn More →] → [#about]                   │
│                                                             │
│ SECTIONS                                                    │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│  [+ Add Section ▾] Rich Text | Features | Stats | ...      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡  01. About the Program                              │ │
│  │    Rich Text • 450 words                              │ │
│  │    [Edit] [Delete] [▲] [▼]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡  02. Who We Support                                 │ │
│  │    Target Groups • 3 groups                           │ │
│  │    [Edit] [Delete] [▲] [▼]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡  03. What We Provide                                │ │
│  │    Features • 6 features • List layout                │ │
│  │    [Edit] [Delete] [▲] [▼]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│ SEO & METADATA                                              │
│ ─────────────────────────────────────────────────────────── │
│  Meta Title:   [AAC Communication Support - DEESSA      ]   │
│  Meta Desc:    [Supporting children and families thro... ]  │
│  OG Image:     [Choose Image]                               │
│                                                             │
│ PUBLISHING                                                  │
│ ─────────────────────────────────────────────────────────── │
│  Status:       ● Published                                  │
│  Published:    September 10, 2026 at 2:30 PM               │
│  Featured:     ☑ Show on homepage                           │
│  Display Order:[5]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Section Editors

#### Rich Text Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Section: About the Program                             │
│ Type: Rich Text                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Heading:      [About the Program                        ]  │
│  Subheading:   [Optional subheading                      ]  │
│                                                             │
│  Content:                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [B] [I] [U] | H1 H2 H3 | [≡] [•] [1.] | [🔗] [📷] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │ Every child deserves a way to express their needs,  │   │
│  │ feelings, and ideas. Our AAC Communication Support  │   │
│  │ program provides personalized strategies, tools...  │   │
│  │                                                     │   │
│  │ What is AAC?                                        │   │
│  │ Augmentative and Alternative Communication...       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel] [Save Section]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Features Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Section: What We Provide                               │
│ Type: Features                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Heading:      [What We Provide                          ]  │
│  Layout:       ○ Grid   ● List                              │
│                                                             │
│  Features:                                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡ Feature 1                                           │ │
│  │   Icon:  [💬] or [Upload emoji/icon]                 │ │
│  │   Title: [Personalized AAC Strategies             ]   │ │
│  │   Desc:  [Custom communication plans tailored... ]   │ │
│  │   [▲] [▼] [×]                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡ Feature 2                                           │ │
│  │   Icon:  [👨‍👩‍👧‍👦]                                         │ │
│  │   Title: [Family & Caregiver Training             ]   │ │
│  │   Desc:  [Comprehensive workshops and one-on-one...] │ │
│  │   [▲] [▼] [×]                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Add Feature]                                            │
│                                                             │
│  [Cancel] [Save Section]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Gallery Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Section: See Us in Action                              │
│ Type: Gallery                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Heading:      [See Us in Action                         ]  │
│  Layout:       ● Grid   ○ Masonry   ○ Carousel             │
│                                                             │
│  Images:                                                    │
│                                                             │
│  [Upload Images] or [Choose from Library]                   │
│  (Drag to reorder)                                          │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ [Img 1] │  │ [Img 2] │  │ [Img 3] │  │ [Img 4] │      │
│  │         │  │         │  │         │  │         │      │
│  │ Child   │  │ Parent  │  │ Therapy │  │ School  │      │
│  │ using.. │  │ train.. │  │ session │  │ visit   │      │
│  │         │  │         │  │         │  │         │      │
│  │ [Edit]  │  │ [Edit]  │  │ [Edit]  │  │ [Edit]  │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│  [+ Add Images]                                             │
│                                                             │
│  [Cancel] [Save Section]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Progress Tracker Editor (for Campaigns)
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Section: Our Goal                                      │
│ Type: Progress Tracker                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Heading:      [Our Goal                                 ]  │
│                                                             │
│  Goal:         [1000] families                              │
│  Current:      [820] (82% complete)                         │
│  Unit:         [families ▾] (families/people/children...)   │
│                                                             │
│  Timeline:                                                  │
│  Start Date:   [January 1, 2024                          ]  │
│  End Date:     [December 31, 2024                        ]  │
│  Days Left:    [87] (auto-calculated)                       │
│                                                             │
│  Preview:                                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        ◯                                              │ │
│  │      ◯ ◯ ◯  82%                                       │ │
│  │    ◯   💙   ◯                                         │ │
│  │      ◯ ◯ ◯                                            │ │
│  │        ◯                                              │ │
│  │                                                       │ │
│  │ 820 / 1000 families reached                          │ │
│  │ Only 180 families left!                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Cancel] [Save Section]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Step 1: Parallel Run
- Keep static files while building database
- Test database version at `/programs/[slug]`
- Keep demos at `/demo/*` for comparison

### Step 2: Data Migration
```typescript
// scripts/migrate-programs.ts

import { createClient } from '@supabase/supabase-js'
import { aacSupportProgram } from '@/data/programs/aac-support'
import { thousandFamiliesCampaign } from '@/data/programs/1000-families'

async function migrateProgram(program: Program) {
  // 1. Insert main program record
  const { data: programData, error: programError } = await supabase
    .from('programs')
    .insert({
      slug: program.slug,
      title: program.title,
      category: program.category,
      theme: program.theme,
      eyebrow: program.eyebrow,
      short_description: program.shortDescription,
      tags: program.tags,
      hero: program.hero,
      status: 'published',
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  // 2. Insert sections
  for (const [index, section] of program.sections.entries()) {
    await supabase
      .from('program_sections')
      .insert({
        program_id: programData.id,
        section_id: section.id,
        type: section.type,
        heading: section.heading,
        content: section.content,
        display_order: index
      })
  }

  console.log(`✓ Migrated: ${program.title}`)
}

// Run migrations
await migrateProgram(aacSupportProgram)
await migrateProgram(thousandFamiliesCampaign)
```

### Step 3: Switch Routes
- Update `/whatwedo` to fetch from database
- Create dynamic `/programs/[slug]` route
- Deprecate `/demo/*` routes (or keep as design archive)

### Step 4: Image Migration
```typescript
// scripts/migrate-images.ts

async function migrateImages(programId: string, images: string[]) {
  for (const imageUrl of images) {
    // Download image
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // Upload to Supabase Storage
    const filename = `${programId}/${Date.now()}-${Math.random()}.jpg`
    const { data, error } = await supabase.storage
      .from('program-images')
      .upload(filename, blob)
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('program-images')
      .getPublicUrl(filename)
    
    // Update database
    await supabase
      .from('program_images')
      .insert({
        program_id: programId,
        storage_path: filename,
        url: publicUrl,
        alt_text: 'Program image',
        usage_type: 'gallery'
      })
  }
}
```

---

## Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ADMIN CREATES/EDITS PROGRAM                                │
│  ↓                                                          │
│  Admin Interface (/admin/programs/[id]/edit)                │
│  ↓                                                          │
│  Form Validation (Zod schemas)                              │
│  ↓                                                          │
│  API Route (/api/programs/[id])                             │
│  ↓                                                          │
│  Supabase Client                                            │
│  ↓                                                          │
│  Database (programs + program_sections tables)              │
│  ↓                                                          │
│  Trigger: create_program_version() → program_versions       │
│  ↓                                                          │
│  Cache Invalidation (revalidateTag('programs'))             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER VIEWS PROGRAM                                         │
│  ↓                                                          │
│  Public Page (/programs/[slug])                             │
│  ↓                                                          │
│  Server Component (fetch from cache or DB)                  │
│  ↓                                                          │
│  getProgram(slug) API function                              │
│  ↓                                                          │
│  Supabase Query (JOIN programs + sections)                  │
│  ↓                                                          │
│  Transform to Program type                                  │
│  ↓                                                          │
│  ServiceTemplate or CampaignTemplate                        │
│  ↓                                                          │
│  Section Components (render based on type)                  │
│  ↓                                                          │
│  Rendered Page (with ISR caching)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
app/
├── (admin)/
│   └── admin/
│       └── programs/
│           ├── page.tsx                    # List all programs
│           ├── new/
│           │   └── page.tsx                # Create new program
│           └── [id]/
│               ├── edit/
│               │   └── page.tsx            # Edit program
│               └── preview/
│                   └── page.tsx            # Live preview
│
├── (public)/
│   └── programs/
│       └── [slug]/
│           └── page.tsx                    # Dynamic program page
│
├── api/
│   └── programs/
│       ├── route.ts                        # GET /api/programs (list)
│       ├── [id]/
│       │   └── route.ts                    # GET/PUT/DELETE /api/programs/[id]
│       ├── [id]/
│       │   └── publish/
│       │       └── route.ts                # POST /api/programs/[id]/publish
│       └── search/
│           └── route.ts                    # GET /api/programs/search?q=...
│
components/
├── admin/
│   └── programs/
│       ├── ProgramEditor.tsx               # Main editor wrapper
│       ├── BasicInfoEditor.tsx             # Title, slug, category, etc.
│       ├── HeroEditor.tsx                  # Hero section editor
│       ├── SectionBuilder.tsx              # Add/remove/reorder sections
│       ├── sections/
│       │   ├── RichTextEditor.tsx          # WYSIWYG editor
│       │   ├── FeaturesEditor.tsx          # Features array editor
│       │   ├── WhoWeSupportEditor.tsx      # Target groups editor
│       │   ├── HowItWorksEditor.tsx        # Steps editor
│       │   ├── StatsEditor.tsx             # Stats editor
│       │   ├── QuoteEditor.tsx             # Testimonial editor
│       │   ├── GalleryEditor.tsx           # Image gallery editor
│       │   ├── ProgressTrackerEditor.tsx   # Campaign goals editor
│       │   ├── TimelineEditor.tsx          # Timeline editor
│       │   └── CTAEditor.tsx               # CTA buttons editor
│       ├── ImageUploader.tsx               # Drag & drop uploader
│       └── SEOEditor.tsx                   # Meta tags editor
│
├── programs/                               # Public-facing components
│   ├── templates/
│   │   ├── ServiceTemplate.tsx             # Service program layout
│   │   └── CampaignTemplate.tsx            # Campaign program layout
│   └── sections/                           # Section components (existing)
│       ├── ProgramHero.tsx
│       ├── RichTextSection.tsx
│       ├── FeaturesSection.tsx
│       ├── WhoWeSupportSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── StatsSection.tsx
│       ├── QuoteSection.tsx
│       ├── GallerySection.tsx
│       ├── ProgressTrackerSection.tsx
│       ├── TimelineSection.tsx
│       └── CTASection.tsx
│
lib/
├── api/
│   └── programs.ts                         # API client functions
│       ├── getProgram(slug)
│       ├── getAllPrograms(filters)
│       ├── getProgramsByCategory(category)
│       ├── createProgram(data)
│       ├── updateProgram(id, data)
│       ├── publishProgram(id)
│       └── deleteProgram(id)
│
├── types/
│   └── program-prototype.ts                # TypeScript types (existing)
│
└── validations/
    └── program-schema.ts                   # Zod schemas for validation
        ├── programSchema
        ├── heroSchema
        ├── richTextContentSchema
        ├── featuresContentSchema
        └── ... (all section schemas)

supabase/
├── migrations/
│   ├── 001_create_programs_table.sql
│   ├── 002_create_program_sections_table.sql
│   ├── 003_create_program_images_table.sql
│   ├── 004_create_program_versions_table.sql
│   ├── 005_create_indexes.sql
│   └── 006_create_rls_policies.sql
│
└── functions/
    ├── get_program_by_slug.sql
    ├── get_published_programs.sql
    ├── create_program_version.sql
    └── search_programs.sql
```

### Tech Stack Summary

**Frontend:**
- Next.js 14 App Router (Server Components)
- React 18 (Client Components for interactivity)
- TailwindCSS (styling)
- Framer Motion (animations)
- TipTap or Lexical (WYSIWYG editor)
- React Hook Form + Zod (form validation)

**Backend:**
- Supabase PostgreSQL (database)
- Supabase Storage (images)
- Supabase Auth (admin authentication)
- Row-Level Security (RLS policies)

**Deployment:**
- Vercel (hosting)
- ISR (Incremental Static Regeneration)
- Edge Functions (if needed)

---

## Success Criteria

### Must Have (MVP)
- [ ] All 11 section types editable by admin
- [ ] Image upload to Supabase Storage
- [ ] WYSIWYG editor for rich text
- [ ] Draft/publish workflow
- [ ] Preview before publishing
- [ ] Responsive on all devices
- [ ] WCAG AA accessible
- [ ] Under 3 second page load (Core Web Vitals)

### Should Have (V1.1)
- [ ] Version history (view old versions)
- [ ] Duplicate program (copy as template)
- [ ] Bulk image upload
- [ ] Image cropping/resizing
- [ ] SEO preview (Google/Facebook preview)
- [ ] Scheduled publishing

### Nice to Have (V2.0)
- [ ] Multi-language support (Nepali translations)
- [ ] A/B testing different versions
- [ ] Analytics dashboard (views, engagement)
- [ ] Related programs suggestions
- [ ] Email notifications on publish
- [ ] Collaborative editing (multiple admins)

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | ✅ Done | None |
| Phase 2: Database Setup | 1-2 weeks | Phase 1 |
| Phase 3: Data Migration | 1 week | Phase 2 |
| Phase 4: API Layer | 1 week | Phase 3 |
| Phase 5: Admin Interface | 2-3 weeks | Phase 4 |
| Phase 6: Testing & Launch | 1 week | Phase 5 |
| **Total** | **6-8 weeks** | — |

---

## Next Steps

### Immediate (This Week)
1. ✅ Review and approve this implementation plan
2. ⬜ Create database migration files (Phase 2)
3. ⬜ Set up Supabase Storage bucket for images
4. ⬜ Create RLS policies for programs table

### Week 2
1. ⬜ Run database migrations in development
2. ⬜ Migrate AAC Support and 1000 Families data
3. ⬜ Test data retrieval from database
4. ⬜ Create API functions in `lib/api/programs.ts`

### Week 3-4
1. ⬜ Build admin dashboard UI
2. ⬜ Create program editor components
3. ⬜ Implement image uploader
4. ⬜ Add WYSIWYG editor

### Week 5-6
1. ⬜ Build all 11 section editors
2. ⬜ Implement preview mode
3. ⬜ Test publishing workflow
4. ⬜ SEO and meta tag management

### Week 7-8
1. ⬜ End-to-end testing
2. ⬜ Performance optimization
3. ⬜ Write admin documentation
4. ⬜ Launch to production

---

## Questions to Resolve

1. **Admin Authentication:**
   - Use existing Supabase Auth?
   - Who will have admin access? (how many people?)
   - Need role-based permissions (editor vs publisher)?

2. **Image Storage:**
   - Max image size? (suggest: 10MB)
   - Auto-generate thumbnails?
   - CDN for images? (Supabase has built-in CDN)

3. **Content Versioning:**
   - How many versions to keep? (suggest: 10 most recent)
   - Allow restoring old versions?
   - Show diff between versions?

4. **SEO:**
   - Auto-generate sitemap?
   - Submit to Google Search Console?
   - Structured data (JSON-LD)?

5. **Publishing:**
   - Need approval workflow? (submit for review → approve → publish)
   - Schedule publishing for future dates?
   - Email notifications when published?

6. **Monitoring:**
   - Track page views per program?
   - Monitor CTA click rates?
   - Analytics dashboard for admins?

---

## Appendix

### A. Example API Responses

#### GET /api/programs/aac-support
```json
{
  "id": "uuid-123",
  "slug": "aac-support",
  "title": "Every Mind Is a Gift",
  "category": "service",
  "theme": "warm",
  "eyebrow": "🧩 AUTISM SUPPORT",
  "shortDescription": "Supporting children and families...",
  "tags": ["autism", "communication", "AAC", "family-support"],
  "hero": {
    "eyebrow": "🧩 AUTISM SUPPORT",
    "title": "Every Mind Is a Gift",
    "description": "Supporting children and families...",
    "image": "https://supabase.co/storage/v1/object/public/program-images/...",
    "imageAlt": "Child using AAC device with caregiver",
    "layout": "split",
    "cta": {
      "label": "Get Support",
      "url": "/contact",
      "variant": "primary"
    },
    "secondaryCta": {
      "label": "Learn More →",
      "url": "#about"
    }
  },
  "sections": [
    {
      "id": "about",
      "type": "rich_text",
      "heading": "About the Program",
      "content": {
        "type": "rich_text",
        "body": "<p class=\"lead\">Every child deserves...</p>"
      }
    },
    {
      "id": "who-we-support",
      "type": "who_we_support",
      "heading": "Who We Support",
      "content": {
        "type": "who_we_support",
        "targetGroups": [...]
      }
    }
  ],
  "status": "published",
  "publishedAt": "2026-09-10T14:30:00Z",
  "featured": true,
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-10T14:30:00Z"
}
```

### B. Example SQL Queries

#### Get program with all sections
```sql
SELECT 
  p.*,
  json_agg(
    json_build_object(
      'id', ps.section_id,
      'type', ps.type,
      'heading', ps.heading,
      'subheading', ps.subheading,
      'content', ps.content,
      'displayOrder', ps.display_order
    ) ORDER BY ps.display_order
  ) as sections
FROM programs p
LEFT JOIN program_sections ps ON p.id = ps.program_id
WHERE p.slug = $1
  AND p.status = 'published'
GROUP BY p.id;
```

#### Search programs
```sql
SELECT 
  id, slug, title, category, short_description, tags,
  ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
FROM programs
WHERE status = 'published'
  AND search_vector @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, published_at DESC
LIMIT 20;
```

### C. Zod Validation Schemas

```typescript
import { z } from 'zod'

export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1).max(500),
  image: z.string().url(),
  imageAlt: z.string().min(1),
  layout: z.enum(['split', 'image_left', 'image_right', 'full_bleed', 'minimal']),
  cta: z.object({
    label: z.string().min(1),
    url: z.string().min(1),
    variant: z.enum(['primary', 'secondary']).optional()
  }).optional(),
  secondaryCta: z.object({
    label: z.string().min(1),
    url: z.string().min(1)
  }).optional()
})

export const featuresContentSchema = z.object({
  type: z.literal('features'),
  layout: z.enum(['grid', 'list']).optional(),
  features: z.array(
    z.object({
      icon: z.string().optional(),
      title: z.string().min(1),
      description: z.string().min(1),
      link: z.string().optional()
    })
  ).min(1, 'At least one feature required')
})

export const programSchema = z.object({
  slug: z.string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  title: z.string().min(1).max(100),
  category: z.enum(['service', 'campaign', 'outreach', 'research']),
  theme: z.enum(['warm', 'campaign', 'energetic', 'editorial']),
  eyebrow: z.string().optional(),
  shortDescription: z.string().min(1).max(300),
  tags: z.array(z.string()).optional(),
  hero: heroSchema,
  // ... more fields
})
```

---

## Conclusion

This implementation plan provides a clear roadmap from static prototypes to a fully-functional CMS. The warm, compassionate designs we created for AAC Support and 1000 Families will be preserved while enabling non-technical admins to create and manage programs independently.

**Key Achievements:**
✅ Design finalized and approved  
✅ Component architecture proven  
✅ Type system complete  

**Next Focus:**
🎯 Database schema (Phase 2)  
🎯 Data migration (Phase 3)  
🎯 Admin interface (Phase 5)  

**Timeline:** 6-8 weeks to full launch

---

**Document Version:** 1.0  
**Last Updated:** September 15, 2026  
**Status:** Ready for Implementation
