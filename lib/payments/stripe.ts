"use server"

import type Stripe from "stripe"

import { getAppBaseUrl } from "@/lib/utils"

import { STRIPE_API_VERSION } from "./stripe-compat"



export interface StripeCheckoutResult {

  redirectUrl: string

  sessionId: string

}



export interface StripeDonationContext {

  id: string

  amount: number

  currency: string

  donorName: string

  donorEmail: string

  isMonthly: boolean

  /** Override the Stripe success redirect URL (e.g. for conference registrations) */

  successUrl?: string

  /** Override the Stripe cancel redirect URL */

  cancelUrl?: string

  /** Extra metadata forwarded to the Stripe checkout session (e.g. conference_registration_id) */

  metadata?: Record<string, string>

}

function getSafeOverrideUrl(override: string | undefined, baseUrl: string): string | undefined {
  if (!override) return undefined

  try {
    // Allow relative paths – normalise them against baseUrl
    if (override.startsWith("/")) {
      return new URL(override, baseUrl).toString()
    }

    // For absolute URLs, only allow if host matches baseUrl
    const parsed = new URL(override)
    const base = new URL(baseUrl)

    if (parsed.host === base.host) {
      return parsed.toString()
    }
  } catch {
    // Fall through to undefined on parse/normalisation failure
  }

  return undefined
}



export interface StripeSessionVerificationResult {

  success: boolean

  session?: Stripe.Checkout.Session | null

  error?: string

  statusCode?: number

}



// Lazily initialise Stripe only on the server when needed

let stripeClient: Stripe | null = null



async function getStripeClient(): Promise<Stripe> {

  if (stripeClient) return stripeClient



  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {

    throw new Error("STRIPE_SECRET_KEY is not configured")

  }



  const Stripe = (await import("stripe")).default

  stripeClient = new Stripe(secretKey, {

    apiVersion: STRIPE_API_VERSION,

  })



  return stripeClient

}



/**

 * Verify a Stripe checkout session

 */

export async function verifyStripeSession(

  sessionId: string,

): Promise<StripeSessionVerificationResult> {

  try {

    const stripe = await getStripeClient()

    const session = await stripe.checkout.sessions.retrieve(sessionId, {

      expand: ["customer", "subscription"],

    })



    return {

      success: true,

      session,

    }

  } catch (error) {

    console.error("Error verifying Stripe session:", error)

    

    if (error instanceof Error) {

      // Handle Stripe-specific errors

      if (error.message.includes("No such checkout.session")) {

        return {

          success: false,

          error: "Session not found",

          statusCode: 404,

        }

      }

      

      return {

        success: false,

        error: error.message || "Failed to verify session",

        statusCode: 500,

      }

    }



    return {

      success: false,

      error: "Unknown error during session verification",

      statusCode: 500,

    }

  }

}



/**

 * Create a Stripe checkout session for one-time or recurring donations

 */

export async function startStripeCheckout(

  donation: StripeDonationContext,

): Promise<StripeCheckoutResult> {

  try {

    const baseUrl = getAppBaseUrl()

    const overrideSuccessUrl = getSafeOverrideUrl(donation.successUrl, baseUrl)
    const overrideCancelUrl = getSafeOverrideUrl(donation.cancelUrl, baseUrl)

    const successUrl =

      overrideSuccessUrl ||

      process.env.STRIPE_SUCCESS_URL ||

      `${baseUrl}/donate/success`

    const cancelUrl =

      overrideCancelUrl ||

      process.env.STRIPE_CANCEL_URL ||

      `${baseUrl}/donate/cancel`



    const stripe = await getStripeClient()

    // Validate amount before calling Stripe: finite, positive, at most 2 decimal places, optional max
    const rawAmount = Number(donation.amount)
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      throw new Error("Invalid donation amount. Please enter a positive number.")
    }
    const MAX_AMOUNT = 999_999.99
    if (rawAmount > MAX_AMOUNT) {
      throw new Error("Donation amount exceeds the maximum allowed.")
    }
    const amountRounded = Number(rawAmount.toFixed(2))
    if (Math.abs(rawAmount - amountRounded) > 1e-9) {
      throw new Error("Donation amount must have at most two decimal places.")
    }

    // Stripe expects amount in the smallest currency unit (cents)
    const amountInMinorUnits = Math.round(amountRounded * 100)



    // Stripe idempotency key: makes THIS create call safe to retry (SDK/network
    // retry, a double-invoked server action). A repeat with the same key returns
    // the SAME session instead of creating a second one — no duplicate checkout,
    // no risk of two charges for one donation row. Keyed on the donation id +
    // mode so one-time and subscription attempts for the same row never collide.
    const idempotencyKey = `checkout_${donation.id}_${donation.isMonthly ? "sub" : "once"}`

    // For monthly donations, use subscription mode

    if (donation.isMonthly) {

      const session = await stripe.checkout.sessions.create({

        mode: "subscription",

        payment_method_types: ["card"],

        line_items: [

          {

            price_data: {

              currency: donation.currency.toLowerCase(),

              product_data: {

                name: "Monthly Donation",

                description: `Monthly donation to deessa Foundation from ${donation.donorName}`,

              },

              unit_amount: amountInMinorUnits,

              recurring: {

                interval: "month",

              },

            },

            quantity: 1,

          },

        ],

        success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,

        customer_email: donation.donorEmail,

        client_reference_id: donation.id,

        metadata: {

          donation_id: donation.id,

          donor_name: donation.donorName,

          donor_email: donation.donorEmail,

          is_monthly: "true",

          ...donation.metadata,

        },

        // Propagate the donation id onto the Subscription so recurring
        // invoice.* events (and any refund/dispute) can map back to it.
        subscription_data: {
          metadata: {
            donation_id: donation.id,
            ...donation.metadata,
          },
        },

      }, { idempotencyKey })



      if (!session.url) {

        throw new Error("Stripe Checkout session was created without a redirect URL")

      }



      return {

        redirectUrl: session.url,

        sessionId: session.id,

      }

    }



    // One-time payment

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      payment_method_types: ["card"],

      line_items: [

        {

          price_data: {

            currency: donation.currency.toLowerCase(),

            product_data: {

              name: "One-time Donation",

              description: `Donation to deessa Foundation from ${donation.donorName}`,

            },

            unit_amount: amountInMinorUnits,

          },

          quantity: 1,

        },

      ],

      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,

      customer_email: donation.donorEmail,

      client_reference_id: donation.id,

      metadata: {

        donation_id: donation.id,

        donor_name: donation.donorName,

        donor_email: donation.donorEmail,

        is_monthly: "false",

        ...donation.metadata,

      },

      // Propagate the donation id onto the PaymentIntent (and thus the Charge)
      // so charge.refunded / charge.dispute.created can map back to it.
      payment_intent_data: {
        metadata: {
          donation_id: donation.id,
          ...donation.metadata,
        },
      },

    }, { idempotencyKey })



    if (!session.url) {

      throw new Error("Stripe Checkout session was created without a redirect URL")

    }



    return {

      redirectUrl: session.url,

      sessionId: session.id,

    }

  } catch (error) {

    console.error("Error creating Stripe checkout session:", error)

    

    if (error instanceof Error) {

      // Re-throw with more context

      throw new Error(`Failed to create Stripe checkout: ${error.message}`)

    }

    

    throw new Error("Unknown error while creating Stripe checkout session")

  }

}





