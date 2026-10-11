"use client"

import GenericErrorPage from "@/components/errors/generic-error-page"
import NotFoundErrorPage from "@/components/errors/not-found-error-page"
import { ErrorPage } from "@/components/errors/error-page"

interface EventErrorProps {
  title?: string
  message?: string
  showHome?: boolean
  showRetry?: boolean
  error?: Error & { digest?: string }
  onRetry?: () => void | Promise<void>
  homeHref?: string
  homeLabel?: string
}

export function EventError({ title = "We couldn’t load this event.", message = "Please try again in a moment, or browse our other events.",
  showHome = true, showRetry = true, error, onRetry, homeHref = "/events", homeLabel = "Browse events" }: EventErrorProps) {
  return <GenericErrorPage errorTitle={title} errorMessage={message} error={error} onRetry={onRetry}
    showPrimary={showRetry} showSecondary={showHome} secondaryHref={homeHref} secondaryLabel={homeLabel} />
}

export function EventNotFound() {
  return <NotFoundErrorPage title="We couldn’t find this event."
    message="This event may have moved or is no longer available. Discover our upcoming events and find another opportunity to join us."
    primaryHref="/events" primaryLabel="Browse events" secondaryHref="/" secondaryLabel="Back to home" />
}

export function EventRegistrationClosed({ eventHref, ended = false }: { eventHref?: string; ended?: boolean }) {
  return <ErrorPage variant="closed"
    title={ended ? "This event has ended." : undefined}
    message={ended ? "This event has already taken place, so registration is no longer available. Explore our other events for another opportunity to connect." : undefined}
    primaryHref="/events" primaryLabel="Browse events" secondaryHref={eventHref ?? "/"} secondaryLabel={eventHref ? "Back to event" : "Back to home"} />
}
