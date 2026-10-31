"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, X } from "lucide-react"
import type { EventModuleEvent } from "@/lib/types/events-module"
import { cn } from "@/lib/utils"
import styles from "./events-landing.module.css"

export type ListingEvent = Pick<EventModuleEvent,
  "id" | "title" | "slug" | "short_description" | "event_date" | "event_end_date" |
  "event_time" | "location" | "venue_name" | "image" | "banner_url" | "category" | "is_free"
>

const categories = { conference: "Conference", workshop: "Workshop", seminar: "Seminar", meetup: "Meetup", general: "Event" }

function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`))
}

function EventDate({ event, large = false }: { event: ListingEvent; large?: boolean }) {
  return <time dateTime={event.event_date} className={cn(styles.date, "flex shrink-0 flex-col", large ? "gap-1" : "w-16")}>
    <span className="text-sm font-bold uppercase tracking-wider">{dateLabel(event.event_date, { month: "short" })}</span>
    <span className={cn("font-bold leading-none tracking-tight", large ? "text-4xl sm:text-5xl" : "text-3xl")}>{dateLabel(event.event_date, { day: "2-digit" })}</span>
    <span className="mt-1 text-sm">{dateLabel(event.event_date, { year: "numeric" })}</span>
  </time>
}

function EventImage({ event, featured = false }: { event: ListingEvent; featured?: boolean }) {
  const src = event.image || event.banner_url
  const [failed, setFailed] = useState(false)
  return <div className={cn(styles.media, "relative flex h-full min-h-56 items-center justify-center overflow-hidden")}>
    {src && !failed ? <Image src={src.startsWith("http") || src.startsWith("/") ? src : `/${src}`} alt="" fill unoptimized
      loading={featured ? "eager" : "lazy"} sizes={featured ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 768px) 180px, 100vw"}
      className="object-cover" onError={() => setFailed(true)} /> :
      <div className="flex flex-col items-center gap-4 p-8" aria-label="Event artwork unavailable">
        <CalendarDays className="size-12" aria-hidden="true" />
        <span className="text-sm">Let&apos;s come together.</span>
      </div>}
  </div>
}

function EventDetails({ event }: { event: ListingEvent }) {
  return <div className={cn(styles.muted, "space-y-2 text-sm leading-6")}>
    <p className="flex items-start gap-2"><CalendarDays className="mt-1 size-4 shrink-0" aria-hidden="true" /><span>
      {dateLabel(event.event_date, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
      {event.event_end_date && event.event_end_date > event.event_date && <> – {dateLabel(event.event_end_date, { month: "long", day: "numeric", year: "numeric" })}</>}
      {event.event_time && <> · {event.event_time}</>}
    </span></p>
    <p className="flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" /><span>{[event.venue_name, event.location].filter(Boolean).join(" · ") || "Location to be announced"}</span></p>
  </div>
}

export function EventsLanding({ events, unavailable, today }: { events: ListingEvent[]; unavailable: boolean; today: string }) {
  const [period, setPeriod] = useState("upcoming")
  const [category, setCategory] = useState("all")
  const [query, setQuery] = useState("")
  const [freeOnly, setFreeOnly] = useState(false)
  const isPast = (event: ListingEvent) => (event.event_end_date || event.event_date).slice(0, 10) < today
  const upcoming = events.filter((event) => !isPast(event))
  const past = events.filter(isPast).reverse()
  const featured = upcoming[0]
  const source = period === "upcoming" ? upcoming : past
  const visible = source.filter((event) => (category === "all" || event.category === category) && (!freeOnly || event.is_free) &&
    `${event.title} ${event.short_description || ""} ${event.location} ${event.venue_name || ""}`.toLowerCase().includes(query.trim().toLowerCase()))
  const filtered = query.trim() || category !== "all" || freeOnly
  function resetFilters() { setQuery(""); setCategory("all"); setFreeOnly(false) }

  return <div className={styles.page}>
    <section id="events-hero" aria-labelledby="events-title" className={styles.hero}>
      <div className={cn(styles.heroLayout, "relative mx-auto grid items-center")}>
        <div className={cn(styles.heroCopy, "min-w-0")}><p className={styles.foundationLabel}>deessa Foundation</p>
          <h1 id="events-title" className={cn(styles.title, styles.heroTitle, "text-7xl leading-none")}>Events</h1>
          <p className={cn(styles.title, styles.heroTagline)}>Come together.<br />Grow together.</p>
          <p className={cn(styles.muted, styles.heroDescription)}>Workshops, seminars, and community gatherings that create a more inclusive and understanding society.</p>
          <div className={cn(styles.heroActions, "flex flex-wrap gap-3")}>
            <a href="#upcoming" className={cn(styles.primary, "inline-flex min-h-11 items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold")}>Explore events<ArrowDown className="size-4" aria-hidden="true" /></a>
            <Link href="/contact" className={cn(styles.secondary, "inline-flex min-h-11 items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-bold")}>Host an event with us<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <figure className={cn(styles.heroFigure, "min-w-0")}>
          <svg width="0" height="0" aria-hidden="true"><defs>
            <clipPath id="events-photo-1" clipPathUnits="objectBoundingBox"><path id="events-outline-1" d="M.02,.65 C.05,.39 .3,.25 .48,.09 C.69,-.08 .94,.07 .99,.35 C1,.65 .82,.83 .55,.94 C.29,1.08 -.04,.94 .02,.65Z" /></clipPath>
            <clipPath id="events-photo-2" clipPathUnits="objectBoundingBox"><path id="events-outline-2" d="M.05,.12 C.23,-.04 .73,-.03 .89,.08 C1,.18 .84,.35 .93,.49 C1,.65 .99,.74 .8,.87 C.59,1.03 .45,1.07 .27,.85 C.09,.65 -.07,.31 .05,.12Z" /></clipPath>
            <clipPath id="events-photo-3" clipPathUnits="objectBoundingBox"><path id="events-outline-3" d="M.05,.15 C.15,-.06 .41,-.02 .57,.08 C.73,.18 .88,-.05 .97,.08 C1,.19 .99,.48 .96,.69 C.91,.98 .66,1.04 .4,.9 C.18,.8 -.08,.48 .05,.15Z" /></clipPath>
            <clipPath id="events-photo-4" clipPathUnits="objectBoundingBox"><path id="events-outline-4" d="M.04,.48 C.15,.22 .43,-.08 .66,.03 C.83,.12 .85,.35 .97,.57 C1,.74 .94,.9 .71,.97 C.48,1.04 .14,.94 .05,.77 C-.02,.65 .01,.57 .04,.48Z" /></clipPath>
            <clipPath id="events-photo-5" clipPathUnits="objectBoundingBox"><path id="events-outline-5" d="M.02,.62 C.09,.41 .48,-.03 .72,.01 C.93,.02 .97,.23 .99,.55 C1,.83 .92,.97 .7,.98 C.49,1.02 .16,1.02 .05,.88 C-.02,.8 0,.7 .02,.62Z" /></clipPath>
          </defs></svg>
          <div className={styles.collage}>
            {[
              { file: "connection", alt: "Illustration of a child connecting with an educator" },
              { file: "workshop", alt: "Illustration of wheelchair-inclusive community learning" },
              { file: "conversation", alt: "Illustration of women sharing a conversation" },
              { file: "creative-learning", alt: "Illustration of a child enjoying an art workshop" },
              { file: "communication", alt: "Illustration of hands communicating at a gathering" },
            ].map((photo, index) => <div key={photo.file} className={styles.collagePhoto} data-photo={index + 1}>
              <Image src={`/events/hero/${photo.file}.png`} alt={photo.alt} fill sizes="(min-width: 1024px) 24vw, 45vw" loading={index < 3 ? "eager" : "lazy"} className="object-cover" />
              <svg className={styles.photoOutline} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><use href={`#events-outline-${index + 1}`} /></svg>
            </div>)}
            <svg className={styles.doodles} viewBox="0 0 750 340" fill="none" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M237 21q-6-24-10-9t1 22q8-9 9-13 M240 31q17-18 28-13q-4 13-25 20 M641 9q-6-14-12 1m2-1q9-9 14-4l-2 7m-7 5 11-5 M13 126q-9-8-5-12l7 6m-5 7-8 1m7 7-6 6 M335 237q12 8 28 6m-20 7 10 4 M708 311q-23-20-14-28q9-6 13 10q5-25 14-19q8 6-13 37" />
                <path d="M505 223l-9-13m24 6-3-17m17 13 3-17m12 19 9-14" />
              </g>
              <g fill="currentColor" opacity=".45"><circle cx="626" cy="295" r="2"/><circle cx="636" cy="289" r="2"/><circle cx="643" cy="301" r="2"/><circle cx="632" cy="306" r="2"/><circle cx="641" cy="316" r="2"/><circle cx="620" cy="310" r="2"/></g>
              <g stroke="#f7c52b" strokeWidth="4" opacity=".45" strokeLinecap="round"><path d="M23 208l47 17m-35 18 38-9m-24 46 28-38"/></g>
            </svg>
          </div>
          <figcaption className="sr-only">Illustrative imagery created for deessa.</figcaption>
        </figure>
      </div>
    </section>
    <section id="upcoming" aria-labelledby="calendar-heading" className={cn(styles.calendar, "scroll-mt-28 py-8 sm:py-10")}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><h2 id="calendar-heading" className={cn(styles.title, "text-3xl leading-tight sm:text-4xl")}>{period === "upcoming" ? "Upcoming gatherings" : "Past gatherings"}</h2>
            <p className={cn(styles.muted, "mt-2 leading-7")}>{period === "upcoming" ? "Join us to learn, connect, and be part of a more inclusive community." : "Look back at the gatherings that brought our community together."}</p></div>
          <div role="group" aria-label="Event dates" className="flex shrink-0 flex-wrap gap-2">
            {[{ value: "upcoming", label: "Upcoming", count: upcoming.length }, { value: "past", label: "Past events", count: past.length }].map((item) => <button key={item.value} aria-pressed={period === item.value} onClick={() => setPeriod(item.value)} className={cn(styles.period, "inline-flex min-h-11 cursor-pointer items-center gap-2 px-5 py-2 text-sm font-bold")}>
              {item.label} ({item.count})
            </button>)}
          </div>
        </div>
        {events.length > 1 && <details className="mb-5">
          <summary className={cn(styles.textLink, "w-fit cursor-pointer py-3 font-bold")}>Search and filter events</summary>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-72"><label htmlFor="event-search" className="sr-only">Search events by name or location</label><Search className={cn(styles.muted, "pointer-events-none absolute left-3 top-4 size-4")} aria-hidden="true" />
              <input id="event-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events or places" className={cn(styles.input, "min-h-12 w-full rounded-lg border py-3 pl-10 pr-3 text-base")} /></div>
            <label className={cn(styles.muted, "flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold")}><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="size-4" />Free events only</label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Event categories">
              <button onClick={() => setCategory("all")} aria-pressed={category === "all"} className={cn(styles.filter, "min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm font-bold")}>All types</button>
              {Object.entries(categories).filter(([key]) => events.some((event) => event.category === key)).map(([key, label]) => <button key={key} onClick={() => setCategory(key)} aria-pressed={category === key} className={cn(styles.filter, "min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm font-bold")}>{label}</button>)}
            </div>
          </div>
        </details>}
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{unavailable ? "Events could not be loaded." : `${visible.length} ${period === "past" ? "past" : "upcoming"} event${visible.length === 1 ? "" : "s"}${filtered ? " matching your filters" : ""}`}</p>
        {visible.length ? <ul className="space-y-5">{visible.map((event) => <li key={event.id}><article className={cn(styles.eventRow, "grid min-w-0 overflow-hidden rounded-2xl border lg:grid-cols-[0.85fr_1.15fr]")}>
          <div className="relative min-h-64 sm:min-h-72"><EventImage key={`${event.id}-${event.image}`} event={event} featured={event.id === featured?.id} /></div>
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <div className={cn(styles.summary, "flex items-start gap-5")}>
              <div className="flex shrink-0 flex-col items-center gap-2"><EventDate event={event} />
                {event.event_end_date && event.event_end_date > event.event_date && <><span aria-hidden="true">—</span><time dateTime={event.event_end_date} className={cn(styles.date, "text-center")}><span className="block text-sm uppercase">{dateLabel(event.event_end_date, { month: "short" })}</span><span className="text-xl font-bold">{dateLabel(event.event_end_date, { day: "numeric" })}</span></time></>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm"><span className={styles.muted}>{categories[event.category] || "Event"}</span>
                  {period === "upcoming" && event.id === featured?.id && <span className={cn(styles.badge, "inline-flex items-center gap-2 rounded-full px-3 py-1")}><span className={cn(styles.dot, "size-1.5 rounded-full")} />{event.event_date.slice(0, 10) <= today ? "Happening now" : "Next on the calendar"}</span>}
                </div>
                <h3 className={cn(styles.title, "text-2xl leading-tight sm:text-3xl")}><Link href={`/events/${event.slug}`} className={styles.eventTitle}>{event.title}</Link></h3>
                {event.short_description && <p className={cn(styles.muted, "mb-4 mt-3 text-base leading-7")}>{event.short_description}</p>}
                <EventDetails event={event} />
                <div className="mt-5 flex flex-wrap items-center gap-4"><Link href={`/events/${event.slug}`} className={cn(styles.primary, "inline-flex min-h-11 items-center gap-4 rounded-full px-5 py-2.5 text-sm font-bold")}>View event details<ArrowUpRight className="size-4" aria-hidden="true" /></Link>{event.is_free && <span className={cn(styles.accent, "text-sm font-bold")}>Free entry</span>}</div>
              </div>
            </div>
          </div>
        </article></li>)}</ul> : <div className={cn(styles.empty, "rounded-2xl border border-dashed px-6 py-10")}>
          <h3 className={cn(styles.title, "text-2xl")}>{unavailable ? "We couldn’t load the events." : filtered ? "No gatherings match just yet." : period === "past" ? "Our shared moments will live here." : "More moments together are on the way."}</h3>
          <p className={cn(styles.muted, "mt-3 max-w-lg leading-7")}>{unavailable ? "Refresh the page to try again, or contact us for help." : filtered ? "Try another event type or clear your filters to see all events." : period === "past" ? "Once events have taken place, you’ll find them here to look back on." : "Check back for new dates, or get involved with the foundation today."}</p>
          {filtered && <button onClick={resetFilters} className={cn(styles.textLink, "mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 font-bold")}>Clear filters<X className="size-4" aria-hidden="true" /></button>}
          {unavailable && <a href="/events" className={cn(styles.textLink, "mt-4 inline-flex min-h-11 items-center gap-2 font-bold")}>Try again<ArrowRight className="size-4" aria-hidden="true" /></a>}
        </div>}
        <section aria-labelledby="join-heading" className={cn(styles.join, "mt-6 flex flex-col justify-between gap-5 rounded-2xl px-6 py-6 sm:flex-row sm:items-center sm:px-8")}>
          <div><h2 id="join-heading" className={cn(styles.title, "text-2xl sm:text-3xl")}>Have an idea worth bringing together?</h2><p className={cn(styles.muted, "mt-2 leading-7")}>Collaborate with deessa to create a meaningful event, workshop, or community gathering.</p></div>
          <Link href="/contact" className={cn(styles.secondary, "inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full border px-5 py-3 font-bold")}>Host an event with us<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </section>
      </div>
    </section>
  </div>
}
