import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a mock chainable client for build-time static generation
 * when Supabase environment variables are not supplied (e.g. preview builds).
 */
function createMockStaticClient(): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === "then") {
        return (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve)
      }
      if (prop === "catch") {
        return (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject)
      }
      return () => new Proxy({}, handler)
    },
  }

  return {
    from: () => new Proxy({}, handler),
    rpc: () => Promise.resolve({ data: null, error: null }),
  }
}

/**
 * Creates a Supabase client for static generation contexts.
 * This client doesn't use cookies and is suitable for generateStaticParams
 * and other build-time functions that don't have access to request context.
 *
 * If credentials are not present during build, it safely falls back to a mock client,
 * preventing deployment halts while allowing pages to be rendered dynamically at runtime.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[lib/supabase/static] Supabase URL or Anon Key is missing at build time. Falling back to safe mock client."
      )
    }
    return createMockStaticClient() as SupabaseClient
  }

  try {
    return createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.warn("[lib/supabase/static] Error initializing Supabase static client:", error)
    return createMockStaticClient() as SupabaseClient
  }
}
