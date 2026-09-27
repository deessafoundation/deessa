---
title: "Admin - Support API"
description: "| Method | Endpoint | Description |"
owner: "Deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Admin - Support API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/support` | List support tickets |
| GET | `/api/admin/support/:id` | Get ticket details |
| PATCH | `/api/admin/support/:id` | Update ticket status |
| POST | `/api/admin/support/actions` | Perform ticket action |
| GET | `/api/admin/support/export` | Export tickets to CSV |
| GET | `/api/admin/support/signed` | Get signed upload URL |

---

## List Support Tickets

### Endpoint

```
GET /api/admin/support
```

### Description

Retrieves a paginated list of support tickets.

### Authentication

Required: Yes

### Permissions

Admin, Support Viewer

### Request Headers

```http
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number |
| `limit` | number | No | 25 | Items per page |
| `status` | string | No | - | Filter: `open`, `in_progress`, `resolved`, `closed` |
| `priority` | string | No | - | Filter: `low`, `medium`, `high`, `urgent` |
| `search` | string | No | - | Search by subject or email |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subject": "Payment not reflected",
      "email": "user@example.com",
      "category": "payment",
      "priority": "high",
      "status": "open",
      "created_at": "2026-08-05T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 25,
    "total": 45,
    "totalPages": 2
  }
}
```

---

## Get Ticket Details

### Endpoint

```
GET /api/admin/support/:id
```

### Description

Retrieves full details of a support ticket including messages.

### Authentication

Required: Yes

### Permissions

Admin, Support Viewer

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Ticket UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "Payment not reflected",
    "email": "user@example.com",
    "phone": "+977-9841234567",
    "category": "payment",
    "priority": "high",
    "status": "in_progress",
    "message": "I made a payment but it's not showing...",
    "attachments": ["https://..."],
    "admin_notes": "Contacting Stripe support",
    "created_at": "2026-08-05T10:30:00Z",
    "updated_at": "2026-08-05T14:00:00Z"
  }
}
```

---

## Update Ticket

### Endpoint

```
PATCH /api/admin/support/:id
```

### Description

Updates a support ticket's status or details.

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
| `id` | string | Ticket UUID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | No | New status |
| `priority` | string | No | New priority |
| `admin_notes` | string | No | Admin notes |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Ticket updated"
}
```

---

## Perform Ticket Action

### Endpoint

```
POST /api/admin/support/actions
```

### Description

Performs actions on support tickets (assign, escalate, etc.).

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
| `ticket_id` | string | Yes | Ticket UUID |
| `action` | string | Yes | Action type |
| `data` | object | No | Action-specific data |

### Actions

| Action | Description | Additional Data |
|--------|-------------|-----------------|
| `assign` | Assign to admin | `assigned_to`: user ID |
| `escalate` | Escalate priority | - |
| `resolve` | Mark as resolved | `resolution_notes` |
| `close` | Close ticket | - |
| `reopen` | Reopen ticket | - |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Action performed"
}
```

---

## Export Tickets

### Endpoint

```
GET /api/admin/support/export
```

### Description

Exports support tickets to CSV.

### Authentication

Required: Yes

### Permissions

Admin, Support Viewer

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status |
| `startDate` | string | No | ISO date |
| `endDate` | string | No | ISO date |

### Success Response

**200 OK**

Content-Type: `text/csv`

---

## Get Signed Upload URL

### Endpoint

```
GET /api/admin/support/signed
```

### Description

Generates a signed URL for uploading attachments to support tickets.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Request Headers

```http
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileName` | string | Yes | Original file name |
| `contentType` | string | Yes | MIME type |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "fileUrl": "https://...",
    "expiresAt": "2026-08-05T11:00:00Z"
  }
}
```

---

## Notes

- Support tickets are public submissions from the `/support` page
- Admins can update status and add internal notes
- Export is rate-limited to 5 requests per minute
- Attachments stored in Supabase Storage with 10MB limit
