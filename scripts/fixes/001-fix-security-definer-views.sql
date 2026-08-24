-- ============================================================
-- FIX: Remove SECURITY DEFINER from Views
-- Issue: Supabase Database Linter #0010
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   5 views have SECURITY DEFINER, which bypasses RLS and
--   runs with the creator's (superuser) permissions.
--
-- FIX:
--   CREATE OR REPLACE does NOT strip SECURITY DEFINER.
--   We must DROP and recreate, or use ALTER VIEW to set
--   security_invoker = true (PostgreSQL 15+).
-- ============================================================


-- 1. donation_stats_by_currency
DROP VIEW IF EXISTS public.donation_stats_by_currency;

CREATE VIEW public.donation_stats_by_currency
  WITH (security_invoker = true)
AS
SELECT
  currency,
  COUNT(*) AS total_donations,
  SUM(amount) AS total_amount,
  COUNT(CASE WHEN is_monthly THEN 1 END) AS monthly_donations,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) AS completed_donations,
  SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) AS completed_amount
FROM donations
GROUP BY currency;

GRANT SELECT ON public.donation_stats_by_currency TO authenticated;


-- 2. recent_payment_errors
DROP VIEW IF EXISTS public.recent_payment_errors;

CREATE VIEW public.recent_payment_errors
  WITH (security_invoker = true)
AS
SELECT
  id,
  level,
  event_type,
  message,
  donation_id,
  provider,
  transaction_id,
  error_message,
  error_code,
  created_at
FROM payment_logs
WHERE
  level IN ('error', 'critical')
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;


-- 3. payment_mismatches
DROP VIEW IF EXISTS public.payment_mismatches;

CREATE VIEW public.payment_mismatches
  WITH (security_invoker = true)
AS
SELECT
  id,
  event_type,
  donation_id,
  provider,
  transaction_id,
  expected_amount,
  actual_amount,
  expected_currency,
  actual_currency,
  metadata,
  created_at
FROM payment_logs
WHERE
  event_type IN ('amount_mismatch', 'currency_mismatch')
ORDER BY created_at DESC;


-- 4. event_registrations_with_event
DROP VIEW IF EXISTS public.event_registrations_with_event;

CREATE VIEW public.event_registrations_with_event
  WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.event_id,
  r.full_name,
  r.email,
  r.phone,
  r.organization,
  r.custom_fields,
  r.form_schema_version,
  r.status,
  r.admin_notes,
  r.confirmed_at,
  r.cancelled_at,
  r.confirmed_by,
  r.cancelled_by,
  r.payment_status,
  r.payment_amount,
  r.payment_currency,
  r.payment_provider,
  r.payment_id,
  r.provider_session_ref,
  r.stripe_session_id,
  r.khalti_pidx,
  r.esewa_transaction_uuid,
  r.payment_initiated_at,
  r.payment_paid_at,
  r.payment_failed_at,
  r.payment_review_at,
  r.payment_override_by,
  r.consent_terms,
  r.consent_marketing,
  r.expires_at,
  r.checked_in_at,
  r.checked_in_by,
  r.registration_source,
  r.ticket_type_id,
  r.last_registration_email_sent_at,
  r.last_confirmation_email_sent_at,
  r.last_cancellation_email_sent_at,
  r.last_custom_email_sent_at,
  r.created_at,
  r.updated_at,
  e.title AS event_title,
  e.slug AS event_slug,
  e.event_date,
  e.event_time,
  e.location,
  e.is_free,
  e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;


-- 5. payments_public (created in 003, also inherited SECURITY DEFINER)
DROP VIEW IF EXISTS public.payments_public;

CREATE VIEW public.payments_public
  WITH (security_invoker = true)
AS
SELECT
  id,
  donation_id,
  provider,
  transaction_id,
  amount,
  currency,
  verified_amount,
  verified_currency,
  status,
  verified_at,
  payment_intent_id,
  created_at
FROM public.payments;
