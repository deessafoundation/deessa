-- =============================================
-- Programs CMS — Storage Bucket (Migration 061)
-- =============================================
-- Creates the program-assets storage bucket and admin-only access policies.
-- Depends on: 060-programs-cms-foundation.sql
-- =============================================

-- Create private storage bucket for program assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'program-assets',
  'program-assets',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) on conflict (id) do nothing;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Admins can upload to program-assets
drop policy if exists "program_assets_admin_insert" on storage.objects;
create policy "program_assets_admin_insert"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'program-assets'
    and public.is_active_program_admin('programs')
  );

-- Admins can read their own uploads (for admin preview)
drop policy if exists "program_assets_admin_read" on storage.objects;
create policy "program_assets_admin_read"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'program-assets'
    and public.is_active_program_admin('programs')
  );

-- Public can read published program assets via the API route
-- (Signed URLs or proxy — not direct storage access)
-- No anon SELECT policy on storage.objects for this bucket.

-- Admins can delete their own uploads
drop policy if exists "program_assets_admin_delete" on storage.objects;
create policy "program_assets_admin_delete"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'program-assets'
    and public.is_active_program_admin('programs')
  );

-- =============================================
-- COMPLETE
-- =============================================
