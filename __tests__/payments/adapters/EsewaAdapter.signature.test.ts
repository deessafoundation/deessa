/**
 * Regression tests for the eSewa signature hardening (audit fix 1.2).
 *
 * These lock in the property that HMAC verification is performed against a
 * HARDCODED field list (total_amount, transaction_uuid, product_code), never
 * against the caller-supplied `signed_field_names`. Written because the
 * pre-existing EsewaAdapter test suite is placeholder stubs (`expect(true)`).
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import crypto from 'crypto'
import { createEsewaAdapter } from '@/lib/payments/adapters/EsewaAdapter'

const SECRET = '8gBm/:&EnhH.1/q' // eSewa's public sandbox key (documented, not a real secret)
const MERCHANT = 'EPAYTEST'

/** Sign exactly the three fields eSewa v2 signs, in order. */
function sign(fields: { total_amount: string; transaction_uuid: string; product_code: string }): string {
  const message = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`
  return crypto.createHmac('sha256', SECRET).update(message).digest('base64')
}

/** eSewa's status API returns COMPLETE so verify() can proceed past signature. */
function mockEsewaStatus(overrides: Record<string, unknown> = {}) {
  const body = {
    transaction_code: 'TXN123',
    status: 'COMPLETE',
    total_amount: 100,
    transaction_uuid: '1700000000-donation-abc',
    product_code: MERCHANT,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: 'x',
    ...overrides,
  }
  ;(global.fetch as unknown) = jest.fn(async () =>
    ({ ok: true, status: 200, text: async () => JSON.stringify(body) }) as unknown as Response
  )
}

describe('EsewaAdapter signature hardening (audit 1.2)', () => {
  const realFetch = global.fetch
  beforeEach(() => { mockEsewaStatus() })
  afterEach(() => { global.fetch = realFetch; jest.restoreAllMocks() })

  it('accepts a callback correctly signed over the three eSewa fields', async () => {
    const adapter = createEsewaAdapter({ secretKey: SECRET, merchantId: MERCHANT })
    const base = { total_amount: '100', transaction_uuid: '1700000000-donation-abc', product_code: MERCHANT }
    const payload = { ...base, status: 'COMPLETE', transaction_code: 'TXN123',
      signed_field_names: 'total_amount,transaction_uuid,product_code', signature: sign(base) }

    const result = await adapter.verify(payload)
    expect(result.success).toBe(true)
  })

  it('verifies against OUR field list, ignoring the callback-supplied signed_field_names', async () => {
    // signed_field_names lies (claims only one field), but the signature is a
    // valid HMAC over all three real fields. The hardened code ignores the
    // claim and rebuilds the message from its own list -> still valid.
    const adapter = createEsewaAdapter({ secretKey: SECRET, merchantId: MERCHANT })
    const base = { total_amount: '100', transaction_uuid: '1700000000-donation-abc', product_code: MERCHANT }
    const payload = { ...base, status: 'COMPLETE', transaction_code: 'TXN123',
      signed_field_names: 'total_amount', /* attacker-shrunk claim */ signature: sign(base) }

    const result = await adapter.verify(payload)
    expect(result.success).toBe(true) // proves signed_field_names content is not trusted
  })

  it('rejects a tampered amount (signature was for a different amount)', async () => {
    const adapter = createEsewaAdapter({ secretKey: SECRET, merchantId: MERCHANT })
    // Signature computed for amount=10, but the payload claims amount=1000.
    const signedFor = { total_amount: '10', transaction_uuid: '1700000000-donation-abc', product_code: MERCHANT }
    const payload = { total_amount: '1000', transaction_uuid: '1700000000-donation-abc', product_code: MERCHANT,
      status: 'COMPLETE', transaction_code: 'TXN123',
      signed_field_names: 'total_amount,transaction_uuid,product_code', signature: sign(signedFor) }

    await expect(adapter.verify(payload)).rejects.toThrow(/signature/i)
  })

  it('rejects a callback with a missing signature', async () => {
    const adapter = createEsewaAdapter({ secretKey: SECRET, merchantId: MERCHANT })
    const payload = { total_amount: '100', transaction_uuid: '1700000000-donation-abc', product_code: MERCHANT,
      status: 'COMPLETE', transaction_code: 'TXN123', signed_field_names: 'total_amount,transaction_uuid,product_code' }

    await expect(adapter.verify(payload)).rejects.toThrow(/signature/i)
  })
})
