import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PodcastForm from "@/components/admin/podcasts/podcast-form"

export const metadata = {
  title: "New Podcast Episode | Admin",
  description: "Create a new podcast episode and configure broadcast media",
}

export default async function NewPodcastPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="space-y-6">
      <PodcastForm mode="create" />
    </div>
  )
}
