---
title: "Admin - Content API"
description: "| Method | Endpoint | Description |"
owner: "Deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Admin - Content API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stories/:id` | Get story |
| PATCH | `/api/admin/stories/:id` | Update story |
| DELETE | `/api/admin/stories/:id` | Delete story |
| GET | `/api/admin/podcasts` | List podcasts |
| POST | `/api/admin/podcasts` | Create podcast |
| GET | `/api/admin/podcasts/:id` | Get podcast |
| PATCH | `/api/admin/podcasts/:id` | Update podcast |
| DELETE | `/api/admin/podcasts/:id` | Delete podcast |

---

## Stories

### Get Story

### Endpoint

```
GET /api/admin/stories/:id
```

### Description

Retrieves a success story by ID.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Story UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Community Impact Story",
    "description": "...",
    "image": "https://...",
    "is_published": true,
    "created_at": "2026-08-05T10:30:00Z"
  }
}
```

---

### Update Story

### Endpoint

```
PATCH /api/admin/stories/:id
```

### Description

Updates a success story.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Story UUID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Story title |
| `description` | string | No | Story description |
| `image` | string | No | Image URL |
| `is_published` | boolean | No | Publication status |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Story updated"
}
```

---

### Delete Story

### Endpoint

```
DELETE /api/admin/stories/:id
```

### Description

Deletes a success story.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Story UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Story deleted"
}
```

---

## Podcasts

### List Podcasts

### Endpoint

```
GET /api/admin/podcasts
```

### Description

Retrieves all podcasts.

### Authentication

Required: Yes

### Permissions

Admin, Super Admin

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Accessibility Talk",
      "description": "...",
      "audio_url": "https://...",
      "duration": 1800,
      "created_at": "2026-08-05T10:30:00Z"
    }
  ]
}
```

---

### Create Podcast

### Endpoint

```
POST /api/admin/podcasts
```

### Description

Creates a new podcast episode.

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
| `title` | string | Yes | Podcast title |
| `description` | string | No | Episode description |
| `audio_url` | string | Yes | Audio file URL |
| `duration` | number | No | Duration in seconds |

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Podcast created",
  "data": {
    "id": "uuid"
  }
}
```

---

### Get Podcast

### Endpoint

```
GET /api/admin/podcasts/:id
```

### Description

Retrieves a podcast by ID.

### Authentication

Required: Yes

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Podcast UUID |

---

### Update Podcast

### Endpoint

```
PATCH /api/admin/podcasts/:id
```

### Description

Updates a podcast episode.

### Authentication

Required: Yes

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Podcast UUID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Podcast title |
| `description` | string | No | Episode description |
| `audio_url` | string | No | Audio file URL |

---

### Delete Podcast

### Endpoint

```
DELETE /api/admin/podcasts/:id
```

### Description

Deletes a podcast episode.

### Authentication

Required: Yes

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Podcast UUID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Podcast deleted"
}
```

---

## Notes

- Stories are public success stories displayed on the homepage
- Podcasts are audio episodes for the podcast section
- Only admins can manage content
- Stories support publication status (draft/published)
- Podcasts require an audio URL (stored in Supabase Storage)
