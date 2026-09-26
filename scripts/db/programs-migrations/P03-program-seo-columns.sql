-- =============================================
-- Programs CMS — SEO Columns (Migration 062)
-- =============================================
-- Adds seo_title and seo_description to program_drafts.
-- Depends on: 060-programs-cms-foundation.sql
-- =============================================

-- Add SEO columns to program_drafts
alter table public.program_drafts
  add column if not exists seo_title text,
  add column if not exists seo_description text;

comment on column public.program_drafts.seo_title is 'SEO meta title override. Falls back to program title if null.';
comment on column public.program_drafts.seo_description is 'SEO meta description override. Falls back to short_description if null.';

-- =============================================
-- COMPLETE
-- =============================================
