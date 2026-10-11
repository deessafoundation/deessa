"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { FACEBOOK_POST_COLUMNS, normalizeFacebookPostUrl, type FacebookPost } from "@/lib/facebook-posts/types"

const fields = z.object({
  id: z.uuid().optional(),
  post_url: z.string().max(8192),
  title: z.string().trim().min(1).max(120),
  image_url: z.string().max(2048).nullable(),
  image_alt: z.string().trim().max(300).nullable(),
  display_order: z.number().int().min(0).max(10000),
  is_published: z.boolean(),
  excerpt: z.string().trim().min(1).max(500).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  published_at: z.string().datetime().nullable().optional(),
})
type Result = { ok: true; id?: string } | { ok: false; error: string }

function databaseError(code: string): string {
  if (code === "23505") return "That Facebook post has already been added."
  if (code === "23514") return "The database rejected this entry. If migration 065 was pasted with a Markdown-formatted URL, apply 066-facebook-post-url-constraint.sql, then try again."
  if (code === "42P01" || code === "PGRST205") return "Community post storage is missing. Apply migration 065, then refresh."
  if (code === "42501") return "The database denied access. Check the community-post grants and server service-role configuration."
  return "Could not save the post. Please try again."
}

async function authorized() {
  const admin = await getCurrentAdmin()
  return !!admin && admin.is_active !== false && hasPermission(admin.role as AdminRole, "settings")
}

function refresh() {
  revalidatePath("/")
  revalidatePath("/community")
  revalidatePath("/admin/facebook-posts")
  revalidatePath("/admin/community-posts", "layout")
}

function validImage(value: string): boolean {
  if (/^\/(?!\/)[\w/.-]+\.(png|jpe?g|webp|avif)$/i.test(value)) return !value.includes("..")
  try {
    const image = new URL(value)
    const storage = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    return image.protocol === "https:" && !image.username && !image.password && image.origin === storage.origin
      && image.pathname.startsWith("/storage/v1/object/public/")
  } catch { return false }
}

export async function listFacebookPosts(
  page = 1,
  search?: string,
  status?: "published" | "draft" | "all"
): Promise<{ posts: FacebookPost[]; count: number; error: string | null }> {
  try {
    if (!await authorized()) return { posts: [], count: 0, error: "You do not have permission to manage community posts." }
    const current = Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1
    
    let query = createServiceRoleClient().from("facebook_posts").select(FACEBOOK_POST_COLUMNS, { count: "exact" })
    
    // Apply search filter
    if (search && search.trim()) {
      const term = search.trim()
      query = query.or(`title.ilike.%${term}%,post_url.ilike.%${term}%,excerpt.ilike.%${term}%`)
    }
    
    // Apply status filter
    if (status === "published") {
      query = query.eq("is_published", true)
    } else if (status === "draft") {
      query = query.eq("is_published", false)
    }
    
    const { data, count, error } = await query
      .order("display_order").order("created_at", { ascending: false }).order("id")
      .range((current - 1) * 50, current * 50 - 1)
    
    if (error) return { posts: [], count: 0, error: databaseError(error.code) }
    return { posts: (data ?? []) as FacebookPost[], count: count ?? 0, error: null }
  } catch { return { posts: [], count: 0, error: "Could not load community posts. Check the server database configuration and try again." } }
}

export async function getFacebookPost(id: string): Promise<{ post: FacebookPost | null; error: string | null }> {
  try {
    if (!await authorized()) return { post: null, error: "You do not have permission to manage community posts." }
    if (!z.uuid().safeParse(id).success) return { post: null, error: null }
    const { data, error } = await createServiceRoleClient().from("facebook_posts").select(FACEBOOK_POST_COLUMNS).eq("id", id).maybeSingle()
    return { post: data as FacebookPost | null, error: error ? databaseError(error.code) : null }
  } catch { return { post: null, error: "Could not load this post. Check the server database configuration and try again." } }
}

export async function saveFacebookPost(input: unknown): Promise<Result> {
  try {
    if (!await authorized()) return { ok: false, error: "You do not have permission to manage community posts." }
    const parsed = fields.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Enter a title (1–120 characters) and an order between 0 and 10000." }
    const { id, ...post } = parsed.data
    const url = normalizeFacebookPostUrl(post.post_url)
    if (!url) return { ok: false, error: "Paste a Facebook post link or official Facebook post iframe code. Page, video, and Reel links are not supported yet." }
    if (post.image_url && (!validImage(post.image_url) || !post.image_alt)) {
      return { ok: false, error: "Choose a photo from this site's media library and describe it for screen readers." }
    }
    
    // Build values with new fields
    const values = { 
      ...post, 
      post_url: url, 
      updated_at: new Date().toISOString(),
      excerpt: post.excerpt || null,
      tags: post.tags || [],
      published_at: post.published_at || null,
    }
    
    const db = createServiceRoleClient().from("facebook_posts")
    const result = id ? await db.update(values).eq("id", id).select("id").maybeSingle()
      : await db.insert(values).select("id").single()
    if (result.error) return { ok: false, error: databaseError(result.error.code) }
    if (!result.data) return { ok: false, error: "This entry no longer exists. Refresh the page." }
    refresh()
    return { ok: true, id: result.data.id }
  } catch { return { ok: false, error: "Could not save the post. Please try again." } }
}

export async function deleteFacebookPost(id: string): Promise<Result> {
  try {
    if (!await authorized()) return { ok: false, error: "You do not have permission to manage community posts." }
    if (!z.uuid().safeParse(id).success) return { ok: false, error: "Invalid post." }
    const { data, error } = await createServiceRoleClient().from("facebook_posts").delete().eq("id", id).select("id").maybeSingle()
    if (error || !data) return { ok: false, error: "Could not remove the entry. Refresh and try again." }
    refresh()
    return { ok: true }
  } catch { return { ok: false, error: "Could not remove the entry. Please try again." } }
}

// Bulk operations
export async function bulkUpdateFacebookPosts(
  ids: string[],
  action: "publish" | "unpublish" | "delete"
): Promise<Result> {
  try {
    if (!await authorized()) return { ok: false, error: "You do not have permission to manage community posts." }
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
      return { ok: false, error: "Select 1-50 posts to update." }
    }
    
    const validIds = ids.filter(id => z.uuid().safeParse(id).success)
    if (validIds.length !== ids.length) return { ok: false, error: "Invalid post selection." }
    
    const db = createServiceRoleClient().from("facebook_posts")
    
    if (action === "delete") {
      const { error } = await db.delete().in("id", validIds)
      if (error) return { ok: false, error: "Could not delete posts. Please try again." }
    } else {
      const is_published = action === "publish"
      const { error } = await db.update({ is_published, updated_at: new Date().toISOString() }).in("id", validIds)
      if (error) return { ok: false, error: "Could not update posts. Please try again." }
    }
    
    refresh()
    return { ok: true }
  } catch { return { ok: false, error: "Could not complete bulk action. Please try again." } }
}

// Reorder posts
export async function reorderFacebookPosts(reorderedIds: string[]): Promise<Result> {
  try {
    if (!await authorized()) return { ok: false, error: "You do not have permission to manage community posts." }
    if (!Array.isArray(reorderedIds) || reorderedIds.length === 0) {
      return { ok: false, error: "No posts to reorder." }
    }
    
    const validIds = reorderedIds.filter(id => z.uuid().safeParse(id).success)
    if (validIds.length !== reorderedIds.length) return { ok: false, error: "Invalid post IDs." }
    
    const db = createServiceRoleClient()
    
    // Update display_order for each post (0, 10, 20, 30...)
    const updates = validIds.map((id, index) => 
      db.from("facebook_posts").update({ display_order: index * 10, updated_at: new Date().toISOString() }).eq("id", id)
    )
    
    const results = await Promise.all(updates)
    const failed = results.filter(r => r.error)
    
    if (failed.length > 0) return { ok: false, error: "Could not reorder all posts. Please try again." }
    
    refresh()
    return { ok: true }
  } catch { return { ok: false, error: "Could not reorder posts. Please try again." } }
}

// Analytics tracking
export async function trackFacebookPostView(id: string): Promise<void> {
  try {
    if (!z.uuid().safeParse(id).success) return
    await createServiceRoleClient().rpc("increment_facebook_post_views", { post_id: id })
  } catch {
    // Silent fail for analytics
  }
}

export async function trackFacebookPostClick(id: string): Promise<void> {
  try {
    if (!z.uuid().safeParse(id).success) return
    await createServiceRoleClient().rpc("increment_facebook_post_clicks", { post_id: id })
  } catch {
    // Silent fail for analytics
  }
}
