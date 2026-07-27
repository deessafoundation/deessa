-- ============================================================================
-- Migration: 039 - Homepage CMS Story & What We Do Keys
-- Description: Add 2 new CMS keys for the "Our Story" and "What We Do" homepage sections
-- Dependencies: 037-homepage-cms-schema.sql, 038-homepage-cms-additional-keys.sql
-- ============================================================================

-- 1. Homepage Story ("How deessa Started")
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'homepage_story',
  '{
    "eyebrow": "Our Story",
    "badgeText": "How deessa Started",
    "paragraphs": [
      "deessa began with two little girls — our twin daughters, Deetya and Marissa. Deetya was born with bilateral clubfoot and has gone through years of treatment and physiotherapy. Marissa was later diagnosed with autism. Their journeys, so different yet intertwined, showed us the invisible walls that children with disabilities and their families face every day.",
      "From that personal experience came a mission: to ensure every child in Nepal has access to the support, resources, and opportunity they deserve. The name deessa carries their story — \"Dee\" from Deetya, \"essa\" from Marissa."
    ],
    "linkText": "Read Our Full Story",
    "linkUrl": "/our-story",
    "founded": "2015",
    "foundedLabel": "Founded",
    "image": "/ourStory.png",
    "imageAlt": "How deessa started - our origin story"
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 2. Homepage What We Do / Core Pillars
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'homepage_what_we_do',
  '{
    "eyebrow": "What We Do",
    "title": "We turn understanding into action — for children, families, and communities.",
    "subtitle": "Our work supports children with disabilities, their families, educators, and communities through four areas.",
    "pillars": [
      {
        "id": "awareness",
        "icon": "Megaphone",
        "title": "Awareness & Community Engagement",
        "description": "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.",
        "color": "bg-blue-500",
        "glowClass": "hover-glow-blue",
        "statLabel": "Communities",
        "statEnd": 50,
        "order": 1,
        "visible": true
      },
      {
        "id": "training",
        "icon": "BookOpen",
        "title": "Training",
        "description": "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.",
        "color": "bg-green-500",
        "glowClass": "hover-glow-green",
        "statLabel": "Trained",
        "statEnd": 200,
        "order": 2,
        "visible": true
      },
      {
        "id": "resources",
        "icon": "FileText",
        "title": "Resources",
        "description": "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.",
        "color": "bg-orange-500",
        "glowClass": "hover-glow-orange",
        "statLabel": "Resources",
        "statEnd": 1000,
        "order": 3,
        "visible": true
      },
      {
        "id": "advocacy",
        "icon": "Scale",
        "title": "Advocacy",
        "description": "We push for inclusive schools and stronger policies that protect every child''s rights — so inclusion becomes a right, not a privilege.",
        "color": "bg-purple-500",
        "glowClass": "hover-glow-purple",
        "statLabel": "Policies",
        "statEnd": 5000,
        "order": 4,
        "visible": true
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- SELECT key FROM site_settings WHERE key IN ('homepage_story', 'homepage_what_we_do');

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DELETE FROM site_settings WHERE key IN ('homepage_story', 'homepage_what_we_do');
