-- 054: Add 'custom' template type + label column to event_email_templates
-- Allows multiple named custom templates per event

-- 1. Add label column (nullable, used only for custom templates)
ALTER TABLE event_email_templates
  ADD COLUMN IF NOT EXISTS label TEXT;

-- 2. Update CHECK constraint to include 'custom'
ALTER TABLE event_email_templates
  DROP CONSTRAINT IF EXISTS event_email_templates_template_type_check,
  ADD CONSTRAINT event_email_templates_template_type_check
    CHECK (template_type IN ('confirmation', 'payment_receipt', 'reminder', 'cancellation', 'custom'));

-- 3. Drop the old unique constraint (event_id, template_type)
--    which prevented multiple custom templates
ALTER TABLE event_email_templates
  DROP CONSTRAINT IF EXISTS uq_event_email_template;

-- 4. Add partial unique index: enforce one template per type for standard types,
--    but allow unlimited custom templates
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_standard_template
  ON event_email_templates (event_id, template_type)
  WHERE template_type != 'custom';
