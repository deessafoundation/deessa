-- ============================================================================
-- Migration: 060 - Ticket Price TBD Flag
-- Description: Allow a ticket type's price to be marked "not finalized yet"
--              so the public site shows "TBD" instead of a placeholder number.
-- Dependencies: 050-events-module-schema.sql
-- ============================================================================

ALTER TABLE event_ticket_types
  ADD COLUMN IF NOT EXISTS price_tbd BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- ALTER TABLE event_ticket_types DROP COLUMN IF EXISTS price_tbd;
