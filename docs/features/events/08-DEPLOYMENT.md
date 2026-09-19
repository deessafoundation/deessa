---
title: "Deployment Guide"
description: "Version: 2.0"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Deployment Guide

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

This guide covers deploying the Event Management Module to production.

---

## Prerequisites

- Node.js 18+
- Supabase project with service role key
- Vercel account (or compatible hosting)
- Environment variables configured

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Database Migrations

Run migrations in order:

```bash
# 1. Core schema
psql -f scripts/050-events-module-schema.sql

# 2. Registration enhancements
psql -f scripts/051-event-registration-enhancements.sql

# 3. Agenda highlighted column
psql -f scripts/052-agenda-highlighted.sql

# 4. Ticket sold_count
psql -f scripts/053-ticket-sold-count.sql

# 5. Form template seeds (15 templates)
psql -f scripts/055-event-form-template-seeds.sql
```

Or via Supabase Dashboard â†’ SQL Editor.

---

## Build & Deploy

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Set environment variables
4. Deploy automatically on push

### Manual Build

```bash
# Install dependencies
npm install

# Build
npm run build

# Start production server
npm start
```

---

## Post-Deployment

### 1. Verify Database
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'event_%';

-- Check templates seeded
SELECT COUNT(*) FROM event_form_templates;
```

### 2. Test Admin Flow
1. Login to `/admin`
2. Navigate to `/admin/events`
3. Create a test event
4. Apply a template in form builder
5. Save and publish
6. Verify public page works

### 3. Test Public Flow
1. Visit `/events`
2. Click on published event
3. Click "Register"
4. Complete registration form
5. Verify confirmation

---

## Troubleshooting

### Templates not showing
- Run `055-event-form-template-seeds.sql`
- Check `event_form_templates` table has data
- Verify RLS policies allow admin read

### Form builder shows default schema
- Check `event_form_schemas` table for active schema
- Verify `form_config` is not null
- Run cleanup: `DELETE FROM event_form_schemas WHERE form_config IS NULL;`

### Registration fails
- Check event status is 'published'
- Check `registration_enabled` is true
- Check registration deadline hasn't passed
- Verify rate limit hasn't been hit

---

**Last Updated:** July 25, 2026
