-- ============================================================
-- DEESSA Foundation — Seed Default Form Schema (Version 1)
-- Run AFTER 040-conference-form-schema.sql
--
-- Creates the initial form schema that exactly mirrors the
-- current hardcoded 4-step registration form.
-- ============================================================

-- First, get the conference event ID (the first published event matching "conference")
DO $$
DECLARE
  v_event_id UUID;
  v_schema JSONB;
BEGIN
  -- Find the conference event — assumes there's an event with 'conference' in title or category
  SELECT id INTO v_event_id FROM events
    WHERE (LOWER(title) LIKE '%conference%' OR LOWER(category) = 'conference')
      AND is_published = true
    ORDER BY event_date DESC
    LIMIT 1;

  -- If no matching event found, use the first event as fallback
  IF v_event_id IS NULL THEN
    SELECT id INTO v_event_id FROM events
      WHERE is_published = true
      ORDER BY event_date DESC
      LIMIT 1;
  END IF;

  -- If still no event, create a placeholder event
  IF v_event_id IS NULL THEN
    INSERT INTO events (title, slug, description, event_date, location, category, type, is_published)
    VALUES (
      'DEESSA National Conference 2026',
      'deessa-national-conference-2026',
      'Three days of innovation, connection, and hands-on learning.',
      '2026-10-15',
      'Kathmandu, Nepal',
      'conference',
      'upcoming',
      true
    )
    RETURNING id INTO v_event_id;
  END IF;

  -- Build the default form schema matching the current 4-step form
  v_schema := jsonb_build_object(
    'version', 1,
    'metadata', jsonb_build_object(
      'createdBy', 'system',
      'createdAt', NOW()::text,
      'updatedAt', NOW()::text,
      'notes', 'Default schema matching the original hardcoded 4-step form.'
    ),
    'steps', jsonb_build_array(
      -- Step 1: Personal Details
      jsonb_build_object(
        'id', 'personal',
        'label', 'Personal Details',
        'description', 'Please provide your contact information for the conference badge.',
        'order', 0,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'full_name',
            'type', 'text',
            'label', 'Full Name',
            'placeholder', 'e.g. Sarah Johnson',
            'required', true,
            'storage', 'core',
            'coreColumn', 'full_name',
            'width', 'full',
            'order', 0
          ),
          jsonb_build_object(
            'id', 'email',
            'type', 'email',
            'label', 'Email Address',
            'placeholder', 'e.g. sarah@example.com',
            'required', true,
            'storage', 'core',
            'coreColumn', 'email',
            'width', 'full',
            'order', 1
          ),
          jsonb_build_object(
            'id', 'phone',
            'type', 'tel',
            'label', 'Phone Number',
            'placeholder', '+1 (555) 000-0000',
            'required', false,
            'storage', 'core',
            'coreColumn', 'phone',
            'width', 'half',
            'order', 2
          ),
          jsonb_build_object(
            'id', 'organization',
            'type', 'text',
            'label', 'Organization',
            'placeholder', 'e.g. DEESSA Inc.',
            'required', false,
            'storage', 'core',
            'coreColumn', 'organization',
            'width', 'half',
            'order', 3
          )
        )
      ),
      -- Step 2: Participation Details
      jsonb_build_object(
        'id', 'participation',
        'label', 'Participation Details',
        'description', 'Tell us about your role and how you will be joining us.',
        'order', 1,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'role',
            'type', 'select',
            'label', 'Your Role',
            'required', true,
            'storage', 'core',
            'coreColumn', 'role',
            'width', 'full',
            'order', 0,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'attendee', 'label', 'Professional Delegate'),
              jsonb_build_object('value', 'speaker', 'label', 'Speaker'),
              jsonb_build_object('value', 'panelist', 'label', 'Panelist'),
              jsonb_build_object('value', 'volunteer', 'label', 'Volunteer'),
              jsonb_build_object('value', 'sponsor', 'label', 'Sponsor / Exhibitor')
            )
          ),
          jsonb_build_object(
            'id', 'attendance_mode',
            'type', 'radio',
            'label', 'Attendance Mode',
            'required', true,
            'storage', 'core',
            'coreColumn', 'attendance_mode',
            'width', 'full',
            'order', 1,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'in-person', 'label', 'In-Person'),
              jsonb_build_object('value', 'online', 'label', 'Online')
            )
          ),
          jsonb_build_object(
            'id', 'workshops',
            'type', 'checkbox',
            'label', 'Select Workshops',
            'required', false,
            'storage', 'core',
            'coreColumn', 'workshops',
            'width', 'full',
            'order', 2,
            'maxSelections', 2,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'AI Ethics in Philanthropy', 'label', 'AI Ethics in Philanthropy'),
              jsonb_build_object('value', 'Modern Grant-making Strategies', 'label', 'Modern Grant-making Strategies'),
              jsonb_build_object('value', 'Community Storytelling & Media', 'label', 'Community Storytelling & Media'),
              jsonb_build_object('value', 'Fundraising in the Digital Age', 'label', 'Fundraising in the Digital Age'),
              jsonb_build_object('value', 'Youth Leadership Development', 'label', 'Youth Leadership Development'),
              jsonb_build_object('value', 'Sustainability & Impact Measurement', 'label', 'Sustainability & Impact Measurement')
            )
          )
        )
      ),
      -- Step 3: Additional Info
      jsonb_build_object(
        'id', 'additional',
        'label', 'Additional Info & Accessibility',
        'description', 'Almost there! Just a few more details to make your experience perfect.',
        'order', 2,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'dietary_preference',
            'type', 'select',
            'label', 'Dietary Preferences',
            'required', false,
            'storage', 'core',
            'coreColumn', 'dietary_preference',
            'width', 'full',
            'order', 0,
            'placeholder', 'Select preference…',
            'options', jsonb_build_array(
              jsonb_build_object('value', 'none', 'label', 'No Preferences'),
              jsonb_build_object('value', 'vegetarian', 'label', 'Vegetarian'),
              jsonb_build_object('value', 'vegan', 'label', 'Vegan'),
              jsonb_build_object('value', 'gluten-free', 'label', 'Gluten-Free'),
              jsonb_build_object('value', 'other', 'label', 'Other (please specify in notes)')
            )
          ),
          jsonb_build_object(
            'id', 'tshirt_size',
            'type', 'radio',
            'label', 'T-Shirt Size',
            'required', false,
            'storage', 'core',
            'coreColumn', 'tshirt_size',
            'width', 'full',
            'order', 1,
            'helpText', 'For Volunteers',
            'options', jsonb_build_array(
              jsonb_build_object('value', 'S', 'label', 'S'),
              jsonb_build_object('value', 'M', 'label', 'M'),
              jsonb_build_object('value', 'L', 'label', 'L'),
              jsonb_build_object('value', 'XL', 'label', 'XL'),
              jsonb_build_object('value', 'XXL', 'label', 'XXL')
            )
          ),
          jsonb_build_object(
            'id', 'heard_via',
            'type', 'checkbox',
            'label', 'How did you hear about us?',
            'required', false,
            'storage', 'core',
            'coreColumn', 'heard_via',
            'width', 'full',
            'order', 2,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'social', 'label', 'Social Media'),
              jsonb_build_object('value', 'newsletter', 'label', 'Newsletter'),
              jsonb_build_object('value', 'friend', 'label', 'Friend / Colleague'),
              jsonb_build_object('value', 'website', 'label', 'Website'),
              jsonb_build_object('value', 'other', 'label', 'Other')
            )
          ),
          jsonb_build_object(
            'id', 'emergency_contact_name',
            'type', 'text',
            'label', 'Emergency Contact Name',
            'placeholder', 'Full Name',
            'required', false,
            'storage', 'core',
            'coreColumn', 'emergency_contact_name',
            'width', 'half',
            'order', 3
          ),
          jsonb_build_object(
            'id', 'emergency_contact_phone',
            'type', 'tel',
            'label', 'Emergency Contact Phone',
            'placeholder', '+1 (555) 000-0000',
            'required', false,
            'storage', 'core',
            'coreColumn', 'emergency_contact_phone',
            'width', 'half',
            'order', 4
          )
        )
      )
    )
  );

  -- Insert the schema — skip if version 1 already exists for this event
  IF NOT EXISTS (
    SELECT 1 FROM conference_form_schemas
    WHERE event_id = v_event_id AND version = 1
  ) THEN
    INSERT INTO conference_form_schemas (event_id, version, is_active, form_config, created_by, notes)
    VALUES (v_event_id, 1, true, v_schema, NULL, 'Default schema — auto-seeded on first deployment.');
    RAISE NOTICE 'Default form schema seeded (version 1) for event %', v_event_id;
  ELSE
    RAISE NOTICE 'Default form schema already exists — skipping seed.';
  END IF;
END $$;
