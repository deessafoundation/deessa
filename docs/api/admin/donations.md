# Admin - Donations API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/donations` | List donations with filters |
| PATCH | `/api/admin/donations` | Update donation status |
| GET | `/api/admin/donations/export` | Export donations to CSV |

---

## List Donations

### Endpoint

```
GET /api/admin/donations
```

### Description

Retrieves a paginated list of donations with filtering and search capabilities.

### Authentication

Required: Yes

### Permissions

Admin, Finance Viewer

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 0 | Page number (0-indexed) |
| `limit` | number | No | 25 | Items per page |
| `status` | string | No | - | Filter: `completed`, `pending`, `failed` |
| `type` | string | No | - | Filter: `monthly`, `one-time` |
| `search` | string | No | - | Search by donor name or email |
| `currency` | string | No | - | Filter: `NPR`, `USD`, etc. |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "donor_name": "John Doe",
      "donor_email": "john@example.com",
      "amount": 1000,
      "currency": "NPR",
      "payment_status": "completed",
      "is_monthly": false,
      "created_at": "2026-08-05T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

## Update Donation

### Endpoint

```
PATCH /api/admin/donations
```

### Description

Updates a donation's review status and adds review notes.

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
| `donationId` | string | Yes | Donation UUID |
| `action` | string | Yes | `approve` or `reject` |
| `notes` | string | No | Review notes |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Donation updated successfully",
  "data": {
    "id": "uuid",
    "payment_status": "confirmed",
    "review_status": "verified"
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid action",
  "errors": [
    {
      "field": "action",
      "message": "Must be 'approve' or 'reject'"
    }
  ]
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Donation not found"
}
```

---

## Export Donations

### Endpoint

```
GET /api/admin/donations/export
```

### Description

Exports donations to CSV format for download.

### Authentication

Required: Yes

### Permissions

Admin, Finance Viewer

### Request Headers

```http
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status |
| `startDate` | string | No | ISO date string |
| `endDate` | string | No | ISO date string |

### Success Response

**200 OK**

Content-Type: `text/csv`

```csv
id,donor_name,donor_email,amount,currency,status,created_at
uuid,John Doe,john@example.com,1000,NPR,completed,2026-08-05T10:30:00Z
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Notes

- All admin endpoints require valid Supabase session
- Finance Viewer role can only access GET endpoints
- Export endpoint has rate limiting: 5 requests per minute
- Pagination is 0-indexed (first page is `page=0`)
