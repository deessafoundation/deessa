# Admin - Events API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/events` | List all events |
| POST | `/api/admin/events` | Create new event |
| PATCH | `/api/admin/events/:id` | Update event |
| DELETE | `/api/admin/events/:id` | Delete event |
| GET | `/api/admin/events/:id/settings` | Get event settings |
| PATCH | `/api/admin/events/:id/settings` | Update event settings |
| GET | `/api/admin/events/:id/pricing` | Get pricing tiers |
| POST | `/api/admin/events/:id/pricing` | Create pricing tier |
| GET | `/api/admin/events/:id/form-schema` | Get registration form |
| PUT | `/api/admin/events/:id/form-schema` | Update registration form |
| GET | `/api/admin/events/:id/agenda` | Get agenda items |
| POST | `/api/admin/events/:id/agenda` | Create agenda item |
| GET | `/api/admin/events/:id/email-templates` | Get email templates |
| PUT | `/api/admin/events/:id/email-templates` | Update email template |
| GET | `/api/admin/events/:id/register-button` | Get register button config |

---

## List Events

### Endpoint

```
GET /api/admin/events
```

### Description

Retrieves all events for admin management.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Request Headers

```http
Authorization: Bearer <token>
```

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Accessibility Summit 2026",
      "slug": "accessibility-summit-2026",
      "description": "...",
      "event_date": "2026-10-15",
      "event_time": "09:00 AM",
      "location": "Kathmandu",
      "status": "published",
      "category": "conference",
      "is_free": false,
      "created_at": "2026-08-01T10:00:00Z"
    }
  ]
}
```

---

## Create Event

### Endpoint

```
POST /api/admin/events
```

### Description

Creates a new event.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Event title |
| `slug` | string | Yes | URL-friendly slug |
| `description` | string | Yes | Full description |
| `event_date` | string | Yes | ISO date (YYYY-MM-DD) |
| `location` | string | Yes | Event location |
| `status` | string | No | Default: `draft` |
| `category` | string | No | Default: `general` |
| `is_free` | boolean | No | Default: false |

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "uuid",
    "title": "Accessibility Summit 2026",
    "slug": "accessibility-summit-2026",
    "status": "draft"
  }
}
```

---

## Update Event Settings

### Endpoint

```
PATCH /api/admin/events/:id/settings
```

### Description

Updates event settings including registration, capacity, and contact info.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Event UUID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registration_enabled` | boolean | No | Enable/disable registration |
| `registration_open_at` | string | No | ISO datetime |
| `registration_close_at` | string | No | ISO datetime |
| `max_capacity` | number | No | Max attendees (null = unlimited) |
| `contact_email` | string | No | Contact email |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## Manage Pricing Tiers

### Endpoint

```
GET /api/admin/events/:id/pricing
POST /api/admin/events/:id/pricing
```

### Description

Manage ticket types and pricing for an event.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### POST Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tier name (e.g., "Early Bird") |
| `price` | number | Yes | Price in currency units |
| `currency` | string | No | Default: `NPR` |
| `capacity` | number | No | Tier capacity (null = unlimited) |
| `sales_start` | string | No | ISO datetime |
| `sales_end` | string | No | ISO datetime |

### Success Response

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Early Bird",
    "price": 5000,
    "currency": "NPR"
  }
}
```

---

## Manage Form Schema

### Endpoint

```
GET /api/admin/events/:id/form-schema
PUT /api/admin/events/:id/form-schema
```

### Description

Manage the registration form schema for an event.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### PUT Request Body

```json
{
  "fields": [
    {
      "id": "full_name",
      "type": "text",
      "label": "Full Name",
      "required": true
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email Address",
      "required": true
    },
    {
      "id": "organization",
      "type": "text",
      "label": "Organization",
      "required": false
    }
  ]
}
```

---

## Manage Agenda

### Endpoint

```
GET /api/admin/events/:id/agenda
POST /api/admin/events/:id/agenda
```

### Description

Manage multi-day agenda items for an event.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### POST Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day_number` | number | Yes | Day number (1, 2, 3...) |
| `title` | string | Yes | Session title |
| `start_time` | string | No | Display text: "09:00 AM" |
| `end_time` | string | No | Display text: "10:30 AM" |
| `speaker_name` | string | No | Speaker name |
| `sort_order` | number | No | Default: 0 |

---

## Manage Email Templates

### Endpoint

```
GET /api/admin/events/:id/email-templates
PUT /api/admin/events/:id/email-templates
```

### Description

Manage customizable email templates for event communications.

### Template Types

| Type | Description |
|------|-------------|
| `confirmation` | Registration confirmation |
| `payment_receipt` | Payment receipt |
| `reminder` | Event reminder |
| `cancellation` | Cancellation notice |
| `custom` | Custom email |

### PUT Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `template_type` | string | Yes | Template type |
| `subject` | string | Yes | Email subject |
| `body_html` | string | Yes | HTML body |
| `body_text` | string | No | Plain text body |

### Template Variables

Use `{{variable}}` syntax for dynamic content:

- `{{full_name}}` - Registrant's name
- `{{event_title}}` - Event title
- `{{event_date}}` - Event date
- `{{payment_amount}}` - Payment amount

---

## Notes

- Events can only be deleted if they have no registrations
- Form schema follows the conference form schema pattern
- Email templates support HTML and plain text
- Agenda items support multi-day events via `day_number`
