---
title: "Architectural Decisions & Rationale"
description: "Version: 1.1"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Architectural Decisions & Rationale

**Version:** 1.1  
**Date:** July 23, 2026  
**Status:**  Approved — All 7 decisions approved

---

## Decision Framework

Each decision follows this format:
- **Decision ID:** Unique identifier
- **Status:** 🟢 Approved | 🟡 Pending | 🔴 Rejected
- **Context:** Why this decision is needed
- **Options:** Alternatives considered
- **Recommendation:** Suggested approach
- **Rationale:** Why this is recommended
- **Consequences:** Trade-offs and impacts
- **Action Required:** What needs to happen next

---

## Decision 1: Database Table Strategy

**ID:** `DEC-001`  
**Status:** 🟢 APPROVED - Create New Table  
**Category:** Data Architecture  
**Decided By:** Product Owner  
**Date:** July 23, 2026  
**User Decision:** d1 - Drop events table, drop/refactor existing routes

### Decision
**CREATE NEW `events` TABLE** - Drop existing unused table and create fresh

### User's Decision
> "d1 : lets drop the events table we donot have any data there i created a sample test event earlier but we dont need that lets drop that table and we have /events/page and in /admin/events lets drop them or refactor them what would be better choice and conference isnot linked to this table check the schemas it has its own conference table"

### Context
- Existing `events` table has only test data (no production data)
- Conference system has its own separate `conference_*` tables (not linked to events)
- Existing `/events` pages can be dropped/refactored
- Clean slate is better than migration complexity

### Final Approach
```sql
-- Drop existing events table (no production data)
DROP TABLE IF EXISTS events CASCADE;

-- Create new events table for module
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
```

### Consequences
-  Clean, focused schema
-  No migration complexity
-  No partition column needed
-  Existing `/events` and `/admin/events` will be rebuilt fresh
-  No risk to conference system (completely separate)

### Actions Completed
- [x] Verified no production data in events table
- [x] Confirmed conference system independence
- [x] Approved fresh start approach

---

## Decision 2: Component Reuse Strategy

**ID:** `DEC-002`  
**Status:** 🟢 APPROVED - Import Components  
**Category:** Frontend Architecture  
**Decided By:** Frontend Lead  
**Date:** July 23, 2026  
**User Decision:** d2 - A (Import field components from conference system)

### Decision
**IMPORT field components from conference system (read-only)**

### User's Decision
> "d2: A" — Import field components from conference system (read-only)

### Context
- Conference system has 14+ generic field components
- Field components are structurally generic (not conference-specific)
- Read-only imports = zero coupling risk
- Avoids 1000+ lines of duplication

### Approved Imports
```typescript
//  Allowed - Generic field components
import { FieldText } from "@/components/conference/fields/field-text"
import { FieldEmail } from "@/components/conference/fields/field-email"
import { FieldSelect } from "@/components/conference/fields/field-select"
// ... all 14 field types

//  Allowed - Form renderer
import { DynamicStep } from "@/components/conference/dynamic-step"

//  Allowed - Type definitions
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"
```

### Rationale
1. Field components are structurally generic
2. Read-only imports = zero coupling risk
3. Leverages battle-tested code
4. Avoids 1000+ lines of duplication

### What We Will Rebuild
- `EventFormBuilder.tsx` (different URL structure, no EventSelector)
- Event-specific business logic
- Event registration wrapper component

### Consequences
-  Zero code duplication
-  Automatic bug fixes in fields
-  Faster development
-  Consistent user experience

### Actions Completed
- [x] Approved read-only import strategy
- [x] Documented allowed imports
- [x] Identified rebuild targets

---

## Decision 3: Card Register Button Behavior

**ID:** `DEC-003`  
**Status:** 🟢 APPROVED - Direct to Form  
**Category:** UX Design  
**Decided By:** UX Designer  
**Date:** July 23, 2026  
**User Decision:** d3 - A (Register button = Direct fast-path to registration form)

### Decision
**Register button = Direct fast-path to registration form**

### User's Decision
> "d3: A" — Register button directly navigates to registration form

### User Flow
```
Click Register button → /events/[slug]/register (direct)
Click card body       → /events/[slug] (detail page)

Detail page also has Register CTA → /events/[slug]/register
```

### Implementation
```typescript
<EventCard
  onRegisterClick={() => router.push(`/events/${slug}/register`)}
  onCardClick={() => router.push(`/events/${slug}`)}
/>
```

### Rationale
1. Reduces friction for motivated users (one click to register)
2. Detail page still available for info-seekers
3. Standard pattern for registration flows
4. "Register directly" requirement satisfied

### Consequences
-  Fast registration path
-  Clear user intent separation
-  Detail page for exploration
-  Two click handlers needed

### Actions Completed
- [x] Approved fast-path approach
- [x] Documented click handlers
- [x] Defined route structure

---

## Decision 4: Payment Provider Code Location

**ID:** `DEC-004`  
**Status:** 🟡 DEFERRED - Payment Module in Development  
**Category:** Backend Architecture  
**Decided By:** Tech Lead  
**Date:** July 23, 2026  
**User Decision:** d4 - Defer integration, another developer working on payment module

### Decision
**DEFER integration - Another developer working on payment module**

### User's Decision
> "d4: if not modular make it modular but skip it for now as another developer is working on payment module once he complete we will integrate that"

### Current Status
- Separate developer building modular payment system
- Will integrate once payment module is complete
- Payment module will be provider-agnostic

### Placeholder Strategy
```typescript
// Phase 1-5: Build without payment integration
// Use mock payment handler for testing

// lib/actions/events-module/event-registration.ts
async function processPayment(data) {
  // TODO: Integrate with payment module when ready
  return { success: true, mock: true }
}
```

### Integration Plan
**When payment module is complete:**
1. Review payment module API
2. If modular → Import directly
3. If not modular → Request refactoring
4. Integrate into event registration flow
5. Test with all 3 providers (Stripe, Khalti, eSewa)

### Consequences
- ⚠️ Phase 1-5 will have mock/placeholder payment
- ⚠️ Cannot fully test registration flow until integrated
-  Avoids duplicate work
-  Gets modular payment system for free

### Actions Required
- [ ] Coordinate with payment module developer
- [ ] Define integration interface requirements
- [ ] Schedule integration sprint (Phase 6+)
- [ ] Document payment module API when ready

### Dependencies
- Blocked: Full registration testing
- Blocked: Payment confirmation emails
- Blocked: Payment status tracking

---

## Decision 5: Free Events Handling

**ID:** `DEC-005`  
**Status:** 🟢 APPROVED - Explicit is_free Flag  
**Category:** Business Logic  
**Decided By:** Product Owner  
**Date:** July 23, 2026  
**User Decision:** d5 - B (Admin decides pricing mode via is_free flag)

### Decision
**ADD `is_free` BOOLEAN FLAG** - Admin decides pricing mode explicitly

### User's Decision
> "d5: B admin can decide whether to make it free or paid or free for sometime and then pay to enter"

### Schema Addition
```sql
ALTER TABLE events 
  ADD COLUMN is_free BOOLEAN DEFAULT false;
```

### Pricing Modes

#### Mode 1: Free Event
```typescript
event.is_free = true
// Skip payment entirely, confirm immediately
// No ticket types needed
```

#### Mode 2: Paid Event
```typescript
event.is_free = false
ticket_types.length > 0
// Require payment, show ticket selection
```

#### Mode 3: Free Then Paid (Time-Limited)
```typescript
event.is_free = false
ticket_types = [
  { name: "Early Bird", price: 0, sales_end: "2026-08-01" },
  { name: "Regular", price: 500, sales_start: "2026-08-01" }
]
// Free during early bird, paid after
```

### Registration Logic
```typescript
if (event.is_free) {
  // Skip payment flow
  markRegistrationConfirmed()
  sendConfirmationEmail()
} else {
  // Require payment
  calculateTotalFromTickets()
  redirectToPayment()
}
```

### Rationale
1. Makes admin intent explicit in UI
2. Supports capacity tracking for free events
3. Enables time-limited free periods
4. Clear business logic (no ambiguity)

### Consequences
-  Explicit pricing model
-  Supports multiple pricing strategies
-  Clear in admin UI ("Mark as Free" checkbox)
-  Analytics can track free vs paid events

### Actions Completed
- [x] Approved explicit flag approach
- [x] Documented pricing modes
- [x] Defined registration logic

---

## Decision 6: Event Capacity & Waitlist

**ID:** `DEC-006`  
**Status:** 🟢 APPROVED - Defer to Phase 2+  
**Category:** Feature Scope  
**Decided By:** Product Owner  
**Date:** July 23, 2026  
**User Decision:** d6 - b (Defer capacity management and waitlist to future phase)

### Decision
**DEFER capacity management and waitlist to future phase**

### User's Decision
> "d6: b" — Defer capacity management and waitlist to future phase

### Phase 1 Scope (Approved)
-  Basic event creation & management
-  Dynamic form builder
-  Registration submission
-  Payment integration (when ready)
- ❌ Capacity limits
- ❌ Waitlist management
- ❌ Sold-out handling

### Future Phase 2+ Features
```sql
-- To be added later
ALTER TABLE events 
  ADD COLUMN max_capacity INT;
  
CREATE TABLE event_waitlist (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  email TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);
```

### Rationale
1. Not in original MVP requirements
2. Adds significant complexity
3. Phase 1 already has large scope
4. Can add later without breaking changes
5. Most events won't need capacity limits initially

### Consequences
-  Faster Phase 1 delivery
-  Simpler initial implementation
-  Focus on core features first
- ⚠️ Unlimited registration (admin monitors manually)

### Actions Completed
- [x] Confirmed deferral to future phase
- [x] Documented for Phase 2 backlog
- [x] Timeline focused on core features

### Future Integration Notes
- Add max_capacity to events table
- Create waitlist table and logic
- Build "Sold Out" UI states
- Email notifications when spots open

---

## Decision 7: Multi-Day Event Handling

**ID:** `DEC-007`  
**Status:** 🟢 APPROVED - Single Table with day_number  
**Category:** Data Modeling  
**Decided By:** Backend Lead  
**Date:** July 23, 2026  
**User Decision:** d7 - A (Use single agenda table with day_number column)

### Decision
**USE SINGLE AGENDA TABLE with `day_number` column**

### User's Decision
> "d7: A" — Use single agenda table with day_number column

### Schema Design
```sql
CREATE TABLE event_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Multi-day support
  day_number INT NOT NULL DEFAULT 1,
  day_label TEXT,  -- Optional: "Day 1: Opening", "Saturday", etc.
  
  -- Time slots
  start_time TEXT,  -- "09:00 AM"
  end_time TEXT,    -- "10:30 AM"
  
  -- Session details
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  track_or_room TEXT,
  
  -- Ordering
  sort_order INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_agenda_event_day 
  ON event_agenda_items(event_id, day_number, sort_order);
```

### Query Examples
```typescript
// Get Day 1 agenda
SELECT * FROM event_agenda_items
WHERE event_id = $1 AND day_number = 1
ORDER BY sort_order;

// Get all days for event
SELECT DISTINCT day_number, day_label
FROM event_agenda_items
WHERE event_id = $1
ORDER BY day_number;
```

### Rationale
1. Simpler queries (no JOINs needed)
2. Most events are 1-3 days (not complex)
3. Easy sorting and filtering
4. Sufficient flexibility for UI grouping
5. Less database overhead

### Consequences
-  Simple data model
-  Fast queries
-  Easy drag-and-drop reordering
-  Supports multi-day events cleanly

### Actions Completed
- [x] Approved single-table approach
- [x] Defined schema with day_number
- [x] Documented query patterns

---

## Summary: Decisions Requiring Action

| ID | Decision | Status | User Decision | Owner | Deadline |
|----|----------|--------|---------------|-------|----------|
| DEC-001 | Drop events table, rebuild fresh |  Approved | d1 - Drop table, drop/refactor routes | Product Owner | July 23, 2026 |
| DEC-002 | Import field components (read-only) |  Approved | d2 - A (Import) | Frontend Lead | July 23, 2026 |
| DEC-003 | Register button = Direct to form |  Approved | d3 - A (Direct) | UX Designer | July 23, 2026 |
| DEC-004 | Defer payment integration | 🟡 Deferred | d4 - Skip for now, integrate later | Tech Lead | TBD (after payment module) |
| DEC-005 | Admin decides free/paid/free-then-paid |  Approved | d5 - B (Admin decides) | Product Owner | July 23, 2026 |
| DEC-006 | Defer capacity/waitlist to Phase 2+ |  Approved | d6 - b (Defer) | Product Owner | July 23, 2026 |
| DEC-007 | Single agenda table with day_number |  Approved | d7 - A (Single table) | Backend Lead | July 23, 2026 |

---

## Decision Log

### Approved Decisions
- **DEC-001** — Drop existing `events` table (no production data), drop or rebuild `/events` and `/admin/events` routes fresh. Conference system has its own tables, completely independent.
- **DEC-002** — Import field components from conference system as read-only. Zero coupling, avoids 1000+ lines of duplication.
- **DEC-003** — Register button directly navigates to `/events/[slug]/register`. Card body navigates to detail page `/events/[slug]`.
- **DEC-005** — Admin explicitly decides pricing mode via `is_free` flag: free event, paid event, or free-for-a-period-then-paid (time-limited early bird).
- **DEC-006** — Defer capacity management and waitlist to Phase 2+. Phase 1 focuses on core features only.
- **DEC-007** — Use single `event_agenda_items` table with `day_number` column for multi-day support. Simpler queries, no JOINs needed.

### Rejected Decisions
_None_

### Deferred Decisions
- **DEC-004** — Payment module integration deferred. Another developer is currently building a modular payment system. Once complete, we will integrate it into the event registration flow. If the payment module is not modular, we will request refactoring before integration.

---

**Next Steps:**
1. ~~Schedule decision review meeting~~  Done
2. ~~Assign owners and deadlines~~  Done
3. ~~Update statuses as decisions are made~~  Done
4. Begin Phase 1 implementation
5. Coordinate with payment module developer for DEC-004 integration timing

---

**Last Updated:** July 23, 2026
