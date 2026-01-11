-- ==========================================================================
-- 035 - Support Admin Actions & Contact Submissions columns
-- Adds a support_admin_actions audit table and admin fields to contact_submissions
-- Run in Supabase SQL editor or via your migration runner
-- ============================================================================

-- PART 1: EXTEND contact_submissions TABLE
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS assignee TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_reply_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS contact_submissions_reviewed_idx
  ON contact_submissions (reviewed)
  WHERE reviewed IS NOT NULL;

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx
  ON contact_submissions (status)
  WHERE status IS NOT NULL;

-- PART 2: CREATE support_admin_actions TABLE
CREATE TABLE IF NOT EXISTS support_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload JSONB,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_admin_actions_report_idx
  ON support_admin_actions (report_id);

CREATE INDEX IF NOT EXISTS support_admin_actions_created_idx
  ON support_admin_actions (created_at DESC);

-- PART 3: ENABLE ROW LEVEL SECURITY ON ADMIN ACTIONS
ALTER TABLE support_admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist to allow re-run
DROP POLICY IF EXISTS "Admins can view support admin actions" ON support_admin_actions;
DROP POLICY IF EXISTS "System can insert support admin actions" ON support_admin_actions;

-- Admins can view support admin actions
CREATE POLICY "Admins can view support admin actions" ON support_admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Allow system inserts (server-side) for logging
CREATE POLICY "System can insert support admin actions" ON support_admin_actions
  FOR INSERT WITH CHECK (true);

-- PART 4: OPTIONAL: Add default status constraint
ALTER TABLE contact_submissions
  ALTER COLUMN status SET DEFAULT 'open';

-- ==========================================================================
-- Installation complete. After running this script:
-- - Verify the new columns exist on contact_submissions
-- - Verify support_admin_actions table and indexes exist
-- - If using Supabase, confirm RLS policies are installed correctly
-- ==========================================================================
