import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/seo/page-metadata"
import { GetInvolvedClient } from "./GetInvolvedClient"

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/get-involved")
}

export default function GetInvolvedPage() {
  return <GetInvolvedClient />
}
