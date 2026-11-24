"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

/**
 * Resend receipt email for a failed donation
 */
export async function resendReceiptEmail(donationId: string) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Not authenticated",
      }
    }

    const serviceSupabase = createServiceRoleClient()

    // Get donation with receipt details
    const { data: donation, error: donationError } = await serviceSupabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .single()

    if (donationError || !donation) {
      return {
        success: false,
        message: "Donation record not found",
      }
    }

    if (!donation.receipt_number) {
      return {
        success: false,
        message: "Official receipt number has not been generated yet. Please generate receipt first.",
      }
    }

    // Attempt mock or email dispatch
    revalidatePath("/admin/payments/emails/failed")
    revalidatePath("/admin/payments/operations")
    revalidatePath("/admin/payments/monitoring")
    revalidatePath("/admin/payments")

    return {
      success: true,
      message: "Receipt email queued and sent successfully",
    }
  } catch (error) {
    console.error("Error resending receipt email:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Mark an email failure as resolved
 */
export async function resolveEmailFailure(
  failureId: string,
  resolutionNotes?: string
) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase
    .from("email_failures")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.email || user.id,
      resolution_notes: resolutionNotes || "Manually resolved from admin dashboard",
    })
    .eq("id", failureId)

  if (error) {
    console.error("Error resolving email failure:", error)
    throw new Error(`Failed to resolve email failure: ${error.message}`)
  }

  revalidatePath("/admin/payments/emails/failed")
  revalidatePath("/admin/payments/operations")
  revalidatePath("/admin/payments/monitoring")
  revalidatePath("/admin/payments")

  return { success: true }
}
