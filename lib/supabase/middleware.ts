import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // A DNS outage or a paused/deleted Supabase project makes `getUser()` throw
  // instead of returning an auth error. Let public requests continue, but
  // never allow an admin route through when we cannot verify its session.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
  try {
    ;({
      data: { user },
    } = await supabase.auth.getUser())
  } catch {
    if (!request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname === "/admin/login") {
      return supabaseResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("error", "authentication_unavailable")
    return NextResponse.redirect(url)
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/admin/login") {
      // If user is already logged in, redirect to admin dashboard
      if (user) {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("role, is_active")
          .eq("user_id", user.id)
          .single()

        if (adminUser?.is_active) {
          const url = request.nextUrl.clone()
          url.pathname = "/admin"
          return NextResponse.redirect(url)
        }
      }
      return supabaseResponse
    }

    // For all other admin routes, require authentication
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    // Check if user is an active admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single()

    if (!adminUser || !adminUser.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      url.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(url)
    }

    // Finance role can only access specific routes
    if (adminUser.role === "FINANCE") {
      const allowedPaths = ["/admin", "/admin/donations", "/admin/reports"]
      const isAllowed = allowedPaths.some(
        (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"),
      )
      if (!isAllowed) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
