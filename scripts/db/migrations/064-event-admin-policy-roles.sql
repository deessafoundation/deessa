-- Restrict event admin policies to authenticated sessions.
-- The security hardening script revokes anon EXECUTE on is_admin_user().
-- Admin policies assigned to PUBLIC still evaluate that helper for anonymous
-- event queries, causing 42501 even when a published-event read policy exists.
-- Preserve all USING/WITH CHECK predicates, public policies, and function grants.
-- Safe to run again: ALTER POLICY replaces only its role list.

BEGIN;

ALTER POLICY "Admins can manage events"
  ON public.events TO authenticated;
ALTER POLICY "Admins can manage agenda items"
  ON public.event_agenda_items TO authenticated;
ALTER POLICY "Admins can manage form schemas"
  ON public.event_form_schemas TO authenticated;
ALTER POLICY "Admins can manage templates"
  ON public.event_form_templates TO authenticated;
ALTER POLICY "Admins can manage registrations"
  ON public.event_registrations TO authenticated;
ALTER POLICY "Admins can manage ticket types"
  ON public.event_ticket_types TO authenticated;
ALTER POLICY "Admins can manage email templates"
  ON public.event_email_templates TO authenticated;
ALTER POLICY "Admins can manage registration emails"
  ON public.event_registration_emails TO authenticated;
ALTER POLICY "Admins can manage registration notes"
  ON public.event_registration_notes TO authenticated;

COMMIT;
