-- Admin helpers deny anonymous EXECUTE after security hardening. Restrict the
-- admin policy's role list so public story reads never evaluate that helper.
-- Preserve published-only public reads and the existing admin role predicate.
BEGIN;

ALTER POLICY "Admins can manage stories"
  ON public.stories TO authenticated;

COMMIT;
