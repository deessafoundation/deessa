-- ============================================================================
-- Migration: 063 - About Page Journey CMS Content
-- Description: Adds the editable Journey section to the existing About-page
--              settings record without replacing its other content.
-- ============================================================================

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'about_page_content',
  jsonb_build_object(
    'journey',
    '{
      "label": "Our Journey",
      "title": "Milestones that define our path.",
      "subtitle": "A growing movement for a Nepal where neurodiversity is understood, celebrated, and supported.",
      "milestones": [
        {
          "id": "foundation-begins",
          "year": "2022",
          "title": "deessa Foundation begins",
          "description": "deessa began with a commitment to help every child be understood, accepted, and valued."
        },
        {
          "id": "building-understanding",
          "year": "2023",
          "title": "Building understanding",
          "description": "We brought autism and neurodiversity into conversations with families, educators, and communities."
        },
        {
          "id": "belonging-through-participation",
          "year": "2025",
          "title": "Belonging through participation",
          "description": "Sport and youth-centred activities celebrated confidence, teamwork, and the belief that every child belongs."
        },
        {
          "id": "advocacy-for-inclusion",
          "year": "2026",
          "title": "Advocacy for inclusive support",
          "description": "We called for accessible services, inclusive education, and disability-inclusive support during crises."
        }
      ]
    }'::jsonb
  ),
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = COALESCE(site_settings.value, '{}'::jsonb) || EXCLUDED.value,
  updated_at = NOW();
