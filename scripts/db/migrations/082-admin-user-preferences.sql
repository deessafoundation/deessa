-- =========================================================================
-- Migration 082: Admin User Preferences, Designation & Extended Profile Fields
-- =========================================================================

-- 1. Add non-breaking columns with sensible defaults
ALTER TABLE admin_users 
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "defaultLandingPage": "/admin",
    "ledgerDefaultView": "timeline",
    "density": "comfortable",
    "soundEnabled": false
  }'::jsonb;

-- 2. Document schema columns for team clarity
COMMENT ON COLUMN admin_users.designation IS 'Functional title or departmental role of the administrator (e.g. Lead Systems Architect, Senior Treasury Auditor)';
COMMENT ON COLUMN admin_users.phone IS 'Emergency contact phone number for security escalations';
COMMENT ON COLUMN admin_users.password_changed_at IS 'Timestamp of the last successful credential change for security hygiene tracking';
COMMENT ON COLUMN admin_users.preferences IS 'Operator UI and personal workflow preferences (JSONB)';
