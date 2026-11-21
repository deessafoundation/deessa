-- =============================================
-- ENTERPRISE NEWSLETTER & CAMPAIGN SYSTEM
-- Migration: 081-newsletter-system-production.sql
-- Date: November 10, 2026
-- =============================================
--
-- Features:
--   1. Enhances `newsletter_subscriptions` with names, delivery metrics, source tags,
--      status tracking ('active', 'unsubscribed', 'bounced'), and unique cryptographic tokens.
--   2. Adds `newsletter_campaigns` table for drafting, scheduling, broadcasting,
--      and public archive rendering.
--   3. Introduces safe, tamper-proof `SECURITY DEFINER` RPC functions for 1-click
--      token-based unsubscription and instant re-subscription.
--   4. Configures Row Level Security (RLS) for public archive and administrative management.
-- =============================================

-- ── 1. Enhance newsletter_subscriptions Table ────────────────────────────────

ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'footer' CHECK (source IN ('footer', 'homepage_popup', 'event_registration', 'donation', 'manual_admin', 'import')),
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_emailed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS emails_sent_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill tokens for any existing records that do not have one
UPDATE newsletter_subscriptions
SET unsubscribe_token = gen_random_uuid()
WHERE unsubscribe_token IS NULL;

-- Backfill status based on legacy is_active column
UPDATE newsletter_subscriptions
SET status = CASE WHEN is_active = FALSE THEN 'unsubscribed' ELSE 'active' END
WHERE status IS NULL;

-- Make token mandatory and unique
ALTER TABLE newsletter_subscriptions
  ALTER COLUMN unsubscribe_token SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscriptions_unsubscribe_token_key'
  ) THEN
    ALTER TABLE newsletter_subscriptions ADD CONSTRAINT newsletter_subscriptions_unsubscribe_token_key UNIQUE (unsubscribe_token);
  END IF;
END $$;

-- High-performance lookup indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subs_token ON newsletter_subscriptions(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subs_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subs_date ON newsletter_subscriptions(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subs_source ON newsletter_subscriptions(source);


-- ── 2. Create newsletter_campaigns Table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                                  -- Internal campaign label (e.g. 'November 2026 Community Bulletin')
  subject TEXT NOT NULL,                                -- Email subject line
  preview_text TEXT,                                    -- Email inbox preheader / teaser snippet
  content_html TEXT NOT NULL,                           -- Clean formatted email body
  status TEXT NOT NULL DEFAULT 'draft'                  -- 'draft', 'sending', 'sent', 'cancelled'
    CHECK (status IN ('draft', 'sending', 'sent', 'cancelled')),
  recipients_count INTEGER DEFAULT 0,                   -- Total intended subscribers
  success_count INTEGER DEFAULT 0,                      -- Successfully dispatched emails
  failure_count INTEGER DEFAULT 0,                      -- Bounced / failed dispatches
  is_public BOOLEAN DEFAULT TRUE,                       -- Whether visible in public /newsletter-archive
  sent_at TIMESTAMPTZ,                                  -- Timestamp of broadcast completion
  created_by TEXT,                                      -- Email/Name of admin author
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_public ON newsletter_campaigns(is_public) WHERE is_public = TRUE;


-- ── 3. Secure RPC Functions for 1-Click Unsubscribe & Resubscribe ─────────────

-- Safe token-based unsubscription without granting direct write access to anon users
CREATE OR REPLACE FUNCTION unsubscribe_newsletter_by_token(token_input UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record RECORD;
BEGIN
  SELECT id, email, status INTO sub_record
  FROM newsletter_subscriptions
  WHERE unsubscribe_token = token_input;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired unsubscribe link');
  END IF;

  UPDATE newsletter_subscriptions
  SET status = 'unsubscribed',
      is_active = FALSE,
      unsubscribed_at = NOW(),
      updated_at = NOW()
  WHERE id = sub_record.id;

  RETURN jsonb_build_object('success', true, 'email', sub_record.email);
END;
$$;

-- Safe undo / resubscribe function if clicked by mistake
CREATE OR REPLACE FUNCTION resubscribe_newsletter_by_token(token_input UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record RECORD;
BEGIN
  SELECT id, email INTO sub_record
  FROM newsletter_subscriptions
  WHERE unsubscribe_token = token_input;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired subscription link');
  END IF;

  UPDATE newsletter_subscriptions
  SET status = 'active',
      is_active = TRUE,
      unsubscribed_at = NULL,
      updated_at = NOW()
  WHERE id = sub_record.id;

  RETURN jsonb_build_object('success', true, 'email', sub_record.email);
END;
$$;


-- ── 4. Row Level Security Policies ──────────────────────────────────────────

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow anonymous token-based verification
DROP POLICY IF EXISTS "Public can verify token" ON newsletter_subscriptions;
CREATE POLICY "Public can verify token"
  ON newsletter_subscriptions FOR SELECT
  USING (true);

-- Ensure admins can manage all subscriptions (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Admins can manage subscriptions"
  ON newsletter_subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can view sent public campaigns in archive
DROP POLICY IF EXISTS "Public can view sent public campaigns" ON newsletter_campaigns;
CREATE POLICY "Public can view sent public campaigns"
  ON newsletter_campaigns FOR SELECT
  USING (status = 'sent' AND is_public = TRUE);

-- Authenticated admins can manage campaigns (draft, schedule, edit, dispatch)
DROP POLICY IF EXISTS "Admins can manage newsletter campaigns" ON newsletter_campaigns;
CREATE POLICY "Admins can manage newsletter campaigns"
  ON newsletter_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
