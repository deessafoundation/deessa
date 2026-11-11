import { createClient } from "@/lib/supabase/server"
import { getSiteUiFlags } from "@/lib/site-status/settings"
import { StoriesListClient, type StoryListItem } from "@/components/admin/stories/stories-list-client"

export const revalidate = 0

async function getStories(): Promise<StoryListItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("stories")
      .select(
        "id, title, slug, excerpt, content, image, category, read_time, is_featured, is_published, published_at, created_at, updated_at, author_id"
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[StoriesPage] Failed to fetch stories:", error.message)
      return []
    }

    return (data || []) as StoryListItem[]
  } catch (err) {
    console.error("[StoriesPage] Unexpected error fetching stories:", err)
    return []
  }
}

export default async function StoriesPage() {
  const [stories, siteFlags] = await Promise.all([
    getStories(),
    getSiteUiFlags(),
  ])

  return <StoriesListClient initialStories={stories} storiesEnabled={siteFlags.storiesEnabled} />
}
