---
title: "Admin - Notifications API"
description: "| Method | Endpoint | Description |"
owner: "Deesha Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Admin - Notifications API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/notifications` | List notifications |
| POST | `/api/admin/notifications` | Create notification |
| PATCH | `/api/admin/notifications/:id` | Mark as read |
| DELETE | `/api/admin/notifications/:id` | Delete notification |
| POST | `/api/admin/notifications/mark-all-read` | Mark all as read |

---

## List Notifications

### Endpoint

```
GET /api/admin/notifications
```

### Description

Retrieves notifications for the current admin user.

### Authentication

Required: Yes

### Permissions

Admin (any role)

### Request Headers

```http
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Max notifications to return |
| `unreadOnly` | string | No | `false` | Filter: `true` for unread only |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "payment_received",
      "title": "New Donation Received",
      "message": "NPR 5,000 donation from John Doe",
      "link": "/admin/donations",
      "is_read": false,
      "metadata": {
        "donation_id": "uuid",
        "amount": 5000
      },
      "created_at": "2026-08-05T10:30:00Z"
    }
  ]
}
```

---

## Create Notification

### Endpoint

```
POST /api/admin/notifications
```

### Description

Creates a new notification for a specific admin user.

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
| `user_id` | string | Yes | Target admin user UUID |
| `type` | string | Yes | Notification type |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification message |
| `link` | string | No | Relative URL path |
| `metadata` | object | No | Additional data |

### Notification Types

| Type | Description |
|------|-------------|
| `payment_received` | New donation received |
| `payment_failed` | Payment processing failed |
| `registration_new` | New event registration |
| `review_required` | Donation requires review |
| `system_alert` | System alert |

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Notification created",
  "data": {
    "id": "uuid"
  }
}
```

---

## Mark Notification as Read

### Endpoint

```
PATCH /api/admin/notifications/:id
```

### Description

Marks a single notification as read.

### Authentication

Required: Yes

### Permissions

Admin (own notifications)

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Notification UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Delete Notification

### Endpoint

```
DELETE /api/admin/notifications/:id
```

### Description

Deletes a notification.

### Authentication

Required: Yes

### Permissions

Admin (own notifications), Super Admin

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Notification UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Mark All as Read

### Endpoint

```
POST /api/admin/notifications/mark-all-read
```

### Description

Marks all unread notifications as read for the current user.

### Authentication

Required: Yes

### Permissions

Admin (any role)

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 12
  }
}
```

---

## Notes

- Notifications are scoped to the current admin user
- Super Admin can manage all notifications
- Regular admins can only manage their own notifications
- `metadata` field is flexible JSON for context data
