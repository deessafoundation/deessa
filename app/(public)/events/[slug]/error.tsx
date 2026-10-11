"use client"

import { EventError } from "@/components/events/public/event-error"

export default function EventDetailError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <EventError error={error} onRetry={retry} />
}
