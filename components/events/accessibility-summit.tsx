import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react"
import { accessibilitySummit as event } from "@/lib/data/accessibility-summit"
import { PartnersDisplay } from "@/components/shared/partners-display"
import { SummitScheduleViewer } from "./summit-schedule-viewer"
import { cn } from "@/lib/utils"
import styles from "./accessibility-summit.module.css"

const areas = [
  "Inclusive education",
  "Accessible health services",
  "Social protection",
  "Urban futures",
]

const REGISTRATION_FORM_URL = "https://forms.gle/kUsJ4aMD8YaNLyfF8"

function RegisterButton({ className }: { className?: string }) {
  return (
    <a
      href={REGISTRATION_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Register Now on Google Forms (opens in a new window)"
      className={cn(
        styles.primary,
        "inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-full px-6 py-3 font-bold text-center",
        className
      )}
    >
      <span>Register Now</span>
      <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (opens in a new window)</span>
    </a>
  )
}

function FacebookEventLink({ className }: { className?: string }) {
  return (
    <a
      href={event.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore Nepal Accessibility Summit on Facebook (opens in a new window)"
      className={cn(
        styles.secondary,
        "inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-full border-2 px-6 py-3 font-bold text-center",
        className
      )}
    >
      <span>Explore on Facebook</span>
      <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (opens in a new window)</span>
    </a>
  )
}

export function AccessibilitySummit() {
  return (
    <article aria-labelledby="summit-title" className={cn(styles.page, "overflow-x-hidden")}>
      {/* Hero Section */}
      <section aria-labelledby="summit-title" className={cn(styles.hero, "px-4 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-8")}>
        <div className="mx-auto max-w-7xl">
          <Link
            href="/events"
            aria-label="Back to all events"
            className={cn(styles.back, "mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold sm:mb-7")}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>All events</span>
          </Link>

          <div className="mb-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 id="summit-title" className={cn(styles.title, "text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl")}>
                {event.title}
              </h1>
              <p className={cn(styles.muted, "mt-3 max-w-2xl text-base leading-relaxed sm:mt-4 sm:text-lg md:text-xl")}>
                {event.short_description}
              </p>

              {/* Accessible Quick Navigation Jump Links */}
              <nav aria-label="Summit sections quick navigation" className={styles.quickNav}>
                <a href="#summit-overview" className={styles.quickNavLink}>
                  Overview
                </a>
                <a href="#summit-schedule" className={styles.quickNavLink}>
                  Program Schedule
                </a>
                <a href="#summit-partners" className={styles.quickNavLink}>
                  Partners
                </a>
                <a href="#summit-inquiries" className={styles.quickNavLink}>
                  Venue &amp; Contact
                </a>
              </nav>
            </div>

            <div className="flex w-full flex-col gap-3 self-stretch sm:w-auto sm:flex-row sm:self-start lg:flex-col lg:self-auto">
              <RegisterButton />
              <FacebookEventLink />
            </div>
          </div>

          <Image
            src={event.inner_poster}
            width={1600}
            height={609}
            alt="Nepal Accessibility Summit 2026 poster with event information: Accessible Nepal: inclusive education, health, social protection and urban futures. Taking place November 30 to December 1, 2026 in Pokhara, Nepal."
            sizes="(min-width: 1344px) 1280px, 100vw"
            loading="eager"
            priority
            className="h-auto w-full rounded-xl border border-slate-200"
          />

          <dl className={cn(styles.facts, "mt-7 grid grid-cols-1 gap-6 border-t pt-7 sm:grid-cols-2 lg:grid-cols-3")}>
            <div className="flex gap-3">
              <CalendarDays className="mt-1 size-5 shrink-0 text-[#0275b1]" aria-hidden="true" />
              <div>
                <dt className={cn(styles.muted, "text-sm")}>Dates</dt>
                <dd className="mt-1 text-base font-bold sm:text-lg text-slate-900">
                  <time dateTime="2026-11-30">30 November</time>
                  <span aria-hidden="true"> – </span>
                  <span className="sr-only"> to </span>
                  <time dateTime="2026-12-01">1 December 2026</time>
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-[#0275b1]" aria-hidden="true" />
              <div>
                <dt className={cn(styles.muted, "text-sm")}>Two-day summit · Nepal time</dt>
                <dd className="mt-1 text-base font-bold sm:text-lg text-slate-900">
                  Starts 8:30 AM · Ends 5:00 PM on day two
                </dd>
              </div>
            </div>

            <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
              <MapPin className="mt-1 size-5 shrink-0 text-[#0275b1]" aria-hidden="true" />
              <div>
                <dt className={cn(styles.muted, "text-sm")}>Location &amp; Venue</dt>
                <dd className="mt-1 text-base font-bold sm:text-lg text-slate-900">{event.venue_name}</dd>
                <dd className={cn(styles.muted, "mt-0.5 text-sm")}>{event.location}</dd>
                <a
                  href={event.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(styles.link, "mt-1.5 inline-flex items-center gap-1 text-xs font-bold")}
                >
                  <Navigation className="size-3.5" aria-hidden="true" />
                  <span>View venue location on map</span>
                  <span className="sr-only"> (opens Google Maps in a new window)</span>
                </a>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <div id="summit-overview" className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:py-16">
        <div>
          <section aria-labelledby="why-summit">
            <h2 id="why-summit" className={cn(styles.title, "text-2xl sm:text-3xl md:text-4xl")}>
              From commitments to everyday access.
            </h2>
            <div className={cn(styles.muted, "mt-4 space-y-4 text-base leading-7 sm:mt-5 sm:text-lg sm:leading-8")}>
              <p>
                Nepal has strong constitutional and legal commitments to disability inclusion. Yet many persons with
                disabilities still face persistent barriers in education, healthcare, employment, transport, public spaces,
                and digital communication.
              </p>
              <p>
                This two-day summit brings together policymakers, persons with lived experience, technical experts, and
                advocates to bridge the gap between policy and daily reality through universal design and robust accessibility
                standards.
              </p>
              <p>
                At the heart of the summit are persons with disabilities, including those with complex and multiple disabilities
                from remote mountainous regions across Nepal.
              </p>
            </div>
          </section>

          <section aria-labelledby="summit-focus" className="mt-10">
            <h2 id="summit-focus" className={cn(styles.title, "text-2xl sm:text-3xl")}>
              What we’ll explore
            </h2>
            <ul className={cn(styles.areas, "mt-4 grid gap-x-8 sm:mt-5 sm:grid-cols-2")}>
              {areas.map((area) => (
                <li key={area} className="border-b py-3.5 text-base sm:py-4 sm:text-lg font-medium text-slate-800">
                  {area}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-labelledby="summit-inquiries" id="summit-inquiries" className={cn(styles.partners, "self-start rounded-2xl p-5 sm:p-8")}>
          <h2 id="summit-inquiries" className={cn(styles.title, "text-2xl sm:text-3xl")}>
            Summit Inquiries &amp; Venue
          </h2>
          <div className="mt-5 space-y-5 text-base leading-relaxed sm:mt-6">
            <p className={styles.muted}>
              Have questions about registration, attendance, or partnerships for the summit?
            </p>

            <div className={cn(styles.divider, "border-t pt-4 sm:pt-5")}>
              <p className={cn(styles.muted, "text-sm font-semibold")}>Organizing Team Contact:</p>
              <a
                href={`mailto:${event.email}`}
                aria-label={`Send email to ${event.email}`}
                className={cn(styles.link, "mt-1.5 inline-block break-all font-bold underline underline-offset-4")}
              >
                {event.email}
              </a>
            </div>

            <div className={cn(styles.divider, "border-t pt-4 sm:pt-5")}>
              <p className={cn(styles.muted, "text-sm font-semibold")}>Venue &amp; Dates:</p>
              <p className="mt-1 font-bold text-slate-900">{event.venue_name}</p>
              <p className={cn(styles.muted, "mt-0.5 text-sm")}>
                {event.location} · 30 Nov – 1 Dec 2026
              </p>
            </div>

            <div className={cn(styles.divider, "border-t pt-4 sm:pt-5")}>
              <p className={cn(styles.muted, "text-sm font-semibold")}>Official Event Page:</p>
              <a
                href={event.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.link, "mt-1.5 inline-flex items-center gap-1.5 font-bold")}
              >
                <span>Follow on Facebook</span>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new window)</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Program Schedule Section */}
      <section
        id="summit-schedule"
        aria-labelledby="schedule-heading"
        className={cn(styles.scheduleSection, "px-4 py-12 sm:px-8 sm:py-16 lg:py-20")}
      >
        <div className="mx-auto max-w-7xl">
          <SummitScheduleViewer schedule={event.schedule} />
        </div>
      </section>

      {/* Full-width Finalized Partners & Collaborators Display */}
      <PartnersDisplay id="summit-partners" />

      {/* Final Call to Action Section */}
      <section aria-labelledby="summit-registration" className="px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div
          className={cn(
            styles.invitation,
            "mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-2xl p-6 sm:p-8 lg:flex-row lg:items-center"
          )}
        >
          <div className="max-w-2xl">
            <h2 id="summit-registration" className={cn(styles.title, "text-2xl sm:text-3xl md:text-4xl")}>
              Be part of an accessible Nepal.
            </h2>
            <p className={cn(styles.muted, "mt-2.5 text-base leading-relaxed sm:mt-3 sm:text-lg sm:leading-7")}>
              Register now through our online form, or visit the official Facebook event for announcements, travel tips, and
              speaker spotlights.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 self-stretch sm:w-auto sm:flex-row lg:self-center">
            <RegisterButton />
            <FacebookEventLink />
          </div>
        </div>
      </section>
    </article>
  )
}
