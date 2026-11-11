"use server"

import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import {
  type SubscriberStatus,
  normalizeSubscriber,
} from "@/lib/data/newsletter"
import { sendWelcomeNewsletterEmail } from "@/lib/email/newsletter-mailer"

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

export interface AddSubscriberInput {
  email: string
  name?: string
  source?: string
  sendWelcome?: boolean
}

/**
 * Add a new subscriber manually from the admin portal
 */
export async function addNewsletterSubscriber(input: AddSubscriberInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const email = input.email.trim().toLowerCase()
    const name = input.name?.trim() || null
    const source = input.source || "manual_admin"

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Check existing
    const { data: existing } = await serviceSupabase
      .from("newsletter_subscriptions")
      .select("id, email, status, is_active, unsubscribe_token")
      .eq("email", email)
      .maybeSingle()

    let recordId: string
    let unsubscribeToken: string

    if (existing) {
      recordId = existing.id
      unsubscribeToken = existing.unsubscribe_token || crypto.randomUUID()

      await serviceSupabase
        .from("newsletter_subscriptions")
        .update({
          name: name || existing.name,
          status: "active",
          is_active: true,
          unsubscribed_at: null,
          unsubscribe_token: unsubscribeToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      unsubscribeToken = crypto.randomUUID()
      const { data: inserted, error: insertError } = await serviceSupabase
        .from("newsletter_subscriptions")
        .insert({
          email,
          name,
          source,
          status: "active",
          is_active: true,
          unsubscribe_token: unsubscribeToken,
        })
        .select("id")
        .single()

      if (insertError) {
        return { success: false, error: insertError.message }
      }
      recordId = inserted.id
    }

    // Optional welcome email
    if (input.sendWelcome) {
      sendWelcomeNewsletterEmail({
        email,
        name,
        unsubscribeToken,
      }).catch((err) => console.error("Welcome email error:", err))
    }

    // Audit log
    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "CREATE",
      entity_type: "newsletter_subscription",
      entity_id: recordId,
      new_data: { email, name, source },
    })

    revalidatePath("/admin/newsletter")
    return { success: true }
  } catch (err) {
    console.error("[addNewsletterSubscriber Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add subscriber",
    }
  }
}

/**
 * Toggle subscriber active/unsubscribed status
 */
export async function toggleSubscriberStatus(id: string, currentStatus: SubscriberStatus) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const newStatus: SubscriberStatus = currentStatus === "active" ? "unsubscribed" : "active"
    const isActive = newStatus === "active"

    const { data: updated, error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .update({
        status: newStatus,
        is_active: isActive,
        unsubscribed_at: isActive ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "UPDATE",
      entity_type: "newsletter_subscription",
      entity_id: id,
      new_data: { status: newStatus, is_active: isActive },
    })

    revalidatePath("/admin/newsletter")
    return { success: true, subscriber: normalizeSubscriber(updated) }
  } catch (err) {
    console.error("[toggleSubscriberStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update subscriber status",
    }
  }
}

export interface UpdateSubscriberInput {
  id: string
  name?: string | null
  status: SubscriberStatus
  source?: string
}

/**
 * Update subscriber details from the administrative dossier
 */
export async function updateSubscriberDetails(input: UpdateSubscriberInput) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const isActive = input.status === "active"

    const { data: updated, error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .update({
        name: input.name ? input.name.trim() : null,
        status: input.status,
        is_active: isActive,
        source: input.source || "manual_admin",
        unsubscribed_at: isActive ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("*")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "UPDATE",
      entity_type: "newsletter_subscription",
      entity_id: input.id,
      new_data: { name: input.name, status: input.status, source: input.source },
    })

    revalidatePath("/admin/newsletter")
    return { success: true, subscriber: normalizeSubscriber(updated) }
  } catch (err) {
    console.error("[updateSubscriberDetails Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update subscriber details",
    }
  }
}

/**
 * Send an on-demand welcome / introduction email to an existing subscriber
 */
export async function sendManualWelcomeEmail(subscriberId: string) {
  try {
    await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { data: sub, error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .select("email, name, unsubscribe_token")
      .eq("id", subscriberId)
      .single()

    if (error || !sub) {
      return { success: false, error: "Subscriber not found" }
    }

    const token = sub.unsubscribe_token || crypto.randomUUID()
    const result = await sendWelcomeNewsletterEmail({
      email: sub.email,
      name: sub.name,
      unsubscribeToken: token,
    })

    return result
  } catch (err) {
    console.error("[sendManualWelcomeEmail Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch welcome email",
    }
  }
}

/**
 * Delete a subscriber permanently
 */
export async function deleteNewsletterSubscriber(id: string) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "DELETE",
      entity_type: "newsletter_subscription",
      entity_id: id,
    })

    revalidatePath("/admin/newsletter")
    return { success: true }
  } catch (err) {
    console.error("[deleteNewsletterSubscriber Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete subscriber",
    }
  }
}

/**
 * Bulk update subscriber status
 */
export async function bulkUpdateSubscriberStatus(ids: string[], newStatus: SubscriberStatus) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const isActive = newStatus === "active"

    const { error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .update({
        status: newStatus,
        is_active: isActive,
        unsubscribed_at: isActive ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)

    if (error) {
      return { success: false, error: error.message }
    }

    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "BULK_UPDATE",
      entity_type: "newsletter_subscription",
      new_data: { count: ids.length, status: newStatus },
    })

    revalidatePath("/admin/newsletter")
    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkUpdateSubscriberStatus Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk update subscribers",
    }
  }
}

/**
 * Bulk delete subscribers
 */
export async function bulkDeleteSubscribers(ids: string[]) {
  try {
    const admin = await getAuthorizedAdmin()
    const serviceSupabase = createServiceRoleClient()

    const { error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .delete()
      .in("id", ids)

    if (error) {
      return { success: false, error: error.message }
    }

    await serviceSupabase.from("activity_logs").insert({
      user_id: admin.user_id,
      action: "BULK_DELETE",
      entity_type: "newsletter_subscription",
      new_data: { count: ids.length },
    })

    revalidatePath("/admin/newsletter")
    return { success: true, count: ids.length }
  } catch (err) {
    console.error("[bulkDeleteSubscribers Error]:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to bulk delete subscribers",
    }
  }
}
