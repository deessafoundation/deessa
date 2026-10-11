import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react"
import { accessibilitySummit as event } from "@/lib/data/accessibility-summit"
import { cn } from "@/lib/utils"
import styles from "./accessibility-summit.module.css"

const areas = ["Inclusive education", "Accessible health services", "Social protection", "Livelihoods & employment", "Transportation & public infrastructure", "Digital & communication accessibility"]

function RegistrationLink({ className }: { className?: string }) {
  return <a href={event.facebookUrl} className={cn(styles.primary, "inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 py-3 font-bold", className)}>
    Register<ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
  </a>
}

export function AccessibilitySummit() {
  return <div className={styles.page}>
    <section aria-labelledby="summit-title" className={cn(styles.hero, "px-5 pb-10 pt-7 sm:px-8 sm:pb-14")}>
      <div className="mx-auto max-w-7xl">
        <Link href="/events" className={cn(styles.back, "mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold")}><ArrowLeft className="size-4" aria-hidden="true" />All events</Link>
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><h1 id="summit-title" className={cn(styles.title, "text-4xl leading-tight sm:text-5xl lg:text-6xl")}>{event.title}</h1>
            <p className={cn(styles.muted, "mt-4 max-w-2xl text-lg leading-relaxed sm:text-xl")}>{event.short_description}</p>
          </div>
          <RegistrationLink className="shrink-0 self-start" />
        </div>
        <Image src={event.inner_poster} width={1600} height={609} alt="Nepal Accessibility Summit 2026. Accessible Nepal: inclusive education, health, social protection and urban futures. November 30–December 1, 2026, Pokhara, Nepal. Inclusive figures beside a mountain and sun illustration." sizes="(min-width: 1344px) 1280px, 100vw" loading="eager" className="h-auto w-full rounded-xl" />
        <dl className={cn(styles.facts, "mt-7 grid gap-6 border-t pt-7 sm:grid-cols-3")}>
          <div className="flex gap-3"><CalendarDays className="mt-1 size-5 shrink-0" aria-hidden="true" /><div><dt className={cn(styles.muted, "text-sm")}>Dates</dt><dd className="mt-1 text-lg font-bold"><time dateTime="2026-11-30">30 November</time>–<time dateTime="2026-12-01">1 December 2026</time></dd></div></div>
          <div className="flex gap-3"><Clock className="mt-1 size-5 shrink-0" aria-hidden="true" /><div><dt className={cn(styles.muted, "text-sm")}>Two-day summit · Nepal time</dt><dd className="mt-1 text-lg font-bold">Starts 9 AM · Ends 5 PM on day two</dd></div></div>
          <div className="flex gap-3"><MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" /><div><dt className={cn(styles.muted, "text-sm")}>Location</dt><dd className="mt-1 text-lg font-bold">{event.venue_name}</dd><dd className={cn(styles.muted, "mt-1 text-sm")}>{event.location}</dd></div></div>
        </dl>
      </div>
    </section>
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:py-16">
      <div>
        <section aria-labelledby="why-summit"><h2 id="why-summit" className={cn(styles.title, "text-3xl sm:text-4xl")}>From commitments to everyday access.</h2>
          <div className={cn(styles.muted, "mt-5 space-y-4 text-lg leading-8")}>
            <p>Nepal has strong constitutional and legal commitments to disability inclusion. Yet many persons with disabilities still face barriers in education, healthcare, employment, transport, public spaces, and communication.</p>
            <p>This two-day summit brings people together to bridge the gap between policy and lived experience through universal design, accessibility standards, and meaningful participation.</p>
            <p>At its heart are persons with disabilities, including people with complex and multiple disabilities from remote areas of Nepal.</p>
          </div>
        </section>
        <section aria-labelledby="summit-focus" className="mt-10"><h2 id="summit-focus" className={cn(styles.title, "text-3xl")}>What we’ll explore</h2>
          <ul className={cn(styles.areas, "mt-5 grid gap-x-8 sm:grid-cols-2")}>
            {areas.map((area) => <li key={area} className="border-b py-4 text-lg">{area}</li>)}
          </ul>
        </section>
      </div>
      <aside aria-labelledby="summit-partners" className={cn(styles.partners, "self-start rounded-2xl p-6 sm:p-8")}>
        <h2 id="summit-partners" className={cn(styles.title, "text-3xl")}>Coming together for access</h2>
        <dl className="mt-6 space-y-6 text-lg">
          <div><dt className={cn(styles.muted, "text-sm")}>Organizers</dt><dd className="mt-1 font-bold">deessa Foundation &amp; Socialartist</dd></div>
          <div><dt className={cn(styles.muted, "text-sm")}>Technical support</dt><dd className="mt-1 font-bold">SDG Studio</dd></div>
          <div><dt className={cn(styles.muted, "text-sm")}>In collaboration</dt><dd className="mt-1 font-bold">GIZ Nepal</dd></div>
          <div><dt className={cn(styles.muted, "text-sm")}>Knowledge partner</dt><dd className="mt-1 font-bold">Kathmandu University School of Education (KUSOED)</dd></div>
        </dl>
        <div className={cn(styles.divider, "mt-7 border-t pt-6")}><p className={styles.muted}>Questions about the summit?</p><a href={`mailto:${event.email}`} className="mt-2 inline-block break-all font-bold underline underline-offset-4">{event.email}</a></div>
      </aside>
    </div>
    <section aria-labelledby="summit-registration" className="px-5 pb-12 sm:px-8 sm:pb-16">
      <div className={cn(styles.invitation, "mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-2xl p-7 sm:p-10 lg:flex-row lg:items-center")}>
        <div className="max-w-2xl"><h2 id="summit-registration" className={cn(styles.title, "text-3xl sm:text-4xl")}>Be part of an accessible Nepal.</h2><p className={cn(styles.muted, "mt-3 text-lg leading-7")}>Visit the Facebook event for registration information, announcements, and the latest summit updates.</p></div>
        <RegistrationLink className="shrink-0 self-start lg:self-center" />
      </div>
    </section>
  </div>
}
