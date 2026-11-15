import { Suspense } from "react"
import { EventSettingsClient } from "@/components/admin/events/event-settings-client"
import { Loader2 } from "lucide-react"

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground animate-pulse">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading event configuration...</p>
        </div>
      }
    >
      <EventSettingsClient eventId={id} />
    </Suspense>
  )
}
