-- Payment security baseline (read-only)
--
-- Run in the Supabase SQL Editor against the intended environment. Every
-- statement below reads PostgreSQL or Storage metadata only: it does not
-- insert, update, delete, grant, revoke, or expose donor records/secrets.
--
-- Save the result with the companion baseline report. Do not export query
-- results containing policy expressions or role names outside the project.

WITH target_tables(table_name) AS (
  VALUES
    ('donations'),
    ('payments'),
    ('payment_events'),
    ('payment_jobs'),
    ('payment_logs'),
    ('receipts'),
    ('receipt_sequences'),
    ('receipt_audit_log'),
    ('receipt_failures'),
    ('email_failures'),
    ('rate_limits'),
    ('event_registrations'),
    ('conference_registrations'),
    ('admin_users'),
    ('site_settings')
)
SELECT
  target_tables.table_name,
  to_regclass(format('public.%I', target_tables.table_name)) AS relation,
  COALESCE(classes.relrowsecurity, false) AS rls_enabled,
  COALESCE(classes.relforcerowsecurity, false) AS rls_forced,
  COALESCE(stats.n_live_tup, 0) AS estimated_live_rows
FROM target_tables
LEFT JOIN pg_class AS classes
  ON classes.oid = to_regclass(format('public.%I', target_tables.table_name))
LEFT JOIN pg_stat_user_tables AS stats
  ON stats.relid = classes.oid
ORDER BY target_tables.table_name;

-- Existing row-level-security policies for payment and shared registration data.
SELECT
  policy.schemaname,
  policy.tablename,
  policy.policyname,
  policy.cmd,
  policy.roles,
  policy.qual AS using_expression,
  policy.with_check
FROM pg_policies AS policy
WHERE policy.schemaname IN ('public', 'storage')
  AND policy.tablename IN (
    'donations', 'payments', 'payment_events', 'payment_jobs', 'payment_logs',
    'receipts', 'receipt_sequences', 'receipt_audit_log', 'receipt_failures',
    'email_failures', 'rate_limits', 'event_registrations',
    'conference_registrations', 'objects'
  )
ORDER BY policy.schemaname, policy.tablename, policy.policyname;

-- Direct table privileges. These are metadata only; a service-role client can
-- bypass RLS, so application server entry points still need authorization.
SELECT
  table_grants.table_name,
  table_grants.grantee,
  table_grants.privilege_type
FROM information_schema.role_table_grants AS table_grants
WHERE table_grants.table_schema = 'public'
  AND table_grants.table_name IN (
    'donations', 'payments', 'payment_events', 'payment_jobs', 'payment_logs',
    'receipts', 'receipt_sequences', 'receipt_audit_log', 'receipt_failures',
    'email_failures', 'rate_limits', 'event_registrations',
    'conference_registrations', 'admin_users', 'site_settings'
  )
ORDER BY table_grants.table_name, table_grants.grantee, table_grants.privilege_type;

-- Columns and nullability/defaults reveal schema drift without reading rows.
SELECT
  columns.table_name,
  columns.ordinal_position,
  columns.column_name,
  columns.data_type,
  columns.is_nullable,
  columns.column_default
FROM information_schema.columns AS columns
WHERE columns.table_schema = 'public'
  AND columns.table_name IN (
    'donations', 'payments', 'payment_events', 'payment_jobs', 'receipts',
    'receipt_sequences', 'rate_limits', 'event_registrations',
    'conference_registrations'
  )
ORDER BY columns.table_name, columns.ordinal_position;

-- Primary keys, foreign keys, unique constraints, and CHECK constraints.
SELECT
  table_class.relname AS table_name,
  constraint_row.conname AS constraint_name,
  constraint_row.contype AS constraint_type,
  pg_get_constraintdef(constraint_row.oid, true) AS definition
FROM pg_constraint AS constraint_row
JOIN pg_class AS table_class ON table_class.oid = constraint_row.conrelid
JOIN pg_namespace AS table_schema ON table_schema.oid = table_class.relnamespace
WHERE table_schema.nspname = 'public'
  AND table_class.relname IN (
    'donations', 'payments', 'payment_events', 'payment_jobs', 'receipts',
    'receipt_sequences', 'rate_limits', 'event_registrations',
    'conference_registrations'
  )
ORDER BY table_class.relname, constraint_row.conname;

-- Function security metadata. Inspect SECURITY DEFINER functions especially.
SELECT
  namespace.nspname AS schema_name,
  procedure.proname AS function_name,
  pg_get_function_identity_arguments(procedure.oid) AS arguments,
  procedure.prosecdef AS security_definer,
  procedure.proconfig AS local_configuration,
  procedure.proacl AS access_control_list
FROM pg_proc AS procedure
JOIN pg_namespace AS namespace ON namespace.oid = procedure.pronamespace
WHERE namespace.nspname = 'public'
  AND procedure.proname IN (
    'increment_rate_limit', 'get_next_receipt_number',
    'confirm_payment', 'process_payment_event'
  )
ORDER BY procedure.proname;

-- Storage bucket configuration and policies. No file/object names are read.
SELECT
  bucket.id,
  bucket.public,
  bucket.file_size_limit,
  bucket.allowed_mime_types
FROM storage.buckets AS bucket
WHERE bucket.id IN ('bank-transfer-proofs', 'receipts')
ORDER BY bucket.id;

SELECT
  policy.policyname,
  policy.cmd,
  policy.roles,
  policy.qual AS using_expression,
  policy.with_check
FROM pg_policies AS policy
WHERE policy.schemaname = 'storage'
  AND policy.tablename = 'objects'
ORDER BY policy.policyname;

-- The migration history identifies what the database says it has received.
-- Supabase installations use this internal schema; this reads identifiers only.
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version;
