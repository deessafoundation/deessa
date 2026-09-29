# Supabase Database Linter Warnings

**Scan Date:** 2026-09-12
**Total Warnings:** 56

---

## Warning 1–26: Function Search Path Mutable

**Lint Rule:** [0011_function_search_path_mutable](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
**Severity:** WARN | **Faces:** External

### What's wrong?

26 database functions don't have `SET search_path` specified. This means PostgreSQL uses the default search path, which can be influenced by the calling user's settings.

### Why is that bad?

If a user creates a table with the same name as one your function references, PostgreSQL might resolve to the wrong table. For example, if someone creates a `public.donations` table in a different schema, your function might read from the wrong one. Setting `search_path = public` locks the function to only look in the `public` schema.

### How to fix

Add `SET search_path = public` to each function definition. This is a safe, non-breaking change.

### Which functions are affected?

**Payment system functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 1 | `get_next_receipt_number` | Generates atomic receipt numbers with yearly reset | `scripts/db/payments-v2/025-atomic-receipt-number.sql:19` |
| 2 | `cleanup_old_payment_logs` | Deletes payment logs older than N days | `scripts/db/payments-v2/025b-create-payment-logs-table.sql:156` |
| 3 | `increment_receipt_failure_attempt` | Increments retry count for receipt failures | `scripts/db/payments-v2/026-create-receipt-failures-table.sql:46` |
| 4 | `increment_email_failure_attempt` | Increments retry count for email failures | `scripts/db/payments-v2/027-create-email-failures-table.sql:51` |
| 5 | `increment_rate_limit` | Tracks API rate limit counters | `scripts/db/migrations/018-rate-limit-function.sql:9` |
| 6 | `get_currency_symbol` | Returns currency symbol for a code (USD→$) | `scripts/db/migrations/008-currency-support.sql:34` |

**Admin system functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 7 | `is_admin_user` | Checks if current user has admin role | `scripts/db/migrations/002-admin-schema.sql:176` |
| 8 | `get_admin_role` | Returns the admin role for current user | `scripts/db/migrations/002-admin-schema.sql:188` |
| 9 | `create_admin_notification` | Creates a notification for an admin user | `scripts/db/migrations/036-admin-notifications.sql:57` |
| 10 | `mark_notification_read` | Marks a single notification as read | `scripts/db/migrations/036-admin-notifications.sql:78` |
| 11 | `mark_all_notifications_read` | Marks all notifications as read for a user | `scripts/db/migrations/036-admin-notifications.sql:90` |
| 12 | `get_unread_notification_count` | Returns count of unread notifications | `scripts/db/migrations/036-admin-notifications.sql:105` |

**Homepage CMS functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 13 | `get_homepage_stats` | Returns donation/volunteer stats for homepage | `scripts/db/migrations/037-homepage-cms-schema.sql:438` |
| 14 | `get_homepage_programs` | Returns active programs for homepage | `scripts/db/migrations/037-homepage-cms-schema.sql:452` |
| 15 | `get_homepage_trust_indicators` | Returns trust indicators for homepage | `scripts/db/migrations/037-homepage-cms-schema.sql:466` |
| 16 | `get_homepage_featured_stories_rules` | Returns featured stories rules | `scripts/db/migrations/037-homepage-cms-schema.sql:480` |
| 17 | `update_homepage_setting` | Updates a homepage CMS setting | `scripts/db/migrations/037-homepage-cms-schema.sql:494` |

**Content/media functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 18 | `search_podcasts` | Full-text search across podcasts | `scripts/db/migrations/012-create-podcasts-table.sql:116` |
| 19 | `increment_podcast_views` | Increments view count for a podcast | `scripts/db/migrations/012-create-podcasts-table.sql:135` |
| 20 | `update_media_assets_updated_at` | Trigger: auto-updates `updated_at` column | `scripts/db/migrations/006-media-assets.sql:33` |
| 21 | `update_updated_at_column` | Generic trigger: auto-updates `updated_at` | `scripts/db/migrations/002-admin-schema.sql:327` |

**Events/conference functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 22 | `can_delete_event` | Checks if an event can be deleted | `scripts/db/migrations/050-events-module-schema.sql:450` |
| 23 | `update_conference_form_template_updated_at` | Trigger: auto-updates `updated_at` | `scripts/db/migrations/042-conference-form-templates.sql:56` |
| 24 | `get_current_conference_event_id` | Returns the active conference event ID | `scripts/db/migrations/043-multi-event-support.sql:25` |

**Ticket functions:**

| # | Function | What it does | Defined in |
|---|----------|-------------|-----------|
| 25 | `increment_ticket_sold_count` | Atomically increments tickets sold | `scripts/db/migrations/057c-ticket-sold-count-rpc.sql:4` |
| 26 | `decrement_ticket_sold_count` | Atomically decrements tickets sold | `scripts/db/migrations/057c-ticket-sold-count-rpc.sql:13` |

**Impact:** Low. This is a defense-in-depth measure. None of these functions currently have known conflicts, but it's best practice to pin the search path.

**Fix script:** `004-fix-function-search-paths.sql`

---

## Warning 27–36: RLS Policy Always True

**Lint Rule:** [0024_permissive_rls_policy](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy)
**Severity:** WARN | **Faces:** External

### What's wrong?

10 RLS policies use `USING (true)` or `WITH CHECK (true)`, which means they allow **any** row to be inserted/updated/deleted regardless of who the user is. The policy exists but does nothing.

### Why is that bad?

These policies give a false sense of security. You might think RLS is protecting the table, but the policy literally allows everything. An attacker with the `anon` key could insert, update, or delete any row.

### Which policies are affected?

**"System" insert policies (INSERT WITH CHECK true) — intended for service-role only:**

| # | Table | Policy Name | What the table stores | Defined in |
|---|-------|-------------|----------------------|-----------|
| 27 | `activity_logs` | System can insert logs | User activity audit trail | `scripts/db/migrations/002-admin-schema.sql:280` |
| 28 | `admin_notifications` | System can insert notifications | Admin notification queue | `scripts/db/migrations/036-admin-notifications.sql:47` |
| 29 | `receipt_audit_log` | System can insert receipt logs | Receipt generation audit trail | `scripts/db/migrations/010-receipt-system.sql:75` |
| 30 | `support_admin_actions` | System can insert support admin actions | Support ticket admin actions | `scripts/db/migrations/035-support-admin-actions.sql:58` |

**"Anonymous" insert policies (INSERT WITH CHECK true) — intended for public form submissions:**

| # | Table | Policy Name | What the table stores | Defined in |
|---|-------|-------------|----------------------|-----------|
| 31 | `contact_submissions` | Allow anonymous inserts | Contact form submissions | `scripts/db/migrations/001-create-tables.sql:70` |
| 32 | `newsletter_subscriptions` | Allow anonymous inserts | Newsletter signups | `scripts/db/migrations/001-create-tables.sql:71` |
| 33 | `volunteer_applications` | Allow anonymous inserts | Volunteer applications | `scripts/db/migrations/001-create-tables.sql:74` |

**Authenticated user policies (INSERT/UPDATE/DELETE with always-true) — media management:**

| # | Table | Policy Name | Operation | What the table stores | Defined in |
|---|-------|-------------|-----------|----------------------|-----------|
| 34 | `media_assets` | Authenticated users can insert media | INSERT | Media file metadata | `scripts/db/migrations/006-media-assets.sql:57` |
| 35 | `media_assets` | Authenticated users can update media | UPDATE | Media file metadata | `scripts/db/migrations/006-media-assets.sql:64` |
| 36 | `media_assets` | Authenticated users can delete media | DELETE | Media file metadata | `scripts/db/migrations/006-media-assets.sql:71` |

| # | Table | Policy Name | Operation | What the table stores | Defined in |
|---|-------|-------------|-----------|----------------------|-----------|
| — | `podcasts` | Authenticated users can insert podcasts | INSERT | Podcast episodes | `scripts/db/migrations/012-create-podcasts-table.sql:79` |
| — | `podcasts` | Authenticated users can update podcasts | UPDATE | Podcast episodes | `scripts/db/migrations/012-create-podcasts-table.sql:86` |
| — | `podcasts` | Authenticated users can delete podcasts | DELETE | Podcast episodes | `scripts/db/migrations/012-create-podcasts-table.sql:94` |

### Should you fix these?

It depends on intent:

- **System insert policies** (activity_logs, admin_notifications, etc.): These are fine as-is IF only the service-role client writes to them. But to be safe, restrict them to `auth.role() = 'service_role'`.
- **Anonymous insert policies** (contact_submissions, newsletter, volunteer): These are **intentionally open** — the whole point is that anyone can submit a contact form or subscribe. The linter flags them, but this is by design. You could add basic validation (e.g., check email format) but `USING (true)` is acceptable here.
- **Authenticated media policies**: These allow any logged-in user to upload/delete any media. Consider restricting to own uploads or admin role.

**Fix script:** `005-fix-permissive-rls-policies.sql`

---

## Warning 37–51: Public Bucket Allows Listing

**Lint Rule:** [0025_public_bucket_allows_listing](https://supabase.com/docs/guides/database/database-linter?lint=0025_public_bucket_allows_listing)
**Severity:** WARN | **Faces:** External

### What's wrong?

15 public storage buckets have a broad `SELECT` policy on `storage.objects`, which allows anyone to **list** all files in the bucket (not just access them by URL).

### Why is that bad?

If someone knows the bucket name, they can call the Supabase Storage API to list every file in it — getting a full directory of filenames, sizes, and metadata. For public image buckets this is mostly harmless, but for `receipts` it could expose receipt filenames.

### Which buckets are affected?

| # | Bucket | What it stores | Risk | Defined in |
|---|--------|---------------|------|-----------|
| 37 | `conference-uploads` | Conference-related files | Low | `scripts/db/migrations/041-conference-file-upload-bucket.sql:83` |
| 38 | `event-images` | Event cover photos | Low | `scripts/db/migrations/003-storage-setup.sql:29` |
| 39 | `event-uploads` | Event-related files | Low | `scripts/db/migrations/056b-event-uploads-storage-bucket.sql:72` |
| 40 | `hero-images` | Homepage hero banners | Low | `scripts/db/migrations/004-site-assets-storage.sql:20` |
| 41 | `og-images` | Open Graph preview images | Low | `scripts/db/migrations/004-site-assets-storage.sql:35` |
| 42 | `partner-logos` | Partner/sponsor logos | Low | `scripts/db/migrations/003-storage-setup.sql:33` |
| 43 | `press-gallery` | Press/media photos | Low | `scripts/db/migrations/004-site-assets-storage.sql:30` |
| 44 | `project-images` | Project photos | Low | `scripts/db/migrations/003-storage-setup.sql:17` |
| 45 | `receipts` | Generated receipt PDFs | **Medium** | `scripts/db/migrations/010-receipt-system.sql:141` |
| 46 | `site-assets` | General site assets | Low | `scripts/db/migrations/004-site-assets-storage.sql:25` |
| 47 | `story-images` | Blog/story images | Low | `scripts/db/migrations/003-storage-setup.sql:21` |
| 48 | `team-photos` | Team member photos | Low | `scripts/db/migrations/003-storage-setup.sql:25` |
| 49 | `testimonials` | Testimonial images | Low | `scripts/db/migrations/039b-testimonials-storage-bucket.sql:38` |
| 50 | `videos` | Video files | Low | `scripts/db/migrations/003-storage-setup.sql:37` |

**Not affected (private buckets):**
- `bank-transfer-proofs` — private, no public policy
- `event-payment-screenshots` — private, no public policy

### How to fix

The issue is that the SELECT policy uses `USING (bucket_id = '...')` which allows listing. For most buckets, file access is by direct URL (e.g., `storage.from('hero-images').getPublicUrl(path)`), so listing isn't needed. You can replace the broad policy with one that only allows read access by URL, not listing.

**Impact:** Low for image buckets. Medium for `receipts` — receipt filenames could reveal donor info.

**Fix script:** `006-fix-public-bucket-listing.sql`

---

## Warning 52–53: SECURITY DEFINER Functions Callable by Anon

**Lint Rule:** [0028_anon_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
**Severity:** WARN | **Faces:** External

### What's wrong?

15 functions marked `SECURITY DEFINER` can be called by anyone — including anonymous users (no login required) — via the REST API endpoint `/rest/v1/rpc/function_name`.

### Why is that bad?

A `SECURITY DEFINER` function runs with the permissions of the creator (usually `postgres`). If an anonymous user calls `create_admin_notification()`, the function executes as the superuser, potentially allowing them to create notifications, mark things read, or modify settings they shouldn't.

### Which functions are affected?

| # | Function | What it does | Risk |
|---|----------|-------------|------|
| 52 | `create_admin_notification` | Creates admin notifications | **High** — anon can create fake notifications |
| 53 | `get_admin_role` | Returns admin role for current user | Low — returns null for anon |
| 54 | `get_homepage_featured_stories_rules` | Returns featured stories config | Low — read-only |
| 55 | `get_homepage_programs` | Returns homepage programs | Low — read-only |
| 56 | `get_homepage_stats` | Returns donation stats | Low — read-only |
| 57 | `get_homepage_trust_indicators` | Returns trust indicators | Low — read-only |
| 58 | `get_unread_notification_count` | Returns unread count | Low — returns 0 for anon |
| 59 | `increment_rate_limit` | Tracks rate limits | Medium — anon can increment counters |
| 60 | `is_admin_user` | Checks if user is admin | Low — returns false for anon |
| 61 | `mark_all_notifications_read` | Marks all notifications read | **High** — anon could mark all as read |
| 62 | `mark_notification_read` | Marks one notification read | **High** — anon could mark others' notifications |
| 63 | `update_homepage_setting` | Updates homepage CMS | **Critical** — anon could change homepage content |

### How to fix

Revoke `EXECUTE` permission from the `anon` role for functions that should require authentication. For admin-only functions, also revoke from `authenticated` and grant only to `service_role`.

**Fix script:** `007-fix-function-execution-perms.sql`

---

## Warning 54–68: SECURITY DEFINER Functions Callable by Authenticated Users

**Lint Rule:** [0029_authenticated_security_definer_function_executable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
**Severity:** WARN | **Faces:** External

### What's wrong?

The same 15 functions can also be called by any signed-in user. While better than anonymous access, a regular (non-admin) user could still call admin functions.

### Why is that bad?

Any user who signs up can call `update_homepage_setting()`, `create_admin_notification()`, or `mark_notification_read()` — functions meant for admins only. The `SECURITY DEFINER` property means these execute as the superuser, bypassing any permission checks inside the function.

### Which functions are critical to restrict?

| # | Function | Why it's dangerous for regular users |
|---|----------|--------------------------------------|
| 64 | `update_homepage_setting` | Can change homepage content |
| 65 | `create_admin_notification` | Can create fake admin notifications |
| 66 | `mark_notification_read` | Can mark other users' notifications |
| 67 | `mark_all_notifications_read` | Can mark all notifications as read |
| 68 | `increment_rate_limit` | Can manipulate rate limit counters |

### How to fix

Revoke `EXECUTE` from `authenticated` for admin-only functions, and grant only to `service_role`. Read-only functions (get_homepage_stats, etc.) can remain accessible to authenticated users.

**Fix script:** `007-fix-function-execution-perms.sql`

---

## Warning 69: Leaked Password Protection Disabled

**Lint Rule:** [auth_leaked_password_protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
**Severity:** WARN | **Faces:** External

### What's wrong?

Supabase Auth can check new passwords against HaveIBeenPwned.org to prevent users from using passwords that have appeared in data breaches. This feature is currently disabled.

### Why is that bad?

Users can set passwords like `password123` or `qwerty` that have been compromised in thousands of breaches. If any user's password is in a breach database, their account is vulnerable to credential stuffing attacks.

### How to fix

Enable leaked password protection in the Supabase dashboard:
1. Go to **Authentication → Settings**
2. Under **Password Settings**, enable **"Check leaked passwords"**

This is a one-click fix with no code changes needed.

**Impact:** None on existing users. New password changes will be checked. Users with compromised passwords won't be forced to change them until their next login attempt.

---

## Summary by Fix Script

| Script | Warnings Fixed | Category |
|--------|---------------|----------|
| `004-fix-function-search-paths.sql` | 26 | Mutable search_path |
| `005-fix-permissive-rls-policies.sql` | 10 | Always-true RLS policies |
| `006-fix-public-bucket-listing.sql` | 15 | Public bucket listing |
| `007-fix-function-execution-perms.sql` | 30 | Function EXECUTE permissions |
| Supabase Dashboard | 1 | Leaked password protection |
| **Total** | **82** | |
