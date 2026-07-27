# Event Management Module - Architecture Specification

**Version:** 1.0  
**Date:** July 23, 2026  
**Status:** Draft - Pending Approval

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [System Boundaries](#3-system-boundaries)
4. [Data Architecture](#4-data-architecture)
5. [Application Architecture](#5-application-architecture)
6. [Component Reuse Strategy](#6-component-reuse-strategy)
7. [Security Architecture](#7-security-architecture)
8. [Performance Considerations](#8-performance-considerations)

---

## 1. System Overview

### 1.1 Purpose

The Event Management Module is a standalone, CMS-like platform for creating and managing events with custom registration forms, pricing, and email communications.

### 1.2 Key Capabilities

**Admin Features:**
- Event CRUD (Create, Read, Update, Delete with safety guards)
- Dynamic content management (banner, description, agenda, location)
- Custom form builder per event (drag-and-drop)
- Pricing tiers (ticket types)
- Email template customization
- Registration management
- Event lifecycle (draft → published → disabled → archived)

**Public Features:**
- Event browsing (`/events`)
- Event detail pages (`/events/[slug]`)
- Dynamic registration forms
- Payment processing (multi-provider)
- Automated email confirmations

### 1.3 System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEESSA Foundation Platform                │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  Conference System   │      │  Event Management    │    │
│  │    (Legacy)          │      │     Module (New)     │    │
│  │                      │      │                      │    │
│  │  /conference/*       │      │  /events/*           │    │
│  │  conference_* tables │      │  event_* tables      │    │
│  │                      │      │                      │    │
│  │  ✅ Production       │      │  🏗️ In Development   │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           │                              │                   │
│           └──────────────┬───────────────┘                   │
│                          │                                   │
│                    Shared Layer:                             │
│              - Payment Providers (Stripe, Khalti, eSewa)    │
│              - Email Service                                 │
│              - Admin Authentication                          │
│              - Storage (Supabase)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Separation of Concerns

**Strict Isolation:**
- Event module code in dedicated namespaces (`/events`, `event_*`)
- No modifications to existing conference code
- Read-only imports allowed, edits forbidden

**Why:** Protects production conference system while building new module

### 2.2 Additive-Only Database Changes

**Rules:**
- New tables only (no edits to existing tables except events)
- Events table extended with nullable columns only
- New migration files (never edit existing migrations)
- Partition column (`source_system`) separates data

**Why:** Zero risk to existing data, easy rollback

### 2.3 Component Reuse

**Import, Don't Duplicate (Where Safe):**
- Form field components (generic, battle-tested)
- Form schema types (structurally compatible)
- Payment provider integration (if modular)

**Rebuild (Where Needed):**
- Form builder UI (different URL structure, no EventSelector)
- Event-specific business logic

**Why:** Leverage proven code, avoid coupling

### 2.4 Progressive Enhancement

**Build in Phases:**
1. Schema → Actions → Admin CRUD
2. Form builder → Pricing → Emails
3. Public pages → Registration → Payments
4. Polish → Testing → Deployment

**Why:** Each phase delivers value, reduces risk

---

## 3. System Boundaries

### 3.1 In Scope

✅ Generic event management (any event type)
✅ Dynamic form builder per event
✅ Multi-ticket pricing
✅ Payment processing (existing providers)
✅ Email automation
✅ Event lifecycle management
✅ Registration tracking
✅ Admin dashboard

### 3.2 Out of Scope

❌ Modifications to conference system
❌ Real-time seat availability
❌ Check-in / QR code scanning
❌ Event series / recurring events
❌ Multi-language support (Phase 1)
❌ Mobile app
❌ Waitlist management (future)

### 3.3 Deferred to Later Phases

🔄 Email campaign management
🔄 Advanced reporting & analytics
🔄 Integration with external calendars
🔄 Social media integration
🔄 Refund processing
🔄 Group discounts / promo codes

---

## 4. Data Architecture

### 4.1 Database Strategy

**Approach:** Extend shared `events` table + new module-specific tables

**Rationale:**
- Events table was designed as generic (see original schema comments)
- Partition column (`source_system`) ensures data isolation
- Avoids duplication of "event" concept
- Allows future consolidation if desired

### 4.2 Table Overview

```
events (extended - shared)
  ├─ source_system = 'events_module' | 'legacy_conference'
  └─ New columns: status, banner_url, gallery, venue details
  
event_agenda_items (new)
  └─ Ordered list of sessions/schedule per event
  
event_form_schemas (new)
  └─ Versioned form definitions per event
  
event_form_templates (new)
  └─ Reusable form starting points
  
event_registrations (new)
  └─ Slimmer than conference_registrations (more JSONB)
  
event_ticket_types (new)
  └─ Pricing tiers per event
  
event_email_templates (new)
  └─ Customizable email content per event
```

**See:** `04-DATABASE-SCHEMA.md` for complete schema

---

## 5. Application Architecture

### 5.1 Route Structure

**Public Routes:**
```
/events                          # Event listing
/events/[slug]                   # Event detail page
/events/[slug]/register          # Registration form
/events/[slug]/register/payment-options
/events/[slug]/register/pending-payment
/events/[slug]/register/payment-success
/events/[slug]/register/success
/events/[slug]/register/failure
```

**Admin Routes:**
```
/admin/events                    # Event list
/admin/events/new                # Create event
/admin/events/[id]               # Event dashboard
/admin/events/[id]/details       # Edit basic info
/admin/events/[id]/media         # Upload images
/admin/events/[id]/agenda        # Manage schedule
/admin/events/[id]/location      # Set venue/map
/admin/events/[id]/form-builder  # Build registration form
/admin/events/[id]/pricing       # Configure tickets
/admin/events/[id]/email-templates  # Customize emails
/admin/events/[id]/registrations # View submissions
/admin/events/[id]/settings      # Enable/disable/archive/delete
```

### 5.2 Component Structure

```
components/events/
├── public/                      # Public-facing components
│   ├── EventCard.tsx
│   ├── EventsGrid.tsx
│   ├── EventBanner.tsx
│   ├── EventAgenda.tsx
│   ├── EventMap.tsx
│   ├── EventRegisterCta.tsx
│   └── event-registration-form.tsx
│
└── admin/                       # Admin components
    ├── EventTable.tsx
    ├── EventBasicInfoForm.tsx
    ├── AgendaEditor.tsx
    ├── LocationEditor.tsx
    ├── PricingEditor.tsx
    ├── EmailTemplateEditor.tsx
    ├── EventFormBuilder.tsx
    └── EventStatusControls.tsx
```

### 5.3 Server Actions Structure

```
lib/actions/events-module/
├── event-crud.ts                # Core CRUD operations
├── event-agenda.ts              # Agenda management
├── event-form-schema.ts         # Form versioning
├── event-registration.ts        # Registration handling
├── event-pricing.ts             # Ticket types
└── event-email-templates.ts     # Email management
```

---

## 6. Component Reuse Strategy

### 6.1 Direct Imports (Read-Only)

**From Conference System:**
```typescript
// ✅ Allowed - Generic field components
import { FieldText } from "@/components/conference/fields/field-text"
import { DynamicStep } from "@/components/conference/dynamic-step"

// ✅ Allowed - Type definitions
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"

// ✅ Allowed - If modular
import { startStripeCheckout } from "@/lib/payments/stripe"
```

### 6.2 Rebuild for Module

**Event-Specific Logic:**
```typescript
// ❌ Do NOT import and modify
// ✅ DO rebuild as EventFormBuilder.tsx
components/events/admin/EventFormBuilder.tsx

// Different from conference version:
// - No EventSelector (event already in URL)
// - Different save action (event_form_schemas table)
// - Module-specific validation
```

### 6.3 Conditional Strategy

**Payment Provider Code:**
- If in separate `lib/payments/` → Import directly
- If inline in conference actions → Duplicate minimal glue code
- Document for future consolidation

---

## 7. Security Architecture

### 7.1 Row Level Security (RLS)

**events table:**
```sql
-- Public: see published events only
SELECT WHERE source_system = 'events_module' 
  AND status = 'published'

-- Admin: see all module events
SELECT WHERE source_system = 'events_module'
  AND is_admin_user()
```

**event_registrations:**
```sql
-- Public: INSERT only with validation
INSERT WHERE event_id references published event
  AND consent_terms = true

-- Admin: full access to module registrations
SELECT/UPDATE WHERE is_admin_user()
```

### 7.2 Application-Level Security

**Rate Limiting:**
- Max 3 registrations per IP per 15 minutes
- CAPTCHA on registration form
- DDoS protection via Vercel/Cloudflare

**Input Validation:**
- Server-side validation of all form data
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized outputs)
- CSRF tokens on forms

**Payment Security:**
- Never store card details
- PCI compliance via payment providers
- Webhook signature verification
- Secure session handling

---

## 8. Performance Considerations

### 8.1 Database Optimization

**Indexes:**
```sql
-- Event filtering
idx_events_module_status (source_system, status, event_date)

-- Registration queries
idx_event_reg_event_status (event_id, status)
idx_event_reg_event_payment (event_id, payment_status)

-- Form schema lookup
uq_event_form_schema_active (event_id) WHERE is_active
```

### 8.2 Caching Strategy

**Static Generation:**
- `/events` - Revalidate every 5 minutes
- `/events/[slug]` - Revalidate on content change

**Dynamic Routes:**
- `/events/[slug]/register` - Always fresh (form schema)

**API Responses:**
- Active form schemas - Cache 1 hour
- Event list - Cache 5 minutes
- Registration submission - No cache

### 8.3 Asset Optimization

**Images:**
- Next.js Image component for optimization
- WebP format with fallbacks
- Lazy loading for gallery
- CDN delivery via Vercel

**Bundle Size:**
- Code splitting per route
- Dynamic imports for heavy components
- Tree shaking for unused code

---

## Next Steps

1. Review and approve this architecture
2. Resolve architectural decisions (see `02-DECISIONS.md`)
3. Finalize database schema (see `04-DATABASE-SCHEMA.md`)
4. Begin Phase 1 implementation (see `03-PLANNING.md`)

---

**Document Status:** Draft - Ready for Review  
**Last Updated:** July 23, 2026
