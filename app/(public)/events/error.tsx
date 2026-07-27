"use client"

import { EventError } from "@/components/events/public/EventError"

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <EventError
      title="Events Unavailable"
      message="We're having trouble loading events. Please try again."
      showRetry={true}
      showHome={true}
    />
  )
}
