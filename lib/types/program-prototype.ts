// =============================================
// Program Prototype Types
// Used for static prototypes before database integration
// =============================================

export type ProgramCategory = 'service' | 'campaign' | 'outreach' | 'research'

export type ProgramTheme = 'warm' | 'campaign' | 'energetic' | 'editorial'

export type HeroLayout = 'split' | 'image_left' | 'image_right' | 'full_bleed' | 'minimal'

export type SectionType =
  | 'rich_text'
  | 'image_text'
  | 'stats'
  | 'gallery'
  | 'quote'
  | 'timeline'
  | 'features'
  | 'video'
  | 'story'
  | 'who_we_support'
  | 'how_it_works'
  | 'progress_tracker'
  | 'activities'
  | 'faq'
  | 'facts_bar'
  | 'resources'
  | 'cta'

// =============================================
// Core Program
// =============================================

export interface Program {
  id: string
  slug: string
  title: string
  category: ProgramCategory
  theme: ProgramTheme
  
  hero: ProgramHero
  sections: ProgramSection[]
  
  // Metadata
  eyebrow?: string
  shortDescription: string
  tags?: string[]

  // Related programs (resolved from relatedProgramIds)
  relatedPrograms?: Array<{
    id: string
    slug: string
    title: string
    shortDescription: string
    category: ProgramCategory
    image: string
  }>
}

// =============================================
// Hero Section
// =============================================

export interface ProgramHero {
  focalPoint?: string
  imageCaption?: string
  eyebrow?: string
  title: string
  description: string
  image: string
  imageAlt: string
  layout: HeroLayout
  cta?: {
    label: string
    url: string
    variant?: 'primary' | 'secondary'
  }
  secondaryCta?: {
    label: string
    url: string
  }
  sticker?: { icon?: string; text?: string }
  note?: { icon?: string; text?: string }
  photoNote?: string
}

// =============================================
// Section Base
// =============================================

export interface ProgramSection {
  id: string
  type: SectionType
  heading?: string
  subheading?: string
  description?: string
  content: SectionContent
}

export type SectionContent =
  | RichTextContent
  | ImageTextContent
  | StatsContent
  | GalleryContent
  | QuoteContent
  | TimelineContent
  | FeaturesContent
  | VideoContent
  | StoryContent
  | WhoWeSupportContent
  | HowItWorksContent
  | ProgressTrackerContent
  | ActivitiesContent
  | FAQContent
  | FactsBarContent
  | ResourcesContent
  | CTAContent

// =============================================
// Section Content Types
// =============================================

export interface RichTextContent {
  type: 'rich_text'
  body: string // HTML content
}

export interface ImageTextContent {
  type: 'image_text'
  image: string
  imageAlt: string
  imagePosition: 'left' | 'right'
  title: string
  body: string
}

export interface StatsContent {
  type: 'stats'
  stats: Statistic[]
}

export interface Statistic {
  icon?: string
  value: string
  label: string
  sublabel?: string
  color?: string
}

export interface GalleryContent {
  type: 'gallery'
  layout: 'grid' | 'masonry' | 'carousel'
  images: GalleryImage[]
}

export interface GalleryImage {
  focalPoint?: string
  url: string
  alt: string
  caption?: string
}

export interface QuoteContent {
  type: 'quote'
  quote: string
  person: string
  role?: string
  location?: string
  photo?: string
}

export interface TimelineContent {
  type: 'timeline'
  items: TimelineItem[]
}

export interface TimelineItem {
  date: string
  title: string
  description: string
  status?: 'completed' | 'active' | 'upcoming'
  image?: string
}

export interface FeaturesContent {
  type: 'features'
  features: Feature[]
  layout?: 'grid' | 'list'
}

export interface Feature {
  icon?: string
  title: string
  description: string
  link?: string
}

export interface VideoContent {
  type: 'video'
  videoUrl: string
  thumbnail: string
  caption?: string
}

export interface StoryContent {
  imageAlt?: string
  imageCaption?: string
  focalPoint?: string
  type: 'story'
  title: string
  context: string
  challenge: string
  approach: string
  outcome: string
  description?: string
  image?: string
  quote?: string
  person?: string
  role?: string
  location?: string
  stats?: { value: string; label: string }[]
}

export interface WhoWeSupportContent {
  type: 'who_we_support'
  targetGroups: TargetGroup[]
}

export interface TargetGroup {
  icon?: string
  title: string
  ageRange?: string
  description: string
}

export interface HowItWorksContent {
  type: 'how_it_works'
  steps: ProcessStep[]
  handwrittenNote?: string
}

export interface ProcessStep {
  number: number
  title: string
  description: string
  icon?: string
}

export interface ProgressTrackerContent {
  type: 'progress_tracker'
  goal: number
  current: number
  unit: string
  startDate?: string
  endDate?: string
  daysLeft?: number
}

export interface ActivitiesContent {
  type: 'activities'
  activities: Activity[]
}

export interface Activity {
  time: string
  title: string
  description: string
  icon?: string
}

export interface CTAContent {
  type: 'cta'
  title: string
  description: string
  buttons: CTAButton[]
  backgroundStyle?: 'gradient' | 'solid' | 'image'
}

export interface CTAButton {
  label: string
  url: string
  variant: 'primary' | 'secondary' | 'outline'
  icon?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  type: 'faq'
  items: FAQItem[]
}

export interface FactsBarContent {
  type: 'facts_bar'
  facts: { label: string; value: string }[]
}

export interface ResourceItem {
  label: string
  description: string
  url: string
}

export interface ResourcesContent {
  type: 'resources'
  resources: ResourceItem[]
}

// =============================================
// Theme Configuration
// =============================================

export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  heroLayout: HeroLayout
  cardStyle: string
  spacing: string
}

export const THEME_CONFIGS: Record<ProgramTheme, ThemeConfig> = {
  warm: {
    primary: '#3FABDE',
    secondary: '#6FCF97',
    accent: '#F7C52B',
    background: '#F8F9FA',
    text: '#2D3748',
    heroLayout: 'split',
    cardStyle: 'soft-rounded',
    spacing: 'comfortable',
  },
  campaign: {
    primary: '#6F3E96',
    secondary: '#D6336C',
    accent: '#F7C52B',
    background: '#FFFFFF',
    text: '#1A1A2E',
    heroLayout: 'full_bleed',
    cardStyle: 'bold-campaign',
    spacing: 'tight',
  },
  energetic: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#29b6c8',
    background: '#FFFFFF',
    text: '#1A1A2E',
    heroLayout: 'full_bleed',
    cardStyle: 'sharp-energetic',
    spacing: 'dynamic',
  },
  editorial: {
    primary: '#5B7FDB',
    secondary: '#8B8DD4',
    accent: '#29b6c8',
    background: '#F7F9FC',
    text: '#1A202C',
    heroLayout: 'minimal',
    cardStyle: 'modern-minimal',
    spacing: 'spacious',
  },
}
