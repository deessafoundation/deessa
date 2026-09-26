-- Fix: Grant missing permissions for publishProgram() server action
-- RLS policies already restrict to active program admins.

grant insert on table public.program_versions to authenticated;
grant insert, update on table public.program_publications to authenticated;

-- Add admin insert/update policies for program_publications (missing from 060)
drop policy if exists program_publications_admin_insert on public.program_publications;
create policy program_publications_admin_insert on public.program_publications
  for insert to authenticated
  with check (public.is_active_program_admin('programs'));

drop policy if exists program_publications_admin_update on public.program_publications;
create policy program_publications_admin_update on public.program_publications
  for update to authenticated
  using (public.is_active_program_admin('programs'));
