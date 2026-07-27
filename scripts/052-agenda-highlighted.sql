-- 052: Add highlighted column to event_agenda_items

ALTER TABLE event_agenda_items
  ADD COLUMN IF NOT EXISTS highlighted BOOLEAN NOT NULL DEFAULT false;

-- Update the public view to include highlighted
-- (the select * already picks it up, no view changes needed)
