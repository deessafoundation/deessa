---
title: "Receipt System - Google Email Setup - Visual Guide"
description: "Documentation for receipt system - google email setup - visual guide"
owner: "deessa Team"
status: active
category: setup
audience: admin
last_updated: 2026-09-12
---
# Receipt System - Google Email Setup - Visual Guide

## 🎯 Your 4-Step Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: RUN SQL SCRIPT                       │
│                         (5 minutes)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Open: https://app.supabase.com                              │
│  2. Go to: SQL Editor → New Query                               │
│  3. Copy: SQL_SCRIPT_11_COPY_PASTE.md                           │
│  4. Paste into SQL Editor                                       │
│  5. Click: "Run"                                                │
│  6.  Done!                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 2: CONFIGURE GOOGLE EMAIL                  │
│                        (10 minutes)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Enable 2FA: https://myaccount.google.com/security           │
│  2. Generate App Password:                                      │
│     https://myaccount.google.com/apppasswords                   │
│  3. Add to .env.local:                                          │
│     GOOGLE_EMAIL=your-email@gmail.com                           │
│     GOOGLE_APP_PASSWORD=xxxx xxxx xxxx xxxx                     │
│  4. Restart: npm run dev                                        │
│  5.  Done!                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            STEP 3: SET ORGANIZATION DETAILS                     │
│                        (10 minutes)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Go to: http://localhost:3000/admin/settings/organization   │
│  2. Fill in all fields:                                         │
│     - Organization name                                         │
│     - Email & Phone                                             │
│     - Address                                                   │
│     - Tax numbers (VAT, PAN, SWC)                               │
│     - Logo URL                                                  │
│     - Receipt settings                                          │
│  3. Click: "Save Organization Details"                         │
│  4.  Done!                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: INTEGRATE WITH WEBHOOKS                    │
│                        (15 minutes)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Add to your payment webhook handlers:                          │
│                                                                   │
│  import { generateReceiptForDonation }                          │
│    from "@/lib/actions/donation-receipt"                       │
│                                                                   │
│  // After payment confirmed                                    │
│  await generateReceiptForDonation({ donationId })              │
│                                                                   │
│  See: docs/RECEIPT_WEBHOOK_INTEGRATION.md                      │
│   Done!                                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    🎉 SETUP COMPLETE! 🎉
```

---

## 📋 File Reference

```
START HERE
    ↓
GOOGLE_EMAIL_SETUP_SUMMARY.md
    ↓
SQL_SCRIPT_11_COPY_PASTE.md ← Copy & Paste SQL
    ↓
docs/GOOGLE_EMAIL_SETUP.md ← Configure Email
    ↓
docs/QUICK_DEPLOYMENT_GOOGLE_EMAIL.md ← Complete Guide
    ↓
docs/RECEIPT_WEBHOOK_INTEGRATION.md ← Webhook Integration
    ↓
docs/RECEIPT_SYSTEM.md ← Full Reference
```

---

## 🔧 Environment Variables

```env
# Add to .env.local

# Google Email (Required)
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Site URL (Optional)
NEXT_PUBLIC_SITE_URL=https://dessafoundation.org
```

---

##  Testing Checklist

```
Database Setup
  ☐ SQL script executed
  ☐ All verification queries passed
  ☐ receipt_audit_log table created
  ☐ receipts storage bucket created

Email Configuration
  ☐ 2FA enabled on Gmail
  ☐ App Password generated
  ☐ Environment variables set
  ☐ Dev server restarted
  ☐ Email configuration test passed

Organization Setup
  ☐ Organization details filled in
  ☐ Settings saved successfully
  ☐ Details display in admin panel

Webhook Integration
  ☐ Receipt generation added to webhooks
  ☐ Code deployed

Testing
  ☐ Test donation made
  ☐ Payment completed
  ☐ Receipt generated
  ☐ Email received
  ☐ Receipt displays on success page
  ☐ Download works
  ☐ Resend email works
  ☐ No errors in logs
```

---

## 🚀 What Happens Next

```
Donor Makes Donation
        ↓
Completes Payment
        ↓
Webhook Triggered
        ↓
Receipt Generated
        ↓
Email Sent (via Google Email)
        ↓
Success Page Shows Receipt
        ↓
Donor Can:
  • Download Receipt
  • Resend Email
  • Copy Link
```

---

## 📊 Receipt Content

```
┌─────────────────────────────────────┐
│         DONATION RECEIPT            │
│                                     │
│  Receipt #: RCP-2024-001           │
│  Date: January 15, 2024            │
│                                     │
│  Organization: Dessa Foundation    │
│  VAT: 610123456789                 │
│  PAN: 610123456                    │
│                                     │
│  Donor: John Doe                   │
│  Email: john@example.com           │
│  Phone: +977-1-XXXXXXX             │
│                                     │
│  Amount: $100.00                   │
│  Type: One-Time Donation           │
│                                     │
│  Tax Deductible: Yes               │
│                                     │
│  [Download] [Resend] [Copy Link]   │
└─────────────────────────────────────┘
```

---

## 🎯 Key Features

```
 Automatic Receipt Generation
   └─ After successful payment

 Google Email Integration
   └─ Via Gmail or Google Workspace

 Professional Receipts
   └─ Organization branding
   └─ Tax compliance info
   └─ Donor details

 Admin Management
   └─ Organization settings
   └─ Audit logging
   └─ Resend emails

 Security
   └─ Row-level security
   └─ Audit trail
   └─ No data exposure
```

---

## 📞 Support

### SQL Issues
→ See: `SQL_SCRIPT_11_COPY_PASTE.md` → "If You See Errors"

### Email Issues
→ See: `docs/GOOGLE_EMAIL_SETUP.md` → "Troubleshooting"

### Setup Issues
→ See: `docs/QUICK_DEPLOYMENT_GOOGLE_EMAIL.md` → "Troubleshooting"

### Webhook Issues
→ See: `docs/RECEIPT_WEBHOOK_INTEGRATION.md`

### General Questions
→ See: `docs/RECEIPT_SYSTEM.md`

---

## ⏱️ Timeline

```
Step 1 (SQL):              5 minutes
Step 2 (Email):           10 minutes
Step 3 (Organization):    10 minutes
Step 4 (Webhooks):        15 minutes
Testing:                  20 minutes
─────────────────────────────────
TOTAL:                    60 minutes
```

---

## 🎉 You're Ready!

Everything is set up and ready to go.

**Start with:** `GOOGLE_EMAIL_SETUP_SUMMARY.md`

Then follow the 4 steps above.

**Questions?** Check the documentation files listed above.

---

**Happy receipting!** 📄✨
