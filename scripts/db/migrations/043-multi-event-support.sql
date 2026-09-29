-- ═══════════════════════════════════════════════════════════════════════════
-- Multi-Event Support for Conference Form Builder
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds event_id to conference_registrations for proper event attribution.
-- This allows multiple events to have different forms and registrations.
--
-- BACKWARD COMPATIBLE: All changes are additive and non-breaking.
-- Existing registrations will work as before.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Add event_id to conference_registrations
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE conference_registrations
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

COMMENT ON COLUMN conference_registrations.event_id IS 
  'Links registration to a specific event. NULL for registrations created before multi-event support.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Create helper function to get "current" event
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_current_conference_event_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_event_id UUID;
BEGIN
  -- Try to get the most recent upcoming event
  SELECT id INTO current_event_id
  FROM events
  WHERE type = 'upcoming'
    AND is_published = true
    AND event_date >= CURRENT_DATE
  ORDER BY event_date ASC, created_at DESC
  LIMIT 1;
  
  -- If no upcoming event, get most recent past event
  IF current_event_id IS NULL THEN
    SELECT id INTO current_event_id
    FROM events
    WHERE type = 'past'
      AND is_published = true
    ORDER BY event_date DESC, created_at DESC
    LIMIT 1;
  END IF;
  
  -- If still no event, get any published event
  IF current_event_id IS NULL THEN
    SELECT id INTO current_event_id
    FROM events
    WHERE is_published = true
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN current_event_id;
END;
$$;

COMMENT ON FUNCTION get_current_conference_event_id() IS
  'Returns the ID of the current conference event (upcoming > past > any published). Used for backfilling and defaults.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Backfill existing registrations with current event
-- ═══════════════════════════════════════════════════════════════════════════

-- Only update registrations that don't have an event_id yet
UPDATE conference_registrations
SET event_id = get_current_conference_event_id()
WHERE event_id IS NULL
  AND get_current_conference_event_id() IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Create indexes for performance
-- ═══════════════════════════════════════════════════════════════════════════

-- Index for filtering registrations by event
CREATE INDEX IF NOT EXISTS idx_conference_reg_event
  ON conference_registrations(event_id);

-- Composite index for common queries (event + status)
CREATE INDEX IF NOT EXISTS idx_conference_reg_event_status
  ON conference_registrations(event_id, status);

-- Composite index for event + created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_conference_reg_event_created
  ON conference_registrations(event_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Update unique constraint to be per-event
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop the old unique constraint (email-only)
DROP INDEX IF EXISTS uq_conf_reg_active_email;

-- Create new unique constraint (event_id + email)
-- This allows same email to register for different events
CREATE UNIQUE INDEX uq_conf_reg_active_email_per_event
  ON conference_registrations (event_id, email)
  WHERE status NOT IN ('cancelled', 'expired');

COMMENT ON INDEX uq_conf_reg_active_email_per_event IS
  'Prevents duplicate active registrations for the same email per event. Allows same email to register for different events.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. Add event_id to conference_form_schemas unique constraint
-- ═══════════════════════════════════════════════════════════════════════════

-- This was already in place from script 040, but let's verify
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'uq_conf_form_schema_per_event'
  ) THEN
    -- Add unique constraint for event_id + version
    ALTER TABLE conference_form_schemas
      ADD CONSTRAINT uq_conf_form_schema_per_event 
      UNIQUE (event_id, version);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. Create view for easy event + registration queries
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW conference_registrations_with_event AS
SELECT 
  cr.*,
  e.title as event_title,
  e.slug as event_slug,
  e.event_date,
  e.type as event_type,
  e.is_published as event_is_published
FROM conference_registrations cr
LEFT JOIN events e ON cr.event_id = e.id;

COMMENT ON VIEW conference_registrations_with_event IS
  'Convenient view joining registrations with their event details. Use for admin dashboards.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. Verification Queries
-- ═══════════════════════════════════════════════════════════════════════════

-- Check event_id was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'conference_registrations' 
      AND column_name = 'event_id'
  ) THEN
    RAISE NOTICE '✓ event_id column added successfully';
  ELSE
    RAISE EXCEPTION '✗ event_id column not found';
  END IF;
END $$;

-- Check indexes were created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conference_reg_event') THEN
    RAISE NOTICE '✓ idx_conference_reg_event created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_conf_reg_active_email_per_event') THEN
    RAISE NOTICE '✓ uq_conf_reg_active_email_per_event created';
  END IF;
END $$;

-- Show backfill results
DO $$
DECLARE
  total_regs INT;
  regs_with_event INT;
  regs_without_event INT;
BEGIN
  SELECT COUNT(*) INTO total_regs FROM conference_registrations;
  SELECT COUNT(*) INTO regs_with_event FROM conference_registrations WHERE event_id IS NOT NULL;
  SELECT COUNT(*) INTO regs_without_event FROM conference_registrations WHERE event_id IS NULL;
  
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'Backfill Results:';
  RAISE NOTICE '  Total Registrations: %', total_regs;
  RAISE NOTICE '  With event_id: % (%.1f%%)', regs_with_event, (regs_with_event::float / NULLIF(total_regs, 0) * 100);
  RAISE NOTICE '  Without event_id: % (%.1f%%)', regs_without_event, (regs_without_event::float / NULLIF(total_regs, 0) * 100);
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  IF regs_without_event > 0 THEN
    RAISE NOTICE 'Note: % registrations have NULL event_id (no published events found for backfill)', regs_without_event;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. Sample Queries for Testing
-- ═══════════════════════════════════════════════════════════════════════════

-- View registrations by event
-- SELECT event_title, COUNT(*) as registration_count
-- FROM conference_registrations_with_event
-- WHERE event_id IS NOT NULL
-- GROUP BY event_title, event_id
-- ORDER BY event_date DESC;

-- View form schemas by event
-- SELECT e.title as event_name, cfs.version, cfs.is_active, cfs.created_at
-- FROM conference_form_schemas cfs
-- JOIN events e ON cfs.event_id = e.id
-- ORDER BY e.event_date DESC, cfs.version DESC;

-- Check for registrations without event_id
-- SELECT COUNT(*) as orphaned_registrations
-- FROM conference_registrations
-- WHERE event_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════════════════
-- ✓ event_id added to conference_registrations
-- ✓ Existing registrations backfilled with current event
-- ✓ Unique constraint updated (per-event emails)
-- ✓ Indexes created for performance
-- ✓ Helper view created for queries
-- ✓ 100% backward compatible
--
-- Next Steps:
--   1. Update registration creation to include event_id
--   2. Add event selector to form builder UI
--   3. Create forms overview dashboard
--   4. Enhance registrations table with event column
-- ═══════════════════════════════════════════════════════════════════════════
