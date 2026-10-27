import { Metadata } from "next"
import { getContextPartners } from "@/lib/data/context-partners"
import { PartnersDisplayDemo } from "./partners-display-demo"

export const metadata: Metadata = {
  title: "Partners Display Demo | Nepal Accessibility Summit 2026",
  description: "Refined partners and collaborators layout demo with real DB data",
}

export default async function PartnersDemo() {
  // Fetch real partners data from accessibility summit event
  // UUID from the database (Nepal Accessibility Summit 2026)
  const eventId = "52c72524-7cf7-4275-8739-30ea31119669"
  const partnersData = await getContextPartners("event", eventId)

  return (
    <main className="min-h-screen bg-slate-50">
      <PartnersDisplayDemo data={partnersData} eventId={eventId} />
    </main>
  )
}
