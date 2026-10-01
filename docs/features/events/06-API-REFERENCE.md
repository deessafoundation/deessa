---
title: "API Reference"
description: "Version: 2.0"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# API Reference

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

The Event Management Module uses Next.js Server Actions for mutations and API routes for reads. All admin operations use service role client (bypasses RLS).

---

## Server Actions

### Event CRUD (`event-crud.ts`)

#### `getEvents(filters?)`
Fetch events with optional filtering.

```typescript
getEvents(filters?: {
  status?: EventStatus
  category?: string
  search?: string
  page?: number
  limit?: number
}): Promise<Result<{ events: EventModuleEvent[], total: number }>>
```

#### `getEventById(id)`
Fetch single event by ID.

```typescript
getEventById(id: string): Promise<Result<EventModuleEvent>>
```

#### `getEventBySlug(slug)`
Fetch single event by URL slug.

```typescript
getEventBySlug(slug: string): Promise<Result<EventModuleEvent>>
```

#### `createEvent(data)`
Create a new event.

```typescript
createEvent(data: {
  title: string
  description: string
  event_date: string
  location: string
  // ... other fields
}): Promise<Result<EventModuleEvent>>
```

#### `updateEvent(id, data)`
Update event details.

```typescript
updateEvent(id: string, data: Partial<EventModuleEvent>): Promise<Result<void>>
```

#### `deleteEvent(id)`
Delete event (requires no registrations).

```typescript
deleteEvent(id: string): Promise<Result<void>>
```

#### `duplicateEvent(id)`
Clone event with all settings (except registrations).

```typescript
duplicateEvent(id: string): Promise<Result<EventModuleEvent>>
```

#### `setEventStatus(id, status)`
Transition event status.

```typescript
setEventStatus(
  id: string, 
  status: "draft" | "published" | "disabled" | "archived"
): Promise<Result<void>>
```

---

### Form Schema (`event-form-schema.ts`)

#### `getActiveFormSchema(eventId)`
Get the active form schema for an event.

```typescript
getActiveFormSchema(eventId: string): Promise<FormSchema | null>
```

#### `createFormSchema(eventId, formConfig, publish?)`
Save a new form schema version.

```typescript
createFormSchema(
  eventId: string,
  formConfig: FormSchema,
  publish?: boolean
): Promise<ActionResult<{ version: number }>>
```

**Behavior:**
- Creates new version (incremental)
- If `publish: true`, deactivates previous active schemas
- Cleans up broken rows (null form_config)
- Revalidates cache

#### `activateSchemaVersion(eventId, version)`
Activate a specific schema version.

```typescript
activateSchemaVersion(
  eventId: string, 
  version: number
): Promise<ActionResult<void>>
```

---

### Form Templates (`event-form-templates.ts`)

#### `getEventFormTemplates(category?)`
Fetch all public templates.

```typescript
getEventFormTemplates(
  category?: string
): Promise<Result<EventFormTemplate[]>>
```

#### `getEventTemplateCategories()`
Fetch unique template categories.

```typescript
getEventTemplateCategories(): Promise<Result<string[]>>
```

#### `saveEventFormAsTemplate(params)`
Save current form as a template.

```typescript
saveEventFormAsTemplate(params: {
  name: string
  description?: string
  category?: string
  isPublic?: boolean
  formConfig: FormSchema
}): Promise<Result<string>>
```

#### `applyEventTemplateToEvent(params)`
Apply template to an event.

```typescript
applyEventTemplateToEvent(params: {
  templateId: string
  eventId: string
  activate?: boolean
}): Promise<Result<void>>
```

---

### Registration (`event-registration.ts`)

#### `registerForEvent(data)`
Submit a registration.

```typescript
registerForEvent(data: {
  eventId: string
  fullName: string
  email: string
  phone?: string
  ticketTypeId?: string
  customFields?: Record<string, unknown>
  consentTerms: boolean
  consentNewsletter?: boolean
}): Promise<{
  success: boolean
  registrationId?: string
  paymentRequired?: boolean
  paymentAmount?: number
  error?: string
}>
```

**Validations:**
- Event must be published
- Registration must be enabled
- Registration deadline check
- Duplicate email guard
- Rate limiting (5 per event per 15 min)

---

## API Routes

### GET `/api/admin/events/[id]/form-schema`
Fetch the active form schema for an event.

**Response:**
```json
{
  "schema": FormSchema | null
}
```

**Behavior:**
- Uses service role client (bypasses RLS)
- Finds latest schema with valid `form_config`
- Falls back to any schema with data if no active schema

---

### GET `/api/admin/events/[id]/settings`
Fetch event details with stats.

**Response:**
```json
{
  "event": EventModuleEvent,
  "stats": {
    "totalRegistrations": number,
    "confirmedRegistrations": number,
    "pendingRegistrations": number,
    "cancelledRegistrations": number,
    "totalRevenue": number
  }
}
```

---

### GET `/api/admin/events/[id]/agenda`
Fetch agenda items for an event.

**Response:**
```json
{
  "items": EventAgendaItem[]
}
```

---

### GET `/api/admin/events/[id]/pricing`
Fetch ticket types for an event.

**Response:**
```json
{
  "ticketTypes": EventTicketType[]
}
```

---

### GET `/api/admin/events/[id]/email-templates`
Fetch email templates for an event.

**Response:**
```json
{
  "templates": EventEmailTemplate[]
}
```

---

## Error Handling

All server actions return `Result<T>` or `ActionResult<T>`:

```typescript
type Result<T> = 
  | { success: true; data: T } 
  | { success: false; error: string }

type ActionResult<T> = 
  | { success: true; data?: T } 
  | { success: false; error: string }
```

API routes return JSON with optional `error` field.

---

## Authentication

- **Server Actions:** Use `requireAdmin()` which checks `admin_users` table
- **API Routes:** Use `createServiceRoleClient()` for admin data access
- **Public API:** No authentication required (RLS handles access)

---

## Rate Limiting

Registration endpoint: 5 requests per event per 15 minutes per IP.

---

**Last Updated:** July 25, 2026
