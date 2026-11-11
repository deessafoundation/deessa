"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { generateReceiptForDonation } from "@/lib/actions/donation-receipt"
import { revalidatePath } from "next/cache"

/**
 * Retry receipt generation for a failed donation
 */
export async function retryReceiptGeneration(donationId: string) {
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

    const result = await generateReceiptForDonation({ donationId })

    // Revalidate the page to show updated data
    revalidatePath("/admin/payments/receipts/failed")
    revalidatePath("/admin/payments/operations")
    revalidatePath("/admin/payments/monitoring")
    revalidatePath("/admin/payments")

    return result
  } catch (error) {
    console.error("Error retrying receipt generation:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Mark a receipt failure as resolved
 */
export async function resolveReceiptFailure(
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
    .from("receipt_failures")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.email || user.id,
      resolution_notes: resolutionNotes || "Manually resolved from admin dashboard",
    })
    .eq("id", failureId)

  if (error) {
    console.error("Error resolving receipt failure:", error)
    throw new Error(`Failed to resolve failure: ${error.message}`)
  }

  revalidatePath("/admin/payments/receipts/failed")
  revalidatePath("/admin/payments/operations")
  revalidatePath("/admin/payments/monitoring")
  revalidatePath("/admin/payments")

  return { success: true }
}
