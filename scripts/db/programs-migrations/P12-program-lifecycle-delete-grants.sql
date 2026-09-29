-- Fix: archiveProgram(), unpublishProgram() and deleteProgram() failed with
-- SQLSTATE 42501 "permission denied for table program_publications" / "programs".
-- P01 revoked all privileges and re-granted only SELECT on program_publications
-- and select/insert/update on programs; P08 added insert/update on
-- program_publications but never DELETE. RLS policies must exist alongside the
-- grants, otherwise the DELETE silently matches 0 rows.

grant delete on table public.program_publications to authenticated;
grant delete on table public.programs to authenticated;

drop policy if exists program_publications_admin_delete on public.program_publications;
create policy program_publications_admin_delete on public.program_publications
  for delete to authenticated
  using (public.is_active_program_admin('programs'));

drop policy if exists programs_admin_delete on public.programs;
create policy programs_admin_delete on public.programs
  for delete to authenticated
  using (public.is_active_program_admin('programs'));
