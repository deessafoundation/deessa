---
title: "admin guide"
description: "Documentation for admin guide"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
Photo Wall Admin Guide
======================

Purpose
-------
This document explains how the Photo Wall admin setting works and the expected JSON schema for `photo_wall_images` stored in `site_settings` under the key `photo_wall_images`.

Schema
------
The value is a JSON array of exactly 9 objects. Each object represents a portrait strip and supports these properties:

- `src` (string): public image URL (Supabase public URL or external URL)
- `alt` (string): alt text for accessibility
- `title` (string): short title displayed on the strip
- `label` (string): small uppercase label displayed above the title
- `caption` (string) [optional]: short caption or description
- `tint` (string) [optional]: Tailwind gradient class fragment, e.g. `from-amber-950/55`

Example
-------
[
  { "src": "https://.../img1.jpg", "alt": "...", "title": "Arrival", "label": "Field presence", "caption": "...", "tint": "from-amber-950/55" },
  { "src": "https://.../img2.jpg", "alt": "...", "title": "Working", "label": "Workshop", "caption": "...", "tint": "from-slate-950/55" },
  ... (7 more objects total = 9)
]

Admin UI
--------
- Go to `/admin/settings` → Photo Wall tab.
- The form provides 9 upload slots. Use the built-in uploader (recommended) or paste an external URL.
- Edit `Title`, `Label`, `Alt`, and optional `Tint` for each slot.
- Click "Save Photo Wall" to persist. Only users with role `ADMIN` or `SUPER_ADMIN` can save.

Behavior
--------
- The demo component at `/demo/photo-wall` reads `site_settings.photo_wall_images` and will show the saved images if the array has 9 items.
- The admin save triggers cache revalidation for `/admin/settings` and `/` so the demo and public site will refresh on next request.

Notes
-----
- Keep file sizes reasonable (WebP preferred) for faster load.
- Use the recommended `photo-wall` storage bucket for uploads.
