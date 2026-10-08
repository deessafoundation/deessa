# 🚨 SECURITY ACTION REQUIRED - Key Rotation

**Status:** Your Supabase service role key was leaked publicly and must be rotated immediately.

---

## ⏱️ Do This NOW (5 minutes)

### Step 1: Rotate the Leaked Key

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/tqljblbdfhjfqnegjobi/settings/api
   - Or: Dashboard → Your Project → Settings → API

2. **Scroll to "Project API keys" section**

3. **Find the "service_role" key:**
   ```
   service_role
   secret
   This key has the ability to bypass Row Level Security...
   ```

4. **Click the eye icon to reveal the current key**
   - Confirm it matches: `eyJ...HBGq4` (the leaked one)

5. **Generate new service role key:**
   - Click the **"Generate new service_role key"** button (or similar)
   - **IMPORTANT:** Copy the new key immediately - you can't see it again!

---

### Step 2: Update Your Local `.env`

1. **Open `.env` in your project root**

2. **Replace this line:**
   ```bash
   # OLD (LEAKED)
   SUPABASE_SERVICE_ROLE_KEY="your_current_service_role_key_here"
   ```

3. **With the new key:**
   ```bash
   # NEW (SECURE)
   SUPABASE_SERVICE_ROLE_KEY="your_new_key_from_dashboard_here"
   ```

4. **Save the file**

---

### Step 3: Test Locally

```powershell
# Test that your app still works
pnpm run dev

# Visit: http://localhost:3000
# Try making a donation or accessing admin features
```

If everything works, the key rotation was successful! ✅

---

### Step 4: Update Production (Vercel)

#### Option A: Vercel Dashboard (Easier)
1. Go to: https://vercel.com/your-team/deessa-foundation/settings/environment-variables
2. Find: `SUPABASE_SERVICE_ROLE_KEY`
3. Click **"Edit"**
4. Paste your **new key**
5. Select all environments: **Production**, **Preview**, **Development**
6. Click **"Save"**
7. **Redeploy:** Settings → Deployments → Latest deployment → "Redeploy"

#### Option B: Vercel CLI (Faster)
```powershell
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Add the new key to production
vercel env rm SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your new key when prompted

# Add to preview
vercel env rm SUPABASE_SERVICE_ROLE_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
# Paste your new key when prompted

# Trigger redeploy
vercel --prod
```

---

### Step 5: Verify Production

1. **Visit your production site:** https://deessafoundation.org
2. **Test critical features:**
   - [ ] Stripe donation flow
   - [ ] Khalti payment
   - [ ] Receipt download
   - [ ] Admin login
   - [ ] Webhook processing (make a test donation)

3. **Check Vercel logs:**
   - Vercel Dashboard → Deployments → Functions
   - Look for any "Missing Supabase" errors

---

## 🎯 Summary: What You Have

After cleanup, your `.env` now has **only the 2 keys you actually need**:

```bash
# ✅ These 2 keys are ALL you need:

1. NEXT_PUBLIC_SUPABASE_ANON_KEY
   → Client-side safe (browser, React components)
   → Respects Row Level Security policies

2. SUPABASE_SERVICE_ROLE_KEY  
   → Server-side only (API routes, webhooks)
   → Bypasses RLS - full admin access
   → 🚨 THIS ONE WAS LEAKED - rotate it!

# ❌ These were removed (not used anywhere in your code):
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_PUBLISHABLE_KEY  
- SUPABASE_SECRET_KEY
```

---

## 📋 Post-Rotation Checklist

- [ ] Rotated service role key in Supabase Dashboard
- [ ] Updated `.env` with new key
- [ ] Tested locally (dev server works)
- [ ] Updated Vercel production environment variables
- [ ] Redeployed production
- [ ] Tested production (donations, receipts, admin work)
- [ ] No errors in Vercel function logs
- [ ] Deleted this file (or marked as ✅ DONE)

---

## 🔒 Prevention Tips

1. **Never commit `.env` or `.env.local`**
   - Already in `.gitignore` ✅

2. **Use different keys for dev/production**
   - Consider creating a separate Supabase project for development

3. **Enable GitHub secret scanning**
   - Settings → Security → Code security and analysis → Secret scanning

4. **Set up pre-commit hooks**
   - We have a guide at: `docs/security/supabase-key-migration.md`

5. **Regular key rotation**
   - Rotate service role key every 90 days
   - Anon key rotation is less critical (respects RLS)

---

## ❓ Questions?

- **What if my production site breaks?**
  - Revert to old key temporarily in Vercel
  - Check Vercel function logs for specific errors
  - Verify the new key was copied correctly (no spaces/quotes)

- **Do I need to rotate the anon key too?**
  - No, the anon key wasn't leaked
  - It's also safer (respects RLS policies)

- **What about those `sb_publishable_*` and `sb_secret_*` keys?**
  - They're not used anywhere in your codebase
  - Safe to ignore/remove
  - May be from future Supabase features or documentation examples

---

## 📚 More Information

- Full guide: `docs/security/supabase-key-migration.md`
- Supabase docs: https://supabase.com/docs/guides/api/api-keys
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

**🎯 Priority:** HIGH  
**⏱️ Time Required:** 5-10 minutes  
**💡 Complexity:** Easy (copy/paste new key)

Once completed, you can safely delete this file.
