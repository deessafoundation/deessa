---
title: "Events Module — Admin User Guide"
description: "The Events Module allows you to create, manage, and publish events with custom registration forms. This guide covers ..."
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Events Module — Admin User Guide

## Overview

The Events Module allows you to create, manage, and publish events with custom registration forms. This guide covers all admin features.

---

## Getting Started

### Accessing Events

1. Log in to the admin panel at `/admin`
2. Click **Events** in the sidebar
3. You'll see the events listing page

---

## Creating an Event

1. Click **Create Event** button
2. Fill in the basic information:
   - **Event Title** — Required. The name of your event.
   - **URL Slug** — Auto-generated from title. Customize if needed.
   - **Short Description** — Brief summary shown on event cards (1-2 sentences).
   - **Full Description** — Detailed description for the event detail page.
3. Set **Date & Location**:
   - **Event Date** — Required. When the event takes place.
   - **Time** — Optional. e.g., "09:00 AM - 05:00 PM"
   - **Location** — Required. e.g., "Kathmandu, Nepal"
4. Configure **Settings**:
   - **Category** — Conference, Workshop, Seminar, Meetup, or General
   - **Free Event** — Toggle on for free events, off for paid events
   - **Contact Email** — Optional. Shown on the registration page.
5. Click **Create Event**

---

## Managing Event Details

After creating an event, you'll see the event dashboard with tabs:

### Overview Tab
- Quick stats (registrations, form status, ticket types)
- Quick actions (edit, configure form, view registrations)

### Details Tab
- Edit all event information (title, slug, description, dates, location)
- Change category or pricing mode
- Save changes

### Media Tab
- **Banner Image** — Hero image for the detail page (1920x600px recommended)
- **Card Thumbnail** — Image shown on event cards (400x300px recommended)
- **Gallery** — Additional images for the detail page
- Enter image URLs or upload to Supabase Storage

### Location Tab
- Set venue name and full address
- Enter latitude/longitude for map pin (optional)
- Map preview shows your location

### Agenda Tab
- Build your event schedule
- Add sessions with title, description, speaker, time, room/track
- Organize by day (multi-day support)
- Edit sessions inline

### Form Builder Tab
- Create custom registration forms
- **Field Palette** — Add fields from 12 types (text, email, phone, number, select, radio, checkbox, toggle, date, URL, file, heading, paragraph)
- **Canvas** — Arrange fields in steps
- **Properties** — Edit field label, placeholder, required, options
- **Save Draft** — Save without publishing
- **Publish** — Make the form live for registrants

### Pricing Tab
- For paid events, manage ticket types
- Add ticket types with name, price, currency, capacity
- Set sales start/end dates
- Toggle tickets active/inactive

### Email Templates Tab
- Customize emails sent to registrants
- 4 template types:
  - **Confirmation** — Sent when registration is confirmed
  - **Payment Receipt** — Sent after successful payment
  - **Reminder** — Sent before the event date
  - **Cancellation** — Sent when registration is cancelled
- Use variables: `{{full_name}}`, `{{event_title}}`, `{{event_date}}`, `{{ticket_name}}`

### Registrations Tab
- View all registrations for this event
- See status (pending, confirmed, cancelled)
- See payment status (unpaid, paid, refunded)

### Settings Tab
- **Status Controls**:
  - **Publish** — Make event visible to public
  - **Disable** — Pause registration without deleting
  - **Archive** — Hide from active list (restore to draft anytime)
- **Duplicate Event** — Clone as new draft (copies details, agenda, forms, pricing, email templates)
- **Delete Event** — Only available if no registrations exist

---

## Event Status Flow

```
Draft → Published → Disabled → Archived
                ↑         ↓
                └─────────┘
                  
Archived → Restore to Draft
```

- **Draft** — Not visible to public
- **Published** — Visible, registration open
- **Disabled** — Hidden from public, registration paused
- **Archived** — Hidden from admin list, historical record

---

## Registration Form Builder

### Adding Fields
1. Click a field type from the palette at the bottom of each step
2. The field is added to the step
3. Click the field to edit its properties

### Field Properties
- **Label** — Display name
- **Placeholder** — Hint text
- **Help Text** — Additional guidance
- **Required** — Whether the field must be filled

### Managing Steps
- Add new steps with "Add Step" button
- Edit step names inline
- Collapse/expand steps with the arrow icon
- Delete steps (cannot delete the last step)

### Saving
- **Save Draft** — Saves without making it live
- **Publish** — Saves and makes it the active form for registration

---

## Pricing Management

### Adding Ticket Types
1. Go to the Pricing tab
2. Click "Add Ticket Type"
3. Enter name, price, currency, capacity (optional)
4. Set sales window (optional)
5. Save

### Ticket Status
- Toggle tickets active/inactive without deleting
- Inactive tickets are hidden from the registration form

---

## Email Templates

### Available Variables
- `{{full_name}}` — Registrant's name
- `{{email}}` — Registrant's email
- `{{event_title}}` — Event title
- `{{event_date}}` — Event date
- `{{event_location}}` — Event location
- `{{ticket_name}}` — Ticket type name
- `{{ticket_price}}` — Ticket price

### Template Types
- **Confirmation** — Sent on successful registration
- **Payment Receipt** — Sent after payment
- **Reminder** — Sent before event (configure timing later)
- **Cancellation** — Sent when registration is cancelled

---

## Tips

1. **Start with the form builder** — Create your registration form before publishing
2. **Use short descriptions** — They appear on event cards (1-2 sentences)
3. **Set banner images** — They make your event detail pages look professional
4. **Test registration** — Create a test event and register yourself
5. **Save drafts often** — The form builder supports save without publishing
6. **Use categories** — Help users find relevant events

---

**Last Updated:** July 23, 2026
