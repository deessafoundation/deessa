"use server";

import { NextResponse } from "next/server";

import { createClient as createServiceClient } from "@supabase/supabase-js";

import { generateReceiptForDonation } from "@/lib/actions/donation-receipt";

import { getPaymentService } from "@/lib/payments/core/PaymentService";

import { createStripeAdapter } from "@/lib/payments/adapters/StripeAdapter";

import { STRIPE_API_VERSION, getInvoiceSubscriptionId } from "@/lib/payments/stripe-compat";

import type Stripe from "stripe";

// Create a service role client for webhooks (bypasses RLS)

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials for webhook");
  }

  return createServiceClient(supabaseUrl, serviceRoleKey);
}

// ══════════════════════════════════════════════════════════════════════════════
// Payment Confirmation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Confirm donation payment using centralized PaymentService
 * 
 * This is the production payment confirmation flow that:
 * - Uses StripeAdapter for signature verification and payload normalization
 * - Routes through PaymentService for transactional state management
 * - Enforces idempotency via payment_events ledger
 * - Performs fail-closed amount/currency verification
 * - Generates receipts inline (with error tracking for manual retry)
 * 
 * Architecture:
 * - Webhook signature verified once by POST handler
 * - StripeAdapter.processVerifiedEvent() extracts and normalizes data
 * - PaymentService.confirmDonation() handles atomic DB transaction
 * - Receipt generation is fire-and-forget (non-blocking)
 * 
 * @param session - Stripe checkout session
 * @param eventId - Stripe event ID for idempotency
 * @returns True if payment was confirmed, false otherwise
 */
async function confirmDonation(
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<boolean> {
  try {
    // Extract donation ID from session
    const donationId = session.client_reference_id || session.metadata?.donation_id;
    
    if (!donationId) {
      console.warn('Stripe webhook: No donation ID found in session', session.id);
      return false;
    }

    // Process the already-verified Stripe event.
    // The webhook signature was verified once by the POST handler using the raw
    // request body and the Stripe-Signature header. Those values are no longer
    // available here, so we call processVerifiedEvent() which skips the second
    // (redundant) signature check and goes straight to data extraction.
    const adapter = createStripeAdapter();
    const stripeEvent = {
      type: 'checkout.session.completed',
      data: { object: session },
      id: eventId,
    } as import('stripe').default.Event;
    const verificationResult = await adapter.processVerifiedEvent(stripeEvent);

    // Confirm donation through PaymentService
    const paymentService = getPaymentService();
    const result = await paymentService.confirmDonation({
      donationId,
      provider: 'stripe',
      verificationResult,
      eventId
    });

    if (!result.success) {
      console.error('Stripe webhook: Payment confirmation failed', {
        donationId,
        sessionId: session.id,
        error: result.error
      });
      return false;
    }

    // Log successful payment confirmation
    console.log('Stripe webhook: Payment confirmed', {
      donationId,
      sessionId: session.id,
      status: result.status
    });

    // Generate receipt inline (fire-and-forget with error tracking)
    if (result.status === 'confirmed' || result.status === 'already_processed') {
      try {
        const receiptResult = await generateReceiptForDonation({ donationId });
        if (receiptResult.success) {
          console.log('Stripe webhook: Receipt generated', {
            donationId,
            receiptNumber: receiptResult.receiptNumber,
          });
        } else {
          console.error('Stripe webhook: Receipt generation failed', {
            donationId,
            reason: receiptResult.message,
          });
        }
      } catch (receiptError) {
        // Non-fatal: log but do NOT fail the webhook response.
        console.error('Stripe webhook: Receipt generation error', {
          donationId,
          error: receiptError instanceof Error ? receiptError.message : 'Unknown error',
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Stripe webhook: Unexpected error', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Conference Registration Payment Confirmation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Confirm conference registration payment using centralized PaymentService.
 *
 * @param supabase - Supabase service role client
 * @param registrationId - Conference registration ID
 * @param session - Stripe checkout session
 * @param eventId - Stripe event ID for idempotency
 */
async function confirmConferenceRegistrationFromWebhook(
  supabase: ReturnType<typeof createServiceRoleClient>,
  registrationId: string,
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<boolean> {
  try {
    const { createStripeAdapter } = await import("@/lib/payments/adapters/StripeAdapter")
    const { getPaymentService } = await import("@/lib/payments/core/PaymentService")

    const adapter = createStripeAdapter()
    const paymentService = getPaymentService()

    // Build a synthetic Stripe.Event from the already-verified session
    const stripeEvent = {
      type: "checkout.session.completed",
      data: { object: session },
      id: eventId,
    } as Stripe.Event

    const verificationResult = await adapter.processVerifiedEvent(stripeEvent)

    const result = await paymentService.confirmConferenceRegistration({
      entityType: "conference_registration",
      entityId: registrationId,
      provider: "stripe",
      verificationResult,
      eventId,
    })

    if (!result.success) {
      console.error("Stripe webhook (conference): Payment confirmation failed", {
        registrationId,
        sessionId: session.id,
        error: result.error,
      })
      return false
    }

    console.log("Stripe webhook (conference): Payment confirmed", {
      registrationId,
      sessionId: session.id,
      status: result.status,
    })

    return true
  } catch (error) {
    console.error("Stripe webhook (conference): Unexpected error", {
      registrationId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Event Registration Payment Confirmation
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Confirm event registration payment from Stripe webhook.
 *
 * Uses PaymentService.confirmRegistration() — replaces 200 lines of V1
 * inline logic (idempotency, fetch, amount check, update, sold_count, email).
 * The webhook signature was already verified by the outer POST handler.
 *
 * @param supabase - Supabase service role client
 * @param registrationId - Event registration ID
 * @param session - Stripe checkout session
 * @param eventId - Stripe event ID for idempotency
 */
async function confirmEventRegistrationFromWebhook(
  supabase: ReturnType<typeof createServiceRoleClient>,
  registrationId: string,
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<boolean> {
  try {
    const { createStripeAdapter } = await import("@/lib/payments/adapters/StripeAdapter")
    const { getPaymentService } = await import("@/lib/payments/core/PaymentService")

    const adapter = createStripeAdapter()
    const paymentService = getPaymentService()

    // Build a synthetic Stripe.Event from the already-verified session
    const stripeEvent = {
      type: "checkout.session.completed",
      data: { object: session },
      id: eventId,
    } as Stripe.Event

    const verificationResult = await adapter.processVerifiedEvent(stripeEvent)

    const result = await paymentService.confirmRegistration({
      entityType: "event_registration",
      entityId: registrationId,
      provider: "stripe",
      verificationResult,
      eventId,
    })

    if (!result.success) {
      console.error("Stripe webhook (event): Payment confirmation failed", {
        registrationId,
        sessionId: session.id,
        error: result.error,
      })
      return false
    }

    console.log("Stripe webhook (event): Payment confirmed", {
      registrationId,
      sessionId: session.id,
      status: result.status,
    })

    return true
  } catch (error) {
    console.error("Stripe webhook (event): Unexpected error", {
      registrationId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Webhook Handler
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Stripe webhook handler
 * 
 * Processes Stripe webhook events for:
 * - Donation payments (one-time and subscriptions)
 * - Conference registration payments
 * - Event registration payments
 * 
 * Security:
 * - Verifies webhook signature using STRIPE_WEBHOOK_SECRET
 * - Uses service role client to bypass RLS
 * - Implements idempotency via payment_events table
 * 
 * Performance:
 * - Target response time: < 2 seconds
 * - Receipt generation is fire-and-forget (non-blocking)
 * - Returns 200 OK immediately after confirmation
 */

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const body = await request.text();

    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");

      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe-Signature header" },
        { status: 400 }
      );
    }

    const Stripe = (await import("stripe")).default;

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      console.error("Stripe webhook error: STRIPE_SECRET_KEY is not configured");

      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
    });

    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Defense-in-depth: in production, reject test-mode events. A correctly
    // configured live webhook secret already rejects test events at
    // constructEvent, but this guards against a prod deploy accidentally wired
    // to test keys.
    if (process.env.NODE_ENV === "production" && event.livemode === false) {
      console.error("Stripe webhook: rejected test-mode event in production", event.id);
      return NextResponse.json(
        { error: "Test-mode event rejected in production" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Stripe webhook parsing error:", err);

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Use service role client for webhooks to bypass RLS

  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ── Conference registration branch ───────────────────────────────────

        const conferenceRegistrationId =
          session.metadata?.conference_registration_id;

        if (conferenceRegistrationId) {
          const confirmed = await confirmConferenceRegistrationFromWebhook(
            supabase,
            conferenceRegistrationId,
            session,
            event.id
          );
          if (!confirmed) {
            return NextResponse.json(
              { error: "Failed to confirm conference registration" },
              { status: 500 }
            );
          }
          break;
        }

        // ── Event registration branch ─────────────────────────────────────────

        const eventRegistrationId =
          session.metadata?.event_registration_id;

        if (eventRegistrationId) {
          const confirmed = await confirmEventRegistrationFromWebhook(
            supabase,
            eventRegistrationId,
            session,
            event.id
          );
          if (!confirmed) {
            return NextResponse.json(
              { error: "Failed to confirm event registration" },
              { status: 500 }
            );
          }
          break;
        }

        // ── Donation payment confirmation ────────────────────────────────────

        const confirmed = await confirmDonation(session, event.id);
        if (!confirmed) {
          // Return error so Stripe can retry
          return NextResponse.json(
            { error: "Failed to confirm donation" },
            { status: 500 }
          );
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ── Conference branch — keep payment_status = 'unpaid' so user can retry ──

        const conferenceRegistrationId =
          session.metadata?.conference_registration_id;

        if (conferenceRegistrationId) {
          // Don't change the registration status — session expired but the
          // registration itself may still be within its 24h window.
          break;
        }

        // ── Event registration branch — keep payment_status = 'unpaid' ────────
        const eventRegistrationId =
          session.metadata?.event_registration_id;

        if (eventRegistrationId) {
          // Don't change the registration status — session expired but the
          // registration itself may still be within its 24h window.
          break;
        }

        const donationId =
          session.client_reference_id || session.metadata?.donation_id;

        if (!donationId) {
          break;
        }

        // Idempotency check for V1
        const recordEventOnce = async (donationId: string | null | undefined) => {
          try {
            const { error } = await supabase
              .from("payment_events")
              .insert({
                provider: "stripe",
                event_id: event.id,
                donation_id: donationId ?? null,
              });

            if (error) {
              if (
                (error as any).code === "23505" ||
                String((error as any).message || "")
                  .toLowerCase()
                  .includes("duplicate")
              ) {
                return { alreadyProcessed: true };
              }
              return { alreadyProcessed: false };
            }

            return { alreadyProcessed: false };
          } catch {
            return { alreadyProcessed: false };
          }
        };

        const recorded = await recordEventOnce(donationId);

        if (recorded.alreadyProcessed) break;

        const { data: donation } = await supabase

          .from("donations")

          .select("*")

          .eq("id", donationId)

          .single();

        if (!donation) break;

        // Only update if still pending

        if (donation.payment_status === "pending") {
          await supabase

            .from("donations")

            .update({
              payment_status: "failed",
            })

            .eq("id", donationId);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Try to find donation via metadata

        const donationId = paymentIntent.metadata?.donation_id;

        if (!donationId) {
          break;
        }

        // Idempotency check for V1
        const recordEventOnce = async (donationId: string | null | undefined) => {
          try {
            const { error } = await supabase
              .from("payment_events")
              .insert({
                provider: "stripe",
                event_id: event.id,
                donation_id: donationId ?? null,
              });

            if (error) {
              if (
                (error as any).code === "23505" ||
                String((error as any).message || "")
                  .toLowerCase()
                  .includes("duplicate")
              ) {
                return { alreadyProcessed: true };
              }
              return { alreadyProcessed: false };
            }

            return { alreadyProcessed: false };
          } catch {
            return { alreadyProcessed: false };
          }
        };

        const recorded = await recordEventOnce(donationId);

        if (recorded.alreadyProcessed) break;

        const { data: donation } = await supabase

          .from("donations")

          .select("*")

          .eq("id", donationId)

          .single();

        if (!donation) break;

        // Only update if still pending

        if (donation.payment_status === "pending") {
          await supabase

            .from("donations")

            .update({
              payment_status: "failed",
            })

            .eq("id", donationId);
        }

        break;
      }

      // Subscription events for monthly donations

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;

        const donationId = subscription.metadata?.donation_id;

        if (!donationId) {
          console.warn('Stripe webhook: No donation ID in subscription metadata');
          break;
        }

        // Idempotency check for V1
        const recordEventOnce = async (donationId: string | null | undefined) => {
          try {
            const { error } = await supabase
              .from("payment_events")
              .insert({
                provider: "stripe",
                event_id: event.id,
                donation_id: donationId ?? null,
              });

            if (error) {
              if (
                (error as any).code === "23505" ||
                String((error as any).message || "")
                  .toLowerCase()
                  .includes("duplicate")
              ) {
                return { alreadyProcessed: true };
              }
              return { alreadyProcessed: false };
            }

            return { alreadyProcessed: false };
          } catch {
            return { alreadyProcessed: false };
          }
        };

        const recorded = await recordEventOnce(donationId);

        if (recorded.alreadyProcessed) break;

        const { data: donation } = await supabase

          .from("donations")

          .select("*")

          .eq("id", donationId)

          .single();

        if (donation) {
          await supabase

            .from("donations")

            .update({
              payment_id: `stripe:subscription:${subscription.id}`,

              provider: "stripe",

              provider_ref: subscription.id,

              stripe_subscription_id: subscription.id,
            })

            .eq("id", donationId);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // For subscription invoices, confirm the recurring donation payment
        if (getInvoiceSubscriptionId(invoice)) {
          try {
            // Use processVerifiedEvent() — the signature was already verified by
            // the outer handler; re-calling verify() with empty headers/body fails.
            const adapter = createStripeAdapter();
            const invoiceEvent = {
              type: 'invoice.payment_succeeded',
              data: { object: invoice },
              id: event.id,
            } as import('stripe').default.Event;
            const verificationResult = await adapter.processVerifiedEvent(invoiceEvent);

            const paymentService = getPaymentService();
            const result = await paymentService.confirmDonation({
              donationId: verificationResult.donationId,
              provider: 'stripe',
              verificationResult,
              eventId: event.id
            });

            if (result.success && (result.status === 'confirmed' || result.status === 'already_processed')) {
              // Generate receipt inline (fire-and-forget)
              try {
                const receiptResult = await generateReceiptForDonation({ donationId: verificationResult.donationId });
                if (receiptResult.success) {
                  console.log('Stripe webhook: Subscription receipt generated', {
                    donationId: verificationResult.donationId,
                    receiptNumber: receiptResult.receiptNumber,
                  });
                } else {
                  console.error('Stripe webhook: Subscription receipt failed', {
                    donationId: verificationResult.donationId,
                    reason: receiptResult.message,
                  });
                }
              } catch (receiptError) {
                console.error('Stripe webhook: Subscription receipt error', {
                  donationId: verificationResult.donationId,
                  error: receiptError instanceof Error ? receiptError.message : 'Unknown error',
                });
              }
            }
          } catch (error) {
            console.error('Stripe webhook: Failed to process subscription invoice', {
              invoiceId: invoice.id,
              subscriptionId: getInvoiceSubscriptionId(invoice),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        // For subscription invoices, mark donation as failed

        const failedSubscriptionId = getInvoiceSubscriptionId(invoice);

        if (failedSubscriptionId) {
          // Resolve the donation first so the idempotency ledger row is linked
          // to it (previously the event was recorded with donation_id = null).
          const { data: donations } = await supabase

            .from("donations")

            .select("*")

            .like("payment_id", `%subscription:${failedSubscriptionId}%`)

            .order("created_at", { ascending: false })

            .limit(1);

          const donation = donations && donations.length > 0 ? donations[0] : null;

          // Idempotency check for V1
          const recordEventOnce = async (donationId: string | null | undefined) => {
            try {
              const { error } = await supabase
                .from("payment_events")
                .insert({
                  provider: "stripe",
                  event_id: event.id,
                  donation_id: donationId ?? null,
                });

              if (error) {
                if (
                  (error as any).code === "23505" ||
                  String((error as any).message || "")
                    .toLowerCase()
                    .includes("duplicate")
                ) {
                  return { alreadyProcessed: true };
                }
                return { alreadyProcessed: false };
              }

              return { alreadyProcessed: false };
            } catch {
              return { alreadyProcessed: false };
            }
          };

          const recorded = await recordEventOnce(donation?.id ?? null);

          if (recorded.alreadyProcessed) break;

          if (donation && donation.payment_status === "pending") {
            await supabase

              .from("donations")

              .update({
                payment_status: "failed",

                provider: "stripe",

                provider_ref: failedSubscriptionId,

                stripe_subscription_id: failedSubscriptionId,
              })

              .eq("id", donation.id);
          }
        }

        break;
      }

      // ── Refunds & disputes ────────────────────────────────────────────────
      // Without these, a refunded or disputed donation stays 'completed'
      // forever: totals are overstated and the receipt remains valid.

      case "charge.refunded":
      case "charge.dispute.created": {
        // Resolve the donation and the associated PaymentIntent from the event.
        let donationId: string | null | undefined;
        let paymentIntentId: string | null = null;

        if (event.type === "charge.refunded") {
          const charge = event.data.object as Stripe.Charge;
          donationId = charge.metadata?.donation_id;
          paymentIntentId =
            typeof charge.payment_intent === "string"
              ? charge.payment_intent
              : charge.payment_intent?.id ?? null;
        } else {
          const dispute = event.data.object as Stripe.Dispute;
          donationId = (dispute.metadata as Record<string, string> | undefined)?.donation_id;
          paymentIntentId =
            typeof dispute.payment_intent === "string"
              ? dispute.payment_intent
              : (dispute.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;
        }

        // If the event metadata didn't carry the donation id, resolve it from
        // the PaymentIntent we stored at confirmation time
        // (payment_id = 'stripe:<pi>', provider_ref = '<pi>').
        if (!donationId && paymentIntentId) {
          let { data: byPaymentId } = await supabase
            .from("donations")
            .select("id")
            .eq("payment_id", `stripe:${paymentIntentId}`)
            .maybeSingle();

          if (!byPaymentId) {
            const { data: byProviderRef } = await supabase
              .from("donations")
              .select("id")
              .eq("provider_ref", paymentIntentId)
              .maybeSingle();
            byPaymentId = byProviderRef;
          }

          donationId = byPaymentId?.id;
        }

        if (!donationId) {
          console.warn(
            `Stripe webhook: could not resolve donation for ${event.type}`,
            event.id
          );
          break;
        }

        // Downgrade first. This update is naturally idempotent: the conditional
        // .in() guard only touches a currently-paid record, so retries (or a
        // second partial-refund event) are safe no-ops and we never resurrect
        // or mutate an already-failed record. Doing it before writing the
        // idempotency row means a transient failure returns 500 and Stripe
        // safely retries instead of being swallowed as "already processed".
        const { error: refundUpdateError } = await supabase
          .from("donations")
          .update({
            payment_status: "refunded",
            review_status: "refunded",
          })
          .eq("id", donationId)
          .in("payment_status", ["completed", "confirmed"]);

        if (refundUpdateError) {
          console.error(
            `Stripe webhook: failed to mark donation ${donationId} refunded`,
            refundUpdateError
          );
          // Surface as 500 so Stripe retries the refund/dispute event.
          return NextResponse.json(
            { error: "Failed to process refund/dispute" },
            { status: 500 }
          );
        }

        // Record the event for the audit ledger (best-effort; a duplicate on
        // retry is expected and harmless).
        await supabase
          .from("payment_events")
          .insert({
            provider: "stripe",
            event_id: event.id,
            donation_id: donationId,
          });

        console.log(
          `Stripe webhook: donation ${donationId} marked refunded via ${event.type}`
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Optionally handle subscription cancellation

        const donationId = subscription.metadata?.donation_id;

        if (donationId) {
          // Note: We don't change payment_status here as the subscription may have been active
        }

        break;
      }

      default:
        // Unhandled event types are acknowledged but not processed
        break;
    }
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err);

    return NextResponse.json(
      { error: "Webhook handling error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
