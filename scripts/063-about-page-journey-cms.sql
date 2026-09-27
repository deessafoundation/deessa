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
          "description": "deessa began with a commitment to help every child be understood, accepted, and valued.",
          "image": "/about/journey/2022-foundation-begins.jpg",
          "imageAlt": "deessa Foundation story graphic about the experiences that led to the foundation",
          "sourceUrl": "https://www.facebook.com/photo.php?fbid=920685784073967&set=pb.100083976611660.-2207520000&type=3"
        },
        {
          "id": "building-understanding",
          "year": "2024",
          "title": "Building understanding",
          "description": "We brought autism and neurodiversity into conversations with families, educators, and communities.",
          "image": "/about/journey/2024-building-understanding.jpg",
          "imageAlt": "deessa Foundation speaker sharing an inclusion message at a community event",
          "sourceUrl": "https://www.facebook.com/photo.php?fbid=438651608944056&set=pb.100083976611660.-2207520000&type=3"
        },
        {
          "id": "belonging-through-participation",
          "year": "2025",
          "title": "Belonging through participation",
          "description": "Sport and youth-centred activities celebrated confidence, teamwork, and the belief that every child belongs.",
          "image": "/about/journey/2025-belonging-participation.jpg",
          "imageAlt": "Girls celebrating together with a trophy at an inter-school football tournament",
          "sourceUrl": "https://www.facebook.com/photo.php?fbid=831062599702953&set=pb.100083976611660.-2207520000&type=3"
        },
        {
          "id": "advocacy-for-inclusion",
          "year": "2026",
          "title": "Advocacy for inclusive support",
          "description": "We called for accessible services, inclusive education, and disability-inclusive support during crises.",
          "image": "/about/journey/2026-inclusive-advocacy.jpg",
          "imageAlt": "Policy graphic outlining targeted programs for autistic and neurodivergent children",
          "sourceUrl": "https://www.facebook.com/photo.php?fbid=952035330939012&set=pb.100083976611660.-2207520000&type=3"
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
