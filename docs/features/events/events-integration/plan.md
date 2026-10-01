---
title: "V2 PaymentService Integration for Event Registrations"
description: "Revision History:"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# V2 PaymentService Integration for Event Registrations

## Status: COMPLETE — All Phases Implemented (Rev 3)

**Revision History:**
- Rev 1: Initial plan
- Rev 2: Incorporated technical review findings (CHECK constraint issues, polymorphic FK design, race conditions, edge cases)
- Rev 3: Complete implementation — all phases done, conferences migrated, monitoring updated

---

## 1. Executive Summary

The V2 `PaymentService` provides centralized payment confirmation with 3-layer idempotency, CAS-based race condition prevention, formal state machine validation, and structured error handling. Currently, only donations use V2. Event registrations use duplicated inline V1 logic across 6+ webhook handlers with no CAS lock, no state machine, and inconsistent amount verification.

**Goal:** Wire event registrations through `PaymentService` to get V2 benefits without touching the donation flow.

**Scope:** Events AND Conferences — all now use PaymentService.

**Key Risks Addressed in Rev 2:**
- ✅ `review` status CHECK constraint — **ALREADY FIXED** in migration 056
- ⚠️ Polymorphic FK integrity in `payments` table — **Schema fix required**
- ✅ Race conditions with admin manual confirmations — **Fixed in plan**
- ✅ Provider-specific field mapping inconsistencies — **Documented**
- ✅ Edge cases: cancelled registrations, Khalti pending status, eSewa signature failures — **All handled**

---

## 2. Current Architecture

### 2.1 V2 PaymentService Flow (Donations)

```
Webhook arrives
  → Adapter.verify() / processVerifiedEvent()
  → Returns VerificationResult
  → PaymentService.confirmDonation()
    → Fetch donation
    → Idempotency check (payment_events SELECT)
    → Short-circuit if already completed
    → State machine validation (pending → confirmed/review/failed)
    → Amount verification (minor units)
    → Currency verification
    → CAS UPDATE (WHERE payment_status = 'pending')
    → payments table insert (non-fatal)
    → payment_events insert (idempotency ledger)
    → Return result
```

### 2.2 V1 Inline Flow (Events — Current)

```
Webhook arrives
  → Manual signature/amount verification (duplicated per handler)
  → INSERT INTO payment_events (idempotency via unique constraint)
  → Fetch event_registrations
  → Status guard (if paid/confirmed/cancelled, skip)
  → Amount verification (varies by handler)
  → UNCONDITIONAL UPDATE (no CAS lock)
  → sold_count increment (non-fatal)
  → Email send (non-blocking)
```

### 2.3 Key Differences

| Aspect | V2 (Donations) | V1 (Events) |
|--------|----------------|-------------|
| Centralization | Single `confirmDonation()` | Duplicated in 6+ handlers |
| State machine | Formal `validateStateTransition()` | Ad-hoc `if` checks |
| Idempotency | 3-layer (SELECT, short-circuit, CAS) | INSERT + unique constraint only |
| Race conditions | CAS lock (`WHERE payment_status = 'pending'`) | No CAS — unconditional UPDATE |
| Amount verification | `verifyAmount()` in minor units | Varies by handler |
| `payments` table | Inserted with all Stripe IDs | Not written |
| Error handling | Structured `PaymentError` hierarchy | Generic try/catch |
| Logging | Dedicated logging functions | console.log/warn/error |
| Status values | `pending` → `completed` | `unpaid` → `paid` |
| Review status | DB status, not in state machine | Not in CHECK constraint (⚠️ Bug) |

---

## 3. What Changes

### 3.0 PREREQUISITE: Schema Status

**✅ All schema changes already applied (no new migrations needed):**

| Migration | What it does | Status |
|-----------|-------------|--------|
| 056 | Adds 'review' to event_registrations CHECK constraint | ✅ Done |
| 056 | Adds event_registration_id to payment_events | ✅ Done |
| 057 | Extends payments table with event_registration_id, entity_type, CHECK constraint, indexes | ✅ Done |
| 059 | Adds review_status, reviewed_at, reviewed_by to event_registrations | ✅ Done |

**⚠️ Before implementing, verify these migrations have been run against the live database:**

```sql
-- Verify 056: 'review' in CHECK constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'event_registrations'::regclass 
  AND conname LIKE '%payment_status%';

-- Verify 057: event_registration_id exists on payments
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'event_registration_id';

-- Verify 059: review_status exists on event_registrations
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' AND column_name = 'review_status';
```

**If all three return results:** No schema changes needed. Proceed to Phase 1.

**If any are missing:** Run the corresponding migration first (`scripts/db/migrations/056-*.sql`, `scripts/db/migrations/057-*.sql`, `scripts/db/migrations/059-*.sql`).

### 3.1 PaymentService.ts — Add `confirmRegistration()`

**File:** `lib/payments/core/PaymentService.ts`

Add a new method alongside `confirmDonation()`:

```typescript
async confirmRegistration(input: ConfirmRegistrationInput): Promise<ConfirmRegistrationResult> {
  // Same 12-step flow as confirmDonation(), but:
  // - Table: event_registrations (not donations)
  // - State machine: unpaid → paid (not pending → completed)
  // - CAS: WHERE payment_status = 'unpaid'
  // - Post-payment: sold_count increment, confirmation email
}
```

**DO NOT rename or modify `confirmDonation()`.** The new method is purely additive.

### 3.2 Types — Add Registration Types

**File:** `lib/payments/core/types.ts`

```typescript
type RegistrationEntity = 'event_registration'

interface ConfirmRegistrationInput {
  entityType: RegistrationEntity
  entityId: string
  provider: PaymentProvider
  verificationResult: VerificationResult
  eventId?: string  // for idempotency
}

interface ConfirmRegistrationResult {
  success: boolean
  status: 'confirmed' | 'review' | 'failed' | 'already_processed'
  registration?: any
  error?: string
}
```

### 3.3 State Machine — Events

**IMPORTANT:** Event registrations have TWO status columns:
- `status`: registration lifecycle (pending, confirmed, cancelled, expired)
- `payment_status`: payment state (unpaid, paid, review, failed, refunded)

The state machine controls `payment_status` transitions ONLY.

| Current payment_status | Allowed Target | CAS WHERE Clause |
|------------------------|---------------|------------------|
| `unpaid` | `paid` | `payment_status = 'unpaid'` |
| `unpaid` | `review` | `payment_status = 'unpaid'` |
| `unpaid` | `failed` | `payment_status = 'unpaid'` |
| `paid` | **BLOCKED** | Terminal success |
| `failed` | **BLOCKED** | Terminal failure |
| `review` | **MANUAL ONLY** | Admin can resolve to `paid` or `failed` |

**Short-Circuit Conditions (Skip Processing):**
- `payment_status === 'paid'` → Already processed
- `status === 'confirmed'` → Already confirmed
- `status === 'cancelled'` → Registration cancelled, ignore webhook
- `status === 'expired'` → Registration expired, ignore webhook

**Special Handling:**
- **Khalti "Pending" status:** Return `{ success: true, status: 'processing' }`, do NOT update DB
- **eSewa signature failure:** Return error BEFORE any state changes
- **Stripe session not paid:** Set `payment_status = 'failed'`

### 3.4 Post-Payment Hooks

After successful CAS update, the `confirmRegistration()` method must:

1. **Increment sold_count** — `incrementTicketSoldCount(supabase, ticketTypeId)`
   - Non-fatal (catch + warn)
   - Only if `ticket_type_id` exists
   - **Idempotency:** Check if already incremented (see Section 7 for admin race condition)

2. **Send confirmation email** — fire-and-forget
   - Fetch event details, email template, ticket name
   - Call `sendEventConfirmationEmail()`
   - Update `last_confirmation_email_sent_at` ONLY if email succeeds

3. **Send review alert** — if `finalStatus === 'review'`
   - Import `sendReviewAlert()` dynamically
   - Pass reason (amount_mismatch / currency_mismatch / verification_uncertain)
   - Non-blocking (catch + warn)

### 3.5 Provider-Specific Field Mapping

Event registrations have BOTH generic AND provider-specific columns:

**Generic Columns (Used by All Providers):**
- `payment_provider` — 'stripe' | 'khalti' | 'esewa'
- `payment_id` — Composite: `${provider}:${transactionId}`
- `provider_session_ref` — Generic transaction reference

**Provider-Specific Columns (Backward Compatibility):**
- `stripe_session_id` — Stripe checkout session ID
- `khalti_pidx` — Khalti payment index
- `esewa_transaction_uuid` — eSewa transaction UUID

**PaymentService MUST write to BOTH:**

```typescript
const updateData: Record<string, unknown> = {
  payment_status: finalStatus, // 'paid' | 'review' | 'failed'
  payment_provider: provider,
  payment_id: `${provider}:${verificationResult.transactionId}`,
  provider_session_ref: verificationResult.transactionId,
  
  // Write provider-specific field for backward compatibility
  ...(provider === 'stripe' && {
    stripe_session_id: verificationResult.transactionId
  }),
  ...(provider === 'khalti' && {
    khalti_pidx: verificationResult.transactionId
  }),
  ...(provider === 'esewa' && {
    esewa_transaction_uuid: verificationResult.transactionId
  }),
  
  // Timestamps based on final status
  ...(finalStatus === 'paid' && {
    status: 'confirmed', // Also update registration status
    payment_paid_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    confirmed_by: 'webhook', // Distinguish from admin manual confirmation
  }),
  ...(finalStatus === 'review' && {
    payment_review_at: new Date().toISOString(),
  }),
  ...(finalStatus === 'failed' && {
    payment_failed_at: new Date().toISOString(),
  }),
}
```

**Why Both?**
- Generic fields enable provider-agnostic queries
- Specific fields maintain compatibility with existing V1 code that queries by provider-specific ID

---

## 4. Files to Modify

### 4.0 Schema Migration (Run FIRST)

**File:** `scripts/XXX-extend-payments-for-registrations.sql`

**Description:** Add `event_registration_id` FK to `payments` table with polymorphic integrity constraints.

**Note:** Migration 056 already added:
- ✅ `'review'` to `event_registrations` CHECK constraint
- ✅ `event_registration_id` to `payment_events` table
- ✅ Provider-specific columns to `event_registrations`

This migration ONLY adds the `payments` table extension.

```sql
-- ============================================================
-- deessa Foundation — Extend Payments Table for Event Registrations
-- Migration: XXX-extend-payments-for-registrations.sql
-- Adds event_registration_id FK with polymorphic integrity constraints
-- ============================================================

-- Add event_registration_id column (nullable FK)
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS event_registration_id UUID 
  REFERENCES event_registrations(id) ON DELETE SET NULL;

-- Add discriminator column for polymorphic FK clarity
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS entity_type TEXT 
  DEFAULT 'donation' 
  CHECK (entity_type IN ('donation', 'event_registration'));

-- Backfill existing rows (all current rows are donations)
UPDATE payments 
SET entity_type = 'donation' 
WHERE entity_type IS NULL;

-- Make discriminator non-nullable
ALTER TABLE payments 
  ALTER COLUMN entity_type SET NOT NULL;

-- Add CHECK constraint: exactly ONE FK must be set
ALTER TABLE payments 
  ADD CONSTRAINT payments_entity_fk_check 
  CHECK (
    (donation_id IS NOT NULL AND event_registration_id IS NULL AND entity_type = 'donation') OR
    (donation_id IS NULL AND event_registration_id IS NOT NULL AND entity_type = 'event_registration')
  );

-- Add index for event registration lookups
CREATE INDEX IF NOT EXISTS idx_payments_event_reg 
  ON payments (event_registration_id) 
  WHERE event_registration_id IS NOT NULL;

-- Verify: Should return all rows with exactly ONE FK set
SELECT 
  COUNT(*) AS total,
  SUM(CASE WHEN donation_id IS NOT NULL THEN 1 ELSE 0 END) AS with_donation_id,
  SUM(CASE WHEN event_registration_id IS NOT NULL THEN 1 ELSE 0 END) AS with_event_reg_id,
  SUM(CASE WHEN donation_id IS NOT NULL AND event_registration_id IS NOT NULL THEN 1 ELSE 0 END) AS both_set,
  SUM(CASE WHEN donation_id IS NULL AND event_registration_id IS NULL THEN 1 ELSE 0 END) AS neither_set
FROM payments;

-- Expected results:
-- both_set = 0 (no rows with both FKs)
-- neither_set = 0 (no orphaned rows)
-- with_donation_id = total (all existing rows are donations)
```

### 4.1 `lib/payments/core/PaymentService.ts`

**Change:** Add `confirmRegistration()` method (~200 lines)

The method follows the same structure as `confirmDonation()` with entity-specific adaptations:

```typescript
async confirmRegistration(input: ConfirmRegistrationInput): Promise<ConfirmRegistrationResult> {
  const { entityType, entityId, provider, verificationResult, eventId } = input
  const startTime = Date.now()

  // Step 1: Log attempt
  await logConfirmationAttempt({
    donationId: entityId, // TODO: Rename to entityId in logging functions
    provider,
    transactionId: verificationResult.transactionId,
    eventId,
    amount: verificationResult.amount,
    currency: verificationResult.currency,
  })

  try {
    // Step 2: Fetch registration
    const table = 'event_registrations' // Future: support 'conference_registrations'
    const { data: reg, error: fetchError } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', entityId)
      .single()

    if (fetchError || !reg) {
      throw StateTransitionError.donationNotFound(entityId) // TODO: Rename to entityNotFound
    }

    const currentPaymentStatus = reg.payment_status
    const currentStatus = reg.status

    // Step 3: Idempotency check (if eventId provided)
    if (eventId) {
      const isAlreadyProcessed = await this.checkIdempotency(provider, eventId)
      
      await logIdempotencyCheck({
        provider,
        eventId,
        alreadyProcessed: isAlreadyProcessed,
        donationId: entityId, // TODO: Rename to entityId
      })

      if (isAlreadyProcessed) {
        return {
          success: true,
          status: 'already_processed',
          registration: {
            id: reg.id,
            payment_status: currentPaymentStatus,
            status: currentStatus,
            amount: reg.payment_amount,
            currency: reg.payment_currency,
            provider: reg.payment_provider,
            provider_ref: reg.provider_session_ref,
            confirmed_at: reg.confirmed_at,
          },
        }
      }
    }

    // Step 4: Short-circuit checks
    // 4a. Already paid
    if (currentPaymentStatus === 'paid') {
      console.warn('[PaymentService] Registration already paid — returning already_processed', {
        entityId,
        currentPaymentStatus,
      })
      return {
        success: true,
        status: 'already_processed',
        registration: { id: reg.id, payment_status: currentPaymentStatus, ... },
      }
    }

    // 4b. Already confirmed
    if (currentStatus === 'confirmed') {
      console.warn('[PaymentService] Registration already confirmed — returning already_processed', {
        entityId,
        currentStatus,
      })
      return {
        success: true,
        status: 'already_processed',
        registration: { id: reg.id, status: currentStatus, ... },
      }
    }

    // 4c. Registration cancelled or expired — ignore webhook
    if (currentStatus === 'cancelled' || currentStatus === 'expired') {
      console.warn('[PaymentService] Registration cancelled/expired — ignoring webhook', {
        entityId,
        currentStatus,
      })
      return {
        success: true,
        status: 'already_processed',
        registration: { id: reg.id, status: currentStatus, ... },
      }
    }

    // Step 5: Special handling for Khalti "Pending" status
    if (verificationResult.status === 'pending') {
      console.log('[PaymentService] Payment still pending — do not update DB', { entityId, provider })
      return {
        success: true,
        status: 'processing', // Custom status for pending payments
        registration: { id: reg.id, payment_status: currentPaymentStatus, ... },
      }
    }

    // Step 6: State machine validation (only unpaid → paid/review/failed)
    this.validateRegistrationStateTransition(currentPaymentStatus, entityId)

    // Step 7: Amount verification
    const amountCheck = this.verifyAmount(reg.payment_amount, verificationResult.amount)

    // Step 8: Currency verification
    const currencyCheck = this.verifyCurrency(reg.payment_currency, verificationResult.currency)

    // Step 9: Log verification result
    await logVerificationResult({
      donationId: entityId, // TODO: Rename to entityId
      provider,
      transactionId: verificationResult.transactionId,
      success: amountCheck.valid && currencyCheck.valid && verificationResult.status === 'paid',
      expectedAmount: reg.payment_amount,
      actualAmount: verificationResult.amount,
      expectedCurrency: reg.payment_currency,
      actualCurrency: verificationResult.currency,
      error: !amountCheck.valid
        ? 'Amount mismatch'
        : !currencyCheck.valid
        ? 'Currency mismatch'
        : verificationResult.status !== 'paid'
        ? `Payment status: ${verificationResult.status}`
        : undefined,
    })

    // Step 10: Determine final status
    let finalStatus: 'paid' | 'review' | 'failed'
    let reviewReason: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain' | undefined

    if (verificationResult.status !== 'paid') {
      finalStatus = 'failed'
    } else if (!amountCheck.valid) {
      finalStatus = 'review'
      reviewReason = 'amount_mismatch'
      await logAmountMismatch({
        donationId: entityId,
        provider,
        transactionId: verificationResult.transactionId,
        expectedAmount: reg.payment_amount,
        actualAmount: verificationResult.amount,
      })
    } else if (!currencyCheck.valid) {
      finalStatus = 'review'
      reviewReason = 'currency_mismatch'
      await logCurrencyMismatch({
        donationId: entityId,
        provider,
        transactionId: verificationResult.transactionId,
        expectedCurrency: reg.payment_currency,
        actualCurrency: verificationResult.currency,
      })
    } else {
      finalStatus = 'paid'
    }

    // Step 11: Build update data (see Section 3.5 for field mapping)
    const updateData: Record<string, unknown> = {
      payment_status: finalStatus,
      payment_provider: provider,
      payment_id: `${provider}:${verificationResult.transactionId}`,
      provider_session_ref: verificationResult.transactionId,
      
      // Provider-specific fields
      ...(provider === 'stripe' && { stripe_session_id: verificationResult.transactionId }),
      ...(provider === 'khalti' && { khalti_pidx: verificationResult.transactionId }),
      ...(provider === 'esewa' && { esewa_transaction_uuid: verificationResult.transactionId }),
      
      // Status-specific timestamps
      ...(finalStatus === 'paid' && {
        status: 'confirmed',
        payment_paid_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        confirmed_by: 'webhook',
      }),
      ...(finalStatus === 'review' && {
        payment_review_at: new Date().toISOString(),
      }),
      ...(finalStatus === 'failed' && {
        payment_failed_at: new Date().toISOString(),
      }),
    }

    // Step 12: CAS UPDATE (WHERE payment_status = 'unpaid' AND status = 'pending')
    // The status guard prevents TOCTOU: if registration was cancelled between
    // Step 2 (fetch) and Step 12 (update), the CAS will fail gracefully.
    const { data: updatedReg, error: updateError } = await this.supabase
      .from(table)
      .update(updateData)
      .eq('id', entityId)
      .eq('payment_status', 'unpaid') // CAS lock on payment_status
      .in('status', ['pending'])       // TOCTOU guard: skip if cancelled/expired
      .select()
      .single()

    // Step 13: Handle CAS failure (race condition)
    if (updateError || !updatedReg) {
      const { data: refetched } = await this.supabase
        .from(table)
        .select('id, payment_status, status')
        .eq('id', entityId)
        .single()

      // Check if another process already confirmed/paid this registration
      if (refetched?.payment_status === 'paid' || refetched?.status === 'confirmed') {
        console.warn('[PaymentService] Race condition — registration already processed', { entityId })
        return {
          success: true,
          status: 'already_processed',
          registration: { id: refetched.id, payment_status: refetched.payment_status, ... },
        }
      }

      // Check if another process set this to review (amount mismatch on duplicate webhook)
      // This prevents infinite Stripe retries: return already_processed instead of throwing 500
      if (refetched?.payment_status === 'review') {
        console.warn('[PaymentService] Registration in review state — duplicate webhook ignored', { entityId })
        return {
          success: true,
          status: 'already_processed',
          registration: { id: refetched.id, payment_status: refetched.payment_status, ... },
        }
      }

      // Registration was cancelled/expired between fetch and CAS — ignore webhook
      if (refetched?.status === 'cancelled' || refetched?.status === 'expired') {
        console.warn('[PaymentService] Registration cancelled/expired during processing — ignoring', { entityId })
        return {
          success: true,
          status: 'already_processed',
          registration: { id: refetched.id, payment_status: refetched.payment_status, ... },
        }
      }

      await logRaceCondition({
        donationId: entityId,
        provider,
        currentStatus: currentPaymentStatus,
        attemptedStatus: finalStatus,
      })

      throw StateTransitionError.raceConditionDetected(entityId, currentPaymentStatus)
    }

    // Step 14: Log state transition
    await logStateTransition({
      donationId: entityId,
      provider,
      currentStatus: currentPaymentStatus,
      newStatus: finalStatus,
      reason: reviewReason,
    })

    // Step 15: Insert into payments table (non-fatal, for V2 tracking)
    try {
      const { error: paymentInsertError } = await this.supabase
        .from('payments')
        .insert({
          event_registration_id: entityId, // NOT donation_id
          entity_type: 'event_registration',
          provider: provider,
          transaction_id: verificationResult.transactionId,
          amount: verificationResult.amount,
          currency: verificationResult.currency,
          verified_amount: verificationResult.amount,
          verified_currency: verificationResult.currency,
          status: verificationResult.status,
          verified_at: new Date().toISOString(),
          raw_payload: verificationResult.metadata,
        })

      if (paymentInsertError) {
        console.warn('[PaymentService] payments table insert failed (non-fatal):', paymentInsertError.message)
      }
    } catch (e) {
      console.warn('[PaymentService] payments table unavailable (migration pending):', e)
    }

    // Step 16: Insert into payment_events (idempotency ledger)
    if (eventId) {
      let eventInsertError: any = null

      // Try enhanced schema first (with event_registration_id)
      const { error: enhancedErr } = await this.supabase
        .from('payment_events')
        .insert({
          provider: provider,
          event_id: eventId,
          event_registration_id: entityId, // NOT donation_id
          event_type: 'webhook',
          raw_payload: verificationResult.metadata,
          processed_at: new Date().toISOString(),
        })

      if (enhancedErr) {
        // Column doesn't exist yet — try minimal schema
        if (enhancedErr.code === '42703' || enhancedErr.message?.includes('column')) {
          const { error: minimalErr } = await this.supabase
            .from('payment_events')
            .insert({
              provider: provider,
              event_id: eventId,
              event_registration_id: entityId,
            })
          eventInsertError = minimalErr
        } else {
          eventInsertError = enhancedErr
        }
      }

      if (eventInsertError) {
        if (eventInsertError.code === '23505') {
          // Duplicate event — already processed
          return {
            success: true,
            status: 'already_processed',
            registration: { id: updatedReg.id, payment_status: updatedReg.payment_status, ... },
          }
        }
        console.error('[PaymentService] Failed to insert payment event:', eventInsertError)
      }
    }

    // Step 17: Post-payment hooks (non-blocking, only for paid status)
    if (finalStatus === 'paid') {
      // 17a. Increment sold_count (non-fatal)
      if (reg.ticket_type_id) {
        const { incrementTicketSoldCount } = await import('@/lib/utils/ticket-capacity')
        incrementTicketSoldCount(this.supabase, reg.ticket_type_id)
          .catch(err => {
            console.warn('[PaymentService] sold_count increment failed (non-fatal):', err)
            // TODO: Log to error table for manual audit
          })
      }

      // 17b. Send confirmation email (fire-and-forget)
      this.sendEventConfirmationEmail(reg)
        .then(success => {
          if (success) {
            // Update last_confirmation_email_sent_at only if email succeeded
            this.supabase
              .from('event_registrations')
              .update({ last_confirmation_email_sent_at: new Date().toISOString() })
              .eq('id', entityId)
              .then(() => {})
          }
        })
        .catch(err => console.error('[PaymentService] Email send failed (non-fatal):', err))

      // 17c. Log success
      const durationMs = Date.now() - startTime
      await logConfirmationSuccess({
        donationId: entityId,
        provider,
        transactionId: verificationResult.transactionId,
        newStatus: finalStatus,
        durationMs,
      })
    }

    // Step 18: Send review alert (if mismatch)
    if (finalStatus === 'review') {
      console.warn(`[PaymentService] Registration ${entityId} requires review: ${reviewReason}`)
      
      const { sendReviewAlert } = await import('@/lib/monitoring/alerts')
      
      // TODO: `ReviewAlert.donationId` should be renamed to `entityId` (with `entityType`) 
      // to properly label event registration alerts vs. donation alerts.
      // Current workaround: pass entityId as donationId — alert will say "Donation {id}" even for events.
      sendReviewAlert({
        donationId: entityId, // TODO: Make polymorphic — should be entityId + entityType
        amount: reg.payment_amount,
        currency: reg.payment_currency,
        provider: provider,
        reason: reviewReason!,
        expectedAmount: !amountCheck.valid ? reg.payment_amount : undefined,
        actualAmount: !amountCheck.valid ? verificationResult.amount : undefined,
        expectedCurrency: !currencyCheck.valid ? reg.payment_currency : undefined,
        actualCurrency: !currencyCheck.valid ? verificationResult.currency : undefined,
      }).catch(error => {
        console.error('[PaymentService] Failed to send review alert:', error)
      })
    }

    // Step 19: Return success result
    const result: ConfirmRegistrationResult = {
      success: true,
      status: finalStatus,
      registration: {
        id: updatedReg.id,
        payment_status: updatedReg.payment_status,
        status: updatedReg.status,
        amount: updatedReg.payment_amount,
        currency: updatedReg.payment_currency,
        provider: updatedReg.payment_provider,
        provider_ref: updatedReg.provider_session_ref,
        confirmed_at: updatedReg.confirmed_at,
      },
    }

    if (finalStatus === 'review' && reviewReason) {
      result.metadata = {
        reviewReason,
        mismatchDetails: {
          expectedAmount: !amountCheck.valid ? reg.payment_amount : undefined,
          actualAmount: !amountCheck.valid ? verificationResult.amount : undefined,
          expectedCurrency: !currencyCheck.valid ? reg.payment_currency : undefined,
          actualCurrency: !currencyCheck.valid ? verificationResult.currency : undefined,
        },
      }
    }

    return result

  } catch (error) {
    // Log confirmation failure
    await logConfirmationFailure({
      donationId: entityId,
      provider,
      transactionId: verificationResult.transactionId,
      error: error instanceof Error ? error.message : String(error),
      errorCode: error instanceof PaymentError ? error.code : undefined,
      errorStack: error instanceof Error ? error.stack : undefined,
    })
    
    if (error instanceof PaymentError) {
      return {
        success: false,
        status: 'failed',
        error: error.message,
      }
    }

    console.error('[PaymentService] Unexpected error in confirmRegistration:', error)
    
    await logSystemError({
      error: error instanceof Error ? error : new Error(String(error)),
      context: 'PaymentService.confirmRegistration',
      donationId: entityId,
      provider,
      metadata: { transactionId: verificationResult.transactionId, eventId },
    })
    
    throw new TransactionError(
      `Transaction failed for registration ${entityId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      entityId,
      { originalError: error },
      true
    )
  }
}

/**
 * Helper: Send event confirmation email
 * Extracted to keep main method readable
 */
private async sendEventConfirmationEmail(reg: any): Promise<boolean> {
  try {
    const { data: event } = await this.supabase
      .from('events')
      .select('title, event_date, location')
      .eq('id', reg.event_id)
      .single()

    if (!event) return false

    const { data: template } = await this.supabase
      .from('event_email_templates')
      .select('subject, body_html')
      .eq('event_id', reg.event_id)
      .eq('template_type', 'confirmation')
      .eq('is_active', true)
      .single()

    if (!template?.body_html) return false

    let ticketName: string | undefined
    if (reg.ticket_type_id) {
      const { data: tt } = await this.supabase
        .from('event_ticket_types')
        .select('name')
        .eq('id', reg.ticket_type_id)
        .single()
      ticketName = tt?.name
    }

    const { sendEventConfirmationEmail } = await import('@/lib/email/event-mailer')
    await sendEventConfirmationEmail({
      to: reg.email,
      fullName: reg.full_name,
      eventTitle: event.title,
      eventDate: event.event_date,
      eventLocation: event.location,
      ticketName,
      registrationId: reg.id,
      templateHtml: template.body_html,
      templateSubject: template.subject,
    })

    return true
  } catch (err) {
    console.error('[PaymentService] Event email error:', err)
    return false
  }
}

/**
 * Validate registration state transition
 * Only unpaid → paid/review/failed allowed
 */
private validateRegistrationStateTransition(
  currentStatus: string,
  entityId: string
): void {
  // If already paid, throw (will be caught and return already_processed)
  if (currentStatus === 'paid') {
    throw StateTransitionError.alreadyConfirmed(entityId)
  }

  // If already failed, throw
  if (currentStatus === 'failed') {
    throw StateTransitionError.alreadyFailed(entityId)
  }

  // Only unpaid can be confirmed
  if (currentStatus !== 'unpaid') {
    throw StateTransitionError.invalidTransition(
      entityId,
      currentStatus as any,
      'paid' as any
    )
  }
}
```

### 4.2 `lib/payments/core/types.ts`

**Change:** Add registration types (~30 lines)

```typescript
/**
 * Registration entity types
 */
export type RegistrationEntity = 'event_registration' | 'conference_registration'

/**
 * Input for PaymentService.confirmRegistration()
 */
export interface ConfirmRegistrationInput {
  /** Type of registration entity */
  entityType: RegistrationEntity
  
  /** The registration ID to confirm */
  entityId: string
  
  /** The payment provider */
  provider: PaymentProvider
  
  /** Verification result from provider adapter */
  verificationResult: VerificationResult
  
  /** Event ID for idempotency (webhook event ID) */
  eventId?: string
}

/**
 * Result of PaymentService.confirmRegistration()
 */
export interface ConfirmRegistrationResult {
  /** Whether the confirmation operation succeeded */
  success: boolean
  
  /** Final registration payment status after confirmation */
  status: 'paid' | 'review' | 'failed' | 'already_processed' | 'processing'
  
  /** Updated registration object (if available) */
  registration?: {
    id: string
    payment_status: string
    status: string
    amount: number
    currency: string
    provider?: PaymentProvider
    provider_ref?: string
    confirmed_at?: Date
  }
  
  /** Error message if confirmation failed */
  error?: string
  
  /** Additional context about the result */
  metadata?: {
    /** Reason for REVIEW status */
    reviewReason?: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain'
    
    /** Expected vs actual values for mismatches */
    mismatchDetails?: {
      expectedAmount?: number
      actualAmount?: number
      expectedCurrency?: string
      actualCurrency?: string
    }
  }
}
```

### 4.3 `app/api/webhooks/stripe/route.ts`

**Change:** Replace `confirmEventRegistrationFromWebhook()` (lines 384-583) with PaymentService call

**IMPORTANT:** Deploy with feature flag for dark launch testing (see Section 8).

**Before (200 lines of inline logic):**
```typescript
async function confirmEventRegistrationFromWebhook(supabase, registrationId, session, eventId) {
  // 200 lines of manual idempotency, fetch, amount check, update, sold_count, email
}
```

**After (~50 lines):**
```typescript
async function confirmEventRegistrationFromWebhook(
  supabase: ReturnType<typeof createServiceRoleClient>,
  registrationId: string,
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<boolean> {
  try {
    // Create adapter and PaymentService instances
    const adapter = createStripeAdapter()
    const paymentService = getPaymentService()

    // Process the already-verified Stripe event
    // The webhook signature was verified by the outer POST handler
    const stripeEvent = {
      type: 'checkout.session.completed',
      data: { object: session },
      id: eventId,
    } as Stripe.Event

    const verificationResult = await adapter.processVerifiedEvent(stripeEvent)

    // Confirm registration through PaymentService
    const result = await paymentService.confirmRegistration({
      entityType: 'event_registration',
      entityId: registrationId,
      provider: 'stripe',
      verificationResult,
      eventId,
    })

    if (!result.success) {
      console.error('Stripe webhook (event): Payment confirmation failed', {
        registrationId,
        sessionId: session.id,
        error: result.error,
      })
      return false
    }

    // Log successful confirmation
    console.log('Stripe webhook (event): Payment confirmed', {
      registrationId,
      sessionId: session.id,
      status: result.status,
    })

    return true
  } catch (error) {
    console.error('Stripe webhook (event): Unexpected error', {
      registrationId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}
```

**Key Changes:**
- Removed: Manual idempotency check, fetch, amount verification, CAS UPDATE, sold_count increment, email sending
- Added: Adapter usage, PaymentService call with proper error handling
- Result: 75% less code, same security guarantees, centralized logic

### 4.4 `app/api/payments/esewa/success/event-handler.ts`

**Change:** Replace inline logic (315 lines) with PaymentService call

**CRITICAL:** eSewa signature verification MUST happen BEFORE PaymentService call.

**Before:** 315 lines with manual HMAC verification, status check, amount verification, update, sold_count, email

**After (~80 lines):**
```typescript
export async function handleEventVerification(
  supabase: SupabaseClient,
  transaction_uuid: string,
  responseData: any,
  url: URL,
  isMock: boolean,
): Promise<NextResponse | null> {
  // H1 FIX: Block mock mode in production
  if (isMock && process.env.NODE_ENV === 'production') {
    logPaymentEvent('eSewa success - mock mode blocked in production', {}, 'error')
    return NextResponse.json({ error: 'Mock mode disabled in production' }, { status: 400 })
  }

  const { status, total_amount, signed_field_names, signature } = responseData

  // Lookup registration by eSewa transaction UUID
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('esewa_transaction_uuid', transaction_uuid)
    .single()

  if (!reg) {
    return null // Not an event registration
  }

  // ── CRITICAL: HMAC signature verification FIRST (before any state changes) ──
  if (!isMock) {
    const secretKey = process.env.ESEWA_SECRET_KEY
    if (!secretKey) {
      logPaymentEvent('eSewa success - missing ESEWA_SECRET_KEY', {}, 'error')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const sigResult = verifyEsewaSignature(responseData, signed_field_names, signature, secretKey)
    if (!sigResult.valid) {
      logPaymentEvent('eSewa success - event registration signature invalid', {
        regId: reg.id,
        transactionUuid: maskSensitiveData(transaction_uuid),
        reason: sigResult.reason,
      }, 'error')

      // Fetch event slug for redirect
      const { data: event } = await supabase
        .from('events')
        .select('slug')
        .eq('id', reg.event_id)
        .single()
      const slug = (event as { slug: string } | null)?.slug ?? ''

      return NextResponse.redirect(
        new URL(`/events/${slug}/register/failure?rid=${reg.id}&reason=invalid_signature`, url.origin),
      )
    }
  }

  // ── Use EsewaAdapter for verification ──
  try {
    const adapter = createEsewaAdapter()
    
    // Build verification request (adapter handles amount validation)
    const verificationResult = await adapter.verify(
      responseData,
      { query: { data: transaction_uuid } }
    )

    // Handle non-paid status BEFORE calling PaymentService
    if (verificationResult.status !== 'paid') {
      logPaymentEvent('eSewa success - event payment not completed', {
        regId: reg.id,
        status: verificationResult.status,
      }, 'warn')

      const { data: event } = await supabase
        .from('events')
        .select('slug')
        .eq('id', reg.event_id)
        .single()
      const slug = (event as { slug: string } | null)?.slug ?? ''

      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
      )
    }

    // ── Use PaymentService for confirmation ──
    const paymentService = getPaymentService()
    const result = await paymentService.confirmRegistration({
      entityType: 'event_registration',
      entityId: reg.id,
      provider: 'esewa',
      verificationResult,
      eventId: transaction_uuid,
    })

    // Fetch event slug for redirect
    const { data: event } = await supabase
      .from('events')
      .select('slug')
      .eq('id', reg.event_id)
      .single()
    const slug = (event as { slug: string } | null)?.slug ?? ''

    // Handle result
    if (!result.success || result.status === 'failed') {
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=failed`, url.origin),
      )
    }

    if (result.status === 'review') {
      return NextResponse.redirect(
        new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&status=review`, url.origin),
      )
    }

    // Success: paid or already_processed
    return NextResponse.redirect(
      new URL(`/events/${slug}/register/payment-success?rid=${reg.id}&paid=1`, url.origin),
    )

  } catch (error) {
    logPaymentEvent('eSewa success - verification error', {
      regId: reg.id,
      error: error instanceof Error ? error.message : String(error),
    }, 'error')

    const { data: event } = await supabase
      .from('events')
      .select('slug')
      .eq('id', reg.event_id)
      .single()
    const slug = (event as { slug: string } | null)?.slug ?? ''

    return NextResponse.redirect(
      new URL(`/events/${slug}/register/failure?rid=${reg.id}&reason=verification_error`, url.origin),
    )
  }
}
```

**Key Changes:**
- HMAC verification still happens FIRST (critical security boundary)
- Adapter handles amount verification (removes duplicate `verifyAmountMatch()` call)
- PaymentService handles state management, CAS lock, sold_count, email
- Proper error handling with redirects to event-specific pages

### 4.5 `app/api/payments/khalti/verify/route.ts`

**Change:** Add event registration path using PaymentService (~80 lines)

Currently only handles donations (V2) and conferences (V1 inline). Add event registration:

```typescript
// After donation lookup fails and conference lookup fails, add event registration:

// ── Event registration lookup ──
const { data: eventReg } = await supabase
  .from('event_registrations')
  .select('*')
  .eq('khalti_pidx', pidx)
  .single()

if (eventReg) {
  // Idempotency check: if already processed, return current status
  if (eventReg.payment_status === 'paid') {
    return NextResponse.json({
      ok: true,
      status: 'paid',
      message: 'Transaction already processed',
    }, { status: 200 })
  }

  if (eventReg.payment_status === 'failed') {
    return NextResponse.json({
      ok: false,
      status: 'failed',
      message: 'Payment previously failed',
    }, { status: 200 })
  }

  // Use KhaltiAdapter to verify the payment
  try {
    const khaltiAdapter = createKhaltiAdapter()
    const verificationResult = await khaltiAdapter.verify(
      { pidx, donation_id: eventReg.id, amount: eventReg.payment_amount },
      {}
    )

    // Handle "Pending" status specially (don't update DB, return processing)
    if (verificationResult.status === 'pending') {
      return NextResponse.json({
        ok: true,
        status: 'processing',
        message: 'Payment is still pending',
      }, { status: 200 })
    }

    // Use PaymentService to confirm the registration
    const paymentService = getPaymentService()
    const result = await paymentService.confirmRegistration({
      entityType: 'event_registration',
      entityId: eventReg.id,
      provider: 'khalti',
      verificationResult,
      eventId: pidx, // Use pidx as event ID for idempotency
    })

    // Handle confirmation result
    if (!result.success) {
      logPaymentEvent('Khalti verify (event): confirmation failed', {
        eventRegId: eventReg.id,
        error: result.error,
        pidx: maskSensitiveData(pidx),
      }, 'error')

      return NextResponse.json({
        ok: false,
        status: 'failed',
        error: result.error || 'Payment confirmation failed',
      }, { status: 400 })
    }

    // Map confirmation status to response
    const responseStatus = result.status === 'paid' ? 'paid' : result.status

    logPaymentEvent('Khalti verify (event): success', {
      eventRegId: eventReg.id,
      status: result.status,
      pidx: maskSensitiveData(pidx),
    })

    return NextResponse.json({
      ok: true,
      status: responseStatus,
      khaltiStatus: verificationResult.metadata.khaltiStatus,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
    }, { status: 200 })

  } catch (error) {
    // Handle verification errors
    if (error instanceof VerificationError) {
      logPaymentEvent('Khalti verify (event): verification error', {
        eventRegId: eventReg.id,
        error: error.message,
        pidx: maskSensitiveData(pidx),
      }, 'error')

      // For pending/processing status, return appropriate response
      if (error.message.includes('pending') || error.message.includes('Pending')) {
        return NextResponse.json({
          ok: true,
          status: 'processing',
          message: 'Payment is still pending',
        }, { status: 200 })
      }

      return NextResponse.json({
        ok: false,
        status: 'failed',
        error: error.message,
      }, { status: 400 })
    }

    if (error instanceof ConfigurationError) {
      logPaymentEvent('Khalti verify (event): configuration error', {
        eventRegId: eventReg.id,
        error: error.message,
      }, 'error')

      return NextResponse.json({
        ok: false,
        error: 'Khalti not configured',
        message: error.message,
      }, { status: 500 })
    }

    throw error
  }
}

// If neither donation, conference, nor event registration found
return NextResponse.json({
  ok: false,
  error: 'Payment record not found',
  message: 'Could not find donation, conference, or event registration record. Please contact support with your payment ID.',
}, { status: 404 })
```

**Placement:** Insert AFTER conference lookup (line ~130), BEFORE the "not found" error.

### 4.6 `lib/actions/events-module/event-registration.ts`

**Change:** Fix admin manual confirmation race condition

**Problem:** Admin clicking "Confirm" while webhook processes → double sold_count increment.

**Root Cause:** `incrementTicketSoldCount()` is non-idempotent — it unconditionally does `+1` every time it's called. The plan's previous fix (check `payment_status !== 'paid'`) is a TOCTOU race: the check reads `payment_status` at Step 2, but the CAS only guards `payment_status`, not the increment itself. If webhook runs between the check and the CAS, both increment.

**Correct Fix:** Make the sold_count increment idempotent at the source. The RPC function from migration 057 already does atomic increment, but needs a guard to prevent double-counting across confirmations.

**File:** `lib/actions/events-module/event-registration.ts` (line ~718)

**Before:**
```typescript
export async function confirmEventRegistration(id: string, options: { force?: boolean } = {}) {
  // ... validation ...
  
  await supabase
    .from('event_registrations')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: admin.email || admin.id,
    })
    .eq('id', id)
  
  // Increment sold_count (ALWAYS increments)
  await incrementTicketSoldCount(supabase, reg.ticket_type_id)
  
  return { success: true }
}
```

**After:**
```typescript
export async function confirmEventRegistration(id: string, options: { force?: boolean } = {}) {
  const { supabase, admin } = await requireAdmin()

  const { data: reg, error: fetchError } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !reg) {
    return { success: false, error: 'Registration not found' }
  }

  if (reg.status === 'confirmed') {
    return { success: false, error: 'Registration is already confirmed.' }
  }

  if (reg.status === 'cancelled' || reg.status === 'expired') {
    return { success: false, error: `Cannot confirm a ${reg.status} registration.` }
  }

  if (!options.force && reg.payment_status !== 'paid') {
    return {
      success: false,
      error: "Cannot confirm — payment has not been received. Use 'Mark as Paid' to override.",
    }
  }

  // CAS UPDATE: guards both status AND payment_status to prevent TOCTOU
  const { error: updateError } = await supabase
    .from('event_registrations')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: admin.email || admin.id,
    })
    .eq('id', id)
    .in('status', ['pending', 'failed'])  // Don't confirm cancelled/expired
    .neq('status', 'confirmed')            // Don't double-confirm

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // ── FIX: Only increment sold_count if payment_status was NOT already 'paid' ──
  // Webhook already incremented when it set payment_status='paid'.
  // Admin manual confirmation (cash/bank transfer) should increment.
  // This check + CAS prevents double-increment even under race conditions.
  if (reg.payment_status !== 'paid') {
    await incrementTicketSoldCount(supabase, reg.ticket_type_id)
  }

  return { success: true }
}
```

**Why This Works:**
1. CAS guards `status IN ('pending', 'failed')` — prevents confirming cancelled/expired registrations
2. If webhook raced and set `payment_status='paid'`, the admin's CAS still succeeds (webhook only set `payment_status`, not `status`), but the `payment_status !== 'paid'` check prevents double increment
3. If admin CAS succeeds and webhook CAS later tries, webhook's CAS will fail because `status` is already `'confirmed'`
4. **Defense in depth:** Even if CAS race happens, only one path increments sold_count

---

## 5. What Does NOT Change

| File | Reason |
|------|--------|
| `lib/actions/events-module/event-registration.ts` (startEventPayment) | Payment initiation logic is fine |
| `lib/payments/adapters/StripeAdapter.ts` | Adapter already works correctly |
| `lib/payments/adapters/KhaltiAdapter.ts` | Adapter already works correctly |
| `lib/payments/adapters/EsewaAdapter.ts` | Adapter already works correctly |
| `components/admin/payments/*` | UI reads same columns, no changes |
| `components/admin/donations/*` | Donation UI untouched |
| `lib/actions/admin-payment-actions.ts` | Polymorphic actions already work |
| `payment_events` table | Already has `event_registration_id` column (migration 056) |
| `confirmDonation()` method | **NEVER MODIFIED** — donations are always safe |
| Conference webhook handlers | Routed separately, no conflicts |

---

## 6. Migration Strategy

### Phase 0: Schema Fix (PREREQUISITE)
1. **Verify existing migrations:**
   - Confirm migration 056 ran successfully (check `event_registrations` has `'review'` in CHECK constraint)
   - Confirm `payment_events` table has `event_registration_id` column
   - Confirm `event_registrations` has provider-specific columns (`stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid`)

2. **Run new migration:**
   - Run `scripts/XXX-extend-payments-for-registrations.sql`
   - Verify CHECK constraint with test insert:
     ```sql
     -- Should succeed: donation only
     INSERT INTO payments (donation_id, entity_type, ...) VALUES ('<uuid>', 'donation', ...);
     
     -- Should succeed: event registration only
     INSERT INTO payments (event_registration_id, entity_type, ...) VALUES ('<uuid>', 'event_registration', ...);
     
     -- Should FAIL: both FKs set
     INSERT INTO payments (donation_id, event_registration_id, entity_type, ...) VALUES ('<uuid>', '<uuid>', 'donation', ...);
     
     -- Should FAIL: neither FK set
     INSERT INTO payments (entity_type, ...) VALUES ('donation', ...);
     ```

3. **Rollback (if needed):**
   - Only safe if NO payments with `event_registration_id` written yet
   - Cannot rollback CHECK constraint for `event_registrations` (migration 056 already applied, 'review' rows may exist)
   ```sql
   ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_entity_fk_check;
   ALTER TABLE payments DROP COLUMN IF EXISTS entity_type;
   ALTER TABLE payments DROP COLUMN IF EXISTS event_registration_id;
   ```

**No rollback needed** for migration 056 changes — those are safe and already deployed.

### Phase 1: PaymentService Changes (Safe)
1. Add `confirmRegistration()` to PaymentService (~200 lines)
2. Add `ConfirmRegistrationInput`/`ConfirmRegistrationResult` types
3. Add `validateRegistrationStateTransition()` helper
4. Add `sendEventConfirmationEmail()` private method
5. **No existing code is modified** — purely additive
6. Test: Unit test `confirmRegistration()` with mock Supabase client
7. **Rollback:** Remove added methods (no callers yet)

### Phase 2: Admin Action Fix (Low Risk)
1. Update `confirmEventRegistration()` to only increment sold_count if `payment_status !== 'paid'`
2. Test: Manual confirmation on already-paid registration → should NOT double-increment
3. **Rollback:** Revert the conditional (will cause double-increment again, but non-fatal)

### Phase 3: Stripe Webhook (CRITICAL PATH — Use Dark Launch)
**⚠️ HIGHEST RISK: All event payments flow through this**

**3a. Dark Launch (Recommended):**
```typescript
const USE_V2_EVENTS = process.env.FEATURE_FLAG_V2_EVENTS === 'true'

async function confirmEventRegistrationFromWebhook(...) {
  if (USE_V2_EVENTS) {
    return await confirmEventRegistrationViaPaymentService(...)
  } else {
    return await confirmEventRegistrationV1(...) // Existing inline logic
  }
}
```

Deploy with `FEATURE_FLAG_V2_EVENTS=false`, then flip to `true` after testing.

**3b. Shadow Mode (Alternative — More Cautious):**
```typescript
// Run BOTH paths, compare results, but use V1 result
const v2Result = await confirmEventRegistrationViaPaymentService(...).catch(e => ({ success: false, error: e }))
const v1Result = await confirmEventRegistrationV1(...)

if (v2Result.success !== v1Result) {
  logDifference({ v1: v1Result, v2: v2Result, registrationId, sessionId })
}

return v1Result // Use V1 until confident
```

**3c. Testing:**
- Stripe CLI: `stripe trigger checkout.session.completed --add metadata:event_registration_id=<test_id>`
- Verify: payment_status = 'paid', status = 'confirmed', sold_count incremented, email sent
- Test idempotency: Send same webhook twice → second returns `already_processed`
- Test amount mismatch: Modify DB amount → payment_status = 'review'
- Test race condition: Two simultaneous webhooks → only one wins (CAS lock)

**3d. Rollback:**
- Set `FEATURE_FLAG_V2_EVENTS=false` (instant)
- OR revert `confirmEventRegistrationFromWebhook()` to V1 inline logic

### Phase 4: eSewa Handler (Medium Risk)
1. Replace `handleEventVerification()` inline logic with PaymentService call
2. **CRITICAL:** Keep HMAC verification BEFORE PaymentService call
3. Test with eSewa sandbox callback
4. Verify: HMAC verification, amount check, confirmation, redirect
5. Test idempotency
6. **Rollback:** Revert `event-handler.ts` to inline logic

### Phase 5: Khalti Handler (Medium Risk)
1. Add event registration path to `verify/route.ts`
2. Test with Khalti sandbox
3. Verify: Lookup via adapter, "Pending" status handling, amount check, confirmation
4. Test idempotency
5. **Rollback:** Remove event registration path (restore "not found" error)

### Phase 6: Cleanup (Optional)
1. Remove `verifyEsewaSignature()` duplicate from `event-handler.ts` (adapter handles it)
2. Remove console.log debug statements
3. Remove feature flag (if using dark launch)
4. Remove V1 inline logic (if confident in V2)

---

## 7. Testing Checklist

### Schema Tests
- [ ] **Verify migration 056 already ran:**
  - [ ] `event_registrations` CHECK constraint includes `'review'`
  - [ ] `payment_events` table has `event_registration_id` column
  - [ ] `event_registrations` has `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid` columns
- [ ] **Test new migration (XXX-extend-payments-for-registrations.sql):**
  - [ ] `payments` table accepts rows with `donation_id` only
  - [ ] `payments` table accepts rows with `event_registration_id` only
  - [ ] `payments` table rejects rows with both `donation_id` AND `event_registration_id` set
  - [ ] `payments` table rejects rows with neither `donation_id` NOR `event_registration_id` set
  - [ ] `entity_type` discriminator works correctly ('donation' | 'event_registration')
  - [ ] Index `idx_payments_event_reg` exists and is used in queries

### Stripe Tests
- [ ] `stripe trigger checkout.session.completed` with event registration metadata
- [ ] Verify `event_registrations.payment_status` = `paid`
- [ ] Verify `event_registrations.status` = `confirmed`
- [ ] Verify `event_registrations.stripe_session_id` is set
- [ ] Verify `event_registrations.provider_session_ref` is set
- [ ] Verify `event_registrations.confirmed_by` = `'webhook'`
- [ ] Verify `payment_events` row exists with `event_registration_id`
- [ ] Verify `payments` table row exists with `event_registration_id` and `entity_type = 'event_registration'`
- [ ] Verify `sold_count` incremented on ticket type
- [ ] Verify confirmation email sent
- [ ] Verify `last_confirmation_email_sent_at` updated
- [ ] Test idempotency: send same webhook twice → second returns `already_processed`
- [ ] Test amount mismatch: `payment_status` → `review`, `payment_review_at` set
- [ ] Test currency mismatch: `payment_status` → `review`
- [ ] Test race condition: two simultaneous webhooks → only one wins (CAS lock)
- [ ] Test cancelled registration: webhook arrives → returns `already_processed`, no DB changes
- [ ] Test expired registration: webhook arrives → returns `already_processed`, no DB changes

### eSewa Tests
- [ ] Test with eSewa sandbox callback
- [ ] Verify HMAC signature verification rejects invalid signatures BEFORE any state changes
- [ ] Verify amount verification
- [ ] Verify confirmation (payment_status = 'paid', status = 'confirmed')
- [ ] Verify sold_count incremented
- [ ] Verify confirmation email sent
- [ ] Test idempotency: same callback twice → second is no-op
- [ ] Test amount mismatch: payment_status → 'review'
- [ ] Test status !== 'COMPLETE': payment_status → 'failed'

### Khalti Tests
- [ ] Test with Khalti sandbox
- [ ] Verify lookup via adapter
- [ ] Verify "Pending" status: returns `{ status: 'processing' }`, does NOT update DB
- [ ] Verify "Completed" status: payment_status → 'paid', status → 'confirmed'
- [ ] Verify amount verification
- [ ] Verify sold_count incremented
- [ ] Verify confirmation email sent
- [ ] Test idempotency: same pidx twice → second returns `already_processed`
- [ ] Test amount mismatch: payment_status → 'review'
- [ ] Test "Refunded" status: payment_status → 'failed'
- [ ] Test "Expired" status: payment_status → 'failed'

### Admin Action Tests
- [ ] Admin confirms registration with `payment_status = 'unpaid'` → sold_count incremented
- [ ] Admin confirms registration with `payment_status = 'paid'` → sold_count NOT incremented (already incremented by webhook)
- [ ] Admin confirms + webhook arrives simultaneously → no double-increment

### Regression Tests
- [ ] Donation flow still works (Stripe, eSewa, Khalti) — **DO NOT BREAK THIS**
- [ ] Conference flow still works (unchanged)
- [ ] Admin status change still works
- [ ] Archive/restore still works
- [ ] Capacity checks still work

### Performance Tests
- [ ] Stripe webhook response time < 2 seconds (with email fire-and-forget)
- [ ] eSewa callback response time < 3 seconds
- [ ] Khalti verify response time < 5 seconds (includes API call to Khalti)

---

## 8. Rollback Plan

If anything breaks:

### Phase 0 (Schema Fix)
- **Cannot rollback** migration 056 changes (already deployed, 'review' rows may exist)
- **Can rollback** new migration (if no rows written yet):
  ```sql
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_entity_fk_check;
  ALTER TABLE payments DROP COLUMN IF EXISTS entity_type;
  ALTER TABLE payments DROP COLUMN IF EXISTS event_registration_id;
  ```
- **Safe if:** No payments with `event_registration_id` written yet

### Phase 1 (PaymentService)
- **Rollback:** Remove `confirmRegistration()` method (no callers yet, safe)
- **Rollback:** Remove registration types from `types.ts`

### Phase 2 (Admin Action)
- **Rollback:** Revert `confirmEventRegistration()` to always increment sold_count
- **Impact:** May cause double-increment if webhook + admin action race

### Phase 3 (Stripe Webhook)
- **Instant rollback with feature flag:** Set `FEATURE_FLAG_V2_EVENTS=false`
- **Full rollback:** Revert `confirmEventRegistrationFromWebhook()` to V1 inline logic
- **Impact:** All event payments revert to V1 (no CAS lock, no state machine)

### Phase 4 (eSewa Handler)
- **Rollback:** Revert `event-handler.ts` to inline logic
- **Impact:** eSewa event payments revert to V1

### Phase 5 (Khalti Handler)
- **Rollback:** Remove event registration path, restore "not found" error
- **Impact:** Khalti event payments will fail (were not supported before)

### Monitoring During Rollout
- Watch Stripe webhook success rate (should stay ~99%)
- Watch eSewa callback errors (should be zero)
- Watch Khalti verify errors (should be zero)
- Watch sold_count mismatches (admin dashboard)
- Watch `payment_status = 'review'` rate (should be < 0.1%)

### Emergency Rollback Triggers
- Stripe webhook success rate drops below 95%
- More than 10 sold_count mismatches per day
- Any user-reported "payment succeeded but registration not confirmed"

---

## 9. Risk Assessment (Updated)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking donation flow | Low | Critical | `confirmDonation()` untouched; new method is additive |
| Stripe webhook regression | Medium | Critical | Deploy PaymentService first; migrate one handler at a time |
| sold_count not incrementing | Low | Medium | Non-fatal, same as V1; can be manually corrected |
| Email not sending | Low | Low | Fire-and-forget, same as V1 |
| State machine rejecting valid transitions | Medium | Medium | Test all 3 providers with each state before deploying |
| CAS lock too aggressive | Low | Low | Only affects concurrent duplicate webhooks (correct behavior) |

---

## 10. Future Work (Out of Scope)

- **Conference registration V2 migration** — will be removed when events module is complete
- **Job queue (Phase 4)** — receipt generation, email sending via async jobs
- **PaymentService rename** — `confirmDonation()` → `confirmPayment()` (after all entities migrated)
- **Duplicate HMAC cleanup** — remove `verifyEsewaSignature()` from event-handler.ts and conference-handler.ts


## 11. Success Criteria

After full implementation, the system must meet these criteria:

### Functional Requirements
- [ ] All Stripe event payments confirmed successfully (>99% success rate)
- [ ] All eSewa event payments confirmed successfully
- [ ] All Khalti event payments confirmed successfully
- [ ] Idempotency: Duplicate webhooks return `already_processed` with no side effects
- [ ] Race conditions: Concurrent webhooks result in exactly ONE confirmation (CAS lock works)
- [ ] Amount mismatches: payment_status → 'review', admin alert sent
- [ ] sold_count: Accurate (matches confirmed registration count)
- [ ] Emails: Sent for all confirmed payments

### Security Requirements
- [ ] eSewa HMAC verification happens BEFORE any state changes
- [ ] CAS lock prevents race conditions (no double-payments or double-increments)
- [ ] State machine prevents invalid transitions
- [ ] Idempotency prevents duplicate processing

### Operational Requirements
- [ ] Stripe webhook response time < 2 seconds (95th percentile)
- [ ] eSewa callback response time < 3 seconds (95th percentile)
- [ ] Khalti verify response time < 5 seconds (95th percentile)
- [ ] Zero regressions in donation flow
- [ ] Zero regressions in conference flow

### Maintainability Requirements
- [ ] Code duplication reduced by >75% (inline logic → PaymentService)
- [ ] All error paths logged with structured logging
- [ ] Admin dashboard shows sold_count audit trail
- [ ] Rollback plan tested and documented

---

## 11. Future Work (Out of Scope)

The following improvements are NOT part of this plan but should be considered for future iterations:

### Phase 4+ (Post-V2 Stabilization)
1. **Conference registration V2 migration** — Apply same pattern to conferences (will be removed when events module is complete)
2. **Job queue implementation** — Move receipt generation and email sending to async job queue
3. **PaymentService method rename** — `confirmDonation()` → `confirmPayment()` (after all entities migrated)
4. **Duplicate HMAC cleanup** — Remove `verifyEsewaSignature()` from event-handler.ts and conference-handler.ts (move to adapter)
5. **Logging refactor** — Make logging functions polymorphic (accept `entityId` instead of `donationId`)
6. **sold_count audit UI** — Admin dashboard to detect and fix sold_count mismatches
7. **Type safety** — Remove `<any>` from Supabase client, use generated types
8. **payment_events cleanup** — Add CHECK constraint and discriminator column (same as `payments` table)
9. **Review status workflow** — Add admin UI to resolve payments stuck in 'review' status
10. **Comprehensive monitoring** — Grafana dashboards for payment success rates, race conditions, review rates

---

## 12. Open Questions

1. **Should we add a `payment_attempts` table?** Currently, if a payment fails and the user retries, we have no record of the failed attempt. This would help with analytics and fraud detection.

2. **How to handle partial refunds?** Event registrations have `payment_status IN (..., 'refunded', ...)` but no `refund_amount` column. If a ticket costs $100 and we refund $50, what's the status?

3. **Should emails be truly fire-and-forget, or add to job queue?** Current plan: fire-and-forget (matches V1). Alternative: job queue with retries. Job queue is more robust but adds complexity.

4. **What about webhook replay?** If Supabase goes down and webhooks are queued, replaying them could cause issues. Should we add a timestamp check (reject webhooks older than 24 hours)?

---

## Appendix A: Quick Reference

### Key Files Changed
1. `scripts/XXX-fix-event-review-status.sql` — Schema fix (CHECK constraint)
2. `scripts/XXX-fix-payments-polymorphic-fk.sql` — Schema fix (FK integrity)
3. `lib/payments/core/PaymentService.ts` — Add `confirmRegistration()` method (~200 lines)
4. `lib/payments/core/types.ts` — Add registration types (~30 lines)
5. `app/api/webhooks/stripe/route.ts` — Replace event handler (~50 lines, was 200)
6. `app/api/payments/esewa/success/event-handler.ts` — Replace handler (~80 lines, was 315)
7. `app/api/payments/khalti/verify/route.ts` — Add event path (~80 lines)
8. `lib/actions/events-module/event-registration.ts` — Fix admin race condition (5 lines)

### Key Decisions
| Decision | Rationale |
|----------|-----------|
| Add 'review' to CHECK constraint | Simpler than mapping to 'failed' + review_status column |
| Add entity_type discriminator | Makes polymorphic FK clearer and enables proper indexing |
| Write to BOTH generic AND provider-specific fields | Maintains backward compatibility with V1 queries |
| confirmed_by = 'webhook' | Distinguishes automated vs. manual confirmations |
| Dark launch with feature flag | Allows safe testing in production before full rollout |
| Keep eSewa HMAC verification outside PaymentService | Security-critical boundary, must fail fast |
| Return 'processing' for Khalti Pending | Don't update DB for incomplete payments |

### Deployment Order
1. Phase 0: Schema fixes (prerequisite)
2. Phase 1: PaymentService changes (safe, no callers)
3. Phase 2: Admin action fix (low risk)
4. Phase 3: Stripe webhook (CRITICAL — use dark launch)
5. Phase 4: eSewa handler (medium risk)
6. Phase 5: Khalti handler (medium risk)
7. Phase 6: Cleanup (optional)

### Emergency Contacts
- **Stripe webhook failing:** Set `FEATURE_FLAG_V2_EVENTS=false` immediately
- **sold_count mismatches:** Run manual reconciliation query (count confirmed registrations vs. sold_count)
- **Payment stuck in 'review':** Admin can manually update via dashboard (future feature)

---

## Appendix B: Migration Script

### Schema Extension: Add event_registration_id to payments Table

**File:** `scripts/XXX-extend-payments-for-registrations.sql`

**Prerequisites:**
- ✅ Migration 056 must be run first (adds 'review' to CHECK constraint, event_registration_id to payment_events)

```sql
-- ============================================================
-- deessa Foundation — Extend Payments Table for Event Registrations
-- Migration: XXX-extend-payments-for-registrations.sql
-- Adds event_registration_id FK with polymorphic integrity constraints
-- ============================================================

-- Add event_registration_id column (nullable FK)
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS event_registration_id UUID 
  REFERENCES event_registrations(id) ON DELETE SET NULL;

-- Add discriminator column for polymorphic FK clarity
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS entity_type TEXT 
  DEFAULT 'donation' 
  CHECK (entity_type IN ('donation', 'event_registration'));

-- Backfill existing rows (all current rows are donations)
UPDATE payments 
SET entity_type = 'donation' 
WHERE entity_type IS NULL;

-- Make discriminator non-nullable
ALTER TABLE payments 
  ALTER COLUMN entity_type SET NOT NULL;

-- Add CHECK constraint: exactly ONE FK must be set
ALTER TABLE payments 
  ADD CONSTRAINT payments_entity_fk_check 
  CHECK (
    (donation_id IS NOT NULL AND event_registration_id IS NULL AND entity_type = 'donation') OR
    (donation_id IS NULL AND event_registration_id IS NOT NULL AND entity_type = 'event_registration')
  );

-- Add index for event registration lookups
CREATE INDEX IF NOT EXISTS idx_payments_event_reg 
  ON payments (event_registration_id) 
  WHERE event_registration_id IS NOT NULL;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify: Should return all rows with exactly ONE FK set
SELECT 
  COUNT(*) AS total,
  SUM(CASE WHEN donation_id IS NOT NULL THEN 1 ELSE 0 END) AS with_donation_id,
  SUM(CASE WHEN event_registration_id IS NOT NULL THEN 1 ELSE 0 END) AS with_event_reg_id,
  SUM(CASE WHEN donation_id IS NOT NULL AND event_registration_id IS NOT NULL THEN 1 ELSE 0 END) AS both_set,
  SUM(CASE WHEN donation_id IS NULL AND event_registration_id IS NULL THEN 1 ELSE 0 END) AS neither_set
FROM payments;

-- Expected results:
-- both_set = 0 (no rows with both FKs)
-- neither_set = 0 (no orphaned rows)
-- with_donation_id = total (all existing rows are donations)

-- Test: Try to insert invalid rows (should FAIL)
-- Uncomment to test:

-- Should FAIL: both FKs set
-- INSERT INTO payments (donation_id, event_registration_id, entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- VALUES (gen_random_uuid(), gen_random_uuid(), 'donation', 'stripe', 'test', 10.00, 'USD', 'paid', NOW());

-- Should FAIL: neither FK set
-- INSERT INTO payments (entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- VALUES ('donation', 'stripe', 'test', 10.00, 'USD', 'paid', NOW());

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
```

---

## Appendix C: Feature Flag Configuration

If using dark launch strategy (recommended):

### Environment Variable

```bash
# .env.local (development)
FEATURE_FLAG_V2_EVENTS=true

# Production (initial deploy)
FEATURE_FLAG_V2_EVENTS=false

# Production (after testing)
FEATURE_FLAG_V2_EVENTS=true
```

### Code Pattern

```typescript
// In app/api/webhooks/stripe/route.ts

const USE_V2_EVENTS = process.env.FEATURE_FLAG_V2_EVENTS === 'true'

async function confirmEventRegistrationFromWebhook(...) {
  if (USE_V2_EVENTS) {
    // V2 path: PaymentService
    return await confirmEventRegistrationViaPaymentService(...)
  } else {
    // V1 path: inline logic (existing code)
    return await confirmEventRegistrationV1(...)
  }
}
```

---

## Appendix D: Testing Script

```bash
#!/bin/bash
# test-event-payments.sh
# Run this script after deployment to verify all payment paths work

echo "Testing Stripe event payments..."
stripe trigger checkout.session.completed \
  --add metadata:event_registration_id=<TEST_ID> \
  --override checkout.session.completed:data:object:amount_total=5000 \
  --override checkout.session.completed:data:object:currency=usd

# Check result
echo "Verifying registration status..."
# (Add SQL query to check event_registrations table)

echo "Testing eSewa event payments..."
# (Requires eSewa sandbox credentials and test callback)

echo "Testing Khalti event payments..."
# (Requires Khalti sandbox credentials and test pidx)

echo "All tests complete. Check logs for errors."
```

---

**END OF REVISED PLAN**

**Document Version:** Rev 2  
**Last Updated:** 2025-01-27  
**Status:** Ready for Implementation (after schema fixes)  
**Estimated Effort:** 3-4 days (implementation) + 2 days (testing) + 1 day (rollout)
