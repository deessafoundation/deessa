/**
 * About Page ("Who We Are") CMS Settings Types
 *
 * Corresponds to the `about_page_content` site_settings key.
 * Team members and partner logos are managed separately via
 * /admin/team and /admin/partners (DB-backed tables) — not covered here.
 *
 * @module lib/types/about-settings
 */

export interface AboutHeroSettings {
  badge: string
  headlineLine1: string
  headlineLine2: string
  subtitle: string
  primaryCtaLabel: string
  primaryCtaUrl: string
  secondaryCtaLabel: string
  secondaryCtaUrl: string
  trustBadges: string[]
}

export interface AboutIntroSettings {
  sinceBadge: string
  label: string
  headline: string
  paragraphs: string[]
  quote: string
  flowSteps: string[]
}

export interface AboutHowWeDoItStep {
  id: string
  title: string
  body: string
  color: string
}

export interface AboutHowWeDoItSettings {
  title: string
  subtitle: string
  steps: AboutHowWeDoItStep[]
  closingLine: string
}

export interface AboutJourneyMilestone {
  id: string
  year: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  sourceUrl?: string
}

export interface AboutJourneySettings {
  label: string
  title: string
  subtitle: string
  milestones: AboutJourneyMilestone[]
}

export interface AboutPageSettings {
  hero: AboutHeroSettings
  intro: AboutIntroSettings
  howWeDoIt: AboutHowWeDoItSettings
  journey: AboutJourneySettings
}

export const ABOUT_PAGE_SETTINGS_KEY = "about_page_content"

const TEAL = "#29b6c8"

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  hero: {
    badge: "✦ OUR TEAM & MISSION",
    headlineLine1: "The People",
    headlineLine2: "Behind Nepal's Change.",
    subtitle:
      "We are parents, educators, professionals, and advocates working for and with children with disabilities, with a special focus on autism, to build a society where every child belongs.",
    primaryCtaLabel: "Read Our Story",
    primaryCtaUrl: "#journey",
    secondaryCtaLabel: "View Annual Reports",
    secondaryCtaUrl: "/impact#reports",
    trustBadges: ["Govt Registered", "SWC Affiliated"],
  },
  intro: {
    sinceBadge: "✦ Since 2022",
    label: "Who We Are",
    headline: "Every child has potential. Every child belongs.",
    paragraphs: [
      "At deessa Foundation, we celebrate neurodiversity and work alongside children with disabilities, their families, educators, and communities. We see each child for their strengths, abilities, and unique potential.",
      "Inclusion begins when children are seen, heard, and supported. Through awareness, family support, training, and advocacy, we help create spaces where every child can learn, grow, and thrive.",
      "Our vision is a Nepal where being different is valued and every child has the opportunity to participate fully in family life, school, and community.",
    ],
    quote: "When we embrace neurodiversity, we unlock potential in every child.",
    flowSteps: ["Seen", "Heard", "Supported", "Thrive"],
  },
  howWeDoIt: {
    title: "Change doesn't start with programmes. It starts with people.",
    subtitle:
      "Every child, every family, and every community has a different journey. Our role is to walk alongside them, with understanding and hope.",
    steps: [
      {
        id: "listen",
        title: "We Listen First",
        body: "Every family's journey is different. We listen first, to their needs, their challenges, and their hopes, before we design any solution.",
        color: TEAL,
      },
      {
        id: "train",
        title: "We Train the People Who Show Up",
        body: "Children thrive when the people around them know how to help. We train parents, teachers, health workers, and local leaders to build places where every child can succeed.",
        color: "#d97706",
      },
      {
        id: "partner",
        title: "We Work Through Partnership",
        body: "Inclusion takes a village. We bring together families, schools, health workers, and government to build one network of support for every child.",
        color: "#db2777",
      },
      {
        id: "build",
        title: "We Build Change That Lasts",
        body: "We focus on what outlasts us. By growing local leaders and shaping better policy, we help create change that improves children's lives across Nepal.",
        color: TEAL,
      },
    ],
    closingLine:
      "Because lasting inclusion isn't built by one organization. It's built by people, together, one step at a time.",
  },
  journey: {
    label: "Our Journey",
    title: "Milestones that define our path.",
    subtitle:
      "A growing movement for a Nepal where neurodiversity is understood, celebrated, and supported.",
    milestones: [
      {
        id: "foundation-begins",
        year: "2022",
        title: "deessa Foundation begins",
        description:
          "deessa began with a commitment to help every child be understood, accepted, and valued.",
        image: "/about/journey/2022-foundation-begins.jpg",
        imageAlt: "deessa Foundation story graphic about the experiences that led to the foundation",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=920685784073967&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "building-understanding",
        year: "2024",
        title: "Building understanding",
        description:
          "We brought autism and neurodiversity into conversations with families, educators, and communities.",
        image: "/about/journey/2024-building-understanding.jpg",
        imageAlt: "deessa Foundation speaker sharing an inclusion message at a community event",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=438651608944056&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "belonging-through-participation",
        year: "2025",
        title: "Belonging through participation",
        description:
          "Sport and youth-centred activities celebrated confidence, teamwork, and the belief that every child belongs.",
        image: "/about/journey/2025-belonging-participation.jpg",
        imageAlt: "Girls celebrating together with a trophy at an inter-school football tournament",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=831062599702953&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "advocacy-for-inclusion",
        year: "2026",
        title: "Advocacy for inclusive support",
        description:
          "We called for accessible services, inclusive education, and disability-inclusive support during crises.",
        image: "/about/journey/2026-inclusive-advocacy.jpg",
        imageAlt: "Policy graphic outlining targeted programs for autistic and neurodivergent children",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=952035330939012&set=pb.100083976611660.-2207520000&type=3",
      },
    ],
  },
}
