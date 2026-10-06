# Reorganization artifact cleanup

Completed 2026-10-04 at the user’s request, after the production build and source review.

Removed 480 generated files (51.64 MiB):

- 89 .png files
- 383 .json files
- 1 .mjs files
- 7 .cjs files

Kept the written reports, build/test logs, component guide, archived components, and these six records needed to trace the reviewed moves or restore files:

- [component-evidence.json](component-evidence.json)
- [migration-mapping.json](migration-mapping.json)
- [batches/B20/supplemental-reference-updates.json](batches/B20/supplemental-reference-updates.json)
- [batches/B40/supplemental-reference-updates.json](batches/B40/supplemental-reference-updates.json)
- [batches/B69/supplemental-reference-updates.json](batches/B69/supplemental-reference-updates.json)
- [usage-audit/archive-cleanup/manifest.json](usage-audit/archive-cleanup/manifest.json)

Links to deleted raw captures were converted to explicit removal notes in 10 active documents. Historical documents were preserved verbatim. Application component hashes were verified unchanged (431 code/style/asset files). No new build, lint, typecheck, or test run was needed for this documentation-only cleanup. Screenshots of the final homepage, Contact and Our Story checks and earlier batch screenshots have been removed; public website assets were preserved.
