---
title: "Conference System - Complete Architecture Analysis"
description: "Date: July 23, 2026"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Conference System - Complete Architecture Analysis

**Date:** July 23, 2026  
**Status:** Comprehensive System Review  
**Purpose:** Reconsider entire architecture approach

---

## Executive Summary

This document provides a complete analysis of the conference registration system, including:
- All database schemas and tables
- Complete file structure and components
- Data flow and architecture
- User flows (public and admin)
- Current issues and potential architectural problems
- Recommendations for reconsideration

---

## Table of Contents

1. [Database Architecture](#1-database-architecture)
2. [File Structure](#2-file-structure)
3. [Component Architecture](#3-component-architecture)
4. [Data Flow](#4-data-flow)
5. [User Flows](#5-user-flows)
6. [Current Implementation Status](#6-current-implementation-status)
7. [Architectural Issues](#7-architectural-issues)
8. [Recommendations](#8-recommendations)

---

## 1. Database Architecture

### 1.1 Core Tables

#### Table: `events`
**Location:** `scripts/002-admin-schema.sql`
**Purpose:** Stores event information (conferences, workshops, etc.)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('upcoming', 'past')),
  is_published BOOLEAN DEFAULT FALSE,
  max_capacity INTEGER,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Points:**
- Generic events table (not conference-specific)
- Used for all types of events on the platform
- `type` field distinguishes upcoming vs past


#### Table: `conference_registrations`
**Location:** `scripts/migrations/conference_registrations.sql`
**Purpose:** Stores individual conference registrations

```sql
CREATE TABLE conference_registrations (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Personal Details
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  
  -- Participation
  role TEXT,  -- 'attendee' | 'speaker' | 'panelist' | 'volunteer' | 'sponsor'
  attendance_mode TEXT,  -- 'in-person' | 'online'
  workshops TEXT[],
  
  -- Additional Info
  dietary_preference TEXT,
  tshirt_size TEXT,
  heard_via TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Consent
  consent_terms BOOLEAN DEFAULT false,
  consent_newsletter BOOLEAN DEFAULT false,
  
  -- Status & Payment (added later)
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  payment_amount DECIMAL,
  payment_currency TEXT,
  payment_provider TEXT,
  payment_id TEXT,
  stripe_session_id TEXT,
  khalti_pidx TEXT,
  esewa_transaction_uuid TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Dynamic Forms (Phase 1 - Script 040)
  custom_fields JSONB DEFAULT '{}',
  form_schema_version INT,
  
  -- Multi-Event Support (Phase 4 - Script 043)
  event_id UUID REFERENCES events(id)
)
```


**Key Points:**
- Core fields for basic registration (fixed columns)
- Payment tracking columns (multiple providers)
- `custom_fields` JSONB for dynamic form fields
- `event_id` links to specific events (nullable for legacy)
- **ISSUE:** event_id should probably be NOT NULL for new registrations
- **ISSUE:** No clear distinction between "conference" vs generic "event"

**Indexes:**
```sql
idx_conference_reg_email
idx_conference_reg_status
idx_conference_reg_created
idx_conference_reg_event
idx_conference_reg_event_status
idx_conference_reg_event_created
uq_conf_reg_active_email_per_event (event_id, email) WHERE status NOT IN ('cancelled', 'expired')
```

**RLS Policies:**
- Public can INSERT (with validation)
- Admins can SELECT/UPDATE
- No self-service read (users can't query their own registration)


#### Table: `conference_form_schemas`
**Location:** `scripts/040-conference-form-schema.sql`
**Purpose:** Stores versioned form schemas per event

```sql
CREATE TABLE conference_form_schemas (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  form_config JSONB NOT NULL,  -- Full form definition
  
  created_by UUID REFERENCES admin_users(id),
  notes TEXT,
  
  CONSTRAINT uq_conf_form_schema_per_event UNIQUE (event_id, version)
)
```

**Key Points:**
- Form schemas are scoped PER EVENT
- Only ONE active schema per event at a time
- `form_config` JSONB contains steps, fields, validation rules
- Versioned (monotonic increment per event)
- Cascading delete when event is deleted

**Indexes:**
```sql
idx_conf_form_schema_event_active (event_id, is_active) WHERE is_active = true
uq_conf_form_schema_active_per_event (event_id, is_active) WHERE is_active = true
```


#### Table: `conference_form_templates`
**Location:** `scripts/042-conference-form-templates.sql`
**Purpose:** Reusable form templates (optional)

```sql
CREATE TABLE conference_form_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- 'default' | 'academic' | 'business' | etc
  is_public BOOLEAN DEFAULT false,
  form_config JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Points:**
- Predefined templates that can be copied to create event forms
- Separate from active schemas
- Not currently used in the UI flow (opportunity for improvement)

### 1.2 Database Evolution

**Migration Timeline:**
1. **Initial** - `conference_registrations` with fixed fields
2. **Payment Support** - Added payment columns (stripe, khalti, esewa)
3. **Script 040** - Added `custom_fields` JSONB and `form_schema_version`
4. **Script 041** - Storage bucket for file uploads
5. **Script 042** - Form templates seeding
6. **Script 043** - Added `event_id` to `conference_registrations`

**Current State:**
- âœ… Dynamic forms supported
- âœ… Multi-event architecture in place
- âš ï¸ Mixed paradigm (some data in columns, some in JSONB)
- âš ï¸ event_id nullable (backward compatibility)


### 1.3 Views & Helper Functions

#### View: `conference_registrations_with_event`
```sql
CREATE VIEW conference_registrations_with_event AS
SELECT 
  cr.*,
  e.title as event_title,
  e.slug as event_slug,
  e.event_date,
  e.type as event_type,
  e.is_published as event_is_published
FROM conference_registrations cr
LEFT JOIN events e ON cr.event_id = e.id
```

**Purpose:** Convenient JOIN for admin dashboards

#### Function: `get_current_conference_event_id()`
```sql
CREATE FUNCTION get_current_conference_event_id() RETURNS UUID
-- Logic: upcoming > past > any published
```

**Purpose:** Get the "current" event for defaults and backfilling

---

## 2. File Structure

### 2.1 Public Pages (User-Facing)


```
app/(public)/conference/
â”œâ”€â”€ page.tsx                           # Conference landing page
â”œâ”€â”€ register/
â”‚   â”œâ”€â”€ page.tsx                       # Main registration form
â”‚   â”œâ”€â”€ payment-options/page.tsx       # Choose payment method
â”‚   â”œâ”€â”€ pending-payment/page.tsx       # Awaiting payment
â”‚   â”œâ”€â”€ payment-success/page.tsx       # Payment confirmed
â”‚   â”œâ”€â”€ success/page.tsx               # Registration success
â”‚   â””â”€â”€ failure/page.tsx               # Registration failed
```

**Key Characteristics:**
- `register/page.tsx` fetches active form schema
- Client-side multi-step form with dynamic rendering
- Payment flow spans multiple pages
- No event selection UI (uses default/current event)

### 2.2 Admin Pages

```
app/admin/conference/
â”œâ”€â”€ page.tsx                           # Registrations table/dashboard
â”œâ”€â”€ [id]/page.tsx                      # Single registration detail
â”œâ”€â”€ forms/page.tsx                     # Forms overview (all events)
â””â”€â”€ settings/
    â”œâ”€â”€ layout.tsx
    â”œâ”€â”€ page.tsx                       # General conference settings
    â””â”€â”€ form-builder/page.tsx          # Dynamic form builder
```

**Key Characteristics:**
- Main page shows ALL registrations across all events
- Event column shows which event each registration is for
- Form builder has EventSelector dropdown
- Settings page for conference configuration


### 2.3 Components

```
components/conference/
â”œâ”€â”€ conference-registration-form.tsx   # Main form wrapper
â”œâ”€â”€ dynamic-form-renderer.tsx          # Renders form from schema
â”œâ”€â”€ dynamic-step.tsx                   # Single step renderer
â”œâ”€â”€ step-progress-bar.tsx              # Progress indicator
â”œâ”€â”€ step1-personal-details.tsx         # Legacy hardcoded step
â”œâ”€â”€ step2-participation.tsx            # Legacy hardcoded step
â”œâ”€â”€ step3-additional-info.tsx          # Legacy hardcoded step
â”œâ”€â”€ step4-review.tsx                   # Review & submit step
â””â”€â”€ fields/                            # 14 field type components
    â”œâ”€â”€ field-text.tsx
    â”œâ”€â”€ field-email.tsx
    â”œâ”€â”€ field-tel.tsx
    â”œâ”€â”€ field-number.tsx
    â”œâ”€â”€ field-select.tsx
    â”œâ”€â”€ field-radio.tsx
    â”œâ”€â”€ field-checkbox.tsx
    â”œâ”€â”€ field-toggle.tsx
    â”œâ”€â”€ field-textarea.tsx
    â”œâ”€â”€ field-date.tsx
    â”œâ”€â”€ field-url.tsx
    â”œâ”€â”€ field-file.tsx
    â”œâ”€â”€ field-heading.tsx
    â”œâ”€â”€ field-paragraph.tsx
    â””â”€â”€ index.ts                       # Field registry
```

**Key Characteristics:**
- Mix of legacy hardcoded steps + dynamic renderer
- Field components are reusable and type-specific
- FIELD_REGISTRY map for dynamic lookup
- Client-side rendering with state management


```
components/admin/
â”œâ”€â”€ conference-form-builder.tsx        # Main form builder UI
â””â”€â”€ conference-form-builder/
    â”œâ”€â”€ EventSelector.tsx              # Dropdown to select event
    â”œâ”€â”€ FormSchemaViewer.tsx           # Read-only form viewer
    â”œâ”€â”€ FormTemplateChooser.tsx        # Select from templates
    â””â”€â”€ EnhancedConditionalEditor.tsx  # Conditional logic editor
```

**Key Characteristics:**
- Form builder is event-scoped
- EventSelector allows switching between events
- Unsaved changes warning before switching
- Drag-and-drop field palette
- Real-time preview

### 2.4 Server Actions

```
lib/actions/
â”œâ”€â”€ conference-registration.ts         # Registration CRUD
â”œâ”€â”€ conference-form-schema.ts          # Schema CRUD
â”œâ”€â”€ conference-settings.ts             # Conference config
â””â”€â”€ events.ts                          # Event CRUD
```

**Key Characteristics:**
- All marked with "use server"
- Handle database operations
- Payment integration
- Email sending


### 2.5 Type Definitions

```
lib/types/
â”œâ”€â”€ conference.ts                      # ConferenceRegistration type
â””â”€â”€ conference-form-schema.ts          # FormSchema, FormStep, FormField types
```

**Key Types:**

**FormSchema:**
```typescript
{
  version: number
  steps: FormStep[]
  metadata: { createdAt, updatedAt, notes }
}
```

**FormStep:**
```typescript
{
  id: string
  label: string
  description?: string
  order: number
  fields: FormField[]
}
```

**FormField:**
```typescript
{
  id: string
  type: FieldType  // text, email, select, etc.
  label: string
  required: boolean
  storage: "core" | "custom"  // Fixed column vs JSONB
  validation?: {...}
  conditional?: {...}
  options?: FieldOption[]
  ...
}
```


---

## 3. Component Architecture

### 3.1 Public Registration Flow

**Main Component:** `components/conference/conference-registration-form.tsx`

**Architecture Pattern:**
- Client component ("use client")
- Multi-step wizard with local state
- Dynamic form rendering from schema
- Extracts core vs custom fields on submit

**State Management:**
```typescript
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState<Record<string, unknown>>({})
const [errors, setErrors] = useState<Record<string, string>>({})
```

**Key Functions:**
- `handleFieldChange` - Updates form data
- `handleFieldBlur` - Validates on blur
- `handleSubmit` - Extracts core/custom fields, calls server action
- `extractCustomFields` - Separates JSONB data from fixed columns


### 3.2 Dynamic Form Renderer

**Component:** `components/conference/dynamic-step.tsx`

**Purpose:** Renders a single form step from schema

**Key Features:**
- Maps field types to components via FIELD_REGISTRY
- Handles conditional visibility
- Validates required fields
- Supports half-width fields (side-by-side layout)

**Field Registry Pattern:**
```typescript
const FIELD_REGISTRY = {
  text: FieldText,
  email: FieldEmail,
  select: FieldSelect,
  // ... 14 total field types
}
```

### 3.3 Form Builder Architecture

**Main Component:** `components/admin/conference-form-builder.tsx`

**Layout:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ EventSelector (which event to edit)             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Field       â”‚ Canvas            â”‚ Properties    â”‚
â”‚ Palette     â”‚ (Drop fields)     â”‚ Editor        â”‚
â”‚ (Left 3col) â”‚ (Center 6col)     â”‚ (Right 3col)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```


---

## 4. Data Flow

### 4.1 Registration Submission Flow

```
User fills form â†’ handleSubmit() â†’ extractCustomFields()
                       â†“
              registerForConference()
                       â†“
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â†“                                      â†“
Core Fields                         custom_fields JSONB
(fixed columns)                     (dynamic data)
    â†“                                      â†“
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â†“
         INSERT into conference_registrations
                       â†“
         Return { success, registrationId }
                       â†“
         Redirect to payment or success page
```

**Current Issue:** 
- event_id is NOT captured from URL or context
- Falls back to `getCurrentEvent()` on server
- User has no control over which event they're registering for


### 4.2 Form Schema Loading Flow

```
User visits /conference/register
           â†“
Page fetches: getActiveFormSchema()
           â†“
Server queries conference_form_schemas
  WHERE is_active = true
  ORDER BY version DESC
           â†“
Returns form_config JSONB
           â†“
Passed to <ConferenceRegistrationForm schema={...} />
           â†“
Dynamic renderer builds form from schema
```

**Current Issue:**
- No event selection on public registration page
- Schema query doesn't filter by event_id from URL
- Assumes there's only one "current" conference

### 4.3 Form Builder Save Flow

```
Admin edits form â†’ Save/Publish button
                       â†“
              updateFormSchema(schema, eventId, publish)
                       â†“
    Get next version number for this event
                       â†“
    If publish: Deactivate all other schemas for this event
                       â†“
    INSERT new schema version with is_active=publish
                       â†“
    Revalidate cache
```


---

## 5. User Flows

### 5.1 Public User - Conference Registration

**Current Flow:**
1. User visits `/conference` (landing page)
2. Clicks "Register Now"
3. Lands on `/conference/register`
   - No event selection
   - No indication which event they're registering for
4. Fills multi-step form
5. Submits â†’ redirected to payment or success

**Missing:**
- Event selection UI
- Multiple concurrent conferences support
- Event context display

**Expected Flow (Multi-Event):**
1. User visits `/conference` 
2. Sees list of available conferences
3. Selects specific conference
4. `/conference/register?event=xxx`
5. Form shows event context clearly
6. Registration linked to selected event

### 5.2 Admin User - Form Builder

**Current Flow:**
1. Admin visits `/admin/conference/settings/form-builder`
2. EventSelector dropdown appears (new)
3. Select event from dropdown
4. Form schema loads for that event
5. Edit fields, add/remove steps
6. Save Draft or Publish
7. New version created

**Issues:**
- Works well for admin
- But public users can't choose events


---

## 6. Current Implementation Status

### 6.1 Completed Features âœ…

1. **Dynamic Form System**
   - âœ… JSONB schema storage
   - âœ… 14 field types
   - âœ… Validation rules
   - âœ… Conditional logic
   - âœ… Drag-and-drop form builder

2. **Multi-Event Backend**
   - âœ… event_id column in registrations
   - âœ… Per-event form schemas
   - âœ… Unique constraint per event+email
   - âœ… Event selector in admin

3. **Payment Integration**
   - âœ… Stripe, Khalti, eSewa support
   - âœ… Payment tracking
   - âœ… Expiry management

4. **Admin Dashboard**
   - âœ… Registration table with event column
   - âœ… Form builder with event context
   - âœ… Forms overview page

### 6.2 Missing/Incomplete Features âš ï¸

1. **Public Event Selection**
   - âŒ No event selection UI on registration page
   - âŒ No list of available conferences
   - âŒ URL param ?event=xxx not handled properly
   - âŒ Event context not shown to users

2. **Event Management**
   - âŒ No dedicated conference event creation flow
   - âŒ Events table is generic (all event types mixed)
   - âŒ No conference-specific event attributes


---

## 7. Architectural Issues

### 7.1 Event vs Conference Confusion

**Problem:** The system conflates "events" (generic) with "conferences" (specific type)

**Evidence:**
- Table named `conference_registrations` but links to generic `events` table
- Events table has no `type` field for "conference" vs "workshop" vs "seminar"
- URL path is `/conference/*` but could be registering for any event type
- Function named `getConferenceSettings()` but settings aren't event-specific

**Impact:**
- Hard to support multiple event types
- Confusing data model
- Can't have different registration flows for different event types

**Recommendation:**
Either:
1. **Option A:** Rename everything to "event" (event_registrations, /event/register)
2. **Option B:** Add event.category='conference' filter everywhere
3. **Option C:** Create separate conference_events table with conference-specific fields

### 7.2 Missing Public Event Selection

**Problem:** Users can't choose which conference to register for

**Evidence:**
- `/conference/register` has no ?event=xxx handling in the page component
- No event selector UI on public pages
- Falls back to `getCurrentEvent()` on server


**Impact:**
- Can't have multiple concurrent conferences
- Users might register for wrong event
- No clear event context during registration

**Current Workaround:**
- Backend tries to auto-detect "current" event
- Assumes only one active conference at a time

**Recommendation:**
1. Add event selection to `/conference` landing page
2. Pass eventId via URL: `/conference/register?event={id}`
3. Display event context prominently in form
4. Validate event_id before submission

### 7.3 Dual Storage Pattern Issues

**Problem:** Mix of fixed columns + JSONB for form data

**Current State:**
```
conference_registrations:
  - full_name (column)
  - email (column)
  - phone (column)
  - custom_fields (JSONB) { "favorite_color": "blue", ... }
```

**Pros:**
- Core fields easily queryable
- Email/name needed for payment flow
- Backward compatible

**Cons:**
- Two sources of truth
- Duplication possible
- Complex extraction logic
- Hard to change which fields are "core"


**Recommendation:**
- Keep current approach (it's actually sensible)
- Document clearly which fields are core
- Add validation to prevent duplication
- Consider: store ALL fields in JSONB, use columns as indexed cache

### 7.4 Form Schema Versioning Complexity

**Problem:** Version number is per-event, but not globally unique

**Example:**
```
Event A: v1, v2, v3
Event B: v1, v2
Event C: v1
```

**Issues:**
- Can't reference "version 2" without event context
- `form_schema_version` in registrations is ambiguous without `event_id`
- Migration complexity if events are merged

**Recommendation:**
- Add global version counter or use UUID
- Or: Store (event_id, version) tuple in registrations
- Current approach is acceptable if event_id is always present

### 7.5 Nullable event_id

**Problem:** `event_id` in `conference_registrations` is nullable

**Reason:** Backward compatibility with pre-multi-event data

**Issues:**
- Queries need NULL checks
- Can create registrations without event association
- Ambiguous reporting


**Recommendation:**
1. **Short-term:** Keep nullable for backward compatibility
2. **Long-term:** 
   - Backfill all NULL event_ids
   - Add NOT NULL constraint
   - Make event_id required in registration form

---

## 8. Recommendations

### 8.1 Immediate Fixes (High Priority)

#### 1. Add Public Event Selection

**Files to modify:**
- `app/(public)/conference/register/page.tsx`
- `components/conference/conference-registration-form.tsx`
- `lib/actions/conference-registration.ts`

**Changes:**
```typescript
// page.tsx - Extract event from URL
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams
  const eventId = params.event
  
  if (!eventId) {
    redirect('/conference') // Redirect to event selection
  }
  
  const event = await getEventById(eventId)
  const schema = await getActiveFormSchema(eventId)
  
  return <ConferenceRegistrationForm event={event} schema={schema} />
}
```

#### 2. Display Event Context

Show clearly which event user is registering for:
- Event name, date, location in form header
- Prevent accidental registration for wrong event


### 8.2 Architectural Decisions Needed

#### Decision 1: Event Type Strategy

**Question:** How to handle different event types (conference, workshop, seminar)?

**Option A - Single Table with Category:**
```sql
events (
  category TEXT CHECK (category IN ('conference', 'workshop', 'seminar', ...))
)
```
- Simple
- All events in one place
- Filter by category for conferences

**Option B - Separate Conference Table:**
```sql
conferences (
  id UUID PRIMARY KEY,
  event_id UUID UNIQUE REFERENCES events(id),
  -- conference-specific fields
  max_attendees INT,
  has_workshops BOOLEAN,
  registration_fee_structure JSONB
)
```
- Clean separation
- Conference-specific attributes
- More complex joins

**Recommendation:** Option A (add category field to events)

#### Decision 2: Registration Flow

**Question:** Should `/conference/register` require event selection or auto-detect?

**Option A - Explicit Selection:**
```
/conference â†’ List of events â†’ /conference/register?event=xxx
```

**Option B - Smart Default:**
```
/conference/register â†’ Auto-select current event â†’ Show event context
```

**Recommendation:** Option A for clarity and flexibility


### 8.3 Medium-Term Improvements

1. **Conference Landing Page**
   - List all upcoming conferences
   - Cards with date, location, status
   - Register button links to specific event

2. **Event Management**
   - Add category field to events table
   - Filter by category='conference' in all queries
   - Create conference-specific settings per event

3. **Form Templates**
   - UI to browse and apply templates
   - "Copy form from Event X to Event Y"
   - Pre-built templates (academic, business, etc.)

4. **Better Admin UX**
   - Dashboard per event (not mixed)
   - Event switcher in admin navbar
   - Bulk operations per event

### 8.4 Long-Term Enhancements

1. **Multi-Tenant Conference System**
   - Support different organizations
   - White-label registration pages
   - Separate branding per event

2. **Advanced Features**
   - Waitlists when capacity reached
   - Group registrations
   - Discount codes
   - Referral tracking
   - Session scheduling
   - Badge printing

3. **Analytics & Reporting**
   - Registration trends per event
   - Conversion funnels
   - Payment success rates
   - Form abandonment tracking


---

## 9. Migration Scripts Analysis

### Scripts Executed

| Script | Status | Purpose |
|--------|--------|---------|
| 001-040 | âœ… Run | Base tables, features up to form schemas |
| 041 | âš ï¸ Had errors | Conference file upload bucket |
| 042 | âš ï¸ Had errors | Form templates seeding |
| 043 | âœ… Run | Multi-event support (event_id) |

### Script Dependencies

```
002-admin-schema.sql (events table)
       â†“
conference_registrations.sql (base registration table)
       â†“
040-conference-form-schema.sql (schemas + custom_fields)
       â†“
041-conference-file-upload-bucket.sql (storage)
       â†“
042-conference-form-templates.sql (templates)
       â†“
043-multi-event-support.sql (event_id + indexes)
```

### Issues Found

**Script 041:**
- Ran successfully
- Permission errors on storage.buckets
- Fixed with exception handling

**Script 042:**
- Ran successfully
- JSON syntax errors (line breaks)
- Fixed with jsonb_build_object()

**Script 043:**
- Ran successfully
- Added event_id (nullable)
- Created indexes and view


---

## 10. Critical Questions to Answer

### 10.1 Business Logic Questions

1. **Can there be multiple active conferences simultaneously?**
   - If YES â†’ Need event selection UI
   - If NO â†’ Current "getCurrentEvent()" approach works

2. **Should users see past conference forms/registrations?**
   - If YES â†’ Need archive/history UI
   - If NO â†’ Filter to is_published + upcoming only

3. **Are conference registrations transferable between events?**
   - Probably NO â†’ Makes event_id even more critical

4. **Should form schemas be shareable across events?**
   - Currently NO (per-event versioning)
   - Templates exist but not integrated into UI

### 10.2 Technical Questions

1. **What happens when an event is deleted?**
   - Forms: CASCADE delete (lost forever)
   - Registrations: event_id â†’ NULL (orphaned)
   - Better: RESTRICT delete if registrations exist

2. **How to handle version conflicts?**
   - User submits with v2, but v3 is now active
   - Current: Accepts any version
   - Better: Validate version matches active

3. **Should custom_fields schema be validated?**
   - Currently: Any JSONB accepted
   - Risk: Malformed data
   - Better: Validate against form schema


---

## 11. Summary & Action Plan

### 11.1 Core Issue

**The system has multi-event backend support but no public-facing event selection mechanism.**

**Result:**
- Admin can manage forms per event âœ…
- Users can't choose which event to register for âŒ
- System assumes single "current" conference âŒ

### 11.2 Root Cause

**Incomplete migration from single-conference to multi-event paradigm.**

The implementation added:
- âœ… Database support (event_id, per-event schemas)
- âœ… Admin UI (EventSelector in form builder)
- âŒ Public UI (no event selection)
- âŒ URL routing (?event=xxx handling)

### 11.3 Priority Actions

#### CRITICAL (Fix Now)

1. **Add event_id to registration flow**
   ```typescript
   // register/page.tsx
   - Extract ?event=xxx from URL
   - Pass to form component
   - Display event context
   - Include in submission
   ```

2. **Update conference landing page**
   ```typescript
   // conference/page.tsx
   - Show all upcoming conferences
   - Link to /conference/register?event={id}
   ```

3. **Validate event_id in server actions**
   ```typescript
   // Make event_id required (not optional)
   // Throw error if missing
   ```


#### HIGH PRIORITY (Next Sprint)

1. **Add event category to events table**
   ```sql
   ALTER TABLE events 
   ADD COLUMN category TEXT DEFAULT 'general'
   CHECK (category IN ('conference', 'workshop', 'seminar', 'general'));
   ```

2. **Filter by category everywhere**
   ```typescript
   getAllConferences() {
     return events.where('category', 'conference')
   }
   ```

3. **Make event_id NOT NULL**
   ```sql
   -- After backfilling all NULL values
   ALTER TABLE conference_registrations
   ALTER COLUMN event_id SET NOT NULL;
   ```

#### MEDIUM PRIORITY

1. Form template UI integration
2. Event-specific settings (not global)
3. Better admin dashboard per-event filtering
4. Registration reports per event

### 11.4 Alternative Approach: Simplified

**If you want to avoid multi-event complexity:**

**Option: Dedicated Conference System**
1. Rename to `/conference-2026/` (single event)
2. Remove event_id (single conference only)
3. Keep form builder for that one conference
4. Next year: Create `/conference-2027/`

**Pros:**
- Simpler architecture
- No event selection needed
- Clear scope

**Cons:**
- Can't reuse system for other conferences
- Need new deployment per event
- Data not consolidated


---

## 12. Code Examples - Current vs Proposed

### 12.1 Registration Page - Current Implementation

**File:** `app/(public)/conference/register/page.tsx`

```typescript
// CURRENT - No event handling
export default async function RegisterPage() {
  const schema = await getActiveFormSchema() // No event context!
  return <ConferenceRegistrationForm schema={schema} />
}
```

**Problem:** Ignores which event user wants to register for

### 12.2 Registration Page - Proposed Fix

```typescript
// PROPOSED - Handle event from URL
export default async function RegisterPage({ searchParams }: { 
  searchParams: Promise<{ event?: string }> 
}) {
  const params = await searchParams
  const eventId = params.event
  
  // Require event selection
  if (!eventId) {
    redirect('/conference')
  }
  
  // Validate event exists and is published
  const event = await getEventById(eventId)
  if (!event || !event.is_published) {
    notFound()
  }
  
  // Get form schema for THIS event
  const schema = await getActiveFormSchema(eventId)
  
  return (
    <ConferenceRegistrationForm 
      event={event}
      schema={schema} 
    />
  )
}
```


### 12.3 Registration Form - Current Implementation

```typescript
// CURRENT - No event context
export function ConferenceRegistrationForm({ schema }: { 
  schema: FormSchema | null 
}) {
  const handleSubmit = async (consent) => {
    const result = await registerForConference({
      fullName: String(formData.full_name),
      email: String(formData.email),
      // ... other fields
      customFields: extractCustomFields(formData),
      formSchemaVersion: schema?.version,
      // eventId: ??? Missing!
    })
  }
}
```

### 12.4 Registration Form - Proposed Fix

```typescript
// PROPOSED - Include event
export function ConferenceRegistrationForm({ 
  event,
  schema 
}: { 
  event: Event
  schema: FormSchema | null 
}) {
  return (
    <div>
      {/* Display event context */}
      <div className="event-header">
        <h1>{event.title}</h1>
        <p>{formatDate(event.event_date)} â€¢ {event.location}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </div>
  )
  
  const handleSubmit = async (consent) => {
    const result = await registerForConference({
      // ... all fields
      eventId: event.id, // âœ… Include event!
    })
  }
}
```


### 12.5 Conference Landing - Proposed Addition

**File:** `app/(public)/conference/page.tsx` (enhance existing)

```typescript
// ADD to existing landing page
export default async function ConferencePage() {
  const cfg = await getConferenceSettings()
  
  // NEW: Fetch all upcoming conferences
  const conferences = await getAllEvents()
    .then(events => events.filter(e => 
      e.category === 'conference' && 
      e.is_published &&
      e.type === 'upcoming'
    ))
  
  return (
    <div>
      {/* Existing hero section */}
      
      {/* NEW: Conference selection section */}
      {conferences.length > 1 && (
        <section>
          <h2>Choose Your Conference</h2>
          <div className="grid">
            {conferences.map(event => (
              <ConferenceCard 
                key={event.id}
                event={event}
                registerUrl={`/conference/register?event=${event.id}`}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Single conference - direct register */}
      {conferences.length === 1 && (
        <Link href={`/conference/register?event=${conferences[0].id}`}>
          Register Now
        </Link>
      )}
    </div>
  )
}
```


---

## 13. Database Schema Improvements

### 13.1 Add Event Category

```sql
-- Migration: 044-add-event-category.sql

-- Add category column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add constraint
ALTER TABLE events 
ADD CONSTRAINT events_category_check 
CHECK (category IN ('conference', 'workshop', 'seminar', 'meetup', 'general'));

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_events_category 
ON events(category) 
WHERE is_published = true;

-- Backfill existing events
UPDATE events 
SET category = 'conference' 
WHERE type IN ('upcoming', 'past');

COMMENT ON COLUMN events.category IS 
  'Type of event: conference, workshop, seminar, meetup, or general';
```

### 13.2 Make event_id Required (After Backfill)

```sql
-- Migration: 045-require-event-id.sql

-- Step 1: Ensure all registrations have event_id
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count 
  FROM conference_registrations 
  WHERE event_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION '% registrations have NULL event_id. Backfill required.', null_count;
  END IF;
END $$;

-- Step 2: Add NOT NULL constraint
ALTER TABLE conference_registrations
ALTER COLUMN event_id SET NOT NULL;

-- Step 3: Update foreign key for better referential integrity
ALTER TABLE conference_registrations
DROP CONSTRAINT IF EXISTS conference_registrations_event_id_fkey;

ALTER TABLE conference_registrations
ADD CONSTRAINT conference_registrations_event_id_fkey
FOREIGN KEY (event_id) REFERENCES events(id)
ON DELETE RESTRICT;  -- Prevent deleting events with registrations

COMMENT ON CONSTRAINT conference_registrations_event_id_fkey ON conference_registrations IS
  'Prevents deleting events that have registrations';
```


---

## 14. Testing Scenarios

### 14.1 Test Cases to Validate

#### Scenario 1: Single Active Conference
```
Given: One published conference event
When: User visits /conference
Then: Should see single conference details
And: Register button links to /conference/register?event={id}

When: User clicks register
Then: Should see form for that specific conference
And: Submission should include correct event_id
```

#### Scenario 2: Multiple Active Conferences
```
Given: Two published conference events
When: User visits /conference
Then: Should see list of both conferences
And: Each has separate register button

When: User registers for Conference A
Then: event_id should be Conference A's ID
And: Should not accidentally register for Conference B
```

#### Scenario 3: Expired Conference
```
Given: Conference with event_date in past
When: User tries to access /conference/register?event={expired_id}
Then: Should show "Registration closed" message
Or: Redirect to conference list
```

#### Scenario 4: Invalid Event ID
```
Given: Non-existent event ID in URL
When: User visits /conference/register?event={fake_id}
Then: Should return 404 Not Found
```

#### Scenario 5: Admin Form Builder
```
Given: Multiple events exist
When: Admin opens form builder
Then: Should see EventSelector dropdown
And: Each event has separate form version

When: Admin publishes form for Event A
Then: Should not affect Event B's form
```


---

## 15. Performance Considerations

### 15.1 Query Optimization

**Current Slow Query:**
```sql
-- Gets ALL registrations without filtering
SELECT * FROM conference_registrations 
ORDER BY created_at DESC;
```

**Optimized Query:**
```sql
-- Filter by event first
SELECT * FROM conference_registrations 
WHERE event_id = $1
ORDER BY created_at DESC;

-- Use index: idx_conference_reg_event_created
```

### 15.2 Caching Strategy

**Form Schemas:**
```typescript
// Cache active schema per event (Redis/Memory)
const cacheKey = `form_schema:${eventId}:active`
const cachedSchema = await redis.get(cacheKey)
if (cachedSchema) return JSON.parse(cachedSchema)

const schema = await getActiveFormSchema(eventId)
await redis.set(cacheKey, JSON.stringify(schema), 'EX', 3600)
```

**Event List:**
```typescript
// Cache published events (revalidate every 5 minutes)
export const revalidate = 300

export default async function ConferencePage() {
  const conferences = await getPublishedConferences()
  // Cached for 5 minutes by Next.js
}
```

### 15.3 Database Indexes Review

**Existing Indexes (Good):**
- âœ… `idx_conference_reg_event` - Filter by event
- âœ… `idx_conference_reg_event_status` - Event + status queries
- âœ… `idx_conference_reg_event_created` - Event + date sorting
- âœ… `idx_conf_form_schema_event_active` - Active schema lookup

**Missing Indexes (Consider Adding):**
```sql
-- For event filtering queries
CREATE INDEX idx_events_category_published 
ON events(category, is_published, event_date);

-- For admin dashboard stats
CREATE INDEX idx_conference_reg_event_payment 
ON conference_registrations(event_id, payment_status);
```


---

## 16. Security Considerations

### 16.1 Current Security Posture

**RLS Policies:**
```sql
-- Public can INSERT registrations (with validation)
CREATE POLICY "Allow public inserts" 
ON conference_registrations
FOR INSERT WITH CHECK (
  full_name IS NOT NULL 
  AND email IS NOT NULL 
  AND consent_terms = TRUE
);

-- Admins can read/update all
CREATE POLICY "Allow admin reads" 
ON conference_registrations
FOR SELECT USING (is_admin_user());
```

**Issues:**
- âŒ No event_id validation in INSERT policy
- âŒ Users can submit for any event (even unpublished)
- âŒ No rate limiting on registration endpoint
- âŒ No CAPTCHA/bot protection

### 16.2 Recommended Security Enhancements

```sql
-- Enhanced INSERT policy with event validation
CREATE POLICY "Allow public inserts with valid event"
ON conference_registrations
FOR INSERT WITH CHECK (
  full_name IS NOT NULL 
  AND email IS NOT NULL 
  AND consent_terms = TRUE
  AND event_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE id = event_id 
    AND is_published = true
    AND type = 'upcoming'
    AND event_date >= CURRENT_DATE
  )
);
```

**Application-Level Protections:**
```typescript
// Rate limiting per IP
import rateLimit from 'express-rate-limit'

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 registrations per IP
  message: 'Too many registration attempts'
})

// CAPTCHA validation
if (!await verifyCaptcha(token)) {
  return { success: false, error: 'CAPTCHA validation failed' }
}
```


---

## 17. Documentation Gaps

### 17.1 Missing Documentation

1. **Event Management Guide**
   - How to create a new conference event
   - How to configure event-specific settings
   - How to close registration for an event

2. **Form Builder User Guide**
   - How to create forms per event
   - How to use templates
   - Best practices for form design

3. **Multi-Event User Guide**
   - How users select events
   - What happens with multiple conferences
   - Event lifecycle management

4. **API Documentation**
   - Server action signatures
   - Expected parameters
   - Return types and error codes

### 17.2 Existing Documentation (Good)

- âœ… `ADMIN_USER_GUIDE.md` - Admin features
- âœ… `BUILD_ERROR_FIX_SUMMARY.md` - Technical fixes
- âœ… `DATABASE_MIGRATION_GUIDE.md` - Script execution
- âœ… `tasks.md` - Implementation plan
- âœ… Multiple phase completion docs

---

## 18. Deployment Checklist

### 18.1 Pre-Deployment

- [ ] Run database migrations (041, 042 if not done)
- [ ] Add event category to existing events
- [ ] Backfill NULL event_ids
- [ ] Test registration flow end-to-end
- [ ] Test payment integration
- [ ] Verify email sending works
- [ ] Check admin dashboard displays correctly

### 18.2 Configuration Updates

- [ ] Update environment variables if needed
- [ ] Configure payment providers per event (if applicable)
- [ ] Set up monitoring/alerts
- [ ] Enable error tracking (Sentry, etc.)

### 18.3 Post-Deployment Validation

- [ ] Create test event
- [ ] Build test form
- [ ] Submit test registration
- [ ] Verify data in database
- [ ] Check admin can see registration
- [ ] Test payment flow (if enabled)
- [ ] Verify emails sent


---

## 19. Final Recommendations

### 19.1 Option A: Complete Multi-Event System (Recommended)

**Effort:** Medium (2-3 days)
**Impact:** High - Enables multiple conferences

**Changes Required:**
1. âœ… Database already supports it
2. Add event selection to landing page
3. Handle ?event=xxx in registration page
4. Display event context in form
5. Make event_id required in submission
6. Add event category to events table
7. Filter queries by category='conference'

**Pros:**
- Scalable for future conferences
- Clean data model
- Professional multi-event platform

**Cons:**
- Need to implement public UI changes
- Testing required for edge cases

### 19.2 Option B: Single Conference System (Simpler)

**Effort:** Low (1 day)
**Impact:** Medium - Works for one conference only

**Changes Required:**
1. Remove EventSelector from admin (or hide it)
2. Hardcode single event ID
3. Remove event_id from registrations table (or always use same value)
4. Simplify form builder (no event context needed)
5. Keep URLs simple: /conference/register

**Pros:**
- Simpler to understand
- Less testing needed
- Faster to ship

**Cons:**
- Can't support multiple conferences
- Need to rebuild for next year
- Wastes existing multi-event infrastructure


### 19.3 Option C: Hybrid Approach (Pragmatic)

**Effort:** Low-Medium (1-2 days)
**Impact:** Medium-High

**Changes Required:**
1. Keep multi-event backend as-is âœ…
2. Add simple event detection logic
3. If single published conference â†’ auto-select it
4. If multiple conferences â†’ show selection UI
5. Display event context in form header

**Implementation:**
```typescript
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams
  let eventId = params.event
  
  // Auto-detect if not specified
  if (!eventId) {
    const conferences = await getPublishedConferences()
    
    if (conferences.length === 1) {
      // Auto-select single conference
      eventId = conferences[0].id
    } else if (conferences.length > 1) {
      // Redirect to selection page
      redirect('/conference')
    } else {
      // No conferences available
      return <NoConferencesMessage />
    }
  }
  
  const event = await getEventById(eventId)
  const schema = await getActiveFormSchema(eventId)
  
  return <ConferenceRegistrationForm event={event} schema={schema} />
}
```

**Pros:**
- Graceful degradation (works for single or multiple)
- Minimal UI changes needed
- Leverages existing infrastructure
- Future-proof

**Cons:**
- Slightly more complex logic
- Need to handle edge cases

**Recommendation:** âœ… **Option C (Hybrid)** - Best balance of effort vs value


---

## 20. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)

**Day 1-2: Event Selection Logic**
- [ ] Add event detection to register page
- [ ] Handle ?event=xxx parameter
- [ ] Auto-select if single conference
- [ ] Add event context display in form
- [ ] Pass eventId to registration submission

**Day 3: Database Updates**
- [ ] Run migration 044 (add event category)
- [ ] Backfill event categories
- [ ] Verify all registrations have event_id

**Day 4-5: Testing & Bug Fixes**
- [ ] Test single conference flow
- [ ] Test multiple conference flow
- [ ] Test edge cases (no events, expired, etc.)
- [ ] Fix any issues found

### Phase 2: Enhancements (Week 2)

**Day 1-2: Landing Page**
- [ ] Update /conference landing
- [ ] Add conference cards if multiple exist
- [ ] Link to specific event registrations

**Day 3: Admin Improvements**
- [ ] Add event filter to registrations dashboard
- [ ] Per-event statistics
- [ ] Better event management UI

**Day 4-5: Documentation & Cleanup**
- [ ] Update user guides
- [ ] Document event management
- [ ] Clean up legacy code
- [ ] Add inline comments

### Phase 3: Polish (Week 3)

**Optional Enhancements:**
- [ ] Form templates UI integration
- [ ] Bulk operations per event
- [ ] Advanced reporting
- [ ] Performance optimizations
- [ ] Security hardening (rate limiting, CAPTCHA)


---

## 21. Conclusion

### 21.1 Current State Summary

The conference registration system has:
- âœ… Excellent dynamic form builder
- âœ… Complete multi-event database architecture  
- âœ… Payment integration (3 providers)
- âœ… Admin dashboard with event context
- âš ï¸ **Missing public event selection UI**
- âš ï¸ **Incomplete URL routing for events**

### 21.2 Core Problem

**"The backend supports multiple events, but the frontend assumes a single conference."**

This creates a mismatch where:
- Admins can manage forms per event âœ…
- Users can't choose which event to register for âŒ
- System defaults to "current" event (ambiguous) âŒ

### 21.3 Recommended Solution

**Implement Option C: Hybrid Approach**

1. Add event detection logic to registration page
2. Auto-select if single conference (backwards compatible)
3. Show selection UI if multiple conferences
4. Display event context prominently in form
5. Make event_id required in submission
6. Add event category for better filtering

**Effort:** 1-2 days
**Risk:** Low (leverages existing infrastructure)
**Value:** High (enables multi-conference platform)

### 21.4 Success Criteria

âœ… Users can register for specific conferences  
âœ… Event context is always clear  
âœ… Multiple concurrent conferences supported  
âœ… Backward compatible with single conference  
âœ… No breaking changes to existing data  
âœ… Admin features continue to work  

### 21.5 Next Steps

1. **Review this document** with the team
2. **Decide on approach** (A, B, or C)
3. **Prioritize fixes** based on launch timeline
4. **Execute Phase 1** (critical fixes)
5. **Test thoroughly** before production
6. **Document changes** for future developers

---

**Document Version:** 1.0  
**Last Updated:** July 23, 2026  
**Status:** Complete - Ready for Review  
**Contact:** Development Team
