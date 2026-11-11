"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { sendVolunteerApplicationEmails } from "@/lib/email/volunteer-mailer"
import { revalidatePath } from "next/cache"

export type VolunteerFormData = {
  fullName: string
  email: string
  phone: string
  occupation?: string
  skills: string[]
  availability: string
  interests: string[]
  message?: string
}

export type ActionResult = {
  success: boolean
  message: string
  applicationId?: string
  error?: string
}

export async function submitVolunteerApplication(data: VolunteerFormData): Promise<ActionResult> {
  try {
    const serviceSupabase = createServiceRoleClient()

    // 1. Insert application record via service role client (bypasses RLS function issue for anon callers)
    const { data: application, error } = await serviceSupabase
      .from("volunteer_applications")
      .insert({
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        occupation: data.occupation?.trim() || null,
        skills: data.skills || [],
        availability: data.availability,
        interests: data.interests || [],
        message: data.message?.trim() || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[submitVolunteerApplication Error]:", error)
      return {
        success: false,
        message: "Failed to submit your application. Please check your information and try again.",
        error: error.message,
      }
    }

    // 2. Dispatch notifications in the background (fire-and-forget, non-blocking)
    void sendVolunteerApplicationEmails({
      id: application.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      occupation: data.occupation,
      skills: data.skills,
      availability: data.availability,
      interests: data.interests,
      message: data.message,
    }).catch((emailErr) => {
      console.warn("[submitVolunteerApplication] Background email dispatch warning:", emailErr)
    })

    // 3. Revalidate admin dashboards
    revalidatePath("/admin/volunteers")
    revalidatePath("/admin")

    return {
      success: true,
      message: "Thank you for your interest in volunteering! We will contact you soon.",
      applicationId: application.id,
    }
  } catch (err) {
    console.error("[submitVolunteerApplication Exception]:", err)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
