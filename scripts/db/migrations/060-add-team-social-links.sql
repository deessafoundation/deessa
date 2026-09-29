-- Migration 060: Add social_links JSONB column to team_members
-- Stores social media URLs as a JSON object

ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT NULL;

COMMENT ON COLUMN team_members.social_links IS 'Social media URLs: { facebook, twitter, linkedin, instagram, tiktok, whatsapp }';
