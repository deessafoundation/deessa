/**
 * Admin Donation Review Actions
 * Server actions for reviewing and approving/rejecting donations in REVIEW status
 */

"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { generateReceiptForDonation } from "./donation-receipt"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role env vars")
  return createServiceClient(url, key)
}

export type ReviewDonationInput = {
  donationId: string
  decision: "approve" | "reject"
  notes: string
}

export type ReviewDonationResult = {
  success: boolean
  message: string
  newStatus?: string
}

/**
 * Review a donation in REVIEW status
 * Approves or rejects the donation based on admin decision
 */
export async function reviewDonation(
  input: ReviewDonationInput
): Promise<ReviewDonationResult> {
  try {
    const supabase = await createClient()
    const serviceSupabase = getServiceSupabase()

    // 1. Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Unauthorized: No active user session",
      }
    }

    // 2. Verify admin user
    const { data: adminUser, error: adminError } = await serviceSupabase
      .from("admin_users")
      .select("id, role, full_name")
      .eq("user_id", user.id)
      .single()

    if (adminError || !adminUser) {
      return {
        success: false,
        message: "Unauthorized: Not registered as an admin user",
      }
    }

    // 3. Get donation details
    const { data: donation, error: fetchError } = await serviceSupabase
      .from("donations")
      .select("*")
      .eq("id", input.donationId)
      .single()

    if (fetchError || !donation) {
      return {
        success: false,
        message: "Donation record not found",
      }
    }

    // 4. Verify donation is in REVIEW status
    if (donation.payment_status !== "review") {
      return {
        success: false,
        message: `Donation is not in review status (current status: ${donation.payment_status})`,
      }
    }

    const timestamp = new Date().toISOString()

    if (input.decision === "approve") {
      // 5A. Approve: Update status to "completed" and review_status to "verified"
      // NOTE: review_notes is a separate table, NOT a column on donations
      const { error: updateError } = await serviceSupabase
        .from("donations")
        .update({
          payment_status: "completed",
          review_status: "verified",
          confirmed_at: timestamp,
          reviewed_by: adminUser.id,
          reviewed_at: timestamp,
        })
        .eq("id", input.donationId)
        .eq("payment_status", "review")

      if (updateError) {
        console.error("Error updating donation status to completed:", updateError)
        return {
          success: false,
          message: `Failed to update donation status: ${updateError.message}`,
        }
      }

      // Record in review_notes table
      await serviceSupabase.from("review_notes").insert({
        donation_id: input.donationId,
        admin_user_id: adminUser.id,
        note_text: input.notes,
        created_at: timestamp,
      })

      // Record in status_change_log table
      await serviceSupabase.from("status_change_log").insert({
        donation_id: input.donationId,
        admin_user_id: adminUser.id,
        old_status: "review",
        new_status: "completed",
        reason: input.notes,
        created_at: timestamp,
      })

      // Trigger receipt generation (fire-and-forget)
      generateReceiptForDonation({ donationId: input.donationId })
        .then((result) => {
          if (!result.success) {
            console.error("Receipt generation failed after review approval:", result.message)
          }
        })
        .catch((error) => {
          console.error("Receipt generation error after review approval:", error)
        })

      // Log audit event to payment_events
      await serviceSupabase.from("payment_events").insert({
        provider: "system",
        event_id: `review_approved:${input.donationId}:${Date.now()}`,
        donation_id: input.donationId,
        event_type: "review_approved",
        raw_payload: {
          admin_id: adminUser.id,
          admin_email: user.email,
          admin_name: adminUser.full_name,
          decision: "approved",
          notes: input.notes,
          timestamp,
        },
      })

      // Revalidate affected routes
      revalidatePath("/admin/donations")
      revalidatePath("/admin/donations/review")
      revalidatePath("/admin/donations/review/audit")
      revalidatePath(`/admin/donations/${input.donationId}`)

      return {
        success: true,
        message: "Donation verified and marked as completed successfully.",
        newStatus: "completed",
      }
    } else {
      // 5B. Reject: Update status to "failed" and review_status to "flagged"
      const { error: updateError } = await serviceSupabase
        .from("donations")
        .update({
          payment_status: "failed",
          review_status: "flagged",
          reviewed_by: adminUser.id,
          reviewed_at: timestamp,
        })
        .eq("id", input.donationId)
        .eq("payment_status", "review")

      if (updateError) {
        console.error("Error updating donation status to failed:", updateError)
        return {
          success: false,
          message: `Failed to update donation status: ${updateError.message}`,
        }
      }

      // Record in review_notes table
      await serviceSupabase.from("review_notes").insert({
        donation_id: input.donationId,
        admin_user_id: adminUser.id,
        note_text: input.notes,
        created_at: timestamp,
      })

      // Record in status_change_log table
      await serviceSupabase.from("status_change_log").insert({
        donation_id: input.donationId,
        admin_user_id: adminUser.id,
        old_status: "review",
        new_status: "failed",
        reason: input.notes,
        created_at: timestamp,
      })

      // Log audit event to payment_events
      await serviceSupabase.from("payment_events").insert({
        provider: "system",
        event_id: `review_rejected:${input.donationId}:${Date.now()}`,
        donation_id: input.donationId,
        event_type: "review_rejected",
        raw_payload: {
          admin_id: adminUser.id,
          admin_email: user.email,
          admin_name: adminUser.full_name,
          decision: "rejected",
          notes: input.notes,
          timestamp,
        },
      })

      // Send donor notification email if email credentials configured
      try {
        const googleEmail = process.env.GOOGLE_EMAIL
        const googleAppPassword = process.env.GOOGLE_APP_PASSWORD

        if (googleEmail && googleAppPassword && donation.donor_email) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: googleEmail,
              pass: googleAppPassword,
            },
          })

          await transporter.sendMail({
            from: googleEmail,
            to: donation.donor_email,
            subject: "Donation Payment Issue - Action Required",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <h2 style="color: #0b5f8a;">Donation Verification Notice</h2>
                <p>Dear ${donation.donor_name || "Valued Supporter"},</p>
                <p>We are contacting you regarding your donation pledge. Following our administrative cross-verification, we were unable to confirm this transaction.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #f43f5e; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                  <strong>Reason recorded by staff:</strong><br/>
                  ${input.notes}
                </div>
                <p>If you have questions or made a deposit that needs verification, please reply to this email or visit our website to submit a new donation.</p>
                <p>Thank you for your understanding and ongoing support of our mission.</p>
                <p>Warm regards,<br/><strong>Finance & Governance Team</strong><br/>Deesha Education Foundation</p>
              </div>
            `,
          })
        }
      } catch (emailError) {
        console.error("Failed to send rejection email (non-fatal):", emailError)
      }

      // Revalidate affected routes
      revalidatePath("/admin/donations")
      revalidatePath("/admin/donations/review")
      revalidatePath("/admin/donations/review/audit")
      revalidatePath(`/admin/donations/${input.donationId}`)

      return {
        success: true,
        message: "Donation flagged as failed and audit note recorded.",
        newStatus: "failed",
      }
    }
  } catch (error) {
    console.error("reviewDonation server action error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected server error occurred during review.",
    }
  }
}
