---
title: "Events Module â€” Admin User Guide"
description: "The Events Module allows you to create, manage, and publish events with custom registration forms. This guide covers ..."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Events Module â€” Admin User Guide

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
   - **Event Title** â€” Required. The name of your event.
   - **URL Slug** â€” Auto-generated from title. Customize if needed.
   - **Short Description** â€” Brief summary shown on event cards (1-2 sentences).
   - **Full Description** â€” Detailed description for the event detail page.
3. Set **Date & Location**:
   - **Event Date** â€” Required. When the event takes place.
   - **Time** â€” Optional. e.g., "09:00 AM - 05:00 PM"
   - **Location** â€” Required. e.g., "Kathmandu, Nepal"
4. Configure **Settings**:
   - **Category** â€” Conference, Workshop, Seminar, Meetup, or General
   - **Free Event** â€” Toggle on for free events, off for paid events
   - **Contact Email** â€” Optional. Shown on the registration page.
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
- **Banner Image** â€” Hero image for the detail page (1920x600px recommended)
- **Card Thumbnail** â€” Image shown on event cards (400x300px recommended)
- **Gallery** â€” Additional images for the detail page
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
- **Field Palette** â€” Add fields from 12 types (text, email, phone, number, select, radio, checkbox, toggle, date, URL, file, heading, paragraph)
- **Canvas** â€” Arrange fields in steps
- **Properties** â€” Edit field label, placeholder, required, options
- **Save Draft** â€” Save without publishing
- **Publish** â€” Make the form live for registrants

### Pricing Tab
- For paid events, manage ticket types
- Add ticket types with name, price, currency, capacity
- Set sales start/end dates
- Toggle tickets active/inactive

### Email Templates Tab
- Customize emails sent to registrants
- 4 template types:
  - **Confirmation** â€” Sent when registration is confirmed
  - **Payment Receipt** â€” Sent after successful payment
  - **Reminder** â€” Sent before the event date
  - **Cancellation** â€” Sent when registration is cancelled
- Use variables: `{{full_name}}`, `{{event_title}}`, `{{event_date}}`, `{{ticket_name}}`

### Registrations Tab
- View all registrations for this event
- See status (pending, confirmed, cancelled)
- See payment status (unpaid, paid, refunded)

### Settings Tab
- **Status Controls**:
  - **Publish** â€” Make event visible to public
  - **Disable** â€” Pause registration without deleting
  - **Archive** â€” Hide from active list (restore to draft anytime)
- **Duplicate Event** â€” Clone as new draft (copies details, agenda, forms, pricing, email templates)
- **Delete Event** â€” Only available if no registrations exist

---

## Event Status Flow

```
Draft â†’ Published â†’ Disabled â†’ Archived
                â†‘         â†“
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  
Archived â†’ Restore to Draft
```

- **Draft** â€” Not visible to public
- **Published** â€” Visible, registration open
- **Disabled** â€” Hidden from public, registration paused
- **Archived** â€” Hidden from admin list, historical record

---

## Registration Form Builder

### Adding Fields
1. Click a field type from the palette at the bottom of each step
2. The field is added to the step
3. Click the field to edit its properties

### Field Properties
- **Label** â€” Display name
- **Placeholder** â€” Hint text
- **Help Text** â€” Additional guidance
- **Required** â€” Whether the field must be filled

### Managing Steps
- Add new steps with "Add Step" button
- Edit step names inline
- Collapse/expand steps with the arrow icon
- Delete steps (cannot delete the last step)

### Saving
- **Save Draft** â€” Saves without making it live
- **Publish** â€” Saves and makes it the active form for registration

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
- `{{full_name}}` â€” Registrant's name
- `{{email}}` â€” Registrant's email
- `{{event_title}}` â€” Event title
- `{{event_date}}` â€” Event date
- `{{event_location}}` â€” Event location
- `{{ticket_name}}` â€” Ticket type name
- `{{ticket_price}}` â€” Ticket price

### Template Types
- **Confirmation** â€” Sent on successful registration
- **Payment Receipt** â€” Sent after payment
- **Reminder** â€” Sent before event (configure timing later)
- **Cancellation** â€” Sent when registration is cancelled

---

## Tips

1. **Start with the form builder** â€” Create your registration form before publishing
2. **Use short descriptions** â€” They appear on event cards (1-2 sentences)
3. **Set banner images** â€” They make your event detail pages look professional
4. **Test registration** â€” Create a test event and register yourself
5. **Save drafts often** â€” The form builder supports save without publishing
6. **Use categories** â€” Help users find relevant events

---

**Last Updated:** July 23, 2026
