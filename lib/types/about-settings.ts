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

export interface AboutPageSettings {
  hero: AboutHeroSettings
  intro: AboutIntroSettings
  howWeDoIt: AboutHowWeDoItSettings
}

export const ABOUT_PAGE_SETTINGS_KEY = "about_page_content"

const TEAL = "#29b6c8"

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  hero: {
    badge: "✦ OUR TEAM & MISSION",
    headlineLine1: "The People",
    headlineLine2: "Behind Nepal's Change.",
    subtitle:
      "We are parents, educators, professionals, and advocates working for and with children with disabilities — with a special focus on autism — to build a society where every child belongs.",
    primaryCtaLabel: "Read Our Story",
    primaryCtaUrl: "#journey",
    secondaryCtaLabel: "View Annual Reports",
    secondaryCtaUrl: "/impact#reports",
    trustBadges: ["Govt Registered", "SWC Affiliated"],
  },
  intro: {
    sinceBadge: "✦ Since 2015",
    label: "Who We Are",
    headline: "Every child deserves to be understood, accepted, and valued — just as they are.",
    paragraphs: [
      "deessa Foundation is a non-profit working for and with children with disabilities, with a special focus on autism. Born from one family's story, we've grown into a community of parents, educators, professionals, advocates, and changemakers who share one purpose: to build a society where every child belongs.",
      "We believe lasting inclusion begins with understanding. When children are understood, they are accepted. When they are accepted, they are valued. And when they are valued, they are given the chance to learn, grow, and thrive.",
      "Our vision is a Nepal where disability is never seen as a limit — where every child is known for their strengths, abilities, and potential. Where being different is never seen as being less.",
    ],
    quote: "At deessa Foundation, we stand for a world where every child is seen, heard, and included.",
    flowSteps: ["Understood", "Accepted", "Valued", "Thrive"],
  },
  howWeDoIt: {
    title: "Change doesn't start with programmes. It starts with people.",
    subtitle:
      "Every child, every family, and every community has a different journey. Our role is to walk alongside them, with understanding and hope.",
    steps: [
      {
        id: "listen",
        title: "We Listen First",
        body: "Every family's journey is different. We listen first — to their needs, their challenges, their hopes — before we design any solution.",
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
}
