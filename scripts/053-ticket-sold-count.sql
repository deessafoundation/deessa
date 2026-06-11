-- 053: Add sold_count to event_ticket_types for capacity tracking

ALTER TABLE event_ticket_types
  ADD COLUMN IF NOT EXISTS sold_count INT NOT NULL DEFAULT 0;

-- Initialize sold_count from existing registrations
UPDATE event_ticket_types tt
SET sold_count = (
  SELECT COUNT(*)
  FROM event_registrations r
  WHERE r.ticket_type_id = tt.id
  AND r.status NOT IN ('cancelled', 'expired')
);
