# Category-Specific Design System for Programs

**Philosophy:** One common content foundation + 4 program types + type-specific presentation

**Key Principle:** *The CMS stores content. The frontend owns the design.*

---

## The 4 Program Categories

### 1. 🟢 **Services & Programs**
**What:** Direct support deessa provides to children, families, caregivers
**Examples:** Autism support, AAC communication, parent training, therapy programs

**Visual Language:**
- Warm, human-centered
- Story-driven layout
- People-focused photography
- Soft color palette (greens, warm blues)
- Rounded corners, gentle shadows

**Page Structure:**
```
Hero (image left, warm greeting)
↓
About the Program (rich text)
↓
Who We Support (target audience cards)
↓
What We Provide (feature grid)
↓
How It Works (step-by-step process)
↓
Impact Statistics (warm, human-focused)
↓
Stories from Families (testimonials)
↓
Gallery (candid moments)
↓
CTA (Get Support / Learn More)
```

---

### 2. 🟠 **Community & Outreach**
**What:** Events, workshops, awareness campaigns, community programs
**Examples:** World Autism Day, teacher training, community workshops, school visits

**Visual Language:**
- Energetic, vibrant
- Photo-heavy, documentary style
- Bright accent colors (orange, teal)
- Dynamic layouts
- Event/activity focused

**Page Structure:**
```
Hero (full-bleed event photo)
↓
About the Initiative (context)
↓
Where We Went (location/map cards)
↓
What We Did (activity timeline)
↓
By the Numbers (impact stats - energetic)
↓
Photo Story (large gallery grid)
↓
Community Voices (quotes from participants)
↓
Impact (outcomes)
↓
CTA (Join Next Event / Get Involved)
```

---

### 3. 🔵 **Research & Innovation**
**What:** Research projects, digital tools, pilot programs, partnerships
**Examples:** deessa Companion app, research studies, innovative methodologies

**Visual Language:**
- Modern, editorial
- Clean, spacious
- Technology-forward
- Blue/purple palette
- Infographics and diagrams

**Page Structure:**
```
Hero (editorial style, abstract or tech imagery)
↓
The Challenge (problem statement)
↓
Our Approach (methodology)
↓
How It Works (process diagram)
↓
Innovation Highlights (feature cards)
↓
Results & Findings (data visualization)
↓
Technology/Tools (technical details)
↓
Resources (downloads, papers)
↓
Gallery (screenshots/demos)
↓
CTA (Learn More / Try Demo)
```

---

### 4. 🟣 **Campaigns & Initiatives**
**What:** Specific campaigns, fundraising drives, special projects
**Examples:** "1000 Families" campaign, annual drives, special initiatives

**Visual Language:**
- Campaign-driven, urgent
- Bold typography
- Progress indicators
- Call-to-action focused
- Purple/pink accents

**Page Structure:**
```
Hero (bold, campaign-style)
↓
Why This Matters (emotional appeal)
↓
Our Goal (target with progress bar)
↓
What We're Doing (campaign activities)
↓
Progress Update (live stats)
↓
Impact So Far (achievements)
↓
Stories (beneficiary testimonials)
↓
Gallery (campaign photos)
↓
Get Involved (strong CTA - donate/join/share)
```

---

## Database Schema Design

### Core Tables (Same as before, but enhanced)

```sql
-- Main programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Identity
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  
  -- Category (determines visual treatment)
  category TEXT NOT NULL 
    CHECK (category IN ('service', 'outreach', 'research', 'campaign')),
  
  -- Tags for cross-linking
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  
  -- Location (optional)
  location_name TEXT,
  city TEXT,
  district TEXT,
  province TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Visual Theme (optional override)
  theme TEXT CHECK (theme IN ('warm', 'ocean', 'neutral', 'editorial', 'campaign')),
  accent_color TEXT, -- Hex code for custom accent
  
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
```

### Hero Section (Every Program)

```sql
CREATE TABLE program_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  eyebrow TEXT, -- "🧩 AUTISM SUPPORT"
  hero_title TEXT NOT NULL,
  hero_description TEXT,
  hero_image TEXT,
  hero_image_alt TEXT,
  hero_layout TEXT DEFAULT 'split' 
    CHECK (hero_layout IN ('split', 'image_left', 'image_right', 'full_bleed', 'minimal')),
  
  cta_label TEXT DEFAULT 'Learn More',
  cta_url TEXT DEFAULT '/contact',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Card Display Settings

```sql
CREATE TABLE program_card_display (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  card_image TEXT, -- Override if different from hero_image
  card_eyebrow TEXT,
  card_title TEXT, -- Override if different from title
  card_description TEXT, -- Override if different from short_description
  card_accent_color TEXT, -- Tailwind class like 'bg-orange-500'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Flexible Sections System

```sql
CREATE TABLE program_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Section Type (determines rendering)
  section_type TEXT NOT NULL 
    CHECK (section_type IN (
      'rich_text',
      'image_text',
      'stats',
      'gallery',
      'quote',
      'timeline',
      'features',
      'video',
      'story',
      'partners',
      'related_programs',
      'cta',
      'who_we_support',    -- Service-specific
      'activities',        -- Outreach-specific
      'methodology',       -- Research-specific
      'progress_tracker'   -- Campaign-specific
    )),
  
  -- Content (JSONB for flexibility)
  content JSONB NOT NULL,
  
  -- Metadata
  heading TEXT,
  subheading TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_sections_program ON program_sections(program_id, display_order);
CREATE INDEX idx_program_sections_type ON program_sections(program_id, section_type);
```

### Section Content Examples

**Rich Text:**
```json
{
  "body": "<p>HTML content here</p>"
}
```

**Image + Text:**
```json
{
  "heading": "Personalized AAC Support",
  "body": "We provide...",
  "image": "/programs/aac-support.jpg",
  "image_alt": "Child using AAC device",
  "image_position": "right"
}
```

**Statistics:**
```json
{
  "stats": [
    {
      "value": "500+",
      "label": "Families Supported",
      "sublabel": "Since 2020",
      "icon": "👨‍👩‍👧‍👦",
      "color": "#29b6c8"
    }
  ]
}
```

**Gallery:**
```json
{
  "title": "Workshop Highlights",
  "description": "Photos from our community workshop",
  "layout": "grid",
  "images": [
    {
      "url": "/programs/workshop-1.jpg",
      "alt": "Workshop participants",
      "caption": "Teachers learning AAC strategies"
    }
  ]
}
```

**Quote:**
```json
{
  "quote": "This program changed our lives.",
  "person": "Rajesh Kumar",
  "role": "Parent",
  "photo": "/testimonials/rajesh.jpg"
}
```

**Timeline:**
```json
{
  "items": [
    {
      "date": "2024",
      "title": "Research Phase",
      "description": "Conducted baseline study",
      "image": "/timeline/2024.jpg"
    }
  ]
}
```

**Features (Service Cards):**
```json
{
  "features": [
    {
      "title": "Communication Support",
      "description": "Personalized AAC strategies",
      "icon": "💬",
      "link": null
    }
  ]
}
```

**Video:**
```json
{
  "video_url": "https://youtube.com/watch?v=...",
  "thumbnail": "/programs/video-thumb.jpg",
  "caption": "Watch how we support families"
}
```

**Story/Case Study:**
```json
{
  "title": "Maya's Journey",
  "context": "Maya, 6, non-verbal...",
  "challenge": "Struggled to communicate...",
  "approach": "We introduced...",
  "outcome": "Now communicates confidently",
  "image": "/stories/maya.jpg",
  "consent": true
}
```

**Partners:**
```json
{
  "partners": [
    {
      "name": "Local NGO",
      "logo": "/partners/ngo.png",
      "website": "https://...",
      "description": "Collaboration on..."
    }
  ]
}
```

**Progress Tracker (Campaign-specific):**
```json
{
  "goal": 1000,
  "current": 820,
  "unit": "families",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Who We Support (Service-specific):**
```json
{
  "target_groups": [
    {
      "title": "Children with Autism",
      "age_range": "2-12 years",
      "description": "Non-verbal or minimally verbal children",
      "icon": "🧒"
    }
  ]
}
```

**Activities (Outreach-specific):**
```json
{
  "activities": [
    {
      "time": "9:00 AM",
      "title": "Registration & Welcome",
      "description": "Participants arrive",
      "icon": "👋"
    }
  ]
}
```

**Methodology (Research-specific):**
```json
{
  "research_question": "How effective is...",
  "methods": ["Randomized control trial", "Surveys"],
  "sample_size": 120,
  "duration": "12 months",
  "findings": "Significant improvement..."
}
```

---

## Category-Specific Metadata Tables

### Service Programs

```sql
CREATE TABLE program_service_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  who_for TEXT, -- "Children with autism, ages 2-12"
  age_group TEXT, -- "2-12 years"
  duration TEXT, -- "Ongoing" or "6 months"
  delivery_method TEXT, -- "In-person", "Online", "Hybrid"
  eligibility TEXT, -- Requirements
  objectives TEXT[], -- Array of objectives
  services_provided TEXT[], -- Array of services
  expected_outcomes TEXT[], -- Array of outcomes
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Outreach Programs

```sql
CREATE TABLE program_outreach_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  event_date DATE,
  event_location TEXT,
  communities_reached TEXT[], -- Array of community names
  participants_count INT,
  activities TEXT[], -- Array of activities conducted
  partners TEXT[], -- Partner organizations
  outcomes TEXT, -- Overall outcomes
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Research Programs

```sql
CREATE TABLE program_research_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  research_question TEXT,
  problem_statement TEXT,
  methodology TEXT,
  innovation_highlight TEXT,
  technology_used TEXT[],
  findings TEXT,
  resources JSONB, -- Links to papers, downloads
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Campaign Programs

```sql
CREATE TABLE program_campaign_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID UNIQUE NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  campaign_goal TEXT,
  target_number INT,
  current_progress INT,
  unit TEXT, -- "families", "children", "schools"
  target_audience TEXT,
  campaign_message TEXT,
  call_to_action TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Frontend Component Structure

```
components/
└── programs/
    ├── shared/
    │   ├── ProgramHero.tsx
    │   ├── ProgramSection.tsx
    │   ├── ProgramStats.tsx
    │   └── ProgramCTA.tsx
    │
    ├── sections/
    │   ├── RichTextSection.tsx
    │   ├── ImageTextSection.tsx
    │   ├── StatsSection.tsx
    │   ├── GallerySection.tsx
    │   ├── QuoteSection.tsx
    │   ├── TimelineSection.tsx
    │   ├── FeaturesSection.tsx
    │   ├── VideoSection.tsx
    │   ├── StorySection.tsx
    │   ├── PartnersSection.tsx
    │   ├── ProgressTrackerSection.tsx
    │   ├── WhoWeSupportSection.tsx
    │   ├── ActivitiesSection.tsx
    │   └── MethodologySection.tsx
    │
    └── templates/
        ├── ServiceTemplate.tsx
        ├── OutreachTemplate.tsx
        ├── ResearchTemplate.tsx
        └── CampaignTemplate.tsx
```

### Example: ServiceTemplate.tsx

```tsx
export function ServiceTemplate({ program, sections, meta }: ServiceTemplateProps) {
  return (
    <div className="program-service" data-theme={program.theme || 'warm'}>
      {/* Hero - Warm, inviting */}
      <ProgramHero 
        layout="split"
        theme="warm"
        {...program.hero}
      />
      
      {/* About the Program */}
      {sections.find(s => s.section_type === 'rich_text') && (
        <RichTextSection theme="warm" />
      )}
      
      {/* Who We Support */}
      {meta.who_for && (
        <WhoWeSupportSection data={meta} />
      )}
      
      {/* What We Provide */}
      {sections.filter(s => s.section_type === 'features') && (
        <FeaturesSection theme="warm" />
      )}
      
      {/* Dynamic Sections */}
      {sections.map(section => (
        <ProgramSection key={section.id} section={section} theme="warm" />
      ))}
      
      {/* CTA */}
      <ProgramCTA 
        theme="warm"
        label="Get Support"
        url="/contact"
      />
    </div>
  )
}
```

### Example: OutreachTemplate.tsx

```tsx
export function OutreachTemplate({ program, sections, meta }: OutreachTemplateProps) {
  return (
    <div className="program-outreach" data-theme={program.theme || 'energetic'}>
      {/* Hero - Full-bleed, dramatic */}
      <ProgramHero 
        layout="full_bleed"
        theme="energetic"
        {...program.hero}
      />
      
      {/* About the Initiative */}
      <RichTextSection theme="energetic" />
      
      {/* Where We Went (if location data) */}
      {program.location_name && (
        <LocationSection location={program} />
      )}
      
      {/* What We Did (Activities timeline) */}
      {sections.find(s => s.section_type === 'activities') && (
        <ActivitiesSection data={meta} />
      )}
      
      {/* By the Numbers */}
      <StatsSection theme="energetic" />
      
      {/* Photo Story (Large gallery) */}
      <GallerySection layout="masonry" theme="energetic" />
      
      {/* Community Voices */}
      {sections.filter(s => s.section_type === 'quote') && (
        <QuoteCarousel theme="energetic" />
      )}
      
      {/* Dynamic Sections */}
      {sections.map(section => (
        <ProgramSection key={section.id} section={section} theme="energetic" />
      ))}
      
      {/* CTA */}
      <ProgramCTA 
        theme="energetic"
        label="Join Next Event"
        url="/contact"
      />
    </div>
  )
}
```

---

## Design Tokens by Category

```typescript
export const CATEGORY_THEMES = {
  service: {
    primary: '#29b6c8',      // Teal
    secondary: '#6FCF97',    // Soft green
    accent: '#F2994A',       // Warm orange
    background: '#F8F9FA',
    text: '#2D3748',
    hero: 'split',
    cardStyle: 'soft-rounded',
    spacing: 'comfortable',
    typography: {
      heading: 'font-marissa',
      body: 'font-dm-sans',
      scale: 'human'
    }
  },
  
  outreach: {
    primary: '#FF6B35',      // Vibrant orange
    secondary: '#F7931E',    // Golden
    accent: '#29b6c8',       // Teal
    background: '#FFFFFF',
    text: '#1A1A2E',
    hero: 'full_bleed',
    cardStyle: 'sharp-energetic',
    spacing: 'dynamic',
    typography: {
      heading: 'font-marissa',
      body: 'font-dm-sans',
      scale: 'energetic'
    }
  },
  
  research: {
    primary: '#5B7FDB',      // Blue
    secondary: '#8B8DD4',    // Purple-blue
    accent: '#29b6c8',       // Teal
    background: '#F7F9FC',
    text: '#1A202C',
    hero: 'editorial',
    cardStyle: 'modern-minimal',
    spacing: 'spacious',
    typography: {
      heading: 'font-marissa',
      body: 'font-dm-sans',
      scale: 'editorial'
    }
  },
  
  campaign: {
    primary: '#9B51E0',      // Purple
    secondary: '#E91E63',    // Pink
    accent: '#FF6B35',       // Orange
    background: '#FFFFFF',
    text: '#1A1A2E',
    hero: 'full_bleed',
    cardStyle: 'bold-campaign',
    spacing: 'tight',
    typography: {
      heading: 'font-marissa',
      body: 'font-dm-sans',
      scale: 'campaign'
    }
  }
} as const
```

---

## Admin Panel UX

### Create/Edit Program Flow

**Step 1: Choose Category**
```
What type of program is this?

[Service & Programs]     [Community & Outreach]
[Research & Innovation]  [Campaigns & Initiatives]
```

**Step 2: Basic Information**
- Title
- Short description
- Full description
- Tags
- Dates
- Location (if applicable)

**Step 3: Hero Section**
- Eyebrow
- Hero title
- Hero description
- Hero image upload
- CTA button

**Step 4: Category-Specific Fields**
*(Form adapts based on category chosen)*

For **Service:**
- Who it's for
- Age group
- Duration
- Delivery method
- Objectives

For **Outreach:**
- Event date
- Communities reached
- Participants
- Partners

For **Research:**
- Research question
- Methodology
- Innovation
- Findings

For **Campaign:**
- Goal
- Target number
- Progress
- Call to action

**Step 5: Build Content Sections**
```
+ Add Section

[Rich Text]  [Image + Text]  [Statistics]
[Gallery]    [Quote]         [Timeline]
[Features]   [Video]         [Story]
[Partners]   [CTA]
```

Drag to reorder sections

**Step 6: SEO & Settings**
- Meta title
- Meta description
- OG image
- Theme override
- Status

**Actions:**
- Save Draft
- Preview
- Publish

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create database schema for core + service category
2. Build TypeScript types
3. Create server actions
4. Build ServiceTemplate.tsx

### Phase 2: Admin Panel (Week 2)
1. Category selection UI
2. Service program form
3. Section builder
4. Image upload

### Phase 3: More Categories (Week 3)
1. Add Outreach category + template
2. Add Campaign category + template
3. Update admin form for all categories

### Phase 4: Research + Polish (Week 4)
1. Add Research category + template
2. Advanced features (timeline, progress tracker)
3. Testing & refinement

---

## Questions to Finalize

1. **Initial Categories:** Start with all 4 or just 2 (Service + Outreach)?
2. **Section Builder:** Drag-drop or simple list?
3. **Image Management:** Supabase Storage or external CDN?
4. **Preview Mode:** Separate preview subdomain or query param?
5. **Related Programs:** Auto-suggest or manual selection?

Let me know your preferences and we'll start building!
