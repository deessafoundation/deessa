---
title: "Event Payment Integration â€” Architecture"
description: "Documentation for event payment integration â€” architecture"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Architecture

## System Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          CLIENT (Browser)                               â”‚
â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Registration â”‚  â”‚   Payment    â”‚  â”‚   Pending    â”‚  â”‚  Payment   â”‚  â”‚
â”‚  â”‚    Form      â”‚  â”‚   Options    â”‚  â”‚   Payment    â”‚  â”‚  Success   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚              â”‚  â”‚            â”‚  â”‚
â”‚  â”‚ POST         â”‚  â”‚ redirect     â”‚  â”‚ POST         â”‚  â”‚ polling    â”‚  â”‚
â”‚  â”‚ /register    â”‚  â”‚ to options   â”‚  â”‚ /start-      â”‚  â”‚ GET        â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   payment    â”‚  â”‚ /status    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                              â”‚                          â”‚
â”‚                                              â–¼                          â”‚
â”‚                                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                  â”‚
â”‚                                    â”‚  Provider       â”‚                  â”‚
â”‚                                    â”‚  Checkout       â”‚                  â”‚
â”‚                                    â”‚  (Stripe/Khalti â”‚                  â”‚
â”‚                                    â”‚   /eSewa)       â”‚                  â”‚
â”‚                                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜                  â”‚
â”‚                                              â”‚ redirect back            â”‚
â”‚                                              â–¼                          â”‚
â”‚                                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                  â”‚
â”‚                                    â”‚ Payment Success â”‚                  â”‚
â”‚                                    â”‚ + Verification  â”‚                  â”‚
â”‚                                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                                â”‚
         â”‚ HTTP                           â”‚ HTTP
         â–¼                                â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        NEXT.JS API ROUTES                               â”‚
â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Event Payment Endpoints                                        â”‚   â”‚
â”‚  â”‚                                                                  â”‚   â”‚
â”‚  â”‚  POST /api/events/start-payment        (rate: 10/min/IP)        â”‚   â”‚
â”‚  â”‚  POST /api/events/confirm-stripe-session (rate: 20/min/IP)      â”‚   â”‚
â”‚  â”‚  GET  /api/events/status?rid=          (rate: 60/min/IP)        â”‚   â”‚
â”‚  â”‚  POST /api/events/verify-registration  (rate: 60/min/IP)        â”‚   â”‚
â”‚  â”‚  POST /api/events/resend-payment-link  (rate: 5/min/IP)         â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Provider Callbacks / Webhooks                                  â”‚   â”‚
â”‚  â”‚                                                                  â”‚   â”‚
â”‚  â”‚  POST /api/webhooks/stripe              (no rate limit)          â”‚   â”‚
â”‚  â”‚  POST /api/payments/khalti/verify       (rate: 10/min/IP)       â”‚   â”‚
â”‚  â”‚  GET  /api/payments/esewa/success       (rate: 20/min/IP)       â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Server Actions (lib/actions/events-module/)                     â”‚   â”‚
â”‚  â”‚                                                                  â”‚   â”‚
â”‚  â”‚  registerForEvent()           â€” Create registration              â”‚   â”‚
â”‚  â”‚  startEventPayment()          â€” Initiate provider session        â”‚   â”‚
â”‚  â”‚  getEventRegistrationStatus() â€” Read-only status                 â”‚   â”‚
â”‚  â”‚  confirmEventRegistration()   â€” Mark as paid                     â”‚   â”‚
â”‚  â”‚  cancelEventRegistration()    â€” Cancel + decrement sold_count    â”‚   â”‚
â”‚  â”‚  markEventPaymentManual()     â€” Admin manual confirmation        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                                â”‚
         â”‚ Service Role                   â”‚ Service Role
         â–¼                                â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚    Supabase DB       â”‚    â”‚         Payment Providers                   â”‚
â”‚                      â”‚    â”‚                                             â”‚
â”‚  event_registrations â”‚    â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  event_ticket_types  â”‚    â”‚  â”‚ Stripe  â”‚ â”‚ Khalti  â”‚ â”‚ eSewa   â”‚      â”‚
â”‚  payment_events      â”‚    â”‚  â”‚ API     â”‚ â”‚ API     â”‚ â”‚ API     â”‚      â”‚
â”‚  events              â”‚    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚  rate_limits         â”‚    â”‚                                             â”‚
â”‚  event_email_templatesâ”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Data Flow: Stripe Payment

```
Browser                    Next.js API                 Stripe              Supabase
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  POST /start-payment      â”‚                          â”‚                    â”‚
  â”‚  {rid, email, "stripe"}   â”‚                          â”‚                    â”‚
  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                          â”‚                    â”‚
  â”‚                           â”‚  checkout.sessions.create â”‚                    â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                    â”‚
  â”‚                           â”‚  { session_id, url }     â”‚                    â”‚
  â”‚                           â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                    â”‚
  â”‚  { redirectUrl, sessionId}â”‚                          â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  redirect to Stripe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>  â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  user completes payment   â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  redirect back â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>   â”‚                    â”‚
  â”‚  ?rid=xxx&session_id=yyy  â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  POST /confirm-stripe     â”‚                          â”‚                    â”‚
  â”‚  {rid, sessionId}         â”‚                          â”‚                    â”‚
  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚  sessions.retrieve        â”‚                    â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                    â”‚
  â”‚                           â”‚  {status, amount, ...}   â”‚                    â”‚
  â”‚                           â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                    â”‚
  â”‚                           â”‚  UPDATE SET status=confirmed               â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚
  â”‚  {ok: true, status: confirmed}                        â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚                           â”‚  POST /webhooks/stripe (async, seconds later)â”‚
  â”‚                           â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
  â”‚                           â”‚  idempotent check â†’ skip (already confirmed) â”‚
  â”‚                           â”‚  { received: true }      â”‚                    â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                    â”‚
```

## Data Flow: Khalti Payment

```
Browser                    Next.js API                 Khalti              Supabase
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  POST /start-payment      â”‚                          â”‚                    â”‚
  â”‚  {rid, email, "khalti"}   â”‚                          â”‚                    â”‚
  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                          â”‚                    â”‚
  â”‚                           â”‚  POST /epayment/initiate  â”‚                    â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                    â”‚
  â”‚                           â”‚  { payment_url, pidx }   â”‚                    â”‚
  â”‚                           â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                    â”‚
  â”‚  { redirectUrl, pidx }    â”‚                          â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  redirect to Khalti â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>  â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  user completes payment   â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  redirect back â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>   â”‚                    â”‚
  â”‚  ?pidx=xxx                â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  POST /payments/khalti/verify                         â”‚                    â”‚
  â”‚  {pidx}                   â”‚                          â”‚                    â”‚
  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚  POST /epayment/lookup    â”‚                    â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                    â”‚
  â”‚                           â”‚  {status, amount, ...}   â”‚                    â”‚
  â”‚                           â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                    â”‚
  â”‚                           â”‚  UPDATE SET status=confirmed               â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚
  â”‚  {ok: true, status: "completed"}                     â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
```

## Data Flow: eSewa Payment

```
Browser                    Next.js API                 eSewa               Supabase
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  POST /start-payment      â”‚                          â”‚                    â”‚
  â”‚  {rid, email, "esewa"}    â”‚                          â”‚                    â”‚
  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                          â”‚                    â”‚
  â”‚                           â”‚  generate HMAC signature  â”‚                    â”‚
  â”‚                           â”‚  build form data          â”‚                    â”‚
  â”‚  {redirectUrl, formData,  â”‚                          â”‚                    â”‚
  â”‚   requiresFormSubmit:true}â”‚                          â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  browser auto-submits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>   â”‚                    â”‚
  â”‚  form POST to eSewa       â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  user completes payment   â”‚                          â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚  eSewa redirects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>   â”‚                    â”‚
  â”‚  GET /esewa/success?data=base64encoded               â”‚                    â”‚
  â”‚                           â”‚                          â”‚                    â”‚
  â”‚                           â”‚  decode base64            â”‚                    â”‚
  â”‚                           â”‚  verify HMAC signature    â”‚                    â”‚
  â”‚                           â”‚  verify amount            â”‚                    â”‚
  â”‚                           â”‚  UPDATE SET status=confirmed               â”‚
  â”‚                           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚
  â”‚  redirect to /payment-success?rid=xxx&paid=1         â”‚                    â”‚
  â”‚ <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚                    â”‚
```

## Dual-Path Confirmation Strategy

The system uses a **dual-path confirmation** strategy to ensure reliability:

### Path 1: Client-Side Verification (Immediate)
- Triggered when the user is redirected back from the provider
- Calls `/api/events/confirm-stripe-session` (Stripe) or handled by eSewa callback
- Verifies the session directly with the provider API
- Confirms the registration immediately (within seconds)
- User sees confirmation right away

### Path 2: Server-Side Webhook (Reliable)
- Triggered by the provider's server-to-server notification
- Calls `/api/webhooks/stripe` (Stripe) or `/api/payments/khalti/verify` (Khalti)
- Processes the event asynchronously (may arrive seconds or minutes later)
- **Idempotent**: If Path 1 already confirmed, the webhook is a no-op
- Acts as a safety net if Path 1 fails (user closes browser, network error, etc.)

### Why Both?

| Scenario | Path 1 | Path 2 | Result |
|----------|--------|--------|--------|
| Normal flow | Confirms | Arrives later, idempotent skip | Confirmed |
| User closes browser before redirect | Fails | Confirms | Confirmed |
| Network error on redirect | Fails | Confirms | Confirmed |
| Webhook arrives before redirect | â€” | Confirms | Confirmed |
| Both arrive simultaneously | Both try UPDATE | One wins, other sees already confirmed | Confirmed |

## Concurrency Control

### Optimistic Lock: Double-Payment Prevention
```sql
UPDATE event_registrations
SET payment_initiated_at = NOW()
WHERE id = $1
  AND payment_status = 'unpaid'
  AND payment_initiated_at IS NULL
```
Only the first request to reach this UPDATE will affect a row. Concurrent requests see 0 rows affected and receive "Payment is already being processed."

### Optimistic Lock: sold_count Oversell Prevention
```sql
UPDATE event_ticket_types
SET sold_count = sold_count + 1
WHERE id = $1
  AND sold_count = $expected_count  -- read at application level
```
If two concurrent registrations both read `sold_count = 99` (capacity = 100), only one UPDATE will match. The other detects zero-row update and rolls back the registration.

### Webhook Race Protection
```sql
UPDATE event_registrations
SET status = 'confirmed', payment_status = 'paid', ...
WHERE id = $1
  AND status NOT IN ('cancelled', 'expired')
```
Prevents the webhook/confirm endpoint from overwriting a cancellation that occurred during the verification window.
