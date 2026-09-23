-- ============================================================================
-- Migration: 061 - About Page ("Who We Are") CMS Content
-- Description: Store the About page's Hero, Who We Are intro, What We Do,
--              and How We Do It section text as an editable site_settings row.
--              Team members and partner logos remain managed via their own
--              DB-backed tables (team_members, partners) — not covered here.
-- ============================================================================

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'about_page_content',
  '{
    "hero": {
      "badge": "✦ OUR TEAM & MISSION",
      "headlineLine1": "The People",
      "headlineLine2": "Behind Nepal''s Change.",
      "subtitle": "We are parents, educators, professionals, and advocates working for and with children with disabilities. With a special focus on autism, we are building a society where every child belongs.",
      "primaryCtaLabel": "Read Our Story",
      "primaryCtaUrl": "#journey",
      "secondaryCtaLabel": "View Annual Reports",
      "secondaryCtaUrl": "/impact#reports",
      "trustBadges": ["Govt Registered", "SWC Affiliated"]
    },
    "intro": {
      "sinceBadge": "✦ Since 2022",
      "label": "Who We Are",
      "headline": "Every child deserves to be understood, accepted, and valued just as they are.",
      "paragraphs": [
        "deessa Foundation is a non-profit working for and with children with disabilities, with a special focus on autism. Born from one family''s story, we''ve grown into a community of parents, educators, professionals, advocates, and changemakers who share one purpose: to build a society where every child belongs.",
        "We believe lasting inclusion begins with understanding. When children are understood, they are accepted. When they are accepted, they are valued. And when they are valued, they are given the chance to learn, grow, and thrive.",
        "Our vision is a Nepal where disability is never seen as a limit. Every child is known for their strengths, abilities, and potential. Being different is never seen as being less."
      ],
      "quote": "At deessa Foundation, we stand for a world where every child is seen, heard, and included.",
      "flowSteps": ["Understood", "Accepted", "Valued", "Thrive"]
    },
    "whatWeDo": {
      "cards": [
        { "id": "awareness", "icon": "Megaphone", "title": "Awareness & Community Engagement", "body": "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.", "iconBg": "#e0f2fe", "color": "#0284c7" },
        { "id": "training", "icon": "GraduationCap", "title": "Training", "body": "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.", "iconBg": "#fce7f3", "color": "#db2777" },
        { "id": "resources", "icon": "BookOpen", "title": "Resources", "body": "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.", "iconBg": "#fef3c7", "color": "#d97706" },
        { "id": "advocacy", "icon": "Scale", "title": "Advocacy", "body": "We push for inclusive schools and stronger policies that protect every child''s rights, so inclusion becomes a right, not a privilege.", "iconBg": "#dcfce7", "color": "#16a34a" }
      ]
    },
    "howWeDoIt": {
      "title": "Change doesn''t start with programmes. It starts with people.",
      "subtitle": "Every child, every family, and every community has a different journey. Our role is to walk alongside them, with understanding and hope.",
      "steps": [
        { "id": "listen", "title": "We Listen First", "body": "Every family''s journey is different. We listen to their needs, their challenges, and their hopes before we design any solution.", "color": "#29b6c8" },
        { "id": "train", "title": "We Train the People Who Show Up", "body": "Children thrive when the people around them know how to help. We train parents, teachers, health workers, and local leaders to build places where every child can succeed.", "color": "#d97706" },
        { "id": "partner", "title": "We Work Through Partnership", "body": "Inclusion takes a village. We bring together families, schools, health workers, and government to build one network of support for every child.", "color": "#db2777" },
        { "id": "build", "title": "We Build Change That Lasts", "body": "We focus on what outlasts us. By growing local leaders and shaping better policy, we help create change that improves children''s lives across Nepal.", "color": "#29b6c8" }
      ],
      "closingLine": "Because lasting inclusion isn''t built by one organization. It''s built by people, together, one step at a time."
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DELETE FROM site_settings WHERE key = 'about_page_content';
