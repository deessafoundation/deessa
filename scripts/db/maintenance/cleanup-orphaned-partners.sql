-- =============================================
-- CLEANUP ORPHANED PARTNER RECORDS
-- Run this to remove invalid context_partners entries
-- =============================================

-- IMPORTANT: Review the diagnostic results first!
-- Run scripts/db/diagnostics/check-orphaned-partners.sql before running this.

-- Backup: Show what will be deleted (run this first!)
SELECT 
  cp.id,
  cp.context_type,
  cp.context_id,
  cp.partner_id,
  cp.category_key,
  cp.created_at
FROM context_partners cp
LEFT JOIN partners p ON cp.partner_id = p.id
WHERE p.id IS NULL;

-- STEP 1: Delete orphaned context_partners (partner doesn't exist)
-- Uncomment when ready:
/*
DELETE FROM context_partners
WHERE id IN (
  SELECT cp.id
  FROM context_partners cp
  LEFT JOIN partners p ON cp.partner_id = p.id
  WHERE p.id IS NULL
);
*/

-- STEP 2: Delete context_partners with invalid categories
-- Uncomment when ready:
/*
DELETE FROM context_partners
WHERE id IN (
  SELECT cp.id
  FROM context_partners cp
  LEFT JOIN partner_categories pc 
    ON cp.context_type = pc.context_type
    AND (
      (cp.context_id IS NULL AND pc.context_id IS NULL)
      OR (cp.context_id = pc.context_id)
    )
    AND cp.category_key = pc.category_key
  WHERE pc.id IS NULL
);
*/

-- STEP 3: Remove duplicate partners (keep oldest record)
-- Uncomment when ready:
/*
DELETE FROM context_partners
WHERE id IN (
  SELECT cp.id
  FROM context_partners cp
  INNER JOIN (
    SELECT 
      context_type,
      context_id,
      partner_id,
      MIN(id) as keep_id
    FROM context_partners
    WHERE context_type = 'event'
    GROUP BY context_type, context_id, partner_id
    HAVING COUNT(*) > 1
  ) dupes 
  ON cp.context_type = dupes.context_type
  AND cp.context_id = dupes.context_id
  AND cp.partner_id = dupes.partner_id
  AND cp.id != dupes.keep_id
);
*/

-- Verify cleanup
SELECT 'Remaining orphaned records:' as status, COUNT(*) as count
FROM context_partners cp
LEFT JOIN partners p ON cp.partner_id = p.id
WHERE p.id IS NULL;

