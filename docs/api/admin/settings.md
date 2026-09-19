---
title: "Admin - Settings API"
description: "| Method | Endpoint | Description |"
owner: "Deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Admin - Settings API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings/support` | Get support settings |
| POST | `/api/admin/settings/support` | Update support settings |
| GET | `/api/admin/homepage-settings` | Get homepage settings |
| POST | `/api/admin/homepage-settings` | Update homepage settings |

---

## Get Support Settings

### Endpoint

```
GET /api/admin/settings/support
```

### Description

Retrieves the current support system configuration.

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
  "data": {
    "enabled": true
  }
}
```

---

## Update Support Settings

### Endpoint

```
POST /api/admin/settings/support
```

### Description

Updates the support system configuration.

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
| `enabled` | boolean | Yes | Enable/disable support system |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Support settings updated"
}
```

---

## Get Homepage Settings

### Endpoint

```
GET /api/admin/homepage-settings
```

### Description

Retrieves homepage CMS settings including hero, sections, and content.

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
  "data": {
    "hero_title": "Deessa Foundation",
    "hero_subtitle": "Empowering communities",
    "sections": [
      {
        "id": "whatwedo",
        "title": "What We Do",
        "content": "..."
      }
    ]
  }
}
```

---

## Update Homepage Settings

### Endpoint

```
POST /api/admin/homepage-settings
```

### Description

Updates homepage CMS settings.

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
| `hero_title` | string | No | Hero section title |
| `hero_subtitle` | string | No | Hero section subtitle |
| `sections` | array | No | Content sections |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Homepage settings updated"
}
```

---

## Notes

- Settings are stored in `site_settings` table
- Settings use key-value pairs
- Homepage settings support flexible JSON structure
- Only admins can modify settings
