"use client"

import { EventError } from "@/components/events/public/EventError"

export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <EventError
      title="Event Unavailable"
      message="We're having trouble loading this event. Please try again."
      showRetry={true}
      showHome={true}
    />
  )
}
