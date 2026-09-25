# Programs CMS migrations and test fixtures

Apply the schema migrations P01–P06 and P08–P10 in order. **P07 is an optional test seed, not a schema migration. Run it after P10**, which permits the current hero document format.

## Refresh the design fixtures

Run `P07-programs-test-fixtures.sql` in the development/staging Supabase SQL editor. It deletes the existing records with these exact four slugs (including published or archived copies), then recreates them as fresh drafts:

| Slug | Layout coverage |
| --- | --- |
| `test-aac-support` | Portrait hero with note/sticker, facts, support cards, steps with handwritten note, family story/mini stats, FAQ, CTA, metrics, gallery |
| `test-community-outreach` | Journal hero/stamp/location/captions, ribbon, opening, postcards, photo essay, quote, CTA, metrics, gallery |
| `test-deessa-companion` | Concept card/status/tags, question strip, stages, interactive board/checklist, insights, resources, CTA, metrics, gallery |
| `test-1000-families` | Split hero/captions, progress, purpose, promise cards, milestones, expandable story, reach, staggered gallery, participation cards |

Each fixture has eight sections. Images use the same local/remote sources as the demos and include alt text. Sample content and numbers are illustrative.

Every run resets these four fixtures to new program IDs and draft revision 1. Their old publications, drafts, version history, sections, asset metadata and publish requests are deleted. Old admin links containing their IDs must be reopened from `/admin/programs`. Uploaded storage files are left intact; no storage objects are deleted. Other programs are unchanged. The transaction rolls back all four resets if any step fails. Run as the database owner in the SQL editor, not through an ordinary authenticated client. Do not run against fixture content you want to retain.

Open `/admin/programs`, edit each fixture, save, and use Preview. Check image captions, heading accents, section visibility/order, story expansion, and the Research board. To test `/whatwedo/test-...`, publish the chosen fixture through the admin in your test environment.

## Keep P07 synchronized

From the repository root:

```sh
node scripts/db/programs-migrations/generate-p07.cjs
node scripts/db/programs-migrations/generate-p07.cjs --check
```

These commands only generate/validate the SQL file; they never connect to the database. The generator reads `data/programs/editorial-demo-documents.ts` and `data/programs/service-demo-document.ts`, validates all four documents with `programDocumentSchema`, checks unique section IDs and anchor destinations, and serializes JSON using PostgreSQL dollar quoting. Edit those source documents and regenerate instead of editing the generated SQL payload by hand.
