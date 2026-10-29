# Payment security baseline report

Status: prepared, not yet executed against Supabase.

This report is the first safe implementation artifact for Phase A. It records
the database state that must be known before changing payment behavior,
removing retired conference infrastructure, or resetting sandbox data.

## How to collect the baseline

1. Open the intended Supabase project's SQL Editor.
2. Run [`payment-security-baseline.sql`](../../../scripts/db/diagnostics/payment-security-baseline.sql).
3. Save the result in the project’s restricted engineering records. Do not add
   donor rows, payment references, storage object paths, secrets, or webhook
   payloads to this repository.
4. Fill in the checklist below with a summary of the metadata only.

The script contains only `SELECT` statements. It neither changes data nor
enables or disables payment providers.

## Required findings

| Check | Expected decision | Result |
|---|---|---|
| Deployed migration history | Identify drift from repository migration order. | Pending |
| Financial-table RLS and policies | Public roles have no broad donor/payment read or mutation access. | Pending |
| Table/function grants | Privileged RPCs are not executable by public roles unless intentionally safe. | Pending |
| Payment owner constraints | Payments can belong to supported donation/event entities; no active conference dependency remains before retirement. | Pending |
| Receipt contract | One authoritative receipt metadata path and compatible receipt-number return type. | Pending |
| Storage | `bank-transfer-proofs` and `receipts` remain private with scoped policies. | Pending |
| Sandbox reset scope | Map only donation/event test rows and dependent files; preserve event definitions, templates, settings, admins, and unrelated data. | Pending |

## Decisions after evidence

- Database/environment inspected:
- Date and operator:
- Differences from repository schema:
- Conference dependencies still in use:
- Safe reset manifest required before T08:
- Blockers for T02–T05:

Do not treat a clean metadata report as proof that callbacks, authorization, or
payment processing are secure. Those paths are addressed in the next slices.
