/**
 * Homepage CMS Settings Types
 * 
 * These types define the structure of homepage content stored in the CMS.
 * They correspond to the site_settings keys created in 037-homepage-cms-schema.sql
 * 
 * @module lib/types/homepage-settings
 */

// ============================================================================
// HOMEPAGE STATS
// ============================================================================

export interface HomepageStat {
  value: number
  suffix?: string
  label: string
  sublabel?: string
  order: number
  highlight?: boolean
  icon?: string
}

export interface HomepageStatsSettings {
  stats: HomepageStat[]
}

// ============================================================================
// HOMEPAGE PROGRAMS
// ============================================================================

export interface HomepageProgram {
  id: string
  badge: string
  headline: string
  body: string
  bullets: string[]
  stat: string
  statLabel: string
  imageSrc: string
  imageAlt: string
  link: string
  linkText: string
  order: number
  reversed: boolean
  featured: boolean
}

export interface HomepageProgramsSettings {
  programs: HomepageProgram[]
}

// ============================================================================
// HOMEPAGE HERO CAROUSEL SLIDES
// ============================================================================

export interface HeroCarouselSlide {
  id: string
  image: string
  title: string
  subtitle: string
  cta: string
  ctaHref: string
  ctaVariant?: 'primary' | 'secondary'
  order: number
  visible: boolean
}

export interface HomepageHeroCarouselSettings {
  slides: HeroCarouselSlide[]
  interval: number
  autoPlay: boolean
}

// ============================================================================
// HOMEPAGE TESTIMONIALS
// ============================================================================

export interface HomepageTestimonial {
  id: string
  name: string
  role: string
  location: string
  image: string
  /** Direct MP4 or hosted video URL for a speaker message. */
  video?: string
  /** Short theme shown above the speaker's name. */
  topic?: string
  /** The speaker's key message or video caption. */
  caption?: string
  quote: string
  rating: number
  order: number
  visible: boolean
  featured: boolean
}

export interface HomepageTestimonialsSettings {
  testimonials: HomepageTestimonial[]
}

// ============================================================================
// HOMEPAGE TIMELINE
// ============================================================================

export interface TimelineMilestone {
  id: string
  year: string
  milestone: string
  description: string
  icon: string
  badgeClass: string
  yearClass: string
  order: number
  visible: boolean
}

export interface HomepageTimelineSettings {
  milestones: TimelineMilestone[]
  title: string
  subtitle: string
}

// ============================================================================
// HOMEPAGE STORY SECTION ("How deessa Started")
// ============================================================================

export interface HomepageStorySettings {
  eyebrow: string
  badgeText: string
  paragraphs: string[]
  linkText: string
  linkUrl: string
  founded: string
  foundedLabel: string
  image: string
  imageAlt: string
}

// ============================================================================
// HOMEPAGE WHAT WE DO / CORE PILLARS SECTION
// ============================================================================

export interface WhatWeDoPillar {
  id: string
  icon: string
  title: string
  description: string
  color: string
  glowClass: string
  statLabel: string
  statEnd: number
  order: number
  visible: boolean
}

export interface HomepageWhatWeDoSettings {
  eyebrow: string
  title: string
  subtitle: string
  pillars: WhatWeDoPillar[]
}

// ============================================================================
// HOMEPAGE HERO CTAs
// ============================================================================

export interface HomepageHeroCTA {
  id: string
  label: string
  url: string
  variant: 'primary' | 'secondary' | 'outline'
  icon?: string
  order: number
  visible: boolean
}

export interface HomepageHeroCTAsSettings {
  ctas: HomepageHeroCTA[]
}

// ============================================================================
// HOMEPAGE CTA CARDS (Get Involved Section)
// ============================================================================

export interface HomepageCTACard {
  id: string
  title: string
  description: string
  icon: string
  ctaLabel: string
  ctaUrl: string
  color: 'orange' | 'teal' | 'white' | 'purple' | 'blue'
  order: number
  visible: boolean
}

export interface HomepageCTACardsSettings {
  cards: HomepageCTACard[]
}

// ============================================================================
// HOMEPAGE BANNERS (Brush Strokes / Quotes)
// ============================================================================

export interface HomepageBanner {
  id: string
  type: 'brush-quote' | 'full-width' | 'split'
  color: string
  headline: string
  body?: string
  ctaLabel?: string | null
  ctaUrl?: string | null
  order: number
  visible: boolean
  animate?: boolean
  animationDuration?: number
}

export interface HomepageBannersSettings {
  banners: HomepageBanner[]
}

// ============================================================================
// HOMEPAGE MARQUEE SETTINGS
// ============================================================================

export interface MarqueeGroup {
  id: string
  name: string
  order: number
  visible: boolean
}

export interface MarqueeGrouping {
  enabled: boolean
  groups: MarqueeGroup[]
}

export interface MarqueeSpacingPresets {
  compact: number
  comfortable: number
  spacious: number
}

export interface HomepageMarqueeSettings {
  enabled: boolean
  speed: number
  pauseOnHover: boolean
  repeatOnMobile: boolean
  maxLogoHeight: number
  spacing: 'compact' | 'comfortable' | 'spacious'
  grouping: MarqueeGrouping
  spacingPresets: MarqueeSpacingPresets
}

// ============================================================================
// HOMEPAGE SEO OVERRIDES
// ============================================================================

export interface HomepageSEOSettings {
  title: string
  description: string
  ogImage: string
  keywords: string[]
}

// ============================================================================
// HOMEPAGE DISPLAY FLAGS
// ============================================================================

export interface HomepageFlags {
  showAccessibilityToolbar: boolean
  enableMarquee: boolean
  enableAnimations: boolean
  showTrustBadges: boolean
  showScrollProgress: boolean
  featuredStoriesMode: 'manual' | 'auto-latest' | 'auto-popular'
  accessibilityToolbarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showTrustIndicators: boolean
}

// ============================================================================
// HOMEPAGE TRUST INDICATORS
// ============================================================================

export interface TrustIndicator {
  id: string
  icon: string
  text: string
  subtext: string
  order: number
  visible: boolean
}

export interface TrustMicroCopy {
  heroSubtext: string
  trustBadgeText: string
  impactPromise: string
}

export interface HomepageTrustIndicators {
  enabled: boolean
  indicators: TrustIndicator[]
  microCopy: TrustMicroCopy
}

// ============================================================================
// HOMEPAGE FEATURED STORIES RULES
// ============================================================================

export interface ManualStoriesSelection {
  storyIds: string[]
  maxCount: number
}

export interface AutoLatestStoriesSelection {
  count: number
  filterByProgram: string | null
  excludeOlderThanDays: number
}

export interface AutoPopularStoriesSelection {
  count: number
  sortBy: 'views' | 'likes' | 'shares'
  minViews: number
}

export interface StoriesDisplaySettings {
  showDate: boolean
  showProgram: boolean
  showExcerpt: boolean
  excerptLength: number
  imageAspectRatio: '16:9' | '4:3' | '1:1' | '3:2'
}

export interface HomepageFeaturedStoriesRules {
  mode: 'manual' | 'auto-latest' | 'auto-popular'
  manualSelection: ManualStoriesSelection
  autoLatest: AutoLatestStoriesSelection
  autoPopular: AutoPopularStoriesSelection
  displaySettings: StoriesDisplaySettings
}

// ============================================================================
// COMBINED HOMEPAGE SETTINGS
// ============================================================================

export interface HomepageSettings {
  stats: HomepageStatsSettings
  programs: HomepageProgramsSettings
  heroCTAs: HomepageHeroCTAsSettings
  ctaCards: HomepageCTACardsSettings
  banners: HomepageBannersSettings
  marquee: HomepageMarqueeSettings
  seo: HomepageSEOSettings
  flags: HomepageFlags
  trustIndicators: HomepageTrustIndicators
  featuredStoriesRules: HomepageFeaturedStoriesRules
}

// ============================================================================
// SITE SETTINGS KEY CONSTANTS
// ============================================================================

export const HOMEPAGE_SETTINGS_KEYS = {
  HERO_CAROUSEL: 'homepage_hero_carousel',
  STATS: 'homepage_stats',
  STORY: 'homepage_story',
  WHAT_WE_DO: 'homepage_what_we_do',
  PROGRAMS: 'homepage_programs',
  HERO_CTAS: 'homepage_hero_ctas',
  CTA_CARDS: 'homepage_cta_cards',
  BANNERS: 'homepage_banners',
  MARQUEE: 'homepage_marquee_settings',
  SEO: 'homepage_seo',
  FLAGS: 'homepage_flags',
  TRUST_INDICATORS: 'homepage_trust_indicators',
  FEATURED_STORIES_RULES: 'homepage_featured_stories_rules',
  TESTIMONIALS: 'homepage_testimonials',
  TIMELINE: 'homepage_timeline',
} as const

// ============================================================================
// DEFAULT VALUES (Fallbacks)
// ============================================================================

export const DEFAULT_HOMEPAGE_STATS: HomepageStatsSettings = {
  stats: [
    { value: 10000, suffix: '+', label: 'Lives Impacted', sublabel: 'Across Nepal', order: 1, highlight: true },
    { value: 50, suffix: '+', label: 'Schools Built', sublabel: '& Renovated', order: 2 },
    { value: 25, suffix: '+', label: 'Districts Reached', sublabel: 'Out of 77', order: 3 },
    { value: 500, suffix: '+', label: 'Teachers Trained', sublabel: 'In 10 Years', order: 4 },
    { value: 120, suffix: '+', label: 'Villages Served', sublabel: 'Rural Nepal', order: 5 },
    { value: 3000, suffix: '+', label: 'Scholarships Awarded', sublabel: 'Since 2015', order: 6 },
    { value: 847, suffix: '+', label: 'Autism Children', sublabel: 'Supported', order: 7 },
    { value: 200, suffix: '+', label: 'Health Camps Run', sublabel: 'Free of cost', order: 8 },
  ],
}

export const DEFAULT_HOMEPAGE_STORY: HomepageStorySettings = {
  eyebrow: 'Our Story',
  badgeText: 'How deessa Started',
  paragraphs: [
    'deessa began with two little girls, our twin daughters, Deetya and Marissa. Deetya was born with bilateral clubfoot and has gone through years of treatment and physiotherapy. Marissa was later diagnosed with autism. Their journeys, so different yet intertwined, showed us the invisible walls that children with disabilities and their families face every day.',
    'From that personal experience came a mission: to ensure every child in Nepal has access to the support, resources, and opportunity they deserve. The name deessa carries their story: "Dee" from Deetya, "essa" from Marissa.',
  ],
  linkText: 'Read Our Full Story',
  linkUrl: '/our-story',
  founded: '2022',
  foundedLabel: 'Founded',
  image: '/home/story/deessa-foundation-origin-story.jpg',
  imageAlt: 'The story behind deessa Foundation, featuring Deetya and Marissa',
}

export const DEFAULT_WHAT_WE_DO: HomepageWhatWeDoSettings = {
  eyebrow: 'What We Do',
  title: 'We turn understanding into action for children, families, and communities.',
  subtitle: 'Our work supports children with disabilities, their families, educators, and communities through four areas.',
  pillars: [
    {
      id: 'awareness',
      icon: 'Megaphone',
      title: 'Awareness & Community Engagement',
      description: 'We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.',
      color: 'bg-blue-500',
      glowClass: 'hover-glow-blue',
      statLabel: 'Communities',
      statEnd: 50,
      order: 1,
      visible: true,
    },
    {
      id: 'training',
      icon: 'BookOpen',
      title: 'Training',
      description: 'We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.',
      color: 'bg-green-500',
      glowClass: 'hover-glow-green',
      statLabel: 'Trained',
      statEnd: 200,
      order: 2,
      visible: true,
    },
    {
      id: 'resources',
      icon: 'FileText',
      title: 'Resources',
      description: 'No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.',
      color: 'bg-orange-500',
      glowClass: 'hover-glow-orange',
      statLabel: 'Resources',
      statEnd: 1000,
      order: 3,
      visible: true,
    },
    {
      id: 'advocacy',
      icon: 'Scale',
      title: 'Advocacy',
      description: "We push for inclusive schools and stronger policies that protect every child's rights, so inclusion becomes a right, not a privilege.",
      color: 'bg-purple-500',
      glowClass: 'hover-glow-purple',
      statLabel: 'Policies',
      statEnd: 5000,
      order: 4,
      visible: true,
    },
  ],
}

export const DEFAULT_HOMEPAGE_FLAGS: HomepageFlags = {
  showAccessibilityToolbar: false,
  enableMarquee: true,
  enableAnimations: true,
  showTrustBadges: true,
  showScrollProgress: true,
  featuredStoriesMode: 'manual',
  accessibilityToolbarPosition: 'bottom-right',
  showTrustIndicators: true,
}

export const DEFAULT_TRUST_INDICATORS: HomepageTrustIndicators = {
  enabled: true,
  indicators: [
    { id: 'transparency', icon: 'shield-check', text: '100% Transparent', subtext: 'Every rupee tracked', order: 1, visible: true },
    { id: 'registered', icon: 'verified', text: 'Registered NGO', subtext: 'Est. 2015', order: 2, visible: true },
    { id: 'impact', icon: 'heart', text: '10,000+ Lives', subtext: 'Directly impacted', order: 3, visible: true },
    { id: 'secure', icon: 'lock', text: 'Secure Donations', subtext: 'SSL encrypted', order: 4, visible: true },
  ],
  microCopy: {
    heroSubtext: 'Your donation goes directly to communities in need',
    trustBadgeText: 'Trusted by 5,000+ donors worldwide',
    impactPromise: 'See exactly where your money goes',
  },
}

export const DEFAULT_FEATURED_STORIES_RULES: HomepageFeaturedStoriesRules = {
  mode: 'manual',
  manualSelection: {
    storyIds: [],
    maxCount: 3,
  },
  autoLatest: {
    count: 3,
    filterByProgram: null,
    excludeOlderThanDays: 365,
  },
  autoPopular: {
    count: 3,
    sortBy: 'views',
    minViews: 100,
  },
  displaySettings: {
    showDate: true,
    showProgram: true,
    showExcerpt: true,
    excerptLength: 150,
    imageAspectRatio: '4:3',
  },
}

export const DEFAULT_HERO_CAROUSEL: HomepageHeroCarouselSettings = {
  slides: [
    {
      id: 'slide-1',
      image: '/home/hero/real-voices-young-speaker.jpg',
      title: 'Understanding Begins with Lived Experience',
      subtitle: 'Children, parents, and advocates shared real experiences of autism, building empathy, breaking stigma, and creating space for acceptance.',
      cta: 'Learn About deessa',
      ctaHref: '/about',
      ctaVariant: 'primary',
      order: 1,
      visible: true,
    },
    {
      id: 'slide-2',
      image: '/home/hero/inclusion-begins-at-home.jpg',
      title: 'Parents Turning Experience into Support',
      subtitle: 'deessa\'s parent leaders bring families, educators, and communities into honest conversations about autism, acceptance, and belonging.',
      cta: 'Explore Autism Support',
      ctaHref: '/whatwedo',
      ctaVariant: 'primary',
      order: 2,
      visible: true,
    },
    {
      id: 'slide-3',
      image: '/home/hero/girls-leadership-football.jpg',
      title: 'Confidence and Belonging on the Field',
      subtitle: 'At the 2025 Inter-School Girls\' Football Tournament, deessa joined partners to celebrate girls\' leadership, participation, and empowerment through sport.',
      cta: 'See Our Journey',
      ctaHref: '/about',
      ctaVariant: 'primary',
      order: 3,
      visible: true,
    },
  ],
  interval: 6000,
  autoPlay: true,
}

export const DEFAULT_TESTIMONIALS: HomepageTestimonialsSettings = {
  testimonials: [
    {
      id: 'global-voice-soyun-kim',
      name: 'Soyun Kim',
      role: 'Korea Nazarene University',
      location: 'South Korea',
      image: '',
      video: '/Soyun%20Kim.mp4',
      topic: 'Autism Awareness',
      caption: 'Understanding autism begins with listening, learning, and accepting every child as they are.',
      quote: 'Understanding autism begins with listening, learning, and accepting every child as they are.',
      rating: 5,
      order: 1,
      visible: true,
      featured: true,
    },
    {
      id: 'global-voice-chris-liu',
      name: 'Chris Liu',
      role: 'Education Advocate',
      location: 'International Voice',
      image: '',
      video: '/Chris%20Liu.mp4',
      topic: 'Education for Every Learner',
      caption: 'Inclusive education creates classrooms where every child can learn, participate, and thrive.',
      quote: 'Inclusive education creates classrooms where every child can learn, participate, and thrive.',
      rating: 5,
      order: 2,
      visible: true,
      featured: true,
    },
    {
      id: 'global-voice-blair-chen',
      name: 'Blair Chen',
      role: 'Westminster Foundation for Democracy',
      location: 'Taiwan',
      image: '',
      video: '/Blair%20Chen.mp4',
      topic: 'Equal Opportunities',
      caption: 'Equal opportunity begins when communities remove barriers and make participation possible for everyone.',
      quote: 'Equal opportunity begins when communities remove barriers and make participation possible for everyone.',
      rating: 5,
      order: 3,
      visible: true,
      featured: true,
    },
    {
      id: 'global-voice-marcus-brand',
      name: 'Marcus Brand',
      role: 'Fiji Truth and Reconciliation Commission',
      location: 'Fiji',
      image: '',
      video: '/Marcus%20Brand.mp4',
      topic: 'Inclusion Starts with Acceptance',
      caption: 'Lasting inclusion begins with acceptance; every person deserves to belong, be heard, and be valued.',
      quote: 'Lasting inclusion begins with acceptance; every person deserves to belong, be heard, and be valued.',
      rating: 5,
      order: 4,
      visible: true,
      featured: true,
    },
  ],
}

export const DEFAULT_TIMELINE: HomepageTimelineSettings = {
  title: 'Together, We Are Changing Lives',
  subtitle: 'Every year added a new layer of impact. From local beginnings to national outreach, these milestones trace how hope turned into measurable change.',
  milestones: [
    {
      id: 'milestone-1',
      year: '2015',
      milestone: 'Founded in Kathmandu',
      description: 'deessa Foundation began with a simple commitment: serve communities that are often left behind.',
      icon: 'MapPin',
      badgeClass: 'from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-primary-dark))]',
      yearClass: 'bg-[rgb(var(--brand-primary))]',
      order: 1,
      visible: true,
    },
    {
      id: 'milestone-2',
      year: '2016',
      milestone: 'First education program',
      description: 'Our scholarship initiative opened classroom doors for 200+ students with limited access to learning.',
      icon: 'GraduationCap',
      badgeClass: 'from-[rgb(var(--accent-education))] to-amber-500',
      yearClass: 'bg-[rgb(var(--accent-education))]',
      order: 2,
      visible: true,
    },
    {
      id: 'milestone-3',
      year: '2018',
      milestone: 'Health camps expanded',
      description: 'Medical outreach scaled to 50+ remote villages, bringing care closer to families who needed it most.',
      icon: 'Stethoscope',
      badgeClass: 'from-[rgb(var(--accent-empowerment))] to-pink-500',
      yearClass: 'bg-[rgb(var(--accent-empowerment))]',
      order: 3,
      visible: true,
    },
    {
      id: 'milestone-4',
      year: '2020',
      milestone: 'COVID-19 relief',
      description: 'Emergency food, hygiene kits, and support reached 5,000+ families during Nepal\'s most urgent months.',
      icon: 'Heart',
      badgeClass: 'from-[rgb(var(--accent-environment))] to-lime-500',
      yearClass: 'bg-[rgb(var(--accent-environment))]',
      order: 4,
      visible: true,
    },
    {
      id: 'milestone-5',
      year: '2022',
      milestone: '10,000 lives impacted',
      description: 'A decade of trust, partnerships, and consistent fieldwork transformed lives across communities.',
      icon: 'Globe',
      badgeClass: 'from-[#6F3E96] to-[#6F3E96]',
      yearClass: 'bg-[#6F3E96]',
      order: 5,
      visible: true,
    },
    {
      id: 'milestone-6',
      year: '2024',
      milestone: 'New horizons',
      description: 'We are now expanding into art, podcasting, and digital literacy to shape future-ready communities.',
      icon: 'BookOpen',
      badgeClass: 'from-[#F7C52B] to-[#F7C52B]',
      yearClass: 'bg-[#F7C52B]',
      order: 6,
      visible: true,
    },
  ],
}
