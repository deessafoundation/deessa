import Link from "next/link"
import { Calendar, AlertCircle, ArrowLeft, Search } from "lucide-react"

export default function EventNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-slate-100">
          <AlertCircle className="size-10 text-slate-400" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-black tracking-tight text-[#1a1a2e] sm:text-5xl">
          Event Unavailable
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg leading-7 text-slate-600">
          We&apos;re having trouble loading this event. It may have been removed,
          unpublished, or the link might be incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/events"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Calendar className="size-4" />
            Browse All Events
          </Link>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-slate-500">
          Need help? <Link href="/contact" className="font-semibold text-primary hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  )
}
