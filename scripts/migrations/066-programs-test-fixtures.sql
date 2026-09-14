-- Programs CMS Test Fixtures (Migration 066)
-- Minimal test data for all 4 categories.
-- All programs are created as drafts (status='draft').
-- Do NOT run this in production.

-- Helper: create a program with a draft in one transaction
do $$
declare
  v_program_id uuid;
  v_user_id uuid;
begin
  -- Use the first admin user, or null if none exists
  select user_id into v_user_id from public.admin_users where is_active = true limit 1;

  -- =============================================
  -- SERVICE FIXTURE
  -- =============================================
  insert into public.programs (id, slug, title, category, theme, eyebrow, short_description, tags, status, created_by, updated_by)
  values (
    gen_random_uuid(),
    'test-aac-support',
    'AAC Support Services',
    'service',
    'warm',
    'SERVICES & PROGRAMS',
    'Comprehensive communication support for children and families across Nepal.',
    array['communication', 'aac', 'families', 'support'],
    'draft',
    v_user_id,
    v_user_id
  ) returning id into v_program_id;

  insert into public.program_drafts (program_id, hero, sections, revision, updated_by)
  values (
    v_program_id,
    '{
      "title": "Every little expression matters.",
      "description": "Communication support that meets families where they are.",
      "image": "",
      "imageAlt": "AAC support services",
      "layout": "full_bleed"
    }'::jsonb,
    '[
      {
        "id": "facts-bar-auto",
        "heading": "",
        "enabled": true,
        "content": {
          "type": "facts_bar",
          "facts": [
            {"value": "500+", "label": "families supported"},
            {"value": "12", "label": "districts reached"},
            {"value": "98%", "label": "satisfaction rate"}
          ]
        }
      },
      {
        "id": "features-auto",
        "heading": "What we offer",
        "enabled": true,
        "content": {
          "type": "features",
          "layout": "grid",
          "features": [
            {"title": "AAC assessments", "description": "Professional evaluation of communication needs.", "icon": "🔍"},
            {"title": "Device training", "description": "Hands-on support with communication devices.", "icon": "📱"},
            {"title": "Family coaching", "description": "Ongoing guidance for families at home.", "icon": "👨‍👩‍👧"}
          ]
        }
      }
    ]'::jsonb,
    1,
    v_user_id
  );

  raise notice 'Created service fixture: test-aac-support (id: %)', v_program_id;

  -- =============================================
  -- OUTREACH FIXTURE
  -- =============================================
  insert into public.programs (id, slug, title, category, theme, eyebrow, short_description, tags, status, created_by, updated_by)
  values (
    gen_random_uuid(),
    'test-community-outreach',
    'Community Outreach Journey',
    'outreach',
    'energetic',
    'COMMUNITY & OUTREACH / FIELD JOURNAL 01',
    'A community learning journey across the Kathmandu Valley.',
    array['community', 'outreach', 'field-journal'],
    'draft',
    v_user_id,
    v_user_id
  ) returning id into v_program_id;

  insert into public.program_drafts (program_id, hero, sections, revision, updated_by)
  values (
    v_program_id,
    '{
      "title": "Good things happen together.",
      "description": "A community learning journey. Three places. Many perspectives.",
      "image": "",
      "imageAlt": "Community outreach",
      "layout": "full_bleed"
    }'::jsonb,
    '[
      {
        "id": "stats-ribbon-auto",
        "heading": "",
        "enabled": true,
        "content": {
          "type": "stats",
          "stats": [
            {"value": "140", "label": "people connected"},
            {"value": "3", "label": "communities"},
            {"value": "12h", "label": "shared conversation"}
          ]
        }
      },
      {
        "id": "activities-postcards-auto",
        "heading": "Different places. Shared hopes.",
        "enabled": true,
        "content": {
          "type": "activities",
          "activities": [
            {"place": "Lalitpur", "date": "12 April", "title": "A space to listen", "description": "Parents and educators shared everyday experiences.", "count": "45 participants"},
            {"place": "Bhaktapur", "date": "19 April", "title": "Learning by doing", "description": "A hands-on afternoon making visual schedules.", "count": "38 participants"}
          ]
        }
      }
    ]'::jsonb,
    1,
    v_user_id
  );

  raise notice 'Created outreach fixture: test-community-outreach (id: %)', v_program_id;

  -- =============================================
  -- RESEARCH FIXTURE
  -- =============================================
  insert into public.programs (id, slug, title, category, theme, eyebrow, short_description, tags, status, created_by, updated_by)
  values (
    gen_random_uuid(),
    'test-deessa-companion',
    'Deessa Companion',
    'research',
    'editorial',
    'RESEARCH & INNOVATION',
    'An exploration of simple digital tools that support communication, routines and everyday independence.',
    array['research', 'aac', 'digital-tools', 'accessibility'],
    'draft',
    v_user_id,
    v_user_id
  ) returning id into v_program_id;

  insert into public.program_drafts (program_id, hero, sections, revision, updated_by)
  values (
    v_program_id,
    '{
      "title": "Designed for the everyday.",
      "description": "Built around you.",
      "image": "",
      "imageAlt": "Deessa Companion concept",
      "layout": "full_bleed"
    }'::jsonb,
    '[
      {
        "id": "how_it_works-approach-auto",
        "heading": "An idea shaped by listening.",
        "enabled": true,
        "content": {
          "type": "how_it_works",
          "items": [
            {"title": "Start with everyday life", "description": "Conversations with families reveal where a tool could help."},
            {"title": "Build something small", "description": "Co-design simple boards and routines."},
            {"title": "Test, reflect, improve", "description": "Invite feedback and bring lessons into the next version."}
          ]
        }
      },
      {
        "id": "faq-resources-auto",
        "heading": "Explore the thinking.",
        "enabled": true,
        "content": {
          "type": "faq",
          "items": [
            {"question": "Design brief", "answer": "This concept explores communication cards and visual routines in a simple, accessible interface."},
            {"question": "Accessibility notes", "answer": "The prototype uses labeled controls, keyboard interaction, visible focus states and large touch targets."},
            {"question": "Research roadmap", "answer": "Listen to families, build a small prototype, run supported trials, document feedback and refine."}
          ]
        }
      }
    ]'::jsonb,
    1,
    v_user_id
  );

  raise notice 'Created research fixture: test-deessa-companion (id: %)', v_program_id;

  -- =============================================
  -- CAMPAIGN FIXTURE
  -- =============================================
  insert into public.programs (id, slug, title, category, theme, eyebrow, short_description, tags, status, created_by, updated_by)
  values (
    gen_random_uuid(),
    'test-1000-families',
    '1,000 Families Initiative',
    'campaign',
    'campaign',
    'CAMPAIGNS / THE 1,000 FAMILIES INITIATIVE',
    'A bold invitation to be part of a collective goal for families across Nepal.',
    array['campaign', 'families', 'community', 'collective'],
    'draft',
    v_user_id,
    v_user_id
  ) returning id into v_program_id;

  insert into public.program_drafts (program_id, hero, sections, revision, updated_by)
  values (
    v_program_id,
    '{
      "title": "A little support.",
      "description": "A world of possibility.",
      "image": "",
      "imageAlt": "1000 Families Campaign",
      "layout": "full_bleed"
    }'::jsonb,
    '[
      {
        "id": "progress-auto",
        "heading": "OUR SHARED GOAL",
        "enabled": true,
        "content": {
          "type": "progress_tracker",
          "current": 820,
          "goal": 1000,
          "unit": "families"
        }
      },
      {
        "id": "features-promises-auto",
        "heading": "What the campaign provides",
        "enabled": true,
        "content": {
          "type": "features",
          "layout": "grid",
          "features": [
            {"title": "Tools to express", "description": "Picture boards, visual routines and everyday resources.", "icon": "💬"},
            {"title": "Space to connect", "description": "Welcoming workshops for families and educators.", "icon": "👥"},
            {"title": "Support to grow", "description": "Follow-up conversations and community connections.", "icon": "❤️"}
          ]
        }
      },
      {
        "id": "timeline-journey-auto",
        "heading": "STEP BY STEP, TOGETHER",
        "enabled": true,
        "content": {
          "type": "timeline",
          "items": [
            {"title": "Listen & connect", "description": "Start with families and the questions that matter.", "status": "completed", "date": "01"},
            {"title": "Learn & make", "description": "Bring practical workshops into more communities.", "status": "active", "date": "02"},
            {"title": "Keep showing up", "description": "Follow up with families and strengthen connections.", "status": "upcoming", "date": "03"}
          ]
        }
      }
    ]'::jsonb,
    1,
    v_user_id
  );

  raise notice 'Created campaign fixture: test-1000-families (id: %)', v_program_id;

end;
$$;
