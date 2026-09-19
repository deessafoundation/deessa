---
title: "Form Templates"
description: "Version: 2.0"
owner: "Deessa Team"
status: active
category: feature
audience: developer
last_updated: 2026-09-12
---
# Form Templates

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

Form templates are pre-built registration forms that can be applied to events. They save time by providing common form structures for different event types.

---

## Template Categories

| Category | Templates | Color |
|----------|-----------|-------|
| **general** | General Event Registration | Gray |
| **conference** | Conference Registration, Speaker Application | Blue |
| **workshop** | Workshop Registration | Emerald |
| **webinar** | Webinar Registration | Violet |
| **volunteer** | Volunteer Application | Amber |
| **fundraiser** | Fundraiser RSVP | Rose |
| **community** | Community Event RSVP | Teal |
| **feedback** | Event Feedback | Orange |
| **team** | Team Registration | Cyan |
| **partnership** | Sponsor Application | Indigo |
| **vip** | VIP / Media Registration | Yellow |
| **youth** | Youth Program Registration | Pink |
| **health** | Health Camp Registration | Red |
| **training** | Training & Certification | Sky |

---

## Available Templates

### 1. General Event Registration
**Category:** general  
**Steps:** 3 (Personal Details, Preferences, Consent)  
**Fields:** 9

A flexible template suitable for any event type. Includes:
- Personal details (name, email, phone, organization)
- Attendance mode (in-person, virtual, hybrid)
- Dietary preferences
- Consent toggles

---

### 2. Conference Registration
**Category:** conference  
**Steps:** 3 (Personal Details, Participation Details, Additional Info)  
**Fields:** 11

Multi-step registration matching the conference form:
- Personal details with placeholders
- Role selection (Professional Delegate, Speaker, Panelist, Volunteer, Sponsor)
- Attendance mode (In-Person, Online)
- Workshop selection (6 options, max 2)
- Dietary preferences
- T-Shirt size with "For Volunteers" help text
- How did you hear about us
- Emergency contact (half-width fields)

---

### 3. Workshop Registration
**Category:** workshop  
**Steps:** 3 (Your Details, Workshop Details, Logistics)  
**Fields:** 10

For hands-on workshops:
- Skill level assessment (Beginner, Intermediate, Advanced)
- Learning goals textarea
- "Bring my own laptop" toggle
- Dietary and t-shirt preferences

---

### 4. Webinar Registration
**Category:** webinar  
**Steps:** 1 (Webinar Registration)  
**Fields:** 6

Simple online event registration:
- Name, email, organization
- Timezone selection (5 options)
- Recording consent toggle

---

### 5. Volunteer Application
**Category:** volunteer  
**Steps:** 3 (Personal Information, Skills & Availability, Emergency Contact)  
**Fields:** 13

Comprehensive volunteer sign-up:
- Age range selection
- Skills selection (8 options)
- Availability (morning, afternoon, evening, full day)
- Previous experience textarea
- Emergency contact (required)

---

### 6. Fundraiser RSVP
**Category:** fundraiser  
**Steps:** 2 (Guest Information, Event Details)  
**Fields:** 7

For fundraising events and galas:
- Guest count (1-10)
- Dietary preferences (including Kosher)
- Special requests textarea

---

### 7. Community Event RSVP
**Category:** community  
**Steps:** 1 (RSVP)  
**Fields:** 6

Simple RSVP with conditional logic:
- Basic info (name, email, phone)
- "Bringing guests" toggle
- Conditional guest names field (shows when toggle is on)

---

### 8. Event Feedback
**Category:** feedback  
**Steps:** 1 (Share Your Feedback)  
**Fields:** 9

Post-event survey:
- 3 rating dimensions (overall, content, organization)
- Most valuable / improvements textareas
- "Would you attend again" radio
- "Recommend to friend" radio

---

### 9. Team Registration
**Category:** team  
**Steps:** 3 (Team Lead, Team Members, Consent)  
**Fields:** 6

For team-based events:
- Team lead info (name, email, phone, team name)
- **Repeating section** for team members (1-10)
- Each member has name and email sub-fields

---

### 10. Speaker Application
**Category:** conference  
**Steps:** 3 (Speaker Information, Talk Details, Consent)  
**Fields:** 10

For conference speakers:
- LinkedIn profile URL
- Talk title and abstract
- Track selection (4 options)
- Duration selection (Lightning 15m, Standard 30m, Extended 45m, Workshop 90m)
- Previous speaking experience

---

### 11. Sponsor Application
**Category:** partnership  
**Steps:** 3 (Company Information, Sponsorship Details, Consent)  
**Fields:** 10

For potential sponsors:
- Company name and website
- Sponsorship tier (Platinum, Gold, Silver, Bronze, In-Kind)
- Budget range (4 tiers)
- What you can offer / what you expect

---

### 12. VIP / Media Registration
**Category:** vip  
**Steps:** 3 (Guest Information, Media / VIP Details, Consent)  
**Fields:** 10

For press and VIP guests:
- Designation/title
- Guest type (VIP, Press, Broadcast, Photographer)
- ID proof file upload
- Press accreditation number
- Special requirements

---

### 13. Youth Program Registration
**Category:** youth  
**Steps:** 3 (Personal Details, Program Preferences, Guardian & Emergency)  
**Fields:** 12

For youth-focused programs:
- Date of birth with max date validation
- Education level selection
- Area of interest checkboxes (6 options)
- "Why do you want to join" textarea
- Guardian name and phone
- Emergency contact (required)

---

### 14. Health Camp Registration
**Category:** health  
**Steps:** 3 (Patient Information, Medical History, Consent)  
**Fields:** 10

For health camps and medical events:
- Date of birth
- Gender selection
- Known conditions checkboxes (6 options)
- Current medications textarea
- Services required checkboxes (5 options)

---

### 15. Training & Certification
**Category:** training  
**Steps:** 3 (Personal Details, Training Details, Consent)  
**Fields:** 9

For certified training programs:
- Experience level (Beginner, Intermediate, Advanced)
- Learning goals textarea
- Name as it should appear on certificate

---

## How Templates Work

### Applying a Template
1. Click "Templates" in the form builder
2. Browse or filter by category
3. Select a template
4. Click "Apply Template"
5. Template schema loads into the builder
6. Customize as needed
7. Save/Publish

### Saving as Template
1. Build your form in the builder
2. Click "Templates" â†’ "Save Current" tab
3. Enter name, description, category
4. Optionally make public for other admins
5. Click "Save Template"

### Template Storage
- Templates are stored in `event_form_templates` table
- Public templates visible to all admins
- Templates are independent of events (reusable)

---

## Customizing Templates

After applying a template, you can:
- Add/remove/reorder fields
- Change field labels and options
- Add conditional logic
- Modify validation rules
- Change step structure
- Add new steps

The template is just a starting point â€” the form is fully editable.

---

**Last Updated:** July 25, 2026
