import { SecretKeyListener } from "@/components/secret-key-listener"
import { HeroCarousel } from "@/components/hero-carousel"
import type { HeroSlide } from "@/components/hero-carousel"
import { HomeAccessibilityButton } from "@/components/home-accessibility-button"
import {
  OurStorySection,
  MissionVisionSection,
  ImpactStatsBar,
  ProgramsSection,
  TimelineSection,
  TestimonialsSection,
  PartnersSection,
  ContactSection,
  GlobalEnhancements,
} from "@/components/homepage-sections"
import { 
  getHomepageStats, 
  getHomepagePrograms,
  getHomepageMarqueeSettings,
  getHomepageHeroCarousel,
  getHomepageTestimonials,
  getHomepageTimeline,
} from "@/lib/data/homepage-settings"

/* ──────────────────  PAGE  ────────────────── */

export default async function HomePage() {
  // Fetch CMS data for homepage
  const statsSettings = await getHomepageStats()
  const programsSettings = await getHomepagePrograms()
  const marqueeSettings = await getHomepageMarqueeSettings()
  const heroCarouselSettings = await getHomepageHeroCarousel()
  const testimonialsSettings = await getHomepageTestimonials()
  const timelineSettings = await getHomepageTimeline()

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

      {/* 2. IMPACT STATS BAR - CMS POWERED */}
      <ImpactStatsBar stats={statsSettings.stats} />

      {/* 3. OUR STORY */}
      <OurStorySection />

      {/* 4. MISSION, VISION, OBJECTIVES */}
      <MissionVisionSection />

      {/* 5. PROGRAMS - CMS POWERED */}
      <ProgramsSection programs={programsSettings.programs} />

      {/* 6. TIMELINE - CMS POWERED */}
      <TimelineSection timeline={timelineSettings} />

      {/* 7. TESTIMONIALS - CMS POWERED */}
      <TestimonialsSection testimonials={testimonialsSettings} />

      {/* 8. PARTNERS & SPONSORS - CMS POWERED */}
      <PartnersSection settings={marqueeSettings} />

      {/* 9. CONTACT / VISIT OFFICE */}
      <ContactSection />

      {/* GLOBAL ENHANCEMENTS */}
      <GlobalEnhancements />
    </SecretKeyListener>
  )
}
