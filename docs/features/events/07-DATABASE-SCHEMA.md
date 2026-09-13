---
title: "Database Schema Reference"
description: "Version: 2.0"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Database Schema Reference

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

The Event Management Module uses 7 tables in Supabase (PostgreSQL). All tables have RLS enabled.

---

## Tables

### 1. events

Core event records.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
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
  image TEXT,
  banner_url TEXT,
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
```

**Indexes:**
- `events_slug_key` (UNIQUE)
- `idx_events_module_status` (source_system, status, event_date)

---

### 2. event_agenda_items

Multi-day schedule/sessions.

```sql
CREATE TABLE event_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Multi-day support
  day_number INT NOT NULL DEFAULT 1,
  day_label TEXT,
  
  -- Time slots
  start_time TEXT,
  end_time TEXT,
  
  -- Session details
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  track_or_room TEXT,
  
  -- Highlighted
  highlighted BOOLEAN DEFAULT false,
  
  -- Ordering
  sort_order INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_agenda_event_day 
  ON event_agenda_items(event_id, day_number, sort_order);
```

---

### 3. event_form_schemas

Versioned form definitions.

```sql
CREATE TABLE event_form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  form_config JSONB NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_form_schemas_event_active 
  ON event_form_schemas(event_id, is_active) 
  WHERE is_active = true;
```

**Notes:**
- Only one schema should be `is_active: true` per event
- `form_config` contains the full `FormSchema` JSONB
- Old versions are kept for audit trail

---

### 4. event_form_templates

Reusable form templates.

```sql
CREATE TABLE event_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  form_config JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed Data:** 15 templates in `055-event-form-template-seeds.sql`

---

### 5. event_registrations

Registration submissions.

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  
  -- Core fields
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_ref TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  
  -- Custom fields (JSONB)
  custom_fields JSONB DEFAULT '{}',
  
  -- Metadata
  form_schema_version INT,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, email)
);
```

**Indexes:**
- `idx_event_reg_event_status` (event_id, status)
- `idx_event_reg_event_payment` (event_id, payment_status)

---

### 6. event_ticket_types

Pricing tiers per event.

```sql
CREATE TABLE event_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Capacity
  capacity INT,
  sold_count INT DEFAULT 0,
  
  -- Sales window
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Ordering
  sort_order INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. event_email_templates

Customizable email content.

```sql
CREATE TABLE event_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  template_type TEXT NOT NULL
    CHECK (template_type IN ('confirmation', 'reminder', 'cancellation', 'custom')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, template_type)
);
```

---

## Views

### event_registrations_with_event

JOIN view for admin dashboards.

```sql
CREATE VIEW event_registrations_with_event AS
SELECT 
  r.*,
  e.title as event_title,
  e.event_date,
  e.location
FROM event_registrations r
JOIN events e ON r.event_id = e.id;
```

---

## Functions

### can_delete_event(UUID)

Guard function to check if event can be deleted.

```sql
CREATE OR REPLACE FUNCTION can_delete_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM event_registrations 
    WHERE event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## RLS Policies

### events
- **Public:** SELECT WHERE status = 'published'
- **Admin:** ALL WHERE is_admin_user()

### event_form_schemas
- **Public:** SELECT WHERE is_active = true
- **Admin:** ALL WHERE is_admin_user()

### event_form_templates
- **Public:** SELECT WHERE is_public = true
- **Admin:** ALL WHERE is_admin_user()

### event_registrations
- **Public:** INSERT (with validation)
- **Admin:** SELECT, UPDATE WHERE is_admin_user()

### event_ticket_types
- **Public:** SELECT WHERE is_active = true
- **Admin:** ALL WHERE is_admin_user()

---

## Migrations

| File | Description |
|------|-------------|
| `050-events-module-schema.sql` | Core schema (7 tables, views, functions, RLS) |
| `051-event-registration-enhancements.sql` | Registration enhancements |
| `052-agenda-highlighted.sql` | Added `highlighted` column to agenda |
| `053-ticket-sold-count.sql` | Added `sold_count` to ticket types |
| `055-event-form-template-seeds.sql` | 15 default form templates |

---

**Last Updated:** July 25, 2026
