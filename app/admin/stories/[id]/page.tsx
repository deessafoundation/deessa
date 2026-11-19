import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ExternalLink, Eye, EyeOff, FileText, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StoryForm } from "@/components/admin/stories/story-form"

async function getStory(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("stories").select("*").eq("id", id).single()

  if (error) return null
  return data
}

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const story = await getStory(id)

  if (!story) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="h-9 gap-1 text-muted-foreground hover:text-foreground">
            <Link href="/admin/stories">
              <ChevronLeft className="size-4" />
              <span>Back to Stories</span>
            </Link>
          </Button>
        </div>

        {story.is_published && story.slug && (
          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 font-semibold">
            <Link href={`/stories/${story.slug}`} target="_blank">
              <span>View Live Article</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <FileText className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-1">{story.title}</h1>
          <div className="flex items-center gap-2">
            {story.is_published ? (
              <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs py-0.5 px-2.5">
                <Eye className="size-3" />
                Live Public
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-dashed border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 font-semibold text-xs py-0.5 px-2.5">
                <EyeOff className="size-3" />
                Draft
              </Badge>
            )}
            {story.is_featured && (
              <Badge variant="outline" className="gap-1 border-yellow-500/30 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 font-semibold text-xs py-0.5 px-2.5">
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Update content, rich text formatting, media attachments, and publishing settings.
        </p>
      </div>

      <StoryForm story={story} />
    </div>
  )
}
