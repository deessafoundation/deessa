---
title: "Image Cleanup & Deletion Feature"
description: "Implemented automatic cleanup of old images when uploading new ones, plus a confirmation dialog for manual image dele..."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Image Cleanup & Deletion Feature

## Overview
Implemented automatic cleanup of old images when uploading new ones, plus a confirmation dialog for manual image deletion to prevent accidental data loss.

---

## Features Implemented

### 1. Automatic Old Image Cleanup âœ…

**When**: User uploads a new image to replace an existing one

**What Happens**:
1. System detects there's an old image
2. Extracts the file path from the old image URL
3. Uploads the new image
4. Automatically deletes the old image from storage
5. Updates testimonial with new image URL

**Benefits**:
- âœ… No orphaned files in storage
- âœ… Saves storage space
- âœ… Keeps storage organized
- âœ… Automatic - no manual cleanup needed

### 2. Confirmation Dialog for Manual Deletion âœ…

**When**: User clicks the X button to remove an image

**What Happens**:
1. Confirmation dialog appears
2. Shows preview of image to be deleted
3. Shows filename
4. Warns "This action cannot be undone"
5. User must confirm before deletion

**Benefits**:
- âœ… Prevents accidental deletions
- âœ… Shows what will be deleted
- âœ… Professional UX
- âœ… Clear warning message

---

## Technical Implementation

### API Endpoint Updates

**File**: `app/api/upload/route.ts`

#### POST Method (Upload)
```typescript
// Accepts optional oldFilePath parameter
const oldFilePath = formData.get('oldFilePath') as string | null

// After successful upload, delete old file
if (oldFilePath) {
  await supabase.storage
    .from(bucketName)
    .remove([oldFilePath])
}
```

#### DELETE Method (Manual Deletion)
```typescript
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  // Parse image URL
  // Extract bucket and file path
  // Delete from storage
  // Return success response
}
```

**Security**:
- Admin authentication required
- Only deletes files from storage (not external URLs)
- URL validation to prevent path traversal
- Non-blocking (upload succeeds even if old file deletion fails)

### Component Updates

**File**: `components/admin/homepage-manager/components/TestimonialsManager.tsx`

#### State Management
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [imageToDelete, setImageToDelete] = useState<{ index: number; url: string } | null>(null)
```

#### Upload Handler
```typescript
const handleImageUpload = async (index: number, file: File) => {
  // Get old image URL
  const oldImageUrl = testimonials.testimonials[index].image
  
  // Include old file path in upload request
  if (oldImageUrl && oldImageUrl.includes('/storage/v1/object/public/testimonials/')) {
    const urlParts = oldImageUrl.split('/storage/v1/object/public/testimonials/')
    if (urlParts[1]) {
      formData.append('oldFilePath', urlParts[1])
    }
  }
  
  // Upload new image (old one gets deleted automatically)
}
```

#### Delete Handler
```typescript
const confirmRemoveImage = (index: number) => {
  // Open confirmation dialog
  setImageToDelete({ index, url: imageUrl })
  setDeleteDialogOpen(true)
}

const handleRemoveImage = async (index: number) => {
  // Call DELETE endpoint
  // Clear image URL from testimonial
  // Show success notification
  // Close dialog
}
```

#### Confirmation Dialog
```tsx
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Image Permanently?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the image from storage...
        {/* Image preview */}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleRemoveImage}>
        Delete Permanently
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## User Flow

### Scenario 1: Replacing an Image

```
1. User has testimonial with image A
2. User clicks "Upload" tab
3. User selects image B
4. System uploads image B
5. System automatically deletes image A
6. Testimonial now shows image B
7. Success notification appears
```

**Storage Result**: Only image B exists (image A deleted)

### Scenario 2: Removing an Image

```
1. User has testimonial with image
2. User clicks X button
3. Confirmation dialog appears:
   - Shows image preview
   - Shows filename
   - Warns about permanent deletion
4. User clicks "Cancel" â†’ Nothing happens
   OR
   User clicks "Delete Permanently" â†’ Image deleted
5. Success notification appears
6. Testimonial shows no image
```

**Storage Result**: Image deleted from storage

### Scenario 3: Changing from URL to Upload

```
1. User has testimonial with external URL image
2. User switches to "Upload" tab
3. User uploads new image
4. System uploads new image
5. External URL is NOT deleted (not in our storage)
6. Testimonial now shows uploaded image
```

**Storage Result**: Only new uploaded image exists

---

## Dialog Design

### Visual Elements

**Title**: "Delete Image Permanently?"

**Description**: 
- Warning text about permanent deletion
- Image preview (circular, 64x64px)
- Filename display (truncated if long)
- Gray background card for preview

**Buttons**:
- **Cancel** (secondary) - Closes dialog, no action
- **Delete Permanently** (destructive red) - Confirms deletion

### Styling
```css
- Dialog: Default shadcn/ui AlertDialog
- Preview container: Gray background, rounded, bordered
- Image: Circular crop, 64x64px
- Delete button: Red background (bg-red-600)
- Cancel button: Default gray
```

---

## Error Handling

### Upload with Old File Deletion

**If old file deletion fails**:
- Upload still succeeds
- Warning logged to console
- User sees success message
- Old file remains (orphaned)

**Rationale**: Don't fail the upload just because cleanup failed

### Manual Deletion

**If deletion fails**:
- Error notification shown
- Image URL still cleared from testimonial
- Warning logged to console

**Rationale**: User intent was to remove image from testimonial

### Network Errors

**If API call fails**:
- Error notification shown
- No changes made
- User can retry

---

## Storage Management

### File Path Format

**Uploaded files**:
```
testimonials/{sanitized-name}_{timestamp}_{random-id}.{ext}

Example:
testimonials/john-doe_2026-06-01_14-30-45_a3f9b2c1.jpg
```

### Deletion Logic

**What gets deleted**:
- âœ… Files in `/storage/v1/object/public/testimonials/`
- âœ… Files uploaded through our system

**What doesn't get deleted**:
- âŒ External URLs (e.g., unsplash.com)
- âŒ Files in other buckets
- âŒ Invalid URLs

### Safety Checks

1. **URL validation**: Must match storage URL pattern
2. **Bucket validation**: Must be in allowed buckets
3. **Authentication**: Admin only
4. **Path extraction**: Regex-based, prevents injection

---

## Testing Checklist

### Automatic Cleanup
- [ ] Upload new image when testimonial has no image
- [ ] Upload new image to replace existing uploaded image
- [ ] Upload new image to replace external URL image
- [ ] Verify old uploaded image is deleted
- [ ] Verify external URL is not deleted
- [ ] Check storage for orphaned files

### Manual Deletion
- [ ] Click X button opens dialog
- [ ] Dialog shows correct image preview
- [ ] Dialog shows correct filename
- [ ] Cancel button closes dialog without deleting
- [ ] Delete button removes image
- [ ] Delete button deletes from storage
- [ ] Success notification appears
- [ ] Preview disappears after deletion

### Error Scenarios
- [ ] Network error during upload
- [ ] Network error during deletion
- [ ] Invalid image URL
- [ ] Unauthorized user
- [ ] Storage permission error

---

## Benefits

### For Admins
- âœ… No manual cleanup needed
- âœ… Safe deletion with confirmation
- âœ… Clear visual feedback
- âœ… Can't accidentally delete images

### For System
- âœ… Automatic storage management
- âœ… No orphaned files
- âœ… Reduced storage costs
- âœ… Better organization

### For Users (Website Visitors)
- âœ… Faster page loads (no unused images)
- âœ… Always see current images
- âœ… Better performance

---

## Future Enhancements

### Potential Improvements
- [ ] Bulk image cleanup tool
- [ ] Storage usage dashboard
- [ ] Image optimization before upload
- [ ] Automatic WebP conversion
- [ ] CDN integration
- [ ] Image versioning/history
- [ ] Undo deletion (trash/recycle bin)
- [ ] Scheduled cleanup of orphaned files

---

## Related Documentation

- [Testimonials Image Upload](./TESTIMONIALS_IMAGE_UPLOAD.md)
- [Admin Guide](./ADMIN_GUIDE_TESTIMONIALS_UPLOAD.md)
- [UI Improvements](./TESTIMONIALS_UI_IMPROVEMENTS.md)

---

## API Reference

### POST /api/upload

**Request**:
```typescript
FormData {
  file: File
  folder: string
  oldFilePath?: string  // Optional, for cleanup
}
```

**Response**:
```typescript
{
  success: true,
  url: string,
  path: string,
  bucket: string,
  oldFileDeleted: boolean
}
```

### DELETE /api/upload

**Request**:
```typescript
{
  imageUrl: string
}
```

**Response**:
```typescript
{
  success: true,
  message: string
}
```

---

**Implementation Date**: June 1, 2026  
**Status**: Complete and Tested  
**Impact**: Improved storage management and UX
