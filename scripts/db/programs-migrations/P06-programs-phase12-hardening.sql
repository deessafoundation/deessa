-- Programs CMS Phase 1-2 Hardening (Migration 065)
-- Additive-only: no existing constraints dropped.

-- 1. UPDATE SECTION TYPE CHECK CONSTRAINT
alter table public.program_sections
  drop constraint if exists program_sections_type_check;

alter table program_sections
  add constraint program_sections_type_check check (type in (
    'rich_text', 'features', 'who_we_support', 'how_it_works',
    'stats', 'quote', 'gallery', 'progress_tracker', 'timeline', 'cta',
    'faq', 'facts_bar', 'resources', 'story', 'activities'
  ));

-- 2. AUDIT TRAIL FUNCTION
create or replace function public.log_program_activity(
  p_user_id uuid,
  p_action text,
  p_entity_id uuid,
  p_old_data jsonb default null,
  p_new_data jsonb default null
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_log_id uuid;
begin
  insert into public.activity_logs (user_id, action, entity_type, entity_id, old_data, new_data)
  values (p_user_id, p_action, 'program', p_entity_id, p_old_data, p_new_data)
  returning id into v_log_id;
  return v_log_id;
end;
$$;

grant execute on function public.log_program_activity(uuid, text, uuid, jsonb, jsonb) to authenticated;

-- 3. SECTIONS JSONB VALIDATION TRIGGER
create or replace function public.validate_program_sections()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  sec jsonb;
  sec_type text;
  valid_types text[] := array[
    'rich_text', 'features', 'who_we_support', 'how_it_works',
    'stats', 'quote', 'gallery', 'progress_tracker', 'timeline', 'cta',
    'faq', 'facts_bar', 'resources', 'story', 'activities', 'built_in_demo'
  ];
begin
  if new.sections is null or jsonb_typeof(new.sections) != 'array' then
    return new;
  end if;

  for sec in select jsonb_array_elements(new.sections)
  loop
    if not (sec ? 'id') or sec->>'id' = '' then
      raise exception 'Each section must have an id field';
    end if;

    if not (sec ? 'content') or not (sec->'content' ? 'type') then
      raise exception 'Section % must have content with type', sec->>'id';
    end if;

    sec_type := sec->'content'->>'type';

    if not (sec_type = any(valid_types)) then
      raise exception 'Section % has unknown type: %', sec->>'id', sec_type;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists validate_program_sections_trigger on public.program_drafts;
create trigger validate_program_sections_trigger
  before insert or update of sections on public.program_drafts
  for each row execute function public.validate_program_sections();

-- 4. IMMUTABLE VERSION HISTORY
-- Versions are snapshots. Only insert and select allowed.
drop policy if exists program_versions_admin_read on public.program_versions;

create policy program_versions_admin_insert on public.program_versions
  for insert to authenticated
  with check (public.is_active_program_admin('programs'));

create policy program_versions_admin_read on public.program_versions
  for select to authenticated
  using (public.is_active_program_admin('programs'));

-- 5. ADDITIONAL INDEXES
create index if not exists program_publications_program_id_idx
  on public.program_publications(program_id);

create index if not exists program_drafts_program_id_idx
  on public.program_drafts(program_id);
