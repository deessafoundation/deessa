import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const rawNext = requestUrl.searchParams.get("next") || "/admin/reset-password"
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Prevent open redirect: Ensure destination strictly starts with /admin
  const next =
    rawNext.startsWith("/admin") && !rawNext.startsWith("/admin/login")
      ? rawNext
      : "/admin/reset-password"

  if (errorDescription) {
    const redirectUrl = new URL("/admin/login", request.url)
    redirectUrl.searchParams.set("error", "recovery_link_expired")
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Fallback: If code is missing or exchange failed, redirect to login with informative error
  const redirectUrl = new URL("/admin/login", request.url)
  redirectUrl.searchParams.set("error", "invalid_recovery_link")
  return NextResponse.redirect(redirectUrl)
}
