# Upload API

## Overview

The Upload API handles file uploads to Supabase Storage for testimonials, support screenshots, and media assets.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file |
| DELETE | `/api/upload` | Delete file |

---

## Upload File

### Endpoint

```
POST /api/upload
```

### Description

Uploads a file to Supabase Storage with optional old file replacement.

### Authentication

Required: Yes (Admin)

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Image file (JPG, PNG, WebP) |
| `folder` | string | No | Storage folder: `testimonials`, `support-screenshots`, `media` |
| `oldFilePath` | string | No | Path to old file to delete |
| `customName` | string | No | Custom filename |

### File Constraints

| Constraint | Value |
|------------|-------|
| Max size | 2MB |
| Allowed types | `image/jpeg`, `image/jpg`, `image/png`, `image/webp` |

### Success Response

**200 OK**

```json
{
  "success": true,
  "url": "https://xxx.supabase.co/storage/v1/object/public/media/filename.jpg",
  "path": "media/filename.jpg",
  "bucket": "media",
  "oldFileDeleted": true
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid file type. Only JPG, PNG, and WebP images are allowed."
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Unauthorized - Admin access required"
}
```

**413 Payload Too Large**

```json
{
  "success": false,
  "message": "File size exceeds 2MB limit"
}
```

---

## Delete File

### Endpoint

```
DELETE /api/upload
```

### Description

Deletes a file from Supabase Storage.

### Authentication

Required: Yes (Admin)

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | string | Yes | Full storage URL of file to delete |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Can only delete files from storage"
}
```

---

## Storage Buckets

| Bucket | Usage |
|--------|-------|
| `testimonials` | Testimonial images |
| `support-screenshots` | Support ticket attachments |
| `media` | General media assets |

---

## Notes

- Only admins can upload/delete files
- Files are stored with random UUIDs to prevent naming conflicts
- Old files can be replaced by providing `oldFilePath`
- Delete is non-blocking (doesn't fail upload if deletion fails)
