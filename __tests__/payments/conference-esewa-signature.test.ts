/**
 * Regression tests for the eSewa CONFERENCE signature hardening (audit fix 1.3).
 *
 * Mirrors the donation-path hardening (1.2): verification must use a hardcoded
 * field list, never the caller-supplied signed_field_names, and a tampered
 * amount must fail. Covers the exact "tampered-amount conference payment" case
 * called out in the fix prompt's process section.
 */

import { describe, it, expect } from '@jest/globals'
import crypto from 'crypto'
import { verifyEsewaSignature } from '@/app/api/payments/esewa/success/conference-handler'

const SECRET = '8gBm/:&EnhH.1/q' // eSewa public sandbox key (documented)
const MERCHANT = 'EPAYTEST'

function sign(fields: { total_amount: string; transaction_uuid: string; product_code: string }): string {
  const message = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`
  return crypto.createHmac('sha256', SECRET).update(message).digest('base64')
}

describe('conference eSewa signature hardening (audit 1.3)', () => {
  const base = { total_amount: '500', transaction_uuid: '1700000000-reg-xyz', product_code: MERCHANT }

  it('accepts a correctly signed conference callback', () => {
    const payload = { ...base, status: 'COMPLETE', transaction_code: 'TXN1' }
    const res = verifyEsewaSignature(payload, 'total_amount,transaction_uuid,product_code', sign(base), SECRET)
    expect(res.valid).toBe(true)
  })

  it('ignores caller-supplied signed_field_names (uses hardcoded list)', () => {
    // signed_field_names lies, but signature is valid over the 3 real fields.
    const payload = { ...base, status: 'COMPLETE', transaction_code: 'TXN1' }
    const res = verifyEsewaSignature(payload, 'total_amount', sign(base), SECRET)
    expect(res.valid).toBe(true)
  })

  it('rejects a tampered conference amount', () => {
    // Signature was computed for amount=500; payload now claims 5.
    const tampered = { total_amount: '5', transaction_uuid: '1700000000-reg-xyz', product_code: MERCHANT, status: 'COMPLETE' }
    const res = verifyEsewaSignature(tampered, 'total_amount,transaction_uuid,product_code', sign(base), SECRET)
    expect(res.valid).toBe(false)
  })

  it('rejects a missing signature', () => {
    const payload = { ...base, status: 'COMPLETE' }
    const res = verifyEsewaSignature(payload, 'total_amount,transaction_uuid,product_code', undefined, SECRET)
    expect(res.valid).toBe(false)
  })
})
