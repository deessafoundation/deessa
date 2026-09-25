-- 058: Add archived_at to payment tables for soft-delete/archiving

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE conference_registrations
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Indexes for filtering archived records
CREATE INDEX IF NOT EXISTS idx_donations_archived ON donations(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_archived ON event_registrations(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conf_reg_archived ON conference_registrations(archived_at) WHERE archived_at IS NOT NULL;
