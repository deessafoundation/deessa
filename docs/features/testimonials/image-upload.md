---
title: "Testimonials Image Upload Feature"
description: "The testimonials manager now supports dual input methods for profile images: URL input and direct file upload with pr..."
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Testimonials Image Upload Feature

## Overview
The testimonials manager now supports dual input methods for profile images: URL input and direct file upload with professional validation and error handling.

## Features

### 1. Dual Input Method
- **URL Tab**: Enter direct image URLs (existing functionality)
- **Upload Tab**: Upload images directly from local device (new)

### 2. File Validation
- **Allowed formats**: JPG, PNG, WebP
- **Maximum size**: 2MB
- **Automatic validation** with user-friendly error messages

### 3. User Experience
- **Tabbed interface** for easy switching between URL and Upload
- **Real-time preview** of uploaded images
- **Loading states** during upload
- **Clear error messages** via notification system
- **Remove button** to clear uploaded images

## Technical Implementation

### API Endpoint
**File**: `app/api/upload/route.ts`

```typescript
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- folder: string (default: 'media', use 'testimonials' for testimonials)

Response:
{
  success: true,
  url: string,        // Public URL of uploaded image
  path: string,       // Storage path
  bucket: string      // Bucket name
}
```

**Features**:
- Admin authentication required
- File type validation (JPG, PNG, WebP only)
- File size validation (max 2MB)
- Unique filename generation with timestamp
- Automatic bucket selection based on folder
- Service role client for bypassing RLS

### Storage Bucket
**Migration**: `scripts/039-testimonials-storage-bucket.sql`

**Configuration**:
- Bucket name: `testimonials`
- Public access: Yes (for displaying images)
- Size limit: 2MB
- Allowed types: JPG, PNG, WebP

**Policies**:
- Public read access
- Authenticated users can upload/update/delete

### Component Integration
**File**: `components/admin/homepage-manager/components/TestimonialsManager.tsx`

**Key Functions**:

```typescript
handleImageUpload(index: number, file: File)
```
- Validates file type and size
- Shows loading state
- Uploads to `/api/upload` endpoint
- Updates testimonial with returned URL
- Shows success/error notifications

**UI Elements**:
- Tabs component for URL vs Upload
- File input with accept attribute
- Preview with circular crop
- Remove button for clearing images
- Upload progress indicator

## Usage

### For Admins
1. Navigate to Homepage Manager â†’ Testimonials section
2. Click on a testimonial card to edit
3. In the "Profile Image" section:
   - **Option A**: Click "URL" tab and paste an image URL
   - **Option B**: Click "Upload" tab and select a file from your device
4. Wait for upload to complete (you'll see "Uploading..." message)
5. Preview appears below once uploaded
6. Click "Save Changes" to persist

### File Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Maximum 2MB
- **Recommendation**: Square images work best for circular display
- **Resolution**: 400x400px or higher recommended

## Error Handling

### Client-Side Validation
- File type check before upload
- File size check before upload
- Immediate feedback via notifications

### Server-Side Validation
- Re-validates file type and size
- Authentication check
- Storage error handling
- Graceful error responses

### Error Messages
- "Invalid file type" â†’ Upload JPG, PNG, or WebP
- "File too large" â†’ Reduce file size below 2MB
- "Upload failed" â†’ Try again or contact support
- "Unauthorized" â†’ Admin session expired, re-login

## File Naming Convention

Uploaded files follow this pattern:
```
{sanitized-name}_{timestamp}_{random-id}.{extension}
```

Example:
```
john-doe_2026-06-01_14-30-45_a3f9b2c1.jpg
```

**Benefits**:
- Unique filenames prevent collisions
- Timestamp for chronological sorting
- Sanitized names for URL safety
- Random ID for additional uniqueness

## Security

### Authentication
- Only authenticated admins can upload
- Uses `getCurrentAdmin()` for verification
- Service role client for storage operations

### File Validation
- Strict MIME type checking
- File size limits enforced
- No executable files allowed
- Sanitized filenames

### Storage Policies
- Public read (for displaying images)
- Authenticated write (admins only)
- Bucket-level restrictions

## Integration with CMS

### Data Flow
1. Admin uploads image via TestimonialsManager
2. File sent to `/api/upload` endpoint
3. Stored in Supabase `testimonials` bucket
4. Public URL returned
5. URL saved in `homepage_testimonials` settings
6. Frontend fetches settings and displays images

### Database Storage
Images are stored as URLs in the `site_settings` table:

```json
{
  "key": "homepage_testimonials",
  "value": {
    "testimonials": [
      {
        "id": "testimonial-1",
        "name": "John Doe",
        "image": "https://[project].supabase.co/storage/v1/object/public/testimonials/testimonials/john-doe_2026-06-01_14-30-45_a3f9b2c1.jpg",
        ...
      }
    ]
  }
}
```

## Frontend Display

The circular testimonials carousel automatically displays uploaded images:

**File**: `components/circular-testimonials.tsx`

- Images displayed in 3D rotating carousel
- Circular crop applied via CSS
- Fallback for broken images
- Smooth transitions and animations

## Troubleshooting

### Upload Not Working
1. Check admin authentication (re-login if needed)
2. Verify file meets requirements (type, size)
3. Check browser console for errors
4. Verify Supabase storage bucket exists

### Images Not Displaying
1. Check if URL is valid (copy-paste in browser)
2. Verify bucket is public
3. Check storage policies
4. Clear browser cache

### Permission Errors
1. Verify admin role in database
2. Check storage policies are applied
3. Ensure service role key is configured
4. Review RLS policies

## Future Enhancements

### Potential Improvements
- [ ] Image cropping tool before upload
- [ ] Automatic image optimization/compression
- [ ] Drag-and-drop upload interface
- [ ] Bulk upload for multiple testimonials
- [ ] Image library/gallery for reusing images
- [ ] CDN integration for faster loading
- [ ] WebP conversion for better compression

## Related Files

### Core Implementation
- `app/api/upload/route.ts` - Upload API endpoint
- `components/admin/homepage-manager/components/TestimonialsManager.tsx` - Admin UI
- `scripts/039-testimonials-storage-bucket.sql` - Storage setup

### Supporting Files
- `lib/types/homepage-settings.ts` - TypeScript types
- `lib/supabase/service.ts` - Service role client
- `lib/actions/admin-auth.ts` - Admin authentication
- `lib/notifications.ts` - Toast notifications

### Frontend Display
- `components/circular-testimonials.tsx` - Testimonials carousel
- `components/homepage-sections.tsx` - Homepage integration

## Testing Checklist

- [ ] Upload JPG image successfully
- [ ] Upload PNG image successfully
- [ ] Upload WebP image successfully
- [ ] Reject invalid file types (PDF, GIF, etc.)
- [ ] Reject files over 2MB
- [ ] Show loading state during upload
- [ ] Display success notification
- [ ] Display error notification on failure
- [ ] Preview uploaded image correctly
- [ ] Remove uploaded image works
- [ ] Switch between URL and Upload tabs
- [ ] Save changes persists uploaded image
- [ ] Frontend displays uploaded image
- [ ] Non-admin users cannot upload
- [ ] Expired session shows auth error

## Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Check Supabase storage dashboard
4. Contact development team
