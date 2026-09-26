-- =============================================
-- Programs CMS Foundation (Migration 060)
-- =============================================
-- Creates tables for the Programs CMS system
-- Supports both draft/publish workflow and version history
-- Public content exposed only through program_publications
-- 
-- Based on implementation plan in: docs/in-progress/programs-cms/IMPLEMENTATION-PLAN.md
-- =============================================

create extension if not exists pgcrypto;

-- =============================================
-- PROGRAMS (Master Table)
-- =============================================
create table if not exists public.programs (
  -- Identity
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  
  -- Basic Info (extracted for indexing/searching)
  title text not null,
  category text not null check (category in ('service','campaign','outreach','research')),
  theme text not null check (theme in ('warm','campaign','energetic','editorial')) default 'warm',
  eyebrow text,
  short_description text not null,
  tags text[] default '{}',
  
  -- Publishing
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  featured boolean default false,
  display_order integer not null default 0 check (display_order >= 0),
  
  -- SEO
  meta_title text,
  meta_description text,
  og_image text,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  
  -- Full-text search (will be populated by trigger)
  search_vector tsvector,
  
  -- Constraints
  constraint programs_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint programs_slug_length check (length(slug) between 1 and 100),
  unique (slug)
);

-- Indexes for programs
create index if not exists programs_category_idx on public.programs(category);
create index if not exists programs_status_idx on public.programs(status);
create index if not exists programs_published_at_idx on public.programs(published_at desc) where status = 'published';
create index if not exists programs_search_idx on public.programs using gin(search_vector);
create index if not exists programs_tags_idx on public.programs using gin(tags);

comment on table public.programs is 'Master programs table with indexed fields for search and filtering';
comment on column public.programs.search_vector is 'Full-text search index combining title, description, and tags. Auto-updated by trigger.';

-- Trigger to update search_vector
create or replace function public.programs_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector := 
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.short_description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'C');
  return new;
end;
$$;

drop trigger if exists programs_search_vector_trigger on public.programs;
create trigger programs_search_vector_trigger 
  before insert or update of title, short_description, tags
  on public.programs
  for each row execute function public.programs_search_vector_update();

-- =============================================
-- PROGRAM DRAFTS (Editable State)
-- =============================================
create table if not exists public.program_drafts (
  program_id uuid primary key references public.programs(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version = 1),
  
  -- Hero section (JSONB for flexibility)
  hero jsonb not null,
  
  -- Sections (ordered array of section objects)
  sections jsonb not null default '[]'::jsonb,
  
  revision bigint not null default 1 check (revision > 0),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- Validation: hero must have required fields
alter table public.program_drafts add constraint program_drafts_hero_valid
  check (
    hero ? 'title' and
    hero ? 'description' and
    hero ? 'image' and
    hero ? 'imageAlt' and
    hero ? 'layout'
  );

-- Validation: sections must be an array
alter table public.program_drafts add constraint program_drafts_sections_valid
  check (jsonb_typeof(sections) = 'array');

comment on table public.program_drafts is 'Private editable CMS state. Never use this table for public rendering.';
comment on column public.program_drafts.hero is 'Hero section: {eyebrow, title, description, image, imageAlt, layout, cta, secondaryCta}';
comment on column public.program_drafts.sections is 'Array of sections: [{id, type, heading, content}]';

-- =============================================
-- PROGRAM SECTIONS (Alternative Normalized Approach)
-- Optional: For better queryability of individual sections
-- =============================================
create table if not exists public.program_sections (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  
  section_id text not null,
  type text not null check (type in (
    'rich_text', 'features', 'who_we_support', 'how_it_works',
    'stats', 'quote', 'gallery', 'progress_tracker', 'timeline', 'cta'
  )),
  
  heading text,
  subheading text,
  display_order integer not null default 0,
  
  -- Content (JSONB with type-specific structure)
  content jsonb not null,
  
  is_visible boolean default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(program_id, section_id)
);

create index if not exists program_sections_program_id_idx on public.program_sections(program_id);
create index if not exists program_sections_order_idx on public.program_sections(display_order);
create index if not exists program_sections_type_idx on public.program_sections(type);

comment on table public.program_sections is 'Alternative normalized storage for sections. Can be used instead of or alongside program_drafts.sections JSONB array';

-- =============================================
-- PROGRAM VERSIONS (History)
-- =============================================
create table if not exists public.program_versions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  schema_version integer not null check (schema_version = 1),
  
  -- Snapshot of program state at this version
  program_data jsonb not null,
  hero jsonb not null,
  sections jsonb not null,
  
  change_summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  
  unique (program_id, version_number)
);

create index if not exists program_versions_program_created_idx on public.program_versions(program_id, created_at desc);

comment on table public.program_versions is 'Version history for programs. Each publish creates a new version snapshot.';

-- =============================================
-- PROGRAM PUBLICATIONS (Public View)
-- =============================================
create table if not exists public.program_publications (
  id uuid primary key references public.programs(id) on delete cascade,
  program_id uuid not null unique references public.programs(id) on delete cascade,
  version_id uuid not null unique references public.program_versions(id),
  
  -- Denormalized fields for fast queries
  slug text not null unique,
  category text not null check (category in ('service','outreach','research','campaign')),
  title text not null,
  short_description text not null,
  tags text[] default '{}',
  
  -- Card data for list views (minimal info)
  card jsonb not null,
  
  -- Full document for detail views
  document jsonb not null,
  
  display_order integer not null default 0 check (display_order >= 0),
  published_at timestamptz not null default now(),
  first_published_at timestamptz not null default now()
);

create index if not exists program_publications_category_order_idx on public.program_publications(category, display_order, published_at desc);
create index if not exists program_publications_tags_idx on public.program_publications using gin(tags);
create index if not exists program_publications_slug_idx on public.program_publications(slug);

comment on table public.program_publications is 'Only current published program documents; public-readable by design. Use this for all public rendering.';
comment on column public.program_publications.card is 'Minimal info for list views: {title, eyebrow, shortDescription, image, category}';
comment on column public.program_publications.document is 'Full program document: {hero, sections, meta}';

-- =============================================
-- PROGRAM ASSETS (Images/Files)
-- =============================================
create table if not exists public.program_assets (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  
  -- Storage info
  storage_path text not null unique,
  url text not null,
  filename text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0 and file_size <= 10485760),
  
  -- Image metadata
  width integer,
  height integer,
  alt_text text,
  caption text,
  
  -- Usage tracking
  usage_type text check (usage_type in ('hero', 'gallery', 'section', 'thumbnail', 'other')),
  
  -- Processing status
  processing_status text not null default 'pending' check (processing_status in ('pending','ready','failed')),
  clearance_status text not null default 'pending' check (clearance_status in ('pending','approved','rejected')),
  
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists program_assets_program_idx on public.program_assets(program_id);
create index if not exists program_assets_status_idx on public.program_assets(processing_status, clearance_status);

comment on table public.program_assets is 'Images and files for programs. Stored in Supabase Storage, tracked here.';
comment on column public.program_assets.file_size is 'File size in bytes. Max 10MB (10485760 bytes)';

-- =============================================
-- PROGRAM PUBLISH REQUESTS (Async Publishing)
-- =============================================
create table if not exists public.program_publish_requests (
  request_id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  expected_revision bigint not null,
  status text not null default 'pending' check (status in ('pending','succeeded','failed')),
  version_id uuid references public.program_versions(id),
  error_code text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists program_publish_requests_program_idx on public.program_publish_requests(program_id);
create index if not exists program_publish_requests_status_idx on public.program_publish_requests(status, created_at desc);

comment on table public.program_publish_requests is 'Tracks async publish operations. Useful for queue-based publishing workflow.';

-- =============================================
-- FUNCTIONS
-- =============================================

-- Check if user is active program admin
create or replace function public.is_active_program_admin(required_permission text default 'programs')
returns boolean language sql stable security definer set search_path = public, auth
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid()) and au.is_active = true
      and (au.role in ('SUPER_ADMIN','ADMIN') or (au.role = 'EDITOR' and required_permission = 'programs'))
  );
$$;

comment on function public.is_active_program_admin is 'Returns true if current user has admin access to programs CMS';

-- Get program by slug (public view)
create or replace function public.get_program_by_slug(program_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  category text,
  theme text,
  short_description text,
  tags text[],
  hero jsonb,
  sections jsonb,
  meta jsonb,
  published_at timestamptz
) language sql stable security definer set search_path = public
as $$
  select 
    p.id,
    p.slug,
    p.title,
    p.category,
    p.theme,
    p.short_description,
    p.tags,
    (pp.document->>'hero')::jsonb as hero,
    (pp.document->>'sections')::jsonb as sections,
    jsonb_build_object(
      'title', p.meta_title,
      'description', p.meta_description,
      'ogImage', p.og_image
    ) as meta,
    pp.published_at
  from public.programs p
  inner join public.program_publications pp on p.id = pp.program_id
  where p.slug = program_slug and p.status = 'published';
$$;

comment on function public.get_program_by_slug is 'Get full published program by slug. Used for public program detail pages.';

-- Get published programs (list view)
create or replace function public.get_published_programs(
  filter_category text default null,
  limit_count integer default 20,
  offset_count integer default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  category text,
  eyebrow text,
  short_description text,
  tags text[],
  card_image text,
  published_at timestamptz,
  display_order integer
) language sql stable security definer set search_path = public
as $$
  select 
    p.id,
    p.slug,
    p.title,
    p.category,
    p.eyebrow,
    p.short_description,
    p.tags,
    (pp.card->>'image')::text as card_image,
    pp.published_at,
    pp.display_order
  from public.programs p
  inner join public.program_publications pp on p.id = pp.program_id
  where p.status = 'published'
    and (filter_category is null or p.category = filter_category)
  order by pp.display_order asc, pp.published_at desc
  limit limit_count offset offset_count;
$$;

comment on function public.get_published_programs is 'Get list of published programs with optional category filter. Used for program listing pages.';

-- Search programs (full-text search)
create or replace function public.search_programs(search_query text, limit_count integer default 20)
returns table (
  id uuid,
  slug text,
  title text,
  category text,
  short_description text,
  tags text[],
  rank real
) language sql stable security definer set search_path = public
as $$
  select 
    p.id,
    p.slug,
    p.title,
    p.category,
    p.short_description,
    p.tags,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
  from public.programs p
  inner join public.program_publications pp on p.id = pp.program_id
  where p.status = 'published'
    and p.search_vector @@ plainto_tsquery('english', search_query)
  order by rank desc, p.published_at desc
  limit limit_count;
$$;

comment on function public.search_programs is 'Full-text search across published programs using PostgreSQL FTS';

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
alter table public.programs enable row level security;
alter table public.program_drafts enable row level security;
alter table public.program_sections enable row level security;
alter table public.program_versions enable row level security;
alter table public.program_publications enable row level security;
alter table public.program_assets enable row level security;
alter table public.program_publish_requests enable row level security;

-- Public can read published programs
drop policy if exists program_publications_public_read on public.program_publications;
create policy program_publications_public_read on public.program_publications 
  for select to anon, authenticated using (true);

-- Admins can read programs table
drop policy if exists programs_admin_read on public.programs;
create policy programs_admin_read on public.programs 
  for select to authenticated 
  using (public.is_active_program_admin('programs'));

drop policy if exists programs_admin_insert on public.programs;
create policy programs_admin_insert on public.programs 
  for insert to authenticated 
  with check (public.is_active_program_admin('programs'));

drop policy if exists programs_admin_update on public.programs;
create policy programs_admin_update on public.programs 
  for update to authenticated 
  using (public.is_active_program_admin('programs'))
  with check (public.is_active_program_admin('programs'));

-- Admins can manage drafts
drop policy if exists program_drafts_admin_all on public.program_drafts;
create policy program_drafts_admin_all on public.program_drafts 
  for all to authenticated 
  using (public.is_active_program_admin('programs')) 
  with check (public.is_active_program_admin('programs'));

-- Admins can manage sections
drop policy if exists program_sections_admin_all on public.program_sections;
create policy program_sections_admin_all on public.program_sections 
  for all to authenticated 
  using (public.is_active_program_admin('programs')) 
  with check (public.is_active_program_admin('programs'));

-- Admins can read versions
drop policy if exists program_versions_admin_read on public.program_versions;
create policy program_versions_admin_read on public.program_versions 
  for select to authenticated 
  using (public.is_active_program_admin('programs'));

-- Admins can manage assets
drop policy if exists program_assets_admin_all on public.program_assets;
create policy program_assets_admin_all on public.program_assets 
  for all to authenticated 
  using (public.is_active_program_admin('programs')) 
  with check (public.is_active_program_admin('programs'));

-- Admins can view publish requests
drop policy if exists program_publish_requests_admin_read on public.program_publish_requests;
create policy program_publish_requests_admin_read on public.program_publish_requests 
  for select to authenticated 
  using (public.is_active_program_admin('programs'));

-- =============================================
-- PERMISSIONS
-- =============================================

-- Revoke all default permissions
revoke all on table public.programs from anon, authenticated;
revoke all on table public.program_drafts from anon, authenticated;
revoke all on table public.program_sections from anon, authenticated;
revoke all on table public.program_versions from anon, authenticated;
revoke all on table public.program_publications from anon, authenticated;
revoke all on table public.program_assets from anon, authenticated;
revoke all on table public.program_publish_requests from anon, authenticated;

-- Grant specific permissions
grant select on table public.programs to authenticated;
grant insert, update on table public.programs to authenticated; -- RLS will restrict to admins
grant select, insert, update, delete on table public.program_drafts to authenticated;
grant select, insert, update, delete on table public.program_sections to authenticated;
grant select on table public.program_versions to authenticated;
grant select on table public.program_publications to anon, authenticated;
grant select, insert, update, delete on table public.program_assets to authenticated;
grant select on table public.program_publish_requests to authenticated;

-- Grant execute on functions
revoke all on function public.is_active_program_admin(text) from public;
grant execute on function public.is_active_program_admin(text) to authenticated;

grant execute on function public.get_program_by_slug(text) to anon, authenticated;
grant execute on function public.get_published_programs(text, integer, integer) to anon, authenticated;
grant execute on function public.search_programs(text, integer) to anon, authenticated;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists programs_updated_at on public.programs;
create trigger programs_updated_at before update on public.programs
  for each row execute function public.update_updated_at_column();

drop trigger if exists program_drafts_updated_at on public.program_drafts;
create trigger program_drafts_updated_at before update on public.program_drafts
  for each row execute function public.update_updated_at_column();

drop trigger if exists program_sections_updated_at on public.program_sections;
create trigger program_sections_updated_at before update on public.program_sections
  for each row execute function public.update_updated_at_column();

-- =============================================
-- COMPLETE
-- =============================================

comment on schema public is 'Programs CMS foundation complete. Tables: programs, program_drafts, program_sections, program_versions, program_publications, program_assets, program_publish_requests';
