---
title: "Manual Storage Bucket Setup Guide"
description: "If you encounter ERROR: 42501: must be owner of table buckets when running the SQL script, follow this manual setup g..."
owner: "deessa Team"
status: active
category: setup
audience: admin
last_updated: 2026-09-12
---
# Manual Storage Bucket Setup Guide

## If SQL Script Fails with Permission Error

If you encounter `ERROR: 42501: must be owner of table buckets` when running the SQL script, follow this manual setup guide.

---

## Option 1: Create via Supabase Dashboard (Recommended)

### Step 1: Navigate to Storage
1. Open your Supabase project dashboard
2. Click **Storage** in the left sidebar
3. Click **New bucket** button

### Step 2: Configure Bucket
Fill in the following settings:

- **Name**: `testimonials`
- **Public bucket**: ✅ **Checked** (Yes)
- **File size limit**: `2097152` (2MB in bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### Step 3: Create Bucket
Click **Create bucket** button

### Step 4: Set Up Policies
After creating the bucket, go to **SQL Editor** and run:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete testimonial images" ON storage.objects;

-- Public read access to testimonial images
CREATE POLICY "Public can view testimonial images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'testimonials');

-- Admins can upload testimonial images
CREATE POLICY "Admins can upload testimonial images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Admins can update testimonial images
CREATE POLICY "Admins can update testimonial images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Admins can delete testimonial images
CREATE POLICY "Admins can delete testimonial images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);
```

---

## Option 2: Run SQL as Postgres User

### Step 1: Check Current User
In Supabase SQL Editor, run:
```sql
SELECT current_user;
```

### Step 2: Switch to Postgres User (if needed)
The SQL Editor should run as `postgres` by default. If not, you may need to:
1. Use the Supabase CLI with service role key
2. Or create the bucket via Dashboard (Option 1)

### Step 3: Run Full Script
Copy and paste the entire content of `scripts/db/migrations/039b-testimonials-storage-bucket.sql`

---

## Option 3: Use Supabase CLI

### Prerequisites
- Supabase CLI installed
- Project linked to CLI

### Commands
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## Verification

After setup (any method), verify the bucket exists:

### Via Dashboard
1. Go to **Storage**
2. You should see **testimonials** bucket listed
3. Click on it to verify settings

### Via SQL
```sql
-- Check bucket exists
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'testimonials';

-- Check policies exist
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%testimonial%';
```

Expected results:
- 1 bucket row with name 'testimonials'
- 4 policy rows (SELECT, INSERT, UPDATE, DELETE)

---

## Troubleshooting

### Error: "must be owner of table buckets"
**Cause**: Insufficient permissions  
**Solution**: Use Option 1 (Dashboard) or contact Supabase support

### Error: "bucket already exists"
**Cause**: Bucket was created previously  
**Solution**: Skip bucket creation, just run the policies

### Error: "policy already exists"
**Cause**: Policies were created previously  
**Solution**: Drop policies first (see Step 4 in Option 1)

### Bucket created but upload fails
**Cause**: Missing or incorrect policies  
**Solution**: Re-run the policies SQL from Step 4

### Images not displaying
**Cause**: Bucket not public  
**Solution**: 
1. Go to Storage > testimonials
2. Click settings (gear icon)
3. Enable "Public bucket"
4. Save changes

---

## Testing Upload

After setup, test the upload:

1. Login to admin panel
2. Go to Homepage Manager > Testimonials
3. Click "Upload" tab
4. Select a test image (JPG, under 2MB)
5. Should upload successfully
6. Preview should appear
7. Save changes
8. Check frontend displays image

---

## Common Questions

**Q: Why can't I create bucket via SQL?**  
A: Storage buckets require special permissions. Dashboard method is more reliable.

**Q: Can I change bucket settings later?**  
A: Yes, via Dashboard > Storage > Bucket Settings

**Q: What if I already have a testimonials bucket?**  
A: Just run the policies SQL, skip bucket creation

**Q: Do I need to restart anything?**  
A: No, changes take effect immediately

---

## Support

If you continue to have issues:
1. Check Supabase project logs
2. Verify you're on a paid plan (if required)
3. Contact Supabase support
4. Check project permissions

---

**Last Updated**: June 1, 2026  
**Related**: `scripts/db/migrations/039b-testimonials-storage-bucket.sql`
