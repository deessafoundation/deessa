-- ============================================================================
-- Migration: 079 - Conference form schema policy roles, ticket counters, & storage
-- Description:
--   1. Restricts conference_form_schemas admin policies to `authenticated` role
--      to prevent 42501 errors when queried by anonymous sessions.
--   2. Marks increment_ticket_sold_count and decrement_ticket_sold_count as
--      SECURITY DEFINER with explicit search_path so ticket counts update
--      properly when anonymous users register for free events.
--   3. Restricts storage admin write policies on partner-logos and intro-videos
--      to `authenticated` role to prevent evaluating is_admin_user() for anon.
-- ============================================================================

BEGIN;

-- 1. Conference Form Schemas (Legacy module hardening)
ALTER POLICY "Admins can read all form schemas"
  ON public.conference_form_schemas TO authenticated;

ALTER POLICY "Admins can manage form schemas"
  ON public.conference_form_schemas TO authenticated;

GRANT SELECT ON public.conference_form_schemas TO anon, authenticated;

-- 2. Ticket Sold Count RPC Functions (make SECURITY DEFINER so anonymous free registrations can update sold_count)
CREATE OR REPLACE FUNCTION public.increment_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.event_ticket_types
  SET sold_count = COALESCE(sold_count, 0) + 1
  WHERE id = p_ticket_type_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.event_ticket_types
  SET sold_count = GREATEST(COALESCE(sold_count, 0) - 1, 0)
  WHERE id = p_ticket_type_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ticket_sold_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_ticket_sold_count(UUID) TO anon, authenticated;

-- 3. Storage Admin Write Policies
ALTER POLICY "Admins can upload partner logos"
  ON storage.objects TO authenticated;

ALTER POLICY "Admins can update partner logos"
  ON storage.objects TO authenticated;

ALTER POLICY "Admins can delete partner logos"
  ON storage.objects TO authenticated;

ALTER POLICY "Admins can upload intro videos"
  ON storage.objects TO authenticated;

ALTER POLICY "Admins can update intro videos"
  ON storage.objects TO authenticated;

ALTER POLICY "Admins can delete intro videos"
  ON storage.objects TO authenticated;

COMMIT;
