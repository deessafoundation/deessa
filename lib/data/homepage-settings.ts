/**
 * Homepage Settings Data Loaders
 * 
 * These functions safely fetch homepage content from the CMS with fallbacks.
 * They follow the same pattern as existing getHomeHeroSettings() in site-settings.ts
 * 
 * IMPORTANT: All functions include fallbacks to prevent breaking the site if DB is unavailable
 * 
 * @module lib/data/homepage-settings
 */

"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  HomepageStatsSettings,
  HomepageProgramsSettings,
  HomepageHeroCTAsSettings,
  HomepageCTACardsSettings,
  HomepageBannersSettings,
  HomepageMarqueeSettings,
  HomepageSEOSettings,
  HomepageFlags,
  HomepageTrustIndicators,
  HomepageFeaturedStoriesRules,
  HomepageHeroCarouselSettings,
  HomepageTestimonialsSettings,
  HomepageTimelineSettings,
} from "@/lib/types/homepage-settings"
import {
  HOMEPAGE_SETTINGS_KEYS,
  DEFAULT_HOMEPAGE_STATS,
  DEFAULT_HOMEPAGE_FLAGS,
  DEFAULT_TRUST_INDICATORS,
  DEFAULT_FEATURED_STORIES_RULES,
  DEFAULT_HERO_CAROUSEL,
  DEFAULT_TESTIMONIALS,
  DEFAULT_TIMELINE,
} from "@/lib/types/homepage-settings"

// ============================================================================
// HELPER FUNCTION - Generic settings loader with fallback
// ============================================================================

async function getHomepageSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single()

    if (error) {
      console.error(`Error fetching ${key}:`, error)
      return defaultValue
    }

    if (!data || !data.value) {
      return defaultValue
    }

    // Merge with defaults to ensure all fields exist
    return {
      ...defaultValue,
      ...data.value,
    } as T
  } catch (error) {
    console.error(`Exception fetching ${key}:`, error)
    return defaultValue
  }
}

// ============================================================================
// HOMEPAGE STATS
// ============================================================================

/**
 * Get homepage stats with fallback to hard-coded defaults
 * This will eventually replace the stats1/stats2 arrays in ImpactClientPage.tsx
 */
export async function getHomepageStats(): Promise<HomepageStatsSettings> {
  return getHomepageSetting<HomepageStatsSettings>(
    HOMEPAGE_SETTINGS_KEYS.STATS,
    DEFAULT_HOMEPAGE_STATS
  )
}

// ============================================================================
// HOMEPAGE PROGRAMS
// ============================================================================

/**
 * Get homepage program blocks with fallback
 * This will eventually replace the programs array in ImpactClientPage.tsx
 */
export async function getHomepagePrograms(): Promise<HomepageProgramsSettings> {
  const defaultPrograms: HomepageProgramsSettings = {
    programs: [
      {
        id: "education",
        badge: "📚 Education",
        headline: "Building Classrooms, Building Futures",
        body: "Since 2015, deessa Foundation has constructed and renovated 50+ schools across remote Himalayan and Terai communities — ensuring every child has a safe space to learn, grow, and dream. Our education initiatives combine infrastructure with holistic teacher training programs.",
        bullets: [
          "50+ schools built & renovated from Humla to Dang",
          "500+ teachers trained in child-centered pedagogy",
          "3,000+ scholarships awarded to marginalized students",
        ],
        stat: "3,000+",
        statLabel: "students supported",
        imageSrc: "/StoriesSectionImage.png",
        imageAlt: "Education in Nepal",
        link: "/programs?category=education",
        linkText: "Read Education Stories →",
        order: 1,
        reversed: false,
        featured: true,
      },
      {
        id: "healthcare",
        badge: "🏥 Healthcare",
        headline: "Bringing Medicine to the Mountains",
        body: "200+ free health camps have reached villages where the nearest hospital is a full day's walk away. Our mobile health units carry everything from basic diagnostics to maternal care — meeting communities where they are, not where is convenient.",
        bullets: [
          "200+ free health camps across 25 districts",
          "Maternal & child health care for 5,000+ women",
          "Eye care, dental, and general checkups provided free",
        ],
        stat: "200+",
        statLabel: "health camps conducted",
        imageSrc: "/missionVisionObjectives.png",
        imageAlt: "Healthcare for mountain communities",
        link: "/programs?category=health",
        linkText: "See Health Impact Stories →",
        order: 2,
        reversed: true,
        featured: true,
      },
      {
        id: "empowerment",
        badge: "👩 Women Empowerment",
        headline: "Women Who Lead",
        body: "When women rise, communities transform. Our women's empowerment programs provide vocational training, microfinance access, and leadership workshops — creating 500+ self-sufficient entrepreneurs and community advocates across Nepal's remotest corners.",
        bullets: [
          "500+ women trained in vocational skills",
          "Microfinance access for rural women entrepreneurs",
          "Leadership programs promoting women in governance",
        ],
        stat: "500+",
        statLabel: "women empowered",
        imageSrc: "/JoinTheMovement.png",
        imageAlt: "Women leadership in Nepal",
        link: "/programs?category=empowerment",
        linkText: "See Women's Stories →",
        order: 3,
        reversed: false,
        featured: true,
      },
    ],
  }

  return getHomepageSetting<HomepageProgramsSettings>(
    HOMEPAGE_SETTINGS_KEYS.PROGRAMS,
    defaultPrograms
  )
}

// ============================================================================
// HOMEPAGE HERO CTAs
// ============================================================================

/**
 * Get homepage hero call-to-action buttons
 */
export async function getHomepageHeroCTAs(): Promise<HomepageHeroCTAsSettings> {
  const defaultCTAs: HomepageHeroCTAsSettings = {
    ctas: [
      {
        id: "donate",
        label: "Donate Now",
        url: "/donate",
        variant: "primary",
        icon: "heart",
        order: 1,
        visible: true,
      },
      {
        id: "learn-more",
        label: "Our Impact",
        url: "/impact",
        variant: "secondary",
        icon: "arrow-right",
        order: 2,
        visible: true,
      },
    ],
  }

  return getHomepageSetting<HomepageHeroCTAsSettings>(
    HOMEPAGE_SETTINGS_KEYS.HERO_CTAS,
    defaultCTAs
  )
}

// ============================================================================
// HOMEPAGE CTA CARDS
// ============================================================================

/**
 * Get homepage CTA cards (Get Involved section)
 */
export async function getHomepageCTACards(): Promise<HomepageCTACardsSettings> {
  const defaultCards: HomepageCTACardsSettings = {
    cards: [
      {
        id: "donate",
        title: "Make a Donation",
        description: "Your contribution directly funds education, healthcare, and community development programs across Nepal.",
        icon: "heart",
        ctaLabel: "Donate Now",
        ctaUrl: "/donate",
        color: "orange",
        order: 1,
        visible: true,
      },
      {
        id: "volunteer",
        title: "Volunteer With Us",
        description: "Join our team on the ground and make a hands-on difference in the lives of communities we serve.",
        icon: "users",
        ctaLabel: "Get Involved",
        ctaUrl: "/get-involved",
        color: "teal",
        order: 2,
        visible: true,
      },
      {
        id: "partner",
        title: "Become a Partner",
        description: "Collaborate with us to amplify impact through corporate partnerships and institutional support.",
        icon: "handshake",
        ctaLabel: "Partner With Us",
        ctaUrl: "/contact",
        color: "white",
        order: 3,
        visible: true,
      },
    ],
  }

  return getHomepageSetting<HomepageCTACardsSettings>(
    HOMEPAGE_SETTINGS_KEYS.CTA_CARDS,
    defaultCards
  )
}

// ============================================================================
// HOMEPAGE BANNERS
// ============================================================================

/**
 * Get homepage brush stroke / quote banners
 */
export async function getHomepageBanners(): Promise<HomepageBannersSettings> {
  const defaultBanners: HomepageBannersSettings = {
    banners: [
      {
        id: "education-quote",
        type: "brush-quote",
        color: "#8B8DD4",
        headline: "Education is not preparation for life; education is life itself.",
        body: "Every classroom we build, every teacher we train, every scholarship we award — these are not just programs. They are promises kept.",
        ctaLabel: null,
        ctaUrl: null,
        order: 1,
        visible: true,
        animate: true,
        animationDuration: 1.2,
      },
    ],
  }

  return getHomepageSetting<HomepageBannersSettings>(
    HOMEPAGE_SETTINGS_KEYS.BANNERS,
    defaultBanners
  )
}

// ============================================================================
// HOMEPAGE MARQUEE SETTINGS
// ============================================================================

/**
 * Get homepage marquee (partner logos) settings
 */
export async function getHomepageMarqueeSettings(): Promise<HomepageMarqueeSettings> {
  const defaultMarquee: HomepageMarqueeSettings = {
    enabled: true,
    speed: 50,
    pauseOnHover: true,
    repeatOnMobile: true,
    maxLogoHeight: 60,
    spacing: "comfortable",
    grouping: {
      enabled: true,
      groups: [
        { id: "platinum", name: "Platinum Partners", order: 1, visible: true },
        { id: "gold", name: "Gold Sponsors", order: 2, visible: true },
        { id: "community", name: "Community Partners", order: 3, visible: true },
      ],
    },
    spacingPresets: {
      compact: 16,
      comfortable: 32,
      spacious: 48,
    },
  }

  return getHomepageSetting<HomepageMarqueeSettings>(
    HOMEPAGE_SETTINGS_KEYS.MARQUEE,
    defaultMarquee
  )
}

// ============================================================================
// HOMEPAGE SEO
// ============================================================================

/**
 * Get homepage SEO metadata overrides
 */
export async function getHomepageSEO(): Promise<HomepageSEOSettings> {
  const defaultSEO: HomepageSEOSettings = {
    title: "deessa Foundation - Empowering Communities Across Nepal",
    description: "Since 2015, deessa Foundation has been transforming lives through education, healthcare, and community empowerment in rural Nepal. Join us in making a difference.",
    ogImage: "/og-image-home.jpg",
    keywords: ["Nepal NGO", "education Nepal", "healthcare Nepal", "community development", "rural empowerment"],
  }

  return getHomepageSetting<HomepageSEOSettings>(
    HOMEPAGE_SETTINGS_KEYS.SEO,
    defaultSEO
  )
}

// ============================================================================
// HOMEPAGE FLAGS
// ============================================================================

/**
 * Get homepage feature flags and display toggles
 */
export async function getHomepageFlags(): Promise<HomepageFlags> {
  return getHomepageSetting<HomepageFlags>(
    HOMEPAGE_SETTINGS_KEYS.FLAGS,
    DEFAULT_HOMEPAGE_FLAGS
  )
}

// ============================================================================
// HOMEPAGE TRUST INDICATORS
// ============================================================================

/**
 * Get homepage trust indicators and micro-copy
 */
export async function getHomepageTrustIndicators(): Promise<HomepageTrustIndicators> {
  return getHomepageSetting<HomepageTrustIndicators>(
    HOMEPAGE_SETTINGS_KEYS.TRUST_INDICATORS,
    DEFAULT_TRUST_INDICATORS
  )
}

// ============================================================================
// HOMEPAGE FEATURED STORIES RULES
// ============================================================================

/**
 * Get homepage featured stories selection rules
 */
export async function getHomepageFeaturedStoriesRules(): Promise<HomepageFeaturedStoriesRules> {
  return getHomepageSetting<HomepageFeaturedStoriesRules>(
    HOMEPAGE_SETTINGS_KEYS.FEATURED_STORIES_RULES,
    DEFAULT_FEATURED_STORIES_RULES
  )
}

// ============================================================================
// HOMEPAGE HERO CAROUSEL
// ============================================================================

/**
 * Get homepage hero carousel slides
 */
export async function getHomepageHeroCarousel(): Promise<HomepageHeroCarouselSettings> {
  return getHomepageSetting<HomepageHeroCarouselSettings>(
    HOMEPAGE_SETTINGS_KEYS.HERO_CAROUSEL,
    DEFAULT_HERO_CAROUSEL
  )
}

// ============================================================================
// HOMEPAGE TESTIMONIALS
// ============================================================================

/**
 * Get homepage testimonials
 */
export async function getHomepageTestimonials(): Promise<HomepageTestimonialsSettings> {
  return getHomepageSetting<HomepageTestimonialsSettings>(
    HOMEPAGE_SETTINGS_KEYS.TESTIMONIALS,
    DEFAULT_TESTIMONIALS
  )
}

// ============================================================================
// HOMEPAGE TIMELINE
// ============================================================================

/**
 * Get homepage timeline milestones
 */
export async function getHomepageTimeline(): Promise<HomepageTimelineSettings> {
  return getHomepageSetting<HomepageTimelineSettings>(
    HOMEPAGE_SETTINGS_KEYS.TIMELINE,
    DEFAULT_TIMELINE
  )
}

// ============================================================================
// CONVENIENCE FUNCTION - Get all homepage settings at once
// ============================================================================

/**
 * Get all homepage settings in a single call
 * Useful for admin UI or when you need multiple settings
 */
export async function getAllHomepageSettings() {
  const [
    heroCarousel,
    stats,
    programs,
    heroCTAs,
    ctaCards,
    banners,
    marquee,
    seo,
    flags,
    trustIndicators,
    featuredStoriesRules,
    testimonials,
    timeline,
  ] = await Promise.all([
    getHomepageHeroCarousel(),
    getHomepageStats(),
    getHomepagePrograms(),
    getHomepageHeroCTAs(),
    getHomepageCTACards(),
    getHomepageBanners(),
    getHomepageMarqueeSettings(),
    getHomepageSEO(),
    getHomepageFlags(),
    getHomepageTrustIndicators(),
    getHomepageFeaturedStoriesRules(),
    getHomepageTestimonials(),
    getHomepageTimeline(),
  ])

  return {
    heroCarousel,
    stats,
    programs,
    heroCTAs,
    ctaCards,
    banners,
    marquee,
    seo,
    flags,
    trustIndicators,
    featuredStoriesRules,
    testimonials,
    timeline,
  }
}
