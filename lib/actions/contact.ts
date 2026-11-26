"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { sendContactEmails } from "@/lib/email/contact-mailer"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export type ActionResult = {
  success: boolean
  message: string
  error?: string
}

export async function submitContactForm(data: ContactFormData): Promise<ActionResult> {
  try {
    const trimmedName = data.name?.trim()
    const trimmedEmail = data.email?.trim().toLowerCase()
    const trimmedSubject = data.subject?.trim()
    const trimmedMessage = data.message?.trim()
    const trimmedPhone = data.phone?.trim() || null

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      return {
        success: false,
        message: "Please fill out all required fields.",
      }
    }

    // 1. Rate Limiting Check (by IP and Email)
    const headerList = await headers()
    const clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip")?.trim() ||
      "unknown"

    const [ipRateLimit, emailRateLimit] = await Promise.all([
      checkRateLimit({
        identifier: `contact:ip:${clientIp}`,
        maxAttempts: 5,
        windowMinutes: 15,
      }),
      checkRateLimit({
        identifier: `contact:email:${trimmedEmail}`,
        maxAttempts: 5,
        windowMinutes: 15,
      }),
    ])

    if (!ipRateLimit.allowed || !emailRateLimit.allowed) {
      return {
        success: false,
        message: "Too many messages sent. Please wait a few minutes before submitting again.",
      }
    }

    // 2. Insert into database using Service Role Client (bypasses RLS function execution for anon visitors)
    const serviceSupabase = createServiceRoleClient()

    const { data: record, error } = await serviceSupabase
      .from("contact_submissions")
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        subject: trimmedSubject,
        message: trimmedMessage,
        status: "open",
        reviewed: false,
        archived: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[submitContactForm Error]:", error)
      return {
        success: false,
        message: "Failed to submit your message. Please try again.",
        error: error.message,
      }
    }

    // 3. Dispatch emails in background (non-blocking)
    void sendContactEmails({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      subject: trimmedSubject,
      message: trimmedMessage,
    }).catch((err) => {
      console.error("[submitContactForm] Background email warning:", err)
    })

    // 4. Invalidate admin cache so new message appears in real-time
    revalidatePath("/admin/contacts")
    revalidatePath("/admin")

    return {
      success: true,
      message: "Thank you for your message! We will get back to you within 24 hours.",
    }
  } catch (err) {
    console.error("[submitContactForm Exception]:", err)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
