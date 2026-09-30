-- =============================================================================
-- 063 — Artworks (Deetya & Marissa art gallery)
--
-- Powers the homepage art feature and the public /arts gallery.
--   * Anonymous visitors can read PUBLISHED rows only (RLS).
--   * Active SUPER_ADMIN / ADMIN users (the "settings" permission) can read drafts.
--   * No write grants to anon/authenticated: all mutations go through the
--     admin server actions in lib/actions/artworks.ts, which check
--     getCurrentAdmin() + hasPermission(role, "settings") and then write with
--     the service-role client.
--
-- Idempotent: safe to run more than once. Seeding only inserts rows whose
-- seed_key is missing, so admin edits are never overwritten.
--
-- APPLY (run separately in EACH environment — committing this file does not
-- apply it anywhere):
--   Local:      Supabase dashboard for the dev project → SQL Editor → paste → Run
--               (or: psql "$LOCAL_DB_URL" -f scripts/db/migrations/063-artworks.sql)
--   Production: Supabase dashboard for the production project → SQL Editor → Run
--
-- VERIFY (after applying):
--   select title, display_order, is_published, is_featured from public.artworks order by display_order;
--     -- expect 6 seeded rows
--   set role anon; select count(*) from public.artworks where not is_published; reset role;
--     -- expect 0 (drafts hidden)
--   set role anon; insert into public.artworks (title, alt_text, local_image_path, width, height, display_order)
--     values ('x','x','/artWork/x.webp',1,1,999); reset role;
--     -- expect: permission denied
-- =============================================================================

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_credit text,
  description text,
  alt_text text not null,
  local_image_path text,
  storage_path text,
  width integer not null,
  height integer not null,
  display_order integer not null,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  source_filename text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artworks_title_length check (char_length(btrim(title)) between 1 and 120),
  constraint artworks_alt_text_length check (char_length(btrim(alt_text)) between 5 and 300),
  constraint artworks_credit_length check (artist_credit is null or char_length(artist_credit) <= 120),
  constraint artworks_description_length check (description is null or char_length(description) <= 1200),
  constraint artworks_dimensions check (width > 0 and height > 0),
  -- Exactly one usable image source per row.
  constraint artworks_one_image_source check (
    (local_image_path is not null)::int + (storage_path is not null)::int = 1
  ),
  -- Seeded assets are site-relative paths under /artWork/ — no traversal, no URLs.
  constraint artworks_local_path_format check (
    local_image_path is null
    or (local_image_path ~ '^/artWork/[A-Za-z0-9_.-]+$' and local_image_path !~ '\.\.')
  ),
  -- Uploads live in the site-assets bucket under artworks/.
  constraint artworks_storage_path_format check (
    storage_path is null
    or (storage_path ~ '^artworks/[A-Za-z0-9_.-]+$' and storage_path !~ '\.\.')
  ),
  constraint artworks_seed_key_unique unique (seed_key),
  -- Deferred so a whole reorder can happen in one statement.
  constraint artworks_display_order_unique unique (display_order) deferrable initially deferred
);

create index if not exists idx_artworks_published_order
  on public.artworks (display_order)
  where is_published;

create index if not exists idx_artworks_featured_order
  on public.artworks (display_order)
  where is_published and is_featured;

create index if not exists idx_artworks_storage_path
  on public.artworks (storage_path)
  where storage_path is not null;

-- ---------------------------------------------------------------------------
-- updated_at trigger (dedicated function with a pinned search_path)
-- ---------------------------------------------------------------------------
create or replace function public.set_artworks_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_artworks_updated_at on public.artworks;
create trigger trg_artworks_updated_at
  before update on public.artworks
  for each row execute function public.set_artworks_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.artworks enable row level security;

drop policy if exists "Public can view published artworks" on public.artworks;
create policy "Public can view published artworks"
  on public.artworks
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Settings admins can view all artworks" on public.artworks;
create policy "Settings admins can view all artworks"
  on public.artworks
  for select
  to authenticated
  using (public.get_admin_role() in ('SUPER_ADMIN', 'ADMIN'));

revoke all on public.artworks from anon, authenticated;
grant select on public.artworks to anon, authenticated;
grant all on public.artworks to service_role;

-- ---------------------------------------------------------------------------
-- Atomic reorder. p_ids must list every artwork exactly once.
-- Only callable with the service role (admin server action).
-- ---------------------------------------------------------------------------
create or replace function public.reorder_artworks(p_ids uuid[])
returns void
language plpgsql
set search_path = public
as $$
declare
  v_total integer;
  v_given integer;
begin
  select count(*) into v_total from public.artworks;
  select count(distinct x) into v_given from unnest(p_ids) as x;

  if v_given <> coalesce(array_length(p_ids, 1), 0) then
    raise exception 'reorder_artworks: duplicate ids';
  end if;
  if v_given <> v_total then
    raise exception 'reorder_artworks: expected % ids, got %', v_total, v_given;
  end if;

  update public.artworks a
     set display_order = o.pos
    from unnest(p_ids) with ordinality as o(id, pos)
   where a.id = o.id;

  if (select count(*) from public.artworks a join unnest(p_ids) as x(id) on a.id = x.id) <> v_total then
    raise exception 'reorder_artworks: unknown id';
  end if;
end;
$$;

revoke all on function public.reorder_artworks(uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_artworks(uuid[]) to service_role;

-- ---------------------------------------------------------------------------
-- Seed: the six prepared canvases in public/artWork/.
-- Titles are descriptive placeholders, NOT confirmed artwork titles; credit
-- is collection-level until each piece is confirmed by an admin.
-- ---------------------------------------------------------------------------
with seed (seed_key, title, alt_text, local_image_path, width, height, pos, featured, source_filename) as (
  values
    ('seed-floral-canvas', 'Golden garden',
     'A painted canvas of bright yellow flowers with dark centres on green stems, propped up on a table.',
     '/artWork/floral-canvas.webp', 1600, 1067, 1, true, 'DSC06841.jpg'),
    ('seed-dandelion-meadow', 'Dandelion meadow',
     'A tall painting of two white dandelion seed heads on thin stems against a green-to-yellow sky, with grass along the bottom.',
     '/artWork/dandelion-meadow.webp', 1067, 1600, 2, true, 'DSC06849.jpg'),
    ('seed-moonlit-lights', 'Moonlit lights',
     'A painting of a string of glowing round lights hanging across a speckled blue night sky with a crescent moon, above dark treetops.',
     '/artWork/moonlit-lights.webp', 1315, 877, 3, true, 'DSC06851.jpg'),
    ('seed-deer-at-sunset', 'Deer at sunset',
     'A painting of a dark deer silhouette with antlers standing on a rocky ledge against an orange and yellow sunset sky.',
     '/artWork/deer-at-sunset.webp', 1600, 1067, 4, false, 'DSC06844.jpg'),
    ('seed-flamingo-mosaic', 'Pink flamingo',
     'A dotted painting of a pink flamingo in front of blue and white wave stripes, laid on a dark table beside other paintings.',
     '/artWork/flamingo-mosaic.webp', 1600, 1067, 5, false, 'DSC06822.jpg'),
    ('seed-sunset-birds', 'Sunset birds',
     'A painting of a large orange setting sun over a dark horizon, with small birds flying across a yellow sky.',
     '/artWork/sunset-birds.webp', 1600, 1067, 6, false, 'DSC06812.jpg')
),
missing as (
  select s.*, row_number() over (order by s.pos) as rn
    from seed s
   where not exists (select 1 from public.artworks a where a.seed_key = s.seed_key)
),
base as (
  select coalesce(max(display_order), 0) as max_order from public.artworks
)
insert into public.artworks (
  seed_key, title, artist_credit, description, alt_text, local_image_path,
  width, height, display_order, is_published, is_featured, source_filename
)
select m.seed_key, m.title, 'Deetya & Marissa', null, m.alt_text, m.local_image_path,
       m.width, m.height,
       -- Fresh database: keep the intended 1..6 order. Existing rows: append.
       case when b.max_order = 0 then m.pos else b.max_order + m.rn end,
       true, m.featured, m.source_filename
  from missing m cross join base b;

-- ---------------------------------------------------------------------------
-- Editable section copy (homepage feature + /arts). The app falls back to the
-- same defaults in lib/arts/content.ts if this row is missing. DO NOTHING keeps
-- later admin edits intact on re-runs.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value, updated_at)
values (
  'arts_content',
  '{
    "home": {
      "eyebrow": "Art & Expression",
      "heading": "Art that speaks",
      "headingAccent": "without words",
      "intro": "Step into the colourful worlds of Deetya and Marissa. Each piece is a glimpse of imagination, feeling, and the joy of creating.",
      "ctaLabel": "Explore their art",
      "creditLine": "Original works by Deetya & Marissa",
      "badge": "Made with imagination and heart"
    },
    "gallery": {
      "eyebrow": "Art by Deetya & Marissa",
      "heading": "A world of colour,",
      "headingAccent": "through their eyes",
      "intro": "A collection of paintings, playful details, and moments of expression. Take your time and see what each piece invites you to notice.",
      "heroBadge": "A space for every expression",
      "collectionHeading": "Little worlds,",
      "collectionAccent": "big imagination",
      "collectionIntro": "Original artworks from Deetya and Marissa''s creative space."
    }
  }'::jsonb,
  now()
)
on conflict (key) do nothing;

-- ROLLBACK (manual):
--   delete from public.site_settings where key = 'arts_content';
--   drop function if exists public.reorder_artworks(uuid[]);
--   drop table if exists public.artworks;
--   drop function if exists public.set_artworks_updated_at();
