-- Restrict the existing security-definer audit helper to active program admins.
-- Run after P06. This migration does not alter program content or publications.
begin;
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
  v_admin_id uuid;
begin
  if not public.is_active_program_admin('programs') then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  select id into v_admin_id from public.admin_users
    where user_id = auth.uid() and is_active = true;
  if p_user_id is distinct from v_admin_id then
    raise exception 'Audit actor must match the current admin' using errcode = '42501';
  end if;
  insert into public.activity_logs (user_id, action, entity_type, entity_id, old_data, new_data)
  values (v_admin_id, p_action, 'program', p_entity_id, p_old_data, p_new_data)
  returning id into v_log_id;
  return v_log_id;
end;
$$;
revoke all on function public.log_program_activity(uuid, text, uuid, jsonb, jsonb) from public, anon;
grant execute on function public.log_program_activity(uuid, text, uuid, jsonb, jsonb) to authenticated;
commit;
