-- =============================================
-- PARTNERS SYSTEM DIAGNOSTICS
-- Check for orphaned or inconsistent data
-- =============================================

-- 1. Check for orphaned context_partners (partner_id doesn't exist in partners table)
SELECT 
  cp.id as context_partner_id,
  cp.context_type,
  cp.context_id,
  cp.partner_id,
  cp.category_key,
  'Orphaned: Partner does not exist' as issue
FROM context_partners cp
LEFT JOIN partners p ON cp.partner_id = p.id
WHERE p.id IS NULL;

-- 2. Check for context_partners with invalid categories
SELECT 
  cp.id as context_partner_id,
  cp.context_type,
  cp.context_id,
  cp.partner_id,
  cp.category_key,
  'Invalid: Category does not exist' as issue
FROM context_partners cp
LEFT JOIN partner_categories pc 
  ON cp.context_type = pc.context_type
  AND (
    (cp.context_id IS NULL AND pc.context_id IS NULL)
    OR (cp.context_id = pc.context_id)
  )
  AND cp.category_key = pc.category_key
WHERE pc.id IS NULL;

-- 3. Count partners by event
SELECT 
  e.id,
  e.title,
  COUNT(cp.id) as partner_count,
  COUNT(DISTINCT cp.category_key) as category_count
FROM events e
LEFT JOIN context_partners cp 
  ON cp.context_type = 'event' 
  AND cp.context_id = e.id
GROUP BY e.id, e.title
ORDER BY partner_count DESC;

-- 4. Check for duplicate partners in same event
SELECT 
  context_type,
  context_id,
  partner_id,
  COUNT(*) as duplicate_count
FROM context_partners
WHERE context_type = 'event'
GROUP BY context_type, context_id, partner_id
HAVING COUNT(*) > 1;

-- 5. Show context_partners_detailed for a specific event (replace event_id)
-- Uncomment and replace <event_id> with actual event ID:
-- SELECT * FROM context_partners_detailed 
-- WHERE context_type = 'event' 
-- AND context_id = '<event_id>';

