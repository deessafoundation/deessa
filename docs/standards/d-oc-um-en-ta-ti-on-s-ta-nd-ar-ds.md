---
title: "Documentation Standards"
description: " Status: active"
owner: "Deesha Team"
status: active
category: standards
audience: admin
last_updated: 2026-09-12
---
# Documentation Standards

> **Status:** active
> **Owner:** Tech Team
> **Last Updated:** 2026-07-22
> **Review Cycle:** quarterly

This guide defines how to write, organize, and maintain documentation in this project. Every new document must follow these standards.

---

## Quick Reference

### Before You Write

1. **Check if it already exists.** Search `docs/` for your topic.
2. **Determine where it belongs.** See [Folder Placement](#folder-placement).
3. **Determine the document type.** See [Document Types](#document-types).
4. **Use the correct template.** See [Templates](#templates).

### File Naming Rules

| Rule | Standard | Example |
|------|----------|---------|
| Casing | `kebab-case` always | `credential-rotation-guide.md` |
| Extension | `.md` always | â€” |
| Length | Max 4 words | `receipt-access-control.md` |
| No status | Never COMPLETE, FINAL, DONE | ~~`feature-complete.md`~~ |
| No dates | Never 2026-03-15-*.md | ~~`2026-03-15-deploy.md`~~ |
| No versions | Never _v2, -v2 | ~~`payment-v2.md`~~ |
| No screaming snake | Never SCREAMING_SNAKE_CASE | ~~`PAYMENT_GUIDE.md`~~ |
| Exception | `README.md` only | â€” |
| Numbered prefix | Only for ordered sequences | `001-use-supabase.md` |

**Why kebab-case?**
- URL-friendly (no encoding needed)
- Terminal-friendly (no quoting needed)
- Consistent with the codebase (`src/`, `app/`, `components/`)
- Industry standard for documentation

**Why no status in filenames?**
- Status changes over time; filenames shouldn't
- Status belongs in frontmatter where tools can read it
- `COMPLETE` today may be `deprecated` tomorrow
- Git history tracks the real status

**Why no dates in filenames?**
- Dates are metadata, not identity
- `last_updated` in frontmatter serves the same purpose
- Dates in filenames create merge conflicts

---

## Folder Placement

### Decision Tree

```
Is it about how the ENTIRE system works?
  â†’ architecture/

Is it about a SPECIFIC feature?
  â†’ features/<feature>/

Is it about DEPLOYING or OPERATING the system?
  â†’ operations/

Is it a TEAM CONVENTION or DECISION?
  â†’ standards/

Is it an ACTIVE PLAN for work not yet done?
  â†’ planning/

Is it a RELEASE NOTE or CHANGELOG entry?
  â†’ releases/

Is it HISTORICAL but still valuable?
  â†’ archive/
```

### What Goes Where

| Folder | Content | Examples |
|--------|---------|----------|
| `getting-started/` | Onboarding for new contributors | Dev setup, env vars, project structure |
| `architecture/` | System-wide design decisions | Auth, DB, email, storage, API design |
| `features/<name>/` | Feature-specific documentation | Setup guides, troubleshooting, API refs |
| `operations/` | Deployment, security, runbooks | Checklists, credential rotation, incident response |
| `standards/` | Team conventions and decisions | Coding standards, ADRs, templates |
| `planning/` | Active work, not yet shipped | Task plans, design docs |
| `releases/` | Version history | Changelog, release notes |
| `archive/` | Historical value, not maintained | Old analysis, superseded architecture |

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Putting a payment troubleshooting guide in `how-to/` | Put it in `features/payments/` â€” it's about payments |
| Putting architecture docs in `features/` | Put them in `architecture/` â€” they're system-wide |
| Putting a runbook in `operations/` when it's feature-specific | Put it in `features/<feature>/` if it only covers one feature |
| Putting active planning in `archive/` | Put it in `planning/` â€” archive is for old stuff |

---

## Document Types

### Type 1: Reference

**Purpose:** Stable, authoritative information. Read to understand, not to follow steps.

**Characteristics:**
- Doesn't change often
- Explains HOW something works
- Technical depth
- No step-by-step instructions

**Examples:** Architecture docs, API references, schema documentation, ADRs

**Frontmatter:** `status: reference`

### Type 2: Guide

**Purpose:** Task-oriented instructions. Follow step-by-step to accomplish something.

**Characteristics:**
- Changes when the process changes
- Step-by-step instructions
- May include code examples
- Focused on a specific task

**Examples:** Setup guides, deployment checklists, migration guides

**Frontmatter:** `status: active` or `status: operational`

### Type 3: Runbook

**Purpose:** Operational procedures for incidents or maintenance. Used during pressure.

**Characteristics:**
- Written for someone under stress
- Clear, numbered steps
- Includes verification after each step
- Links to related docs

**Examples:** Incident response, credential rotation, disaster recovery

**Frontmatter:** `status: operational`

### Type 4: Plan

**Purpose:** Design for work not yet done. May change significantly.

**Characteristics:**
- Living document
- Updated as work progresses
- Includes task lists, timelines
- May be superseded by the actual implementation

**Examples:** Feature plans, reorganization plans, migration plans

**Frontmatter:** `status: planning`

### Type 5: Decision Record (ADR)

**Purpose:** Record a technical decision and its rationale.

**Characteristics:**
- Immutable once accepted
- Never deleted, only superseded
- Short, focused
- Includes context, decision, consequences

**Examples:** Technology choices, architecture decisions, convention adoptions

**Frontmatter:** `status: active` (or `superseded`)

---

## Frontmatter

### Required Fields

Every document MUST have:

```yaml
---
title: "Human-readable title"
description: "One-line summary for navigation and search"
owner: "Team or person responsible"
status: active
category: feature
last_updated: 2026-07-22
---
```

### Optional Fields

Use when applicable:

```yaml
feature: payments              # For category: feature
audience: developer            # developer | operator | admin | contributor | executive
review_cycle: quarterly        # quarterly | monthly | yearly | none
tags: [payments, stripe]       # Search keywords
related:                       # Links to related docs
  - ../architecture/payment-system.md
supersedes: old-doc.md         # This doc replaces that one
superseded_by: new-doc.md     # This doc is replaced by that one
archive_reason: "..."          # Only for archived docs
```

### Status Values

| Status | Meaning |
|--------|---------|
| `planning` | Being designed, not yet implemented |
| `active` | Current, maintained, authoritative |
| `reference` | Stable, rarely changes |
| `operational` | Used during operations, changes frequently |
| `deprecated` | Superseded but kept |
| `archived` | Historical value, no longer maintained |

### Example: Complete Frontmatter

```yaml
---
title: "Payment System Architecture"
description: "System-wide design of the payment processing pipeline, provider abstraction, and security model."
owner: "Tech Team"
status: reference
category: architecture
audience: developer
review_cycle: quarterly
last_updated: 2026-07-22
tags: [payments, architecture, security]
related:
  - ../features/payments/stripe-setup.md
  - ../features/payments/receipt-system.md
---
```

---

## Document Structure

### Standard Layout

```markdown
---
frontmatter here
---

# Title

> One-line summary (matches frontmatter description).

## Overview

2-3 paragraphs explaining what this document covers and who should read it.

## Main Content

Organize with clear headings. Use H2 for major sections, H3 for subsections.

## Related Documentation

- [Link 1](path) â€” Brief description
- [Link 2](path) â€” Brief description
```

### Heading Rules

- One H1 per document (the title)
- H2 for major sections
- H3 for subsections
- Never skip levels (H2 â†’ H4)
- Use sentence case for headings (not Title Case)

### Link Rules

- Use relative links within docs/
- Use absolute links to external resources
- Always use descriptive link text (not "click here")
- Verify links work before committing

---

## Templates

### Feature Document Template

```markdown
---
title: "Feature Name"
description: "What this feature does"
owner: "Team"
status: active
category: feature
feature: feature-name
last_updated: YYYY-MM-DD
---

# Feature Name

> One-line description.

## Overview

What this feature does and why it exists.

## How It Works

Technical explanation of the feature.

## Setup

Prerequisites and setup steps.

## Usage

How to use the feature.

## Troubleshooting

Common issues and solutions.

## Related

- [Related doc](link)
```

### ADR Template

```markdown
---
title: "ADR NNN: Short Title"
description: "Decision record for..."
owner: "Team"
status: active
category: standards
last_updated: YYYY-MM-DD
---

# NNN: Short Title

**Status:** accepted
**Date:** YYYY-MM-DD
**Deciders:** Names

## Context

What is the issue that motivates this decision?

## Decision

What is the change being proposed or decided?

## Consequences

What are the positive and negative outcomes?

## Alternatives Considered

What other options were evaluated?
```

### Runbook Template

```markdown
---
title: "Runbook: Procedure Name"
description: "Step-by-step procedure for..."
owner: "Team"
status: operational
category: operations
last_updated: YYYY-MM-DD
---

# Runbook: Procedure Name

> When to use this runbook.

## Prerequisites

- What you need before starting
- Access requirements
- Tool requirements

## Steps

1. **Step one description**
   ```bash
   command here
   ```
   Expected: what you should see

2. **Step two description**
   ...

## Verification

How to confirm the procedure succeeded.

## Rollback

How to undo if something goes wrong.

## Related

- [Related doc](link)
```

---

## Review Checklist

Before publishing a document:

- [ ] Frontmatter has all required fields
- [ ] Filename follows kebab-case convention
- [ ] No status words in filename
- [ ] One H1, proper heading hierarchy
- [ ] All links work
- [ ] Code examples are correct
- [ ] Spelling and grammar checked
- [ ] Audience is appropriate for the folder
- [ ] Related docs are linked

---

## Maintenance

### Review Cycles

| Status | Review Frequency |
|--------|-----------------|
| `planning` | Every 30 days |
| `active` | Every 90 days |
| `reference` | Every 6 months |
| `operational` | Every 30 days |
| `deprecated` | Every 6 months (decide: update or delete) |
| `archived` | Never (but review archive annually) |

### When to Update

- Code changes that affect the doc
- Process changes that affect the doc
- New information discovered
- Review cycle reminder
- Someone reports confusion

### When to Archive

- Feature is removed
- Document is superseded by a newer version
- Content is no longer relevant but has historical value

### When to Delete

- Completion summary with no ongoing value
- Status report (current status is in code)
- Superseded document with no historical value
- Document about a feature that no longer exists

---

## Examples

### Good Document

```yaml
---
title: "Stripe Payment Setup"
description: "How to configure Stripe for production payments"
owner: "Tech Team"
status: active
category: feature
feature: payments
audience: developer
last_updated: 2026-07-22
---
```

Filename: `stripe-setup.md` âœ“

### Bad Document

```yaml
---
title: "STRIPE_SETUP_GUIDE_V2_FINAL.md"
---
```

Filename: `STRIPE_SETUP_GUIDE_V2_FINAL.md` âœ— (SCREAMING_SNAKE, version, status, extension in title)

---

## Enforcement

This standard is enforced through:

1. **PR reviews** â€” All doc PRs must follow these standards
2. **Frontmatter validation** â€” CI can validate required fields
3. **Naming checks** â€” Verify kebab-case, no status words
4. **Link checking** â€” Automated link verification

Non-compliant docs should be flagged in PR review and fixed before merge.
