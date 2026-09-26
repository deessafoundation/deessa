---
title: "V2 PaymentService Events Integration — Implementation Checklist"
description: "This checklist tracks the complete implementation of V2 PaymentService for event registrations."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# V2 PaymentService Events Integration — Implementation Checklist

## Overview

This checklist tracks the complete implementation of V2 PaymentService for event registrations.

**Estimated Timeline:** 6-7 days total
- Phase 0: 0.5 days (schema migration)
- Phase 1: 1.5 days (PaymentService changes)
- Phase 2: 0.5 days (admin action fix)
- Phase 3: 1.5 days (Stripe webhook with dark launch)
- Phase 4: 1 day (eSewa handler)
- Phase 5: 1 day (Khalti handler)
- Phase 6: 0.5 days (cleanup)

---

## Phase 0: Schema Migration ⏳

### Prerequisites Verification
- [ ] Verify migration 056 ran successfully
  - [ ] `event_registrations` CHECK constraint includes `'review'`
  - [ ] `payment_events` table has `event_registration_id` column
  - [ ] `event_registrations` has provider-specific columns

### Migration Execution
- [ ] Review `scripts/db/migrations/057b-extend-payments-for-registrations.sql`
- [ ] Run migration in **development** environment
  - [ ] Verify success (check NOTICE output)
  - [ ] Run manual verification queries
  - [ ] Test constraint with invalid inserts
- [ ] Run migration in **staging** environment
  - [ ] Verify success
  - [ ] Monitor for errors (24 hours)
- [ ] Run migration in **production** environment
  - [ ] Choose low-traffic window
  - [ ] Monitor table locks
  - [ ] Verify success
  - [ ] Document completion time

### Post-Migration Validation
- [ ] All verification queries pass
- [ ] No corrupted rows (BOTH or NEITHER FK set)
- [ ] Indexes created successfully
- [ ] Performance check (query plan uses new indexes)

**Sign-off:** _______________________ Date: _______

---

## Phase 1: PaymentService Changes ⏳

### File: `lib/payments/core/types.ts`

- [ ] Add `RegistrationEntity` type
- [ ] Add `ConfirmRegistrationInput` interface
- [ ] Add `ConfirmRegistrationResult` interface
- [ ] Add JSDoc comments
- [ ] Export new types

**Code Review:** _______________________ Date: _______

### File: `lib/payments/core/PaymentService.ts`

- [ ] Add `confirmRegistration()` method (~200 lines)
  - [ ] Step 1: Log attempt
  - [ ] Step 2: Fetch registration
  - [ ] Step 3: Idempotency check
  - [ ] Step 4: Short-circuit checks (paid, confirmed, cancelled, expired)
  - [ ] Step 5: Khalti "Pending" special handling
  - [ ] Step 6: State machine validation
  - [ ] Step 7-8: Amount and currency verification
  - [ ] Step 9: Log verification result
  - [ ] Step 10: Determine final status
  - [ ] Step 11: Build update data (all fields)
  - [ ] Step 12: CAS UPDATE
  - [ ] Step 13: Handle CAS failure
  - [ ] Step 14: Log state transition
  - [ ] Step 15: Insert into `payments` table
  - [ ] Step 16: Insert into `payment_events` table
  - [ ] Step 17: Post-payment hooks (sold_count, email)
  - [ ] Step 18: Send review alert
  - [ ] Step 19: Return result
  - [ ] Catch block with proper error handling

- [ ] Add `sendEventConfirmationEmail()` private method
  - [ ] Fetch event details
  - [ ] Fetch email template
  - [ ] Fetch ticket name
  - [ ] Send email
  - [ ] Return boolean success

- [ ] Add `validateRegistrationStateTransition()` private method
  - [ ] Check if already paid → throw
  - [ ] Check if already failed → throw
  - [ ] Check if not unpaid → throw
  - [ ] Return void on success

**Code Review:** _______________________ Date: _______

### Unit Tests (Optional but Recommended)

- [ ] Test `confirmRegistration()` with mock Supabase client
  - [ ] Success case (unpaid → paid)
  - [ ] Review case (amount mismatch)
  - [ ] Review case (currency mismatch)
  - [ ] Failed case (verification status not paid)
  - [ ] Already processed case (payment_status = paid)
  - [ ] Already processed case (status = confirmed)
  - [ ] Short-circuit case (status = cancelled)
  - [ ] Short-circuit case (status = expired)
  - [ ] Processing case (Khalti pending)
  - [ ] Idempotency case (duplicate event_id)
  - [ ] Race condition case (CAS lock fails)

**Test Results:** _______________________ Date: _______

**Sign-off:** _______________________ Date: _______

---

## Phase 2: Admin Action Fix ⏳

### File: `lib/actions/events-module/event-registration.ts`

- [ ] Locate `confirmEventRegistration()` function (line ~718)
- [ ] Add conditional sold_count increment:
  ```typescript
  // Only increment if payment_status was NOT already 'paid'
  if (reg.payment_status !== 'paid') {
    await incrementTicketSoldCount(supabase, reg.ticket_type_id)
  }
  ```
- [ ] Add comment explaining why
- [ ] Test manual confirmation flow:
  - [ ] Admin confirms registration with `payment_status = 'unpaid'` → sold_count increments
  - [ ] Admin confirms registration with `payment_status = 'paid'` → sold_count does NOT increment

**Code Review:** _______________________ Date: _______

**Sign-off:** _______________________ Date: _______

---

## Phase 3: Stripe Webhook (CRITICAL PATH) ⏳

### Feature Flag Setup

- [ ] Add environment variable:
  ```bash
  # .env.local (development)
  FEATURE_FLAG_V2_EVENTS=true
  
  # Production (initial deploy)
  FEATURE_FLAG_V2_EVENTS=false
  ```

### File: `app/api/webhooks/stripe/route.ts`

- [ ] Add feature flag check at top of file
- [ ] Create new `confirmEventRegistrationViaPaymentService()` function:
  - [ ] Create adapter instance
  - [ ] Create PaymentService instance
  - [ ] Build stripeEvent object
  - [ ] Call `adapter.processVerifiedEvent()`
  - [ ] Call `paymentService.confirmRegistration()`
  - [ ] Handle result
  - [ ] Return boolean success
  - [ ] Add comprehensive error handling

- [ ] Update `confirmEventRegistrationFromWebhook()`:
  ```typescript
  if (USE_V2_EVENTS) {
    return await confirmEventRegistrationViaPaymentService(...)
  } else {
    return await confirmEventRegistrationV1(...) // existing logic
  }
  ```

- [ ] Rename existing inline logic to `confirmEventRegistrationV1()` (for fallback)

**Code Review:** _______________________ Date: _______

### Testing with Stripe CLI

- [ ] Install Stripe CLI: `stripe version`
- [ ] Set up webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Test event registration payment:
  ```bash
  stripe trigger checkout.session.completed \
    --add metadata:event_registration_id=<TEST_ID>
  ```

- [ ] Verify in development (FEATURE_FLAG_V2_EVENTS=true):
  - [ ] `event_registrations.payment_status` = `'paid'`
  - [ ] `event_registrations.status` = `'confirmed'`
  - [ ] `event_registrations.stripe_session_id` set
  - [ ] `event_registrations.confirmed_by` = `'webhook'`
  - [ ] `payment_events` row exists
  - [ ] `payments` row exists with `entity_type = 'event_registration'`
  - [ ] `sold_count` incremented
  - [ ] Confirmation email sent
  - [ ] `last_confirmation_email_sent_at` updated

- [ ] Test idempotency (send same event twice):
  - [ ] Second call returns `already_processed`
  - [ ] No double-increment of sold_count
  - [ ] No duplicate `payment_events` row

- [ ] Test amount mismatch:
  - [ ] Modify DB amount before webhook
  - [ ] `payment_status` → `'review'`
  - [ ] `payment_review_at` timestamp set
  - [ ] Admin alert sent

- [ ] Test cancelled registration:
  - [ ] Set `status = 'cancelled'` before webhook
  - [ ] Webhook returns `already_processed`
  - [ ] No DB changes

**Test Results:** _______________________ Date: _______

### Dark Launch to Production

- [ ] Deploy code with `FEATURE_FLAG_V2_EVENTS=false`
- [ ] Monitor for deployment errors (30 minutes)
- [ ] Flip flag to `true` for **10% of traffic** (if supported)
  - [ ] Monitor error rates (2 hours)
  - [ ] Monitor sold_count accuracy
  - [ ] Monitor email delivery
- [ ] Flip flag to `true` for **100% of traffic**
  - [ ] Monitor error rates (24 hours)
  - [ ] Compare V1 vs V2 metrics
  - [ ] Check for review status increase

**Production Rollout Log:**

| Date | Time | Action | Result | Notes |
|------|------|--------|--------|-------|
| | | Deploy with flag=false | | |
| | | Set flag=true (10%) | | |
| | | Set flag=true (100%) | | |

**Sign-off:** _______________________ Date: _______

---

## Phase 4: eSewa Handler ⏳

### File: `app/api/payments/esewa/success/event-handler.ts`

- [ ] Replace `handleEventVerification()` (~315 lines → ~80 lines)
  - [ ] Keep HMAC signature verification FIRST
  - [ ] Add signature failure redirect
  - [ ] Create EsewaAdapter instance
  - [ ] Call `adapter.verify()`
  - [ ] Handle non-paid status before PaymentService
  - [ ] Create PaymentService instance
  - [ ] Call `paymentService.confirmRegistration()`
  - [ ] Handle result with appropriate redirects
  - [ ] Add comprehensive error handling

**Code Review:** _______________________ Date: _______

### Testing with eSewa Sandbox

- [ ] Set up eSewa sandbox credentials
- [ ] Test payment flow:
  - [ ] Create test registration
  - [ ] Initiate eSewa payment
  - [ ] Complete payment in sandbox
  - [ ] Verify callback arrives

- [ ] Verify success case:
  - [ ] `payment_status` = `'paid'`
  - [ ] `status` = `'confirmed'`
  - [ ] `esewa_transaction_uuid` set
  - [ ] `sold_count` incremented
  - [ ] Email sent

- [ ] Test HMAC signature failure:
  - [ ] Modify signature in callback
  - [ ] Verify rejection BEFORE any DB changes
  - [ ] Verify redirect to failure page

- [ ] Test amount mismatch:
  - [ ] Modify expected amount
  - [ ] `payment_status` → `'review'`
  - [ ] Redirect to review page

- [ ] Test idempotency:
  - [ ] Send same callback twice
  - [ ] Second call is no-op

**Test Results:** _______________________ Date: _______

### Deploy to Production

- [ ] Deploy updated handler
- [ ] Monitor eSewa webhooks (24 hours)
- [ ] Check for callback errors
- [ ] Verify payment confirmations

**Sign-off:** _______________________ Date: _______

---

## Phase 5: Khalti Handler ⏳

### File: `app/api/payments/khalti/verify/route.ts`

- [ ] Add event registration lookup after conference lookup fails
  - [ ] Query by `khalti_pidx`
  - [ ] Idempotency checks (already paid, already failed)
  - [ ] Create KhaltiAdapter instance
  - [ ] Call `adapter.verify()`
  - [ ] Handle "Pending" status → return `processing`
  - [ ] Create PaymentService instance
  - [ ] Call `paymentService.confirmRegistration()`
  - [ ] Handle result
  - [ ] Return appropriate JSON response

- [ ] Update "not found" error to mention event registrations:
  ```json
  {
    "ok": false,
    "error": "Payment record not found",
    "message": "Could not find donation, conference, or event registration record."
  }
  ```

**Code Review:** _______________________ Date: _______

### Testing with Khalti Sandbox

- [ ] Set up Khalti sandbox credentials
- [ ] Test payment flow:
  - [ ] Create test registration
  - [ ] Initiate Khalti payment
  - [ ] Complete payment in sandbox
  - [ ] Call verify endpoint

- [ ] Verify success case:
  - [ ] `payment_status` = `'paid'`
  - [ ] `status` = `'confirmed'`
  - [ ] `khalti_pidx` set
  - [ ] `sold_count` incremented
  - [ ] Email sent

- [ ] Test "Pending" status:
  - [ ] API returns `{ status: 'processing' }`
  - [ ] No DB changes
  - [ ] Frontend polls again

- [ ] Test amount mismatch:
  - [ ] Modify expected amount
  - [ ] `payment_status` → `'review'`

- [ ] Test idempotency:
  - [ ] Call verify twice with same pidx
  - [ ] Second call returns `already_processed`

**Test Results:** _______________________ Date: _______

### Deploy to Production

- [ ] Deploy updated handler
- [ ] Monitor Khalti verify calls (24 hours)
- [ ] Check for verification errors
- [ ] Verify payment confirmations

**Sign-off:** _______________________ Date: _______

---

## Phase 6: Cleanup (Optional) ⏳

### Code Cleanup

- [ ] Remove V1 inline logic from Stripe webhook (if confident in V2)
- [ ] Remove feature flag (set permanently to true)
- [ ] Remove duplicate `verifyEsewaSignature()` from event-handler.ts
- [ ] Remove console.log debug statements
- [ ] Run linter and fix warnings

### Documentation Updates

- [ ] Update README with V2 architecture notes
- [ ] Update API documentation
- [ ] Document sold_count audit procedure
- [ ] Add runbook for payment review status

**Sign-off:** _______________________ Date: _______

---

## Regression Testing ✅

### Donation Flow (DO NOT BREAK)

- [ ] Stripe donation payment works
- [ ] eSewa donation payment works
- [ ] Khalti donation payment works
- [ ] Receipt generation works
- [ ] Email confirmation works
- [ ] Admin dashboard shows donations

### Conference Flow (DO NOT BREAK)

- [ ] Stripe conference payment works
- [ ] Khalti conference payment works
- [ ] Conference confirmation email works
- [ ] Admin dashboard shows conferences

### Event Flow (NEW)

- [ ] All 3 providers work for event registrations
- [ ] sold_count increments correctly
- [ ] Email confirmations sent
- [ ] Admin dashboard shows events

### Admin Actions

- [ ] Manual confirmation works (no double-increment)
- [ ] Manual cancellation works (decrements sold_count)
- [ ] Archive/restore works
- [ ] Status change logging works

**Test Results:** _______________________ Date: _______

**Sign-off:** _______________________ Date: _______

---

## Production Monitoring (First 7 Days) 📊

### Daily Checks

- [ ] **Day 1:** Check error logs, sold_count accuracy, email delivery
- [ ] **Day 2:** Check error logs, review status rate
- [ ] **Day 3:** Check error logs, performance metrics
- [ ] **Day 4:** Check error logs, webhook retry rate
- [ ] **Day 5:** Check error logs, compare V2 vs V1 metrics
- [ ] **Day 6:** Check error logs, verify no regressions
- [ ] **Day 7:** Full health check, sign-off

### Metrics to Monitor

| Metric | Baseline (V1) | Week 1 (V2) | Target |
|--------|---------------|-------------|--------|
| Stripe webhook success rate | __% | __% | >99% |
| eSewa callback success rate | __% | __% | >99% |
| Khalti verify success rate | __% | __% | >99% |
| sold_count accuracy | __% | __% | 100% |
| Review status rate | __% | __% | <0.5% |
| Average response time (Stripe) | __ms | __ms | <2000ms |
| Email delivery rate | __% | __% | >95% |

### Alert Thresholds

- [ ] Stripe webhook errors > 5 per hour → investigate
- [ ] sold_count mismatch detected → audit immediately
- [ ] Review status rate > 1% → investigate amounts
- [ ] Response time > 5 seconds → check DB locks

**Monitoring Log:**

| Date | Issue | Severity | Resolution | Notes |
|------|-------|----------|------------|-------|
| | | | | |

---

## Final Sign-Off ✅

### Pre-Production Checklist

- [ ] All phases complete
- [ ] All tests pass
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team trained on new flow

### Production Deployment

- [ ] Deployed to production: Date _______ Time _______
- [ ] Deployment verified successful
- [ ] Monitoring active
- [ ] On-call engineer assigned: _______________________

### Success Criteria Met

- [ ] Zero regressions in donation flow
- [ ] Zero regressions in conference flow
- [ ] Event payments working via V2
- [ ] sold_count 100% accurate
- [ ] Email delivery >95%
- [ ] Webhook success rate >99%

### Final Approval

**Developer:** _______________________ Date: _______

**QA:** _______________________ Date: _______

**Tech Lead:** _______________________ Date: _______

**Product Owner:** _______________________ Date: _______

---

## Appendix: Rollback Procedures

### Phase 3 Rollback (Stripe Webhook)

```bash
# Instant rollback via feature flag
export FEATURE_FLAG_V2_EVENTS=false

# OR revert code changes
git revert <commit-hash>
git push
```

### Phase 4 Rollback (eSewa Handler)

```bash
# Revert event-handler.ts to V1 logic
git revert <commit-hash>
git push
```

### Phase 5 Rollback (Khalti Handler)

```bash
# Remove event registration path
git revert <commit-hash>
git push
```

### Schema Rollback (Phase 0)

**⚠️ ONLY if NO event payments exist**

```sql
SELECT COUNT(*) FROM payments WHERE event_registration_id IS NOT NULL;
-- If 0, safe to rollback:

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_entity_fk_check;
DROP INDEX IF EXISTS idx_payments_entity_type;
DROP INDEX IF EXISTS idx_payments_event_reg;
ALTER TABLE payments DROP COLUMN IF EXISTS entity_type;
ALTER TABLE payments DROP COLUMN IF EXISTS event_registration_id;
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Ready for Implementation
