-- Track last published draft revision to avoid duplicate version snapshots
alter table public.programs add column if not exists last_published_revision integer default 0;
