# Events Registration Detail Page — Implementation Plan (Full Scope)

## Goal
Create a detailed registration page at `/admin/events/[id]` that matches AND exceeds the conference detail page.

---

## Phase 1: Database Migration
**File:** `scripts/051-event-registration-enhancements.sql`

### 1A. Add columns to `event_registrations`
```sql
-- Conference parity columns
ALTER TABLE event_registrations
  ADD COLUMN admin_notes TEXT,
  ADD COLUMN organization TEXT,
  ADD COLUMN confirmed_at TIMESTAMPTZ,
  ADD COLUMN cancelled_at TIMESTAMPTZ,
  ADD COLUMN payment_initiated_at TIMESTAMPTZ,
  ADD COLUMN payment_paid_at TIMESTAMPTZ,
  ADD COLUMN payment_failed_at TIMESTAMPTZ,
  ADD COLUMN payment_review_at TIMESTAMPTZ,
  ADD COLUMN payment_override_by TEXT,
  ADD COLUMN last_registration_email_sent_at TIMESTAMPTZ,
  ADD COLUMN last_confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN last_cancellation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN last_custom_email_sent_at TIMESTAMPTZ;

-- NEW: Check-in tracking
ALTER TABLE event_registrations
  ADD COLUMN checked_in_at TIMESTAMPTZ,
  ADD COLUMN checked_in_by TEXT;

-- NEW: Registration source tracking
ALTER TABLE event_registrations
  ADD COLUMN registration_source TEXT; -- 'direct' | 'qr' | 'social' | 'email' | 'admin'

-- NEW: Ticket type reference
ALTER TABLE event_registrations
  ADD COLUMN ticket_type_id UUID REFERENCES event_ticket_types(id);
```

### 1B. Create `event_registration_emails` table (Communication Log)
```sql
CREATE TABLE event_registration_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  template_type TEXT, -- 'confirmation' | 'payment_receipt' | 'reminder' | 'cancellation' | 'custom'
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  sent_to TEXT NOT NULL,
  sent_by TEXT, -- admin user ID or 'system'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_reg_emails_reg ON event_registration_emails(registration_id);
CREATE INDEX idx_event_reg_emails_event ON event_registration_emails(event_id);
```

### 1C. Add indexes
```sql
CREATE INDEX idx_event_reg_checked_in ON event_registrations(checked_in_at);
CREATE INDEX idx_event_reg_ticket_type ON event_registrations(ticket_type_id);
```

---

## Phase 2: Update TypeScript Types
**File:** `lib/types/events-module.ts`

Add to `EventRegistration`:
```typescript
// Admin
admin_notes: string | null;
organization: string | null;

// Status timestamps
confirmed_at: string | null;
cancelled_at: string | null;

// Payment timestamps
payment_initiated_at: string | null;
payment_paid_at: string | null;
payment_failed_at: string | null;
payment_review_at: string | null;
payment_override_by: string | null;

// Email timestamps
last_registration_email_sent_at: string | null;
last_confirmation_email_sent_at: string | null;
last_cancellation_email_sent_at: string | null;
last_custom_email_sent_at: string | null;

// NEW: Check-in
checked_in_at: string | null;
checked_in_by: string | null;

// NEW: Source
registration_source: string | null;

// NEW: Ticket type
ticket_type_id: string | null;
```

Add new interface:
```typescript
export interface EventRegistrationEmail {
  id: string;
  registration_id: string;
  event_id: string;
  template_type: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  sent_to: string;
  sent_by: string | null;
  created_at: string;
}
```

---

## Phase 3: Server Actions
**File:** `lib/actions/events-module/event-registration-actions.ts`

### Status Management
1. `confirmEventRegistration(id)` — status=confirmed, confirmed_at=now
2. `cancelEventRegistration(id)` — status=cancelled, cancelled_at=now
3. `markEventPaymentManual(id, adminId)` — payment_status=paid, payment_override_by=adminId, payment_paid_at=now
4. `extendEventRegistrationExpiry(id, hours)` — extends expires_at
5. `checkInRegistration(id, adminId)` — checked_in_at=now, checked_in_by=adminId
6. `undoCheckIn(id)` — checked_in_at=null, checked_in_by=null

### Notes & Delete
7. `updateEventRegistrationNotes(id, notes)` — update admin_notes
8. `deleteEventRegistration(id)` — delete with guard

### Email Actions
9. `sendEventRegistrationEmail(id, templateType, customSubject?, customBody?)` — Send email, log to event_registration_emails, update last_*_email_sent_at
10. `resendEventRegistrationEmail(id, emailType)` — Resend specific email type

### Bulk Actions
11. `bulkConfirmRegistrations(ids[])` — Confirm multiple
12. `bulkCancelRegistrations(ids[])` — Cancel multiple
13. `bulkSendEmail(ids[], templateType)` — Send email to multiple

---

## Phase 4: Components

### 4A. Shared/Adapted (reuse from conference)
- `DetailRow` — Extract to `components/ui/detail-row.tsx`
- `StatusBadge` — Adapt for event statuses
- `PaymentBadge` — Adapt for event payment statuses

### 4B. New Components
| Component | File | Description |
|-----------|------|-------------|
| `EventRegistrationDetail` | `components/events/admin/EventRegistrationDetail.tsx` | Main detail layout |
| `EventStatusActions` | `components/events/admin/EventStatusActions.tsx` | Confirm/Cancel/Mark Paid/Extend |
| `EventCheckInButton` | `components/events/admin/EventCheckInButton.tsx` | Check-in/Undo check-in |
| `EventRegistrationNotes` | `components/events/admin/EventRegistrationNotes.tsx` | Admin notes editor |
| `EventRegistrationEmailActions` | `components/events/admin/EventRegistrationEmailActions.tsx` | Send template/custom email |
| `EventDeleteRegistrationButton` | `components/events/admin/EventDeleteRegistrationButton.tsx` | Delete with confirmation |
| `EventCommunicationLog` | `components/events/admin/EventCommunicationLog.tsx` | Email history table |
| `BulkRegistrationActions` | `components/events/admin/BulkRegistrationActions.tsx` | Select + bulk confirm/cancel/email |

---

## Phase 5: Detail Page
**File:** `app/admin/events/[id]/registrations/[registrationId]/page.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb: ← Registrations / EVT-ABC123                     │
├──────────────────────────────────────────────────────────────┤
│ Header Card: [Avatar] Name, Email, ShortID                   │
│              Status badge, Check-in badge, Source badge       │
│              Registered date + admin notes preview           │
├──────────────────────────────────────────────────────────────┤
│ Registration Context (blue card): Event + Form Version       │
├─────────────────────────────────┬────────────────────────────┤
│ LEFT COLUMN (2/3)               │ RIGHT COLUMN (1/3)         │
│                                 │                            │
│ Personal Details Card           │ Check-in Card              │
│   - Full Name                   │   - Check-in button        │
│   - Email                       │   - Check-in time          │
│   - Phone                       │   - Check-in by            │
│   - Organization                │                            │
│                                 │ Manage Registration Card   │
│ Custom Fields Card              │   - Status badge           │
│   - Dynamic from schema         │   - Confirm/Cancel         │
│   - With proper labels          │   - Mark Paid              │
│                                 │   - Resend Link            │
│ Ticket Info Card                │   - Extend Expiry          │
│   - Ticket type name            │   - Delete                 │
│   - Price paid                  │                            │
│   - Capacity info               │ Payment Info Card          │
│                                 │   - Status, Amount         │
│ Activity Timeline Card          │   - Provider, ID           │
│   - Registration submitted      │   - Expiry                 │
│   - Email sent                  │                            │
│   - Payment events              │ Event Info Card            │
│   - Status changes              │   - Date, Venue            │
│   - Check-in event              │   - Countdown              │
│                                 │                            │
│ Communication Log Card          │ Quick Actions Card         │
│   - All emails sent             │   - Copy registration ID   │
│   - Subject, timestamp          │   - View public page       │
│   - Resend button               │   - Send email (template)  │
│                                 │                            │
│                                 │ Admin Notes Card           │
│                                 │   - Editable textarea      │
│                                 │   - Save button            │
└─────────────────────────────────┴────────────────────────────┘
```

---

## Phase 6: Bulk Actions on Table
**File:** `components/events/admin/RegistrationsTable.tsx`

Add:
- Checkbox column for multi-select
- Bulk action bar (appears when items selected): Confirm All, Cancel All, Send Email, Export Selected
- Click row → navigate to detail page (keep existing double-click behavior)

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `scripts/051-event-registration-enhancements.sql` | CREATE |
| 2 | `lib/types/events-module.ts` | MODIFY |
| 3 | `lib/actions/events-module/event-registration-actions.ts` | CREATE |
| 4 | `components/ui/detail-row.tsx` | CREATE (shared) |
| 5 | `components/events/admin/EventRegistrationDetail.tsx` | CREATE |
| 6 | `components/events/admin/EventStatusActions.tsx` | CREATE |
| 7 | `components/events/admin/EventCheckInButton.tsx` | CREATE |
| 8 | `components/events/admin/EventRegistrationNotes.tsx` | CREATE |
| 9 | `components/events/admin/EventRegistrationEmailActions.tsx` | CREATE |
| 10 | `components/events/admin/EventDeleteRegistrationButton.tsx` | CREATE |
| 11 | `components/events/admin/EventCommunicationLog.tsx` | CREATE |
| 12 | `components/events/admin/BulkRegistrationActions.tsx` | CREATE |
| 13 | `app/admin/events/[id]/registrations/[registrationId]/page.tsx` | CREATE |
| 14 | `components/events/admin/RegistrationsTable.tsx` | MODIFY |
| 15 | `app/admin/events/[id]/page.tsx` | MODIFY (link to detail) |

---

## Estimated Effort
- Phase 1 (Migration): 20 min
- Phase 2 (Types): 10 min
- Phase 3 (Server Actions): 60 min
- Phase 4 (Components): 90 min
- Phase 5 (Detail Page): 45 min
- Phase 6 (Bulk Actions): 30 min
- **Total: ~4 hours**
