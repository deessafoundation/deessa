import type { Metadata } from "next"
import artHero from "@/public/home/hero/art_banner.jpeg"
import podcastBanner from "@/public/podcast_banner.jpeg"
import inclusionAtHomeImage from "@/public/home/hero/inclusion-begins-at-home.jpg"
import { SecretKeyListener } from "@/components/secret-key-listener"
import { HeroCarousel } from "@/components/hero-carousel"
import type { HeroSlide } from "@/components/hero-carousel"
import {
  OurStorySection,
  MissionVisionSection,
  ProgramsSection,
  PodcastSection,
  TestimonialsSection,
  ContactSection,
  GlobalEnhancements,
} from "@/components/homepage-sections"
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
  const [storySettings, whatWeDoSettings, heroCarouselSettings, testimonialsSettings, homeArtworks] = await Promise.all([
    getHomepageStory(),
    getHomepageWhatWeDo(),
    getHomepageHeroCarousel(),
    getHomepageTestimonials(),
    getHomepageArtworks(),
  ])
  const artsContent = homeArtworks.length ? await getArtsContent() : null

  // Convert hero carousel settings to slides format
  // Normalize CMS image paths: fix Windows backslashes and ensure leading
  // slash so next/image never crashes on values like "home\hero\img.jpg".
  const normalizeSlideImage = (src: string, fallback: string) => {
    if (!src || typeof src !== "string") return fallback
    const trimmed = src.trim()
    // Replace only the superseded CMS uploads; future admin uploads remain authoritative.
    if (trimmed === "https://tqljblbdfhjfqnegjobi.supabase.co/storage/v1/object/public/hero-images/homepage-hero/hero-slide-2_2026-09-17_05-05-14_ev8e62b8.jpg") return inclusionAtHomeImage.src
    if (trimmed === "https://tqljblbdfhjfqnegjobi.supabase.co/storage/v1/object/public/hero-images/homepage-hero/hero-slide-4_2026-09-16_15-29-11_aarw2dxz.png") return podcastBanner.src
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed
    const forward = trimmed.replace(/\\/g, "/")
    const withSlash = forward.startsWith("/") ? forward : `/${forward}`
    // Resolve both saved filenames to the current asset; its content hash prevents stale caches.
    if (["/home/hero/inclusion-begins-at-home.jpg", "/home/hero/inclusion-begins-at-home-v2.jpg"].includes(withSlash.split("?")[0])) {
      return inclusionAtHomeImage.src
    }
    if (["/podcast_banner.jpeg", "/podcast_banner.png", "/home/podcast/deessa-podcast-studio.png"].includes(withSlash.split("?")[0])) {
      return podcastBanner.src
    }
    return withSlash
  }

  const heroSlides: HeroSlide[] = heroCarouselSettings.slides
    .filter(slide => slide.visible)
    .sort((a, b) => a.order - b.order)
    .map((slide) => ({
      id: slide.id,
      image: slide.id === "slide-1" && ["/home/hero/real-voices-young-speaker.jpg", "/home/hero/art_banner.jpeg"].includes(slide.image.replace(/\\/g, "/")) ? artHero.src : normalizeSlideImage(slide.image, artHero.src),
      title: slide.id === "slide-1" && slide.title === "Understanding Begins with Lived Experience" ? "Every child deserves space to thrive" : slide.title,
      subtitle: slide.id === "slide-1" && slide.title === "Understanding Begins with Lived Experience" ? "Through creativity, learning, and everyday moments of connection, deessa helps build a world where every child feels understood, included, and free to explore their potential." : slide.subtitle,
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

      {/* 6. ART FEATURE - CMS artwork highlights and the art activity feature */}
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
