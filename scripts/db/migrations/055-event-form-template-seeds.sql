-- =============================================
-- EVENT FORM TEMPLATE SEEDS
-- Migration: 055-event-form-template-seeds.sql
-- Date: July 25, 2026
-- =============================================
-- Seeds 15 default form templates for the Events Module.
-- These cover the most common NGO event registration patterns.
-- All templates are public so every admin can use them.
-- =============================================

-- Helper: reusable core field definitions
-- full_name, email, phone are stored as core fields with fixed columns.


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. GENERAL EVENT REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'General Event Registration',
  'A flexible registration form suitable for any event type. Includes personal details, attendance preferences, and consent.',
  'general',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Personal Details",
        "description": "Please provide your contact information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": false, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization / Company", "placeholder": "Where do you work?", "storage": "core", "coreColumn": "organization", "order": 3}
        ]
      },
      {
        "id": "preferences",
        "label": "Preferences",
        "order": 1,
        "fields": [
          {"id": "attendance_mode", "type": "radio", "label": "How will you attend?", "required": true, "storage": "core", "coreColumn": "attendance_mode", "order": 0, "options": [
            {"value": "in_person", "label": "In Person"},
            {"value": "virtual", "label": "Virtual / Online"},
            {"value": "hybrid", "label": "Hybrid"}
          ]},
          {"id": "dietary_preference", "type": "select", "label": "Dietary Requirements", "storage": "core", "coreColumn": "dietary_preference", "order": 1, "options": [
            {"value": "none", "label": "No restrictions"},
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "vegan", "label": "Vegan"},
            {"value": "halal", "label": "Halal"},
            {"value": "gluten_free", "label": "Gluten Free"},
            {"value": "other", "label": "Other"}
          ]}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0},
          {"id": "consent_newsletter", "type": "toggle", "label": "I would like to receive event updates via email", "storage": "core", "coreColumn": "consent_newsletter", "order": 1}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Default general registration template"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CONFERENCE REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
-- Exact match of the conference registration form schema v1
-- from seed-default-form-schema.sql
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Conference Registration',
  'Multi-step registration for conferences with role selection, workshop preference, and dietary needs.',
  'conference',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Personal Details",
        "description": "Please provide your contact information for the conference badge.",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "placeholder": "e.g. Sarah Johnson", "required": true, "storage": "core", "coreColumn": "full_name", "width": "full", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "placeholder": "e.g. sarah@example.com", "required": true, "storage": "core", "coreColumn": "email", "width": "full", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "placeholder": "+1 (555) 000-0000", "required": false, "storage": "core", "coreColumn": "phone", "width": "half", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization", "placeholder": "e.g. DEESSA Inc.", "required": false, "storage": "core", "coreColumn": "organization", "width": "half", "order": 3}
        ]
      },
      {
        "id": "participation",
        "label": "Participation Details",
        "description": "Tell us about your role and how you will be joining us.",
        "order": 1,
        "fields": [
          {"id": "role", "type": "select", "label": "Your Role", "required": true, "storage": "core", "coreColumn": "role", "width": "full", "order": 0, "options": [
            {"value": "attendee", "label": "Professional Delegate"},
            {"value": "speaker", "label": "Speaker"},
            {"value": "panelist", "label": "Panelist"},
            {"value": "volunteer", "label": "Volunteer"},
            {"value": "sponsor", "label": "Sponsor / Exhibitor"}
          ]},
          {"id": "attendance_mode", "type": "radio", "label": "Attendance Mode", "required": true, "storage": "core", "coreColumn": "attendance_mode", "width": "full", "order": 1, "options": [
            {"value": "in-person", "label": "In-Person"},
            {"value": "online", "label": "Online"}
          ]},
          {"id": "workshops", "type": "checkbox", "label": "Select Workshops", "required": false, "storage": "core", "coreColumn": "workshops", "width": "full", "order": 2, "maxSelections": 2, "options": [
            {"value": "AI Ethics in Philanthropy", "label": "AI Ethics in Philanthropy"},
            {"value": "Modern Grant-making Strategies", "label": "Modern Grant-making Strategies"},
            {"value": "Community Storytelling & Media", "label": "Community Storytelling & Media"},
            {"value": "Fundraising in the Digital Age", "label": "Fundraising in the Digital Age"},
            {"value": "Youth Leadership Development", "label": "Youth Leadership Development"},
            {"value": "Sustainability & Impact Measurement", "label": "Sustainability & Impact Measurement"}
          ]}
        ]
      },
      {
        "id": "additional",
        "label": "Additional Info & Accessibility",
        "description": "Almost there! Just a few more details to make your experience perfect.",
        "order": 2,
        "fields": [
          {"id": "dietary_preference", "type": "select", "label": "Dietary Preferences", "placeholder": "Select preference…", "required": false, "storage": "core", "coreColumn": "dietary_preference", "width": "full", "order": 0, "options": [
            {"value": "none", "label": "No Preferences"},
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "vegan", "label": "Vegan"},
            {"value": "gluten-free", "label": "Gluten-Free"},
            {"value": "other", "label": "Other (please specify in notes)"}
          ]},
          {"id": "tshirt_size", "type": "radio", "label": "T-Shirt Size", "helpText": "For Volunteers", "required": false, "storage": "core", "coreColumn": "tshirt_size", "width": "full", "order": 1, "options": [
            {"value": "S", "label": "S"},
            {"value": "M", "label": "M"},
            {"value": "L", "label": "L"},
            {"value": "XL", "label": "XL"},
            {"value": "XXL", "label": "XXL"}
          ]},
          {"id": "heard_via", "type": "checkbox", "label": "How did you hear about us?", "required": false, "storage": "core", "coreColumn": "heard_via", "width": "full", "order": 2, "options": [
            {"value": "social", "label": "Social Media"},
            {"value": "newsletter", "label": "Newsletter"},
            {"value": "friend", "label": "Friend / Colleague"},
            {"value": "website", "label": "Website"},
            {"value": "other", "label": "Other"}
          ]},
          {"id": "emergency_contact_name", "type": "text", "label": "Emergency Contact Name", "placeholder": "Full Name", "required": false, "storage": "core", "coreColumn": "emergency_contact_name", "width": "half", "order": 3},
          {"id": "emergency_contact_phone", "type": "tel", "label": "Emergency Contact Phone", "placeholder": "+1 (555) 000-0000", "required": false, "storage": "core", "coreColumn": "emergency_contact_phone", "width": "half", "order": 4}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Exact match of conference registration form schema v1"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. WORKSHOP REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Workshop Registration',
  'Registration for hands-on workshops with skill level assessment and materials preparation.',
  'workshop',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Your Details",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "storage": "core", "coreColumn": "phone", "order": 2}
        ]
      },
      {
        "id": "workshop_details",
        "label": "Workshop Details",
        "order": 1,
        "fields": [
          {"id": "skill_level", "type": "radio", "label": "Your Skill Level", "required": true, "storage": "custom", "order": 0, "options": [
            {"value": "beginner", "label": "Beginner — New to this topic"},
            {"value": "intermediate", "label": "Intermediate — Some experience"},
            {"value": "advanced", "label": "Advanced — Experienced practitioner"}
          ]},
          {"id": "what_to_learn", "type": "textarea", "label": "What do you hope to learn?", "placeholder": "Tell us your goals for this workshop", "storage": "custom", "order": 1},
          {"id": "bring_laptop", "type": "toggle", "label": "I will bring my own laptop", "storage": "custom", "order": 2}
        ]
      },
      {
        "id": "logistics",
        "label": "Logistics",
        "order": 2,
        "fields": [
          {"id": "dietary_preference", "type": "select", "label": "Dietary Requirements", "storage": "core", "coreColumn": "dietary_preference", "order": 0, "options": [
            {"value": "none", "label": "No restrictions"},
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "vegan", "label": "Vegan"},
            {"value": "other", "label": "Other"}
          ]},
          {"id": "tshirt_size", "type": "select", "label": "T-Shirt Size (if provided)", "storage": "core", "coreColumn": "tshirt_size", "order": 1, "options": [
            {"value": "xs", "label": "XS"},
            {"value": "s", "label": "S"},
            {"value": "m", "label": "M"},
            {"value": "l", "label": "L"},
            {"value": "xl", "label": "XL"},
            {"value": "xxl", "label": "XXL"}
          ]},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 2}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Workshop with skill assessment"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. WEBINAR REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Webinar Registration',
  'Simple online event registration with timezone selection and recording consent.',
  'webinar',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "registration",
        "label": "Webinar Registration",
        "description": "Register to receive the meeting link",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "organization", "type": "text", "label": "Organization", "storage": "core", "coreColumn": "organization", "order": 2},
          {"id": "timezone", "type": "select", "label": "Your Timezone", "required": true, "storage": "custom", "order": 3, "options": [
            {"value": "IST", "label": "India (IST, UTC+5:30)"},
            {"value": "EST", "label": "US Eastern (EST, UTC-5)"},
            {"value": "GMT", "label": "UK (GMT, UTC+0)"},
            {"value": "CET", "label": "Central Europe (CET, UTC+1)"},
            {"value": "JST", "label": "Japan (JST, UTC+9)"}
          ]},
          {"id": "recording_consent", "type": "toggle", "label": "I consent to this webinar being recorded", "storage": "custom", "order": 4},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 5}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Simple webinar registration"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. VOLUNTEER APPLICATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Volunteer Application',
  'Comprehensive volunteer sign-up with availability, skills, and emergency contact.',
  'volunteer',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Personal Information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "age_range", "type": "select", "label": "Age Range", "storage": "custom", "order": 3, "options": [
            {"value": "18-25", "label": "18-25"},
            {"value": "26-35", "label": "26-35"},
            {"value": "36-50", "label": "36-50"},
            {"value": "50+", "label": "50+"}
          ]}
        ]
      },
      {
        "id": "skills",
        "label": "Skills & Availability",
        "order": 1,
        "fields": [
          {"id": "skills", "type": "checkbox", "label": "Select your skills", "storage": "custom", "order": 0, "options": [
            {"value": "event_setup", "label": "Event Setup & Logistics"},
            {"value": "registration", "label": "Registration Desk"},
            {"value": "photography", "label": "Photography / Videography"},
            {"value": "first_aid", "label": "First Aid Certified"},
            {"value": "translation", "label": "Translation / Interpretation"},
            {"value": "tech_support", "label": "Technical Support"},
            {"value": "social_media", "label": "Social Media Coverage"},
            {"value": "other", "label": "Other"}
          ]},
          {"id": "availability", "type": "checkbox", "label": "When are you available?", "storage": "custom", "order": 1, "options": [
            {"value": "morning", "label": "Morning (8am-12pm)"},
            {"value": "afternoon", "label": "Afternoon (12pm-5pm)"},
            {"value": "evening", "label": "Evening (5pm-9pm)"},
            {"value": "full_day", "label": "Full Day"}
          ]},
          {"id": "previous_experience", "type": "textarea", "label": "Previous volunteering experience", "placeholder": "Describe any relevant experience", "storage": "custom", "order": 2}
        ]
      },
      {
        "id": "emergency",
        "label": "Emergency Contact",
        "order": 2,
        "fields": [
          {"id": "emergency_contact_name", "type": "text", "label": "Emergency Contact Name", "required": true, "storage": "core", "coreColumn": "emergency_contact_name", "order": 0},
          {"id": "emergency_contact_phone", "type": "tel", "label": "Emergency Contact Phone", "required": true, "storage": "core", "coreColumn": "emergency_contact_phone", "order": 1},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the volunteer terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 2}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Volunteer application with skills matching"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. FUNDRAISER / GALA RSVP
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Fundraiser RSVP',
  'Registration for fundraising events, galas, and charity dinners with guest count and dietary needs.',
  'fundraiser',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "guest_info",
        "label": "Guest Information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization / Company", "storage": "core", "coreColumn": "organization", "order": 3}
        ]
      },
      {
        "id": "event_details",
        "label": "Event Details",
        "order": 1,
        "fields": [
          {"id": "guest_count", "type": "number", "label": "Number of Guests (including yourself)", "required": true, "storage": "custom", "order": 0, "validation": {"min": 1, "max": 10}},
          {"id": "dietary_preference", "type": "select", "label": "Dietary Requirements", "storage": "core", "coreColumn": "dietary_preference", "order": 1, "options": [
            {"value": "none", "label": "No restrictions"},
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "vegan", "label": "Vegan"},
            {"value": "halal", "label": "Halal"},
            {"value": "kosher", "label": "Kosher"},
            {"value": "gluten_free", "label": "Gluten Free"},
            {"value": "other", "label": "Other (specify in notes)"}
          ]},
          {"id": "special_requests", "type": "textarea", "label": "Special Requests or Notes", "placeholder": "Accessibility needs, seating preferences, etc.", "storage": "custom", "order": 2},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 3}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Fundraiser and gala RSVP"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. COMMUNITY EVENT RSVP
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Community Event RSVP',
  'Simple RSVP for community gatherings, cleanups, and local outreach events.',
  'community',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "rsvp",
        "label": "RSVP",
        "description": "Register your attendance",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "bringing_guests", "type": "toggle", "label": "I am bringing guests", "storage": "custom", "order": 3},
          {"id": "guest_names", "type": "text", "label": "Guest Names", "placeholder": "List names separated by commas", "storage": "custom", "order": 4,
            "conditional": {"dependsOn": "bringing_guests", "operator": "equals", "value": "true"}},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 5}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Simple community event RSVP"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. EVENT FEEDBACK
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Event Feedback',
  'Post-event survey to collect attendee feedback, ratings, and suggestions.',
  'feedback',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "feedback",
        "label": "Share Your Feedback",
        "description": "Help us improve future events",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Your Name (optional)", "storage": "custom", "order": 0},
          {"id": "email", "type": "email", "label": "Email (optional, for follow-up)", "storage": "custom", "order": 1},
          {"id": "overall_rating", "type": "rating", "label": "Overall Experience", "required": true, "storage": "custom", "order": 2, "ratingConfig": {"maxStars": 5}},
          {"id": "content_quality", "type": "rating", "label": "Content Quality", "storage": "custom", "order": 3, "ratingConfig": {"maxStars": 5}},
          {"id": "organization", "type": "rating", "label": "Event Organization", "storage": "custom", "order": 4, "ratingConfig": {"maxStars": 5}},
          {"id": "most_valuable", "type": "textarea", "label": "What was most valuable?", "placeholder": "Tell us what you enjoyed the most", "storage": "custom", "order": 5},
          {"id": "improvements", "type": "textarea", "label": "What could be improved?", "placeholder": "Your suggestions for future events", "storage": "custom", "order": 6},
          {"id": "attend_again", "type": "radio", "label": "Would you attend again?", "storage": "custom", "order": 7, "options": [
            {"value": "definitely", "label": "Definitely"},
            {"value": "probably", "label": "Probably"},
            {"value": "not_sure", "label": "Not sure"},
            {"value": "no", "label": "No"}
          ]},
          {"id": "recommend", "type": "radio", "label": "Would you recommend this to a friend?", "storage": "custom", "order": 8, "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"}
          ]}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Post-event feedback survey"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. TEAM REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Team Registration',
  'Register a team for events like walkathons, hackathons, or competitions. Add multiple team members.',
  'team',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "team_lead",
        "label": "Team Lead",
        "description": "Primary contact for the team",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Team Lead Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "team_name", "type": "text", "label": "Team Name", "required": true, "storage": "custom", "order": 3}
        ]
      },
      {
        "id": "members",
        "label": "Team Members",
        "description": "Add your team members",
        "order": 1,
        "fields": [
          {"id": "team_members", "type": "repeating", "label": "Team Members", "storage": "custom", "order": 0, "repeatingConfig": {"minRows": 1, "maxRows": 10, "addLabel": "Add team member", "fields": [
            {"id": "member_name", "type": "text", "label": "Name", "required": true, "storage": "custom", "order": 0},
            {"id": "member_email", "type": "email", "label": "Email", "storage": "custom", "order": 1}
          ]}}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions on behalf of my team", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Team registration with repeating members"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 10. SPEAKER APPLICATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Speaker Application',
  'Application form for potential speakers to submit their talk proposals.',
  'conference',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "speaker_info",
        "label": "Speaker Information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization", "storage": "core", "coreColumn": "organization", "order": 3},
          {"id": "linkedin", "type": "url", "label": "LinkedIn Profile", "placeholder": "https://linkedin.com/in/...", "storage": "custom", "order": 4}
        ]
      },
      {
        "id": "talk_details",
        "label": "Talk Details",
        "order": 1,
        "fields": [
          {"id": "talk_title", "type": "text", "label": "Talk Title", "required": true, "storage": "custom", "order": 0},
          {"id": "talk_abstract", "type": "textarea", "label": "Talk Abstract", "placeholder": "Describe your talk in 200-300 words", "required": true, "storage": "custom", "order": 1},
          {"id": "talk_track", "type": "select", "label": "Track", "required": true, "storage": "custom", "order": 2, "options": [
            {"value": "technical", "label": "Technical"},
            {"value": "leadership", "label": "Leadership"},
            {"value": "impact", "label": "Social Impact"},
            {"value": "workshop", "label": "Workshop"}
          ]},
          {"id": "talk_duration", "type": "radio", "label": "Preferred Duration", "storage": "custom", "order": 3, "options": [
            {"value": "15min", "label": "Lightning Talk (15 min)"},
            {"value": "30min", "label": "Standard (30 min)"},
            {"value": "45min", "label": "Extended (45 min)"},
            {"value": "90min", "label": "Workshop (90 min)"}
          ]},
          {"id": "previous_talks", "type": "textarea", "label": "Previous speaking experience", "placeholder": "Links to past talks or events", "storage": "custom", "order": 4}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Speaker application with talk proposal"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 11. SPONSOR APPLICATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Sponsor Application',
  'Application form for potential sponsors and partners.',
  'partnership',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "company",
        "label": "Company Information",
        "order": 0,
        "fields": [
          {"id": "contact_name", "type": "text", "label": "Contact Person", "required": true, "storage": "custom", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "company_name", "type": "text", "label": "Company Name", "required": true, "storage": "custom", "order": 3},
          {"id": "company_website", "type": "url", "label": "Company Website", "storage": "custom", "order": 4}
        ]
      },
      {
        "id": "sponsorship",
        "label": "Sponsorship Details",
        "order": 1,
        "fields": [
          {"id": "sponsorship_tier", "type": "radio", "label": "Interested Tier", "required": true, "storage": "custom", "order": 0, "options": [
            {"value": "platinum", "label": "Platinum — Title Sponsor"},
            {"value": "gold", "label": "Gold — Major Sponsor"},
            {"value": "silver", "label": "Silver — Supporting Sponsor"},
            {"value": "bronze", "label": "Bronze — Community Sponsor"},
            {"value": "in_kind", "label": "In-Kind Contribution"}
          ]},
          {"id": "budget_range", "type": "select", "label": "Budget Range", "storage": "custom", "order": 1, "options": [
            {"value": "under_50k", "label": "Under ₹50,000"},
            {"value": "50k_2l", "label": "₹50,000 - ₹2,00,000"},
            {"value": "2l_5l", "label": "₹2,00,000 - ₹5,00,000"},
            {"value": "5l_plus", "label": "₹5,00,000+"}
          ]},
          {"id": "what_offer", "type": "textarea", "label": "What can you offer?", "placeholder": "Describe your sponsorship contribution", "storage": "custom", "order": 2},
          {"id": "expectations", "type": "textarea", "label": "What do you expect in return?", "placeholder": "Branding, speaking slots, networking, etc.", "storage": "custom", "order": 3}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Sponsor and partner application"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 12. VIP / MEDIA REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'VIP / Media Registration',
  'Registration for VIP guests, press, and media personnel with accreditation details.',
  'vip',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "guest_info",
        "label": "Guest Information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization / Media House", "storage": "core", "coreColumn": "organization", "order": 3},
          {"id": "designation", "type": "text", "label": "Designation / Title", "placeholder": "e.g., Senior Editor, Correspondent", "storage": "custom", "order": 4}
        ]
      },
      {
        "id": "media_details",
        "label": "Media / VIP Details",
        "order": 1,
        "fields": [
          {"id": "guest_type", "type": "radio", "label": "Guest Type", "required": true, "storage": "custom", "order": 0, "options": [
            {"value": "vip", "label": "VIP Guest"},
            {"value": "press", "label": "Press / Journalism"},
            {"value": "broadcast", "label": "Broadcast Media"},
            {"value": "photographer", "label": "Photographer / Videographer"}
          ]},
          {"id": "id_proof", "type": "file", "label": "Upload ID Proof", "storage": "custom", "order": 1, "fileUploadConfig": {"maxSizeMB": 5, "allowedTypes": ["image/jpeg", "image/png", "application/pdf"], "multiple": false, "storageBucket": "event-uploads"}},
          {"id": "accreditation_number", "type": "text", "label": "Press Accreditation Number (if applicable)", "storage": "custom", "order": 2},
          {"id": "special_requirements", "type": "textarea", "label": "Special Requirements", "placeholder": "Camera setup, interview requests, etc.", "storage": "custom", "order": 3}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "VIP and media registration"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 13. YOUTH PROGRAM REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Youth Program Registration',
  'Registration for youth-focused programs including mentorship, leadership camps, and skill-building.',
  'youth',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Personal Details",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true, "storage": "custom", "order": 3, "dateValidation": {"maxDate": "today"}},
          {"id": "education", "type": "select", "label": "Current Education Level", "storage": "custom", "order": 4, "options": [
            {"value": "school", "label": "School (up to 12th)"},
            {"value": "undergrad", "label": "Undergraduate"},
            {"value": "postgrad", "label": "Postgraduate"},
            {"value": "working", "label": "Working Professional"}
          ]}
        ]
      },
      {
        "id": "program",
        "label": "Program Preferences",
        "order": 1,
        "fields": [
          {"id": "interest_areas", "type": "checkbox", "label": "Areas of Interest", "storage": "custom", "order": 0, "options": [
            {"value": "leadership", "label": "Leadership"},
            {"value": "tech", "label": "Technology"},
            {"value": "social_impact", "label": "Social Impact"},
            {"value": "entrepreneurship", "label": "Entrepreneurship"},
            {"value": "arts", "label": "Arts & Culture"},
            {"value": "environment", "label": "Environment"}
          ]},
          {"id": "why_apply", "type": "textarea", "label": "Why do you want to join this program?", "required": true, "storage": "custom", "order": 1}
        ]
      },
      {
        "id": "guardian",
        "label": "Guardian & Emergency",
        "order": 2,
        "fields": [
          {"id": "guardian_name", "type": "text", "label": "Parent / Guardian Name", "storage": "custom", "order": 0},
          {"id": "guardian_phone", "type": "tel", "label": "Parent / Guardian Phone", "storage": "custom", "order": 1},
          {"id": "emergency_contact_name", "type": "text", "label": "Emergency Contact Name", "required": true, "storage": "core", "coreColumn": "emergency_contact_name", "order": 2},
          {"id": "emergency_contact_phone", "type": "tel", "label": "Emergency Contact Phone", "required": true, "storage": "core", "coreColumn": "emergency_contact_phone", "order": 3},
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 4}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Youth program with guardian consent"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 14. HEALTH CAMP REGISTRATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Health Camp Registration',
  'Registration for health camps, medical checkups, and wellness events.',
  'health',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "patient",
        "label": "Patient Information",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "required": true, "storage": "custom", "order": 3},
          {"id": "gender", "type": "radio", "label": "Gender", "storage": "custom", "order": 4, "options": [
            {"value": "male", "label": "Male"},
            {"value": "female", "label": "Female"},
            {"value": "other", "label": "Other"}
          ]}
        ]
      },
      {
        "id": "medical",
        "label": "Medical History",
        "order": 1,
        "fields": [
          {"id": "known_conditions", "type": "checkbox", "label": "Known Medical Conditions", "storage": "custom", "order": 0, "options": [
            {"value": "diabetes", "label": "Diabetes"},
            {"value": "hypertension", "label": "Hypertension"},
            {"value": "heart_disease", "label": "Heart Disease"},
            {"value": "asthma", "label": "Asthma"},
            {"value": "allergies", "label": "Allergies"},
            {"value": "none", "label": "None of the above"}
          ]},
          {"id": "current_medications", "type": "textarea", "label": "Current Medications", "placeholder": "List any medications you are currently taking", "storage": "custom", "order": 1},
          {"id": "services_needed", "type": "checkbox", "label": "Services Required", "storage": "custom", "order": 2, "options": [
            {"value": "general_checkup", "label": "General Checkup"},
            {"value": "eye_checkup", "label": "Eye Checkup"},
            {"value": "dental", "label": "Dental Checkup"},
            {"value": "blood_test", "label": "Blood Test"},
            {"value": "vaccination", "label": "Vaccination"}
          ]}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I consent to the medical examination and data collection", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Health camp with medical history"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 15. TRAINING CERTIFICATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO event_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Training & Certification',
  'Registration for certified training programs with pre-assessment and certificate details.',
  'training',
  true,
  '{
    "version": 1,
    "steps": [
      {
        "id": "personal",
        "label": "Personal Details",
        "order": 0,
        "fields": [
          {"id": "full_name", "type": "text", "label": "Full Name", "required": true, "storage": "core", "coreColumn": "full_name", "order": 0},
          {"id": "email", "type": "email", "label": "Email Address", "required": true, "storage": "core", "coreColumn": "email", "order": 1},
          {"id": "phone", "type": "tel", "label": "Phone Number", "required": true, "storage": "core", "coreColumn": "phone", "order": 2},
          {"id": "organization", "type": "text", "label": "Organization / Institution", "storage": "core", "coreColumn": "organization", "order": 3}
        ]
      },
      {
        "id": "training",
        "label": "Training Details",
        "order": 1,
        "fields": [
          {"id": "experience_level", "type": "radio", "label": "Experience Level", "required": true, "storage": "custom", "order": 0, "options": [
            {"value": "beginner", "label": "Beginner (0-1 years)"},
            {"value": "intermediate", "label": "Intermediate (1-3 years)"},
            {"value": "advanced", "label": "Advanced (3+ years)"}
          ]},
          {"id": "learning_goals", "type": "textarea", "label": "What do you want to achieve?", "placeholder": "Describe your learning goals", "storage": "custom", "order": 1},
          {"id": "cert_name_on", "type": "text", "label": "Name as it should appear on certificate", "required": true, "storage": "custom", "order": 2}
        ]
      },
      {
        "id": "consent",
        "label": "Consent",
        "order": 2,
        "fields": [
          {"id": "consent_terms", "type": "toggle", "label": "I agree to the terms and conditions", "required": true, "storage": "core", "coreColumn": "consent_terms", "order": 0},
          {"id": "consent_newsletter", "type": "toggle", "label": "I would like to receive training updates", "storage": "core", "coreColumn": "consent_newsletter", "order": 1}
        ]
      }
    ],
    "metadata": {"createdAt": "2026-07-25T00:00:00Z", "notes": "Training program with certification"}
  }'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- Verification
-- ═══════════════════════════════════════════════════════════════════════════

-- Count templates
SELECT COUNT(*) as total_templates FROM event_form_templates;

-- List all templates by category
SELECT name, category, 
  (form_config->>'steps')::jsonb ? 'steps' as has_steps,
  jsonb_array_length(form_config->'steps') as step_count
FROM event_form_templates
ORDER BY category, name;
