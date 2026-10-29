import { z } from "zod"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"

const socialUrl = z.string().max(2048).refine(value => !value || isSafeWebsiteUrl(value), "Use a valid HTTP or HTTPS social link.")
export const TEAM_SOCIAL_FIELDS = ["facebook", "twitter", "linkedin", "instagram", "tiktok", "whatsapp"] as const
export const teamInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(200),
  role: z.string().trim().min(1, "Enter a role.").max(200),
  bio: z.string().max(10000),
  image: z.string().max(2048).refine(value => !value || isSafeMediaUrl(value), "Use a local path or secure HTTPS photo URL."),
  email: z.union([z.literal(""), z.email().max(320)]),
  phone: z.string().max(100),
  is_published: z.boolean(),
  social_links: z.object(Object.fromEntries(TEAM_SOCIAL_FIELDS.map(key => [key, socialUrl])) as Record<typeof TEAM_SOCIAL_FIELDS[number], typeof socialUrl>),
})
