import Link from "next/link"
import { Calendar, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Registration Confirmed | Event",
}

interface SuccessPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ id?: string; name?: string; email?: string }>
}

export default async function EventRegistrationSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = await params
  const sp = await searchParams

  const safeDecode = (str: string | undefined, fallback: string): string => {
    if (!str) return fallback
    try {
      return decodeURIComponent(str)
    } catch {
      return fallback
    }
  }

  const registrationId = sp.id ?? ""
  const name = safeDecode(sp.name, "Attendee")
  const email = safeDecode(sp.email, "")
  const firstName = name.split(" ")[0]
  const shortId = registrationId
    ? `DESSA-${registrationId.slice(0, 6).toUpperCase()}`
    : "DESSA-??????"

  // Get event info
  const supabase = await createClient()
  const { data: event } = await supabase
    .from("events")
    .select("title, event_date, location, slug")
    .eq("slug", slug)
    .single()

  const eventTitle = event?.title || "Event"
  const eventDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : ""
  const eventLocation = event?.location || ""

  return (
    <div className="relative min-h-[calc(100vh-96px)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="pointer-events-none absolute -top-32 -right-32 size-[480px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-[360px] rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-16 pb-24 sm:px-6">
        <div className="w-full max-w-[600px] flex flex-col items-center gap-10">
          {/* Hero Check */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="relative z-10 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/40">
                <CheckCircle className="size-12 text-white drop-shadow-md" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <span className="size-2 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(22,163,74,0.5)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Registration Completed
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Welcome aboard, <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {firstName}!
                </span>
              </h1>
              <p className="mx-auto max-w-md text-lg text-foreground-muted">
                Your spot at{" "}
                <span className="font-semibold text-foreground">
                  {eventTitle}
                </span>{" "}
                is secured!
              </p>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="w-full">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
              <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

              <div className="flex flex-col gap-6 p-8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      {eventTitle}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {eventDate}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {eventLocation}
                    </p>
                  </div>
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-xs text-foreground-muted font-mono">
                    QR
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/50 p-5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
                      Registration ID
                    </p>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {shortId}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
                      Attendee Name
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
                      Confirmation Email
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {email || "Your email"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
                      Status
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(22,163,74,0.4)]" />
                      <span className="text-sm font-semibold text-green-600">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mx-6 flex items-center">
                <div className="absolute -left-6 size-5 -translate-x-1/2 rounded-full bg-background border border-border" />
                <div className="w-full border-t-2 border-dashed border-border" />
                <div className="absolute -right-6 size-5 translate-x-1/2 rounded-full bg-background border border-border" />
              </div>

              <div className="flex items-center justify-between gap-4 px-8 py-5">
                <p className="text-sm font-semibold text-primary">
                  A confirmation has been sent to your inbox.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-foreground-muted">
              Need to make changes?{" "}
              <Link
                href="/contact"
                className="font-semibold text-primary hover:underline"
              >
                Contact Support →
              </Link>
            </p>
          </div>

          {/* Back to event */}
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Calendar className="size-4" />
            Back to Event
          </Link>
        </div>
      </div>
    </div>
  )
}
