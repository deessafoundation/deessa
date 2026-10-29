-- =============================================
-- SEED DEFAULT PARTNER CATEGORIES
-- Migration: 071-seed-default-categories.sql
-- Date: October 28, 2026
-- =============================================
--
-- Seeds default 5-category structure for:
--   1. Homepage (global context)
--   2. Events (template categories that can be copied per event)
--
-- Categories seeded:
--   - organizers (Organizing Partners)
--   - in_collaboration (In Collaboration With)
--   - knowledge_partner (Knowledge Partners)
--   - technical_partner (Technical Partners)
--   - co_organizers (Co-organizers)
--
-- Note: These are TEMPLATES for events. Each event will get its own
-- configurable categories (created via admin panel or copied from these defaults).
-- =============================================


-- =============================================
-- 1. HOMEPAGE DEFAULT CATEGORIES
-- =============================================
-- Global partner categories for the homepage.
-- context_id = NULL for homepage (global context).

INSERT INTO partner_categories (context_type, context_id, category_key, category_label, display_order)
VALUES
  ('homepage', NULL, 'organizers', 'Organizing Partners', 0),
  ('homepage', NULL, 'in_collaboration', 'In Collaboration With', 1),
  ('homepage', NULL, 'knowledge_partner', 'Knowledge Partners', 2),
  ('homepage', NULL, 'technical_partner', 'Technical Partners', 3),
  ('homepage', NULL, 'co_organizers', 'Co-organizers', 4)
ON CONFLICT DO NOTHING;


-- =============================================
-- 2. EVENT TEMPLATE CATEGORIES (Optional)
-- =============================================
-- These are NOT real event categories (no context_id specified).
-- They serve as documentation/examples for admins creating new events.
-- 
-- When an admin creates a new event, the admin panel can offer to:
--   "Copy default categories" → creates these 5 categories for that specific event_id
--
-- For now, we'll document the recommended structure in comments.
-- The actual seeding happens when admin creates an event.

-- Recommended event category structure (to be created per event via admin panel):
--
-- INSERT INTO partner_categories (context_type, context_id, category_key, category_label, display_order)
-- VALUES
--   ('event', '<event_id>', 'organizers', 'Organizing Partners', 0),
--   ('event', '<event_id>', 'in_collaboration', 'In Collaboration With', 1),
--   ('event', '<event_id>', 'knowledge_partner', 'Knowledge Partners', 2),
--   ('event', '<event_id>', 'technical_partner', 'Technical Partners', 3),
--   ('event', '<event_id>', 'co_organizers', 'Co-organizers', 4);


-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Summary:
--   - Homepage default categories seeded (5 categories)
--   - Event template structure documented (created per event via admin)
--
-- Next steps:
--   1. Run 072-partner-logos-storage.sql to create storage bucket
--   2. Admin panel will use these defaults when creating new events
--   3. Admin can customize categories per event as needed
-- =============================================
