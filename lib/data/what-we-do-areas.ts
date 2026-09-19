export type WhatWeDoAreaId = "awareness" | "training" | "resources" | "advocacy"

export interface WhatWeDoLearningItem {
  title: string
  description: string
  icon: "book" | "people" | "heart"
  color: "blue" | "orange" | "purple"
}

export interface WhatWeDoArea {
  id: WhatWeDoAreaId
  label: string
  labelClass: string
  headline: string
  subtitle: string
  videoSrc: string
  videoLabel: string
  posterSrc: string
  panelTitle: string
  description: string
  highlights: string[]
  learningTitle: string
  learningItems: WhatWeDoLearningItem[]
  audienceDescription: string
  audiences: string[]
  ctaLabel: string
  ctaHref: string
  closingTitle: string
  closingDescription: string
}

export const WHAT_WE_DO_AREAS: Record<WhatWeDoAreaId, WhatWeDoArea> = {
  awareness: {
    id: "awareness",
    label: "Awareness & Community",
    labelClass: "text-blue-600",
    headline: "Understanding that opens doors to belonging.",
    subtitle: "Real voices and public conversations that replace stigma with understanding.",
    videoSrc: "/Awareness and community engagement.mp4",
    videoLabel: "Awareness through understanding and acceptance",
    posterSrc: "/video-covers/awareness.jpg",
    panelTitle: "Conversations that move communities forward",
    description:
      "We bring families, advocates, educators, and communities together to talk openly about autism and disability. Honest stories help challenge myths and make inclusion part of everyday life.",
    highlights: [
      "Center lived experience",
      "Challenge myths with facts",
      "Create space for belonging",
    ],
    learningTitle: "What awareness can change",
    learningItems: [
      { title: "Listen", description: "Hear the experiences of children, families, and advocates.", icon: "book", color: "blue" },
      { title: "Understand", description: "Recognise difference without stereotypes or judgement.", icon: "people", color: "orange" },
      { title: "Act", description: "Turn understanding into welcoming everyday choices.", icon: "heart", color: "purple" },
    ],
    audienceDescription: "Awareness grows when every part of the community takes part.",
    audiences: ["Families", "Schools", "Communities", "Media"],
    ctaLabel: "Explore our stories",
    ctaHref: "/stories",
    closingTitle: "Ready to build understanding?",
    closingDescription: "Share real stories, challenge stigma, and help make belonging visible.",
  },
  training: {
    id: "training",
    label: "Training",
    labelClass: "text-green-600",
    headline: "Training that builds confidence, care, and inclusion.",
    subtitle: "Practical knowledge for parents, teachers, health workers, and caregivers.",
    videoSrc: "/Training.mp4",
    videoLabel: "Training for inclusive support",
    posterSrc: "/video-covers/training.jpg",
    panelTitle: "Skills that make everyday support stronger",
    description:
      "Our training equips parents, teachers, health workers, and caregivers with practical knowledge and tools to support children with disabilities at home, in school, and throughout the community.",
    highlights: [
      "Recognise early signs",
      "Respond with confidence",
      "Build inclusive environments",
    ],
    learningTitle: "What you’ll learn",
    learningItems: [
      { title: "Understand", description: "Learn about different developmental needs and disabilities.", icon: "book", color: "blue" },
      { title: "Support", description: "Gain practical strategies for everyday situations.", icon: "people", color: "orange" },
      { title: "Include", description: "Create more welcoming homes, schools, and communities.", icon: "heart", color: "purple" },
    ],
    audienceDescription: "Our training is designed for everyone who plays a role in a child’s life.",
    audiences: ["Parents", "Teachers", "Caregivers", "Health workers"],
    ctaLabel: "Talk to our team",
    ctaHref: "/contact",
    closingTitle: "Ready to learn together?",
    closingDescription: "Explore practical support, shared knowledge, and the difference it makes.",
  },
  resources: {
    id: "resources",
    label: "Resources",
    labelClass: "text-orange-600",
    headline: "Practical resources for every step of the journey.",
    subtitle: "Clear guidance and useful tools for families, educators, and professionals.",
    videoSrc: "/Resources.mp4",
    videoLabel: "Accessible resources for families and educators",
    posterSrc: "/video-covers/resources.jpg",
    panelTitle: "Helpful information should be easy to find and use",
    description:
      "No family should have to navigate disability support alone. We turn complex information into accessible guidance that people can understand, share, and apply in real situations.",
    highlights: [
      "Clear and accessible guidance",
      "Tools for home and classroom",
      "Trusted pathways to support",
    ],
    learningTitle: "How our resources help",
    learningItems: [
      { title: "Find", description: "Reach useful information without unnecessary complexity.", icon: "book", color: "blue" },
      { title: "Use", description: "Apply practical tools in everyday care and learning.", icon: "people", color: "orange" },
      { title: "Share", description: "Help trusted knowledge reach more families and communities.", icon: "heart", color: "purple" },
    ],
    audienceDescription: "Built for the people who support children across home, school, and care settings.",
    audiences: ["Parents", "Educators", "Professionals", "Caregivers"],
    ctaLabel: "Ask about resources",
    ctaHref: "/contact",
    closingTitle: "Looking for the right support?",
    closingDescription: "Let us help you find practical information for your next step.",
  },
  advocacy: {
    id: "advocacy",
    label: "Advocacy",
    labelClass: "text-purple-600",
    headline: "Every child deserves rights, access, and belonging.",
    subtitle: "Working together for inclusive schools, stronger protection, and lasting change.",
    videoSrc: "/Advocacy (2).mp4",
    videoLabel: "Advocacy for equal rights and inclusive systems",
    posterSrc: "/video-covers/advocacy.jpg",
    panelTitle: "Inclusion becomes real when systems protect it",
    description:
      "We work with families, educators, partners, and decision-makers to remove barriers and strengthen the policies that protect every child’s right to learn, participate, and belong.",
    highlights: [
      "Promote inclusive schools",
      "Strengthen rights and protection",
      "Make institutions accountable",
    ],
    learningTitle: "How advocacy creates change",
    learningItems: [
      { title: "Recognise", description: "Make children’s rights visible in every decision.", icon: "book", color: "blue" },
      { title: "Unite", description: "Bring families, communities, and leaders together.", icon: "people", color: "orange" },
      { title: "Change", description: "Turn shared priorities into stronger systems and policies.", icon: "heart", color: "purple" },
    ],
    audienceDescription: "Lasting inclusion depends on people working together across every level.",
    audiences: ["Families", "Educators", "Partners", "Policymakers"],
    ctaLabel: "Partner with us",
    ctaHref: "/contact",
    closingTitle: "Ready to stand for inclusion?",
    closingDescription: "Add your voice to stronger rights, fair access, and accountable support.",
  },
}

export const WHAT_WE_DO_AREA_IDS = Object.keys(WHAT_WE_DO_AREAS) as WhatWeDoAreaId[]

export function getWhatWeDoArea(slug: string) {
  return WHAT_WE_DO_AREAS[slug as WhatWeDoAreaId] ?? null
}
