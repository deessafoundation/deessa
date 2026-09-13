---
title: "Event Management Module - Changelog"
description: "All notable changes to this project will be documented in this file."
owner: "Deesha Team"
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
- **21 Field Types** â€” Added Date Range, Signature, Rating, Slider, Repeating Section, Rich Text
- **Field Categories** â€” Organized palette into Input, Choice, Date & Time, Media & Files, Feedback, Layout
- **Conditional Logic UI** â€” Wired EnhancedConditionalEditor with 10 operators, AND/OR logic
- **File Upload Config UI** â€” Max size, allowed types, multiple files, storage bucket
- **Date Validation Config UI** â€” Min/max date, disabled days of week, span constraints
- **Rating Config** â€” Star count selector (3/4/5/7/10)
- **Slider Config** â€” Min, max, step, unit inputs
- **Repeating Config** â€” Min/max entries, add button label, sub-field editor
- **Runtime Validation** â€” Added validation for date, dateRange, url, file, signature, rating, slider, repeating, richText

#### Form Builder (Phase 2)
- **Keyboard Shortcuts** â€” Delete/Backspace (delete field), Ctrl+D (duplicate), Escape (deselect)
- **Unsaved Changes Indicator** â€” Amber badge, beforeunload warning
- **Better Empty States** â€” Icons and helpful messages for empty steps/forms
- **Rich Text Preview** â€” Renders HTML content in preview mode
- **Multi-select Tags UI** â€” Checkbox with checkmark indicators, count display
- **Responsive Preview** â€” Desktop/Tablet/Mobile toggle in preview mode

#### Form Builder (Phase 3)
- **Form Templates** â€” Integrated FormTemplateChooser with 15 pre-built templates
- **JSON Import/Export** â€” Export schema as JSON, import with validation and confirmation
- **Rich Text Field** â€” TipTap WYSIWYG editor with toolbar (bold, italic, underline, lists, links)

#### Templates
- **15 Default Templates** â€” Conference, Workshop, Webinar, Volunteer, Fundraiser, Community, Feedback, Team, Speaker, Sponsor, VIP, Youth, Health, Training
- **Category Colors** â€” 14 unique colors for template categories
- **Public Badge** â€” Primary-colored badge for public templates

#### UI Improvements
- **Button Hover Effects** â€” Subtle backgrounds and color transitions
- **Template Modal** â€” Redesigned with better layout, skeleton loading, category filters
- **Field Properties Panel** â€” Options editor moved higher for visibility, bg-gray-50/50 background
- **Column Sizing** â€” Left 220px, Center 1fr, Right 340px

### Fixed
- **Date Range minSpan** â€” Was checking `diffDays < 0` instead of `diffDays < minSpan`
- **Repeating Sub-fields** â€” Now uses FIELD_REGISTRY to render proper typed components
- **Select Clearing** â€” Non-required selects can now be cleared
- **Paragraph helpText** â€” Now displays helpText below label
- **Button Nesting** â€” Fixed DatePicker and TimePicker nested button HTML errors
- **Template Persistence** â€” Templates now persist across tab switches and page refreshes
- **Service Role Client** â€” All admin operations use service role client to bypass RLS
- **Form Schema API** â€” Now finds latest schema with valid form_config, handles null rows

### Changed
- **FieldPalette** â€” Categorized into collapsible sections
- **SortableFieldCard** â€” Action buttons always visible (removed opacity-0)
- **FieldPropertiesPanel** â€” Options editor moved after Label field
- **EventFormBuilder** â€” Component stays mounted when switching tabs (hidden div)
- **createFormSchema** â€” Cleans up null form_config rows before insert
- **applyEventTemplateToEvent** â€” Always deactivates old active schemas

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
