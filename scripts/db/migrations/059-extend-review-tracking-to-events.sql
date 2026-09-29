-- 059: Extend review/status tracking to events & conferences
-- Adds event_registration_id/conference_registration_id to review_notes & status_change_log
-- Adds review_status/reviewed_at/reviewed_by to event_registrations & conference_registrations

-- ============================================================================
-- 1. Add foreign key columns to review_notes
-- ============================================================================
ALTER TABLE review_notes ADD COLUMN IF NOT EXISTS event_registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE;
ALTER TABLE review_notes ADD COLUMN IF NOT EXISTS conference_registration_id UUID REFERENCES conference_registrations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_review_notes_event ON review_notes(event_registration_id, created_at DESC) WHERE event_registration_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_review_notes_conference ON review_notes(conference_registration_id, created_at DESC) WHERE conference_registration_id IS NOT NULL;

-- ============================================================================
-- 2. Add foreign key columns to status_change_log
-- ============================================================================
ALTER TABLE status_change_log ADD COLUMN IF NOT EXISTS event_registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE;
ALTER TABLE status_change_log ADD COLUMN IF NOT EXISTS conference_registration_id UUID REFERENCES conference_registrations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_status_change_log_event ON status_change_log(event_registration_id, created_at DESC) WHERE event_registration_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_change_log_conference ON status_change_log(conference_registration_id, created_at DESC) WHERE conference_registration_id IS NOT NULL;

-- ============================================================================
-- 3. Add review columns to event_registrations
-- ============================================================================
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'unreviewed';
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES admin_users(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_event_review_status'
  ) THEN
    ALTER TABLE event_registrations ADD CONSTRAINT check_event_review_status
      CHECK (review_status IN ('unreviewed', 'verified', 'flagged', 'refunded'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_reg_review_status ON event_registrations(review_status);

-- ============================================================================
-- 4. Add review columns to conference_registrations
-- ============================================================================
ALTER TABLE conference_registrations ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'unreviewed';
ALTER TABLE conference_registrations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE conference_registrations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES admin_users(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_conference_review_status'
  ) THEN
    ALTER TABLE conference_registrations ADD CONSTRAINT check_conference_review_status
      CHECK (review_status IN ('unreviewed', 'verified', 'flagged', 'refunded'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conf_reg_review_status ON conference_registrations(review_status);

-- ============================================================================
-- 5. Add status_change_log FK constraint update (make donation_id nullable)
-- ============================================================================
-- The existing tables have NOT NULL on donation_id. We need to allow null
-- so records can belong to events/conferences instead.
DO $$
BEGIN
  -- Make donation_id nullable in review_notes if it's currently NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_notes' AND column_name = 'donation_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE review_notes ALTER COLUMN donation_id DROP NOT NULL;
  END IF;

  -- Make donation_id nullable in status_change_log if it's currently NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'status_change_log' AND column_name = 'donation_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE status_change_log ALTER COLUMN donation_id DROP NOT NULL;
  END IF;
END $$;
