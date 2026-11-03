import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function copyCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
  return target
}

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

  const pathname = request.nextUrl.pathname
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminApi = pathname.startsWith("/api/admin")

  // Fast path for non-admin requests
  if (!isAdminPage && !isAdminApi) {
    return supabaseResponse
  }

  // A DNS outage or a paused/deleted Supabase project makes `getUser()` throw
  // instead of returning an auth error. Never allow an admin route through when we cannot verify its session.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
  try {
    ;({
      data: { user },
    } = await supabase.auth.getUser())
  } catch {
    if (isAdminApi) {
      const response = NextResponse.json({ error: "Authentication service temporarily unavailable" }, { status: 503 })
      return copyCookies(supabaseResponse, response)
    }

    if (pathname === "/admin/login") {
      return supabaseResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("error", "authentication_unavailable")
    const response = NextResponse.redirect(url)
    return copyCookies(supabaseResponse, response)
  }

  // =========================================================================
  // 1. Guard Admin API Routes (/api/admin/*) -> Return Structured JSON 401/403
  // =========================================================================
  if (isAdminApi) {
    if (!user) {
      const response = NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 })
      return copyCookies(supabaseResponse, response)
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single()

    if (!adminUser || !adminUser.is_active) {
      const response = NextResponse.json(
        { error: "Forbidden - Inactive or non-admin account" },
        { status: 403 }
      )
      return copyCookies(supabaseResponse, response)
    }

    // Role restrictions for Finance
    if (adminUser.role === "FINANCE") {
      const allowedFinanceApiPaths = ["/api/admin/donations", "/api/admin/payments"]
      const isAllowed = allowedFinanceApiPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      )
      if (!isAllowed) {
        const response = NextResponse.json(
          { error: "Forbidden - Insufficient permissions for Finance role" },
          { status: 403 }
        )
        return copyCookies(supabaseResponse, response)
      }
    }

    return supabaseResponse
  }

  // =========================================================================
  // 2. Guard Admin Page Routes (/admin/*) -> Redirect to /admin/login
  // =========================================================================
  if (isAdminPage) {
    // Exemption: Setup page component checks if setup is still required
    if (pathname === "/admin/setup") {
      return supabaseResponse
    }

    // Login page handling
    if (pathname === "/admin/login") {
      // If user is already logged in as active admin, redirect to dashboard or original target
      if (user) {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("role, is_active")
          .eq("user_id", user.id)
          .single()

        if (adminUser?.is_active) {
          const redirectTo = request.nextUrl.searchParams.get("redirect") || "/admin"
          const url = new URL(redirectTo, request.url)
          const response = NextResponse.redirect(url)
          return copyCookies(supabaseResponse, response)
        }
      }
      return supabaseResponse
    }

    // For all other admin pages, require authentication
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      const targetPath = request.nextUrl.pathname + request.nextUrl.search
      if (targetPath && targetPath !== "/admin") {
        url.searchParams.set("redirect", targetPath)
      }
      const response = NextResponse.redirect(url)
      return copyCookies(supabaseResponse, response)
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
      const response = NextResponse.redirect(url)
      return copyCookies(supabaseResponse, response)
    }

    // Finance role can only access specific routes
    if (adminUser.role === "FINANCE") {
      const allowedPaths = ["/admin", "/admin/donations", "/admin/reports", "/admin/profile"]
      const isAllowed = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      )
      if (!isAllowed) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        const response = NextResponse.redirect(url)
        return copyCookies(supabaseResponse, response)
      }
    }
  }

  return supabaseResponse
}
