-- ============================================================================
-- Migration: 038 - Homepage CMS Additional Keys
-- Description: Add 3 new CMS keys for Hero Carousel, Testimonials, and Timeline
-- Author: Kiro AI
-- Date: 2026-05-31
-- Dependencies: 037-homepage-cms-schema.sql
-- ============================================================================

-- This migration adds the remaining homepage CMS keys that were implemented
-- after the initial 11 keys in migration 037.

-- ============================================================================
-- INSERT NEW CMS KEYS
-- ============================================================================

-- 1. Homepage Hero Carousel
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'homepage_hero_carousel',
  '{
    "slides": [
      {
        "id": "slide-1",
        "image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=85",
        "title": "Hope for Every Child in Nepal",
        "subtitle": "A society where everyone is understood, celebrated, and empowered. Join us in creating lasting change for children with autism and their families.",
        "cta": "Start Donating",
        "ctaHref": "/donate",
        "ctaVariant": "primary",
        "order": 1,
        "visible": true
      },
      {
        "id": "slide-2",
        "image": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1920&q=85",
        "title": "Empowering 10,000+ Lives and Counting",
        "subtitle": "From classrooms to clinics, your support reaches the communities that need it most. Together, we build a more inclusive Nepal.",
        "cta": "See Our Impact",
        "ctaHref": "/impact",
        "ctaVariant": "primary",
        "order": 2,
        "visible": true
      },
      {
        "id": "slide-3",
        "image": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1920&q=85",
        "title": "Volunteer With Us - Stand With Nepal",
        "subtitle": "Join our community of changemakers and see your effort transform villages firsthand. Your skills can change lives.",
        "cta": "Get Involved",
        "ctaHref": "/get-involved",
        "ctaVariant": "primary",
        "order": 3,
        "visible": true
      }
    ],
    "interval": 6000,
    "autoPlay": true
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 2. Homepage Testimonials
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'homepage_testimonials',
  '{
    "testimonials": [
      {
        "id": "testimonial-1",
        "name": "Sita Sharma",
        "role": "Parent",
        "location": "Kathmandu",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        "quote": "deessa Foundation changed my daughter''s life. She now attends school regularly and dreams of becoming a teacher. The scholarship program gave us hope when we had none.",
        "rating": 5,
        "order": 1,
        "visible": true,
        "featured": true
      },
      {
        "id": "testimonial-2",
        "name": "Ram Bahadur Thapa",
        "role": "Village Elder",
        "location": "Gorkha",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        "quote": "The health camp organized by deessa brought medical care to our remote village for the first time in years. Over 200 families received treatment. We are forever grateful.",
        "rating": 5,
        "order": 2,
        "visible": true,
        "featured": true
      },
      {
        "id": "testimonial-3",
        "name": "Maya Gurung",
        "role": "Volunteer",
        "location": "Pokhara",
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
        "quote": "Volunteering with deessa has been the most rewarding experience of my life. Seeing the smiles on children''s faces when they receive books and supplies is priceless.",
        "rating": 5,
        "order": 3,
        "visible": true,
        "featured": true
      }
    ]
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. Homepage Timeline
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'homepage_timeline',
  '{
    "title": "Together, We Are Changing Lives",
    "subtitle": "Every year added a new layer of impact. From local beginnings to national outreach, these milestones trace how hope turned into measurable change.",
    "milestones": [
      {
        "id": "milestone-1",
        "year": "2022",
        "milestone": "Founded in Kathmandu",
        "description": "deessa Foundation began with a simple commitment: serve communities that are often left behind.",
        "icon": "MapPin",
        "badgeClass": "from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-primary-dark))]",
        "yearClass": "bg-[rgb(var(--brand-primary))]",
        "order": 1,
        "visible": true
      },
      {
        "id": "milestone-2",
        "year": "2016",
        "milestone": "First education program",
        "description": "Our scholarship initiative opened classroom doors for 200+ students with limited access to learning.",
        "icon": "GraduationCap",
        "badgeClass": "from-[rgb(var(--accent-education))] to-amber-500",
        "yearClass": "bg-[rgb(var(--accent-education))]",
        "order": 2,
        "visible": true
      },
      {
        "id": "milestone-3",
        "year": "2018",
        "milestone": "Health camps expanded",
        "description": "Medical outreach scaled to 50+ remote villages, bringing care closer to families who needed it most.",
        "icon": "Stethoscope",
        "badgeClass": "from-[rgb(var(--accent-empowerment))] to-pink-500",
        "yearClass": "bg-[rgb(var(--accent-empowerment))]",
        "order": 3,
        "visible": true
      },
      {
        "id": "milestone-4",
        "year": "2020",
        "milestone": "COVID-19 relief",
        "description": "Emergency food, hygiene kits, and support reached 5,000+ families during Nepal''s most urgent months.",
        "icon": "Heart",
        "badgeClass": "from-[rgb(var(--accent-environment))] to-lime-500",
        "yearClass": "bg-[rgb(var(--accent-environment))]",
        "order": 4,
        "visible": true
      },
      {
        "id": "milestone-5",
        "year": "2022",
        "milestone": "10,000 lives impacted",
        "description": "A decade of trust, partnerships, and consistent fieldwork transformed lives across communities.",
        "icon": "Globe",
        "badgeClass": "from-[#6F3E96] to-[#6F3E96]",
        "yearClass": "bg-[#6F3E96]",
        "order": 5,
        "visible": true
      },
      {
        "id": "milestone-6",
        "year": "2024",
        "milestone": "New horizons",
        "description": "We are now expanding into art, podcasting, and digital literacy to shape future-ready communities.",
        "icon": "BookOpen",
        "badgeClass": "from-[#F7C52B] to-[#F7C52B]",
        "yearClass": "bg-[#F7C52B]",
        "order": 6,
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

-- Run this to verify all 14 homepage CMS keys exist:
-- SELECT key FROM site_settings WHERE key LIKE 'homepage%' OR key = 'home_hero_settings' ORDER BY key;

-- Expected keys:
-- 1. home_hero_settings (from earlier migration)
-- 2. homepage_banners
-- 3. homepage_cta_cards
-- 4. homepage_featured_stories_rules
-- 5. homepage_flags
-- 6. homepage_hero_carousel (NEW)
-- 7. homepage_hero_ctas
-- 8. homepage_marquee_settings
-- 9. homepage_programs
-- 10. homepage_seo
-- 11. homepage_stats
-- 12. homepage_testimonials (NEW)
-- 13. homepage_timeline (NEW)
-- 14. homepage_trust_indicators

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To remove these keys:
-- DELETE FROM site_settings WHERE key IN (
--   'homepage_hero_carousel',
--   'homepage_testimonials',
--   'homepage_timeline'
-- );
