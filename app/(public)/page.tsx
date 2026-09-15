import type { Metadata } from "next"
import { SecretKeyListener } from "@/components/secret-key-listener"
import { HeroCarousel } from "@/components/hero-carousel"
import type { HeroSlide } from "@/components/hero-carousel"
import { HomeAccessibilityButton } from "@/components/home-accessibility-button"
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
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

/* ──────────────────  METADATA  ────────────────── */

export const metadata: Metadata = generateSEOMetadata({
  title: "Deesha Foundation - Empowering Nepal Through Education & Social Development",
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

  // Convert hero carousel settings to slides format
  const heroSlides: HeroSlide[] = heroCarouselSettings.slides
    .filter(slide => slide.visible)
    .sort((a, b) => a.order - b.order)
    .map(slide => ({
      image: slide.image,
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta,
      ctaHref: slide.ctaHref,
      ctaVariant: slide.ctaVariant,
    }))

  return (
    <SecretKeyListener>
      {/* Accessibility Button - fixed on right side */}
      <HomeAccessibilityButton />

      {/* 1. HERO BANNER CAROUSEL - CMS POWERED */}
      <HeroCarousel 
        slides={heroSlides.length > 0 ? heroSlides : heroSlides} 
        interval={heroCarouselSettings.interval}
      />

      {/* 3. OUR STORY - CMS POWERED */}
      <OurStorySection story={storySettings} />

      {/* 4. MISSION, VISION, OBJECTIVES */}
      <MissionVisionSection />

      {/* 5. WHAT WE DO - CMS POWERED */}
      <ProgramsSection whatWeDo={whatWeDoSettings} />

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
