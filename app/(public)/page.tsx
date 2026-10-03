import type { Metadata } from "next"
import { SecretKeyListener } from "@/components/homepage/secret-key-listener"
import { HeroCarousel } from "@/components/homepage/hero-carousel"
import type { HeroSlide } from "@/components/homepage/hero-carousel"
import {
  OurStorySection,
  MissionVisionSection,
  ProgramsSection,
  PodcastSection,
  TestimonialsSection,
  ContactSection,
  GlobalEnhancements,
} from "@/components/homepage/homepage-sections"
import {
  getHomepageStory,
  getHomepageWhatWeDo,
  getHomepageHeroCarousel,
  getHomepageTestimonials,
} from "@/lib/data/homepage-settings"
import { getArtsContent, getHomepageArtworks } from "@/lib/data/artworks"
import { HomeArtFeature } from "@/components/arts/home-art-feature"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

// Homepage content comes from the shared CMS. Always render it from the
// current database value so admin updates appear on both localhost and live.
export const dynamic = "force-dynamic"

/* ──────────────────  METADATA  ────────────────── */

export const metadata: Metadata = generateSEOMetadata({
  title: "deessa Foundation - Empowering Nepal Through Education & Social Development",
  description: "A non-profit organization dedicated to sustainable development, quality education, healthcare, and social upliftment for vulnerable communities in Nepal. Focused on autism support and disability rights.",
  path: "/",
  keywords: [
    "Nepal NGO",
    "autism support Nepal",
    "education Nepal",
    "disability rights",
    "child development",
    "sustainable development Nepal",
    "social welfare",
    "special education",
    "inclusive education",
    "community empowerment Nepal",
  ],
})

/* ──────────────────  PAGE  ────────────────── */

export default async function HomePage() {
  // Fetch CMS data for homepage
  const storySettings = await getHomepageStory()
  const whatWeDoSettings = await getHomepageWhatWeDo()
  const heroCarouselSettings = await getHomepageHeroCarousel()
  const testimonialsSettings = await getHomepageTestimonials()
  const homeArtworks = await getHomepageArtworks()
  const artsContent = homeArtworks.length ? await getArtsContent() : null

  // Convert hero carousel settings to slides format
  // Normalize CMS image paths: fix Windows backslashes and ensure leading
  // slash so next/image never crashes on values like "home\hero\img.jpg".
  const normalizeSlideImage = (src: string, fallback: string) => {
    if (!src || typeof src !== "string") return fallback
    const trimmed = src.trim()
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed
    const forward = trimmed.replace(/\\/g, "/")
    let withSlash = forward.startsWith("/") ? forward : `/${forward}`
    // Point the old slide-2 filename at the refreshed photo. The file was
    // replaced under the same name, so this rename busts browser + Next
    // image caches (query strings are rejected on local images).
    // Matches both the CMS backslash variant and the clean default path.
    if (withSlash.split("?")[0].endsWith("home/hero/inclusion-begins-at-home.jpg")) {
      withSlash = "/home/hero/inclusion-begins-at-home-v2.jpg"
    }
    return withSlash
  }

  const heroSlides: HeroSlide[] = heroCarouselSettings.slides
    .filter(slide => slide.visible)
    .sort((a, b) => a.order - b.order)
    .map((slide) => ({
      id: slide.id,
      image: normalizeSlideImage(slide.image, "/home/hero/real-voices-young-speaker.jpg"),
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta,
      ctaHref: slide.ctaHref,
      ctaVariant: slide.ctaVariant,
    }))

  return (
    <SecretKeyListener>
      {/* The accessibility launcher is mounted once for every public page in
          app/(public)/layout.tsx — see components/accessibility. */}

      {/* 1. HERO BANNER CAROUSEL - CMS POWERED */}
      <HeroCarousel 
        slides={heroSlides}
        interval={heroCarouselSettings.interval}
      />

      {/* 3. OUR STORY - CMS POWERED */}
      <OurStorySection story={storySettings} />

      {/* 4. MISSION, VISION, OBJECTIVES */}
      <MissionVisionSection />

      {/* 5. WHAT WE DO - CMS POWERED */}
      <ProgramsSection whatWeDo={whatWeDoSettings} />

      {/* 6. ART FEATURE - managed in /admin/artworks (hidden when none published) */}
      <HomeArtFeature artworks={homeArtworks} content={artsContent?.home} />

      {/* 7. PODCAST FEATURE */}
      <PodcastSection />

      {/* 8. TESTIMONIALS - CMS POWERED */}
      <TestimonialsSection testimonials={testimonialsSettings} />

      {/* 9. CONTACT / VISIT OFFICE */}
      <ContactSection />

      {/* GLOBAL ENHANCEMENTS */}
      <GlobalEnhancements />
    </SecretKeyListener>
  )
}
