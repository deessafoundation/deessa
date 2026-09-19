---
title: "Event Management Module"
description: "Status: Production Ready"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Management Module

**Status:** Production Ready  
**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

The Event Management Module is a full-featured, CMS-like platform for creating and managing events with custom registration forms, pricing, email communications, and dynamic form builders. It supports NGOs, conferences, workshops, community events, and more.

---

## Quick Start

### For Admins
1. Navigate to `/admin/events`
2. Click **Create Event** or select an existing event
3. Use the **Settings** tab to configure:
   - Details (title, description, dates)
   - Media (banner, gallery)
   - Location (venue, map)
   - Form Builder (registration form)
   - Pricing (ticket types)
   - Email Templates
4. **Publish** when ready

### For Developers
```bash
# Apply database migrations
psql -f scripts/050-events-module-schema.sql
psql -f scripts/051-event-registration-enhancements.sql
psql -f scripts/052-agenda-highlighted.sql
psql -f scripts/053-ticket-sold-count.sql
psql -f scripts/055-event-form-template-seeds.sql

# Start development server
npm run dev
```

---

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + RLS)
- **UI:** Tailwind CSS + shadcn/ui
- **State:** React Server Components + Client Components
- **Forms:** Dynamic schema-driven with 21 field types
- **Drag & Drop:** @dnd-kit (form builder)
- **Rich Text:** TipTap editor

### System Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    DEESSA Foundation Platform                â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  Conference System   â”‚      â”‚  Event Management    â”‚    â”‚
â”‚  â”‚    (Legacy)          â”‚      â”‚     Module (New)     â”‚    â”‚
â”‚  â”‚                      â”‚      â”‚                      â”‚    â”‚
â”‚  â”‚  /conference/*       â”‚      â”‚  /events/*           â”‚    â”‚
â”‚  â”‚  conference_* tables â”‚      â”‚  event_* tables      â”‚    â”‚
â”‚  â”‚                      â”‚      â”‚                      â”‚    â”‚
â”‚  â”‚  âœ… Production       â”‚      â”‚  âœ… Production       â”‚    â”‚
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

### Database Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `events` | Core event records | Status lifecycle, categories, pricing flags |
| `event_agenda_items` | Multi-day schedule | day_number, sorting, highlighted sessions |
| `event_form_schemas` | Versioned form definitions | Per-event, draft/published states |
| `event_form_templates` | Reusable form templates | 15 pre-built templates, categories |
| `event_registrations` | Registration submissions | Core + custom fields, payment tracking |
| `event_ticket_types` | Pricing tiers | Capacity, sold_count, sales windows |
| `event_email_templates` | Email customization | 4 template types per event |

---

## Features

### Admin Features
- **Event CRUD** â€” Create, update, duplicate, archive, delete
- **Status Lifecycle** â€” Draft â†’ Published â†’ Disabled â†’ Archived
- **Form Builder** â€” 21 field types, drag-and-drop, undo/redo
- **Form Templates** â€” 15 pre-built templates for common events
- **Agenda Editor** â€” Multi-day schedule with session highlighting
- **Pricing Manager** â€” Ticket types with capacity tracking
- **Email Templates** â€” Customizable confirmation, reminder, etc.
- **Registration Dashboard** â€” View, filter, export registrations

### Public Features
- **Event Listing** â€” Browse upcoming/past events
- **Event Details** â€” Hero, agenda, gallery, venue map
- **Registration Form** â€” Multi-step, schema-driven
- **Payment Flow** â€” Stripe, Khalti, eSewa integration
- **Confirmation** â€” Ticket-style success card

### Form Builder Features
- **21 Field Types** â€” Text, email, phone, select, radio, checkbox, toggle, date, date range, file, signature, rating, slider, rich text, repeating section, heading, paragraph, URL, number, textarea
- **Drag & Drop** â€” Reorder fields and steps
- **Conditional Logic** â€” Show/hide fields based on other values
- **Undo/Redo** â€” 50-step history with Ctrl+Z/Ctrl+Shift+Z
- **Preview Mode** â€” Desktop/tablet/mobile responsive preview
- **Import/Export** â€” JSON schema backup and restore
- **Templates** â€” Apply pre-built templates or save custom ones

---

## File Structure

```
lib/
â”œâ”€â”€ actions/events-module/
â”‚   â”œâ”€â”€ event-crud.ts              # Core CRUD operations
â”‚   â”œâ”€â”€ event-agenda.ts            # Agenda management
â”‚   â”œâ”€â”€ event-form-schema.ts       # Form schema versioning
â”‚   â”œâ”€â”€ event-form-templates.ts    # Template management
â”‚   â”œâ”€â”€ event-pricing.ts           # Ticket type CRUD
â”‚   â”œâ”€â”€ event-email-templates.ts   # Email template CRUD
â”‚   â””â”€â”€ event-registration.ts      # Registration submission
â”œâ”€â”€ types/
â”‚   â”œâ”€â”€ events-module.ts           # TypeScript types
â”‚   â””â”€â”€ conference-form-schema.ts  # Form schema types (shared)
â””â”€â”€ validation/
    â”œâ”€â”€ form-schema.ts             # Field validation
    â””â”€â”€ conditional-engine.ts      # Conditional logic

components/
â”œâ”€â”€ events/
â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”œâ”€â”€ EventFormBuilder/      # Form builder (modular)
â”‚   â”‚   â”‚   â”œâ”€â”€ index.tsx          # Main builder component
â”‚   â”‚   â”‚   â”œâ”€â”€ FieldPalette.tsx   # Field type selector
â”‚   â”‚   â”‚   â”œâ”€â”€ FormCanvas.tsx     # Form preview canvas
â”‚   â”‚   â”‚   â”œâ”€â”€ SortableStepCard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SortableFieldCard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FieldPropertiesPanel.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OptionsEditor.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SchemaImportExport.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ useBuilderState.ts
â”‚   â”‚   â”‚   â””â”€â”€ builder-actions.ts
â”‚   â”‚   â”œâ”€â”€ AgendaEditor.tsx
â”‚   â”‚   â”œâ”€â”€ PricingEditor.tsx
â”‚   â”‚   â””â”€â”€ EmailTemplateEditor.tsx
â”‚   â””â”€â”€ public/
â”‚       â””â”€â”€ event-registration-form.tsx
â”œâ”€â”€ conference/
â”‚   â””â”€â”€ fields/                    # Shared field components (21 types)
â””â”€â”€ ui/                            # shadcn/ui components

app/
â”œâ”€â”€ admin/events/                  # Admin pages
â”‚   â”œâ”€â”€ page.tsx                   # Event listing
â”‚   â”œâ”€â”€ new/page.tsx               # Create event
â”‚   â””â”€â”€ [id]/settings/             # Event settings dashboard
â””â”€â”€ (public)/events/               # Public pages
    â”œâ”€â”€ page.tsx                   # Event listing
    â”œâ”€â”€ [slug]/page.tsx            # Event detail
    â””â”€â”€ [slug]/register/           # Registration flow

scripts/
â”œâ”€â”€ 050-events-module-schema.sql   # Core schema
â”œâ”€â”€ 051-event-registration-enhancements.sql
â”œâ”€â”€ 052-agenda-highlighted.sql
â”œâ”€â”€ 053-ticket-sold-count.sql
â””â”€â”€ 055-event-form-template-seeds.sql  # 15 template seeds
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture and design decisions |
| [02-DECISIONS.md](./02-DECISIONS.md) | Architectural decisions log |
| [03-FORM-BUILDER.md](./03-FORM-BUILDER.md) | Form builder system documentation |
| [04-FIELD-TYPES.md](./04-FIELD-TYPES.md) | All 21 field types reference |
| [05-TEMPLATES.md](./05-TEMPLATES.md) | Form templates documentation |
| [06-API-REFERENCE.md](./06-API-REFERENCE.md) | Server actions and API routes |
| [07-DATABASE-SCHEMA.md](./07-DATABASE-SCHEMA.md) | Database schema reference |
| [08-DEPLOYMENT.md](./08-DEPLOYMENT.md) | Deployment guide |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## Security

- **Auth guards** on all admin server actions
- **RLS policies** on all database tables
- **Rate limiting** on registration (5 per event per 15 min)
- **Input sanitization** (XSS prevention)
- **Duplicate email guard** per event
- **Service role client** for admin operations (bypasses RLS)

---

## Performance

- **ISR** with 5-minute revalidation for public pages
- **Server-side rendering** for all public routes
- **Loading skeletons** for all pages
- **Error boundaries** with retry options
- **Code splitting** per route

---

**Last Updated:** July 25, 2026
