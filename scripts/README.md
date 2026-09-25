# Scripts

Organized project scripts. See `scripts/scripts-reorg/tasks.md` for the reorganization plan.

## Structure

| Folder | Purpose |
|--------|---------|
| `db/migrations/` | Core SQL migrations (001–062), all applied |
| `db/programs-migrations/` | Programs CMS migrations (P01–P10) |
| `db/payments-v2/` | Payment Architecture V2 migrations (020–029) |
| `db/seeds/` | Seed data scripts |
| `db/diagnostics/` | Read-only diagnostic/debug SQL |
| `deploy/` | Staging/production deploy & smoke-test scripts |
| `ops/` | Env checks, secrets, route scans, credential tests |
| `test/` | Standalone test scripts (rate limit, Gmail, eSewa) |
| `fixes/` | Applied database security fixes (runbook in README) |
| `archive/` | One-off/historical scripts, kept for reference |
| `cron/` | Scheduled job scripts (e.g. payment reconciliation) |

**Rule of thumb:** migrations under `db/`, runnable tooling under `deploy/`/`ops/`/`test/`.
