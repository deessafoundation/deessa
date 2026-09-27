import { createClient } from "@/lib/supabase/server"
import { createClient as createStaticClient } from "@/lib/supabase/static"

const excerptEdits: Array<[string, string]> = [
  ["silence would last forever — until", "silence would last forever until"],
  ["classroom — and changed", "classroom and changed"],
  ["her son — and herself", "her son and herself"],
  ["children turned two — and see", "children turned two and see"],
  ["that question — on their own terms", "that question on their own terms"],
  ["ours was built — and why", "ours was built and why"],
]

function polishStoryExcerpt<T extends { excerpt?: string | null }>(story: T): T {
  if (!story.excerpt) return story
  return {
    ...story,
    excerpt: excerptEdits.reduce(
      (excerpt, [oldText, newText]) => excerpt.replace(oldText, newText),
      story.excerpt
    ),
  }
}

export async function getPublishedStories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
    return []
  }
  return (data || []).map(polishStoryExcerpt)
}

export function getPublishedStoriesStatic() {
  const supabase = createStaticClient()
  return supabase
    .from("stories")
    .select("slug")
    .eq("is_published", true)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching stories:", error)
        return []
      }
      return data || []
    })
}

export async function getFeaturedStory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // Fallback to most recent if no featured
    const { data: fallback } = await supabase
      .from("stories")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .single()
    return fallback ? polishStoryExcerpt(fallback) : fallback
  }
  return data ? polishStoryExcerpt(data) : data
}

export async function getStoryBySlug(slug: string) {
  const supabase = await createClient()
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase()

  // Use a bounded query + maybeSingle() so production data inconsistencies
  // (such as duplicate slugs or case variance) do not hard-fail page rendering.
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .ilike("slug", normalizedSlug)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error fetching story by slug:", { slug: normalizedSlug, error })
    return null
  }

  return data ? polishStoryExcerpt(data) : data
}
