import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  Ticket,
  Sparkles,
  Mic2,
  Wrench,
  BookOpen,
  Users,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { EventModuleEvent, EventCategory } from "@/lib/types/events-module"
import type { LucideIcon } from "lucide-react"

export const revalidate = 300

export const metadata = {
  title: "Events | Deessa Foundation",
  description:
    "Browse upcoming events, workshops, and community gatherings organized by Deessa Foundation. Join us in making a difference.",
}

async function getPublishedEvents(): Promise<EventModuleEvent[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true })
  return (data || []) as EventModuleEvent[]
}

/* Brand-aligned category accents */
const categoryConfig: Record<
  EventCategory | string,
  { label: string; icon: LucideIcon; chip: string; bar: string }
> = {
  conference: {
    label: "Conference",
    icon: Mic2,
    chip: "bg-[#0B5F8A] text-white",
    bar: "bg-[#0B5F8A]",
  },
  workshop: {
    label: "Workshop",
    icon: Wrench,
    chip: "bg-[#6F3E96] text-white",
    bar: "bg-[#6F3E96]",
  },
  seminar: {
    label: "Seminar",
    icon: BookOpen,
    chip: "bg-[#29b6c8] text-white",
    bar: "bg-[#29b6c8]",
  },
  meetup: {
    label: "Meetup",
    icon: Users,
    chip: "bg-[#D6336C] text-white",
    bar: "bg-[#D6336C]",
  },
  general: {
    label: "Event",
    icon: CalendarDays,
    chip: "bg-[#1a1a2e] text-white",
    bar: "bg-[#1a1a2e]",
  },
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getDaysUntil(dateString: string) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateString)
  eventDate.setHours(0, 0, 0, 0)
  return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getMonthDay(dateString: string) {
  const date = new Date(dateString)
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
  }
}

function getUrgencyLabel(daysUntil: number) {
  if (daysUntil === 0) return "Happening today"
  if (daysUntil === 1) return "Tomorrow"
  if (daysUntil <= 7) return `In ${daysUntil} days`
  if (daysUntil <= 21) return `${daysUntil} days away`
  return null
}

export default async function EventsPage() {
  const events = await getPublishedEvents()
  const today = new Date().toISOString().split("T")[0]
  const upcomingEvents = events.filter((e) => e.event_date >= today)
  const pastEvents = events
    .filter((e) => e.event_date < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))

  const featured = upcomingEvents[0] ?? null
  const restUpcoming = upcomingEvents.slice(1)
  const freeCount = upcomingEvents.filter((e) => e.is_free).length
  const latestLabel = featured
    ? formatShortDate(featured.event_date)
    : pastEvents[0]
      ? formatShortDate(pastEvents[0].event_date)
      : "Soon"

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO — warm brand light (Stories / Impact language)
          ═══════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fcff_0%,#eaf5fb_45%,#f7f4ef_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(41,182,200,0.22),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(111,62,150,0.14),transparent_24%),radial-gradient(circle_at_78%_88%,rgba(247,197,43,0.18),transparent_22%),radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(11,95,138,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(11,95,138,0.18)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
          {/* Copy */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Community gatherings
            </span>

            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight text-[#1a1a2e] sm:text-6xl lg:text-7xl">
              Come together.{" "}
              <span className="text-primary">Grow together.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Workshops, conferences, and community gatherings across Nepal —
              spaces where learning turns into action and people into community.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#upcoming"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-22px_rgba(11,95,138,0.9)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Browse events
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/contact"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/75 px-6 py-3.5 text-sm font-semibold text-primary shadow-sm backdrop-blur transition-colors duration-300 hover:border-primary/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Host an event
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Overview card — Stories-style */}
          <div className="lg:col-span-5">
            <div className="rounded-[2.1rem] bg-white/85 p-5 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.42)] backdrop-blur md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Events overview
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#1a1a2e] md:text-[2rem]">
                Find your next moment of connection.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                From hands-on workshops to large community conferences — every
                gathering is built to create lasting impact.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <div className="text-2xl font-black text-primary">
                    {String(upcomingEvents.length).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Upcoming
                  </div>
                </div>
                <div className="rounded-2xl bg-[rgba(111,62,150,0.1)] p-3">
                  <div className="text-2xl font-black text-[#6F3E96]">
                    {String(pastEvents.length).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Past
                  </div>
                </div>
                <div className="rounded-2xl bg-[rgba(247,197,43,0.18)] p-3">
                  <div className="text-sm font-black leading-tight text-[#1a1a2e]">
                    {freeCount > 0 && freeCount === upcomingEvents.length
                      ? "Free"
                      : latestLabel}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {freeCount > 0 && freeCount === upcomingEvents.length
                      ? "Entry"
                      : "Next up"}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="#upcoming"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  See upcoming
                </a>
                {pastEvents.length > 0 ? (
                  <a
                    href="#past"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary/25 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Past events
                  </a>
                ) : (
                  <Link
                    href="/get-involved"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary/25 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Get involved
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED + UPCOMING
          ═══════════════════════════════════════════ */}
      <section
        id="upcoming"
        className="scroll-mt-24 bg-[#faf9f6] py-16 md:py-24"
        aria-labelledby="upcoming-heading"
      >
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          {/* Soft decorative blobs */}
          <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[rgba(41,182,200,0.12)] blur-[90px]" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[rgba(247,197,43,0.12)] blur-[90px]" />

          <div className="relative mb-10 md:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Upcoming
            </p>
            <h2
              id="upcoming-heading"
              className="mt-3 text-3xl font-black tracking-tight text-[#1a1a2e] sm:text-4xl md:text-5xl"
            >
              Don&apos;t miss what&apos;s next
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {upcomingEvents.length > 0
                ? "Save your seat — these gatherings are where ideas turn into action."
                : "We are preparing the next chapter. Check past events or get involved while you wait."}
            </p>
          </div>

          {featured ? (
            <div className="relative mb-12 md:mb-16">
              <FeaturedEventCard event={featured} />
            </div>
          ) : (
            <EmptyUpcoming hasPast={pastEvents.length > 0} />
          )}

          {restUpcoming.length > 0 && (
            <div className="relative">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h3 className="text-xl font-bold text-[#1a1a2e] sm:text-2xl">
                  More upcoming
                </h3>
                <span className="text-sm font-medium text-slate-500">
                  {restUpcoming.length} event{restUpcoming.length !== 1 ? "s" : ""}
                </span>
              </div>
              <EventCardGrid>
                {restUpcoming.map((event, i) => (
                  <EventCard key={event.id} event={event} priority={i < 3} />
                ))}
              </EventCardGrid>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PAST EVENTS
          ═══════════════════════════════════════════ */}
      {pastEvents.length > 0 && (
        <section
          id="past"
          className="scroll-mt-24 bg-white py-16 md:py-24"
          aria-labelledby="past-heading"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-10 md:mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Our journey
              </p>
              <h2
                id="past-heading"
                className="mt-3 text-3xl font-black tracking-tight text-[#1a1a2e] sm:text-4xl"
              >
                Moments we shared
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Relive the gatherings that shaped our community — and the people
                who made them matter.
              </p>
            </div>

            <EventCardGrid>
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </EventCardGrid>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          CTA — solid primary like Stories
          ═══════════════════════════════════════════ */}
      <section className="bg-[linear-gradient(180deg,#f7f4ef_0%,#fbf8f4_100%)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-[2.25rem] bg-primary px-6 py-10 text-center text-white shadow-[0_22px_60px_-40px_rgba(11,95,138,0.85)] md:px-10 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
              Take action
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Ready to gather with us?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Host a workshop, volunteer at the next conference, or simply show
              up — there&apos;s a place for you in this community.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Host an event
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/70 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Get involved
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ──────────────────  Shared image media  ────────────────── */

/**
 * Optimized event image component with:
 * - Next.js Image optimization (automatic WebP/AVIF)
 * - Responsive sizes for bandwidth savings
 * - Blurred placeholder backdrop
 * - Lazy loading for below-fold images
 * - Full container coverage (no gaps or letterboxing)
 */
function EventMedia({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
  past = false,
  large = false,
}: {
  src: string | null
  alt: string
  priority?: boolean
  sizes: string
  className?: string
  past?: boolean
  large?: boolean
}) {
  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden bg-gradient-to-br from-[#eaf5fb] via-[#f8fcff] to-[#f7f4ef] ${className}`}
    >
      {src ? (
        <>
          {/* Blurred color wash backdrop — CSS only, no second image request */}
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-50 blur-2xl"
            style={{ backgroundImage: `url(${src})` }}
          />
          {/* Main photo — optimized with Next.js Image, stretched to fill container */}
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            quality={large ? 90 : 85}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            className={`relative z-[1] transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05] ${
              past ? "grayscale-[30%] group-hover:grayscale-0" : ""
            }`}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar
            className={large ? "size-16 text-primary/30" : "size-12 text-primary/25"}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}

function EventCardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 [&>*]:min-h-0 [&>*]:h-full">
      {children}
    </div>
  )
}

/* ──────────────────  Featured editorial card  ────────────────── */

function FeaturedEventCard({ event }: { event: EventModuleEvent }) {
  const md = getMonthDay(event.event_date)
  const cat = categoryConfig[event.category] ?? categoryConfig.general
  const CatIcon = cat.icon
  const daysUntil = getDaysUntil(event.event_date)
  const urgency = getUrgencyLabel(daysUntil)
  const imageSrc = event.image || event.banner_url

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
    >
      <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] transition-shadow duration-300 group-hover:shadow-[0_32px_80px_-32px_rgba(11,95,138,0.35)] lg:grid-cols-12 lg:items-stretch">
        {/* Image — full height of card on desktop */}
        <div className="relative aspect-[16/10] w-full overflow-hidden lg:col-span-6 lg:aspect-auto lg:min-h-[400px]">
          <EventMedia
            src={imageSrc}
            alt={event.title}
            priority
            large
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />

          {/* Floating date block */}
          <div className="absolute left-5 top-5 flex flex-col items-center rounded-2xl bg-white px-3.5 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]">
            <span className="text-[10px] font-bold tracking-[0.14em] text-primary">
              {md.month}
            </span>
            <span className="text-3xl font-black leading-none text-[#1a1a2e]">
              {md.day}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase text-slate-400">
              {md.weekday}
            </span>
          </div>

          {/* Category chip on image */}
          <div className="absolute bottom-5 left-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-lg ${cat.chip}`}
            >
              <CatIcon className="size-3.5" aria-hidden="true" />
              {cat.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center p-7 sm:p-9 lg:col-span-6 lg:p-10">
          <div className={`mb-5 h-1 w-12 rounded-full ${cat.bar}`} />

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              Next up
            </span>
            {event.is_free && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                <Ticket className="size-3" aria-hidden="true" />
                Free entry
              </span>
            )}
            {urgency && (
              <span className="rounded-full bg-[rgba(247,197,43,0.22)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7a5a00]">
                {urgency}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-black leading-tight text-[#1a1a2e] transition-colors duration-200 group-hover:text-primary sm:text-3xl lg:text-[2.1rem]">
            {event.title}
          </h3>

          {(event.short_description || event.description) && (
            <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">
              {event.short_description || event.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5 text-sm text-slate-600">
            <div className="inline-flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#eaf5fb] text-primary">
                <Calendar className="size-4" aria-hidden="true" />
              </span>
              <time dateTime={event.event_date}>{formatDate(event.event_date)}</time>
              {event.event_time && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
                    {event.event_time}
                  </span>
                </>
              )}
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#eaf5fb] text-primary">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
              <span className="line-clamp-1">
                {event.venue_name
                  ? `${event.venue_name} · ${event.location}`
                  : event.location}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
            {event.registration_enabled ? "Register now" : "View details"}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ──────────────────  Grid event card  ────────────────── */

function EventCard({
  event,
  past = false,
  priority = false,
}: {
  event: EventModuleEvent
  past?: boolean
  priority?: boolean
}) {
  const md = getMonthDay(event.event_date)
  const cat = categoryConfig[event.category] ?? categoryConfig.general
  const CatIcon = cat.icon
  const daysUntil = getDaysUntil(event.event_date)
  const urgency = !past ? getUrgencyLabel(daysUntil) : null
  const imageSrc = event.image || event.banner_url

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(11,95,138,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Fixed aspect media — image always fills the frame */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <EventMedia
          src={imageSrc}
          alt={event.title}
          priority={priority}
          past={past}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="absolute inset-0 h-full w-full"
        />

        {/* Soft bottom fade for badge readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />

        {/* Category badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide shadow-lg ${cat.chip}`}
          >
            <CatIcon className="size-3" aria-hidden="true" />
            {cat.label}
          </span>
        </div>

        {/* Date stamp */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-center rounded-xl bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-sm">
          <span className="text-[9px] font-bold tracking-wider text-primary">
            {md.month}
          </span>
          <span className="text-lg font-black leading-none text-[#1a1a2e]">
            {md.day}
          </span>
        </div>
      </div>

      {/* Body — flex so cards equalize height in the grid */}
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {event.is_free && !past && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <Ticket className="size-3" aria-hidden="true" />
              Free
            </span>
          )}
          {urgency && (
            <span className="rounded-full bg-[rgba(247,197,43,0.2)] px-2.5 py-0.5 text-[11px] font-bold text-[#7a5a00]">
              {urgency}
            </span>
          )}
          {past && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
              Past event
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#1a1a2e] transition-colors duration-200 group-hover:text-primary sm:text-[1.35rem]">
          {event.title}
        </h3>

        {(event.short_description || event.description) && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#1a1a2e]/70 sm:text-[15px]">
            {event.short_description || event.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary/70" aria-hidden="true" />
              {event.event_time || "Time TBA"}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
            <time
              dateTime={event.event_date}
              className="text-[13px] font-semibold text-slate-400"
            >
              {formatShortDate(event.event_date)}
            </time>
            <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#29b6c8] transition-colors group-hover:text-[#0B5F8A]">
              {past
                ? "View details"
                : event.registration_enabled
                  ? "Register"
                  : "Learn more"}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyUpcoming({ hasPast }: { hasPast: boolean }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/70 px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Calendar className="size-8 text-primary" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-2xl font-black text-[#1a1a2e]">
        No upcoming events yet
      </h3>
      <p className="mx-auto mb-7 max-w-md text-slate-600">
        We&apos;re preparing the next gathering. Get involved or browse past
        moments while you wait.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/get-involved"
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Get updates
        </Link>
        {hasPast && (
          <a
            href="#past"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary/25 bg-white px-6 py-3 text-sm font-semibold text-primary"
          >
            View past events
          </a>
        )}
      </div>
    </div>
  )
}
