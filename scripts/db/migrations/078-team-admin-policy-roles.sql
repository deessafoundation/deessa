-- ============================================================================
-- Migration: 078 - Restrict admin policies on public tables to authenticated
-- Description: Restricts admin management policies to the `authenticated` role
--              on tables that have public SELECT policies.
--
-- Background:
--   Security hardening (scripts/fixes/007-fix-function-execution-perms.sql) revoked
--   anonymous EXECUTE on `get_admin_role()` and `is_admin_user()`.
--   When admin policies are assigned to PUBLIC (the default role list), PostgreSQL
--   evaluates them for anonymous queries on public tables:
--     (is_published = TRUE) OR (get_admin_role() IN (...))
--   PostgreSQL denies anon execution of get_admin_role() with error 42501:
--     "permission denied for function get_admin_role"
--   This caused /about to fail and display:
--     "Team profiles are temporarily unavailable. Please check back soon."
--
--   This exact issue was previously resolved for events (migration 064) and
--   stories (migration 068). This migration resolves it for team_members and
--   the remaining public tables.
-- ============================================================================

BEGIN;

-- 1. Team Members
ALTER POLICY "Admins can manage team members"
  ON public.team_members TO authenticated;

GRANT SELECT ON public.team_members TO anon, authenticated;

-- 2. Universal Partners System
ALTER POLICY "Admins can manage partners"
  ON public.partners TO authenticated;

ALTER POLICY "Admins can manage partner categories"
  ON public.partner_categories TO authenticated;

ALTER POLICY "Admins can manage context partners"
  ON public.context_partners TO authenticated;

GRANT SELECT ON public.partners TO anon, authenticated;
GRANT SELECT ON public.partner_categories TO anon, authenticated;
GRANT SELECT ON public.context_partners TO anon, authenticated;

-- 3. Projects & Project Sub-tables
ALTER POLICY "Admins can view all projects"
  ON public.projects TO authenticated;

ALTER POLICY "Editors and above can manage projects"
  ON public.projects TO authenticated;

ALTER POLICY "Admins can manage metrics"
  ON public.project_metrics TO authenticated;

ALTER POLICY "Admins can manage timeline"
  ON public.project_timeline TO authenticated;

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.project_metrics TO anon, authenticated;
GRANT SELECT ON public.project_timeline TO anon, authenticated;

-- 4. Impact Stats
ALTER POLICY "Admins can manage stats"
  ON public.impact_stats TO authenticated;

GRANT SELECT ON public.impact_stats TO anon, authenticated;

-- 5. Site Settings
ALTER POLICY "Super admins can manage settings"
  ON public.site_settings TO authenticated;

GRANT SELECT ON public.site_settings TO anon, authenticated;

COMMIT;
