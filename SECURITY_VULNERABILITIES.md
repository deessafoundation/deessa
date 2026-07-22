# Security Vulnerability Report

**Project:** Deesha Foundation (Next.js 16 / Supabase)  
**Audit Date:** 2026-06-27  
**Scope:** Full codebase — API routes, server actions, middleware, configuration, database scripts  

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 4 |
| 🟡 Medium | 7 |
| 🔵 Low | 6 |
| ℹ️ Informational | 3 |
| **Total** | **22** |

---

## 🔴 CRITICAL

---

### CRIT-1 — Hardcoded Fallback Admin Setup Key

**File:** `lib/actions/admin-setup.ts` — line 28  
**Code:**
```ts
const expectedKey = process.env.ADMIN_SETUP_KEY || "deessa-foundation-2024"
```

**Description:**  
When the `ADMIN_SETUP_KEY` environment variable is not set, the setup key falls back to the hardcoded string `"deessa-foundation-2024"`. Since this string is committed to the repository, any person with read access to the code (including if the repo is ever made public or leaked) can trivially create the first `SUPER_ADMIN` account on any fresh or reset deployment.

**Impact:**  
Full administrative takeover of the platform on any deployment where `ADMIN_SETUP_KEY` has not been explicitly set in the environment.

**Fix:**
```ts
const expectedKey = process.env.ADMIN_SETUP_KEY
if (!expectedKey) {
  return { error: "Server misconfiguration: ADMIN_SETUP_KEY is not set." }
}
if (setupKey !== expectedKey) {
  return { error: "Invalid setup key" }
}
```
Remove the fallback entirely. Fail loudly if the env var is missing.

---

### CRIT-2 — `deleteConferenceRegistration` Uses Service Role Without Any Auth Check

**File:** `lib/actions/conference-registration.ts` — `deleteConferenceRegistration` function  
**Code:**
```ts
export async function deleteConferenceRegistration(
  registrationId: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  // ...
  supabase = createServiceRoleClient()  // bypasses RLS
  // No getCurrentAdmin() / auth check before this!
  // ...
  await supabase.from("conference_registrations").delete().eq("id", registrationId)
}
```

**Description:**  
This server action creates a service-role Supabase client (which bypasses all Row Level Security policies) and deletes a conference registration without first verifying that the caller is an authenticated admin. Next.js server actions can be directly invoked via HTTP POST to their endpoint URL, bypassing the admin UI. The only "guard" is knowing the registration ID and email — both of which may be discoverable.

**Impact:**  
Any actor who knows or can guess a registrant's UUID and email address can permanently delete their conference registration.

**Fix:**
```ts
export async function deleteConferenceRegistration(...) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }
  // ... rest of function
}
```

---

## 🟠 HIGH

---

### HIGH-1 — Multiple Admin Conference Server Actions Lack Authorization Checks

**File:** `lib/actions/conference-registration.ts`  
**Affected functions:**
- `confirmConferenceRegistration`
- `cancelConferenceRegistration`
- `markConferencePaymentManual`
- `extendConferenceRegistrationExpiry`
- `resendConferencePaymentLink`
- `resendConferenceRegistrationEmail`
- `resendConferenceConfirmationEmail`
- `updateConferenceRegistrationNotes`
- `sendCustomConferenceEmail`
- `sendTemplateConferenceEmail`
- `getConferenceRegistrations`
- `getConferenceRegistration`

**Description:**  
All of these admin-only functions use `createClient()` (user-session client) but never call `getCurrentAdmin()` to verify the caller holds an active admin role. While the admin UI pages are protected by middleware, Next.js server actions are exposed as HTTP POST endpoints that can be called directly from outside the UI. The middleware protects page navigation only, not direct action invocations.

**Impact:**  
Any authenticated Supabase user (even one without admin status) could invoke these actions directly to confirm payments, send emails to registrants, cancel registrations, or access full PII for all conference attendees. Non-authenticated users may also be able to call read-only actions if RLS is permissive.

**Fix:**  
Add an auth guard to every admin action:
```ts
export async function confirmConferenceRegistration(id: string, ...) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, error: "Unauthorized" }
  // ...
}
```

---

### HIGH-2 — In-Memory Rate Limiter Ineffective on Serverless

**File:** `app/api/conference/start-payment/route.ts`  
**Code:**
```ts
const ipHits = new Map<string, { count: number; resetAt: number }>()
```

**Description:**  
The `start-payment` endpoint uses a module-level `Map` for rate limiting. On Vercel (serverless), each function invocation may run in a fresh container with no shared memory. The in-memory state is lost on every cold start, and concurrent requests are served by separate instances that each have an empty map. The rate limit is effectively bypassed entirely in production.

The project already has a robust Supabase-backed distributed rate limiter at `lib/rate-limit.ts` that is correctly used by other endpoints (receipts, support forms).

**Impact:**  
Attackers can create an unlimited number of Stripe/Khalti/eSewa payment sessions (which are costly API operations) with no throttling, enabling denial-of-service via payment provider quota exhaustion and potentially fraudulent session flooding.

**Fix:**  
Replace the in-memory logic with the existing `checkRateLimit` from `lib/rate-limit.ts`:
```ts
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

const ip = getClientIP(request) ?? "unknown"
const rateLimit = await checkRateLimit({
  identifier: `conference-start-payment:ip:${ip}`,
  maxAttempts: 10,
  windowMinutes: 1,
})
if (!rateLimit.allowed) {
  return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 })
}
```

---

### HIGH-3 — Wildcard Image `remotePatterns` Enables SSRF

**File:** `next.config.mjs`  
**Code:**
```js
{
  protocol: 'https',
  hostname: '**', // Allow all HTTPS domains for flexibility
}
```

**Description:**  
The Next.js Image Optimization API (`/_next/image?url=...`) will proxy and cache images from any HTTPS host when this wildcard pattern is present. An attacker can craft a URL that forces the Next.js server to issue requests to arbitrary HTTPS endpoints, including internal services (e.g., cloud metadata APIs like `https://169.254.169.254` — though this is HTTP, variation with internal HTTPS services is still possible), third-party APIs that log inbound requests, or endpoints used for exfiltration.

**Impact:**  
Server-Side Request Forgery (SSRF). Potential exposure of internal network services, cloud metadata, and unintended proxying of attacker-controlled content.

**Fix:**  
Enumerate specific trusted hostnames instead of using a wildcard:
```js
remotePatterns: [
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  { protocol: 'https', hostname: '*.supabase.co' },
  // Add only domains actually used by the app
],
```

---

### HIGH-4 — TypeScript Build Errors Silently Ignored

**File:** `next.config.mjs`  
**Code:**
```js
typescript: {
  ignoreBuildErrors: true,
},
```

**Description:**  
TypeScript type errors are suppressed at build time, meaning the application ships even when type-safety violations exist. Security-sensitive patterns such as incorrect type handling of user input, wrong parameter types passed to Supabase queries, missing null checks on auth objects, and unsafe casts can all go undetected. This flag effectively disables a significant layer of static analysis that guards against entire classes of bugs.

**Impact:**  
Security bugs hidden by TypeScript type errors can reach production undetected.

**Fix:**  
Remove `ignoreBuildErrors: true`. Fix any existing TypeScript errors to re-enable type checking at build time.

---

## 🟡 MEDIUM

---

### MED-1 — No Root-Level `middleware.ts` Found

**Situation:**  
The Supabase session management logic lives in `lib/supabase/middleware.ts` as a utility function (`updateSession`). For Next.js to execute middleware on every request, a `middleware.ts` file must exist at the project root (or `src/`). No such root-level file was found.

**Description:**  
If `updateSession` is never called via a proper root `middleware.ts`, Supabase SSR session cookies will not be refreshed automatically. Access tokens expire (typically after 1 hour), and without middleware refreshing them, users will appear unauthenticated despite having valid refresh tokens. Worse, a stale but technically valid token could bypass checks in server components that rely on the middleware having already validated the session.

**Impact:**  
Auth session refresh failures; potential token staleness leading to inconsistent authentication state across routes.

**Fix:**  
Create `middleware.ts` at the project root:
```ts
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

### MED-2 — Email Enumeration via Admin Login Error Messages

**File:** `lib/actions/admin-auth.ts` — line 40  
**Code:**
```ts
if (adminError || !adminUser) {
  await supabase.auth.signOut()
  return { error: "You do not have admin access" }
}
```

**Description:**  
When a valid email/password pair belongs to a non-admin Supabase user, the error message `"You do not have admin access"` confirms that the credentials are correct. An attacker can distinguish between "wrong password", "email not found", and "valid credentials but not admin" — enabling targeted credential stuffing against known non-admin accounts.

**Impact:**  
User account enumeration; aids in targeted attacks.

**Fix:**  
Return a generic error message for all login failures:
```ts
return { error: "Invalid credentials" }
```

---

### MED-3 — No Rate Limiting on Public Form Submissions

**Files:**
- `lib/actions/contact.ts` — `submitContactForm`
- `lib/actions/newsletter.ts` — `subscribeToNewsletter`
- `lib/actions/volunteer.ts` — `submitVolunteerApplication`
- `lib/actions/event-registration.ts` — `registerForEvent` (inferred)

**Description:**  
These public server actions accept user-submitted data and write to the database without any rate limiting. The distributed `checkRateLimit` utility (`lib/rate-limit.ts`) is already in use for the support form and receipt download endpoints, but has not been applied to these higher-traffic public-facing forms.

**Impact:**  
Spam flooding of the database and admin inboxes; newsletter list pollution; fake volunteer/event applications; potential database write quota exhaustion.

**Fix:**  
Apply `checkRateLimit` (by email or IP) to each of these actions, mirroring the pattern used in `lib/actions/support.ts`.

---

### MED-4 — Weak XSS Sanitization in Support Form

**File:** `lib/actions/support.ts` — line 31  
**Code:**
```ts
function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim()
}
```

**Description:**  
The `sanitizeText` helper only strips angle-bracket characters `<` and `>`. This does not prevent injection of JavaScript event attributes (e.g., `onclick=`, `onerror=`), encoded HTML entities, Unicode lookalikes, or other XSS vectors. The project already has `isomorphic-dompurify` as a dependency, which provides robust server-safe sanitization.

**Impact:**  
Stored XSS if any of these fields are rendered as HTML in the admin panel without further sanitization.

**Fix:**  
```ts
import DOMPurify from "isomorphic-dompurify"

function sanitizeText(value: string) {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}
```

---

### MED-5 — `window.location.origin` Used Inside a Server Action

**File:** `lib/actions/admin-setup.ts` — line 57  
**Code:**
```ts
options: {
  emailRedirectTo:
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/admin`,
}
```

**Description:**  
This file is a server action (`"use server"`). `window` is never defined in the Node.js runtime, so the ternary always evaluates to `""`, producing `emailRedirectTo: "/admin"` — a relative URL that Supabase's email service cannot use. New admin users created via signup will receive an email confirmation link pointing to an invalid URL.

**Impact:**  
Admin email confirmation links are broken, preventing email verification on newly created admin accounts (except when `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set).

**Fix:**  
```ts
emailRedirectTo:
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
  `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin`,
```

---

### MED-6 — `LEGACY_RECEIPT_ACCESS` Can Expose Receipts Without Token Auth

**File:** `app/api/receipts/download/route.ts` — line 66  
**Code:**
```ts
const legacyAccessEnabled = process.env.LEGACY_RECEIPT_ACCESS === "true"
// ...
else if (legacyReceiptNumber && legacyAccessEnabled) {
  // Fetches donation by receipt_number only — no JWT required
}
```

**Description:**  
When the `LEGACY_RECEIPT_ACCESS=true` environment variable is set, any caller who knows or can enumerate a receipt number can download the full donor receipt (containing PII: name, email, phone, donation amount, transaction references) without any token-based authentication. Receipt numbers may follow a predictable format, making sequential guessing feasible.

**Impact:**  
Unauthorized access to donor PII and financial data.

**Fix:**  
Remove or disable `LEGACY_RECEIPT_ACCESS` in production. If needed for migration only, add an IP allowlist or time-limited access window.

---

### MED-7 — Admin Rejection Email Injects Unsanitized Admin Notes as HTML

**File:** `lib/actions/admin-donation-review.ts` — lines 183–189  
**Code:**
```ts
html: `
  <p>Dear ${donation.donor_name},</p>
  <p><strong>Reason:</strong> ${input.notes}</p>
`
```

**Description:**  
Admin-provided `input.notes` are interpolated directly into an HTML email body without sanitization. A malicious or compromised admin account could inject arbitrary HTML (including tracking pixels, phishing links, or social engineering content) into emails sent to donors.

**Impact:**  
HTML injection in outbound emails; potential phishing of donors via email HTML injection by a rogue admin.

**Fix:**
```ts
import DOMPurify from "isomorphic-dompurify"

const safeNotes = DOMPurify.sanitize(input.notes, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
// Use safeNotes in the email template
```

---

## 🔵 LOW

---

### LOW-1 — Missing Security HTTP Headers

**File:** `next.config.mjs` (no `headers()` export found)

**Description:**  
The application does not configure any security-related HTTP response headers. The following are absent:

| Header | Risk Without It |
|--------|----------------|
| `Content-Security-Policy` | XSS via inline scripts / external resource injection |
| `X-Frame-Options` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME sniffing attacks |
| `Referrer-Policy` | Leakage of internal URLs in Referer headers |
| `Permissions-Policy` | Unwanted browser feature access |
| `Strict-Transport-Security` | Downgrade attacks on HTTPS |

**Fix:**  
Add a `headers()` export to `next.config.mjs`:
```js
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
      },
    ],
  }]
},
```

---

### LOW-2 — `getReviewStats()` Accesses Donation Data Without Auth Check

**File:** `lib/actions/admin-donation-review.ts` — `getReviewStats` function  
**Code:**
```ts
export async function getReviewStats() {
  const serviceSupabase = getServiceSupabase()  // bypasses RLS
  const { data: donations } = await serviceSupabase
    .from("donations")
    .select("id, created_at, payment_status")
    .eq("payment_status", "review")
  // No auth check
}
```

**Description:**  
This server action fetches donation records using the service role client (bypassing RLS) with no authentication or authorization check. Any actor who can invoke the server action endpoint can retrieve donation review statistics.

**Fix:**  
Add an admin check at the start of the function:
```ts
const admin = await getCurrentAdmin()
if (!admin) return { totalInReview: 0, oldReviews: 0, needsEscalation: false }
```

---

### LOW-3 — Hardcoded Internal Network IP in `allowedDevOrigins`

**File:** `next.config.mjs`  
**Code:**
```js
allowedDevOrigins: ["http://172.31.112.1:3000"],
```

**Description:**  
A private network IP is hardcoded in the configuration. This exposes information about the local network topology and could inadvertently allow requests from this IP to bypass Next.js dev-mode origin checks. This config key should only be present in local developer overrides, not in the committed codebase.

**Fix:**  
Remove `allowedDevOrigins` from the committed config and manage it via `.env.local` or a developer-specific override.

---

### LOW-4 — No Audit Trail for Most Conference Admin Actions

**File:** `lib/actions/conference-registration.ts`

**Description:**  
Unlike donation review actions and user management actions (which write to `activity_logs`), most conference registration admin actions (`confirmConferenceRegistration`, `cancelConferenceRegistration`, `markConferencePaymentManual`, etc.) do not insert records into `activity_logs`. This means there is no verifiable record of which admin performed which action and when.

**Impact:**  
No accountability trail for sensitive operations; difficulty in post-incident forensics.

**Fix:**  
Insert into `activity_logs` for all state-changing conference admin actions, following the pattern used in `lib/actions/admin-settings.ts`.

---

### LOW-5 — Service Role Client Instantiated on Every Call (No Singleton)

**Files:**  
`lib/actions/donation.ts`, `lib/actions/admin-donation-review.ts`, `lib/actions/conference-registration.ts`, `lib/actions/storage-browser.ts`, and others.

**Description:**  
Each file defines its own local `getServiceSupabase()` factory, creating a new Supabase client on every invocation. While not directly a security vulnerability, this pattern increases the risk of accidentally exposing `SUPABASE_SERVICE_ROLE_KEY` through misconfiguration, copy-paste errors, or accidentally using the factory in a client component context. The project already has `lib/supabase/service.ts` (used correctly in `support.ts`).

**Fix:**  
Consolidate all service role client creation through `lib/supabase/service.ts`. Remove duplicated inline factories.

---

### LOW-6 — Verbose Error Messages in `console.error` May Leak Sensitive Data

**Files:** Multiple server actions and API routes

**Description:**  
Numerous locations use `console.error(...)` with raw Supabase error objects, database error messages, and internal state. On Vercel, these logs are accessible to anyone with access to the Vercel dashboard and may appear in log aggregation services. While not a direct attack vector, logged data can include stack traces, SQL error messages, and user data that aids attackers in reconnaissance.

**Fix:**  
Ensure production log levels are configured to suppress verbose error detail. Use structured logging with sanitized messages. Never log PII (`donor_email`, `full_name`, etc.) at error level.

---

## ℹ️ INFORMATIONAL

---

### INFO-1 — No `CRON_SECRET` Will Crash the Cron Route

**File:** `app/api/cron/expire-conference-registrations/route.ts` — line 13  
**Code:**
```ts
if (!cronSecret) {
  console.error("CRON_SECRET environment variable is not set")
  return NextResponse.json({ error: "Cron not configured" }, { status: 500 })
}
```
This is handled correctly — the cron returns 500 if unconfigured. ✅  
**Recommendation:** Document `CRON_SECRET` as a required production environment variable in the deployment guide.

---

### INFO-2 — Password Minimum Length of 8 May Be Too Weak

**File:** `lib/actions/admin-setup.ts` — line 38  
**Code:**
```ts
if (password.length < 8) {
  return { error: "Password must be at least 8 characters" }
}
```

OWASP recommends a minimum of 12 characters for administrative accounts. Consider enforcing stricter complexity requirements (length ≥ 12, mixed case, numbers, special characters) for admin passwords.

---

### INFO-3 — `.env.example` File Not Found at Root

The explore subagent could not find `.env.example` at the repository root. Ensure it exists and documents all required environment variables including:

- `ADMIN_SETUP_KEY` (required — not optional)
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_EMAIL` / `GOOGLE_APP_PASSWORD`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (needed for admin email redirect fix)

---

## What Was Assessed and Found Secure

The following areas were reviewed and found to implement good security practices:

| Area | Assessment |
|------|-----------|
| Stripe webhook signature verification | ✅ Correctly implemented with `STRIPE_WEBHOOK_SECRET` |
| Webhook idempotency | ✅ `payment_events` table prevents double-processing |
| File upload security | ✅ MIME type validation, 2MB size limit, filename sanitization |
| Admin middleware auth | ✅ Session checked on every admin route, role-based path restrictions |
| Conference payment dual-key check | ✅ Registration ID + email both required |
| Distributed rate limiter (`lib/rate-limit.ts`) | ✅ Supabase-backed atomic PostgreSQL implementation |
| Receipt download token auth | ✅ JWT-based token verification |
| Receipt download rate limiting | ✅ Uses `checkRateLimit` correctly |
| Support form rate limiting | ✅ Per-email limit via `checkRateLimit` |
| Admin user creation | ✅ Only SUPER_ADMIN can create new admins |
| Git ignore | ✅ `.env` files are properly excluded |
| Cron job protection | ✅ Bearer token auth on cron endpoint |

---

*Report generated by automated codebase security analysis.*
