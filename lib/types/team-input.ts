import { z } from "zod"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"

const socialUrl = z.string().max(2048).refine(value => !value || isSafeWebsiteUrl(value), "Use a valid HTTP or HTTPS social link.")

export const TEAM_SOCIAL_FIELDS = ["facebook", "twitter", "linkedin", "instagram", "tiktok", "whatsapp"] as const

export const TEAM_TIERS = ["vision", "board", "advisory", "assembly", "working", "technical"] as const
export type TeamTier = typeof TEAM_TIERS[number]

export interface TeamTierMeta {
  key: TeamTier
  label: string
  subtitle: string
  description: string
  badgeTone: string
}

export const TEAM_TIER_DETAILS: Record<TeamTier, TeamTierMeta> = {
  vision: {
    key: "vision",
    label: "Founding Vision",
    subtitle: "Concept Designer & Co-Founders",
    description: "The minds behind Foundation — shaping its idea, mission, and direction from the start.",
    badgeTone: "bg-purple-100 text-purple-800 border-purple-200",
  },
  board: {
    key: "board",
    label: "Governing Board",
    subtitle: "Executive Board",
    description: "The Executive Board leads the Foundation’s strategic direction, legal oversight, governance, accountability, and management.",
    badgeTone: "bg-sky-100 text-sky-800 border-sky-200",
  },
  advisory: {
    key: "advisory",
    label: "Advisory Circle",
    subtitle: "Advisory Board & Thematic Advisors",
    description: "Senior advisors and thematic experts guiding Foundation’s strategy, credibility, and direction — from institutional oversight to focused expertise in programs.",
    badgeTone: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  assembly: {
    key: "assembly",
    label: "General Assembly",
    subtitle: "General Members",
    description: "Foundation’s highest authority — every member has a right, and together they elect and hold the Executive Board accountable.",
    badgeTone: "bg-amber-100 text-amber-800 border-amber-200",
  },
  working: {
    key: "working",
    label: "Working Team",
    subtitle: "Operations & Management",
    description: "Handles the Foundation’s day-to-day operations and management.",
    badgeTone: "bg-teal-100 text-teal-800 border-teal-200",
  },
  technical: {
    key: "technical",
    label: "Technical Team",
    subtitle: "Technical Experts",
    description: "Experts who serve the Foundation, each in their own area of expertise.",
    badgeTone: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
}

export const teamInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(200),
  role: z.string().trim().min(1, "Enter a role.").max(200),
  tier: z.enum(TEAM_TIERS).default("vision"),
  bio: z.string().max(10000),
  image: z.string().max(2048).refine(value => !value || isSafeMediaUrl(value), "Use a local path or secure HTTPS photo URL."),
  email: z.union([z.literal(""), z.email().max(320)]),
  phone: z.string().max(100),
  is_published: z.boolean(),
  is_featured: z.boolean().default(false),
  social_links: z.object(Object.fromEntries(TEAM_SOCIAL_FIELDS.map(key => [key, socialUrl])) as Record<typeof TEAM_SOCIAL_FIELDS[number], typeof socialUrl>),
})
