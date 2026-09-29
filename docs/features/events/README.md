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
psql -f scripts/db/migrations/050-events-module-schema.sql
psql -f scripts/db/migrations/051-event-registration-enhancements.sql
psql -f scripts/db/migrations/052-agenda-highlighted.sql
psql -f scripts/db/migrations/053-ticket-sold-count.sql
psql -f scripts/db/migrations/055-event-form-template-seeds.sql

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
│  │  ✅ Production       │      │  ✅ Production       │    │
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
- **Event CRUD** — Create, update, duplicate, archive, delete
- **Status Lifecycle** — Draft → Published → Disabled → Archived
- **Form Builder** — 21 field types, drag-and-drop, undo/redo
- **Form Templates** — 15 pre-built templates for common events
- **Agenda Editor** — Multi-day schedule with session highlighting
- **Pricing Manager** — Ticket types with capacity tracking
- **Email Templates** — Customizable confirmation, reminder, etc.
- **Registration Dashboard** — View, filter, export registrations

### Public Features
- **Event Listing** — Browse upcoming/past events
- **Event Details** — Hero, agenda, gallery, venue map
- **Registration Form** — Multi-step, schema-driven
- **Payment Flow** — Stripe, Khalti, eSewa integration
- **Confirmation** — Ticket-style success card

### Form Builder Features
- **21 Field Types** — Text, email, phone, select, radio, checkbox, toggle, date, date range, file, signature, rating, slider, rich text, repeating section, heading, paragraph, URL, number, textarea
- **Drag & Drop** — Reorder fields and steps
- **Conditional Logic** — Show/hide fields based on other values
- **Undo/Redo** — 50-step history with Ctrl+Z/Ctrl+Shift+Z
- **Preview Mode** — Desktop/tablet/mobile responsive preview
- **Import/Export** — JSON schema backup and restore
- **Templates** — Apply pre-built templates or save custom ones

---

## File Structure

```
lib/
├── actions/events-module/
│   ├── event-crud.ts              # Core CRUD operations
│   ├── event-agenda.ts            # Agenda management
│   ├── event-form-schema.ts       # Form schema versioning
│   ├── event-form-templates.ts    # Template management
│   ├── event-pricing.ts           # Ticket type CRUD
│   ├── event-email-templates.ts   # Email template CRUD
│   └── event-registration.ts      # Registration submission
├── types/
│   ├── events-module.ts           # TypeScript types
│   └── conference-form-schema.ts  # Form schema types (shared)
└── validation/
    ├── form-schema.ts             # Field validation
    └── conditional-engine.ts      # Conditional logic

components/
├── events/
│   ├── admin/
│   │   ├── EventFormBuilder/      # Form builder (modular)
│   │   │   ├── index.tsx          # Main builder component
│   │   │   ├── FieldPalette.tsx   # Field type selector
│   │   │   ├── FormCanvas.tsx     # Form preview canvas
│   │   │   ├── SortableStepCard.tsx
│   │   │   ├── SortableFieldCard.tsx
│   │   │   ├── FieldPropertiesPanel.tsx
│   │   │   ├── OptionsEditor.tsx
│   │   │   ├── SchemaImportExport.tsx
│   │   │   ├── useBuilderState.ts
│   │   │   └── builder-actions.ts
│   │   ├── AgendaEditor.tsx
│   │   ├── PricingEditor.tsx
│   │   └── EmailTemplateEditor.tsx
│   └── public/
│       └── event-registration-form.tsx
├── conference/
│   └── fields/                    # Shared field components (21 types)
└── ui/                            # shadcn/ui components

app/
├── admin/events/                  # Admin pages
│   ├── page.tsx                   # Event listing
│   ├── new/page.tsx               # Create event
│   └── [id]/settings/             # Event settings dashboard
└── (public)/events/               # Public pages
    ├── page.tsx                   # Event listing
    ├── [slug]/page.tsx            # Event detail
    └── [slug]/register/           # Registration flow

scripts/db/migrations/
├── 050-events-module-schema.sql   # Core schema
├── 051-event-registration-enhancements.sql
├── 052-agenda-highlighted.sql
├── 053-ticket-sold-count.sql
└── 055-event-form-template-seeds.sql  # 15 template seeds
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
