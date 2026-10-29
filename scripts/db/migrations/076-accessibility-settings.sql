-- =============================================
-- ACCESSIBILITY SETTINGS MANAGEMENT
-- Migration: 076-accessibility-settings.sql
-- Date: October 29, 2026
-- =============================================
--
-- Features:
--   Seeds the default accessibility_settings configuration in site_settings.
--   Allows administrators to toggle the floating widget button and individual features:
--   - Text-to-Speech (TTS)
--   - Font style, text scaling, spacing
--   - Contrast modes, sensory-friendly, reduce motion
--   - Reading guide (read line), dictionary, big cursor
--   - Button placement
-- =============================================

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'accessibility_settings',
  '{
    "enabled": true,
    "features": {
      "textToSpeech": true,
      "fontStyle": true,
      "textScaling": true,
      "spacingControls": true,
      "contrastMode": true,
      "sensoryFriendly": true,
      "reduceMotion": true,
      "readingGuide": true,
      "readingDictionary": true,
      "bigCursor": true,
      "widgetPosition": true
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO NOTHING;
