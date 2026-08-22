---
title: "Event Payment Integration â€” Database Schema"
description: "Core table for event registrations. Payment-related columns are documented here."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Database Schema

## Tables

### `event_registrations`

Core table for event registrations. Payment-related columns are documented here.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK | Registration identifier |
| `event_id` | `UUID` | â€” | FK â†’ `events(id)` | Event reference |
| `full_name` | `TEXT` | â€” | NOT NULL | Registrant full name |
| `email` | `TEXT` | â€” | NOT NULL | Registrant email |
| `phone` | `TEXT` | `NULL` | | Phone number |
| `organization` | `TEXT` | `NULL` | | Organization name |
| `custom_fields` | `JSONB` | `'{}'` | | Dynamic form data |
| `form_schema_version` | `INT` | `NULL` | | Version of form schema used |
| `ticket_type_id` | `UUID` | `NULL` | FK â†’ `event_ticket_types(id)` | Ticket type selected |
| `status` | `TEXT` | `'pending'` | CHECK: `pending`, `confirmed`, `cancelled`, `expired` | Registration status |
| `payment_status` | `TEXT` | `'unpaid'` | CHECK: `unpaid`, `paid`, `refunded`, `failed`, `review` | Payment status |
| `payment_amount` | `DECIMAL` | `NULL` | | Amount due |
| `payment_currency` | `TEXT` | `NULL` | | Currency code |
| `payment_provider` | `TEXT` | `NULL` | | `stripe`, `khalti`, or `esewa` |
| `payment_id` | `TEXT` | `NULL` | | Provider's payment identifier |
| `provider_session_ref` | `TEXT` | `NULL` | | Generic session reference |
| `stripe_session_id` | `TEXT` | `NULL` | UNIQUE | Stripe checkout session ID |
| `khalti_pidx` | `TEXT` | `NULL` | UNIQUE | Khalti payment identifier |
| `esewa_transaction_uuid` | `TEXT` | `NULL` | UNIQUE | eSewa transaction UUID |
| `payment_initiated_at` | `TIMESTAMPTZ` | `NULL` | | When payment was started |
| `payment_paid_at` | `TIMESTAMPTZ` | `NULL` | | When payment completed |
| `payment_failed_at` | `TIMESTAMPTZ` | `NULL` | | When payment failed |
| `payment_review_at` | `TIMESTAMPTZ` | `NULL` | | When flagged for review |
| `payment_override_by` | `TEXT` | `NULL` | | Admin who manually confirmed |
| `consent_terms` | `BOOLEAN` | `false` | NOT NULL | Terms acceptance |
| `consent_marketing` | `BOOLEAN` | `false` | NOT NULL | Marketing consent |
| `expires_at` | `TIMESTAMPTZ` | `NULL` | | Payment window expiry |
| `checked_in_at` | `TIMESTAMPTZ` | `NULL` | | Check-in timestamp |
| `checked_in_by` | `TEXT` | `NULL` | | Who checked in |
| `registration_source` | `TEXT` | `NULL` | | `admin`, `public`, `import` |
| `admin_notes` | `TEXT` | `NULL` | | Admin notes |
| `confirmed_at` | `TIMESTAMPTZ` | `NULL` | | Confirmation timestamp |
| `cancelled_at` | `TIMESTAMPTZ` | `NULL` | | Cancellation timestamp |
| `confirmed_by` | `TEXT` | `NULL` | | Who confirmed |
| `cancelled_by` | `TEXT` | `NULL` | | Who cancelled |
| `last_registration_email_sent_at` | `TIMESTAMPTZ` | `NULL` | | Email tracking |
| `last_confirmation_email_sent_at` | `TIMESTAMPTZ` | `NULL` | | Email tracking |
| `last_cancellation_email_sent_at` | `TIMESTAMPTZ` | `NULL` | | Email tracking |
| `last_custom_email_sent_at` | `TIMESTAMPTZ` | `NULL` | | Email tracking |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL | Last update timestamp |

#### Indexes (Migration 056)

```sql
-- Fast webhook lookups
CREATE INDEX idx_event_reg_stripe_session
  ON event_registrations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX idx_event_reg_khalti_pidx
  ON event_registrations (khalti_pidx)
  WHERE khalti_pidx IS NOT NULL;

CREATE INDEX idx_event_reg_esewa_uuid
  ON event_registrations (esewa_transaction_uuid)
  WHERE esewa_transaction_uuid IS NOT NULL;

-- Expiry scan
CREATE INDEX idx_event_reg_expires
  ON event_registrations (expires_at)
  WHERE status IN ('pending') AND payment_status = 'unpaid';
```

---

### `event_ticket_types`

Ticket types for events.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK | Ticket type ID |
| `event_id` | `UUID` | â€” | FK â†’ `events(id)` ON DELETE CASCADE | Event reference |
| `name` | `TEXT` | â€” | NOT NULL | e.g. "Early Bird", "Student" |
| `price` | `DECIMAL` | `0` | NOT NULL | Price per ticket |
| `currency` | `TEXT` | `'NPR'` | NOT NULL | Currency code |
| `capacity` | `INT` | `NULL` | | NULL = unlimited |
| `sold_count` | `INT` | `0` | NOT NULL | Tickets sold (atomic counter) |
| `sales_start` | `TIMESTAMPTZ` | `NULL` | | Sales window open |
| `sales_end` | `TIMESTAMPTZ` | `NULL` | | Sales window close |
| `is_active` | `BOOLEAN` | `true` | NOT NULL | Active flag |
| `sort_order` | `INT` | `0` | NOT NULL | Display order |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL | Creation timestamp |

#### Indexes

```sql
CREATE INDEX idx_event_ticket_event
  ON event_ticket_types (event_id, is_active);
```

---

### `payment_events`

Audit trail for payment events. Links to donations, conference registrations, and event registrations.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `UUID` | `gen_random_uuid()` | PK | Event ID |
| `provider` | `TEXT` | â€” | NOT NULL | `stripe`, `khalti`, `esewa` |
| `event_id` | `TEXT` | â€” | NOT NULL | Provider's session/event ID |
| `donation_id` | `UUID` | `NULL` | FK â†’ `donations(id)` ON DELETE CASCADE | Donation link |
| `conference_registration_id` | `UUID` | `NULL` | FK â†’ `conference_registrations(id)` ON DELETE SET NULL | Conference link |
| `event_registration_id` | `UUID` | `NULL` | FK â†’ `event_registrations(id)` ON DELETE SET NULL | Event link |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | NOT NULL | Creation timestamp |

#### Constraints

```sql
-- Prevent duplicate provider events
UNIQUE (provider, event_id)

-- Fast event registration lookups
CREATE INDEX idx_payment_events_event_reg
  ON payment_events (event_registration_id)
  WHERE event_registration_id IS NOT NULL;
```

---

### `event_email_templates`

Email templates for event communications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` | PK |
| `event_id` | `UUID` | FK â†’ `events(id)` |
| `template_type` | `TEXT` | `confirmation`, `payment_receipt`, `reminder`, `cancellation`, `custom` |
| `subject` | `TEXT` | Email subject (supports `{{variable}}` interpolation) |
| `body_html` | `TEXT` | HTML body (supports `{{variable}}` interpolation) |
| `is_active` | `BOOLEAN` | Whether this template is in use |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp |

#### Template Variables

| Variable | Description |
|----------|-------------|
| `{{full_name}}` | Registrant's full name (HTML-escaped in body) |
| `{{email}}` | Registrant's email |
| `{{event_title}}` | Event title |
| `{{registration_id}}` | Registration UUID |
| `{{payment_link}}` | Full URL to pending-payment page |
| `{{site_url}}` | Site base URL |

---

### `rate_limits`

Distributed rate limiting table.

| Column | Type | Description |
|--------|------|-------------|
| `identifier` | `TEXT` | PK â€” composite key (e.g., `event-start-payment:ip:192.168.1.1`) |
| `attempts` | `INT` | Request count in current window |
| `expires_at` | `TIMESTAMPTZ` | Window expiry timestamp |

---

### `events` (payment-relevant columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` | PK |
| `title` | `TEXT` | Event title |
| `slug` | `TEXT` | URL slug |
| `is_free` | `BOOLEAN` | Whether event is free |
| `status` | `TEXT` | `draft`, `published`, `cancelled`, `completed` |

---

## View: `event_registrations_with_event`

Recreated by migration 056. Joins `event_registrations` with `events` for admin dashboards.

```sql
CREATE OR REPLACE VIEW event_registrations_with_event AS
SELECT
  r.*,
  e.title AS event_title,
  e.slug AS event_slug,
  e.event_date,
  e.event_time,
  e.location,
  e.is_free,
  e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;
```

---

## Migration Reference

| Migration | Description |
|-----------|-------------|
| `050-events-module-schema.sql` | Base events module tables |
| `051-event-registration-enhancements.sql` | Added `ticket_type_id`, `payment_initiated_at`, `payment_paid_at`, etc. |
| `053-ticket-sold-count.sql` | Added `sold_count` to `event_ticket_types` |
| `056-event-payment-integration.sql` | Added `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid`, `review` status, `payment_events.event_registration_id` |
