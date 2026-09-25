# Database Scripts

All SQL for Supabase/Postgres. Run scripts via the Supabase SQL Editor (copy-paste), not psql meta-commands.

| Folder | Contents |
|--------|----------|
| `migrations/` | Numbered migrations 001–062 (core schema). All applied. |
| `programs-migrations/` | P01–P10 Programs CMS migrations. All applied. |
| `payments-v2/` | 020–029 Payment V2 migrations + README. All applied. |
| `seeds/` | Seed data (stories, podcasts, form schemas). |
| `diagnostics/` | Read-only queries for debugging (rate limits, receipts, verification). |

Duplicate filenames across series are disambiguated with suffixes (`011b`, `057c`, etc.).
