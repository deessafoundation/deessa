"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendWelcomeNewsletterEmail } from "@/lib/email/newsletter-mailer"

export type ActionResult = {
  success: boolean
  message: string
  error?: string
}

export interface SubscribeNewsletterOptions {
  name?: string | null
  source?: string
}

/**
 * Public subscription action with rate limiting, deduplication,
 * reactivation of unsubscribed emails, and automated welcome email dispatch.
 */
export async function subscribeToNewsletter(
  email: string,
  options: SubscribeNewsletterOptions = {}
): Promise<ActionResult> {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = options.name?.trim() || null
    const source = options.source || "footer"

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "Please provide a valid email address." }
    }

    // 1. Rate Limiting Protection (5 attempts per 30 minutes per email)
    const rateLimit = await checkRateLimit({
      identifier: `newsletter:${cleanEmail}`,
      maxAttempts: 5,
      windowMinutes: 30,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Too many subscription requests. Please try again in a few minutes.",
      }
    }

    const serviceSupabase = createServiceRoleClient()

    // 2. Check for existing subscription
    const { data: existing, error: selectError } = await serviceSupabase
      .from("newsletter_subscriptions")
      .select("id, email, status, is_active, unsubscribe_token")
      .eq("email", cleanEmail)
      .maybeSingle()

    if (selectError) {
      console.error("[subscribeToNewsletter] Lookup error:", selectError)
    }

    const unsubscribeToken = existing?.unsubscribe_token || crypto.randomUUID()

    if (existing) {
      const isCurrentlyActive = existing.is_active !== false && existing.status !== "unsubscribed"

      if (isCurrentlyActive) {
        return {
          success: true,
          message: "You're already subscribed to our newsletter! Thank you for staying connected.",
        }
      }

      // Reactivate previously unsubscribed contact
      const { error: updateError } = await serviceSupabase
        .from("newsletter_subscriptions")
        .update({
          name: cleanName || existing.name,
          status: "active",
          is_active: true,
          unsubscribed_at: null,
          unsubscribe_token: unsubscribeToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[subscribeToNewsletter] Reactivation error:", updateError)
        return { success: false, message: "Failed to update your subscription. Please try again." }
      }

      // Send welcome back email (fire-and-forget)
      sendWelcomeNewsletterEmail({
        email: cleanEmail,
        name: cleanName,
        unsubscribeToken,
      }).catch((err) => console.error("Welcome email error:", err))

      return {
        success: true,
        message: "Welcome back! Your newsletter subscription has been reactivated.",
      }
    }

    // 3. Insert brand new subscriber
    const { error: insertError } = await serviceSupabase
      .from("newsletter_subscriptions")
      .insert({
        email: cleanEmail,
        name: cleanName,
        source,
        status: "active",
        is_active: true,
        unsubscribe_token: unsubscribeToken,
      })

    if (insertError) {
      console.error("[subscribeToNewsletter] Insert error:", insertError)
      return {
        success: false,
        message: "Failed to process your subscription. Please try again.",
        error: insertError.message,
      }
    }

    // 4. Send welcome email (fire-and-forget)
    sendWelcomeNewsletterEmail({
      email: cleanEmail,
      name: cleanName,
      unsubscribeToken,
    }).catch((err) => console.error("Welcome email error:", err))

    return {
      success: true,
      message: "Thank you for subscribing! We've sent a welcome email to your inbox.",
    }
  } catch (err) {
    console.error("[subscribeToNewsletter Exception]:", err)
    return { success: false, message: "An unexpected error occurred. Please try again." }
  }
}
