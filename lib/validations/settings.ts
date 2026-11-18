import { z } from "zod"

/**
 * General site identity schema
 */
export const generalSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(100, "Site name is too long"),
  tagline: z.string().trim().max(200, "Tagline cannot exceed 200 characters").optional().default(""),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional().default(""),
  siteUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
})

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>

/**
 * Official contact information schema
 */
export const contactSettingsSchema = z.object({
  email: z.string().trim().email("Must be a valid email address").optional().or(z.literal("")),
  phone: z.string().trim().max(50, "Phone number too long").optional().default(""),
  alternatePhone: z.string().trim().max(50, "Alternate phone too long").optional().default(""),
  address: z.string().trim().max(300, "Address too long").optional().default(""),
  hours: z.string().trim().max(150, "Hours too long").optional().default(""),
  googleMapsUrl: z.string().trim().url("Must be a valid Google Maps URL").optional().or(z.literal("")),
})

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>

/**
 * Social media channels schema
 */
export const socialSettingsSchema = z.object({
  facebook: z.string().trim().url("Must be a valid Facebook URL").optional().or(z.literal("")),
  twitter: z.string().trim().url("Must be a valid X/Twitter URL").optional().or(z.literal("")),
  instagram: z.string().trim().url("Must be a valid Instagram URL").optional().or(z.literal("")),
  linkedin: z.string().trim().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  youtube: z.string().trim().url("Must be a valid YouTube URL").optional().or(z.literal("")),
  github: z.string().trim().url("Must be a valid GitHub URL").optional().or(z.literal("")),
})

export type SocialSettingsInput = z.infer<typeof socialSettingsSchema>

/**
 * Branding and visual identity assets schema
 */
export const brandingSettingsSchema = z.object({
  primaryLogo: z.string().trim().optional().default(""),
  darkLogo: z.string().trim().optional().default(""),
  favicon: z.string().trim().optional().default(""),
  ogImage: z.string().trim().optional().default(""),
})

export type BrandingSettingsInput = z.infer<typeof brandingSettingsSchema>

/**
 * Legal organization registration and receipt generation schema
 */
export const organizationSettingsSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required").max(200),
  vat_registration_number: z.string().trim().max(50).optional().default(""),
  pan_number: z.string().trim().max(50).optional().default(""),
  swc_registration_number: z.string().trim().max(50).optional().default(""),
  ird_exemption_number: z.string().trim().max(50).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  email: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  website: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  logo_url: z.string().trim().optional().default(""),
  receipt_prefix: z
    .string()
    .trim()
    .min(1, "Receipt prefix is required")
    .max(10, "Prefix cannot exceed 10 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Prefix can only contain letters, numbers, hyphens, and underscores"),
  receipt_number_start: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "Starting receipt number must be at least 1")
    .max(10000000, "Starting receipt number is too high"),
  authorized_signatory_name: z.string().trim().max(100).optional().default(""),
  authorized_signatory_designation: z.string().trim().max(100).optional().default(""),
  stamp_url: z.string().trim().optional().default(""),
  signature_url: z.string().trim().optional().default(""),
})

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>

/**
 * Site UI flags schema
 */
export const siteUiFlagsSchema = z.object({
  devNotice: z.boolean(),
  betaBadge: z.boolean(),
  storiesEnabled: z.boolean(),
  maintenanceMode: z.boolean().optional().default(false),
})

export type SiteUiFlagsInput = z.infer<typeof siteUiFlagsSchema>

/**
 * Photo wall (9 slots) schema
 */
export const photoWallPanelSchema = z.object({
  src: z.string().trim().default(""),
  alt: z.string().trim().optional().default(""),
  title: z.string().trim().optional().default(""),
  label: z.string().trim().optional().default(""),
  tint: z.string().trim().optional().default(""),
  focalX: z.number().optional(),
  focalY: z.number().optional(),
  objectPosition: z.string().trim().optional(),
})

export const photoWallSchema = z
  .array(photoWallPanelSchema)
  .length(9, "Photo wall must contain exactly 9 slots")

/**
 * Unified schema validator mapping for site settings keys
 */
export const SETTING_SCHEMAS: Record<string, z.ZodTypeAny> = {
  general: generalSettingsSchema,
  contact: contactSettingsSchema,
  social: socialSettingsSchema,
  branding: brandingSettingsSchema,
  organization_details: organizationSettingsSchema,
  site_ui_flags: siteUiFlagsSchema,
  photo_wall_images: photoWallSchema,
}

/**
 * Validates a setting value against its registered schema if one exists.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateSetting(key: string, value: unknown) {
  const schema = SETTING_SCHEMAS[key]
  if (!schema) {
    // If no schema registered (e.g. legacy or dynamic CMS keys), pass through
    return { success: true, data: value }
  }

  const result = schema.safeParse(value)
  if (!result.success) {
    const errorMessages = result.error.errors.map((e) => `${e.path.join(".") || "field"}: ${e.message}`).join(", ")
    return { success: false, error: errorMessages }
  }

  return { success: true, data: result.data }
}
