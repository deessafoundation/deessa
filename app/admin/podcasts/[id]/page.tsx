import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PodcastForm from "@/components/admin/podcasts/podcast-form"

export const metadata = {
  title: "Edit Podcast Episode | Admin",
  description: "Update podcast episode details, media, and guest profile",
}

async function getPodcast(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("podcasts").select("*").eq("id", id).single()
  return data
}

export default async function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { id } = await params
  const podcast = await getPodcast(id)

  if (!podcast) {
    redirect("/admin/podcasts")
  }

  return (
    <div className="space-y-6">
      <PodcastForm mode="edit" podcast={podcast} />
    </div>
  )
}
