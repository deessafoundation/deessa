-- Requires 002-admin-schema.sql and 003-storage-setup.sql.
-- Add restrictive write checks: existing permissive policies cannot bypass them.
-- Public SELECT policies and stored objects remain unchanged.
BEGIN;

ALTER FUNCTION public.get_admin_role() SET search_path = public, pg_temp;

DROP POLICY IF EXISTS "About media insert role guard" ON storage.objects;
CREATE POLICY "About media insert role guard"
ON storage.objects AS RESTRICTIVE FOR INSERT TO PUBLIC
WITH CHECK (
  bucket_id NOT IN ('partner-logos', 'team-photos', 'videos')
  OR (
    public.get_admin_role() IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "About media update role guard" ON storage.objects;
CREATE POLICY "About media update role guard"
ON storage.objects AS RESTRICTIVE FOR UPDATE TO PUBLIC
USING (
  bucket_id NOT IN ('partner-logos', 'team-photos', 'videos')
  OR (
    public.get_admin_role() IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
)
WITH CHECK (
  bucket_id NOT IN ('partner-logos', 'team-photos', 'videos')
  OR (
    public.get_admin_role() IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "About media delete role guard" ON storage.objects;
CREATE POLICY "About media delete role guard"
ON storage.objects AS RESTRICTIVE FOR DELETE TO PUBLIC
USING (
  bucket_id NOT IN ('partner-logos', 'team-photos', 'videos')
  OR (
    public.get_admin_role() IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
);

COMMIT;
