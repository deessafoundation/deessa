# Supabase Key Migration Guide

## Overview
Supabase has updated their key terminology. This guide covers the migration and proper usage.

## Key Terminology Changes

| Old Name | New Name | Usage |
|----------|----------|-------|
| `anon key` | **Publishable Key** | Client-side (browser, React components) |
| `service_role key` | **Secret Key** | Server-side only (API routes, Server Actions) |

---

## 🔑 Key Types & Usage

### 1. Publishable Key (formerly "anon key")
**Environment Variable:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

✅ **Safe for:**
- Browser/client-side code
- React components
- Mobile applications
- Public-facing API calls
- Works with Row Level Security (RLS) policies

```typescript
// ✅ SAFE - Client component
"use client"
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient() // Uses NEXT_PUBLIC_SUPABASE_ANON_KEY
  // ... authenticated queries respect RLS
}
```

### 2. Secret Key (formerly "service_role key")
**Environment Variables:**
- `SUPABASE_SERVICE_ROLE_KEY` (old naming - still works)
- `SUPABASE_SECRET_KEY` (new naming - recommended)

🔒 **ONLY use in:**
- Next.js API routes (`app/api/**/route.ts`)
- Server Actions (`"use server"`)
- Server Components (with extreme caution)
- Admin operations
- Database migrations/scripts

⚠️ **BYPASSES all RLS policies** - full database access!

```typescript
// ✅ SAFE - Server-side only
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Secret key - server only
  )
  // ... admin operations
}
```

---

## 🚨 Security Issues Fixed

### Issue #1: Google Maps API Key (RESOLVED ✅)
**Location:** `app/(public)/conference/page.tsx:44`  
**Status:** Removed - now using query-based embedding (no API key needed)

### Issue #2: Supabase Service Key (NEEDS ROTATION 🔄)
**Location:** Previously in `scripts/insert-podcasts.mjs` (file removed)  
**Action Required:**
1. Rotate the key in Supabase dashboard
2. Update `.env.local` with new key
3. Never commit to git

---

## ✅ Action Plan

### Step 1: Rotate Your Keys (Do This NOW)

#### Rotate Supabase Secret Key:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API
4. Under "Project API keys" → Find "service_role" key
5. Click "Regenerate" (or create new project if compromised)
6. Copy the new secret key

#### Regenerate Google API Key (if you were using one):
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Find the compromised key → Delete it
4. Create new key with proper restrictions:
   - API restrictions: Only Text-to-Speech API
   - Application restrictions: HTTP referrers (websites)

### Step 2: Update Your `.env.local`

```bash
# ========================================
# SUPABASE CONFIGURATION
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_publishable_anon_key_here

# Server-side secret key (NEVER commit this)
SUPABASE_SERVICE_ROLE_KEY=your_new_secret_service_role_key_here
SUPABASE_SECRET_KEY=your_new_secret_service_role_key_here

# ========================================
# GOOGLE CLOUD (Optional - TTS only)
# ========================================
# Only needed for Nepali text-to-speech
GOOGLE_TTS_API_KEY=your_new_restricted_api_key_here
```

### Step 3: Update Production (Vercel)

```bash
# Using Vercel CLI
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your new secret key when prompted

vercel env add GOOGLE_TTS_API_KEY production
# Paste your new restricted API key
```

Or via Vercel Dashboard:
1. Project Settings → Environment Variables
2. Find `SUPABASE_SERVICE_ROLE_KEY` → Edit → Paste new value
3. Redeploy to apply changes

### Step 4: Verify `.gitignore`

Ensure these files are NEVER committed:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Vercel
.vercel
```

---

## 🛡️ Prevention Checklist

- [ ] All secrets are in `.env.local` or Vercel environment variables
- [ ] No hardcoded API keys in source code
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` contains only placeholder values
- [ ] API keys have proper restrictions (IP, HTTP referrer, or API-specific)
- [ ] Different keys for development and production
- [ ] Team members have their own API keys (not shared)

---

## 🔍 How to Check for Leaks

### Scan your codebase:
```powershell
# Search for JWT patterns (Supabase keys)
Select-String -Path . -Pattern "eyJ[A-Za-z0-9_-]+" -Recurse

# Search for Google API keys
Select-String -Path . -Pattern "AIza[A-Za-z0-9_-]+" -Recurse

# Search for common secret patterns
Select-String -Path . -Pattern "(api[_-]?key|secret[_-]?key|password)\s*=\s*['\"][^'\"]+['\"]" -Recurse
```

### Use GitHub's secret scanning:
- Settings → Code security and analysis → Secret scanning → Enable

---

## 📚 Additional Resources

- [Supabase API Keys Docs](https://supabase.com/docs/guides/api/api-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

## ⚠️ If Keys Were Committed to Git

If you accidentally committed secrets to git history:

### Option 1: BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh bare repo
git clone --mirror https://github.com/your-org/your-repo.git

# Remove secrets
java -jar bfg.jar --replace-text secrets.txt your-repo.git

# Push cleaned history
cd your-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### Option 2: Git Filter-Branch
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file/with/secret" \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
```

⚠️ **Coordinate with your team** - force pushing rewrites history for everyone!

---

## Questions?

Contact the dev team or refer to:
- `docs/setup/environment-variables.md`
- `.env.example` for all available configuration options
