---
title: "Event Management Module - Architecture Specification"
description: "Version: 1.0"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
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
- Event lifecycle (draft â†’ published â†’ disabled â†’ archived)

**Public Features:**
- Event browsing (`/events`)
- Event detail pages (`/events/[slug]`)
- Dynamic registration forms
- Payment processing (multi-provider)
- Automated email confirmations

### 1.3 System Context Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    deessa Foundation Platform                â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  Conference System   â”‚      â”‚  Event Management    â”‚    â”‚
â”‚  â”‚    (Legacy)          â”‚      â”‚     Module (New)     â”‚    â”‚
â”‚  â”‚                      â”‚      â”‚                      â”‚    â”‚
â”‚  â”‚  /conference/*       â”‚      â”‚  /events/*           â”‚    â”‚
â”‚  â”‚  conference_* tables â”‚      â”‚  event_* tables      â”‚    â”‚
â”‚  â”‚                      â”‚      â”‚                      â”‚    â”‚
â”‚  â”‚  âœ… Production       â”‚      â”‚  ðŸ—ï¸ In Development   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚           â”‚                              â”‚                   â”‚
â”‚           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚
â”‚                          â”‚                                   â”‚
â”‚                    Shared Layer:                             â”‚
â”‚              - Payment Providers (Stripe, Khalti, eSewa)    â”‚
â”‚              - Email Service                                 â”‚
â”‚              - Admin Authentication                          â”‚
â”‚              - Storage (Supabase)                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
1. Schema â†’ Actions â†’ Admin CRUD
2. Form builder â†’ Pricing â†’ Emails
3. Public pages â†’ Registration â†’ Payments
4. Polish â†’ Testing â†’ Deployment

**Why:** Each phase delivers value, reduces risk

---

## 3. System Boundaries

### 3.1 In Scope

âœ… Generic event management (any event type)
âœ… Dynamic form builder per event
âœ… Multi-ticket pricing
âœ… Payment processing (existing providers)
âœ… Email automation
âœ… Event lifecycle management
âœ… Registration tracking
âœ… Admin dashboard

### 3.2 Out of Scope

âŒ Modifications to conference system
âŒ Real-time seat availability
âŒ Check-in / QR code scanning
âŒ Event series / recurring events
âŒ Multi-language support (Phase 1)
âŒ Mobile app
âŒ Waitlist management (future)

### 3.3 Deferred to Later Phases

ðŸ”„ Email campaign management
ðŸ”„ Advanced reporting & analytics
ðŸ”„ Integration with external calendars
ðŸ”„ Social media integration
ðŸ”„ Refund processing
ðŸ”„ Group discounts / promo codes

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
  â”œâ”€ source_system = 'events_module' | 'legacy_conference'
  â””â”€ New columns: status, banner_url, gallery, venue details
  
event_agenda_items (new)
  â””â”€ Ordered list of sessions/schedule per event
  
event_form_schemas (new)
  â””â”€ Versioned form definitions per event
  
event_form_templates (new)
  â””â”€ Reusable form starting points
  
event_registrations (new)
  â””â”€ Slimmer than conference_registrations (more JSONB)
  
event_ticket_types (new)
  â””â”€ Pricing tiers per event
  
event_email_templates (new)
  â””â”€ Customizable email content per event
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
â”œâ”€â”€ public/                      # Public-facing components
â”‚   â”œâ”€â”€ EventCard.tsx
â”‚   â”œâ”€â”€ EventsGrid.tsx
â”‚   â”œâ”€â”€ EventBanner.tsx
â”‚   â”œâ”€â”€ EventAgenda.tsx
â”‚   â”œâ”€â”€ EventMap.tsx
â”‚   â”œâ”€â”€ EventRegisterCta.tsx
â”‚   â””â”€â”€ event-registration-form.tsx
â”‚
â””â”€â”€ admin/                       # Admin components
    â”œâ”€â”€ EventTable.tsx
    â”œâ”€â”€ EventBasicInfoForm.tsx
    â”œâ”€â”€ AgendaEditor.tsx
    â”œâ”€â”€ LocationEditor.tsx
    â”œâ”€â”€ PricingEditor.tsx
    â”œâ”€â”€ EmailTemplateEditor.tsx
    â”œâ”€â”€ EventFormBuilder.tsx
    â””â”€â”€ EventStatusControls.tsx
```

### 5.3 Server Actions Structure

```
lib/actions/events-module/
â”œâ”€â”€ event-crud.ts                # Core CRUD operations
â”œâ”€â”€ event-agenda.ts              # Agenda management
â”œâ”€â”€ event-form-schema.ts         # Form versioning
â”œâ”€â”€ event-registration.ts        # Registration handling
â”œâ”€â”€ event-pricing.ts             # Ticket types
â””â”€â”€ event-email-templates.ts     # Email management
```

---

## 6. Component Reuse Strategy

### 6.1 Direct Imports (Read-Only)

**From Conference System:**
```typescript
// âœ… Allowed - Generic field components
import { FieldText } from "@/components/conference/fields/field-text"
import { DynamicStep } from "@/components/conference/dynamic-step"

// âœ… Allowed - Type definitions
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"

// âœ… Allowed - If modular
import { startStripeCheckout } from "@/lib/payments/stripe"
```

### 6.2 Rebuild for Module

**Event-Specific Logic:**
```typescript
// âŒ Do NOT import and modify
// âœ… DO rebuild as EventFormBuilder.tsx
components/events/admin/EventFormBuilder.tsx

// Different from conference version:
// - No EventSelector (event already in URL)
// - Different save action (event_form_schemas table)
// - Module-specific validation
```

### 6.3 Conditional Strategy

**Payment Provider Code:**
- If in separate `lib/payments/` â†’ Import directly
- If inline in conference actions â†’ Duplicate minimal glue code
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
