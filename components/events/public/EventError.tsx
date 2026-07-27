"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventErrorProps {
  title?: string
  message?: string
  showHome?: boolean
  showRetry?: boolean
}

export function EventError({
  title = "Something went wrong",
  message = "We encountered an error while loading this page. Please try again.",
  showHome = true,
  showRetry = true,
}: EventErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button asChild>
              <Link href="/events">
                <Home className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EventNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Event Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The event you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  )
}

export function EventRegistrationClosed() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-100">
          <span className="text-4xl">⏰</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Registration Closed
        </h1>
        <p className="text-muted-foreground mb-8">
          Registration for this event is currently closed. Please check back
          later or contact the organizer.
        </p>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  )
}
