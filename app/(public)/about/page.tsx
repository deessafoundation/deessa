import type { Metadata } from "next"
import { AboutHero } from "@/components/about-hero"
import { AboutSections } from "./AboutSections"

export const metadata: Metadata = {
  title: "Who We Are - deessa Foundation",
  description:
    "deessa Foundation is a non-profit working for and with children with disabilities, with a special focus on autism — building a Nepal where every child is seen, heard, and included.",
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutSections />
    </>
  )
}
