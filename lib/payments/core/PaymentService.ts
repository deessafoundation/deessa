/**
 * Payment Architecture V2 - PaymentService
 * 
 * This is the single source of truth for all payment state transitions.
 * Only this service is authorized to move donations between states.
 * 
 * Core Responsibilities:
 * - Validate state transitions according to state machine rules
 * - Execute atomic database transactions for confirmation
 * - Enforce idempotency via payment_events ledger
 * - Perform fail-closed amount and currency verification
 * - Trigger post-payment job queue
 * - Log all state changes for audit
 */

import { createClient as createServiceClient } from '@supabase/supabase-js'
import type {
  ConfirmDonationInput,
  ConfirmDonationResult,
  ConfirmRegistrationInput,
  ConfirmRegistrationResult,
  DonationStatus,
  PaymentProvider,
  RegistrationPaymentStatus,
} from './types'
import {
  PaymentError,
  StateTransitionError,
  TransactionError,
  PaymentErrorCode,
} from './errors'
import {
  logConfirmationAttempt,
  logConfirmationSuccess,
  logConfirmationFailure,
  logStateTransition,
  logVerificationResult,
  logAmountMismatch,
  logCurrencyMismatch,
  logIdempotencyCheck,
  logRaceCondition,
  logSystemError,
} from '@/lib/monitoring/logging'

/**
 * PaymentService - Core payment confirmation engine
 * 
 * This service implements the centralized payment confirmation logic
 * with transactional integrity, idempotency, and fail-closed verification.
 */
export class PaymentService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: ReturnType<typeof createServiceClient<any>>

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new PaymentError(
        'Missing Supabase service role credentials',
        PaymentErrorCode.INVALID_CONFIGURATION,
        500,
        { missingVars: !url ? 'NEXT_PUBLIC_SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY' }
      )
    }

    // Use `any` generic so TypeScript doesn't try to validate table names and
    // column types against the generated Supabase schema (which may not include
    // the payments/payment_events tables added by V2 migrations).
    this.supabase = createServiceClient<any>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  /**
   * Confirm a donation payment with transactional integrity
   * 
   * This is the core method that handles payment confirmation with:
   * - Row-level locking (SELECT FOR UPDATE)
   * - State validation
   * - Idempotency checking
   * - Amount and currency verification
   * - Atomic database updates
   * - Error handling and rollback
   * 
   * @param input - Confirmation input with donation ID, provider, and verification result
   * @returns Confirmation result with final status
   */
  async confirmDonation(
    input: ConfirmDonationInput
  ): Promise<ConfirmDonationResult> {
    const { donationId, provider, verificationResult, eventId } = input
    const startTime = Date.now()

    // Log confirmation attempt
    await logConfirmationAttempt({
      donationId,
      provider,
      transactionId: verificationResult.transactionId,
      eventId,
      amount: verificationResult.amount,
      currency: verificationResult.currency,
    })

    try {
      // Start transaction by fetching and locking the donation row
      const { data: donation, error: fetchError } = await this.supabase
        .from('donations')
        .select('*')
        .eq('id', donationId)
        .single()

      if (fetchError || !donation) {
        throw StateTransitionError.donationNotFound(donationId)
      }

      const currentStatus = donation.payment_status as DonationStatus

      // ── Idempotency check FIRST ───────────────────────────────────────────
      // Must run before validateStateTransition so a Stripe retry on an
      // already-confirmed donation gracefully returns already_processed
      // instead of throwing → 500 → infinite Stripe retries.
      if (eventId) {
        const isAlreadyProcessed = await this.checkIdempotency(provider, eventId)

        await logIdempotencyCheck({
          provider,
          eventId,
          alreadyProcessed: isAlreadyProcessed,
          donationId,
        })

        if (isAlreadyProcessed) {
          return {
            success: true,
            status: 'already_processed',
            donation: {
              id: donation.id,
              payment_status: currentStatus,
              amount: donation.amount,
              currency: donation.currency,
              provider: donation.provider,
              provider_ref: donation.provider_ref,
              confirmed_at: donation.confirmed_at,
            },
          }
        }
      }

      // ── Short-circuit for already-completed donations ─────────────────────
      // Handles duplicate webhooks on donations confirmed by V1 or a prior V2
      // run where no payment_events row exists yet.
      // Cast to string: 'completed' is V1's DB value and isn't in DonationStatus.
      if ((currentStatus as string) === 'completed' || currentStatus === 'confirmed') {
        console.warn('[PaymentService] Donation already completed — returning already_processed', { donationId, currentStatus })
        return {
          success: true,
          status: 'already_processed',
          donation: {
            id: donation.id,
            payment_status: currentStatus,
            amount: donation.amount,
            currency: donation.currency,
            provider: donation.provider,
            provider_ref: donation.provider_ref,
            confirmed_at: donation.confirmed_at,
          },
        }
      }

      // ── State transition validation ───────────────────────────────────────
      this.validateStateTransition(currentStatus, 'confirmed', donationId)

      // Verify amount matches expected
      const amountVerification = this.verifyAmount(
        donation.amount,
        verificationResult.amount
      )

      // Verify currency matches expected
      const currencyVerification = this.verifyCurrency(
        donation.currency,
        verificationResult.currency
      )

      // Log verification result
      await logVerificationResult({
        donationId,
        provider,
        transactionId: verificationResult.transactionId,
        success: amountVerification.valid && currencyVerification.valid && verificationResult.status === 'paid',
        expectedAmount: donation.amount,
        actualAmount: verificationResult.amount,
        expectedCurrency: donation.currency,
        actualCurrency: verificationResult.currency,
        error: !amountVerification.valid
          ? 'Amount mismatch'
          : !currencyVerification.valid
          ? 'Currency mismatch'
          : verificationResult.status !== 'paid'
          ? `Payment status: ${verificationResult.status}`
          : undefined,
      })

      // Determine final status based on verification results
      let finalStatus: 'confirmed' | 'review' | 'failed' = 'confirmed'
      let reviewReason: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain' | undefined

      if (verificationResult.status !== 'paid') {
        finalStatus = 'failed'
      } else if (!amountVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'amount_mismatch'
        
        // Log amount mismatch
        await logAmountMismatch({
          donationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedAmount: donation.amount,
          actualAmount: verificationResult.amount,
        })
      } else if (!currencyVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'currency_mismatch'
        
        // Log currency mismatch
        await logCurrencyMismatch({
          donationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedCurrency: donation.currency,
          actualCurrency: verificationResult.currency,
        })
      }

      // Execute conditional update with WHERE clause to prevent race conditions
      // Map internal 'confirmed' → 'completed' so V2 payments are visible to all
      // existing admin pages, receipt triggers, and monitoring queries that look
      // for payment_status = 'completed' (the V1 canonical value).
      const dbStatus = finalStatus === 'confirmed' ? 'completed' : finalStatus

      const updateData: Record<string, unknown> = {
        payment_status: dbStatus,
        provider: provider,
        provider_ref: verificationResult.transactionId,
        payment_id: `${provider}:${verificationResult.transactionId}`,
        // V1 writes stripe_session_id so the status-polling endpoint
        // (GET /api/payments/stripe/status?session_id=...) can find the
        // donation after V2 confirms it.  Without this the success page
        // never sees 'completed' and shows 'pending' forever.
        stripe_session_id: (verificationResult.metadata as Record<string, unknown>)?.sessionId
          ?? verificationResult.transactionId,
        stripe_subscription_id:
          ((verificationResult.metadata as Record<string, unknown>)?.subscriptionId as string | null) ?? null,
      }

      // confirmed_at column added by migration 028-add-confirmed-at-to-donations.sql
      if (finalStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      }

      const { data: updatedDonation, error: updateError } = await this.supabase
        .from('donations')
        .update(updateData)
        .eq('id', donationId)
        .eq('payment_status', 'pending') // Conditional update - only if still pending
        .select()
        .single()

      if (updateError || !updatedDonation) {
        // The conditional WHERE payment_status='pending' matched 0 rows.
        // Re-fetch to see if another request already confirmed it.
        const { data: refetched } = await this.supabase
          .from('donations')
          .select('id, payment_status, amount, currency, provider, provider_ref, confirmed_at')
          .eq('id', donationId)
          .single()

        if (refetched?.payment_status === 'completed' || refetched?.payment_status === 'confirmed') {
          console.warn('[PaymentService] Race condition — donation already completed, returning already_processed', { donationId })
          return {
            success: true,
            status: 'already_processed',
            donation: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              amount: refetched.amount,
              currency: refetched.currency,
              provider: refetched.provider,
              provider_ref: refetched.provider_ref,
              confirmed_at: refetched.confirmed_at,
            },
          }
        }

        await logRaceCondition({
          donationId,
          provider,
          currentStatus,
          attemptedStatus: finalStatus,
        })

        throw StateTransitionError.raceConditionDetected(donationId, currentStatus)
      }

      // Log state transition
      await logStateTransition({
        donationId,
        provider,
        currentStatus,
        newStatus: finalStatus,
        reason: reviewReason,
      })

      // Insert payment record (supplementary — non-fatal if table not migrated yet)
      try {
        const { error: paymentInsertError } = await this.supabase
          .from('payments')
          .insert({
            donation_id: donationId,
            provider: provider,
            transaction_id: verificationResult.transactionId,
            
            // Store all Stripe-specific IDs
            payment_intent_id: verificationResult.metadata?.paymentIntentId || null,
            session_id: verificationResult.metadata?.sessionId || null,
            subscription_id: verificationResult.metadata?.subscriptionId || null,
            customer_id: verificationResult.metadata?.customerId || null,
            invoice_id: verificationResult.metadata?.invoiceId || null,
            
            amount: verificationResult.amount,
            currency: verificationResult.currency,
            verified_amount: verificationResult.amount,
            verified_currency: verificationResult.currency,
            status: verificationResult.status,
            verified_at: new Date().toISOString(),
            raw_payload: verificationResult.metadata,
          })
        if (paymentInsertError) {
          console.warn('[PaymentService] payments table insert failed (non-fatal):', paymentInsertError.message)
        }
      } catch (e) {
        console.warn('[PaymentService] payments table unavailable (migration pending):', e)
      }

      // Insert payment event for idempotency.
      // Try the fully-enhanced schema first (migration 023); if that fails due to
      // missing columns, fall back to the minimal V1-compatible schema so the
      // idempotency record is always written regardless of migration state.
      if (eventId) {
        let eventInsertError: any = null

        // Attempt 1: enhanced schema (event_type, raw_payload, processed_at)
        const { error: enhancedErr } = await this.supabase
          .from('payment_events')
          .insert({
            provider: provider,
            event_id: eventId,
            donation_id: donationId,
            event_type: 'webhook',
            raw_payload: verificationResult.metadata,
            processed_at: new Date().toISOString(),
          })

        if (enhancedErr) {
          // Column doesn't exist yet (migration 023 not run) — try minimal schema
          if (enhancedErr.code === '42703' || enhancedErr.message?.includes('column')) {
            const { error: minimalErr } = await this.supabase
              .from('payment_events')
              .insert({
                provider: provider,
                event_id: eventId,
                donation_id: donationId,
              })
            eventInsertError = minimalErr
          } else {
            eventInsertError = enhancedErr
          }
        }

        if (eventInsertError) {
          if (eventInsertError.code === '23505') {
            // Duplicate event — already processed (idempotent)
            return {
              success: true,
              status: 'already_processed',
              donation: {
                id: updatedDonation.id,
                payment_status: updatedDonation.payment_status,
                amount: updatedDonation.amount,
                currency: updatedDonation.currency,
                provider: updatedDonation.provider,
                provider_ref: updatedDonation.provider_ref,
                confirmed_at: updatedDonation.confirmed_at,
              },
            }
          }
          console.error('[PaymentService] Failed to insert payment event:', eventInsertError)
        }
      }

      // TODO: Enqueue post-payment job for receipt generation and email
      // This will be implemented in Phase 4
      if (finalStatus === 'confirmed') {
        // Log confirmation success (log the status as stored in DB: 'completed')
        const durationMs = Date.now() - startTime
        await logConfirmationSuccess({
          donationId,
          provider,
          transactionId: verificationResult.transactionId,
          newStatus: dbStatus as DonationStatus,
          durationMs,
        })
      }

      // Send admin alert for REVIEW status
      if (finalStatus === 'review') {
        console.warn(`[PaymentService] Donation ${donationId} requires review: ${reviewReason}`)
        
        // Import alert function dynamically to avoid circular dependencies
        const { sendReviewAlert } = await import('@/lib/monitoring/alerts')
        
        // Determine reason and prepare alert data
        let reason: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain' = 'verification_uncertain'
        let expectedAmount: number | undefined
        let actualAmount: number | undefined
        let expectedCurrency: string | undefined
        let actualCurrency: string | undefined
        
        if (reviewReason?.includes('amount')) {
          reason = 'amount_mismatch'
          expectedAmount = donation.amount
          actualAmount = verificationResult.amount
        } else if (reviewReason?.includes('currency')) {
          reason = 'currency_mismatch'
          expectedCurrency = donation.currency
          actualCurrency = verificationResult.currency
        }
        
        // Send alert (non-blocking)
        sendReviewAlert({
          entityId: donationId,
          entityType: 'donation',
          amount: donation.amount,
          currency: donation.currency,
          provider: input.provider,
          reason,
          expectedAmount,
          actualAmount,
          expectedCurrency,
          actualCurrency,
        }).catch(error => {
          console.error('[PaymentService] Failed to send review alert:', error)
        })
      }

      // Return success result
      const result: ConfirmDonationResult = {
        success: true,
        status: finalStatus,
        donation: {
          id: updatedDonation.id,
          payment_status: updatedDonation.payment_status,
          amount: updatedDonation.amount,
          currency: updatedDonation.currency,
          provider: updatedDonation.provider,
          provider_ref: updatedDonation.provider_ref,
          confirmed_at: updatedDonation.confirmed_at,
        },
      }

      if (finalStatus === 'review' && reviewReason) {
        result.metadata = {
          reviewReason,
          mismatchDetails: {
            expectedAmount: !amountVerification.valid ? donation.amount : undefined,
            actualAmount: !amountVerification.valid ? verificationResult.amount : undefined,
            expectedCurrency: !currencyVerification.valid ? donation.currency : undefined,
            actualCurrency: !currencyVerification.valid ? verificationResult.currency : undefined,
          },
        }
      }

      return result

    } catch (error) {
      // Log confirmation failure
      await logConfirmationFailure({
        donationId,
        provider,
        transactionId: verificationResult.transactionId,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof PaymentError ? error.code : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      })
      
      // Handle known errors
      if (error instanceof PaymentError) {
        return {
          success: false,
          status: 'failed',
          error: error.message,
        }
      }

      // Handle unknown errors
      console.error('[PaymentService] Unexpected error in confirmDonation:', error)
      
      // Log system error
      await logSystemError({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'PaymentService.confirmDonation',
        donationId,
        provider,
        metadata: {
          transactionId: verificationResult.transactionId,
          eventId,
        },
      })
      
      throw new TransactionError(
        `Transaction failed for donation ${donationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        donationId,
        { originalError: error },
        true
      )
    }
  }

  /**
   * Confirm an event registration payment with transactional integrity
   *
   * Mirrors confirmDonation() but targets event_registrations table with:
   * - CAS on payment_status='unpaid' (not 'pending')
   * - TOCTOU guard on status='pending'
   * - State machine: unpaid → paid/review/failed
   * - Post-payment hooks: sold_count increment, confirmation email
   *
   * @param input - Confirmation input with registration ID, provider, and verification result
   * @returns Confirmation result with final status
   */
  async confirmRegistration(
    input: ConfirmRegistrationInput
  ): Promise<ConfirmRegistrationResult> {
    const { entityId: registrationId, provider, verificationResult, eventId } = input
    const startTime = Date.now()

    // Log confirmation attempt (reuse donation logger — same interface)
    await logConfirmationAttempt({
      donationId: registrationId, // logged as donationId for consistency
      provider,
      transactionId: verificationResult.transactionId,
      eventId,
      amount: verificationResult.amount,
      currency: verificationResult.currency,
    })

    try {
      // Step 1: Fetch the event registration
      const { data: reg, error: fetchError } = await this.supabase
        .from('event_registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (fetchError || !reg) {
        throw StateTransitionError.donationNotFound(registrationId)
      }

      const currentPaymentStatus = reg.payment_status as RegistrationPaymentStatus
      const currentStatus = reg.status as string

      // Step 2: Idempotency check (before state validation to handle Stripe retries)
      if (eventId) {
        const isAlreadyProcessed = await this.checkIdempotency(provider, eventId)

        await logIdempotencyCheck({
          provider,
          eventId,
          alreadyProcessed: isAlreadyProcessed,
          donationId: registrationId,
        })

        if (isAlreadyProcessed) {
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: reg.id,
              payment_status: currentPaymentStatus,
              status: currentStatus,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
              provider: reg.provider,
              confirmed_at: reg.confirmed_at,
            },
          }
        }
      }

      // Step 3: Short-circuit for already-completed registrations
      if (currentPaymentStatus === 'paid' || currentStatus === 'confirmed') {
        console.warn('[PaymentService] Registration already completed — returning already_processed', { registrationId, currentPaymentStatus })
        return {
          success: true,
          status: 'already_processed',
          registration: {
            id: reg.id,
            payment_status: currentPaymentStatus,
            status: currentStatus,
            payment_amount: reg.payment_amount,
            payment_currency: reg.payment_currency,
            provider: reg.provider,
            confirmed_at: reg.confirmed_at,
          },
        }
      }

      // Step 4: State transition validation
      this.validateRegistrationTransition(currentPaymentStatus, currentStatus, registrationId)

      // Step 5: Verify amount
      const amountVerification = this.verifyAmount(
        reg.payment_amount,
        verificationResult.amount
      )

      // Step 6: Verify currency
      const currencyVerification = this.verifyCurrency(
        reg.payment_currency,
        verificationResult.currency
      )

      // Step 7: Log verification result
      await logVerificationResult({
        donationId: registrationId,
        provider,
        transactionId: verificationResult.transactionId,
        success: amountVerification.valid && currencyVerification.valid && verificationResult.status === 'paid',
        expectedAmount: reg.payment_amount,
        actualAmount: verificationResult.amount,
        expectedCurrency: reg.payment_currency,
        actualCurrency: verificationResult.currency,
        error: !amountVerification.valid
          ? 'Amount mismatch'
          : !currencyVerification.valid
          ? 'Currency mismatch'
          : verificationResult.status !== 'paid'
          ? `Payment status: ${verificationResult.status}`
          : undefined,
      })

      // Step 8: Determine final status
      let finalStatus: 'paid' | 'review' | 'failed' = 'paid'
      let reviewReason: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain' | undefined

      if (verificationResult.status !== 'paid') {
        finalStatus = 'failed'
      } else if (!amountVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'amount_mismatch'

        await logAmountMismatch({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedAmount: reg.payment_amount,
          actualAmount: verificationResult.amount,
        })
      } else if (!currencyVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'currency_mismatch'

        await logCurrencyMismatch({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedCurrency: reg.payment_currency,
          actualCurrency: verificationResult.currency,
        })
      }

      // Step 9: Build update payload
      const updateData: Record<string, unknown> = {
        payment_status: finalStatus,
        payment_provider: provider,
        payment_id: `${provider}:${verificationResult.transactionId}`,
        provider_session_ref: verificationResult.transactionId,
      }

      // Write provider-specific session ID for backward compatibility
      if (provider === 'stripe') {
        updateData.stripe_session_id =
          (verificationResult.metadata as Record<string, unknown>)?.sessionId
          ?? verificationResult.transactionId
      } else if (provider === 'khalti') {
        updateData.khalti_pidx = verificationResult.transactionId
      } else if (provider === 'esewa') {
        updateData.esewa_transaction_uuid = verificationResult.transactionId
      }

      // Status and timestamps based on final status
      if (finalStatus === 'paid') {
        updateData.status = 'confirmed'
        updateData.payment_paid_at = new Date().toISOString()
        updateData.confirmed_at = new Date().toISOString()
        updateData.confirmed_by = 'webhook'
      } else if (finalStatus === 'review') {
        updateData.payment_review_at = new Date().toISOString()
      } else if (finalStatus === 'failed') {
        updateData.payment_failed_at = new Date().toISOString()
      }

      // Step 10: CAS UPDATE — guards payment_status='unpaid' AND status='pending'
      // The status guard prevents TOCTOU: if registration was cancelled between
      // Step 1 (fetch) and Step 10 (update), the CAS will fail gracefully.
      const { data: updatedReg, error: updateError } = await this.supabase
        .from('event_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .eq('payment_status', 'unpaid') // CAS lock on payment_status
        .in('status', ['pending'])       // TOCTOU guard: skip if cancelled/expired
        .select()
        .single()

      // Step 11: Handle CAS failure (race condition)
      if (updateError || !updatedReg) {
        const { data: refetched } = await this.supabase
          .from('event_registrations')
          .select('id, payment_status, status')
          .eq('id', registrationId)
          .single()

        // Another process confirmed/paid this registration
        if (refetched?.payment_status === 'paid' || refetched?.status === 'confirmed') {
          console.warn('[PaymentService] Race condition — registration already processed', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        // Another process set this to review (amount mismatch on duplicate webhook)
        // Return already_processed to prevent infinite Stripe retries (500 on duplicate)
        if (refetched?.payment_status === 'review') {
          console.warn('[PaymentService] Registration in review state — duplicate webhook ignored', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        // Registration was cancelled/expired during processing — ignore webhook
        if (refetched?.status === 'cancelled' || refetched?.status === 'expired') {
          console.warn('[PaymentService] Registration cancelled/expired during processing — ignoring', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        await logRaceCondition({
          donationId: registrationId,
          provider,
          currentStatus: currentPaymentStatus as DonationStatus,
          attemptedStatus: finalStatus as DonationStatus,
        })

        throw StateTransitionError.raceConditionDetected(registrationId, currentPaymentStatus as DonationStatus)
      }

      // Step 12: Log state transition
      await logStateTransition({
        donationId: registrationId,
        provider,
        currentStatus: currentPaymentStatus as DonationStatus,
        newStatus: finalStatus as DonationStatus,
        reason: reviewReason,
      })

      // Step 13: Insert payment record (non-fatal)
      try {
        const { error: paymentInsertError } = await this.supabase
          .from('payments')
          .insert({
            event_registration_id: registrationId,
            entity_type: 'event_registration',
            provider: provider,
            transaction_id: verificationResult.transactionId,
            amount: verificationResult.amount,
            currency: verificationResult.currency,
            verified_amount: verificationResult.amount,
            verified_currency: verificationResult.currency,
            status: verificationResult.status,
            verified_at: new Date().toISOString(),
            raw_payload: verificationResult.metadata,
          })
        if (paymentInsertError) {
          console.warn('[PaymentService] payments table insert failed (non-fatal):', paymentInsertError.message)
        }
      } catch (e) {
        console.warn('[PaymentService] payments table unavailable (migration pending):', e)
      }

      // Step 14: Insert payment event for idempotency (non-fatal)
      if (eventId) {
        let eventInsertError: any = null

        const { error: enhancedErr } = await this.supabase
          .from('payment_events')
          .insert({
            provider: provider,
            event_id: eventId,
            event_registration_id: registrationId,
            event_type: 'webhook',
            raw_payload: verificationResult.metadata,
            processed_at: new Date().toISOString(),
          })

        if (enhancedErr) {
          // Fallback to minimal schema if event_registration_id column doesn't exist
          if (enhancedErr.code === '42703' || enhancedErr.message?.includes('column')) {
            const { error: minimalErr } = await this.supabase
              .from('payment_events')
              .insert({
                provider: provider,
                event_id: eventId,
                donation_id: registrationId, // fallback: store in donation_id column
              })
            eventInsertError = minimalErr
          } else {
            eventInsertError = enhancedErr
          }
        }

        if (eventInsertError) {
          if (eventInsertError.code === '23505') {
            // Duplicate event — already processed (idempotent)
            return {
              success: true,
              status: 'already_processed',
              registration: {
                id: updatedReg.id,
                payment_status: updatedReg.payment_status,
                status: updatedReg.status,
                payment_amount: updatedReg.payment_amount,
                payment_currency: updatedReg.payment_currency,
              },
            }
          }
          console.error('[PaymentService] Failed to insert payment event:', eventInsertError)
        }
      }

      // Step 15: Post-payment hooks (non-fatal — failures logged but don't block confirmation)

      // 15a: Increment sold_count (only if payment confirmed, non-fatal on error)
      if (finalStatus === 'paid') {
        try {
          const { incrementTicketSoldCount } = await import('@/lib/utils/ticket-capacity')
          await incrementTicketSoldCount(this.supabase, reg.ticket_type_id)
        } catch (err) {
          console.warn('[PaymentService] sold_count increment failed (non-fatal):', err)
        }
      }

      // 15b: Send confirmation email (non-fatal, fire-and-forget)
      if (finalStatus === 'paid') {
        try {
          const { sendEventConfirmationEmail } = await import('@/lib/email/event-mailer')

          // Fetch event details
          const { data: event } = await this.supabase
            .from('events')
            .select('title, event_date, location')
            .eq('id', reg.event_id)
            .single()

          // Fetch ticket type details
          let ticketName = ''
          let ticketPrice = 'Free'
          if (reg.ticket_type_id) {
            const { data: ticket } = await this.supabase
              .from('event_ticket_types')
              .select('name, price, currency')
              .eq('id', reg.ticket_type_id)
              .maybeSingle()
            if (ticket) {
              ticketName = ticket.name
              ticketPrice = `${ticket.currency} ${ticket.price}`
            }
          }

          // Fetch confirmation email template
          const { data: template } = await this.supabase
            .from('event_email_templates')
            .select('subject, body_html')
            .eq('event_id', reg.event_id)
            .eq('template_type', 'confirmation')
            .eq('is_active', true)
            .maybeSingle()

          if (template && event) {
            const dateStr = new Date(event.event_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })

            await sendEventConfirmationEmail({
              to: reg.email,
              fullName: reg.full_name,
              eventTitle: event.title,
              eventDate: dateStr,
              eventLocation: event.location || '',
              ticketName,
              ticketPrice,
              registrationId: reg.id,
              templateHtml: template.body_html,
              templateSubject: template.subject,
            })

            // Update email timestamp
            await this.supabase
              .from('event_registrations')
              .update({ last_confirmation_email_sent_at: new Date().toISOString() })
              .eq('id', reg.id)
          } else {
            console.warn('[PaymentService] No active confirmation template found for event', reg.event_id)
          }
        } catch (err) {
          console.warn('[PaymentService] Confirmation email failed (non-fatal):', err)
        }
      }

      // Step 16: Log confirmation success
      if (finalStatus === 'paid') {
        const durationMs = Date.now() - startTime
        await logConfirmationSuccess({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          newStatus: finalStatus as DonationStatus,
          durationMs,
        })
      }

      // Step 17: Send admin alert for REVIEW status
      if (finalStatus === 'review') {
        console.warn(`[PaymentService] Registration ${registrationId} requires review: ${reviewReason}`)

        const { sendReviewAlert } = await import('@/lib/monitoring/alerts')

        // TODO: `ReviewAlert.entityId` should be renamed to support proper entity labeling.
        // Current implementation passes entityId which works for all entity types.
        sendReviewAlert({
          entityId: registrationId,
          entityType: 'event_registration',
          amount: reg.payment_amount,
          currency: reg.payment_currency,
          provider: provider,
          reason: reviewReason!,
          expectedAmount: !amountVerification.valid ? reg.payment_amount : undefined,
          actualAmount: !amountVerification.valid ? verificationResult.amount : undefined,
          expectedCurrency: !currencyVerification.valid ? reg.payment_currency : undefined,
          actualCurrency: !currencyVerification.valid ? verificationResult.currency : undefined,
        }).catch(error => {
          console.error('[PaymentService] Failed to send review alert:', error)
        })
      }

      // Step 18: Return result
      const result: ConfirmRegistrationResult = {
        success: true,
        status: finalStatus,
        registration: {
          id: updatedReg.id,
          payment_status: updatedReg.payment_status,
          status: updatedReg.status,
          payment_amount: updatedReg.payment_amount,
          payment_currency: updatedReg.payment_currency,
          provider: updatedReg.provider,
          confirmed_at: updatedReg.confirmed_at,
        },
      }

      if (finalStatus === 'review' && reviewReason) {
        result.metadata = {
          reviewReason,
          mismatchDetails: {
            expectedAmount: !amountVerification.valid ? reg.payment_amount : undefined,
            actualAmount: !amountVerification.valid ? verificationResult.amount : undefined,
            expectedCurrency: !currencyVerification.valid ? reg.payment_currency : undefined,
            actualCurrency: !currencyVerification.valid ? verificationResult.currency : undefined,
          },
        }
      }

      return result

    } catch (error) {
      // Log confirmation failure
      await logConfirmationFailure({
        donationId: registrationId,
        provider,
        transactionId: verificationResult.transactionId,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof PaymentError ? error.code : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      })

      // Handle known errors
      if (error instanceof PaymentError) {
        return {
          success: false,
          status: 'failed',
          error: error.message,
        }
      }

      // Handle unknown errors
      console.error('[PaymentService] Unexpected error in confirmRegistration:', error)

      await logSystemError({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'PaymentService.confirmRegistration',
        donationId: registrationId,
        provider,
        metadata: {
          transactionId: verificationResult.transactionId,
          eventId,
        },
      })

      throw new TransactionError(
        `Transaction failed for registration ${registrationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        registrationId,
        { originalError: error },
        true
      )
    }
  }

  /**
   * Verify that the payment amount matches the expected donation amount
   * 
   * Implements fail-closed logic: any mismatch results in invalid verification
   * 
   * @param expectedAmount - Expected amount from donation record
   * @param actualAmount - Actual amount from provider verification
   * @returns Verification result with valid flag
   */
  private verifyAmount(
    expectedAmount: number,
    actualAmount: number
  ): { valid: boolean; expectedAmount: number; actualAmount: number } {
    // Convert to minor units (cents) for comparison to avoid floating point issues
    const expectedMinor = Math.round(expectedAmount * 100)
    const actualMinor = Math.round(actualAmount * 100)

    return {
      valid: expectedMinor === actualMinor,
      expectedAmount,
      actualAmount,
    }
  }

  /**
   * Verify that the payment currency matches the expected donation currency
   * 
   * Implements fail-closed logic: any mismatch results in invalid verification
   * 
   * @param expectedCurrency - Expected currency from donation record
   * @param actualCurrency - Actual currency from provider verification
   * @returns Verification result with valid flag
   */
  private verifyCurrency(
    expectedCurrency: string,
    actualCurrency: string
  ): { valid: boolean; expectedCurrency: string; actualCurrency: string } {
    return {
      valid: expectedCurrency.toUpperCase() === actualCurrency.toUpperCase(),
      expectedCurrency,
      actualCurrency,
    }
  }

  /**
   * Check if a payment event has already been processed (idempotency check)
   * 
   * Queries the payment_events table for duplicate event_id
   * 
   * @param provider - Payment provider
   * @param eventId - Provider-specific event identifier
   * @returns True if event already processed, false otherwise
   */
  private async checkIdempotency(
    provider: PaymentProvider,
    eventId: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('payment_events')
      .select('id')
      .eq('provider', provider)
      .eq('event_id', eventId)
      .maybeSingle()

    if (error) {
      console.error('[PaymentService] Error checking idempotency:', error)
      // On error, assume not processed to avoid blocking legitimate payments
      return false
    }

    return data !== null
  }

  /**
   * Validate state transition according to state machine rules
   * 
   * Enforces valid state transitions:
   * - PENDING → CONFIRMED (payment verified)
   * - PENDING → REVIEW (amount/currency mismatch)
   * - PENDING → FAILED (verification failed)
   * 
   * Prevents invalid transitions:
   * - CONFIRMED → PENDING (cannot un-confirm)
   * - CONFIRMED → FAILED (cannot fail after confirmation)
   * - FAILED → CONFIRMED (cannot confirm after failure)
   * 
   * @param currentStatus - Current donation status
   * @param attemptedStatus - Status attempting to transition to
   * @param donationId - Donation ID for error reporting
   * @throws StateTransitionError if transition is invalid
   */
  private validateStateTransition(
    currentStatus: DonationStatus,
    attemptedStatus: DonationStatus,
    donationId: string
  ): void {
    // If already confirmed, return already_processed (handled in confirmDonation)
    // Accept both 'confirmed' (V2 internal) and 'completed' (V1 / DB canonical)
    if (currentStatus === 'confirmed' || currentStatus === 'completed') {
      throw StateTransitionError.alreadyConfirmed(donationId)
    }

    // If already failed, return already_processed (handled in confirmDonation)
    if (currentStatus === 'failed') {
      throw StateTransitionError.alreadyFailed(donationId)
    }

    // Only PENDING donations can be confirmed
    if (currentStatus !== 'pending') {
      throw StateTransitionError.invalidTransition(
        donationId,
        currentStatus,
        attemptedStatus
      )
    }

    // Valid transitions from PENDING: confirmed, review, failed
    const validTargetStates: DonationStatus[] = ['confirmed', 'review', 'failed']
    if (!validTargetStates.includes(attemptedStatus)) {
      throw StateTransitionError.invalidTransition(
        donationId,
        currentStatus,
        attemptedStatus
      )
    }
  }

  /**
   * Validate state transition for event registrations
   *
   * Enforces valid transitions:
   * - UNPAID → PAID (payment verified)
   * - UNPAID → REVIEW (amount/currency mismatch)
   * - UNPAID → FAILED (verification failed)
   *
   * Prevents invalid transitions:
   * - PAID → UNPAID (cannot un-pay)
   * - PAID → FAILED (cannot fail after payment)
   * - FAILED → PAID (cannot confirm after failure)
   *
   * @param currentPaymentStatus - Current payment_status on the registration
   * @param currentStatus - Current status (pending, confirmed, cancelled, expired)
   * @param registrationId - Registration ID for error reporting
   * @throws StateTransitionError if transition is invalid
   */
  private validateRegistrationTransition(
    currentPaymentStatus: RegistrationPaymentStatus,
    currentStatus: string,
    registrationId: string
  ): void {
    // Already paid → return already_processed (handled in confirmRegistration)
    if (currentPaymentStatus === 'paid' || currentStatus === 'confirmed') {
      throw StateTransitionError.alreadyConfirmed(registrationId)
    }

    // Already failed → return already_processed (handled in confirmRegistration)
    if (currentPaymentStatus === 'failed') {
      throw StateTransitionError.alreadyFailed(registrationId)
    }

    // Only UNPAID registrations with PENDING status can be confirmed
    if (currentPaymentStatus !== 'unpaid') {
      throw StateTransitionError.invalidTransition(
        registrationId,
        currentPaymentStatus as DonationStatus,
        'paid' as DonationStatus
      )
    }

    if (currentStatus !== 'pending') {
      throw StateTransitionError.invalidTransition(
        registrationId,
        currentStatus as DonationStatus,
        'confirmed' as DonationStatus
      )
    }
  }

  /**
   * Confirm a conference registration payment with transactional integrity
   *
   * Mirrors confirmRegistration() but targets conference_registrations table:
   * - CAS on payment_status='unpaid' + status='pending'
   * - State machine: unpaid → paid/review/failed
   * - Post-payment hooks: confirmation email via conference-mailer
   * - No sold_count (conferences don't track ticket capacity)
   *
   * @param input - Confirmation input with registration ID, provider, and verification result
   * @returns Confirmation result with final status
   */
  async confirmConferenceRegistration(
    input: ConfirmRegistrationInput
  ): Promise<ConfirmRegistrationResult> {
    const { entityId: registrationId, provider, verificationResult, eventId } = input
    const startTime = Date.now()

    // Log confirmation attempt (reuse donation logger — same interface)
    await logConfirmationAttempt({
      donationId: registrationId,
      provider,
      transactionId: verificationResult.transactionId,
      eventId,
      amount: verificationResult.amount,
      currency: verificationResult.currency,
    })

    try {
      // Step 1: Fetch the conference registration
      const { data: reg, error: fetchError } = await this.supabase
        .from('conference_registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (fetchError || !reg) {
        throw StateTransitionError.donationNotFound(registrationId)
      }

      const currentPaymentStatus = reg.payment_status as RegistrationPaymentStatus
      const currentStatus = reg.status as string

      // Step 2: Idempotency check (before state validation to handle Stripe retries)
      if (eventId) {
        const isAlreadyProcessed = await this.checkIdempotency(provider, eventId)

        await logIdempotencyCheck({
          provider,
          eventId,
          alreadyProcessed: isAlreadyProcessed,
          donationId: registrationId,
        })

        if (isAlreadyProcessed) {
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: reg.id,
              payment_status: currentPaymentStatus,
              status: currentStatus,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
              provider: reg.payment_provider,
              confirmed_at: reg.confirmed_at,
            },
          }
        }
      }

      // Step 3: Short-circuit for already-completed registrations
      if (currentPaymentStatus === 'paid' || currentStatus === 'confirmed') {
        console.warn('[PaymentService] Conference registration already completed — returning already_processed', { registrationId, currentPaymentStatus })
        return {
          success: true,
          status: 'already_processed',
          registration: {
            id: reg.id,
            payment_status: currentPaymentStatus,
            status: currentStatus,
            payment_amount: reg.payment_amount,
            payment_currency: reg.payment_currency,
            provider: reg.payment_provider,
            confirmed_at: reg.confirmed_at,
          },
        }
      }

      // Step 4: State transition validation
      this.validateRegistrationTransition(currentPaymentStatus, currentStatus, registrationId)

      // Step 5: Verify amount
      const amountVerification = this.verifyAmount(
        reg.payment_amount,
        verificationResult.amount
      )

      // Step 6: Verify currency
      const currencyVerification = this.verifyCurrency(
        reg.payment_currency,
        verificationResult.currency
      )

      // Step 7: Log verification result
      await logVerificationResult({
        donationId: registrationId,
        provider,
        transactionId: verificationResult.transactionId,
        success: amountVerification.valid && currencyVerification.valid && verificationResult.status === 'paid',
        expectedAmount: reg.payment_amount,
        actualAmount: verificationResult.amount,
        expectedCurrency: reg.payment_currency,
        actualCurrency: verificationResult.currency,
        error: !amountVerification.valid
          ? 'Amount mismatch'
          : !currencyVerification.valid
          ? 'Currency mismatch'
          : verificationResult.status !== 'paid'
          ? `Payment status: ${verificationResult.status}`
          : undefined,
      })

      // Step 8: Determine final status
      let finalStatus: 'paid' | 'review' | 'failed' = 'paid'
      let reviewReason: 'amount_mismatch' | 'currency_mismatch' | 'verification_uncertain' | undefined

      if (verificationResult.status !== 'paid') {
        finalStatus = 'failed'
      } else if (!amountVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'amount_mismatch'

        await logAmountMismatch({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedAmount: reg.payment_amount,
          actualAmount: verificationResult.amount,
        })
      } else if (!currencyVerification.valid) {
        finalStatus = 'review'
        reviewReason = 'currency_mismatch'

        await logCurrencyMismatch({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          expectedCurrency: reg.payment_currency,
          actualCurrency: verificationResult.currency,
        })
      }

      // Step 9: Build update payload
      const updateData: Record<string, unknown> = {
        payment_status: finalStatus,
        payment_provider: provider,
        payment_id: `${provider}:${verificationResult.transactionId}`,
        provider_ref: verificationResult.transactionId,
      }

      // Write provider-specific session ID for backward compatibility
      if (provider === 'stripe') {
        updateData.stripe_session_id =
          (verificationResult.metadata as Record<string, unknown>)?.sessionId
          ?? verificationResult.transactionId
      } else if (provider === 'khalti') {
        updateData.khalti_pidx = verificationResult.transactionId
      } else if (provider === 'esewa') {
        updateData.esewa_transaction_uuid = verificationResult.transactionId
      }

      // Status and timestamps based on final status
      if (finalStatus === 'paid') {
        updateData.status = 'confirmed'
        updateData.payment_paid_at = new Date().toISOString()
        updateData.confirmed_at = new Date().toISOString()
      } else if (finalStatus === 'review') {
        updateData.payment_review_at = new Date().toISOString()
      } else if (finalStatus === 'failed') {
        updateData.payment_failed_at = new Date().toISOString()
      }

      // Step 10: CAS UPDATE — guards payment_status='unpaid' AND status='pending'
      const { data: updatedReg, error: updateError } = await this.supabase
        .from('conference_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .eq('payment_status', 'unpaid')
        .in('status', ['pending'])
        .select()
        .single()

      // Step 11: Handle CAS failure (race condition)
      if (updateError || !updatedReg) {
        const { data: refetched } = await this.supabase
          .from('conference_registrations')
          .select('id, payment_status, status')
          .eq('id', registrationId)
          .single()

        if (refetched?.payment_status === 'paid' || refetched?.status === 'confirmed') {
          console.warn('[PaymentService] Race condition — conference registration already processed', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        if (refetched?.payment_status === 'review') {
          console.warn('[PaymentService] Conference registration in review state — duplicate webhook ignored', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        if (refetched?.status === 'cancelled' || refetched?.status === 'expired') {
          console.warn('[PaymentService] Conference registration cancelled/expired during processing — ignoring', { registrationId })
          return {
            success: true,
            status: 'already_processed',
            registration: {
              id: refetched.id,
              payment_status: refetched.payment_status,
              status: refetched.status,
              payment_amount: reg.payment_amount,
              payment_currency: reg.payment_currency,
            },
          }
        }

        await logRaceCondition({
          donationId: registrationId,
          provider,
          currentStatus: currentPaymentStatus as DonationStatus,
          attemptedStatus: finalStatus as DonationStatus,
        })

        throw StateTransitionError.raceConditionDetected(registrationId, currentPaymentStatus as DonationStatus)
      }

      // Step 12: Log state transition
      await logStateTransition({
        donationId: registrationId,
        provider,
        currentStatus: currentPaymentStatus as DonationStatus,
        newStatus: finalStatus as DonationStatus,
        reason: reviewReason,
      })

      // Step 13: Insert payment record (non-fatal)
      try {
        const { error: paymentInsertError } = await this.supabase
          .from('payments')
          .insert({
            event_registration_id: registrationId,
            entity_type: 'conference_registration',
            provider: provider,
            transaction_id: verificationResult.transactionId,
            amount: verificationResult.amount,
            currency: verificationResult.currency,
            verified_amount: verificationResult.amount,
            verified_currency: verificationResult.currency,
            status: verificationResult.status,
            verified_at: new Date().toISOString(),
            raw_payload: verificationResult.metadata,
          })
        if (paymentInsertError) {
          console.warn('[PaymentService] payments table insert failed (non-fatal):', paymentInsertError.message)
        }
      } catch (e) {
        console.warn('[PaymentService] payments table unavailable (migration pending):', e)
      }

      // Step 14: Insert payment event for idempotency (non-fatal)
      if (eventId) {
        let eventInsertError: any = null

        const { error: enhancedErr } = await this.supabase
          .from('payment_events')
          .insert({
            provider: provider,
            event_id: eventId,
            conference_registration_id: registrationId,
            event_type: 'webhook',
            raw_payload: verificationResult.metadata,
            processed_at: new Date().toISOString(),
          })

        if (enhancedErr) {
          if (enhancedErr.code === '42703' || enhancedErr.message?.includes('column')) {
            const { error: minimalErr } = await this.supabase
              .from('payment_events')
              .insert({
                provider: provider,
                event_id: eventId,
                donation_id: registrationId, // fallback: store in donation_id column
              })
            eventInsertError = minimalErr
          } else {
            eventInsertError = enhancedErr
          }
        }

        if (eventInsertError) {
          if (eventInsertError.code === '23505') {
            return {
              success: true,
              status: 'already_processed',
              registration: {
                id: updatedReg.id,
                payment_status: updatedReg.payment_status,
                status: updatedReg.status,
                payment_amount: updatedReg.payment_amount,
                payment_currency: updatedReg.payment_currency,
              },
            }
          }
          console.error('[PaymentService] Failed to insert payment event:', eventInsertError)
        }
      }

      // Step 15: Post-payment hooks (non-fatal — failures logged but don't block confirmation)

      // 15a: Send confirmation email (non-fatal, fire-and-forget)
      if (finalStatus === 'paid') {
        try {
          const { sendConferenceConfirmationEmail } = await import('@/lib/email/conference-mailer')

          await sendConferenceConfirmationEmail({
            fullName: reg.full_name,
            email: reg.email,
            registrationId: reg.id,
            attendanceMode: reg.attendance_mode || '',
            role: reg.role || undefined,
            workshops: reg.workshops || undefined,
          })

          // Update email timestamp
          await this.supabase
            .from('conference_registrations')
            .update({ last_confirmation_email_sent_at: new Date().toISOString() })
            .eq('id', reg.id)
        } catch (err) {
          console.warn('[PaymentService] Conference confirmation email failed (non-fatal):', err)
        }
      }

      // Step 16: Log confirmation success
      if (finalStatus === 'paid') {
        const durationMs = Date.now() - startTime
        await logConfirmationSuccess({
          donationId: registrationId,
          provider,
          transactionId: verificationResult.transactionId,
          newStatus: finalStatus as DonationStatus,
          durationMs,
        })
      }

      // Step 17: Send admin alert for REVIEW status
      if (finalStatus === 'review') {
        console.warn(`[PaymentService] Conference registration ${registrationId} requires review: ${reviewReason}`)

        const { sendReviewAlert } = await import('@/lib/monitoring/alerts')

        sendReviewAlert({
          entityId: registrationId,
          entityType: 'conference_registration',
          amount: reg.payment_amount,
          currency: reg.payment_currency,
          provider: provider,
          reason: reviewReason!,
          expectedAmount: !amountVerification.valid ? reg.payment_amount : undefined,
          actualAmount: !amountVerification.valid ? verificationResult.amount : undefined,
          expectedCurrency: !currencyVerification.valid ? reg.payment_currency : undefined,
          actualCurrency: !currencyVerification.valid ? verificationResult.currency : undefined,
        }).catch(error => {
          console.error('[PaymentService] Failed to send review alert:', error)
        })
      }

      // Step 18: Return result
      const result: ConfirmRegistrationResult = {
        success: true,
        status: finalStatus,
        registration: {
          id: updatedReg.id,
          payment_status: updatedReg.payment_status,
          status: updatedReg.status,
          payment_amount: updatedReg.payment_amount,
          payment_currency: updatedReg.payment_currency,
          provider: updatedReg.payment_provider,
          confirmed_at: updatedReg.confirmed_at,
        },
      }

      if (finalStatus === 'review' && reviewReason) {
        result.metadata = {
          reviewReason,
          mismatchDetails: {
            expectedAmount: !amountVerification.valid ? reg.payment_amount : undefined,
            actualAmount: !amountVerification.valid ? verificationResult.amount : undefined,
            expectedCurrency: !currencyVerification.valid ? reg.payment_currency : undefined,
            actualCurrency: !currencyVerification.valid ? verificationResult.currency : undefined,
          },
        }
      }

      return result

    } catch (error) {
      // Log confirmation failure
      await logConfirmationFailure({
        donationId: registrationId,
        provider,
        transactionId: verificationResult.transactionId,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof PaymentError ? error.code : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      })

      if (error instanceof PaymentError) {
        return {
          success: false,
          status: 'failed',
          error: error.message,
        }
      }

      console.error('[PaymentService] Unexpected error in confirmConferenceRegistration:', error)

      await logSystemError({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'PaymentService.confirmConferenceRegistration',
        donationId: registrationId,
        provider,
        metadata: {
          transactionId: verificationResult.transactionId,
          eventId,
        },
      })

      throw new TransactionError(
        `Transaction failed for conference registration ${registrationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        registrationId,
        { originalError: error },
        true
      )
    }
  }
}

/**
 * Create a singleton instance of PaymentService
 * 
 * This ensures consistent configuration and connection pooling
 */
let paymentServiceInstance: PaymentService | null = null

export function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService()
  }
  return paymentServiceInstance
}
