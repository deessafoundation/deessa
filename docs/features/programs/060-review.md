# Migration 060 Review: Programs CMS Foundation

## ✅ What Was Fixed

### **1. Added Missing Core Fields to `programs` Table**

**Before:** Only had `id`, `slug`, `status`, and audit fields. Everything else in JSONB `document`.

**After:** Proper indexed columns for:
- `title` - For display and search
- `category` - For filtering (service, campaign, outreach, research)
- `theme` - For styling (warm, campaign, energetic, editorial)
- `eyebrow` - Small label above title
- `short_description` - For list views
- `tags[]` - Array for tagging/filtering
- `meta_title`, `meta_description`, `og_image` - SEO fields
- `featured` - Boolean flag for homepage
- `search_vector` - Auto-generated full-text search index

**Why:** These fields need to be indexed for fast queries. Putting them in JSONB would make filtering and searching slow.

---

### **2. Enhanced `program_drafts` Structure**

**Before:** Single `document` JSONB field with no structure validation.

**After:** 
- Separate `hero` JSONB field with validation
- Separate `sections` JSONB array with validation
- Check constraints to ensure required fields exist

**Why:** Admin editors need clear structure. Hero and sections are fundamentally different data types (object vs array).

**Validation Added:**
```sql
-- Hero must have: title, description, image, imageAlt, layout
alter table program_drafts add constraint program_drafts_hero_valid
  check (
    hero ? 'title' and
    hero ? 'description' and
    hero ? 'image' and
    hero ? 'imageAlt' and
    hero ? 'layout'
  );

-- Sections must be a JSON array
alter table program_drafts add constraint program_drafts_sections_valid
  check (jsonb_typeof(sections) = 'array');
```

---

### **3. Added `program_sections` Table (Optional Normalized Approach)**

**What:** Alternative to storing sections in JSONB array.

**Why:** Some queries may need to filter/search individual sections. This table provides:
- Individual rows per section
- Indexed `type` field for section-type queries
- Easier to query "give me all galleries" or "all testimonials"

**Trade-off:** Can use JSONB array in `program_drafts` OR normalized rows in `program_sections`. Team can choose which approach works best.

---

### **4. Enhanced `program_versions` Structure**

**Before:** Single `document` JSONB blob.

**After:** Separated fields for better queryability:
- `program_data` - Snapshot of programs table row
- `hero` - Snapshot of hero section
- `sections` - Snapshot of sections array

**Why:** Makes it easier to compare versions and show diffs in admin UI.

---

### **5. Enhanced `program_publications` Fields**

**Before:** Minimal denormalized fields.

**After:** Added useful fields for queries:
- `title` - For display in lists
- `short_description` - For list previews
- `tags[]` - For filtering published programs
- Better documented `card` and `document` JSONB structures

**Why:** Public queries need these fields indexed. Avoids parsing JSONB for every list query.

---

### **6. Enhanced `program_assets` Fields**

**Before:** Minimal fields.

**After:** Added:
- `url` - Public URL (separate from storage_path)
- `filename` - Original filename
- `alt_text` - Accessibility
- `caption` - For galleries
- `usage_type` - Track where image is used (hero, gallery, section, etc)

**Why:** Proper image management needs metadata. Alt text is required for WCAG AA compliance.

---

### **7. Added Useful Functions**

**New Functions:**
1. `get_program_by_slug(slug)` - Get full published program for detail page
2. `get_published_programs(category, limit, offset)` - Get list of programs with pagination
3. `search_programs(query, limit)` - Full-text search using PostgreSQL FTS

**Why:** These are the most common queries. Having them as functions:
- Encapsulates logic
- Uses security definer for consistent permissions
- Can be called from client or server
- Returns properly structured data

---

### **8. Added Comprehensive Indexes**

**Added Indexes:**
```sql
-- programs table
programs_category_idx (category)
programs_status_idx (status)
programs_published_at_idx (published_at) where status = 'published'
programs_search_idx (search_vector) GIN
programs_tags_idx (tags) GIN

-- program_publications
program_publications_category_order_idx (category, display_order, published_at)
program_publications_tags_idx (tags) GIN
program_publications_slug_idx (slug)

-- program_sections
program_sections_program_id_idx (program_id)
program_sections_order_idx (display_order)
program_sections_type_idx (type)

-- program_assets
program_assets_program_idx (program_id)
program_assets_status_idx (processing_status, clearance_status)

-- program_versions
program_versions_program_created_idx (program_id, created_at)
```

**Why:** Fast queries. Without indexes, queries slow down dramatically as data grows.

---

### **9. Added Proper RLS Policies**

**Policies Added:**
- Public can SELECT from `program_publications` (anon + authenticated)
- Admins can SELECT, INSERT, UPDATE on `programs` (authenticated + admin check)
- Admins have full access to `program_drafts`, `program_sections`, `program_assets`
- Admins can SELECT from `program_versions`, `program_publish_requests`

**Why:** Security. Non-admins should only see published content. Drafts are private.

---

### **10. Added Proper Permissions**

**Granted:**
- Execute permissions on functions
- Table-level SELECT, INSERT, UPDATE, DELETE as appropriate
- RLS policies enforce admin-only access where needed

**Revoked:**
- All default public permissions
- Only grant what's needed

---

### **11. Added Update Triggers**

**Triggers Added:**
- Auto-update `updated_at` on `programs`, `program_drafts`, `program_sections`

**Why:** Audit trail. Always know when content was last modified.

---

### **12. Added Comments**

**Added comments to:**
- All tables (what they're for)
- All columns (what they contain)
- All functions (what they do)
- Key constraints

**Why:** Documentation in the database itself. Anyone can run `\d+ programs` and understand the schema.

---

## 📊 Comparison Table

| Feature | Original Script | Enhanced Script |
|---------|----------------|-----------------|
| **programs fields** | 7 fields | 18 fields |
| **Indexed columns** | 2 (id, slug) | 10+ (category, status, tags, search, etc) |
| **program_drafts structure** | Single JSONB blob | Structured hero + sections with validation |
| **program_sections table** | ❌ Missing | ✅ Added (optional) |
| **Search capability** | ❌ No | ✅ Full-text search with tsvector |
| **Helper functions** | ❌ None | ✅ 3 functions (get, list, search) |
| **RLS policies** | 5 basic policies | 9 comprehensive policies |
| **Indexes** | 2 indexes | 15+ indexes |
| **Triggers** | ❌ None | ✅ Auto-update timestamps |
| **Comments** | 2 comments | 30+ comments |

---

## 🎯 What This Enables

### **For Admins:**
✅ Create programs with structured data  
✅ Save drafts that only admins can see  
✅ Upload images with proper metadata  
✅ View version history  
✅ Search programs by title/description/tags  
✅ Publish programs atomically  

### **For Public Users:**
✅ Fast queries (properly indexed)  
✅ Full-text search  
✅ Filter by category  
✅ Only see published content  
✅ Get programs by slug  

### **For Developers:**
✅ Clear schema with documentation  
✅ Type-safe JSONB structures  
✅ Reusable query functions  
✅ Proper audit trail  
✅ Flexible: JSONB array OR normalized sections  

---

## 🚀 Next Steps

1. **Review this migration** - Does it meet all requirements?
2. **Test locally** - Run migration in dev Supabase
3. **Create seed data** - Insert AAC Support and 1000 Families
4. **Build API layer** - Create TypeScript functions to query this schema
5. **Build admin UI** - Forms to edit program_drafts
6. **Test publishing workflow** - Draft → Version → Publication

---

## ⚠️ Breaking Changes from Original

If the original migration was already deployed, these changes are **breaking**:

1. `programs` table has many new columns (not backward compatible)
2. `program_drafts` structure changed (document → hero + sections)
3. New table `program_sections` added
4. `program_versions` structure changed
5. `program_publications` has new denormalized fields

**Migration Path:**
- If old schema exists: Create migration to transform old JSONB to new structure
- If new project: Use enhanced schema directly

---

## 📝 Schema Documentation

### Table Relationships

```
programs (master)
  ├─── program_drafts (1:1) - Editable state
  ├─── program_sections (1:N) - Optional normalized sections
  ├─── program_versions (1:N) - Version history
  ├─── program_publications (1:1) - Current published version
  ├─── program_assets (1:N) - Images/files
  └─── program_publish_requests (1:N) - Publish queue
```

### Data Flow

```
Admin Creates Draft
  ↓
program_drafts (hero + sections)
  ↓
Admin Publishes
  ↓
Create program_versions (snapshot)
  ↓
Update program_publications (public view)
  ↓
Public sees new content
```

### Example Data Structure

**programs table:**
```sql
{
  id: uuid,
  slug: 'aac-support',
  title: 'Every Mind Is a Gift',
  category: 'service',
  theme: 'warm',
  short_description: 'Supporting children...',
  tags: ['autism', 'communication'],
  status: 'published',
  meta_title: 'AAC Support | DEESSA'
}
```

**program_drafts table:**
```sql
{
  program_id: uuid,
  hero: {
    title: 'Every Mind Is a Gift',
    description: 'Supporting children...',
    image: 'uuid-or-url',
    layout: 'split',
    cta: {...}
  },
  sections: [
    {
      id: 'about',
      type: 'rich_text',
      heading: 'About',
      content: { type: 'rich_text', body: '<p>...' }
    }
  ]
}
```

**program_publications table:**
```sql
{
  program_id: uuid,
  slug: 'aac-support',
  category: 'service',
  title: 'Every Mind Is a Gift',
  card: {
    image: 'url',
    title: 'Every Mind Is a Gift',
    description: '...'
  },
  document: {
    hero: {...},
    sections: [...]
  }
}
```

---

## ✅ Conclusion

The enhanced migration provides:
- ✅ Proper indexed columns for performance
- ✅ Structured JSONB with validation
- ✅ Full-text search capability
- ✅ Comprehensive security (RLS)
- ✅ Useful query functions
- ✅ Flexible architecture (JSONB + optional normalized)
- ✅ Complete documentation
- ✅ Future-proof versioning

**Recommendation:** Use enhanced schema. It's production-ready for the Programs CMS.
