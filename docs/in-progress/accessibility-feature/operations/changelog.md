# Accessibility Documentation Change Log

**Version:** 3.0  
**Updated:** 2026-09-15  
**Status:** Planning documentation revised; implementation remains outstanding.

## Version 3.0

Replaced the earlier “production-ready / 10 out of 10” claims with specific behavior, implementation tasks and evidence requirements.

### Main plan

- Separated default-site accessibility from optional personalization.
- Defined public-route scope and admin regression boundaries.
- Added a repository integration map covering actual widgets, media, forms, fonts and styles.
- Defined one shared panel/provider, focus flows, section navigation and CMS toolbar behavior.
- Standardized the storage envelope, field validation, readiness and reset behavior.
- Added malformed/future data, blocked storage, cross-tab updates and cleanup behavior.
- Defined prepaint restoration and hydration verification without assuming an effect prevents a flash.
- Separated saved intent from effective OS/sensory/route state.
- Corrected root-relative scaling and removed DPR-based zoom caps and unstyled emergency behavior.
- Specified actual component integration for JavaScript motion, autoplay and media alternatives.
- Added reading-mode eligibility, script-aware font fallback and user-testing requirements.
- Chose local-only preferences without preference telemetry.
- Replaced invented baselines with measurements to collect.

### Checklist and validation

- Rebuilt CHECKLIST.md with stable task IDs and phase gates.
- Added VALIDATION.md with route/state coverage, failure cases, manual assistive-technology checks and evidence requirements.
- Kept implementation checkboxes unchecked; writing the plan is not completing the feature.
- Separated operational release work from the requested accessibility implementation documentation.

### Font guide

- Removed contradictory license and attribution instructions.
- Required exact release/file provenance and supplied license verification.
- Chose one same-origin font-loading approach.
- Added language fallback, stale-request, failure and real-browser verification behavior.

## Scope of this documentation update

Changed only documentation in docs/in-progress/accessibility-feature. No application code, dependencies, CI workflows, deployment configuration or production state is changed.

The historical [rollback runbook](../../runbooks/accessibility-rollback.md) was not revised in this pass and is not an approved procedure for the future implementation. Operational release planning is deferred.

The existing [toolbar guide](../../features/admin/accessibility-toolbar.md) also needs correction when implementation is complete; its persistence claims should not be treated as current implementation evidence.

## Still to do

1. Review/confirm the product choices in the main plan.
2. Complete the baseline route/component/content inventory.
3. Implement the checklist phases and record validation evidence.
4. Update shipped user/admin documentation to match verified behavior.
5. Plan and validate operational release separately before publication.

No performance improvement percentages, compliance guarantees or readiness scores are asserted.
