-- ============================================================
-- FIX: Sensitive Columns Exposed via API
-- Issue: Supabase Database Linter #0023
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   Table `public.payments` is exposed via API without RLS and
--   contains `session_id` (Stripe Checkout Session ID), which
--   is sensitive payment infrastructure data.
--
-- FIX:
--   RLS on `payments` table is already enabled by 002-enable-rls-tables.sql
--   This script adds defense-in-depth: a public-safe view that
--   excludes sensitive columns, and restricts direct table access.
-- ============================================================


-- Step 1: Verify RLS is enabled (from 002)
-- If this fails, run 002-enable-rls-tables.sql first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'payments'
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS not enabled on payments table — run 002-enable-rls-tables.sql first';
  END IF;
END $$;


-- Step 2: Create a public-safe view (excludes sensitive columns)
-- This view strips session_id, raw_payload, subscription_id,
-- customer_id, invoice_id — all Stripe internals.
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


-- Step 3: Revoke direct table access from anon/authenticated
-- Only service_role can read the full payments table
REVOKE SELECT ON public.payments FROM anon, authenticated;


-- Step 4: Grant read access to the safe view
GRANT SELECT ON public.payments_public TO anon, authenticated;
