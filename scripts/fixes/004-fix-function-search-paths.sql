-- ============================================================
-- FIX: Set search_path on Mutable Functions
-- Issue: Supabase Database Linter #0011
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   26 functions don't specify SET search_path, allowing
--   potential schema resolution attacks.
--
-- FIX:
--   Add SET search_path = public to each function.
--   Uses CREATE OR REPLACE with exact original signatures.
--
-- SAFETY:
--   All function bodies and signatures match originals exactly.
--   Only the SET search_path property is added.
-- ============================================================


-- 1. update_media_assets_updated_at
-- scripts/006-media-assets.sql:33
CREATE OR REPLACE FUNCTION public.update_media_assets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- 2. get_currency_symbol
-- scripts/008-currency-support.sql:34
CREATE OR REPLACE FUNCTION public.get_currency_symbol(currency_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE currency_code
    WHEN 'USD' THEN '$'
    WHEN 'NPR' THEN '₨'
    WHEN 'INR' THEN '₹'
    WHEN 'EUR' THEN '€'
    WHEN 'GBP' THEN '£'
    ELSE currency_code
  END;
END;
$$;


-- 3. search_podcasts
-- scripts/012-create_podcasts_table.sql:116
-- MUST DROP FIRST because adding SET search_path is an immutable property change
DROP FUNCTION IF EXISTS public.search_podcasts(text);

CREATE OR REPLACE FUNCTION public.search_podcasts(search_query TEXT)
RETURNS SETOF public.podcasts
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.podcasts
  WHERE published = true
    AND (
      title ILIKE '%' || search_query || '%'
      OR description ILIKE '%' || search_query || '%'
      OR show_notes ILIKE '%' || search_query || '%'
      OR transcript ILIKE '%' || search_query || '%'
      OR guest_name ILIKE '%' || search_query || '%'
    )
  ORDER BY published_at DESC;
END;
$$;


-- 4. increment_podcast_views
-- scripts/012-create_podcasts_table.sql:135
CREATE OR REPLACE FUNCTION public.increment_podcast_views(podcast_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.podcasts
  SET view_count = view_count + 1
  WHERE id = podcast_id;
END;
$$;


-- 5. update_conference_form_template_updated_at
-- scripts/042-conference-form-templates.sql:56
CREATE OR REPLACE FUNCTION public.update_conference_form_template_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- 6. get_next_receipt_number
-- scripts/payments-v2/025-atomic-receipt-number.sql:19
-- MUST DROP FIRST because adding SET search_path is an immutable property change
DROP FUNCTION IF EXISTS public.get_next_receipt_number();

CREATE OR REPLACE FUNCTION public.get_next_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_year INT;
  next_num INT;
  receipt_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INT;

  INSERT INTO receipt_sequences (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_number = receipt_sequences.last_number + 1
  RETURNING last_number INTO next_num;

  receipt_num := 'RCP-' || current_year::TEXT || '-' || LPAD(next_num::TEXT, 5, '0');

  RETURN receipt_num;
END;
$$;


-- 7. can_delete_event
-- scripts/050-events-module-schema.sql:450
-- Original is SQL language, not plpgsql
CREATE OR REPLACE FUNCTION public.can_delete_event(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM event_registrations WHERE event_id = p_event_id
  );
$$;


-- 8. cleanup_old_payment_logs
-- scripts/payments-v2/025-create-payment-logs-table.sql:156
CREATE OR REPLACE FUNCTION public.cleanup_old_payment_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM payment_logs
  WHERE
    created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND level NOT IN ('error', 'critical');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


-- 9. increment_receipt_failure_attempt
-- scripts/payments-v2/026-create-receipt-failures-table.sql:46
-- This is a TRIGGER function (no params, RETURNS TRIGGER)
CREATE OR REPLACE FUNCTION public.increment_receipt_failure_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE receipt_failures
  SET
    attempt_count = attempt_count + 1,
    last_attempt_at = NEW.last_attempt_at,
    error_message = NEW.error_message,
    error_stack = NEW.error_stack,
    error_type = NEW.error_type
  WHERE donation_id = NEW.donation_id
    AND resolved_at IS NULL;

  IF FOUND THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;


-- 10. increment_email_failure_attempt
-- scripts/payments-v2/027-create-email-failures-table.sql:51
-- This is a TRIGGER function (no params, RETURNS TRIGGER)
CREATE OR REPLACE FUNCTION public.increment_email_failure_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE email_failures
  SET
    attempt_count = attempt_count + 1,
    last_attempt_at = NEW.last_attempt_at,
    error_message = NEW.error_message,
    error_stack = NEW.error_stack,
    error_type = NEW.error_type,
    recipient_email = NEW.recipient_email
  WHERE donation_id = NEW.donation_id
    AND resolved_at IS NULL;

  IF FOUND THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;


-- 11. increment_rate_limit
-- scripts/018-rate-limit-function.sql:9
-- Returns TABLE(attempts integer, expires_at timestamptz), not INTEGER
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_identifier text,
  p_window_minutes integer
)
RETURNS TABLE(attempts integer, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := NOW();
  v_new_expires timestamptz := v_now + (p_window_minutes * INTERVAL '1 minute');
BEGIN
  RETURN QUERY
  INSERT INTO rate_limits (identifier, attempts, expires_at)
  VALUES (p_identifier, 1, v_new_expires)
  ON CONFLICT (identifier) DO UPDATE
    SET
      attempts = CASE
                   WHEN rate_limits.expires_at < v_now THEN 1
                   ELSE rate_limits.attempts + 1
                 END,
      expires_at = CASE
                     WHEN rate_limits.expires_at < v_now THEN v_new_expires
                     ELSE rate_limits.expires_at
                   END
  RETURNING rate_limits.attempts, rate_limits.expires_at;
END;
$$;


-- 12. increment_ticket_sold_count
-- scripts/057-ticket-sold-count-rpc.sql:4
-- Updates event_ticket_types (not ticket_types), no p_quantity param
CREATE OR REPLACE FUNCTION public.increment_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE event_ticket_types
  SET sold_count = COALESCE(sold_count, 0) + 1
  WHERE id = p_ticket_type_id;
END;
$$;


-- 13. decrement_ticket_sold_count
-- scripts/057-ticket-sold-count-rpc.sql:13
-- Updates event_ticket_types (not ticket_types), no p_quantity param
CREATE OR REPLACE FUNCTION public.decrement_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE event_ticket_types
  SET sold_count = GREATEST(COALESCE(sold_count, 0) - 1, 0)
  WHERE id = p_ticket_type_id;
END;
$$;


-- 14. is_admin_user
-- scripts/002-admin-schema.sql:176
-- Original checks is_active = TRUE
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$;


-- 15. get_admin_role
-- scripts/002-admin-schema.sql:188
-- Original checks is_active = TRUE
CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM admin_users
  WHERE user_id = auth.uid() AND is_active = TRUE;
  RETURN user_role;
END;
$$;


-- 16. update_updated_at_column
-- scripts/002-admin-schema.sql:327
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- 17. get_homepage_stats
-- scripts/037-homepage-cms-schema.sql:438
-- Reads from site_settings table, returns JSONB
CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats_data JSONB;
BEGIN
  SELECT value INTO stats_data
  FROM site_settings
  WHERE key = 'homepage_stats';

  RETURN COALESCE(stats_data, '{}'::jsonb);
END;
$$;


-- 18. get_homepage_programs
-- scripts/037-homepage-cms-schema.sql:452
-- Reads from site_settings table, returns JSONB
CREATE OR REPLACE FUNCTION public.get_homepage_programs()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  programs_data JSONB;
BEGIN
  SELECT value INTO programs_data
  FROM site_settings
  WHERE key = 'homepage_programs';

  RETURN COALESCE(programs_data, '{}'::jsonb);
END;
$$;


-- 19. get_homepage_trust_indicators
-- scripts/037-homepage-cms-schema.sql:466
-- Reads from site_settings table, returns JSONB
CREATE OR REPLACE FUNCTION public.get_homepage_trust_indicators()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trust_data JSONB;
BEGIN
  SELECT value INTO trust_data
  FROM site_settings
  WHERE key = 'homepage_trust_indicators';

  RETURN COALESCE(trust_data, '{}'::jsonb);
END;
$$;


-- 20. get_homepage_featured_stories_rules
-- scripts/037-homepage-cms-schema.sql:480
-- Reads from site_settings table, returns JSONB
CREATE OR REPLACE FUNCTION public.get_homepage_featured_stories_rules()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rules_data JSONB;
BEGIN
  SELECT value INTO rules_data
  FROM site_settings
  WHERE key = 'homepage_featured_stories_rules';

  RETURN COALESCE(rules_data, '{}'::jsonb);
END;
$$;


-- 21. update_homepage_setting
-- scripts/037-homepage-cms-schema.sql:494
-- p_admin_id has DEFAULT NULL, updates site_settings, returns BOOLEAN
CREATE OR REPLACE FUNCTION public.update_homepage_setting(
  p_key TEXT,
  p_value JSONB,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE site_settings
  SET value = p_value,
      updated_by = p_admin_id,
      updated_at = NOW()
  WHERE key = p_key;

  RETURN FOUND;
END;
$$;


-- 22. create_admin_notification
-- scripts/036-admin-notifications.sql:57
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO admin_notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;


-- 23. mark_notification_read
-- scripts/036-admin-notifications.sql:78
-- Returns BOOLEAN (not VOID), checks user_id = auth.uid()
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE admin_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;


-- 24. mark_all_notifications_read
-- scripts/036-admin-notifications.sql:90
-- Returns INTEGER (not VOID)
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE admin_notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid() AND is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


-- 25. get_unread_notification_count
-- scripts/036-admin-notifications.sql:105
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM admin_notifications
  WHERE user_id = auth.uid() AND is_read = FALSE;

  RETURN unread_count;
END;
$$;


-- 26. get_current_conference_event_id
-- scripts/043-multi-event-support.sql:25
CREATE OR REPLACE FUNCTION public.get_current_conference_event_id()
RETURNS UUID
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  current_event_id UUID;
BEGIN
  SELECT id INTO current_event_id
  FROM events
  WHERE type = 'upcoming'
    AND is_published = true
    AND event_date >= CURRENT_DATE
  ORDER BY event_date ASC, created_at DESC
  LIMIT 1;

  RETURN current_event_id;
END;
$$;
