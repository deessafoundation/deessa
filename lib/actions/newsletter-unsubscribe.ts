"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { getSubscriberByToken } from "@/lib/data/newsletter"

export interface UnsubscribeResult {
  success: boolean
  email?: string
  error?: string
}

/**
 * Public action: safely unsubscribes a recipient by their unique cryptographic token.
 */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  try {
    const cleanToken = token.trim()
    if (!cleanToken) {
      return { success: false, error: "Invalid unsubscribe link" }
    }

    const subscriber = await getSubscriberByToken(cleanToken)
    if (!subscriber) {
      return { success: false, error: "Subscriber not found or link has expired" }
    }

    const serviceSupabase = createServiceRoleClient()
    const { error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .update({
        status: "unsubscribed",
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id)

    if (error) {
      console.error("[unsubscribeByToken Error]:", error)
      return { success: false, error: "Failed to update your subscription preferences" }
    }

    return { success: true, email: subscriber.email }
  } catch (err) {
    console.error("[unsubscribeByToken Exception]:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Public action: allows undoing an accidental unsubscription.
 */
export async function resubscribeByToken(token: string): Promise<UnsubscribeResult> {
  try {
    const cleanToken = token.trim()
    if (!cleanToken) {
      return { success: false, error: "Invalid link" }
    }

    const subscriber = await getSubscriberByToken(cleanToken)
    if (!subscriber) {
      return { success: false, error: "Subscriber not found" }
    }

    const serviceSupabase = createServiceRoleClient()
    const { error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .update({
        status: "active",
        is_active: true,
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id)

    if (error) {
      console.error("[resubscribeByToken Error]:", error)
      return { success: false, error: "Failed to reactivate your subscription" }
    }

    return { success: true, email: subscriber.email }
  } catch (err) {
    console.error("[resubscribeByToken Exception]:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}
