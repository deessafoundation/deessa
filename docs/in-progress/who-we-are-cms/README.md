# Who We Are CMS

The full page-owned CMS implementation and the fixes from the 2026-10-13 audit
are complete in source. **87 focused tests pass.** Live database and
authenticated workflow acceptance remain pending; see the
[implementation and verification status](./implementation-status-2026-10-14.md).

- [Current implementation, coverage, migration, and acceptance status](./implementation-status-2026-10-14.md)
- [Source inventory and original analysis](./analysis.md)
- [CMS architecture and preservation plan](./cms-plan.md)
- [Implementation tasks and remaining acceptance](./cms-tasks.md)
- [Historical foundation status](./foundation-status.md)
- [Historical tabs and Partners migration status](./navigation-and-partners.md)
- [Original completion/security audit, 2026-10-13](./completion-audit-2026-10-13.md)

Public content remains at `/about`, managed at `/admin/about`. Team records
remain at `/admin/team`; Partners record management is embedded in About. The
page uses the existing `about_page_content` JSON, with additive defaults and
preserved legacy content. Journey remains retired.

Storage hardening is supplied as migration 069 and has not been applied.
No published content, records, or stored media were changed during implementation.
The public page was inspected at desktop/mobile widths on local port 3005;
Supabase requests failed and the protected editor reached login, so actual saved
content and authenticated publishing/upload flows are not claimed as verified.

