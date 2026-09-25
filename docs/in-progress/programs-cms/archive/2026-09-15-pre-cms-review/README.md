# Programs CMS - Design & Implementation Plan

**Status:** 🎨 Design Phase  
**Date:** September 14, 2026  
**Categories:** Service & Campaign (Phase 1)

---

## 📁 Documents in This Folder

### 1. **programs-cms-architecture-analysis.md**
Complete technical architecture with:
- Database schema design
- Table structures
- RLS policies
- Server actions
- Type definitions
- Migration scripts

**Use when:** Building the backend

---

### 2. **category-specific-design-system.md**
Design system for 4 program categories:
- Service & Programs (warm, human-centered)
- Community & Outreach (energetic, photo-driven)
- Research & Innovation (editorial, modern)
- Campaigns & Initiatives (bold, urgent)

**Use when:** Understanding the design philosophy

---

### 3. **visual-mockups-service-campaign.md** ⭐ **START HERE**
Detailed visual mockups for:
- **Service Template** (AAC Communication Support example)
- **Campaign Template** (1000 Families Campaign example)

Includes:
- Section-by-section layouts
- Color palettes
- Typography scales
- Spacing guidelines
- Animation specs
- Responsive behaviors

**Use when:** Designing UI or building components

---

## 🎯 Current Phase: Design Review

### What We're Building

**Service Program Example:**
```
Program: AAC Communication Support
Sections:
├── Hero (split layout, warm photo)
├── About the Program
├── Who We Support (3 target audiences)
├── What We Provide (4 features)
├── How It Works (4-step process)
├── Impact Statistics (3 key metrics)
├── Stories from Families (testimonial)
├── Gallery (4-column photo grid)
└── CTA (Get Support)
```

**Campaign Program Example:**
```
Program: 1000 Families Campaign 2024
Sections:
├── Hero (full-bleed, progress bar)
├── Why This Matters (problem statement)
├── Our Goal (circular progress + deadline)
├── What We're Doing (3 campaign activities)
├── Progress Update (timeline)
├── Impact So Far (4 stats)
├── Stories (video/photo carousel)
└── Get Involved (3 CTAs: donate, share, volunteer)
```

---

## 🎨 Design Tokens

### Service Programs
```css
--primary: #3FABDE      /* Ocean Blue */
--secondary: #6FCF97    /* Soft Green */
--accent: #F7C52B       /* Yellow */
--bg: #F8F9FA          /* Soft Cream */
--text: #2D3748        /* Gray */

--hero-layout: split
--card-style: soft-rounded
--animation: subtle-warm
```

### Campaign Programs
```css
--primary: #6F3E96      /* Purple */
--secondary: #D6336C    /* Pink */
--accent: #F7C52B       /* Yellow */
--bg: #FFFFFF          /* White */
--text: #1A1A2E        /* Dark */

--hero-layout: full-bleed
--card-style: bold-campaign
--animation: dynamic-urgent
```

---

## 🚀 Implementation Roadmap

### ✅ Phase 1: Design (Current)
- [x] Define 4 program categories
- [x] Create visual mockups for Service & Campaign
- [x] Design color system
- [ ] **Get design approval** ← **YOU ARE HERE**
- [ ] Choose 1-2 real programs to prototype

### 📝 Phase 2: Components (Next)
- [ ] Build shared components (Hero, Stats, Gallery, CTA)
- [ ] Build section components (ImageText, Quote, Timeline, etc.)
- [ ] Build ServiceTemplate.tsx
- [ ] Build CampaignTemplate.tsx
- [ ] Test responsive behavior

### 🗄️ Phase 3: Database
- [ ] Run migration script
- [ ] Create TypeScript types
- [ ] Build server actions (CRUD)
- [ ] Set up Supabase Storage
- [ ] Test RLS policies

### 🎛️ Phase 4: Admin Panel
- [ ] Program list page
- [ ] Category selection
- [ ] Form for Service programs
- [ ] Form for Campaign programs
- [ ] Section builder UI
- [ ] Image uploader
- [ ] Preview functionality

### 🌐 Phase 5: Public Pages
- [ ] Update /whatwedo list page
- [ ] Create /whatwedo/[slug] dynamic page
- [ ] Add preview mode
- [ ] SEO optimization
- [ ] Performance testing

---

## 🎭 Real Content Examples Needed

To prototype effectively, we need **2 real programs**:

### Option A: Existing Programs
1. **Service:** AAC Communication Support (or similar)
2. **Campaign:** Any active campaign

### Option B: Planned Programs
If you don't have real content yet, we can use:
1. **Service:** Autism Family Support Program
2. **Campaign:** 1000 Families by End of 2024

**What we need for each:**
- Title
- Short description (1-2 sentences)
- Full description (3-4 paragraphs)
- 3-4 key features/activities
- 3-4 impact statistics
- 1 testimonial (or we'll use placeholder)
- 4-6 photos (or we'll use Unsplash)

---

## 📊 Database vs Frontend

**Important Principle:**
> The CMS stores **content**. The frontend owns **design**.

This means:
- Admin fills out fields and builds sections
- Frontend intelligently renders based on category
- Same section type looks different per category

**Example:**
```
DATABASE:
section_type: "stats"
content: {
  stats: [
    { value: "500+", label: "Families Supported" }
  ]
}

FRONTEND (Service):
Render as: Soft card, green icon, gentle animation

FRONTEND (Campaign):
Render as: Bold number, yellow accent, count-up animation
```

---

## ❓ Decision Points

Before moving to implementation, we need to decide:

### 1. Section Builder Complexity
**Option A:** Simple list (add, remove, reorder)
```
[Add Section ▼]
├── Rich Text
├── Image + Text
├── Statistics
└── Gallery

[Section 1: Rich Text] [↑] [↓] [×]
[Section 2: Statistics] [↑] [↓] [×]
```

**Option B:** Drag-and-drop visual builder
```
┌────────────────────────────────┐
│ Drag sections to reorder       │
├────────────────────────────────┤
│ ⋮⋮ Rich Text Section           │
│ ⋮⋮ Statistics Section          │
│ ⋮⋮ Gallery Section             │
└────────────────────────────────┘
```

**Recommendation:** Start with Option A, upgrade to B later

---

### 2. Image Management
**Option A:** Supabase Storage (integrated)
- Upload to Supabase Storage bucket
- Auto-generate optimized URLs
- Built-in RLS policies

**Option B:** External CDN (Cloudinary, ImageKit)
- More features (auto-cropping, filters)
- External dependency
- Extra cost

**Recommendation:** Supabase Storage (simpler, free tier is generous)

---

### 3. Preview Mode
**Option A:** Query parameter
```
/whatwedo/autism-support?preview=abc123
```

**Option B:** Separate subdomain
```
preview.deessa.org/whatwedo/autism-support
```

**Recommendation:** Query parameter (simpler, no DNS setup)

---

### 4. Related Programs
**Option A:** Auto-suggest by tags
```
Program: "AAC Support"
Tags: [autism, communication]

Auto-shows:
- Other programs with "autism" tag
- Other programs with "communication" tag
```

**Option B:** Manual selection
```
Admin picks 3 related programs from dropdown
```

**Recommendation:** Auto-suggest (less admin work)

---

## 🛠️ Tech Stack Summary

```
Frontend:
├── Next.js 16 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
├── Framer Motion (animations)
└── Radix UI (admin components)

Backend:
├── Supabase PostgreSQL
├── Supabase Storage
├── Supabase Auth + RLS
└── Next.js Server Actions

Fonts:
├── Marissa Font (headings)
├── DM Sans (body)
└── Comic Neue (accents)

Colors:
├── Ocean Blue (#3FABDE)
├── Purple (#6F3E96)
├── Yellow (#F7C52B)
└── Pink (#D6336C)
```

---

## 📞 Next Actions

### For You:
1. **Review the visual mockups** (visual-mockups-service-campaign.md)
2. **Provide feedback**:
   - Do the designs match your vision?
   - Any sections missing?
   - Colors/spacing okay?
3. **Share 2 real program examples** (or tell me to use placeholders)
4. **Answer the 4 decision points** above

### For Me (After Your Approval):
1. Create React components for shared sections
2. Build ServiceTemplate.tsx and CampaignTemplate.tsx
3. Create a static prototype (no database yet)
4. Show you the working pages
5. Then build the backend

---

## 💬 Questions?

**Slack/Email/WhatsApp me:**
- Which sections do you want to see first?
- Should we add any other section types?
- Do you have Figma/design preferences?
- Timeline: How urgent is this?

---

**Let's build something beautiful! 🎨✨**
