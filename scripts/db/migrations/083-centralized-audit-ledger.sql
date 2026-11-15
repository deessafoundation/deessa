-- ============================================================================
-- Migration 083: Centralized Enterprise Audit Ledger Upgrade
-- Converts activity_logs into a unified, immutable, high-performance audit ledger
-- ============================================================================

-- 1. Convert entity_id to TEXT to support UUIDs, Slugs, File Paths, and Settings Keys
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'activity_logs' 
      AND column_name = 'entity_id' 
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.activity_logs ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;
  END IF;
END $$;

-- 2. Add Actor Snapshot Columns
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS actor_email TEXT,
  ADD COLUMN IF NOT EXISTS actor_role TEXT;

-- 3. Add Operational Context Columns
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS diff JSONB,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCESS',
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS request_id TEXT;

-- 4. Status Check Constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_activity_logs_status'
  ) THEN
    ALTER TABLE public.activity_logs 
      ADD CONSTRAINT check_activity_logs_status 
      CHECK (status IN ('SUCCESS', 'FAILURE', 'WARNING'));
  END IF;
END $$;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_domain_created 
  ON public.activity_logs (domain, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_composite 
  ON public.activity_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_email 
  ON public.activity_logs (actor_email);

CREATE INDEX IF NOT EXISTS idx_activity_logs_status 
  ON public.activity_logs (status);

-- 6. Immutability & Anti-Tampering Trigger
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries are immutable and cannot be modified, deleted, or truncated.'
    USING ERRCODE = '42501';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_activity_logs ON public.activity_logs;

CREATE TRIGGER trg_protect_activity_logs
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.activity_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.prevent_audit_log_tampering();
