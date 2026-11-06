-- =============================================
-- CENTRALIZED PAGE SEO & SOCIAL SHARING SYSTEM
-- Migration: 080-page-seo-schema.sql
-- Date: November 6, 2026
-- =============================================
--
-- Features:
--   1. Creates `page_seo` table for site-wide metadata, Google SERP & OpenGraph management.
--   2. Enables Row Level Security (RLS) with public read and authenticated admin manage policies.
--   3. Pre-seeds metadata for all 12 public pages focused on autism support and neurodiversity inclusion.
-- =============================================

CREATE TABLE IF NOT EXISTS page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT UNIQUE NOT NULL,                          -- e.g. '/', '/about', '/whatwedo', '/donate'
  page_name TEXT NOT NULL,                            -- Human-readable label: e.g. 'What We Do'
  category TEXT NOT NULL DEFAULT 'core'               -- 'core', 'programs', 'engagement', 'media'
    CHECK (category IN ('core', 'programs', 'engagement', 'media')),
  title TEXT NOT NULL,                                -- Google SERP Title (target: 50-60 chars)
  description TEXT NOT NULL,                          -- Google SERP & Social Snippet (target: 140-160 chars)
  keywords TEXT[] DEFAULT '{}',                       -- Keyword tags
  og_image TEXT,                                      -- 1200x630 social share banner image URL
  og_image_alt TEXT,                                  -- Screen reader accessibility alt text
  canonical_url TEXT,                                 -- Optional custom canonical override
  no_index BOOLEAN DEFAULT FALSE,                     -- true = "noindex, nofollow"
  is_published BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast indexed lookup on path
CREATE INDEX IF NOT EXISTS idx_page_seo_path ON page_seo(path);

-- Enable Row Level Security
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;

-- Public can view published SEO metadata
CREATE POLICY "Public can view published page SEO"
  ON page_seo FOR SELECT
  USING (is_published = TRUE);

-- Authenticated admins can view, insert, update, and manage page SEO
CREATE POLICY "Admins can manage page SEO"
  ON page_seo FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- SEED ALL 12 CORE PUBLIC PAGES
-- =============================================

INSERT INTO page_seo (path, page_name, category, title, description, keywords, og_image, og_image_alt)
VALUES
  (
    '/',
    'Homepage',
    'core',
    'deessa Foundation - Empowering Autistic Children & Families in Nepal',
    'A non-profit organization dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and their families across Nepal.',
    ARRAY['Nepal NGO', 'autism Nepal', 'autism support Nepal', 'autistic children Nepal', 'neurodiversity Nepal', 'inclusive education', 'special education Nepal', 'disability rights Nepal', 'deessa Foundation'],
    '/home/hero/art_banner.jpeg',
    'Children collaborating in an inclusive learning environment at deessa Foundation'
  ),
  (
    '/about',
    'Who We Are',
    'core',
    'Who We Are - Our Mission for Neurodiversity in Nepal | deessa Foundation',
    'Learn about deessa Foundation, our origins from twin sisters Deetya and Marissa, our mission for autism inclusion, and our vision for an accessible Nepal.',
    ARRAY['about deessa', 'autism charity Nepal', 'neurodiversity mission', 'Deetya and Marissa', 'disability advocacy Nepal', 'inclusive schools'],
    '/home/story/two-paths-one-purpose.png',
    'Illustration of two sisters following paths toward a welcoming school in Nepal'
  ),
  (
    '/whatwedo',
    'What We Do',
    'programs',
    'What We Do - 4 Pillars of Autism Inclusion | deessa Foundation',
    'We turn understanding into action through four core pillars: Awareness & Community Engagement, Professional Training, Accessible Resources, and Policy Advocacy.',
    ARRAY['autism awareness Nepal', 'teacher training autism', 'accessible autism resources', 'inclusive policy advocacy', 'special needs support Nepal'],
    '/home/hero/inclusion-begins-at-home.jpg',
    'Parent and child engaging in interactive developmental learning'
  ),
  (
    '/donate',
    'Support Our Mission',
    'engagement',
    'Donate - Support Autistic Children & Families in Nepal | deessa Foundation',
    'Every donation provides autism therapies, accessible learning tools, teacher workshops, and direct family support across communities in Nepal.',
    ARRAY['donate Nepal', 'autism donation Nepal', 'support autistic children', 'inclusive education donation', 'NGO charity Nepal'],
    '/home/hero/art_banner.jpeg',
    'Children holding colorful creative artwork'
  ),
  (
    '/arts',
    'Art & Expression Gallery',
    'media',
    'Art & Expression Gallery - Neurodivergent Voices | deessa Foundation',
    'Discover creative artworks and paintings made by children with autism and developmental disabilities in the deessa community, celebrating unique expression.',
    ARRAY['autism art gallery', 'neurodivergent art', 'children artwork Nepal', 'creative therapy', 'deessa art gallery'],
    '/artWork/art_pic2.jpeg',
    'Gallery wall of expressive paintings by children with autism'
  ),
  (
    '/podcasts',
    'Living With Autism Podcast',
    'media',
    'Living With Autism Podcast - Real Stories & Voices | deessa Foundation',
    'Honest conversations about autism diagnosis, parenting journeys, inclusive education, and neurodiversity in Nepal, hosted by Sarita & Merina.',
    ARRAY['autism podcast Nepal', 'Living with Autism', 'neurodiversity podcast', 'autism parenting stories', 'Sarita and Merina podcast'],
    '/podcast_banner.jpeg',
    'Living With Autism podcast official studio banner'
  ),
  (
    '/stories',
    'Stories of Change',
    'media',
    'Stories of Change - Voices of Resilience & Hope | deessa Foundation',
    'Real stories from children, parents, and educators navigating autism, breaking barriers, and shaping inclusive communities across Nepal.',
    ARRAY['autism stories Nepal', 'lived experience autism', 'inclusion success stories', 'neurodiversity voices'],
    '/home/hero/inclusion-begins-at-home.jpg',
    'Parent leader speaking at a community inclusion session'
  ),
  (
    '/events',
    'Events & Workshops',
    'engagement',
    'Events & Workshops - Community Gatherings | deessa Foundation',
    'Join our upcoming autism awareness workshops, sensory-friendly family events, teacher training seminars, and inclusion conferences across Nepal.',
    ARRAY['autism workshops Nepal', 'teacher training events', 'inclusion conference Nepal', 'sensory friendly events'],
    '/home/hero/girls-leadership-football.jpg',
    'Youth participating together in an outdoor community sports activity'
  ),
  (
    '/contact',
    'Contact Us',
    'core',
    'Contact Us - Reach deessa Foundation in Kathmandu, Nepal',
    'Connect with our team for family guidance, school partnership inquiries, volunteer opportunities, or visits to our Kathmandu office.',
    ARRAY['contact deessa', 'autism helpline Nepal', 'Kathmandu NGO office', 'deessa foundation phone', 'partner with deessa'],
    '/public/logo.png',
    'Official deessa Foundation emblem'
  ),
  (
    '/impact',
    'Impact & Results',
    'core',
    'Measuring What Matters - Our Field Impact | deessa Foundation',
    'Explore measurable change across Nepal: children supported, educators trained, community awareness reach, and resources distributed.',
    ARRAY['deessa impact', 'autism metrics Nepal', 'NGO transparency Nepal', 'children supported autism'],
    '/home/hero/art_banner.jpeg',
    'Impact metric infographic highlighting community support'
  ),
  (
    '/community',
    'Community Feed',
    'engagement',
    'Community Live Feed - Social Updates & News | deessa Foundation',
    'Follow our real-time social feed featuring classroom moments, awareness campaigns, parent meetups, and grassroots community updates.',
    ARRAY['deessa community feed', 'autism facebook updates', 'community activities Nepal'],
    '/home/hero/inclusion-begins-at-home.jpg',
    'Community gathering of families and supporters'
  ),
  (
    '/our-story',
    'Our Origin Story',
    'core',
    'Our Origin Story - The Journey of Deetya & Marissa | deessa Foundation',
    'How two twin sisters born with clubfoot and autism inspired a nationwide movement for disability inclusion and acceptance in Nepal.',
    ARRAY['deessa origin story', 'Deetya and Marissa', 'twin sisters story', 'clubfoot autism Nepal'],
    '/home/story/two-paths-one-purpose.png',
    'Two sisters walking hand in hand toward a welcoming classroom'
  )
ON CONFLICT (path) DO NOTHING;
