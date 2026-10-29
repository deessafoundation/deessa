import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"
import { EventsLanding, type ListingEvent } from "@/components/events/events-landing"
import { accessibilitySummit } from "@/lib/data/accessibility-summit"
export const revalidate = 300

export const metadata: Metadata = generateSEOMetadata({
  title: "Events - Workshops & Community Gatherings",
  description:
    "Browse upcoming events, workshops, and community gatherings organized by deessa Foundation. Join us in making a difference in Nepal's communities.",
  path: "/events",
  keywords: [
    "Nepal events",
    "community events Nepal",
    "workshops Nepal",
    "autism events",
    "NGO events",
    "volunteer events",
  ],
})

async function getPublishedEvents(): Promise<ListingEvent[] | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("id,title,slug,short_description,event_date,event_end_date,event_time,location,venue_name,image,banner_url,category,is_free")
      .eq("status", "published")
      .order("event_date", { ascending: true })

    if (error) {
      console.error("[events] Supabase query error:", error.message, error.code)
      return null
    }
    return (data || []) as ListingEvent[]
  } catch (error) {
    console.error("[events] Unexpected error:", error)
    return null
  }
}

export default async function EventsPage() {
  const events = await getPublishedEvents()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date())
  const part = (type: string) => parts.find((value) => value.type === type)?.value
  const today = `${part("year")}-${part("month")}-${part("day")}`

  const listings: ListingEvent[] = [accessibilitySummit, ...(events ?? [])]
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
  return <EventsLanding events={listings} unavailable={events === null} today={today} />
}
