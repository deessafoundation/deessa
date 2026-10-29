import type { Metadata } from "next"
import Link from "next/link"
import { getPublishedStories, getFeaturedStory } from "@/lib/data/stories"
import { StoriesSections } from "./StoriesSections"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = generateSEOMetadata({
  title: "Impact Stories - Real Stories of Change in Nepal",
  description: "Read inspiring stories of impact and transformation from our community. Discover how deessa Foundation is changing lives across Nepal through education, healthcare, and empowerment.",
  path: "/stories",
  keywords: [
    "Nepal impact stories",
    "success stories",
    "community transformation",
    "education impact",
    "autism stories Nepal",
    "social change Nepal",
    "real impact",
  ],
})

function formatStoryDate(story: { published_at?: string | null; created_at?: string | null }) {
  const rawDate = story.published_at || story.created_at

  if (!rawDate) {
    return "Recently"
  }

  return new Date(rawDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface StoriesPageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function StoriesPage(props: StoriesPageProps) {
  let searchParams: { filter?: string } = {}
  
  try {
    searchParams = await props.searchParams
  } catch (error) {
    console.error("Error reading searchParams:", error)
  }

  const [allStories, featuredStory] = await Promise.all([
    getPublishedStories(),
    getFeaturedStory(),
  ])

  const filterOptions = ["all", "latest", "featured"] as const
  const requestedFilter = (searchParams?.filter || "all").toLowerCase()
  const activeFilter = filterOptions.includes(requestedFilter as (typeof filterOptions)[number])
    ? (requestedFilter as (typeof filterOptions)[number])
    : "all"

  const getStoryTime = (story: { published_at?: string | null; created_at?: string | null }) => {
    const raw = story.published_at || story.created_at
    return raw ? new Date(raw).getTime() : 0
  }

  const primaryStory = featuredStory ?? allStories[0] ?? null

  const filteredPool = (() => {
    if (activeFilter === "featured") {
      return allStories.filter((story) => story.is_featured)
    }

    const withoutPrimary = primaryStory
      ? allStories.filter((story) => story.id !== primaryStory.id)
      : allStories

    if (activeFilter === "latest") {
      return [...withoutPrimary].sort((a, b) => getStoryTime(b) - getStoryTime(a))
    }

    return withoutPrimary
  })()

  const spotlightMainStory = filteredPool[0] ?? null
  const spotlightSideStories = filteredPool.slice(1, 3)
  const remainingStories = filteredPool.slice(3)

  // Format dates on the server side
  const formattedStories = {
    spotlightMainStory: spotlightMainStory ? {
      ...spotlightMainStory,
      formattedDate: formatStoryDate(spotlightMainStory)
    } : null,
    spotlightSideStories: spotlightSideStories.map(story => ({
      ...story,
      formattedDate: formatStoryDate(story)
    })),
    remainingStories: remainingStories.map(story => ({
      ...story,
      formattedDate: formatStoryDate(story)
    }))
  }

  return (
    <>
      {/* Sections 2 and 3 - Client Component with Framer Motion */}
      <StoriesSections
        primaryStory={primaryStory}
        activeFilter={activeFilter}
        spotlightMainStory={formattedStories.spotlightMainStory}
        spotlightSideStories={formattedStories.spotlightSideStories}
        remainingStories={formattedStories.remainingStories}
      />

      {/* CTA Section */}
      <section className="dark-section bg-[linear-gradient(180deg,#f7f4ef_0%,#fbf8f4_100%)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-[2.25rem] bg-primary px-6 py-10 text-center text-white shadow-[0_22px_60px_-40px_rgba(54,69,122,0.85)] md:px-10 md:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Take action</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Be part of someone&apos;s story.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Your support helps families access therapy, inclusive education, and patient guidance that change daily life for children and caregivers.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5"
              >
                Support a child
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/70 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
              >
                Share a story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
