# Component Reorganization Tasks

> **Status:** Phase 0 & Phase 1 — Analysis in progress  
> **Created:** 2026-10-01  
> **Moved from:** `docs/archive/reorganization/component-reorg/tasks.md`  
> **Note:** This document preserves the historical analysis from the archived plan but will be updated with findings from the new comprehensive analysis.

---

## Current Phase: Analysis

This reorganization follows the methodology defined in the Component Reorganization Master Prompt:

1. **Phase 0** — Repository preparation and configuration inspection
2. **Phase 1** — Complete forensic analysis of current component structure
3. **Phase 2** — Define architectural and naming standards
4. **Phase 3** — Create migration plan
5. **Phase 4** — Review and validate plan
6. **Phase 5** — Execute in small batches
7. **Phase 6** — Test after every batch
8. **Phase 7** — Final cleanup and verification

**Current activities:**
- ✅ Repository configuration inspected
- ✅ Documentation workspace created
- 🔄 Comprehensive component inventory in progress
- 🔄 Usage and dependency analysis in progress

---

## Repository Configuration (Confirmed)

- **Project name:** deessa Foundation
- **Stack:** Next.js 16.3.4 + React 19 + TypeScript 6
- **UI Framework:** Tailwind CSS 4.3.3 + shadcn/ui (New York style)
- **Path alias:** `@/*` → project root
- **Package manager:** pnpm
- **Available scripts:**
  - Build: `pnpm build`
  - Lint: `pnpm lint`
  - Type check: `pnpm typecheck`
  - Format: `pnpm run format`
  - Format check: `pnpm run format:check`

---

## Analysis Progress

The following sections will be populated as analysis completes:

### Component Inventory

*See `analysis.md` for detailed component-by-component breakdown*

### Dependency Map

*See `dependency-map.md` for architectural relationships*

### Architectural Boundaries (Proposed)

*To be defined after analysis completes*

### Migration Batches (Draft)

*To be defined after analysis and architecture review*

---

## Historical Context (from archived plan)

The archived reorganization plan (created 2026-07-22, archived 2026-09-12) identified:

**Key issues found:**
- Domain-specific cards in `ui/` (event-card, initiative-card, project-card, stat-card, story-card, team-member-card)
- Hooks misplaced in `ui/` (use-mobile.tsx, use-toast.ts)
- PascalCase file naming in error-pages/ and admin/homepage-manager/
- Duplicate components (use-mobile, use-toast, homepage-manager-client)
- Potentially unused components flagged (8 files)

**Proposed structure from archived plan:**
```
components/
├── ui/           # Generic primitives only
├── layout/       # Navbar, footer, wrappers
├── features/     # Public-facing by domain
├── shared/       # Cross-feature components
├── admin/        # Admin panel components
└── podcasts/     # Large standalone feature
```

This analysis will validate these findings against the current codebase state.

---

## Next Steps

1. Complete comprehensive component inventory
2. Verify usage patterns for all components
3. Map CSS module relationships
4. Identify server/client boundaries
5. Create dependency map
6. Define final architecture based on actual usage
7. Create detailed migration plan
8. Review and validate before execution

**No components will be moved, renamed, or deleted until analysis is complete and reviewed.**
