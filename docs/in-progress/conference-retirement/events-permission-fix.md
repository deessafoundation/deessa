# Events permission error — 2026-10-10

## Confirmed cause

The live database contains published events. Anonymous requests fail with `42501: permission denied for function is_admin_user`.

Read-only database inspection confirmed that both `is_admin_user()` and `get_admin_role()` deny EXECUTE to `anon` and allow it to `authenticated`. Nine event admin policies are assigned to `PUBLIC` and invoke `is_admin_user()`. The published-events SELECT policy is present, but the applicable admin policy can still invoke the restricted helper.

The mismatch originates in `scripts/fixes/007-fix-function-execution-perms.sql`, which revokes anonymous execution while event policies from migrations 050 and 051 apply to all roles. The component relocation did not change these policies or helper permissions.

## Local versus deployed behavior

A read-only role comparison in the configured database reproduced the failure as `anon`; the identical published-event query succeeded as `authenticated` and returned two records. The local public Supabase URL and database connection target the same project, and `.env`/`.env.local` agree on the public URL.

A fresh browser session at `https://deessafoundation.com/events` redirected to `https://www.deessafoundation.com/events` and rendered `No upcoming events yet`, with no event-detail links. The response was HTTP 200 with Vercel cache MISS and age 0. This is an independent observation of the deployed public page; it does not establish the deployed database project, which was not discoverable from the loaded public bundles.

The earlier successful view may have used an authenticated session; the database role comparison shows why that session could succeed. The user's earlier cookie/session state has not been verified. Do not claim that the timing or deployment environment has been conclusively explained. Neither the local event-list query nor Supabase client implementations were edited in the relocation.

## Prepared fix

Apply [064-event-admin-policy-roles.sql](../../../scripts/db/migrations/064-event-admin-policy-roles.sql) to the configured database after approval. It limits the nine existing event admin policies to `authenticated`. PostgreSQL `ALTER POLICY ... TO authenticated` preserves each policy's existing USING/WITH CHECK conditions, as documented in [ALTER POLICY](https://www.postgresql.org/docs/current/sql-alterpolicy.html).

Public published-event, agenda, active-schema, template and ticket read policies remain unchanged. The public registration INSERT policy remains unchanged. Logged-in users still need to satisfy `is_admin_user()` to receive admin access. The migration does not grant anonymous function execution, disable RLS, use a service-role client in public pages, change event records or alter application code.

## Verification after application

1. Compare all nine policy predicates with the captured pre-change definitions; only their role lists should differ.
2. Confirm anonymous execution of both admin helper functions is still denied.
3. Query published events through the application's anonymous Supabase client; confirm the 42501 error is gone.
4. Verify public event details, active form schemas and ticket queries. Check that drafts remain hidden.
5. Reload `/events` in a fresh browser request and inspect the actual event cards and registration link.
6. Confirm unauthenticated `/admin/events` still redirects to login. Authenticated admin mutations require a real admin session for a full workflow check.

The prepared migration has not yet been applied. No live records or permissions were changed during diagnosis. This fix is limited to event policies; other public features using incorrectly scoped admin policies need their own review.
