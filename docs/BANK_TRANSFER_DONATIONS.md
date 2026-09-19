# Bank Transfer Donations — Setup & Operations

Replaces Khalti for local donations. Donors transfer to deessa Foundation's bank account and tell us; an admin confirms it against the bank statement, which generates and emails the receipt.

---

## 0. How it differs from Stripe

Bank transfer is **not a payment gateway**. There is no adapter, no webhook, no API to verify against. That is why `bank` is deliberately absent from the `PaymentProvider` union in [lib/payments/config.ts](../lib/payments/config.ts) — nothing in the gateway pipeline should try to handle it.

```
donor sees bank details on /donate
  → transfers money in their own banking app
  → fills in "I've Made the Transfer" form (name, email, amount, txn ref, optional slip)
  → components/donation/bank-transfer-panel.tsx
  → lib/actions/bank-donation.ts   → donations row, payment_status = 'pending'
  ─────────────────────────────── nothing is confirmed yet ───────────────────────────────
  → admin checks the bank statement
  → Admin → Donations → [donation] → Change Status → completed
  → changePaymentStatus() fires generateReceiptForDonation()
  → receipt PDF generated + emailed
```

**Nothing a donor submits can mark a donation paid.** The row is always created `pending`, and the RLS policy in [scripts/041-bank-transfer-donations.sql](../scripts/041-bank-transfer-donations.sql) enforces that at the database level, not just in application code.

---

## 1. Setup (one-time)

### Step 1 — Fill in the real account details

Edit [lib/payments/bank-details.ts](../lib/payments/bank-details.ts) and replace every `REPLACE_ME`:

```ts
export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "npr",                        // do NOT rename after go-live — it is stored on donation rows
    label: "Within Nepal (NPR)",
    bankName: "NIC Asia Bank Ltd.",
    accountName: "deessa Foundation",
    accountNumber: "1234567890123",
    branch: "Naxal, Kathmandu",
    currency: "NPR",
  },
  // Delete the USD entry entirely if you only have one account.
]
```

> ⚠️ **Check every digit against a bank statement, not from memory.** A wrong account number sends donations to a stranger, and the donor will have proof they paid.

Until the placeholders are replaced, `getConfiguredBankAccounts()` returns an empty list and the panel does not render at all — the site fails closed rather than showing donors a fake account number. There is a test covering exactly this.

These are public details on purpose, committed to the repo rather than kept in env vars. They are printed on the website and change roughly never.

### Step 2 — Apply the migration

Supabase Dashboard → SQL Editor:

```
scripts/041-bank-transfer-donations.sql
```

It is re-runnable. It adds `bank_account_id`, `bank_transfer_date`, `bank_proof_path` to `donations`, creates the private `bank-transfer-proofs` storage bucket, and **supersedes the anon INSERT policy from migration 040** (same rules plus `bank_proof_path IS NULL`, so a donor cannot point the proof path at someone else's file).

Prerequisite: [scripts/040-restrict-donations-insert-policy.sql](../scripts/040-restrict-donations-insert-policy.sql) must be applied first.

Verify:

```sql
select column_name from information_schema.columns
where table_name = 'donations' and column_name like 'bank_%';
-- expect: bank_account_id, bank_transfer_date, bank_proof_path

select id, public from storage.buckets where id = 'bank-transfer-proofs';
-- expect: public = false
```

If the bucket row shows `public = true`, stop and fix it — deposit slips contain donors' account numbers.

> **If donations start failing with `42501: new row violates row-level security policy`**, the anon INSERT policy has become unsatisfiable. `WITH CHECK` is evaluated *after* column defaults are applied, so listing any column with a non-NULL default in the policy blocks every donation. This happened once already with `verification_id` (`DEFAULT gen_random_uuid()` from payments-v2/029). Re-running 041 restores a correct policy. Never add a defaulted column to that policy.

### Step 3 — Confirm receipt email works

Bank transfer receipts go out through the same mailer as everything else, so these must be set or **no donor ever receives a receipt**:

```env
GOOGLE_EMAIL=...
GOOGLE_APP_PASSWORD=...
RECEIPT_TOKEN_SECRET=...
NEXT_PUBLIC_APP_URL=https://deessa.org
```

Check with `.\scripts\test-credentials.ps1`.

---

## 2. Admin: confirming a donation

This is a **manual money decision**. Do it deliberately.

1. **Admin → Donations**, filter status `pending`, provider `bank`.
2. Open the donation. Under **Payment Technical Details** you get:
   - **Payment ID (Legacy)** — `bank:<the donor's transaction reference>`
   - **Bank Account Paid Into** — which of your accounts they chose
   - **Date of Transfer (stated)** — what the donor claims
   - **Proof of Transfer** — signed link to the deposit slip, expires in 1 hour
3. **Find the matching credit on the actual bank statement.** Match amount *and* date *and* reference. Do not confirm from the uploaded screenshot alone — screenshots are trivially faked.
4. If it matches: **Change Status → completed**, with a reason such as `Verified against NIC Asia statement 2026-07-22, ref TXN-99887766`. The reason is mandatory (minimum 10 characters) and written to `status_change_log` — this is your audit trail.
5. The receipt generates and emails automatically. Confirm `receipt_sent_at` fills in.

### If it does not match

- **No credit on the statement:** leave it `pending`. Do not delete — the donor may have scheduled the transfer.
- **Amount differs:** set status to `review` and add a review note. Contact the donor before issuing a receipt for an amount you did not receive.
- **Obvious spam:** set to `failed` with a reason.

### Weekly check

```sql
select id, donor_name, donor_email, amount, currency,
       provider_ref as txn_ref, bank_transfer_date, created_at
from donations
where provider = 'bank' and payment_status = 'pending'
order by created_at;
```

Anyone on this list older than a few days is a donor who may have paid and is waiting on a receipt.

---

## 3. Known gaps

| Gap | Impact | Fix when |
|---|---|---|
| No admin email when a bank transfer is submitted | Nobody is notified; relies on someone checking the dashboard | Donations start arriving faster than you check. Copy the pattern in [lib/email/support-mailer.ts](../lib/email/support-mailer.ts) |
| Bank details require a deploy to change | Fine for an account number; annoying if it changes | Only if it actually changes — move to `site_settings` like `getPaymentSettings()` does |
| No duplicate detection on transaction reference | A donor submitting twice creates two pending rows | Admin sees both side by side, so low priority |
| Monthly giving unsupported | The form forces `is_monthly: false` | Recurring by bank transfer needs a standing instruction the donor sets up at their bank — out of scope for the website |

---

## 4. About the dormant Khalti code

Khalti was evaluated and dropped in favour of direct bank transfer. The integration code is still in the tree but **unreachable**: [config.ts](../lib/payments/config.ts) requires both `KHALTI_SECRET_KEY` and `KHALTI_BASE_URL`, and neither is set.

Setting `KHALTI_SECRET_KEY` would put Khalti back on the donate form. `test-credentials.ps1` warns if it ever becomes set.

The conference registration flow still references Khalti in its own verification branch; it is inert for the same reason. Leaving the code costs nothing and keeps the option open — deleting it would mean rewriting the conference payment flow, migration 040/041, and dropping `khalti_pidx` from two tables.

---

## 5. Reference map

| Concern | File |
|---|---|
| Account details (edit this) | [lib/payments/bank-details.ts](../lib/payments/bank-details.ts) |
| Donor-facing panel + form | [components/donation/bank-transfer-panel.tsx](../components/donation/bank-transfer-panel.tsx) |
| Server action | [lib/actions/bank-donation.ts](../lib/actions/bank-donation.ts) |
| Admin confirmation + receipt trigger | [lib/actions/admin-donation-actions.ts](../lib/actions/admin-donation-actions.ts) |
| Admin proof link | [components/admin/donations/payment-technical.tsx](../components/admin/donations/payment-technical.tsx) |
| Schema + bucket + RLS | [scripts/041-bank-transfer-donations.sql](../scripts/041-bank-transfer-donations.sql) |
| Tests | [\_\_tests\_\_/payments/bank-donation.test.ts](../__tests__/payments/bank-donation.test.ts) |
