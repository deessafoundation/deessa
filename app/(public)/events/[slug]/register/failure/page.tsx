"use client"

import { Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { XCircle, RefreshCcw, Calendar } from "lucide-react"

function FailureContent() {
  const sp = useSearchParams()
  const params = useParams()
  const slug = (params.slug as string) ?? ""
  const rid = sp.get("rid") ?? ""
  const email = sp.get("email") ?? ""
  const reason = sp.get("reason") ?? "Payment could not be processed"

  const retryUrl = rid
    ? `/events/${slug}/register/pending-payment?rid=${encodeURIComponent(rid)}&email=${encodeURIComponent(email)}`
    : `/events/${slug}/register`

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="size-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">
          Payment Failed
        </h1>
        <p className="text-muted-foreground mb-2">{reason}</p>
        <p className="text-sm text-muted-foreground mb-8">
          Please try again or contact support if the issue persists.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={retryUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
          >
            <RefreshCcw className="size-4" />
            Try Again
          </Link>
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            <Calendar className="size-4" />
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FailurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  )
}
