/**
 * Stripe compat readers.
 *
 * These exist because the installed SDK types describe a newer API version than
 * the one this app pins at runtime. If someone bumps STRIPE_API_VERSION, the
 * invoice payload shape changes and subscription confirmation silently breaks —
 * these tests pin both shapes so that failure is loud.
 */

import type Stripe from 'stripe'
import {
  STRIPE_API_VERSION,
  getInvoiceSubscriptionId,
  getInvoicePaymentIntentId,
} from '@/lib/payments/stripe-compat'

const asInvoice = (o: unknown) => o as Stripe.Invoice

describe('stripe-compat', () => {
  it('pins the runtime API version the app was built against', () => {
    expect(STRIPE_API_VERSION).toBe('2024-06-20')
  })

  describe('getInvoiceSubscriptionId', () => {
    it('reads the 2024-06-20 shape (top-level string)', () => {
      expect(getInvoiceSubscriptionId(asInvoice({ subscription: 'sub_123' }))).toBe('sub_123')
    })

    it('reads the 2024-06-20 shape when expanded to an object', () => {
      expect(getInvoiceSubscriptionId(asInvoice({ subscription: { id: 'sub_123' } }))).toBe('sub_123')
    })

    it('reads the 2025+ shape (parent.subscription_details)', () => {
      expect(
        getInvoiceSubscriptionId(
          asInvoice({ parent: { subscription_details: { subscription: 'sub_456' } } })
        )
      ).toBe('sub_456')
    })

    it('returns null for a non-subscription invoice', () => {
      expect(getInvoiceSubscriptionId(asInvoice({}))).toBeNull()
      expect(getInvoiceSubscriptionId(asInvoice({ subscription: null }))).toBeNull()
      expect(
        getInvoiceSubscriptionId(asInvoice({ parent: { subscription_details: null } }))
      ).toBeNull()
    })

    it('does not treat an empty string as a subscription id', () => {
      // Guards the `if (subscriptionId)` branches in the webhook handlers.
      expect(getInvoiceSubscriptionId(asInvoice({ subscription: '' }))).toBeNull()
    })
  })

  describe('getInvoicePaymentIntentId', () => {
    it('reads the 2024-06-20 shape', () => {
      expect(getInvoicePaymentIntentId(asInvoice({ payment_intent: 'pi_123' }))).toBe('pi_123')
      expect(getInvoicePaymentIntentId(asInvoice({ payment_intent: { id: 'pi_123' } }))).toBe('pi_123')
    })

    it('reads the 2025+ shape (payments[].payment.payment_intent)', () => {
      expect(
        getInvoicePaymentIntentId(
          asInvoice({ payments: { data: [{ payment: { payment_intent: 'pi_789' } }] } })
        )
      ).toBe('pi_789')
    })

    it('returns null when there is no payment intent', () => {
      expect(getInvoicePaymentIntentId(asInvoice({}))).toBeNull()
      expect(getInvoicePaymentIntentId(asInvoice({ payments: { data: [] } }))).toBeNull()
    })
  })
})
