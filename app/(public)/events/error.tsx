"use client"

import { EventError } from "@/components/events/public/event-error"

export default function EventsError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <EventError title="We couldn’t load our events." message="Please try again in a moment, or return to the homepage."
    error={error} onRetry={retry} homeHref="/" homeLabel="Back to home" />
}
