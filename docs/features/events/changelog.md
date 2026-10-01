---
title: "Event Management Module - Changelog"
description: "All notable changes to this project will be documented in this file."
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Management Module - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] - 2026-07-25

### Added

#### Form Builder (Phase 1)
- **21 Field Types** — Added Date Range, Signature, Rating, Slider, Repeating Section, Rich Text
- **Field Categories** — Organized palette into Input, Choice, Date & Time, Media & Files, Feedback, Layout
- **Conditional Logic UI** — Wired EnhancedConditionalEditor with 10 operators, AND/OR logic
- **File Upload Config UI** — Max size, allowed types, multiple files, storage bucket
- **Date Validation Config UI** — Min/max date, disabled days of week, span constraints
- **Rating Config** — Star count selector (3/4/5/7/10)
- **Slider Config** — Min, max, step, unit inputs
- **Repeating Config** — Min/max entries, add button label, sub-field editor
- **Runtime Validation** — Added validation for date, dateRange, url, file, signature, rating, slider, repeating, richText

#### Form Builder (Phase 2)
- **Keyboard Shortcuts** — Delete/Backspace (delete field), Ctrl+D (duplicate), Escape (deselect)
- **Unsaved Changes Indicator** — Amber badge, beforeunload warning
- **Better Empty States** — Icons and helpful messages for empty steps/forms
- **Rich Text Preview** — Renders HTML content in preview mode
- **Multi-select Tags UI** — Checkbox with checkmark indicators, count display
- **Responsive Preview** — Desktop/Tablet/Mobile toggle in preview mode

#### Form Builder (Phase 3)
- **Form Templates** — Integrated FormTemplateChooser with 15 pre-built templates
- **JSON Import/Export** — Export schema as JSON, import with validation and confirmation
- **Rich Text Field** — TipTap WYSIWYG editor with toolbar (bold, italic, underline, lists, links)

#### Templates
- **15 Default Templates** — Conference, Workshop, Webinar, Volunteer, Fundraiser, Community, Feedback, Team, Speaker, Sponsor, VIP, Youth, Health, Training
- **Category Colors** — 14 unique colors for template categories
- **Public Badge** — Primary-colored badge for public templates

#### UI Improvements
- **Button Hover Effects** — Subtle backgrounds and color transitions
- **Template Modal** — Redesigned with better layout, skeleton loading, category filters
- **Field Properties Panel** — Options editor moved higher for visibility, bg-gray-50/50 background
- **Column Sizing** — Left 220px, Center 1fr, Right 340px

### Fixed
- **Date Range minSpan** — Was checking `diffDays < 0` instead of `diffDays < minSpan`
- **Repeating Sub-fields** — Now uses FIELD_REGISTRY to render proper typed components
- **Select Clearing** — Non-required selects can now be cleared
- **Paragraph helpText** — Now displays helpText below label
- **Button Nesting** — Fixed DatePicker and TimePicker nested button HTML errors
- **Template Persistence** — Templates now persist across tab switches and page refreshes
- **Service Role Client** — All admin operations use service role client to bypass RLS
- **Form Schema API** — Now finds latest schema with valid form_config, handles null rows

### Changed
- **FieldPalette** — Categorized into collapsible sections
- **SortableFieldCard** — Action buttons always visible (removed opacity-0)
- **FieldPropertiesPanel** — Options editor moved after Label field
- **EventFormBuilder** — Component stays mounted when switching tabs (hidden div)
- **createFormSchema** — Cleans up null form_config rows before insert
- **applyEventTemplateToEvent** — Always deactivates old active schemas

---

## [1.0.0] - 2026-07-23

### Added
- Complete event management module (Phase 0-5)
- Database schema with 7 tables
- Admin CRUD for events
- Form builder with 12 field types
- Public event listing and detail pages
- Registration flow with payment placeholders
- Rate limiting and input sanitization
- Loading skeletons and error boundaries
- ISR for public pages

---

**Last Updated:** July 25, 2026
