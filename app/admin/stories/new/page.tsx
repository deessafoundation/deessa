import Link from "next/link"
import { ChevronLeft, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoryForm } from "@/components/admin/stories/story-form"

export default function NewStoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="h-9 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/admin/stories">
            <ChevronLeft className="size-4" />
            <span>Back to Stories</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1 border-b pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <PenSquare className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Story</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Draft a new impact story, field dispatch, or milestone announcement.
        </p>
      </div>

      <StoryForm />
    </div>
  )
}
