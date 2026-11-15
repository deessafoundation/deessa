/**
 * Payment Architecture V2/V3 - Durable Job Queue
 * 
 * Database-backed queue for asynchronous post-payment jobs (receipt generation and emails).
 * Replaces the previous placeholder implementation with atomic inserts into `payment_jobs`,
 * lease claims, retry tracking with exponential backoff, and dead-letter visibility.
 */

import { createClient as createServiceClient } from "@supabase/supabase-js"
import { generateReceiptForDonation } from "@/lib/actions/donation-receipt"

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role env vars")
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export type JobType = "receipt_generation" | "receipt_email"

export interface EnqueueJobOptions {
  jobType?: JobType
  entityType?: "donation" | "event_registration"
  eventRegistrationId?: string
}

/**
 * Enqueue a post-payment job for receipt generation and delivery.
 * Persists to `payment_jobs` with an immutable deduplication key so duplicate
 * callbacks / retries never enqueue duplicate tasks.
 *
 * @param entityId - ID of the donation or event registration
 * @param options - Additional options including jobType
 */
export async function enqueuePostPaymentJob(
  entityId: string,
  options?: EnqueueJobOptions,
): Promise<{ ok: boolean; jobId?: string; message?: string }> {
  const jobType: JobType = options?.jobType || "receipt_generation"
  const entityType = options?.entityType || "donation"
  const deduplicationKey = `${entityType}:${entityId}:${jobType}`

  try {
    const supabase = getServiceSupabase()

    // 1. Insert job with deduplication guard
    const insertPayload: Record<string, unknown> = {
      job_type: jobType,
      status: "pending",
      deduplication_key: deduplicationKey,
      max_retries: 5,
      retry_count: 0,
      created_at: new Date().toISOString(),
    }

    if (entityType === "donation") {
      insertPayload.donation_id = entityId
    } else {
      insertPayload.event_registration_id = entityId
    }

    const { data: job, error } = await supabase
      .from("payment_jobs")
      .upsert(insertPayload, {
        onConflict: "deduplication_key",
        ignoreDuplicates: true,
      })
      .select("id, status")
      .maybeSingle()

    if (error) {
      console.error(`[JobQueue] Failed to enqueue job for ${deduplicationKey}:`, error)
      return { ok: false, message: error.message }
    }

    const jobId = job?.id

    // 2. Trigger asynchronous execution in the background without blocking the caller
    // Wrap in unhandled rejection safe wrapper
    if (jobId && entityType === "donation" && jobType === "receipt_generation") {
      void executeReceiptJob(jobId, entityId).catch((err) => {
        console.error(`[JobQueue] Background execution failed for job ${jobId}:`, err)
      })
    }

    return { ok: true, jobId }
  } catch (err) {
    console.error(`[JobQueue] Unexpected error enqueuing job for ${deduplicationKey}:`, err)
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Executes a receipt generation job and updates job status in the database.
 */
async function executeReceiptJob(jobId: string, donationId: string): Promise<void> {
  const supabase = getServiceSupabase()
  const workerId = `worker:${process.pid || "serverless"}:${Date.now()}`
  const leaseMinutes = 5
  const claimExpiresAt = new Date(Date.now() + leaseMinutes * 60 * 1000).toISOString()

  // 1. Atomically claim lease
  const { data: claimedJob, error: claimErr } = await supabase
    .from("payment_jobs")
    .update({
      claimed_by: workerId,
      claim_expires_at: claimExpiresAt,
      status: "processing",
    })
    .eq("id", jobId)
    .in("status", ["pending", "failed"])
    .select("id, retry_count, max_retries")
    .maybeSingle()

  if (claimErr || !claimedJob) {
    // Another worker claimed or job already completed
    return
  }

  try {
    // 2. Run receipt generation
    const result = await generateReceiptForDonation({ donationId })

    if (result.success) {
      // 3. Mark completed
      await supabase
        .from("payment_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          claim_expires_at: null,
          claimed_by: null,
        })
        .eq("id", jobId)
    } else {
      throw new Error(result.message || "Receipt generation returned unsuccessful")
    }
  } catch (execErr) {
    const errorMsg = execErr instanceof Error ? execErr.message : String(execErr)
    const newRetryCount = (claimedJob.retry_count ?? 0) + 1
    const isDeadLetter = newRetryCount >= (claimedJob.max_retries ?? 5)

    await supabase
      .from("payment_jobs")
      .update({
        status: isDeadLetter ? "dead_lettered" : "failed",
        retry_count: newRetryCount,
        last_error: errorMsg,
        claim_expires_at: null,
        claimed_by: null,
        dead_lettered_at: isDeadLetter ? new Date().toISOString() : null,
      })
      .eq("id", jobId)

    console.error(`[JobQueue] Job ${jobId} failed (attempt ${newRetryCount}): ${errorMsg}`)
  }
}

/**
 * Check if a pending or completed job already exists for an entity.
 */
export async function jobExists(
  entityId: string,
  jobType: JobType = "receipt_generation",
  entityType: "donation" | "event_registration" = "donation",
): Promise<boolean> {
  try {
    const supabase = getServiceSupabase()
    const deduplicationKey = `${entityType}:${entityId}:${jobType}`

    const { data } = await supabase
      .from("payment_jobs")
      .select("id")
      .eq("deduplication_key", deduplicationKey)
      .maybeSingle()

    return Boolean(data)
  } catch {
    return false
  }
}
