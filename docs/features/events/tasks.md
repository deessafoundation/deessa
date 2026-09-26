---
title: "Event Management Module — Implementation Plan"
description: " Goal: Build a professional, CMS-like event management system that allows admins to create, customize, and manage eve..."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Management Module — Implementation Plan

> **Goal:** Build a professional, CMS-like event management system that allows admins to create, customize, and manage events with dynamic registration forms — without touching the existing conference system.
>
> **Stack:** Next.js 14 (App Router) + Supabase (Postgres, RLS)
>
> **Status:** 🟡 Planning Complete — Ready for Phase 1

---

## Quick Status Overview

| Phase | Description | Status | Est. Duration |
|-------|-------------|--------|---------------|
| **Phase 0** | Schema & Foundation | ✅ Complete | 3-4 days |
| **Phase 1** | Admin CRUD Shell | ✅ Complete | 5-7 days |
| **Phase 2** | Agenda, Form Builder, Pricing, Email | ✅ Complete | 7-10 days |
| **Phase 3** | Public Listing & Detail Pages | ✅ Complete | 3-5 days |
| **Phase 4** | Registration & Payment | ✅ Complete | 5-7 days |
| **Phase 5** | Polish, Security & Hardening | ✅ Complete | 3-5 days |
| **Overall** | | 🟡 In Progress | **26-38 days** |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Ground Rules](#2-ground-rules)
3. [Decisions Summary](#3-decisions-summary)
4. [Data Model](#4-data-model)
5. [Phased Breakdown](#5-phased-breakdown)
6. [Migration & Rollback Plan](#6-migration--rollback-plan)
7. [Risk Register](#7-risk-register)
8. [File Inventory](#8-file-inventory)
9. [Core Flows](#9-core-flows)

---

## 1. Architecture Overview

### 1.1 High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                       PUBLIC SIDE                                │
│                                                                  │
│  /events              → Event listing (card grid)                │
│  /events/[slug]       → Dynamic detail page (banner, agenda,    │
│                          map, CTA)                               │
│  /events/[slug]/register → Dynamic form → Payment flow          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                       ADMIN SIDE                                 │
│                                                                  │
│  /admin/events              → Event table, filters, quick toggle │
│  /admin/events/new          → Create wizard                     │
│  /admin/events/[id]/*       → Per-event tabs:                   │
│    ├── details    (basic info)                                   │
│    ├── media      (banner, card image, gallery)                  │
│    ├── agenda     (multi-day schedule)                           │
│    ├── location   (venue, address, map pin)                      │
│    ├── form-builder (drag-and-drop registration form)            │
│    ├── pricing    (ticket types, tiers)                          │
│    ├── email-templates (per-event emails)                        │
│    ├── registrations (view/manage submissions)                   │
│    └── settings   (enable/disable, archive, delete, duplicate)  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    SHARED LAYER (read-only imports)              │
│                                                                  │
│  Field components from conference system (14 types)              │
│  FormSchema / FormStep / FormField types                         │
│  Payment providers (Stripe, Khalti, eSewa) — when ready          │
│  Email transport (sendEmail utility)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Clean namespace separation** | Events module lives in `events/` folders, never inside `conference/` |
| **Read-only imports from conference** | Import types and generic components, never edit conference files |
| **Additive database changes** | New migration file only, extend `events` table with nullable columns |
| **Source system partition** | `source_system` column isolates events module data from legacy conference |
| **Schema-driven forms** | Dynamic form builder reuses proven conference patterns |
| **RESTRICT on registrations** | Cannot delete events with registrations — must archive instead |
| **is_free flag** | Admin explicitly decides free/paid/free-then-paid pricing mode |

### 1.3 Naming Conventions

| Concern | Location |
|---------|----------|
| Public routes | `app/(public)/events/` |
| Admin routes | `app/admin/events/` |
| Public components | `components/events/public/` |
| Admin components | `components/events/admin/` |
| Server actions | `lib/actions/events-module/` |
| Types | `lib/types/events-module.ts` |
| DB tables | `event_` prefix (e.g. `event_registrations`) |
| Migration files | Continue sequence: `050-events-module-schema.sql` |

---

## 2. Ground Rules (Non-Negotiable)

1. **Do not modify any existing conference file.** Not even a formatting pass. If you need shared logic, duplicate it and leave a `// TODO(events-module): consider extracting to shared` comment.

2. **Never edit an already-applied SQL migration.** All schema changes happen in new, additive migration files.

3. **New feature = new namespace.** Routes, components, actions, types live in `events/` folders — never inside `conference/`.

4. **Additive only at the database level.** The `events` table is extended via nullable/defaulted columns in a new migration. No column renamed or dropped.

5. **Read-only imports are fine.** Importing a type or pure presentational component from conference is allowed. Importing and then editing is not.

6. **Restricted file list:**

```
app/(public)/conference/**
app/admin/conference/**
components/conference/**                 (import from — never edit)
components/admin/conference-form-builder.tsx
components/admin/conference-form-builder/**
lib/actions/conference-registration.ts
lib/actions/conference-form-schema.ts
lib/actions/conference-settings.ts
lib/types/conference.ts
lib/types/conference-form-schema.ts
scripts/db/migrations/001-043-*.sql (existing migrations)
```

---

## 3. Decisions Summary

| ID | Decision | Choice | Rationale |
|----|----------|--------|-----------|
| **DEC-001** | Database strategy | **Drop existing events table, create fresh** | No production data, clean slate avoids migration complexity |
| **DEC-002** | Component reuse | **Import field components (read-only)** | 14 generic field types, zero coupling risk, avoids 1000+ lines duplication |
| **DEC-003** | Register button | **Direct to form** | Card Register → `/events/[slug]/register`, card body → `/events/[slug]` |
| **DEC-004** | Payment integration | **Deferred** | Another developer building modular payment system; integrate after completion |
| **DEC-005** | Free events | **Admin decides via `is_free` flag** | Supports free, paid, and free-then-paid (time-limited early bird) |
| **DEC-006** | Capacity/waitlist | **Defer to Phase 2+** | Not in MVP, adds complexity, can add later without breaking changes |
| **DEC-007** | Multi-day agenda | **Single table with `day_number`** | Simpler queries, no JOINs, sufficient for 1-3 day events |

---

## 4. Data Model

### 4.1 Events Table (Fresh — Drop & Recreate)

```sql
-- Migration: 050-events-module-schema.sql

-- Drop existing events table (no production data)
DROP TABLE IF EXISTS events CASCADE;

-- Create new events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,

  -- Dates & Location
  event_date DATE NOT NULL,
  event_time TEXT,
  event_end_date DATE,
  location TEXT NOT NULL,
  venue_name TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,

  -- Media
  image TEXT,                    -- Card thumbnail
  banner_url TEXT,               -- Hero image
  gallery JSONB DEFAULT '[]',

  -- Status & Type
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'disabled', 'archived')),
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('conference', 'workshop', 'seminar', 'meetup', 'general')),

  -- Registration
  registration_enabled BOOLEAN DEFAULT true,
  registration_open_at TIMESTAMPTZ,
  registration_close_at TIMESTAMPTZ,
  max_capacity INT,

  -- Pricing
  is_free BOOLEAN DEFAULT false,

  -- Contact
  contact_email TEXT,

  -- Audit
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_events_category ON events(category, status);
```

### 4.2 Event Agenda Items

```sql
CREATE TABLE event_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  day_number INT NOT NULL DEFAULT 1,
  day_label TEXT,
  start_time TEXT,
  end_time TEXT,
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  track_or_room TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_agenda_event_day
  ON event_agenda_items(event_id, day_number, sort_order);
```

### 4.3 Event Form Schemas

```sql
CREATE TABLE event_form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  form_config JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_form_schema_version UNIQUE (event_id, version)
);

CREATE UNIQUE INDEX uq_event_form_schema_active
  ON event_form_schemas(event_id) WHERE is_active = true;
```

### 4.4 Event Form Templates

```sql
CREATE TABLE event_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  form_config JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 Event Registrations

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  form_schema_version INT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  payment_amount DECIMAL,
  payment_currency TEXT,
  payment_provider TEXT,
  payment_id TEXT,
  provider_session_ref TEXT,
  consent_terms BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_event_reg_active_email_per_event
  ON event_registrations(event_id, email) WHERE status NOT IN ('cancelled', 'expired');
CREATE INDEX idx_event_reg_event_status ON event_registrations(event_id, status);
CREATE INDEX idx_event_reg_event_payment ON event_registrations(event_id, payment_status);
```

**Key:** `ON DELETE RESTRICT` — event with registrations physically cannot be deleted; admin must archive.

### 4.6 Event Ticket Types

```sql
CREATE TABLE event_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NPR',
  capacity INT,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 Event Email Templates

```sql
CREATE TABLE event_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL
    CHECK (template_type IN ('confirmation', 'payment_receipt', 'reminder', 'cancellation')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_email_template UNIQUE (event_id, template_type)
);
```

### 4.8 Helper View & Function

```sql
CREATE VIEW event_registrations_with_event AS
SELECT r.*, e.title AS event_title, e.slug AS event_slug,
       e.event_date, e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;

CREATE FUNCTION can_delete_event(p_event_id UUID) RETURNS BOOLEAN AS $$
  SELECT NOT EXISTS (SELECT 1 FROM event_registrations WHERE event_id = p_event_id)
$$ LANGUAGE sql STABLE;
```

### 4.9 Type Reuse

Import from conference (read-only):
```typescript
import type { FormSchema, FormStep, FormField, FieldType } from "@/lib/types/conference-form-schema"
```

These are structurally generic — operate on schema data, not conference-specific logic.

---

## 5. Phased Breakdown

### Phase 0: Schema & Foundation (Est: 3-4 days)

**Goal:** Database migration, types, and core server actions. No UI yet.

**Files to create:**

| File | Purpose |
|------|---------|
| `scripts/db/migrations/050-events-module-schema.sql` | Complete migration: all 7 tables, indexes, view, function |
| `lib/types/events-module.ts` | TypeScript types for all event module entities |
| `lib/actions/events-module/event-crud.ts` | create, update, list, getBySlug, getById, duplicate, archive, restore, deleteWithGuard, setStatus |

**Checkboxes:**

- [x] Create migration `scripts/db/migrations/050-events-module-schema.sql`:
  - [x] DROP existing events table
  - [x] CREATE new events table with all columns
  - [x] CREATE event_agenda_items table
  - [x] CREATE event_form_schemas table with unique indexes
  - [x] CREATE event_form_templates table
  - [x] CREATE event_registrations table with RESTRICT
  - [x] CREATE event_ticket_types table
  - [x] CREATE event_email_templates table
  - [x] CREATE event_registrations_with_event view
  - [x] CREATE can_delete_event() function
  - [x] CREATE all indexes
  - [x] Apply RLS policies for all new tables
- [x] Create `lib/types/events-module.ts`:
  - [x] `EventModuleEvent` type (matches events table)
  - [x] `EventAgendaItem` type
  - [x] `EventFormSchema` type
  - [x] `EventFormTemplate` type
  - [x] `EventRegistration` type
  - [x] `EventTicketType` type
  - [x] `EventEmailTemplate` type
  - [x] Import `FormSchema`, `FormStep`, `FormField` from conference types
- [x] Create `lib/actions/events-module/event-crud.ts`:
  - [x] `createEvent(data)` — INSERT with status='draft'
  - [x] `updateEvent(id, data)` — UPDATE by id
  - [x] `getAllEvents(filters)` — SELECT with status/category filters + pagination
  - [x] `getEventBySlug(slug)` — SELECT for public pages
  - [x] `getEventById(id)` — SELECT for admin pages
  - [x] `duplicateEvent(id)` — Clone details + agenda + tickets + email templates + active form schema (NOT registrations)
  - [x] `archiveEvent(id)` — SET status='archived'
  - [x] `restoreEvent(id)` — SET status='draft'
  - [x] `deleteEvent(id)` — Guarded by `can_delete_event()`, DELETE if allowed
  - [x] `setEventStatus(id, status)` — Transition status with validation
- [ ] Verify migration runs cleanly on fresh database
- [ ] Verify RLS policies allow public read of published events, admin full access

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Migration fails on existing data | DROP IF EXISTS is safe; test on staging first |
| Status transitions allow invalid moves | Validate in server action: only valid transitions allowed |
| Delete guard bypassed | `can_delete_event()` is SQL-level; UI also checks before showing delete button |
| Type mismatches between DB and TS | Types derived directly from CREATE TABLE statements |

---

### Phase 1: Admin CRUD Shell (Est: 5-7 days)

**Goal:** Admin can create, edit, enable/disable, archive, and delete events. No form builder, agenda, or pricing yet — just prove the create → edit → lifecycle loop end to end.

**Files to create:**

| File | Purpose |
|------|---------|
| `app/admin/events/page.tsx` | Event list with filters, status toggles |
| `app/admin/events/new/page.tsx` | Create wizard (basic info first) |
| `app/admin/events/[id]/layout.tsx` | Tab navigation for event settings |
| `app/admin/events/[id]/page.tsx` | Overview/dashboard tab |
| `app/admin/events/[id]/details/page.tsx` | Edit basic info |
| `app/admin/events/[id]/media/page.tsx` | Upload banner, card image, gallery |
| `app/admin/events/[id]/location/page.tsx` | Set venue, address, map coordinates |
| `app/admin/events/[id]/settings/page.tsx` | Enable/disable, archive, delete, duplicate |
| `components/events/admin/EventTable.tsx` | Events list table component |
| `components/events/admin/EventBasicInfoForm.tsx` | Basic info form |
| `components/events/admin/LocationEditor.tsx` | Map picker component |
| `components/events/admin/EventStatusControls.tsx` | Status toggle + danger zone |
| `lib/actions/events-module/event-media.ts` | Image upload actions (Supabase Storage) |

**Checkboxes:**

- [x] Create `app/admin/events/page.tsx`:
  - [x] Fetch all events (any status) for admin
  - [x] Display in table with columns: title, date, category, status, actions
  - [x] Status badges (color-coded)
  - [x] Link to create new event
  - [x] Link to edit each event
  - [x] Link to registrations
  - [x] Link to public page (when published)
- [x] Create `app/admin/events/new/page.tsx`:
  - [x] Basic info form: title, slug (auto-generated from title), category, dates, description
  - [x] On submit: INSERT into events, redirect to /admin/events/[id]/details
  - [x] Slug auto-generation from title
  - [x] is_free toggle
- [x] Create `app/admin/events/[id]/layout.tsx`:
  - [x] Tab navigation: Overview | Details | Media | Agenda | Location | Form Builder | Pricing | Email Templates | Registrations | Settings
  - [x] Active tab via URL sub-routes
  - [x] Event header with title, status badge, category
- [x] Create `app/admin/events/[id]/page.tsx` (Overview):
  - [x] Stats cards: registrations, form status, ticket types, event date
  - [x] Event details card with status, category, date, location
  - [x] Quick actions: edit, configure form, manage pricing, view registrations, view public page
- [x] Create `app/admin/events/[id]/details/page.tsx`:
  - [x] Full edit form: title, slug, category, dates, description (short + long)
  - [x] Save button with success/error alerts
  - [x] is_free toggle
  - [x] Contact email field
- [x] Create `app/admin/events/[id]/media/page.tsx`:
  - [x] Banner image URL input with preview
  - [x] Card thumbnail URL input with preview
  - [x] Gallery image URLs (add/remove multiple)
  - [x] Image preview and delete
- [x] Create `app/admin/events/[id]/location/page.tsx`:
  - [x] Venue name, address text fields
  - [x] Latitude/longitude inputs
  - [x] Map coordinates display
- [x] Create `app/admin/events/[id]/settings/page.tsx`:
  - [x] Status controls: Publish / Disable / Enable / Archive / Restore
  - [x] Duplicate button (with confirmation dialog)
  - [x] Delete button (guarded by `can_delete_event()`, disabled if registrations exist)
  - [x] Danger zone styling
- [x] Create `components/events/admin/EventTabs.tsx`:
  - [x] Tab navigation component with icons
  - [x] Active state highlighting
  - [x] Responsive overflow handling
- [x] Create `components/events/admin/EventDetailsForm.tsx`:
  - [x] Client form for editing event details
  - [x] Success/error feedback
- [x] Create `components/events/admin/EventMediaForm.tsx`:
  - [x] Banner, thumbnail, gallery management
  - [x] Image preview with remove buttons
- [x] Create `components/events/admin/EventLocationForm.tsx`:
  - [x] Venue, address, coordinates inputs
  - [x] Map coordinates display
- [x] Create `components/events/admin/EventSettingsPanel.tsx`:
  - [x] Status transition buttons
  - [x] Confirmation dialogs for destructive actions
  - [x] Delete guard with explanation
- [x] Update `app/admin/events/[id]/registrations/page.tsx`:
  - [x] Updated to use new event_registrations schema
  - [x] Status badges and stats cards

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Slug collision on create | UNIQUE constraint + server-side check before insert |
| Status transition allows invalid move | Validate transitions in server action |
| Delete with registrations | `can_delete_event()` guard + UI disabled button |
| Media upload fails silently | Toast notification on error, retry option |
| Tab navigation breaks on refresh | Use URL sub-routes, not client state |

---

### Phase 2: Agenda, Form Builder, Pricing, Email Templates (Est: 7-10 days)

**Goal:** Build the four remaining admin tabs — agenda editor, form builder, pricing, and email templates.

**Files to create:**

| File | Purpose |
|------|---------|
| `app/admin/events/[id]/agenda/page.tsx` | Agenda management tab |
| `app/admin/events/[id]/form-builder/page.tsx` | Form builder tab |
| `app/admin/events/[id]/pricing/page.tsx` | Pricing configuration tab |
| `app/admin/events/[id]/email-templates/page.tsx` | Email template editor tab |
| `components/events/admin/AgendaEditor.tsx` | Drag-and-drop agenda editor |
| `components/events/admin/EventFormBuilder.tsx` | Rebuilt form builder (no EventSelector) |
| `components/events/admin/PricingEditor.tsx` | Ticket type CRUD |
| `components/events/admin/EmailTemplateEditor.tsx` | Email template editor |
| `lib/actions/events-module/event-agenda.ts` | Agenda CRUD actions |
| `lib/actions/events-module/event-form-schema.ts` | Form schema versioning actions |
| `lib/actions/events-module/event-pricing.ts` | Ticket type actions |
| `lib/actions/events-module/event-email-templates.ts` | Email template actions |

**Checkboxes:**

- [x] **Agenda Editor:**
  - [x] Create `app/admin/events/[id]/agenda/page.tsx`
  - [x] Create `components/events/admin/AgendaEditor.tsx`:
    - [x] Multi-day view (grouped by day_number)
    - [x] Add/remove sessions per day
    - [x] Session fields: title, description, speaker, time, room/track
    - [x] Inline editing with save/cancel
    - [x] Day label support
    - [x] Delete confirmation dialog
  - [x] Create `lib/actions/events-module/event-agenda.ts`:
    - [x] `getAgendaItems(eventId)` — ordered by day_number, sort_order
    - [x] `createAgendaItem(input)` — INSERT
    - [x] `updateAgendaItem(id, input)` — UPDATE
    - [x] `deleteAgendaItem(id, eventId)` — DELETE
    - [x] `getAgendaDays(eventId)` — distinct days

- [x] **Form Builder:**
  - [x] Create `app/admin/events/[id]/form-builder/page.tsx`:
    - [x] Fetch active form schema for this event
    - [x] Default schema with personal details fields
    - [x] Render EventFormBuilder with initial schema
  - [x] Create `components/events/admin/EventFormBuilder.tsx`:
    - [x] Two-panel layout: Steps + Fields | Properties Panel
    - [x] Import field types from `components/conference/fields` (read-only)
    - [x] Step management (add/edit/delete)
    - [x] Field add/remove with type palette
    - [x] Field property editor (label, placeholder, required, options)
    - [x] Field reorder (up/down)
    - [x] Save Draft / Publish workflow
    - [x] Unsaved changes protection
    - [x] 12 field types available
  - [x] Create `lib/actions/events-module/event-form-schema.ts`:
    - [x] `getActiveFormSchema(eventId)` — SELECT WHERE is_active=true
    - [x] `getFormSchemaByVersion(eventId, version)` — SELECT by version
    - [x] `createFormSchema(eventId, formConfig, publish)` — version bump + insert
    - [x] `activateSchemaVersion(eventId, version)` — deactivate others, activate this
    - [x] `getFormSchemaHistory(eventId)` — list all versions

- [x] **Pricing Editor:**
  - [x] Create `app/admin/events/[id]/pricing/page.tsx`
  - [x] Create `components/events/admin/PricingEditor.tsx`:
    - [x] Ticket type list (name, price, capacity, sales window)
    - [x] Add/edit/delete ticket types
    - [x] Currency selector (default NPR)
    - [x] Capacity per tier (NULL = unlimited)
    - [x] Sales start/end date pickers
    - [x] Toggle active/inactive per ticket type
    - [x] Free event mode (no ticket types needed)
  - [x] Create `lib/actions/events-module/event-pricing.ts`:
    - [x] `getTicketTypes(eventId)` — ordered list
    - [x] `createTicketType(input)` — INSERT
    - [x] `updateTicketType(id, input)` — UPDATE
    - [x] `deleteTicketType(id, eventId)` — DELETE

- [x] **Email Templates:**
  - [x] Create `app/admin/events/[id]/email-templates/page.tsx`
  - [x] Create `components/events/admin/EmailTemplateEditor.tsx`:
    - [x] Template type tabs (confirmation, payment_receipt, reminder, cancellation)
    - [x] Subject line editor
    - [x] HTML body editor
    - [x] Plain text body editor
    - [x] Variable reference panel
    - [x] Save/update per template type (upsert)
  - [x] Create `lib/actions/events-module/event-email-templates.ts`:
    - [x] `getEmailTemplates(eventId)` — all templates for event
    - [x] `getEmailTemplate(eventId, type)` — single template by type
    - [x] `upsertEmailTemplate(input)` — INSERT or UPDATE
    - [x] `deleteEmailTemplate(id, eventId)` — DELETE

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Form builder saves invalid schema | Client-side validation before save; server-side Zod validation |
| Agenda reorder race condition | Batch update with single transaction |
| Email template variables don't resolve | Preview mode shows actual values before send |
| Pricing allows negative prices | CHECK constraint: price >= 0 |
| Template chooser loads wrong schema | Template is per-event, scoped by event_id |

---

### Phase 3: Public Listing & Detail Pages (Est: 3-5 days)

**Goal:** Public can browse events, view details. No registration yet — confirm the whole public browsing experience first.

**Files to create:**

| File | Purpose |
|------|---------|
| `app/(public)/events/page.tsx` | Event listing page |
| `app/(public)/events/[slug]/page.tsx` | Dynamic event detail page |
| `components/events/public/EventCard.tsx` | Event card for grid |
| `components/events/public/EventsGrid.tsx` | Responsive grid layout |
| `components/events/public/EventBanner.tsx` | Hero banner component |
| `components/events/public/EventAgenda.tsx` | Agenda/schedule display |
| `components/events/public/EventMap.tsx` | Venue map component |
| `components/events/public/EventRegisterCta.tsx` | Register call-to-action |
| `lib/data/events-module.ts` | Data fetching for public pages |

**Checkboxes:**

- [x] **Event Listing (`/events`):**
  - [x] Create `app/(public)/events/page.tsx`:
    - [x] Server-side rendered (no client-side fetching)
    - [x] Fetch published events (status='published')
    - [x] Upcoming vs past events separation
    - [x] Hero section with gradient overlay
    - [x] Upcoming events with full card layout
    - [x] Past events in 3-column grid
    - [x] CTA section at bottom
    - [x] Empty state when no events
  - [x] Event cards with:
    - [x] Image/thumbnail with fallback
    - [x] Title, date, location
    - [x] Short description
    - [x] Category badge (color-coded)
    - [x] Free event badge
    - [x] Click → `/events/[slug]` (detail page)

- [x] **Event Detail (`/events/[slug]`):**
  - [x] Create `app/(public)/events/[slug]/page.tsx`:
    - [x] Server-side rendered
    - [x] Fetch event by slug (must be published)
    - [x] 404 if not found or not published
    - [x] Fetch agenda items for this event
    - [x] Dynamic metadata (title, description)
  - [x] Hero banner with:
    - [x] Banner image (or fallback to card image)
    - [x] Gradient overlay
    - [x] Event title, category, date, time, location
    - [x] "All Events" back link
  - [x] Content sections:
    - [x] About This Event (description)
    - [x] Schedule (agenda grouped by day)
    - [x] Location with Google Maps embed
    - [x] Venue name and address
  - [x] Sidebar:
    - [x] Sticky register card
    - [x] Price display (free or starting from)
    - [x] Date, time, location
    - [x] "Register Now" button → `/events/[slug]/register`
    - [x] Contact email link
  - [x] Register page placeholder (`/events/[slug]/register`):
    - [x] Event summary sidebar
    - [x] "Coming Soon" placeholder for Phase 4

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Slug collision (duplicate slugs) | UNIQUE constraint on slug |
| Published event shows with broken images | Fallback image handling in card/banner |
| Agenda empty looks broken | "Coming soon" placeholder |
| Map fails to load | Graceful fallback to text address |
| Card click vs register click confusion | Two distinct click zones, clear visual separation |

---

### Phase 4: Registration & Payment (Est: 5-7 days)

**Goal:** Full registration flow — dynamic form, submission, payment (when ready), confirmation emails.

**Files to create:**

| File | Purpose |
|------|---------|
| `app/(public)/events/[slug]/register/page.tsx` | Registration form page |
| `app/(public)/events/[slug]/register/payment-options/page.tsx` | Payment method selection |
| `app/(public)/events/[slug]/register/pending-payment/page.tsx` | Awaiting payment |
| `app/(public)/events/[slug]/register/payment-success/page.tsx` | Payment confirmed |
| `app/(public)/events/[slug]/register/success/page.tsx` | Registration success |
| `app/(public)/events/[slug]/register/failure/page.tsx` | Registration failed |
| `components/events/public/event-registration-form.tsx` | Dynamic registration form |
| `lib/actions/events-module/event-registration.ts` | Registration submission actions |

> **TODO: Payment Integration** — The project already has a complete payment system at `lib/payments/` with Stripe, Khalti, and eSewa adapters. Once the payment module developer completes their work (DEC-004), integrate the existing `startStripeCheckout`, `startKhaltiPayment`, `startEsewaPayment` functions into `event-registration.ts`. The payment-options and pending-payment pages already have mock simulate buttons — replace with real provider redirects.

**Checkboxes:**

- [x] **Registration Form:**
  - [x] Create `app/(public)/events/[slug]/register/page.tsx`:
    - [x] Fetch event by slug (must be published)
    - [x] Check registration_enabled and registration_close_at
    - [x] Fetch active form schema for this event
    - [x] Fetch ticket types (if paid event)
    - [x] Pass all data to registration form component
  - [x] Create `components/events/public/event-registration-form.tsx`:
    - [x] Import field components from `components/conference/fields/*` (read-only)
    - [x] Import `DynamicStep` from `components/conference/dynamic-step` (read-only)
    - [x] Multi-step wizard (schema-driven)
    - [x] Event context display (title, date, location in header)
    - [x] Ticket type selection (if paid event)
    - [x] Form data collection as `Record<string, unknown>`
    - [x] Extract core vs custom fields on submit
    - [x] Validation on blur and on step transition
    - [x] Consent terms checkbox (always required)
    - [x] Submit handler calls server action
    - [x] Redirect to payment (paid) or success (free) based on `is_free`

- [x] **Registration Server Action:**
  - [x] Create `lib/actions/events-module/event-registration.ts`:
    - [x] `registerForEvent(input, formData)` — main submission handler
    - [x] Server-side validation: event is published, registration enabled, not closed
    - [x] Extract core fields (full_name, email, phone) → columns
    - [x] Write remaining fields → `custom_fields` JSONB
    - [x] Write `form_schema_version`
    - [x] Check duplicate email per event (unique constraint)
    - [x] Set `expires_at` for pending registrations
    - [x] If `is_free`: set status='confirmed'
    - [x] If paid: set status='pending', return payment data
    - [x] Handle race condition: re-check event status at submit time

- [x] **Payment Flow (Deferred — mock for now):**
  - [x] Create payment-options page (with mock simulate button)
  - [x] Create pending-payment page (with mock simulate button)
  - [x] Create payment-success page
  - [x] Create success page (registration confirmed with ticket card)
  - [x] Create failure page (with retry option)
  - [x] Mock payment: "Simulate Payment" button for demo
  - [x] TODO: Integrate with payment module when ready (DEC-004)

- [x] **Confirmation:**
  - [x] Success page shows ticket-style card with registration ID
  - [x] Displays event title, date, location
  - [x] Shows attendee name and email
  - [x] Link to contact support

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Race condition: event disabled while form open | Re-check status at server-side submit time |
| Duplicate email submission | Unique index + server-side check |
| Form schema changed between page load and submit | Version check, re-fetch if stale |
| Payment integration not ready | Mock handler, clear TODO markers |
| Registration for past event | Check event_date >= today |

---

### Phase 5: Polish, Security & Hardening (Est: 3-5 days)

**Goal:** Security hardening, performance optimization, error handling, and final polish.

**Checkboxes:**

- [x] **Security:**
  - [x] Rate limiting on registration endpoint (5 per event per 15 min)
  - [x] Input sanitization (XSS prevention) for all user inputs
  - [x] SQL injection prevention (parameterized queries via Supabase)
  - [x] RLS policies applied to all tables

- [x] **Performance:**
  - [x] ISR for `/events` listing (revalidate 5 min)
  - [x] ISR for `/events/[slug]` detail pages (revalidate 5 min)
  - [ ] Image optimization (Next.js Image component)
  - [ ] Lazy loading for gallery images
  - [ ] Bundle size analysis (code splitting per route)

- [x] **Error Handling:**
  - [x] 404 page for non-existent events
  - [x] Error boundary for events routes
  - [x] Form validation error states
  - [x] Payment failure handling page
  - [x] Registration closed page

- [x] **Accessibility:**
  - [x] ARIA labels on ticket selection radio group
  - [x] ARIA labels on consent checkboxes
  - [x] Screen reader announcements for step changes (live region)
  - [x] `aria-required` on required fields
  - [x] `role="status"` for form step announcements

- [x] **Polish:**
  - [x] Loading states for all async operations (loading.tsx)
  - [x] Empty states with helpful messages
  - [x] SEO: dynamic metadata for event pages
  - [x] Admin user guide documentation

**What could break / how we prevent it:**

| Risk | Mitigation |
|------|-----------|
| Rate limiting blocks legitimate users | Generous limits (5/15min), clear error message |
| CAPTCHA frustrates users | Invisible reCAPTCHA v3, not visible challenge |
| Static pages stale after admin edit | Revalidation on content change |
| Missing error states | Comprehensive error boundary + fallback UI |

**Post-Analysis Fixes Applied:**
- ✅ Added auth guards to all admin server actions (defense-in-depth)
- ✅ Switched to distributed rate limiter (Supabase-backed)
- ✅ Sanitized search input for PostgREST
- ✅ Added missing revalidatePath calls
- ✅ Fixed event ownership validation in reorderAgendaItems
- ✅ Removed unused import (VALID_STATUS_TRANSITIONS)

---

## 6. Migration & Rollback Plan

### 6.1 Deployment Order

| Step | Action | Impact |
|------|--------|--------|
| 1 | Run migration `050-events-module-schema.sql` | Non-blocking — new tables, no existing data affected |
| 2 | Deploy Phase 0 code (types + actions) | No UI change — backend only |
| 3 | Deploy Phase 1 code (admin CRUD) | Admin sees new events section |
| 4 | Deploy Phase 2 code (agenda, form builder, pricing, email) | Admin tabs become functional |
| 5 | Deploy Phase 3 code (public pages) | Public can browse events |
| 6 | Deploy Phase 4 code (registration) | Public can register |
| 7 | Deploy Phase 5 code (polish) | Production-ready |

### 6.2 Rollback Strategy

**If something goes wrong in production:**

1. **Phase 0 rollback:** Revert migration. Drop new tables:
   ```sql
   DROP TABLE IF EXISTS event_email_templates CASCADE;
   DROP TABLE IF EXISTS event_ticket_types CASCADE;
   DROP TABLE IF EXISTS event_registrations CASCADE;
   DROP TABLE IF EXISTS event_form_templates CASCADE;
   DROP TABLE IF EXISTS event_form_schemas CASCADE;
   DROP TABLE IF EXISTS event_agenda_items CASCADE;
   DROP TABLE IF EXISTS events CASCADE;
   -- Recreate original events table from 002-admin-schema.sql if needed
   ```

2. **Phase 1-4 rollback:** Revert application code. Database tables remain but are unused. No data loss.

3. **Registration data preservation:** Before rollback, export `event_registrations` table.

### 6.3 Zero-Downtime Deploy

| Phase | Visible Change | Downtime Required |
|-------|---------------|-------------------|
| Phase 0 | None (backend only) | No |
| Phase 1 | Admin sees new events section | No |
| Phase 2 | Admin tabs functional | No |
| Phase 3 | Public sees /events pages | No |
| Phase 4 | Registration form works | No |
| Phase 5 | Polish improvements | No |

---

## 7. Risk Register

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R1 | Conference system accidentally modified | High | Low | Ground rules + restricted file list + code review |
| R2 | Migration breaks existing data | High | Low | DROP IF EXISTS, test on staging first |
| R3 | Form builder produces invalid schemas | Medium | Medium | Client + server validation, Zod schemas |
| R4 | Payment integration delayed | Medium | High | Mock handler, clear TODO markers, DEC-004 deferred |
| R5 | Slug collisions | Low | Low | UNIQUE constraint + server-side check |
| R6 | Race condition on registration | Medium | Medium | Server-side status re-check at submit time |
| R7 | Event deletion with registrations | High | Low | RESTRICT constraint + can_delete_event() guard |
| R8 | Performance with many events | Low | Low | Indexes, pagination, static generation |
| R9 | Image upload failures | Low | Medium | Toast errors, retry option, file size limits |
| R10 | Accessibility non-compliance | Medium | Low | WCAG 2.1 AA audit in Phase 5 |

---

## 8. File Inventory

### 8.1 Files to Create (New)

**Phase 0:**
| File | Purpose |
|------|---------|
| `scripts/db/migrations/050-events-module-schema.sql` | Complete database migration |
| `lib/types/events-module.ts` | TypeScript types |
| `lib/actions/events-module/event-crud.ts` | Core CRUD actions |

**Phase 1:**
| File | Purpose |
|------|---------|
| `app/admin/events/page.tsx` | Event list page |
| `app/admin/events/new/page.tsx` | Create event page |
| `app/admin/events/[id]/layout.tsx` | Tab navigation layout |
| `app/admin/events/[id]/page.tsx` | Overview tab |
| `app/admin/events/[id]/details/page.tsx` | Details tab |
| `app/admin/events/[id]/media/page.tsx` | Media tab |
| `app/admin/events/[id]/location/page.tsx` | Location tab |
| `app/admin/events/[id]/settings/page.tsx` | Settings tab |
| `components/events/admin/EventTable.tsx` | Events list table |
| `components/events/admin/EventBasicInfoForm.tsx` | Basic info form |
| `components/events/admin/LocationEditor.tsx` | Location/map editor |
| `components/events/admin/EventStatusControls.tsx` | Status controls |
| `lib/actions/events-module/event-media.ts` | Media upload actions |

**Phase 2:**
| File | Purpose |
|------|---------|
| `app/admin/events/[id]/agenda/page.tsx` | Agenda tab |
| `app/admin/events/[id]/form-builder/page.tsx` | Form builder tab |
| `app/admin/events/[id]/pricing/page.tsx` | Pricing tab |
| `app/admin/events/[id]/email-templates/page.tsx` | Email templates tab |
| `components/events/admin/AgendaEditor.tsx` | Agenda editor |
| `components/events/admin/EventFormBuilder.tsx` | Form builder |
| `components/events/admin/PricingEditor.tsx` | Pricing editor |
| `components/events/admin/EmailTemplateEditor.tsx` | Email template editor |
| `lib/actions/events-module/event-agenda.ts` | Agenda actions |
| `lib/actions/events-module/event-form-schema.ts` | Form schema actions |
| `lib/actions/events-module/event-pricing.ts` | Pricing actions |
| `lib/actions/events-module/event-email-templates.ts` | Email template actions |

**Phase 3:**
| File | Purpose |
|------|---------|
| `app/(public)/events/page.tsx` | Event listing page |
| `app/(public)/events/[slug]/page.tsx` | Event detail page |
| `components/events/public/EventCard.tsx` | Event card |
| `components/events/public/EventsGrid.tsx` | Grid layout |
| `components/events/public/EventBanner.tsx` | Hero banner |
| `components/events/public/EventAgenda.tsx` | Agenda display |
| `components/events/public/EventMap.tsx` | Map component |
| `components/events/public/EventRegisterCta.tsx` | Register CTA |
| `lib/data/events-module.ts` | Public data fetching |

**Phase 4:**
| File | Purpose |
|------|---------|
| `app/(public)/events/[slug]/register/page.tsx` | Registration form page |
| `app/(public)/events/[slug]/register/payment-options/page.tsx` | Payment options |
| `app/(public)/events/[slug]/register/pending-payment/page.tsx` | Pending payment |
| `app/(public)/events/[slug]/register/payment-success/page.tsx` | Payment success |
| `app/(public)/events/[slug]/register/success/page.tsx` | Registration success |
| `app/(public)/events/[slug]/register/failure/page.tsx` | Registration failure |
| `components/events/public/event-registration-form.tsx` | Registration form |
| `lib/actions/events-module/event-registration.ts` | Registration actions |

**Total: ~45+ new files**

### 8.2 Files Modified (Existing)

| File | Change |
|------|--------|
| `data/events.ts` | Remove hardcoded sample data (events table is fresh) |

### 8.3 Files Imported (Read-Only from Conference)

| File | Import |
|------|--------|
| `components/conference/fields/field-text.tsx` | `FieldText` component |
| `components/conference/fields/field-email.tsx` | `FieldEmail` component |
| `components/conference/fields/field-tel.tsx` | `FieldTel` component |
| `components/conference/fields/field-number.tsx` | `FieldNumber` component |
| `components/conference/fields/field-select.tsx` | `FieldSelect` component |
| `components/conference/fields/field-radio.tsx` | `FieldRadio` component |
| `components/conference/fields/field-checkbox.tsx` | `FieldCheckbox` component |
| `components/conference/fields/field-toggle.tsx` | `FieldToggle` component |
| `components/conference/fields/field-textarea.tsx` | `FieldTextarea` component |
| `components/conference/fields/field-date.tsx` | `FieldDate` component |
| `components/conference/fields/field-url.tsx` | `FieldUrl` component |
| `components/conference/fields/field-file.tsx` | `FieldFile` component |
| `components/conference/fields/field-heading.tsx` | `FieldHeading` component |
| `components/conference/fields/field-paragraph.tsx` | `FieldParagraph` component |
| `components/conference/dynamic-step.tsx` | `DynamicStep` component |
| `lib/types/conference-form-schema.ts` | `FormSchema`, `FormStep`, `FormField`, `FieldType` types |

### 8.4 Restricted Files (Do Not Touch)

```
app/(public)/conference/**
app/admin/conference/**
components/conference/**                 (import only)
components/admin/conference-form-builder.tsx
components/admin/conference-form-builder/**
lib/actions/conference-registration.ts
lib/actions/conference-form-schema.ts
lib/actions/conference-settings.ts
lib/types/conference.ts
lib/types/conference-form-schema.ts
scripts/db/migrations/001-043-*.sql
```

---

## 9. Core Flows

### 9.1 Public: Browse → Register

```
/events (cards, status=published)
   │
   ├── click Register on card ───────────────────────────┐
   │                                                       ▼
   └── click card body                          /events/[slug]/register
              │                                            │
              ▼                                   dynamic form (event_form_schemas,
      /events/[slug]                              is_active=true) → submit →
      banner + description +                      event_registrations INSERT
      agenda (event_agenda_items) +                        │
      map (venue/address/lat-lng) +                ┌───────┴────────┐
      Register CTA ───────────────────────────────▶│  is_free?      │
                                                     └───────┬────────┘
                                                   true│      │false
                                                          ▼      ▼
                                                     success  payment-options
                                                              → provider checkout
                                                              → pending-payment
                                                              → payment-success / failure
```

### 9.2 Admin: Create & Configure

```
/admin/events/new
   → basic info (title, slug, dates, category, description)
   → INSERT events (status='draft')
   → redirect to /admin/events/[id]

/admin/events/[id]/media        → banner_url, image, gallery
/admin/events/[id]/agenda       → event_agenda_items CRUD
/admin/events/[id]/location     → venue_name, address, lat/lng
/admin/events/[id]/form-builder → event_form_schemas (version + publish)
/admin/events/[id]/pricing      → event_ticket_types CRUD
/admin/events/[id]/email-templates → event_email_templates CRUD
/admin/events/[id]/settings     → setStatus, duplicate, delete (guarded)
```

### 9.3 Admin: Form Builder Save

```
Admin edits form → Save Draft / Publish
        │
        ▼
 getNextVersion(event_id)
        │
        ▼
 if publish: set is_active=false for all other versions
        │
        ▼
 INSERT event_form_schemas (event_id, version, is_active=publish, form_config)
        │
        ▼
 revalidate the event's public register page
```

### 9.4 Event Lifecycle

```
                 ┌──────────┐
   create ─────▶ │  draft   │
                 └────┬─────┘
                      │ publish
                      ▼
                 ┌──────────┐   disable    ┌──────────┐
                 │published │ ───────────▶ │ disabled │
                 │          │ ◀─────────── │          │
                 └────┬─────┘   re-enable  └────┬─────┘
                      │                          │
                      │          archive         │
                      └────────────┬─────────────┘
                                   ▼
                             ┌──────────┐
                             │ archived │ ──▶ restore (back to draft)
                             └──────────┘

  delete: allowed from any status IF can_delete_event(id) = true
          (zero registrations). Otherwise → Archive instead.
```

---

## Appendix: Kickoff Prompt for AI Agent

```
Read docs/event-management-module/tasks.md in full before writing any code.
It is the spec for a new "Events Module" feature for Deesha Foundation.

Section 2 lists files you must never modify — treat that as a hard constraint.
Section 3 has the 7 decisions already approved — follow them.
Section 5 is your phase plan — work through it in order, and stop for review
at the end of each phase rather than running ahead.

Start with Phase 0 (schema migration) and show the migration file before applying it.

Key rules:
- DO NOT touch any conference/ files (read-only imports from fields/* are OK)
- All new files go in events/ namespaces
- Import FormSchema/FormStep/FormField types from conference types (read-only)
- Import field components from components/conference/fields/ (read-only)
- Payment integration is deferred (mock handler only) — another dev is building it
- is_free flag determines free vs paid flow
- event_registrations uses ON DELETE RESTRICT (no delete with registrations)
```

---

**Last Updated:** July 23, 2026
**Project Status:** 🟡 Planning Complete — Ready for Phase 0
