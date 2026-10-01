---
title: "V2 PaymentService Events Integration — Documentation Hub"
description: "| Document | Purpose | Audience |"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# V2 PaymentService Events Integration — Documentation Hub

## 📋 Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| **[PLAN.md](./PLAN.md)** | Complete technical specification (Rev 2) | Developers, Tech Leads |
| **[PLAN-REVISION-NOTES.md](./PLAN-REVISION-NOTES.md)** | Summary of changes after review | Developers |
| **[MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md)** | Step-by-step migration guide | DevOps, DBAs |
| **[IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)** | Phase-by-phase implementation tracker | Developers, Project Managers |

---

## 🎯 Project Overview

### Goal
Wire event registrations through the V2 `PaymentService` to get the same security guarantees as donations:
- ✅ 3-layer idempotency (SELECT, short-circuit, CAS)
- ✅ CAS-based race condition prevention
- ✅ Formal state machine validation
- ✅ Structured error handling
- ✅ Centralized logging and monitoring

### Scope
- ✅ **IN SCOPE:** Event registrations (Stripe, eSewa, Khalti)
- ❌ **OUT OF SCOPE:** Donations (already using V2), Conferences (will be deprecated)

### Status
🟡 **Ready for Implementation** — Schema prerequisite identified, plan finalized

---

## 📊 Current State

### What Works Today (V1)
- ✅ Donations use V2 PaymentService (secure, centralized)
- ⚠️ Event registrations use V1 inline logic (duplicated across 6+ handlers)
- ⚠️ Conferences use V1 inline logic (out of scope, will be removed)

### What's Broken (V1)
- ❌ No CAS lock → race conditions possible
- ❌ No formal state machine → invalid transitions possible
- ❌ Duplicated code → inconsistent behavior
- ❌ Inconsistent amount verification → bugs and security issues

---

## 🛠️ Implementation Plan

### Timeline: 6-7 Days

```
Phase 0: Schema Migration       [0.5 days] ━━━━━━━━━━━━━━━━━━━━
Phase 1: PaymentService Code    [1.5 days] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 2: Admin Action Fix       [0.5 days] ━━━━━━━━━━━━━━━━━━━━
Phase 3: Stripe Webhook         [1.5 days] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 4: eSewa Handler          [1.0 days] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 5: Khalti Handler         [1.0 days] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 6: Cleanup (optional)     [0.5 days] ━━━━━━━━━━━━━━━━━━━━
                                           └─────────────────────┘
                                            Total: 6-7 days
```

### Key Milestones

1. **✅ Schema Ready** — Migration 057 designed and reviewed
2. **🟡 Code Complete** — All PaymentService changes implemented
3. **🟡 Dark Launch** — Stripe webhook using V2 (feature flag)
4. **🟡 Full Rollout** — All providers using V2
5. **🟡 Monitoring** — 7 days of production validation

---

## 🚀 Getting Started

### For Developers

1. **Read the plan:**
   - Start with [PLAN.md](./PLAN.md) (full specification)
   - Skim [PLAN-REVISION-NOTES.md](./PLAN-REVISION-NOTES.md) (what changed)

2. **Understand the architecture:**
   - V2 PaymentService: `lib/payments/core/PaymentService.ts`
   - Current event handlers: `app/api/webhooks/stripe/route.ts` (line 384-583)
   - Migration 056: `scripts/db/migrations/056-event-payment-integration.sql` (already applied)

3. **Start implementing:**
   - Use [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) to track progress
   - Follow the phase-by-phase approach
   - Test thoroughly at each phase

### For DevOps/DBAs

1. **Review migration:**
   - Read [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md)
   - Review migration file: `scripts/db/migrations/057b-extend-payments-for-registrations.sql`

2. **Run pre-flight checks:**
   - Verify migration 056 ran successfully
   - Check table sizes (`payments` table)
   - Plan maintenance window (low-traffic time)

3. **Execute migration:**
   - Follow step-by-step guide in MIGRATION-CHECKLIST.md
   - Run verification queries
   - Document results

### For Project Managers

1. **Track progress:**
   - Use [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)
   - Monitor phase completion
   - Track daily metrics during rollout

2. **Understand risks:**
   - Review Section 9 in [PLAN.md](./PLAN.md)
   - Highest risk: Phase 3 (Stripe webhook)
   - Mitigation: Dark launch with feature flag

3. **Plan resources:**
   - 1 senior developer (full-time, 6-7 days)
   - 1 QA engineer (part-time, testing)
   - 1 DBA (1 hour, schema migration)
   - On-call engineer (first 7 days after deployment)

---

## 🔍 Key Decisions Made

### Schema Design
- **Decision:** Add `event_registration_id` to `payments` table (polymorphic FK)
- **Rationale:** Enables tracking event payments in V2 payments table
- **Alternative Considered:** Rename `donation_id` → `entity_id` (breaking change, rejected)

### State Machine
- **Decision:** Events use `unpaid → paid/review/failed` (different from donations)
- **Rationale:** Events already use these status values, changing would break existing code
- **Note:** `'review'` status already in CHECK constraint (migration 056)

### Provider Fields
- **Decision:** Write to BOTH generic (`provider_session_ref`) AND specific (`stripe_session_id`) fields
- **Rationale:** Maintains backward compatibility with V1 queries
- **Trade-off:** Slight data duplication, but safer migration path

### Dark Launch
- **Decision:** Deploy Stripe webhook with feature flag (V2 off by default)
- **Rationale:** Allows safe testing in production before full rollout
- **Alternative Considered:** Shadow mode (run both V1 and V2, use V1 result)

### Admin Actions
- **Decision:** Only increment sold_count if `payment_status !== 'paid'`
- **Rationale:** Prevents double-increment when admin + webhook race
- **Impact:** Low risk, easy rollback

---

## 📚 Technical Details

### Files Modified

| File | Lines Changed | Risk | Phase |
|------|---------------|------|-------|
| `scripts/db/migrations/057b-extend-payments-for-registrations.sql` | +150 | Low | 0 |
| `lib/payments/core/types.ts` | +30 | Low | 1 |
| `lib/payments/core/PaymentService.ts` | +200 | Medium | 1 |
| `lib/actions/events-module/event-registration.ts` | +5 | Low | 2 |
| `app/api/webhooks/stripe/route.ts` | -200, +50 | **High** | 3 |
| `app/api/payments/esewa/success/event-handler.ts` | -315, +80 | Medium | 4 |
| `app/api/payments/khalti/verify/route.ts` | +80 | Medium | 5 |

**Total:** ~600 lines added, ~515 lines removed = **+85 net lines**  
**Code Reduction:** 75% (duplicated V1 logic → centralized V2)

### Tables Modified

| Table | Change | Migration |
|-------|--------|-----------|
| `event_registrations` | ✅ Already has `'review'` in CHECK | 056 (done) |
| `payment_events` | ✅ Already has `event_registration_id` | 056 (done) |
| `payments` | ⚠️ Add `event_registration_id` + `entity_type` | 057 (pending) |

### Endpoints Affected

| Endpoint | Change | Impact |
|----------|--------|--------|
| `POST /api/webhooks/stripe` | Modified | Event payment confirmation |
| `POST /api/payments/esewa/success` | Modified | Event payment callback |
| `POST /api/payments/khalti/verify` | Modified | Event payment verification |
| Admin actions | Modified | Manual event confirmation |

---

## ⚠️ Risks & Mitigations

### Top Risks

1. **Stripe webhook regression** (High Impact, Medium Likelihood)
   - **Mitigation:** Dark launch with feature flag, shadow mode testing
   - **Rollback:** Set `FEATURE_FLAG_V2_EVENTS=false` (instant)

2. **sold_count double-increment** (Medium Impact, Medium Likelihood)
   - **Mitigation:** Fixed in Phase 2 (admin action conditional)
   - **Rollback:** Revert admin action file

3. **Donation flow regression** (Critical Impact, Low Likelihood)
   - **Mitigation:** `confirmDonation()` never modified, purely additive changes
   - **Rollback:** Remove `confirmRegistration()` method (no callers)

### Success Criteria

- ✅ Zero regressions in donation flow
- ✅ Zero regressions in conference flow
- ✅ Event payments confirmed via V2
- ✅ sold_count 100% accurate
- ✅ Webhook success rate >99%
- ✅ Email delivery >95%

---

## 📞 Support & Questions

### During Implementation

- **Code questions:** See [PLAN.md](./PLAN.md) Section 4 (detailed implementation)
- **Schema questions:** See [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md) Troubleshooting
- **Testing questions:** See [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) Phase testing sections

### During Rollout

- **Monitor these metrics:** Webhook success rate, sold_count accuracy, email delivery
- **Alert thresholds:** >5 webhook errors/hour, any sold_count mismatch
- **Rollback triggers:** Webhook success <95%, user-reported payment issues

### Post-Rollout

- **First 7 days:** Daily monitoring (see IMPLEMENTATION-CHECKLIST.md)
- **After 7 days:** Full sign-off, cleanup Phase 6 (optional)

---

## 🎉 Success State

After successful implementation:

### What Works
- ✅ Event registrations use V2 PaymentService (secure, centralized)
- ✅ Donations continue using V2 PaymentService (no changes)
- ✅ 3-layer idempotency prevents duplicate payments
- ✅ CAS lock prevents race conditions
- ✅ State machine enforces valid transitions
- ✅ sold_count is always accurate
- ✅ All errors are logged and monitored

### What's Next
- 🔜 Conference registrations V2 migration (future work)
- 🔜 Job queue for receipts and emails (Phase 4+)
- 🔜 Admin dashboard for payment review status
- 🔜 sold_count audit UI

---

## 📝 Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-27 | Initial plan (Rev 1) | Technical Team |
| 2.0 | 2025-01-27 | Updated after code review | Technical Team |
| 2.1 | 2025-01-27 | Schema fix identified (migration 056 already ran) | Technical Team |

---

**Current Status:** 🟡 **Ready for Implementation**  
**Next Action:** Run migration 057, then start Phase 1  
**Estimated Completion:** 6-7 days from start
