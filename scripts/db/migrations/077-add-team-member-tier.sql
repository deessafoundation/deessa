-- ============================================================================
-- Migration: 077 - Add Organizational Tier and Hero Featured Flag to Team Members
-- Description: Adds a tier column to team_members to categorize members into
--              the 6 organizational groups (vision, board, advisory, assembly,
--              working, technical), and an is_featured column to directly toggle
--              inclusion in the Who We Are Hero portrait collage (up to 3 members).
-- ============================================================================

DO $$
BEGIN
  -- 1. Add tier column with check constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'tier'
  ) THEN
    ALTER TABLE team_members
    ADD COLUMN tier TEXT NOT NULL DEFAULT 'vision'
    CHECK (tier IN ('vision', 'board', 'advisory', 'assembly', 'working', 'technical'));

    COMMENT ON COLUMN team_members.tier IS
      'Organizational tier: vision (Founding Vision), board (Governing Board), advisory (Advisory Circle), assembly (General Assembly), working (Working Team), technical (Technical Team)';
  END IF;

  -- 2. Add is_featured column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE team_members
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

    COMMENT ON COLUMN team_members.is_featured IS
      'Whether this member is featured in the Who We Are Hero portrait collage (up to 3 members).';

    -- Initialize the top 3 published members as featured by default
    UPDATE team_members
    SET is_featured = true
    WHERE id IN (
      SELECT id FROM team_members
      WHERE is_published = true
      ORDER BY sort_order ASC
      LIMIT 3
    );
  END IF;

  -- 3. Create indexes for tier and is_featured
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'team_members' AND indexname = 'idx_team_members_tier'
  ) THEN
    CREATE INDEX idx_team_members_tier ON team_members (tier);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'team_members' AND indexname = 'idx_team_members_featured'
  ) THEN
    CREATE INDEX idx_team_members_featured ON team_members (is_featured);
  END IF;
END $$;
