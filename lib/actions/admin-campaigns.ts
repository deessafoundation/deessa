"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import {
  type NewsletterCampaign,
  fetchNewsletterCampaignById,
} from "@/lib/data/newsletter"
import {
  sendTestNewsletterEmail,
  sendNewsletterCampaignBatch,
  type RecipientInfo,
} from "@/lib/email/newsletter-mailer"
import { logAdminActivity } from "@/lib/audit/audit-logger"

async function getAuthorizedAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Administrator session required")
  }
  if (!hasPermission(admin.role, "newsletters")) {
    throw new Error("Forbidden: Insufficient permissions for Newsletter management")
  }
  return admin
}

export interface SaveCampaignDraftInput {
  id?: string
  title: string
  subject: string
  previewText?: string | null
  contentHtml: string
  isPublic?: boolean
}

/**
 * Save or update a campaign draft
 */
export async function saveCampaignDraft(input: SaveCampaignDraftInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const title = input.title.trim()
    const subject = input.subject.trim()
    const previewText = input.previewText?.trim() || null
    const contentHtml = input.contentHtml.trim()
    const isPublic = input.isPublic !== false

    if (!title || !subject || !contentHtml) {
      return { success: false, error: "Please provide a campaign title, subject, and content" }
    }

    if (input.id) {
      // Update existing draft
      const { data: updated, error } = await serviceSupabase
        .from("newsletter_campaigns")
        .update({
          title,
          subject,
          preview_text: previewText,
          content_html: contentHtml,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select("*")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      void logAdminActivity({
        action: "NEWSLETTER_CAMPAIGN_UPDATED",
        domain: "CONTENT",
        entityType: "newsletter_campaigns",
        entityId: input.id,
        description: `Updated campaign draft "${title}"`,
        newData: { title, subject, isPublic },
      })

      revalidatePath("/admin/newsletter")
      return { success: true, campaign: updated as NewsletterCampaign }
    } else {
      // Insert new draft
      const { data: inserted, error } = await serviceSupabase
        .from("newsletter_campaigns")
        .insert({
          title,
          subject,
          preview_text: previewText,
          content_html: contentHtml,
          status: "draft",
          is_public: isPublic,
          created_by: admin.email || admin.full_name,
        })
        .select("*")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      void logAdminActivity({
        action: "NEWSLETTER_CAMPAIGN_CREATED",
        domain: "CONTENT",
        entityType: "newsletter_campaigns",
        entityId: inserted.id,
        description: `Created campaign draft "${title}"`,
        newData: { title, subject, isPublic },
      })

      revalidatePath("/admin/newsletter")
      return { success: true, campaign: inserted as NewsletterCampaign }
    }
  } catch (err) {
    console.error("[saveCampaignDraft Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save campaign",
    }
  }
}

/**
 * Delete a campaign draft
 */
export async function deleteCampaignDraft(id: string) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error } = await serviceSupabase
      .from("newsletter_campaigns")
      .delete()
      .eq("id", id)
      .neq("status", "sending") // Never delete while actively broadcasting

    if (error) {
      return { success: false, error: error.message }
    }

    void logAdminActivity({
      action: "NEWSLETTER_CAMPAIGN_DELETED",
      domain: "CONTENT",
      entityType: "newsletter_campaigns",
      entityId: id,
      description: `Deleted campaign draft ${id}`,
    })

    revalidatePath("/admin/newsletter")
    return { success: true }
  } catch (err) {
    console.error("[deleteCampaignDraft Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete campaign",
    }
  }
}

/**
 * Dispatch an internal test email to verify before broadcasting
 */
export async function sendTestCampaignEmailAction({
  subject,
  previewText,
  contentHtml,
  testEmail,
}: {
  subject: string
  previewText?: string | null
  contentHtml: string
  testEmail: string
}) {
  try {
    await getAuthorizedAdmin()

    if (!testEmail || !testEmail.includes("@")) {
      return { success: false, error: "Please enter a valid test recipient email" }
    }

    return await sendTestNewsletterEmail({
      toEmail: testEmail.trim(),
      subject,
      previewText,
      contentHtml,
    })
  } catch (err) {
    console.error("[sendTestCampaignEmailAction Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send test email",
    }
  }
}

/**
 * Broadcast campaign to all active subscribers using chunked batch throttling
 */
export async function broadcastCampaignAction(campaignId: string) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const campaign = await fetchNewsletterCampaignById(campaignId)
    if (!campaign) {
      return { success: false, error: "Campaign not found" }
    }

    if (campaign.status === "sent") {
      return { success: false, error: "This campaign has already been broadcast" }
    }

    if (campaign.status === "sending") {
      return { success: false, error: "Campaign is currently being broadcast" }
    }

    // 1. Mark campaign as sending
    await serviceSupabase
      .from("newsletter_campaigns")
      .update({ status: "sending", updated_at: new Date().toISOString() })
      .eq("id", campaignId)

    // 2. Fetch all active subscribers
    const { data: subscribers, error: fetchSubsError } = await serviceSupabase
      .from("newsletter_subscriptions")
      .select("id, email, name, unsubscribe_token")
      .or("status.eq.active,is_active.eq.true")

    if (fetchSubsError) {
      await serviceSupabase
        .from("newsletter_campaigns")
        .update({ status: "draft" })
        .eq("id", campaignId)
      return { success: false, error: "Failed to load active subscribers" }
    }

    if (!subscribers || subscribers.length === 0) {
      await serviceSupabase
        .from("newsletter_campaigns")
        .update({ status: "draft" })
        .eq("id", campaignId)
      return { success: false, error: "There are no active subscribers to broadcast to" }
    }

    // Ensure all subscribers have a valid token
    const recipients: RecipientInfo[] = subscribers.map((s) => ({
      email: s.email,
      name: s.name,
      unsubscribe_token: s.unsubscribe_token || crypto.randomUUID(),
    }))

    // 3. Dispatch chunked batch delivery
    const result = await sendNewsletterCampaignBatch({
      campaignId,
      subject: campaign.subject,
      previewText: campaign.preview_text,
      contentHtml: campaign.content_html,
      recipients,
    })

    const nowIso = new Date().toISOString()

    // 4. Update campaign status & metrics
    await serviceSupabase
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        recipients_count: result.total,
        success_count: result.sent,
        failure_count: result.failed,
        sent_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", campaignId)

    // 5. Update last_emailed_at on active subscribers
    const successfulEmails = recipients
      .filter((r) => !result.errors.some((e) => e.startsWith(r.email)))
      .map((r) => r.email)

    if (successfulEmails.length > 0) {
      await serviceSupabase
        .from("newsletter_subscriptions")
        .update({
          last_emailed_at: nowIso,
          updated_at: nowIso,
        })
        .in("email", successfulEmails)
    }

    // 6. Audit log
    void logAdminActivity({
      action: "NEWSLETTER_CAMPAIGN_BROADCAST",
      domain: "CONTENT",
      entityType: "newsletter_campaigns",
      entityId: campaignId,
      description: `Broadcasted newsletter campaign "${campaign.title}" to ${result.total} recipients (${result.sent} sent, ${result.failed} failed)`,
      newData: {
        title: campaign.title,
        recipients: result.total,
        sent: result.sent,
        failed: result.failed,
      },
    })

    revalidatePath("/admin/newsletter")
    revalidatePath("/newsletter-archive")

    return {
      success: true,
      recipientsCount: result.total,
      successCount: result.sent,
      failureCount: result.failed,
    }
  } catch (err) {
    console.error("[broadcastCampaignAction Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to broadcast campaign",
    }
  }
}
