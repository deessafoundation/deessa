-- 057: Add RPC functions for atomic sold_count increment/decrement
-- These are called by the ticket-capacity.ts helpers.

CREATE OR REPLACE FUNCTION increment_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE event_ticket_types
  SET sold_count = COALESCE(sold_count, 0) + 1
  WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_ticket_sold_count(p_ticket_type_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE event_ticket_types
  SET sold_count = GREATEST(COALESCE(sold_count, 0) - 1, 0)
  WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql;
