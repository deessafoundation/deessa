import type { SupabaseClient } from "@supabase/supabase-js"

const RESERVED_SLUGS = new Set([
  "new", "edit", "api", "admin", "demo", "search", "categories",
  "all", "drafts", "published", "archived", "settings",
])

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

export async function uniqueSlug(
  supabase: SupabaseClient,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title)
  if (!base) return "program"

  let candidate = base
  let suffix = 1

  while (RESERVED_SLUGS.has(candidate) || await slugExists(supabase, candidate, excludeId)) {
    candidate = `${base}-${suffix}`
    suffix++
    if (suffix > 999) throw new Error("Could not generate unique slug")
  }

  return candidate
}

async function slugExists(
  supabase: SupabaseClient,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("programs")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { count, error } = await query
  if (error) return false
  return (count ?? 0) > 0
}
