---
title: "Documentation Architecture â€” Complete Rewrite"
description: " Status: Planning only â€” no files moved or renamed yet."
owner: "Deesha Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Documentation Architecture â€” Complete Rewrite

> **Status:** Planning only â€” no files moved or renamed yet.
> **Created:** 2026-07-22
> **Goal:** Design a professional, scalable documentation system for a Next.js + Supabase production application that can be handed over to an enterprise client and maintained for years.

---

## Table of Contents

1. [Architecture Review â€” What Was Wrong](#1-architecture-review--what-was-wrong)
2. [Refined Folder Structure](#2-refined-folder-structure)
3. [Naming Standard](#3-naming-standard)
4. [Document Lifecycle](#4-document-lifecycle)
5. [Frontmatter Standard](#5-frontmatter-standard)
6. [Architecture Decision Records](#6-architecture-decision-records)
7. [Release Documentation Strategy](#7-release-documentation-strategy)
8. [Duplicate Consolidation Plan](#8-duplicate-consolidation-plan)
9. [Archive Strategy](#9-archive-strategy)
10. [Client Handover Gap Analysis](#10-client-handover-gap-analysis)
11. [README Hierarchy](#11-readme-hierarchy)
12. [Migration Mapping Table](#12-migration-mapping-table)
13. [Execution Plan](#13-execution-plan)
14. [Reference Update Plan](#14-reference-update-plan)
15. [Checklists](#15-checklists)
16. [Risk Section](#16-risk-section)
17. [Open Decisions](#17-open-decisions)

---

## 1. Architecture Review â€” What Was Wrong

The previous plan had six fundamental architectural flaws:

### Flaw 1: Mixed Classification Systems

The previous structure mixed **subject-area folders** (`payments/`, `conference/`) with **document-type folders** (`how-to/`, `architecture/`). This is like organizing a library by putting fiction books in one room, cookbooks in another, and then "large books" in a third. A document about payment troubleshooting could be in `payments/` or `how-to/` â€” the structure doesn't tell you which.

**Fix:** Every top-level folder is a **subject area**. Document type is expressed through frontmatter `category` field, not folder placement.

### Flaw 2: Feature Docs Scattered Across Type Folders

Payment documentation was split across `architecture/` (system design), `payments/` (implementation), and `how-to/` (setup guides). A developer trying to understand payments had to look in three places.

**Fix:** Feature documentation lives in `features/<feature>/`. Each feature folder is self-contained with its own architecture, guides, and reference docs.

### Flaw 3: The `how-to/` Grab Bag

`how-to/` was becoming a second dump folder â€” anything that looked like a "guide" went there regardless of what feature it supported. This is the same problem as `archive/` but for a different document type.

**Fix:** Eliminated. How-to content lives within its feature or system area. A `setup-guide.md` for payments lives in `features/payments/`, not in `how-to/`.

### Flaw 4: Archive as Dumping Ground

Every completion summary, status report, and historical fix went to `archive/` without classification. This creates an unsearchable graveyard.

**Fix:** Archive is organized by feature area with a manifest. Completion summaries with no ongoing value are **deleted**, not archived. Only documents that teach something are archived.

### Flaw 5: No System-Wide Documentation

Cross-cutting concerns (architecture, auth, database, deployment, security) had no clear home. They were scattered across feature folders or buried in random locations.

**Fix:** Dedicated `architecture/` folder for system-wide design docs. Dedicated `operations/` for deployment and operational procedures.

### Flaw 6: No Standards or Decision Records

The project had no coding standards, no ADRs, and no documentation standards. A new contributor has no way to know why decisions were made or how to write docs.

**Fix:** `standards/` folder with ADRs, coding standards, and documentation standards.

---

## 2. Refined Folder Structure

```
docs/
â”œâ”€â”€ README.md                           # Documentation homepage â€” navigation hub
â”‚
â”œâ”€â”€ getting-started/                    # Onboarding: new developers, new contributors
â”‚   â”œâ”€â”€ README.md                       # Index: "Start here"
â”‚   â”œâ”€â”€ development-setup.md            # Local dev environment setup
â”‚   â”œâ”€â”€ environment-variables.md        # All env vars documented (MISSING â€” referenced but never created)
â”‚   â””â”€â”€ project-structure.md            # Codebase layout and conventions
â”‚
â”œâ”€â”€ architecture/                       # System-wide design (NOT feature-specific)
â”‚   â”œâ”€â”€ README.md                       # Index: "How the system is designed"
â”‚   â”œâ”€â”€ overview.md                     # High-level architecture (MISSING â€” needs creation)
â”‚   â”œâ”€â”€ authentication.md               # Auth system: Supabase Auth + RBAC (MISSING)
â”‚   â”œâ”€â”€ database.md                     # Schema overview, migrations, RLS (MISSING)
â”‚   â”œâ”€â”€ payment-system.md               # Cross-cutting payment architecture
â”‚   â”œâ”€â”€ receipt-system.md               # Cross-cutting receipt architecture
â”‚   â”œâ”€â”€ email-system.md                 # Email sending: Resend/SendGrid (MISSING)
â”‚   â”œâ”€â”€ storage.md                      # Supabase Storage setup (MISSING)
â”‚   â”œâ”€â”€ api-design.md                   # API conventions, error handling (MISSING)
â”‚   â””â”€â”€ backend-analysis.md             # Existing backend analysis
â”‚
â”œâ”€â”€ features/                           # Feature-specific documentation
â”‚   â”œâ”€â”€ README.md                       # Index: "Feature documentation"
â”‚   â”‚
â”‚   â”œâ”€â”€ payments/                       # Payment integrations (Stripe, Khalti, eSewa)
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ stripe-setup.md
â”‚   â”‚   â”œâ”€â”€ khalti-integration.md
â”‚   â”‚   â”œâ”€â”€ esewa-integration.md
â”‚   â”‚   â”œâ”€â”€ rate-limiting.md
â”‚   â”‚   â”œâ”€â”€ receipt-implementation.md
â”‚   â”‚   â”œâ”€â”€ receipt-deployment.md
â”‚   â”‚   â”œâ”€â”€ receipt-troubleshooting.md
â”‚   â”‚   â”œâ”€â”€ receipt-webhook-integration.md
â”‚   â”‚   â”œâ”€â”€ receipt-access-control.md
â”‚   â”‚   â”œâ”€â”€ receipt-token-migration.md
â”‚   â”‚   â”œâ”€â”€ reconciliation.md
â”‚   â”‚   â”œâ”€â”€ go-live-checklist.md
â”‚   â”‚   â””â”€â”€ system-audit.md
â”‚   â”‚
â”‚   â”œâ”€â”€ donations/                      # Donation management (admin + public)
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”‚   â”œâ”€â”€ API.md
â”‚   â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”‚   â””â”€â”€ USER_GUIDE.md
â”‚   â”‚   â”œâ”€â”€ stripe-enhancement-deployment.md
â”‚   â”‚   â”œâ”€â”€ schema-analysis.md
â”‚   â”‚   â”œâ”€â”€ stripe-payment-intent-solution.md
â”‚   â”‚   â””â”€â”€ verification-checklist.md
â”‚   â”‚
â”‚   â”œâ”€â”€ conference/                     # Conference registration & management
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ reference/                  # Existing numbered suite (kept as-is)
â”‚   â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 00-executive-summary.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 01-overview.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 02-architecture.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 03-database-schema.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 04-page-documentation.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 05-api-documentation.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 06-payment-flows.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 07-admin-documentation.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 08-security.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 09-deployment-operations.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 10-improvements-risks.md
â”‚   â”‚   â”‚   â”œâ”€â”€ 11-appendix.md
â”‚   â”‚   â”‚   â””â”€â”€ Master-Doc.md
â”‚   â”‚   â””â”€â”€ dynamic-form/              # Active planning
â”‚   â”‚       â”œâ”€â”€ tasks.md
â”‚   â”‚       â”œâ”€â”€ phase-2-implementation.md
â”‚   â”‚       â”œâ”€â”€ phase-2-complete.md
â”‚   â”‚       â”œâ”€â”€ phase-2-visual-guide.md
â”‚   â”‚       â””â”€â”€ phase-3-complete.md
â”‚   â”‚
â”‚   â”œâ”€â”€ homepage-cms/                   # Homepage content management
â”‚   â”‚   â”œâ”€â”€ README.md                   # Consolidated from best existing docs
â”‚   â”‚   â”œâ”€â”€ content-management.md       # Content management reference
â”‚   â”‚   â””â”€â”€ impact-page.md             # Impact page integration
â”‚   â”‚
â”‚   â”œâ”€â”€ story-editor/                   # Story editor feature
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ admin-user-guide.md
â”‚   â”‚   â”œâ”€â”€ developer-docs.md
â”‚   â”‚   â”œâ”€â”€ implementation-status.md
â”‚   â”‚   â”œâ”€â”€ print-feature.md
â”‚   â”‚   â”œâ”€â”€ print-feature-fixes.md
â”‚   â”‚   â”œâ”€â”€ print-troubleshooting.md
â”‚   â”‚   â””â”€â”€ troubleshooting.md
â”‚   â”‚
â”‚   â”œâ”€â”€ testimonials/                   # Testimonial management
â”‚   â”‚   â”œâ”€â”€ admin-upload-guide.md
â”‚   â”‚   â”œâ”€â”€ image-upload.md
â”‚   â”‚   â””â”€â”€ ui-improvements.md
â”‚   â”‚
â”‚   â”œâ”€â”€ seo/                            # SEO, sitemaps, robots
â”‚   â”‚   â”œâ”€â”€ sitemap-robots.md
â”‚   â”‚   â”œâ”€â”€ domain-update.md
â”‚   â”‚   â”œâ”€â”€ sitemap-conflict.md
â”‚   â”‚   â””â”€â”€ verification-checklist.md
â”‚   â”‚
â”‚   â”œâ”€â”€ podcasts/                       # Podcast system
â”‚   â”‚   â”œâ”€â”€ implementation.md
â”‚   â”‚   â””â”€â”€ highlights.md
â”‚   â”‚
â”‚   â”œâ”€â”€ accessibility/                  # Accessibility toolbar & features
â”‚   â”‚   â””â”€â”€ toolbar-guide.md
â”‚   â”‚
â”‚   â”œâ”€â”€ media/                          # Image cleanup, photo wall, video
â”‚   â”‚   â”œâ”€â”€ image-cleanup.md
â”‚   â”‚   â”œâ”€â”€ photo-wall-admin.md
â”‚   â”‚   â””â”€â”€ toast-notifications.md
â”‚   â”‚
â”‚   â””â”€â”€ theme/                          # Brand theme, Tailwind config
â”‚       â”œâ”€â”€ brand-theme.md
â”‚       â”œâ”€â”€ theme-migration.md
â”‚       â””â”€â”€ tailwind-config.ts          # Code reference file
â”‚
â”œâ”€â”€ operations/                         # Deployment, monitoring, incident response
â”‚   â”œâ”€â”€ README.md                       # Index: "Operating the system"
â”‚   â”œâ”€â”€ deployment/
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ deployment-guide.md
â”‚   â”‚   â”œâ”€â”€ staging-checklist.md
â”‚   â”‚   â”œâ”€â”€ production-checklist.md
â”‚   â”‚   â”œâ”€â”€ smoke-test-guide.md
â”‚   â”‚   â”œâ”€â”€ incremental-rollout.md
â”‚   â”‚   â”œâ”€â”€ v1-cleanup-guide.md
â”‚   â”‚   â””â”€â”€ vercel-domain-fix.md
â”‚   â”œâ”€â”€ security/
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ credential-rotation-guide.md
â”‚   â”‚   â”œâ”€â”€ credential-rotation-checklist.md
â”‚   â”‚   â””â”€â”€ credential-rotation-implementation.md
â”‚   â”œâ”€â”€ runbook.md                      # Incident response runbook
â”‚   â”œâ”€â”€ monitoring.md                   # Monitoring & alerting (MISSING)
â”‚   â””â”€â”€ github-actions-roadmap.md
â”‚
â”œâ”€â”€ standards/                          # Team conventions and decisions
â”‚   â”œâ”€â”€ README.md                       # Index: "How we work"
â”‚   â”œâ”€â”€ coding-standards.md             # TypeScript, React, Next.js conventions (MISSING)
â”‚   â”œâ”€â”€ documentation-standards.md      # How to write docs (this file's companion)
â”‚   â”œâ”€â”€ decisions/                      # Architecture Decision Records
â”‚   â”‚   â”œâ”€â”€ README.md                   # ADR process explanation
â”‚   â”‚   â”œâ”€â”€ 001-use-supabase.md
â”‚   â”‚   â”œâ”€â”€ 002-auth-design.md
â”‚   â”‚   â”œâ”€â”€ 003-storage-strategy.md
â”‚   â”‚   â”œâ”€â”€ 004-payment-providers.md
â”‚   â”‚   â””â”€â”€ 005-email-service.md
â”‚   â””â”€â”€ templates/                      # Doc templates
â”‚       â”œâ”€â”€ feature-doc.md
â”‚       â”œâ”€â”€ adr.md
â”‚       â””â”€â”€ runbook.md
â”‚
â”œâ”€â”€ planning/                           # Active work â€” NOT shipped yet
â”‚   â”œâ”€â”€ README.md
â”‚   â””â”€â”€ component-reorg/
â”‚       â””â”€â”€ tasks.md
â”‚
â”œâ”€â”€ releases/                           # Version history and changelogs
â”‚   â”œâ”€â”€ README.md
â”‚   â””â”€â”€ CHANGELOG.md
â”‚
â””â”€â”€ archive/                            # Historical docs with ongoing educational value
    â”œâ”€â”€ README.md                       # Manifest: what's here and why
    â”œâ”€â”€ payments/                       # Archived payment docs
    â”‚   â””â”€â”€ payment-mode-removal-fix.md
    â”œâ”€â”€ homepage-cms/                   # Archived CMS docs
    â”‚   â””â”€â”€ (only docs with historical value)
    â”œâ”€â”€ receipts/                       # Archived receipt docs
    â”‚   â””â”€â”€ receipt-system-files.txt
    â””â”€â”€ legacy/                         # Other archived docs
        â””â”€â”€ (only docs with historical value)
```

### Why This Structure

| Folder | Responsibility | Why It Exists |
|--------|---------------|---------------|
| `getting-started/` | Onboarding | New contributors need a clear entry point. Every professional project has one. |
| `architecture/` | System-wide design | Cross-cutting concerns (auth, DB, email, storage) don't belong to any single feature. |
| `features/` | Feature documentation | The product is organized by features. Docs should mirror the product. |
| `operations/` | Deployment, security, incidents | Operational concerns are distinct from feature docs and architecture. |
| `standards/` | Team conventions, ADRs, templates | Institutional knowledge about HOW we work, not WHAT we built. |
| `planning/` | Active work | Separates "what we're building" from "what we built." |
| `releases/` | Version history | Changelogs and release notes have a clear home. |
| `archive/` | Historical value | Organized by feature area, not a dumping ground. |

### What Was Removed

| Previous Folder | Disposition | Reason |
|----------------|-------------|--------|
| `how-to/` | Eliminated | How-to content lives within its feature or system area. No more scattering. |
| `payments-v2/` | Merged into `features/payments/` | "v2" is a filename anti-pattern. Content merged with existing payment docs. |
| `conference-docs/` | Merged into `features/conference/reference/` | Conference is a feature, not a standalone top-level concern. |
| `new-conference/` | Merged into `features/conference/dynamic-form/` | Active planning lives within the feature it plans. |
| `donations/admin/` | Kept within `features/donations/` | Admin is a sub-area of donations. |
| `future-improvements/` | Merged into `archive/payments/` | Single doc, not a category. |
| `component-reorg/` | Moved to `planning/component-reorg/` | Active planning, not a feature. |
| `plans/` | Merged into `planning/` | Single doc, absorbed into planning folder. |
| `api/` | Merged into `architecture/` | API docs are system-wide architecture, not a standalone folder. |

---

## 3. Naming Standard

### Rules

| Rule | Standard | Example | Reasoning |
|------|----------|---------|-----------|
| **Casing** | `kebab-case` for all filenames | `credential-rotation-guide.md` | URL-friendly, terminal-friendly, consistent with codebase |
| **README.md** | Only allowed filename exception | `README.md` | Universal convention; tools expect it |
| **No status words** | Never `COMPLETE`, `FINAL`, `DONE` | `phase-2-implementation.md` | Status belongs in frontmatter, not filenames |
| **No dates** | Never `2026-03-15-*.md` | `rate-limiting.md` | Dates belong in frontmatter `last_updated` |
| **No version suffixes** | Never `_v2`, `_V2`, `-v2` | `payment-system.md` | Versioning belongs in frontmatter or ADRs |
| **No SCREAMING_SNAKE** | Always kebab-case | `deployment-guide.md` | Professional, readable, web-standard |
| **Numbered prefixes** | Only for ordered sequences | `001-use-supabase.md` | ADRs, conference reference suite, ordered guides |
| **File length** | Max 4 words in filename | `receipt-access-control.md` | Longer names indicate the doc should be split |

### Numbered Prefix Rules (for ADRs and ordered suites)

- Format: `NNN-kebab-case.md` (3-digit zero-padded)
- Numbers are sequential, never skipped
- Once assigned, a number is never reused even if the ADR is superseded
- Conference reference suite keeps existing numbering (00-11) for backward compatibility

---

## 4. Document Lifecycle

Every document exists in exactly one lifecycle state. State is declared in frontmatter, never in filenames.

### States

| State | Meaning | When to Use |
|-------|---------|-------------|
| `planning` | Being designed, not yet implemented | Active planning docs, design documents |
| `active` | Current, maintained, authoritative | The primary state for most documentation |
| `reference` | Stable, rarely changes, informational | Architecture docs, schema references, API specs |
| `operational` | Used during operations, may change frequently | Runbooks, deployment checklists, troubleshooting |
| `deprecated` | Superseded but not yet removed | Old docs that have a newer version |
| `archived` | Historical value, no longer maintained | Moved to archive/ with clear rationale |
| `deleted` | Removed from the repository | Completion summaries with no value, obsolete status reports |

### Lifecycle Rules

1. Every document must have a `status` field in frontmatter
2. Status transitions must be documented in commit messages
3. `deprecated` documents must include `superseded_by` pointing to the replacement
4. `archived` documents must include `archive_reason` explaining why they were archived
5. `deleted` documents are removed from the repository entirely â€” no archive needed
6. Documents in `planning` status should be reviewed every 30 days
7. Documents in `active` status should be reviewed every 90 days

---

## 5. Frontmatter Standard

### Required Fields

```yaml
---
title: "Payment System Architecture"
description: "System-wide design of the payment processing pipeline, provider abstraction, and security model."
owner: "Tech Team"
status: active            # planning | active | reference | operational | deprecated | archived
category: architecture   # getting-started | architecture | feature | operations | standards | planning | release
last_updated: 2026-07-22
---
```

### Optional Fields (use when applicable)

```yaml
feature: payments              # Which feature this doc belongs to (for category: feature)
audience: developer            # developer | operator | admin | contributor | executive
review_cycle: quarterly        # quarterly | monthly | yearly | none
tags: [payments, stripe, security]
related:                       # Links to related docs (relative paths)
  - ../features/payments/stripe-setup.md
  - ./receipt-system.md
supersedes: payments-v2/rate-limiting-old.md    # This doc replaces that one
superseded_by: features/payments/new-guide.md  # This doc is replaced by that one
archive_reason: "Superseded by comprehensive payment architecture doc"
```

### Why These Fields

| Field | Purpose | Who Uses It |
|-------|---------|-------------|
| `title` | Human-readable title | Everyone |
| `description` | One-line summary for search/navigation | Everyone |
| `owner` | Who maintains this doc | Team leads, new contributors |
| `status` | Lifecycle state | Automation, reviewers |
| `category` | Top-level folder classification | Search, navigation |
| `feature` | Feature area (for feature docs) | Feature leads |
| `audience` | Who should read this | New contributors finding relevant docs |
| `review_cycle` | When to review | Documentation maintenance |
| `last_updated` | Freshness indicator | Everyone |
| `tags` | Search keywords | Search, filtering |
| `related` | Cross-references | Navigation, discovery |
| `supersedes` | What this doc replaces | Tracking doc evolution |
| `superseded_by` | What replaced this doc | Finding current docs |

### Fields Intentionally Omitted

| Field | Why Not |
|-------|---------|
| `version` | Use git for versioning, not frontmatter |
| `created_date` | Git history has this; redundant in frontmatter |
| `author` | Git blame has this; `owner` is more useful |
| `type` | Redundant with `category` |

---

## 6. Architecture Decision Records

### When to Write an ADR

Write an ADR when:
- Choosing between multiple technical approaches
- Adopting a new technology or service
- Defining a standard or convention
- Making a decision that affects the whole team
- A decision that would surprise a new contributor

### ADR Structure

```markdown
# NNN: Short Title

**Status:** accepted | superseded | deprecated
**Date:** YYYY-MM-DD
**Deciders:** List of people involved

## Context

What is the issue that motivates this decision?

## Decision

What is the change being proposed or decided?

## Consequences

What are the positive and negative outcomes?

## Alternatives Considered

What other options were evaluated?
```

### Numbering Rules

- Sequential, zero-padded to 3 digits: `001`, `002`, `003`
- Never reuse a number, even if the ADR is superseded
- Superseded ADRs get `status: superseded` and point to the replacement

### Initial ADRs to Create

| # | Title | Source Material |
|---|-------|----------------|
| 001 | Use Supabase as Backend | Implicit in tech stack choice |
| 002 | Authentication Design (Supabase Auth + RBAC) | From `BACKEND_ANALYSIS.md` |
| 003 | Storage Strategy (Supabase Storage) | From `STORAGE_SETUP_GUIDE.md` |
| 004 | Payment Provider Selection (Stripe, Khalti, eSewa) | From payment docs |
| 005 | Email Service (Resend/SendGrid) | From receipt system docs |

---

## 7. Release Documentation Strategy

### Problem

The current docs have ~20 "COMPLETE" and "SUMMARY" files that are really completion reports from past work sessions. These are not documentation â€” they're session artifacts.

### Strategy

| Document Type | Current State | New Home |
|--------------|---------------|----------|
| Completion reports with zero long-term value | Scattered in docs/ | **Deleted** â€” no archive needed |
| Completion reports with architectural insight | Mixed in docs/ | **Merged** into canonical feature docs or `releases/CHANGELOG.md` |
| Status reports | Mixed in docs/ | **Deleted** â€” current status is in code, not docs |
| Implementation summaries | Mixed in docs/ | **Merged** into canonical feature docs |

### CHANGELOG Format

```markdown
# Changelog

## [Unreleased]

### Added
- Feature X with Y capability

### Changed
- Updated payment flow for better error handling

### Fixed
- Receipt generation bug on edge cases

### Removed
- Deprecated mock payment mode

## [2026-03-15] - Receipt System Launch
...
```

### Rules

- Only user-facing or architecturally significant changes go in CHANGELOG
- Internal implementation details do NOT go in CHANGELOG
- Each entry links to the relevant feature doc or ADR
- CHANGELOG follows [Keep a Changelog](https://keepachangelog.com/) format

---

## 8. Duplicate Consolidation Plan

### Cluster 1: Receipt System (12+ files)

| File | Action | Reason |
|------|--------|--------|
| `RECEIPT_SYSTEM.md` | **CANONICAL** â†’ `architecture/receipt-system.md` | Comprehensive system design |
| `RECEIPT_SYSTEM_SETUP.md` | **MERGE** into `features/payments/receipt-implementation.md` | Setup is part of implementation |
| `RECEIPT_SYSTEM_IMPLEMENTATION.md` | **MERGE** into `features/payments/receipt-implementation.md` | Duplicate of setup guide |
| `RECEIPT_SYSTEM_COMPLETE.md` | **DELETE** | Completion summary, no ongoing value |
| `RECEIPT_SYSTEM_FILES.txt` | **ARCHIVE** â†’ `archive/receipts/` | Historical file listing |
| `RECEIPT_SYSTEM_GOOGLE_EMAIL_READY.md` | **DELETE** | Status report, no value |
| `RECEIPT_SYSTEM_NOW_WORKING.md` | **DELETE** | Status report, no value |
| `RECEIPT_DEPLOYMENT_GUIDE.md` | **CANONICAL** â†’ `features/payments/receipt-deployment.md` | Deployment guide |
| `RECEIPT_GENERATION_TROUBLESHOOTING.md` | **CANONICAL** â†’ `features/payments/receipt-troubleshooting.md` | Troubleshooting |
| `RECEIPT_QUICK_FIX.md` | **DELETE** | Superseded |
| `RECEIPT_STAMP_VERIFICATION_PLAN.md` | **CANONICAL** â†’ `features/payments/receipt-stamp-verification.md` | Active guide |
| `RECEIPT_URL_FIX.md` | **DELETE** | Historical fix, no ongoing value |
| `RECEIPT_WEBHOOK_INTEGRATION.md` | **CANONICAL** â†’ `features/payments/receipt-webhook-integration.md` | Integration guide |
| `payments-v2/RECEIPT_ACCESS_CONTROL_IMPLEMENTATION.md` | **CANONICAL** â†’ `features/payments/receipt-access-control.md` | Security reference |
| `payments-v2/RECEIPT_TOKEN_MIGRATION.md` | **CANONICAL** â†’ `features/payments/receipt-token-migration.md` | Migration guide |
| `payments-v2/RECEIPT_TOKEN_QUICK_START.md` | **MERGE** into receipt-token-migration.md | Quick start is subset of migration |
| `VERCEL_RECEIPT_DEPLOYMENT_CHECKLIST.md` | **MERGE** into receipt-deployment.md | Duplicate deployment content |

**Result:** 17 files â†’ 6 canonical files + 1 archive + 10 deleted

### Cluster 2: Homepage CMS (25 files)

| File | Action | Reason |
|------|--------|--------|
| `README_HOMEPAGE_CMS.md` | **CANONICAL** â†’ `features/homepage-cms/README.md` | Best overview (423 lines) |
| `QUICK_START_HOMEPAGE_CMS.md` | **CANONICAL** â†’ `features/homepage-cms/quick-start.md` | Quick start guide |
| `HOMEPAGE_CONTENT_MANAGEMENT.md` | **CANONICAL** â†’ `features/homepage-cms/content-management.md` | Content management reference |
| `IMPACT_PAGE_CMS_INTEGRATION.md` | **CANONICAL** â†’ `features/homepage-cms/impact-page.md` | Specific integration |
| All other 21 files | **DELETE** | Completion summaries, status reports, duplicate quick starts |
| `DEPLOYMENT_CHECKLIST.md:384` reference | **FIX** | Update broken link to new canonical doc |

**Result:** 25 files â†’ 4 canonical files + 21 deleted

### Cluster 3: Podcast System (5 files)

| File | Action | Reason |
|------|--------|--------|
| `PODCAST_SYSTEM_IMPLEMENTATION.md` | **CANONICAL** â†’ `features/podcasts/implementation.md` | Main implementation doc |
| `PODCAST_HIGHLIGHTS_IMPLEMENTATION.md` | **CANONICAL** â†’ `features/podcasts/highlights.md` | Highlights feature |
| `PODCAST_COMPLETE_SUMMARY.md` | **DELETE** | Completion summary |
| `PODCAST_KEY_TOPICS_IMPLEMENTATION.md` | **MERGE** into implementation.md | Subset of main doc |

**Result:** 5 files â†’ 2 canonical files + 2 deleted + 1 merged

### Cluster 4: Testimonials (5 files)

| File | Action | Reason |
|------|--------|--------|
| `TESTIMONIALS_IMAGE_UPLOAD.md` | **CANONICAL** â†’ `features/testimonials/image-upload.md` | Feature doc |
| `TESTIMONIALS_UI_IMPROVEMENTS.md` | **CANONICAL** â†’ `features/testimonials/ui-improvements.md` | Feature doc |
| `ADMIN_GUIDE_TESTIMONIALS_UPLOAD.md` | **CANONICAL** â†’ `features/testimonials/admin-upload-guide.md` | Admin guide |
| `TESTIMONIAL_DELETION_CONFIRMATION.md` | **DELETE** | Status report |
| `PHOTO_WALL_ADMIN.md` | **CANONICAL** â†’ `features/media/photo-wall-admin.md` | Feature doc |

**Result:** 5 files â†’ 4 canonical files + 1 deleted

### Cluster 5: Stripe/Payment Fixes (multiple files)

| File | Action | Reason |
|------|--------|--------|
| `STRIPE_SETUP_GUIDE.md` | **CANONICAL** â†’ `features/payments/stripe-setup.md` | Setup guide |
| `STRIPE_PAYMENT_INTENT_ANALYSIS.md` | **CANONICAL** â†’ `features/payments/stripe-payment-intent-analysis.md` | Analysis |
| `STRIPE_WEBHOOK_TROUBLESHOOTING.md` | **CANONICAL** â†’ `features/payments/stripe-webhook-troubleshooting.md` | Troubleshooting |
| `PAYMENT_STATUS_FIX.md` | **DELETE** | Historical fix |
| `PAYMENT_SYSTEM_AUDIT.md` | **CANONICAL** â†’ `features/payments/system-audit.md` | Audit doc |
| `KHALTI_INTEGRATION.md` | **CANONICAL** â†’ `features/payments/khalti-integration.md` | Integration doc |
| `ESEWA_INTEGRATION.md` | **CANONICAL** â†’ `features/payments/esewa-integration.md` | Integration doc |
| `GO_LIVE_PAYMENTS.md` | **CANONICAL** â†’ `features/payments/go-live-checklist.md` | Checklist |

**Result:** 8 files â†’ 7 canonical files + 1 deleted

### Cluster 6: Theme/Brand (5 files)

| File | Action | Reason |
|------|--------|--------|
| `NEW_THEME_README.md` | **CANONICAL** â†’ `features/theme/new-theme.md` | Theme overview |
| `NEW_BRAND_THEME_PLAN.md` | **MERGE** into new-theme.md | Plan is subset of overview |
| `THEME_MIGRATION_GUIDE.md` | **CANONICAL** â†’ `features/theme/theme-migration.md` | Migration guide |
| `VISUAL_SETUP_GUIDE.md` | **CANONICAL** â†’ `features/theme/visual-setup.md` | Visual setup |
| `tailwind-ocean-theme-config.ts` | **CANONICAL** â†’ `features/theme/tailwind-config.ts` | Code reference |

**Result:** 5 files â†’ 4 canonical files + 1 merged

### Cluster 7: SQL Scripts (3 files)

| File | Action | Reason |
|------|--------|--------|
| `SQL_SCRIPT_11_COPY_PASTE.md` | **DELETE** | Historical fix |
| `SQL_SCRIPT_11_ERROR_FIXED.md` | **DELETE** | Historical fix |
| `SQL_SCRIPT_11_FIX.md` | **DELETE** | Historical fix |

**Result:** 3 files â†’ 0 (all deleted)

### Cluster 8: Google Email (5 files)

| File | Action | Reason |
|------|--------|--------|
| `GOOGLE_EMAIL_SETUP.md` | **CANONICAL** â†’ `getting-started/google-email-setup.md` | Setup guide (cross-cutting) |
| `GOOGLE_EMAIL_SETUP_SUMMARY.md` | **MERGE** into setup.md | Duplicate |
| `START_HERE_GOOGLE_EMAIL.md` | **DELETE** | Redirect, not real doc |
| `INDEX_GOOGLE_EMAIL_SETUP.md` | **DELETE** | Index, not real doc |
| `QUICK_DEPLOYMENT_GOOGLE_EMAIL.md` | **DELETE** | Quick ref, superseded |

**Result:** 5 files â†’ 1 canonical file + 1 merged + 3 deleted

### Cluster 9: V1 Cleanup (3 files)

| File | Action | Reason |
|------|--------|--------|
| `V1_CLEANUP_ANALYSIS.md` | **ARCHIVE** â†’ `archive/legacy/` | Historical analysis |
| `V1_CLEANUP_COMPLETED.md` | **DELETE** | Completion summary |
| `deployment/V1_CLEANUP_GUIDE.md` | **CANONICAL** â†’ `operations/deployment/v1-cleanup-guide.md` | Active guide |

**Result:** 3 files â†’ 1 canonical + 1 archive + 1 deleted

### Consolidation Summary

| Cluster | Before | Canonical | Merged | Archived | Deleted |
|---------|--------|-----------|--------|----------|---------|
| Receipt System | 17 | 6 | 3 | 1 | 10 |
| Homepage CMS | 25 | 4 | 0 | 0 | 21 |
| Podcasts | 5 | 2 | 1 | 0 | 2 |
| Testimonials | 5 | 4 | 0 | 0 | 1 |
| Payment Fixes | 8 | 7 | 0 | 0 | 1 |
| Theme/Brand | 5 | 4 | 1 | 0 | 0 |
| SQL Scripts | 3 | 0 | 0 | 0 | 3 |
| Google Email | 5 | 1 | 1 | 0 | 3 |
| V1 Cleanup | 3 | 1 | 0 | 1 | 1 |
| **Total** | **76** | **29** | **6** | **2** | **42** |

**Net reduction:** 76 files â†’ 29 canonical + 2 archived + 37 deleted

---

## 9. Archive Strategy

### Principles

1. **Archive is not deletion.** Archived docs are still in the repo and searchable.
2. **Archive is not a dump.** Every archived doc must have a clear reason.
3. **Archive mirrors live structure.** Organized by feature area, not flat.
4. **Archive has a manifest.** `archive/README.md` explains what's there and why.
5. **Completion summaries are deleted, not archived.** They have zero long-term value.
6. **Status reports are deleted, not archived.** Current status is in code, not docs.

### What Gets Archived

| Category | Example | Reason |
|----------|---------|--------|
| Historical analysis | `V1_CLEANUP_ANALYSIS.md` | Shows how we evaluated a decision |
| Pre-refactor architecture | `future-improvements/payment-mode-removal-fix.md` | Documents a significant refactor |
| Old schema docs | `receipt-system-files.txt` | Historical file listing |
| Superseded guides | `homepage-cms/` docs with current replacements | May contain details dropped from new versions |

### What Gets Deleted (NOT Archived)

| Category | Example | Reason |
|----------|---------|--------|
| Completion summaries | `RECEIPT_SYSTEM_COMPLETE.md` | No ongoing value |
| Status reports | `RECEIPT_SYSTEM_NOW_WORKING.md` | Status is in code |
| Phase completion | `HOMEPAGE_CMS_PHASE1_COMPLETE.md` | Historical milestone, no value |
| Quick fixes | `RECEIPT_QUICK_FIX.md` | Superseded |
| Duplicate quick starts | `QUICK_DEPLOYMENT_GOOGLE_EMAIL.md` | Redundant |
| SQL script fixes | `SQL_SCRIPT_11_*.md` | All 3 are historical fixes |
| Merge confirmations | `MERGE_COMPLETE.md` | No value |

### Archive Manifest

```markdown
# Archive

This folder contains documentation with historical value that is no longer actively maintained.

## Contents

### payments/
- `payment-mode-removal-fix.md` â€” Documents the 2026-03 refactor that removed PAYMENT_MODE env var

### homepage-cms/
- (Currently empty â€” 21 docs were deleted, not archived)

### receipts/
- `receipt-system-files.txt` â€” Historical file listing from initial receipt system implementation

### legacy/
- `v1-cleanup-analysis.md` â€” Analysis of v1 codebase cleanup decisions

## Policy

- Archived docs are NOT updated
- Archived docs may contain outdated information
- For current docs, see the main docs/ folders
- To archive a doc: add `archive_reason` to frontmatter, move to appropriate subfolder
- To unarchive: move back to live docs, remove `archive_reason`, update `status` to `active`
```

---

## 10. Client Handover Gap Analysis

### What a New Client/Developer Needs to Know

| Question | Current Coverage | Gap |
|----------|-----------------|-----|
| What does this application do? | README.md â€” decent | **Minor gap** â€” README covers features well |
| How do I set up the dev environment? | README.md â€” basic | **Gap** â€” needs dedicated getting-started/development-setup.md |
| How is the system architected? | Nowhere | **CRITICAL GAP** â€” no architecture overview |
| How does authentication work? | Scattered across payment docs | **CRITICAL GAP** â€” no dedicated auth doc |
| How does the database work? | `DATABASE_MIGRATION_GUIDE.md` | **Gap** â€” no schema overview, no RLS documentation |
| How do payments work? | `payments-v2/PAYMENT_ARCHITECTURE_V2_README.md` | **Partial** â€” exists but buried and has broken refs |
| How do I deploy? | `deployment/DEPLOYMENT_GUIDE.md` | **Adequate** â€” could be better organized |
| How do I troubleshoot issues? | Scattered troubleshooting docs | **Gap** â€” no systematic troubleshooting guide |
| Why were technical decisions made? | Nowhere | **CRITICAL GAP** â€” no ADRs |
| What are the coding standards? | Nowhere | **CRITICAL GAP** â€” no standards doc |
| How do I write documentation? | Nowhere | **Gap** â€” no documentation standards |
| What environment variables exist? | Referenced but file doesn't exist | **CRITICAL GAP** â€” `ENVIRONMENT_VARIABLES.md` was never created |
| What's the API design? | `api/PAYMENT_API.md` (partial) | **Gap** â€” no general API design standards |
| How does email sending work? | Scattered in receipt docs | **Gap** â€” no dedicated email system doc |
| How does file storage work? | `STORAGE_SETUP_GUIDE.md` | **Partial** â€” exists but minimal |

### Priority Gaps to Fill

1. **`architecture/overview.md`** â€” High-level system architecture (MISSING â€” must create)
2. **`architecture/authentication.md`** â€” Auth system design (MISSING â€” must create)
3. **`getting-started/environment-variables.md`** â€” All env vars (MISSING â€” referenced but never created)
4. **`standards/decisions/`** â€” ADRs (MISSING â€” must create)
5. **`standards/coding-standards.md`** â€” Team conventions (MISSING â€” must create)
6. **`architecture/database.md`** â€” Schema and RLS overview (MISSING â€” must create)
7. **`architecture/email-system.md`** â€” Email architecture (MISSING â€” must create)

### What Exists and Is Adequate

- README.md â€” Good project overview
- `deployment/DEPLOYMENT_GUIDE.md` â€” Good deployment guide
- `operations/CREDENTIAL_ROTATION_GUIDE.md` â€” Excellent security doc
- `conference-docs/` suite â€” Excellent reference documentation
- `features/story-editor/` â€” Good feature documentation

---

## 11. README Hierarchy

### Navigation Design

Every folder with 3+ documents gets a `README.md` that serves as a local index. The top-level `docs/README.md` is the documentation homepage.

### docs/README.md â€” Documentation Homepage

```markdown
# Documentation

> Deessa Foundation â€” Technical Documentation

## Quick Links

- **New here?** Start with [Getting Started](getting-started/)
- **Need to understand the system?** See [Architecture](architecture/)
- **Looking for a specific feature?** Browse [Features](features/)
- **Deploying or operating?** See [Operations](operations/)
- **Making decisions?** Check [Standards & ADRs](standards/)

## Documentation Map

### [Getting Started](getting-started/)
Development setup, environment variables, project structure.

### [Architecture](architecture/)
System design, authentication, database, payment architecture, email, storage.

### [Features](features/)
Feature-specific documentation organized by feature area.
- [Payments](features/payments/) â€” Stripe, Khalti, eSewa integrations
- [Donations](features/donations/) â€” Donation management and admin
- [Conference](features/conference/) â€” Registration and event management
- [Homepage CMS](features/homepage-cms/) â€” Content management system
- [Story Editor](features/story-editor/) â€” Rich text story editing
- [Testimonials](features/testimonials/) â€” Testimonial management
- [SEO](features/seo/) â€” Sitemaps, robots, domain management
- [Podcasts](features/podcasts/) â€” Podcast system
- [Theme](features/theme/) â€” Brand theme and styling

### [Operations](operations/)
Deployment guides, security procedures, runbooks.

### [Standards](standards/)
Coding standards, ADRs, documentation standards, templates.

### [Planning](planning/)
Active work-in-progress documentation.

### [Releases](releases/)
Changelog and release notes.

### [Archive](archive/)
Historical documentation with ongoing educational value.
```

### Subfolder README Pattern

Each feature README follows this template:

```markdown
# Feature Name

> One-line description.

## Overview

2-3 paragraph overview of the feature.

## Documentation

| Document | Description | Status |
|----------|-------------|--------|
| [Guide Name](guide.md) | What it covers | Active |

## Quick Links

- Related architecture: [link](../../architecture/relevant.md)
- Related operations: [link](../../operations/relevant.md)
```

---

## 12. Migration Mapping Table

### getting-started/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `getting-started/README.md` | **CREATE** | active |
| (MISSING) | `getting-started/development-setup.md` | **CREATE** | active |
| (MISSING) | `getting-started/environment-variables.md` | **CREATE** (fix broken ref from lib/) | active |
| (MISSING) | `getting-started/project-structure.md` | **CREATE** (extract from README.md) | active |
| `GOOGLE_EMAIL_SETUP.md` | `getting-started/google-email-setup.md` | MOVE + rename | reference |

### architecture/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `architecture/README.md` | **CREATE** | active |
| (MISSING) | `architecture/overview.md` | **CREATE** | reference |
| (MISSING) | `architecture/authentication.md` | **CREATE** | reference |
| (MISSING) | `architecture/database.md` | **CREATE** | reference |
| (MISSING) | `architecture/email-system.md` | **CREATE** | reference |
| (MISSING) | `architecture/storage.md` | **CREATE** | reference |
| (MISSING) | `architecture/api-design.md` | **CREATE** | reference |
| `BACKEND_ANALYSIS.md` | `architecture/backend-analysis.md` | MOVE + rename | reference |
| `CURRENCY_HANDLING.md` | `architecture/currency-handling.md` | MOVE + rename | reference |
| `GUEST_CARD_ENHANCEMENT_IMPLEMENTATION.md` | `architecture/guest-card-enhancement.md` | MOVE + rename | reference |
| `CONFERENCE_DYNAMIC_FORM_ANALYSIS.md` | `architecture/conference-dynamic-form-analysis.md` | MOVE + rename | reference |
| `payments-v2/PAYMENT_ARCHITECTURE_V2_README.md` | `architecture/payment-system.md` | MOVE + rename | reference |
| `RECEIPT_SYSTEM.md` | `architecture/receipt-system.md` | MOVE + rename | reference |
| `api/PAYMENT_API.md` | `architecture/payment-api.md` | MOVE + rename | reference |

### features/payments/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `features/payments/README.md` | **CREATE** | active |
| `STRIPE_SETUP_GUIDE.md` | `features/payments/stripe-setup.md` | MOVE + rename | active |
| `KHALTI_INTEGRATION.md` | `features/payments/khalti-integration.md` | MOVE + rename | reference |
| `ESEWA_INTEGRATION.md` | `features/payments/esewa-integration.md` | MOVE + rename | reference |
| `GO_LIVE_PAYMENTS.md` | `features/payments/go-live-checklist.md` | MOVE + rename | reference |
| `STRIPE_PAYMENT_INTENT_ANALYSIS.md` | `features/payments/stripe-payment-intent-analysis.md` | MOVE + rename | reference |
| `STRIPE_WEBHOOK_TROUBLESHOOTING.md` | `features/payments/stripe-webhook-troubleshooting.md` | MOVE + rename | active |
| `PAYMENT_SYSTEM_AUDIT.md` | `features/payments/system-audit.md` | MOVE + rename | reference |
| `payments-v2/RATE_LIMITING.md` | `features/payments/rate-limiting.md` | MOVE + rename | reference |
| `payments-v2/RATE_LIMITING_IMPLEMENTATION.md` | `features/payments/rate-limiting-implementation.md` | MOVE + rename | reference |
| `payments-v2/RECONCILIATION.md` | `features/payments/reconciliation.md` | MOVE + rename | reference |
| `payments-v2/REQUIREMENTS_VERIFICATION_REPORT.md` | `features/payments/requirements-verification.md` | MOVE + rename | reference |
| `payments-v2/RECEIPT_ACCESS_CONTROL_IMPLEMENTATION.md` | `features/payments/receipt-access-control.md` | MOVE + rename | reference |
| `payments-v2/RECEIPT_TOKEN_MIGRATION.md` | `features/payments/receipt-token-migration.md` | MOVE + rename | reference |
| `payments-v2/RECEIPT_TOKEN_QUICK_START.md` | (MERGE into receipt-token-migration.md) | MERGE | â€” |
| `RECEIPT_DEPLOYMENT_GUIDE.md` | `features/payments/receipt-deployment.md` | MOVE + rename | active |
| `RECEIPT_GENERATION_TROUBLESHOOTING.md` | `features/payments/receipt-troubleshooting.md` | MOVE + rename | active |
| `RECEIPT_STAMP_VERIFICATION_PLAN.md` | `features/payments/receipt-stamp-verification.md` | MOVE + rename | reference |
| `RECEIPT_SYSTEM_SETUP.md` | (MERGE into receipt-implementation.md) | MERGE | â€” |
| `RECEIPT_SYSTEM_IMPLEMENTATION.md` | `features/payments/receipt-implementation.md` | MOVE + rename | reference |
| `RECEIPT_WEBHOOK_INTEGRATION.md` | `features/payments/receipt-webhook-integration.md` | MOVE + rename | reference |
| `VERCEL_RECEIPT_DEPLOYMENT_CHECKLIST.md` | (MERGE into receipt-deployment.md) | MERGE | â€” |

### features/donations/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `features/donations/README.md` | **CREATE** | active |
| `donations/README.md` | `features/donations/README.md` | MOVE + merge | reference |
| `donations/admin/API.md` | `features/donations/admin/API.md` | MOVE | reference |
| `donations/admin/README.md` | `features/donations/admin/README.md` | MOVE | reference |
| `donations/admin/USER_GUIDE.md` | `features/donations/admin/USER_GUIDE.md` | MOVE + rename | reference |
| `donations/DEPLOYMENT_GUIDE_STRIPE_ENHANCEMENT.md` | `features/donations/stripe-enhancement-deployment.md` | MOVE + rename | reference |
| `donations/SCHEMA_ANALYSIS_AND_FINAL_SOLUTION.md` | `features/donations/schema-analysis.md` | MOVE + rename | reference |
| `donations/STRIPE_PAYMENT_INTENT_PROFESSIONAL_SOLUTION.md` | `features/donations/stripe-payment-intent-solution.md` | MOVE + rename | reference |
| `donations/VERIFICATION_CHECKLIST.md` | `features/donations/verification-checklist.md` | MOVE + rename | reference |
| `donations/QUICK_REFERENCE.md` | `features/donations/quick-reference.md` | MOVE + rename | reference |

### features/conference/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `features/conference/README.md` | **CREATE** | active |
| `conference-docs/README.md` | `features/conference/reference/README.md` | MOVE | reference |
| `conference-docs/00-executive-summary.md` | `features/conference/reference/00-executive-summary.md` | MOVE | reference |
| `conference-docs/01-overview.md` | `features/conference/reference/01-overview.md` | MOVE | reference |
| `conference-docs/02-architecture.md` | `features/conference/reference/02-architecture.md` | MOVE | reference |
| `conference-docs/03-database-schema.md` | `features/conference/reference/03-database-schema.md` | MOVE | reference |
| `conference-docs/04-page-documentation.md` | `features/conference/reference/04-page-documentation.md` | MOVE | reference |
| `conference-docs/05-api-documentation.md` | `features/conference/reference/05-api-documentation.md` | MOVE | reference |
| `conference-docs/06-payment-flows.md` | `features/conference/reference/06-payment-flows.md` | MOVE | reference |
| `conference-docs/07-admin-documentation.md` | `features/conference/reference/07-admin-documentation.md` | MOVE | reference |
| `conference-docs/08-security.md` | `features/conference/reference/08-security.md` | MOVE | reference |
| `conference-docs/09-deployment-operations.md` | `features/conference/reference/09-deployment-operations.md` | MOVE | reference |
| `conference-docs/10-improvements-risks.md` | `features/conference/reference/10-improvements-risks.md` | MOVE | reference |
| `conference-docs/11-appendix.md` | `features/conference/reference/11-appendix.md` | MOVE | reference |
| `conference-docs/Master-Doc.md` | `features/conference/reference/Master-Doc.md` | MOVE | reference |
| `new-conference/tasks.md` | `features/conference/dynamic-form/tasks.md` | MOVE | planning |
| `new-conference/PHASE_2_COMPLETE.md` | `features/conference/dynamic-form/phase-2-complete.md` | MOVE | active |
| `new-conference/PHASE_2_IMPLEMENTATION.md` | `features/conference/dynamic-form/phase-2-implementation.md` | MOVE | active |
| `new-conference/PHASE_2_VISUAL_GUIDE.md` | `features/conference/dynamic-form/phase-2-visual-guide.md` | MOVE | active |
| `new-conference/PHASE_3_COMPLETE.md` | `features/conference/dynamic-form/phase-3-complete.md` | MOVE | active |

### features/homepage-cms/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `features/homepage-cms/README.md` | **CREATE** (consolidate best content) | active |
| `homepage-cms-integrations/README_HOMEPAGE_CMS.md` | `features/homepage-cms/README.md` | MOVE + rename | reference |
| `homepage-cms-integrations/HOMEPAGE_CONTENT_MANAGEMENT.md` | `features/homepage-cms/content-management.md` | MOVE + rename | reference |
| `homepage-cms-integrations/IMPACT_PAGE_CMS_INTEGRATION.md` | `features/homepage-cms/impact-page.md` | MOVE + rename | reference |
| `homepage-cms-integrations/QUICK_START_HOMEPAGE_CMS.md` | `features/homepage-cms/quick-start.md` | MOVE + rename | reference |
| All other 21 homepage-cms files | â€” | **DELETE** | â€” |

### features/story-editor/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `features/story-editor/README.md` | **CREATE** | active |
| `story-editor/README.md` | `features/story-editor/README.md` | MOVE | reference |
| `story-editor/admin-user-guide.md` | `features/story-editor/admin-user-guide.md` | MOVE | reference |
| `story-editor/developer-documentation.md` | `features/story-editor/developer-docs.md` | MOVE + rename | reference |
| `story-editor/IMPLEMENTATION_STATUS.md` | `features/story-editor/implementation-status.md` | MOVE + rename | reference |
| `story-editor/PRINT_FEATURE.md` | `features/story-editor/print-feature.md` | MOVE + rename | reference |
| `story-editor/PRINT_FEATURE_FIXES.md` | `features/story-editor/print-feature-fixes.md` | MOVE + rename | reference |
| `story-editor/PRINT_TROUBLESHOOTING.md` | `features/story-editor/print-troubleshooting.md` | MOVE + rename | reference |
| `story-editor/troubleshooting-guide.md` | `features/story-editor/troubleshooting.md` | MOVE + rename | reference |
| `story-editor/PRINT_FEATURE_COMPLETE.md` | â€” | **DELETE** | â€” |
| `story-editor/PRINT_FEATURE_SUMMARY.md` | â€” | **DELETE** | â€” |

### features/testimonials/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `TESTIMONIALS_IMAGE_UPLOAD.md` | `features/testimonials/image-upload.md` | MOVE + rename | reference |
| `TESTIMONIALS_UI_IMPROVEMENTS.md` | `features/testimonials/ui-improvements.md` | MOVE + rename | reference |
| `ADMIN_GUIDE_TESTIMONIALS_UPLOAD.md` | `features/testimonials/admin-upload-guide.md` | MOVE + rename | reference |

### features/seo/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `SEO_SITEMAP_ROBOTS_IMPLEMENTATION.md` | `features/seo/sitemap-robots.md` | MOVE + rename | reference |
| `SEO_DOMAIN_UPDATE_SUMMARY.md` | `features/seo/domain-update.md` | MOVE + rename | reference |
| `SITEMAP_CONFLICT_RESOLUTION.md` | `features/seo/sitemap-conflict.md` | MOVE + rename | reference |
| `SITEMAP_VERIFICATION_CHECKLIST.md` | `features/seo/verification-checklist.md` | MOVE + rename | reference |

### features/podcasts/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `PODCAST_SYSTEM_IMPLEMENTATION.md` | `features/podcasts/implementation.md` | MOVE + rename | reference |
| `PODCAST_HIGHLIGHTS_IMPLEMENTATION.md` | `features/podcasts/highlights.md` | MOVE + rename | reference |
| `PODCAST_KEY_TOPICS_IMPLEMENTATION.md` | (MERGE into implementation.md) | MERGE | â€” |
| `PODCAST_COMPLETE_SUMMARY.md` | â€” | **DELETE** | â€” |

### features/accessibility/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `ACCESSIBILITY_TOOLBAR_GUIDE.md` | `features/accessibility/toolbar-guide.md` | MOVE + rename | reference |

### features/media/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `IMAGE_CLEANUP_FEATURE.md` | `features/media/image-cleanup.md` | MOVE + rename | reference |
| `PHOTO_WALL_ADMIN.md` | `features/media/photo-wall-admin.md` | MOVE + rename | reference |
| `TOAST_NOTIFICATIONS.md` | `features/media/toast-notifications.md` | MOVE + rename | reference |
| `TIMELINE_COLOR_PICKER_FEATURE.md` | `features/media/timeline-color-picker.md` | MOVE + rename | reference |
| `TIMELINE_CMS_VERIFICATION.md` | â€” | **DELETE** | â€” |
| `INTRO_VIDEO_FIX.md` | â€” | **DELETE** | â€” |

### features/theme/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `NEW_THEME_README.md` | `features/theme/new-theme.md` | MOVE + rename | reference |
| `NEW_BRAND_THEME_PLAN.md` | (MERGE into new-theme.md) | MERGE | â€” |
| `THEME_MIGRATION_GUIDE.md` | `features/theme/theme-migration.md` | MOVE + rename | reference |
| `VISUAL_SETUP_GUIDE.md` | `features/theme/visual-setup.md` | MOVE + rename | reference |
| `tailwind-ocean-theme-config.ts` | `features/theme/tailwind-config.ts` | MOVE + rename | reference |

### operations/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `operations/README.md` | **CREATE** | active |
| `deployment/README.md` | `operations/deployment/README.md` | MOVE | reference |
| `deployment/DEPLOYMENT_GUIDE.md` | `operations/deployment/deployment-guide.md` | MOVE + rename | reference |
| `deployment/STAGING_DEPLOYMENT_CHECKLIST.md` | `operations/deployment/staging-checklist.md` | MOVE + rename | active |
| `deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md` | `operations/deployment/production-checklist.md` | MOVE + rename | active |
| `deployment/SMOKE_TEST_GUIDE.md` | `operations/deployment/smoke-test-guide.md` | MOVE + rename | reference |
| `deployment/INCREMENTAL_ROLLOUT_GUIDE.md` | `operations/deployment/incremental-rollout.md` | MOVE + rename | reference |
| `deployment/V1_CLEANUP_GUIDE.md` | `operations/deployment/v1-cleanup-guide.md` | MOVE + rename | reference |
| `VERCEL_PRODUCTION_DOMAIN_FIX.md` | `operations/deployment/vercel-domain-fix.md` | MOVE + rename | reference |
| `operations/README.md` | `operations/README.md` | KEEP | reference |
| `operations/CREDENTIAL_ROTATION_GUIDE.md` | `operations/security/credential-rotation-guide.md` | MOVE + rename | active |
| `operations/CREDENTIAL_ROTATION_CHECKLIST.md` | `operations/security/credential-rotation-checklist.md` | MOVE + rename | active |
| `operations/CREDENTIAL_ROTATION_IMPLEMENTATION.md` | `operations/security/credential-rotation-implementation.md` | MOVE + rename | reference |
| `operations/RUNBOOK.md` | `operations/runbook.md` | MOVE + rename | operational |
| `operations/github-actions-roadmap.md` | `operations/github-actions-roadmap.md` | KEEP | reference |

### standards/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `standards/README.md` | **CREATE** | active |
| (MISSING) | `standards/coding-standards.md` | **CREATE** | active |
| (MISSING) | `standards/documentation-standards.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/README.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/001-use-supabase.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/002-auth-design.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/003-storage-strategy.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/004-payment-providers.md` | **CREATE** | active |
| (MISSING) | `standards/decisions/005-email-service.md` | **CREATE** | active |
| (MISSING) | `standards/templates/feature-doc.md` | **CREATE** | active |
| (MISSING) | `standards/templates/adr.md` | **CREATE** | active |
| (MISSING) | `standards/templates/runbook.md` | **CREATE** | active |

### planning/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `planning/README.md` | **CREATE** | active |
| `component-reorg/tasks.md` | `planning/component-reorg/tasks.md` | MOVE | planning |
| `plans/story-editor-modernization-plan.md` | `planning/story-editor-modernization.md` | MOVE + rename | planning |

### releases/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| (MISSING) | `releases/README.md` | **CREATE** | active |
| (MISSING) | `releases/CHANGELOG.md` | **CREATE** | active |

### testing/

| Current Path | New Path | Action | Status |
|-------------|----------|--------|--------|
| `testing/RECEIPT_RENDERING_TEST_GUIDE.md` | `features/payments/receipt-rendering-test.md` | MOVE + rename | reference |
| `testing/VERIFICATION_E2E_TEST_GUIDE.md` | `operations/deployment/e2e-test-guide.md` | MOVE + rename | reference |

### Files to DELETE (not archive)

| File | Reason |
|------|--------|
| `RECEIPT_SYSTEM_COMPLETE.md` | Completion summary, no value |
| `RECEIPT_SYSTEM_GOOGLE_EMAIL_READY.md` | Status report |
| `RECEIPT_SYSTEM_NOW_WORKING.md` | Status report |
| `RECEIPT_QUICK_FIX.md` | Superseded |
| `RECEIPT_URL_FIX.md` | Historical fix |
| `HOMEPAGE_API_AUTH_FIX.md` | Historical fix |
| `HOMEPAGE_API_ROLE_CASE_FIX.md` | Historical fix |
| `HOMEPAGE_MANAGER_TOAST_FIX.md` | Historical fix |
| `PAYMENT_STATUS_FIX.md` | Historical fix |
| `TESTIMONIAL_DELETION_CONFIRMATION.md` | Status report |
| `TASK_6_COMPLETION_SUMMARY.md` | Completion summary |
| `deployment/TASK_28_COMPLETION_SUMMARY.md` | Completion summary |
| `deployment/DEPLOYMENT_SUMMARY.md` | Completion summary |
| `V1_CLEANUP_COMPLETED.md` | Completion summary |
| `SQL_SCRIPT_11_COPY_PASTE.md` | Historical fix |
| `SQL_SCRIPT_11_ERROR_FIXED.md` | Historical fix |
| `SQL_SCRIPT_11_FIX.md` | Historical fix |
| `START_HERE_GOOGLE_EMAIL.md` | Redirect, not real doc |
| `INDEX_GOOGLE_EMAIL_SETUP.md` | Index, not real doc |
| `QUICK_DEPLOYMENT_GOOGLE_EMAIL.md` | Superseded |
| `QUICK_START_HOMEPAGE_CMS.md` | Superseded |
| `APPLY_SETTINGS.md` | Unclear purpose, likely obsolete |
| `CURRENCY_FIX_QUICKSTART.md` | Quick fix, superseded |
| `PODCAST_COMPLETE_SUMMARY.md` | Completion summary |
| `PODCAST_KEY_TOPICS_IMPLEMENTATION.md` | Merged into implementation.md |
| `story-editor/PRINT_FEATURE_COMPLETE.md` | Completion summary |
| `story-editor/PRINT_FEATURE_SUMMARY.md` | Completion summary |
| `donations/IMPLEMENTATION_SUMMARY.md` | Completion summary |
| All 21 homepage-cms completion/status files | Completion summaries |
| `RECEIPT_SYSTEM_FILES.txt` | Archive (historical file listing) |

### Files to ARCHIVE

| File | Archive Location | Reason |
|------|-----------------|--------|
| `V1_CLEANUP_ANALYSIS.md` | `archive/legacy/` | Historical analysis with decision rationale |
| `future-improvements/payment-mode-removal-and-stripe-webhook-fix.md` | `archive/payments/` | Significant refactor documentation |
| `RECEIPT_SYSTEM_FILES.txt` | `archive/receipts/` | Historical file listing |

---

## 13. Execution Plan

### Phase 1: Foundation (2-3 hours)

**Goal:** Create the skeleton structure, fix broken references, and establish standards.

**Scope:**
- Create all target directories
- Create `docs/README.md` (documentation homepage)
- Create all subfolder README.md files (stubs with index structure)
- Fix 10 broken references in README.md and other files
- Create `standards/documentation-standards.md` (the companion guide)
- Create `standards/templates/` with doc templates
- Create `archive/README.md` (manifest)
- Move `tailwind-ocean-theme-config.ts` to `features/theme/tailwind-config.ts`
- Write initial ADRs (001-005) from existing implicit decisions

**Effort:** ~3 hours

**Why this first:** Everything else depends on the skeleton being in place. ADRs and standards should exist before we start moving docs so new docs can follow the conventions immediately.

### Phase 2: Move Well-Organized Subfolders (1-2 hours)

**Goal:** Move subfolders that are already well-structured and just need renaming.

**Scope:**
- `conference-docs/` â†’ `features/conference/reference/` (14 files, no external refs)
- `new-conference/` â†’ `features/conference/dynamic-form/` (5 files, no external refs)
- `component-reorg/` â†’ `planning/component-reorg/` (1 file)
- `plans/` â†’ `planning/story-editor-modernization.md` (1 file)
- `operations/` subfolders restructure (rename files to kebab-case)
- `deployment/` â†’ `operations/deployment/` (rename files to kebab-case)

**Effort:** ~1.5 hours

**Why this second:** These are low-risk moves with minimal cross-references. Building momentum with easy wins.

### Phase 3: Consolidate Payments + Receipt Docs (2 hours)

**Goal:** The largest consolidation â€” merge 17 receipt files + 8 payment files into organized feature docs.

**Scope:**
- Move `payments-v2/*` â†’ `features/payments/` (merge with existing payment docs)
- Move `api/PAYMENT_API.md` â†’ `architecture/payment-api.md`
- Move root-level receipt docs â†’ `features/payments/` (merge duplicates)
- Move root-level payment docs â†’ `features/payments/`
- Execute merge operations for receipt cluster
- Delete 10 receipt completion/status files
- Update internal cross-refs in `architecture/payment-system.md`

**Effort:** ~2 hours

**Why this third:** This is the highest-value consolidation. The payment/receipt docs are the most scattered and have the most duplicates.

### Phase 4: Consolidate Feature Docs (1.5 hours)

**Goal:** Move feature-specific docs into their feature folders.

**Scope:**
- Move testimonials docs â†’ `features/testimonials/`
- Move SEO docs â†’ `features/seo/`
- Move podcast docs â†’ `features/podcasts/` (merge duplicates)
- Move story-editor docs â†’ `features/story-editor/` (delete completion summaries)
- Move accessibility docs â†’ `features/accessibility/`
- Move media docs â†’ `features/media/`
- Move theme docs â†’ `features/theme/` (merge duplicates)
- Move Google email setup â†’ `getting-started/google-email-setup.md`
- Move testing docs â†’ appropriate feature/operations folders

**Effort:** ~1.5 hours

### Phase 5: Homepage CMS Cleanup + Remaining Docs (1 hour)

**Goal:** Handle the largest single folder (25 homepage-cms files) and remaining root-level docs.

**Scope:**
- Pick 3-4 best homepage-cms docs â†’ `features/homepage-cms/`
- Delete 21 homepage-cms completion/status files
- Move remaining root-level docs to appropriate locations
- Move `DATABASE_MIGRATION_GUIDE.md` â†’ `architecture/database.md` (rename)
- Move `SITE_SETTINGS_SETUP_GUIDE.md` â†’ `features/media/site-settings.md`
- Handle `DEPLOYMENT_CHECKLIST.md` (root-level) â€” update broken ref

**Effort:** ~1 hour

### Phase 6: Reference Updates + Verification (1.5 hours)

**Goal:** Update all cross-references and verify nothing is broken.

**Scope:**
- Update `README.md` links (5 references)
- Update `lib/payments/VALIDATION_GUIDE.md` link (broken env vars ref)
- Update `DEPLOYMENT_CHECKLIST.md` link (broken homepage-cms ref)
- Update internal cross-refs in `architecture/payment-system.md` (3 refs)
- Update internal cross-refs in `operations/security/credential-rotation-implementation.md` (8 refs)
- Update internal cross-refs in `features/story-editor/implementation-status.md` (5 refs)
- Grep for all remaining `docs/` references in non-doc files
- Grep for all SCREAMING_SNAKE `.md` references
- Grep for references to deleted files
- Verify no broken links remain

**Effort:** ~1.5 hours

**Why this second-to-last:** All moves must be complete before we can verify references.

### Phase 7: Frontmatter + Final Polish (1.5 hours)

**Goal:** Add frontmatter to all docs, create CHANGELOG, final verification.

**Scope:**
- Add frontmatter to all docs in `architecture/`, `features/payments/`, `operations/`
- Add frontmatter to all docs in `features/conference/reference/`
- Add frontmatter to key feature docs
- Create `releases/CHANGELOG.md` with version history
- Create `getting-started/development-setup.md` from README content
- Create `getting-started/project-structure.md` from README content
- Create `getting-started/environment-variables.md` (the missing referenced doc)
- Final grep for broken references
- Remove empty old directories
- Update `docs/README.md` with final navigation

**Effort:** ~1.5 hours

### Total Estimated Effort: ~12-14 hours

This is more than the previous plan (~7 hours) because:
1. We're creating new docs that were missing (architecture overview, ADRs, standards)
2. We're doing proper consolidation (merges, not just moves)
3. We're adding frontmatter to all docs
4. We're building a documentation system, not just moving files

---

## 14. Reference Update Plan

### External References (README, code, configs)

| File | Line | Current Reference | New Reference | Phase |
|------|------|-------------------|---------------|-------|
| `README.md` | 222 | `docs/payments-v2/DESIGN.md` | `docs/architecture/payment-system.md` | 1 |
| `README.md` | 223 | `docs/payments-v2/TASKS.md` | Remove or point to `docs/planning/` | 1 |
| `README.md` | 224 | `docs/api/PAYMENTS_V2.md` | `docs/architecture/payment-api.md` | 1 |
| `README.md` | 234 | `docs/operations/CREDENTIAL_ROTATION_GUIDE.md` | `docs/operations/security/credential-rotation-guide.md` | 2 |
| `README.md` | 235 | `docs/operations/CREDENTIAL_ROTATION_CHECKLIST.md` | `docs/operations/security/credential-rotation-checklist.md` | 2 |
| `lib/payments/VALIDATION_GUIDE.md` | 294 | `../../docs/ENVIRONMENT_VARIABLES.md` | `../../docs/getting-started/environment-variables.md` | 1 |
| `DEPLOYMENT_CHECKLIST.md` | 384 | `docs/HOMEPAGE_CMS_MIGRATION.md` | `docs/features/homepage-cms/README.md` | 5 |

### Internal Cross-References (within docs)

| File | Reference | New Path | Phase |
|------|-----------|----------|-------|
| `architecture/payment-system.md` | `docs/api/PAYMENT_API.md` | `docs/architecture/payment-api.md` | 3 |
| `architecture/payment-system.md` | `docs/deployment/DEPLOYMENT_GUIDE.md` | `docs/operations/deployment/deployment-guide.md` | 3 |
| `architecture/payment-system.md` | `docs/operations/RUNBOOK.md` | `docs/operations/runbook.md` | 3 |
| `operations/security/credential-rotation-implementation.md` | `docs/operations/CREDENTIAL_ROTATION_GUIDE.md` | `docs/operations/security/credential-rotation-guide.md` | 6 |
| `operations/security/credential-rotation-implementation.md` | `docs/operations/CREDENTIAL_ROTATION_CHECKLIST.md` | `docs/operations/security/credential-rotation-checklist.md` | 6 |
| `operations/security/credential-rotation-implementation.md` | `docs/operations/README.md` | `docs/operations/README.md` | 6 |
| `features/story-editor/implementation-status.md` | `docs/story-editor/README.md` | `docs/features/story-editor/README.md` | 6 |
| `features/payments/rate-limiting.md` | `docs/payments-v2/design.md` | `docs/architecture/payment-system.md` | 3 |
| `features/payments/receipt-token-quick-start.md` | 2 wrong-path refs | Fix to correct paths | 3 |

### Verification Commands (Phase 6)

```bash
# 1. Find all docs/ references in non-docs files
rg "docs/" --type-add 'code:*.{ts,tsx,js,jsx,json,yml,yaml}' -t code README.md DEPLOYMENT_CHECKLIST.md lib/

# 2. Find all docs/ references within docs/ itself
rg "docs/" docs/ --glob '!docs/docs-reorg/'

# 3. Check for references to old SCREAMING_SNAKE paths
rg "[A-Z]{2,}_[A-Z]{2,}\.md" README.md DEPLOYMENT_CHECKLIST.md lib/

# 4. Verify no file was left in root docs/
find docs/ -maxdepth 1 -name "*.md" -not -path "docs/docs-reorg/*"
# Should return 0 files after Phase 5

# 5. Verify old directories are empty
find docs/ -type d -empty -not -path "docs/docs-reorg/*"

# 6. Check for references to deleted files
rg "RECEIPT_SYSTEM_COMPLETE|RECEIPT_SYSTEM_NOW_WORKING|TASK_6_COMPLETION|SQL_SCRIPT_11" docs/ README.md lib/

# 7. Verify all frontmatter has required fields
rg "^---$" docs/ -l | xargs -I{} sh -c 'grep -q "status:" {} || echo "MISSING status: {}"'
```

---

## 15. Checklists

### Phase 1: Foundation

- [ ] Create target directories (all 20+ directories)
- [ ] Create `docs/README.md` (documentation homepage)
- [ ] Create `getting-started/README.md` with navigation
- [ ] Create `architecture/README.md` with navigation
- [ ] Create `features/README.md` with navigation
- [ ] Create `operations/README.md` with navigation
- [ ] Create `standards/README.md` with navigation
- [ ] Create `planning/README.md` with navigation
- [ ] Create `releases/README.md` with navigation
- [ ] Create `archive/README.md` with manifest
- [ ] Fix 3 broken README.md links (payments-v2 paths)
- [ ] Fix broken link in `lib/payments/VALIDATION_GUIDE.md`
- [ ] Fix broken link in `DEPLOYMENT_CHECKLIST.md`
- [ ] Create `standards/documentation-standards.md`
- [ ] Create `standards/coding-standards.md` (skeleton)
- [ ] Create `standards/templates/feature-doc.md`
- [ ] Create `standards/templates/adr.md`
- [ ] Create `standards/templates/runbook.md`
- [ ] Create `standards/decisions/README.md`
- [ ] Write ADR 001: Use Supabase
- [ ] Write ADR 002: Authentication Design
- [ ] Write ADR 003: Storage Strategy
- [ ] Write ADR 004: Payment Providers
- [ ] Write ADR 005: Email Service
- [ ] Create `releases/CHANGELOG.md` (skeleton)
- [ ] Move `tailwind-ocean-theme-config.ts` â†’ `features/theme/tailwind-config.ts`

### Phase 2: Move Well-Organized Subfolders

- [ ] Move `conference-docs/` â†’ `features/conference/reference/` (14 files)
- [ ] Move `new-conference/` â†’ `features/conference/dynamic-form/` (5 files)
- [ ] Create `features/conference/README.md`
- [ ] Move `component-reorg/` â†’ `planning/component-reorg/`
- [ ] Move `plans/story-editor-modernization-plan.md` â†’ `planning/story-editor-modernization.md`
- [ ] Rename `deployment/*.md` to kebab-case
- [ ] Move `deployment/` â†’ `operations/deployment/`
- [ ] Move `deployment/TASK_28_COMPLETION_SUMMARY.md` â†’ DELETE
- [ ] Move `deployment/DEPLOYMENT_SUMMARY.md` â†’ DELETE
- [ ] Rename `operations/*.md` to kebab-case
- [ ] Create `operations/security/` directory
- [ ] Move credential rotation docs â†’ `operations/security/`

### Phase 3: Consolidate Payments + Receipt Docs

- [ ] Move `payments-v2/PAYMENT_ARCHITECTURE_V2_README.md` â†’ `architecture/payment-system.md`
- [ ] Move `payments-v2/RATE_LIMITING*.md` â†’ `features/payments/`
- [ ] Move `payments-v2/RECEIPT_*.md` â†’ `features/payments/` (merge quick-start)
- [ ] Move `payments-v2/RECONCILIATION.md` â†’ `features/payments/`
- [ ] Move `payments-v2/REQUIREMENTS_VERIFICATION_REPORT.md` â†’ `features/payments/`
- [ ] Move `api/PAYMENT_API.md` â†’ `architecture/payment-api.md`
- [ ] Move `RECEIPT_SYSTEM.md` â†’ `architecture/receipt-system.md`
- [ ] Merge `RECEIPT_SYSTEM_SETUP.md` + `RECEIPT_SYSTEM_IMPLEMENTATION.md` â†’ `features/payments/receipt-implementation.md`
- [ ] Merge `VERCEL_RECEIPT_DEPLOYMENT_CHECKLIST.md` into `features/payments/receipt-deployment.md`
- [ ] Move `RECEIPT_DEPLOYMENT_GUIDE.md` â†’ `features/payments/receipt-deployment.md`
- [ ] Move `RECEIPT_GENERATION_TROUBLESHOOTING.md` â†’ `features/payments/receipt-troubleshooting.md`
- [ ] Move `RECEIPT_STAMP_VERIFICATION_PLAN.md` â†’ `features/payments/receipt-stamp-verification.md`
- [ ] Move `RECEIPT_WEBHOOK_INTEGRATION.md` â†’ `features/payments/receipt-webhook-integration.md`
- [ ] Move root payment docs (STRIPE, KHALTI, ESEWA, GO_LIVE, PAYMENT_*) â†’ `features/payments/`
- [ ] Delete 10 receipt completion/status files
- [ ] Move `RECEIPT_SYSTEM_FILES.txt` â†’ `archive/receipts/`
- [ ] Create `features/payments/README.md`
- [ ] Update cross-refs in `architecture/payment-system.md`

### Phase 4: Consolidate Feature Docs

- [ ] Move testimonials docs â†’ `features/testimonials/` (3 files)
- [ ] Move SEO docs â†’ `features/seo/` (4 files)
- [ ] Move podcast docs â†’ `features/podcasts/` (merge key-topics into implementation)
- [ ] Move story-editor docs â†’ `features/story-editor/` (delete 2 completion summaries)
- [ ] Move accessibility docs â†’ `features/accessibility/`
- [ ] Move media docs â†’ `features/media/` (4 files)
- [ ] Move theme docs â†’ `features/theme/` (merge brand-theme-plan)
- [ ] Move `GOOGLE_EMAIL_SETUP.md` â†’ `getting-started/google-email-setup.md`
- [ ] Move testing docs â†’ appropriate feature/operations folders
- [ ] Delete `TIMELINE_CMS_VERIFICATION.md`, `INTRO_VIDEO_FIX.md`

### Phase 5: Homepage CMS Cleanup + Remaining Docs

- [ ] Move `README_HOMEPAGE_CMS.md` â†’ `features/homepage-cms/README.md`
- [ ] Move `HOMEPAGE_CONTENT_MANAGEMENT.md` â†’ `features/homepage-cms/content-management.md`
- [ ] Move `IMPACT_PAGE_CMS_INTEGRATION.md` â†’ `features/homepage-cms/impact-page.md`
- [ ] Move `QUICK_START_HOMEPAGE_CMS.md` â†’ `features/homepage-cms/quick-start.md`
- [ ] Delete 21 homepage-cms completion/status files
- [ ] Move `DATABASE_MIGRATION_GUIDE.md` â†’ `architecture/database.md`
- [ ] Move `SITE_SETTINGS_SETUP_GUIDE.md` â†’ `features/media/site-settings.md`
- [ ] Move remaining root-level docs to appropriate locations
- [ ] Delete all remaining completion summaries and status reports
- [ ] Verify root docs/ is empty (except docs-reorg/ and new dirs)

### Phase 6: Reference Updates + Verification

- [ ] Update `README.md` links (5 references)
- [ ] Update `lib/payments/VALIDATION_GUIDE.md` link
- [ ] Update `DEPLOYMENT_CHECKLIST.md` link
- [ ] Update internal cross-refs in `architecture/payment-system.md`
- [ ] Update internal cross-refs in `operations/security/credential-rotation-implementation.md`
- [ ] Update internal cross-refs in `features/story-editor/implementation-status.md`
- [ ] Grep for all remaining `docs/` references in non-doc files
- [ ] Grep for all SCREAMING_SNAKE `.md` references
- [ ] Grep for references to deleted files
- [ ] Verify no broken links remain
- [ ] Run full verification command suite

### Phase 7: Frontmatter + Final Polish

- [ ] Add frontmatter to all `architecture/*.md` docs
- [ ] Add frontmatter to all `features/payments/*.md` docs
- [ ] Add frontmatter to all `operations/**/*.md` docs
- [ ] Add frontmatter to all `features/conference/reference/*.md` docs
- [ ] Add frontmatter to key feature docs (story-editor, testimonials, seo, etc.)
- [ ] Create `getting-started/development-setup.md` from README content
- [ ] Create `getting-started/project-structure.md` from README content
- [ ] Create `getting-started/environment-variables.md`
- [ ] Create `architecture/overview.md` (high-level system design)
- [ ] Create `architecture/authentication.md` (auth system design)
- [ ] Create `architecture/database.md` (schema and RLS overview)
- [ ] Create `architecture/email-system.md` (email architecture)
- [ ] Create `architecture/storage.md` (storage architecture)
- [ ] Create `architecture/api-design.md` (API conventions)
- [ ] Update `releases/CHANGELOG.md` with version history
- [ ] Update `docs/README.md` with final navigation
- [ ] Remove empty old directories
- [ ] Final grep for broken references
- [ ] Verify `find docs/ -maxdepth 1 -name "*.md"` returns only README.md

---

## 16. Risk Section

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Broken README links** | High (10 already broken) | Medium â€” new contributors can't find docs | Fix in Phase 1 before any moves |
| **Broken internal cross-refs** | High (many docs reference each other) | Low â€” only affects readers | Update all cross-refs in Phase 6; grep to verify |
| **Merge content loss** | Medium | High â€” important details could be lost | Review every merge target; keep both docs open during merge |
| **Deleting docs with hidden value** | Low | Medium â€” lose historical context | Review each deletion candidate; err on side of archive |
| **CI/CD references to docs** | Low (no docs/ refs found in workflows) | High â€” deploys could fail | Grep `.github/` before starting |
| **Merge conflicts with in-flight work** | Medium | High â€” could lose active planning work | Do `new-conference/` and `component-reorg/` moves last; coordinate with team |
| **Missing a reference update** | Medium | Low â€” broken link, not broken code | Multiple grep passes in Phase 6; manual spot-check |
| **Frontmatter inconsistency** | Medium | Low â€” metadata is optional for readers | Use templates; validate with grep |

### Pre-flight Checks

Before starting any moves:

1. `git status` â€” ensure clean working tree
2. `git stash` any in-progress work
3. Grep `.github/` for any docs/ references
4. Grep `package.json` for any docs/ references
5. Confirm `new-conference/tasks.md` and `component-reorg/tasks.md` are committed
6. Confirm no one else is editing docs/ files

---

## 17. Open Decisions

### D1: Create Missing Architecture Docs?

**Question:** The plan creates 6 new architecture docs (overview, auth, database, email, storage, API design) that don't exist today. These require significant writing effort. Should we create them as part of this reorg, or create stubs and fill them in later?

**Options:**
- **A) Create full docs** â€” Write complete architecture documentation. ~4-6 hours additional work.
- **B) Create stubs with TODO** â€” Create the files with structure but minimal content. Fill in later.
- **C) Defer entirely** â€” Just create the folder structure; write docs separately.

**My recommendation:** Option B. Create stubs with the right structure, headings, and frontmatter. This establishes the architecture without blocking the reorg. Fill in content as a separate task.

### D2: How Many Homepage CMS Docs to Keep?

**Question:** The plan keeps 3-4 homepage-cms docs out of 25. Should we keep more for historical detail?

**Options:**
- **A) Keep 3-4** (current plan) â€” README, quick-start, content-management, impact-page
- **B) Keep 6-8** â€” Add integration guides and phase-specific docs
- **C) Keep 1-2** â€” Just README and quick-start

**My recommendation:** Option A. The 4 docs cover overview, quick start, content management, and a specific integration. Additional docs are completion summaries with no ongoing value.

### D3: Should Operations Have a `security/` Subfolder?

**Question:** The plan creates `operations/security/` for credential rotation docs. Is this warranted with only 3 files?

**Options:**
- **A) Create `operations/security/`** â€” Clean separation, room to grow
- **B) Keep in `operations/`** â€” Simpler structure, 3 files don't need a subfolder

**My recommendation:** Option A. Security documentation will grow. Credential rotation, security policies, incident response â€” these belong together. The subfolder makes the separation clear.

### D4: Should We Create `features/payments/` or Keep Payments at Top Level?

**Question:** Payments is a large feature area (14+ files). Does it deserve top-level treatment like the original plan suggested?

**Options:**
- **A) Keep in `features/payments/`** â€” Consistent with other features
- **B) Elevate to top-level `payments/`** â€” Acknowledges its cross-cutting nature

**My recommendation:** Option A. Payments is a feature, not a system-wide concern. The architecture doc (`architecture/payment-system.md`) handles the cross-cutting aspects. Feature implementation docs belong in `features/`.

### D5: Should the Conference Reference Suite Keep Numbered Prefixes?

**Question:** The `conference/reference/` suite uses `00-`, `01-`, etc. Should we rename to kebab-case for consistency?

**Options:**
- **A) Keep numbered** â€” Preserves reading order, familiar to team
- **B) Rename to kebab-case** â€” Consistent naming, but loses implicit ordering

**My recommendation:** Option A. The numbered convention is intentional for this reference suite. The `order:` field in frontmatter can supplement if needed, but the filenames should stay as-is.

### D6: What Happens to `DEPLOYMENT_CHECKLIST.md` (Root Level)?

**Question:** There's a `DEPLOYMENT_CHECKLIST.md` at the project root (not in docs/). It has a broken docs/ reference. Should we fix the reference and leave it, or move it to docs?

**Options:**
- **A) Fix reference, leave at root** â€” It's a deployment checklist, belongs at root for visibility
- **B) Move to `operations/deployment/`** â€” All deployment docs should be in docs/

**My recommendation:** Option A. Root-level deployment checklists are common and visible. Just fix the broken reference.

### D7: Archive Granularity

**Question:** The archive has subfolders (payments/, homepage-cms/, receipts/, legacy/). Is this too granular for ~3 archived files?

**Options:**
- **A) Subfolders** (current plan) â€” Mirrors live structure, scales if more docs get archived
- **B) Flat archive** â€” Simpler, only 3 files today

**My recommendation:** Option A. The subfolders are low-cost and the structure scales. When the 4th or 5th doc gets archived, you'll be glad the structure exists.

---

*This plan is ready for review. Once open decisions are resolved, execution can begin. The companion standards guide should be created in Phase 1 to establish conventions before any docs are moved.*
