import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ArrowRight,
  Users,
  Mail,
  Ticket,
  Info,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ImageIcon,
  CalendarDays,
  ImageOff,
  MapPinned,
  QrCode,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { EventModuleEvent, EventAgendaItem } from "@/lib/types/events-module"
import { ShareEventButton } from "@/components/events/share-event-button"

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: "Event Not Found" }
  return {
    title: `${event.title} | Deessa Foundation`,
    description: event.short_description || event.description?.slice(0, 160),
  }
}

async function getEvent(slug: string): Promise<EventModuleEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  if (error) return null
  return data as EventModuleEvent
}

async function getAgenda(eventId: string): Promise<EventAgendaItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_agenda_items")
    .select("*")
    .eq("event_id", eventId)
    .order("day_number")
    .order("sort_order")
  return (data || []) as EventAgendaItem[]
}

async function getTicketTypes(eventId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("sort_order")
  return data || []
}

const categoryConfig: Record<string, { label: string; color: string; bg: string; solid: string; border: string }> = {
  conference: { label: "Conference", color: "text-[#0B5F8A]", bg: "bg-[#0B5F8A]/10", solid: "bg-[#0B5F8A]", border: "border-[#0B5F8A]/20" },
  workshop: { label: "Workshop", color: "text-[#6F3E96]", bg: "bg-[#6F3E96]/10", solid: "bg-[#6F3E96]", border: "border-[#6F3E96]/20" },
  seminar: { label: "Seminar", color: "text-[#29b6c8]", bg: "bg-[#29b6c8]/10", solid: "bg-[#29b6c8]", border: "border-[#29b6c8]/20" },
  meetup: { label: "Meetup", color: "text-[#D6336C]", bg: "bg-[#D6336C]/10", solid: "bg-[#D6336C]", border: "border-[#D6336C]/20" },
  general: { label: "Event", color: "text-[#1a1a2e]", bg: "bg-[#1a1a2e]/10", solid: "bg-[#1a1a2e]", border: "border-[#1a1a2e]/20" },
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const agenda = await getAgenda(event.id)
  const ticketTypes = await getTicketTypes(event.id)

  const lowestPrice = ticketTypes.length > 0 ? Math.min(...ticketTypes.map((t) => t.price)) : null
  const highestPrice = ticketTypes.length > 0 ? Math.max(...ticketTypes.map((t) => t.price)) : null
  const hasPriceRange = lowestPrice !== null && highestPrice !== null && lowestPrice !== highestPrice

  const groupedAgenda = agenda.reduce(
    (acc, item) => {
      const day = item.day_number
      if (!acc[day]) acc[day] = { label: item.day_label, items: [] }
      acc[day].items.push(item)
      return acc
    },
    {} as Record<number, { label: string | null; items: EventAgendaItem[] }>
  )

  const hasAgenda = agenda.length > 0
  const hasGallery = Array.isArray(event.gallery) && event.gallery.length > 0
  const hasMap = event.latitude != null && event.longitude != null
  const cat = categoryConfig[event.category] ?? categoryConfig.general
  const bannerImage = event.banner_url || event.image

  // Check if registration should be closed
  const now = new Date()
  const eventDate = new Date(event.event_date)
  eventDate.setHours(23, 59, 59, 999) // End of event day
  const isPastEvent = eventDate < now
  const isRegistrationClosedByDate = !!(
    event.registration_close_at && new Date(event.registration_close_at) < now
  )
  const isRegistrationClosed = isPastEvent || isRegistrationClosedByDate || !event.registration_enabled

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[480px] w-full md:h-[560px]">
          {bannerImage ? (
            <>
              <Image src={bannerImage} alt={event.title} fill priority quality={90} sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 20%" }} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B5F8A] via-[#29b6c8] to-[#6F3E96]" />
          )}

          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 pb-8 md:px-8 md:pb-12">
              <div className="mx-auto max-w-7xl">
                <Link href="/events" className="group mb-8 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                  <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-semibold">All Events</span>
                </Link>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white ${cat.solid}`}>
                    {cat.label}
                  </span>
                  {event.is_free && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                      <Ticket className="size-3" /> Free
                    </span>
                  )}
                </div>

                <h1 className="mb-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {event.title}
                </h1>

                {event.short_description && (
                  <p className="mb-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                    {event.short_description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="size-4 text-white/60" />
                    {formatDate(event.event_date)}
                    {event.event_end_date && event.event_end_date !== event.event_date && (
                      <span className="text-white/60">— {formatShortDate(event.event_end_date)}</span>
                    )}
                  </span>
                  {event.event_time && (
                    <span className="inline-flex items-center gap-2">
                      <Clock className="size-4 text-white/60" />
                      {event.event_time}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-white/60" />
                    {event.venue_name || event.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INFO STRIP — quick facts on a white bar
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 -mt-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-lg md:gap-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Date</p>
                <p className="text-sm font-bold text-black">{formatShortDate(event.event_date)}</p>
              </div>
            </div>

            {event.event_time && (
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Time</p>
                  <p className="text-sm font-bold text-black">{event.event_time}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Location</p>
                <p className="text-sm font-bold text-black">{event.venue_name || event.location}</p>
              </div>
            </div>

            {event.max_capacity && (
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Capacity</p>
                  <p className="text-sm font-bold text-black">{event.max_capacity.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAIN — full-width flowing sections
          ═══════════════════════════════════════════ */}
      <section className="pt-12 md:pt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-10">

            {/* ── Left: content ── */}
            <div className="min-w-0 space-y-16">

              {/* ── ABOUT ── */}
              <div>
                <h2 className="mb-2 text-2xl font-black tracking-tight text-black">About This Event</h2>
                <div className="mb-6 h-1 w-12 rounded-full bg-primary" />
                <div className="text-[15px] leading-[1.8] text-black/70">
                  {event.description.split("\n").map((p, i) => (
                    <p key={i} className="mb-4 last:mb-0">{p}</p>
                  ))}
                </div>
              </div>

              {/* ── SCHEDULE ── */}
              <div>
                <h2 className="mb-2 text-2xl font-black tracking-tight text-black">Event Schedule</h2>
                <div className="mb-6 h-1 w-12 rounded-full bg-[#6F3E96]" />

                {hasAgenda ? (
                  <div className="space-y-8">
                    {Object.entries(groupedAgenda)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([day, { label, items }]) => (
                        <div key={day}>
                          {/* Day pill */}
                          <div className="mb-4 flex items-center gap-3">
                            <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
                              Day {day}
                            </span>
                            {label && <span className="text-sm font-bold text-black">{label}</span>}
                            <div className="flex-1 border-b border-gray-200" />
                          </div>

                          {/* Sessions */}
                          <div className="space-y-3">
                            {items.map((item, idx) => (
                              <div
                                key={item.id}
                                className={`group flex gap-5 rounded-xl p-4 transition-all ${
                                  item.highlighted
                                    ? "bg-primary/5 ring-1 ring-primary/15"
                                    : "bg-white hover:bg-gray-50/80"
                                }`}
                              >
                                {/* Time column */}
                                <div className="w-28 shrink-0 pt-0.5 text-center">
                                  <p className={`text-sm font-bold ${item.highlighted ? "text-primary" : "text-black/50"}`}>
                                    {item.start_time || "TBA"}
                                  </p>
                                  {item.end_time && (
                                    <>
                                      <p className="text-[10px] text-black/25 leading-tight text-center">to</p>
                                      <p className={`text-sm font-bold ${item.highlighted ? "text-primary" : "text-black/50"}`}>
                                        {item.end_time}
                                      </p>
                                    </>
                                  )}
                                </div>

                                {/* Divider dot */}
                                <div className="relative flex flex-col items-center pt-1.5">
                                  <div className={`size-2.5 shrink-0 rounded-full ${
                                    item.highlighted
                                      ? "bg-primary shadow-sm shadow-primary/30"
                                      : "bg-gray-300"
                                  }`} />
                                  {idx < items.length - 1 && (
                                    <div className="w-px flex-1 bg-gray-200" />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-[15px] font-bold leading-snug text-black">
                                    {item.title}
                                  </h4>
                                  {item.speaker_name && (
                                    <p className="mt-1 text-sm text-black/60">
                                      {item.speaker_name}
                                      {item.speaker_title && <span className="text-black/40"> · {item.speaker_title}</span>}
                                    </p>
                                  )}
                                  {item.description && (
                                    <p className="mt-2 text-sm leading-relaxed text-black/50">{item.description}</p>
                                  )}
                                  {item.track_or_room && (
                                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                      <MapPin className="size-2.5" />{item.track_or_room}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
                    <CalendarDays className="mb-4 size-10 text-gray-300" />
                    <p className="text-base font-semibold text-black">Schedule coming soon</p>
                    <p className="mt-1 max-w-xs text-sm text-black/40">Check back later for session details and timings.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: sticky registration ── */}
            <div className="lg:pt-0">
              <div className="sticky top-8 space-y-5">
                {/* Price + CTA card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
                  {event.is_free ? (
                    <div className="mb-4">
                      <p className="text-3xl font-black text-emerald-600">Free</p>
                      <p className="text-xs text-black/40">No registration fee</p>
                    </div>
                  ) : lowestPrice !== null ? (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">From</p>
                      <p className="text-3xl font-black text-black">NPR {lowestPrice.toLocaleString()}</p>
                      {hasPriceRange && <p className="text-xs text-black/40">Multiple ticket types available</p>}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-3xl font-black text-black">TBA</p>
                      <p className="text-xs text-black/40">Pricing announced soon</p>
                    </div>
                  )}

                  {/* Ticket list */}
                  {ticketTypes.length > 0 && !event.is_free && (
                    <div className="mb-5 space-y-1.5">
                      {ticketTypes.slice(0, 4).map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                          <span className="font-medium text-black">{t.name}</span>
                          <span className="font-bold text-primary">NPR {t.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {ticketTypes.length > 4 && (
                        <p className="text-center text-xs text-black/30">+{ticketTypes.length - 4} more</p>
                      )}
                    </div>
                  )}

                  {/* QR Code Payment */}
                  {!event.is_free && event.payment_qr_image_url && (
                    <div className="mb-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="size-4 text-primary" />
                        <p className="text-sm font-bold text-primary">Scan to Pay</p>
                      </div>
                      <div className="flex justify-center mb-3">
                        <img
                          src={event.payment_qr_image_url}
                          alt="Payment QR Code"
                          className="h-48 w-48 object-contain rounded-lg bg-white p-2 shadow-sm"
                        />
                      </div>
                      {event.payment_instructions && (
                        <p className="text-xs text-black/60 text-center leading-relaxed">
                          {event.payment_instructions}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-primary/70 text-center font-medium">
                        Upload your payment screenshot during registration
                      </p>
                    </div>
                  )}

                  {isRegistrationClosed ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-bold text-black/25">
                      <CheckCircle2 className="size-4" />
                      {isPastEvent ? "Event Has Ended" : "Registration Closed"}
                    </div>
                  ) : (
                    <Link
                      href={`/events/${event.slug}/register`}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                    >
                      Register Now
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}

                  <div className="mt-4">
                    <ShareEventButton title={event.title} description={event.short_description || event.description} />
                  </div>
                </div>

                {/* Contact */}
                {event.contact_email && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-black/30">
                      <Mail className="mr-1 inline size-3" /> Contact
                    </p>
                    <a href={`mailto:${event.contact_email}`} className="text-sm font-semibold text-primary hover:underline">
                      {event.contact_email}
                    </a>
                  </div>
                )}

                {/* Quick links */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-black/30">Explore</p>
                  <div className="space-y-1">
                    {[
                      { href: "/events", label: "All Events" },
                      { href: "/get-involved", label: "Get Involved" },
                      { href: "/contact", label: "Contact Us" },
                    ].map((link) => (
                      <Link key={link.href} href={link.href} className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50">
                        {link.label}
                        <ArrowRight className="size-3.5 text-black/20 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GALLERY — full width
          ═══════════════════════════════════════════ */}
      <section className="mt-12 md:mt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-2 text-2xl font-black tracking-tight text-black">Gallery</h2>
          <div className="mb-6 h-1 w-12 rounded-full bg-[#0B5F8A]" />

          {hasGallery ? (
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {event.gallery.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-xl bg-gray-100 ${
                    idx === 0 ? "col-span-2 row-span-2" : ""
                  } ${idx === 0 ? "aspect-square" : "aspect-square"}`}
                >
                  <Image
                    src={url}
                    alt={`${event.title} - Photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
              <ImageOff className="mb-4 size-10 text-gray-300" />
              <p className="text-base font-semibold text-black">No photos yet</p>
              <p className="mt-1 max-w-xs text-sm text-black/40">Gallery images will appear here once uploaded.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VENUE — full width
          ═══════════════════════════════════════════ */}
      <section className="mt-12 md:mt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-2 text-2xl font-black tracking-tight text-black">Venue</h2>
          <div className="mb-6 h-1 w-12 rounded-full bg-[#29b6c8]" />

          {hasMap ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="h-[420px] w-full">
                <iframe
                  src={`https://maps.google.com/maps?q=${event.latitude},${event.longitude}&output=embed&z=16`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Event location map"
                />
              </div>
              {(event.venue_name || event.address) && (
                <div className="flex items-start gap-3 bg-white p-5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    {event.venue_name && <p className="font-bold text-black">{event.venue_name}</p>}
                    {event.address && <p className="text-sm text-black/50">{event.address}</p>}
                    <a
                      href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open in Google Maps <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
              <MapPinned className="mb-4 size-10 text-gray-300" />
              <p className="text-base font-semibold text-black">Location to be announced</p>
              <p className="mt-1 max-w-xs text-sm text-black/40">The venue details will be shared soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="mt-16 bg-primary px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
            <Sparkles className="size-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">Join the community</span>
          </div>
          <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">Don&apos;t miss future events</h2>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80">
            Stay connected with Deessa Foundation and be the first to know about upcoming gatherings, workshops, and community events.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/events" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5">
              Browse all events
            </Link>
            <Link href="/get-involved" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20">
              Get involved
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
