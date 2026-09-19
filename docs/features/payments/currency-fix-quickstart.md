---
title: "Currency Handling Fix - Quick Start"
description: "- Stripe donations in USD $250 were displaying as \"Rs 250\" in admin dashboard"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Currency Handling Fix - Quick Start

## Problem Fixed

- Stripe donations in USD ($250) were displaying as "Rs 250" in admin dashboard
- No distinction between different currencies in totals
- Hardcoded currency symbols

## Solution Applied

âœ… Multi-currency support with proper symbols ($, â‚¨, â‚¹)
âœ… Separate totals by currency in admin dashboard
âœ… Reusable currency utility functions
âœ… Database migration for enhanced currency support

## Files Changed

### 1. New Files Created

- `lib/utils/currency.ts` - Currency formatting utilities
- `scripts/008-currency-support.sql` - Database migration
- `docs/CURRENCY_HANDLING.md` - Complete documentation

### 2. Files Modified

- `app/admin/donations/page.tsx` - Multi-currency dashboard display
- `app/(public)/donate/success/success-content.tsx` - Proper currency formatting

## Installation Steps

### Step 1: Apply Database Migration

Go to your Supabase dashboard â†’ SQL Editor and run:

```sql
-- Run the complete migration script
-- File: scripts/008-currency-support.sql

-- This will:
-- 1. Add currency column if missing
-- 2. Set default currency to NPR for existing records
-- 3. Create index for better performance
-- 4. Create statistics view
-- 5. Add currency symbol function
```

Or copy and paste the contents of `scripts/008-currency-support.sql` into Supabase SQL Editor.

### Step 2: Test the Changes

1. **View existing donations:**

   ```bash
   Navigate to: /admin/donations
   
   Expected result:
   - Total Donations card shows amounts grouped by currency
   - Example: 
     $5,250.00 USD
     â‚¨125,000.00 NPR
   - Table shows each donation with correct currency symbol
   ```

2. **Make a test Stripe donation:**

   ```bash
   Navigate to: /donate
   Select: Stripe (USD)
   Amount: $250
   Complete payment
   
   Expected result:
   - Admin dashboard shows: $250.00 USD
   - Success page shows: $250.00 USD
   ```

3. **Make a test Khalti donation:**

   ```bash
   Navigate to: /donate
   Select: Khalti (NPR)
   Amount: 2500
   Complete payment
   
   Expected result:
   - Admin dashboard shows: â‚¨2,500.00 NPR
   - Success page shows: â‚¨2,500.00 NPR
   ```

## What You'll See

### Before (Old Behavior)

```bash
Admin Dashboard:
Total Donations: â‚¹5,500  â† Wrong! Mixed currencies

Donation Table:
â‚¹250  â† USD donation shown as INR
â‚¹2,500  â† NPR donation shown as INR
```

### After (New Behavior)

```bash
Admin Dashboard:
Total Donations:
$250.00 USD  â† Correct!
â‚¨2,500.00 NPR  â† Correct!

Donation Table:
$250.00 USD  â† Correctly identified
â‚¨2,500.00 NPR  â† Correctly identified
```

## Utility Functions Available

```typescript
import { formatCurrency, getCurrencySymbol } from "@/lib/utils/currency"

// Format with symbol
formatCurrency(250, "USD") // "$250.00"
formatCurrency(250, "NPR") // "â‚¨250.00"

// Format with currency code
formatCurrency(250, "USD", { showCode: true }) // "$250.00 USD"

// Get just the symbol
getCurrencySymbol("USD") // "$"
getCurrencySymbol("NPR") // "â‚¨"
```

## Supported Currencies

- ðŸ‡ºðŸ‡¸ USD - US Dollar ($)
- ðŸ‡³ðŸ‡µ NPR - Nepali Rupee (â‚¨)
- ðŸ‡®ðŸ‡³ INR - Indian Rupee (â‚¹)
- ðŸ‡ªðŸ‡º EUR - Euro (â‚¬)
- ðŸ‡¬ðŸ‡§ GBP - British Pound (Â£)

## Database Queries

Check currency distribution:

```sql
SELECT currency, COUNT(*), SUM(amount)
FROM donations
WHERE payment_status = 'completed'
GROUP BY currency;
```

View aggregated stats:

```sql
SELECT * FROM donation_stats_by_currency;
```

## Troubleshooting

### Old donations showing no currency?

Run in Supabase SQL Editor:

```sql
UPDATE donations SET currency = 'NPR' WHERE currency IS NULL;
```

### Wrong currency for Stripe donations?

Check the `lib/actions/donation.ts` file - line ~58:

```typescript
const currency = input.provider === "stripe" 
  ? settings.defaultCurrency || "USD" 
  : "NPR"
```

## Next Steps (Optional Enhancements)

1. **Add currency conversion display**
   - Show converted amounts in admin dashboard
   - Example: "â‚¨125,000.00 NPR (â‰ˆ$943.40 USD)"

2. **Add export with currency breakdown**
   - Export donations grouped by currency
   - Include conversion rates

3. **Add real-time exchange rates**
   - Integrate with exchange rate API
   - Store conversion rate at time of donation

## Need Help?

- See full documentation: `docs/CURRENCY_HANDLING.md`
- Check currency utilities: `lib/utils/currency.ts`
- Review admin page changes: `app/admin/donations/page.tsx`

---

**Status:** âœ… Ready to deploy
**Breaking Changes:** None (backwards compatible)
**Database Migration:** Required
