-- Programs CMS: fix program_drafts_hero_valid constraint (Migration 069)
-- The original P01 constraint required the legacy hero keys image/imageAlt/layout.
-- The current editor saves the CMS hero shape {title, description, image?, actions, ...}
-- which has no imageAlt/layout keys and image is optional, so every draft save
-- violated the check. Relax the constraint to match the current schema; the
-- document is already validated app-side by programDocumentSchema (Zod).

alter table public.program_drafts drop constraint if exists program_drafts_hero_valid;

alter table public.program_drafts add constraint program_drafts_hero_valid
  check (
    jsonb_typeof(hero) = 'object' and
    hero ? 'title' and
    hero ? 'description'
  );

comment on column public.program_drafts.hero is 'Hero section: {title, description, image?, actions, note?, sticker?, photoNote?, editorial?} — validated by programDocumentSchema';
