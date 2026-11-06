import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PodcastsListClient } from "@/components/admin/podcasts/podcasts-list-client"
import type { PodcastRow } from "@/lib/types/podcast"

export const metadata = {
  title: "Podcasts & Media Studio | Admin",
  description: "Manage podcast episodes, videos, show notes, and guest profiles",
}

async function getPodcasts(): Promise<PodcastRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("podcasts")
    .select("*")
    .order("episode_number", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  return (data || []) as PodcastRow[]
}

export default async function AdminPodcastsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const podcasts = await getPodcasts()

  return (
    <div className="space-y-6">
      <PodcastsListClient initialPodcasts={podcasts} />
    </div>
  )
}
