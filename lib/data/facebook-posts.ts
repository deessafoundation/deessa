import "server-only"
import { createClient } from "@/lib/supabase/static"
import { FACEBOOK_POST_COLUMNS, normalizeFacebookPostUrl, type FacebookPost } from "@/lib/facebook-posts/types"

export async function getHomepageFacebookPosts(): Promise<FacebookPost[]> {
  try {
    const { data, error } = await createClient().from("facebook_posts").select(FACEBOOK_POST_COLUMNS)
      .eq("is_published", true)
      .or("published_at.is.null,published_at.lte." + new Date().toISOString())
      .order("display_order").order("created_at", { ascending: false }).limit(3)
    if (error) return []
    return ((data ?? []) as FacebookPost[]).filter(post => normalizeFacebookPostUrl(post.post_url))
  } catch {
    // An unavailable optional community feed must not break the homepage.
    return []
  }
}

export async function getPublicFacebookPosts(page = 1, perPage = 12): Promise<{ posts: FacebookPost[]; count: number }> {
  try {
    const current = Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1
    const limit = [12, 24, 48].includes(perPage) ? perPage : 12
    
    const { data, count, error } = await createClient()
      .from("facebook_posts")
      .select(FACEBOOK_POST_COLUMNS, { count: "exact" })
      .eq("is_published", true)
      .or("published_at.is.null,published_at.lte." + new Date().toISOString())
      .order("created_at", { ascending: false })
      .order("id")
      .range((current - 1) * limit, current * limit - 1)
    
    if (error) return { posts: [], count: 0 }
    return { 
      posts: ((data ?? []) as FacebookPost[]).filter(post => normalizeFacebookPostUrl(post.post_url)), 
      count: count ?? 0 
    }
  } catch {
    return { posts: [], count: 0 }
  }
}

