/**
 * Stripe SDK / API-version compatibility shims.
 *
 * The installed stripe SDK (v22) ships types for API version `2026-05-27.dahlia`,
 * but this app pins the *runtime* API version to `2024-06-20` (STRIPE_API_VERSION
 * below). Bumping the runtime version changes real payment behaviour, so we keep
 * the pin and reconcile the types here instead.
 *
 * On `2024-06-20` the API returns `invoice.subscription` and
 * `invoice.payment_intent` as top-level fields. On 2025+ versions those moved to
 * `invoice.parent.subscription_details.subscription` and
 * `invoice.payments[].payment.payment_intent` respectively, and the new types no
 * longer declare the old fields.
 *
 * The readers below accept BOTH shapes, so they stay correct if the pinned
 * version is bumped later — the whole point of putting them in one place.
 */

import type Stripe from "stripe"

/**
 * The Stripe API version this app is pinned to.
 *
 * Cast because the SDK's `apiVersion` type only admits its own newest version
 * string; the pinned value is deliberate and validated at runtime by Stripe.
 */
type StripeConfigArg = NonNullable<ConstructorParameters<typeof Stripe>[1]>

export const STRIPE_API_VERSION = "2024-06-20" as unknown as NonNullable<
  StripeConfigArg["apiVersion"]
>

/** Pull an id out of a value that may be an id string or an expanded object. */
function idOf(value: unknown): string | null {
  if (typeof value === "string") return value || null
  if (value && typeof value === "object") {
    const id = (value as { id?: unknown }).id
    return typeof id === "string" ? id : null
  }
  return null
}

/**
 * Subscription id for an invoice, across both API shapes.
 * Returns null for non-subscription invoices.
 */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as unknown as {
    subscription?: unknown
    parent?: { subscription_details?: { subscription?: unknown } | null } | null
  }

  return idOf(inv.subscription) ?? idOf(inv.parent?.subscription_details?.subscription)
}

/**
 * PaymentIntent id for an invoice, across both API shapes.
 * Returns null when the invoice has no associated PaymentIntent.
 */
export function getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as unknown as {
    payment_intent?: unknown
    payments?: { data?: Array<{ payment?: { payment_intent?: unknown } }> } | null
  }

  const direct = idOf(inv.payment_intent)
  if (direct) return direct

  for (const entry of inv.payments?.data ?? []) {
    const id = idOf(entry?.payment?.payment_intent)
    if (id) return id
  }

  return null
}
