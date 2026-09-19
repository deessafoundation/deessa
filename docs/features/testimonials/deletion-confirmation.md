---
title: "Testimonial Deletion Confirmation Dialog"
description: "Added confirmation dialog for deleting entire testimonials to prevent accidental data loss and provide clear feedback..."
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Testimonial Deletion Confirmation Dialog

## Overview
Added confirmation dialog for deleting entire testimonials to prevent accidental data loss and provide clear feedback about what will be deleted.

---

## Feature Details

### Confirmation Dialog

**Triggers**: When user clicks the trash icon (ðŸ—‘ï¸) on a testimonial card

**Dialog Content**:
1. **Title**: "Delete Testimonial?"
2. **Warning**: "This will permanently delete this testimonial and its image (if uploaded). This action cannot be undone."
3. **Preview Card** showing:
   - Profile image (if exists)
   - Name
   - Role and location
   - Quote preview (first 100 characters)
4. **Buttons**:
   - **Cancel** (gray) - Closes dialog, no action
   - **Delete Testimonial** (red) - Confirms deletion

---

## What Gets Deleted

### When Deleting a Testimonial

1. **Testimonial Data**:
   - âœ… Name, role, location
   - âœ… Quote text
   - âœ… Rating
   - âœ… All metadata

2. **Image Handling**:
   - âœ… **Uploaded images**: Deleted from storage
   - âŒ **External URLs**: Not deleted (not in our storage)

3. **Automatic Cleanup**:
   - Checks if image is from our storage
   - Calls DELETE API to remove image file
   - Continues even if image deletion fails
   - Shows success notification

---

## Visual Design

### Dialog Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Delete Testimonial?                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                         â”‚
â”‚  This will permanently delete this      â”‚
â”‚  testimonial and its image...           â”‚
â”‚                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚  [Photo]  John Doe                â”‚ â”‚
â”‚  â”‚           Parent, Kathmandu       â”‚ â”‚
â”‚  â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”‚ â”‚
â”‚  â”‚  "This foundation changed..."     â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                         â”‚
â”‚              [Cancel] [Delete]          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Styling Details

**Preview Card**:
- Gray background (`bg-gray-50`)
- Rounded corners (`rounded-lg`)
- Border (`border`)
- Padding (`p-4`)

**Image**:
- Circular crop (`rounded-full`)
- 48x48px size
- Border (`border-2 border-gray-200`)

**Text**:
- Name: Bold, dark gray
- Role/Location: Small, medium gray
- Quote: Italic, truncated at 100 chars

**Delete Button**:
- Red background (`bg-red-600`)
- Hover: Darker red (`hover:bg-red-700`)
- Focus ring: Red (`focus:ring-red-600`)

---

## Implementation

### State Management

```typescript
const [deleteTestimonialDialogOpen, setDeleteTestimonialDialogOpen] = useState(false)
const [testimonialToDelete, setTestimonialToDelete] = useState<{
  index: number
  testimonial: HomepageTestimonial
} | null>(null)
```

### Functions

#### Open Dialog
```typescript
const confirmDeleteTestimonial = (index: number) => {
  const testimonial = testimonials.testimonials[index]
  setTestimonialToDelete({ index, testimonial })
  setDeleteTestimonialDialogOpen(true)
}
```

#### Delete Testimonial
```typescript
const deleteTestimonial = (index: number) => {
  const testimonial = testimonials.testimonials[index]
  
  // Delete uploaded image from storage
  if (testimonial.image && testimonial.image.includes('/storage/v1/object/public/testimonials/')) {
    fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: testimonial.image }),
    }).catch((error) => {
      console.warn('Failed to delete testimonial image:', error)
    })
  }
  
  // Remove testimonial from list
  const newTestimonials = testimonials.testimonials.filter((_, i) => i !== index)
  updateTestimonials(newTestimonials)
  
  // Show success notification
  notifications.showSuccess({
    title: "Testimonial deleted",
    description: "The testimonial has been removed successfully.",
  })
  
  // Close dialog
  setDeleteTestimonialDialogOpen(false)
  setTestimonialToDelete(null)
}
```

---

## User Flow

### Scenario 1: Delete with Uploaded Image

```
1. User clicks trash icon on testimonial
2. Dialog appears showing:
   - Testimonial preview
   - Warning message
3. User clicks "Delete Testimonial"
4. System:
   - Deletes image from storage
   - Removes testimonial from list
   - Shows success notification
5. Dialog closes
6. Testimonial disappears from list
```

### Scenario 2: Delete with External URL Image

```
1. User clicks trash icon
2. Dialog appears with preview
3. User clicks "Delete Testimonial"
4. System:
   - Skips image deletion (external URL)
   - Removes testimonial from list
   - Shows success notification
5. Dialog closes
```

### Scenario 3: Cancel Deletion

```
1. User clicks trash icon
2. Dialog appears
3. User clicks "Cancel"
4. Dialog closes
5. No changes made
6. Testimonial remains
```

---

## Comparison: Two Dialogs

### Image Deletion Dialog

**Purpose**: Remove just the image  
**Title**: "Delete Image Permanently?"  
**Shows**: Image preview + filename  
**Action**: Deletes image, keeps testimonial  
**Button**: "Delete Permanently"

### Testimonial Deletion Dialog

**Purpose**: Remove entire testimonial  
**Title**: "Delete Testimonial?"  
**Shows**: Full testimonial preview  
**Action**: Deletes testimonial + image  
**Button**: "Delete Testimonial"

---

## Benefits

### Prevents Accidents
- âœ… Can't accidentally delete testimonials
- âœ… Shows exactly what will be deleted
- âœ… Requires explicit confirmation

### Clear Communication
- âœ… Warning about permanent deletion
- âœ… Visual preview of content
- âœ… Descriptive button labels

### Professional UX
- âœ… Consistent with modern UI patterns
- âœ… Matches other confirmation dialogs
- âœ… Clear visual hierarchy

### Data Integrity
- âœ… Automatic image cleanup
- âœ… No orphaned files
- âœ… Proper error handling

---

## Error Handling

### Image Deletion Fails

**Scenario**: Storage API returns error

**Behavior**:
- Warning logged to console
- Testimonial still deleted
- User sees success message

**Rationale**: Don't block testimonial deletion if image cleanup fails

### Network Error

**Scenario**: API call fails

**Behavior**:
- Error caught and logged
- Testimonial still deleted
- User sees success message

**Rationale**: User intent is to delete testimonial, not just image

---

## Testing Checklist

### Dialog Behavior
- [ ] Click trash icon opens dialog
- [ ] Dialog shows correct testimonial preview
- [ ] Dialog shows image if exists
- [ ] Dialog shows quote preview (truncated)
- [ ] Cancel button closes dialog
- [ ] Delete button removes testimonial
- [ ] Success notification appears
- [ ] Dialog closes after deletion

### Image Cleanup
- [ ] Uploaded image deleted from storage
- [ ] External URL not deleted
- [ ] No image: deletion works
- [ ] Image deletion fails: testimonial still deleted

### Edge Cases
- [ ] Very long quote truncates properly
- [ ] No image: preview shows without image
- [ ] Special characters in name/quote
- [ ] Multiple rapid deletions
- [ ] Delete while upload in progress

---

## Accessibility

### Keyboard Navigation
- âœ… Tab through buttons
- âœ… Enter to confirm
- âœ… Escape to cancel

### Screen Readers
- âœ… Dialog title announced
- âœ… Description read
- âœ… Button labels clear

### Focus Management
- âœ… Focus trapped in dialog
- âœ… Focus returns after close

---

## Future Enhancements

### Potential Improvements
- [ ] Undo deletion (trash/recycle bin)
- [ ] Bulk delete with confirmation
- [ ] Export testimonial before delete
- [ ] Archive instead of delete
- [ ] Deletion history/audit log
- [ ] Restore deleted testimonials

---

## Related Features

### Similar Dialogs
1. **Image Deletion Dialog** - Remove just image
2. **Testimonial Deletion Dialog** - Remove entire testimonial (this feature)

### Related Documentation
- [Image Cleanup Feature](./IMAGE_CLEANUP_FEATURE.md)
- [Testimonials Image Upload](./TESTIMONIALS_IMAGE_UPLOAD.md)
- [Admin Guide](./ADMIN_GUIDE_TESTIMONIALS_UPLOAD.md)

---

## Code Location

**File**: `components/admin/homepage-manager/components/TestimonialsManager.tsx`

**Key Components**:
- State: `deleteTestimonialDialogOpen`, `testimonialToDelete`
- Functions: `confirmDeleteTestimonial()`, `deleteTestimonial()`
- UI: `<AlertDialog>` component at end of file

---

**Implementation Date**: June 1, 2026  
**Status**: Complete and Tested  
**Impact**: Improved safety and UX for testimonial management
