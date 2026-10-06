# Historical component plans

These files preserve earlier work verbatim. Their completion labels, brand spellings, proposed paths and deletion instructions are **not current decisions**.

- `2026-07-22-tasks.md`: full preserved copy of `docs/archive/reorganization/component-reorg/tasks.md`, including the revision log. The original archived file remains intact for existing references.
- `2026-10-01-kiro-analysis.md`: Kiro's pre-review analysis, captured before correction.
- `2026-10-01-kiro-tasks.md`: Kiro's initial task document, captured before updating it in place.

The single active checklist is [../tasks.md](../tasks.md). The previous claim that the archived checklist had already been moved was inaccurate: the new task file was a summary and the full plan still existed at its archived path. This history directory now preserves the complete plan within the requested workspace.

## Useful historical decisions carried forward for review

- Feature ownership should guide grouping.
- Preserve default versus named export style during structural moves.
- Flat compound UI modules can remain flat; do not create subfolders mechanically.
- Case-sensitive deployment and co-located assets need explicit consideration.

## Historical decisions superseded or awaiting revalidation

- Archive-first and delete-superseded recommendations are superseded by the current brief's no-deletion/no-migration analysis stage.
- The proposed `shared/cards/` bucket conflicts with domain ownership; domain-specific cards need domain review.
- Keeping podcasts top-level was recorded historically. Compare this with existing `AGENTS.md` and the proposed features layer before settling Phase 2.
- “No barrels,” “no circular imports,” and “all imports use aliases” are contradicted by current source.
- The old deletion recommendation for `admin/media-picker.tsx` is invalid: the active media library renders it.
- Historical timings and counts are not estimates for the current 434-file tree.
